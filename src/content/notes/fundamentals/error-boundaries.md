---
title: "Error Boundaries"
slug: "error-boundaries"
module: "fundamentals"
order: 8
level: "must"
illus: "bolt"
summary: "Why try/catch can’t catch render errors, how a boundary contains them, what it can’t catch, and how reset works."
source: "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary"
---


## In one minute

If a component throws while rendering and nothing catches it, React removes the **whole app** from the page. You can't fix that with `try`/`catch` around JSX, because JSX only creates element objects: the component runs later, inside React. An **error boundary** is a component that catches errors thrown while rendering anything below it and shows a fallback instead, like a `catch` block for a part of the tree. Most apps use the small `react-error-boundary` package rather than writing the class component themselves.

**You'll be able to:** put boundaries in the right place, know which errors they can't see, and recover with "Try again".

<figure class="fig anim fig-fund-boundary-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">No boundary</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">With a boundary</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return &lt;p&gt;{formatUSD(product.price.cents)}&lt;/p&gt;&quot;,&quot;say&quot;:&quot;The product has no &lt;code&gt;price&lt;/code&gt;, so this throws: &lt;code&gt;Cannot read properties of undefined (reading 'cents')&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;,&quot;r-ProductDetails&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;r-ProductDetails&quot;:&quot;error&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return &lt;p&gt;{formatUSD(product.price.cents)}&lt;/p&gt;&quot;,&quot;say&quot;:&quot;React renders once more to rule out a one-off glitch (recorded: &lt;code&gt;ProductDetails renders p404&lt;/code&gt; twice). It throws again.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;,&quot;r-ProductDetails&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;r-ProductDetails&quot;:&quot;error&quot;}},{&quot;fn&quot;:&quot;&lt;main&gt;&quot;,&quot;say&quot;:&quot;React walks up the tree looking for an error boundary. There is none.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;With no boundary, React removes &lt;b&gt;everything&lt;/b&gt;. Recorded: &lt;code&gt;#root&lt;/code&gt; was empty, and &lt;code&gt;onUncaughtError&lt;/code&gt; fired.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;bad&quot;,&quot;r-ProductDetails&quot;:&quot;del&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;(blank page)&quot;,&quot;r-ProductDetails&quot;:&quot;unmounted&quot;}}]" data-intro="The broken product, rendered without protection."><div class="anim-scn-title">No boundary</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Store.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductDetails</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">formatUSD</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">price</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">cents)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">main</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">h1</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Store</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">h1</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ProductDetails</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">mysteryBox</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">main</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-page">Store · Mystery Box …</div></div><div class="ca-renders"><div class="ca-title">Components</div><div class="ca-r"><span class="ca-rname">ProductDetails (Mystery Box)</span><span class="an ca-rstate" data-k="r-ProductDetails">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>return &lt;p&gt;{formatUSD(product.price.cents)}&lt;/p&gt;</code><span>The product has no <code>price</code>, so this throws: <code>Cannot read properties of undefined (reading 'cents')</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>return &lt;p&gt;{formatUSD(product.price.cents)}&lt;/p&gt;</code><span>React renders once more to rule out a one-off glitch (recorded: <code>ProductDetails renders p404</code> twice). It throws again.</span></li><li><code>&lt;main&gt;</code><span>React walks up the tree looking for an error boundary. There is none.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>With no boundary, React removes <b>everything</b>. Recorded: <code>#root</code> was empty, and <code>onUncaughtError</code> fired.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return &lt;p&gt;{formatUSD(product.price.cents)}&lt;/p&gt;&quot;,&quot;say&quot;:&quot;The same error is thrown, this time inside an &lt;code&gt;ErrorBoundary&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;,&quot;r-ProductDetails&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;r-ProductDetails&quot;:&quot;error&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;ErrorBoundary FallbackComponent={ErrorFallback}&gt;&quot;,&quot;say&quot;:&quot;React retries once, then walks up and finds the &lt;b&gt;nearest&lt;/b&gt; boundary. It renders the boundary’s fallback instead of its children.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;r-ProductDetails&quot;:&quot;del&quot;},&quot;txt&quot;:{&quot;r-ProductDetails&quot;:&quot;unmounted&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Only that part of the page changes. Recorded screen: “Store”, “Couldn’t show this product: …”, “Try again”, and the healthy Ceramic Mug still there.&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Store · “Couldn’t show this product” [Try again] · Ceramic Mug $18.00&quot;}}]" data-intro="The same product inside an &lt;code&gt;ErrorBoundary&lt;/code&gt;, next to a healthy one."><div class="anim-scn-title">With a boundary</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Store.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductDetails</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">formatUSD</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">price</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">cents)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">main</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">h1</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Store</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">h1</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ErrorBoundary</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> FallbackComponent</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">ErrorFallback</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ProductDetails</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">mysteryBox</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ErrorBoundary</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ProductDetails</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">mug</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">main</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-page">Store · …</div></div><div class="ca-renders"><div class="ca-title">Components</div><div class="ca-r"><span class="ca-rname">ProductDetails (Mystery Box)</span><span class="an ca-rstate" data-k="r-ProductDetails">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>return &lt;p&gt;{formatUSD(product.price.cents)}&lt;/p&gt;</code><span>The same error is thrown, this time inside an <code>ErrorBoundary</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;ErrorBoundary FallbackComponent={ErrorFallback}&gt;</code><span>React retries once, then walks up and finds the <b>nearest</b> boundary. It renders the boundary’s fallback instead of its children.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Only that part of the page changes. Recorded screen: “Store”, “Couldn’t show this product: …”, “Try again”, and the healthy Ceramic Mug still there.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A product with no price throws while rendering. The error travels up to the nearest error boundary, like an exception to the nearest catch (both recorded).</figcaption></figure>

