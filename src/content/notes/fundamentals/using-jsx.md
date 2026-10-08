---
title: "Using JSX"
slug: "using-jsx"
module: "fundamentals"
order: 2
level: "must"
illus: "diff"
summary: "JSX is function calls: the real Babel output, curly-brace expressions, spread order, Fragments, and the stray-0 bug."
source: "https://react.dev/learn/writing-markup-with-jsx"
---


## In one minute

JSX is HTML-like syntax for creating React elements. Browsers can't run it, so a compiler (Babel, TypeScript, esbuild/Oxc in Vite…) rewrites every tag into a function call before your code runs. The single most useful JSX skill: when you look at a tag, see the call it becomes.

**You'll be able to:** read the compiled form of any JSX, know what can go inside `{ }`, predict which prop wins when you spread, use Fragments, and avoid the stray `0` bug.

## The example: the card, in JSX

```tsx
const element = (
	<article className="product-card">
		<h2>{product.name}</h2>
		<p className="price">{formatUSD(product.priceCents)}</p>
	</article>
)
```

What a modern build (the **automatic** runtime, used by Vite, Next.js and current Babel/TypeScript defaults) compiles it to. This is Babel's real output for the lesson file:

```js
const element = _jsxs("article", {
  className: "product-card",
  children: [_jsx("h2", {
    children: product.name
  }), _jsx("p", {
    className: "price",
    children: formatUSD(product.priceCents)
  })]
});
```

The compiler also adds this import at the top of the file, which is why modern files don't need `import React`:

```js
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
```

The older **classic** runtime compiles the same JSX to `createElement`, so `React` had to be in scope:

```js
const element = React.createElement("article", {
  className: "product-card"
}, React.createElement("h2", null, product.name), React.createElement("p", {
  className: "price"
}, formatUSD(product.priceCents)));
```

Both produce the same kind of element object as [Raw React APIs](../../fundamentals/raw-react-apis/). `jsxs` is `jsx` for elements whose children were written side by side (a static list), which lets React skip the "missing key" check for them.

## How it works

- **A tag is a call.** `<h2>{product.name}</h2>` → `jsx("h2", { children: product.name })`. Attributes become the props object; what's between the tags becomes `children`.
- **`{ }` takes an expression.** Anything that produces a value works: variables, calls, ternaries, `&&`, `.map()`. Statements (`if`, `for`, `let`) don't, because they can't be a function argument.
- **Props are DOM properties.** `className`, not `class`; `htmlFor`, not `for`; `tabIndex`; `style` takes an object.
- **Lowercase vs capitalized tags.** `<h2>` compiles to the string `"h2"` (a DOM element); `<Price>` to the variable `Price` (your component). More in [Custom Components](../../fundamentals/custom-components/).

## Spread: whatever comes later wins

```tsx
const props: { className: string; title?: string } = { className: 'price', title: 'from props' }
const later = <p {...props} title="explicit wins" />
const earlier = <p title="explicit loses" {...props} />
```

Recorded `title` attributes:

```text
spread then explicit: explicit wins
```

```text
explicit then spread: from props
```

Props are merged like an object literal, left to right. TypeScript even flags the second form when it can prove the spread always overwrites the explicit value (error TS2783).

## Fragments

A component returns one value, so siblings need a wrapper. `<>…</>` is a wrapper that adds **no** DOM node, which matters inside elements that only accept specific children (`<dl>`, `<table>`, flex/grid containers):

```tsx
function Details({ product }: { product: Product }) {
	return (
		<>
			<dt>Rating</dt>
			<dd>{product.rating} / 5</dd>
		</>
	)
}
```

```text
fragment → <dl> children: DT, DD
```

## The stray `0`

