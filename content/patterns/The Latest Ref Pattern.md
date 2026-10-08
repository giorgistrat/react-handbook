---
source: https://epicreact.dev/the-latest-ref-pattern-in-react
---

# The Latest Ref Pattern

## In one minute

Each render's functions see **that render's** props and state. Usually that's a feature: an async handler can't suddenly see values from a later render. But some functions are **created once and called much later**: a debounced save, a timer callback, a subscription. They need the *latest* values when they run. The latest ref pattern keeps the newest callback in a ref (`callbackRef.current = callback` after every render), and the long-lived function calls `callbackRef.current(...)` at call time. Its identity stays stable, but it always runs the newest code. Inside effects, React 19.2's `useEffectEvent` does the same job for you.

**You'll be able to:** write a `useDebounce` hook that neither fires too often nor saves stale values, and know when to use `useEffectEvent` instead.

<!-- figure name="latestRefAnim" -->

## The example: a debounced gift note

The cart has a gift note field that saves itself 300 ms after you stop typing. The save also needs to know which product the note is for. The shopper picks "Desk Lamp", then types "Gift" quickly.

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="debounce" -->

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="note" -->

### 1. Rebuild when the callback changes

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="rebuild" -->

<!-- output from="patterns" path="latestRef.rebuild.saves" as="log" -->

Four saves instead of one. `saveNote` is a new function on every render, so `useMemo` builds a new debounced function each time, and a new one can't cancel the timer an old one started. Wrapping `saveNote` in `useCallback` doesn't help: it depends on `product`, so it changes too, just less often.

### 2. Build it once

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="once" -->

<!-- output from="patterns" path="latestRef.once.saves" as="log" -->

One save now, but for the wrong product. The debounced function wraps the `saveNote` from the **first** render, when the product was still Ceramic Mug. That's a stale closure.

### 3. The latest ref

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="latest" -->

<!-- output from="patterns" path="latestRef.latest.saves" as="log" -->

One save, right product. The debounced function is built once (deps `[delay]`), so its timer survives re-renders. It doesn't hold `callback`: it holds the ref, and reads `callbackRef.current` **when the timer fires**.

Don't write `debounce(callbackRef.current, delay)`. That reads `.current` once, when `useMemo` runs, which is the same bug as version 2. The extra arrow function is what delays the read.

## Inside effects: `useEffectEvent`

A stock watcher checks the product's stock every 200 ms. Clicking "Watch Desk Lamp" changes the `product` prop.

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="watchStale" -->

Before and after the click:

<!-- output from="patterns" path="latestRef.watchStale.before" as="log" -->

<!-- output from="patterns" path="latestRef.watchStale.after" as="log" -->

Stale: still checking the mug. Adding `product` to the dependencies fixes the value, but restarts the interval on every change:

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="watchRestart" -->

<!-- output from="patterns" path="latestRef.watchRestart.after" as="log" -->

`useEffectEvent` separates the two. The effect sets up the interval once; the event function always sees the latest `product`:

<!-- source file="src/lessons/patterns/02-latest-ref.tsx" region="watchEvent" -->

<!-- output from="patterns" path="latestRef.watchEvent.after" as="log" -->

No restart, and the new product. `useEffectEvent` is meant to be called **only from effects** (and things they set up, like this interval). It's not a general stable-callback tool for event handlers or props, which is where the hand-written ref is still the answer.

## How it works

- **Closures capture a render.** A function created during render reads the variables of that render forever. That's why hooks avoid a whole class of async bugs that class components had: there, `this.props` and `this.state` could change in the middle of an `await`.
- **A ref is one box for the component's whole life.** Writing `.current` doesn't re-render, and every closure that holds the ref sees the newest value.
- **Write the ref in an effect, not during render.** Render must stay pure: React may render a component and throw the result away. An effect runs only for renders that were committed. (`useLayoutEffect` updates it a bit earlier, before paint, if a callback could fire in between.)
- **No dependency array on that effect.** It should run after every render, to always copy the newest callback.

## Common mistakes

- **Using the pattern to silence the dependency lint rule.** It opts out of the "this render's values" guarantee on purpose. Use it only for functions that genuinely run later.
- **Reading `ref.current` during render.** Render would depend on something React doesn't track.
- **Passing `callbackRef.current` instead of a wrapper function** (see above).
- **Calling a `useEffectEvent` function from an event handler or passing it to a child.** It's for effects only.

## Interview Q&A

**Q: What problem does the latest ref pattern solve?**
A: A function that's created once but called later (a debounced or throttled function, a timer or subscription callback) needs the latest props and state when it runs. Rebuilding it on every change loses its internal state (pending timers); not rebuilding it leaves it with stale values.

**Q: Walk through the buggy `useDebounce`.**
A: `useMemo(() => debounce(callback, delay), [callback, delay])` builds a new debounced function whenever `callback` changes, which is every render for an inline function. Each new function has its own timer, so older timers are never cancelled. Recorded: typing "Gift" saved four times.

**Q: Why doesn't `useCallback` fix it?**
A: The callback still changes whenever its own dependencies change (here, `product`), so the debounced function is still rebuilt at those moments. It also pushes the burden onto every caller.

**Q: How does the ref version work?**
A: An effect copies the newest callback into `callbackRef.current` after every render. The debounced function is built once and calls `callbackRef.current(...args)` when the timer fires. Recorded: one save, `"Gift" for Desk Lamp`.

**Q: Why write the ref in an effect and not in the render body?**
A: Render should be pure. React can render without committing (Strict Mode, interrupted concurrent renders), and writing during such a render would store a callback from a render that never happened.

**Q: What is `useEffectEvent`?**
A: A React 19.2 hook that wraps a function so it always sees the latest props and state, without being an effect dependency. It's the built-in version of this pattern for code called from effects. Recorded: the stock watcher switched to Desk Lamp without restarting its interval.

## Related

- [[Side Effects]] and [[DOM Refs and Effect Dependencies]]: effects, refs and dependencies.
- [[React Re-rendering]]: stale closures and `useCallback`.
- [[useLayoutEffect]]: an earlier place to update the ref.

## Sources

- Kent C. Dodds: [The latest ref pattern in React](https://epicreact.dev/the-latest-ref-pattern-in-react), [How React uses closures to avoid bugs](https://epicreact.dev/how-react-uses-closures-to-avoid-bugs)
- react.dev: [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent), [Separating events from effects](https://react.dev/learn/separating-events-from-effects), [`useRef`](https://react.dev/reference/react/useRef)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
