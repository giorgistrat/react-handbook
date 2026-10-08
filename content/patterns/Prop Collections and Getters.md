---
source: https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters
---

# Prop Collections and Getters

## In one minute

A toggle button needs `aria-checked` set from state *and* an `onClick` that toggles. Every consumer of a `useToggle` hook has to remember both. A **prop collection** bundles them into an object (`togglerProps`) you spread onto the element. But a spread is just object keys: if you add your own `onClick`, one of the two handlers **silently replaces** the other. A **prop getter** fixes that. It's a function, `getTogglerProps(yourProps)`, that merges your props with the hook's and **chains** handlers so both run.

**You'll be able to:** write a prop getter with a `callAll` helper, and explain why a plain prop collection breaks custom handlers.

<!-- figure name="propGettersAnim" -->

## The example: tracking the gift-wrap button

The store wants an analytics event every time the gift-wrap button is clicked.

### 1. A prop collection

<!-- source file="src/lessons/patterns/05-prop-getters.tsx" region="collection" -->

Adding `onClick={track}` after the spread:

<!-- source file="src/lessons/patterns/05-prop-getters.tsx" region="spreadFirst" -->

Clicked twice:

<!-- output from="patterns" path="propGetters.spreadFirst.afterEachClick" as="log" -->

<!-- output from="patterns" path="propGetters.spreadFirst.logs" as="log" -->

Analytics ran, but the button never toggled: the later `onClick` replaced the hook's.

Putting it **before** the spread instead:

<!-- source file="src/lessons/patterns/05-prop-getters.bad.tsx" region="spreadLast" -->

<!-- output from="patterns" path="propGetters.spreadLast.afterEachClick" as="log" -->

<!-- output from="patterns" path="propGetters.spreadLast.logs" -->

Now it toggles, and analytics never runs. TypeScript does catch this order, because `togglerProps` definitely has an `onClick`:

<!-- output from="patterns" path="propGetters.tscErrors" as="log" -->

It can't catch the first order, which is valid code that just does the wrong thing.

### 2. A prop getter

<!-- source file="src/lessons/patterns/05-prop-getters.tsx" region="callAll" -->

<!-- source file="src/lessons/patterns/05-prop-getters.tsx" region="getter" -->

<!-- source file="src/lessons/patterns/05-prop-getters.tsx" region="getterUse" -->

<!-- output from="patterns" path="propGetters.getter.afterEachClick" as="log" -->

<!-- output from="patterns" path="propGetters.getter.logs" as="log" -->

Both ran on every click, and the extra `id` passed straight through (`id="gift-wrap"` on the button).

## How it works

- **Spreading is last-key-wins.** JSX props behave like an object literal, so two `onClick`s can't both survive a spread. Only code that runs can combine two functions.
- **The getter takes your props and returns the merged result.** It pulls out the handlers it needs to merge (`onClick`), chains them with `callAll`, and spreads everything else, so other props like `id` or `aria-label` pass through or override.
- **`callAll(onClick, toggle)`** returns one function that calls each one that's defined, in order. `callAll(undefined, toggle)` just toggles.
- **Name them `get…Props`.** Downshift (`getInputProps`, `getItemProps`, `getMenuProps`), React Table and Conform use this convention. Seeing it tells you: call this, don't spread your own handlers next to it.

## Common mistakes

- **Shipping a collection when consumers will add handlers.** Default to getters for anything with event handlers.
- **Letting the consumer override the handler entirely.** Chain the hook's handler; don't let a spread of `...props` after it replace it.
- **Needing a veto and only having `callAll`.** If the consumer's handler should be able to stop the hook's (say, after `preventDefault()`), check `event.defaultPrevented` before calling the hook's handler.

## Interview Q&A

**Q: What's a prop collection?**
A: An object of props a hook returns for a typical element, like `{ 'aria-checked': on, onClick: toggle }`, so the consumer can spread it in one line and get the behavior and accessibility right.

**Q: What breaks when the consumer adds their own `onClick`?**
A: Spread order decides which single `onClick` survives. Recorded: with the consumer's handler last, the switch never toggled; with it first, analytics never logged. TypeScript only flagged the second case (TS2783).

**Q: What's a prop getter, and how does it fix this?**
A: A function the hook returns, like `getTogglerProps(props)`, that takes the consumer's props and returns merged props, combining handlers with something like `callAll(theirs, ours)`. Recorded: both the toggle and the analytics call ran on each click.

**Q: Why destructure `onClick` separately in the getter?**
A: Because it's the prop that must be merged. Everything else is spread through as is, so the consumer can still add or override non-function props.

**Q: Where have you seen this pattern?**
A: Downshift's `getInputProps`/`getItemProps`, React Table's `getTableProps`, Conform's `getFormProps`: all prop getters.

## Related

- [[Compound Components]]: the component-level way to share toggle state.
- [[The State Reducer Pattern]]: the same `useToggle`, letting consumers control transitions.
- [[Inputs]]: `aria-*` attributes and form controls.

## Sources

- Kent C. Dodds: [How to give rendering control to users with prop getters](https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters), [Mixing component patterns](https://kentcdodds.com/blog/mixing-component-patterns)
- [Downshift](https://github.com/downshift-js/downshift), a library built on prop getters
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
