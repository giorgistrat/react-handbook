---
title: "useReducer"
slug: "usereducer"
module: "apis"
order: 0
level: "must"
illus: "diff"
summary: "A cart as one pure reducer with typed actions: dispatch, lazy init, testing without React, and when React bails out."
source: "https://react.dev/reference/react/useReducer"
---


## In one minute

`useReducer` moves update logic out of event handlers into one pure function:

```ts
const [state, dispatch] = useReducer(reducer, initialArg, init?)
```

Handlers `dispatch` a plain **action** object that says *what happened* (`{ type: 'added', id }`). The **reducer** `(state, action) => newState` decides *how the state changes*. Because the reducer is a plain function, you can test it without React. And because `dispatch` never changes, you can pass it down without breaking `memo`.

**You'll be able to:** model a cart as typed actions plus a reducer, wrap it in a custom hook, and explain what React does when the reducer returns the same state.

<figure class="fig anim fig-apis-reducer-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Add mug</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Remove what isn’t there</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'added', id: 'p1' })&quot;,&quot;say&quot;:&quot;The handler only describes &lt;b&gt;what happened&lt;/b&gt;. It doesn’t compute the new cart.&quot;,&quot;set&quot;:{&quot;act&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;act&quot;:&quot;{ type: 'added', id: 'p1' }&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;cartReducer(state, action)&quot;,&quot;say&quot;:&quot;React calls your reducer while rendering &lt;code&gt;Cart&lt;/code&gt;, with the latest state. The &lt;code&gt;'added'&lt;/code&gt; case builds a &lt;b&gt;new&lt;/b&gt; object.&quot;,&quot;set&quot;:{&quot;act&quot;:&quot;&quot;,&quot;case&quot;:&quot;hl&quot;,&quot;ret&quot;:&quot;new&quot;,&quot;cart&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;case&quot;:&quot;case 'added'&quot;,&quot;ret&quot;:&quot;a new { items: [mug × 1] }&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Object.is(old, new) → false&quot;,&quot;say&quot;:&quot;The state changed, so the children render too. &lt;code&gt;CartButtons&lt;/code&gt; is skipped: it’s memoized and &lt;code&gt;dispatch&lt;/code&gt; is the same function every render.&quot;,&quot;set&quot;:{&quot;case&quot;:&quot;&quot;,&quot;ret&quot;:&quot;ok&quot;,&quot;note&quot;:&quot;run&quot;,&quot;btns&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;Cart render: 1 items, $18.00&lt;/code&gt;, &lt;code&gt;FreeShippingNote render&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;cart&quot;:&quot;done&quot;,&quot;note&quot;:&quot;done&quot;}}]" data-intro="An action that changes the cart."><div class="anim-scn-title">Add mug</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">event handler</div><div class="a-col"><span class="an chip-a" data-k="act" data-s="faint">dispatch(…)</span></div></div><div class="a-panel "><div class="a-panel-title">cartReducer(state, action)</div><div class="a-col"><span class="an chip-a" data-k="case" data-s="faint">switch (action.type)</span><span class="an chip-a" data-k="ret" data-s="ghost">returns …</span></div></div><div class="a-panel "><div class="a-panel-title">components</div><div class="a-col"><span class="an chip-a" data-k="cart" data-s="faint">Cart</span><span class="an chip-a" data-k="note" data-s="faint">FreeShippingNote</span><span class="an chip-a" data-k="btns" data-s="faint">memo(CartButtons)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatch({ type: 'added', id: 'p1' })</code><span>The handler only describes <b>what happened</b>. It doesn’t compute the new cart.</span></li><li><span class="anim-phase ph-render">render phase</span><code>cartReducer(state, action)</code><span>React calls your reducer while rendering <code>Cart</code>, with the latest state. The <code>'added'</code> case builds a <b>new</b> object.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Object.is(old, new) → false</code><span>The state changed, so the children render too. <code>CartButtons</code> is skipped: it’s memoized and <code>dispatch</code> is the same function every render.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>Recorded: <code>Cart render: 1 items, $18.00</code>, <code>FreeShippingNote render</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'removed', id: 'p3' })&quot;,&quot;say&quot;:&quot;Remove the backpack, which isn’t in the cart.&quot;,&quot;set&quot;:{&quot;act&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;act&quot;:&quot;{ type: 'removed', id: 'p3' }&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;cartReducer(state, action)&quot;,&quot;say&quot;:&quot;There’s nothing to remove, so the reducer returns &lt;code&gt;state&lt;/code&gt; itself: the &lt;b&gt;same object&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;act&quot;:&quot;&quot;,&quot;case&quot;:&quot;hl&quot;,&quot;ret&quot;:&quot;keep&quot;,&quot;cart&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;case&quot;:&quot;case 'removed'&quot;,&quot;ret&quot;:&quot;return state (same object)&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Object.is(old, new) → true&quot;,&quot;say&quot;:&quot;&lt;code&gt;Cart&lt;/code&gt; already ran (React calls the reducer during its render), but React sees the same state and &lt;b&gt;bails out&lt;/b&gt;: no children render.&quot;,&quot;set&quot;:{&quot;case&quot;:&quot;&quot;,&quot;ret&quot;:&quot;ok&quot;,&quot;cart&quot;:&quot;bail&quot;,&quot;note&quot;:&quot;skip&quot;,&quot;btns&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: only &lt;code&gt;Cart render: 3 items, $75.00&lt;/code&gt;. &lt;code&gt;FreeShippingNote&lt;/code&gt; didn’t render.&quot;,&quot;set&quot;:{}}]" data-intro="The reducer returns the state it was given."><div class="anim-scn-title">Remove what isn’t there</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">event handler</div><div class="a-col"><span class="an chip-a" data-k="act" data-s="faint">dispatch(…)</span></div></div><div class="a-panel "><div class="a-panel-title">cartReducer(state, action)</div><div class="a-col"><span class="an chip-a" data-k="case" data-s="faint">switch (action.type)</span><span class="an chip-a" data-k="ret" data-s="ghost">returns …</span></div></div><div class="a-panel "><div class="a-panel-title">components</div><div class="a-col"><span class="an chip-a" data-k="cart" data-s="faint">Cart</span><span class="an chip-a" data-k="note" data-s="faint">FreeShippingNote</span><span class="an chip-a" data-k="btns" data-s="faint">memo(CartButtons)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatch({ type: 'removed', id: 'p3' })</code><span>Remove the backpack, which isn’t in the cart.</span></li><li><span class="anim-phase ph-render">render phase</span><code>cartReducer(state, action)</code><span>There’s nothing to remove, so the reducer returns <code>state</code> itself: the <b>same object</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Object.is(old, new) → true</code><span><code>Cart</code> already ran (React calls the reducer during its render), but React sees the same state and <b>bails out</b>: no children render.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>Recorded: only <code>Cart render: 3 items, $75.00</code>. <code>FreeShippingNote</code> didn’t render.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="bail"></i>bailed out</span><span><i class="an lg-sw" data-s="skip"></i>skipped</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="ok"></i>ok</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Two clicks on the cart (both recorded): a real change, and an action that changes nothing.</figcaption></figure>

