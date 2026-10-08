// Lesson 3: the same card in JSX, plus the JSX rules that trip people up.
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { products, formatUSD, type Product } from '../../data/products'

export async function mount(root: HTMLElement) {
	const product = products[0]

	// #region card
	const element = (
		<article className="product-card">
			<h2>{product.name}</h2>
			<p className="price">{formatUSD(product.priceCents)}</p>
		</article>
	)
	// #endregion

	// #region stock
	const headphones = products[1] // stock: 0
	const buggy = <p>{headphones.stock && <span className="tag">In stock</span>}</p>
	const fixed = <p>{headphones.stock > 0 && <span className="tag">In stock</span>}</p>
	// #endregion

	// #region spread
	const props: { className: string; title?: string } = { className: 'price', title: 'from props' }
	const later = <p {...props} title="explicit wins" />
	const earlier = <p title="explicit loses" {...props} />
	// #endregion

	// #region fragment
	function Details({ product }: { product: Product }) {
		return (
			<>
				<dt>Rating</dt>
				<dd>{product.rating} / 5</dd>
			</>
		)
	}
	// #endregion

	const r = createRoot(root)
	r.render(
		<>
			{element}
			<div id="buggy">{buggy}</div>
			<div id="fixed">{fixed}</div>
			<div id="spread">
				{later}
				{earlier}
			</div>
			<dl id="details">
				<Details product={product} />
			</dl>
		</>,
	)
	await new Promise((x) => setTimeout(x, 50))
	log('card html:', root.querySelector('article')!.outerHTML)
	log('stock && → html:', root.querySelector('#buggy')!.innerHTML)
	log('stock > 0 && → html:', root.querySelector('#fixed')!.innerHTML)
	log('spread then explicit:', root.querySelector('#spread p:first-child')!.getAttribute('title'))
	log('explicit then spread:', root.querySelector('#spread p:last-child')!.getAttribute('title'))
	log('fragment → <dl> children:', [...root.querySelector('#details')!.children].map((c) => c.tagName).join(', '))
}
