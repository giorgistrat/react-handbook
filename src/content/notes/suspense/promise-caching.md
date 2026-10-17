---
title: "Promise Caching and Transitions"
slug: "promise-caching"
module: "suspense"
order: 1
level: "must"
illus: "loop"
summary: "One promise per id, and startTransition to keep the old page instead of a fallback, without a flickering spinner."
source: "https://react.dev/reference/react/useTransition"
---


## In one minute

When the data depends on props or state (the product id the shopper picked), the component has to get its promise during render, so it needs a **cache**: the same id must give back the **same promise**, or `use` suspends forever. A `Map` from id to promise is enough for the basics. The next problem is what the shopper sees while the next product loads. A normal state update that suspends **replaces** the current content with the fallback. Wrapped in `startTransition`, React **keeps the current content** (you can dim it with `isPending`) and swaps in the new page when it's ready. And to avoid a pending indicator that flickers for fast requests, show it only if loading takes longer than a short delay.

**You'll be able to:** cache promises by id, switch content without flashing a fallback, and keep a spinner from flickering.

<figure class="fig anim fig-suspense-transition-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">setId (urgent)</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">startTransition</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button onClick={() =&gt; setId('p4')}&gt;Desk Lamp&lt;/button&gt;&quot;,&quot;say&quot;:&quot;Click &lt;b&gt;Desk Lamp&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;if (!productCache.has(id)) productCache.set(id, fetchProduct(id))&quot;,&quot;say&quot;:&quot;The new id renders &lt;code&gt;ProductDetails&lt;/code&gt;, which asks the cache for p4: a new request, so it suspends.&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;&quot;,&quot;L2&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;&lt;Suspense fallback={&lt;p&gt;Loading product…&lt;/p&gt;}&gt;&quot;,&quot;say&quot;:&quot;An urgent update that suspends &lt;b&gt;replaces&lt;/b&gt; the content with the fallback: the mug disappears for 500 ms.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L11&quot;:&quot;hl&quot;,&quot;s-page&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Loading product…&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;The data arrives and the lamp appears.&quot;,&quot;set&quot;:{&quot;L11&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Desk Lamp&quot;}}]" data-intro="A plain state update."><div class="anim-scn-title">setId (urgent)</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductSwitcher.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#8839EF;--shiki-light-font-weight:bold;--shiki-dark:#CBA6F7;--shiki-dark-font-weight:bold"> new</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> getProduct</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  if</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">has</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id)) productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">set</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> fetchProduct</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id))</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">get</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id) </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// the same promise for the same id</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductSwitcher</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setId</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'p1'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">isPending</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> startTransition</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useTransition</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setId</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'p4'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Desk Lamp</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Suspense</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> fallback</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Loading product…</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ProductDetails</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">/* use(getProduct(id)) */</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Suspense</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L15"><span class="ca-num">16</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-page">Ceramic Mug</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button onClick={() =&gt; setId('p4')}&gt;Desk Lamp&lt;/button&gt;</code><span>Click <b>Desk Lamp</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>if (!productCache.has(id)) productCache.set(id, fetchProduct(id))</code><span>The new id renders <code>ProductDetails</code>, which asks the cache for p4: a new request, so it suspends.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>&lt;Suspense fallback={&lt;p&gt;Loading product…&lt;/p&gt;}&gt;</code><span>An urgent update that suspends <b>replaces</b> the content with the fallback: the mug disappears for 500 ms.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>The data arrives and the lamp appears.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button onClick={() =&gt; startTransition(() =&gt; setId('p4'))}&gt;Desk Lamp&lt;/button&gt;&quot;,&quot;say&quot;:&quot;Click &lt;b&gt;Desk Lamp&lt;/b&gt;. &lt;code&gt;isPending&lt;/code&gt; becomes true right away, so the page can dim itself.&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;hl&quot;,&quot;s-page&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Ceramic Mug (dimmed) ⏳&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;if (!productCache.has(id)) productCache.set(id, fetchProduct(id))&quot;,&quot;say&quot;:&quot;The transition render suspends on the new product…&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;&quot;,&quot;L2&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Suspense fallback={&lt;p&gt;Loading product…&lt;/p&gt;}&gt;&quot;,&quot;say&quot;:&quot;…and React &lt;b&gt;keeps the current content&lt;/b&gt; instead of showing the fallback: a transition doesn’t hide content that’s already on screen.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L11&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;500 ms later, the new content replaces the old in one step. (Going back to the cached mug made no request.)&quot;,&quot;set&quot;:{&quot;L11&quot;:&quot;&quot;,&quot;s-page&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-page&quot;:&quot;Desk Lamp&quot;}}]" data-intro="The update wrapped in &lt;code&gt;startTransition&lt;/code&gt;."><div class="anim-scn-title">startTransition</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductSwitcher.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#8839EF;--shiki-light-font-weight:bold;--shiki-dark:#CBA6F7;--shiki-dark-font-weight:bold"> new</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> getProduct</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  if</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">has</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id)) productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">set</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> fetchProduct</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id))</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> productCache</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">get</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(id) </span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">// the same promise for the same id</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductSwitcher</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setId</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'p1'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">isPending</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> startTransition</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useTransition</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> startTransition</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setId</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'p4'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">))</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Desk Lamp</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Suspense</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> fallback</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Loading product…</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ProductDetails</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic">/* use(getProduct(id)) */</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Suspense</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L15"><span class="ca-num">16</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-page">Ceramic Mug</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button onClick={() =&gt; startTransition(() =&gt; setId('p4'))}&gt;Desk Lamp&lt;/button&gt;</code><span>Click <b>Desk Lamp</b>. <code>isPending</code> becomes true right away, so the page can dim itself.</span></li><li><span class="anim-phase ph-render">render phase</span><code>if (!productCache.has(id)) productCache.set(id, fetchProduct(id))</code><span>The transition render suspends on the new product…</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Suspense fallback={&lt;p&gt;Loading product…&lt;/p&gt;}&gt;</code><span>…and React <b>keeps the current content</b> instead of showing the fallback: a transition doesn’t hide content that’s already on screen.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>500 ms later, the new content replaces the old in one step. (Going back to the cached mug made no request.)</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Switching from the Ceramic Mug to the Desk Lamp, whose request takes 500 ms (both versions recorded).</figcaption></figure>

