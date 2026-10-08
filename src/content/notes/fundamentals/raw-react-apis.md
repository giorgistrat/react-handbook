---
title: "Raw React APIs"
slug: "raw-react-apis"
module: "fundamentals"
order: 1
level: "must"
illus: "fiber"
summary: "createElement returns a plain, frozen object; createRoot().render() turns it into DOM later. React vs ReactDOM, and why key isn’t a prop."
source: "https://react.dev/reference/react/createElement"
---


## In one minute

React for the web is two packages. **`react`** creates *descriptions* of UI; **`react-dom`** turns those descriptions into real DOM. `createElement(type, props, ...children)` doesn't create a DOM node: it returns a small, frozen JavaScript object, a **React element**. Nothing touches the page until you hand that object to `createRoot(container).render(element)`, and even then the DOM work happens a moment later.

**You'll be able to:** say what a React element is, read one, and explain why `key` never shows up in `props`.

<figure class="fig anim fig-fund-element-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;createElement('h2', null, 'Ceramic Mug')&quot;,&quot;say&quot;:&quot;JavaScript evaluates arguments before the call they belong to, so the inner calls run first. Each returns a &lt;b&gt;plain object&lt;/b&gt;, not a DOM node.&quot;,&quot;set&quot;:{&quot;c-h2&quot;:&quot;hl&quot;,&quot;e-h2&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;createElement('p', { className: 'price' }, '$18.00')&quot;,&quot;say&quot;:&quot;Another plain object.&quot;,&quot;set&quot;:{&quot;c-h2&quot;:&quot;&quot;,&quot;c-p&quot;:&quot;hl&quot;,&quot;e-p&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;createElement('article', …, h2, p)&quot;,&quot;say&quot;:&quot;The outer call receives the two objects as children. The result describes the whole card. It is &lt;b&gt;frozen&lt;/b&gt;: the recording logged &lt;code&gt;frozen? true true&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;c-p&quot;:&quot;&quot;,&quot;c-art&quot;:&quot;hl&quot;,&quot;e-art&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;root.render(article)&quot;,&quot;say&quot;:&quot;&lt;code&gt;render()&lt;/code&gt; only &lt;b&gt;schedules&lt;/b&gt; work. Right after it returns, &lt;code&gt;#root&lt;/code&gt; is still empty: the recording logged &lt;code&gt;right after render(): \&quot;\&quot;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;c-art&quot;:&quot;&quot;,&quot;c-render&quot;:&quot;hl&quot;,&quot;dom&quot;:&quot;faint&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;(still empty)&quot;}},{&quot;fn&quot;:&quot;…a moment later&quot;,&quot;say&quot;:&quot;React turns the objects into DOM nodes and appends them in one go.&quot;,&quot;set&quot;:{&quot;c-render&quot;:&quot;&quot;,&quot;dom&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;&amp;lt;article class=\&quot;product-card\&quot;&amp;gt;&amp;lt;h2&amp;gt;Ceramic Mug&amp;lt;/h2&amp;gt;&amp;lt;p class=\&quot;price\&quot;&amp;gt;$18.00&amp;lt;/p&amp;gt;&amp;lt;/article&amp;gt;&quot;}}]" data-intro="The product card with React, no JSX."><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">calls (innermost runs first)</div><div class="a-col"><div class="an call" data-k="c-h2"><code>createElement('h2', null, 'Ceramic Mug')</code></div><div class="an call" data-k="c-p"><code>createElement('p', { className: 'price' }, '$18.00')</code></div><div class="an call" data-k="c-art"><code>createElement('article', { className: 'product-card' }, h2, p)</code></div><div class="an call" data-k="c-render"><code>createRoot(root).render(article)</code></div></div></div><div class="a-panel "><div class="a-panel-title">objects returned</div><div class="a-col"><div class="an el-obj" data-k="e-h2" data-s="ghost">{ type: "h2", props: { children: "Ceramic Mug" } }</div><div class="an el-obj" data-k="e-p" data-s="ghost">{ type: "p", props: { className: "price", children: "$18.00" } }</div><div class="an el-obj" data-k="e-art" data-s="ghost">{ type: "article", props: { className: "product-card", children: [h2, p] } }</div></div></div><div class="a-panel "><div class="a-panel-title">#root on the page</div><div class="a-col"><div class="a-dom"><span class="an" data-k="dom">(empty)</span></div></div></div></div></div><ol class="anim-print"><li><code>createElement('h2', null, 'Ceramic Mug')</code><span>JavaScript evaluates arguments before the call they belong to, so the inner calls run first. Each returns a <b>plain object</b>, not a DOM node.</span></li><li><code>createElement('p', { className: 'price' }, '$18.00')</code><span>Another plain object.</span></li><li><code>createElement('article', …, h2, p)</code><span>The outer call receives the two objects as children. The result describes the whole card. It is <b>frozen</b>: the recording logged <code>frozen? true true</code>.</span></li><li><code>root.render(article)</code><span><code>render()</code> only <b>schedules</b> work. Right after it returns, <code>#root</code> is still empty: the recording logged <code>right after render(): ""</code>.</span></li><li><code>…a moment later</code><span>React turns the objects into DOM nodes and appends them in one go.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="new"></i>created</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>createElement builds a description; React creates the DOM later.</figcaption></figure>

## The example: the card, with React

