---
title: "Concurrent Rendering"
slug: "concurrent-rendering"
module: "performance"
order: 2
level: "must"
illus: "loop"
summary: "useDeferredValue + memo keeps typing instant over a slow grid; without memo it does nothing (recorded)."
source: "https://react.dev/reference/react/useDeferredValue"
---


## In one minute

At 60 frames per second, the browser gets a new frame every ~16 ms. A render that takes 125 ms freezes the page for 125 ms: the letter you just typed doesn't even appear. **Concurrent rendering** lets React split a low-priority render into small pieces, pause to let the browser handle input and paint, and throw the render away if newer input arrives. You tell React what's low-priority with `useTransition` (around a state update) or `useDeferredValue` (around a value). The work doesn't get smaller, it stops **blocking**. The catch with `useDeferredValue`: the slow component must be **memoized**, or React renders it anyway during the urgent render.

**You'll be able to:** keep an input responsive over a slow list with `useDeferredValue` and `memo`, and explain why it does nothing without `memo`.

<figure class="fig anim fig-perf-deferred-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Plain</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Deferred, no memo</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Deferred + memo</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render 1: query \&quot;c\&quot;, grid for \&quot;c\&quot;&quot;,&quot;say&quot;:&quot;One synchronous render with the input &lt;b&gt;and&lt;/b&gt; the 120 slow cards. Nothing can interrupt it.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;r1&quot;:&quot;input + grid: ~125 ms, blocking&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;Only now can the browser show the typed letter.&quot;,&quot;set&quot;:{&quot;inp&quot;:&quot;upd&quot;,&quot;fr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;inp&quot;:&quot;input shows: \&quot;c\&quot;&quot;,&quot;fr&quot;:&quot;~130 ms&quot;}}]" data-intro="The grid gets &lt;code&gt;query&lt;/code&gt; directly."><div class="anim-scn-title">Plain</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">keystroke “c”</div><div class="a-col"><span class="an chip-a" data-k="inp" data-s="faint">input shows: ""</span></div></div><div class="a-panel wide"><div class="a-panel-title">renders</div><div class="a-col"><span class="an chip-a" data-k="r1" data-s="ghost">render 1</span><span class="an chip-a" data-k="r2" data-s="ghost">render 2</span></div></div><div class="a-panel "><div class="a-panel-title">next frame (recorded)</div><div class="a-col"><span class="an chip-a" data-k="fr" data-s="faint">?</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>render 1: query "c", grid for "c"</code><span>One synchronous render with the input <b>and</b> the 120 slow cards. Nothing can interrupt it.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>Only now can the browser show the typed letter.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render 1: query \&quot;c\&quot;, deferred \&quot;\&quot;&quot;,&quot;say&quot;:&quot;The urgent render passes the &lt;b&gt;old&lt;/b&gt; value to the grid. But the grid isn’t memoized, so it renders anyway, all 120 cards, for the old query.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;r1&quot;:&quot;grid for \&quot;\&quot; (again!): ~125 ms&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;Recorded: no better than plain.&quot;,&quot;set&quot;:{&quot;inp&quot;:&quot;upd&quot;,&quot;fr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;inp&quot;:&quot;input shows: \&quot;c\&quot;&quot;,&quot;fr&quot;:&quot;~125 ms&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render 2: deferred \&quot;c\&quot;&quot;,&quot;say&quot;:&quot;Then the background render does the real work. The grid rendered twice per keystroke.&quot;,&quot;set&quot;:{&quot;r2&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;r2&quot;:&quot;grid for \&quot;c\&quot; (background)&quot;}}]" data-intro="&lt;code&gt;useDeferredValue(query)&lt;/code&gt;, but the grid isn’t memoized."><div class="anim-scn-title">Deferred, no memo</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">keystroke “c”</div><div class="a-col"><span class="an chip-a" data-k="inp" data-s="faint">input shows: ""</span></div></div><div class="a-panel wide"><div class="a-panel-title">renders</div><div class="a-col"><span class="an chip-a" data-k="r1" data-s="ghost">render 1</span><span class="an chip-a" data-k="r2" data-s="ghost">render 2</span></div></div><div class="a-panel "><div class="a-panel-title">next frame (recorded)</div><div class="a-col"><span class="an chip-a" data-k="fr" data-s="faint">?</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>render 1: query "c", deferred ""</code><span>The urgent render passes the <b>old</b> value to the grid. But the grid isn’t memoized, so it renders anyway, all 120 cards, for the old query.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>Recorded: no better than plain.</span></li><li><span class="anim-phase ph-render">render phase</span><code>render 2: deferred "c"</code><span>Then the background render does the real work. The grid rendered twice per keystroke.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render 1: query \&quot;c\&quot;, deferred \&quot;\&quot;&quot;,&quot;say&quot;:&quot;The grid gets the same &lt;code&gt;query&lt;/code&gt; prop as last time, so &lt;code&gt;memo&lt;/code&gt; skips it. This render only updates the input.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;r1&quot;:&quot;input only: fast&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;Recorded: the next frame came within about one frame (~16 ms).&quot;,&quot;set&quot;:{&quot;inp&quot;:&quot;upd&quot;,&quot;fr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;inp&quot;:&quot;input shows: \&quot;c\&quot;&quot;,&quot;fr&quot;:&quot;≤ 1 frame&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render 2: deferred \&quot;c\&quot; (interruptible)&quot;,&quot;say&quot;:&quot;The slow grid renders in the background, yielding to the browser between pieces of work. If another key arrives, React drops this render and starts again with the newer value.&quot;,&quot;set&quot;:{&quot;r2&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;r2&quot;:&quot;grid for \&quot;c\&quot;, in chunks&quot;}}]" data-intro="The same, with &lt;code&gt;memo(ProductGrid)&lt;/code&gt;."><div class="anim-scn-title">Deferred + memo</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">keystroke “c”</div><div class="a-col"><span class="an chip-a" data-k="inp" data-s="faint">input shows: ""</span></div></div><div class="a-panel wide"><div class="a-panel-title">renders</div><div class="a-col"><span class="an chip-a" data-k="r1" data-s="ghost">render 1</span><span class="an chip-a" data-k="r2" data-s="ghost">render 2</span></div></div><div class="a-panel "><div class="a-panel-title">next frame (recorded)</div><div class="a-col"><span class="an chip-a" data-k="fr" data-s="faint">?</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>render 1: query "c", deferred ""</code><span>The grid gets the same <code>query</code> prop as last time, so <code>memo</code> skips it. This render only updates the input.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>Recorded: the next frame came within about one frame (~16 ms).</span></li><li><span class="anim-phase ph-render">render phase</span><code>render 2: deferred "c" (interruptible)</code><span>The slow grid renders in the background, yielding to the browser between pieces of work. If another key arrives, React drops this render and starts again with the newer value.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Typing “c” over a grid of 120 cards that take ~1 ms each (all three recorded).</figcaption></figure>

