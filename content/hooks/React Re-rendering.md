---
source: https://www.joshwcomeau.com/react/why-react-re-renders/
---

# React Re-rendering

## In one minute

Every re-render starts with a **state change** (`setState`, `dispatch`, or a context value changing). From there it cascades: a component that re-renders re-renders **all of its children** by default, whether their props changed or not. "Props changed" is not a trigger; the parent rendering is. You can stop the cascade at a child with **`memo`**, which skips the child when every prop is `Object.is`-equal to last time. That only works if the props keep their identity, which is what **`useMemo`** (values) and **`useCallback`** (functions) are for. The same identity rules explain **stale closures**: a function keeps the values of the render that created it.

**You'll be able to:** predict who re-renders, make `memo` actually work when it's worth it, and fix stale closures.

<!-- figure name="cascadeAnim" -->

## The example: the cart page

<!-- source file="src/lessons/hooks/09-rerender.tsx" region="children" -->

<!-- source file="src/lessons/hooks/09-rerender.tsx" region="page" -->

One click on "Add", with the props written inline (`stable = false`):

<!-- output from="hooks" path="rerender.unstable.click" as="log" -->

Everything rendered. `Footer` has no `memo`, so it renders with its parent. The two memoized children rendered too: `{ limit: 3 }` and `() => …` are new objects every render, so `memo` saw "changed" props.

With `useMemo` and `useCallback` (`stable = true`):

<!-- output from="hooks" path="rerender.stable.click" as="log" -->

The memoized children were skipped.

## Primitives vs objects

`Object.is` compares numbers, strings and booleans **by value**, and objects, arrays and functions **by identity**:

```js
Object.is(3, 3)                       // true
Object.is({ limit: 3 }, { limit: 3 }) // false
Object.is(() => {}, () => {})         // false
```

Anything created in a component body is a new object on every render. This one fact explains failing `memo`s, effects that re-run every render ([[DOM Refs and Effect Dependencies]]) and state updates that don't render ([[Building a Cart]]).

## Stale closures

A closure keeps the variables of the scope that created it. In React, each render is a separate call with its own variables, so a function created in render 1 sees render 1's state forever.

<!-- source file="src/lessons/hooks/09-rerender.tsx" region="interval" -->

After one second (a tick every 100 ms):

`setSeconds(seconds + 1)`:

<!-- output from="hooks" path="rerender.timerStale.text" as="text" -->

`setSeconds((s) => s + 1)`:

<!-- output from="hooks" path="rerender.timerFixed.text" as="text" -->

The interval was created once (`[]`), so its closure always sees `seconds = 0` and keeps setting `1`. Fixes, in order of preference: an **updater function** (doesn't need the current value), a **reducer** (`dispatch` reads nothing, see [[useState vs useReducer]]), adding the value to the **dependencies** (the interval is recreated when it changes), or a **ref** that always holds the latest value.

## Components defined inside components

<!-- source file="src/lessons/hooks/09-rerender.tsx" region="inner" -->

Typed "mug", then clicked "Re-render":

<!-- output from="hooks" path="rerender.inner" -->

`SearchBox` is a new function on every render of `SearchPage`, so React sees a **different component type** at that position, unmounts the old one and mounts a new one. The typed text is gone. Define components at the top level of the module.

## When to optimize

- Re-renders are normally cheap; most components render in well under a millisecond. Measure first with the **React DevTools Profiler** (enable "Record why each component rendered").
- Reach for `memo` + `useMemo`/`useCallback` when a child is measurably slow and its props can be kept stable. `useMemo` is also for genuinely expensive calculations.
- Often a structural fix is simpler: move state down ([[Lifting State]]) or pass slow parts as `children` so they aren't re-created by the state owner.
- The **React Compiler** adds this memoization automatically where it's safe; in projects that use it, hand-written `useMemo`/`useCallback` are rarely needed.
- One big context re-renders every consumer on any change; splitting contexts by how often they change helps (React Performance module).

## Common mistakes

- Believing changed props cause re-renders, or that unchanged props prevent them.
- `memo` on a child that receives inline objects or functions.
- Wrapping everything in `useMemo`/`useCallback` without measuring.
- Effects or intervals with `[]` that read changing state.

## Interview Q&A

**Q: What causes a component to re-render?**
A: Its own state changing, its parent re-rendering (children re-render by default), or a context it reads changing. All of these start from some state change; props changing isn't a separate trigger.

**Q: Why does `memo` sometimes not prevent a re-render?**
A: `memo` compares props with `Object.is`. An object, array or function created during the parent's render is new every time. Recorded: with inline `options` and `onCheckout`, both memoized children rendered; with `useMemo`/`useCallback`, they were skipped.

**Q: What is a stale closure in React?**
A: A function that captured state from the render that created it and keeps using it after the state changed. Recorded: an interval set up once with `[]` stayed at `Ticks: 1`; with an updater function it counted up to 16.

**Q: How do you fix a stale closure?**
A: Use an updater function or a reducer so the code doesn't read the captured value; or list the value in the dependencies so the function is recreated; or keep the latest value in a ref.

**Q: What's the difference between `useMemo` and `useCallback`?**
A: `useMemo(() => value, deps)` keeps a computed value; `useCallback(fn, deps)` keeps a function, and equals `useMemo(() => fn, deps)`. Both exist to keep identity (or skip expensive work) between renders.

**Q: Why not define a component inside another component?**
A: Each render creates a new component type, so React remounts it and its state is lost. Recorded: the typed "mug" was empty after one re-render.

## Related

- [[Lifting State]]: moving state down to re-render less.
- [[Reconciliation]] (React Internals): why a new type at the same position remounts.
- React Performance module: memoizing elements, context and lists in depth.

## Sources

- Josh W. Comeau, [Why React re-renders](https://www.joshwcomeau.com/react/why-react-re-renders/), [Understanding useMemo and useCallback](https://www.joshwcomeau.com/react/usememo-and-usecallback/)
- Nadia Makarevich, [React re-renders guide](https://www.developerway.com/posts/react-re-renders-guide)
- Dmitri Pavlutin, [Be aware of stale closures when using React hooks](https://dmitripavlutin.com/react-hooks-stale-closures/)
- react.dev: [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), [`useCallback`](https://react.dev/reference/react/useCallback), [React Compiler](https://react.dev/learn/react-compiler)
