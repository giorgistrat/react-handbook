---
title: "Lifting State"
slug: "lifting-state"
module: "hooks"
order: 3
level: "must"
illus: "chain"
summary: "Move state up so siblings can share it, and back down (colocate) when only one component needs it."
source: "https://react.dev/learn/sharing-state-between-components"
---


## In one minute

Data in React flows down through props, so two sibling components can't share state directly. **Lifting state** moves the `useState` up to their closest common parent, which passes the value (and a way to change it) down to both. The opposite skill is **colocation**: once only one component needs a piece of state, move it back down into that component. Lower state means less code passing props around and fewer components re-rendering when it changes, but the state now lives only as long as that component does.

**You'll be able to:** decide where a piece of state belongs, and predict who re-renders when it changes.

<figure class="fig anim fig-hooks-lift-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Lifted to ProductGrid</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Colocated in Card</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onToggle={() =&gt; setFavorites(toggle(p.id))} /&gt;&quot;,&quot;say&quot;:&quot;Click ♡ on the Trail Backpack. The card calls &lt;code&gt;onToggle&lt;/code&gt;, a function from &lt;code&gt;ProductGrid&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [favorites, setFavorites] = useState([])&quot;,&quot;say&quot;:&quot;The state lives in &lt;code&gt;ProductGrid&lt;/code&gt;, so the re-render starts there. Recorded: the grid and all six cards rendered.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;r-ProductGrid&quot;:&quot;run&quot;,&quot;r-Backpack&quot;:&quot;run&quot;,&quot;r-Other&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;r-ProductGrid&quot;:&quot;ran&quot;,&quot;r-Backpack&quot;:&quot;ran&quot;,&quot;r-Other&quot;:&quot;ran&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;.sort(byFavorite(favorites))&quot;,&quot;say&quot;:&quot;In return, the grid can &lt;b&gt;sort&lt;/b&gt; favorites first: the Backpack moved to the top.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;s-list&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-list&quot;:&quot;Trail Backpack ♥ · Ceramic Mug ♡ · Desk Lamp ♡ …&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Search “mug”, then clear it. The Backpack is filtered out and comes back still ♥, because the grid that holds the state never unmounted.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;s-list&quot;:&quot;ok&quot;,&quot;s-search&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-search&quot;:&quot;Search: mug → (cleared)&quot;,&quot;s-list&quot;:&quot;Trail Backpack ♥ · Ceramic Mug ♡ …&quot;}}]" data-intro="The &lt;code&gt;favorites&lt;/code&gt; list lives in the grid and is passed to each card."><div class="anim-scn-title">Lifted to ProductGrid</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductGrid.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ProductGrid</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> query</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">favorites</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setFavorites</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">([])</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> found</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> searchProducts</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(query)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    .</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">sort</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">byFavorite</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(favorites))</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> found</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">p</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Card</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> key</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">p</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      isFavorite</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">favorites</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">includes</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onToggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setFavorites</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">toggle</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(p</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id))</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  ))</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-list">Ceramic Mug ♡ · Trail Backpack ♡ · Desk Lamp ♡ …</div><div class="an ca-item ca-input" data-k="s-search">Search: (empty)</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">ProductGrid</span><span class="an ca-rstate" data-k="r-ProductGrid">–</span></div><div class="ca-r"><span class="ca-rname">Backpack card</span><span class="an ca-rstate" data-k="r-Backpack">–</span></div><div class="ca-r"><span class="ca-rname">Other cards (5)</span><span class="an ca-rstate" data-k="r-Other">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onToggle={() =&gt; setFavorites(toggle(p.id))} /&gt;</code><span>Click ♡ on the Trail Backpack. The card calls <code>onToggle</code>, a function from <code>ProductGrid</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const [favorites, setFavorites] = useState([])</code><span>The state lives in <code>ProductGrid</code>, so the re-render starts there. Recorded: the grid and all six cards rendered.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>.sort(byFavorite(favorites))</code><span>In return, the grid can <b>sort</b> favorites first: the Backpack moved to the top.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Search “mug”, then clear it. The Backpack is filtered out and comes back still ♥, because the grid that holds the state never unmounted.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button onClick={() =&gt; setIsFavorite(!isFavorite)}&gt;&quot;,&quot;say&quot;:&quot;Click ♡ on the Trail Backpack. The card owns its state.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [isFavorite, setIsFavorite] = useState(false)&quot;,&quot;say&quot;:&quot;The re-render starts at that card. Recorded: one line, &lt;code&gt;Card p3 renders&lt;/code&gt;. Less work and simpler props, but nothing above can sort by favorites.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;s-list&quot;:&quot;upd&quot;,&quot;r-ProductGrid&quot;:&quot;&quot;,&quot;r-Backpack&quot;:&quot;run&quot;,&quot;r-Other&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;s-list&quot;:&quot;Ceramic Mug ♡ · Trail Backpack ♥ · Desk Lamp ♡ …&quot;,&quot;r-ProductGrid&quot;:&quot;–&quot;,&quot;r-Backpack&quot;:&quot;ran&quot;,&quot;r-Other&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Search “mug”: the Backpack’s card unmounts, and its state with it.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-list&quot;:&quot;&quot;,&quot;s-search&quot;:&quot;upd&quot;,&quot;r-ProductGrid&quot;:&quot;&quot;,&quot;r-Backpack&quot;:&quot;del&quot;,&quot;r-Other&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;s-search&quot;:&quot;Search: mug&quot;,&quot;r-ProductGrid&quot;:&quot;–&quot;,&quot;r-Backpack&quot;:&quot;unmounted&quot;,&quot;r-Other&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Clear the search: the card comes back as a &lt;b&gt;new&lt;/b&gt; instance, ♡ again (recorded). Colocated state lives only as long as its component.&quot;,&quot;set&quot;:{&quot;s-search&quot;:&quot;upd&quot;,&quot;s-list&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-search&quot;:&quot;Search: (cleared)&quot;,&quot;s-list&quot;:&quot;Ceramic Mug ♡ · Trail Backpack ♡ · Desk Lamp ♡ …&quot;}}]" data-intro="Each card owns its own &lt;code&gt;isFavorite&lt;/code&gt;."><div class="anim-scn-title">Colocated in Card</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">ProductGrid.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Card</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">isFavorite</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setIsFavorite</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">false</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">li</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">      {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">product</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">name</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setIsFavorite</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">isFavorite)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">        {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">isFavorite </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">?</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '♥'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> :</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '♡'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">li</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-list">Ceramic Mug ♡ · Trail Backpack ♡ · Desk Lamp ♡ …</div><div class="an ca-item ca-input" data-k="s-search">Search: (empty)</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">ProductGrid</span><span class="an ca-rstate" data-k="r-ProductGrid">–</span></div><div class="ca-r"><span class="ca-rname">Backpack card</span><span class="an ca-rstate" data-k="r-Backpack">–</span></div><div class="ca-r"><span class="ca-rname">Other cards (5)</span><span class="an ca-rstate" data-k="r-Other">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button onClick={() =&gt; setIsFavorite(!isFavorite)}&gt;</code><span>Click ♡ on the Trail Backpack. The card owns its state.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const [isFavorite, setIsFavorite] = useState(false)</code><span>The re-render starts at that card. Recorded: one line, <code>Card p3 renders</code>. Less work and simpler props, but nothing above can sort by favorites.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Search “mug”: the Backpack’s card unmounts, and its state with it.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Clear the search: the card comes back as a <b>new</b> instance, ♡ again (recorded). Colocated state lives only as long as its component.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The same heart button with its state in two places (both recorded).</figcaption></figure>

