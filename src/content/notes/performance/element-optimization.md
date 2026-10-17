---
title: "Element Optimization"
slug: "element-optimization"
module: "performance"
order: 0
level: "must"
illus: "diff"
summary: "Hand React the same element, or props that compare equal, and it skips the render: reuse, element props, useMemo and memo."
source: "https://kentcdodds.com/blog/optimize-react-re-renders"
---


## In one minute

When a component re-renders, React also re-renders its children, because every JSX expression creates a **new element object** with a **new props object**. React only skips a child when it can prove nothing changed:

- **A plain component** is skipped when it gets **the very same element** as last time (`oldProps === newProps`).
- **A `memo` component** is skipped when every prop is `Object.is`-equal to last time.

So there are two families of fixes. Hand React the same element: create it once, create it in a parent that re-renders less, or cache it with `useMemo`. Or wrap the component in `memo` and keep its props stable. Neither stops a component from re-rendering when its own state or a context it reads changes.

**You'll be able to:** say exactly when React skips a child, apply the four element techniques and `memo`, and spot the prop that silently breaks `memo`.

<figure class="fig anim fig-perf-elements-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Inline</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Reused</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">memo</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="3" aria-selected="false">memo + inline function</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;say&quot;:&quot;Click &lt;b&gt;Quantity&lt;/b&gt;. The quantity is &lt;code&gt;Page&lt;/code&gt;’s state, so &lt;code&gt;Page&lt;/code&gt; runs again.&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;upd&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;s-qty&quot;:&quot;Quantity: 2&quot;,&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;StoreFooter /&gt;&quot;,&quot;say&quot;:&quot;JSX is a function call: every render builds a &lt;b&gt;new&lt;/b&gt; element with a new, empty &lt;code&gt;props&lt;/code&gt; object.&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;&quot;,&quot;L9&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;log('render StoreFooter')&quot;,&quot;say&quot;:&quot;React compares an ordinary component’s props by identity: a new object means “may have changed”, so it calls &lt;code&gt;StoreFooter&lt;/code&gt;. Recorded: the footer rendered on both clicks.&quot;,&quot;set&quot;:{&quot;L9&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;ran&quot;}}]" data-intro="&lt;code&gt;&amp;lt;StoreFooter /&amp;gt;&lt;/code&gt; written inside &lt;code&gt;Page&lt;/code&gt;."><div class="anim-scn-title">Inline</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductPage.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> StoreFooter</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> currency</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'USD'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> onSubscribe</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'render StoreFooter'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Prices in </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">currency</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> …</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Page</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">QtyButton</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> qty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> setQty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">StoreFooter</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-qty">Quantity: 1</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">Page</span><span class="an ca-rstate" data-k="r-Page">–</span></div><div class="ca-r"><span class="ca-rname">StoreFooter</span><span class="an ca-rstate" data-k="r-StoreFooter">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><span>Click <b>Quantity</b>. The quantity is <code>Page</code>’s state, so <code>Page</code> runs again.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;StoreFooter /&gt;</code><span>JSX is a function call: every render builds a <b>new</b> element with a new, empty <code>props</code> object.</span></li><li><span class="anim-phase ph-render">render phase</span><code>log('render StoreFooter')</code><span>React compares an ordinary component’s props by identity: a new object means “may have changed”, so it calls <code>StoreFooter</code>. Recorded: the footer rendered on both clicks.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;say&quot;:&quot;Click &lt;b&gt;Quantity&lt;/b&gt;. The quantity is &lt;code&gt;Page&lt;/code&gt;’s state, so &lt;code&gt;Page&lt;/code&gt; runs again.&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;upd&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;s-qty&quot;:&quot;Quantity: 2&quot;,&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;{footer}&quot;,&quot;say&quot;:&quot;&lt;code&gt;Page&lt;/code&gt; returns the hoisted &lt;code&gt;footer&lt;/code&gt;: the &lt;b&gt;very same&lt;/b&gt; object as last time.&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;&quot;,&quot;L11&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const footer = &lt;StoreFooter /&gt; // created once&quot;,&quot;say&quot;:&quot;Same element, same props object, so React &lt;b&gt;bails out&lt;/b&gt; without calling &lt;code&gt;StoreFooter&lt;/code&gt;. Recorded: only &lt;code&gt;Page&lt;/code&gt; rendered. (Passing the element in from a parent that doesn’t re-render works the same way.)&quot;,&quot;set&quot;:{&quot;L11&quot;:&quot;&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;skipped&quot;}}]" data-intro="The element is created once, outside &lt;code&gt;Page&lt;/code&gt;."><div class="anim-scn-title">Reused</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductPage.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> StoreFooter</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> currency</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'USD'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> onSubscribe</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'render StoreFooter'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Prices in </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">currency</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> …</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">StoreFooter</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic"> // created once</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Page</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">QtyButton</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> qty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> setQty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">footer</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-qty">Quantity: 1</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">Page</span><span class="an ca-rstate" data-k="r-Page">–</span></div><div class="ca-r"><span class="ca-rname">StoreFooter</span><span class="an ca-rstate" data-k="r-StoreFooter">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><span>Click <b>Quantity</b>. The quantity is <code>Page</code>’s state, so <code>Page</code> runs again.</span></li><li><span class="anim-phase ph-render">render phase</span><code>{footer}</code><span><code>Page</code> returns the hoisted <code>footer</code>: the <b>very same</b> object as last time.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const footer = &lt;StoreFooter /&gt; // created once</code><span>Same element, same props object, so React <b>bails out</b> without calling <code>StoreFooter</code>. Recorded: only <code>Page</code> rendered. (Passing the element in from a parent that doesn’t re-render works the same way.)</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;say&quot;:&quot;Click &lt;b&gt;Quantity&lt;/b&gt;. The quantity is &lt;code&gt;Page&lt;/code&gt;’s state, so &lt;code&gt;Page&lt;/code&gt; runs again.&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;upd&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;s-qty&quot;:&quot;Quantity: 2&quot;,&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;MemoFooter currency={currency} /&gt;&quot;,&quot;say&quot;:&quot;A new element, but &lt;code&gt;MemoFooter&lt;/code&gt; is wrapped in &lt;code&gt;memo&lt;/code&gt;…&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;&quot;,&quot;L12&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const MemoFooter = memo(StoreFooter)&quot;,&quot;say&quot;:&quot;…so React compares the props &lt;b&gt;key by key&lt;/b&gt; with &lt;code&gt;Object.is&lt;/code&gt;: &lt;code&gt;\&quot;USD\&quot; === \&quot;USD\&quot;&lt;/code&gt;. All equal, so it skips the footer. Recorded: only &lt;code&gt;Page&lt;/code&gt;; and when the currency really changed, the footer rendered.&quot;,&quot;set&quot;:{&quot;L12&quot;:&quot;&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;skipped&quot;}}]" data-intro="&lt;code&gt;memo(StoreFooter)&lt;/code&gt;, given a string prop."><div class="anim-scn-title">memo</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductPage.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> StoreFooter</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> currency</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'USD'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> onSubscribe</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'render StoreFooter'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Prices in </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">currency</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> …</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> MemoFooter</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> memo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(StoreFooter)</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Page</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">currency</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setCurrency</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'USD'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">QtyButton</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> qty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> setQty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">MemoFooter</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> currency</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">currency</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-qty">Quantity: 1</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">Page</span><span class="an ca-rstate" data-k="r-Page">–</span></div><div class="ca-r"><span class="ca-rname">StoreFooter</span><span class="an ca-rstate" data-k="r-StoreFooter">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><span>Click <b>Quantity</b>. The quantity is <code>Page</code>’s state, so <code>Page</code> runs again.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;MemoFooter currency={currency} /&gt;</code><span>A new element, but <code>MemoFooter</code> is wrapped in <code>memo</code>…</span></li><li><span class="anim-phase ph-render">render phase</span><code>const MemoFooter = memo(StoreFooter)</code><span>…so React compares the props <b>key by key</b> with <code>Object.is</code>: <code>"USD" === "USD"</code>. All equal, so it skips the footer. Recorded: only <code>Page</code>; and when the currency really changed, the footer rendered.</span></li></ol></div><div class="anim-scn" data-anim-scn="3" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;say&quot;:&quot;Click &lt;b&gt;Quantity&lt;/b&gt;. The quantity is &lt;code&gt;Page&lt;/code&gt;’s state, so &lt;code&gt;Page&lt;/code&gt; runs again.&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;upd&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;s-qty&quot;:&quot;Quantity: 2&quot;,&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;onSubscribe={() =&gt; log('subscribed')} /&gt;&quot;,&quot;say&quot;:&quot;The arrow function is created anew on every render.&quot;,&quot;set&quot;:{&quot;s-qty&quot;:&quot;&quot;,&quot;L12&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const MemoFooter = memo(StoreFooter)&quot;,&quot;say&quot;:&quot;&lt;code&gt;currency&lt;/code&gt; is equal, but &lt;code&gt;onSubscribe&lt;/code&gt; isn’t: one unstable prop is enough. &lt;code&gt;memo&lt;/code&gt; now costs a comparison &lt;b&gt;and&lt;/b&gt; the render. Recorded: the footer rendered on both clicks.&quot;,&quot;set&quot;:{&quot;L12&quot;:&quot;&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;r-Page&quot;:&quot;run&quot;,&quot;r-StoreFooter&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;r-Page&quot;:&quot;ran&quot;,&quot;r-StoreFooter&quot;:&quot;ran&quot;}}]" data-intro="The same &lt;code&gt;memo&lt;/code&gt;, plus &lt;code&gt;onSubscribe={() =&amp;gt; …}&lt;/code&gt;."><div class="anim-scn-title">memo + inline function</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductPage.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> StoreFooter</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> currency</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'USD'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> onSubscribe</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'render StoreFooter'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Prices in </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">currency</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> …</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> MemoFooter</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> memo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(StoreFooter)</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Page</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">QtyButton</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> qty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">qty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> setQty</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setQty</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">MemoFooter</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> currency</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"USD"</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onSubscribe</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'subscribed'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-qty">Quantity: 1</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">Page</span><span class="an ca-rstate" data-k="r-Page">–</span></div><div class="ca-r"><span class="ca-rname">StoreFooter</span><span class="an ca-rstate" data-k="r-StoreFooter">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><span>Click <b>Quantity</b>. The quantity is <code>Page</code>’s state, so <code>Page</code> runs again.</span></li><li><span class="anim-phase ph-render">render phase</span><code>onSubscribe={() =&gt; log('subscribed')} /&gt;</code><span>The arrow function is created anew on every render.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const MemoFooter = memo(StoreFooter)</code><span><code>currency</code> is equal, but <code>onSubscribe</code> isn’t: one unstable prop is enough. <code>memo</code> now costs a comparison <b>and</b> the render. Recorded: the footer rendered on both clicks.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A product page with a quantity counter, and a footer that has nothing to do with the quantity. Does the footer re-render? (All four versions recorded, two clicks each.)</figcaption></figure>

