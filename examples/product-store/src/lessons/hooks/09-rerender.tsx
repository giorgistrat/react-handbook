// Hooks 9: who re-renders when the cart count changes?
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region children
function Footer() {
	log('  Footer renders')
	return <footer>Free shipping over $50</footer>
}

const Recommendations = memo(function Recommendations({ options }: { options: { limit: number } }) {
	log(`  Recommendations renders (limit ${options.limit})`)
	return <aside>Top {options.limit} picks</aside>
})

const CheckoutButton = memo(function CheckoutButton({ onCheckout }: { onCheckout: () => void }) {
	log('  CheckoutButton renders')
	return <button onClick={onCheckout}>Checkout</button>
})
// #endregion

// #region page
function CartPage({ stable }: { stable: boolean }) {
	const [count, setCount] = useState(0)
	log(`CartPage renders (count ${count})`)

	const inlineOptions = { limit: 3 }
	const memoOptions = useMemo(() => ({ limit: 3 }), [])
	const inlineCheckout = () => log('checkout')
	const memoCheckout = useCallback(() => log('checkout'), [])

	return (
		<>
			<button id="add" onClick={() => setCount((c) => c + 1)}>Add ({count})</button>
			<Recommendations options={stable ? memoOptions : inlineOptions} />
			<CheckoutButton onCheckout={stable ? memoCheckout : inlineCheckout} />
			<Footer />
		</>
	)
}
// #endregion

// #region interval
function Timer({ fixed }: { fixed: boolean }) {
	const [seconds, setSeconds] = useState(0) // one tick every 100 ms
	useEffect(() => {
		const id = setInterval(() => {
			if (fixed) setSeconds((s) => s + 1)
			else setSeconds(seconds + 1) // seconds is always 0 in this closure
		}, 100)
		return () => clearInterval(id)
	}, [])
	return <p id="timer">Ticks: {seconds}</p>
}
// #endregion

// #region inner
function SearchPage() {
	const [n, setN] = useState(0)
	function SearchBox() {
		// defined inside SearchPage: a new component type on every render
		return <input id="inner" />
	}
	return (
		<>
			<SearchBox />
			<button id="bump" onClick={() => setN(n + 1)}>Re-render ({n})</button>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root)
	if (scenario === 'timer-stale' || scenario === 'timer-fixed') return r.render(<Timer fixed={scenario === 'timer-fixed'} />)
	if (scenario === 'inner') return r.render(<SearchPage />)
	r.render(<CartPage stable={scenario === 'stable'} />)
}
