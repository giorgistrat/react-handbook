// Lesson 9: a broken product shouldn't blank the whole store.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary, useErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { log } from '../../log'
import { formatUSD } from '../../data/products'

type MaybeProduct = { id: string; name: string; price?: { cents: number } }
const broken: MaybeProduct = { id: 'p404', name: 'Mystery Box' } // the API sent no price
const fine: MaybeProduct = { id: 'p1', name: 'Ceramic Mug', price: { cents: 1800 } }

// #region details
function ProductDetails({ product }: { product: MaybeProduct }) {
	log(`ProductDetails renders ${product.id}`)
	return (
		<article className="product-card">
			<h2>{product.name}</h2>
			<p className="price">{formatUSD(product.price!.cents)}</p>
		</article>
	)
}
// #endregion

// #region fallback
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<div role="alert">
			<p>Couldn’t show this product: {(error as Error).message}</p>
			<button onClick={resetErrorBoundary}>Try again</button>
		</div>
	)
}
// #endregion

// #region handler
function AddToCart() {
	const { showBoundary } = useErrorBoundary()
	return (
		<>
			<button id="unsafe" onClick={() => { throw new Error('Cart service is down') }}>
				Add to cart
			</button>
			<button id="safe" onClick={() => {
				try {
					throw new Error('Cart service is down')
				} catch (error) {
					showBoundary(error)
				}
			}}>
				Add to cart (reported)
			</button>
		</>
	)
}
// #endregion

function Note() {
	return <input id="note" placeholder="Note for the seller" />
}

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root, {
		onUncaughtError: (error) => log('root: uncaught →', (error as Error).message),
		onCaughtError: (error) => log('root: caught by a boundary →', (error as Error).message),
	})

	if (scenario === 'no-boundary') {
		// #region noBoundary
		r.render(
			<main>
				<h1>Store</h1>
				<ProductDetails product={broken} />
			</main>,
		)
		// #endregion
		return
	}

	if (scenario === 'boundary') {
		// #region boundary
		r.render(
			<main>
				<h1>Store</h1>
				<ErrorBoundary FallbackComponent={ErrorFallback}>
					<ProductDetails product={broken} />
				</ErrorBoundary>
				<ProductDetails product={fine} />
			</main>,
		)
		// #endregion
		return
	}

	if (scenario === 'reset') {
		// #region reset
		function Page() {
			const [product, setProduct] = useState(broken)
			return (
				<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setProduct(fine)}>
					<Note />
					<ProductDetails product={product} />
				</ErrorBoundary>
			)
		}
		// #endregion
		r.render(<Page />)
		return
	}

	// events
	r.render(
		<main>
			<ErrorBoundary FallbackComponent={ErrorFallback}>
				<AddToCart />
			</ErrorBoundary>
		</main>,
	)
	addEventListener('error', (e) => log('window error event →', e.message))
}
