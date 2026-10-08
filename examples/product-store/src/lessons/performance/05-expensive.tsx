// Performance 5: search across 150,000 products, with an unrelated "refresh
// prices" button that re-renders the page.
import { Suspense, use, useMemo, useState, useTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { measureKeystrokes } from './perf-utils'
import { rankProducts } from './search'

function timed(query: string) {
	const t0 = performance.now()
	const results = rankProducts(query)
	log(`  rankProducts("${query}") ran on the main thread: ${Math.round(performance.now() - t0)} ms`)
	return results
}

function Results({ names }: { names: string[] }) {
	return <ol id="results">{names.slice(0, 5).map((n) => <li key={n}>{n}</li>)}</ol>
}

// #region plain
function SearchPlain() {
	const [query, setQuery] = useState('')
	const [, setRefresh] = useState(0)
	const results = timed(query) // runs on every render
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<button id="refresh" onClick={() => setRefresh((n) => n + 1)}>Refresh prices</button>
			<Results names={results} />
		</>
	)
}
// #endregion

// #region memo
function SearchMemo() {
	const [query, setQuery] = useState('')
	const [, setRefresh] = useState(0)
	const results = useMemo(() => timed(query), [query]) // runs when query changes
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<button id="refresh" onClick={() => setRefresh((n) => n + 1)}>Refresh prices</button>
			<Results names={results} />
		</>
	)
}
// #endregion

// #region client
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' })
const waiting = new Map<number, (names: string[]) => void>()
let nextId = 0
worker.onmessage = (e: MessageEvent<{ id: number; results: string[] }>) => {
	waiting.get(e.data.id)?.(e.data.results)
	waiting.delete(e.data.id)
}

function searchInWorker(query: string) {
	return new Promise<string[]>((resolve) => {
		const id = nextId++
		waiting.set(id, resolve)
		worker.postMessage({ id, query })
	})
}
// #endregion

// #region async
function SearchWorker() {
	const [query, setQuery] = useState('')
	const [resultsPromise, setResultsPromise] = useState(() => searchInWorker(''))
	const [isPending, startTransition] = useTransition()

	function handleChange(q: string) {
		setQuery(q) // urgent: the input updates right away
		startTransition(() => setResultsPromise(searchInWorker(q))) // results follow when ready
	}

	return (
		<>
			<input id="search" value={query} onChange={(e) => handleChange(e.target.value)} />
			<div style={{ opacity: isPending ? 0.6 : 1 }}>
				<Suspense fallback={<p>Searching…</p>}>
					<WorkerResults promise={resultsPromise} />
				</Suspense>
			</div>
		</>
	)
}

function WorkerResults({ promise }: { promise: Promise<string[]> }) {
	return <Results names={use(promise)} />
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const apps = { plain: SearchPlain, memo: SearchMemo, worker: SearchWorker }
	const App = apps[(scenario ?? 'plain') as keyof typeof apps]
	measureKeystrokes()
	createRoot(root).render(<App />)
}
