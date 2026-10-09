// Suspense 1: a product page that reads its data with use(promise).
import { Suspense, use } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { fetchProduct, startClock, type ProductDetails as Details } from '../../data/api'
import { formatUSD } from '../../data/products'
import { log } from '../../log'
import { watchScreen } from './watch'

// #region details
function ProductDetails({ productPromise }: { productPromise: Promise<Details> }) {
	log('  ProductDetails render started')
	const product = use(productPromise) // suspends while the promise is pending
	log('  ProductDetails render finished')
	return (
		<section data-details={product.name}>
			<h2>{product.name}</h2>
			<p>{formatUSD(product.priceCents)}</p>
		</section>
	)
}
// #endregion

// #region page
function ProductPage({ productPromise }: { productPromise: Promise<Details> }) {
	return (
		<ErrorBoundary fallback={<p data-error>Couldn’t load this product.</p>}>
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetails productPromise={productPromise} />
			</Suspense>
		</ErrorBoundary>
	)
}
// #endregion

// #region tryCatch
function ProductDetailsTryCatch({ productPromise }: { productPromise: Promise<Details> }) {
	try {
		const product = use(productPromise)
		return <h2 data-details={product.name}>{product.name}</h2>
	} catch (thrown) {
		log('caught:', thrown === productPromise ? 'the promise itself' : String((thrown as Error).message).split('\n')[0])
		throw thrown // rethrow so Suspense still works
	}
}
// #endregion

// #region uncached
function ProductDetailsUncached({ id }: { id: string }) {
	const product = use(fetchProduct(id)) // a new promise on every render
	return <h2 data-details={product.name}>{product.name}</h2>
}
// #endregion

// #region asyncComponent
async function ProductDetailsAsync({ id }: { id: string }) {
	const product = await fetchProduct(id)
	return <h2 data-details={product.name}>{product.name}</h2>
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	watchScreen(root)
	startClock()
	const r = createRoot(root, { onUncaughtError: (e) => log('uncaught:', String((e as Error).message).split('\n')[0]) })
	if (scenario === 'promises') {
		// #region order
		const promise = new Promise<string>((resolve) => setTimeout(() => resolve('Desk Lamp'), 100))
		log('1. promise created, state: pending')
		promise.then((name) => log(`3. then() callback: ${name}`))
		log('2. after then(): callbacks never run synchronously')
		Promise.resolve('already done').then((v) => log(`2b. even an already-resolved promise waits for a microtask: ${v}`))
		log('2a. still synchronous')
		// #endregion
		return
	}
	if (scenario === 'try-catch') {
		const productPromise = fetchProduct('p4')
		return r.render(
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetailsTryCatch productPromise={productPromise} />
			</Suspense>,
		)
	}
	if (scenario === 'uncached') {
		return r.render(
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetailsUncached id="p4" />
			</Suspense>,
		)
	}
	if (scenario === 'async') {
		return r.render(
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetailsAsync id="p4" />
			</Suspense>,
		)
	}
	// #region start
	const productPromise = fetchProduct(scenario === 'error' ? 'p999' : 'p4') // started before rendering
	r.render(<ProductPage productPromise={productPromise} />)
	// #endregion
}
