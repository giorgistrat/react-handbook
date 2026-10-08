---
title: "The Latest Ref Pattern"
slug: "latest-ref"
module: "patterns"
order: 1
level: "good"
illus: "loop"
summary: "A function built once that still calls the newest callback: debounce done right, and useEffectEvent."
source: "https://epicreact.dev/the-latest-ref-pattern-in-react"
---


## In one minute

Each render's functions see **that render's** props and state. Usually that's a feature: an async handler can't suddenly see values from a later render. But some functions are **created once and called much later**: a debounced save, a timer callback, a subscription. They need the *latest* values when they run. The latest ref pattern keeps the newest callback in a ref (`callbackRef.current = callback` after every render), and the long-lived function calls `callbackRef.current(...)` at call time. Its identity stays stable, but it always runs the newest code. Inside effects, React 19.2's `useEffectEvent` does the same job for you.

**You'll be able to:** write a `useDebounce` hook that neither fires too often nor saves stale values, and know when to use `useEffectEvent` instead.

<figure class="fig anim fig-patterns-latest-ref-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">[callback, delay]</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">[delay]</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Latest ref</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;debouncedSave(\&quot;G\&quot;)&quot;,&quot;say&quot;:&quot;The first keystroke starts a 300 ms timer inside debounced function #1.&quot;,&quot;set&quot;:{&quot;k1&quot;:&quot;hl&quot;,&quot;tm&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;tm&quot;:&quot;pending timers: 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useMemo deps: [callback, delay]&quot;,&quot;say&quot;:&quot;&lt;code&gt;setNote&lt;/code&gt; re-renders. &lt;code&gt;saveNote&lt;/code&gt; is a new function, so &lt;code&gt;useMemo&lt;/code&gt; builds a &lt;b&gt;new&lt;/b&gt; debounced function, with its own empty timer.&quot;,&quot;set&quot;:{&quot;k1&quot;:&quot;&quot;,&quot;fn&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;fn&quot;:&quot;debounced function #2 (new)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;\&quot;Gi\&quot;, \&quot;Gif\&quot;, \&quot;Gift\&quot;&quot;,&quot;say&quot;:&quot;Each keystroke calls the newest function, which can’t cancel the timers the older ones started.&quot;,&quot;set&quot;:{&quot;k2&quot;:&quot;hl&quot;,&quot;k3&quot;:&quot;hl&quot;,&quot;k4&quot;:&quot;hl&quot;,&quot;tm&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;fn&quot;:&quot;debounced function #5&quot;,&quot;tm&quot;:&quot;pending timers: 4&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;300 ms later&quot;,&quot;say&quot;:&quot;Recorded: four saves: “G”, “Gi”, “Gif”, “Gift”.&quot;,&quot;set&quot;:{&quot;k2&quot;:&quot;&quot;,&quot;k3&quot;:&quot;&quot;,&quot;k4&quot;:&quot;&quot;,&quot;out&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;out&quot;:&quot;4 saves&quot;}}]" data-intro="Rebuild the debounced function when the callback changes."><div class="anim-scn-title">[callback, delay]</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">keystrokes (60 ms apart)</div><div class="a-col"><span class="an chip-a" data-k="k1" data-s="faint">"G"</span><span class="an chip-a" data-k="k2" data-s="faint">"Gi"</span><span class="an chip-a" data-k="k3" data-s="faint">"Gif"</span><span class="an chip-a" data-k="k4" data-s="faint">"Gift"</span></div></div><div class="a-panel "><div class="a-panel-title">useMemo(…, [callback, delay])</div><div class="a-col"><span class="an chip-a" data-k="fn" data-s="faint">debounced function #1</span><span class="an chip-a" data-k="tm" data-s="faint">pending timers: 0</span></div></div><div class="a-panel "><div class="a-panel-title">saved (recorded)</div><div class="a-col"><span class="an chip-a" data-k="out" data-s="ghost">nothing yet</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>debouncedSave("G")</code><span>The first keystroke starts a 300 ms timer inside debounced function #1.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useMemo deps: [callback, delay]</code><span><code>setNote</code> re-renders. <code>saveNote</code> is a new function, so <code>useMemo</code> builds a <b>new</b> debounced function, with its own empty timer.</span></li><li><span class="anim-phase ph-event">event</span><code>"Gi", "Gif", "Gift"</code><span>Each keystroke calls the newest function, which can’t cancel the timers the older ones started.</span></li><li><span class="anim-phase ph-effect">effects</span><code>300 ms later</code><span>Recorded: four saves: “G”, “Gi”, “Gif”, “Gift”.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;pick Desk Lamp, then type&quot;,&quot;say&quot;:&quot;The debounced function is built &lt;b&gt;once&lt;/b&gt; (deps &lt;code&gt;[delay]&lt;/code&gt;), so the timer is reused and cancelled correctly.&quot;,&quot;set&quot;:{&quot;k1&quot;:&quot;hl&quot;,&quot;k2&quot;:&quot;hl&quot;,&quot;k3&quot;:&quot;hl&quot;,&quot;k4&quot;:&quot;hl&quot;,&quot;fn&quot;:&quot;keep&quot;,&quot;tm&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;tm&quot;:&quot;pending timers: 1&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;saveNote from render 1&quot;,&quot;say&quot;:&quot;But it wraps the &lt;code&gt;saveNote&lt;/code&gt; from the &lt;b&gt;first&lt;/b&gt; render, whose &lt;code&gt;product&lt;/code&gt; is still “Ceramic Mug”.&quot;,&quot;set&quot;:{&quot;k1&quot;:&quot;&quot;,&quot;k2&quot;:&quot;&quot;,&quot;k3&quot;:&quot;&quot;,&quot;k4&quot;:&quot;&quot;,&quot;fn&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;saved \&quot;Gift\&quot; for Ceramic Mug&lt;/code&gt;. One save, wrong product: a stale closure.&quot;,&quot;set&quot;:{&quot;out&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;out&quot;:&quot;\&quot;Gift\&quot; for Ceramic Mug&quot;}}]" data-intro="Build it once, around the first callback."><div class="anim-scn-title">[delay]</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">keystrokes (60 ms apart)</div><div class="a-col"><span class="an chip-a" data-k="k1" data-s="faint">"G"</span><span class="an chip-a" data-k="k2" data-s="faint">"Gi"</span><span class="an chip-a" data-k="k3" data-s="faint">"Gif"</span><span class="an chip-a" data-k="k4" data-s="faint">"Gift"</span></div></div><div class="a-panel "><div class="a-panel-title">useMemo(…, [delay])</div><div class="a-col"><span class="an chip-a" data-k="fn" data-s="faint">debounced function #1</span><span class="an chip-a" data-k="tm" data-s="faint">pending timers: 0</span></div></div><div class="a-panel "><div class="a-panel-title">saved (recorded)</div><div class="a-col"><span class="an chip-a" data-k="out" data-s="ghost">nothing yet</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>pick Desk Lamp, then type</code><span>The debounced function is built <b>once</b> (deps <code>[delay]</code>), so the timer is reused and cancelled correctly.</span></li><li><span class="anim-phase ph-effect">effects</span><code>saveNote from render 1</code><span>But it wraps the <code>saveNote</code> from the <b>first</b> render, whose <code>product</code> is still “Ceramic Mug”.</span></li><li><span class="anim-phase ph-effect">effects</span><code>recorded</code><span>Recorded: <code>saved "Gift" for Ceramic Mug</code>. One save, wrong product: a stale closure.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;callbackRef.current = callback&quot;,&quot;say&quot;:&quot;After every render, an effect stores the newest &lt;code&gt;saveNote&lt;/code&gt; in a ref.&quot;,&quot;set&quot;:{&quot;fn&quot;:&quot;keep&quot;},&quot;txt&quot;:{&quot;fn&quot;:&quot;debounced function #1 (kept)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;\&quot;G\&quot; … \&quot;Gift\&quot;&quot;,&quot;say&quot;:&quot;The debounced function is built once and calls &lt;code&gt;(...args) =&amp;gt; callbackRef.current(...args)&lt;/code&gt;, so each keystroke restarts the same timer.&quot;,&quot;set&quot;:{&quot;k1&quot;:&quot;hl&quot;,&quot;k2&quot;:&quot;hl&quot;,&quot;k3&quot;:&quot;hl&quot;,&quot;k4&quot;:&quot;hl&quot;,&quot;tm&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;tm&quot;:&quot;pending timers: 1&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;callbackRef.current(\&quot;Gift\&quot;)&quot;,&quot;say&quot;:&quot;When it fires, it reads the ref &lt;b&gt;at call time&lt;/b&gt;: the latest &lt;code&gt;saveNote&lt;/code&gt;. Recorded: &lt;code&gt;saved \&quot;Gift\&quot; for Desk Lamp&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;k1&quot;:&quot;&quot;,&quot;k2&quot;:&quot;&quot;,&quot;k3&quot;:&quot;&quot;,&quot;k4&quot;:&quot;&quot;,&quot;out&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;out&quot;:&quot;\&quot;Gift\&quot; for Desk Lamp&quot;}}]" data-intro="Build it once, and read the newest callback from a ref."><div class="anim-scn-title">Latest ref</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">keystrokes (60 ms apart)</div><div class="a-col"><span class="an chip-a" data-k="k1" data-s="faint">"G"</span><span class="an chip-a" data-k="k2" data-s="faint">"Gi"</span><span class="an chip-a" data-k="k3" data-s="faint">"Gif"</span><span class="an chip-a" data-k="k4" data-s="faint">"Gift"</span></div></div><div class="a-panel "><div class="a-panel-title">useMemo(…, [delay])</div><div class="a-col"><span class="an chip-a" data-k="fn" data-s="faint">debounced function #1</span><span class="an chip-a" data-k="tm" data-s="faint">pending timers: 0</span></div></div><div class="a-panel "><div class="a-panel-title">saved (recorded)</div><div class="a-col"><span class="an chip-a" data-k="out" data-s="ghost">nothing yet</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-effect">effects</span><code>callbackRef.current = callback</code><span>After every render, an effect stores the newest <code>saveNote</code> in a ref.</span></li><li><span class="anim-phase ph-event">event</span><code>"G" … "Gift"</code><span>The debounced function is built once and calls <code>(...args) =&gt; callbackRef.current(...args)</code>, so each keystroke restarts the same timer.</span></li><li><span class="anim-phase ph-effect">effects</span><code>callbackRef.current("Gift")</code><span>When it fires, it reads the ref <b>at call time</b>: the latest <code>saveNote</code>. Recorded: <code>saved "Gift" for Desk Lamp</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Pick “Desk Lamp”, then type “Gift” into the gift note (all three hooks recorded).</figcaption></figure>

