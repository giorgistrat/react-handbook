// The store's product search: score every product against the query, then
// sort. Fine for 100 products, slow for 150,000. Used on the main thread and
// inside search.worker.ts.
import { makeCatalog } from '../../data/catalog'

const catalog = makeCatalog(150_000)

function score(name: string, query: string) {
	// letters of the query found in order in the name; earlier matches score higher
	let s = 0
	let from = 0
	for (const ch of query) {
		const at = name.indexOf(ch, from)
		if (at < 0) return 0
		s += 100 - Math.min(at - from, 99)
		from = at + 1
	}
	return s
}

// #region rank
export function rankProducts(query: string) {
	const q = query.toLowerCase()
	return catalog
		.map((p) => ({ name: p.name, score: q ? score(p.name.toLowerCase(), q) : 1 }))
		.filter((r) => r.score > 0)
		.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
		.slice(0, 20)
		.map((r) => r.name)
}
// #endregion
