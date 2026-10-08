---
title: "Building a Cart"
slug: "building-a-cart"
module: "hooks"
order: 6
level: "must"
illus: "plane"
summary: "Updater functions, immutable updates, saving to localStorage and an undo history, in one cart."
source: "https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state"
---


## In one minute

This note puts the hooks so far together in one feature: a cart with quantity buttons, saved in `localStorage`, with undo. Three rules carry it. When the next state is computed from the previous one, pass an **updater function** (`setQty(q => q + 1)`), because the value in your handler is a snapshot of one render. **Never mutate state**: create a new array or object, or React sees the same reference and doesn't re-render. And keep **one** piece of managed state; everything else (the visible items, whether Undo is enabled) is derived from it.

**You'll be able to:** avoid lost updates, update arrays immutably, persist state, and build a history with undo.

<figure class="fig anim fig-hooks-queue-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">setQty(qty + 1) ×2</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">setQty(q => q + 1) ×2</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setQty(qty + 1)&quot;,&quot;say&quot;:&quot;In this render &lt;code&gt;qty&lt;/code&gt; is &lt;code&gt;1&lt;/code&gt;, so this queues “replace with &lt;b&gt;2&lt;/b&gt;”.&quot;,&quot;set&quot;:{&quot;s1&quot;:&quot;hl&quot;,&quot;q1&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;q1&quot;:&quot;replace with 2&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setQty(qty + 1)&quot;,&quot;say&quot;:&quot;&lt;code&gt;qty&lt;/code&gt; is still &lt;code&gt;1&lt;/code&gt; in this closure (state doesn’t change mid-handler), so this also queues “replace with &lt;b&gt;2&lt;/b&gt;”.&quot;,&quot;set&quot;:{&quot;s1&quot;:&quot;&quot;,&quot;s2&quot;:&quot;hl&quot;,&quot;q2&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;q2&quot;:&quot;replace with 2&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;process queue&quot;,&quot;say&quot;:&quot;Recorded button: &lt;code&gt;Add 2 (now 2)&lt;/code&gt;. One of the two clicks was lost.&quot;,&quot;set&quot;:{&quot;s2&quot;:&quot;&quot;,&quot;res&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;qty = 2&quot;}}]" data-intro="New value computed from the render’s &lt;code&gt;qty&lt;/code&gt;."><div class="anim-scn-title">setQty(qty + 1) ×2</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">click handler</div><div class="a-col"><div class="an call" data-k="s1"><code>setQty(qty + 1)</code></div><div class="an call" data-k="s2"><code>setQty(qty + 1)</code></div></div></div><div class="a-panel "><div class="a-panel-title">React’s queue for qty</div><div class="a-col"><span class="an chip-a" data-k="q1" data-s="ghost">—</span><span class="an chip-a" data-k="q2" data-s="ghost">—</span></div></div><div class="a-panel "><div class="a-panel-title">next render</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="faint">qty = 1</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>setQty(qty + 1)</code><span>In this render <code>qty</code> is <code>1</code>, so this queues “replace with <b>2</b>”.</span></li><li><span class="anim-phase ph-event">event</span><code>setQty(qty + 1)</code><span><code>qty</code> is still <code>1</code> in this closure (state doesn’t change mid-handler), so this also queues “replace with <b>2</b>”.</span></li><li><span class="anim-phase ph-render">render phase</span><code>process queue</code><span>Recorded button: <code>Add 2 (now 2)</code>. One of the two clicks was lost.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setQty(q =&gt; q + 1)&quot;,&quot;say&quot;:&quot;Queues a &lt;b&gt;function&lt;/b&gt; instead of a value.&quot;,&quot;set&quot;:{&quot;s1&quot;:&quot;hl&quot;,&quot;q1&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;q1&quot;:&quot;q =&gt; q + 1&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setQty(q =&gt; q + 1)&quot;,&quot;say&quot;:&quot;Queues another one.&quot;,&quot;set&quot;:{&quot;s1&quot;:&quot;&quot;,&quot;s2&quot;:&quot;hl&quot;,&quot;q2&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;q2&quot;:&quot;q =&gt; q + 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;1 → 2 → 3&quot;,&quot;say&quot;:&quot;React runs them in order, passing each one the result of the previous. Recorded button: &lt;code&gt;Add 2 (now 3)&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;s2&quot;:&quot;&quot;,&quot;res&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;qty = 3&quot;}}]" data-intro="Updater functions."><div class="anim-scn-title">setQty(q => q + 1) ×2</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">click handler</div><div class="a-col"><div class="an call" data-k="s1"><code>setQty(q =&gt; q + 1)</code></div><div class="an call" data-k="s2"><code>setQty(q =&gt; q + 1)</code></div></div></div><div class="a-panel "><div class="a-panel-title">React’s queue for qty</div><div class="a-col"><span class="an chip-a" data-k="q1" data-s="ghost">—</span><span class="an chip-a" data-k="q2" data-s="ghost">—</span></div></div><div class="a-panel "><div class="a-panel-title">next render</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="faint">qty = 1</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>setQty(q =&gt; q + 1)</code><span>Queues a <b>function</b> instead of a value.</span></li><li><span class="anim-phase ph-event">event</span><code>setQty(q =&gt; q + 1)</code><span>Queues another one.</span></li><li><span class="anim-phase ph-render">render phase</span><code>1 → 2 → 3</code><span>React runs them in order, passing each one the result of the previous. Recorded button: <code>Add 2 (now 3)</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>“Add 2” clicked once, quantity starting at 1 (both versions recorded).</figcaption></figure>

