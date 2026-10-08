---
source: https://react.dev/learn/your-first-component
---

# Custom Components

## In one minute

A component is a function that takes one object, **props**, and returns something React can render. That's the whole definition. The important part is who calls it: when you write `<Price cents={1800} />`, you don't call `Price`; you create an element whose `type` is the function, and **React calls it later**, while rendering. Because React owns the call, it can run it again on every render, skip it, or give it state.

**You'll be able to:** explain the difference between `Price(props)` and `<Price />`, why component names are capitalized, and why a local variable resets on every render.

<!-- figure name="whoCallsAnim" -->

## The example: Price and ProductCard

<!-- source file="src/lessons/fundamentals/04-components.tsx" region="price" -->

<!-- source file="src/lessons/fundamentals/04-components.tsx" region="card" -->

## Calling it yourself vs letting React call it

Calling the function directly:

<!-- source file="src/lessons/fundamentals/04-components.tsx" region="called" -->

<!-- output from="fundamentals" path="components.called.logs" as="log" -->

Passing the function to `createElement` (what `<Price cents={…} />` compiles to):

<!-- source file="src/lessons/fundamentals/04-components.tsx" region="element" -->

<!-- output from="fundamentals" path="components.element.logs" as="log" -->

Same screen, different order. In the first, `Price` runs **while the elements are being built**, and React only ever receives the `<p>` it returned. In the second, `Price` runs **after** `render()`, inside React. Only the second version is a component as far as React is concerned: it can have state and effects, React can skip it when nothing changed, and DevTools shows it.

## Every render calls the function again

The lesson renders `<ProductCard />` three times:

<!-- output from="fundamentals" path="components.rerender.logs" as="log" -->

`views` is `1` every time. A component function runs from the top on each render, so plain local variables start over. Remembering something between renders is exactly what `useState` and `useRef` are for (the Hooks module).

## Capital letters decide what a tag means

The compiler looks only at the tag's first letter:

| You write | Compiles to | React treats it as |
|---|---|---|
| `<price />` | `jsx("price", {})` | a DOM element called `price` (doesn't exist; React warns) |
| `<Price />` | `jsx(Price, {})` | your function |
| `<ui.Price />` | `jsx(ui.Price, {})` | your function (member access works too) |

Because `type` is just a value, you can choose a component dynamically: `const Card = isCompact ? CompactCard : ProductCard` and then `<Card />`.

## Props

Props are whatever the author decides: strings, numbers, objects, functions, other elements. `children` isn't special either; JSX just gives it a nicer syntax: `<Tag>New</Tag>` is the same as `<Tag children="New" />`.

## Common mistakes

- Calling components as functions (`{ProductCard({ product })}`): it works until the component uses a hook, then breaks the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks).
- Lowercase component names.
- Storing values in local variables and expecting them to survive the next render.

## Interview Q&A

**Q: What is a React component, really?**
A: A function that accepts a props object and returns something renderable (elements, a string, a number, `null`, an array). No class or special syntax is required. The one rule is that React, not you, decides when it runs.

**Q: What's the difference between `Price(props)` and `<Price {...props} />`?**
A: `Price(props)` is an ordinary call: it runs immediately and React only gets its return value. `<Price />` creates an element `{ type: Price, props }`; React calls `Price` later while rendering. The recorded logs show `Price runs` before "elements built" in the first case and after `render()` in the second. Only the element form can use hooks, be skipped, or appear in DevTools.

**Q: Why must component names start with a capital letter?**
A: The JSX compiler compiles lowercase tags to strings (DOM elements) and capitalized or dotted tags to variable references. `<price />` becomes `jsx("price")`, a non-existent DOM element.

**Q: Is `children` special?**
A: No. It's an ordinary prop with extra syntax: whatever is between the tags becomes `props.children`.

**Q: Does a component keep its local variables between renders?**
A: No. The function runs from the top on every render; the recording shows `views = 1` on all three renders. Values that must survive go in state (`useState`) or a ref (`useRef`).

## Related

- [[Using JSX]]: how tags compile.
- [[TypeScript with React]]: typing the props object.
- [[How React Works, Start to Finish]] (React Internals): how React decides to call a function (`typeof type === "function"` → a function-component fiber).

## Sources

- react.dev: [Your first component](https://react.dev/learn/your-first-component), [Passing props to a component](https://react.dev/learn/passing-props-to-a-component), [Keeping components pure](https://react.dev/learn/keeping-components-pure)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
