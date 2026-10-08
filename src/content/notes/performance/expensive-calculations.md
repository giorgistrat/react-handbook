---
title: "Expensive Calculations"
slug: "expensive-calculations"
module: "performance"
order: 4
level: "good"
illus: "robot"
summary: "Measure, cache with useMemo, or move the work to a Web Worker and read the result with use."
source: "https://react.dev/reference/react/useMemo"
---


## In one minute

Everything in a component's body runs on every render, so a slow calculation there runs again even when its inputs didn't change. The options, roughly in order of effort:

1. **Don't repeat it.** Cache the result with `useMemo(() => calc(a, b), [a, b])`.
2. **Make it faster.** A better algorithm, less data, a cheaper library.
3. **Move it off the main thread** with a **Web Worker**, so it can be slow without freezing the page.
4. **Deprioritize the render** around it ([Concurrent Rendering](../../performance/concurrent-rendering/)).

`useMemo` only helps when the inputs *didn't* change. When they did (each keystroke of a search), the work still blocks. A worker fixes that: the main thread just sends a message, and React reads the result as a promise with `use`.

**You'll be able to:** decide whether a calculation is worth memoizing, cache it with `useMemo`, and move it to a worker with a promise React can suspend on.

<figure class="fig anim fig-perf-worker-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Main thread</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Web Worker</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;rankProducts(\&quot;l\&quot;)&quot;,&quot;say&quot;:&quot;The search runs during render, on the main thread. Recorded: 55 ms.&quot;,&quot;set&quot;:{&quot;m1&quot;:&quot;hl&quot;,&quot;m2&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;m2&quot;:&quot;ranking 150,000 products: ~55 ms&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;The input can’t show the letter until it’s done. &lt;code&gt;useMemo&lt;/code&gt; only helps when the query &lt;b&gt;didn’t&lt;/b&gt; change (the “Refresh prices” click).&quot;,&quot;set&quot;:{&quot;m1&quot;:&quot;&quot;,&quot;m3&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;m3&quot;:&quot;next frame after ~58 ms&quot;}}]" data-intro="&lt;code&gt;rankProducts(query)&lt;/code&gt; during render (with or without &lt;code&gt;useMemo&lt;/code&gt;: the query changed)."><div class="anim-scn-title">Main thread</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">main thread</div><div class="a-col"><span class="an chip-a" data-k="m1" data-s="faint">keystroke “l”</span><span class="an chip-a" data-k="m2" data-s="ghost">…</span><span class="an chip-a" data-k="m3" data-s="ghost">next frame</span></div></div><div class="a-panel "><div class="a-panel-title">worker thread</div><div class="a-col"><span class="an chip-a" data-k="w1" data-s="faint">idle</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>rankProducts("l")</code><span>The search runs during render, on the main thread. Recorded: 55 ms.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>The input can’t show the letter until it’s done. <code>useMemo</code> only helps when the query <b>didn’t</b> change (the “Refresh prices” click).</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setQuery(\&quot;l\&quot;)&quot;,&quot;say&quot;:&quot;An urgent update: the input will show the letter.&quot;,&quot;set&quot;:{&quot;m1&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;worker.postMessage({ id, query })&quot;,&quot;say&quot;:&quot;The search is sent to the worker, inside &lt;code&gt;startTransition&lt;/code&gt;, as a new promise in state.&quot;,&quot;set&quot;:{&quot;m2&quot;:&quot;ok&quot;,&quot;w1&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;m2&quot;:&quot;post a message: ~0 ms&quot;,&quot;w1&quot;:&quot;ranking 150,000 products&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;Recorded: the next frame came within about one frame on every keystroke. The main thread was free.&quot;,&quot;set&quot;:{&quot;m1&quot;:&quot;&quot;,&quot;m3&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;m3&quot;:&quot;next frame: ≤ 1 frame&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;use(promise)&quot;,&quot;say&quot;:&quot;When the worker replies, the transition finishes and the results appear. While it waits, the old results stay on screen, dimmed by &lt;code&gt;isPending&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;w1&quot;:&quot;done&quot;},&quot;txt&quot;:{&quot;w1&quot;:&quot;done, results posted back&quot;}}]" data-intro="The search runs in a worker; the result is a promise read with &lt;code&gt;use&lt;/code&gt;."><div class="anim-scn-title">Web Worker</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">main thread</div><div class="a-col"><span class="an chip-a" data-k="m1" data-s="faint">keystroke “l”</span><span class="an chip-a" data-k="m2" data-s="ghost">…</span><span class="an chip-a" data-k="m3" data-s="ghost">next frame</span></div></div><div class="a-panel "><div class="a-panel-title">worker thread</div><div class="a-col"><span class="an chip-a" data-k="w1" data-s="faint">idle</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>setQuery("l")</code><span>An urgent update: the input will show the letter.</span></li><li><span class="anim-phase ph-event">event</span><code>worker.postMessage({ id, query })</code><span>The search is sent to the worker, inside <code>startTransition</code>, as a new promise in state.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>Recorded: the next frame came within about one frame on every keystroke. The main thread was free.</span></li><li><span class="anim-phase ph-render">render phase</span><code>use(promise)</code><span>When the worker replies, the transition finishes and the results appear. While it waits, the old results stay on screen, dimmed by <code>isPending</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Typing “l” into a search over 150,000 products (both recorded).</figcaption></figure>

## The example: searching 150,000 products

The store's search scores every product against the query and sorts them. The page also has a "Refresh prices" button that re-renders it for an unrelated reason.

