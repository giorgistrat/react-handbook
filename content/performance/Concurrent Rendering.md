---
source: https://react.dev/reference/react/useDeferredValue
---

# Concurrent Rendering

## In one minute

At 60 frames per second, the browser gets a new frame every ~16 ms. A render that takes 125 ms freezes the page for 125 ms: the letter you just typed doesn't even appear. **Concurrent rendering** lets React split a low-priority render into small pieces, pause to let the browser handle input and paint, and throw the render away if newer input arrives. You tell React what's low-priority with `useTransition` (around a state update) or `useDeferredValue` (around a value). The work doesn't get smaller, it stops **blocking**. The catch with `useDeferredValue`: the slow component must be **memoized**, or React renders it anyway during the urgent render.

**You'll be able to:** keep an input responsive over a slow list with `useDeferredValue` and `memo`, and explain why it does nothing without `memo`.

<!-- figure name="deferredAnim" -->

## The example: a search over a slow grid

The grid shows up to 120 cards, and each card takes about 1 ms to render (a stand-in for a genuinely expensive component). The recordings type "c", "e", "r" with 150 ms between keys, and log how long after each keystroke the browser could paint its next frame.

<!-- source file="src/lessons/performance/03-deferred.tsx" region="grid" -->

### 1. Plain

<!-- source file="src/lessons/performance/03-deferred.tsx" region="plain" -->

<!-- output from="performance" path="deferred.plain.keystrokes" as="log" -->

Every keystroke waits for the whole grid: the input lags by over 100 ms per letter.

### 2. `useDeferredValue` without `memo`

<!-- source file="src/lessons/performance/03-deferred.tsx" region="deferredNoMemo" -->

<!-- output from="performance" path="deferred.deferred-no-memo.keystrokes" as="log" -->

No better. The renders explain why:

<!-- output from="performance" path="deferred.deferred-no-memo.renders" as="log" -->

The urgent render passed the grid the **old** value, but `ProductGrid` isn't memoized, so it rendered anyway, all 120 slow cards, for a query it had already shown. Then the background render did it again with the new value.

### 3. `useDeferredValue` with `memo`

<!-- source file="src/lessons/performance/03-deferred.tsx" region="deferred" -->

<!-- output from="performance" path="deferred.deferred.keystrokes" as="log" -->

<!-- output from="performance" path="deferred.deferred.renders" as="log" -->

Now the urgent render gives `MemoGrid` the same `query` as before, `memo` skips it, and the input paints within about one frame. The grid renders once per value, in the background, and is dimmed while it's stale.

## How it works

- **One update, two renders.** `useDeferredValue(query)` returns the old value in the urgent render and schedules a second, low-priority render with the new value.
- **The background render is interruptible.** React works in small slices and yields to the browser between them ([[Scheduler, Lanes and Batching]]). If a new keystroke arrives, it abandons the stale render and starts over with the latest value. It only touches the DOM when a whole render is finished, so you never see half an update.
- **`useTransition` vs `useDeferredValue`:** use `startTransition(() => setX(…))` when you own the state update. Use `useDeferredValue(value)` when the value comes from elsewhere (props, context, a URL).
- **Deferring vs debouncing:** a debounce waits a fixed time, on every device, and the render still blocks when it finally runs. A deferred render starts immediately, adapts to the device, and can be interrupted. Debounce **network requests**; defer **rendering**.
- **It's not "faster".** The first render isn't deferred, and the total work is the same. If you can make the component itself faster, do that first.

## Common mistakes

- **Forgetting `memo` on the slow component** (recorded above).
- **Passing the deferred component new objects or functions** as props: the urgent render then fails `memo` and renders anyway ([[Element Optimization]]).
- **Using it to limit API calls.** It reduces rendering, not requests.

## Interview Q&A

**Q: What is concurrent rendering?**
A: React's ability to render in interruptible pieces, yielding to the browser between them, and to abandon a render when newer input arrives. The DOM changes only when a whole render is done.

**Q: Urgent vs non-urgent updates?**
A: Urgent updates reflect direct input (typing, clicking) and must feel instant. Non-urgent ones change what's shown (filtered results, a new tab) and can lag a bit. You mark non-urgent ones with `useTransition` or `useDeferredValue`.

**Q: Why must the slow component be memoized for `useDeferredValue` to help?**
A: The urgent render still renders the component that calls `useDeferredValue`, and its children with it. Only `memo`, seeing the same old prop, skips the slow child. Recorded: without `memo`, each keystroke still took over 100 ms and the grid rendered twice per keystroke; with it, about one frame or less.

**Q: `useTransition` or `useDeferredValue`?**
A: `useTransition` when you call the state setter; `useDeferredValue` when you only receive the value.

**Q: Deferring vs debouncing?**
A: Debouncing delays the work by a fixed time and still blocks when it runs. Deferring starts right after the urgent render, runs in interruptible chunks, and adapts to the device's speed.

## Related

- [[Element Optimization]]: why `memo` can skip the urgent render.
- [[Scheduler, Lanes and Batching]]: priorities and yielding inside React.
- [[Code Splitting]]: transitions that avoid Suspense fallbacks.

## Sources

- react.dev: [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue), [`useTransition`](https://react.dev/reference/react/useTransition), [React 18: concurrent rendering](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
