---
source: https://kentcdodds.com/blog/optimize-react-re-renders
---

# Element Optimization

## In one minute

When a component re-renders, React also re-renders its children, because every JSX expression creates a **new element object** with a **new props object**. React only skips a child when it can prove nothing changed:

- **A plain component** is skipped when it gets **the very same element** as last time (`oldProps === newProps`).
- **A `memo` component** is skipped when every prop is `Object.is`-equal to last time.

So there are two families of fixes. Hand React the same element: create it once, create it in a parent that re-renders less, or cache it with `useMemo`. Or wrap the component in `memo` and keep its props stable. Neither stops a component from re-rendering when its own state or a context it reads changes.

**You'll be able to:** say exactly when React skips a child, apply the four element techniques and `memo`, and spot the prop that silently breaks `memo`.

<!-- figure name="elementSkipAnim" -->

## Why children re-render

JSX is a function call that returns a plain object:

<!-- source file="src/lessons/performance/01-elements.tsx" region="identity" -->

<!-- output from="performance" path="elements.identity.logs" as="log" -->

Two `<StoreFooter />` elements look identical but are two different objects. During reconciliation React compares the previous props with the new ones **by identity** for an ordinary component. A new object means "may have changed", so React calls the component. It never compares the contents unless you ask for it with `memo`.

## The example: a footer that ignores the quantity

The product page has a quantity button (state in `Page`) and a store footer that has nothing to do with the quantity:

<!-- source file="src/lessons/performance/01-elements.tsx" region="footer" -->

Every version below was clicked twice on "Quantity".

### 1. Inline (the default)

<!-- source file="src/lessons/performance/01-elements.tsx" region="inline" -->

<!-- output from="performance" path="elements.inline.qty" as="log" -->

The footer rendered on both clicks.

### 2. Reuse the element

<!-- source file="src/lessons/performance/01-elements.tsx" region="reuse" -->

<!-- output from="performance" path="elements.reuse.qty" as="log" -->

The element is created once, when the module loads. Every render of `Page` hands React the same object, so its props are `===` and React bails out. This only works for elements that don't depend on the component's props or state.

### 3. Pass the element in

<!-- source file="src/lessons/performance/01-elements.tsx" region="prop" -->

<!-- output from="performance" path="elements.prop.qty" as="log" -->

An element's identity follows the component that **creates** it. `App` created the footer and doesn't re-render when the quantity changes, so `Page` keeps getting the same element. This is the same trick as `children` ([[Composition and Layout Components]]).

### 4. Cache the element with `useMemo`

When the element needs a value from the re-rendering component (here, a currency), cache it by that value:

<!-- source file="src/lessons/performance/01-elements.tsx" region="memoElement" -->

Quantity clicks, then "Show EUR":

<!-- output from="performance" path="elements.memo-element.qty" as="log" -->

<!-- output from="performance" path="elements.memo-element.currency" as="log" -->

It works, but it's unusual: `memo` is the conventional tool for the same job.

### 5. `memo` the component

<!-- source file="src/lessons/performance/01-elements.tsx" region="memo" -->

<!-- output from="performance" path="elements.memo.qty" as="log" -->

<!-- output from="performance" path="elements.memo.currency" as="log" -->

The element is new each time, but `memo` compares `currency` with `Object.is`: `"USD" === "USD"` → skip. When the currency really changed, it rendered.

### 6. One inline function breaks it

<!-- source file="src/lessons/performance/01-elements.tsx" region="memoBroken" -->

<!-- output from="performance" path="elements.memo-broken.qty" as="log" -->

The arrow function is a new function every render, so the comparison fails every time: `memo` now costs a comparison *and* the render.

## How it works

React's check for an ordinary component is literally `current.memoizedProps !== workInProgress.pendingProps` ([[Reconciliation]], [[The Work Loop]]). For a `memo` component it runs `shallowEqual(prevProps, nextProps)` instead: same keys, each value `Object.is`-equal.

| Prop passed to a `memo` component | Equal next render? |
| --- | --- |
| `currency="USD"`, `count={3}`, `name={name}` | ✅ primitives compare by value |
| `setX` from `useState`, `dispatch` | ✅ stable by guarantee |
| `style={{ color }}`, `items={[1, 2]}` | ❌ new object or array |
| `onClick={() => …}` | ❌ new function (recorded above) |
| JSX children `<span />` | ❌ new element |
| a value from `useMemo` / `useCallback` | ✅ while the deps don't change |

`useMemo` on an element and `memo` on a component are the same idea in two places: `useMemo` caches the **element** in the parent and compares a dependency array; `memo` caches the **result** on the component and compares the props object.

## Common mistakes

- **Wrapping everything in `memo`.** If any prop is new each render, it's pure overhead.
- **Memoizing before restructuring.** Moving state down or passing elements in (techniques 2 and 3) often removes the re-render with no extra code.
- **Expecting it to stop context or state updates.** A reused element or `memo` component still re-renders for its own state and the contexts it reads.
- **Optimizing without measuring.** "Sometimes you may inadvertently make things slower when applying a performance optimization." With the React Compiler enabled, much of this memoization is done for you.

## Interview Q&A

**Q: Why does a child re-render when its parent re-renders, even with the same props?**
A: The parent's JSX runs again and creates a new element with a new props object. React compares an ordinary component's props by identity, so a new object means it calls the component. Recorded: `a === b → false` for two `<StoreFooter />`s.

**Q: How can you avoid a re-render without `memo`?**
A: Give React the same element object: hoist a static element out of the component, create it in a parent that re-renders less (props or `children`), or cache it with `useMemo`. Recorded: with the element reused or passed in, two quantity clicks rendered only `Page`.

**Q: How does `memo` decide?**
A: It compares each prop with `Object.is` (`shallowEqual`). Primitives compare by value; objects, arrays and functions by identity.

**Q: What silently breaks `memo`?**
A: Any prop created during render: inline objects, arrays, arrow functions, JSX children. Recorded: adding `onSubscribe={() => …}` made the memoized footer render on every click again.

**Q: Does `memo` stop all re-renders?**
A: No. A memoized component still re-renders when its own state changes or a context it reads changes.

**Q: `useMemo` on an element vs `memo` on a component?**
A: `useMemo` caches one element inside the parent, by a dependency array. `memo` caches the component's last result wherever it's rendered, by its props. `memo` is the conventional choice.

## Related

- [[React Re-rendering]]: what triggers a render.
- [[Optimize Context]]: the same identity rules for context values.
- [[Optimize Rendering]]: `memo` on 500 list rows.
- [[Reconciliation]]: where React compares props.

## Sources

- Kent C. Dodds: [One simple trick to optimize React re-renders](https://kentcdodds.com/blog/optimize-react-re-renders), [What is JSX?](https://kentcdodds.com/blog/what-is-jsx)
- react.dev: [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
