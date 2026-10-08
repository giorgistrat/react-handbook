---
source: https://react.dev/reference/react/useMemo
---

# Expensive Calculations

## In one minute

Everything in a component's body runs on every render, so a slow calculation there runs again even when its inputs didn't change. The options, roughly in order of effort:

1. **Don't repeat it.** Cache the result with `useMemo(() => calc(a, b), [a, b])`.
2. **Make it faster.** A better algorithm, less data, a cheaper library.
3. **Move it off the main thread** with a **Web Worker**, so it can be slow without freezing the page.
4. **Deprioritize the render** around it ([[Concurrent Rendering]]).

`useMemo` only helps when the inputs *didn't* change. When they did (each keystroke of a search), the work still blocks. A worker fixes that: the main thread just sends a message, and React reads the result as a promise with `use`.

**You'll be able to:** decide whether a calculation is worth memoizing, cache it with `useMemo`, and move it to a worker with a promise React can suspend on.

<!-- figure name="workerAnim" -->

## The example: searching 150,000 products

The store's search scores every product against the query and sorts them. The page also has a "Refresh prices" button that re-renders it for an unrelated reason.

<!-- source file="src/lessons/performance/search.ts" region="rank" -->

The recordings: mount, click "Refresh prices", then type "lamp" (200 ms between keys). `rankProducts` logs how long it took on the main thread.

### 1. In the render body

<!-- source file="src/lessons/performance/05-expensive.tsx" region="plain" -->

"Refresh prices":

<!-- output from="performance" path="expensive.plain.refresh" as="log" -->

Typing "lamp":

<!-- output from="performance" path="expensive.plain.typing" as="log" -->

The search ran again for a click that had nothing to do with it, and each keystroke waited for it.

### 2. `useMemo`

<!-- source file="src/lessons/performance/05-expensive.tsx" region="memo" -->

"Refresh prices":

<!-- output from="performance" path="expensive.memo.refresh" -->

Typing "lamp":

<!-- output from="performance" path="expensive.memo.typing" as="log" -->

The refresh no longer runs the search. Typing still does, because the query really changed, and each keystroke still waits.

### 3. A Web Worker

The search moves into a worker file. The same `rankProducts` function runs there, on another thread:

<!-- source file="src/lessons/performance/search.worker.ts" region="worker" -->

On the main thread, a small client turns each request into a promise:

<!-- source file="src/lessons/performance/05-expensive.tsx" region="client" -->

The component keeps the **promise** in state, reads it with `use`, and replaces it inside a transition:

<!-- source file="src/lessons/performance/05-expensive.tsx" region="async" -->

Typing "lamp":

<!-- output from="performance" path="expensive.worker.typing" as="log" -->

Every keystroke painted within about one frame (~16 ms), usually much less. The results (the same first five as before) arrived when the worker replied:

<!-- output from="performance" path="expensive.worker.results" as="log" -->

## How it works

- **`useMemo` compares dependencies with `Object.is`** and returns the cached value when they all match. It's a performance hint, not a guarantee: React may drop the cache (for example, for offscreen content).
- **Is it worth it?** react.dev's rule of thumb: time it (`console.time`); if it takes **1 ms or more**, memoizing may help. Measure with CPU throttling and in a production build.
- **A worker is another thread.** It shares no memory with the page: data is copied with `postMessage` (structured clone), so send queries and small results, not huge objects back and forth. The worker loads its own copy of the code and data. Libraries like Comlink hide the message plumbing behind function calls.
- **`use(promise)` + transition.** The promise must be stable (kept in state, not created during render), or every render would start a new search and suspend forever. Updating it inside `startTransition` keeps the old results visible while the new ones load, instead of showing the `Suspense` fallback on every keystroke.

## Common mistakes

- **`useMemo` on cheap calculations.** It adds a deps array, a comparison and memory, for nothing.
- **Unstable dependencies** (objects created during render): the cache never hits.
- **Creating the promise during render** (`use(searchInWorker(q))`): a new promise each render.
- **Shipping huge data to a worker on every call.** Load it in the worker once.

## Interview Q&A

**Q: Why is a slow calculation in a component a problem?**
A: The component body runs on every render, so the calculation repeats even when its inputs haven't changed. Recorded: "Refresh prices" re-ran the 150,000-product search.

**Q: When is `useMemo` worth it?**
A: When the calculation is measurably slow (about 1 ms or more) and the component re-renders with the same inputs. Recorded: with `useMemo`, the refresh click ran nothing.

**Q: What doesn't `useMemo` fix?**
A: The case where the inputs change. Each keystroke changed the query, so the search still ran and the input still waited for it (recorded: tens of milliseconds per letter).

**Q: How does a Web Worker help, if the work is the same?**
A: The work runs on another thread, so the main thread stays free to handle input and paint. Recorded: the next frame came within about one frame of every keystroke, instead of waiting for the search.

**Q: How do you show the worker's async result in React 19?**
A: Keep the promise in state, read it with `use(promise)` inside `Suspense`, and replace the promise inside `startTransition` so the old results stay visible while the new ones compute.

## Related

- [[Concurrent Rendering]]: deprioritize slow rendering instead.
- [[React Re-rendering]]: `useMemo` and `useCallback` basics.
- The Suspense module: `use`, promises and transitions in depth.

## Sources

- react.dev: [`useMemo`](https://react.dev/reference/react/useMemo), [`use`](https://react.dev/reference/react/use)
- MDN: [Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- Kent C. Dodds: [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Comlink](https://github.com/GoogleChromeLabs/comlink): calling worker functions like local ones
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
