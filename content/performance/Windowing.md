---
source: https://tanstack.com/virtual/latest
---

# Windowing

## In one minute

Some lists are slow even when every row is cheap and memoized: there are simply **too many** of them. React creates and compares an element per row, and the browser styles, lays out and paints a DOM node per row. **Windowing** (or **virtualization**) renders only the rows in view, plus a few extra (**overscan**), inside a tall spacer that gives the scrollbar the full list's height. As you scroll, rows leaving the window unmount and new ones mount. With `@tanstack/react-virtual`, you give `useVirtualizer` the row count, the scroll container and a size estimate, and render what `getVirtualItems()` returns.

**You'll be able to:** virtualize a long list, explain the spacer-and-offset layout, and name what you give up.

<!-- figure name="windowingAnim" -->

## The example: the whole catalog

The catalog page lists all 10,000 products in a 300 px box. React's `<Profiler>` reports how long rendering the list took:

<!-- source file="src/lessons/performance/07-windowing.tsx" region="profiler" -->

### 1. Render everything

<!-- source file="src/lessons/performance/07-windowing.tsx" region="all" -->

<!-- output from="performance" path="windowing.all" as="json" -->

10,000 rows in the DOM, about 13 visible, and every re-render (the "Refresh" button) redoes all of them.

### 2. Virtualized

<!-- source file="src/lessons/performance/07-windowing.tsx" region="virtual" -->

<!-- output from="performance" path="windowing.virtual" as="json" -->

18 rows in the DOM at the top (13 visible + 5 overscan below), 23 after scrolling to row 5,000 (overscan on both sides). The first visible product after the scroll was the same in both versions, so the scroll position and order are exact. (`nested-update` is the virtualizer measuring the container after mount and rendering once more.)

## How it works

- **The math:** from `scrollTop`, the container height and each row's size, the virtualizer computes the first and last visible indexes. `getTotalSize()` is the full height (10,000 × 24 px), set on an inner element so the scrollbar is right.
- **Rows are absolutely positioned** at `translateY(row.start)`. `transform` doesn't trigger layout for the other rows and is cheap to animate.
- **It re-renders on scroll**, but only when the visible range changes, and only those ~20 rows.
- **Variable heights:** pass a better `estimateSize` and let it measure real rows with `measureElement`.

## What you give up

- **In-page find (⌘F / Ctrl+F)** can't find rows that aren't in the DOM.
- **Screen readers** see only the rendered rows. Use `aria-setsize` and `aria-posinset` if the total matters.
- **Keyboard navigation** to an off-screen item needs `scrollToIndex` before focusing.
- **Scroll restoration and anchor links** need extra work.

## When to use it

Measure. A common rule of thumb: consider it when a view renders several hundred repeated rows, the DOM grows past roughly 1,500 nodes, or scrolling visibly janks. Below that, [[Optimize Rendering]] (memoized rows) is usually enough, and pagination or "load more" can be simpler still.

## Common mistakes

- **Forgetting the spacer height or the `position: relative` container.** Rows overlap or the scrollbar is wrong.
- **Keying rows by index** when the list can reorder: use `row.key` from the virtualizer, or the item's id.
- **A container without a fixed height or `overflow: auto`.** Nothing scrolls, so everything is "visible".

## Interview Q&A

**Q: What is windowing?**
A: Rendering only the visible part of a long list (plus a little overscan), with a spacer that keeps the full scroll height, and swapping rows in and out as the user scrolls. Recorded: 18 rows in the DOM instead of 10,000.

**Q: Why is a long list slow even if each row is memoized?**
A: `memo` skips calling each row, but the parent still creates and React still compares an element per row, and the browser still lays out every DOM node. Recorded: rendering all 10,000 rows took tens of milliseconds on every update; the virtualized list, a few.

**Q: What does `useVirtualizer` need?**
A: `count`, `getScrollElement` (the scrolling element) and `estimateSize` (a row's size). You render `getVirtualItems()`, positioned with each item's `start`, inside an element of height `getTotalSize()`.

**Q: What's overscan?**
A: Extra rows rendered just outside the viewport so fast scrolling doesn't show blank space before React catches up.

**Q: What do you lose?**
A: Browser find-in-page, full screen-reader context, simple keyboard navigation to off-screen items, and easy scroll restoration.

## Related

- [[Optimize Rendering]]: memoize rows first.
- [[Concurrent Rendering]]: keep input responsive while a big list renders.

## Sources

- [TanStack Virtual](https://tanstack.com/virtual/latest) (`@tanstack/react-virtual`)
- web.dev: [Virtualize large lists](https://web.dev/articles/virtualize-long-lists-react-window), [Avoid an excessive DOM size](https://developer.chrome.com/docs/lighthouse/performance/dom-size)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
