---
source: https://react.dev/learn/writing-markup-with-jsx
---

# Using JSX

## In one minute

JSX is HTML-like syntax for creating React elements. Browsers can't run it, so a compiler (Babel, TypeScript, esbuild/Oxc in Vite…) rewrites every tag into a function call before your code runs. The single most useful JSX skill: when you look at a tag, see the call it becomes.

**You'll be able to:** read the compiled form of any JSX, know what can go inside `{ }`, predict which prop wins when you spread, use Fragments, and avoid the stray `0` bug.

## The example: the card, in JSX

<!-- source file="src/lessons/fundamentals/03-jsx.tsx" region="card" -->

What a modern build (the **automatic** runtime, used by Vite, Next.js and current Babel/TypeScript defaults) compiles it to. This is Babel's real output for the lesson file:

<!-- compiled file="03-jsx" mode="automatic" region="card" -->

The compiler also adds this import at the top of the file, which is why modern files don't need `import React`:

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
```

The older **classic** runtime compiles the same JSX to `createElement`, so `React` had to be in scope:

<!-- compiled file="03-jsx" mode="classic" region="card" -->

Both produce the same kind of element object as [[Raw React APIs]]. `jsxs` is `jsx` for elements whose children were written side by side (a static list), which lets React skip the "missing key" check for them.

## How it works

- **A tag is a call.** `<h2>{product.name}</h2>` → `jsx("h2", { children: product.name })`. Attributes become the props object; what's between the tags becomes `children`.
- **`{ }` takes an expression.** Anything that produces a value works: variables, calls, ternaries, `&&`, `.map()`. Statements (`if`, `for`, `let`) don't, because they can't be a function argument.
- **Props are DOM properties.** `className`, not `class`; `htmlFor`, not `for`; `tabIndex`; `style` takes an object.
- **Lowercase vs capitalized tags.** `<h2>` compiles to the string `"h2"` (a DOM element); `<Price>` to the variable `Price` (your component). More in [[Custom Components]].

## Spread: whatever comes later wins

<!-- source file="src/lessons/fundamentals/03-jsx.tsx" region="spread" -->

Recorded `title` attributes:

<!-- output from="fundamentals" path="jsx.logs.3" as="text" -->

<!-- output from="fundamentals" path="jsx.logs.4" as="text" -->

Props are merged like an object literal, left to right. TypeScript even flags the second form when it can prove the spread always overwrites the explicit value (error TS2783).

## Fragments

A component returns one value, so siblings need a wrapper. `<>…</>` is a wrapper that adds **no** DOM node, which matters inside elements that only accept specific children (`<dl>`, `<table>`, flex/grid containers):

<!-- source file="src/lessons/fundamentals/03-jsx.tsx" region="fragment" -->

<!-- output from="fundamentals" path="jsx.logs.5" as="text" -->

## The stray `0`

<!-- figure name="andZeroAnim" -->

<!-- source file="src/lessons/fundamentals/03-jsx.tsx" region="stock" -->

<!-- output from="fundamentals" path="jsx.logs.1" as="text" -->

<!-- output from="fundamentals" path="jsx.logs.2" as="text" -->

React renders nothing for `false`, `null` and `undefined`, but numbers are content. `0 && …` evaluates to `0`, so `0` is printed. Make the condition a real boolean (`stock > 0`, `items.length > 0`, `Boolean(stock)`).

## Common mistakes

- `class=` instead of `className=` (React warns), `for=` instead of `htmlFor=`.
- `if` inside `{ }`. Use a ternary, `&&`, or compute the value above the `return`.
- `{count && <Badge />}` with a number: the stray `0`.
- Expecting `<div {...props} title="x" />` and `<div title="x" {...props} />` to behave the same.

## Interview Q&A

**Q: What is JSX, and why do browsers need help running it?**
A: Syntax sugar for function calls that create React elements. It isn't valid JavaScript, so a compiler turns `<h2>{name}</h2>` into `jsx("h2", { children: name })` (or `React.createElement("h2", null, name)` with the classic runtime) before the browser sees it.

**Q: Why don't modern React files need `import React from 'react'`?**
A: The automatic JSX runtime compiles tags to `jsx`/`jsxs` calls and the compiler inserts `import { jsx, jsxs } from "react/jsx-runtime"` itself. With the classic runtime, the output called `React.createElement`, so `React` had to be imported by hand.

**Q: What can go inside `{ }` in JSX?**
A: Any expression: a variable, a call, a ternary, `&&`, `.map()`. Not statements like `if`, `for` or declarations, because the contents become a function argument (a prop value or a child).

**Q: How are conflicts resolved when you spread props?**
A: Like object spread: later wins. Recorded: `<p {...props} title="explicit wins" />` rendered `explicit wins`; `<p title="explicit loses" {...props} />` rendered `from props`.

**Q: Why does `{count && <Badge />}` sometimes render a `0`?**
A: `&&` returns its left side when that side is falsy. For `0` the whole expression is `0`, and React renders numbers. The recorded HTML was `<p>0</p>`; with `count > 0 &&` it was `<p></p>`.

**Q: Why do Fragments exist?**
A: A component returns one value, and an extra `div` can break layouts or invalid HTML (a `div` inside `<dl>`). `<>…</>` groups siblings without a DOM node: the recorded `<dl>` contained exactly `DT, DD`.

## Related

- [[Raw React APIs]]: what the compiled calls return.
- [[Custom Components]]: what happens when the tag is a function.
- [[How React Works, Start to Finish]] (React Internals): JSX → elements → fibers in a real app.

## Sources

- react.dev: [Writing markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [JavaScript in JSX with curly braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces), [Fragment](https://react.dev/reference/react/Fragment), [Conditional rendering pitfalls](https://react.dev/learn/conditional-rendering#logical-and-operator-)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
