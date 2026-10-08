// Performance 3: a search box over a grid that is slow to render (each card
// takes ~1 ms). Can typing stay responsive?
import { memo, useDeferredValue, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { burn, makeCatalog } from '../../data/catalog'
import type { Product } from '../../data/products'
import { log } from '../../log'
import { measureKeystrokes } from './perf-utils'

const catalog = makeCatalog(2000)

// #region grid
function ProductGrid({ query }: { query: string }) {
	const results = catalog.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 120)
	log(`  ProductGrid rendered for "${query}"`)
	return (
		<ul className="grid">
			{results.map((p) => (
				<SlowCard key={p.id} product={p} />
			))}
		</ul>
	)
}

function SlowCard({ product }: { product: Product }) {
	burn(1) // pretend this card is expensive to render
	return <li>{product.name}</li>
}
// #endregion

const MemoGrid = memo(ProductGrid)

// #region plain
function SearchPlain() {
	const [query, setQuery] = useState('')
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<ProductGrid query={query} />
		</>
	)
}
// #endregion

// #region deferredNoMemo
function SearchDeferredNoMemo() {
	const [query, setQuery] = useState('')
	const deferredQuery = useDeferredValue(query)
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<ProductGrid query={deferredQuery} />
		</>
	)
}
// #endregion

// #region deferred
function SearchDeferred() {
	const [query, setQuery] = useState('')
	const deferredQuery = useDeferredValue(query)
	const stale = query !== deferredQuery
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<div style={{ opacity: stale ? 0.6 : 1 }}>
				<MemoGrid query={deferredQuery} />
			</div>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const apps = { plain: SearchPlain, 'deferred-no-memo': SearchDeferredNoMemo, deferred: SearchDeferred }
	const App = apps[(scenario ?? 'plain') as keyof typeof apps]
	measureKeystrokes()
	createRoot(root).render(<App />)
}
