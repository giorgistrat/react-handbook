---
title: "Hello World in JS"
slug: "hello-world-in-js"
module: "fundamentals"
order: 0
level: "good"
illus: "browser"
summary: "A product card built with the raw DOM API: created in memory, then appended. What React automates, and why textContent is safe."
source: "https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement"
---


## In one minute

Before React, a page changes through the DOM API: create a node, set its properties, append it somewhere. A node you create lives **in memory** until you append it to something that is already on the page. React is a much more convenient way to make the same calls, so it helps to see them once by hand.

**You'll be able to:** explain what "on the page" means for a DOM node, why `textContent` is safe and `innerHTML` isn't, and what work React takes off your hands.

<figure class="fig anim fig-fund-dom-anim anim-code" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;const card = document.createElement('article')&quot;,&quot;say&quot;:&quot;A real DOM node is created, but only &lt;b&gt;in memory&lt;/b&gt;. Nothing on the page changes.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;hl&quot;,&quot;s-memory&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-memory&quot;:&quot;In memory: &amp;lt;article&amp;gt;&quot;}},{&quot;fn&quot;:&quot;const name = document.createElement('h2')&quot;,&quot;say&quot;:&quot;A heading gets its text. Still in memory.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;&quot;,&quot;s-memory&quot;:&quot;upd&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;L2&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-memory&quot;:&quot;In memory: &amp;lt;article&amp;gt;, &amp;lt;h2&amp;gt;Ceramic Mug&quot;}},{&quot;fn&quot;:&quot;const price = document.createElement('p')&quot;,&quot;say&quot;:&quot;Same for the price.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L2&quot;:&quot;&quot;,&quot;s-memory&quot;:&quot;upd&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;L4&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-memory&quot;:&quot;In memory: &amp;lt;article&amp;gt;, &amp;lt;h2&amp;gt;, &amp;lt;p&amp;gt;$18.00&quot;}},{&quot;fn&quot;:&quot;card.append(name, price)&quot;,&quot;say&quot;:&quot;The pieces are put together into one card, still detached from the page.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;L4&quot;:&quot;&quot;,&quot;s-memory&quot;:&quot;upd&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;s-check&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-memory&quot;:&quot;In memory: &amp;lt;article&amp;gt;&amp;lt;h2&amp;gt;Ceramic Mug&amp;lt;/h2&amp;gt;&amp;lt;p&amp;gt;$18.00&amp;lt;/p&amp;gt;&amp;lt;/article&amp;gt;&quot;,&quot;s-check&quot;:&quot;document.body.contains(card): false (recorded)&quot;}},{&quot;fn&quot;:&quot;rootElement.append(card)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Only now&lt;/b&gt; does the card appear: appending to a node that’s already on the page attaches it.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;s-memory&quot;:&quot;upd&quot;,&quot;s-check&quot;:&quot;ok&quot;,&quot;L7&quot;:&quot;hl&quot;,&quot;s-page&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-memory&quot;:&quot;In memory: (moved to the page)&quot;,&quot;s-page&quot;:&quot;The page: #root › Ceramic Mug $18.00&quot;,&quot;s-check&quot;:&quot;document.body.contains(card): true (recorded)&quot;}}]" data-intro="Press &lt;b&gt;Play&lt;/b&gt;, or step through with the arrows."><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">card.ts</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> card</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> document</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">createElement</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'article'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> document</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">createElement</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'h2'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">textContent </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'Ceramic Mug'</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> price</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> document</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">createElement</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'p'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">price</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">textContent </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '$18.00'</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">card</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">append</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(name</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> price)</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">rootElement</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">append</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(card)</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-memory">In memory: nothing yet</div><div class="an ca-item ca-box" data-k="s-page">The page: an empty #root</div><div class="an ca-item ca-muted" data-k="s-check">document.body.contains(card): –</div></div></div></div></div><ol class="anim-print"><li><code>const card = document.createElement('article')</code><span>A real DOM node is created, but only <b>in memory</b>. Nothing on the page changes.</span></li><li><code>const name = document.createElement('h2')</code><span>A heading gets its text. Still in memory.</span></li><li><code>const price = document.createElement('p')</code><span>Same for the price.</span></li><li><code>card.append(name, price)</code><span>The pieces are put together into one card, still detached from the page.</span></li><li><code>rootElement.append(card)</code><span><b>Only now</b> does the card appear: appending to a node that’s already on the page attaches it.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A product card built with nothing but the DOM API: create, change, then append. React will later do these steps for you.</figcaption></figure>

## The example: a product card by hand

The product store's first lesson builds one card with nothing but DOM calls. Even the `#root` element is created by the code, to show it's an ordinary node:

```ts
const rootElement = document.createElement('div')
rootElement.id = 'root'
document.body.append(rootElement)

const card = document.createElement('article')
card.className = 'product-card'

const name = document.createElement('h2')
name.textContent = product.name

const price = document.createElement('p')
price.className = 'price'
price.textContent = formatUSD(product.priceCents)

card.append(name, price)
```

At this point the card exists, but only in memory. One more line puts it on the page:

```ts
rootElement.append(card)
```

What the lesson logged before and after that line:

```text
card built. On the page? false
after append. On the page? true
html: <article class="product-card"><h2>Ceramic Mug</h2><p class="price">$18.00</p></article>
```

## How it works

- **`document.createElement` doesn't show anything.** It returns a detached node. Setting `className` or `textContent` changes that detached node.
- **`append` is what attaches it.** Appending to a node that is already in the document (here `#root`, which is inside `<body>`) makes the whole subtree visible.
- **A "root" isn't special.** `#root` is a `div` like any other. React later does exactly this kind of work, just consistently and for you.

## `textContent` vs `innerHTML`

Product names come from users and APIs, so assume they can contain anything. The lesson renders a name with HTML in it both ways:

```ts
const safe = document.createElement('h2')
safe.textContent = evil // shown as text

const unsafe = document.createElement('h2')
unsafe.innerHTML = evil // parsed as HTML: the <img> is real
```

```text
textContent → child elements: 0 · visible text: Mug <img src="x" onerror="window.__ran = true">
innerHTML → child elements: 1 · first child: IMG
onerror handler ran? true
```

`textContent` treats the string as text: no elements, the tags show up literally. `innerHTML` parses it, so the `<img>` became a real element and its `onerror` handler **ran**. That is how cross-site scripting (XSS) works.

React makes the safe choice the default: every string you render is treated as text. The only way to insert raw HTML is the deliberately alarming `dangerouslySetInnerHTML` prop.

## Common mistakes

- **Creating a node and wondering why it's not visible.** Nothing appears until it's appended to something already on the page.
- **Using `innerHTML` for data.** Use `textContent` (or React, which does the same for you). Reach for `innerHTML` / `dangerouslySetInnerHTML` only with HTML you trust or have sanitized.

## Interview Q&A

<details class="qa"><summary>Why doesn't <code>document.createElement</code> alone put anything on the page?</summary>

It only builds a node in memory. A node becomes visible when it's appended (or inserted) into a node that is already in the document. In the product store, the card logged `On the page? false` after it was fully built and `true` only after `rootElement.append(card)`. This create → change → append sequence is the manual work React's declarative API hides.

</details>

<details class="qa"><summary>Why use <code>textContent</code> instead of <code>innerHTML</code> for text?</summary>

`textContent` never parses its input as HTML, so a value like `Mug <img src="x" onerror="…">` stays visible text. `innerHTML` parses it into real elements, and the recording shows the `<img>`'s `onerror` handler actually ran. That's an XSS hole. React escapes strings by default for the same reason, and makes raw HTML opt-in through `dangerouslySetInnerHTML`.

</details>

<details class="qa"><summary>Is there anything special about the "root" DOM node React renders into?</summary>

No. It's an ordinary element, created and appended like any other; the lesson even creates it in code. A library like React has no privileged access to the page: it makes the same DOM calls you could write by hand, just many of them, consistently.

</details>

## Related

- [Raw React APIs](../../fundamentals/raw-react-apis/): the same card with React, no JSX.
- [Render and Commit](../../internals/render-and-commit/) (React Internals): when React makes these DOM calls.

## Sources

- MDN: [`Document.createElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement), [`Node.textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent), [`Element.innerHTML` security](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
