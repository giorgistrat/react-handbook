---
source: https://react.dev/reference/react/useState
---

# Managing UI State

## In one minute

`useState` gives a component a value React remembers between renders, plus a function to change it: `const [query, setQuery] = useState('')`. Calling `setQuery` doesn't change `query` in the running code; it asks React to render again, and in that next render `useState` returns the new value. Three habits make state code reliable: make inputs **controlled** (state is written back with `value`), **derive** anything you can compute instead of storing it twice, and pass a **function** to `useState` when the first value is expensive to compute.

**You'll be able to:** wire an input to state correctly, avoid duplicated state, and know when the lazy initializer matters.

<!-- figure name="controlledLoopAnim" -->

## The example: product search with category filters

The product store's search box narrows products by name or category. Ticking a category checkbox adds its name to the query (`"lamp office"`).

### First attempt: onChange only

<!-- source file="src/lessons/hooks/01-search.tsx" region="uncontrolled" -->

The recorder typed "lamp", ticked **office**, then replaced the text with "audio":

<!-- output from="hooks" path="search.uncontrolled.afterCheckbox" -->

<!-- output from="hooks" path="search.uncontrolled.typedAudio" -->

State and screen disagree: the results use `"lamp office"`, but the box still shows `"lamp"`; and typing "audio" doesn't tick the audio checkbox. The DOM elements keep their own values, and React only *hears* about changes.

### Controlled and derived

<!-- source file="src/lessons/hooks/01-search.tsx" region="controlled" -->

<!-- output from="hooks" path="search.controlled.afterCheckbox" -->

<!-- output from="hooks" path="search.controlled.typedAudio" -->

Two changes fixed both problems:

- **`value={query}`** makes the input controlled: every render writes the state back into it. The browser shows what React says.
- **`checked={words.includes(c)}`** derives the checkboxes from `query` instead of giving each one its own `useState`. There's one source of truth; the checkboxes can't drift from it because they're recomputed on every render.

## Reading the first value from the URL

A shared link like `?query=mug` should pre-fill the search:

<!-- source file="src/lessons/hooks/01-search.tsx" region="init" -->

The recorder opened `?query=mug` and typed " xl" (three keystrokes, three re-renders). How often `getQueryParam` ran:

`useState(getQueryParam())`:

<!-- output from="hooks" path="search.eager.logs" as="log" -->

`useState(getQueryParam)`:

<!-- output from="hooks" path="search.lazy.logs" as="log" -->

`useState(getQueryParam())` calls the function on every render and throws the result away after the first. Passing the function itself lets React call it once, on mount. That matters for expensive work (parsing `localStorage`, building a big object); for `useState('')` or `useState(0)` it doesn't.

## How it works

- **React stores state per component instance, in call order.** Each `useState` call takes the next slot in a list React keeps for this component. That's why hooks can't be called conditionally or in loops: skip one call and every later hook reads the wrong slot. ([[Hooks Under the Hood]] shows the real data structure.)
- **`setX` schedules, it doesn't assign.** Inside the same handler, `query` still has the old value. The new value arrives in the next render.
- **Controlled needs both halves.** `value` without `onChange` freezes the field ([[Inputs]]); `onChange` without `value` leaves the DOM in charge.
- **Initializers must be pure.** In development Strict Mode, React calls them twice to catch side effects.

## Common mistakes

- Copying a prop or another state value into its own `useState` "to keep it handy". Compute it during render instead.
- `useState(expensiveCall())` when `useState(expensiveCall)` or `useState(() => expensiveCall(arg))` was meant.
- Reading state right after setting it and expecting the new value.

## Interview Q&A

**Q: What does `useState` give you?**
A: The current value and a setter. React keeps the value outside the function, so it survives the function being called again on every render; calling the setter schedules a render in which `useState` returns the new value.

**Q: What makes an input "controlled"?**
A: Passing `value` (or `checked`) from state together with an `onChange` that updates that state. Every render writes the state into the DOM, so React is the single source of truth. Recorded: with `onChange` only, ticking "office" changed the query to `"lamp office"` while the box still showed `"lamp"`; with `value={query}` the box showed `"lamp office"`.

**Q: Why derive values instead of storing them in more state?**
A: A second piece of state is a second copy that must be kept in sync by hand. If a value can be computed from existing state or props (`words.includes('audio')`), compute it during render: it can never be out of date. Recorded: the derived audio checkbox ticked itself when "audio" was typed.

**Q: What's the difference between `useState(fn())` and `useState(fn)`?**
A: `useState(fn())` calls `fn` on every render and uses the result only the first time. `useState(fn)` hands React the function, which it calls once, on mount. Recorded: four calls vs one over the same three keystrokes.

**Q: Why can't hooks be called conditionally?**
A: React matches each hook call to its stored state by order. If a hook is skipped on one render, every hook after it gets another hook's state.

## Related

- [[Side Effects]]: keeping the query in sync with the back button.
- [[Inputs]] (Fundamentals): `value` vs `defaultValue`.
- [[Hooks Under the Hood]] (React Internals): the hook list and update queue.

## Sources

- react.dev: [`useState`](https://react.dev/reference/react/useState), [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure), [Avoiding recreating the initial state](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)
- Shawn Wang, [Getting Closure on Hooks](https://www.swyx.io/getting-closure-on-hooks/)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