## The example: the cart

The cart supports four things: add a product, remove one, change a quantity, and clear the cart. With `useState`, that's four handlers that each copy and patch the `items` array. With a reducer, it's one `switch`.

### 1. Actions as a TypeScript union

```tsx
type CartItem = { id: string; qty: number }
type CartState = { items: CartItem[] }

type CartAction =
	| { type: 'added'; id: string }
	| { type: 'removed'; id: string }
	| { type: 'quantityChanged'; id: string; qty: number }
	| { type: 'cleared' }
```

Each action has a `type` string, and TypeScript narrows on it. Inside `case 'quantityChanged'`, `action.qty` exists. Inside `case 'cleared'`, it doesn't.

### 2. The reducer

```tsx
function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case 'added': {
			const inCart = state.items.some((i) => i.id === action.id)
			if (!inCart) return { items: [...state.items, { id: action.id, qty: 1 }] }
			return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i)) }
		}
		case 'removed':
			if (!state.items.some((i) => i.id === action.id)) return state // nothing to do: same object
			return { items: state.items.filter((i) => i.id !== action.id) }
		case 'quantityChanged':
			if (action.qty <= 0) return cartReducer(state, { type: 'removed', id: action.id })
			return { items: state.items.map((i) => (i.id === action.id ? { ...i, qty: action.qty } : i)) }
		case 'cleared':
			return state.items.length ? { items: [] } : state
		default:
			throw new Error(`Unknown action: ${(action as { type: string }).type}`)
	}
}
```

Notice the two `return state` lines. When an action changes nothing, the reducer hands back the **same object**, and that matters below.

### 3. Testing it without React

The reducer is just a function, so call it:

```tsx
const empty: CartState = { items: [] }
const one = cartReducer(empty, { type: 'added', id: 'p1' })
const two = cartReducer(one, { type: 'added', id: 'p1' })
const same = cartReducer(two, { type: 'removed', id: 'p3' })
log('one →', one)
log('two →', two)
log('same === two →', same === two)
log('empty unchanged →', empty)
```