## Why children re-render

JSX is a function call that returns a plain object:

```tsx
const a = <StoreFooter />
const b = <StoreFooter />
log('a === b →', a === b, '· a === a →', a === a)
log('a.props === b.props →', a.props === b.props)
log('a →', { type: (a.type as { name: string }).name, key: a.key, props: a.props })
```

```text
a === b → false · a === a → true
a.props === b.props → false
a → {"type":"StoreFooter","key":null,"props":{}}
```

Two `<StoreFooter />` elements look identical but are two different objects. During reconciliation React compares the previous props with the new ones **by identity** for an ordinary component. A new object means "may have changed", so React calls the component. It never compares the contents unless you ask for it with `memo`.

## The example: a footer that ignores the quantity

The product page has a quantity button (state in `Page`) and a store footer that has nothing to do with the quantity:

```tsx
function StoreFooter({ currency = 'USD', onSubscribe }: { currency?: string; onSubscribe?: () => void }) {
	log('  render StoreFooter')
	return (
		<footer>
			Prices in {currency} · <button onClick={onSubscribe}>Subscribe</button>
		</footer>
	)
}
```

Every version below was clicked twice on "Quantity".

### 1. Inline (the default)

```tsx
function PageInline() {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<StoreFooter />
		</>
	)
}
```

