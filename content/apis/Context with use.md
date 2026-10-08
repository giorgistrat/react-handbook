---
source: https://react.dev/reference/react/createContext
---

# Context with use

## In one minute

**Prop drilling** means passing a value through layers of components that don't use it, only to reach one that does. **Context** solves it in three steps:

1. `createContext(defaultValue)` declares something that can be shared.
2. `<MyContext value={…}>` provides a value to everything below it.
3. Any component below reads it with `use(MyContext)`.

When the provided value changes, React re-renders **the components that read it**, even if the components in between are memoized. It decides "changed" with `Object.is`, so a provider value written as a new object on every render counts as a change on every render.

**You'll be able to:** share a theme and a cart through context, give consumers a clear error when the provider is missing, and keep context from re-rendering more than it should.

<!-- figure name="contextAnim" -->

## The example: theme and cart

The store has two shared values. The **theme** is read by every product card. The **cart** is read by the header badge and the "Add to cart" button. Without context, `App` would pass `theme` through `ProductGrid`, and the cart through `Header` and `ProductGrid`, though neither of them uses it.

### 1. Create the contexts

<!-- source file="src/lessons/apis/02-context.tsx" region="create" -->

<!-- source file="src/lessons/apis/02-context.tsx" region="cartContext" -->

`CartContext` defaults to `null`, meaning "no provider". The `useCart` hook turns that into a clear error and narrows the type from `CartValue | null` to `CartValue` for every caller.

### 2. Provide the values

<!-- source file="src/lessons/apis/02-context.tsx" region="provider" -->

<!-- source file="src/lessons/apis/02-context.tsx" region="app" -->

Since React 19 you render the context itself as the provider: `<ThemeContext value={…}>`. The older `<ThemeContext.Provider value={…}>` still works.

### 3. Read them

<!-- source file="src/lessons/apis/02-context.tsx" region="consumers" -->

`SaleTag` calls `use` **after an early return**. That's allowed for `use` and not for any hook, including `useContext`.

### Who re-rendered

Toggling the theme:

<!-- output from="apis" path="context.stable.theme" as="log" -->

`Header` and `ProductGrid` are `memo` components with no changed props, so they were skipped. React still reached the three `ProductCard`s below `ProductGrid`, because they read the theme. `CartBadge` and `AddButton` didn't render: the cart value is memoized and didn't change.

Clicking "Add to cart":

<!-- output from="apis" path="context.stable.add" as="log" -->

Now the same toggle with a provider that builds its value inline:

<!-- source file="src/lessons/apis/02-context.tsx" region="unstable" -->

<!-- output from="apis" path="context.unstable.theme" as="log" -->

`CartBadge` and `AddButton` rendered too. The theme toggle re-rendered `CartProvider`, which built a **new object** with the same contents, and React treats a new object as a new value.

### No provider

<!-- source file="src/lessons/apis/02-context.tsx" region="noProvider" -->

What rendered:

<!-- output from="apis" path="context.noProvider" as="json" -->

The card fell back to `ThemeContext`'s default, `'light'`. The badge hit `useCart`'s check, and the error boundary showed the message instead of a confusing `Cannot read properties of null`.

## How it works

- **A provider sets a value for a subtree.** `use(Ctx)` returns the value from the **nearest** provider above, or the default from `createContext` if there's none. Providers can be nested, and an inner one overrides an outer one.
- **Changes go straight to readers.** When a provider's value changes, React walks down from the provider and marks every component that reads that context (`propagateContextChanges` in the [[React Engine Map]]). Readers inside a memoized, skipped parent are still rendered. You can't block a context update with `memo`.
- **Changes are detected with `Object.is`.** For object values, memoize the object (`useMemo`) and its functions (`useCallback`, or a `setState` updater as in `CartProvider`), so the value only changes when its contents do.
- **`use` vs `useContext`.** Both read context. `use` can also be called conditionally and in loops, and it can read promises (see the Suspense notes). New code can use `use` everywhere.
- **Context is for values that are read widely and change rarely:** theme, signed-in user, locale, feature flags. A value that changes on every keystroke and has many readers re-renders all of them each time. For that, split the context, or use a store with selectors ([[useSyncExternalStore]]).

## Common mistakes

- **An inline object as the value** (`value={{ count, add }}`). Every render of the provider's parent re-renders every reader (recorded above).
- **One big context for everything.** A theme change re-renders cart readers, and a cart change re-renders theme readers. Split contexts by how often they change.
- **Reading a nullable context without a check.** Wrap it in a hook that throws a clear error.
- **Using context to avoid passing props one or two levels.** Passing props is clearer. Composition (passing JSX as `children`) often removes drilling without context.

## Interview Q&A

**Q: What problem does context solve?**
A: Prop drilling: passing a value through components that don't use it so a deep descendant can. With context, any component below a provider reads the value directly.

**Q: Walk through the three pieces of the context API.**
A: `createContext(default)` creates the context. `<Ctx value={v}>` (React 19; `<Ctx.Provider>` before that) provides a value to its subtree. `use(Ctx)` or `useContext(Ctx)` reads the nearest provider's value, or the default if there's none.

**Q: What's the difference between `use` and `useContext`?**
A: They read context the same way. `use` isn't bound by the rules of hooks, so it can run inside conditions, loops or after an early return, and it can also unwrap a promise. `useContext` must be called at the top level every render and only reads context.

**Q: When a context value changes, which components re-render?**
A: Every component that reads that context, wherever it is below the provider, even inside memoized parents. Recorded: toggling the theme rendered the three `ProductCard`s, while the memoized `Header` and `ProductGrid` were skipped.

**Q: Why can an inline provider value hurt performance?**
A: Context changes are detected with `Object.is`, and `{ count, add }` is a new object on every render. Recorded: with the inline value, a theme toggle also rendered `CartBadge` and `AddButton`, although the cart hadn't changed. `useMemo` fixed it.

**Q: How do you make a missing provider fail loudly?**
A: Default the context to `null` and read it through a custom hook that throws if the value is `null`. Recorded: "useCart must be used inside &lt;CartProvider&gt;", shown by the error boundary.

**Q: When is context the wrong tool?**
A: For values that change very often and are read by many components (every reader re-renders each time). Use a store with selectors, or split the context.

## Related

- [[useReducer]]: share `dispatch` through context to give distant components the cart actions.
- [[React Re-rendering]]: `memo`, `useMemo` and `Object.is`.
- [[useSyncExternalStore]]: a store outside React, for frequently changing shared state.
- [[React Engine Map]]: `readContext` and `propagateContextChanges`, how React finds context readers.

## Sources

- react.dev: [`createContext`](https://react.dev/reference/react/createContext), [`use`](https://react.dev/reference/react/use), [`useContext`](https://react.dev/reference/react/useContext), [Passing data deeply with context](https://react.dev/learn/passing-data-deeply-with-context)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