## The example: a product switcher

Three buttons switch between the Ceramic Mug (p1), the Desk Lamp (p4, a 500 ms request) and the Notebook Set (p6, a fast 100 ms request).

### 1. One promise per product

```tsx
const productCache = new Map<string, Promise<Details>>()

function getProduct(id: string) {
	let promise = productCache.get(id)
	if (!promise) {
		promise = fetchProduct(id, id === 'p6' ? 100 : 500) // p6 is a fast request
		productCache.set(id, promise)
	}
	return promise
}
```

```tsx
function ProductDetails({ id }: { id: string }) {
	const product = use(getProduct(id)) // the same promise for the same id
	return <h2 data-details={product.name}>{product.name}</h2>
}
```

`getProduct` isn't `async`: an `async` function returns a **new** promise every call, even when it returns a cached one inside. Returning the cached promise object itself is what lets `use` recognize it.

Going back to the mug, which is already cached, made no request and showed no fallback (from the urgent version below):

```text
screen: details: Ceramic Mug
```

### 2. An urgent update

```tsx
function ProductSwitcherUrgent() {
	const [id, setId] = useState('p1')
	return (
		<>
			{ids.map((x) => (
				<button key={x} id={x} onClick={() => setId(x)}>{x}</button>
			))}
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetails id={id} />
			</Suspense>
		</>
	)
}
```

Clicking the Desk Lamp:

```text
1600 ms  → GET /products/p4
screen: fallback “Loading product…”
2100 ms  ← GET /products/p4
screen: details: Desk Lamp
```

The mug disappeared and "Loading product…" took its place for 500 ms. For a page that was already showing content, that's a jarring blank.

### 3. A transition

```tsx
function ProductSwitcher() {
	const [id, setId] = useState('p1')
	const [isPending, startTransition] = useTransition()
	return (
		<>
			{ids.map((x) => (
				<button key={x} id={x} onClick={() => startTransition(() => setId(x))}>{x}</button>
			))}
			{isPending && <span data-pending>⏳</span>}
			<div style={{ opacity: isPending ? 0.6 : 1 }} data-stale={isPending || undefined}>
				<Suspense fallback={<p data-fallback>Loading product…</p>}>
					<ProductDetails id={id} />
				</Suspense>
			</div>
		</>
	)
}
```

```text
screen: pending ⏳ · details: Ceramic Mug (dimmed)
1650 ms  → GET /products/p4
2150 ms  ← GET /products/p4
screen: details: Desk Lamp
```

The mug stayed, dimmed, with ⏳, until the lamp was ready. But look at the fast and cached switches:

```text
screen: pending ⏳ · details: Desk Lamp (dimmed)
screen: details: Ceramic Mug
```

```text
screen: pending ⏳ · details: Ceramic Mug (dimmed)
2900 ms  → GET /products/p6
3000 ms  ← GET /products/p6
screen: details: Notebook Set
```

The ⏳ flashed even for the already-cached mug: `isPending` turns true in an urgent render first, then false again. That one-frame flash is a flicker of its own.