## The example: search + favorites

The search box and the product grid are siblings, so the query lives in their parent:

```tsx
function App({ Grid }: { Grid: (props: { query: string }) => React.ReactNode }) {
	log('App renders')
	const [query, setQuery] = useState('')
	return (
		<>
			<Search query={query} setQuery={setQuery} />
			<Grid query={query} />
		</>
	)
}
```

Each product card has a ♡ button. Where should "is this a favorite" live?

### Lifted into the grid (so it can sort)

```tsx
function GridLifted({ query }: { query: string }) {
	log('  ProductGrid renders')
	const [favorites, setFavorites] = useState<string[]>([])
	const found = searchProducts(query).sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)))
	return (
		<ul>
			{found.map((p) => (
				<CardLifted
					key={p.id}
					product={p}
					isFavorite={favorites.includes(p.id)}
					onToggle={() => setFavorites((f) => (f.includes(p.id) ? f.filter((id) => id !== p.id) : [...f, p.id]))}
				/>
			))}
		</ul>
	)
}

function CardLifted({ product, isFavorite, onToggle }: { product: Product; isFavorite: boolean; onToggle: () => void }) {
	log(`  Card ${product.id} renders`)
	return (
		<li data-id={product.id}>
			{product.name}
			<button onClick={onToggle}>{isFavorite ? '♥' : '♡'}</button>
		</li>
	)
}
```

