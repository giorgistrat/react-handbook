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

<figure class="fig anim fig-fund-dom-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;document.createElement('article')&quot;,&quot;say&quot;:&quot;A real DOM node is created, but only &lt;b&gt;in memory&lt;/b&gt;. Nothing on the page changes.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;hl&quot;,&quot;m-card&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;name.textContent = 'Ceramic Mug'&quot;,&quot;say&quot;:&quot;The &lt;code&gt;h2&lt;/code&gt; gets its text. Still in memory.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;&quot;,&quot;l2&quot;:&quot;hl&quot;,&quot;m-h2&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;price.textContent = '$18.00'&quot;,&quot;say&quot;:&quot;Same for the price.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;&quot;,&quot;l3&quot;:&quot;hl&quot;,&quot;m-p&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;card.append(name, price)&quot;,&quot;say&quot;:&quot;The pieces are put together into one card, still detached. The recording logged &lt;code&gt;On the page? false&lt;/code&gt; at this point.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;&quot;,&quot;l4&quot;:&quot;hl&quot;,&quot;m-h2&quot;:&quot;keep&quot;,&quot;m-p&quot;:&quot;keep&quot;,&quot;m-card&quot;:&quot;keep&quot;}},{&quot;fn&quot;:&quot;rootElement.append(card)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Only now&lt;/b&gt; does the card appear: appending to a node that is already on the page attaches it. The recording logged &lt;code&gt;On the page? true&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;l4&quot;:&quot;&quot;,&quot;l5&quot;:&quot;hl&quot;,&quot;m-card&quot;:&quot;faint&quot;,&quot;m-h2&quot;:&quot;faint&quot;,&quot;m-p&quot;:&quot;faint&quot;,&quot;dom&quot;:&quot;new&quot;,&quot;onpage&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;onpage&quot;:&quot;document.body.contains(card) → true&quot;}}]" data-intro="Building a product card with nothing but the DOM API."><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">your code</div><div class="a-col"><div class="an call" data-k="l1"><code>const card = document.createElement('article')</code></div><div class="an call" data-k="l2"><code>name.textContent = 'Ceramic Mug'</code></div><div class="an call" data-k="l3"><code>price.textContent = '$18.00'</code></div><div class="an call" data-k="l4"><code>card.append(name, price)</code></div><div class="an call" data-k="l5"><code>rootElement.append(card)</code></div></div></div><div class="a-panel "><div class="a-panel-title">in memory (not on the page)</div><div class="a-col"><span class="an chip-a" data-k="m-card" data-s="ghost">&lt;article class="product-card"&gt;</span><span class="an chip-a" data-k="m-h2" data-s="ghost">&lt;h2&gt;Ceramic Mug&lt;/h2&gt;</span><span class="an chip-a" data-k="m-p" data-s="ghost">&lt;p class="price"&gt;$18.00&lt;/p&gt;</span></div></div><div class="a-panel "><div class="a-panel-title">the page</div><div class="a-col"><div class="a-dom">&lt;div id="root"&gt;<span class="an" data-k="dom" data-s="ghost"><br>&nbsp;&nbsp;&lt;article&gt;&lt;h2&gt;Ceramic Mug&lt;/h2&gt;&lt;p&gt;$18.00&lt;/p&gt;&lt;/article&gt;<br></span>&lt;/div&gt;</div><span class="an chip-a" data-k="onpage">document.body.contains(card) → false</span></div></div></div></div><ol class="anim-print"><li><code>document.createElement('article')</code><span>A real DOM node is created, but only <b>in memory</b>. Nothing on the page changes.</span></li><li><code>name.textContent = 'Ceramic Mug'</code><span>The <code>h2</code> gets its text. Still in memory.</span></li><li><code>price.textContent = '$18.00'</code><span>Same for the price.</span></li><li><code>card.append(name, price)</code><span>The pieces are put together into one card, still detached. The recording logged <code>On the page? false</code> at this point.</span></li><li><code>rootElement.append(card)</code><span><b>Only now</b> does the card appear: appending to a node that is already on the page attaches it. The recording logged <code>On the page? true</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="ok"></i>ok</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Create, change, append: the three manual steps that React later does for you.</figcaption></figure>

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
