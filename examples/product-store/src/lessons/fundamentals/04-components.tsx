// Lesson 4: components are functions React calls for you.
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { products, formatUSD, type Product } from '../../data/products'

// #region price
function Price({ cents }: { cents: number }) {
	log('  Price runs')
	return <p className="price">{formatUSD(cents)}</p>
}
// #endregion

// #region card
function ProductCard({ product }: { product: Product }) {
	let views = 0 // a plain local: starts at 0 on every call
	views++
	log(`  ProductCard runs (views = ${views})`)
	return (
		<article className="product-card">
			<h2>{product.name}</h2>
			<Price cents={product.priceCents} />
		</article>
	)
}
// #endregion

const tick = () => new Promise((r) => setTimeout(r, 30))

export async function mount(root: HTMLElement, scenario: string | null) {
	const product = products[0]
	const reactRoot = createRoot(root)

	if (scenario === 'called') {
		// #region called
		log('1. building elements')
		const element = <div>{Price({ cents: product.priceCents })}</div>
		log('2. elements built, calling render()')
		reactRoot.render(element)
		// #endregion
		await tick()
		log('3. on screen')
		return
	}

	if (scenario === 'element') {
		// #region element
		log('1. building elements')
		const element = <div>{createElement(Price, { cents: product.priceCents })}</div>
		log('2. elements built, calling render()')
		reactRoot.render(element)
		// #endregion
		await tick()
		log('3. on screen')
		return
	}

	// default: render the card three times
	for (const n of [1, 2, 3]) {
		log(`render #${n}`)
		reactRoot.render(<ProductCard product={product} />)
		await tick()
	}
}
