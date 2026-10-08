---
title: "useSyncExternalStore"
slug: "usesyncexternalstore"
module: "apis"
order: 6
level: "good"
illus: "loop"
summary: "Read state React doesn’t own (the browser, a plain JS store) safely, with stable snapshots and a server value."
source: "https://react.dev/reference/react/useSyncExternalStore"
---


## In one minute

Some state lives **outside React**: the browser's online status, `localStorage`, a plain JavaScript store, a third-party library. `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` lets components read it and re-render when it changes:

- `subscribe(onChange)` connects to the store and returns an unsubscribe function.
- `getSnapshot()` returns the current value. When nothing changed, it must return **the same value**.
- `getServerSnapshot()` gives the value to use on the server and during hydration.

It's safer than `useEffect` + `useState`, because React can check the store during rendering and never show two different versions at once ("tearing"). State libraries like Redux and Zustand are built on it.

**You'll be able to:** subscribe to a browser API and to your own store, and avoid the two classic mistakes: an unstable snapshot and a missing server snapshot.

<figure class="fig anim fig-apis-store-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Stable snapshot</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">New object per call</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;cartStore.add()&quot;,&quot;say&quot;:&quot;The store replaces its state with a new object, then calls every listener. React doesn’t own this state.&quot;,&quot;set&quot;:{&quot;state&quot;:&quot;upd&quot;,&quot;ls&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;state&quot;:&quot;state = { count: 1 } (new)&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;listener() → getSnapshot()&quot;,&quot;say&quot;:&quot;Each listener is React asking “did your snapshot change?”. &lt;code&gt;getSnapshot&lt;/code&gt; returns the store’s own object.&quot;,&quot;set&quot;:{&quot;ls&quot;:&quot;&quot;,&quot;snap&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;snap&quot;:&quot;returns state&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Object.is → false&quot;,&quot;say&quot;:&quot;A different object than last time, so React re-renders the components that read it, in &lt;b&gt;both&lt;/b&gt; roots.&quot;,&quot;set&quot;:{&quot;snap&quot;:&quot;&quot;,&quot;cmp&quot;:&quot;cmp&quot;,&quot;hdr&quot;:&quot;run&quot;,&quot;pg&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;hdr&quot;:&quot;HeaderBadge (1)&quot;,&quot;pg&quot;:&quot;ProductPage (1)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;render HeaderBadge (1)&lt;/code&gt;, &lt;code&gt;render ProductPage (1)&lt;/code&gt;; the badge shows 🛒 1. When nothing changed, &lt;code&gt;getSnapshot&lt;/code&gt; returns the same object and React does nothing.&quot;,&quot;set&quot;:{&quot;cmp&quot;:&quot;ok&quot;,&quot;hdr&quot;:&quot;done&quot;,&quot;pg&quot;:&quot;done&quot;}}]" data-intro="Click “Add to cart” in the product page root."><div class="anim-scn-title">Stable snapshot</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">cartStore (plain JS)</div><div class="a-col"><span class="an chip-a" data-k="state" data-s="faint">state = { count: 0 }</span><span class="an chip-a" data-k="ls" data-s="faint">listeners: 2</span></div></div><div class="a-panel "><div class="a-panel-title">getSnapshot()</div><div class="a-col"><span class="an chip-a" data-k="snap" data-s="faint">() => state</span><span class="an chip-a" data-k="cmp" data-s="ghost">Object.is(last, next)</span></div></div><div class="a-panel "><div class="a-panel-title">two React roots</div><div class="a-col"><span class="an chip-a" data-k="hdr" data-s="faint">HeaderBadge (0)</span><span class="an chip-a" data-k="pg" data-s="faint">ProductPage (0)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>cartStore.add()</code><span>The store replaces its state with a new object, then calls every listener. React doesn’t own this state.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>listener() → getSnapshot()</code><span>Each listener is React asking “did your snapshot change?”. <code>getSnapshot</code> returns the store’s own object.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Object.is → false</code><span>A different object than last time, so React re-renders the components that read it, in <b>both</b> roots.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>Recorded: <code>render HeaderBadge (1)</code>, <code>render ProductPage (1)</code>; the badge shows 🛒 1. When nothing changed, <code>getSnapshot</code> returns the same object and React does nothing.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;getSnapshot() → { ...state }&quot;,&quot;say&quot;:&quot;This &lt;code&gt;getSnapshot&lt;/code&gt; copies the state: a &lt;b&gt;new object on every call&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;snap&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;snap&quot;:&quot;returns a new copy&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Object.is(copy1, copy2) → false&quot;,&quot;say&quot;:&quot;React calls it twice to check it’s stable. Two copies are never &lt;code&gt;Object.is&lt;/code&gt;-equal, so React thinks the store changed.&quot;,&quot;set&quot;:{&quot;cmp&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render → getSnapshot → “changed” → render …&quot;,&quot;say&quot;:&quot;Each render sees “a change” and schedules another. Recorded warning: &lt;code&gt;The result of getSnapshot should be cached to avoid an infinite loop&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;hdr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;hdr&quot;:&quot;BadBadge: re-render loop&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;uncaught error&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;Maximum update depth exceeded&lt;/code&gt;. Return the store’s own object, and make the store create a new one only when something changes.&quot;,&quot;set&quot;:{}}]" data-intro="&lt;code&gt;getSnapshot&lt;/code&gt; written as &lt;code&gt;() =&amp;gt; ({ ...store.getSnapshot() })&lt;/code&gt;."><div class="anim-scn-title">New object per call</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">cartStore (plain JS)</div><div class="a-col"><span class="an chip-a" data-k="state" data-s="faint">state = { count: 0 }</span><span class="an chip-a" data-k="ls" data-s="faint">listeners: 2</span></div></div><div class="a-panel "><div class="a-panel-title">getSnapshot()</div><div class="a-col"><span class="an chip-a" data-k="snap" data-s="faint">() => ({ ...state })</span><span class="an chip-a" data-k="cmp" data-s="ghost">Object.is(last, next)</span></div></div><div class="a-panel "><div class="a-panel-title">two React roots</div><div class="a-col"><span class="an chip-a" data-k="hdr" data-s="faint">HeaderBadge (0)</span><span class="an chip-a" data-k="pg" data-s="faint">ProductPage (0)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>getSnapshot() → { ...state }</code><span>This <code>getSnapshot</code> copies the state: a <b>new object on every call</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Object.is(copy1, copy2) → false</code><span>React calls it twice to check it’s stable. Two copies are never <code>Object.is</code>-equal, so React thinks the store changed.</span></li><li><span class="anim-phase ph-render">render phase</span><code>render → getSnapshot → “changed” → render …</code><span>Each render sees “a change” and schedules another. Recorded warning: <code>The result of getSnapshot should be cached to avoid an infinite loop</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>uncaught error</code><span>Recorded: <code>Maximum update depth exceeded</code>. Return the store’s own object, and make the store create a new one only when something changes.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="cmp"></i>being compared</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A cart store outside React, read by two separate roots (both versions recorded).</figcaption></figure>

