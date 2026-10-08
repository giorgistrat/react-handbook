# Advanced React Patterns

These notes are about **designing component and hook APIs**: how much control a component hands to whoever uses it, and how its pieces find each other without being wired up by hand. Each pattern answers that question differently:

- **Composition:** pass finished elements, not data.
- **Latest ref:** a function built once that still sees the latest values.
- **Compound components:** pieces share state through the tree.
- **Slots:** pieces share props by slot name.
- **Prop getters:** the hook hands out props and merges yours.
- **State initializer:** you choose the starting state.
- **State reducer:** you decide what each action does.
- **Control props:** you own the state itself.

The last four build one `useToggle` hook for the store's "Gift wrap" switch, handing over a little more control each time.

Every log, render list and DOM attribute here was recorded by running the product store in Chrome (`examples/product-store/src/lessons/patterns`).

> These patterns come from component libraries you probably use: Radix and Reach (compound components), React Aria (slots), Downshift (prop getters, state reducer, control props). Recognizing them makes those libraries' APIs much easier to read.