### 4. Hiding quick spinners

```tsx
// Show a pending state only if it lasts longer than `delay`; once shown,
// keep it for at least `minDuration` (the idea behind the spin-delay package).
function useSpinDelay(loading: boolean, { delay = 300, minDuration = 400 } = {}) {
	const [show, setShow] = useState(false)
	const shownAt = useRef(0)
	useEffect(() => {
		if (loading && !show) {
			const t = setTimeout(() => ((shownAt.current = Date.now()), setShow(true)), delay)
			return () => clearTimeout(t)
		}
		if (!loading && show) {
			const t = setTimeout(() => setShow(false), Math.max(0, minDuration - (Date.now() - shownAt.current)))
			return () => clearTimeout(t)
		}
	}, [loading, show, delay, minDuration])
	return show
}

function ProductSwitcherSpinDelay() {
	const [id, setId] = useState('p1')
	const [isPending, startTransition] = useTransition()
	const showSpinner = useSpinDelay(isPending)
	return (
		<>
			{ids.map((x) => (
				<button key={x} id={x} onClick={() => startTransition(() => setId(x))}>{x}</button>
			))}
			{showSpinner && <span data-pending>⏳</span>}
			<Suspense fallback={<p data-fallback>Loading product…</p>}>
				<ProductDetails id={id} />
			</Suspense>
		</>
	)
}
```

Fast and cached switches showed no ⏳ at all:

```text
2800 ms  → GET /products/p6
2900 ms  ← GET /products/p6
screen: details: Notebook Set
```

The slow switch still showed it, and kept it briefly after the lamp appeared, so it doesn't blink:

```text
1600 ms  → GET /products/p4
screen: pending ⏳ · details: Ceramic Mug
2100 ms  ← GET /products/p4
screen: pending ⏳ · details: Desk Lamp
screen: details: Desk Lamp
```

The `spin-delay` package's `useSpinDelay` does the same, with tested edge cases.

## How it works

- **Transitions don't hide revealed content.** If an update inside `startTransition` suspends under a `Suspense` boundary that's already showing content, React keeps that content and waits. Boundaries that are **new** in the update can still show their fallback ([Suspending on Images](../../suspense/suspending-on-images/)).
- **`isPending`** is true from the click until the transition commits. It's the place for a lightweight indicator (dimming, a small spinner), instead of the full fallback.
- **The cache here never invalidates.** A real app needs to refresh data, limit memory and handle errors (a rejected promise stays cached). Data libraries handle that; this note shows the core idea.

## Common mistakes

- **`async` cache functions.** A new promise every call defeats the cache.
- **Caching by an object key** (`cache.get({ id })`): never the same key twice. Use a string.
- **Urgent updates for navigation between already-loaded screens**: the fallback replaces the content.
- **Showing `isPending` directly** for requests that are often fast: a flickering spinner.

## Interview Q&A

<details class="qa"><summary>Why does calling a fetch function directly in a component break Suspense?</summary>

Each render creates a new promise. `use` sees a pending promise every time, suspends, and the retry creates another one, so it never finishes. ([Data Fetching with use](../../suspense/data-fetching/) recorded 12 requests in 2.5 seconds.)

</details>

<details class="qa"><summary>How do you fix it?</summary>

Cache the promise by its input (`Map<id, Promise>`), and return the same promise object for the same id. Recorded: switching back to a cached product made no request.

</details>

<details class="qa"><summary>Why shouldn't the cache function be <code>async</code>?</summary>

`async` functions always return a new promise wrapping the result, so `use` would see a different promise each call.

</details>

<details class="qa"><summary>What does <code>useTransition</code> change when an update suspends?</summary>

Instead of replacing the visible content with the fallback, React keeps it and sets `isPending` until the new content is ready. Recorded: the mug stayed (dimmed) for 500 ms, then the lamp replaced it.

</details>

<details class="qa"><summary>Why can a transition still flicker, and how do you fix it?</summary>

`isPending` turns on even for instant updates, so a pending indicator can flash for one frame. Recorded: ⏳ flashed when switching to a cached product. Show it only after a delay, and then for a minimum time (`useSpinDelay`).

</details>

## Related

- [Data Fetching with use](../../suspense/data-fetching/): `use`, `Suspense` and error boundaries.
- [Code Splitting](../../performance/code-splitting/): the same transition trick for lazy code.
- [Concurrent Rendering](../../performance/concurrent-rendering/): transitions and priorities.

## Sources

- react.dev: [`useTransition`](https://react.dev/reference/react/useTransition), [Preventing already revealed content from hiding](https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding)
- [spin-delay](https://github.com/smeijer/spin-delay)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
