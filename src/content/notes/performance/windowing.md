---
title: "Windowing"
slug: "windowing"
module: "performance"
order: 6
level: "good"
illus: "map"
summary: "Render only the visible rows of a 10,000-item list with @tanstack/react-virtual."
source: "https://tanstack.com/virtual/latest"
---


## In one minute

Some lists are slow even when every row is cheap and memoized: there are simply **too many** of them. React creates and compares an element per row, and the browser styles, lays out and paints a DOM node per row. **Windowing** (or **virtualization**) renders only the rows in view, plus a few extra (**overscan**), inside a tall spacer that gives the scrollbar the full list's height. As you scroll, rows leaving the window unmount and new ones mount. With `@tanstack/react-virtual`, you give `useVirtualizer` the row count, the scroll container and a size estimate, and render what `getVirtualItems()` returns.

**You'll be able to:** virtualize a long list, explain the spacer-and-offset layout, and name what you give up.

<figure class="fig anim fig-perf-windowing-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Render everything</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useVirtualizer</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;mount&quot;,&quot;say&quot;:&quot;React creates 10,000 elements and 10,000 DOM nodes, though only 13 fit in the box.&quot;,&quot;set&quot;:{&quot;top&quot;:&quot;bad&quot;,&quot;dom&quot;:&quot;bad&quot;,&quot;ms&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;&amp;lt;li&amp;gt; in DOM: 10,000&quot;,&quot;ms&quot;:&quot;mount: ~80 ms&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Refresh&quot;,&quot;say&quot;:&quot;Every re-render of the list repeats the work for all 10,000 rows.&quot;,&quot;set&quot;:{&quot;ms&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;ms&quot;:&quot;update: ~80 ms&quot;}}]" data-intro="&lt;code&gt;products.map(…)&lt;/code&gt;."><div class="anim-scn-title">Render everything</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">scroll container (300 px)</div><div class="a-col"><span class="an chip-a" data-k="top" data-s="faint">10,000 &lt;li&gt; in the DOM</span><span class="an chip-a" data-k="vis" data-s="faint">rows 0–12 visible</span></div></div><div class="a-panel "><div class="a-panel-title">recorded</div><div class="a-col"><span class="an chip-a" data-k="dom" data-s="faint">&lt;li&gt; in DOM: ?</span><span class="an chip-a" data-k="ms" data-s="faint">render: ?</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>mount</code><span>React creates 10,000 elements and 10,000 DOM nodes, though only 13 fit in the box.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Refresh</code><span>Every re-render of the list repeats the work for all 10,000 rows.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;getVirtualItems()&quot;,&quot;say&quot;:&quot;From the scroll position, the box height and the row size, the virtualizer computes which rows are visible (plus 5 extra). A tall inner element keeps the scrollbar right.&quot;,&quot;set&quot;:{&quot;top&quot;:&quot;ok&quot;,&quot;vis&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;mount&quot;,&quot;say&quot;:&quot;Recorded: 18 rows in the DOM, mounted in ~3 ms.&quot;,&quot;set&quot;:{&quot;dom&quot;:&quot;ok&quot;,&quot;ms&quot;:&quot;ok&quot;,&quot;vis&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;&amp;lt;li&amp;gt; in DOM: 18&quot;,&quot;ms&quot;:&quot;mount: ~3 ms&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;scroll to row 5,000&quot;,&quot;say&quot;:&quot;Rows that leave the window unmount, new ones mount, each placed with &lt;code&gt;translateY(row.start)&lt;/code&gt;. Recorded: 23 rows in the DOM, first visible “Velvet Kettle 35”, the same row as the full list.&quot;,&quot;set&quot;:{&quot;vis&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;vis&quot;:&quot;rows 5,000–5,012 visible&quot;,&quot;dom&quot;:&quot;&amp;lt;li&amp;gt; in DOM: 23&quot;}}]" data-intro="&lt;code&gt;@tanstack/react-virtual&lt;/code&gt;, 24 px rows, overscan 5."><div class="anim-scn-title">useVirtualizer</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">scroll container (300 px)</div><div class="a-col"><span class="an chip-a" data-k="top" data-s="faint">spacer: 240,000 px tall</span><span class="an chip-a" data-k="vis" data-s="faint">rows 0–12 visible</span></div></div><div class="a-panel "><div class="a-panel-title">recorded</div><div class="a-col"><span class="an chip-a" data-k="dom" data-s="faint">&lt;li&gt; in DOM: ?</span><span class="an chip-a" data-k="ms" data-s="faint">render: ?</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>getVirtualItems()</code><span>From the scroll position, the box height and the row size, the virtualizer computes which rows are visible (plus 5 extra). A tall inner element keeps the scrollbar right.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>mount</code><span>Recorded: 18 rows in the DOM, mounted in ~3 ms.</span></li><li><span class="anim-phase ph-event">event</span><code>scroll to row 5,000</code><span>Rows that leave the window unmount, new ones mount, each placed with <code>translateY(row.start)</code>. Recorded: 23 rows in the DOM, first visible “Velvet Kettle 35”, the same row as the full list.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The whole catalog, 10,000 products, in one scrolling list (both recorded with React’s &lt;Profiler&gt;).</figcaption></figure>

## The example: the whole catalog

The catalog page lists all 10,000 products in a 300 px box. React's `<Profiler>` reports how long rendering the list took:

