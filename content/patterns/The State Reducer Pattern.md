---
source: https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks
---

# The State Reducer Pattern

## In one minute

A reusable hook can't predict every rule its users will want: "don't close on outside click", "keep the menu open after selecting", "no changes after the order is placed". Adding a boolean option for each doesn't scale. The **state reducer** pattern is **inversion of control**: the hook takes a `reducer` option and uses it instead of its own. The hook still decides *when* an action happens (a click dispatches `{ type: 'toggle' }`); the consumer decides *what it does*. Export the default reducer so consumers can override one case and delegate the rest.

**You'll be able to:** add a `reducer` option to a hook, veto an action from outside, and explain what React does when a reducer returns the same state.

<!-- figure name="stateReducerAnim" -->

## The example: locking gift wrap after the order

Once the order is placed, the gift-wrap choice can't change. That's a rule of this checkout page, not of `useToggle`, so it belongs to the consumer.

### 1. The hook takes a reducer

<!-- source file="src/lessons/patterns/07-state-reducer.tsx" region="hook" -->

The only change from [[State Initializers]] is `reducer = toggleReducer` as an option, and `export` on the default reducer.

### 2. The consumer's rule

<!-- source file="src/lessons/patterns/07-state-reducer.tsx" region="consumer" -->

Recorded: click the switch, place the order, click the switch again.

<!-- output from="patterns" path="stateReducer.toggleBefore" as="log" -->

<!-- output from="patterns" path="stateReducer.place" as="log" -->

<!-- output from="patterns" path="stateReducer.toggleAfter" as="log" -->

The last click was vetoed: the switch stayed on. Look at what rendered. React **did** call `GiftOptions` again, because `useReducer` runs the reducer while rendering the component. Then it saw the same state object and **bailed out**: `WrapNote` didn't render and nothing changed on the page. (It's often said that React skips the render entirely. The recording shows the component itself still runs once; only its children are skipped.)

## How it works

- **`useReducer` never cared where the reducer came from.** The extension point already exists: it's the first argument. The pattern is just "don't hard-code it".
- **The latest reducer is used.** The consumer's reducer is an inline function that reads `orderPlaced` from the current render; React runs the queued action with the reducer from the render that processes it, so it sees the current value.
- **Returning `state` is a veto.** Same object → React bails out ([[useReducer]]). Return a new object only when something should change.
- **Delegate to the exported default.** `return toggleReducer(state, action)` handles every case you didn't customize, and keeps working when the hook adds new action types.
- **The action shapes become public API.** Consumers' reducers depend on `{ type: 'toggle' }` and `{ type: 'reset', initialState }`. Renaming an action is a breaking change. Downshift exports its action types as constants for this reason.

## Common mistakes

- **Forcing consumers to reimplement the whole reducer** because the default isn't exported.
- **Returning `{ ...state }` to mean "no change".** That's a new object, so it's treated as a change.
- **Using it when the consumer needs to change the state from outside** (a reset button elsewhere, syncing two components). The reducer only sees the hook's own actions; for that, use [[Control Props]].

## Interview Q&A

**Q: What problem does the state reducer pattern solve?**
A: Consumers need custom behavior that the hook author can't predict. Instead of adding an option per request, the hook accepts a reducer and lets the consumer decide how each action changes the state.

**Q: Why is it called inversion of control?**
A: Normally the hook decides what every action does. Here the hook still decides when actions happen, but hands the decision of what they do to the caller.

**Q: How does a consumer veto an action?**
A: Return the current `state` unchanged. Recorded: after the order was placed, clicking the switch left it on. `GiftOptions` rendered once and bailed out; its child `WrapNote` didn't render.

**Q: Why export the default reducer?**
A: So a custom reducer can override one case and delegate everything else: `return toggleReducer(state, action)`. Without it, every consumer copies the whole reducer and it drifts from the hook's.

**Q: State reducer or control props?**
A: State reducer when the consumer wants to change how the component reacts to its own actions. Control props when the consumer needs to own the value, change it from outside, or keep several components in sync. Downshift supports both.

## Related

- [[useReducer]]: reducers and bail-outs.
- [[State Initializers]]: the previous step of this hook.
- [[Control Props]]: the next step, the consumer owns the value.

## Sources

- Kent C. Dodds: [The state reducer pattern with React Hooks](https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks), [When to use control props or state reducers](https://kentcdodds.com/blog/control-props-vs-state-reducers)
- [Downshift](https://github.com/downshift-js/downshift)'s `stateReducer` prop
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