```text
render Page
  render StoreFooter
render Page
  render StoreFooter
```

The footer rendered on both clicks.

### 2. Reuse the element

```tsx
const footer = <StoreFooter /> // created once, when the module loads

function PageReuse() {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			{footer}
		</>
	)
}
```

```text
render Page
render Page
```

The element is created once, when the module loads. Every render of `Page` hands React the same object, so its props are `===` and React bails out. This only works for elements that don't depend on the component's props or state.

### 3. Pass the element in

```tsx
function App() {
	return <PageWithFooter footer={<StoreFooter />} /> // App doesn't re-render
}

function PageWithFooter({ footer }: { footer: ReactNode }) {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			{footer}
		</>
	)
}
```

```text
render Page
render Page
```

An element's identity follows the component that **creates** it. `App` created the footer and doesn't re-render when the quantity changes, so `Page` keeps getting the same element. This is the same trick as `children` ([Composition and Layout Components](../../patterns/composition/)).

### 4. Cache the element with `useMemo`

When the element needs a value from the re-rendering component (here, a currency), cache it by that value:

```tsx
function PageMemoElement() {
	const [qty, setQty] = useState(1)
	const [currency, setCurrency] = useState('USD')
	log('render Page')
	const footer = useMemo(() => <StoreFooter currency={currency} />, [currency])
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<button id="currency" onClick={() => setCurrency('EUR')}>Show EUR</button>
			{footer}
		</>
	)
}
```

Quantity clicks, then "Show EUR":

```text
render Page
render Page
```