```text
one → {"items":[{"id":"p1","qty":1}]}
two → {"items":[{"id":"p1","qty":2}]}
same === two → true
empty unchanged → {"items":[]}
```

No component and no rendering. `empty` wasn't mutated: every change built a new object.

### 4. A custom hook with lazy initialization

```tsx
function loadCart(key: string): CartState {
	log(`  loadCart("${key}")`)
	const saved = localStorage.getItem(key)
	return saved ? JSON.parse(saved) : { items: [] }
}
```

```tsx
function useCart() {
	const [cart, dispatch] = useReducer(cartReducer, 'cart', loadCart)
	useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart])
	const count = cart.items.reduce((n, i) => n + i.qty, 0)
	const total = cart.items.reduce((sum, i) => sum + i.qty * byId(i.id).priceCents, 0)
	return { cart, count, total, dispatch }
}
```

The third argument is an **initializer**: React calls `loadCart('cart')` once, on mount. A cart was saved with two lamps, then "Add mug" was clicked twice:

```text
  loadCart("cart")
Cart render: 2 items, $78.00
CartButtons render
FreeShippingNote render
Cart render: 3 items, $96.00
FreeShippingNote render
Cart render: 4 items, $114.00
FreeShippingNote render
```

`loadCart` ran once. Compare calling it yourself:

```tsx
const [cart, dispatch] = useReducer(cartReducer, loadCart('cart'))
```

```text
  loadCart("cart")
Cart render: 2 items, $78.00
CartButtons render
FreeShippingNote render
  loadCart("cart")
Cart render: 3 items, $96.00
FreeShippingNote render
  loadCart("cart")
Cart render: 4 items, $114.00
FreeShippingNote render
```

The result is the same, but `localStorage` is read and parsed on **every render**, and the value is thrown away after the first one.

### 5. The components

```tsx
function Cart({ useCartHook = useCart }) {
	const { cart, count, total, dispatch } = useCartHook()
	log(`Cart render: ${count} items, ${formatUSD(total)}`)
	return (
		<section className="cart">
			<h2 id="summary">
				{count} items · {formatUSD(total)}
			</h2>
			<ul>
				{cart.items.map((i) => (
					<li key={i.id}>
						<span>
							{byId(i.id).name} × {i.qty}
						</span>
						<button onClick={() => dispatch({ type: 'quantityChanged', id: i.id, qty: i.qty - 1 })}>−</button>
					</li>
				))}
			</ul>
			<CartButtons dispatch={dispatch} />
			<FreeShippingNote total={total} />
		</section>
	)
}

function FreeShippingNote({ total }: { total: number }) {
	log('FreeShippingNote render')
	return <p>{total >= 5000 ? 'Free shipping!' : `${formatUSD(5000 - total)} to free shipping`}</p>
}

const CartButtons = memo(function CartButtons({ dispatch }: { dispatch: Dispatch<CartAction> }) {
	log('CartButtons render')
	return (
		<p>
			<button id="add-mug" onClick={() => dispatch({ type: 'added', id: 'p1' })}>Add mug</button>
			<button id="add-lamp" onClick={() => dispatch({ type: 'added', id: 'p4' })}>Add lamp</button>
			<button id="remove-backpack" onClick={() => dispatch({ type: 'removed', id: 'p3' })}>Remove backpack</button>
			<button id="clear" onClick={() => dispatch({ type: 'cleared' })}>Clear</button>
		</p>
	)
})
```

Recorded, click by click. Mount:

```text
  loadCart("cart")
Cart render: 0 items, $0.00
CartButtons render
FreeShippingNote render
```

"Add mug":

```text
Cart render: 1 items, $18.00
FreeShippingNote render
```

"Remove backpack" (no backpack in the cart):

```text
Cart render: 3 items, $75.00
```

"Clear", then "Clear" again:

```text
Cart render: 0 items, $0.00
FreeShippingNote render
```

```text
Cart render: 0 items, $0.00
```

What to notice:

- **`CartButtons` rendered once, on mount.** It's wrapped in `memo`, and its only prop is `dispatch`, which is the same function on every render.
- **When the reducer returned the same object, `Cart` still ran**, but `FreeShippingNote` didn't. React runs the reducer while rendering `Cart`, so it only finds out "nothing changed" after `Cart` has started. It then **bails out**: it skips the children, and nothing on the page changes.
- "Clear" on an empty cart behaved the same way, because the `'cleared'` case returns `state` when there's nothing to clear.