## The example: a product the API sent without a price

```tsx
function ProductDetails({ product }: { product: MaybeProduct }) {
	log(`ProductDetails renders ${product.id}`)
	return (
		<article className="product-card">
			<h2>{product.name}</h2>
			<p className="price">{formatUSD(product.price!.cents)}</p>
		</article>
	)
}
```

### Without a boundary

```tsx
r.render(
	<main>
		<h1>Store</h1>
		<ProductDetails product={broken} />
	</main>,
)
```

What the lesson logged (the root was created with `onUncaughtError` / `onCaughtError` callbacks):

```text
ProductDetails renders p404
ProductDetails renders p404
root: uncaught → Cannot read properties of undefined (reading 'cents')
```

And `#root` afterwards:

```text

```

Empty: the heading and everything else is gone. Notice `ProductDetails renders p404` twice: when a component throws, React renders it once more before giving up, in case the error was a one-off.

### With a boundary

```tsx
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	return (
		<div role="alert">
			<p>Couldn’t show this product: {(error as Error).message}</p>
			<button onClick={resetErrorBoundary}>Try again</button>
		</div>
	)
}
```

```tsx
r.render(
	<main>
		<h1>Store</h1>
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<ProductDetails product={broken} />
		</ErrorBoundary>
		<ProductDetails product={fine} />
	</main>,
)
```

The page text afterwards:

```js
[
  "Store",
  "Couldn’t show this product: Cannot read properties of undefined (reading 'cents')",
  "Try again",
  "Ceramic Mug",
  "$18.00"
]
```

Only the broken product was replaced. The heading and the healthy product next to it are still there.

## What a boundary can't catch

A boundary catches errors thrown **while React renders** (and in lifecycle methods). It can't see errors that happen outside rendering: event handlers, `setTimeout`, promises. For those, `useErrorBoundary().showBoundary(error)` hands the error to the nearest boundary yourself:

```tsx
function AddToCart() {
	const { showBoundary } = useErrorBoundary()
	return (
		<>
			<button id="unsafe" onClick={() => { throw new Error('Cart service is down') }}>
				Add to cart
			</button>
			<button id="safe" onClick={() => {
				try {
					throw new Error('Cart service is down')
				} catch (error) {
					showBoundary(error)
				}
			}}>
				Add to cart (reported)
			</button>
		</>
	)
}
```

