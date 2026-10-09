---
source: https://react.dev/reference/react/Suspense
---

# Waterfalls and Caching

## In one minute

With `use`, it's easy to load things **one after another** without meaning to: a component suspends on the product, and only when that's done do its children render and *start* their own requests (the picture, the reviews). That's a **waterfall**: the total time is the sum of the requests. The fix is to **start** everything a screen needs before (or while) waiting for any of it: in the click handler, a route loader, or at the top of the page. Starting is cheap; only `use` waits. Separately, the in-memory promise cache disappears on reload; an HTTP **`Cache-Control: max-age`** header lets the browser reuse a response without asking the server again.

**You'll be able to:** spot a request waterfall, load a page's data in parallel, and use HTTP caching under the promise cache.

<!-- figure name="waterfallAnim" -->

## The example: one product page, three requests

The page needs the product (300 ms), its reviews (300 ms) and its picture (600 ms).

### 1. Fetch on render

<!-- source file="src/lessons/suspense/06-waterfall.tsx" region="waterfall" -->

<!-- output from="suspense" path="waterfall.waterfall.logs" as="log" -->

Three steps: the picture started only after the product arrived, and here even the reviews started only after the picture had loaded. The page took 1,200 ms.

### 2. Start everything first

<!-- source file="src/lessons/suspense/06-waterfall.tsx" region="parallel" -->

The same components, with `startLoading('p4')` called before rendering:

<!-- output from="suspense" path="waterfall.parallel.logs" as="log" -->

All three requests started at 0 ms; the page was complete at 600 ms, the time of the slowest request. The components didn't change: their `use` calls find the promises already in the caches.

### React 19 pre-warming

When a component suspends, React 19 commits the fallback and then renders the suspended tree again in the background, so that **siblings** get a chance to start their requests. Two siblings in one boundary:

<!-- source file="src/lessons/suspense/06-waterfall.tsx" region="siblings" -->

<!-- output from="suspense" path="waterfall.siblings.logs" as="log" -->

The reviews request started right after the fallback, in parallel. But it can't help when one request depends on another (the picture URL comes from the product), and in the nested case above it didn't help either. Don't count on it: start requests explicitly.

## The HTTP cache

The promise cache lives in memory: a reload starts from scratch. The server can let the browser keep a response with a header. Two page loads of an exchange-rate endpoint, with and without `Cache-Control: max-age=60`:

<!-- source file="src/lessons/suspense/07-http-cache.tsx" region="fetch" -->

Without (`no-store`), after the reload:

<!-- output from="suspense" path="httpCache.noStore.secondLoad" as="log" -->

With `max-age=60`, after the reload:

<!-- output from="suspense" path="httpCache.maxAge.secondLoad" as="log" -->

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

**Q: What is a request waterfall, and why does Suspense make it easy?**
A: Requests that run one after another although they could run together. With fetch-on-render, a child's request only starts when its parent has finished suspending. Recorded: 1,200 ms in three steps.

**Q: How do you load in parallel?**
A: Start all the requests before waiting on any: in an event handler or route loader, or at the top of the page. Recorded: everything started at 0 ms, done at 600 ms.

**Q: Doesn't React 19 fix waterfalls?**
A: Partly. It pre-renders siblings of a suspended component so their requests start early (recorded in the sibling case). It can't fix dependent requests, and it didn't help in the nested case recorded here.

**Q: How is the HTTP cache different from caching promises?**
A: The promise cache is per page and in memory. The HTTP cache is the browser's, survives reloads, and is controlled by the server's `Cache-Control` header. Recorded: with `max-age=60`, the reload was served from the browser cache.

**Q: `no-cache` vs `no-store`?**
A: `no-cache` may store the response but must check with the server before reusing it; `no-store` never stores it.

## Related

- [[Data Fetching with use]] and [[Promise Caching and Transitions]]: `use` and promise caches.
- [[Suspending on Images]]: the image preload used here.
- [[Code Splitting]]: prefetching code on intent.

## Sources

- react.dev: [`Suspense`](https://react.dev/reference/react/Suspense), [React 19 upgrade guide: improvements to Suspense](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#improvements-to-suspense)
- MDN: [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
