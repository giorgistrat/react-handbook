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

<figure class="fig anim fig-apis-store-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Stable snapshot</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">New object per call</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;state = { count: state.count + 1 } // new only when it changes&quot;,&quot;say&quot;:&quot;The store replaces its state with a new object, then calls every listener. React doesn’t own this state.&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;hl&quot;,&quot;s-add&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;listeners.forEach(l =&gt; l())&quot;,&quot;say&quot;:&quot;Each listener is React asking: did your snapshot change?&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;&quot;,&quot;s-add&quot;:&quot;&quot;,&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;getSnapshot: () =&gt; state,&quot;,&quot;say&quot;:&quot;&lt;code&gt;getSnapshot&lt;/code&gt; returns the store’s own object, a different one than last time, so React re-renders the components that read it, in &lt;b&gt;both&lt;/b&gt; roots.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;r-HeaderBadge&quot;:&quot;run&quot;,&quot;r-ProductPage&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;r-HeaderBadge&quot;:&quot;ran&quot;,&quot;r-ProductPage&quot;:&quot;ran&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;render HeaderBadge (1)&lt;/code&gt;, &lt;code&gt;render ProductPage (1)&lt;/code&gt;. When nothing changes, &lt;code&gt;getSnapshot&lt;/code&gt; returns the same object and React does nothing.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;s-badge&quot;:&quot;ok&quot;,&quot;s-add&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-badge&quot;:&quot;🛒 1&quot;,&quot;s-add&quot;:&quot;Add to cart (1 so far)&quot;}}]" data-intro="Click &lt;b&gt;Add to cart&lt;/b&gt; in the product page."><div class="anim-scn-title">Stable snapshot</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">cartStore.ts</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">let</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> state </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> count</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 0</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> listeners</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#8839EF;--shiki-light-font-weight:bold;--shiki-dark:#CBA6F7;--shiki-dark-font-weight:bold"> new</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Set</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> cartStore</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  getSnapshot</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> state</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  subscribe</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">listener</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> listeners</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">add</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(listener)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">;</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> listeners</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">delete</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(listener) </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">},</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  add</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    state </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> count</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> state</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">+</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 1</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic"> // new only when it changes</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    listeners</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">forEach</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">l</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> l</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">())</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  },</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useCartCount</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useSyncExternalStore</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(cartStore</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">subscribe</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> cartStore</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">getSnapshot)</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-text" data-k="s-badge">🛒 0</div><div class="an ca-item ca-button" data-k="s-add">Add to cart (0 so far)</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">HeaderBadge (root 1)</span><span class="an ca-rstate" data-k="r-HeaderBadge">–</span></div><div class="ca-r"><span class="ca-rname">ProductPage (root 2)</span><span class="an ca-rstate" data-k="r-ProductPage">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>state = { count: state.count + 1 } // new only when it changes</code><span>The store replaces its state with a new object, then calls every listener. React doesn’t own this state.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>listeners.forEach(l =&gt; l())</code><span>Each listener is React asking: did your snapshot change?</span></li><li><span class="anim-phase ph-render">render phase</span><code>getSnapshot: () =&gt; state,</code><span><code>getSnapshot</code> returns the store’s own object, a different one than last time, so React re-renders the components that read it, in <b>both</b> roots.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Recorded: <code>render HeaderBadge (1)</code>, <code>render ProductPage (1)</code>. When nothing changes, <code>getSnapshot</code> returns the same object and React does nothing.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;() =&gt; ({ ...cartStore.getSnapshot() }), // a new copy every call&quot;,&quot;say&quot;:&quot;Every call returns a &lt;b&gt;new object&lt;/b&gt;. In development React calls it twice to check it’s stable; two copies are never &lt;code&gt;Object.is&lt;/code&gt;-equal.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;hl&quot;,&quot;c-0&quot;:&quot;new&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return useSyncExternalStore(&quot;,&quot;say&quot;:&quot;So React thinks the store changed on every render, and schedules another render, again and again.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;c-0&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;r-BadBadge&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;r-BadBadge&quot;:&quot;ran again&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;Maximum update depth exceeded&lt;/code&gt;. Return the store’s own object, and create a new one only when something changes.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-badge&quot;:&quot;bad&quot;,&quot;r-BadBadge&quot;:&quot;bad&quot;,&quot;c-1&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;s-badge&quot;:&quot;(crashed)&quot;,&quot;r-BadBadge&quot;:&quot;error&quot;}}]" data-intro="&lt;code&gt;getSnapshot&lt;/code&gt; copies the state on every call."><div class="anim-scn-title">New object per call</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">cartStore.ts</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useCartBad</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useSyncExternalStore</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    cartStore</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">subscribe</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> ...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">cartStore</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">getSnapshot</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">() </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic"> // a new copy every call</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-text" data-k="s-badge">🛒 ?</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">BadBadge</span><span class="an ca-rstate" data-k="r-BadBadge">–</span></div></div><div class="ca-console"><div class="ca-title">Console (recorded)</div><div class="an ca-log" data-k="c-0" data-s="ghost">The result of getSnapshot should be cached to avoid an infinite loop</div><div class="an ca-log" data-k="c-1" data-s="ghost">Maximum update depth exceeded.</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>() =&gt; ({ ...cartStore.getSnapshot() }), // a new copy every call</code><span>Every call returns a <b>new object</b>. In development React calls it twice to check it’s stable; two copies are never <code>Object.is</code>-equal.</span></li><li><span class="anim-phase ph-render">render phase</span><code>return useSyncExternalStore(</code><span>So React thinks the store changed on every render, and schedules another render, again and again.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Recorded: <code>Maximum update depth exceeded</code>. Return the store’s own object, and create a new one only when something changes.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A cart store written in plain JavaScript, read by two separate React roots on one page (both versions recorded).</figcaption></figure>

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