Clicking "Add to cart":

```js
{
  "logs": [
    "window error event → Uncaught Error: Cart service is down"
  ],
  "warnings": [],
  "fallbackShown": false
}
```

Clicking "Add to cart (reported)":

```js
{
  "logs": [
    "root: caught by a boundary → Cart service is down"
  ],
  "warnings": [],
  "fallbackShown": true,
  "text": [
    "Couldn’t show this product: Cart service is down",
    "Try again"
  ]
}
```

A boundary also can't catch an error in **itself** or in its **fallback**: those go to the next boundary up.

## Trying again

`resetErrorBoundary` (passed to the fallback) clears the error and mounts the children **again from scratch**. Pair it with `onReset` to fix whatever caused the error:

```tsx
function Page() {
	const [product, setProduct] = useState(broken)
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setProduct(fine)}>
			<Note />
			<ProductDetails product={product} />
		</ErrorBoundary>
	)
}
```

```js
{
  "logs": [
    "ProductDetails renders p404",
    "ProductDetails renders p404",
    "root: caught by a boundary → Cannot read properties of undefined (reading 'cents')",
    "ProductDetails renders p1"
  ],
  "warnings": [],
  "before": [
    "Couldn’t show this product: Cannot read properties of undefined (reading 'cents')",
    "Try again"
  ],
  "after": [
    "Ceramic Mug",
    "$18.00"
  ]
}
```

The note input was inside the boundary, so it disappeared with the error and came back empty: a reset re-mounts, it doesn't restore state.

## Where to put boundaries

- **The component that may throw must be a child of the boundary**, not the component that renders the boundary. A boundary only catches errors from the tree below it.
- One boundary near the root avoids blank pages; smaller ones around independent widgets (a product, a review list, a sidebar) keep the rest of the page usable.
- Still log everything: React 19's `createRoot(container, { onCaughtError, onUncaughtError })` runs for every error, caught or not.

## Interview Q&A

<details class="qa"><summary>Why can't <code>try</code>/<code>catch</code> around JSX catch render errors?</summary>

JSX only builds element objects. The component function runs later, when React renders, long after the `try` block has finished. Errors thrown there are caught by React, which looks for an error boundary above the component.

</details>

<details class="qa"><summary>Why must the component that might throw be inside the boundary?</summary>

A boundary catches errors from its descendants only. If the risky code is in the same component that renders the boundary, the error happens before the boundary exists in the tree.

</details>

<details class="qa"><summary>What happens to the page when a render error isn't caught?</summary>

React unmounts the whole root. Recorded: `#root` was `""` and `onUncaughtError` fired. With a boundary, only that subtree showed the fallback; the rest of the page stayed.

</details>

<details class="qa"><summary>Which errors can't an error boundary catch?</summary>

Errors in event handlers, timers and async code (they don't happen during rendering), errors in the boundary itself, and errors in its fallback. Recorded: an error thrown in an `onClick` reached `window`'s error event and no fallback appeared; with `showBoundary(error)` the fallback appeared.

</details>

<details class="qa"><summary>What does <code>resetErrorBoundary</code> do?</summary>

It clears the error and mounts the boundary's children again as if for the first time, so their local state is lost. Use `onReset` to change whatever caused the error, otherwise it will just throw again.

</details>

<details class="qa"><summary>Why does an error boundary have to be a class component?</summary>

The APIs React uses to catch render errors, `static getDerivedStateFromError` and `componentDidCatch`, only exist on class components. Libraries like `react-error-boundary` wrap that class so you can use it as a regular component plus hooks.

</details>

## Related

- [Forms](../../fundamentals/forms/): errors thrown in event handlers and actions.
- [Rendering Arrays](../../fundamentals/rendering-arrays/): another way to remount a subtree, with `key`.

## Sources

- react.dev: [Catching rendering errors with an error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary), [`createRoot` options](https://react.dev/reference/react-dom/client/createRoot#parameters)
- [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
