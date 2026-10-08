// APIs 1: the cart as a reducer: typed actions, a pure reducer, a custom hook.
import { memo, useEffect, useReducer, type Dispatch } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { formatUSD, products } from '../../data/products'
import { log } from '../../log'

const byId = (id: string) => products.find((p) => p.id === id)!

// #region types
type CartItem = { id: string; qty: number }
type CartState = { items: CartItem[] }

type CartAction =
	| { type: 'added'; id: string }
	| { type: 'removed'; id: string }
	| { type: 'quantityChanged'; id: string; qty: number }
	| { type: 'cleared' }
// #endregion

// #region reducer
function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case 'added': {
			const inCart = state.items.some((i) => i.id === action.id)
			if (!inCart) return { items: [...state.items, { id: action.id, qty: 1 }] }
			return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i)) }
		}
		case 'removed':
			if (!state.items.some((i) => i.id === action.id)) return state // nothing to do: same object
			return { items: state.items.filter((i) => i.id !== action.id) }
		case 'quantityChanged':
			if (action.qty <= 0) return cartReducer(state, { type: 'removed', id: action.id })
			return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i)) }
		case 'cleared':
			return state.items.length ? { items: [] } : state
		default:
			throw new Error(`Unknown action: ${(action as { type: string }).type}`)
	}
}
// #endregion

// #region init
function loadCart(key: string): CartState {
	log(`  loadCart("${key}")`)
	const saved = localStorage.getItem(key)
	return saved ? JSON.parse(saved) : { items: [] }
}
// #endregion

// #region useCart
function useCart() {
	const [cart, dispatch] = useReducer(cartReducer, 'cart', loadCart)
	useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart])
	const count = cart.items.reduce((n, i) => n + i.qty, 0)
	const total = cart.items.reduce((sum, i) => sum + i.qty * byId(i.id).priceCents, 0)
	return { cart, count, total, dispatch }
}
// #endregion

// The same hook with the initializer called directly (the mistake)
function useCartEager() {
	// #region eager
	const [cart, dispatch] = useReducer(cartReducer, loadCart('cart'))
	// #endregion
	const count = cart.items.reduce((n, i) => n + i.qty, 0)
	const total = cart.items.reduce((sum, i) => sum + i.qty * byId(i.id).priceCents, 0)
	return { cart, count, total, dispatch }
}

// #region cart
function Cart({ useCartHook = useCart }) {
	const { cart, count, total, dispatch } = useCartHook()
	log(`Cart render: ${count} items, ${formatUSD(total)}`)
	return (
		<section className="cart">
			<h2 id="summary">
				{count} items · {formatUSD(total)}
			</h2>
			<ul>
				{cart.items.map((i) => (
					<li key={i.id}>
						<span>
							{byId(i.id).name} × {i.qty}
						</span>
						<button onClick={() => dispatch({ type: 'quantityChanged', id: i.id, qty: i.qty - 1 })}>−</button>
					</li>
				))}
			</ul>
			<CartButtons dispatch={dispatch} />
			<FreeShippingNote total={total} />
		</section>
	)
}

function FreeShippingNote({ total }: { total: number }) {
	log('FreeShippingNote render')
	return <p>{total >= 5000 ? 'Free shipping!' : `${formatUSD(5000 - total)} to free shipping`}</p>
}

const CartButtons = memo(function CartButtons({ dispatch }: { dispatch: Dispatch<CartAction> }) {
	log('CartButtons render')
	return (
		<p>
			<button id="add-mug" onClick={() => dispatch({ type: 'added', id: 'p1' })}>Add mug</button>
			<button id="add-lamp" onClick={() => dispatch({ type: 'added', id: 'p4' })}>Add lamp</button>
			<button id="remove-backpack" onClick={() => dispatch({ type: 'removed', id: 'p3' })}>Remove backpack</button>
			<button id="clear" onClick={() => dispatch({ type: 'cleared' })}>Clear</button>
		</p>
	)
})
// #endregion

function Typo() {
	const { dispatch } = useCart()
	return (
		<button
			id="typo"
			onClick={() => {
				// #region typo
				dispatch({ type: 'emptied' } as unknown as CartAction)
				log('dispatch() returned normally')
				// #endregion
			}}
		>
			Empty cart
		</button>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	localStorage.removeItem('cart')
	if (scenario === 'pure') {
		// #region pure
		const empty: CartState = { items: [] }
		const one = cartReducer(empty, { type: 'added', id: 'p1' })
		const two = cartReducer(one, { type: 'added', id: 'p1' })
		const same = cartReducer(two, { type: 'removed', id: 'p3' })
		log('one →', one)
		log('two →', two)
		log('same === two →', same === two)
		log('empty unchanged →', empty)
		// #endregion
		return
	}
	if (scenario === 'saved' || scenario === 'eager') {
		localStorage.setItem('cart', JSON.stringify({ items: [{ id: 'p4', qty: 2 }] }))
	}
	const app =
		scenario === 'typo' ? (
			<ErrorBoundary fallbackRender={({ error }) => <p role="alert">Cart crashed: {(error as Error).message}</p>} onError={(e) => log('ErrorBoundary caught:', (e as Error).message)}>
				<Typo />
			</ErrorBoundary>
		) : (
			<Cart useCartHook={scenario === 'eager' ? useCartEager : useCart} />
		)
	createRoot(root).render(app)
}
