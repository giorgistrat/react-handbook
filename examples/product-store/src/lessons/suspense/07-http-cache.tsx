// Suspense 6b: the in-memory promise cache is gone after a reload. The HTTP
// cache isn't. The server counts how often it's really asked.
import { log } from '../../log'

export async function mount(_root: HTMLElement, scenario: string | null) {
	const url = scenario === 'cache' ? '/api/exchange-rate?cache=1' : '/api/exchange-rate'
	// #region fetch
	const response = await fetch(url)
	const rate = await response.json()
	// #endregion
	const entry = performance.getEntriesByName(new URL(url, location.href).href).at(-1) as PerformanceResourceTiming | undefined
	log(`cache-control: ${response.headers.get('cache-control')}`)
	log(`server has been hit ${rate.serverHits} time(s) · from the browser cache: ${entry?.transferSize === 0}`)
}
