---
title: "Data Fetching with use"
slug: "data-fetching"
module: "suspense"
order: 0
level: "must"
illus: "plane"
summary: "Promises, use(promise), Suspense and error boundaries, and what really happens when use “throws”."
source: "https://react.dev/reference/react/use"
---


## In one minute

A component function must finish synchronously, so it can't `await`. `use(promise)` gets around that: if the promise has a value, `use` returns it; if it's **pending**, `use` interrupts the render and React shows the nearest `<Suspense>` **fallback**, then renders the component again when the promise settles. If the promise **rejects**, `use` throws the error and the nearest **error boundary** shows its fallback. Put the error boundary *outside* the `Suspense`, so one wrapper handles both loading and failure. And the promise must be created **once** (before rendering, or from a cache), never inside the component: a new promise every render means waiting forever.

**You'll be able to:** fetch data with `use`, `Suspense` and an error boundary, and explain what `use` actually throws.

<figure class="fig anim fig-suspense-use-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Fulfilled</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Rejected</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;0 ms  → GET /products/p4&quot;,&quot;say&quot;:&quot;The request starts &lt;b&gt;before&lt;/b&gt; React renders, and its promise is passed down as a prop.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;ProductDetails render started&quot;,&quot;say&quot;:&quot;&lt;code&gt;use(productPromise)&lt;/code&gt;: the promise is pending, so &lt;code&gt;use&lt;/code&gt; throws a special exception and the render stops here.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;upd&quot;,&quot;scr&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;rendering…&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: fallback “Loading product…”&quot;,&quot;say&quot;:&quot;React catches it, finds the nearest &lt;code&gt;&amp;lt;Suspense&amp;gt;&lt;/code&gt; and commits its fallback.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;new&quot;,&quot;scr&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Loading product…&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;300 ms  ← GET /products/p4&quot;,&quot;say&quot;:&quot;The promise fulfills. React was listening (&lt;code&gt;.then&lt;/code&gt;) and schedules a retry.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;ProductDetails render finished&quot;,&quot;say&quot;:&quot;This time &lt;code&gt;use&lt;/code&gt; returns the product &lt;b&gt;synchronously&lt;/b&gt;, and the component runs to the end.&quot;,&quot;set&quot;:{&quot;l4&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: details: Desk Lamp&quot;,&quot;say&quot;:&quot;The fallback is replaced by the content.&quot;,&quot;set&quot;:{&quot;l5&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Desk Lamp · $39.00&quot;}}]" data-intro="&lt;code&gt;fetchProduct('p4')&lt;/code&gt; started before rendering."><div class="anim-scn-title">Fulfilled</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">0 ms  → GET /products/p4</div><div class="an" data-k="l1" data-s="ghost">ProductDetails render started</div><div class="an" data-k="l2" data-s="ghost">screen: fallback “Loading product…”</div><div class="an" data-k="l3" data-s="ghost">300 ms  ← GET /products/p4</div><div class="an" data-k="l4" data-s="ghost">ProductDetails render finished</div><div class="an" data-k="l5" data-s="ghost">screen: details: Desk Lamp</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">(blank)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>0 ms  → GET /products/p4</code><span>The request starts <b>before</b> React renders, and its promise is passed down as a prop.</span></li><li><span class="anim-phase ph-render">render phase</span><code>ProductDetails render started</code><span><code>use(productPromise)</code>: the promise is pending, so <code>use</code> throws a special exception and the render stops here.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: fallback “Loading product…”</code><span>React catches it, finds the nearest <code>&lt;Suspense&gt;</code> and commits its fallback.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>300 ms  ← GET /products/p4</code><span>The promise fulfills. React was listening (<code>.then</code>) and schedules a retry.</span></li><li><span class="anim-phase ph-render">render phase</span><code>ProductDetails render finished</code><span>This time <code>use</code> returns the product <b>synchronously</b>, and the component runs to the end.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: details: Desk Lamp</code><span>The fallback is replaced by the content.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;0 ms  → GET /products/p999&quot;,&quot;say&quot;:&quot;Same start.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: fallback “Loading product…”&quot;,&quot;say&quot;:&quot;Pending, so the fallback shows.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;new&quot;,&quot;scr&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Loading product…&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;300 ms  ✗ No product with id \&quot;p999\&quot;&quot;,&quot;say&quot;:&quot;The promise rejects.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;ProductDetails render started (×2)&quot;,&quot;say&quot;:&quot;On the retry, &lt;code&gt;use&lt;/code&gt; throws the rejection &lt;b&gt;reason&lt;/b&gt;, a real error. React renders once more to be sure, then gives up.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: error “Couldn’t load this product.”&quot;,&quot;say&quot;:&quot;The nearest &lt;b&gt;error boundary&lt;/b&gt; (outside the &lt;code&gt;Suspense&lt;/code&gt;) shows its fallback.&quot;,&quot;set&quot;:{&quot;l4&quot;:&quot;bad&quot;,&quot;scr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Couldn’t load this product.&quot;}}]" data-intro="The same page for a product that doesn’t exist."><div class="anim-scn-title">Rejected</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">0 ms  → GET /products/p999</div><div class="an" data-k="l1" data-s="ghost">screen: fallback “Loading product…”</div><div class="an" data-k="l2" data-s="ghost">300 ms  ✗ No product with id "p999"</div><div class="an" data-k="l3" data-s="ghost">ProductDetails render started (×2)</div><div class="an" data-k="l4" data-s="ghost">screen: error “Couldn’t load this product.”</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">(blank)</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>0 ms  → GET /products/p999</code><span>Same start.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: fallback “Loading product…”</code><span>Pending, so the fallback shows.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>300 ms  ✗ No product with id "p999"</code><span>The promise rejects.</span></li><li><span class="anim-phase ph-render">render phase</span><code>ProductDetails render started (×2)</code><span>On the retry, <code>use</code> throws the rejection <b>reason</b>, a real error. React renders once more to be sure, then gives up.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: error “Couldn’t load this product.”</code><span>The nearest <b>error boundary</b> (outside the <code>Suspense</code>) shows its fallback.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Opening a product page whose data takes 300 ms (both recorded).</figcaption></figure>

