---
title: "Fundamentals Quiz"
slug: "fundamentals-quiz"
module: "fundamentals"
order: 10
level: "must"
illus: "robot"
summary: "Ten questions, one per note, with quiz mode, plus flashcards for every React API in this module."
source: ""
---


## How to use this

One question per note. Turn on **Quiz mode**, say your answer out loud, then open the card and grade yourself. Cards you mark "review" are easy to find again. Below the questions, flashcards cover every React API name used in this module.

## Interview Q&A

<details class="qa"><summary>You build a product card with <code>document.createElement</code>, set its text, and nothing appears. No error either. What's missing?</summary>

The card only exists in memory until it's appended to a node that is already on the page: `rootElement.append(card)`. Recorded: `On the page? false` before the append, `true` after. See [Hello World in JS](../../fundamentals/hello-world-in-js/).

</details>

<details class="qa"><summary>What does <code>createElement('article', { className: 'product-card' }, h2, p)</code> return, and when does the DOM change?</summary>

A frozen plain object, `{ $$typeof, type: 'article', key: null, props: { className, children: [h2, p] } }`. The DOM changes only after `createRoot(root).render(element)`, and not synchronously: `#root` was still empty right after `render()` returned. See [Raw React APIs](../../fundamentals/raw-react-apis/).

</details>

<details class="qa"><summary>Why does <code>{product.stock &amp;&amp; &lt;span&gt;In stock&lt;/span&gt;}</code> show a <code>0</code> for sold-out products, and how do you fix it?</summary>

`&&` returns `0` (its falsy left side), and React renders numbers. Use a boolean: `{product.stock > 0 && …}`. Recorded HTML: `<p>0</p>` vs `<p></p>`. See [Using JSX](../../fundamentals/using-jsx/).

</details>

<details class="qa"><summary><code>&lt;price cents={1800} /&gt;</code> renders nothing useful, but <code>&lt;Price cents={1800} /&gt;</code> works. Why?</summary>

Lowercase tags compile to strings (`jsx("price", …)`), meaning a DOM element; capitalized tags compile to the variable (`jsx(Price, …)`), so React calls your function. See [Custom Components](../../fundamentals/custom-components/).

</details>

<details class="qa"><summary>Why is <code>currency: string</code> a weak type for <code>Price</code>, and what keeps the allowed currencies in one place?</summary>

`string` accepts `"JPY"`, which crashes at runtime. Define the `formatters` object with `satisfies Record<string, Formatter>` and derive `type Currency = keyof typeof formatters`; `tsc` then rejects `currency="JPY"` (TS2322). See [TypeScript with React](../../fundamentals/typescript-with-react/).

</details>

<details class="qa"><summary>In <code>style={{ fontWeight: 600, ...style }}</code>, who wins if the caller passes <code>fontWeight: 400</code>? How do you make the default unbeatable?</summary>

The caller: later keys win. Recorded `font-weight: 400`. Write `{ ...style, fontWeight: 600 }` to lock the default. See [Styling](../../fundamentals/styling/).

</details>

<details class="qa"><summary>A signup form leaks the password into the URL and uploads only the file's name. Which two attributes fix it, and what does a React function <code>action</code> add?</summary>

`method="POST"` (fields in the body) and `encType="multipart/form-data"` (file bytes). A function `action` also prevents the navigation, hands you `FormData` and resets the form. See [Forms](../../fundamentals/forms/).

</details>

<details class="qa"><summary>What does an unchecked checkbox put in <code>FormData</code>? And why can't the user type into <code>&lt;input value="Mug" /&gt;</code>?</summary>

Nothing: its name is missing (checked sends `"on"`). The input with `value` is controlled: React restores `"Mug"` after every keystroke unless `onChange` updates the value. Use `defaultValue` to pre-fill an editable field. See [Inputs](../../fundamentals/inputs/).

</details>

<details class="qa"><summary>A product without a price crashes rendering and the page goes blank. What contains it, and which errors does that still not catch?</summary>

An error boundary around the product (the risky component must be its child). It doesn't catch errors in event handlers or async code; pass those to `showBoundary(error)`. See [Error Boundaries](../../fundamentals/error-boundaries/).

</details>

<details class="qa"><summary>Why does the gift note jump to the wrong cart item when you remove the first item, and what's the fix?</summary>

The rows are keyed by index (or not at all), so React matches by position and keeps row 0's input for the new first item. Key by `item.id`. See [Rendering Arrays](../../fundamentals/rendering-arrays/).

</details>

## Flashcards: the React APIs in this module

<figure class="fig flashcards" data-flashcards="api" data-pagefind-ignore><div class="btn-row fc-top"><button type="button" class="btn" data-fc="must" aria-pressed="true">Must know</button><button type="button" class="btn btn-ghost" data-fc="all" aria-pressed="false">Must + good to know</button><span class="fc-stats"></span><button type="button" class="btn btn-ghost fc-reset" data-fc="reset">Reset</button></div><div class="fc-card"><div class="fc-front"></div><div class="fc-back" hidden></div></div><div class="btn-row fc-actions"><button type="button" class="btn" data-fc="show">Show answer</button><button type="button" class="btn btn-ghost" data-fc="again" hidden>↻ Again</button><button type="button" class="btn" data-fc="known" hidden>✓ I knew it</button></div><figcaption>Say the answer out loud first, then check. Cards you got wrong come back first. Progress is saved in this browser only.</figcaption></figure>