Clicking ♡ on the Trail Backpack, recorded:

```text
  ProductGrid renders
  Card p3 renders
  Card p1 renders
  Card p2 renders
  Card p4 renders
  Card p5 renders
  Card p6 renders
```

```js
[
  "Trail Backpack♥",
  "Ceramic Mug♡",
  "Wireless Headphones♡",
  "Desk Lamp♡",
  "Bluetooth Speaker♡",
  "Notebook Set♡"
]
```

The grid and all six cards re-rendered, but the grid could sort favorites first. Searching "mug" (which hides the Backpack) and clearing the search again:

```text
Trail Backpack♥
```

Still a favorite: the grid never unmounted.

### Colocated in each card (no sorting)

```tsx
function GridColocated({ query }: { query: string }) {
	log('  ProductGrid renders')
	return (
		<ul>
			{searchProducts(query).map((p) => (
				<CardColocated key={p.id} product={p} />
			))}
		</ul>
	)
}

function CardColocated({ product }: { product: Product }) {
	log(`  Card ${product.id} renders`)
	const [isFavorite, setIsFavorite] = useState(false)
	return (
		<li data-id={product.id}>
			{product.name}
			<button onClick={() => setIsFavorite(!isFavorite)}>{isFavorite ? '♥' : '♡'}</button>
		</li>
	)
}
```

```text
  Card p3 renders
```

One card re-rendered. After hiding and showing it with the search:

```text
Trail Backpack♡
```

The heart reset: the card unmounted when filtered out, and its state went with it.

## How it works

- **Re-renders start where the state lives.** `setFavorites` in the grid re-renders the grid and its children; `setIsFavorite` in a card re-renders that card. Lifting state up widens that circle; colocating narrows it.
- **Lift to the lowest common parent**, not higher. The query lives in `App` because both `Search` and `ProductGrid` need it; favorites didn't need to go to `App`.
- **Effects follow their state.** An effect that syncs a piece of state (like the `popstate` listener for the query) moves with it.
- **Colocation trades lifetime for simplicity.** If a value must survive its component being unmounted (filtered out, a tab switched), keep it higher, or outside React (URL, storage, server).

## Common mistakes

- Lifting everything to the top "just in case", which makes every change re-render the whole page.
- Leaving state lifted after the feature that needed it is gone.
- Duplicating state in parent and child instead of passing it down.

## Interview Q&A

<details class="qa"><summary>What does lifting state mean, and when do you need it?</summary>

Moving state to the closest common parent of the components that need it, then passing it down as props (plus a setter or callback). You need it when siblings must read or change the same value.

</details>

<details class="qa"><summary>Why did favorites have to live in the grid to sort by them?</summary>

Sorting compares every card's favorite status, and only a component that sees all of them can do that. A card can't sort a list it doesn't own.

</details>

<details class="qa"><summary>What is state colocation, and why does it help?</summary>

Keeping state in the lowest component that uses it. Fewer props, simpler parents, and fewer re-renders: recorded, a lifted favorite re-rendered the grid and six cards, a colocated one re-rendered a single card.

</details>

<details class="qa"><summary>What's the downside of colocating?</summary>

State disappears when its component unmounts. Recorded: the colocated Backpack lost its ♥ after being filtered out and back; the lifted one kept it.

</details>

## Related

- [Managing UI State](../../hooks/managing-ui-state/): derived state and controlled inputs.
- [React Re-rendering](../../hooks/react-re-rendering/): why children re-render with their parent.

## Sources

- react.dev: [Sharing state between components](https://react.dev/learn/sharing-state-between-components), [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- Kent C. Dodds, [State Colocation will make your React app faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
