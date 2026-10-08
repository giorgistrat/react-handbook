---
source: https://react.dev/reference/react/useId
---

# The useId Hook

## In one minute

A `<label htmlFor="x">` focuses the input with `id="x"`, and ids must be unique on the page. A reusable `Field` component can't hard-code its id (it may render many times) and shouldn't force every caller to invent one. **`useId()`** returns an id that is unique for each component instance and identical on the server and in the browser, so it also works with server rendering, which a counter or `Math.random()` doesn't.

**You'll be able to:** connect labels and inputs (and `aria-*` attributes) safely in reusable components.

<!-- figure name="useIdAnim" -->

## The example: two review forms on one product page

### Hard-coded id

<!-- source file="src/lessons/hooks/06-useid.tsx" region="hardcoded" -->

Both review forms render two `Field`s. The ids in the page:

<!-- output from="hooks" path="useId.hardcoded.ids" -->

The recorder clicked the label "Your name" in the **Desk Lamp** form. What received focus:

<!-- output from="hooks" path="useId.hardcoded.focused" -->

The wrong field in the wrong form: with duplicate ids, the browser uses the first matching element.

### `useId`

<!-- source file="src/lessons/hooks/06-useid.tsx" region="useId" -->

<!-- output from="hooks" path="useId.useId.ids" -->

<!-- output from="hooks" path="useId.useId.focused" -->

Every field got its own id, and the label focused its own input. A caller can still pass an explicit `id`; the component only falls back to the generated one.

## How it works

- **The id comes from the component's position in the tree**, not from a counter. Server and client render the same tree, so they produce the same ids, and hydration matches. A module-level counter can differ between server and client (separate runtimes, different hydration order); `Math.random()` always does.
- **It's stable** for the life of the component: re-renders return the same string. There's no setter because it never needs to change.
- **One call, many ids:** derive related ids from it (`${id}-hint`, `${id}-error`) for `aria-describedby`.
- **Several React roots on one page** can pass `identifierPrefix` to `createRoot` / `hydrateRoot` (and the matching server API) so their ids don't collide.

## Common mistakes

- Using `useId` for list `key`s. Keys must come from the data ([[Rendering Arrays]]).
- Hard-coded ids in reusable components.
- Generating ids with a counter or `Math.random()` in apps that render on the server.

## Interview Q&A

**Q: What problem does `useId` solve?**
A: Unique ids for label/input and `aria-*` pairs inside components that can appear many times. Recorded: with a hard-coded id, clicking a label in the second form focused the first form's input; with `useId` (ids `_r_0_` … `_r_3_`) it focused its own.

**Q: Why not `Math.random()` or a counter?**
A: They can produce different values on the server and the client, which breaks hydration. `useId` derives the id from the component's place in the tree, which is the same in both.

**Q: Can you use `useId` for list keys?**
A: No. It identifies a component instance's position, not a data item. Keys must stay with the data as items move.

**Q: Why does `useId` return no setter?**
A: The id is an identity, not data: it's fixed for the component's lifetime so `htmlFor` and `id` never get out of sync.

## Related

- [[Forms]] and [[Inputs]] (Fundamentals): labels and accessible fields.

## Sources

- react.dev: [`useId`](https://react.dev/reference/react/useId), [`hydrateRoot` `identifierPrefix`](https://react.dev/reference/react-dom/client/hydrateRoot#parameters)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
