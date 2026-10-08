// A large, generated catalog for the performance lessons. Deterministic, so
// every recording sees the same products.
import type { Product } from './products'

const adjectives = ['Ceramic', 'Wireless', 'Trail', 'Desk', 'Bluetooth', 'Linen', 'Bamboo', 'Steel', 'Velvet', 'Cedar', 'Copper', 'Wool']
const nouns = ['Mug', 'Headphones', 'Backpack', 'Lamp', 'Speaker', 'Notebook', 'Bottle', 'Blanket', 'Kettle', 'Chair', 'Candle', 'Tray']
const categories: Product['category'][] = ['home', 'audio', 'outdoor', 'office']

export function makeCatalog(count: number): Product[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `c${i}`,
		name: `${adjectives[i % 12]} ${nouns[Math.floor(i / 12) % 12]} ${Math.floor(i / 144) + 1}`,
		category: categories[i % 4],
		priceCents: 500 + ((i * 7919) % 20000),
		stock: (i * 31) % 50,
		rating: 3 + ((i * 13) % 20) / 10,
	}))
}

/** Busy-waits for `ms` milliseconds: a stand-in for a component that is slow to render. */
export function burn(ms: number) {
	const end = performance.now() + ms
	while (performance.now() < end) {
		// deliberately slow
	}
}
