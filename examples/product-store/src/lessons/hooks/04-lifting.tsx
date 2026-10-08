// Hooks 4: where should "favorites" live?
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { searchProducts, type Product } from '../../data/products'

function Search({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
	log('  Search renders')
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}

// #region lifted
function GridLifted({ query }: { query: string }) {
	log('  ProductGrid renders')
	const [favorites, setFavorites] = useState<string[]>([])
	const found = searchProducts(query).sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)))
	return (
		<ul>
			{found.map((p) => (
				<CardLifted
					key={p.id}
					product={p}
					isFavorite={favorites.includes(p.id)}
					onToggle={() => setFavorites((f) => (f.includes(p.id) ? f.filter((id) => id !== p.id) : [...f, p.id]))}
				/>
			))}
		</ul>
	)
}

function CardLifted({ product, isFavorite, onToggle }: { product: Product; isFavorite: boolean; onToggle: () => void }) {
	log(`  Card ${product.id} renders`)
	return (
		<li data-id={product.id}>
			{product.name}
			<button onClick={onToggle}>{isFavorite ? '♥' : '♡'}</button>
		</li>
	)
}
// #endregion

// #region colocated
function GridColocated({ query }: { query: string }) {
	log('  ProductGrid renders')
	return (
		<ul>
			{searchProducts(query).map((p) => (
				<CardColocated key={p.id} product={p} />
			))}
		</ul>
	)
}

function CardColocated({ product }: { product: Product }) {
	log(`  Card ${product.id} renders`)
	const [isFavorite, setIsFavorite] = useState(false)
	return (
		<li data-id={product.id}>
			{product.name}
			<button onClick={() => setIsFavorite(!isFavorite)}>{isFavorite ? '♥' : '♡'}</button>
		</li>
	)
}
// #endregion

// #region app
function App({ Grid }: { Grid: (props: { query: string }) => React.ReactNode }) {
	log('App renders')
	const [query, setQuery] = useState('')
	return (
		<>
			<Search query={query} setQuery={setQuery} />
			<Grid query={query} />
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	createRoot(root).render(<App Grid={scenario === 'lifted' ? GridLifted : GridColocated} />)
}