```text
render Page
  render StoreFooter
```

It works, but it's unusual: `memo` is the conventional tool for the same job.

### 5. `memo` the component

```tsx
const MemoFooter = memo(StoreFooter)

function PageMemo() {
	const [qty, setQty] = useState(1)
	const [currency, setCurrency] = useState('USD')
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<button id="currency" onClick={() => setCurrency('EUR')}>Show EUR</button>
			<MemoFooter currency={currency} />
		</>
	)
}
```

```text
render Page
render Page
```

```text
render Page
  render StoreFooter
```

The element is new each time, but `memo` compares `currency` with `Object.is`: `"USD" === "USD"` → skip. When the currency really changed, it rendered.

### 6. One inline function breaks it

```tsx
function PageMemoBroken() {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<MemoFooter currency="USD" onSubscribe={() => log('subscribed')} />
		</>
	)
}
```

```text
render Page
  render StoreFooter
render Page
  render StoreFooter
```

The arrow function is a new function every render, so the comparison fails every time: `memo` now costs a comparison *and* the render.

## How it works

React's check for an ordinary component is literally `current.memoizedProps !== workInProgress.pendingProps` ([Reconciliation](../../internals/reconciliation/), [The Work Loop](../../internals/the-work-loop/)). For a `memo` component it runs `shallowEqual(prevProps, nextProps)` instead: same keys, each value `Object.is`-equal.

| Prop passed to a `memo` component | Equal next render? |
| --- | --- |
| `currency="USD"`, `count={3}`, `name={name}` | ✅ primitives compare by value |
| `setX` from `useState`, `dispatch` | ✅ stable by guarantee |
| `style={{ color }}`, `items={[1, 2]}` | ❌ new object or array |
| `onClick={() => …}` | ❌ new function (recorded above) |
| JSX children `<span />` | ❌ new element |
| a value from `useMemo` / `useCallback` | ✅ while the deps don't change |

`useMemo` on an element and `memo` on a component are the same idea in two places: `useMemo` caches the **element** in the parent and compares a dependency array; `memo` caches the **result** on the component and compares the props object.

## Common mistakes

- **Wrapping everything in `memo`.** If any prop is new each render, it's pure overhead.
- **Memoizing before restructuring.** Moving state down or passing elements in (techniques 2 and 3) often removes the re-render with no extra code.
- **Expecting it to stop context or state updates.** A reused element or `memo` component still re-renders for its own state and the contexts it reads.
- **Optimizing without measuring.** "Sometimes you may inadvertently make things slower when applying a performance optimization." With the React Compiler enabled, much of this memoization is done for you.

## Interview Q&A

<details class="qa"><summary>Why does a child re-render when its parent re-renders, even with the same props?</summary>

The parent's JSX runs again and creates a new element with a new props object. React compares an ordinary component's props by identity, so a new object means it calls the component. Recorded: `a === b → false` for two `<StoreFooter />`s.

</details>

<details class="qa"><summary>How can you avoid a re-render without <code>memo</code>?</summary>

Give React the same element object: hoist a static element out of the component, create it in a parent that re-renders less (props or `children`), or cache it with `useMemo`. Recorded: with the element reused or passed in, two quantity clicks rendered only `Page`.

</details>

<details class="qa"><summary>How does <code>memo</code> decide?</summary>

It compares each prop with `Object.is` (`shallowEqual`). Primitives compare by value; objects, arrays and functions by identity.

</details>

<details class="qa"><summary>What silently breaks <code>memo</code>?</summary>

Any prop created during render: inline objects, arrays, arrow functions, JSX children. Recorded: adding `onSubscribe={() => …}` made the memoized footer render on every click again.

</details>

<details class="qa"><summary>Does <code>memo</code> stop all re-renders?</summary>

No. A memoized component still re-renders when its own state changes or a context it reads changes.

</details>

<details class="qa"><summary><code>useMemo</code> on an element vs <code>memo</code> on a component?</summary>

`useMemo` caches one element inside the parent, by a dependency array. `memo` caches the component's last result wherever it's rendered, by its props. `memo` is the conventional choice.

</details>

## Related

- [React Re-rendering](../../hooks/react-re-rendering/): what triggers a render.
- [Optimize Context](../../performance/optimize-context/): the same identity rules for context values.
- [Optimize Rendering](../../performance/optimize-rendering/): `memo` on 500 list rows.
- [Reconciliation](../../internals/reconciliation/): where React compares props.

## Sources

- Kent C. Dodds: [One simple trick to optimize React re-renders](https://kentcdodds.com/blog/optimize-react-re-renders), [What is JSX?](https://kentcdodds.com/blog/what-is-jsx)
- react.dev: [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
