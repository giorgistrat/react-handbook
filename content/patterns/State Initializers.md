---
source: https://react.dev/reference/react/useRef
---

# State Initializers

## In one minute

A reusable hook shouldn't hard-code its starting state. The **state initializer** pattern adds an `initial…` option (`useToggle({ initialOn: true })`) and usually a `reset()` that goes back to it. Like `useState`'s argument and an input's `defaultValue`, the initial value should count **only on the first render**. The subtle part: if the consumer's `initialOn` changes later, `reset()` must still go back to the value the hook *started* with. Keeping the initial state in a `useRef` makes sure of it.

**You'll be able to:** add an initial value and a reset to a custom hook, and keep reset stable when the prop changes.

<!-- figure name="initializerAnim" -->

## The example: gift wrap by default

The store has a setting: "Gift wrap new orders by default". The checkout's gift-wrap switch starts from that setting, and has a Reset button.

<!-- source file="src/lessons/patterns/06-state-initializer.tsx" region="reducer" -->

<!-- source file="src/lessons/patterns/06-state-initializer.tsx" region="page" -->

The recorded steps: start (setting ticked), click the switch off, untick the setting, then click Reset.

### 1. Initial state rebuilt every render

<!-- source file="src/lessons/patterns/06-state-initializer.tsx" region="plain" -->

<!-- output from="patterns" path="initializer.plain.steps" as="log" -->

Reset did nothing visible. `useReducer` used `initialState` only on the first render, but `reset` is a new function each render, and it captured **that** render's `initialState`, built from the current `initialOn` (`false`).

### 2. Initial state kept in a ref

<!-- source file="src/lessons/patterns/06-state-initializer.tsx" region="stable" -->

<!-- output from="patterns" path="initializer.stable.steps" as="log" -->

Reset went back to `on`, where the switch started. The ref is created on the first render and React returns the same object after that, so `initialState` is always the first one.

## How it works

- **`useRef(value)` keeps the first value.** The argument is evaluated on every render but only used on the first; after that `ref.current` is whatever was there. (`useState(() => …)` keeps a first value too, but it's state, meant for values the UI displays.)
- **`reset` is an action, not a computation.** `{ type: 'reset', initialState }` says "replace the state with this", which the reducer can't derive from the current state.
- **Initial means initial.** The same contract as `useState(initial)` and `<input defaultValue>`: later changes to the prop are ignored. If the consumer needs to change the value from outside at any time, that's [[Control Props]].
- **To start over completely,** the consumer can also change the component's `key`, which remounts it with fresh state ([[Rendering Arrays]]).

## Common mistakes

- **Expecting a new `initialOn` to change the current state.** It's only read on the first render.
- **Building the reset target from the current props** (recorded above).
- **Expensive initial values in `useRef(expensive())`.** The argument runs every render; compute it lazily if it's costly.

## Interview Q&A

**Q: What is the state initializer pattern?**
A: Letting the consumer of a hook or component choose its starting state with an `initial…` option, usually with a `reset` that returns to it. It's the same contract as `useState(initialValue)` or `defaultValue`.

**Q: Why should a later change to `initialOn` be ignored?**
A: Because it's an *initial* value, read once like `useState`'s argument. Following later changes would make it a controlled value, which is a different pattern ([[Control Props]]).

**Q: What's the bug with `const initialState = { on: initialOn }` and `reset`?**
A: `reset` is recreated each render and captures that render's `initialState`. If `initialOn` changed, reset goes to the new value, not the starting one. Recorded: after unticking the setting, Reset left the switch `off` instead of returning to `on`.

**Q: How does `useRef` fix it?**
A: The ref object is created once, on the first render, with `{ on: initialOn }`; later renders get the same object. `reset` dispatches that object, so it always goes back to the true starting state. Recorded: Reset returned to `on`.

**Q: How else can a consumer reset a component?**
A: Change its `key`. React unmounts it and mounts a new one, with all state starting over.

## Related

- [[The State Reducer Pattern]]: the next step, the consumer controls transitions.
- [[Control Props]]: the consumer controls the value at any time.
- [[Managing UI State]]: `useState`'s initial value and lazy initialization.

## Sources

- react.dev: [`useRef`](https://react.dev/reference/react/useRef), [`useReducer`](https://react.dev/reference/react/useReducer), [Resetting state with a key](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