The same product card as in [Hello World in JS](../../fundamentals/hello-world-in-js/), described with `createElement`:

```ts
const element = createElement(
	'article',
	{ className: 'product-card' },
	createElement('h2', null, product.name),
	createElement('p', { className: 'price' }, formatUSD(product.priceCents)),
)
```

The object it returns, as logged by the lesson (nested elements included):

```js
{
  "$$typeof": "Symbol(react.transitional.element)",
  "type": "article",
  "key": null,
  "props": {
    "className": "product-card",
    "children": [
      {
        "$$typeof": "Symbol(react.transitional.element)",
        "type": "h2",
        "key": null,
        "props": {
          "children": "Ceramic Mug"
        }
      },
      {
        "$$typeof": "Symbol(react.transitional.element)",
        "type": "p",
        "key": null,
        "props": {
          "className": "price",
          "children": "$18.00"
        }
      }
    ]
  }
}
```

Read it as "an `article` with a class, whose children are an `h2` element and a `p` element". `$$typeof` is a Symbol that marks the object as a genuine React element, so a plain JSON object from an API can't be mistaken for one.

Then the lesson renders it, and checks `#root` twice:

```ts
const reactRoot = createRoot(root)
reactRoot.render(element)
```

```text
element: {"$$typeof":"Symbol(react.transitional.element)","type":"article","key":null,"props":{"className":"product-card","children":[{"$$typeof":"Symbol(react.transitional.element)","type":"h2","key":null,"props":{"children":"Ceramic Mug"}},{"$$typeof":"Symbol(react.transitional.element)","type":"p","key":null,"props":{"className":"price","children":"$18.00"}}]}}
frozen? true true
keyed element: {"key":"p1","props":{"className":"item","children":"Ceramic Mug"}}
right after render(): ""
a moment later: <article class="product-card"><h2>Ceramic Mug</h2><p class="price">$18.00</p></article>
```

## How it works

- **`children` is just a prop.** Extra arguments after `props` become `props.children` (an array when there are several). A string child is turned into a text node by React; you don't wrap it.
- **Elements are immutable.** In development React freezes both the element and its `props` (`frozen? true true` above). A new render creates new elements instead of editing old ones, which is what lets React compare two renders safely.
- **`render()` schedules; it doesn't paint.** Right after `render()` returns, `#root` is still `""`. React does the DOM work shortly after, in one batch. [Render and Commit](../../internals/render-and-commit/) explains that step.
- **React vs ReactDOM.** `react` (elements, components, hooks) knows nothing about the browser. `react-dom` is one *renderer*; React Native and others reuse the same model on other platforms.

## `key` (and `ref`) are not props

```ts
const item = createElement('li', { key: 'p1', className: 'item' }, 'Ceramic Mug')
```

```js
{
  "key": "p1",
  "props": {
    "className": "item",
    "children": "Ceramic Mug"
  }
}
```

React keeps `key` on the element itself and removes it from `props`, so a component can never receive it by accident and can't use the name for something else. Keys get their own note: [Rendering Arrays](../../fundamentals/rendering-arrays/).

## Common mistakes

- **Expecting `createElement` to return a DOM node.** You can't call `.appendChild` on it; it's a description.
- **Mutating an element** (`element.props.className = …`). It's frozen in development; create a new element instead.
- **Reading the DOM right after `render()`** and finding it empty. The update hasn't been committed yet.

## Interview Q&A

<details class="qa"><summary>What does <code>createElement</code> return, and why does that matter?</summary>

A plain object describing what should be on screen, e.g. `{ $$typeof, type: 'article', key: null, props: { className: 'product-card', children: [h2, p] } }`. No DOM is created. Because a render produces cheap objects, React can compare the new description with the previous one and only then decide which (expensive) DOM changes are needed.

</details>

<details class="qa"><summary>What's the difference between React and ReactDOM?</summary>

`react` is platform-independent: it creates elements and runs components and hooks. `react-dom` is the renderer for browsers: `createRoot(container).render(element)` is what turns elements into DOM nodes. Other renderers (React Native, react-three-fiber, …) reuse the same core.

</details>

<details class="qa"><summary>Are React elements mutable?</summary>

No. They're snapshots: in development both the element and its props are frozen (the recording logged `frozen? true true`). Each render creates new elements; React relies on old ones never changing.

</details>

<details class="qa"><summary>Why are <code>key</code> and <code>ref</code> treated specially?</summary>

React needs them for itself (`key` to match list items between renders, `ref` for DOM/instance access), so it takes them out of `props`. The recorded element for `createElement('li', { key: 'p1', className: 'item' }, 'Ceramic Mug')` has `key: "p1"` and props `{ className, children }` only.

</details>

<details class="qa"><summary>When does the DOM actually change after <code>root.render(element)</code>?</summary>

Not synchronously. In the recording `#root` was still empty right after `render()` returned and contained the card a moment later. `render` queues an update and schedules a render; the DOM is changed in the commit that follows.

</details>

## Related

- [Using JSX](../../fundamentals/using-jsx/): the same objects, with nicer syntax.
- [How React Works, Start to Finish](../../internals/how-react-works/) (React Internals): when elements are created and when components run, traced through a real app.

## Sources

- react.dev: [`createElement`](https://react.dev/reference/react/createElement), [`createRoot`](https://react.dev/reference/react-dom/client/createRoot)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
