// Suspense 2: switching between products. Where does each product's promise
// come from, and what does the shopper see while the next one loads?
import { Suspense, use, useEffect, useRef, useState, useTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { fetchProduct, startClock, type ProductDetails as Details } from '../../data/api'
import { log } from '../../log'
import { watchScreen } from './watch'

// #region cache
const productCache = new Map<string, Promise<Details>>()

function getProduct(id: string) {
	let promise = productCache.get(id)
	if (!promise) {
		promise = fetchProduct(id, id === 'p6' ? 100 : 500) // p6 is a fast request
		productCache.set(id, promise)
	}
	return promise
}
// #endregion

// #region details
function ProductDetails({ id }: { id: string }) {
	const product = use(getProduct(id)) // the same promise for the same id
	return <h2 data-details={product.name}>{product.name}</h2>
}
// #endregion

const ids = ['p1', 'p4', 'p6']

// #region urgent
function ProductSwitcherUrgent() {
	const [id, setId] = useState('p1')
	return (
		<>
			{ids.map((x) => (
				<button key={x} id={x} onClick={() => setId(x)}>{x}</button>
			))}
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetails id={id} />
			</Suspense>
		</>
	)
}
// #endregion

// #region transition
function ProductSwitcher() {
	const [id, setId] = useState('p1')
	const [isPending, startTransition] = useTransition()
	return (
		<>
			{ids.map((x) => (
				<button key={x} id={x} onClick={() => startTransition(() => setId(x))}>{x}</button>
			))}
			{isPending && <span data-pending>⏳</span>}
			<div style={{ opacity: isPending ? 0.6 : 1 }} data-stale={isPending || undefined}>
				<Suspense fallback={<p data-fallback>Loading product…</p>}>
					<ProductDetails id={id} />
				</Suspense>
			</div>
		</>
	)
}
// #endregion

// #region spinDelay
// Show a pending state only if it lasts longer than `delay`; once shown,
// keep it for at least `minDuration` (the idea behind the spin-delay package).
function useSpinDelay(loading: boolean, { delay = 300, minDuration = 400 } = {}) {
	const [show, setShow] = useState(false)
	const shownAt = useRef(0)
	useEffect(() => {
		if (loading && !show) {
			const t = setTimeout(() => ((shownAt.current = Date.now()), setShow(true)), delay)
			return () => clearTimeout(t)
		}
		if (!loading && show) {
			const t = setTimeout(() => setShow(false), Math.max(0, minDuration - (Date.now() - shownAt.current)))
			return () => clearTimeout(t)
		}
	}, [loading, show, delay, minDuration])
	return show
}

function ProductSwitcherSpinDelay() {
	const [id, setId] = useState('p1')
	const [isPending, startTransition] = useTransition()
	const showSpinner = useSpinDelay(isPending)
	return (
		<>
			{ids.map((x) => (
				<button key={x} id={x} onClick={() => startTransition(() => setId(x))}>{x}</button>
			))}
			{showSpinner && <span data-pending>⏳</span>}
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetails id={id} />
			</Suspense>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	watchScreen(root)
	startClock()
	const App = { urgent: ProductSwitcherUrgent, 'spin-delay': ProductSwitcherSpinDelay }[scenario ?? ''] ?? ProductSwitcher
	createRoot(root).render(<App />)
	log('mounted')
}
