// Patterns 5, the other spread order. TypeScript rejects this file (TS2783),
// so it is excluded from the typecheck; the recorder runs it and records tsc's error.
import { createRoot } from 'react-dom/client'
import { track, useToggleCollection } from './05-prop-getters'

// #region spreadLast
function GiftWrapSpreadLast() {
	const { on, togglerProps } = useToggleCollection()
	return (
		<button role="switch" onClick={track} {...togglerProps}>
			Gift wrap: {on ? 'on' : 'off'}
		</button>
	)
}
// #endregion

export function mount(root: HTMLElement) {
	createRoot(root).render(<GiftWrapSpreadLast />)
}
