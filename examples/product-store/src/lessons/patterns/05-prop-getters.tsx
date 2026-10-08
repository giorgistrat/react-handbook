// Patterns 5: useToggle hands out the props a gift-wrap button needs; the
// store also wants to track clicks on it.
import { useState, type MouseEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

export const track = () => log('analytics: gift wrap clicked')

// #region collection
export function useToggleCollection() {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	const togglerProps = { 'aria-checked': on, onClick: toggle }
	return { on, toggle, togglerProps }
}
// #endregion

// #region spreadFirst
function GiftWrapSpreadFirst() {
	const { on, togglerProps } = useToggleCollection()
	return (
		<button role="switch" {...togglerProps} onClick={track}>
			Gift wrap: {on ? 'on' : 'off'}
		</button>
	)
}
// #endregion


// #region callAll
function callAll<A extends unknown[]>(...fns: Array<((...args: A) => unknown) | undefined>) {
	return (...args: A) => fns.forEach((fn) => fn?.(...args))
}
// #endregion

// #region getter
type ButtonClick = (e: MouseEvent<HTMLButtonElement>) => void

function useToggle() {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	function getTogglerProps<P extends object>({ onClick, ...props }: P & { onClick?: ButtonClick } = {} as P) {
		return { 'aria-checked': on, onClick: callAll(onClick, toggle), ...props }
	}
	return { on, toggle, getTogglerProps }
}
// #endregion

// #region getterUse
function GiftWrap() {
	const { on, getTogglerProps } = useToggle()
	return (
		<button role="switch" {...getTogglerProps({ onClick: track, id: 'gift-wrap' })}>
			Gift wrap: {on ? 'on' : 'off'}
		</button>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const App = { 'spread-first': GiftWrapSpreadFirst }[scenario ?? ''] ?? GiftWrap
	createRoot(root).render(<App />)
}
