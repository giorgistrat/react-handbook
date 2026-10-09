// A fake product API for the Suspense lessons. Every request logs when it
// starts and finishes (ms since startClock(), rounded to 50 ms), so the
// recordings show what waited for what.
import { log } from '../log'
import { products, type Product } from './products'

let t0 = performance.now()
export const startClock = () => (t0 = performance.now())
export const at = () => `${Math.round((performance.now() - t0) / 50) * 50} ms`

function request<T>(label: string, ms: number, result: () => T): Promise<T> {
	log(`${at()}  → ${label}`)
	return new Promise((resolve, reject) =>
		setTimeout(() => {
			try {
				const value = result()
				log(`${at()}  ← ${label}`)
				resolve(value)
			} catch (e) {
				log(`${at()}  ✗ ${label}: ${(e as Error).message}`)
				reject(e)
			}
		}, ms),
	)
}

export type ProductDetails = Product & { image: string; description: string }

export function fetchProduct(id: string, ms = 300): Promise<ProductDetails> {
	return request(`GET /products/${id}`, ms, () => {
		const p = products.find((x) => x.id === id)
		if (!p) throw new Error(`No product with id "${id}"`)
		return { ...p, image: `/img/${id}.svg`, description: `${p.name}, one of our ${p.category} favorites.` }
	})
}

export type Review = { id: string; author: string; text: string }
const reviews: Record<string, Review[]> = { p1: [{ id: 'r1', author: 'Ana', text: 'Keeps my tea hot.' }] }

export function fetchReviews(id: string, ms = 300): Promise<Review[]> {
	return request(`GET /products/${id}/reviews`, ms, () => [...(reviews[id] ?? [])])
}

export function postReview(id: string, review: Omit<Review, 'id'>, ms = 800, fail = false): Promise<Review> {
	return request(`POST /products/${id}/reviews`, ms, () => {
		if (fail) throw new Error('Server error, review not saved')
		const saved = { ...review, id: `r${Date.now()}` }
		;(reviews[id] ??= []).push(saved)
		return saved
	})
}

export function searchProducts(query: string, ms = 400): Promise<Product[]> {
	return request(`GET /search?q=${query}`, ms, () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())))
}

/** Any other call, for multi-step examples: resolves after `ms`. */
export const callApi = (label: string, ms: number) => request(label, ms, () => true)

/** Log the start and end of any other async work (e.g. an image download) on the same clock. */
export function track<T>(label: string, promise: Promise<T>): Promise<T> {
	log(`${at()}  → ${label}`)
	return promise.then(
		(v) => (log(`${at()}  ← ${label}`), v),
		(e) => (log(`${at()}  ✗ ${label}`), Promise.reject(e)),
	)
}