## The example: a search over a slow grid

The grid shows up to 120 cards, and each card takes about 1 ms to render (a stand-in for a genuinely expensive component). The recordings type "c", "e", "r" with 150 ms between keys, and log how long after each keystroke the browser could paint its next frame.

```tsx
function ProductGrid({ query }: { query: string }) {
	const results = catalog.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 120)
	log(`  ProductGrid rendered for "${query}"`)
	return (
		<ul className="grid">
			{results.map((p) => (
				<SlowCard key={p.id} product={p} />
			))}
		</ul>
	)
}

function SlowCard({ product }: { product: Product }) {
	burn(1) // pretend this card is expensive to render
	return <li>{product.name}</li>
}
```

### 1. Plain

```tsx
function SearchPlain() {
	const [query, setQuery] = useState('')
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<ProductGrid query={query} />
		</>
	)
}
```

```text
keystroke "c": next frame after 132 ms
keystroke "e": next frame after 129 ms
keystroke "r": next frame after 127 ms
```

Every keystroke waits for the whole grid: the input lags by over 100 ms per letter.

### 2. `useDeferredValue` without `memo`

```tsx
function SearchDeferredNoMemo() {
	const [query, setQuery] = useState('')
	const deferredQuery = useDeferredValue(query)
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<ProductGrid query={deferredQuery} />
		</>
	)
}
```

```text
keystroke "c": next frame after 129 ms
keystroke "e": next frame after 124 ms
keystroke "r": next frame after 124 ms
```

