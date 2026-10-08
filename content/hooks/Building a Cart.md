---
source: https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
---

# Building a Cart

## In one minute

This note puts the hooks so far together in one feature: a cart with quantity buttons, saved in `localStorage`, with undo. Three rules carry it. When the next state is computed from the previous one, pass an **updater function** (`setQty(q => q + 1)`), because the value in your handler is a snapshot of one render. **Never mutate state**: create a new array or object, or React sees the same reference and doesn't re-render. And keep **one** piece of managed state; everything else (the visible items, whether Undo is enabled) is derived from it.

**You'll be able to:** avoid lost updates, update arrays immutably, persist state, and build a history with undo.

<!-- figure name="updateQueueAnim" -->

## Lost updates: "Add 2"

<!-- source file="src/lessons/hooks/07-cart.tsx" region="stale" -->

One click, starting at 1:

<!-- output from="hooks" path="cart.stale.button" as="text" -->

<!-- source file="src/lessons/hooks/07-cart.tsx" region="updater" -->

<!-- output from="hooks" path="cart.updater.button" as="text" -->

`qty` is a constant in each render. Both `setQty(qty + 1)` calls compute `2`. Updater functions are queued and run in order, each receiving the result of the previous one. Rule of thumb: if the new value is calculated from the old one, use the function form; if you're replacing it outright (`setQty(1)`), either form works.

## Mutation: the array that didn't update

<!-- source file="src/lessons/hooks/07-cart.tsx" region="mutate" -->

Clicked twice:

<!-- output from="hooks" path="cart.mutate.logs" as="log" -->

<!-- output from="hooks" path="cart.mutate.button" as="text" -->

The array really has three items, but the button still says one. `setItems(items)` passes the same array, `Object.is(old, new)` is `true`, and React skips the render. Create a new array instead: `setItems([...items, 'Desk Lamp'])`, or `items.with(i, value)`, `items.filter(…)`, `items.toSorted()`.

## The whole cart: saved, with undo

<!-- source file="src/lessons/hooks/07-cart.tsx" region="saved" -->

The recorder added a mug, a lamp and another mug, pressed Undo, then added a lamp:

<!-- output from="hooks" path="cart.saved.afterAdds" as="text" -->

<!-- output from="hooks" path="cart.saved.afterUndo" as="text" -->

<!-- output from="hooks" path="cart.saved.afterNewAdd" as="text" -->

What was saved in `localStorage`:

<!-- output from="hooks" path="cart.saved.stored" -->

After reloading the page, the cart came back:

<!-- output from="hooks" path="cart.saved.afterReloadItems" as="text" -->

And across the reload plus another click, `readSavedCart` ran once:

<!-- output from="hooks" path="cart.saved.logsAfterReloadAndClick" as="log" -->

### How the pieces fit

- **Lazy initial state** reads and parses `localStorage` once, on mount ([[Managing UI State]]). The `try/catch` survives corrupted or hand-edited storage.
- **An effect writes it back** whenever `state` changes ([[Side Effects]]). Because every update creates a new object, `[state]` changes exactly when the cart does.
- **History is an array of snapshots** plus `step`, the one being shown. `items` is derived: `history[step]`.
- **Undo only moves `step`.** The later snapshot stays until you make a new change, which first drops everything after `step` (`history.slice(0, step + 1)`). That's why the third snapshot (the second mug) is gone from the saved history: adding the lamp after Undo replaced that future.

## Common mistakes

- `setX(x + 1)` several times in one handler, or in a timer/promise created in an earlier render.
- `push`, `splice`, `sort` or property assignment on state, followed by `setState(sameObject)`.
- Storing derived values (`items`, `canUndo`) next to the state they come from.
- Appending to a history without dropping the undone future.

## Interview Q&A

**Q: Why use `setQty(q => q + 1)` instead of `setQty(qty + 1)`?**
A: `qty` is the value from the render that created the handler; it doesn't change when you call the setter. Two `setQty(qty + 1)` calls both compute the same value. The updater form is queued and receives the latest pending value. Recorded: "Add 2" from 1 gave 2 vs 3.

**Q: Why doesn't mutating an array and calling `setItems(items)` re-render?**
A: React compares the new state with the old using `Object.is`. The same array reference means "no change", so the render is skipped. Recorded: `items.length = 3` but the button showed "1 items". Always create a new array/object.

**Q: How do you persist state to `localStorage`?**
A: Read it with a lazy initializer (`useState(readSaved)`, so parsing happens once, inside `try/catch`), and write it in an effect that depends on the state.

**Q: How does undo history work?**
A: Keep an array of past states and an index. Undo/redo move the index; a new change drops the states after the index and appends. The displayed state is derived from `history[step]`.

## Related

- [[useState vs useReducer]]: the same history logic as a reducer.
- [[React Re-rendering]]: closures and stale values.

## Sources

- react.dev: [Updating state based on the previous state](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state), [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state), [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- Kent C. Dodds, [useState lazy initialization and function updates](https://kentcdodds.com/blog/use-state-lazy-initialization-and-function-updates)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop (its tic-tac-toe capstone); the example app and code here are this handbook's own.
