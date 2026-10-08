---
source: https://react.dev/reference/react/createElement
---

# Raw React APIs

## In one minute

React for the web is two packages. **`react`** creates *descriptions* of UI; **`react-dom`** turns those descriptions into real DOM. `createElement(type, props, ...children)` doesn't create a DOM node: it returns a small, frozen JavaScript object, a **React element**. Nothing touches the page until you hand that object to `createRoot(container).render(element)`, and even then the DOM work happens a moment later.

**You'll be able to:** say what a React element is, read one, and explain why `key` never shows up in `props`.

<!-- figure name="elementObjectAnim" -->

## The example: the card, with React

The same product card as in [[Hello World in JS]], described with `createElement`:

<!-- source file="src/lessons/fundamentals/02-create-element.ts" region="element" -->

The object it returns, as logged by the lesson (nested elements included):

<!-- output from="fundamentals" path="createElement.element" -->

Read it as "an `article` with a class, whose children are an `h2` element and a `p` element". `$$typeof` is a Symbol that marks the object as a genuine React element, so a plain JSON object from an API can't be mistaken for one.

Then the lesson renders it, and checks `#root` twice:

<!-- source file="src/lessons/fundamentals/02-create-element.ts" region="render" -->

<!-- output from="fundamentals" path="createElement.logs" as="log" -->

## How it works

- **`children` is just a prop.** Extra arguments after `props` become `props.children` (an array when there are several). A string child is turned into a text node by React; you don't wrap it.
- **Elements are immutable.** In development React freezes both the element and its `props` (`frozen? true true` above). A new render creates new elements instead of editing old ones, which is what lets React compare two renders safely.
- **`render()` schedules; it doesn't paint.** Right after `render()` returns, `#root` is still `""`. React does the DOM work shortly after, in one batch. [[Render and Commit]] explains that step.
- **React vs ReactDOM.** `react` (elements, components, hooks) knows nothing about the browser. `react-dom` is one *renderer*; React Native and others reuse the same model on other platforms.

## `key` (and `ref`) are not props

<!-- source file="src/lessons/fundamentals/02-create-element.ts" region="keyed" -->

<!-- output from="fundamentals" path="createElement.keyed" -->

React keeps `key` on the element itself and removes it from `props`, so a component can never receive it by accident and can't use the name for something else. Keys get their own note: [[Rendering Arrays]].

## Common mistakes

- **Expecting `createElement` to return a DOM node.** You can't call `.appendChild` on it; it's a description.
- **Mutating an element** (`element.props.className = …`). It's frozen in development; create a new element instead.
- **Reading the DOM right after `render()`** and finding it empty. The update hasn't been committed yet.

## Interview Q&A

**Q: What does `createElement` return, and why does that matter?**
A: A plain object describing what should be on screen, e.g. `{ $$typeof, type: 'article', key: null, props: { className: 'product-card', children: [h2, p] } }`. No DOM is created. Because a render produces cheap objects, React can compare the new description with the previous one and only then decide which (expensive) DOM changes are needed.

**Q: What's the difference between React and ReactDOM?**
A: `react` is platform-independent: it creates elements and runs components and hooks. `react-dom` is the renderer for browsers: `createRoot(container).render(element)` is what turns elements into DOM nodes. Other renderers (React Native, react-three-fiber, …) reuse the same core.

**Q: Are React elements mutable?**
A: No. They're snapshots: in development both the element and its props are frozen (the recording logged `frozen? true true`). Each render creates new elements; React relies on old ones never changing.

**Q: Why are `key` and `ref` treated specially?**
A: React needs them for itself (`key` to match list items between renders, `ref` for DOM/instance access), so it takes them out of `props`. The recorded element for `createElement('li', { key: 'p1', className: 'item' }, 'Ceramic Mug')` has `key: "p1"` and props `{ className, children }` only.

**Q: When does the DOM actually change after `root.render(element)`?**
A: Not synchronously. In the recording `#root` was still empty right after `render()` returned and contained the card a moment later. `render` queues an update and schedules a render; the DOM is changed in the commit that follows.

## Related

- [[Using JSX]]: the same objects, with nicer syntax.
- [[How React Works, Start to Finish]] (React Internals): when elements are created and when components run, traced through a real app.

## Sources

- react.dev: [`createElement`](https://react.dev/reference/react/createElement), [`createRoot`](https://react.dev/reference/react-dom/client/createRoot)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
