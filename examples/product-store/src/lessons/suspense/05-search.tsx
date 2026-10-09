// Suspense 5: a search box whose results come from the server.
import { Suspense, use, useDeferredValue, useState, useTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { searchProducts, startClock } from '../../data/api'
import type { Product } from '../../data/products'
import { log } from '../../log'
import { watchScreen } from './watch'

const cache = new Map<string, Promise<Product[]>>()
const search = (q: string) => cache.get(q) ?? (cache.set(q, searchProducts(q)), cache.get(q)!)

// #region results
function Results({ query }: { query: string }) {
	const products = use(search(query))
	return <p data-details={`${products.length} result${products.length === 1 ? "" : "s"} for "${query}"`}>{products.map((p) => p.name).join(', ')}</p>
}
// #endregion

// #region transition
function SearchTransition() {
	const [query, setQuery] = useState('')
	const [, startTransition] = useTransition()
	return (
		<>
			<input id="search" value={query} onChange={(e) => startTransition(() => setQuery(e.target.value))} />
			<Suspense fallback={<p data-fallback>Searching…</p>}>
				<Results query={query} />
			</Suspense>
		</>
	)
}
// #endregion

// #region deferred
function SearchDeferred() {
	const [query, setQuery] = useState('')
	const deferredQuery = useDeferredValue(query)
	const isStale = query !== deferredQuery
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<div style={{ opacity: isStale ? 0.6 : 1 }} data-stale={isStale || undefined}>
				<Suspense fallback={<p data-fallback>Searching…</p>}>
					<Results query={deferredQuery} />
				</Suspense>
			</div>
		</>
	)
}
// #endregion

// What the input shows on the frame after each keystroke
function watchInput() {
	window.addEventListener('keydown', (e) => requestAnimationFrame(() => log(`  after "${e.key}" the input shows "${(document.querySelector('#search') as HTMLInputElement).value}"`)), true)
}

export function mount(root: HTMLElement, scenario: string | null) {
	search('').then(() => {
		watchScreen(root)
		watchInput()
		startClock()
		createRoot(root).render(scenario === 'transition' ? <SearchTransition /> : <SearchDeferred />)
	})
}