## The example: a debounced gift note

The cart has a gift note field that saves itself 300 ms after you stop typing. The save also needs to know which product the note is for. The shopper picks "Desk Lamp", then types "Gift" quickly.

```tsx
function debounce<A extends unknown[]>(fn: Fn<A>, ms: number): Fn<A> {
	let timer: ReturnType<typeof setTimeout> | undefined
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), ms)
	}
}
```

```tsx
function GiftNote({ useDebounceHook }: { useDebounceHook: typeof useDebounce }) {
	const [product, setProduct] = useState('Ceramic Mug')
	const [note, setNote] = useState('')
	const saveNote = (text: string) => log(`saved "${text}" for ${product}`)
	const debouncedSave = useDebounceHook(saveNote, 300)

	return (
		<>
			<select id="product" value={product} onChange={(e) => setProduct(e.target.value)}>
				<option>Ceramic Mug</option>
				<option>Desk Lamp</option>
			</select>
			<input
				id="note"
				value={note}
				onChange={(e) => {
					setNote(e.target.value)
					debouncedSave(e.target.value)
				}}
			/>
		</>
	)
}
```

### 1. Rebuild when the callback changes

```tsx
function useDebounceRebuild<A extends unknown[]>(callback: Fn<A>, delay: number) {
	return useMemo(() => debounce(callback, delay), [callback, delay])
}
```

