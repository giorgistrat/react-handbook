---
title: "Composition and Layout Components"
slug: "composition"
module: "patterns"
order: 0
level: "must"
illus: "list"
summary: "Pass finished elements, not data, through components that only lay things out."
source: "https://kentcdodds.com/blog/prop-drilling"
---


## In one minute

**Prop drilling** is passing a prop through components that don't use it, so that a component further down can. It often happens with **layout components**: a `Nav`, a `Main`, a `Footer` whose only job is to decide *where* things go. The fix is to stop passing them data and pass them **finished elements** instead. The component that owns the data builds the element (`<img src={user.avatar} />`), and the layout component just places it. For one region that's `children`; for several regions, named props like `sidebar` and `content`.

**You'll be able to:** spot a layout component that's forwarding data, and turn it into one that takes elements.

<figure class="fig anim fig-patterns-composition-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Data drilled</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Elements passed</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [user] = useState(sam)&quot;,&quot;say&quot;:&quot;&lt;code&gt;App&lt;/code&gt; owns the user, the products and the selected product.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Nav user={user} /&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;Nav&lt;/code&gt; only places an avatar, yet it has to take the whole &lt;code&gt;user&lt;/code&gt; to build it.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;r-Nav&quot;:&quot;upd&quot;,&quot;r-Main&quot;:&quot;&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-Nav&quot;:&quot;user&quot;,&quot;r-Main&quot;:&quot;–&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Main products={products} selected={selected}&quot;,&quot;say&quot;:&quot;&lt;code&gt;Main&lt;/code&gt; only puts two areas side by side, yet it receives three props it just passes on.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;r-Nav&quot;:&quot;upd&quot;,&quot;r-Main&quot;:&quot;upd&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-Nav&quot;:&quot;user&quot;,&quot;r-Main&quot;:&quot;products, selected, onSelect&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Footer user={user} /&gt;&quot;,&quot;say&quot;:&quot;Same for &lt;code&gt;Footer&lt;/code&gt;. Every layout component now depends on data it doesn’t use: change &lt;code&gt;User&lt;/code&gt; and their types change too.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;L6&quot;:&quot;&quot;,&quot;L7&quot;:&quot;hl&quot;,&quot;r-Nav&quot;:&quot;upd&quot;,&quot;r-Main&quot;:&quot;upd&quot;,&quot;r-Footer&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;r-Nav&quot;:&quot;user&quot;,&quot;r-Main&quot;:&quot;products, selected, onSelect&quot;,&quot;r-Footer&quot;:&quot;user&quot;}}]" data-intro="Layout components receive the data and pass it on."><div class="anim-scn-title">Data drilled</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">App.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> App</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">user</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(sam)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">selected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setSelected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#D20F39;--shiki-dark:#F38BA8">null</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Nav</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> user</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">user</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Main</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> products</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">products</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> selected</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">selected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onSelect</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setSelected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Footer</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> user</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">user</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Nav</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> user</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">nav</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">>&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">img</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> src</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">user</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">avatar</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> />&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">nav</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-renders"><div class="ca-title">Props received (recorded)</div><div class="ca-r"><span class="ca-rname">Nav</span><span class="an ca-rstate" data-k="r-Nav">–</span></div><div class="ca-r"><span class="ca-rname">Main</span><span class="an ca-rstate" data-k="r-Main">–</span></div><div class="ca-r"><span class="ca-rname">Footer</span><span class="an ca-rstate" data-k="r-Footer">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>const [user] = useState(sam)</code><span><code>App</code> owns the user, the products and the selected product.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Nav user={user} /&gt;</code><span><code>Nav</code> only places an avatar, yet it has to take the whole <code>user</code> to build it.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Main products={products} selected={selected}</code><span><code>Main</code> only puts two areas side by side, yet it receives three props it just passes on.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Footer user={user} /&gt;</code><span>Same for <code>Footer</code>. Every layout component now depends on data it doesn’t use: change <code>User</code> and their types change too.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [user] = useState(sam)&quot;,&quot;say&quot;:&quot;The same state, in the same place.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Nav avatar={&lt;img src={user.avatar} /&gt;} /&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;App&lt;/code&gt; builds the avatar element itself, where &lt;code&gt;user&lt;/code&gt; lives, and hands &lt;code&gt;Nav&lt;/code&gt; the finished element.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;r-Nav&quot;:&quot;upd&quot;,&quot;r-Main&quot;:&quot;&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-Nav&quot;:&quot;avatar&quot;,&quot;r-Main&quot;:&quot;–&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;sidebar={&lt;ProductList onSelect={setSelected} /&gt;}&quot;,&quot;say&quot;:&quot;Two areas, two named element props. &lt;code&gt;Main&lt;/code&gt; only decides where they go.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;L7&quot;:&quot;hl&quot;,&quot;r-Nav&quot;:&quot;upd&quot;,&quot;r-Main&quot;:&quot;upd&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-Nav&quot;:&quot;avatar&quot;,&quot;r-Main&quot;:&quot;sidebar, content&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Footer&gt;Happy shopping, {user.name}!&lt;/Footer&gt;&quot;,&quot;say&quot;:&quot;One area: plain &lt;code&gt;children&lt;/code&gt;. Recorded: no layout component received any data.&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;&quot;,&quot;L7&quot;:&quot;&quot;,&quot;L8&quot;:&quot;hl&quot;,&quot;r-Nav&quot;:&quot;upd&quot;,&quot;r-Main&quot;:&quot;upd&quot;,&quot;r-Footer&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;r-Nav&quot;:&quot;avatar&quot;,&quot;r-Main&quot;:&quot;sidebar, content&quot;,&quot;r-Footer&quot;:&quot;children&quot;}}]" data-intro="Layout components receive finished elements."><div class="anim-scn-title">Elements passed</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">App.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> App</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">user</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(sam)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">selected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setSelected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#D20F39;--shiki-dark:#F38BA8">null</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Nav</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> avatar</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">img</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> src</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">user</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">avatar</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Main</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      sidebar</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ProductList</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onSelect</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">setSelected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      content</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ProductDetails</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">selected</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Happy shopping, </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">user</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">name</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">!</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Nav</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> avatar</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">nav</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">avatar</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">nav</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-renders"><div class="ca-title">Props received (recorded)</div><div class="ca-r"><span class="ca-rname">Nav</span><span class="an ca-rstate" data-k="r-Nav">–</span></div><div class="ca-r"><span class="ca-rname">Main</span><span class="an ca-rstate" data-k="r-Main">–</span></div><div class="ca-r"><span class="ca-rname">Footer</span><span class="an ca-rstate" data-k="r-Footer">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>const [user] = useState(sam)</code><span>The same state, in the same place.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Nav avatar={&lt;img src={user.avatar} /&gt;} /&gt;</code><span><code>App</code> builds the avatar element itself, where <code>user</code> lives, and hands <code>Nav</code> the finished element.</span></li><li><span class="anim-phase ph-render">render phase</span><code>sidebar={&lt;ProductList onSelect={setSelected} /&gt;}</code><span>Two areas, two named element props. <code>Main</code> only decides where they go.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Footer&gt;Happy shopping, {user.name}!&lt;/Footer&gt;</code><span>One area: plain <code>children</code>. Recorded: no layout component received any data.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A product page: a nav bar with the shopper’s avatar, a product list next to the selected product’s details, and a footer. Which props does each layout component receive? (Both versions recorded.)</figcaption></figure>