<figure class="fig anim fig-fund-and-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">stock && …</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">stock > 0 && …</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;stock &amp;&amp; &lt;span&gt;…&lt;/span&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;&amp;&amp;&lt;/code&gt; returns the &lt;b&gt;left side&lt;/b&gt; if it is falsy. &lt;code&gt;0&lt;/code&gt; is falsy, so the whole expression is &lt;code&gt;0&lt;/code&gt;; the span is never created.&quot;,&quot;set&quot;:{&quot;expr&quot;:&quot;hl&quot;,&quot;val&quot;:&quot;cmp&quot;}},{&quot;fn&quot;:&quot;children: 0&quot;,&quot;say&quot;:&quot;React skips &lt;code&gt;false&lt;/code&gt;, &lt;code&gt;null&lt;/code&gt; and &lt;code&gt;undefined&lt;/code&gt;, but a number is valid content.&quot;,&quot;set&quot;:{&quot;child&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;child&quot;:&quot;0 (a number)&quot;}},{&quot;fn&quot;:&quot;render&quot;,&quot;say&quot;:&quot;So a stray &lt;b&gt;0&lt;/b&gt; appears. Recorded HTML: &lt;code&gt;&amp;lt;p&amp;gt;0&amp;lt;/p&amp;gt;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;out&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;out&quot;:&quot;&amp;lt;p&amp;gt;0&amp;lt;/p&amp;gt;&quot;}}]" data-intro="&lt;code&gt;{stock &amp;&amp; …}&lt;/code&gt; when the headphones are out of stock."><div class="anim-scn-title">stock && …</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">the expression</div><div class="a-col"><div class="an call" data-k="expr"><code>{stock &amp;&amp; &lt;span&gt;In stock&lt;/span&gt;}</code></div><span class="an chip-a" data-k="val">headphones.stock = 0</span></div></div><div class="a-panel "><div class="a-panel-title">what React gets</div><div class="a-col"><span class="an chip-a" data-k="child" data-s="faint">?</span></div></div><div class="a-panel "><div class="a-panel-title">on the page</div><div class="a-col"><div class="a-dom"><span class="an" data-k="out">&lt;p&gt;&lt;/p&gt;</span></div></div></div></div></div><ol class="anim-print"><li><code>stock &amp;&amp; &lt;span&gt;…&lt;/span&gt;</code><span><code>&&</code> returns the <b>left side</b> if it is falsy. <code>0</code> is falsy, so the whole expression is <code>0</code>; the span is never created.</span></li><li><code>children: 0</code><span>React skips <code>false</code>, <code>null</code> and <code>undefined</code>, but a number is valid content.</span></li><li><code>render</code><span>So a stray <b>0</b> appears. Recorded HTML: <code>&lt;p&gt;0&lt;/p&gt;</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;fn&quot;:&quot;stock &gt; 0 &amp;&amp; &lt;span&gt;…&lt;/span&gt;&quot;,&quot;say&quot;:&quot;Compare first: &lt;code&gt;0 &gt; 0&lt;/code&gt; is &lt;code&gt;false&lt;/code&gt;, a real boolean.&quot;,&quot;set&quot;:{&quot;expr&quot;:&quot;hl&quot;,&quot;val&quot;:&quot;cmp&quot;}},{&quot;fn&quot;:&quot;children: false&quot;,&quot;say&quot;:&quot;React renders nothing for &lt;code&gt;false&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;child&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;child&quot;:&quot;false&quot;}},{&quot;fn&quot;:&quot;render&quot;,&quot;say&quot;:&quot;Nothing is printed. Recorded HTML: &lt;code&gt;&amp;lt;p&amp;gt;&amp;lt;/p&amp;gt;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;out&quot;:&quot;ok&quot;}}]" data-intro="The same with an explicit comparison."><div class="anim-scn-title">stock > 0 && …</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">the expression</div><div class="a-col"><div class="an call" data-k="expr"><code>{stock &gt; 0 &amp;&amp; &lt;span&gt;In stock&lt;/span&gt;}</code></div><span class="an chip-a" data-k="val">headphones.stock = 0</span></div></div><div class="a-panel "><div class="a-panel-title">what React gets</div><div class="a-col"><span class="an chip-a" data-k="child" data-s="faint">?</span></div></div><div class="a-panel "><div class="a-panel-title">on the page</div><div class="a-col"><div class="a-dom"><span class="an" data-k="out">&lt;p&gt;&lt;/p&gt;</span></div></div></div></div></div><ol class="anim-print"><li><code>stock &gt; 0 &amp;&amp; &lt;span&gt;…&lt;/span&gt;</code><span>Compare first: <code>0 > 0</code> is <code>false</code>, a real boolean.</span></li><li><code>children: false</code><span>React renders nothing for <code>false</code>.</span></li><li><code>render</code><span>Nothing is printed. Recorded HTML: <code>&lt;p&gt;&lt;/p&gt;</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="cmp"></i>being compared</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The most common JSX bug, and its one-character fix.</figcaption></figure>

