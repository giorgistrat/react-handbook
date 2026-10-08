---
source: https://react.dev/learn/sharing-state-between-components
---

# Lifting State

## In one minute

Data in React flows down through props, so two sibling components can't share state directly. **Lifting state** moves the `useState` up to their closest common parent, which passes the value (and a way to change it) down to both. The opposite skill is **colocation**: once only one component needs a piece of state, move it back down into that component. Lower state means less code passing props around and fewer components re-rendering when it changes, but the state now lives only as long as that component does.

**You'll be able to:** decide where a piece of state belongs, and predict who re-renders when it changes.

<!-- figure name="liftAnim" -->

## The example: search + favorites

The search box and the product grid are siblings, so the query lives in their parent:

<!-- source file="src/lessons/hooks/04-lifting.tsx" region="app" -->

Each product card has a ♡ button. Where should "is this a favorite" live?

### Lifted into the grid (so it can sort)

<!-- source file="src/lessons/hooks/04-lifting.tsx" region="lifted" -->

Clicking ♡ on the Trail Backpack, recorded:

<!-- output from="hooks" path="lifting.lifted.click" as="log" -->

<!-- output from="hooks" path="lifting.lifted.order" -->

The grid and all six cards re-rendered, but the grid could sort favorites first. Searching "mug" (which hides the Backpack) and clearing the search again:

<!-- output from="hooks" path="lifting.lifted.backpackAfterFilter" as="text" -->

Still a favorite: the grid never unmounted.

### Colocated in each card (no sorting)

<!-- source file="src/lessons/hooks/04-lifting.tsx" region="colocated" -->

<!-- output from="hooks" path="lifting.colocated.click" as="log" -->

One card re-rendered. After hiding and showing it with the search:

<!-- output from="hooks" path="lifting.colocated.backpackAfterFilter" as="text" -->

The heart reset: the card unmounted when filtered out, and its state went with it.

## How it works

- **Re-renders start where the state lives.** `setFavorites` in the grid re-renders the grid and its children; `setIsFavorite` in a card re-renders that card. Lifting state up widens that circle; colocating narrows it.
- **Lift to the lowest common parent**, not higher. The query lives in `App` because both `Search` and `ProductGrid` need it; favorites didn't need to go to `App`.
- **Effects follow their state.** An effect that syncs a piece of state (like the `popstate` listener for the query) moves with it.
- **Colocation trades lifetime for simplicity.** If a value must survive its component being unmounted (filtered out, a tab switched), keep it higher, or outside React (URL, storage, server).

## Common mistakes

- Lifting everything to the top "just in case", which makes every change re-render the whole page.
- Leaving state lifted after the feature that needed it is gone.
- Duplicating state in parent and child instead of passing it down.

## Interview Q&A

**Q: What does lifting state mean, and when do you need it?**
A: Moving state to the closest common parent of the components that need it, then passing it down as props (plus a setter or callback). You need it when siblings must read or change the same value.

**Q: Why did favorites have to live in the grid to sort by them?**
A: Sorting compares every card's favorite status, and only a component that sees all of them can do that. A card can't sort a list it doesn't own.

**Q: What is state colocation, and why does it help?**
A: Keeping state in the lowest component that uses it. Fewer props, simpler parents, and fewer re-renders: recorded, a lifted favorite re-rendered the grid and six cards, a colocated one re-rendered a single card.

**Q: What's the downside of colocating?**
A: State disappears when its component unmounts. Recorded: the colocated Backpack lost its ♥ after being filtered out and back; the lifted one kept it.

## Related

- [[Managing UI State]]: derived state and controlled inputs.
- [[React Re-rendering]]: why children re-render with their parent.

## Sources

- react.dev: [Sharing state between components](https://react.dev/learn/sharing-state-between-components), [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- Kent C. Dodds, [State Colocation will make your React app faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
