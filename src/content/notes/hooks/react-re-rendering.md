---
title: "React Re-rendering"
slug: "react-re-rendering"
module: "hooks"
order: 8
level: "must"
illus: "pipeline"
summary: "What triggers a re-render, why memo fails on new objects, stale closures, and when to use useMemo/useCallback."
source: "https://www.joshwcomeau.com/react/why-react-re-renders/"
---


## In one minute

Every re-render starts with a **state change** (`setState`, `dispatch`, or a context value changing). From there it cascades: a component that re-renders re-renders **all of its children** by default, whether their props changed or not. "Props changed" is not a trigger; the parent rendering is. You can stop the cascade at a child with **`memo`**, which skips the child when every prop is `Object.is`-equal to last time. That only works if the props keep their identity, which is what **`useMemo`** (values) and **`useCallback`** (functions) are for. The same identity rules explain **stale closures**: a function keeps the values of the render that created it.

**You'll be able to:** predict who re-renders, make `memo` actually work when it's worth it, and fix stale closures.

<figure class="fig anim fig-hooks-cascade-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Inline props</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useMemo + useCallback</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button onClick={() =&gt; setCount(c =&gt; c + 1)}&gt;Add ({count})&lt;/button&gt;&quot;,&quot;say&quot;:&quot;A state change in &lt;code&gt;CartPage&lt;/code&gt;: the only real trigger.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;hl&quot;,&quot;s-add&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-add&quot;:&quot;Add (1)&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [count, setCount] = useState(0)&quot;,&quot;say&quot;:&quot;&lt;code&gt;CartPage&lt;/code&gt; runs again.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;s-add&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;r-CartPage&quot;:&quot;run&quot;,&quot;r-Recommendations&quot;:&quot;&quot;,&quot;r-CheckoutButton&quot;:&quot;&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-CartPage&quot;:&quot;ran&quot;,&quot;r-Recommendations&quot;:&quot;–&quot;,&quot;r-CheckoutButton&quot;:&quot;–&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Recommendations options={{ limit: 3 }} /&gt;&quot;,&quot;say&quot;:&quot;It creates a &lt;b&gt;new&lt;/b&gt; &lt;code&gt;options&lt;/code&gt; object and a &lt;b&gt;new&lt;/b&gt; function. &lt;code&gt;memo&lt;/code&gt; compares props with &lt;code&gt;Object.is&lt;/code&gt;, sees “changes”, and renders both anyway.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;r-CartPage&quot;:&quot;run&quot;,&quot;r-Recommendations&quot;:&quot;run&quot;,&quot;r-CheckoutButton&quot;:&quot;run&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-CartPage&quot;:&quot;ran&quot;,&quot;r-Recommendations&quot;:&quot;ran&quot;,&quot;r-CheckoutButton&quot;:&quot;ran&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;&lt;Footer /&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;Footer&lt;/code&gt; isn’t memoized, so it renders whenever its parent does. Recorded: all four rendered; &lt;code&gt;memo&lt;/code&gt; did nothing.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;L5&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;r-CartPage&quot;:&quot;run&quot;,&quot;r-Recommendations&quot;:&quot;run&quot;,&quot;r-CheckoutButton&quot;:&quot;run&quot;,&quot;r-Footer&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;r-CartPage&quot;:&quot;ran&quot;,&quot;r-Recommendations&quot;:&quot;ran&quot;,&quot;r-CheckoutButton&quot;:&quot;ran&quot;,&quot;r-Footer&quot;:&quot;ran&quot;}}]" data-intro="An object and an arrow function written inline."><div class="anim-scn-title">Inline props</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">CartPage.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> CartPage</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setCount</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">0</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setCount</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">c</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> c </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">+</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Add (</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Recommendations</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> options</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> limit</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 3</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CheckoutButton</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onCheckout</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'checkout'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-add">Add (0)</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">CartPage</span><span class="an ca-rstate" data-k="r-CartPage">–</span></div><div class="ca-r"><span class="ca-rname">Recommendations (memo)</span><span class="an ca-rstate" data-k="r-Recommendations">–</span></div><div class="ca-r"><span class="ca-rname">CheckoutButton (memo)</span><span class="an ca-rstate" data-k="r-CheckoutButton">–</span></div><div class="ca-r"><span class="ca-rname">Footer</span><span class="an ca-rstate" data-k="r-Footer">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button onClick={() =&gt; setCount(c =&gt; c + 1)}&gt;Add ({count})&lt;/button&gt;</code><span>A state change in <code>CartPage</code>: the only real trigger.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const [count, setCount] = useState(0)</code><span><code>CartPage</code> runs again.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Recommendations options={{ limit: 3 }} /&gt;</code><span>It creates a <b>new</b> <code>options</code> object and a <b>new</b> function. <code>memo</code> compares props with <code>Object.is</code>, sees “changes”, and renders both anyway.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>&lt;Footer /&gt;</code><span><code>Footer</code> isn’t memoized, so it renders whenever its parent does. Recorded: all four rendered; <code>memo</code> did nothing.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;button onClick={() =&gt; setCount(c =&gt; c + 1)}&gt;Add ({count})&lt;/button&gt;&quot;,&quot;say&quot;:&quot;The same click.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;hl&quot;,&quot;s-add&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-add&quot;:&quot;Add (1)&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const options = useMemo(() =&gt; ({ limit: 3 }), [])&quot;,&quot;say&quot;:&quot;&lt;code&gt;CartPage&lt;/code&gt; runs, but &lt;code&gt;useMemo&lt;/code&gt; and &lt;code&gt;useCallback&lt;/code&gt; return the &lt;b&gt;same&lt;/b&gt; object and function as last time.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;s-add&quot;:&quot;&quot;,&quot;L2&quot;:&quot;hl&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;r-CartPage&quot;:&quot;run&quot;,&quot;r-Recommendations&quot;:&quot;&quot;,&quot;r-CheckoutButton&quot;:&quot;&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-CartPage&quot;:&quot;ran&quot;,&quot;r-Recommendations&quot;:&quot;–&quot;,&quot;r-CheckoutButton&quot;:&quot;–&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Recommendations options={options} /&gt;&quot;,&quot;say&quot;:&quot;Every prop is &lt;code&gt;Object.is&lt;/code&gt;-equal, so &lt;code&gt;memo&lt;/code&gt; skips both children.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L3&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;,&quot;L7&quot;:&quot;hl&quot;,&quot;r-CartPage&quot;:&quot;run&quot;,&quot;r-Recommendations&quot;:&quot;skip&quot;,&quot;r-CheckoutButton&quot;:&quot;skip&quot;,&quot;r-Footer&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;r-CartPage&quot;:&quot;ran&quot;,&quot;r-Recommendations&quot;:&quot;skipped&quot;,&quot;r-CheckoutButton&quot;:&quot;skipped&quot;,&quot;r-Footer&quot;:&quot;–&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;&lt;Footer /&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;Footer&lt;/code&gt; still renders: it has no &lt;code&gt;memo&lt;/code&gt;. Recorded: only &lt;code&gt;CartPage&lt;/code&gt; and &lt;code&gt;Footer&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;&quot;,&quot;L7&quot;:&quot;&quot;,&quot;L8&quot;:&quot;hl&quot;,&quot;r-CartPage&quot;:&quot;run&quot;,&quot;r-Recommendations&quot;:&quot;skip&quot;,&quot;r-CheckoutButton&quot;:&quot;skip&quot;,&quot;r-Footer&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;r-CartPage&quot;:&quot;ran&quot;,&quot;r-Recommendations&quot;:&quot;skipped&quot;,&quot;r-CheckoutButton&quot;:&quot;skipped&quot;,&quot;r-Footer&quot;:&quot;ran&quot;}}]" data-intro="The same props, kept stable between renders."><div class="anim-scn-title">useMemo + useCallback</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">CartPage.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> CartPage</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setCount</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">0</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> options</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useMemo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> limit</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 3</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [])</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> onCheckout</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useCallback</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'checkout'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [])</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setCount</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">c</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> c </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">+</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 1</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Add (</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Recommendations</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> options</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">options</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CheckoutButton</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onCheckout</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">onCheckout</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Footer</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-add">Add (0)</div></div><div class="ca-renders"><div class="ca-title">Rendered this step</div><div class="ca-r"><span class="ca-rname">CartPage</span><span class="an ca-rstate" data-k="r-CartPage">–</span></div><div class="ca-r"><span class="ca-rname">Recommendations (memo)</span><span class="an ca-rstate" data-k="r-Recommendations">–</span></div><div class="ca-r"><span class="ca-rname">CheckoutButton (memo)</span><span class="an ca-rstate" data-k="r-CheckoutButton">–</span></div><div class="ca-r"><span class="ca-rname">Footer</span><span class="an ca-rstate" data-k="r-Footer">–</span></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>&lt;button onClick={() =&gt; setCount(c =&gt; c + 1)}&gt;Add ({count})&lt;/button&gt;</code><span>The same click.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const options = useMemo(() =&gt; ({ limit: 3 }), [])</code><span><code>CartPage</code> runs, but <code>useMemo</code> and <code>useCallback</code> return the <b>same</b> object and function as last time.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Recommendations options={options} /&gt;</code><span>Every prop is <code>Object.is</code>-equal, so <code>memo</code> skips both children.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>&lt;Footer /&gt;</code><span><code>Footer</code> still renders: it has no <code>memo</code>. Recorded: only <code>CartPage</code> and <code>Footer</code>.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>One click on “Add” in a cart page. Who re-renders depends on memo and on whether props keep the same identity (both recorded).</figcaption></figure>

