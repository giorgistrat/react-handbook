---
source: https://kentcdodds.com/blog/how-to-optimize-your-context-value
---

# Optimize Context

## In one minute

When a provider's `value` changes (by `Object.is`), **every component that reads that context re-renders**, memoized or not. Three techniques cut that down, each removing a different kind of render:

1. **Memoize the value** (`useMemo`), so an unrelated re-render of the provider's parent doesn't create a "new" value.
2. **Move the state into a provider component** that takes `children`, so a change re-renders only the provider and its consumers, not the whole app.
3. **Split the context**: state in one, setters in another. Setters never change, so components that only set never re-render.

Don't do this for every context. It pays off when the value changes often, many components read it, and you've measured a problem.

**You'll be able to:** predict which components re-render after a context change, and apply each technique where it helps.

<!-- figure name="contextOptAnim" -->

## The example: the store theme

The store has a theme color. A memoized `Footer` shows it; a memoized `ColorPicker` only changes it; `Main` uses neither. `App` also has an unrelated "Visits" counter.

<!-- source file="src/lessons/performance/02-context.tsx" region="consumers" -->

Each version below was recorded with one "Visits" click, then one "Purple theme" click.

### 1. An inline value

<!-- source file="src/lessons/performance/02-context.tsx" region="inline" -->

Visits click, then theme click:

<!-- output from="performance" path="context.inline.count" as="log" -->

<!-- output from="performance" path="context.inline.color" as="log" -->

The counter has nothing to do with the theme, yet both memoized consumers rendered. `{ color, setColor }` is a new object on every `App` render, and React compares context values with `Object.is`. `memo` can't help: it only compares props, and context updates go around it.

### 2. Memoize the value

<!-- source file="src/lessons/performance/02-context.tsx" region="memoValue" -->

<!-- output from="performance" path="context.memo-value.count" as="log" -->

<!-- output from="performance" path="context.memo-value.color" as="log" -->

The counter no longer touches the consumers. `setColor` doesn't need to be in the dependencies: `useState` setters never change. But a theme change still re-renders `App` and `Main`, because the state lives in `App`.

### 3. A provider component

<!-- source file="src/lessons/performance/02-context.tsx" region="provider" -->

<!-- output from="performance" path="context.provider.count" as="log" -->

<!-- output from="performance" path="context.provider.color" as="log" -->

A theme change now starts **inside** `ThemeProvider`. Its `children` were created by `App`, which didn't re-render, so they're the same elements as last time and React skips them ([[Element Optimization]]). Only the context readers render. This is the standard shape for real providers: `AuthProvider`, `CartProvider`, `QueryClientProvider`.

### 4. Split state from setters

<!-- source file="src/lessons/performance/02-context.tsx" region="split" -->

<!-- output from="performance" path="context.split.count" as="log" -->

<!-- output from="performance" path="context.split.color" as="log" -->

`ColorPicker` reads only `SetColorContext`, whose value is `setColor`, which never changes. So a theme change re-renders only the footer that displays it.

### Summary

| Version | "Visits" click renders | Theme click renders |
| --- | --- | --- |
| Inline value | App, Main, ColorPicker, Footer | App, Main, ColorPicker, Footer |
| `useMemo` value | App, Main | App, Main, ColorPicker, Footer |
| Provider component | App, ThemeProvider, Main | ThemeProvider, ColorPicker, Footer |
| Split context | App, ThemeProvider, Main | ThemeProvider, Footer |

(From the recordings above. `Main` renders on a Visits click in every version: its parent rendered and it isn't memoized.)

## How it works

- **A provider compares its old and new value with `Object.is`.** If they differ, React walks down from the provider, finds every component that read that context, and schedules it, skipping `memo` checks ([[React Engine Map]], `propagateContextChanges`).
- **Each technique removes one kind of render.** `useMemo` removes consumer renders when nothing changed. The provider component removes the **tree** render when something did change. Splitting removes **setter-only** consumer renders.
- **`useReducer` makes splitting easy:** `dispatch` is stable, so one context can hold `state` and another `dispatch`.

## Common mistakes

- **Inline object values** (`value={{ a, b }}`), recorded above.
- **One giant app context.** Every reader of any field re-renders on any change. Split by what changes together.
- **Expecting `memo` to block context.** It doesn't; a component that shouldn't re-render must not read the changing context.
- **Doing all three everywhere.** It's more code to read. For a theme that changes once a session, an inline value is fine.

## Interview Q&A

**Q: When does a context consumer re-render?**
A: When the nearest provider's value changes by `Object.is`, whether or not the consumer is memoized.

**Q: Why is `<Ctx value={{ state, setState }}>` a performance problem?**
A: The object is new on every render of the component that renders the provider, so every consumer re-renders every time, even when nothing changed. Recorded: an unrelated counter click rendered both memoized consumers.

**Q: Why does a provider component with `children` help?**
A: When its state changes, only it re-renders. Its `children` prop holds elements created by its parent, which didn't re-render, so React reuses them and only renders the context readers. Recorded: a theme change no longer rendered `App` or `Main`.

**Q: What does splitting a context buy you?**
A: Components that only call setters read a context whose value never changes, so they never re-render from it. Recorded: after splitting, a theme change rendered only `ThemeProvider` and `Footer`.

**Q: Should you optimize every context like this?**
A: No. Measure first. These techniques matter for values that change often with many consumers.

## Related

- [[Context with use]]: the basics, including the memoized cart value.
- [[Element Optimization]]: why `children` from above are skipped.
- [[useSyncExternalStore]]: a store with selectors, for fast-changing shared state.

## Sources

- Kent C. Dodds: [How to optimize your context value](https://kentcdodds.com/blog/how-to-optimize-your-context-value), [How to use React context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- react.dev: [Optimizing re-renders when passing objects and functions](https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
