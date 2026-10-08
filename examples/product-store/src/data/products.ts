// The product store's catalogue. Every lesson in the handbook uses these.

export type Product = {
	id: string
	name: string
	category: 'audio' | 'home' | 'outdoor' | 'office'
	priceCents: number
	stock: number
	rating: number
}

export const products: Product[] = [
	{ id: 'p1', name: 'Ceramic Mug', category: 'home', priceCents: 1800, stock: 24, rating: 4.6 },
	{ id: 'p2', name: 'Wireless Headphones', category: 'audio', priceCents: 8900, stock: 0, rating: 4.4 },
	{ id: 'p3', name: 'Trail Backpack', category: 'outdoor', priceCents: 6400, stock: 7, rating: 4.8 },
	{ id: 'p4', name: 'Desk Lamp', category: 'office', priceCents: 3900, stock: 12, rating: 4.2 },
	{ id: 'p5', name: 'Bluetooth Speaker', category: 'audio', priceCents: 5900, stock: 3, rating: 4.5 },
	{ id: 'p6', name: 'Notebook Set', category: 'office', priceCents: 1200, stock: 40, rating: 4.7 },
]

export const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`

export const categories = ['audio', 'home', 'outdoor', 'office'] as const

/** Products whose name or category contains every word of the query. */
export function searchProducts(query: string) {
	const words = query.toLowerCase().split(' ').filter(Boolean)
	return products.filter((p) => words.every((w) => p.name.toLowerCase().includes(w) || p.category === w))
}
