// Patterns 7: once the order is placed, gift wrap can't be changed. The store
// adds that rule from outside, through its own reducer.
import { useReducer, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { Switch } from './switch'

// #region hook
type ToggleState = { on: boolean }
type ToggleAction = { type: 'toggle' } | { type: 'reset'; initialState: ToggleState }

export function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
	switch (action.type) {
		case 'toggle':
			return { on: !state.on }
		case 'reset':
			return action.initialState
	}
}

function useToggle({ initialOn = false, reducer = toggleReducer } = {}) {
	const { current: initialState } = useRef({ on: initialOn })
	const [state, dispatch] = useReducer(reducer, initialState)
	const toggle = () => dispatch({ type: 'toggle' })
	const reset = () => dispatch({ type: 'reset', initialState })
	return { on: state.on, toggle, reset }
}
// #endregion

// #region consumer
function GiftOptions() {
	const [orderPlaced, setOrderPlaced] = useState(false)
	const { on, toggle } = useToggle({
		reducer(state, action) {
			if (orderPlaced && action.type === 'toggle') return state // too late: keep it as is
			return toggleReducer(state, action) // everything else: the default behavior
		},
	})
	log(`render GiftOptions (on: ${on})`)
	return (
		<>
			<Switch id="gift" on={on} onClick={toggle} aria-label="Gift wrap" />
			<WrapNote on={on} />
			<button id="place" onClick={() => setOrderPlaced(true)}>Place order</button>
		</>
	)
}
// #endregion

function WrapNote({ on }: { on: boolean }) {
	log('render WrapNote')
	return <p>{on ? 'Wrapped in recycled paper 🎁' : 'No gift wrap'}</p>
}

export function mount(root: HTMLElement) {
	createRoot(root).render(<GiftOptions />)
}
