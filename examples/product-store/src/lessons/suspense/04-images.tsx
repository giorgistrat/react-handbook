// Suspense 4: switching products. The data takes 200 ms, the picture 600 ms.
import { Suspense, use, useState, useTransition, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { at, fetchProduct, startClock, type ProductDetails as Details } from '../../data/api'
import { log } from '../../log'
import { preloadImage } from './images'
import { watchScreen } from './watch'

const cache = new Map<string, Promise<Details>>()
const getProduct = (id: string) => cache.get(id) ?? (cache.set(id, fetchProduct(id, 200)), cache.get(id)!)

const id = (src: string) => src.match(/(\w+)\.svg/)![1]
const onLoad = (src: string) => () => log(`${at()}  <img> finished loading ${id(src)}`)
const onError = (src: string) => () => log(`${at()}  <img> failed to load ${id(src)} (broken-image icon)`)

// #region plainImg
function PlainImg({ src }: { src: string }) {
	return <img src={src} alt="" data-img={id(src)} onLoad={onLoad(src)} onError={onError(src)} />
}
// #endregion

// #region suspenseImg
function Img({ src }: { src: string }) {
	use(preloadImage(src)) // wait until the browser has the picture
	return <img src={src} alt="" data-img={id(src)} />
}
// #endregion

// #region keyedImg
function ProductImage({ src }: { src: string }) {
	return (
		<ErrorBoundary key={src} fallback={<span data-img="unavailable">Image unavailable</span>}>
			<Suspense fallback={<span data-img="placeholder">🖼️</span>}>
				<Img src={src} />
			</Suspense>
		</ErrorBoundary>
	)
}
// #endregion

function Details({ id, Image }: { id: string; Image: (p: { src: string }) => ReactNode }) {
	const product = use(getProduct(id))
	return (
		<article>
			<Image src={product.image} />
			<h2 data-details={product.name}>{product.name}</h2>
		</article>
	)
}

function Page({ Image }: { Image: (p: { src: string }) => ReactNode }) {
	const [productId, setProductId] = useState('p1')
	const [isPending, startTransition] = useTransition()
	return (
		<>
			<button id="p4" onClick={() => startTransition(() => setProductId('p4'))}>Desk Lamp</button>
			<button id="p2" onClick={() => startTransition(() => setProductId('p2'))}>Wireless Headphones</button>
			{isPending && <span data-pending>⏳</span>}
			<ErrorBoundary fallback={<p data-error>Couldn’t load this product.</p>}>
				<Suspense fallback={<p data-fallback>Loading product…</p>}>
					<Details id={productId} Image={Image} />
				</Suspense>
			</ErrorBoundary>
		</>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	watchScreen(root)
	const Image = { plain: PlainImg, suspend: Img }[scenario ?? ''] ?? ProductImage
	// load p1 fully first, so each recording starts from a finished page
	Promise.all([getProduct('p1'), preloadImage('/img/p1.svg')]).then(() => {
		startClock()
		createRoot(root).render(<Page Image={Image} />)
	})
}