## Promises in two minutes

A promise is a value that stands for a result that isn't ready yet. It starts **pending** and settles exactly once, **fulfilled** with a value or **rejected** with a reason. `.then` callbacks never run synchronously, even for a promise that's already settled: they run after the current code, as microtasks.

```tsx
const promise = new Promise<string>((resolve) => setTimeout(() => resolve('Desk Lamp'), 100))
log('1. promise created, state: pending')
promise.then((name) => log(`3. then() callback: ${name}`))
log('2. after then(): callbacks never run synchronously')
Promise.resolve('already done').then((v) => log(`2b. even an already-resolved promise waits for a microtask: ${v}`))
log('2a. still synchronous')
```

```text
1. promise created, state: pending
2. after then(): callbacks never run synchronously
2a. still synchronous
2b. even an already-resolved promise waits for a microtask: already done
3. then() callback: Desk Lamp
```

Two things Suspense relies on: a promise is an ordinary value you can pass around and store (so React can keep it and attach its own `.then`), and its state can be checked later without re-running the work.

## The example: a product page

```tsx
function ProductDetails({ productPromise }: { productPromise: Promise<Details> }) {
	log('  ProductDetails render started')
	const product = use(productPromise) // suspends while the promise is pending
	log('  ProductDetails render finished')
	return (
		<section data-details={product.name}>
			<h2>{product.name}</h2>
			<p>{formatUSD(product.priceCents)}</p>
		</section>
	)
}
```

```tsx
function ProductPage({ productPromise }: { productPromise: Promise<Details> }) {
	return (
		<ErrorBoundary fallback={<p data-error>Couldn’t load this product.</p>}>
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetails productPromise={productPromise} />
			</Suspense>
		</ErrorBoundary>
	)
}
```

```tsx
const productPromise = fetchProduct(scenario === 'error' ? 'p999' : 'p4') // started before rendering
r.render(<ProductPage productPromise={productPromise} />)
```

The fake API logs each request; `screen:` lines are what the page showed. Recorded:

```text
0 ms  → GET /products/p4
  ProductDetails render started
screen: fallback “Loading product…”
  ProductDetails render started
300 ms  ← GET /products/p4
  ProductDetails render started
  ProductDetails render finished
screen: details: Desk Lamp
```

`ProductDetails` started rendering three times and finished once. The first attempt stopped at `use`, and the fallback was committed. React then tried again while the request was still pending (React 19 does this to start any sibling requests early) and stopped again. When the data arrived, it rendered to the end.

For a product that doesn't exist:

```text
0 ms  → GET /products/p999
  ProductDetails render started
screen: fallback “Loading product…”
  ProductDetails render started
300 ms  ✗ GET /products/p999: No product with id "p999"
  ProductDetails render started
  ProductDetails render started
screen: error “Couldn’t load this product.”
```

The rejection reached the error boundary. Because `ErrorBoundary` wraps `Suspense`, it catches failures from anything inside, and the loading state stays the `Suspense` boundary's job.

## How use works

What does `use` actually throw while the promise is pending? A `try/catch` around it shows:

