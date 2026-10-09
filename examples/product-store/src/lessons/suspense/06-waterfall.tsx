// Suspense 6: a product page that needs three things: the product, its
// reviews and its picture. Do they load one after another, or together?
import { Suspense, use } from 'react'
import { createRoot } from 'react-dom/client'
import { fetchProduct, fetchReviews, startClock } from '../../data/api'
import { preloadImage } from './images'
import { watchScreen } from './watch'

const cached = <T,>(fn: (id: string) => Promise<T>) => {
	const cache = new Map<string, Promise<T>>()
	return (id: string) => cache.get(id) ?? (cache.set(id, fn(id)), cache.get(id)!)
}
const getProduct = cached((id) => fetchProduct(id, 300))
const getReviews = cached((id) => fetchReviews(id, 300))

// #region waterfall
function ProductPage({ id }: { id: string }) {
	const product = use(getProduct(id)) // 1. wait for the product…
	return (
		<article>
			<h2 data-details={product.name}>{product.name}</h2>
			<Suspense fallback={<p data-fallback>Loading picture and reviews…</p>}>
				<ProductImage src={product.image} /> {/* 2. …only then ask for the picture */}
				<Reviews id={id} /> {/* …and the reviews */}
			</Suspense>
		</article>
	)
}

function ProductImage({ src }: { src: string }) {
	use(preloadImage(src))
	return <img src={src} alt="" data-img={src.match(/(\w+)\.svg/)![1]} />
}

function Reviews({ id }: { id: string }) {
	const reviews = use(getReviews(id))
	return <p data-note>{reviews.length} review(s)</p>
}
// #endregion

// #region parallel
function startLoading(id: string) {
	// start everything the page needs before rendering it (e.g. in a route loader or click handler)
	getProduct(id)
	getReviews(id)
	preloadImage(`/img/${id}.svg`)
}
// #endregion

// #region siblings
function SiblingsPage({ id }: { id: string }) {
	return (
		<Suspense fallback={<p data-fallback>Loading…</p>}>
			<ProductName id={id} />
			<Reviews id={id} />
		</Suspense>
	)
}

function ProductName({ id }: { id: string }) {
	const product = use(getProduct(id))
	return <h2 data-details={product.name}>{product.name}</h2>
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	watchScreen(root)
	startClock()
	const r = createRoot(root)
	if (scenario === 'siblings') return r.render(<SiblingsPage id="p4" />)
	if (scenario === 'parallel') startLoading('p4')
	r.render(
		<Suspense fallback={<p data-fallback>Loading product…</p>}>
			<ProductPage id="p4" />
		</Suspense>,
	)
}