```text
saved "G" for Desk Lamp
saved "Gi" for Desk Lamp
saved "Gif" for Desk Lamp
saved "Gift" for Desk Lamp
```

Four saves instead of one. `saveNote` is a new function on every render, so `useMemo` builds a new debounced function each time, and a new one can't cancel the timer an old one started. Wrapping `saveNote` in `useCallback` doesn't help: it depends on `product`, so it changes too, just less often.

### 2. Build it once

```tsx
function useDebounceOnce<A extends unknown[]>(callback: Fn<A>, delay: number) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => debounce(callback, delay), [delay])
}
```

```text
saved "Gift" for Ceramic Mug
```

One save now, but for the wrong product. The debounced function wraps the `saveNote` from the **first** render, when the product was still Ceramic Mug. That's a stale closure.

### 3. The latest ref

```tsx
function useDebounce<A extends unknown[]>(callback: Fn<A>, delay: number) {
	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback // after every render: the latest callback
	})
	return useMemo(() => debounce((...args: A) => callbackRef.current(...args), delay), [delay])
}
```

```text
saved "Gift" for Desk Lamp
```

One save, right product. The debounced function is built once (deps `[delay]`), so its timer survives re-renders. It doesn't hold `callback`: it holds the ref, and reads `callbackRef.current` **when the timer fires**.

Don't write `debounce(callbackRef.current, delay)`. That reads `.current` once, when `useMemo` runs, which is the same bug as version 2. The extra arrow function is what delays the read.

## Inside effects: `useEffectEvent`

A stock watcher checks the product's stock every 200 ms. Clicking "Watch Desk Lamp" changes the `product` prop.

```tsx
function StockWatchStale({ product }: { product: string }) {
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => log(`checking stock: ${product}`), 200)
		return () => (log('watch stopped'), clearInterval(id))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return null
}
```

Before and after the click:

