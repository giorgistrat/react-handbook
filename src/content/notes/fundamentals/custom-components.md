---
title: "Custom Components"
slug: "custom-components"
module: "fundamentals"
order: 3
level: "must"
illus: "chain"
summary: "A component is a function React calls for you. The recorded call order proves it, and why capital letters and props matter."
source: "https://react.dev/learn/your-first-component"
---


## In one minute

A component is a function that takes one object, **props**, and returns something React can render. That's the whole definition. The important part is who calls it: when you write `<Price cents={1800} />`, you don't call `Price`; you create an element whose `type` is the function, and **React calls it later**, while rendering. Because React owns the call, it can run it again on every render, skip it, or give it state.

**You'll be able to:** explain the difference between `Price(props)` and `<Price />`, why component names are capitalized, and why a local variable resets on every render.

<figure class="fig anim fig-fund-who-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">You call Price()</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">React calls Price</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;log('1. building elements')&quot;,&quot;say&quot;:&quot;Logs the first line.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;hl&quot;,&quot;o1&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;Price({ cents: 1800 })&quot;,&quot;say&quot;:&quot;&lt;b&gt;You&lt;/b&gt; call &lt;code&gt;Price&lt;/code&gt;, like any function. It runs immediately, while the JSX is still being built.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;&quot;,&quot;b&quot;:&quot;hl&quot;,&quot;o2a&quot;:&quot;run&quot;}},{&quot;fn&quot;:&quot;log('2. …')&quot;,&quot;say&quot;:&quot;Only after that is the element finished.&quot;,&quot;set&quot;:{&quot;b&quot;:&quot;&quot;,&quot;c&quot;:&quot;hl&quot;,&quot;o2a&quot;:&quot;done&quot;,&quot;o3&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;render(element)&quot;,&quot;say&quot;:&quot;React gets a &lt;code&gt;&amp;lt;p&amp;gt;&lt;/code&gt; element: it never sees &lt;code&gt;Price&lt;/code&gt;, so it can’t give it state, skip it, or call it again later.&quot;,&quot;set&quot;:{&quot;c&quot;:&quot;&quot;,&quot;d&quot;:&quot;hl&quot;,&quot;o4&quot;:&quot;new&quot;}}]" data-intro="&lt;code&gt;{Price({ cents })}&lt;/code&gt;: a plain function call."><div class="anim-scn-title">You call Price()</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">lesson code</div><div class="a-col"><div class="an call" data-k="a"><code>log('1. building elements')</code></div><div class="an call" data-k="b"><code>const element = &lt;div&gt;{Price({ cents })}&lt;/div&gt;</code></div><div class="an call" data-k="c"><code>log('2. elements built, calling render()')</code></div><div class="an call" data-k="d"><code>reactRoot.render(element)</code></div></div></div><div class="a-panel "><div class="a-panel-title">console (recorded)</div><div class="a-log"><div class="an" data-k="o1" data-s="ghost">1. building elements</div><div class="an" data-k="o2a" data-s="ghost">  Price runs</div><div class="an" data-k="o3" data-s="ghost">2. elements built, calling render()</div><div class="an" data-k="o2b" data-s="ghost">  Price runs</div><div class="an" data-k="o4" data-s="ghost">3. on screen</div></div></div></div></div><ol class="anim-print"><li><code>log('1. building elements')</code><span>Logs the first line.</span></li><li><code>Price({ cents: 1800 })</code><span><b>You</b> call <code>Price</code>, like any function. It runs immediately, while the JSX is still being built.</span></li><li><code>log('2. …')</code><span>Only after that is the element finished.</span></li><li><code>render(element)</code><span>React gets a <code>&lt;p&gt;</code> element: it never sees <code>Price</code>, so it can’t give it state, skip it, or call it again later.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;fn&quot;:&quot;log('1. building elements')&quot;,&quot;say&quot;:&quot;Logs the first line.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;hl&quot;,&quot;o1&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;createElement(Price, { cents: 1800 })&quot;,&quot;say&quot;:&quot;Passing &lt;code&gt;Price&lt;/code&gt; itself creates an element &lt;code&gt;{ type: Price, props }&lt;/code&gt;. &lt;code&gt;Price&lt;/code&gt; does &lt;b&gt;not&lt;/b&gt; run.&quot;,&quot;set&quot;:{&quot;a&quot;:&quot;&quot;,&quot;b&quot;:&quot;hl&quot;}},{&quot;fn&quot;:&quot;log('2. …')&quot;,&quot;say&quot;:&quot;The element is done and &lt;code&gt;Price&lt;/code&gt; still hasn’t run.&quot;,&quot;set&quot;:{&quot;b&quot;:&quot;&quot;,&quot;c&quot;:&quot;hl&quot;,&quot;o3&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;render(element) → Price(props)&quot;,&quot;say&quot;:&quot;&lt;b&gt;React&lt;/b&gt; calls &lt;code&gt;Price&lt;/code&gt; while rendering. Because React owns the call, it can attach state to it, skip it, or call it again on the next render.&quot;,&quot;set&quot;:{&quot;c&quot;:&quot;&quot;,&quot;d&quot;:&quot;hl&quot;,&quot;o2b&quot;:&quot;run&quot;}},{&quot;fn&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Then the result reaches the screen.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;&quot;,&quot;o2b&quot;:&quot;done&quot;,&quot;o4&quot;:&quot;new&quot;}}]" data-intro="&lt;code&gt;{createElement(Price, { cents })}&lt;/code&gt;, which is what &lt;code&gt;&amp;lt;Price cents={…} /&amp;gt;&lt;/code&gt; compiles to."><div class="anim-scn-title">React calls Price</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">lesson code</div><div class="a-col"><div class="an call" data-k="a"><code>log('1. building elements')</code></div><div class="an call" data-k="b"><code>const element = &lt;div&gt;{createElement(Price, { cents })}&lt;/div&gt;</code></div><div class="an call" data-k="c"><code>log('2. elements built, calling render()')</code></div><div class="an call" data-k="d"><code>reactRoot.render(element)</code></div></div></div><div class="a-panel "><div class="a-panel-title">console (recorded)</div><div class="a-log"><div class="an" data-k="o1" data-s="ghost">1. building elements</div><div class="an" data-k="o2a" data-s="ghost">  Price runs</div><div class="an" data-k="o3" data-s="ghost">2. elements built, calling render()</div><div class="an" data-k="o2b" data-s="ghost">  Price runs</div><div class="an" data-k="o4" data-s="ghost">3. on screen</div></div></div></div></div><ol class="anim-print"><li><code>log('1. building elements')</code><span>Logs the first line.</span></li><li><code>createElement(Price, { cents: 1800 })</code><span>Passing <code>Price</code> itself creates an element <code>{ type: Price, props }</code>. <code>Price</code> does <b>not</b> run.</span></li><li><code>log('2. …')</code><span>The element is done and <code>Price</code> still hasn’t run.</span></li><li><code>render(element) → Price(props)</code><span><b>React</b> calls <code>Price</code> while rendering. Because React owns the call, it can attach state to it, skip it, or call it again on the next render.</span></li><li><code>commit</code><span>Then the result reaches the screen.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="done"></i>completed</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Same output, different owner: the log order was recorded from the product store.</figcaption></figure>

