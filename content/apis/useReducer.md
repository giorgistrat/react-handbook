---
source: https://react.dev/reference/react/useReducer
---

# useReducer

## In one minute

`useReducer` moves update logic out of event handlers into one pure function:

```ts
const [state, dispatch] = useReducer(reducer, initialArg, init?)
```

Handlers `dispatch` a plain **action** object that says *what happened* (`{ type: 'added', id }`). The **reducer** `(state, action) => newState` decides *how the state changes*. Because the reducer is a plain function, you can test it without React. And because `dispatch` never changes, you can pass it down without breaking `memo`.

**You'll be able to:** model a cart as typed actions plus a reducer, wrap it in a custom hook, and explain what React does when the reducer returns the same state.

<!-- figure name="reducerAnim" -->

## The example: the cart

The cart supports four things: add a product, remove one, change a quantity, and clear the cart. With `useState`, that's four handlers that each copy and patch the `items` array. With a reducer, it's one `switch`.

### 1. Actions as a TypeScript union

<!-- source file="src/lessons/apis/01-reducer.tsx" region="types" -->

Each action has a `type` string, and TypeScript narrows on it. Inside `case 'quantityChanged'`, `action.qty` exists. Inside `case 'cleared'`, it doesn't.

### 2. The reducer

<!-- source file="src/lessons/apis/01-reducer.tsx" region="reducer" -->

Notice the two `return state` lines. When an action changes nothing, the reducer hands back the **same object**, and that matters below.

### 3. Testing it without React

The reducer is just a function, so call it:

<!-- source file="src/lessons/apis/01-reducer.tsx" region="pure" -->

<!-- output from="apis" path="reducer.pure.logs" as="log" -->

No component and no rendering. `empty` wasn't mutated: every change built a new object.

### 4. A custom hook with lazy initialization

<!-- source file="src/lessons/apis/01-reducer.tsx" region="init" -->

<!-- source file="src/lessons/apis/01-reducer.tsx" region="useCart" -->

The third argument is an **initializer**: React calls `loadCart('cart')` once, on mount. A cart was saved with two lamps, then "Add mug" was clicked twice:

<!-- output from="apis" path="reducer.saved.logs" as="log" -->

`loadCart` ran once. Compare calling it yourself:

<!-- source file="src/lessons/apis/01-reducer.tsx" region="eager" -->

<!-- output from="apis" path="reducer.eager.logs" as="log" -->

The result is the same, but `localStorage` is read and parsed on **every render**, and the value is thrown away after the first one.

### 5. The components

<!-- source file="src/lessons/apis/01-reducer.tsx" region="cart" -->

Recorded, click by click. Mount:

<!-- output from="apis" path="reducer.clicks.mount" as="log" -->

"Add mug":

<!-- output from="apis" path="reducer.clicks.addMug" as="log" -->

"Remove backpack" (no backpack in the cart):

<!-- output from="apis" path="reducer.clicks.removeMissing" as="log" -->

"Clear", then "Clear" again:

<!-- output from="apis" path="reducer.clicks.clear" as="log" -->

<!-- output from="apis" path="reducer.clicks.clearAgain" as="log" -->

What to notice:

- **`CartButtons` rendered once, on mount.** It's wrapped in `memo`, and its only prop is `dispatch`, which is the same function on every render.
- **When the reducer returned the same object, `Cart` still ran**, but `FreeShippingNote` didn't. React runs the reducer while rendering `Cart`, so it only finds out "nothing changed" after `Cart` has started. It then **bails out**: it skips the children, and nothing on the page changes.
- "Clear" on an empty cart behaved the same way, because the `'cleared'` case returns `state` when there's nothing to clear.

### 6. A typo in an action type

<!-- source file="src/lessons/apis/01-reducer.tsx" region="typo" -->

<!-- output from="apis" path="reducer.typo.logs" as="log" -->

`dispatch` itself didn't throw. It only queued the action. The reducer threw while React was rendering, so the **nearest error boundary** caught it ([[Error Boundaries]]). The TypeScript union normally prevents this typo; the `as unknown as` cast was needed to get past it.

## How it works

- **`dispatch` queues, the reducer computes.** Each `dispatch(action)` is added to the hook's update queue. On the next render, React runs `reducer(state, action)` for each queued action in order, each one getting the previous result. This is why a reducer never reads stale state (the bug in [[useState vs useReducer]]).
- **Same state → bail out.** If the final state is `Object.is`-equal to the old one, React skips the component's children and doesn't commit. Return `state` itself when nothing changes, and a new object only when something does.
- **Reducers must be pure.** No mutation, no `localStorage`, no fetching. In development, Strict Mode calls your reducer twice to catch impure ones. Side effects belong in effects or event handlers.
- **Under the hood**, `useState` is `useReducer` with a built-in reducer, `(state, action) => typeof action === 'function' ? action(state) : action` ([[Hooks Under the Hood]]).

## Common mistakes

- **Mutating state in the reducer** (`state.items.push(…); return state`). It returns the same object, so React bails out and nothing updates.
- **Calling the initializer yourself**: `useReducer(r, loadCart('cart'))` instead of `useReducer(r, 'cart', loadCart)`.
- **Putting side effects in the reducer** (saving, logging to a server). Use an effect, as `useCart` does with `localStorage`.
- **One reducer for unrelated values.** Independent values are simpler as separate `useState`s ([[useState vs useReducer]]).

## Interview Q&A

**Q: What's the signature of `useReducer`, and what does each part do?**
A: `const [state, dispatch] = useReducer(reducer, initialArg, init?)`. `reducer(state, action)` returns the next state. `initialArg` is the initial state, or the argument passed to `init`. `dispatch(action)` queues an action for the next render.

**Q: When is a reducer better than several `useState`s?**
A: When values must change together, or one update depends on another value. A cart with add, remove, change-quantity and clear is a good example: one reducer keeps every transition in one place. Truly independent values are simpler as separate `useState`s.

**Q: How do you test a reducer?**
A: Call it. It's a pure `(state, action) => newState` function, so a test passes a state and an action and checks the result. Recorded: `cartReducer(empty, { type: 'added', id: 'p1' })` returned a cart with one mug, and `empty` was unchanged.

**Q: What happens when the reducer returns the same state object?**
A: React bails out: the children don't render and the page doesn't change. Recorded: "Remove backpack" on a cart without one logged `Cart render` but no `FreeShippingNote render`. The component itself still ran, because React computes reducer state while rendering it.

**Q: Why is `dispatch` useful to pass down?**
A: It has a stable identity: the same function for the component's whole life. A memoized child that receives only `dispatch` never re-renders because of it. Recorded: `CartButtons` rendered once, on mount.

**Q: What's the third argument for?**
A: A lazy initializer, called once with `initialArg` on mount. Use it for expensive setup like reading `localStorage`. Recorded: `loadCart` ran once over three renders, but on every render when called directly.

**Q: How do you get type safety for actions?**
A: Model them as a discriminated union on `type`. TypeScript narrows `action` in each `case`, so only the fields that action has are available, and a misspelled `type` is a type error.

## Related

- [[useState vs useReducer]]: when to choose which, and the stale-closure bug.
- [[Building a Cart]]: the same cart built with `useState` updater functions.
- [[Context with use]]: share `dispatch` with distant components.
- [[Hooks Under the Hood]]: the update queue both hooks use.

## Sources

- react.dev: [`useReducer`](https://react.dev/reference/react/useReducer), [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
