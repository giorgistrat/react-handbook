---
title: "useDeferredValue with Suspense"
slug: "deferred-search"
module: "suspense"
order: 4
level: "good"
illus: "list"
summary: "A search box that stays responsive while results load; a transition around the input loses keystrokes (recorded)."
source: "https://react.dev/reference/react/useDeferredValue"
---


## In one minute

A search box whose results come from the server has two jobs that pull against each other: the **input** must update on every keystroke, and the **results** must wait for the server. Putting `setQuery` in `startTransition` makes the results wait without a fallback, but it also makes the *input's own value* wait, and React puts the old value back in the box: typed letters get lost. The fix is to keep the query **urgent** and defer only the results: `const deferredQuery = useDeferredValue(query)`. The input renders immediately; the results render in the background with the new value, and if that suspends, React keeps showing the previous results (dim them with `query !== deferredQuery`).

**You'll be able to:** keep a search input responsive over Suspense-driven results, and explain why a transition around the input misbehaves.

<figure class="fig anim fig-suspense-search-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">startTransition</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useDeferredValue</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;after \&quot;l\&quot; the input shows \&quot;\&quot;&quot;,&quot;say&quot;:&quot;The input’s own value is in transition state, which waits for the results. React puts the old value back in the box.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;bad&quot;,&quot;scr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;input: \&quot;\&quot;&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;after \&quot;a\&quot; the input shows \&quot;\&quot;&quot;,&quot;say&quot;:&quot;The second key lands in an empty box, so the query becomes “a”, not “la”.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;bad&quot;,&quot;scr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;input: \&quot;\&quot;&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;→ GET /search?q=a&quot;,&quot;say&quot;:&quot;Recorded: the box ended up containing “a”. The typed “l” was lost.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;bad&quot;,&quot;scr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;input: \&quot;a\&quot;&quot;}}]" data-intro="&lt;code&gt;startTransition(() =&amp;gt; setQuery(value))&lt;/code&gt;."><div class="anim-scn-title">startTransition</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">after "l" the input shows ""</div><div class="an" data-k="l1" data-s="ghost">after "a" the input shows ""</div><div class="an" data-k="l2" data-s="ghost">→ GET /search?q=a</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">input: ""</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>after "l" the input shows ""</code><span>The input’s own value is in transition state, which waits for the results. React puts the old value back in the box.</span></li><li><span class="anim-phase ph-event">event</span><code>after "a" the input shows ""</code><span>The second key lands in an empty box, so the query becomes “a”, not “la”.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>→ GET /search?q=a</code><span>Recorded: the box ended up containing “a”. The typed “l” was lost.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;after \&quot;l\&quot; the input shows \&quot;l\&quot;&quot;,&quot;say&quot;:&quot;The urgent render updates the input right away; the results get the old deferred value, so nothing suspends.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;input: \&quot;l\&quot;&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;6 results for \&quot;\&quot; (dimmed)&quot;,&quot;say&quot;:&quot;The background render with the new value suspends; React keeps the old results, which you can dim with &lt;code&gt;query !== deferredQuery&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;after \&quot;a\&quot; the input shows \&quot;la\&quot;&quot;,&quot;say&quot;:&quot;Typing continues normally.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;input: \&quot;la\&quot;&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;+400 ms  1 result for \&quot;la\&quot;&quot;,&quot;say&quot;:&quot;The latest results replace the stale ones; the in-between query “l” was never shown.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;ok&quot;}}]" data-intro="&lt;code&gt;query&lt;/code&gt; stays urgent; the results use &lt;code&gt;useDeferredValue(query)&lt;/code&gt;."><div class="anim-scn-title">useDeferredValue</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">after "l" the input shows "l"</div><div class="an" data-k="l1" data-s="ghost">6 results for "" (dimmed)</div><div class="an" data-k="l2" data-s="ghost">after "a" the input shows "la"</div><div class="an" data-k="l3" data-s="ghost">+400 ms  1 result for "la"</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">input: ""</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>after "l" the input shows "l"</code><span>The urgent render updates the input right away; the results get the old deferred value, so nothing suspends.</span></li><li><span class="anim-phase ph-render">render phase</span><code>6 results for "" (dimmed)</code><span>The background render with the new value suspends; React keeps the old results, which you can dim with <code>query !== deferredQuery</code>.</span></li><li><span class="anim-phase ph-event">event</span><code>after "a" the input shows "la"</code><span>Typing continues normally.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>+400 ms  1 result for "la"</code><span>The latest results replace the stale ones; the in-between query “l” was never shown.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Typing “la” quickly; each search takes 400 ms (both recorded).</figcaption></figure>

## The example: product search

Each search takes the server 400 ms and is cached by query. The recordings type "l" and "a" 120 ms apart, and log what the input showed on the next frame after each key.