## Lost updates: "Add 2"

```tsx
function QuantityStale() {
	const [qty, setQty] = useState(1)
	function addTwo() {
		setQty(qty + 1)
		setQty(qty + 1)
	}
	return <button id="add2" onClick={addTwo}>Add 2 (now {qty})</button>
}
```

One click, starting at 1:

```text
Add 2 (now 2)
```

```tsx
function QuantityUpdater() {
	const [qty, setQty] = useState(1)
	function addTwo() {
		setQty((q) => q + 1)
		setQty((q) => q + 1)
	}
	return <button id="add2" onClick={addTwo}>Add 2 (now {qty})</button>
}
```

```text
Add 2 (now 3)
```

`qty` is a constant in each render. Both `setQty(qty + 1)` calls compute `2`. Updater functions are queued and run in order, each receiving the result of the previous one. Rule of thumb: if the new value is calculated from the old one, use the function form; if you're replacing it outright (`setQty(1)`), either form works.

## Mutation: the array that didn't update

```tsx
function CartMutating() {
	const [items, setItems] = useState(['Ceramic Mug'])
	function add() {
		items.push('Desk Lamp') // changes the same array…
		setItems(items) // …so React sees the same reference and skips the render
		log('pushed; items.length =', items.length)
	}
	return <button id="addItem" onClick={add}>{items.length} items</button>
}
```

Clicked twice:

```text
pushed; items.length = 2
pushed; items.length = 3
```

```text
1 items
```

The array really has three items, but the button still says one. `setItems(items)` passes the same array, `Object.is(old, new)` is `true`, and React skips the render. Create a new array instead: `setItems([...items, 'Desk Lamp'])`, or `items.with(i, value)`, `items.filter(…)`, `items.toSorted()`.

## The whole cart: saved, with undo

```tsx
type CartState = { history: string[][]; step: number }

function readSavedCart(): CartState {
	log('readSavedCart() runs')
	try {
		const saved = JSON.parse(localStorage.getItem('cart') ?? 'null')
		if (saved && Array.isArray(saved.history)) return saved
	} catch {
		// corrupted storage: start fresh
	}
	return { history: [[]], step: 0 }
}

function Cart() {
	const [state, setState] = useState(readSavedCart)
	const items = state.history[state.step] // derived, never stored twice

	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(state))
	}, [state])

	function add(name: string) {
		setState(({ history, step }) => {
			const kept = history.slice(0, step + 1) // drop any undone future
			return { history: [...kept, [...kept[step], name]], step: kept.length }
		})
	}

	return (
		<>
			<button id="mug" onClick={() => add('Ceramic Mug')}>Add mug</button>
			<button id="lamp" onClick={() => add('Desk Lamp')}>Add lamp</button>
			<button id="undo" disabled={state.step === 0} onClick={() => setState((s) => ({ ...s, step: s.step - 1 }))}>
				Undo
			</button>
			<p id="items">{items.join(', ') || 'empty'}</p>
		</>
	)
}
```

