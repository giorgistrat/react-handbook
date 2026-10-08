---
title: "DOM Refs and Effect Dependencies"
slug: "dom-refs-and-effect-dependencies"
module: "hooks"
order: 4
level: "must"
illus: "eye"
summary: "useRef and ref callbacks for real DOM nodes, and why object dependencies make effects re-run."
source: "https://react.dev/reference/react/useRef"
---


## In one minute

JSX creates element objects, not DOM nodes, so during render there's no node to hand to a non-React library. React gives you the real node through the **`ref`** prop: either a **ref callback** (React calls it with the node and calls its returned cleanup when the node goes away) or a **`useRef`** object whose `.current` React fills in. When you set something up from an effect, the **dependency array** decides when it's torn down and redone, and React compares each dependency with `Object.is`: numbers and strings by value, objects and functions by identity. An object created during render is "new" every time.

**You'll be able to:** connect a DOM library to React, and keep its effect from re-running on unrelated renders.

<figure class="fig anim fig-hooks-deps-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">[options] (object)</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">[scale, speed]</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Quantity”&quot;,&quot;say&quot;:&quot;An unrelated state change re-renders the product.&quot;,&quot;set&quot;:{&quot;next&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const options = { scale, speed }&quot;,&quot;say&quot;:&quot;The render creates a &lt;b&gt;new&lt;/b&gt; object with the same contents.&quot;,&quot;set&quot;:{&quot;next&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;Object.is(oldOptions, newOptions) → false&quot;,&quot;say&quot;:&quot;Objects are compared by identity. Recorded: &lt;code&gt;Object.is(a, b) → false&lt;/code&gt; for two equal objects.&quot;,&quot;set&quot;:{&quot;cmp&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;cleanup → effect&quot;,&quot;say&quot;:&quot;So React tears the zoom down and sets it up again on every click. Recorded: &lt;code&gt;zoom destroyed&lt;/code&gt;, &lt;code&gt;attachZoom(scale 1.2)&lt;/code&gt; twice for two clicks.&quot;,&quot;set&quot;:{&quot;zoom&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;zoom&quot;:&quot;destroyed + attached again&quot;}}]" data-intro="&lt;code&gt;useEffect(…, [options])&lt;/code&gt; with an object built during render."><div class="anim-scn-title">[options] (object)</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">dependencies</div><div class="a-col"><span class="an chip-a" data-k="prev">render 1: [{ scale: 1.2, speed: 300 }]</span><span class="an chip-a" data-k="next" data-s="ghost">render 2: [{ scale: 1.2, speed: 300 }]</span></div></div><div class="a-panel "><div class="a-panel-title">React’s check</div><div class="a-col"><span class="an chip-a" data-k="cmp" data-s="faint">Object.is(prev[i], next[i])</span></div></div><div class="a-panel "><div class="a-panel-title">zoom library</div><div class="a-col"><span class="an chip-a" data-k="zoom" data-s="ok">attachZoom(scale 1.2)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click “Quantity”</code><span>An unrelated state change re-renders the product.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const options = { scale, speed }</code><span>The render creates a <b>new</b> object with the same contents.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>Object.is(oldOptions, newOptions) → false</code><span>Objects are compared by identity. Recorded: <code>Object.is(a, b) → false</code> for two equal objects.</span></li><li><span class="anim-phase ph-effect">effects</span><code>cleanup → effect</code><span>So React tears the zoom down and sets it up again on every click. Recorded: <code>zoom destroyed</code>, <code>attachZoom(scale 1.2)</code> twice for two clicks.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Quantity”&quot;,&quot;say&quot;:&quot;Same unrelated re-render.&quot;,&quot;set&quot;:{&quot;next&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;[scale, speed] = [1.2, 300]&quot;,&quot;say&quot;:&quot;The dependencies are plain numbers.&quot;,&quot;set&quot;:{&quot;next&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;Object.is(1.2, 1.2) → true&quot;,&quot;say&quot;:&quot;Numbers compare by value, so nothing “changed”.&quot;,&quot;set&quot;:{&quot;cmp&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;effect skipped&quot;,&quot;say&quot;:&quot;Recorded: no log at all for the two clicks. Only “Bigger zoom” (scale 1.5) re-ran it.&quot;,&quot;set&quot;:{&quot;zoom&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;zoom&quot;:&quot;untouched&quot;}}]" data-intro="&lt;code&gt;useEffect(…, [scale, speed])&lt;/code&gt;, building the object inside the effect."><div class="anim-scn-title">[scale, speed]</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">dependencies</div><div class="a-col"><span class="an chip-a" data-k="prev">render 1: [1.2, 300]</span><span class="an chip-a" data-k="next" data-s="ghost">render 2: [1.2, 300]</span></div></div><div class="a-panel "><div class="a-panel-title">React’s check</div><div class="a-col"><span class="an chip-a" data-k="cmp" data-s="faint">Object.is(prev[i], next[i])</span></div></div><div class="a-panel "><div class="a-panel-title">zoom library</div><div class="a-col"><span class="an chip-a" data-k="zoom" data-s="ok">attachZoom(scale 1.2)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click “Quantity”</code><span>Same unrelated re-render.</span></li><li><span class="anim-phase ph-render">render phase</span><code>[scale, speed] = [1.2, 300]</code><span>The dependencies are plain numbers.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>Object.is(1.2, 1.2) → true</code><span>Numbers compare by value, so nothing “changed”.</span></li><li><span class="anim-phase ph-effect">effects</span><code>effect skipped</code><span>Recorded: no log at all for the two clicks. Only “Bigger zoom” (scale 1.5) re-ran it.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Effect dependencies are compared with <code>Object.is</code>, item by item.</figcaption></figure>

