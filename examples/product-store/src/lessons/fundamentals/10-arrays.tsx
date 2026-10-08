// Lesson 10: a cart with a note per item. Keys decide which note belongs to which item.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { products, type Product } from '../../data/products'

const initial = products.slice(0, 3)

// #region cart
function Cart({ keyBy }: { keyBy: 'index' | 'id' | 'none' }) {
	const [items, setItems] = useState(initial)
	const remove = (id: string) => setItems((list) => list.filter((p) => p.id !== id))

	return (
		<ul className="cart">
			{items.map((item: Product, index) => (
				<li key={keyBy === 'id' ? item.id : keyBy === 'index' ? index : undefined}>
					<span>{item.name}</span>
					<input placeholder="Gift note" />
					<button onClick={() => remove(item.id)}>Remove</button>
				</li>
			))}
		</ul>
	)
}
// #endregion

// #region reset
function Coupon() {
	const [resetKey, setResetKey] = useState(0)
	return (
		<>
			<input key={resetKey} id="coupon" placeholder="Coupon code" />
			<button id="clear" onClick={() => setResetKey((k) => k + 1)}>Clear</button>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root)
	if (scenario === 'reset') return r.render(<Coupon />)
	r.render(<Cart keyBy={(scenario as 'index' | 'id' | 'none') ?? 'id'} />)
}
