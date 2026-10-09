---
source: https://react.dev/reference/react/use
---

# Data Fetching with use

## In one minute

A component function must finish synchronously, so it can't `await`. `use(promise)` gets around that: if the promise has a value, `use` returns it; if it's **pending**, `use` interrupts the render and React shows the nearest `<Suspense>` **fallback**, then renders the component again when the promise settles. If the promise **rejects**, `use` throws the error and the nearest **error boundary** shows its fallback. Put the error boundary *outside* the `Suspense`, so one wrapper handles both loading and failure. And the promise must be created **once** (before rendering, or from a cache), never inside the component: a new promise every render means waiting forever.

**You'll be able to:** fetch data with `use`, `Suspense` and an error boundary, and explain what `use` actually throws.

<!-- figure name="useAnim" -->

## Promises in two minutes

A promise is a value that stands for a result that isn't ready yet. It starts **pending** and settles exactly once, **fulfilled** with a value or **rejected** with a reason. `.then` callbacks never run synchronously, even for a promise that's already settled: they run after the current code, as microtasks.

<!-- source file="src/lessons/suspense/01-data-fetching.tsx" region="order" -->

<!-- output from="suspense" path="fetching.promises.logs" as="log" -->

Two things Suspense relies on: a promise is an ordinary value you can pass around and store (so React can keep it and attach its own `.then`), and its state can be checked later without re-running the work.

## The example: a product page

<!-- source file="src/lessons/suspense/01-data-fetching.tsx" region="details" -->

<!-- source file="src/lessons/suspense/01-data-fetching.tsx" region="page" -->

<!-- source file="src/lessons/suspense/01-data-fetching.tsx" region="start" -->

The fake API logs each request; `screen:` lines are what the page showed. Recorded:

<!-- output from="suspense" path="fetching.use.logs" as="log" -->

`ProductDetails` started rendering three times and finished once. The first attempt stopped at `use`, and the fallback was committed. React then tried again while the request was still pending (React 19 does this to start any sibling requests early) and stopped again. When the data arrived, it rendered to the end.

For a product that doesn't exist:

<!-- output from="suspense" path="fetching.error.logs" as="log" -->

The rejection reached the error boundary. Because `ErrorBoundary` wraps `Suspense`, it catches failures from anything inside, and the loading state stays the `Suspense` boundary's job.

## How use works

What does `use` actually throw while the promise is pending? A `try/catch` around it shows:

<!-- source file="src/lessons/suspense/01-data-fetching.tsx" region="tryCatch" -->

<!-- output from="suspense" path="fetching.tryCatch.logs" as="log" -->

It's not the promise. In React 19, `use` throws a special **Suspense Exception** ("This is not a real error!") and keeps track of the promise itself. Older Suspense libraries really did `throw promise`, which is where the common explanation comes from. Either way: don't catch it. If you must wrap `use` in `try/catch`, rethrow, or move `use` out of the `try`.

Step by step:

1. `use(promise)` checks whether React has seen this promise before. If it's already fulfilled, it returns the value immediately. That's why the **same promise object** matters.
2. If it's pending, React attaches `.then` to it, throws the Suspense Exception and abandons this component's render.
3. React shows the nearest `Suspense` fallback (or, in a transition, keeps the current UI; see [[Promise Caching and Transitions]]).
4. When the promise settles, React retries. Fulfilled → `use` returns the value. Rejected → `use` throws the reason, a real error, for an error boundary.

`use` isn't bound by the rules of hooks: it can be called inside conditions and loops. It also reads context ([[Context with use]]).

### A new promise every render

<!-- source file="src/lessons/suspense/01-data-fetching.tsx" region="uncached" -->

Recorded over 2.5 seconds:

<!-- output from="suspense" path="fetching.uncached.requestsIn2500ms" as="text" -->

requests, and the page still showed "Loading product…". Every retry called `fetchProduct` again, got a **new** pending promise, and suspended again, forever. Create promises outside render, or get them from a cache keyed by id ([[Promise Caching and Transitions]]).

### An async component

<!-- source file="src/lessons/suspense/01-data-fetching.tsx" region="asyncComponent" -->

<!-- output from="suspense" path="fetching.async.warnings" as="log" -->

Async components are a Server Components feature. On the client, React warned, and the component kept re-fetching like the uncached version.

## Common mistakes

- **Creating the promise during render** (recorded: endless requests).
- **`async` client components** (recorded warning).
- **Catching what `use` throws** without rethrowing.
- **One `Suspense` around the whole app.** Everything inside shows the same fallback; put boundaries around the parts that load independently.
- **No error boundary.** A rejected promise with no boundary above it unmounts the whole root.

## Interview Q&A

**Q: What does `use(promise)` do?**
A: It returns the promise's value if it's fulfilled. If it's pending, it suspends the component: React shows the nearest `Suspense` fallback and retries when the promise settles. If it rejected, it throws the reason for the nearest error boundary.

**Q: Why can't a client component just `await`?**
A: Rendering must be synchronous: React calls the function and needs its result now. `use` interrupts the render instead of pausing it, and React re-runs the component later. Recorded: an `async` client component got a warning and re-fetched in a loop.

**Q: What does `use` throw while pending?**
A: In React 19, a special Suspense Exception, not the promise itself; React keeps track of the promise separately. Recorded: a `try/catch` around `use` caught "Suspense Exception: This is not a real error!".

**Q: Why must the promise be stable?**
A: React recognizes a promise it has seen settle and returns its value immediately. A new promise each render is always pending, so the component suspends forever. Recorded: 12 requests in 2.5 s and no content.

**Q: Why does the error boundary go outside `Suspense`?**
A: So one boundary catches errors from everything inside, including the suspending component, while `Suspense` handles only loading. Recorded: the rejection showed "Couldn’t load this product."

## Related

- [[Promise Caching and Transitions]]: stable promises and keeping old content.
- [[Error Boundaries]]: the error boundary API.
- [[Code Splitting]]: Suspense for code instead of data.

## Sources

- react.dev: [`use`](https://react.dev/reference/react/use), [`Suspense`](https://react.dev/reference/react/Suspense)
- MDN: [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