## The example: zoom on hover

The product page uses a tiny plain-JavaScript library, `attachZoom(node, options)`, which enlarges a product photo on hover and returns a function that removes it. It logs `attachZoom(scale …)` and `zoom destroyed`. The page also has a quantity button (unrelated state) and a "Bigger zoom" button (changes `scale`).

### 1. An inline ref callback

```tsx
function ZoomCallbackRef({ scale, speed }: ZoomOptions) {
	return (
		<img
			alt="Ceramic Mug"
			ref={(node) => {
				if (!node) return
				return attachZoom(node, { scale, speed })
			}}
		/>
	)
}
```

Clicking the quantity button twice:

```text
  zoom destroyed
  attachZoom(scale 1.2)
  zoom destroyed
  attachZoom(scale 1.2)
```

The callback is a **new function** each render, so React detaches the old one (running its cleanup) and attaches the new one. Every unrelated render rebuilt the zoom.

### 2. `useRef` + an effect that depends on an object

```tsx
function ZoomObjectDep({ scale, speed }: ZoomOptions) {
	const ref = useRef<HTMLImageElement>(null)
	const options = { scale, speed } // a new object on every render
	useEffect(() => attachZoom(ref.current!, options), [options])
	return <img alt="Ceramic Mug" ref={ref} />
}
```

```text
  zoom destroyed
  attachZoom(scale 1.2)
  zoom destroyed
  attachZoom(scale 1.2)
```

Same problem, different cause: `options` is a new object every render, and React compares dependencies by identity:

```tsx
const a = { scale: 1.2, speed: 300 }
const b = { scale: 1.2, speed: 300 }
log('Object.is(a, b) →', Object.is(a, b), '· Object.is(1.2, 1.2) →', Object.is(1.2, 1.2))
```

```text
Object.is(a, b) → false · Object.is(1.2, 1.2) → true
```

### 3. Depend on the primitives

```tsx
function ZoomPrimitiveDeps({ scale, speed }: ZoomOptions) {
	const ref = useRef<HTMLImageElement>(null)
	useEffect(() => attachZoom(ref.current!, { scale, speed }), [scale, speed])
	return <img alt="Ceramic Mug" ref={ref} />
}
```

Two quantity clicks logged nothing at all:

```js
[]
```

"Bigger zoom" changed `scale`, so the effect re-ran exactly once:

```text
  zoom destroyed
  attachZoom(scale 1.5)
```

The object is now built **inside** the effect, where its freshness doesn't matter.

## How it works

- **Ref objects** are the same object for the component's whole life; changing `.current` doesn't re-render. Besides DOM nodes they can hold any value you need between renders without displaying it (a timer id, the previous value).
- **Ref callbacks** run when the node is attached; in React 19 the function they return runs when it's detached. They're a good fit for "do something when this node appears", as long as the callback is stable (defined outside the component or memoized), otherwise they re-run every render, as recorded above.
- **Dependencies are compared one by one with `Object.is`.** Prefer primitive dependencies; if you must depend on an object or function, keep it stable with `useMemo`/`useCallback` or create it inside the effect.
- **Don't silence the lint rule** (`react-hooks/exhaustive-deps`). A missing dependency is usually a stale-closure bug waiting to happen ([React Re-rendering](../../hooks/react-re-rendering/)).

## Common mistakes

- Reading `ref.current` during render: it's `null` on the first render and doesn't trigger updates.
- Objects, arrays or inline functions in dependency arrays.
- Inline ref callbacks that set up expensive things.

## Interview Q&A

<details class="qa"><summary>Why can't you grab a DOM node directly inside a component?</summary>

During render there isn't one. JSX returns element objects; React creates or updates DOM nodes later, in the commit. The `ref` prop is how React hands you the node once it exists.

</details>

<details class="qa"><summary>Why did the inline ref callback reset the zoom on unrelated clicks?</summary>

A new arrow function is created on every render. React treats a different ref callback as a different ref: it calls the old one's cleanup and the new one. Recorded: two quantity clicks → two `zoom destroyed` / `attachZoom` pairs.

</details>

<details class="qa"><summary>Why does an effect with <code>[options]</code> re-run every render?</summary>

Dependencies are compared with `Object.is`, which compares objects by identity. `{ scale, speed }` built during render is a new object each time. Recorded: `Object.is(a, b) → false` for two equal objects.

</details>

<details class="qa"><summary>What's the fix?</summary>

Depend on the primitive values (`[scale, speed]`) and build the object inside the effect, or memoize the object. Recorded: no re-runs for unrelated clicks; one re-run when `scale` changed.

</details>

<details class="qa"><summary>What is a ref besides a DOM handle?</summary>

A mutable box that persists across renders and doesn't cause a re-render when changed, for values the UI doesn't display.

</details>

## Related

- [Side Effects](../../hooks/side-effects/): effects and cleanup.
- [React Re-rendering](../../hooks/react-re-rendering/): identity, `useMemo` and `useCallback`.

## Sources

- react.dev: [`useRef`](https://react.dev/reference/react/useRef), [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs), [Ref callbacks](https://react.dev/reference/react-dom/components/common#ref-callback), [Removing effect dependencies](https://react.dev/learn/removing-effect-dependencies)
- Dominik Dorfmeister (TkDodo), [Avoiding useEffect with callback refs](https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
