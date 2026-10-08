---
title: "Rendering Arrays"
slug: "rendering-arrays"
module: "fundamentals"
order: 9
level: "must"
illus: "pipeline"
summary: "Keys give list items an identity. A cart with gift notes shows what goes wrong with index keys, and how a key resets an input."
source: "https://react.dev/learn/rendering-lists"
---


## In one minute

When you render a list with `.map()`, React has to work out, on the next render, which new item corresponds to which old one. A **`key`** answers that: it's the item's identity among its siblings. With a stable id as the key, React moves, keeps and deletes the right rows. With no key or the array **index**, React matches by **position**, which goes wrong as soon as items are added, removed or reordered: anything the DOM remembers (typed text, focus, a component's state) stays at the old position and ends up on the wrong item.

**You'll be able to:** choose a key, explain why index keys break, and use `key` on purpose to reset a component.

<figure class="fig anim fig-fund-cart-keys-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">key={index}</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">key={item.id}</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;keys 0, 1, 2 → 0, 1&quot;,&quot;say&quot;:&quot;With index keys, the new first item (Headphones) has key &lt;code&gt;0&lt;/code&gt;, the same key the Mug row had.&quot;,&quot;set&quot;:{&quot;m&quot;:&quot;cmp&quot;},&quot;txt&quot;:{&quot;m&quot;:&quot;key 0 = Headphones? key 1 = Backpack? key 2 gone&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;update row 0 text&quot;,&quot;say&quot;:&quot;So React &lt;b&gt;keeps&lt;/b&gt; row 0’s DOM, input included, and just changes its text to “Wireless Headphones”.&quot;,&quot;set&quot;:{&quot;r0&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;r0-label&quot;:&quot;Wireless Headphones&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;update row 1, delete row 2&quot;,&quot;say&quot;:&quot;Row 1 becomes Backpack; the last row is deleted.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;upd&quot;,&quot;r2&quot;:&quot;del&quot;},&quot;txt&quot;:{&quot;r1-label&quot;:&quot;Trail Backpack&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;result&quot;,&quot;say&quot;:&quot;The Mug’s gift note now sits next to the &lt;b&gt;Headphones&lt;/b&gt;. Recorded: &lt;code&gt;{ item: \&quot;Wireless Headphones\&quot;, note: \&quot;Gift wrap, please\&quot; }&lt;/code&gt;. No key gives the same wrong result.&quot;,&quot;set&quot;:{&quot;r0&quot;:&quot;bad&quot;,&quot;m&quot;:&quot;&quot;}}]" data-intro="Rows keyed by their position."><div class="anim-scn-title">key={index}</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">cart rows (DOM, with their inputs)</div><div class="a-col"><div class="an node sm" data-k="r0"><span data-k="r0-label">Ceramic Mug</span><small data-k="r0-note">note: “Gift wrap, please”</small></div><div class="an node sm" data-k="r1"><span data-k="r1-label">Wireless Headphones</span><small data-k="r1-note">note: (empty)</small></div><div class="an node sm" data-k="r2"><span data-k="r2-label">Trail Backpack</span><small data-k="r2-note">note: (empty)</small></div></div></div><div class="a-panel "><div class="a-panel-title">React’s matching</div><div class="a-col"><span class="an chip-a" data-k="m" data-s="faint">remove “Ceramic Mug” → new list has 2 items</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>keys 0, 1, 2 → 0, 1</code><span>With index keys, the new first item (Headphones) has key <code>0</code>, the same key the Mug row had.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>update row 0 text</code><span>So React <b>keeps</b> row 0’s DOM, input included, and just changes its text to “Wireless Headphones”.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>update row 1, delete row 2</code><span>Row 1 becomes Backpack; the last row is deleted.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>result</code><span>The Mug’s gift note now sits next to the <b>Headphones</b>. Recorded: <code>{ item: "Wireless Headphones", note: "Gift wrap, please" }</code>. No key gives the same wrong result.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;keys p1, p2, p3 → p2, p3&quot;,&quot;say&quot;:&quot;With id keys, React sees that &lt;code&gt;p1&lt;/code&gt; is gone and &lt;code&gt;p2&lt;/code&gt;, &lt;code&gt;p3&lt;/code&gt; are still there.&quot;,&quot;set&quot;:{&quot;m&quot;:&quot;cmp&quot;},&quot;txt&quot;:{&quot;m&quot;:&quot;p1 gone · p2 kept · p3 kept&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;delete p1’s row&quot;,&quot;say&quot;:&quot;The Mug’s row is removed, with its input and note.&quot;,&quot;set&quot;:{&quot;r0&quot;:&quot;del&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;keep p2, p3&quot;,&quot;say&quot;:&quot;The other rows keep their DOM and inputs untouched.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;keep&quot;,&quot;r2&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;result&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;{ item: \&quot;Wireless Headphones\&quot;, note: \&quot;\&quot; }&lt;/code&gt;: every note stays with its product.&quot;,&quot;set&quot;:{&quot;r1&quot;:&quot;ok&quot;,&quot;r2&quot;:&quot;ok&quot;,&quot;m&quot;:&quot;&quot;}}]" data-intro="Rows keyed by the product’s id."><div class="anim-scn-title">key={item.id}</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">cart rows (DOM, with their inputs)</div><div class="a-col"><div class="an node sm" data-k="r0"><span data-k="r0-label">Ceramic Mug</span><small data-k="r0-note">note: “Gift wrap, please”</small></div><div class="an node sm" data-k="r1"><span data-k="r1-label">Wireless Headphones</span><small data-k="r1-note">note: (empty)</small></div><div class="an node sm" data-k="r2"><span data-k="r2-label">Trail Backpack</span><small data-k="r2-note">note: (empty)</small></div></div></div><div class="a-panel "><div class="a-panel-title">React’s matching</div><div class="a-col"><span class="an chip-a" data-k="m" data-s="faint">remove “Ceramic Mug” → new list has 2 items</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>keys p1, p2, p3 → p2, p3</code><span>With id keys, React sees that <code>p1</code> is gone and <code>p2</code>, <code>p3</code> are still there.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>delete p1’s row</code><span>The Mug’s row is removed, with its input and note.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>keep p2, p3</code><span>The other rows keep their DOM and inputs untouched.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>result</code><span>Recorded: <code>{ item: "Wireless Headphones", note: "" }</code>: every note stays with its product.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="cmp"></i>being compared</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="del"></i>deleted</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Type a gift note on the first cart item, then remove it. The key decides whose note survives.</figcaption></figure>

## The example: a cart with gift notes

```tsx
function Cart({ keyBy }: { keyBy: 'index' | 'id' | 'none' }) {
	const [items, setItems] = useState(initial)
	const remove = (id: string) => setItems((list) => list.filter((p) => p.id !== id))

	return (
		<ul className="cart">
			{items.map((item: Product, index) => (
				<li key={keyBy === 'id' ? item.id : keyBy === 'index' ? index : undefined}>
					<span>{item.name}</span>
					<input placeholder="Gift note" />
					<button onClick={() => remove(item.id)}>Remove</button>
				</li>
			))}
		</ul>
	)
}
```

The recorder typed "Gift wrap, please" next to the **Ceramic Mug**, then removed the Mug. The rows afterwards:

With `key={item.id}`:

```js
[
  {
    "item": "Wireless Headphones",
    "note": ""
  },
  {
    "item": "Trail Backpack",
    "note": ""
  }
]
```

With `key={index}`:

```js
[
  {
    "item": "Wireless Headphones",
    "note": "Gift wrap, please"
  },
  {
    "item": "Trail Backpack",
    "note": ""
  }
]
```

With no key at all (React also warned):

```js
[
  {
    "item": "Wireless Headphones",
    "note": "Gift wrap, please"
  },
  {
    "item": "Trail Backpack",
    "note": ""
  }
]
```

```text
Each child in a list should have a unique "key" prop.
```

Only the id version is right. With index keys, the Headphones got key `0`, the key the Mug's row used to have, so React kept that row (and its input with the note) and just changed its text. No key behaves exactly like index keys, plus a warning.

## Rules for keys

- **Unique among siblings**, not across the app. Two different lists can both use `p1`.
- **Stable**: the same item gets the same key on every render. Never `Math.random()` or `Date.now()` inside `.map()`: a new key each render means a brand-new element each time, so React remounts every row and loses its state.
- **From the data**: a database id, a SKU, a slug. Index keys are only acceptable for lists that never reorder, filter or insert, and whose rows hold no state.
- **Keys aren't props.** The component never receives `key`; pass the id separately if it needs it ([Raw React APIs](../../fundamentals/raw-react-apis/)).

## `key` as a reset button

Changing an element's key tells React "this is a different element": it unmounts the old one (and its state) and mounts a fresh one. That's an easy way to reset a component without writing reset logic:

```tsx
function Coupon() {
	const [resetKey, setResetKey] = useState(0)
	return (
		<>
			<input key={resetKey} id="coupon" placeholder="Coupon code" />
			<button id="clear" onClick={() => setResetKey((k) => k + 1)}>Clear</button>
		</>
	)
}
```

```js
{
  "logs": [],
  "warnings": [],
  "before": "SAVE10",
  "after": ""
}
```

The same trick clears a file input, or resets a whole form or profile page when the selected product id changes: `<ProductEditor key={productId} />`.

## Common mistakes

- `key={index}` on lists that can change.
- Generating keys during render (`key={crypto.randomUUID()}`).
- Putting the key on the wrong element: it belongs on the outermost element returned from `.map()` (often a `<li>` or a component), not inside it.

## Interview Q&A

<details class="qa"><summary>Why does React need a <code>key</code> when rendering arrays?</summary>

To match items between renders. Without identity, a removed first item looks the same as "every item's content shifted up by one", and React updates by position. Keys let it keep, move or delete the element that actually belongs to each item.

</details>

<details class="qa"><summary>Why is the array index usually a bad key?</summary>

The index *is* the position, so it gives React no new information. Recorded: after removing the Mug with index keys, its gift note stayed on row 0, which now showed the Headphones.

</details>

<details class="qa"><summary>What makes a valid key?</summary>

Unique among the siblings in that list, and stable for the same item across renders. Usually an id from the data.

</details>

<details class="qa"><summary>What else can changing a <code>key</code> be used for?</summary>

Resetting state: a new key unmounts the old element and mounts a new one. Recorded: a coupon input with `key={resetKey}` went from `"SAVE10"` to `""` when the key changed.

</details>

## Related

- [Reconciliation](../../internals/reconciliation/) and [Child Reconciliation Algorithm](../../internals/child-reconciliation-algorithm/) (React Internals): exactly how React compares keyed and unkeyed lists.
- [Inputs](../../fundamentals/inputs/): resetting a file input.

## Sources

- react.dev: [Rendering lists](https://react.dev/learn/rendering-lists), [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
