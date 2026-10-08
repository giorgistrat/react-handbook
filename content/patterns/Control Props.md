---
source: https://kentcdodds.com/blog/control-props-vs-state-reducers
---

# Control Props

## In one minute

**Control props** apply the controlled `<input value onChange>` idea to your own components. Left alone, `useToggle` manages its own `on` (uncontrolled). Pass it an `on` prop and it becomes **controlled**: it stops updating its own state and only **suggests** the next state through `onChange`. The parent decides whether to accept it (by setting its own state) or ignore it. This lets the parent own the value: keep two components in sync, change it from outside, or refuse a change.

**You'll be able to:** make a hook work both controlled and uncontrolled, explain the round trip a controlled change takes, and choose between control props and a state reducer.

<!-- figure name="controlPropsAnim" -->

## The example: one choice, two switches

The gift-wrap switch appears in the cart summary *and* on the checkout step. They must always agree, and after the order is placed neither may change. A newsletter switch on the same page is left uncontrolled.

### 1. The hook

<!-- source file="src/lessons/patterns/08-control-props.tsx" region="hook" -->

The key lines: `onIsControlled` is decided by whether an `on` prop was passed (`!= null`, so `undefined` and `null` both mean "not controlled"). When controlled, `dispatch` is skipped and the reducer is called **as a plain function**, only to compute the suggestion.

<!-- source file="src/lessons/patterns/08-control-props.tsx" region="toggle" -->

### 2. The page owns the value

<!-- source file="src/lessons/patterns/08-control-props.tsx" region="page" -->

Recorded. Clicking the **Cart** switch:

<!-- output from="patterns" path="controlProps.clickCart" as="log" -->

<!-- output from="patterns" path="controlProps.afterCart" as="text" -->

Both switches turned on, though only one was clicked: the click became a suggestion, `Checkout` stored it, and both toggles got the new `on`.

Clicking the uncontrolled **Newsletter** switch:

<!-- output from="patterns" path="controlProps.clickNewsletter" as="log" -->

It updated its own state; only it re-rendered, and `onChange` was just a notification.

After "Place order", clicking the **Checkout** switch:

<!-- output from="patterns" path="controlProps.clickCheckout" as="log" -->

<!-- output from="patterns" path="controlProps.final" as="text" -->

The parent ignored the suggestion, so **nothing rendered at all**: the toggle had skipped its own `dispatch`, and the parent didn't set state. A controlled component can only change through its parent.

## How it works

- **Two sources, one chosen.** `useReducer` always runs, but when controlled, `on` comes from the prop and the internal state is ignored. That avoids two copies of the truth drifting apart.
- **Suggestions come from the same reducer.** `reducer({ ...state, on }, action)` computes "what I'd do" without committing it. A custom reducer ([[The State Reducer Pattern]]) shapes the suggestion too.
- **The round trip:** click → `onChange(suggestion)` → parent `setState` → parent re-renders → new `on` prop → toggle shows it. If the parent doesn't call `setState`, nothing happens.
- **Same contract as form inputs.** An `<input value={v}>` ignores typing until your `onChange` sets `v` ([[Inputs]]). Like inputs, a component shouldn't switch between controlled and uncontrolled during its life; libraries such as Downshift warn when it does.

## Common mistakes

- **Passing `on` without `onChange`.** The component becomes read-only, like `<input value>` without `onChange`.
- **Passing `on={undefined}` sometimes and a boolean other times.** That silently switches modes.
- **Expecting `onChange` to mean the value changed.** In controlled mode it's a suggestion; the value changes only if the parent accepts it.
- **Using control props when a state reducer would do.** If the consumer only needs to tweak how the component reacts to its own clicks, a reducer is less work for them: they don't have to own and pass back the state.

## Interview Q&A

**Q: What are control props?**
A: Props that let the parent own a component's state, the way `value` and `onChange` do for `<input>`. Without them the component manages its own state; with them, it only suggests changes through `onChange`.

**Q: How does the hook know it's controlled?**
A: An `on` prop was passed: `const onIsControlled = controlledOn != null`. Then `on` is taken from the prop and internal `dispatch` is skipped.

**Q: Walk through a click on a controlled toggle.**
A: The toggle computes the suggested next state with its reducer and calls `onChange`. The parent sets its own state, re-renders, and passes the new `on` down. Recorded: clicking one switch logged `Checkout: setGiftWrap(true)`, then `Checkout` and both toggles rendered with `on: true`.

**Q: How does a parent veto a change?**
A: It doesn't call `setState`. Recorded: after the order was placed, the click logged only "ignored the change", and no component rendered.

**Q: Control props or state reducer?**
A: State reducer: the consumer changes how the component responds to its own actions, but the component still owns the state. Control props: the consumer owns the state, so it can change it from outside, sync several components, or drive it from a URL or a server. Control props are more powerful and more work for the consumer. They combine fine: this hook accepts both.

**Q: Where do you see this in real libraries?**
A: Every form input; Radix (`value`/`onValueChange`, `open`/`onOpenChange`); Downshift (`selectedItem`, `isOpen` with `onStateChange`).

## Related

- [[Inputs]]: controlled and uncontrolled inputs.
- [[The State Reducer Pattern]] and [[State Initializers]]: the earlier steps of this hook.
- [[Lifting State]]: owning shared state in the parent.

## Sources

- Kent C. Dodds: [When to use control props or state reducers](https://kentcdodds.com/blog/control-props-vs-state-reducers)
- react.dev: [Controlling an input with a state variable](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
- Radix UI: [Select](https://www.radix-ui.com/primitives/docs/components/select) (`value` / `onValueChange`)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