## The example: the product page

The page has a nav bar with the shopper's avatar, a main area with a product list and the selected product's details, and a footer greeting. `App` owns the user, the products and the selection.

### 1. Data drilled through the layout

```tsx
function AppDrilled() {
	const [user] = useState<User>({ name: 'Sam', avatar: '/logo.svg' })
	const [selected, setSelected] = useState<Product | null>(null)
	return (
		<>
			<NavDrilled user={user} />
			<MainDrilled products={products} selected={selected} onSelect={setSelected} />
			<FooterDrilled user={user} />
		</>
	)
}

function NavDrilled(p: { user: User }) {
	props('Nav', p)
	return <nav><img src={p.user.avatar} alt={`${p.user.name}'s profile`} /></nav>
}

function MainDrilled(p: { products: Product[]; selected: Product | null; onSelect: (p: Product) => void }) {
	props('Main', p)
	return (
		<main>
			<ProductList products={p.products} onSelect={p.onSelect} />
			<ProductDetails product={p.selected} />
		</main>
	)
}

function FooterDrilled(p: { user: User }) {
	props('Footer', p)
	return <footer>Happy shopping, {p.user.name}!</footer>
}
```

What each layout component received:

```text
Nav got: user
Main got: products, selected, onSelect
Footer got: user
```

`Nav` and `Footer` take the whole `user` to show an image and a name. `Main` takes three props it never reads, only passes on.

### 2. Elements built where the data is

```tsx
function AppComposed() {
	const [user] = useState<User>({ name: 'Sam', avatar: '/logo.svg' })
	const [selected, setSelected] = useState<Product | null>(null)
	return (
		<>
			<Nav avatar={<img src={user.avatar} alt={`${user.name}'s profile`} />} />
			<Main
				sidebar={<ProductList products={products} onSelect={setSelected} />}
				content={<ProductDetails product={selected} />}
			/>
			<Footer>Happy shopping, {user.name}!</Footer>
		</>
	)
}

