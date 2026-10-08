---
title: "useImperativeHandle"
slug: "useimperativehandle"
module: "apis"
order: 4
level: "good"
illus: "robot"
summary: "Expose a small set of methods (focus, clear) on a ref, for commands that don’t fit in state."
source: "https://react.dev/reference/react/useImperativeHandle"
---


## In one minute

A parent can pass a `ref` to a component. By default, if the component puts that ref on an `<input>`, the parent gets the whole DOM node. `useImperativeHandle(ref, createHandle, deps)` lets the component hand back **its own object** instead, with only the methods it chooses, like `focus()` and `clear()`. It's for **commands**: "focus now", "scroll now", "play now". Those are things that happen once at a moment, not facts the UI should keep showing, so they fit badly in state and props. In React 19, `ref` is a normal prop for function components, so you don't need `forwardRef`.

**You'll be able to:** expose a small imperative API from a component, and explain why a "shouldFocus" prop doesn't work.

<figure class="fig anim fig-apis-imperative-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">A shouldFocus prop</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useImperativeHandle</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setShouldFocus(true)&quot;,&quot;say&quot;:&quot;Click 1: the flag goes from &lt;code&gt;false&lt;/code&gt; to &lt;code&gt;true&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;hl&quot;,&quot;st&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;st&quot;:&quot;shouldFocus = true&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;useEffect([shouldFocus])&quot;,&quot;say&quot;:&quot;The dependency changed, so the child’s effect runs and focuses the field.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;&quot;,&quot;c1&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;c1&quot;:&quot;click 1: focused&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;blur, then setShouldFocus(true)&quot;,&quot;say&quot;:&quot;Click 2 (after the user clicked elsewhere): the flag is &lt;b&gt;already&lt;/b&gt; &lt;code&gt;true&lt;/code&gt;. Same value, no re-render, no effect.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;hl&quot;,&quot;st&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;nothing&quot;,&quot;say&quot;:&quot;Recorded: nothing was logged for click 2, and focus stayed on the button. A command doesn’t fit in state.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;&quot;,&quot;c2&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;c2&quot;:&quot;click 2: not focused&quot;}}]" data-intro="The parent sets state; the child focuses in an effect."><div class="anim-scn-title">A shouldFocus prop</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">Apply coupon onClick</div><div class="a-col"><div class="an call" data-k="code"><code>setShouldFocus(true)</code></div></div></div><div class="a-panel "><div class="a-panel-title">state / handle</div><div class="a-col"><span class="an chip-a" data-k="st" data-s="faint">shouldFocus = false</span></div></div><div class="a-panel "><div class="a-panel-title">coupon field</div><div class="a-col"><span class="an chip-a" data-k="c1" data-s="ghost">click 1</span><span class="an chip-a" data-k="c2" data-s="ghost">click 2</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>setShouldFocus(true)</code><span>Click 1: the flag goes from <code>false</code> to <code>true</code>.</span></li><li><span class="anim-phase ph-effect">effects</span><code>useEffect([shouldFocus])</code><span>The dependency changed, so the child’s effect runs and focuses the field.</span></li><li><span class="anim-phase ph-event">event</span><code>blur, then setShouldFocus(true)</code><span>Click 2 (after the user clicked elsewhere): the flag is <b>already</b> <code>true</code>. Same value, no re-render, no effect.</span></li><li><span class="anim-phase ph-effect">effects</span><code>nothing</code><span>Recorded: nothing was logged for click 2, and focus stayed on the button. A command doesn’t fit in state.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;couponRef.current.focus()&quot;,&quot;say&quot;:&quot;Click 1 calls the method the field exposed.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;hl&quot;,&quot;st&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;inputRef.current.focus()&quot;,&quot;say&quot;:&quot;Inside the field, it focuses the real input. No state, no render.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;&quot;,&quot;st&quot;:&quot;&quot;,&quot;c1&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;c1&quot;:&quot;click 1: focused&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;couponRef.current.focus()&quot;,&quot;say&quot;:&quot;Click 2 does exactly the same thing again.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;hl&quot;,&quot;c2&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;c2&quot;:&quot;click 2: focused&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;coupon field focused&lt;/code&gt; for both clicks. The handle exposes only &lt;code&gt;focus&lt;/code&gt; and &lt;code&gt;clear&lt;/code&gt;: &lt;code&gt;handle.value&lt;/code&gt; and &lt;code&gt;handle.style&lt;/code&gt; are &lt;code&gt;undefined&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;code&quot;:&quot;&quot;}}]" data-intro="The child exposes &lt;code&gt;focus()&lt;/code&gt;; the parent calls it."><div class="anim-scn-title">useImperativeHandle</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">Apply coupon onClick</div><div class="a-col"><div class="an call" data-k="code"><code>couponRef.current.focus()</code></div></div></div><div class="a-panel "><div class="a-panel-title">state / handle</div><div class="a-col"><span class="an chip-a" data-k="st" data-s="faint">couponRef.current = { focus, clear }</span></div></div><div class="a-panel "><div class="a-panel-title">coupon field</div><div class="a-col"><span class="an chip-a" data-k="c1" data-s="ghost">click 1</span><span class="an chip-a" data-k="c2" data-s="ghost">click 2</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>couponRef.current.focus()</code><span>Click 1 calls the method the field exposed.</span></li><li><span class="anim-phase ph-event">event</span><code>inputRef.current.focus()</code><span>Inside the field, it focuses the real input. No state, no render.</span></li><li><span class="anim-phase ph-event">event</span><code>couponRef.current.focus()</code><span>Click 2 does exactly the same thing again.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>Recorded: <code>coupon field focused</code> for both clicks. The handle exposes only <code>focus</code> and <code>clear</code>: <code>handle.value</code> and <code>handle.style</code> are <code>undefined</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>“Apply coupon” clicked twice, with a blur in between (both versions recorded).</figcaption></figure>

