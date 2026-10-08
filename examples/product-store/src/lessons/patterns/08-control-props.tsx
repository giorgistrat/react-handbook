// Patterns 8: the gift-wrap switch appears in the cart and at checkout. Both
// must always agree, so the page owns the value.
import { useReducer, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { Switch } from './switch'

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

// #region hook
type Options = {
	initialOn?: boolean
	reducer?: typeof toggleReducer
	on?: boolean // pass it to control the value
	onChange?: (suggested: ToggleState, action: ToggleAction) => void
}

function useToggle({ initialOn = false, reducer = toggleReducer, on: controlledOn, onChange }: Options = {}) {
	const { current: initialState } = useRef({ on: initialOn })
	const [state, dispatch] = useReducer(reducer, initialState)
	const onIsControlled = controlledOn != null
	const on = onIsControlled ? controlledOn : state.on

	function dispatchWithOnChange(action: ToggleAction) {
		if (!onIsControlled) dispatch(action)
		onChange?.(reducer({ ...state, on }, action), action) // the suggested next state
	}

	const toggle = () => dispatchWithOnChange({ type: 'toggle' })
	return { on, toggle }
}
// #endregion

// #region toggle
function Toggle({ label, on, onChange }: { label: string } & Pick<Options, 'on' | 'onChange'>) {
	const toggle = useToggle({ on, onChange })
	log(`render Toggle "${label}" (on: ${toggle.on})`)
	return <Switch id={label.toLowerCase()} on={toggle.on} onClick={toggle.toggle} aria-label={label} />
}
// #endregion

// #region page
function Checkout() {
	const [giftWrap, setGiftWrap] = useState(false)
	const [orderPlaced, setOrderPlaced] = useState(false)
	log('render Checkout')

	function handleGiftWrapChange(suggested: ToggleState) {
		if (orderPlaced) return log('Checkout: ignored the change (order placed)')
		log(`Checkout: setGiftWrap(${suggested.on})`)
		setGiftWrap(suggested.on)
	}

	return (
		<>
			<Toggle label="Cart" on={giftWrap} onChange={handleGiftWrapChange} />
			<Toggle label="Checkout" on={giftWrap} onChange={handleGiftWrapChange} />
			<Toggle label="Newsletter" onChange={(s) => log(`newsletter onChange: ${s.on}`)} />
			<button id="place" onClick={() => setOrderPlaced(true)}>Place order</button>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement) {
	createRoot(root).render(<Checkout />)
}
