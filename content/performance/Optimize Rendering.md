---
source: https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render
---

# Optimize Rendering

## In one minute

A component re-renders when its state changes, a context it reads changes, or **its parent re-renders**. The last one is usually harmless: React compares the output and changes nothing in the DOM. It matters when it's multiplied, like a list of 500 rows that all re-render when you hover one. `memo` on the row skips renders when its props are equal, but **one prop that changes for every row** (like `highlightedIndex`) defeats it. Two fixes: a **custom comparator** that checks only what the row shows, or, simpler and preferred, **pass each row primitive props** it can compare directly (`isHighlighted`). And first: fix slow renders before unnecessary ones.

**You'll be able to:** use `memo` on list items, explain why it fails on a shared changing prop, and fix it with a comparator or derived primitive props.

<!-- figure name="listMemoAnim" -->

## The example: hovering a 500-product list

Hovering a row highlights it; clicking selects it; "Refresh" re-renders the list for an unrelated reason. Each row counts its renders, and the recorder reads the count after each action.

<!-- source file="src/lessons/performance/06-list.tsx" region="item" -->

<!-- source file="src/lessons/performance/06-list.tsx" region="list" -->

### 1. Plain rows

<!-- output from="performance" path="list.plain" as="json" -->

Every action rendered all 500 rows, even though a hover only changes two of them.

### 2. `memo`

<!-- source file="src/lessons/performance/06-list.tsx" region="memo" -->

<!-- output from="performance" path="list.memo" as="json" -->

"Refresh" now renders nothing: every prop is the same as last time. But hovering still renders all 500: each row receives `highlightedIndex`, which changed for **every** row, though only two rows look different.

### 3. A custom comparator

<!-- source file="src/lessons/performance/06-list.tsx" region="comparator" -->

<!-- output from="performance" path="list.comparator" as="json" -->

The comparator answers "would this row look different?". Hovering row 5 (from nothing) re-rendered 1 row; moving to row 6 re-rendered 2. But it duplicates the row's logic: if `ListItem` starts showing something new and the comparator isn't updated, the row silently shows stale data.

### 4. Primitive props

<!-- source file="src/lessons/performance/06-list.tsx" region="primitive" -->

<!-- source file="src/lessons/performance/06-list.tsx" region="primitiveUse" -->

<!-- output from="performance" path="list.primitive" as="json" -->

Same counts as the comparator, with plain `memo`. The parent computes `isHighlighted` for each row, so each row gets a boolean that only changes when its own highlight does. This is what react.dev recommends over custom comparators.

## How it works

- **Render, reconcile, commit.** A re-render calls the component (render), compares its new elements with the old ones (reconciliation), and touches the DOM only for differences (commit). An "unnecessary" re-render does the first two and commits nothing ([[Render and Commit]]).
- **`memo` skips render and reconciliation for that subtree**, but the parent still runs its `.map` and creates 500 elements to compare. For thousands of rows, see [[Windowing]].
- **The comparator returns `true` to skip** (props "equal"), the opposite of the old class `shouldComponentUpdate`.
- **Fix slow renders first.** A render that's slow every time it runs is still slow when it does have to run; `memo` only reduces how often.

## Common mistakes

- **A shared value as a prop of every row** (`highlightedIndex`, `selectedId`): every row's props change together. Derive per-row primitives in the parent.
- **Inline callbacks per row** (`onClick={() => select(p.id)}`): new functions every render. Pass a stable setter and the id, as above.
- **A comparator that ignores a prop the row uses.** Stale UI with no warning.
- **`memo` on cheap components with coarse updates.** It's overhead when the whole screen changes anyway.

## Interview Q&A

**Q: What are the reasons a component re-renders?**
A: Its state changes, a context it reads changes, or its parent re-renders (props changing is part of that last case). By default every child of a re-rendering parent re-renders. Recorded: "Refresh" rendered all 500 rows.

**Q: Why didn't `memo` help with hover?**
A: Every row received `highlightedIndex`, which changed, so every row's props differed. Recorded: 500 renders per hover with `memo`.

**Q: What's the second argument to `memo`?**
A: A comparator `(prevProps, nextProps) => boolean`; `true` means "equal, skip". Recorded: comparing only "was/is highlighted" brought a hover down to 1–2 renders.

**Q: Why prefer primitive props over a custom comparator?**
A: The comparison moves into the parent's data (`isHighlighted={i === highlightedIndex}`), so plain `memo` works and there's no comparator to keep in sync with the component. Recorded: the same 1–2 renders.

**Q: Slow render or unnecessary re-render: which first?**
A: The slow render. Skipping it sometimes still leaves it slow every time it runs.

## Related

- [[Element Optimization]]: how `memo` compares props.
- [[Windowing]]: when there are too many rows even with `memo`.
- [[React Re-rendering]]: what triggers renders.

## Sources

- Kent C. Dodds: [Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
- react.dev: [`memo`](https://react.dev/reference/react/memo) (including "Specifying a custom comparison function")
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