The recorder added a mug, a lamp and another mug, pressed Undo, then added a lamp:

```text
Ceramic Mug, Desk Lamp, Ceramic Mug
```

```text
Ceramic Mug, Desk Lamp
```

```text
Ceramic Mug, Desk Lamp, Desk Lamp
```

What was saved in `localStorage`:

```js
{
  "history": [
    [],
    [
      "Ceramic Mug"
    ],
    [
      "Ceramic Mug",
      "Desk Lamp"
    ],
    [
      "Ceramic Mug",
      "Desk Lamp",
      "Desk Lamp"
    ]
  ],
  "step": 3
}
```

After reloading the page, the cart came back:

```text
Ceramic Mug, Desk Lamp, Desk Lamp
```

And across the reload plus another click, `readSavedCart` ran once:

```text
readSavedCart() runs
```

### How the pieces fit

- **Lazy initial state** reads and parses `localStorage` once, on mount ([Managing UI State](../../hooks/managing-ui-state/)). The `try/catch` survives corrupted or hand-edited storage.
- **An effect writes it back** whenever `state` changes ([Side Effects](../../hooks/side-effects/)). Because every update creates a new object, `[state]` changes exactly when the cart does.
- **History is an array of snapshots** plus `step`, the one being shown. `items` is derived: `history[step]`.
- **Undo only moves `step`.** The later snapshot stays until you make a new change, which first drops everything after `step` (`history.slice(0, step + 1)`). That's why the third snapshot (the second mug) is gone from the saved history: adding the lamp after Undo replaced that future.

## Common mistakes

- `setX(x + 1)` several times in one handler, or in a timer/promise created in an earlier render.
- `push`, `splice`, `sort` or property assignment on state, followed by `setState(sameObject)`.
- Storing derived values (`items`, `canUndo`) next to the state they come from.
- Appending to a history without dropping the undone future.

## Interview Q&A

<details class="qa"><summary>Why use <code>setQty(q =&gt; q + 1)</code> instead of <code>setQty(qty + 1)</code>?</summary>

`qty` is the value from the render that created the handler; it doesn't change when you call the setter. Two `setQty(qty + 1)` calls both compute the same value. The updater form is queued and receives the latest pending value. Recorded: "Add 2" from 1 gave 2 vs 3.

</details>

<details class="qa"><summary>Why doesn't mutating an array and calling <code>setItems(items)</code> re-render?</summary>

React compares the new state with the old using `Object.is`. The same array reference means "no change", so the render is skipped. Recorded: `items.length = 3` but the button showed "1 items". Always create a new array/object.

</details>

<details class="qa"><summary>How do you persist state to <code>localStorage</code>?</summary>

Read it with a lazy initializer (`useState(readSaved)`, so parsing happens once, inside `try/catch`), and write it in an effect that depends on the state.

</details>

<details class="qa"><summary>How does undo history work?</summary>

Keep an array of past states and an index. Undo/redo move the index; a new change drops the states after the index and appends. The displayed state is derived from `history[step]`.

</details>

## Related

- [useState vs useReducer](../../hooks/usestate-vs-usereducer/): the same history logic as a reducer.
- [React Re-rendering](../../hooks/react-re-rendering/): closures and stale values.

## Sources

- react.dev: [Updating state based on the previous state](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state), [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state), [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- Kent C. Dodds, [useState lazy initialization and function updates](https://kentcdodds.com/blog/use-state-lazy-initialization-and-function-updates)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop (its tic-tac-toe capstone); the example app and code here are this handbook's own.
