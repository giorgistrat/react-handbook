---
source: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
---

# Error Boundaries

## In one minute

If a component throws while rendering and nothing catches it, React removes the **whole app** from the page. You can't fix that with `try`/`catch` around JSX, because JSX only creates element objects: the component runs later, inside React. An **error boundary** is a component that catches errors thrown while rendering anything below it and shows a fallback instead, like a `catch` block for a part of the tree. Most apps use the small `react-error-boundary` package rather than writing the class component themselves.

**You'll be able to:** put boundaries in the right place, know which errors they can't see, and recover with "Try again".

<!-- figure name="boundaryAnim" -->

## The example: a product the API sent without a price

<!-- source file="src/lessons/fundamentals/09-error-boundaries.tsx" region="details" -->

### Without a boundary

<!-- source file="src/lessons/fundamentals/09-error-boundaries.tsx" region="noBoundary" -->

What the lesson logged (the root was created with `onUncaughtError` / `onCaughtError` callbacks):

<!-- output from="fundamentals" path="errors.noBoundary.logs" as="log" -->

And `#root` afterwards:

<!-- output from="fundamentals" path="errors.noBoundary.rootHtml" as="text" -->

Empty: the heading and everything else is gone. Notice `ProductDetails renders p404` twice: when a component throws, React renders it once more before giving up, in case the error was a one-off.

### With a boundary

<!-- source file="src/lessons/fundamentals/09-error-boundaries.tsx" region="fallback" -->

<!-- source file="src/lessons/fundamentals/09-error-boundaries.tsx" region="boundary" -->

The page text afterwards:

<!-- output from="fundamentals" path="errors.boundary.text" -->

Only the broken product was replaced. The heading and the healthy product next to it are still there.

## What a boundary can't catch

A boundary catches errors thrown **while React renders** (and in lifecycle methods). It can't see errors that happen outside rendering: event handlers, `setTimeout`, promises. For those, `useErrorBoundary().showBoundary(error)` hands the error to the nearest boundary yourself:

<!-- source file="src/lessons/fundamentals/09-error-boundaries.tsx" region="handler" -->

Clicking "Add to cart":

<!-- output from="fundamentals" path="errors.unsafe" -->

Clicking "Add to cart (reported)":

<!-- output from="fundamentals" path="errors.safe" -->

A boundary also can't catch an error in **itself** or in its **fallback**: those go to the next boundary up.

## Trying again

`resetErrorBoundary` (passed to the fallback) clears the error and mounts the children **again from scratch**. Pair it with `onReset` to fix whatever caused the error:

<!-- source file="src/lessons/fundamentals/09-error-boundaries.tsx" region="reset" -->

<!-- output from="fundamentals" path="errors.reset" -->

The note input was inside the boundary, so it disappeared with the error and came back empty: a reset re-mounts, it doesn't restore state.

## Where to put boundaries

- **The component that may throw must be a child of the boundary**, not the component that renders the boundary. A boundary only catches errors from the tree below it.
- One boundary near the root avoids blank pages; smaller ones around independent widgets (a product, a review list, a sidebar) keep the rest of the page usable.
- Still log everything: React 19's `createRoot(container, { onCaughtError, onUncaughtError })` runs for every error, caught or not.

## Interview Q&A

**Q: Why can't `try`/`catch` around JSX catch render errors?**
A: JSX only builds element objects. The component function runs later, when React renders, long after the `try` block has finished. Errors thrown there are caught by React, which looks for an error boundary above the component.

**Q: Why must the component that might throw be inside the boundary?**
A: A boundary catches errors from its descendants only. If the risky code is in the same component that renders the boundary, the error happens before the boundary exists in the tree.

**Q: What happens to the page when a render error isn't caught?**
A: React unmounts the whole root. Recorded: `#root` was `""` and `onUncaughtError` fired. With a boundary, only that subtree showed the fallback; the rest of the page stayed.

**Q: Which errors can't an error boundary catch?**
A: Errors in event handlers, timers and async code (they don't happen during rendering), errors in the boundary itself, and errors in its fallback. Recorded: an error thrown in an `onClick` reached `window`'s error event and no fallback appeared; with `showBoundary(error)` the fallback appeared.

**Q: What does `resetErrorBoundary` do?**
A: It clears the error and mounts the boundary's children again as if for the first time, so their local state is lost. Use `onReset` to change whatever caused the error, otherwise it will just throw again.

**Q: Why does an error boundary have to be a class component?**
A: The APIs React uses to catch render errors, `static getDerivedStateFromError` and `componentDidCatch`, only exist on class components. Libraries like `react-error-boundary` wrap that class so you can use it as a regular component plus hooks.

## Related

- [[Forms]]: errors thrown in event handlers and actions.
- [[Rendering Arrays]]: another way to remount a subtree, with `key`.

## Sources

- react.dev: [Catching rendering errors with an error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary), [`createRoot` options](https://react.dev/reference/react-dom/client/createRoot#parameters)
- [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
