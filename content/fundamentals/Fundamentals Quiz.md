---
source:
---

# Fundamentals Quiz

## How to use this

One question per note. Turn on **Quiz mode**, say your answer out loud, then open the card and grade yourself. Cards you mark "review" are easy to find again. Below the questions, flashcards cover every React API name used in this module.

## Interview Q&A

**Q: You build a product card with `document.createElement`, set its text, and nothing appears. No error either. What's missing?**
A: The card only exists in memory until it's appended to a node that is already on the page: `rootElement.append(card)`. Recorded: `On the page? false` before the append, `true` after. See [[Hello World in JS]].

**Q: What does `createElement('article', { className: 'product-card' }, h2, p)` return, and when does the DOM change?**
A: A frozen plain object, `{ $$typeof, type: 'article', key: null, props: { className, children: [h2, p] } }`. The DOM changes only after `createRoot(root).render(element)`, and not synchronously: `#root` was still empty right after `render()` returned. See [[Raw React APIs]].

**Q: Why does `{product.stock && <span>In stock</span>}` show a `0` for sold-out products, and how do you fix it?**
A: `&&` returns `0` (its falsy left side), and React renders numbers. Use a boolean: `{product.stock > 0 && …}`. Recorded HTML: `<p>0</p>` vs `<p></p>`. See [[Using JSX]].

**Q: `<price cents={1800} />` renders nothing useful, but `<Price cents={1800} />` works. Why?**
A: Lowercase tags compile to strings (`jsx("price", …)`), meaning a DOM element; capitalized tags compile to the variable (`jsx(Price, …)`), so React calls your function. See [[Custom Components]].

**Q: Why is `currency: string` a weak type for `Price`, and what keeps the allowed currencies in one place?**
A: `string` accepts `"JPY"`, which crashes at runtime. Define the `formatters` object with `satisfies Record<string, Formatter>` and derive `type Currency = keyof typeof formatters`; `tsc` then rejects `currency="JPY"` (TS2322). See [[TypeScript with React]].

**Q: In `style={{ fontWeight: 600, ...style }}`, who wins if the caller passes `fontWeight: 400`? How do you make the default unbeatable?**
A: The caller: later keys win. Recorded `font-weight: 400`. Write `{ ...style, fontWeight: 600 }` to lock the default. See [[Styling]].

**Q: A signup form leaks the password into the URL and uploads only the file's name. Which two attributes fix it, and what does a React function `action` add?**
A: `method="POST"` (fields in the body) and `encType="multipart/form-data"` (file bytes). A function `action` also prevents the navigation, hands you `FormData` and resets the form. See [[Forms]].

**Q: What does an unchecked checkbox put in `FormData`? And why can't the user type into `<input value="Mug" />`?**
A: Nothing: its name is missing (checked sends `"on"`). The input with `value` is controlled: React restores `"Mug"` after every keystroke unless `onChange` updates the value. Use `defaultValue` to pre-fill an editable field. See [[Inputs]].

**Q: A product without a price crashes rendering and the page goes blank. What contains it, and which errors does that still not catch?**
A: An error boundary around the product (the risky component must be its child). It doesn't catch errors in event handlers or async code; pass those to `showBoundary(error)`. See [[Error Boundaries]].

**Q: Why does the gift note jump to the wrong cart item when you remove the first item, and what's the fix?**
A: The rows are keyed by index (or not at all), so React matches by position and keeps row 0's input for the new first item. Key by `item.id`. See [[Rendering Arrays]].

## Flashcards: the React APIs in this module

<!-- figure name="apiFlashcards" -->
