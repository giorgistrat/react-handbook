---
title: "Code Splitting"
slug: "code-splitting"
module: "performance"
order: 3
level: "good"
illus: "plane"
summary: "lazy and Suspense load a feature’s code on demand; prefetch on hover; a transition avoids the fallback."
source: "https://react.dev/reference/react/lazy"
---


## In one minute

Every `import` at the top of a file puts that code in the page's initial JavaScript, which the browser must download, parse and run before the page works, even for features most users never open. **Code splitting** loads a feature's code on demand. The dynamic `import('./x')` returns a promise for a module, and bundlers turn each one into a separate file (a **chunk**). `lazy(() => import('./x'))` makes that into a component that **suspends** until its code arrives, with a `<Suspense>` boundary showing a fallback meanwhile. Two refinements: start the download early, when the user hovers or focuses the button (**prefetch**), and use a **transition** so React keeps the current screen instead of flashing the fallback.

**You'll be able to:** lazy-load a component, prefetch it on intent, and avoid the loading flash with `useTransition`.

<figure class="fig anim fig-perf-split-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Static import</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">lazy</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Prefetch on hover</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="3" aria-selected="false">Transition</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;size-chart.tsx evaluated&quot;,&quot;say&quot;:&quot;The chart’s code is downloaded and run &lt;b&gt;before the page even mounts&lt;/b&gt;, though most shoppers never open it.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;page mounted&quot;,&quot;say&quot;:&quot;The page appears after the extra code.&quot;,&quot;set&quot;:{&quot;b&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;chart shown&quot;,&quot;say&quot;:&quot;Clicking is instant: the code is already there.&quot;,&quot;set&quot;:{&quot;c&quot;:&quot;ok&quot;}}]" data-intro="An ordinary &lt;code&gt;import&lt;/code&gt; at the top of the page."><div class="anim-scn-title">Static import</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="a" data-s="ghost">size-chart.tsx evaluated</div><div class="an" data-k="b" data-s="ghost">page mounted</div><div class="an" data-k="c" data-s="ghost">chart shown</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>size-chart.tsx evaluated</code><span>The chart’s code is downloaded and run <b>before the page even mounts</b>, though most shoppers never open it.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>page mounted</code><span>The page appears after the extra code.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>chart shown</code><span>Clicking is instant: the code is already there.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;page mounted&quot;,&quot;say&quot;:&quot;The page mounts without the chart’s code.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;import() called&quot;,&quot;say&quot;:&quot;The first render of &lt;code&gt;SizeChart&lt;/code&gt; calls the loader…&quot;,&quot;set&quot;:{&quot;b&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;fallback shown&quot;,&quot;say&quot;:&quot;…and suspends, so the nearest &lt;code&gt;Suspense&lt;/code&gt; shows its fallback while the code downloads.&quot;,&quot;set&quot;:{&quot;c&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;size-chart.tsx evaluated&quot;,&quot;say&quot;:&quot;500 ms later the module arrives.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;chart shown&quot;,&quot;say&quot;:&quot;React retries and shows the chart.&quot;,&quot;set&quot;:{&quot;e&quot;:&quot;ok&quot;}}]" data-intro="&lt;code&gt;lazy(() =&amp;gt; import('./size-chart'))&lt;/code&gt; in &lt;code&gt;Suspense&lt;/code&gt;."><div class="anim-scn-title">lazy</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="a" data-s="ghost">page mounted</div><div class="an" data-k="b" data-s="ghost">import() called</div><div class="an" data-k="c" data-s="ghost">fallback shown</div><div class="an" data-k="d" data-s="ghost">size-chart.tsx evaluated</div><div class="an" data-k="e" data-s="ghost">chart shown</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>page mounted</code><span>The page mounts without the chart’s code.</span></li><li><span class="anim-phase ph-event">event</span><code>import() called</code><span>The first render of <code>SizeChart</code> calls the loader…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>fallback shown</code><span>…and suspends, so the nearest <code>Suspense</code> shows its fallback while the code downloads.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>size-chart.tsx evaluated</code><span>500 ms later the module arrives.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>chart shown</code><span>React retries and shows the chart.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;page mounted&quot;,&quot;say&quot;:&quot;Same start.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;import() called (hover)&quot;,&quot;say&quot;:&quot;Hovering the button starts the download early.&quot;,&quot;set&quot;:{&quot;b&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;size-chart.tsx evaluated&quot;,&quot;say&quot;:&quot;The code is ready before the click. Later &lt;code&gt;import()&lt;/code&gt; calls reuse the same module.&quot;,&quot;set&quot;:{&quot;c&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;import() called (×2)&quot;,&quot;say&quot;:&quot;The click (focus, then &lt;code&gt;lazy&lt;/code&gt;’s own first render) calls &lt;code&gt;import()&lt;/code&gt; again: no new download.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;fallback shown&quot;,&quot;say&quot;:&quot;But the fallback &lt;b&gt;still&lt;/b&gt; appeared: an &lt;code&gt;import()&lt;/code&gt; promise can’t resolve synchronously, so &lt;code&gt;lazy&lt;/code&gt;’s first render suspends anyway.&quot;,&quot;set&quot;:{&quot;e&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;chart shown&quot;,&quot;say&quot;:&quot;The chart replaces it moments later.&quot;,&quot;set&quot;:{&quot;f&quot;:&quot;ok&quot;}}]" data-intro="The same loader also runs on &lt;code&gt;mouseenter&lt;/code&gt;/&lt;code&gt;focus&lt;/code&gt;."><div class="anim-scn-title">Prefetch on hover</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="a" data-s="ghost">page mounted</div><div class="an" data-k="b" data-s="ghost">import() called (hover)</div><div class="an" data-k="c" data-s="ghost">size-chart.tsx evaluated</div><div class="an" data-k="d" data-s="ghost">import() called (×2)</div><div class="an" data-k="e" data-s="ghost">fallback shown</div><div class="an" data-k="f" data-s="ghost">chart shown</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>page mounted</code><span>Same start.</span></li><li><span class="anim-phase ph-event">event</span><code>import() called (hover)</code><span>Hovering the button starts the download early.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>size-chart.tsx evaluated</code><span>The code is ready before the click. Later <code>import()</code> calls reuse the same module.</span></li><li><span class="anim-phase ph-event">event</span><code>import() called (×2)</code><span>The click (focus, then <code>lazy</code>’s own first render) calls <code>import()</code> again: no new download.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>fallback shown</code><span>But the fallback <b>still</b> appeared: an <code>import()</code> promise can’t resolve synchronously, so <code>lazy</code>’s first render suspends anyway.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>chart shown</code><span>The chart replaces it moments later.</span></li></ol></div><div class="anim-scn" data-anim-scn="3" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;page mounted&quot;,&quot;say&quot;:&quot;Same start.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;import() called&quot;,&quot;say&quot;:&quot;Click (the hover started the download just before).&quot;,&quot;set&quot;:{&quot;b&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;pending ⏳ shown&quot;,&quot;say&quot;:&quot;A transition that suspends keeps the &lt;b&gt;current&lt;/b&gt; screen instead of a fallback. &lt;code&gt;isPending&lt;/code&gt; shows a small ⏳ in the button.&quot;,&quot;set&quot;:{&quot;c&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;size-chart.tsx evaluated&quot;,&quot;say&quot;:&quot;The code arrives.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;chart shown&quot;,&quot;say&quot;:&quot;Recorded: no “Loading size chart…” at all, the chart replaces the old screen in one step.&quot;,&quot;set&quot;:{&quot;e&quot;:&quot;ok&quot;}}]" data-intro="The click wrapped in &lt;code&gt;startTransition&lt;/code&gt;."><div class="anim-scn-title">Transition</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="a" data-s="ghost">page mounted</div><div class="an" data-k="b" data-s="ghost">import() called</div><div class="an" data-k="c" data-s="ghost">pending ⏳ shown</div><div class="an" data-k="d" data-s="ghost">size-chart.tsx evaluated</div><div class="an" data-k="e" data-s="ghost">chart shown</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>page mounted</code><span>Same start.</span></li><li><span class="anim-phase ph-event">event</span><code>import() called</code><span>Click (the hover started the download just before).</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>pending ⏳ shown</code><span>A transition that suspends keeps the <b>current</b> screen instead of a fallback. <code>isPending</code> shows a small ⏳ in the button.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>size-chart.tsx evaluated</code><span>The code arrives.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>chart shown</code><span>Recorded: no “Loading size chart…” at all, the chart replaces the old screen in one step.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Opening the size chart; its code takes 500 ms to download (all recorded).</figcaption></figure>

## The example: the size chart

Product pages have a "Size chart" button that few shoppers click. Its module logs `size-chart.tsx evaluated` when it runs. For the recordings, the dev server delays that file by 500 ms, like a slow network.

```tsx
function PageStatic() {
	const [show, setShow] = useState(false)
	return (
		<>
			<button id="show" onClick={() => setShow(true)}>Size chart</button>
			{show && <StaticSizeChart />}
		</>
	)
}
```

With a normal `import SizeChart from './size-chart'` at the top, the recorded order, from page load to clicking the button:

```text
size-chart.tsx evaluated
page mounted
chart shown
```

The chart's code ran before the page even mounted.

### 1. `lazy` + `Suspense`

```tsx
const loadSizeChart = () => (log('import() called'), import('./size-chart'))
const SizeChart = lazy(loadSizeChart)
```

```tsx
function PageLazy() {
	const [show, setShow] = useState(false)
	return (
		<>
			<button id="show" onClick={() => setShow(true)}>Size chart</button>
			<Suspense fallback={fallback}>{show && <SizeChart />}</Suspense>
		</>
	)
}
```

```text
page mounted
import() called
fallback shown
size-chart.tsx evaluated
chart shown
```

Nothing loads until `SizeChart` first renders. Then `lazy` calls the loader, the component suspends, the nearest `Suspense` shows "Loading size chart…", and React retries once the module arrives. The module must **default-export** the component (for a named export: `import('./x').then((m) => ({ default: m.SizeChart }))`), and `lazy` must be called **outside** any component, or it creates a new component (and loses state) every render.

### 2. Prefetch on hover and focus

```tsx
function PagePrefetch() {
	const [show, setShow] = useState(false)
	return (
		<>
			<button id="show" onMouseEnter={loadSizeChart} onFocus={loadSizeChart} onClick={() => setShow(true)}>
				Size chart
			</button>
			<Suspense fallback={fallback}>{show && <SizeChart />}</Suspense>
		</>
	)
}
```

Hover, wait a second, then click:

```text
page mounted
import() called
size-chart.tsx evaluated
import() called
import() called
fallback shown
chart shown
```

The download started on hover and the module ran **once**, although `import()` was called three times (hover, focus on click, and `lazy`'s own first render): modules are cached by URL. But notice `fallback shown`: even with the code already downloaded, `lazy`'s first render suspended, because an `import()` promise never resolves synchronously. The fallback was brief, but it was there.

### 3. A transition

```tsx
function PageTransition() {
	const [show, setShow] = useState(false)
	const [isPending, startTransition] = useTransition()
	return (
		<>
			<button id="show" onMouseEnter={loadSizeChart} onFocus={loadSizeChart} onClick={() => startTransition(() => setShow(true))}>
				Size chart {isPending && '⏳'}
			</button>
			<Suspense fallback={fallback}>{show && <SizeChart />}</Suspense>
		</>
	)
}
```

Clicking right away (the hover starts the download a moment before):

```text
page mounted
import() called
import() called
pending ⏳ shown
import() called
size-chart.tsx evaluated
chart shown
```

No fallback at all. When an update inside `startTransition` suspends, React keeps showing the current UI and waits; `isPending` lets you show something small (here, ⏳ in the button).

Even with the code prefetched, the pending marker appeared briefly:

```text
page mounted
import() called
size-chart.tsx evaluated
import() called
pending ⏳ shown
import() called
chart shown
```

To avoid that one-frame flicker of a pending indicator, libraries like `spin-delay` only show it if loading takes longer than a threshold (say 500 ms), and then keep it visible for a minimum time.

## How it works

- **The bundler splits at `import()`.** Vite or webpack emit the imported module, and everything only it depends on, as a separate file.
- **`lazy` caches.** It calls the loader on the first render only; the promise and the resulting component are cached, so later renders don't load again.
- **Fallbacks follow update priority.** If an urgent update (or the first mount) suspends, the nearest `Suspense` shows its fallback right away. If a transition suspends, React keeps the old UI. React also throttles reveals of suspended content (to about 300 ms) so a fast load doesn't produce a quick flash of several states.
- **Where the boundary goes matters.** The `Suspense` boundary decides what's replaced by the fallback: put it close to the lazy component, not around the whole page.

## Common mistakes

- **Calling `lazy` inside a component.** A new component type every render.
- **A named export** without the `.then((m) => ({ default: … }))` adapter.
- **Splitting tiny components.** Each chunk is an extra request; split features and routes, not buttons.
- **No prefetch for likely actions.** The user waits at the worst moment, right after they asked.

## Interview Q&A

<details class="qa"><summary>What is code splitting?</summary>

Splitting the JavaScript bundle so each screen downloads only the code it needs, loading the rest on demand with dynamic `import()`. Recorded: with a static import, the size chart's code ran before the page mounted; with `lazy`, only after the click.

</details>

<details class="qa"><summary>How does <code>React.lazy</code> work?</summary>

`lazy(load)` returns a component. On its first render it calls `load()`; until the promise resolves it suspends, so the nearest `Suspense` shows its fallback. The resolved module's `default` export is the component, and both are cached.

</details>

<details class="qa"><summary>Does calling <code>import()</code> several times download the module several times?</summary>

No. Modules are cached by URL. Recorded: three `import()` calls, one `size-chart.tsx evaluated`.

</details>

<details class="qa"><summary>Why might the fallback still flash after prefetching?</summary>

`lazy`'s first render always suspends, because an `import()` promise can't resolve synchronously, even from cache. Recorded: `fallback shown` after a prefetch that had finished.

</details>

<details class="qa"><summary>How do you avoid the fallback?</summary>

Make the update a transition: `startTransition(() => setShow(true))`. React keeps the current UI while the new one suspends, and `isPending` tells you it's waiting. Recorded: no fallback, just the ⏳ marker.

</details>

## Related

- [Concurrent Rendering](../../performance/concurrent-rendering/): transitions and priorities.
- [Error Boundaries](../../fundamentals/error-boundaries/): handle a chunk that fails to load.

## Sources

- react.dev: [`lazy`](https://react.dev/reference/react/lazy), [`Suspense`](https://react.dev/reference/react/Suspense), [`useTransition`](https://react.dev/reference/react/useTransition)
- MDN: [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [spin-delay](https://github.com/smeijer/spin-delay): delaying pending indicators
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
