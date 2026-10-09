---
source: https://react.dev/reference/react/useTransition
---

# Promise Caching and Transitions

## In one minute

When the data depends on props or state (the product id the shopper picked), the component has to get its promise during render, so it needs a **cache**: the same id must give back the **same promise**, or `use` suspends forever. A `Map` from id to promise is enough for the basics. The next problem is what the shopper sees while the next product loads. A normal state update that suspends **replaces** the current content with the fallback. Wrapped in `startTransition`, React **keeps the current content** (you can dim it with `isPending`) and swaps in the new page when it's ready. And to avoid a pending indicator that flickers for fast requests, show it only if loading takes longer than a short delay.

**You'll be able to:** cache promises by id, switch content without flashing a fallback, and keep a spinner from flickering.

<!-- figure name="transitionAnim" -->

## The example: a product switcher

Three buttons switch between the Ceramic Mug (p1), the Desk Lamp (p4, a 500 ms request) and the Notebook Set (p6, a fast 100 ms request).

### 1. One promise per product

<!-- source file="src/lessons/suspense/02-dynamic.tsx" region="cache" -->

<!-- source file="src/lessons/suspense/02-dynamic.tsx" region="details" -->

`getProduct` isn't `async`: an `async` function returns a **new** promise every call, even when it returns a cached one inside. Returning the cached promise object itself is what lets `use` recognize it.

Going back to the mug, which is already cached, made no request and showed no fallback (from the urgent version below):

<!-- output from="suspense" path="dynamic.urgent.backToP1" as="log" -->

### 2. An urgent update

<!-- source file="src/lessons/suspense/02-dynamic.tsx" region="urgent" -->

Clicking the Desk Lamp:

<!-- output from="suspense" path="dynamic.urgent.toP4" as="log" -->

The mug disappeared and "Loading product…" took its place for 500 ms. For a page that was already showing content, that's a jarring blank.

### 3. A transition

<!-- source file="src/lessons/suspense/02-dynamic.tsx" region="transition" -->

<!-- output from="suspense" path="dynamic.transition.toP4" as="log" -->

The mug stayed, dimmed, with ⏳, until the lamp was ready. But look at the fast and cached switches:

<!-- output from="suspense" path="dynamic.transition.backToP1" as="log" -->

<!-- output from="suspense" path="dynamic.transition.toFastP6" as="log" -->

The ⏳ flashed even for the already-cached mug: `isPending` turns true in an urgent render first, then false again. That one-frame flash is a flicker of its own.

### 4. Hiding quick spinners

<!-- source file="src/lessons/suspense/02-dynamic.tsx" region="spinDelay" -->

Fast and cached switches showed no ⏳ at all:

<!-- output from="suspense" path="dynamic.spinDelay.toFastP6" as="log" -->

The slow switch still showed it, and kept it briefly after the lamp appeared, so it doesn't blink:

<!-- output from="suspense" path="dynamic.spinDelay.toP4" as="log" -->

The `spin-delay` package's `useSpinDelay` does the same, with tested edge cases.

## How it works

- **Transitions don't hide revealed content.** If an update inside `startTransition` suspends under a `Suspense` boundary that's already showing content, React keeps that content and waits. Boundaries that are **new** in the update can still show their fallback ([[Suspending on Images]]).
- **`isPending`** is true from the click until the transition commits. It's the place for a lightweight indicator (dimming, a small spinner), instead of the full fallback.
- **The cache here never invalidates.** A real app needs to refresh data, limit memory and handle errors (a rejected promise stays cached). Data libraries handle that; this note shows the core idea.

## Common mistakes

- **`async` cache functions.** A new promise every call defeats the cache.
- **Caching by an object key** (`cache.get({ id })`): never the same key twice. Use a string.
- **Urgent updates for navigation between already-loaded screens**: the fallback replaces the content.
- **Showing `isPending` directly** for requests that are often fast: a flickering spinner.

## Interview Q&A

**Q: Why does calling a fetch function directly in a component break Suspense?**
A: Each render creates a new promise. `use` sees a pending promise every time, suspends, and the retry creates another one, so it never finishes. ([[Data Fetching with use]] recorded 12 requests in 2.5 seconds.)

**Q: How do you fix it?**
A: Cache the promise by its input (`Map<id, Promise>`), and return the same promise object for the same id. Recorded: switching back to a cached product made no request.

**Q: Why shouldn't the cache function be `async`?**
A: `async` functions always return a new promise wrapping the result, so `use` would see a different promise each call.

**Q: What does `useTransition` change when an update suspends?**
A: Instead of replacing the visible content with the fallback, React keeps it and sets `isPending` until the new content is ready. Recorded: the mug stayed (dimmed) for 500 ms, then the lamp replaced it.

**Q: Why can a transition still flicker, and how do you fix it?**
A: `isPending` turns on even for instant updates, so a pending indicator can flash for one frame. Recorded: ⏳ flashed when switching to a cached product. Show it only after a delay, and then for a minimum time (`useSpinDelay`).

## Related

- [[Data Fetching with use]]: `use`, `Suspense` and error boundaries.
- [[Code Splitting]]: the same transition trick for lazy code.
- [[Concurrent Rendering]]: transitions and priorities.

## Sources

- react.dev: [`useTransition`](https://react.dev/reference/react/useTransition), [Preventing already revealed content from hiding](https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding)
- [spin-delay](https://github.com/smeijer/spin-delay)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