```tsx
<Profiler id="list" onRender={(_id, phase, actualDuration) => log(`${phase}: React spent ${Math.round(actualDuration)} ms rendering the list`)}>
	<List />
</Profiler>
```

### 1. Render everything

```tsx
function ListAll() {
	return (
		<div className="scroller">
			<ul>
				{products.map((p) => (
					<li key={p.id}>{p.name}</li>
				))}
			</ul>
		</div>
	)
}
```

```js
{
  "mount": [
    "mount: React spent 75 ms rendering the list"
  ],
  "rowsInDom": 10000,
  "refresh": [
    "update: React spent 73 ms rendering the list"
  ],
  "afterScroll": {
    "rowsInDom": 10000,
    "firstVisible": "Velvet Kettle 35"
  }
}
```

10,000 rows in the DOM, about 13 visible, and every re-render (the "Refresh" button) redoes all of them.

### 2. Virtualized

```tsx
function ListVirtual() {
	const scrollerRef = useRef<HTMLDivElement>(null)
	const virtualizer = useVirtualizer({
		count: products.length,
		getScrollElement: () => scrollerRef.current,
		estimateSize: () => 24, // px per row
		overscan: 5, // extra rows above and below the visible ones
	})
	return (
		<div ref={scrollerRef} className="scroller">
			<ul style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
				{virtualizer.getVirtualItems().map((row) => (
					<li
						key={row.key}
						data-index={row.index}
						style={{ position: 'absolute', top: 0, width: '100%', height: row.size, transform: `translateY(${row.start}px)` }}
					>
						{products[row.index].name}
					</li>
				))}
			</ul>
		</div>
	)
}
```

```js
{
  "mount": [
    "mount: React spent 2 ms rendering the list",
    "nested-update: React spent 1 ms rendering the list"
  ],
  "rowsInDom": 18,
  "refresh": [
    "update: React spent 0 ms rendering the list"
  ],
  "afterScroll": {
    "rowsInDom": 23,
    "firstVisible": "Velvet Kettle 35"
  }
}
```

18 rows in the DOM at the top (13 visible + 5 overscan below), 23 after scrolling to row 5,000 (overscan on both sides). The first visible product after the scroll was the same in both versions, so the scroll position and order are exact. (`nested-update` is the virtualizer measuring the container after mount and rendering once more.)

## How it works

- **The math:** from `scrollTop`, the container height and each row's size, the virtualizer computes the first and last visible indexes. `getTotalSize()` is the full height (10,000 × 24 px), set on an inner element so the scrollbar is right.
- **Rows are absolutely positioned** at `translateY(row.start)`. `transform` doesn't trigger layout for the other rows and is cheap to animate.
- **It re-renders on scroll**, but only when the visible range changes, and only those ~20 rows.
- **Variable heights:** pass a better `estimateSize` and let it measure real rows with `measureElement`.

## What you give up

- **In-page find (⌘F / Ctrl+F)** can't find rows that aren't in the DOM.
- **Screen readers** see only the rendered rows. Use `aria-setsize` and `aria-posinset` if the total matters.
- **Keyboard navigation** to an off-screen item needs `scrollToIndex` before focusing.
- **Scroll restoration and anchor links** need extra work.

## When to use it

Measure. A common rule of thumb: consider it when a view renders several hundred repeated rows, the DOM grows past roughly 1,500 nodes, or scrolling visibly janks. Below that, [Optimize Rendering](../../performance/optimize-rendering/) (memoized rows) is usually enough, and pagination or "load more" can be simpler still.

## Common mistakes

- **Forgetting the spacer height or the `position: relative` container.** Rows overlap or the scrollbar is wrong.
- **Keying rows by index** when the list can reorder: use `row.key` from the virtualizer, or the item's id.
- **A container without a fixed height or `overflow: auto`.** Nothing scrolls, so everything is "visible".

## Interview Q&A

<details class="qa"><summary>What is windowing?</summary>

Rendering only the visible part of a long list (plus a little overscan), with a spacer that keeps the full scroll height, and swapping rows in and out as the user scrolls. Recorded: 18 rows in the DOM instead of 10,000.

</details>

<details class="qa"><summary>Why is a long list slow even if each row is memoized?</summary>

`memo` skips calling each row, but the parent still creates and React still compares an element per row, and the browser still lays out every DOM node. Recorded: rendering all 10,000 rows took tens of milliseconds on every update; the virtualized list, a few.

</details>

<details class="qa"><summary>What does <code>useVirtualizer</code> need?</summary>

`count`, `getScrollElement` (the scrolling element) and `estimateSize` (a row's size). You render `getVirtualItems()`, positioned with each item's `start`, inside an element of height `getTotalSize()`.

</details>

<details class="qa"><summary>What's overscan?</summary>

Extra rows rendered just outside the viewport so fast scrolling doesn't show blank space before React catches up.

</details>

<details class="qa"><summary>What do you lose?</summary>

Browser find-in-page, full screen-reader context, simple keyboard navigation to off-screen items, and easy scroll restoration.

</details>

## Related

- [Optimize Rendering](../../performance/optimize-rendering/): memoize rows first.
- [Concurrent Rendering](../../performance/concurrent-rendering/): keep input responsive while a big list renders.

## Sources

- [TanStack Virtual](https://tanstack.com/virtual/latest) (`@tanstack/react-virtual`)
- web.dev: [Virtualize large lists](https://web.dev/articles/virtualize-long-lists-react-window), [Avoid an excessive DOM size](https://developer.chrome.com/docs/lighthouse/performance/dom-size)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