## The example

### 1. Online status

```tsx
function subscribe(onChange: () => void) {
	window.addEventListener('online', onChange)
	window.addEventListener('offline', onChange)
	return () => {
		window.removeEventListener('online', onChange)
		window.removeEventListener('offline', onChange)
	}
}

function useOnlineStatus() {
	return useSyncExternalStore(
		subscribe,
		() => navigator.onLine, // on the client
		() => true, // on the server, and during hydration
	)
}

function CheckoutButton() {
	const online = useOnlineStatus()
	return <button disabled={!online}>{online ? 'Place order' : 'Offline: reconnect to order'}</button>
}
```

`subscribe` is defined outside the component, so it's the same function every render, and React doesn't resubscribe. Recorded while Chrome was switched offline and back:

```js
{
  "logs": [],
  "warnings": [],
  "before": "Place order",
  "offline": {
    "text": "Offline: reconnect to order",
    "disabled": true
  },
  "back": "Place order"
}
```

### 2. A cart store shared by two React roots

Some pages have more than one React root: say, an older header and a new product page. They can't share React state or context, but they can share a store.

```tsx
type Cart = { count: number }

function createCartStore() {
	let state: Cart = { count: 0 }
	const listeners = new Set<() => void>()
	return {
		getSnapshot: () => state,
		subscribe(listener: () => void) {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
		add() {
			state = { count: state.count + 1 } // a new object only when something changed
			listeners.forEach((l) => l())
		},
	}
}

const cartStore = createCartStore()

function useCartCount() {
	return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot).count
}
```

```tsx
function HeaderBadge() {
	const count = useCartCount()
	log(`render HeaderBadge (${count})`)
	return <span id="badge">🛒 {count}</span>
}

function ProductPage() {
	const count = useCartCount()
	log(`render ProductPage (${count})`)
	return <button id="add" onClick={cartStore.add}>Add to cart ({count} so far)</button>
}

// Two separate React apps on one page, e.g. an older header and a new product page
function mountBoth(header: HTMLElement, page: HTMLElement) {
	createRoot(header).render(<HeaderBadge />)
	createRoot(page).render(<ProductPage />)
}
```

