---
source: https://github.com/facebook/react/tree/v19.2.5/packages/react-reconciler/src
---

# React Engine Map

> React's source has hundreds of functions, and the notes mention about 90 of
> them. You don't need most of them. This card is the map: where each
> function sits, what calls what, which ones are worth remembering, and a
> deck of flashcards for the important ones. Anywhere on the site, tap a
> function name to see its card, or switch **Names off** in the top-right
> corner to read the notes in plain English.

## How to read React's function names

Almost every internal function belongs to one of four steps, and the name
usually tells you which:

| If the name starts with… | It belongs to | Example |
|---|---|---|
| `dispatch…`, `schedule…`, `ensure…`, `request…Lane` | **scheduling**: an update was requested | `dispatchSetState` |
| `perform…`, `render…`, `workLoop…`, `begin…`, `complete…`, `reconcile…`, `create…Fiber…`, `bailout…` | **render phase**: working out what changed | `beginWork` |
| `commit…`, `flush…Effects` | **commit phase**: changing the DOM, running effects | `commitRoot` |
| `mount…` / `update…` | the **first render** of something vs. a **re-render** | `mountState` / `updateReducer` |

And three rules cover most of the nesting:

- Everything in a render happens inside **`workLoopSync`** (or its concurrent
  twin), one fiber at a time: **`beginWork`** on the way down,
  **`completeWork`** on the way up.
- **Your component** is called from **`renderWithHooks`**, which is called
  from **`beginWork`**. Your `jsx()` calls and hooks run inside it.
- Everything in a commit happens inside **`commitRoot`**, in a fixed order:
  mutation (`flushMutationEffects`) → layout (`flushLayoutEffects`) → passive
  (`flushPassiveEffects`).

## The map

<!-- figure name="engineMap" -->

## The ten names worth knowing

If you only remember ten, make it these. Everything else is a helper of one
of them.

1. `dispatchSetState`: what your `setState` really is. It queues and schedules.
2. `ensureRootIsScheduled`: makes sure one render is coming (batching happens here).
3. `performWorkOnRoot`: renders, then commits, the root.
4. `workLoopSync`: the loop that processes one fiber at a time.
5. `beginWork`: going down: bail out, or render this fiber.
6. `renderWithHooks`: calls your component.
7. `reconcileChildren`: compares the new elements with the old fibers.
8. `completeWork`: going up: create DOM nodes, bubble flags.
9. `commitRoot`: applies everything to the DOM, all at once.
10. `flushPassiveEffects`: runs your `useEffect`s.

## Flashcards

<!-- figure name="flashcards" -->

## Glossary

Every function and fiber field used in the notes, grouped by step. Must-know
names come first in each group.

<!-- figure name="glossaryTable" -->