```ts
export function rankProducts(query: string) {
	const q = query.toLowerCase()
	return catalog
		.map((p) => ({ name: p.name, score: q ? score(p.name.toLowerCase(), q) : 1 }))
		.filter((r) => r.score > 0)
		.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
		.slice(0, 20)
		.map((r) => r.name)
}
```

The recordings: mount, click "Refresh prices", then type "lamp" (200 ms between keys). `rankProducts` logs how long it took on the main thread.

### 1. In the render body

```tsx
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
```

"Refresh prices":

```text
  rankProducts("") ran on the main thread: 75 ms
```

Typing "lamp":

```text
  rankProducts("l") ran on the main thread: 66 ms
keystroke "l": next frame after 70 ms
  rankProducts("la") ran on the main thread: 46 ms
keystroke "a": next frame after 49 ms
  rankProducts("lam") ran on the main thread: 20 ms
keystroke "m": next frame after 22 ms
  rankProducts("lamp") ran on the main thread: 16 ms
keystroke "p": next frame after 17 ms
```

The search ran again for a click that had nothing to do with it, and each keystroke waited for it.

### 2. `useMemo`

```tsx
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
```

"Refresh prices":

```js
[]
```

Typing "lamp":

```text
  rankProducts("l") ran on the main thread: 65 ms
keystroke "l": next frame after 68 ms
  rankProducts("la") ran on the main thread: 44 ms
keystroke "a": next frame after 46 ms
  rankProducts("lam") ran on the main thread: 20 ms
keystroke "m": next frame after 23 ms
  rankProducts("lamp") ran on the main thread: 21 ms
keystroke "p": next frame after 24 ms
```

The refresh no longer runs the search. Typing still does, because the query really changed, and each keystroke still waits.

### 3. A Web Worker

The search moves into a worker file. The same `rankProducts` function runs there, on another thread:

```ts
import { rankProducts } from './search'

self.onmessage = (e: MessageEvent<{ id: number; query: string }>) => {
	self.postMessage({ id: e.data.id, results: rankProducts(e.data.query) })
}
```

On the main thread, a small client turns each request into a promise:

```tsx
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
```

The component keeps the **promise** in state, reads it with `use`, and replaces it inside a transition:

```tsx
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
```

Typing "lamp":

```text
keystroke "l": next frame after 17 ms
keystroke "a": next frame after 2 ms
keystroke "m": next frame after 2 ms
keystroke "p": next frame after 4 ms
```

Every keystroke painted within about one frame (~16 ms), usually much less. The results (the same first five as before) arrived when the worker replied:

```text
Desk Lamp 1
Desk Lamp 10
Desk Lamp 100
Desk Lamp 1000
Desk Lamp 1001
```

## How it works

- **`useMemo` compares dependencies with `Object.is`** and returns the cached value when they all match. It's a performance hint, not a guarantee: React may drop the cache (for example, for offscreen content).
- **Is it worth it?** react.dev's rule of thumb: time it (`console.time`); if it takes **1 ms or more**, memoizing may help. Measure with CPU throttling and in a production build.
- **A worker is another thread.** It shares no memory with the page: data is copied with `postMessage` (structured clone), so send queries and small results, not huge objects back and forth. The worker loads its own copy of the code and data. Libraries like Comlink hide the message plumbing behind function calls.
- **`use(promise)` + transition.** The promise must be stable (kept in state, not created during render), or every render would start a new search and suspend forever. Updating it inside `startTransition` keeps the old results visible while the new ones load, instead of showing the `Suspense` fallback on every keystroke.

## Common mistakes

- **`useMemo` on cheap calculations.** It adds a deps array, a comparison and memory, for nothing.
- **Unstable dependencies** (objects created during render): the cache never hits.
- **Creating the promise during render** (`use(searchInWorker(q))`): a new promise each render.
- **Shipping huge data to a worker on every call.** Load it in the worker once.

## Interview Q&A

<details class="qa"><summary>Why is a slow calculation in a component a problem?</summary>

The component body runs on every render, so the calculation repeats even when its inputs haven't changed. Recorded: "Refresh prices" re-ran the 150,000-product search.

</details>

<details class="qa"><summary>When is <code>useMemo</code> worth it?</summary>

When the calculation is measurably slow (about 1 ms or more) and the component re-renders with the same inputs. Recorded: with `useMemo`, the refresh click ran nothing.

</details>

<details class="qa"><summary>What doesn't <code>useMemo</code> fix?</summary>

The case where the inputs change. Each keystroke changed the query, so the search still ran and the input still waited for it (recorded: tens of milliseconds per letter).

</details>

<details class="qa"><summary>How does a Web Worker help, if the work is the same?</summary>

The work runs on another thread, so the main thread stays free to handle input and paint. Recorded: the next frame came within about one frame of every keystroke, instead of waiting for the search.

</details>

<details class="qa"><summary>How do you show the worker's async result in React 19?</summary>

Keep the promise in state, read it with `use(promise)` inside `Suspense`, and replace the promise inside `startTransition` so the old results stay visible while the new ones compute.

</details>

## Related

- [Concurrent Rendering](../../performance/concurrent-rendering/): deprioritize slow rendering instead.
- [React Re-rendering](../../hooks/react-re-rendering/): `useMemo` and `useCallback` basics.
- The Suspense module: `use`, promises and transitions in depth.

## Sources

- react.dev: [`useMemo`](https://react.dev/reference/react/useMemo), [`use`](https://react.dev/reference/react/use)
- MDN: [Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- Kent C. Dodds: [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Comlink](https://github.com/GoogleChromeLabs/comlink): calling worker functions like local ones
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
