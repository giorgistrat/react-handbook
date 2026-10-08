// Patterns 3: a "Gift wrap" toggle as compound components.
import { Children, cloneElement, createContext, isValidElement, use, useState, type ReactElement, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { log } from '../../log'
import { Switch } from './switch'

// #region context
type ToggleValue = { on: boolean; toggle: () => void }
const ToggleContext = createContext<ToggleValue | null>(null)

function Toggle({ children }: { children: ReactNode }) {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	return <ToggleContext value={{ on, toggle }}>{children}</ToggleContext>
}
// #endregion

// #region validation
function useToggleContext() {
	const context = use(ToggleContext)
	if (!context) throw new Error('Toggle components must be rendered inside <Toggle>')
	return context
}
// #endregion

// #region pieces
function ToggleOn({ children }: { children: ReactNode }) {
	const { on } = useToggleContext()
	return on ? children : null
}

function ToggleOff({ children }: { children: ReactNode }) {
	const { on } = useToggleContext()
	return on ? null : children
}

function ToggleButton(props: { 'aria-label': string }) {
	const { on, toggle } = useToggleContext()
	return <Switch on={on} onClick={toggle} {...props} />
}
// #endregion

// #region unchecked
function ToggleButtonUnchecked(props: { 'aria-label': string }) {
	const { on, toggle } = use(ToggleContext)! // "!" tells TypeScript it's never null
	return <Switch on={on} onClick={toggle} {...props} />
}
// #endregion

// #region usage
function GiftWrap() {
	return (
		<Toggle>
			<ToggleButton aria-label="Gift wrap" />
			<div className="note">
				<ToggleOn>We'll wrap it in recycled paper 🎁</ToggleOn>
				<ToggleOff>No gift wrap</ToggleOff>
			</div>
		</Toggle>
	)
}
// #endregion

// The older way: copy props onto each direct child
type Injected = { on?: boolean; toggle?: () => void }

// #region clone
function ToggleClone({ children }: { children: ReactNode }) {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	return Children.map(children, (child) =>
		isValidElement(child) && typeof child.type !== 'string' // skip <div>, <p>…
			? cloneElement(child as ReactElement<Injected>, { on, toggle })
			: child,
	)
}
// #endregion

function CloneOn({ on, children }: Injected & { children: ReactNode }) {
	return on ? children : null
}
function CloneOff({ on, children }: Injected & { children: ReactNode }) {
	return on ? null : children
}
function CloneButton({ on = false, toggle }: Injected) {
	return <Switch on={on} onClick={toggle} aria-label="Gift wrap" />
}

function GiftWrapClone() {
	return (
		<ToggleClone>
			<CloneButton />
			<div className="note">
				<CloneOn>We'll wrap it in recycled paper 🎁</CloneOn>
				<CloneOff>No gift wrap</CloneOff>
			</div>
		</ToggleClone>
	)
}

function Outside() {
	const fallback = ({ error }: { error: unknown }) => <p role="alert">{(error as Error).message}</p>
	return (
		<>
			<ErrorBoundary fallbackRender={fallback}>
				<ToggleButtonUnchecked aria-label="Gift wrap" />
			</ErrorBoundary>
			<ErrorBoundary fallbackRender={fallback}>
				<ToggleButton aria-label="Gift wrap" />
			</ErrorBoundary>
		</>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	const App = { clone: GiftWrapClone, outside: Outside }[scenario ?? ''] ?? GiftWrap
	createRoot(root).render(<App />)
	log(`scenario: ${scenario ?? 'context'}`)
}