```text
watch started
checking stock: Ceramic Mug   (repeats)
```

```text
checking stock: Ceramic Mug   (repeats)
```

Stale: still checking the mug. Adding `product` to the dependencies fixes the value, but restarts the interval on every change:

```tsx
function StockWatchRestart({ product }: { product: string }) {
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => log(`checking stock: ${product}`), 200)
		return () => (log('watch stopped'), clearInterval(id))
	}, [product])
	return null
}
```

```text
watch stopped
watch started
checking stock: Desk Lamp   (repeats)
```

`useEffectEvent` separates the two. The effect sets up the interval once; the event function always sees the latest `product`:

```tsx
function StockWatch({ product }: { product: string }) {
	const onTick = useEffectEvent(() => log(`checking stock: ${product}`))
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => onTick(), 200)
		return () => (log('watch stopped'), clearInterval(id))
	}, [])
	return null
}
```

```text
checking stock: Desk Lamp   (repeats)
```

No restart, and the new product. `useEffectEvent` is meant to be called **only from effects** (and things they set up, like this interval). It's not a general stable-callback tool for event handlers or props, which is where the hand-written ref is still the answer.

## How it works

- **Closures capture a render.** A function created during render reads the variables of that render forever. That's why hooks avoid a whole class of async bugs that class components had: there, `this.props` and `this.state` could change in the middle of an `await`.
- **A ref is one box for the component's whole life.** Writing `.current` doesn't re-render, and every closure that holds the ref sees the newest value.
- **Write the ref in an effect, not during render.** Render must stay pure: React may render a component and throw the result away. An effect runs only for renders that were committed. (`useLayoutEffect` updates it a bit earlier, before paint, if a callback could fire in between.)
- **No dependency array on that effect.** It should run after every render, to always copy the newest callback.

## Common mistakes

- **Using the pattern to silence the dependency lint rule.** It opts out of the "this render's values" guarantee on purpose. Use it only for functions that genuinely run later.
- **Reading `ref.current` during render.** Render would depend on something React doesn't track.
- **Passing `callbackRef.current` instead of a wrapper function** (see above).
- **Calling a `useEffectEvent` function from an event handler or passing it to a child.** It's for effects only.

## Interview Q&A

<details class="qa"><summary>What problem does the latest ref pattern solve?</summary>

A function that's created once but called later (a debounced or throttled function, a timer or subscription callback) needs the latest props and state when it runs. Rebuilding it on every change loses its internal state (pending timers); not rebuilding it leaves it with stale values.

</details>

<details class="qa"><summary>Walk through the buggy <code>useDebounce</code>.</summary>

`useMemo(() => debounce(callback, delay), [callback, delay])` builds a new debounced function whenever `callback` changes, which is every render for an inline function. Each new function has its own timer, so older timers are never cancelled. Recorded: typing "Gift" saved four times.

</details>

<details class="qa"><summary>Why doesn't <code>useCallback</code> fix it?</summary>

The callback still changes whenever its own dependencies change (here, `product`), so the debounced function is still rebuilt at those moments. It also pushes the burden onto every caller.

</details>

<details class="qa"><summary>How does the ref version work?</summary>

An effect copies the newest callback into `callbackRef.current` after every render. The debounced function is built once and calls `callbackRef.current(...args)` when the timer fires. Recorded: one save, `"Gift" for Desk Lamp`.

</details>

<details class="qa"><summary>Why write the ref in an effect and not in the render body?</summary>

Render should be pure. React can render without committing (Strict Mode, interrupted concurrent renders), and writing during such a render would store a callback from a render that never happened.

</details>

<details class="qa"><summary>What is <code>useEffectEvent</code>?</summary>

A React 19.2 hook that wraps a function so it always sees the latest props and state, without being an effect dependency. It's the built-in version of this pattern for code called from effects. Recorded: the stock watcher switched to Desk Lamp without restarting its interval.

</details>

## Related

- [Side Effects](../../hooks/side-effects/) and [DOM Refs and Effect Dependencies](../../hooks/dom-refs-and-effect-dependencies/): effects, refs and dependencies.
- [React Re-rendering](../../hooks/react-re-rendering/): stale closures and `useCallback`.
- [useLayoutEffect](../../apis/uselayouteffect/): an earlier place to update the ref.

## Sources

- Kent C. Dodds: [The latest ref pattern in React](https://epicreact.dev/the-latest-ref-pattern-in-react), [How React uses closures to avoid bugs](https://epicreact.dev/how-react-uses-closures-to-avoid-bugs)
- react.dev: [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent), [Separating events from effects](https://react.dev/learn/separating-events-from-effects), [`useRef`](https://react.dev/reference/react/useRef)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
