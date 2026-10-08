// Lesson 2: the same card with React, no JSX.
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { products, formatUSD } from '../../data/products'

/** A readable copy of a React element (functions and symbols as names). */
export function describe(el: unknown): unknown {
	if (Array.isArray(el)) return el.map(describe)
	if (!el || typeof el !== 'object') return el
	const e = el as { $$typeof?: symbol; type: unknown; key: string | null; props: Record<string, unknown> }
	if (!e.$$typeof) return el
	const props: Record<string, unknown> = {}
	for (const [k, v] of Object.entries(e.props)) props[k] = typeof v === 'function' ? `ƒ ${v.name || 'anonymous'}` : describe(v)
	return {
		$$typeof: e.$$typeof.toString(),
		type: typeof e.type === 'function' ? `ƒ ${e.type.name}` : e.type,
		key: e.key,
		props,
	}
}

export async function mount(root: HTMLElement) {
	const product = products[0]

	// #region element
	const element = createElement(
		'article',
		{ className: 'product-card' },
		createElement('h2', null, product.name),
		createElement('p', { className: 'price' }, formatUSD(product.priceCents)),
	)
	// #endregion
	log('element:', describe(element))
	log('frozen?', Object.isFrozen(element), Object.isFrozen((element as { props: object }).props))

	// #region keyed
	const item = createElement('li', { key: 'p1', className: 'item' }, 'Ceramic Mug')
	// #endregion
	log('keyed element:', { key: (item as { key: string }).key, props: (item as { props: object }).props })

	// #region render
	const reactRoot = createRoot(root)
	reactRoot.render(element)
	// #endregion
	log('right after render():', JSON.stringify(root.innerHTML))
	await new Promise((r) => setTimeout(r, 50))
	log('a moment later:', root.innerHTML)
}
