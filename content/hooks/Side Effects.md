---
source: https://react.dev/reference/react/useEffect
---

# Side Effects

## In one minute

Rendering should only compute what to show. Anything that reaches outside React (an event listener on `window`, a timer, a subscription, a network request, `localStorage`, a non-React library) belongs in **`useEffect`**. React runs the effect after it has committed a render, and re-runs it only when something in its **dependency array** changed. If the effect sets something up, it should **return a cleanup function** that undoes it; React calls that before the next run and when the component unmounts.

**You'll be able to:** write an effect with the right dependencies and a cleanup, and recognize a leaking one.

<!-- figure name="listenerLeakAnim" -->

## The example: the search follows the back button

The search reads its first value from the URL. When the user presses **Back**, the URL changes, and the box should follow. The browser reports that with a `popstate` event, so the component subscribes to it.

### Without cleanup

<!-- source file="src/lessons/hooks/02-effects.tsx" region="leak" -->

The search can be hidden and shown with a checkbox:

<!-- source file="src/lessons/hooks/02-effects.tsx" region="toggle" -->

The recorder hid and showed it three times, then pressed Back once:

<!-- output from="hooks" path="effects.leak.afterBack" as="log" -->

Four handlers ran for one click: one per mount. The first three belong to components that no longer exist, and each closure keeps whatever it references alive in memory.

### With cleanup

<!-- source file="src/lessons/hooks/02-effects.tsx" region="cleanup" -->

<!-- output from="hooks" path="effects.cleanup.afterBack" as="log" -->

Only the mounted component's listener ran. The handler is a named function because `removeEventListener` only removes the **exact same function** that was added; a second arrow function with the same body is a different object.

## How it works

- **Why not in the component body?** The body runs on every render, so it would add a new listener every time. An effect runs after a commit, and only when its dependencies change.
- **Dependencies:** no array → after every render; `[]` → after the first render only; `[a, b]` → when `a` or `b` changed (compared with `Object.is`).
- **Cleanup timing:** the previous run's cleanup runs right before the next run, and once more on unmount. Each cleanup sees the values of the render that created it. The exact order is in [[React Lifecycle]].
- **Strict Mode** (development only) mounts, cleans up and mounts again once, so an effect without a proper cleanup misbehaves immediately instead of leaking quietly in production.

## Common mistakes

- Subscriptions, timers or library instances with no cleanup.
- Passing a new inline function to `removeEventListener`.
- Using an effect to compute something from state or props. Compute it during render ([[Managing UI State]]).
- Leaving out dependencies to make an effect "run once" when it reads values that change. Its closure keeps the old values ([[React Re-rendering]]).

## Interview Q&A

**Q: What is a side effect, and why does it need `useEffect`?**
A: Anything that touches the world outside React's rendering: listeners, timers, subscriptions, network, storage, DOM libraries. The component body runs on every render, so doing it there would repeat it every time; `useEffect` runs after a commit and only when the dependencies change.

**Q: What happens if an effect adds an event listener and returns no cleanup?**
A: Each mount adds another listener and none are removed. Recorded: after three hide/show cycles, one Back press ran listeners #1–#4. They keep their closures (and everything those reference) alive: a memory leak plus duplicate work.

**Q: When does the cleanup function run?**
A: Before the effect runs again because a dependency changed, and when the component unmounts. It always sees the values from the render that created it.

**Q: Why must the handler be the same function for `addEventListener` and `removeEventListener`?**
A: Listeners are matched by reference. Two inline arrow functions are two different objects, so removing a new one does nothing. Name the function once inside the effect and use it in both calls.

**Q: What does an empty dependency array mean?**
A: Run the effect after the first commit only, and run its cleanup on unmount. It's right when the effect reads nothing that can change (here, `setQuery` is stable); otherwise list what it reads.

## Related

- [[React Lifecycle]]: the exact order of effects and cleanups.
- [[DOM Refs and Effect Dependencies]]: dependencies that change on every render.

## Sources

- react.dev: [`useEffect`](https://react.dev/reference/react/useEffect), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), [You might not need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- Max Rozen, [Demystifying useEffect's clean-up function](https://maxrozen.com/demystifying-useeffect-cleanup-function)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
