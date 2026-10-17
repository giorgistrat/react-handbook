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

<figure class="fig anim fig-fund-element-anim anim-code" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;const h2 = createElement('h2', null, 'Ceramic Mug')&quot;,&quot;say&quot;:&quot;&lt;code&gt;createElement&lt;/code&gt; returns a &lt;b&gt;plain object&lt;/b&gt; that describes a heading, not a DOM node.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;hl&quot;,&quot;s-objects&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-objects&quot;:&quot;Objects: { type: \&quot;h2\&quot;, props: { children: \&quot;Ceramic Mug\&quot; } }&quot;}},{&quot;fn&quot;:&quot;const p = createElement('p', { className: 'price' }, '$18.00')&quot;,&quot;say&quot;:&quot;Another plain object for the price.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;&quot;,&quot;s-objects&quot;:&quot;upd&quot;,&quot;L1&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-objects&quot;:&quot;Objects: h2, { type: \&quot;p\&quot;, props: { className: \&quot;price\&quot;, … } }&quot;}},{&quot;fn&quot;:&quot;const article = createElement('article',&quot;,&quot;say&quot;:&quot;The outer element gets the two objects as its children. The result describes the whole card, and it’s &lt;b&gt;frozen&lt;/b&gt; (recorded: &lt;code&gt;frozen? true true&lt;/code&gt;).&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-objects&quot;:&quot;upd&quot;,&quot;L2&quot;:&quot;hl&quot;,&quot;L3&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-objects&quot;:&quot;Objects: { type: \&quot;article\&quot;, props: { children: [h2, p] } }&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;createRoot(root).render(article)&quot;,&quot;say&quot;:&quot;&lt;code&gt;render()&lt;/code&gt; only &lt;b&gt;schedules&lt;/b&gt; the work. Right after it returns, &lt;code&gt;#root&lt;/code&gt; is still empty (recorded: &lt;code&gt;right after render(): \&quot;\&quot;&lt;/code&gt;).&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L3&quot;:&quot;&quot;,&quot;s-objects&quot;:&quot;&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;s-dom&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-dom&quot;:&quot;#root on the page: (still empty)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;// …a moment later, React updates the DOM&quot;,&quot;say&quot;:&quot;React turns the objects into DOM nodes and appends them in one go.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;s-dom&quot;:&quot;ok&quot;,&quot;L6&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-dom&quot;:&quot;#root on the page: &amp;lt;article&amp;gt;&amp;lt;h2&amp;gt;Ceramic Mug&amp;lt;/h2&amp;gt;&amp;lt;p&amp;gt;$18.00&amp;lt;/p&amp;gt;&amp;lt;/article&amp;gt;&quot;}}]" data-intro="The product card with React, without JSX."><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">card.js (no JSX)</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> h2</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> createElement</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'h2'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#D20F39;--shiki-dark:#F38BA8"> null</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'Ceramic Mug'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> createElement</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'p'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'price'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> },</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '$18.00'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> article</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> createElement</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'article'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'product-card'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> },</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> h2</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> p)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">createRoot</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(root)</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">render</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(article)</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// …a moment later, React updates the DOM</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-objects">Objects: –</div><div class="an ca-item ca-box" data-k="s-dom">#root on the page: (empty)</div></div></div></div></div><ol class="anim-print"><li><code>const h2 = createElement('h2', null, 'Ceramic Mug')</code><span><code>createElement</code> returns a <b>plain object</b> that describes a heading, not a DOM node.</span></li><li><code>const p = createElement('p', { className: 'price' }, '$18.00')</code><span>Another plain object for the price.</span></li><li><code>const article = createElement('article',</code><span>The outer element gets the two objects as its children. The result describes the whole card, and it’s <b>frozen</b> (recorded: <code>frozen? true true</code>).</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>createRoot(root).render(article)</code><span><code>render()</code> only <b>schedules</b> the work. Right after it returns, <code>#root</code> is still empty (recorded: <code>right after render(): ""</code>).</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>// …a moment later, React updates the DOM</code><span>React turns the objects into DOM nodes and appends them in one go.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>createElement only builds a description (a plain object). React creates the DOM later.</figcaption></figure>

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
