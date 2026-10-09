---
source: https://react.dev/reference/react/useDeferredValue
---

# useDeferredValue with Suspense

## In one minute

A search box whose results come from the server has two jobs that pull against each other: the **input** must update on every keystroke, and the **results** must wait for the server. Putting `setQuery` in `startTransition` makes the results wait without a fallback, but it also makes the *input's own value* wait, and React puts the old value back in the box: typed letters get lost. The fix is to keep the query **urgent** and defer only the results: `const deferredQuery = useDeferredValue(query)`. The input renders immediately; the results render in the background with the new value, and if that suspends, React keeps showing the previous results (dim them with `query !== deferredQuery`).

**You'll be able to:** keep a search input responsive over Suspense-driven results, and explain why a transition around the input misbehaves.

<!-- figure name="deferredSearchAnim" -->

## The example: product search

Each search takes the server 400 ms and is cached by query. The recordings type "l" and "a" 120 ms apart, and log what the input showed on the next frame after each key.

<!-- source file="src/lessons/suspense/05-search.tsx" region="results" -->

### 1. The query in a transition

<!-- source file="src/lessons/suspense/05-search.tsx" region="transition" -->

<!-- output from="suspense" path="search.transition.typing" as="log" -->

The box stayed empty after both keys, and the second search went out for "a", not "la". The input's `value` comes from `query`, which only changes when the transition finishes, and that waits for the results. Meanwhile React re-rendered the controlled input with the old value, wiping the "l". The box ended up containing:

<!-- output from="suspense" path="search.transition.value" as="text" -->

### 2. The results deferred

<!-- source file="src/lessons/suspense/05-search.tsx" region="deferred" -->

<!-- output from="suspense" path="search.deferred.typing" as="log" -->

The input showed every letter immediately. The old results stayed (dimmed) while the new ones loaded, and the in-between search for "l" was never displayed: the background render for "l" was replaced by the newer one for "la".

## How it works

- **One state change, two renders.** With `useDeferredValue`, a keystroke first renders with the new `query` and the **old** `deferredQuery` (urgent: the input updates; the results get the same props as before, nothing suspends). Then React renders again in the background with the new `deferredQuery`.
- **If the background render suspends,** React keeps what's on screen instead of showing the fallback, the same rule as transitions ([[Promise Caching and Transitions]]). The first render has no old value, so the initial load still shows the fallback.
- **Stale or not?** `query !== deferredQuery` is true exactly while the results are behind; use it to dim them.
- **`useTransition` vs `useDeferredValue`:** use `useTransition` when you own an update that shouldn't block (a tab switch). Use `useDeferredValue` when one value has both an urgent use (the input) and a slow one (the results).

## Common mistakes

- **A transition around a controlled input's state** (recorded: lost keystrokes).
- **Passing the urgent `query` to the results** as well as the deferred one: then the urgent render suspends.
- **Expecting it to reduce requests.** Every value that reaches the background render may start a request; debounce the requests if that matters.

## Interview Q&A

**Q: What does `useDeferredValue` do?**
A: It returns the previous value during urgent renders and schedules a background render with the new one. Parts that use the deferred value can lag behind without blocking the parts that use the current one.

**Q: Why not just wrap `setQuery` in `startTransition`?**
A: The input's own value is that state. In a transition it doesn't update until the results are ready, and React resets the controlled input to the old value. Recorded: typing "la" left "a" in the box.

**Q: What does the user see while the deferred results load?**
A: The previous results, because React keeps revealed content when a background render suspends. Recorded: "6 results for """ dimmed until "la" arrived.

**Q: How do you know the results are stale?**
A: `query !== deferredQuery`.

**Q: Is it the same as debouncing?**
A: No. Debouncing waits a fixed time before doing anything. A deferred value starts the background render immediately and abandons it if newer input arrives, so on a fast device and network it's instant.

## Related

- [[Concurrent Rendering]]: `useDeferredValue` for slow rendering instead of slow data.
- [[Promise Caching and Transitions]]: caching search promises, and transitions.
- [[Inputs]]: controlled inputs.

## Sources

- react.dev: [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue) (showing stale content while fresh content is loading), [`useTransition`](https://react.dev/reference/react/useTransition#i-cant-use-a-transition-for-controlling-a-text-input)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
