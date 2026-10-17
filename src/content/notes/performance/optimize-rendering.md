---
title: "Optimize Rendering"
slug: "optimize-rendering"
module: "performance"
order: 5
level: "must"
illus: "list"
summary: "memo on 500 list rows, why one changing prop defeats it, and fixing that with a comparator or primitive props."
source: "https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render"
---


## In one minute

A component re-renders when its state changes, a context it reads changes, or **its parent re-renders**. The last one is usually harmless: React compares the output and changes nothing in the DOM. It matters when it's multiplied, like a list of 500 rows that all re-render when you hover one. `memo` on the row skips renders when its props are equal, but **one prop that changes for every row** (like `highlightedIndex`) defeats it. Two fixes: a **custom comparator** that checks only what the row shows, or, simpler and preferred, **pass each row primitive props** it can compare directly (`isHighlighted`). And first: fix slow renders before unnecessary ones.

**You'll be able to:** use `memo` on list items, explain why it fails on a shared changing prop, and fix it with a comparator or derived primitive props.

<figure class="fig anim fig-perf-list-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Plain</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">memo</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Custom comparator</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="3" aria-selected="false">Primitive props</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onHover={setHighlightedIndex} /&gt;&quot;,&quot;say&quot;:&quot;The mouse moves to row 6: &lt;code&gt;setHighlightedIndex(6)&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [highlightedIndex, setHighlightedIndex] = useState(-1)&quot;,&quot;say&quot;:&quot;The list re-renders, so every row does.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;s-count&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-count&quot;:&quot;ListItem renders on this hover: 500&quot;}}]" data-intro="No &lt;code&gt;memo&lt;/code&gt;."><div class="anim-scn-title">Plain</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductList.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductList</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">-</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> products</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ListItem</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> key</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> index</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      highlightedIndex</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onHover</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  ))</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-rows">Rows 4–7: Desk Lamp 1 · Bluetooth … (row 5 highlighted)</div><div class="an ca-item ca-muted" data-k="s-count">ListItem renders on this hover: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onHover={setHighlightedIndex} /&gt;</code><span>The mouse moves to row 6: <code>setHighlightedIndex(6)</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const [highlightedIndex, setHighlightedIndex] = useState(-1)</code><span>The list re-renders, so every row does.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;fn&quot;:&quot;const ListItem = memo(Row)&quot;,&quot;say&quot;:&quot;For an unrelated update (“Refresh”), &lt;code&gt;memo&lt;/code&gt; works: every prop is the same. Recorded: 0 row renders.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onHover={setHighlightedIndex} /&gt;&quot;,&quot;say&quot;:&quot;The mouse moves to row 6.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;&quot;,&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;highlightedIndex={highlightedIndex}&quot;,&quot;say&quot;:&quot;But &lt;b&gt;every&lt;/b&gt; row receives &lt;code&gt;highlightedIndex&lt;/code&gt;, which changed from 5 to 6, so every row fails the comparison.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;s-count&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-count&quot;:&quot;ListItem renders on this hover: 500&quot;}}]" data-intro="&lt;code&gt;memo(ListItem)&lt;/code&gt;."><div class="anim-scn-title">memo</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductList.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> ListItem</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> memo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(Row)</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductList</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">-</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> products</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ListItem</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> key</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> index</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      highlightedIndex</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onHover</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  ))</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-rows">Rows 4–7: Desk Lamp 1 · Bluetooth … (row 5 highlighted)</div><div class="an ca-item ca-muted" data-k="s-count">ListItem renders on this hover: –</div></div></div></div></div><ol class="anim-print"><li><code>const ListItem = memo(Row)</code><span>For an unrelated update (“Refresh”), <code>memo</code> works: every prop is the same. Recorded: 0 row renders.</span></li><li><span class="anim-phase ph-event">event</span><code>onHover={setHighlightedIndex} /&gt;</code><span>The mouse moves to row 6.</span></li><li><span class="anim-phase ph-render">render phase</span><code>highlightedIndex={highlightedIndex}</code><span>But <b>every</b> row receives <code>highlightedIndex</code>, which changed from 5 to 6, so every row fails the comparison.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onHover={setHighlightedIndex} /&gt;&quot;,&quot;say&quot;:&quot;The mouse moves to row 6.&quot;,&quot;set&quot;:{&quot;L9&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;(prev.index === prev.highlightedIndex) ===&quot;,&quot;say&quot;:&quot;The comparator asks what the row &lt;b&gt;shows&lt;/b&gt;: “was I highlighted, am I now?” Only rows 5 and 6 change their answer.&quot;,&quot;set&quot;:{&quot;L9&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;L2&quot;:&quot;hl&quot;,&quot;s-count&quot;:&quot;ok&quot;,&quot;s-rows&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-count&quot;:&quot;ListItem renders on this hover: 2&quot;,&quot;s-rows&quot;:&quot;Rows 4–7: … (row 6 highlighted)&quot;}}]" data-intro="&lt;code&gt;memo(Row, arePropsEqual)&lt;/code&gt;."><div class="anim-scn-title">Custom comparator</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductList.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> ListItem</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> memo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(Row</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> (</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">prev</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> next</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  (prev</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">index </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">===</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> prev</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">highlightedIndex) </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">===</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  (next</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">index </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">===</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> next</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">highlightedIndex))</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductList</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">-</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> products</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ListItem</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> key</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> index</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      highlightedIndex</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onHover</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  ))</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-rows">Rows 4–7: Desk Lamp 1 · Bluetooth … (row 5 highlighted)</div><div class="an ca-item ca-muted" data-k="s-count">ListItem renders on this hover: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onHover={setHighlightedIndex} /&gt;</code><span>The mouse moves to row 6.</span></li><li><span class="anim-phase ph-render">render phase</span><code>(prev.index === prev.highlightedIndex) ===</code><span>The comparator asks what the row <b>shows</b>: “was I highlighted, am I now?” Only rows 5 and 6 change their answer.</span></li></ol></div><div class="anim-scn" data-anim-scn="3" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onHover={setHighlightedIndex} /&gt;&quot;,&quot;say&quot;:&quot;The mouse moves to row 6.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;isHighlighted={i === highlightedIndex}&quot;,&quot;say&quot;:&quot;The comparison moves into the parent: each row gets a boolean, and only two booleans changed. Plain &lt;code&gt;memo&lt;/code&gt; does the rest, with no custom code to keep in sync.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;s-count&quot;:&quot;ok&quot;,&quot;s-rows&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-count&quot;:&quot;ListItem renders on this hover: 2&quot;,&quot;s-rows&quot;:&quot;Rows 4–7: … (row 6 highlighted)&quot;}}]" data-intro="The list passes an &lt;code&gt;isHighlighted&lt;/code&gt; boolean."><div class="anim-scn-title">Primitive props</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductList.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> ListItem</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> memo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(Row)</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductList</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">-</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> products</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ListItem</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> key</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> index</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">i</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      isHighlighted</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">i </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">===</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> highlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onHover</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setHighlightedIndex</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  ))</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-rows">Rows 4–7: Desk Lamp 1 · Bluetooth … (row 5 highlighted)</div><div class="an ca-item ca-muted" data-k="s-count">ListItem renders on this hover: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onHover={setHighlightedIndex} /&gt;</code><span>The mouse moves to row 6.</span></li><li><span class="anim-phase ph-render">render phase</span><code>isHighlighted={i === highlightedIndex}</code><span>The comparison moves into the parent: each row gets a boolean, and only two booleans changed. Plain <code>memo</code> does the rest, with no custom code to keep in sync.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A list of 500 products. Hovering highlights a row. The mouse moves from row 5 to row 6 (all four versions recorded).</figcaption></figure>

