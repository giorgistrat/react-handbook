---
source: https://kentcdodds.com/blog/prop-drilling
---

# Composition and Layout Components

## In one minute

**Prop drilling** is passing a prop through components that don't use it, so that a component further down can. It often happens with **layout components**: a `Nav`, a `Main`, a `Footer` whose only job is to decide *where* things go. The fix is to stop passing them data and pass them **finished elements** instead. The component that owns the data builds the element (`<img src={user.avatar} />`), and the layout component just places it. For one region that's `children`; for several regions, named props like `sidebar` and `content`.

**You'll be able to:** spot a layout component that's forwarding data, and turn it into one that takes elements.

<!-- figure name="compositionAnim" -->

## The example: the product page

The page has a nav bar with the shopper's avatar, a main area with a product list and the selected product's details, and a footer greeting. `App` owns the user, the products and the selection.

### 1. Data drilled through the layout

<!-- source file="src/lessons/patterns/01-composition.tsx" region="drilled" -->

What each layout component received:

<!-- output from="patterns" path="composition.drilled.mount" as="log" -->

`Nav` and `Footer` take the whole `user` to show an image and a name. `Main` takes three props it never reads, only passes on.

### 2. Elements built where the data is

<!-- source file="src/lessons/patterns/01-composition.tsx" region="composed" -->

<!-- output from="patterns" path="composition.composed.mount" as="log" -->

None of the layout components sees `user`, the products or `setSelected` any more. Both versions behave the same (clicking Desk Lamp showed `Desk Lamp: $39.00` in each). What changed is the **dependencies**: if `User` gains a field, or the list needs a new prop, only `App` and the component that actually uses it change.

The components that really *use* the data, `ProductList` and `ProductDetails`, still take normal props. The pattern is for the components **in between**.

## How it works

- **A JSX element is just a value.** `<img … />` is an object you can store in a variable or pass as a prop ([[Using JSX]]). The layout component renders it with `{avatar}`, wherever it wants.
- **`children` is the one-slot case.** `<Footer>Happy shopping</Footer>` is `Footer({ children: 'Happy shopping' })`. Use named element props (`sidebar`, `content`) only when there's more than one region.
- **State doesn't move.** `selected` still lives in `App`. Composition changes how the pieces that read it get to their place, not where it's stored.
- **A performance bonus:** an element passed in from above is the same object when only the layout component re-renders, so React can skip it. That's covered in the Performance module.

## Common mistakes

- **Reaching for context first.** Context is for values many unrelated components need (theme, user). If one piece of UI just needs to be *placed* somewhere, pass the element.
- **Turning every prop into an element prop.** A component that reads and branches on data (like `ProductDetails` checking whether a product is selected) should take the data.
- **Ten named slots.** If a layout takes so many element props that it's hard to read, look at [[Compound Components]] or [[The Slots Pattern]].

## Interview Q&A

**Q: What is prop drilling, and why is it a problem?**
A: Passing props through components that don't use them, just to reach a descendant. Every component in the chain then depends on data it doesn't care about, so changes to that data ripple through all of them. Recorded: `Main` received `products, selected, onSelect` and used none of them.

**Q: How does composition fix it?**
A: Build the element where the data lives and pass the element down. Layout components take `ReactNode` props (or `children`) and only decide where to render them. Recorded: `Nav` got `avatar`, `Main` got `sidebar, content`, `Footer` got `children`: no data at all.

**Q: When do you use `children` vs named element props?**
A: `children` when there's one region to fill. Named props like `sidebar` and `content` when a layout has several independent regions.

**Q: Isn't this just context with extra steps?**
A: No. Context shares a value with many components implicitly. Composition places a specific piece of UI. Reach for composition first: it adds no provider, no hook, and no extra re-renders.

**Q: When does it stop paying off?**
A: When a layout component's list of element props gets long and hard to follow. Then the pieces often belong together as compound components or slots.

## Related

- [[Custom Components]]: props and `children`.
- [[Compound Components]] and [[The Slots Pattern]]: composition with implicit wiring.
- [[Context with use]]: the alternative for widely shared values.

## Sources

- Kent C. Dodds: [Prop drilling](https://kentcdodds.com/blog/prop-drilling), [One React mistake that's slowing you down](https://www.epicreact.dev/one-react-mistake-thats-slowing-you-down)
- react.dev: [Passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
