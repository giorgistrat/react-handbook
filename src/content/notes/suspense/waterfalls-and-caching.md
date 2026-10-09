---
title: "Waterfalls and Caching"
slug: "waterfalls-and-caching"
module: "suspense"
order: 5
level: "must"
illus: "pipeline"
summary: "Requests that wait for each other, starting them together, and the HTTP cache that survives a reload."
source: "https://react.dev/reference/react/Suspense"
---


## In one minute

With `use`, it's easy to load things **one after another** without meaning to: a component suspends on the product, and only when that's done do its children render and *start* their own requests (the picture, the reviews). That's a **waterfall**: the total time is the sum of the requests. The fix is to **start** everything a screen needs before (or while) waiting for any of it: in the click handler, a route loader, or at the top of the page. Starting is cheap; only `use` waits. Separately, the in-memory promise cache disappears on reload; an HTTP **`Cache-Control: max-age`** header lets the browser reuse a response without asking the server again.

**You'll be able to:** spot a request waterfall, load a page's data in parallel, and use HTTP caching under the promise cache.

<figure class="fig anim fig-suspense-waterfall-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Fetch on render</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Start everything first</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;0 ms  → GET /products/p4&quot;,&quot;say&quot;:&quot;&lt;code&gt;ProductPage&lt;/code&gt; renders and suspends on the product.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;300 ms  → GET /img/p4.svg&quot;,&quot;say&quot;:&quot;Only once the product is known do its children render and ask for the picture…&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;900 ms  → GET /products/p4/reviews&quot;,&quot;say&quot;:&quot;…and here even the reviews waited for the picture: the second request’s component didn’t render until the first was done.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;1200 ms  page complete&quot;,&quot;say&quot;:&quot;Three steps, one after another: 1,200 ms.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;bad&quot;}}]" data-intro="Each component starts its own request when it renders."><div class="anim-scn-title">Fetch on render</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">0 ms  → GET /products/p4</div><div class="an" data-k="l1" data-s="ghost">300 ms  → GET /img/p4.svg</div><div class="an" data-k="l2" data-s="ghost">900 ms  → GET /products/p4/reviews</div><div class="an" data-k="l3" data-s="ghost">1200 ms  page complete</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>0 ms  → GET /products/p4</code><span><code>ProductPage</code> renders and suspends on the product.</span></li><li><span class="anim-phase ph-render">render phase</span><code>300 ms  → GET /img/p4.svg</code><span>Only once the product is known do its children render and ask for the picture…</span></li><li><span class="anim-phase ph-render">render phase</span><code>900 ms  → GET /products/p4/reviews</code><span>…and here even the reviews waited for the picture: the second request’s component didn’t render until the first was done.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>1200 ms  page complete</code><span>Three steps, one after another: 1,200 ms.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;0 ms  → product, reviews and picture&quot;,&quot;say&quot;:&quot;All three requests start together, from code that runs before React renders (a route loader, a click handler).&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;300 ms  ← product, reviews&quot;,&quot;say&quot;:&quot;The page renders as soon as the data is there.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;600 ms  page complete&quot;,&quot;say&quot;:&quot;Total time = the slowest request: 600 ms, half of the waterfall.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;ok&quot;}}]" data-intro="&lt;code&gt;startLoading(id)&lt;/code&gt; before rendering."><div class="anim-scn-title">Start everything first</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">0 ms  → product, reviews and picture</div><div class="an" data-k="l1" data-s="ghost">300 ms  ← product, reviews</div><div class="an" data-k="l2" data-s="ghost">600 ms  page complete</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>0 ms  → product, reviews and picture</code><span>All three requests start together, from code that runs before React renders (a route loader, a click handler).</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>300 ms  ← product, reviews</code><span>The page renders as soon as the data is there.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>600 ms  page complete</code><span>Total time = the slowest request: 600 ms, half of the waterfall.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A product page that needs the product (300 ms), its picture (600 ms) and its reviews (300 ms), recorded.</figcaption></figure>

## The example: one product page, three requests

The page needs the product (300 ms), its reviews (300 ms) and its picture (600 ms).

### 1. Fetch on render

```tsx
function ProductPage({ id }: { id: string }) {
	const product = use(getProduct(id)) // 1. wait for the product…
	return (
		<article>
			<h2 data-details={product.name}>{product.name}</h2>
			<Suspense fallback={<p data-fallback>Loading picture and reviews…</p>}>
				<ProductImage src={product.image} /> {/* 2. …only then ask for the picture */}
				<Reviews id={id} /> {/* …and the reviews */}
			</Suspense>
		</article>
	)
}

function ProductImage({ src }: { src: string }) {
	use(preloadImage(src))
	return <img src={src} alt="" data-img={src.match(/(\w+)\.svg/)![1]} />
}

function Reviews({ id }: { id: string }) {
	const reviews = use(getReviews(id))
	return <p data-note>{reviews.length} review(s)</p>
}
```

```text
0 ms  → GET /products/p4
screen: fallback “Loading product…”
300 ms  ← GET /products/p4
300 ms  → GET /img/p4.svg
screen: details: Desk Lamp · fallback “Loading picture and reviews…”
900 ms  ← GET /img/p4.svg
900 ms  → GET /products/p4/reviews
1200 ms  ← GET /products/p4/reviews
screen: details: Desk Lamp · image: p4 · 0 review(s)
```