## The example: hovering a 500-product list

Hovering a row highlights it; clicking selects it; "Refresh" re-renders the list for an unrelated reason. Each row counts its renders, and the recorder reads the count after each action.

```tsx
function ListItem({ product, index, highlightedIndex, selectedId, onHover, onSelect }: ItemProps) {
	itemRenders++
	const isHighlighted = index === highlightedIndex
	const isSelected = product.id === selectedId
	return (
		<li
			data-index={index}
			className={`${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
			onMouseEnter={() => onHover(index)}
			onClick={() => onSelect(product.id)}
		>
			{product.name}
		</li>
	)
}
```

```tsx
function ProductList({ Item }: { Item: typeof ListItem }) {
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [, setRefresh] = useState(0)
	return (
		<>
			<button id="refresh" onClick={() => setRefresh((n) => n + 1)}>Refresh</button>
			<ul className="list">
				{products.map((p, i) => (
					<Item key={p.id} product={p} index={i} highlightedIndex={highlightedIndex} selectedId={selectedId} onHover={setHighlightedIndex} onSelect={setSelectedId} />
				))}
			</ul>
		</>
	)
}
```

### 1. Plain rows

```js
{
  "mount": "ListItem renders: 500",
  "refresh": "ListItem renders: 500",
  "hover row 5": "ListItem renders: 500",
  "hover row 6": "ListItem renders: 500",
  "highlighted": [
    "6"
  ]
}
```

Every action rendered all 500 rows, even though a hover only changes two of them.

### 2. `memo`

```tsx
const MemoItem = memo(ListItem)
```

```js
{
  "mount": "ListItem renders: 500",
  "refresh": "ListItem renders: 0",
  "hover row 5": "ListItem renders: 500",
  "hover row 6": "ListItem renders: 500",
  "highlighted": [
    "6"
  ]
}
```

"Refresh" now renders nothing: every prop is the same as last time. But hovering still renders all 500: each row receives `highlightedIndex`, which changed for **every** row, though only two rows look different.

### 3. A custom comparator

```tsx
const ComparedItem = memo(ListItem, (prev, next) => {
	// re-render only if something this row shows has changed
	if (prev.product !== next.product || prev.index !== next.index) return false
	const wasHighlighted = prev.index === prev.highlightedIndex
	const isHighlighted = next.index === next.highlightedIndex
	const wasSelected = prev.product.id === prev.selectedId
	const isSelected = next.product.id === next.selectedId
	return wasHighlighted === isHighlighted && wasSelected === isSelected
})
```

```js
{
  "mount": "ListItem renders: 500",
  "refresh": "ListItem renders: 0",
  "hover row 5": "ListItem renders: 1",
  "hover row 6": "ListItem renders: 2",
  "highlighted": [
    "6"
  ]
}
```

The comparator answers "would this row look different?". Hovering row 5 (from nothing) re-rendered 1 row; moving to row 6 re-rendered 2. But it duplicates the row's logic: if `ListItem` starts showing something new and the comparator isn't updated, the row silently shows stale data.

### 4. Primitive props

```tsx
const PrimitiveItem = memo(function PrimitiveItem({ product, index, isHighlighted, isSelected, onHover, onSelect }: {
	product: Product
	index: number
	isHighlighted: boolean
	isSelected: boolean
	onHover: (index: number) => void
	onSelect: (id: string) => void
}) {
	itemRenders++
	return (
		<li
			data-index={index}
			className={`${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
			onMouseEnter={() => onHover(index)}
			onClick={() => onSelect(product.id)}
		>
			{product.name}
		</li>
	)
})
```

```tsx
{products.map((p, i) => (
	<PrimitiveItem
		key={p.id}
		product={p}
		index={i}
		isHighlighted={i === highlightedIndex}
		isSelected={p.id === selectedId}
		onHover={setHighlightedIndex}
		onSelect={setSelectedId}
	/>
))}
```

```js
{
  "mount": "ListItem renders: 500",
  "refresh": "ListItem renders: 0",
  "hover row 5": "ListItem renders: 1",
  "hover row 6": "ListItem renders: 2",
  "highlighted": [
    "6"
  ]
}
```

Same counts as the comparator, with plain `memo`. The parent computes `isHighlighted` for each row, so each row gets a boolean that only changes when its own highlight does. This is what react.dev recommends over custom comparators.

## How it works

- **Render, reconcile, commit.** A re-render calls the component (render), compares its new elements with the old ones (reconciliation), and touches the DOM only for differences (commit). An "unnecessary" re-render does the first two and commits nothing ([Render and Commit](../../internals/render-and-commit/)).
- **`memo` skips render and reconciliation for that subtree**, but the parent still runs its `.map` and creates 500 elements to compare. For thousands of rows, see [Windowing](../../performance/windowing/).
- **The comparator returns `true` to skip** (props "equal"), the opposite of the old class `shouldComponentUpdate`.
- **Fix slow renders first.** A render that's slow every time it runs is still slow when it does have to run; `memo` only reduces how often.

## Common mistakes

- **A shared value as a prop of every row** (`highlightedIndex`, `selectedId`): every row's props change together. Derive per-row primitives in the parent.
- **Inline callbacks per row** (`onClick={() => select(p.id)}`): new functions every render. Pass a stable setter and the id, as above.
- **A comparator that ignores a prop the row uses.** Stale UI with no warning.
- **`memo` on cheap components with coarse updates.** It's overhead when the whole screen changes anyway.

## Interview Q&A

<details class="qa"><summary>What are the reasons a component re-renders?</summary>

Its state changes, a context it reads changes, or its parent re-renders (props changing is part of that last case). By default every child of a re-rendering parent re-renders. Recorded: "Refresh" rendered all 500 rows.

</details>

<details class="qa"><summary>Why didn't <code>memo</code> help with hover?</summary>

Every row received `highlightedIndex`, which changed, so every row's props differed. Recorded: 500 renders per hover with `memo`.

</details>

<details class="qa"><summary>What's the second argument to <code>memo</code>?</summary>

A comparator `(prevProps, nextProps) => boolean`; `true` means "equal, skip". Recorded: comparing only "was/is highlighted" brought a hover down to 1–2 renders.

</details>

<details class="qa"><summary>Why prefer primitive props over a custom comparator?</summary>

The comparison moves into the parent's data (`isHighlighted={i === highlightedIndex}`), so plain `memo` works and there's no comparator to keep in sync with the component. Recorded: the same 1–2 renders.

</details>

<details class="qa"><summary>Slow render or unnecessary re-render: which first?</summary>

The slow render. Skipping it sometimes still leaves it slow every time it runs.

</details>

## Related

- [Element Optimization](../../performance/element-optimization/): how `memo` compares props.
- [Windowing](../../performance/windowing/): when there are too many rows even with `memo`.
- [React Re-rendering](../../hooks/react-re-rendering/): what triggers renders.

## Sources

- Kent C. Dodds: [Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
- react.dev: [`memo`](https://react.dev/reference/react/memo) (including "Specifying a custom comparison function")
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
