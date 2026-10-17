---
title: "Windowing"
slug: "windowing"
module: "performance"
order: 6
level: "good"
illus: "map"
summary: "Render only the visible rows of a 10,000-item list with @tanstack/react-virtual."
source: "https://tanstack.com/virtual/latest"
---


## In one minute

Some lists are slow even when every row is cheap and memoized: there are simply **too many** of them. React creates and compares an element per row, and the browser styles, lays out and paints a DOM node per row. **Windowing** (or **virtualization**) renders only the rows in view, plus a few extra (**overscan**), inside a tall spacer that gives the scrollbar the full list's height. As you scroll, rows leaving the window unmount and new ones mount. With `@tanstack/react-virtual`, you give `useVirtualizer` the row count, the scroll container and a size estimate, and render what `getVirtualItems()` returns.

**You'll be able to:** virtualize a long list, explain the spacer-and-offset layout, and name what you give up.

<figure class="fig anim fig-perf-windowing-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Render everything</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useVirtualizer</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;{products.map(p =&gt; &lt;li key={p.id}&gt;{p.name}&lt;/li&gt;)}&quot;,&quot;say&quot;:&quot;React creates 10,000 elements and 10,000 DOM nodes, though only 13 fit in the box.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;hl&quot;,&quot;s-dom&quot;:&quot;bad&quot;,&quot;s-time&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-dom&quot;:&quot;&amp;lt;li&amp;gt; in the DOM: 10,000&quot;,&quot;s-time&quot;:&quot;Render time (Profiler): mount ~75 ms&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;{products.map(p =&gt; &lt;li key={p.id}&gt;{p.name}&lt;/li&gt;)}&quot;,&quot;say&quot;:&quot;Every re-render of the list (the “Refresh” button) repeats the work for all 10,000 rows.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;hl&quot;,&quot;s-dom&quot;:&quot;&quot;,&quot;s-time&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-time&quot;:&quot;Render time (Profiler): update ~75 ms&quot;}}]" data-intro="&lt;code&gt;products.map(…)&lt;/code&gt;."><div class="anim-scn-title">Render everything</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Catalog.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ListAll</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"scroller"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">ul</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">        {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">products</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">p</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">li</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> key</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">name</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">li</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">ul</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-muted" data-k="s-dom">&lt;li&gt; in the DOM: –</div><div class="an ca-item ca-muted" data-k="s-time">Render time (Profiler): –</div><div class="an ca-item ca-box" data-k="s-view">Visible: rows 0–12</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>{products.map(p =&gt; &lt;li key={p.id}&gt;{p.name}&lt;/li&gt;)}</code><span>React creates 10,000 elements and 10,000 DOM nodes, though only 13 fit in the box.</span></li><li><span class="anim-phase ph-render">render phase</span><code>{products.map(p =&gt; &lt;li key={p.id}&gt;{p.name}&lt;/li&gt;)}</code><span>Every re-render of the list (the “Refresh” button) repeats the work for all 10,000 rows.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const virtualizer = useVirtualizer({&quot;,&quot;say&quot;:&quot;From the scroll position, the box height and the row size, the virtualizer works out which rows are visible, plus 5 extra.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;hl&quot;,&quot;L5&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;ul style={{ height: virtualizer.getTotalSize() }}&gt;&quot;,&quot;say&quot;:&quot;A tall inner element (10,000 × 24 px) keeps the scrollbar the same as with the full list.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L5&quot;:&quot;&quot;,&quot;L10&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;{virtualizer.getVirtualItems().map(row =&gt; (&quot;,&quot;say&quot;:&quot;Only those rows are rendered. Recorded: 18 rows in the DOM, mounted in about 2 ms.&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;&quot;,&quot;L11&quot;:&quot;hl&quot;,&quot;s-dom&quot;:&quot;ok&quot;,&quot;s-time&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-dom&quot;:&quot;&amp;lt;li&amp;gt; in the DOM: 18&quot;,&quot;s-time&quot;:&quot;Render time (Profiler): mount ~2 ms&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;style={{ transform: `translateY(${row.start}px)` }}&gt;&quot;,&quot;say&quot;:&quot;Scroll to row 5,000: rows that leave the window unmount, new ones mount, each placed with &lt;code&gt;translateY&lt;/code&gt;. Recorded: 23 rows in the DOM, and the same first visible product as the full list.&quot;,&quot;set&quot;:{&quot;L11&quot;:&quot;&quot;,&quot;s-dom&quot;:&quot;ok&quot;,&quot;s-time&quot;:&quot;&quot;,&quot;L13&quot;:&quot;hl&quot;,&quot;s-view&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-dom&quot;:&quot;&amp;lt;li&amp;gt; in the DOM: 23&quot;,&quot;s-view&quot;:&quot;Visible: rows 5,000–5,012&quot;}}]" data-intro="&lt;code&gt;@tanstack/react-virtual&lt;/code&gt;, 24 px rows, overscan 5."><div class="anim-scn-title">useVirtualizer</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Catalog.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ListVirtual</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> scrollerRef</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useRef</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#D20F39;--shiki-dark:#F38BA8">null</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> virtualizer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useVirtualizer</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    count</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> products</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">length</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    getScrollElement</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> scrollerRef</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">current</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    estimateSize</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 24</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    overscan</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 5</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> ref</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">scrollerRef</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"scroller"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">ul</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> style</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> height</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> virtualizer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">getTotalSize</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">() </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">        {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">virtualizer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">getVirtualItems</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">row</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">          &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">li</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> key</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">row</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">key</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">            style</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> transform</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> `translateY(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">row</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">start</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">px)`</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">            {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">products[row</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">index]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">name</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L15"><span class="ca-num">16</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">          &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">li</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L16"><span class="ca-num">17</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">        ))</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L17"><span class="ca-num">18</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">ul</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L18"><span class="ca-num">19</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L19"><span class="ca-num">20</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L20"><span class="ca-num">21</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-muted" data-k="s-dom">&lt;li&gt; in the DOM: –</div><div class="an ca-item ca-muted" data-k="s-time">Render time (Profiler): –</div><div class="an ca-item ca-box" data-k="s-view">Visible: rows 0–12</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>const virtualizer = useVirtualizer({</code><span>From the scroll position, the box height and the row size, the virtualizer works out which rows are visible, plus 5 extra.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;ul style={{ height: virtualizer.getTotalSize() }}&gt;</code><span>A tall inner element (10,000 × 24 px) keeps the scrollbar the same as with the full list.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>{virtualizer.getVirtualItems().map(row =&gt; (</code><span>Only those rows are rendered. Recorded: 18 rows in the DOM, mounted in about 2 ms.</span></li><li><span class="anim-phase ph-event">event</span><code>style={{ transform: `translateY(${row.start}px)` }}&gt;</code><span>Scroll to row 5,000: rows that leave the window unmount, new ones mount, each placed with <code>translateY</code>. Recorded: 23 rows in the DOM, and the same first visible product as the full list.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The whole catalog, 10,000 products, in one 300 px scrolling list. Timings from React’s &lt;Profiler&gt; (both versions recorded).</figcaption></figure>

## The example: the whole catalog

The catalog page lists all 10,000 products in a 300 px box. React's `<Profiler>` reports how long rendering the list took:

```tsx
<Profiler id="list" onRender={(_id, phase, actualDuration) => log(`${phase}: React spent ${Math.round(actualDuration)} ms rendering the list`)}>
	<List />
</Profiler>
```

### 1. Render everything

```tsx
function ListAll() {
	return (
		<div className="scroller">
			<ul>
				{products.map((p) => (
					<li key={p.id}>{p.name}</li>
				))}
			</ul>
		</div>
	)
}
```

```js
{
  "mount": [
    "mount: React spent 75 ms rendering the list"
  ],
  "rowsInDom": 10000,
  "refresh": [
    "update: React spent 73 ms rendering the list"
  ],
  "afterScroll": {
    "rowsInDom": 10000,
    "firstVisible": "Velvet Kettle 35"
  }
}
```

10,000 rows in the DOM, about 13 visible, and every re-render (the "Refresh" button) redoes all of them.

### 2. Virtualized

```tsx
function ListVirtual() {
	const scrollerRef = useRef<HTMLDivElement>(null)
	const virtualizer = useVirtualizer({
		count: products.length,
		getScrollElement: () => scrollerRef.current,
		estimateSize: () => 24, // px per row
		overscan: 5, // extra rows above and below the visible ones
	})
	return (
		<div ref={scrollerRef} className="scroller">
			<ul style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
				{virtualizer.getVirtualItems().map((row) => (
					<li
						key={row.key}
						data-index={row.index}
						style={{ position: 'absolute', top: 0, width: '100%', height: row.size, transform: `translateY(${row.start}px)` }}
					>
						{products[row.index].name}
					</li>
				))}
			</ul>
		</div>
	)
}
```

```js
{
  "mount": [
    "mount: React spent 2 ms rendering the list",
    "nested-update: React spent 1 ms rendering the list"
  ],
  "rowsInDom": 18,
  "refresh": [
    "update: React spent 0 ms rendering the list"
  ],
  "afterScroll": {
    "rowsInDom": 23,
    "firstVisible": "Velvet Kettle 35"
  }
}
```

18 rows in the DOM at the top (13 visible + 5 overscan below), 23 after scrolling to row 5,000 (overscan on both sides). The first visible product after the scroll was the same in both versions, so the scroll position and order are exact. (`nested-update` is the virtualizer measuring the container after mount and rendering once more.)

## How it works

- **The math:** from `scrollTop`, the container height and each row's size, the virtualizer computes the first and last visible indexes. `getTotalSize()` is the full height (10,000 × 24 px), set on an inner element so the scrollbar is right.
- **Rows are absolutely positioned** at `translateY(row.start)`. `transform` doesn't trigger layout for the other rows and is cheap to animate.
- **It re-renders on scroll**, but only when the visible range changes, and only those ~20 rows.
- **Variable heights:** pass a better `estimateSize` and let it measure real rows with `measureElement`.

## What you give up

- **In-page find (⌘F / Ctrl+F)** can't find rows that aren't in the DOM.
- **Screen readers** see only the rendered rows. Use `aria-setsize` and `aria-posinset` if the total matters.
- **Keyboard navigation** to an off-screen item needs `scrollToIndex` before focusing.
- **Scroll restoration and anchor links** need extra work.

## When to use it

Measure. A common rule of thumb: consider it when a view renders several hundred repeated rows, the DOM grows past roughly 1,500 nodes, or scrolling visibly janks. Below that, [Optimize Rendering](../../performance/optimize-rendering/) (memoized rows) is usually enough, and pagination or "load more" can be simpler still.

## Common mistakes

- **Forgetting the spacer height or the `position: relative` container.** Rows overlap or the scrollbar is wrong.
- **Keying rows by index** when the list can reorder: use `row.key` from the virtualizer, or the item's id.
- **A container without a fixed height or `overflow: auto`.** Nothing scrolls, so everything is "visible".

## Interview Q&A

<details class="qa"><summary>What is windowing?</summary>

Rendering only the visible part of a long list (plus a little overscan), with a spacer that keeps the full scroll height, and swapping rows in and out as the user scrolls. Recorded: 18 rows in the DOM instead of 10,000.

</details>

<details class="qa"><summary>Why is a long list slow even if each row is memoized?</summary>

`memo` skips calling each row, but the parent still creates and React still compares an element per row, and the browser still lays out every DOM node. Recorded: rendering all 10,000 rows took tens of milliseconds on every update; the virtualized list, a few.

</details>

<details class="qa"><summary>What does <code>useVirtualizer</code> need?</summary>

`count`, `getScrollElement` (the scrolling element) and `estimateSize` (a row's size). You render `getVirtualItems()`, positioned with each item's `start`, inside an element of height `getTotalSize()`.

</details>

<details class="qa"><summary>What's overscan?</summary>

Extra rows rendered just outside the viewport so fast scrolling doesn't show blank space before React catches up.

</details>

<details class="qa"><summary>What do you lose?</summary>

Browser find-in-page, full screen-reader context, simple keyboard navigation to off-screen items, and easy scroll restoration.

</details>

## Related

- [Optimize Rendering](../../performance/optimize-rendering/): memoize rows first.
- [Concurrent Rendering](../../performance/concurrent-rendering/): keep input responsive while a big list renders.

## Sources

- [TanStack Virtual](https://tanstack.com/virtual/latest) (`@tanstack/react-virtual`)
- web.dev: [Virtualize large lists](https://web.dev/articles/virtualize-long-lists-react-window), [Avoid an excessive DOM size](https://developer.chrome.com/docs/lighthouse/performance/dom-size)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
