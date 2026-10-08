---
source: https://kentcdodds.com/blog/should-i-usestate-or-usereducer
---

# useState vs useReducer

## In one minute

Both hooks hold state; `useState` is in fact a `useReducer` with a built-in reducer. The choice is about shape. A value that changes **on its own** (a theme, an open flag, a search string) → `useState`. Several values that **change together**, or a next state that depends on **other** state → `useReducer`: all the transition logic goes into one pure function `(state, action) => newState`, React always calls it with the latest state, and the component just sends actions with `dispatch`. Start with `useState`; switch when you notice updates that have to read or keep several values in step.

**You'll be able to:** pick the right hook, explain the stale-closure bug that tips the balance, and test state logic without rendering.

<!-- figure name="staleSnapshotAnim" -->

## The example: "Recently viewed" with undo

The product page remembers what you looked at: `past`, `present` and `future`. Two things set it right after mount (a product opened from a link, another restored from a tab):

<!-- source file="src/lessons/hooks/08-reducer.tsx" region="viewer" -->

### Three `useState`s

<!-- source file="src/lessons/hooks/08-reducer.tsx" region="states" -->

<!-- output from="hooks" path="reducer.states.logs.1" as="text" -->

"Desk Lamp" is missing from `past`. Both effects called the same `set`, created during the first render, so both read `past = []` and `present = "Ceramic Mug"`; the second update overwrote the first. Adding `set` to the effects' dependencies makes it worse: `set` changes whenever `past`/`present` change, so the effects would run again and again.

### `useReducer`

<!-- source file="src/lessons/hooks/08-reducer.tsx" region="reducer" -->

<!-- output from="hooks" path="reducer.reducer.logs.1" as="text" -->

Nothing was lost. `set` only dispatches; it reads no state, so there's nothing to go stale, and its dependency list is empty. React runs the reducer for each action in order with the current state.

(You could also fix the `useState` version by merging the three values into one object and using updater functions everywhere. It works, but you end up writing a reducer inside each callback.)

### Reducers are plain functions

<!-- source file="src/lessons/hooks/08-reducer.tsx" region="pure" -->

<!-- output from="hooks" path="reducer.reducer.logs.0" as="text" -->

No component, no hooks, no DOM: every transition can be unit-tested with a function call.

## When `useState` is the better choice

A theme toggle is one independent value:

```tsx
function useTheme() {
	const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light')
	useEffect(() => localStorage.setItem('theme', theme), [theme])
	return [theme, setTheme] as const
}
```

Rewriting it with `useReducer`, action types and a `switch` adds ceremony and nothing else. Simplify that reducer to `(prev, next) => next` and you've reinvented `useState`.

## Decision guide

| Situation | Use |
|---|---|
| One independent value | `useState` |
| Several values that always change together | `useReducer` |
| Next state depends on other state | `useReducer` (or one `useState` object + updater functions) |
| A fixed set of named transitions (idle → loading → success/error) | `useReducer` |
| You want to unit-test the transitions | `useReducer` |
| Passing "how to update" deep through context | `useReducer` (`dispatch` never changes) |

Both setters (`setState` and `dispatch`) keep the same identity across renders, so either is safe in dependency arrays and as a prop to memoized children.

## Interview Q&A

**Q: When do you use `useState` and when `useReducer`?**
A: `useState` for independent values; `useReducer` when several values change together, when the next state depends on other state, or when you want named, testable transitions. Start with `useState` and move when updates start reading each other.

**Q: Is `useReducer` more powerful than `useState`?**
A: Structurally yes: `useState` is `useReducer` with a reducer that returns the new value (or calls it if it's a function). Anything you can do with one, you can do with the other; the question is which reads better.

**Q: What bug appears when related state is split across several `useState`s?**
A: Callbacks capture the values of the render that created them. Two updates before the next render both read the same snapshot and the second overwrites the first. Recorded: `past` ended as `["Ceramic Mug"]` instead of `["Ceramic Mug", "Desk Lamp"]`. A reducer gets the current state from React for each action, so it can't happen.

**Q: Why is a reducer easier to test?**
A: It's a pure function: `historyReducer(state, { type: 'undo' })` returns the next state, no rendering involved.

**Q: Why is `dispatch` handy to pass through context?**
A: It never changes identity and it's one entry point for every kind of update, so consumers that only dispatch don't need to re-render when the state changes.

## Related

- [[Building a Cart]]: the same history logic with `useState` + updater functions.
- [[React Re-rendering]]: stale closures in general.
- [[Hooks Under the Hood]] (React Internals): `useState` is `useReducer` inside React.

## Sources

- Kent C. Dodds, [Should I useState or useReducer?](https://kentcdodds.com/blog/should-i-usestate-or-usereducer) (the vault note this one is based on)
- react.dev: [`useReducer`](https://react.dev/reference/react/useReducer), [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