## The example: the cart page

```tsx
function Footer() {
	log('  Footer renders')
	return <footer>Free shipping over $50</footer>
}

const Recommendations = memo(function Recommendations({ options }: { options: { limit: number } }) {
	log(`  Recommendations renders (limit ${options.limit})`)
	return <aside>Top {options.limit} picks</aside>
})

const CheckoutButton = memo(function CheckoutButton({ onCheckout }: { onCheckout: () => void }) {
	log('  CheckoutButton renders')
	return <button onClick={onCheckout}>Checkout</button>
})
```

```tsx
function CartPage({ stable }: { stable: boolean }) {
	const [count, setCount] = useState(0)
	log(`CartPage renders (count ${count})`)

	const inlineOptions = { limit: 3 }
	const memoOptions = useMemo(() => ({ limit: 3 }), [])
	const inlineCheckout = () => log('checkout')
	const memoCheckout = useCallback(() => log('checkout'), [])

	return (
		<>
			<button id="add" onClick={() => setCount((c) => c + 1)}>Add ({count})</button>
			<Recommendations options={stable ? memoOptions : inlineOptions} />
			<CheckoutButton onCheckout={stable ? memoCheckout : inlineCheckout} />
			<Footer />
		</>
	)
}
```

One click on "Add", with the props written inline (`stable = false`):