## The example: "Apply coupon"

At checkout, clicking "Apply coupon" with an empty field should put the cursor back in the coupon field, every time.

### 1. With a prop

```tsx
function CouponFieldFlag({ shouldFocus }: { shouldFocus: boolean }) {
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(() => {
		if (shouldFocus) inputRef.current!.focus()
	}, [shouldFocus])
	return <input id="coupon" ref={inputRef} placeholder="Coupon code" onFocus={() => log('  coupon field focused')} />
}

function CheckoutFlag() {
	const [shouldFocus, setShouldFocus] = useState(false)
	return (
		<>
			<CouponFieldFlag shouldFocus={shouldFocus} />
			<button id="apply" onClick={() => setShouldFocus(true)}>Apply coupon</button>
		</>
	)
}
```

Click "Apply coupon", click elsewhere on the page, then click it again:

```text
  coupon field focused
```

The second click logged nothing:

```js
[]
```

`shouldFocus` was already `true`, so `setShouldFocus(true)` changed nothing: no render and no effect. To make it work, you'd have to reset the flag after focusing, or bump a counter (`setFocusRequest(n => n + 1)`) just to make the effect run again. Both are state that exists only to fake a function call.

### 2. With `useImperativeHandle`

```tsx
type CouponHandle = { focus: () => void; clear: () => void }

function CouponField({ ref }: { ref: Ref<CouponHandle> }) {
	const inputRef = useRef<HTMLInputElement>(null)
	useImperativeHandle(
		ref,
		() => ({
			focus: () => inputRef.current!.focus(),
			clear: () => (inputRef.current!.value = ''),
		}),
		[],
	)
	return <input id="coupon" ref={inputRef} placeholder="Coupon code" onFocus={() => log('  coupon field focused')} />
}

function Checkout() {
	const couponRef = useRef<CouponHandle>(null)
	return (
		<>
			<CouponField ref={couponRef} />
			<button id="apply" onClick={() => couponRef.current!.focus()}>Apply coupon</button>
		</>
	)
}
```

Same two clicks:

```text
  coupon field focused
  coupon field focused
```

Both clicks focused the field, with no state and no render.

### 3. What the parent can reach

```tsx
const handle = couponRef.current as unknown as Record<string, unknown>
log('keys:', Object.keys(handle))
log('handle.value:', String(handle.value), '· handle.style:', String(handle.style))
log('is it the <input>?', handle instanceof HTMLInputElement)
```

```text
keys: ["focus","clear"]
handle.value: undefined · handle.style: undefined
is it the <input>? false
```

The parent gets exactly `focus` and `clear`. It can't read `.value`, change `.style` or call anything else on the input. The component can change its markup later without breaking the parent.

## How it works

- **`ref` as a prop.** In React 19 a function component receives `ref` like any other prop. `useImperativeHandle(ref, () => handle)` sets `ref.current` to `handle` during the commit (when refs are attached) and clears it on unmount.
- **The handle is recreated when `deps` change.** Methods that read state must list that state, or they'll see old values. Methods that only use refs, like these, can use `[]`.
- **It's still a ref.** `couponRef.current` is `null` until the child has mounted, so call it from event handlers or effects, not during render.

### State or a command?

Ask: "does this change what's shown?" If yes, it's state or props, like `isOpen`, `value` or `selectedId`. If it's "do this once, now" (focus, scroll into view, play, shake, validate and report), an imperative method is the honest model. Libraries do this too: form libraries expose `setFocus()`, media players `seekTo()`, chart wrappers `resetZoom()`.

## Common mistakes

- **Exposing everything** (`useImperativeHandle(ref, () => inputRef.current)`). That's the DOM node again, with no encapsulation.
- **Using it for things props can express.** "Open the modal" is better as an `open` prop if the parent needs to know whether it's open.
- **Missing dependencies.** A `validate()` that reads state needs that state in `deps`.
- **Calling `ref.current.method()` during render.** Refs are set in the commit.

## Interview Q&A

<details class="qa"><summary>What does <code>useImperativeHandle</code> do?</summary>

It sets the parent's ref to an object you create, instead of a DOM node. `useImperativeHandle(ref, () => ({ focus() {…} }), deps)` gives the parent only the methods you list.

</details>

<details class="qa"><summary>Why not just a <code>shouldFocus</code> prop?</summary>

Because focusing is a command, not a state. Recorded: the second "Apply coupon" click did nothing, because `setShouldFocus(true)` on a value that was already `true` causes no render and no effect. The imperative version focused on both clicks.

</details>

<details class="qa"><summary>How does a function component receive a ref in React 19?</summary>

As a regular `ref` prop. Before React 19 you had to wrap the component in `forwardRef`.

</details>

<details class="qa"><summary>What can the parent do with the handle?</summary>

Only what's in it. Recorded: `Object.keys(handle)` was `["focus", "clear"]`, `handle.value` and `handle.style` were `undefined`, and it wasn't an `HTMLInputElement`.

</details>

<details class="qa"><summary>When would you use it in real code?</summary>

Focusing or validating form fields, scrolling a message list to the bottom, play/pause/seek on a media wrapper, wrapping a non-React library (a map, a chart, an animation) behind a few methods.

</details>

## Related

- [DOM Refs and Effect Dependencies](../../hooks/dom-refs-and-effect-dependencies/): refs to DOM nodes.
- [flushSync](../../apis/flushsync/): focus something you just rendered.
- [TypeScript with React](../../fundamentals/typescript-with-react/): typing props, including `Ref<…>`.

## Sources

- react.dev: [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle), [`ref` as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
