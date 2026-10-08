// Lesson 1: a product card with nothing but the DOM API.
import { log } from '../../log'
import { products, formatUSD } from '../../data/products'

export function mount(_root: HTMLElement, scenario: string | null) {
	document.getElementById('root')!.remove() // this lesson builds its own root
	const product = products[0]

	if (scenario === 'escape') return escape()

	// #region card
	const rootElement = document.createElement('div')
	rootElement.id = 'root'
	document.body.append(rootElement)

	const card = document.createElement('article')
	card.className = 'product-card'

	const name = document.createElement('h2')
	name.textContent = product.name

	const price = document.createElement('p')
	price.className = 'price'
	price.textContent = formatUSD(product.priceCents)

	card.append(name, price)
	// #endregion
	log('card built. On the page?', document.body.contains(card))
	// #region append
	rootElement.append(card)
	// #endregion
	log('after append. On the page?', document.body.contains(card))
	log('html:', rootElement.innerHTML)
}

// textContent vs innerHTML with a product name that contains HTML
function escape() {
	const root = document.createElement('div')
	root.id = 'root'
	document.body.append(root)
	const evil = 'Mug <img src="x" onerror="window.__ran = true">'

	// #region escape
	const safe = document.createElement('h2')
	safe.textContent = evil // shown as text

	const unsafe = document.createElement('h2')
	unsafe.innerHTML = evil // parsed as HTML: the <img> is real
	// #endregion
	root.append(safe, unsafe)
	log('textContent → child elements:', safe.children.length, '· visible text:', safe.textContent)
	log('innerHTML → child elements:', unsafe.children.length, '· first child:', unsafe.children[0]?.tagName)
	setTimeout(() => log('onerror handler ran?', Boolean((window as unknown as { __ran?: boolean }).__ran)), 300)
}