```tsx
function ProductDetailsTryCatch({ productPromise }: { productPromise: Promise<Details> }) {
	try {
		const product = use(productPromise)
		return <h2 data-details={product.name}>{product.name}</h2>
	} catch (thrown) {
		log('caught:', thrown === productPromise ? 'the promise itself' : String((thrown as Error).message).split('\n')[0])
		throw thrown // rethrow so Suspense still works
	}
}
```

```text
0 ms  → GET /products/p4
caught: Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.
screen: fallback “Loading product…”
caught: Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.
300 ms  ← GET /products/p4
screen: details: Desk Lamp
```

It's not the promise. In React 19, `use` throws a special **Suspense Exception** ("This is not a real error!") and keeps track of the promise itself. Older Suspense libraries really did `throw promise`, which is where the common explanation comes from. Either way: don't catch it. If you must wrap `use` in `try/catch`, rethrow, or move `use` out of the `try`.

Step by step:

1. `use(promise)` checks whether React has seen this promise before. If it's already fulfilled, it returns the value immediately. That's why the **same promise object** matters.
2. If it's pending, React attaches `.then` to it, throws the Suspense Exception and abandons this component's render.
3. React shows the nearest `Suspense` fallback (or, in a transition, keeps the current UI; see [Promise Caching and Transitions](../../suspense/promise-caching/)).
4. When the promise settles, React retries. Fulfilled → `use` returns the value. Rejected → `use` throws the reason, a real error, for an error boundary.

`use` isn't bound by the rules of hooks: it can be called inside conditions and loops. It also reads context ([Context with use](../../apis/context-with-use/)).

### A new promise every render

```tsx
function ProductDetailsUncached({ id }: { id: string }) {
	const product = use(fetchProduct(id)) // a new promise on every render
	return <h2 data-details={product.name}>{product.name}</h2>
}
```

Recorded over 2.5 seconds:

```text
12
```

requests, and the page still showed "Loading product…". Every retry called `fetchProduct` again, got a **new** pending promise, and suspended again, forever. Create promises outside render, or get them from a cache keyed by id ([Promise Caching and Transitions](../../suspense/promise-caching/)).

### An async component

```tsx
async function ProductDetailsAsync({ id }: { id: string }) {
	const product = await fetchProduct(id)
	return <h2 data-details={product.name}>{product.name}</h2>
}
```

```text
<ProductDetailsAsync> is an async Client Component. Only Server Components can be async at the moment. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.
```

Async components are a Server Components feature. On the client, React warned, and the component kept re-fetching like the uncached version.

## Common mistakes

- **Creating the promise during render** (recorded: endless requests).
- **`async` client components** (recorded warning).
- **Catching what `use` throws** without rethrowing.
- **One `Suspense` around the whole app.** Everything inside shows the same fallback; put boundaries around the parts that load independently.
- **No error boundary.** A rejected promise with no boundary above it unmounts the whole root.

## Interview Q&A

<details class="qa"><summary>What does <code>use(promise)</code> do?</summary>

It returns the promise's value if it's fulfilled. If it's pending, it suspends the component: React shows the nearest `Suspense` fallback and retries when the promise settles. If it rejected, it throws the reason for the nearest error boundary.

</details>

<details class="qa"><summary>Why can't a client component just <code>await</code>?</summary>

Rendering must be synchronous: React calls the function and needs its result now. `use` interrupts the render instead of pausing it, and React re-runs the component later. Recorded: an `async` client component got a warning and re-fetched in a loop.

</details>

<details class="qa"><summary>What does <code>use</code> throw while pending?</summary>

In React 19, a special Suspense Exception, not the promise itself; React keeps track of the promise separately. Recorded: a `try/catch` around `use` caught "Suspense Exception: This is not a real error!".

</details>

<details class="qa"><summary>Why must the promise be stable?</summary>

React recognizes a promise it has seen settle and returns its value immediately. A new promise each render is always pending, so the component suspends forever. Recorded: 12 requests in 2.5 s and no content.

</details>

<details class="qa"><summary>Why does the error boundary go outside <code>Suspense</code>?</summary>

So one boundary catches errors from everything inside, including the suspending component, while `Suspense` handles only loading. Recorded: the rejection showed "Couldn’t load this product."

</details>

## Related

- [Promise Caching and Transitions](../../suspense/promise-caching/): stable promises and keeping old content.
- [Error Boundaries](../../fundamentals/error-boundaries/): the error boundary API.
- [Code Splitting](../../performance/code-splitting/): Suspense for code instead of data.

## Sources

- react.dev: [`use`](https://react.dev/reference/react/use), [`Suspense`](https://react.dev/reference/react/Suspense)
- MDN: [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