```tsx
function Results({ query }: { query: string }) {
	const products = use(search(query))
	return <p data-details={`${products.length} result${products.length === 1 ? "" : "s"} for "${query}"`}>{products.map((p) => p.name).join(', ')}</p>
}
```

### 1. The query in a transition

```tsx
function SearchTransition() {
	const [query, setQuery] = useState('')
	const [, startTransition] = useTransition()
	return (
		<>
			<input id="search" value={query} onChange={(e) => startTransition(() => setQuery(e.target.value))} />
			<Suspense fallback={<p data-fallback>Searching…</p>}>
				<Results query={query} />
			</Suspense>
		</>
	)
}
```

```text
  after "l" the input shows ""
500 ms  → GET /search?q=l
  after "a" the input shows ""
650 ms  → GET /search?q=a
900 ms  ← GET /search?q=l
1050 ms  ← GET /search?q=a
screen: details: 5 results for "a"
```

The box stayed empty after both keys, and the second search went out for "a", not "la". The input's `value` comes from `query`, which only changes when the transition finishes, and that waits for the results. Meanwhile React re-rendered the controlled input with the old value, wiping the "l". The box ended up containing:

```text
a
```

### 2. The results deferred

```tsx
function SearchDeferred() {
	const [query, setQuery] = useState('')
	const deferredQuery = useDeferredValue(query)
	const isStale = query !== deferredQuery
	return (
		<>
			<input id="search" value={query} onChange={(e) => setQuery(e.target.value)} />
			<div style={{ opacity: isStale ? 0.6 : 1 }} data-stale={isStale || undefined}>
				<Suspense fallback={<p data-fallback>Searching…</p>}>
					<Results query={deferredQuery} />
				</Suspense>
			</div>
		</>
	)
}
```

```text
screen: details: 6 results for "" (dimmed)
  after "l" the input shows "l"
550 ms  → GET /search?q=l
  after "a" the input shows "la"
650 ms  → GET /search?q=la
950 ms  ← GET /search?q=l
1050 ms  ← GET /search?q=la
screen: details: 1 result for "la"
```

The input showed every letter immediately. The old results stayed (dimmed) while the new ones loaded, and the in-between search for "l" was never displayed: the background render for "l" was replaced by the newer one for "la".

## How it works

- **One state change, two renders.** With `useDeferredValue`, a keystroke first renders with the new `query` and the **old** `deferredQuery` (urgent: the input updates; the results get the same props as before, nothing suspends). Then React renders again in the background with the new `deferredQuery`.
- **If the background render suspends,** React keeps what's on screen instead of showing the fallback, the same rule as transitions ([Promise Caching and Transitions](../../suspense/promise-caching/)). The first render has no old value, so the initial load still shows the fallback.
- **Stale or not?** `query !== deferredQuery` is true exactly while the results are behind; use it to dim them.
- **`useTransition` vs `useDeferredValue`:** use `useTransition` when you own an update that shouldn't block (a tab switch). Use `useDeferredValue` when one value has both an urgent use (the input) and a slow one (the results).

## Common mistakes

- **A transition around a controlled input's state** (recorded: lost keystrokes).
- **Passing the urgent `query` to the results** as well as the deferred one: then the urgent render suspends.
- **Expecting it to reduce requests.** Every value that reaches the background render may start a request; debounce the requests if that matters.

## Interview Q&A

<details class="qa"><summary>What does <code>useDeferredValue</code> do?</summary>

It returns the previous value during urgent renders and schedules a background render with the new one. Parts that use the deferred value can lag behind without blocking the parts that use the current one.

</details>

<details class="qa"><summary>Why not just wrap <code>setQuery</code> in <code>startTransition</code>?</summary>

The input's own value is that state. In a transition it doesn't update until the results are ready, and React resets the controlled input to the old value. Recorded: typing "la" left "a" in the box.

</details>

<details class="qa"><summary>What does the user see while the deferred results load?</summary>

The previous results, because React keeps revealed content when a background render suspends. Recorded: "6 results for """ dimmed until "la" arrived.

</details>

<details class="qa"><summary>How do you know the results are stale?</summary>

`query !== deferredQuery`.

</details>

<details class="qa"><summary>Is it the same as debouncing?</summary>

No. Debouncing waits a fixed time before doing anything. A deferred value starts the background render immediately and abandons it if newer input arrives, so on a fast device and network it's instant.

</details>

## Related

- [Concurrent Rendering](../../performance/concurrent-rendering/): `useDeferredValue` for slow rendering instead of slow data.
- [Promise Caching and Transitions](../../suspense/promise-caching/): caching search promises, and transitions.
- [Inputs](../../fundamentals/inputs/): controlled inputs.

## Sources

- react.dev: [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue) (showing stale content while fresh content is loading), [`useTransition`](https://react.dev/reference/react/useTransition#i-cant-use-a-transition-for-controlling-a-text-input)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
