---
title: "useLayoutEffect"
slug: "uselayouteffect"
module: "apis"
order: 3
level: "good"
illus: "eye"
summary: "Measure before the browser paints: the recorded frame where a useEffect tooltip covers its button."
source: "https://react.dev/reference/react/useLayoutEffect"
---


## In one minute

`useLayoutEffect(setup, deps)` has the same signature as `useEffect`, but different timing. It runs **during the commit, after the DOM is updated and before the browser can paint**, and a state update made inside it is rendered **synchronously**, also before paint. Use it when an effect **measures the DOM and changes what's shown** (position, size, scroll), so the user never sees the unmeasured version. Default to `useEffect`; layout effects block painting.

**You'll be able to:** spot the measure-then-adjust flicker, fix it with `useLayoutEffect`, and explain why it's not the default.

<figure class="fig anim fig-apis-layout-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">useEffect</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useLayoutEffect</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Tooltip (height 0)&quot;,&quot;say&quot;:&quot;The height isn’t known yet, so the tooltip is placed “above” the button at a height of 0, which puts it right on top of the button.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;React updates the DOM. &lt;code&gt;useEffect&lt;/code&gt; is &lt;b&gt;not&lt;/b&gt; run yet: React lets the browser continue.&quot;,&quot;set&quot;:{&quot;tip&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;tip&quot;:&quot;tooltip in DOM (wrong spot)&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;The browser paints that frame. The user sees the tooltip covering the button.&quot;,&quot;set&quot;:{&quot;f1&quot;:&quot;bad&quot;,&quot;tip&quot;:&quot;bad&quot;,&quot;btn&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;tip&quot;:&quot;covering the button&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;useEffect → measure → setHeight(58)&quot;,&quot;say&quot;:&quot;Now the effect measures 58px; there’s no room above, so it moves below.&quot;,&quot;set&quot;:{&quot;e1&quot;:&quot;new&quot;,&quot;r2&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;Next frame: correct. The tooltip visibly jumped.&quot;,&quot;set&quot;:{&quot;f2&quot;:&quot;ok&quot;,&quot;tip&quot;:&quot;ok&quot;,&quot;btn&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;tip&quot;:&quot;below the button&quot;}}]" data-intro="Measure in a regular effect."><div class="anim-scn-title">useEffect</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-col"><span class="an chip-a" data-k="btn" data-s="faint">Shipping ⓘ</span><span class="an chip-a" data-k="tip" data-s="ghost">tooltip: not shown</span></div></div><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="r1" data-s="ghost">render: height 0 → above</div><div class="an" data-k="f1" data-s="ghost">frame 1 painted: covering the button</div><div class="an" data-k="e1" data-s="ghost">effect: measured 58px</div><div class="an" data-k="r2" data-s="ghost">render: height 58 → below</div><div class="an" data-k="f2" data-s="ghost">frame 2 painted: below the button</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>Tooltip (height 0)</code><span>The height isn’t known yet, so the tooltip is placed “above” the button at a height of 0, which puts it right on top of the button.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commit</code><span>React updates the DOM. <code>useEffect</code> is <b>not</b> run yet: React lets the browser continue.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>The browser paints that frame. The user sees the tooltip covering the button.</span></li><li><span class="anim-phase ph-effect">effects</span><code>useEffect → measure → setHeight(58)</code><span>Now the effect measures 58px; there’s no room above, so it moves below.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>Next frame: correct. The tooltip visibly jumped.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Tooltip (height 0)&quot;,&quot;say&quot;:&quot;Same first render.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;useLayoutEffect → measure → setHeight(58)&quot;,&quot;say&quot;:&quot;Layout effects run during the commit, &lt;b&gt;before&lt;/b&gt; the browser can paint. Reading the size forces the browser to lay out the new DOM (no paint).&quot;,&quot;set&quot;:{&quot;e1&quot;:&quot;new&quot;,&quot;tip&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;tip&quot;:&quot;in DOM, not painted&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Tooltip (height 58)&quot;,&quot;say&quot;:&quot;A state update from a layout effect is processed &lt;b&gt;synchronously&lt;/b&gt;: React renders and commits again right away.&quot;,&quot;set&quot;:{&quot;r2&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;paint&quot;,&quot;say&quot;:&quot;The first frame the user sees is already correct.&quot;,&quot;set&quot;:{&quot;f1&quot;:&quot;ok&quot;,&quot;tip&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;tip&quot;:&quot;below the button&quot;}}]" data-intro="Measure in a layout effect."><div class="anim-scn-title">useLayoutEffect</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-col"><span class="an chip-a" data-k="btn" data-s="faint">Shipping ⓘ</span><span class="an chip-a" data-k="tip" data-s="ghost">tooltip: not shown</span></div></div><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="r1" data-s="ghost">render: height 0 → above</div><div class="an" data-k="e1" data-s="ghost">effect: measured 58px</div><div class="an" data-k="r2" data-s="ghost">render: height 58 → below</div><div class="an" data-k="f1" data-s="ghost">frame 1 painted: below the button</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>Tooltip (height 0)</code><span>Same first render.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>useLayoutEffect → measure → setHeight(58)</code><span>Layout effects run during the commit, <b>before</b> the browser can paint. Reading the size forces the browser to lay out the new DOM (no paint).</span></li><li><span class="anim-phase ph-render">render phase</span><code>Tooltip (height 58)</code><span>A state update from a layout effect is processed <b>synchronously</b>: React renders and commits again right away.</span></li><li><span class="anim-phase ph-paint">browser</span><code>paint</code><span>The first frame the user sees is already correct.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Hovering “Shipping ⓘ”: the recorded order of renders, effects and painted frames (frames read in requestAnimationFrame).</figcaption></figure>

## The example: the shipping tooltip

Next to the price there's a "Shipping ⓘ" button. Hovering it for 200 ms shows a tooltip. The tooltip prefers to sit **above** the button, but if there isn't room it goes **below**. It can't know whether it fits until it knows its own height, and it can't know its height until it's in the DOM.

```tsx
function Tooltip({ anchor, useMeasureEffect }: { anchor: Rect; useMeasureEffect: typeof useLayoutEffect }) {
	const ref = useRef<HTMLDivElement>(null)
	const [height, setHeight] = useState(0) // unknown until it's in the DOM

	useMeasureEffect(() => {
		const measured = ref.current!.getBoundingClientRect().height
		log(`  effect: measured ${measured}px`)
		setHeight(measured)
	}, [])

	const fitsAbove = anchor.top - height >= 0
	const top = fitsAbove ? anchor.top - height : anchor.bottom
	log(`  render: height ${height} → ${fitsAbove ? 'above' : 'below'}`)
	return (
		<div ref={ref} className="tooltip" style={{ top, left: anchor.left }}>
			Free shipping on orders over $50. Returns are free for 30 days.
		</div>
	)
}
```

`useMeasureEffect` is `useEffect` or `useLayoutEffect`. The button is near the top of the page and the tooltip is 58px tall, so the right answer is "below".

To see what the user sees, the lesson logs what's on screen in `requestAnimationFrame`, which the browser runs **right before each paint**. Each hover was recorded 20 times.

### With `useEffect`

The most common sequence:

```text
  render: height 0 → above
frame 1 painted: covering the button
  effect: measured 58px
  render: height 58 → below
frame 2 painted: below the button
```

```text
19 of 20 hovers painted the tooltip covering the button
```

The browser painted a frame between the commit and the effect. For one frame, the tooltip sat on top of the button, then jumped below it.

### With `useLayoutEffect`

```text
  render: height 0 → above
  effect: measured 58px
  render: height 58 → below
frame 1 painted: below the button
```

```text
0 of 20 hovers painted the tooltip covering the button
```

The measurement and the second render both happened **before the first frame**, so the first thing painted was the correct position.

## How it works

- **The commit, in order:** React writes DOM changes, attaches refs, then runs layout effects (cleanups first). Then it returns and the browser can paint. Regular effects run later ([React Lifecycle](../../hooks/react-lifecycle/), [Commit Phase and Effects](../../internals/commit-phase-and-effects/)).
- **Reading layout in a layout effect** (`getBoundingClientRect`, `offsetHeight`) makes the browser calculate layout right away. That costs time, but nothing is painted.
- **An update from a layout effect is synchronous.** React renders and commits it immediately, still before paint. That's why there's no wrong frame, and also why heavy work there delays the frame the user is waiting for.
- **`useEffect` isn't always after paint.** After a click, React runs effects before the next frame ([Side Effects](../../hooks/side-effects/)). The flicker appears when the update isn't from a click: here, a hover timer. Only `useLayoutEffect` guarantees it.
- **On the server,** neither effect runs. For a server-rendered tooltip, render nothing until the client has measured, or use CSS.

## Common mistakes

- **Using `useLayoutEffect` by default.** It blocks paint every time it runs. Use it only for the measure-then-adjust case.
- **Expensive work in a layout effect.** It delays the frame directly.
- **Measuring in render.** The DOM isn't updated yet, and refs aren't attached.
- **Reaching for it when CSS can do it.** Sticky positioning, CSS anchor positioning and container queries need no JavaScript measurement.

## Interview Q&A

<details class="qa"><summary>What's the difference between <code>useEffect</code> and <code>useLayoutEffect</code>?</summary>

Same signature, different timing. `useLayoutEffect` runs during the commit, after DOM updates and before the browser paints, and its state updates render synchronously. `useEffect` runs after the commit and can run after paint.

</details>

<details class="qa"><summary>When does <code>useEffect</code> cause a visible bug here?</summary>

When it measures the DOM and then moves or resizes something. The browser may paint the unmeasured version first. Recorded: with `useEffect`, most hovers painted the tooltip covering the button for one frame. With `useLayoutEffect`, none did.

</details>

<details class="qa"><summary>Why not always use <code>useLayoutEffect</code>?</summary>

It blocks painting until it's done, and so do its updates. For effects that don't change what's on screen (subscriptions, logging, fetching), that's delay for nothing.

</details>

<details class="qa"><summary>Give real uses.</summary>

Positioning a tooltip or popover based on available space; computing how many cards fit a measured container; keeping a chat scrolled to the bottom when messages arrive; measuring text to truncate it.

</details>

<details class="qa"><summary>How did the recording know what was painted?</summary>

`requestAnimationFrame` callbacks run right before each paint, so the tooltip's position read there is what that frame shows.

</details>

## Related

- [React Lifecycle](../../hooks/react-lifecycle/): the recorded order of layout effects and effects.
- [flushSync](../../apis/flushsync/): the other half of "the DOM hasn't caught up": write it before your next line.
- [createPortal](../../apis/createportal/): tooltips are often portaled too.
- [Commit Phase and Effects](../../internals/commit-phase-and-effects/): where React runs each kind of effect.

## Sources

- react.dev: [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect)
- MDN: [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