```tsx
const headphones = products[1] // stock: 0
const buggy = <p>{headphones.stock && <span className="tag">In stock</span>}</p>
const fixed = <p>{headphones.stock > 0 && <span className="tag">In stock</span>}</p>
```

```text
stock && → html: <p>0</p>
```

```text
stock > 0 && → html: <p></p>
```

React renders nothing for `false`, `null` and `undefined`, but numbers are content. `0 && …` evaluates to `0`, so `0` is printed. Make the condition a real boolean (`stock > 0`, `items.length > 0`, `Boolean(stock)`).

## Common mistakes

- `class=` instead of `className=` (React warns), `for=` instead of `htmlFor=`.
- `if` inside `{ }`. Use a ternary, `&&`, or compute the value above the `return`.
- `{count && <Badge />}` with a number: the stray `0`.
- Expecting `<div {...props} title="x" />` and `<div title="x" {...props} />` to behave the same.

## Interview Q&A

<details class="qa"><summary>What is JSX, and why do browsers need help running it?</summary>

Syntax sugar for function calls that create React elements. It isn't valid JavaScript, so a compiler turns `<h2>{name}</h2>` into `jsx("h2", { children: name })` (or `React.createElement("h2", null, name)` with the classic runtime) before the browser sees it.

</details>

<details class="qa"><summary>Why don't modern React files need <code>import React from 'react'</code>?</summary>

The automatic JSX runtime compiles tags to `jsx`/`jsxs` calls and the compiler inserts `import { jsx, jsxs } from "react/jsx-runtime"` itself. With the classic runtime, the output called `React.createElement`, so `React` had to be imported by hand.

</details>

<details class="qa"><summary>What can go inside <code>{ }</code> in JSX?</summary>

Any expression: a variable, a call, a ternary, `&&`, `.map()`. Not statements like `if`, `for` or declarations, because the contents become a function argument (a prop value or a child).

</details>

<details class="qa"><summary>How are conflicts resolved when you spread props?</summary>

Like object spread: later wins. Recorded: `<p {...props} title="explicit wins" />` rendered `explicit wins`; `<p title="explicit loses" {...props} />` rendered `from props`.

</details>

<details class="qa"><summary>Why does <code>{count &amp;&amp; &lt;Badge /&gt;}</code> sometimes render a <code>0</code>?</summary>

`&&` returns its left side when that side is falsy. For `0` the whole expression is `0`, and React renders numbers. The recorded HTML was `<p>0</p>`; with `count > 0 &&` it was `<p></p>`.

</details>

<details class="qa"><summary>Why do Fragments exist?</summary>

A component returns one value, and an extra `div` can break layouts or invalid HTML (a `div` inside `<dl>`). `<>…</>` groups siblings without a DOM node: the recorded `<dl>` contained exactly `DT, DD`.

</details>

## Related

- [Raw React APIs](../../fundamentals/raw-react-apis/): what the compiled calls return.
- [Custom Components](../../fundamentals/custom-components/): what happens when the tag is a function.
- [How React Works, Start to Finish](../../internals/how-react-works/) (React Internals): JSX → elements → fibers in a real app.

## Sources

- react.dev: [Writing markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [JavaScript in JSX with curly braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces), [Fragment](https://react.dev/reference/react/Fragment), [Conditional rendering pitfalls](https://react.dev/learn/conditional-rendering#logical-and-operator-)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
