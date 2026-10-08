// Performance 2: the store theme in context. A footer reads the color; a
// color picker only sets it. The app also has an unrelated counter.
import { createContext, memo, use, useMemo, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

type Theme = { color: string; setColor: (c: string) => void }
const ThemeContext = createContext<Theme | null>(null)

// ─── the consumers (same in every version but "split") ───

// #region consumers
const Footer = memo(function Footer() {
	const { color } = use(ThemeContext)!
	log('  render Footer')
	return <footer style={{ color }}>Free returns for 30 days</footer>
})

const ColorPicker = memo(function ColorPicker() {
	const { setColor } = use(ThemeContext)!
	log('  render ColorPicker')
	return <button id="color" onClick={() => setColor('purple')}>Purple theme</button>
})
// #endregion

function Main() {
	log('  render Main')
	return <main>Products…</main>
}

// #region inline
function AppInline() {
	const [count, setCount] = useState(0)
	const [color, setColor] = useState('black')
	log('render App')
	return (
		<ThemeContext value={{ color, setColor }}>
			<button id="count" onClick={() => setCount(count + 1)}>Visits: {count}</button>
			<Main />
			<ColorPicker />
			<Footer />
		</ThemeContext>
	)
}
// #endregion

// #region memoValue
function AppMemoValue() {
	const [count, setCount] = useState(0)
	const [color, setColor] = useState('black')
	log('render App')
	const value = useMemo(() => ({ color, setColor }), [color])
	return (
		<ThemeContext value={value}>
			<button id="count" onClick={() => setCount(count + 1)}>Visits: {count}</button>
			<Main />
			<ColorPicker />
			<Footer />
		</ThemeContext>
	)
}
// #endregion

// #region provider
function ThemeProvider({ children }: { children: ReactNode }) {
	const [color, setColor] = useState('black')
	log('  render ThemeProvider')
	const value = useMemo(() => ({ color, setColor }), [color])
	return <ThemeContext value={value}>{children}</ThemeContext>
}

function AppProvider() {
	const [count, setCount] = useState(0)
	log('render App')
	return (
		<ThemeProvider>
			<button id="count" onClick={() => setCount(count + 1)}>Visits: {count}</button>
			<Main />
			<ColorPicker />
			<Footer />
		</ThemeProvider>
	)
}
// #endregion

// #region split
const ColorContext = createContext('black')
const SetColorContext = createContext<(c: string) => void>(() => {})

function SplitThemeProvider({ children }: { children: ReactNode }) {
	const [color, setColor] = useState('black')
	log('  render ThemeProvider')
	return (
		<SetColorContext value={setColor}>
			<ColorContext value={color}>{children}</ColorContext>
		</SetColorContext>
	)
}

const SplitFooter = memo(function Footer() {
	const color = use(ColorContext)
	log('  render Footer')
	return <footer style={{ color }}>Free returns for 30 days</footer>
})

const SplitColorPicker = memo(function ColorPicker() {
	const setColor = use(SetColorContext) // never changes: setters are stable
	log('  render ColorPicker')
	return <button id="color" onClick={() => setColor('purple')}>Purple theme</button>
})
// #endregion

function AppSplit() {
	const [count, setCount] = useState(0)
	log('render App')
	return (
		<SplitThemeProvider>
			<button id="count" onClick={() => setCount(count + 1)}>Visits: {count}</button>
			<Main />
			<SplitColorPicker />
			<SplitFooter />
		</SplitThemeProvider>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	const apps = { inline: AppInline, 'memo-value': AppMemoValue, provider: AppProvider, split: AppSplit }
	const App = apps[(scenario ?? 'inline') as keyof typeof apps]
	createRoot(root).render(<App />)
}