Clicking "Add to cart" in the product page:

```text
render HeaderBadge (1)
render ProductPage (1)
```

Both roots re-rendered. The header badge now shows `🛒 1`.

### 3. Mistake: a new snapshot on every call

```tsx
function useCartBad() {
	return useSyncExternalStore(cartStore.subscribe, () => ({ ...cartStore.getSnapshot() }))
}
```

Recorded:

```text
The result of getSnapshot should be cached to avoid an infinite loop
```

```text
uncaught: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

Every call returns a new object, so to React the store looks like it changes on every render, which schedules another render, and so on. The store above avoids this by creating a new state object only in `add()`.

### 4. Mistake: no server snapshot

```tsx
function useOnlineStatusClientOnly() {
	return useSyncExternalStore(subscribe, () => navigator.onLine)
}
```

Rendering both buttons with `renderToString`, as a server would:

```tsx
log('with getServerSnapshot:', renderToString(<CheckoutButton />))
try {
	log('without:', renderToString(<ClientOnlyButton />))
} catch (e) {
	log('without: threw', (e as Error).message)
}
```

```text
with getServerSnapshot: <button>Place order</button>
without: threw Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.
```

The server has no `navigator.onLine`. With `getServerSnapshot`, it renders "Place order", and the client updates after hydration if the real value is different. Without it, server rendering fails, and React falls back to rendering that part on the client.

## How it works

- **Subscribe once, read on every render.** React calls `subscribe` after mounting (and again only if you pass a different `subscribe` function). On every render it calls `getSnapshot` and compares the result with the last one using `Object.is`.
- **Changes come from the store.** When the store calls the listener, React calls `getSnapshot` again. If the snapshot changed, it re-renders that component. Updates from external stores are rendered synchronously, never as a background transition, so the screen can't show a mix of old and new store values.
- **The snapshot must be immutable and cached.** Return the store's own value, and replace it with a new object only when something changes. In development, React calls `getSnapshot` twice and warns if the results differ (recorded).
- **Select small values.** `useCartCount()` returns `count`, a number, so components re-render only when the number changes. For derived objects, memoize them in the store, or use a library's selector API.

## Common mistakes

- **Building a new object or array in `getSnapshot`**: `() => ({ ...state })`, `() => items.filter(…)`. This causes an infinite loop (recorded).
- **Defining `subscribe` inside the component** without `useCallback`: React unsubscribes and resubscribes on every render.
- **Leaving out `getServerSnapshot` in server-rendered apps** (recorded error).
- **Using it for state React could own.** If the state is only used by your components, `useState`, `useReducer` or context is simpler.

## Interview Q&A

<details class="qa"><summary>What problem does <code>useSyncExternalStore</code> solve?</summary>

Reading state that lives outside React and re-rendering when it changes, without tearing during concurrent rendering. A hand-rolled `useEffect` + `useState` subscription can miss updates between render and subscribe, and can show inconsistent values.

</details>

<details class="qa"><summary>What are its arguments?</summary>

`subscribe(callback)` registers a listener and returns an unsubscribe function, and should be stable. `getSnapshot()` returns the current value and must return the same value when nothing changed. `getServerSnapshot()` is optional; it supplies the value for server rendering and hydration.

</details>

<details class="qa"><summary>What happens if <code>getSnapshot</code> returns a new object every call?</summary>

React sees a change on every render and loops. Recorded: the warning "The result of getSnapshot should be cached to avoid an infinite loop", then "Maximum update depth exceeded".

</details>

<details class="qa"><summary>Why does <code>getServerSnapshot</code> matter?</summary>

There's no browser store on the server, and the first client render must match the server HTML. Recorded: without it, `renderToString` threw "Missing getServerSnapshot, which is required for server-rendered content."

</details>

<details class="qa"><summary>Do you usually call it directly?</summary>

Not often. Redux, Zustand and similar libraries call it inside their hooks. Calling it directly is reasonable for browser APIs (online status, media queries, `localStorage`) and small app-specific stores. Recorded: one store kept two separate React roots in sync.

</details>

## Related

- [Context with use](../../apis/context-with-use/): shared state inside React.
- [Side Effects](../../hooks/side-effects/): why subscriptions need cleanup.
- [Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/): why store updates are rendered synchronously.

## Sources

- react.dev: [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), [Subscribing to an external store](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)
- The `useSyncExternalStore` working-group discussion: [What is tearing?](https://github.com/reactwg/react-18/discussions/69)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