```text
CartPage renders (count 1)
  Recommendations renders (limit 3)
  CheckoutButton renders
  Footer renders
```

Everything rendered. `Footer` has no `memo`, so it renders with its parent. The two memoized children rendered too: `{ limit: 3 }` and `() => …` are new objects every render, so `memo` saw "changed" props.

With `useMemo` and `useCallback` (`stable = true`):

```text
CartPage renders (count 1)
  Footer renders
```

The memoized children were skipped.

## Primitives vs objects

`Object.is` compares numbers, strings and booleans **by value**, and objects, arrays and functions **by identity**:

```js
Object.is(3, 3)                       // true
Object.is({ limit: 3 }, { limit: 3 }) // false
Object.is(() => {}, () => {})         // false
```

Anything created in a component body is a new object on every render. This one fact explains failing `memo`s, effects that re-run every render ([DOM Refs and Effect Dependencies](../../hooks/dom-refs-and-effect-dependencies/)) and state updates that don't render ([Building a Cart](../../hooks/building-a-cart/)).

## Stale closures

A closure keeps the variables of the scope that created it. In React, each render is a separate call with its own variables, so a function created in render 1 sees render 1's state forever.

```tsx
function Timer({ fixed }: { fixed: boolean }) {
	const [seconds, setSeconds] = useState(0) // one tick every 100 ms
	useEffect(() => {
		const id = setInterval(() => {
			if (fixed) setSeconds((s) => s + 1)
			else setSeconds(seconds + 1) // seconds is always 0 in this closure
		}, 100)
		return () => clearInterval(id)
	}, [])
	return <p id="timer">Ticks: {seconds}</p>
}
```

After one second (a tick every 100 ms):

`setSeconds(seconds + 1)`:

```text
Ticks: 1
```

`setSeconds((s) => s + 1)`:

```text
Ticks: 16
```

