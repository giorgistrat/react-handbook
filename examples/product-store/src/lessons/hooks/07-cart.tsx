// Hooks 7: a cart. Quantity buttons, saved in localStorage, with undo.
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region stale
function QuantityStale() {
	const [qty, setQty] = useState(1)
	function addTwo() {
		setQty(qty + 1)
		setQty(qty + 1)
	}
	return <button id="add2" onClick={addTwo}>Add 2 (now {qty})</button>
}
// #endregion

// #region updater
function QuantityUpdater() {
	const [qty, setQty] = useState(1)
	function addTwo() {
		setQty((q) => q + 1)
		setQty((q) => q + 1)
	}
	return <button id="add2" onClick={addTwo}>Add 2 (now {qty})</button>
}
// #endregion

// #region mutate
function CartMutating() {
	const [items, setItems] = useState(['Ceramic Mug'])
	function add() {
		items.push('Desk Lamp') // changes the same array…
		setItems(items) // …so React sees the same reference and skips the render
		log('pushed; items.length =', items.length)
	}
	return <button id="addItem" onClick={add}>{items.length} items</button>
}
// #endregion

// #region saved
type CartState = { history: string[][]; step: number }

function readSavedCart(): CartState {
	log('readSavedCart() runs')
	try {
		const saved = JSON.parse(localStorage.getItem('cart') ?? 'null')
		if (saved && Array.isArray(saved.history)) return saved
	} catch {
		// corrupted storage: start fresh
	}
	return { history: [[]], step: 0 }
}

function Cart() {
	const [state, setState] = useState(readSavedCart)
	const items = state.history[state.step] // derived, never stored twice

	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(state))
	}, [state])

	function add(name: string) {
		setState(({ history, step }) => {
			const kept = history.slice(0, step + 1) // drop any undone future
			return { history: [...kept, [...kept[step], name]], step: kept.length }
		})
	}

	return (
		<>
			<button id="mug" onClick={() => add('Ceramic Mug')}>Add mug</button>
			<button id="lamp" onClick={() => add('Desk Lamp')}>Add lamp</button>
			<button id="undo" disabled={state.step === 0} onClick={() => setState((s) => ({ ...s, step: s.step - 1 }))}>
				Undo
			</button>
			<p id="items">{items.join(', ') || 'empty'}</p>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const C = { stale: QuantityStale, updater: QuantityUpdater, mutate: CartMutating, saved: Cart }[scenario ?? 'saved']!
	createRoot(root).render(<C />)
}