## The example: Price and ProductCard

```tsx
function Price({ cents }: { cents: number }) {
	log('  Price runs')
	return <p className="price">{formatUSD(cents)}</p>
}
```

```tsx
function ProductCard({ product }: { product: Product }) {
	let views = 0 // a plain local: starts at 0 on every call
	views++
	log(`  ProductCard runs (views = ${views})`)
	return (
		<article className="product-card">
			<h2>{product.name}</h2>
			<Price cents={product.priceCents} />
		</article>
	)
}
```

## Calling it yourself vs letting React call it

Calling the function directly:

```tsx
log('1. building elements')
const element = <div>{Price({ cents: product.priceCents })}</div>
log('2. elements built, calling render()')
reactRoot.render(element)
```

```text
1. building elements
  Price runs
2. elements built, calling render()
3. on screen
```

Passing the function to `createElement` (what `<Price cents={…} />` compiles to):

```tsx
log('1. building elements')
const element = <div>{createElement(Price, { cents: product.priceCents })}</div>
log('2. elements built, calling render()')
reactRoot.render(element)
```

```text
1. building elements
2. elements built, calling render()
  Price runs
3. on screen
```

Same screen, different order. In the first, `Price` runs **while the elements are being built**, and React only ever receives the `<p>` it returned. In the second, `Price` runs **after** `render()`, inside React. Only the second version is a component as far as React is concerned: it can have state and effects, React can skip it when nothing changed, and DevTools shows it.

## Every render calls the function again

The lesson renders `<ProductCard />` three times:

```text
render #1
  ProductCard runs (views = 1)
  Price runs
render #2
  ProductCard runs (views = 1)
  Price runs
render #3
  ProductCard runs (views = 1)
  Price runs
```

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

<details class="qa"><summary>What is a React component, really?</summary>

A function that accepts a props object and returns something renderable (elements, a string, a number, `null`, an array). No class or special syntax is required. The one rule is that React, not you, decides when it runs.

</details>

<details class="qa"><summary>What's the difference between <code>Price(props)</code> and <code>&lt;Price {...props} /&gt;</code>?</summary>

`Price(props)` is an ordinary call: it runs immediately and React only gets its return value. `<Price />` creates an element `{ type: Price, props }`; React calls `Price` later while rendering. The recorded logs show `Price runs` before "elements built" in the first case and after `render()` in the second. Only the element form can use hooks, be skipped, or appear in DevTools.

</details>

<details class="qa"><summary>Why must component names start with a capital letter?</summary>

The JSX compiler compiles lowercase tags to strings (DOM elements) and capitalized or dotted tags to variable references. `<price />` becomes `jsx("price")`, a non-existent DOM element.

</details>

<details class="qa"><summary>Is <code>children</code> special?</summary>

No. It's an ordinary prop with extra syntax: whatever is between the tags becomes `props.children`.

</details>

<details class="qa"><summary>Does a component keep its local variables between renders?</summary>

No. The function runs from the top on every render; the recording shows `views = 1` on all three renders. Values that must survive go in state (`useState`) or a ref (`useRef`).

</details>

## Related

- [Using JSX](../../fundamentals/using-jsx/): how tags compile.
- [TypeScript with React](../../fundamentals/typescript-with-react/): typing the props object.
- [How React Works, Start to Finish](../../internals/how-react-works/) (React Internals): how React decides to call a function (`typeof type === "function"` → a function-component fiber).

## Sources

- react.dev: [Your first component](https://react.dev/learn/your-first-component), [Passing props to a component](https://react.dev/learn/passing-props-to-a-component), [Keeping components pure](https://react.dev/learn/keeping-components-pure)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