The interval was created once (`[]`), so its closure always sees `seconds = 0` and keeps setting `1`. Fixes, in order of preference: an **updater function** (doesn't need the current value), a **reducer** (`dispatch` reads nothing, see [useState vs useReducer](../../hooks/usestate-vs-usereducer/)), adding the value to the **dependencies** (the interval is recreated when it changes), or a **ref** that always holds the latest value.

## Components defined inside components

```tsx
function SearchPage() {
	const [n, setN] = useState(0)
	function SearchBox() {
		// defined inside SearchPage: a new component type on every render
		return <input id="inner" />
	}
	return (
		<>
			<SearchBox />
			<button id="bump" onClick={() => setN(n + 1)}>Re-render ({n})</button>
		</>
	)
}
```

Typed "mug", then clicked "Re-render":

```js
{
  "logs": [],
  "warnings": [],
  "before": "mug",
  "after": ""
}
```

`SearchBox` is a new function on every render of `SearchPage`, so React sees a **different component type** at that position, unmounts the old one and mounts a new one. The typed text is gone. Define components at the top level of the module.

## When to optimize

- Re-renders are normally cheap; most components render in well under a millisecond. Measure first with the **React DevTools Profiler** (enable "Record why each component rendered").
- Reach for `memo` + `useMemo`/`useCallback` when a child is measurably slow and its props can be kept stable. `useMemo` is also for genuinely expensive calculations.
- Often a structural fix is simpler: move state down ([Lifting State](../../hooks/lifting-state/)) or pass slow parts as `children` so they aren't re-created by the state owner.
- The **React Compiler** adds this memoization automatically where it's safe; in projects that use it, hand-written `useMemo`/`useCallback` are rarely needed.
- One big context re-renders every consumer on any change; splitting contexts by how often they change helps (React Performance module).

## Common mistakes

- Believing changed props cause re-renders, or that unchanged props prevent them.
- `memo` on a child that receives inline objects or functions.
- Wrapping everything in `useMemo`/`useCallback` without measuring.
- Effects or intervals with `[]` that read changing state.

## Interview Q&A

<details class="qa"><summary>What causes a component to re-render?</summary>

Its own state changing, its parent re-rendering (children re-render by default), or a context it reads changing. All of these start from some state change; props changing isn't a separate trigger.

</details>

<details class="qa"><summary>Why does <code>memo</code> sometimes not prevent a re-render?</summary>

`memo` compares props with `Object.is`. An object, array or function created during the parent's render is new every time. Recorded: with inline `options` and `onCheckout`, both memoized children rendered; with `useMemo`/`useCallback`, they were skipped.

</details>

<details class="qa"><summary>What is a stale closure in React?</summary>

A function that captured state from the render that created it and keeps using it after the state changed. Recorded: an interval set up once with `[]` stayed at `Ticks: 1`; with an updater function it counted up to 16.

</details>

<details class="qa"><summary>How do you fix a stale closure?</summary>

Use an updater function or a reducer so the code doesn't read the captured value; or list the value in the dependencies so the function is recreated; or keep the latest value in a ref.

</details>

<details class="qa"><summary>What's the difference between <code>useMemo</code> and <code>useCallback</code>?</summary>

`useMemo(() => value, deps)` keeps a computed value; `useCallback(fn, deps)` keeps a function, and equals `useMemo(() => fn, deps)`. Both exist to keep identity (or skip expensive work) between renders.

</details>

<details class="qa"><summary>Why not define a component inside another component?</summary>

Each render creates a new component type, so React remounts it and its state is lost. Recorded: the typed "mug" was empty after one re-render.

</details>

## Related

- [Lifting State](../../hooks/lifting-state/): moving state down to re-render less.
- [Reconciliation](../../internals/reconciliation/) (React Internals): why a new type at the same position remounts.
- React Performance module: memoizing elements, context and lists in depth.

## Sources

- Josh W. Comeau, [Why React re-renders](https://www.joshwcomeau.com/react/why-react-re-renders/), [Understanding useMemo and useCallback](https://www.joshwcomeau.com/react/usememo-and-usecallback/)
- Nadia Makarevich, [React re-renders guide](https://www.developerway.com/posts/react-re-renders-guide)
- Dmitri Pavlutin, [Be aware of stale closures when using React hooks](https://dmitripavlutin.com/react-hooks-stale-closures/)
- react.dev: [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), [`useCallback`](https://react.dev/reference/react/useCallback), [React Compiler](https://react.dev/learn/react-compiler)
