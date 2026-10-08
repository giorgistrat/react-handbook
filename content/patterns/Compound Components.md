---
source: https://kentcdodds.com/blog/compound-components-with-react-hooks
---

# Compound Components

## In one minute

Compound components are a set of components that only make sense together and **share state implicitly**, like HTML's `<select>` and `<option>`: you don't wire each `<option>` to the select, it just works. In React, the parent (`Toggle`) owns the state and puts it in **context**; the pieces (`ToggleButton`, `ToggleOn`, `ToggleOff`) read it. The consumer decides which pieces to render, in what order, wrapped in whatever markup they like. A small hook that throws a clear error when a piece is used outside its parent makes the API safe.

**You'll be able to:** build a compound component with context, explain why the older `cloneElement` version breaks, and give a missing parent a helpful error.

<!-- figure name="compoundAnim" -->

## The example: "Gift wrap"

At checkout there's a gift-wrap switch, with a line of text that changes with it.

### 1. One owner, shared through context

<!-- source file="src/lessons/patterns/03-compound.tsx" region="context" -->

<!-- source file="src/lessons/patterns/03-compound.tsx" region="validation" -->

<!-- source file="src/lessons/patterns/03-compound.tsx" region="pieces" -->

### 2. What the consumer writes

<!-- source file="src/lessons/patterns/03-compound.tsx" region="usage" -->

No state and no props to wire. The texts sit inside the consumer's own `div`. Recorded, before and after clicking the switch:

<!-- output from="patterns" path="compound.context" as="json" -->

### 3. The older way: `cloneElement`

Before hooks, compound components were often built by copying props onto children:

<!-- source file="src/lessons/patterns/03-compound.tsx" region="clone" -->

With the same layout (texts inside a `div`):

<!-- output from="patterns" path="compound.clone" as="json" -->

The switch turned on, but the text didn't change. `Children.map` only sees **direct** children. The `div` is a direct child; the text components inside it never received `on`.

### 4. Used outside `<Toggle>`

Two buttons with no `Toggle` above them, one reading the context with `!`, one with `useToggleContext`:

<!-- source file="src/lessons/patterns/03-compound.tsx" region="unchecked" -->

What each error boundary showed:

<!-- output from="patterns" path="compound.outside.alerts" as="log" -->

The `!` only silenced TypeScript; at runtime the code crashed with an error that doesn't mention `Toggle`. The checking hook names the fix, and its `throw` lets TypeScript narrow the type to non-null on its own.

## How it works

- **Context carries the state through any depth.** Readers find the nearest provider above them ([[Context with use]]), so wrappers, fragments and conditional rendering don't break the connection.
- **The parent owns state, the consumer owns structure.** That split is the whole point: compared with one component that takes a big config prop (`options={[…]}`), every new layout need is just JSX, not a new prop.
- **The context value is a new object on every render** of `Toggle`, so every piece re-renders when `Toggle` does. That's fine for three pieces; for many, memoize the value.
- **Libraries use this everywhere:** Radix (`Tabs`, `Accordion`), Reach UI, Headless UI.

## Common mistakes

- **`use(Context)!` at every call site.** Centralize the read in one hook that throws a clear error.
- **Using `cloneElement`** for new code. It breaks as soon as a child is wrapped (recorded).
- **Exporting pieces that can't work alone** without saying so in the error message.

## Interview Q&A

**Q: What are compound components?**
A: Components designed to be used together that share state implicitly, the way `<select>` and `<option>` do. The parent owns the state; the children read it without the consumer passing props between them.

**Q: How do you build them today?**
A: The parent puts its state (`{ on, toggle }`) in a context provider around `children`; each piece reads the context through a custom hook. The consumer composes the pieces freely.

**Q: Why not `Children.map` + `cloneElement`?**
A: It only reaches direct children. Recorded: with the text components wrapped in a `div`, the switch turned on but the text stayed "No gift wrap". Context works at any depth.

**Q: What happens if a piece is rendered without its parent?**
A: With `use(ToggleContext)!`, the context is `null` and the code crashes with "Cannot destructure property 'on' of 'use(...)' as it is null." A checking hook throws "Toggle components must be rendered inside &lt;Toggle&gt;" instead, which also narrows the TypeScript type.

**Q: What's the advantage over a single component with a config prop?**
A: The consumer controls structure and markup with plain JSX, so the author doesn't have to add a prop for every layout variation.

## Related

- [[Composition and Layout Components]]: pass elements, not data.
- [[The Slots Pattern]]: share props by name instead of separate components per role.
- [[Context with use]]: how context reaches readers.

## Sources

- Kent C. Dodds: [React Hooks: Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- react.dev: [`cloneElement`](https://react.dev/reference/react/cloneElement) (and its alternatives), [`Children`](https://react.dev/reference/react/Children)
- Radix UI: [Tabs](https://www.radix-ui.com/primitives/docs/components/tabs), a production compound component
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
