// Patterns 6: the gift-wrap toggle can start "on", and can be reset.
import { useReducer, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { Switch } from './switch'

// #region reducer
type ToggleState = { on: boolean }
type ToggleAction = { type: 'toggle' } | { type: 'reset'; initialState: ToggleState }

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
	switch (action.type) {
		case 'toggle':
			return { on: !state.on }
		case 'reset':
			return action.initialState
	}
}
// #endregion

// #region plain
function useTogglePlain({ initialOn = false } = {}) {
	const initialState = { on: initialOn } // rebuilt on every render
	const [state, dispatch] = useReducer(toggleReducer, initialState)
	const toggle = () => dispatch({ type: 'toggle' })
	const reset = () => dispatch({ type: 'reset', initialState })
	return { on: state.on, toggle, reset }
}
// #endregion

// #region stable
function useToggle({ initialOn = false } = {}) {
	const { current: initialState } = useRef({ on: initialOn }) // kept from the first render
	const [state, dispatch] = useReducer(toggleReducer, initialState)
	const toggle = () => dispatch({ type: 'toggle' })
	const reset = () => dispatch({ type: 'reset', initialState })
	return { on: state.on, toggle, reset }
}
// #endregion

// #region page
function GiftOptions({ useToggleHook }: { useToggleHook: typeof useToggle }) {
	const [giftByDefault, setGiftByDefault] = useState(true) // a store setting
	const { on, toggle, reset } = useToggleHook({ initialOn: giftByDefault })
	return (
		<>
			<label>
				<input id="setting" type="checkbox" checked={giftByDefault} onChange={(e) => setGiftByDefault(e.target.checked)} />
				Gift wrap new orders by default
			</label>
			<Switch id="gift" on={on} onClick={toggle} aria-label="Gift wrap" />
			<button id="reset" onClick={reset}>Reset</button>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	createRoot(root).render(<GiftOptions useToggleHook={scenario === 'plain' ? useTogglePlain : useToggle} />)
	log(`scenario: ${scenario ?? 'stable'}`)
}
