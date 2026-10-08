---
source: https://react.dev/reference/react-dom/components/common#applying-css-styles
---

# Styling

## In one minute

React has two built-in ways to style: `className` (CSS classes, the usual choice) and `style` (inline styles as a **JavaScript object**, camelCased: `backgroundColor`, `marginLeft`). Numbers get `px` for you. The pattern worth knowing is a small component that wraps a native element, offers a typed prop like `tone="sale"` instead of raw class names, and still lets callers add their own `className` and `style`.

**You'll be able to:** write such a wrapper, and decide who wins when defaults and caller styles collide.

## The example: a `Tag` for product labels

<!-- source file="src/lessons/fundamentals/06-styling.tsx" region="tag" -->

Used like this:

<!-- source file="src/lessons/fundamentals/06-styling.tsx" region="usage" -->

The HTML React produced (recorded):

<!-- output from="fundamentals" path="styling.logs" as="log" -->

## How it works

- **`style` is an object.** `style={{ fontWeight: 600 }}` isn't special syntax: the outer braces start a JSX expression, the inner ones are an object literal. `marginLeft: 8` became `margin-left: 8px`.
- **A typed `tone` hides class names.** Callers write `tone="sale"`; only `Tag` knows the class is `tag--sale`. You can rename classes without touching callers, and they get autocomplete.
- **`className` is merged, not replaced.** The array/`filter(Boolean)`/`join(' ')` line combines the base class, the tone class and the caller's class. The tiny [`clsx`](https://github.com/lukeed/clsx) library does the same: ``clsx('tag', tone && `tag--${tone}`, className)``.
- **`...rest` passes everything else through:** `title`, `children`, event handlers, `aria-*`. That's why `title="Back soon"` reached the `<span>`.

## Who wins: order of the spread

<!-- figure name="mergeOrderAnim" -->

`{ fontWeight: 600, ...style }` lets the caller override the default (recorded: `font-weight: 400`). `{ ...style, fontWeight: 600 }` would lock the default. Choose on purpose.

## Common mistakes

- `style="font-weight: 600"` (a string). React expects an object.
- `className={tone}` with raw class names leaking into every caller.
- Overwriting the caller's `className` or `style` instead of merging.
- Forgetting `...rest`, so `aria-label`, `title` or `onClick` silently disappear.

## Interview Q&A

**Q: How does `style` differ between HTML and JSX?**
A: In HTML it's a CSS string; in JSX it's an object with camelCased property names, and numbers get `px` added for most properties: `style={{ marginLeft: 8 }}` → `margin-left: 8px`.

**Q: How do you let callers override a component's default styles?**
A: Accept `className` and `style`, merge them with your defaults, and put the caller's values last: `className={['tag', className].filter(Boolean).join(' ')}` and `style={{ fontWeight: 600, ...style }}`. Later keys win.

**Q: Why expose a typed prop like `tone` instead of class names?**
A: It's a small, checked API: callers can't depend on internal class names, typos are compile errors, and you can change the CSS without breaking them.

**Q: What problem does `clsx` solve?**
A: Building a `className` from conditions without empty strings and double spaces: `clsx('tag', { 'tag--sale': onSale }, className)` instead of hand-written joins.

## Related

- [[TypeScript with React]]: `ComponentProps<'span'> & { tone?: Tone }`.
- [[Using JSX]]: spread order in JSX props.

## Sources

- react.dev: [Applying CSS styles](https://react.dev/reference/react-dom/components/common#applying-css-styles)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