No better. The renders explain why:

```text
  ProductGrid rendered for ""
  ProductGrid rendered for "c"
  ProductGrid rendered for "c"
  ProductGrid rendered for "ce"
  ProductGrid rendered for "ce"
  ProductGrid rendered for "cer"
```

The urgent render passed the grid the **old** value, but `ProductGrid` isn't memoized, so it rendered anyway, all 120 slow cards, for a query it had already shown. Then the background render did it again with the new value.

### 3. `useDeferredValue` with `memo`

```tsx
function SearchDeferred() {
	const [query, setQuery] = useState('')
	const deferredQuery = useDeferredValue(query)
	const stale = query !== deferredQuery
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<div style={{ opacity: stale ? 0.6 : 1 }}>
				<MemoGrid query={deferredQuery} />
			</div>
		</>
	)
}
```

```text
keystroke "c": next frame after 7 ms
keystroke "e": next frame after 1 ms
keystroke "r": next frame after 14 ms
```

```text
  ProductGrid rendered for "c"
  ProductGrid rendered for "ce"
  ProductGrid rendered for "cer"
```

Now the urgent render gives `MemoGrid` the same `query` as before, `memo` skips it, and the input paints within about one frame. The grid renders once per value, in the background, and is dimmed while it's stale.

## How it works

- **One update, two renders.** `useDeferredValue(query)` returns the old value in the urgent render and schedules a second, low-priority render with the new value.
- **The background render is interruptible.** React works in small slices and yields to the browser between them ([Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/)). If a new keystroke arrives, it abandons the stale render and starts over with the latest value. It only touches the DOM when a whole render is finished, so you never see half an update.
- **`useTransition` vs `useDeferredValue`:** use `startTransition(() => setX(…))` when you own the state update. Use `useDeferredValue(value)` when the value comes from elsewhere (props, context, a URL).
- **Deferring vs debouncing:** a debounce waits a fixed time, on every device, and the render still blocks when it finally runs. A deferred render starts immediately, adapts to the device, and can be interrupted. Debounce **network requests**; defer **rendering**.
- **It's not "faster".** The first render isn't deferred, and the total work is the same. If you can make the component itself faster, do that first.

## Common mistakes

- **Forgetting `memo` on the slow component** (recorded above).
- **Passing the deferred component new objects or functions** as props: the urgent render then fails `memo` and renders anyway ([Element Optimization](../../performance/element-optimization/)).
- **Using it to limit API calls.** It reduces rendering, not requests.

## Interview Q&A

<details class="qa"><summary>What is concurrent rendering?</summary>

React's ability to render in interruptible pieces, yielding to the browser between them, and to abandon a render when newer input arrives. The DOM changes only when a whole render is done.

</details>

<details class="qa"><summary>Urgent vs non-urgent updates?</summary>

Urgent updates reflect direct input (typing, clicking) and must feel instant. Non-urgent ones change what's shown (filtered results, a new tab) and can lag a bit. You mark non-urgent ones with `useTransition` or `useDeferredValue`.

</details>

<details class="qa"><summary>Why must the slow component be memoized for <code>useDeferredValue</code> to help?</summary>

The urgent render still renders the component that calls `useDeferredValue`, and its children with it. Only `memo`, seeing the same old prop, skips the slow child. Recorded: without `memo`, each keystroke still took over 100 ms and the grid rendered twice per keystroke; with it, about one frame or less.

</details>

<details class="qa"><summary><code>useTransition</code> or <code>useDeferredValue</code>?</summary>

`useTransition` when you call the state setter; `useDeferredValue` when you only receive the value.

</details>

<details class="qa"><summary>Deferring vs debouncing?</summary>

Debouncing delays the work by a fixed time and still blocks when it runs. Deferring starts right after the urgent render, runs in interruptible chunks, and adapts to the device's speed.

</details>

## Related

- [Element Optimization](../../performance/element-optimization/): why `memo` can skip the urgent render.
- [Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/): priorities and yielding inside React.
- [Code Splitting](../../performance/code-splitting/): transitions that avoid Suspense fallbacks.

## Sources

- react.dev: [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue), [`useTransition`](https://react.dev/reference/react/useTransition), [React 18: concurrent rendering](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
