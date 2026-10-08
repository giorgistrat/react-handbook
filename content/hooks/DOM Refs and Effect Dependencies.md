---
source: https://react.dev/reference/react/useRef
---

# DOM Refs and Effect Dependencies

## In one minute

JSX creates element objects, not DOM nodes, so during render there's no node to hand to a non-React library. React gives you the real node through the **`ref`** prop: either a **ref callback** (React calls it with the node and calls its returned cleanup when the node goes away) or a **`useRef`** object whose `.current` React fills in. When you set something up from an effect, the **dependency array** decides when it's torn down and redone, and React compares each dependency with `Object.is`: numbers and strings by value, objects and functions by identity. An object created during render is "new" every time.

**You'll be able to:** connect a DOM library to React, and keep its effect from re-running on unrelated renders.

<!-- figure name="depsCompareAnim" -->

## The example: zoom on hover

The product page uses a tiny plain-JavaScript library, `attachZoom(node, options)`, which enlarges a product photo on hover and returns a function that removes it. It logs `attachZoom(scale …)` and `zoom destroyed`. The page also has a quantity button (unrelated state) and a "Bigger zoom" button (changes `scale`).

### 1. An inline ref callback

<!-- source file="src/lessons/hooks/05-refs.tsx" region="callbackRef" -->

Clicking the quantity button twice:

<!-- output from="hooks" path="refs.callback.unrelated" as="log" -->

The callback is a **new function** each render, so React detaches the old one (running its cleanup) and attaches the new one. Every unrelated render rebuilt the zoom.

### 2. `useRef` + an effect that depends on an object

<!-- source file="src/lessons/hooks/05-refs.tsx" region="objectDep" -->

<!-- output from="hooks" path="refs.object.unrelated" as="log" -->

Same problem, different cause: `options` is a new object every render, and React compares dependencies by identity:

<!-- source file="src/lessons/hooks/05-refs.tsx" region="objectIs" -->

<!-- output from="hooks" path="refs.primitives.mount.0" as="text" -->

### 3. Depend on the primitives

<!-- source file="src/lessons/hooks/05-refs.tsx" region="primitiveDeps" -->

Two quantity clicks logged nothing at all:

<!-- output from="hooks" path="refs.primitives.unrelated" -->

"Bigger zoom" changed `scale`, so the effect re-ran exactly once:

<!-- output from="hooks" path="refs.primitives.scaleChanged" as="log" -->

The object is now built **inside** the effect, where its freshness doesn't matter.

## How it works

- **Ref objects** are the same object for the component's whole life; changing `.current` doesn't re-render. Besides DOM nodes they can hold any value you need between renders without displaying it (a timer id, the previous value).
- **Ref callbacks** run when the node is attached; in React 19 the function they return runs when it's detached. They're a good fit for "do something when this node appears", as long as the callback is stable (defined outside the component or memoized), otherwise they re-run every render, as recorded above.
- **Dependencies are compared one by one with `Object.is`.** Prefer primitive dependencies; if you must depend on an object or function, keep it stable with `useMemo`/`useCallback` or create it inside the effect.
- **Don't silence the lint rule** (`react-hooks/exhaustive-deps`). A missing dependency is usually a stale-closure bug waiting to happen ([[React Re-rendering]]).

## Common mistakes

- Reading `ref.current` during render: it's `null` on the first render and doesn't trigger updates.
- Objects, arrays or inline functions in dependency arrays.
- Inline ref callbacks that set up expensive things.

## Interview Q&A

**Q: Why can't you grab a DOM node directly inside a component?**
A: During render there isn't one. JSX returns element objects; React creates or updates DOM nodes later, in the commit. The `ref` prop is how React hands you the node once it exists.

**Q: Why did the inline ref callback reset the zoom on unrelated clicks?**
A: A new arrow function is created on every render. React treats a different ref callback as a different ref: it calls the old one's cleanup and the new one. Recorded: two quantity clicks → two `zoom destroyed` / `attachZoom` pairs.

**Q: Why does an effect with `[options]` re-run every render?**
A: Dependencies are compared with `Object.is`, which compares objects by identity. `{ scale, speed }` built during render is a new object each time. Recorded: `Object.is(a, b) → false` for two equal objects.

**Q: What's the fix?**
A: Depend on the primitive values (`[scale, speed]`) and build the object inside the effect, or memoize the object. Recorded: no re-runs for unrelated clicks; one re-run when `scale` changed.

**Q: What is a ref besides a DOM handle?**
A: A mutable box that persists across renders and doesn't cause a re-render when changed, for values the UI doesn't display.

## Related

- [[Side Effects]]: effects and cleanup.
- [[React Re-rendering]]: identity, `useMemo` and `useCallback`.

## Sources

- react.dev: [`useRef`](https://react.dev/reference/react/useRef), [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs), [Ref callbacks](https://react.dev/reference/react-dom/components/common#ref-callback), [Removing effect dependencies](https://react.dev/learn/removing-effect-dependencies)
- Dominik Dorfmeister (TkDodo), [Avoiding useEffect with callback refs](https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