Three steps: the picture started only after the product arrived, and here even the reviews started only after the picture had loaded. The page took 1,200 ms.

### 2. Start everything first

```tsx
function startLoading(id: string) {
	// start everything the page needs before rendering it (e.g. in a route loader or click handler)
	getProduct(id)
	getReviews(id)
	preloadImage(`/img/${id}.svg`)
}
```

The same components, with `startLoading('p4')` called before rendering:

```text
0 ms  → GET /products/p4
0 ms  → GET /products/p4/reviews
0 ms  → GET /img/p4.svg
screen: fallback “Loading product…”
300 ms  ← GET /products/p4
300 ms  ← GET /products/p4/reviews
screen: details: Desk Lamp · fallback “Loading picture and reviews…”
600 ms  ← GET /img/p4.svg
screen: details: Desk Lamp · image: p4 · 0 review(s)
```

All three requests started at 0 ms; the page was complete at 600 ms, the time of the slowest request. The components didn't change: their `use` calls find the promises already in the caches.

### React 19 pre-warming

When a component suspends, React 19 commits the fallback and then renders the suspended tree again in the background, so that **siblings** get a chance to start their requests. Two siblings in one boundary:

```tsx
function SiblingsPage({ id }: { id: string }) {
	return (
		<Suspense fallback={<p data-fallback>Loading…</p>}>
			<ProductName id={id} />
			<Reviews id={id} />
		</Suspense>
	)
}

function ProductName({ id }: { id: string }) {
	const product = use(getProduct(id))
	return <h2 data-details={product.name}>{product.name}</h2>
}
```

```text
0 ms  → GET /products/p4
screen: fallback “Loading…”
0 ms  → GET /products/p4/reviews
300 ms  ← GET /products/p4
300 ms  ← GET /products/p4/reviews
screen: details: Desk Lamp · 0 review(s)
```

The reviews request started right after the fallback, in parallel. But it can't help when one request depends on another (the picture URL comes from the product), and in the nested case above it didn't help either. Don't count on it: start requests explicitly.

## The HTTP cache

The promise cache lives in memory: a reload starts from scratch. The server can let the browser keep a response with a header. Two page loads of an exchange-rate endpoint, with and without `Cache-Control: max-age=60`:

```tsx
const response = await fetch(url)
const rate = await response.json()
```

Without (`no-store`), after the reload:

```text
cache-control: no-store
server has been hit 2 time(s) · from the browser cache: false
```

With `max-age=60`, after the reload:

```text
cache-control: max-age=60
server has been hit 1 time(s) · from the browser cache: true
```

The second load came from the browser's cache, and the server was asked only once. The two caches stack: the promise cache avoids repeat requests within a page; the HTTP cache avoids them across loads.

## How it works

- **Starting ≠ waiting.** Calling `getProduct(id)` starts the request and caches the promise. Only `use` waits. Start early, wait late.
- **Render-as-you-fetch** means starting requests when you know you'll need them (on click, on route change), then rendering, instead of letting each component fetch when it renders (fetch-on-render). Frameworks' route loaders do this.
- **Dependent data stays sequential.** If B needs A's result, it waits. Reduce those dependencies (here, the picture URL can be derived from the id), or have the server return both.
- **`Cache-Control` directives:** `max-age=N` reuse for N seconds; `no-cache` store but revalidate with the server each time; `no-store` never store; `private` only the browser, not shared caches; `stale-while-revalidate` serve stale while refreshing.

## Common mistakes

- **Requests started inside the component that needs them,** when the data is known earlier.
- **`use` on one promise before even creating the next** in the same component: create both promises first, then `use` them.
- **Caching personal or fast-changing data** with `max-age`, or with `public` on shared caches.

## Interview Q&A

<details class="qa"><summary>What is a request waterfall, and why does Suspense make it easy?</summary>

Requests that run one after another although they could run together. With fetch-on-render, a child's request only starts when its parent has finished suspending. Recorded: 1,200 ms in three steps.

</details>

<details class="qa"><summary>How do you load in parallel?</summary>

Start all the requests before waiting on any: in an event handler or route loader, or at the top of the page. Recorded: everything started at 0 ms, done at 600 ms.

</details>

<details class="qa"><summary>Doesn't React 19 fix waterfalls?</summary>

Partly. It pre-renders siblings of a suspended component so their requests start early (recorded in the sibling case). It can't fix dependent requests, and it didn't help in the nested case recorded here.

</details>

<details class="qa"><summary>How is the HTTP cache different from caching promises?</summary>

The promise cache is per page and in memory. The HTTP cache is the browser's, survives reloads, and is controlled by the server's `Cache-Control` header. Recorded: with `max-age=60`, the reload was served from the browser cache.

</details>

<details class="qa"><summary><code>no-cache</code> vs <code>no-store</code>?</summary>

`no-cache` may store the response but must check with the server before reusing it; `no-store` never stores it.

</details>

## Related

- [Data Fetching with use](../../suspense/data-fetching/) and [Promise Caching and Transitions](../../suspense/promise-caching/): `use` and promise caches.
- [Suspending on Images](../../suspense/suspending-on-images/): the image preload used here.
- [Code Splitting](../../performance/code-splitting/): prefetching code on intent.

## Sources

- react.dev: [`Suspense`](https://react.dev/reference/react/Suspense), [React 19 upgrade guide: improvements to Suspense](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#improvements-to-suspense)
- MDN: [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
