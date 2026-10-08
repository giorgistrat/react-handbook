---
source: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
---

# Hello World in JS

## In one minute

Before React, a page changes through the DOM API: create a node, set its properties, append it somewhere. A node you create lives **in memory** until you append it to something that is already on the page. React is a much more convenient way to make the same calls, so it helps to see them once by hand.

**You'll be able to:** explain what "on the page" means for a DOM node, why `textContent` is safe and `innerHTML` isn't, and what work React takes off your hands.

<!-- figure name="domCardAnim" -->

## The example: a product card by hand

The product store's first lesson builds one card with nothing but DOM calls. Even the `#root` element is created by the code, to show it's an ordinary node:

<!-- source file="src/lessons/fundamentals/01-dom.ts" region="card" -->

At this point the card exists, but only in memory. One more line puts it on the page:

<!-- source file="src/lessons/fundamentals/01-dom.ts" region="append" -->

What the lesson logged before and after that line:

<!-- output from="fundamentals" path="dom.card.logs" as="log" -->

## How it works

- **`document.createElement` doesn't show anything.** It returns a detached node. Setting `className` or `textContent` changes that detached node.
- **`append` is what attaches it.** Appending to a node that is already in the document (here `#root`, which is inside `<body>`) makes the whole subtree visible.
- **A "root" isn't special.** `#root` is a `div` like any other. React later does exactly this kind of work, just consistently and for you.

## `textContent` vs `innerHTML`

Product names come from users and APIs, so assume they can contain anything. The lesson renders a name with HTML in it both ways:

<!-- source file="src/lessons/fundamentals/01-dom.ts" region="escape" -->

<!-- output from="fundamentals" path="dom.escape.logs" as="log" -->

`textContent` treats the string as text: no elements, the tags show up literally. `innerHTML` parses it, so the `<img>` became a real element and its `onerror` handler **ran**. That is how cross-site scripting (XSS) works.

React makes the safe choice the default: every string you render is treated as text. The only way to insert raw HTML is the deliberately alarming `dangerouslySetInnerHTML` prop.

## Common mistakes

- **Creating a node and wondering why it's not visible.** Nothing appears until it's appended to something already on the page.
- **Using `innerHTML` for data.** Use `textContent` (or React, which does the same for you). Reach for `innerHTML` / `dangerouslySetInnerHTML` only with HTML you trust or have sanitized.

## Interview Q&A

**Q: Why doesn't `document.createElement` alone put anything on the page?**
A: It only builds a node in memory. A node becomes visible when it's appended (or inserted) into a node that is already in the document. In the product store, the card logged `On the page? false` after it was fully built and `true` only after `rootElement.append(card)`. This create → change → append sequence is the manual work React's declarative API hides.

**Q: Why use `textContent` instead of `innerHTML` for text?**
A: `textContent` never parses its input as HTML, so a value like `Mug <img src="x" onerror="…">` stays visible text. `innerHTML` parses it into real elements, and the recording shows the `<img>`'s `onerror` handler actually ran. That's an XSS hole. React escapes strings by default for the same reason, and makes raw HTML opt-in through `dangerouslySetInnerHTML`.

**Q: Is there anything special about the "root" DOM node React renders into?**
A: No. It's an ordinary element, created and appended like any other; the lesson even creates it in code. A library like React has no privileged access to the page: it makes the same DOM calls you could write by hand, just many of them, consistently.

## Related

- [[Raw React APIs]]: the same card with React, no JSX.
- [[Render and Commit]] (React Internals): when React makes these DOM calls.

## Sources

- MDN: [`Document.createElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement), [`Node.textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent), [`Element.innerHTML` security](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