function Nav(p: { avatar: ReactNode }) {
	props('Nav', p)
	return <nav>{p.avatar}</nav>
}

function Main(p: { sidebar: ReactNode; content: ReactNode }) {
	props('Main', p)
	return (
		<main>
			{p.sidebar}
			{p.content}
		</main>
	)
}

function Footer(p: { children: ReactNode }) {
	props('Footer', p)
	return <footer>{p.children}</footer>
}
```

```text
Nav got: avatar
Main got: sidebar, content
Footer got: children
```

None of the layout components sees `user`, the products or `setSelected` any more. Both versions behave the same (clicking Desk Lamp showed `Desk Lamp: $39.00` in each). What changed is the **dependencies**: if `User` gains a field, or the list needs a new prop, only `App` and the component that actually uses it change.

The components that really *use* the data, `ProductList` and `ProductDetails`, still take normal props. The pattern is for the components **in between**.

## How it works

- **A JSX element is just a value.** `<img … />` is an object you can store in a variable or pass as a prop ([Using JSX](../../fundamentals/using-jsx/)). The layout component renders it with `{avatar}`, wherever it wants.
- **`children` is the one-slot case.** `<Footer>Happy shopping</Footer>` is `Footer({ children: 'Happy shopping' })`. Use named element props (`sidebar`, `content`) only when there's more than one region.
- **State doesn't move.** `selected` still lives in `App`. Composition changes how the pieces that read it get to their place, not where it's stored.
- **A performance bonus:** an element passed in from above is the same object when only the layout component re-renders, so React can skip it. That's covered in the Performance module.

## Common mistakes

- **Reaching for context first.** Context is for values many unrelated components need (theme, user). If one piece of UI just needs to be *placed* somewhere, pass the element.
- **Turning every prop into an element prop.** A component that reads and branches on data (like `ProductDetails` checking whether a product is selected) should take the data.
- **Ten named slots.** If a layout takes so many element props that it's hard to read, look at [Compound Components](../../patterns/compound-components/) or [The Slots Pattern](../../patterns/slots/).

## Interview Q&A

<details class="qa"><summary>What is prop drilling, and why is it a problem?</summary>

Passing props through components that don't use them, just to reach a descendant. Every component in the chain then depends on data it doesn't care about, so changes to that data ripple through all of them. Recorded: `Main` received `products, selected, onSelect` and used none of them.

</details>

<details class="qa"><summary>How does composition fix it?</summary>

Build the element where the data lives and pass the element down. Layout components take `ReactNode` props (or `children`) and only decide where to render them. Recorded: `Nav` got `avatar`, `Main` got `sidebar, content`, `Footer` got `children`: no data at all.

</details>

<details class="qa"><summary>When do you use <code>children</code> vs named element props?</summary>

`children` when there's one region to fill. Named props like `sidebar` and `content` when a layout has several independent regions.

</details>

<details class="qa"><summary>Isn't this just context with extra steps?</summary>

No. Context shares a value with many components implicitly. Composition places a specific piece of UI. Reach for composition first: it adds no provider, no hook, and no extra re-renders.

</details>

<details class="qa"><summary>When does it stop paying off?</summary>

When a layout component's list of element props gets long and hard to follow. Then the pieces often belong together as compound components or slots.

</details>

## Related

- [Custom Components](../../fundamentals/custom-components/): props and `children`.
- [Compound Components](../../patterns/compound-components/) and [The Slots Pattern](../../patterns/slots/): composition with implicit wiring.
- [Context with use](../../apis/context-with-use/): the alternative for widely shared values.

## Sources

- Kent C. Dodds: [Prop drilling](https://kentcdodds.com/blog/prop-drilling), [One React mistake that's slowing you down](https://www.epicreact.dev/one-react-mistake-thats-slowing-you-down)
- react.dev: [Passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
