// Performance 4: the product page has a "Size chart" that most shoppers never
// open. Ship its code only when it's needed.
import { lazy, Suspense, useState, useTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region lazy
const loadSizeChart = () => (log('import() called'), import('./size-chart'))
const SizeChart = lazy(loadSizeChart)
// #endregion

const fallback = <p data-fallback>Loading size chart…</p>


// #region onDemand
function PageLazy() {
	const [show, setShow] = useState(false)
	return (
		<>
			<button id="show" onClick={() => setShow(true)}>Size chart</button>
			<Suspense fallback={fallback}>{show && <SizeChart />}</Suspense>
		</>
	)
}
// #endregion

// #region prefetch
function PagePrefetch() {
	const [show, setShow] = useState(false)
	return (
		<>
			<button id="show" onMouseEnter={loadSizeChart} onFocus={loadSizeChart} onClick={() => setShow(true)}>
				Size chart
			</button>
			<Suspense fallback={fallback}>{show && <SizeChart />}</Suspense>
		</>
	)
}
// #endregion

// #region transition
function PageTransition() {
	const [show, setShow] = useState(false)
	const [isPending, startTransition] = useTransition()
	return (
		<>
			<button id="show" onMouseEnter={loadSizeChart} onFocus={loadSizeChart} onClick={() => startTransition(() => setShow(true))}>
				Size chart {isPending && '⏳'}
			</button>
			<Suspense fallback={fallback}>{show && <SizeChart />}</Suspense>
		</>
	)
}
// #endregion

// Log when the fallback, the pending marker and the chart appear
export function watch(root: HTMLElement) {
	const seen = new Set<string>()
	new MutationObserver(() => {
		const now = {
			'fallback shown': !!root.querySelector('[data-fallback]'),
			'pending ⏳ shown': root.textContent!.includes('⏳'),
			'chart shown': !!root.querySelector('[data-chart]'),
		}
		for (const [what, on] of Object.entries(now)) {
			if (on && !seen.has(what)) (seen.add(what), log(what))
			if (!on) seen.delete(what)
		}
	}).observe(root, { childList: true, subtree: true, characterData: true })
}

export function mount(root: HTMLElement, scenario: string | null) {
	const pages = { lazy: PageLazy, prefetch: PagePrefetch, transition: PageTransition }
	const Page = pages[(scenario ?? 'lazy') as keyof typeof pages]
	watch(root)
	log('page mounted')
	createRoot(root).render(<Page />)
}