### 6. A typo in an action type

```tsx
dispatch({ type: 'emptied' } as unknown as CartAction)
log('dispatch() returned normally')
```

```text
  loadCart("cart")
dispatch() returned normally
ErrorBoundary caught: Unknown action: emptied
```

`dispatch` itself didn't throw. It only queued the action. The reducer threw while React was rendering, so the **nearest error boundary** caught it ([Error Boundaries](../../fundamentals/error-boundaries/)). The TypeScript union normally prevents this typo; the `as unknown as` cast was needed to get past it.

## How it works

- **`dispatch` queues, the reducer computes.** Each `dispatch(action)` is added to the hook's update queue. On the next render, React runs `reducer(state, action)` for each queued action in order, each one getting the previous result. This is why a reducer never reads stale state (the bug in [useState vs useReducer](../../hooks/usestate-vs-usereducer/)).
- **Same state → bail out.** If the final state is `Object.is`-equal to the old one, React skips the component's children and doesn't commit. Return `state` itself when nothing changes, and a new object only when something does.
- **Reducers must be pure.** No mutation, no `localStorage`, no fetching. In development, Strict Mode calls your reducer twice to catch impure ones. Side effects belong in effects or event handlers.
- **Under the hood**, `useState` is `useReducer` with a built-in reducer, `(state, action) => typeof action === 'function' ? action(state) : action` ([Hooks Under the Hood](../../internals/hooks-under-the-hood/)).

## Common mistakes

- **Mutating state in the reducer** (`state.items.push(…); return state`). It returns the same object, so React bails out and nothing updates.
- **Calling the initializer yourself**: `useReducer(r, loadCart('cart'))` instead of `useReducer(r, 'cart', loadCart)`.
- **Putting side effects in the reducer** (saving, logging to a server). Use an effect, as `useCart` does with `localStorage`.
- **One reducer for unrelated values.** Independent values are simpler as separate `useState`s ([useState vs useReducer](../../hooks/usestate-vs-usereducer/)).

## Interview Q&A

<details class="qa"><summary>What's the signature of <code>useReducer</code>, and what does each part do?</summary>

`const [state, dispatch] = useReducer(reducer, initialArg, init?)`. `reducer(state, action)` returns the next state. `initialArg` is the initial state, or the argument passed to `init`. `dispatch(action)` queues an action for the next render.

</details>

<details class="qa"><summary>When is a reducer better than several <code>useState</code>s?</summary>

When values must change together, or one update depends on another value. A cart with add, remove, change-quantity and clear is a good example: one reducer keeps every transition in one place. Truly independent values are simpler as separate `useState`s.

</details>

<details class="qa"><summary>How do you test a reducer?</summary>

Call it. It's a pure `(state, action) => newState` function, so a test passes a state and an action and checks the result. Recorded: `cartReducer(empty, { type: 'added', id: 'p1' })` returned a cart with one mug, and `empty` was unchanged.

</details>

<details class="qa"><summary>What happens when the reducer returns the same state object?</summary>

React bails out: the children don't render and the page doesn't change. Recorded: "Remove backpack" on a cart without one logged `Cart render` but no `FreeShippingNote render`. The component itself still ran, because React computes reducer state while rendering it.

</details>

<details class="qa"><summary>Why is <code>dispatch</code> useful to pass down?</summary>

It has a stable identity: the same function for the component's whole life. A memoized child that receives only `dispatch` never re-renders because of it. Recorded: `CartButtons` rendered once, on mount.

</details>

<details class="qa"><summary>What's the third argument for?</summary>

A lazy initializer, called once with `initialArg` on mount. Use it for expensive setup like reading `localStorage`. Recorded: `loadCart` ran once over three renders, but on every render when called directly.

</details>

<details class="qa"><summary>How do you get type safety for actions?</summary>

Model them as a discriminated union on `type`. TypeScript narrows `action` in each `case`, so only the fields that action has are available, and a misspelled `type` is a type error.

</details>

## Related

- [useState vs useReducer](../../hooks/usestate-vs-usereducer/): when to choose which, and the stale-closure bug.
- [Building a Cart](../../hooks/building-a-cart/): the same cart built with `useState` updater functions.
- [Context with use](../../apis/context-with-use/): share `dispatch` with distant components.
- [Hooks Under the Hood](../../internals/hooks-under-the-hood/): the update queue both hooks use.

## Sources

- react.dev: [`useReducer`](https://react.dev/reference/react/useReducer), [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
