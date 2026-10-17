---
title: "Managing UI State"
slug: "managing-ui-state"
module: "hooks"
order: 0
level: "must"
illus: "list"
summary: "useState, controlled inputs, deriving values instead of storing them twice, and lazy initial state."
source: "https://react.dev/reference/react/useState"
---


## In one minute

`useState` gives a component a value React remembers between renders, plus a function to change it: `const [query, setQuery] = useState('')`. Calling `setQuery` doesn't change `query` in the running code; it asks React to render again, and in that next render `useState` returns the new value. Three habits make state code reliable: make inputs **controlled** (state is written back with `value`), **derive** anything you can compute instead of storing it twice, and pass a **function** to `useState` when the first value is expensive to compute.

**You'll be able to:** wire an input to state correctly, avoid duplicated state, and know when the lazy initializer matters.

<figure class="fig anim fig-hooks-controlled-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">onChange only</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">value + onChange</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onChange={e =&gt; toggle('office', e.target.checked)} /&gt;&quot;,&quot;say&quot;:&quot;The user typed “lamp”, then ticks &lt;b&gt;office&lt;/b&gt;. The checkbox adds the word to the query.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;hl&quot;,&quot;s-office&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-office&quot;:&quot;☑ office&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [query, setQuery] = useState('')&quot;,&quot;say&quot;:&quot;State changes to &lt;code&gt;\&quot;lamp office\&quot;&lt;/code&gt; and React re-renders.&quot;,&quot;set&quot;:{&quot;L5&quot;:&quot;&quot;,&quot;s-office&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;s-results&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-results&quot;:&quot;Results for “lamp office”&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;input onChange={e =&gt; setQuery(e.target.value)} /&gt;&quot;,&quot;say&quot;:&quot;Nothing tells the input what to show, so it keeps its own text. Recorded: the box still read &lt;code&gt;\&quot;lamp\&quot;&lt;/code&gt; while the results used &lt;code&gt;\&quot;lamp office\&quot;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-results&quot;:&quot;&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;s-input&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;lamp&quot;}},{&quot;fn&quot;:&quot;&lt;input type=\&quot;checkbox\&quot; name=\&quot;office\&quot;&quot;,&quot;say&quot;:&quot;It fails the other way too: typing “audio” didn’t tick the audio checkbox (recorded: &lt;code&gt;audioChecked: false&lt;/code&gt;). Two copies of the truth, already out of sync.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;s-audio&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-audio&quot;:&quot;☐ audio (typed, but not ticked)&quot;}}]" data-intro="The input reports its changes, but nothing writes &lt;code&gt;query&lt;/code&gt; back into it."><div class="anim-scn-title">onChange only</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Search.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Search</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">query</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setQuery</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">''</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onChange</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">e</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setQuery</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(e</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">target</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">value)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"checkbox"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"office"</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onChange</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">e</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> toggle</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'office'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> e</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">target</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">checked)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Results</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> query</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">query</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-input" data-k="s-input">lamp</div><div class="an ca-item ca-text" data-k="s-office">☐ office</div><div class="an ca-item ca-text" data-k="s-audio">☐ audio</div><div class="an ca-item ca-muted" data-k="s-results">Results for “lamp”: 1 product</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onChange={e =&gt; toggle('office', e.target.checked)} /&gt;</code><span>The user typed “lamp”, then ticks <b>office</b>. The checkbox adds the word to the query.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const [query, setQuery] = useState('')</code><span>State changes to <code>"lamp office"</code> and React re-renders.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;input onChange={e =&gt; setQuery(e.target.value)} /&gt;</code><span>Nothing tells the input what to show, so it keeps its own text. Recorded: the box still read <code>"lamp"</code> while the results used <code>"lamp office"</code>.</span></li><li><code>&lt;input type="checkbox" name="office"</code><span>It fails the other way too: typing “audio” didn’t tick the audio checkbox (recorded: <code>audioChecked: false</code>). Two copies of the truth, already out of sync.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onChange={e =&gt; toggle('office', e.target.checked)} /&gt;&quot;,&quot;say&quot;:&quot;The same click on &lt;b&gt;office&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;hl&quot;,&quot;s-office&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-office&quot;:&quot;☑ office&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const [query, setQuery] = useState('')&quot;,&quot;say&quot;:&quot;The same state change.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;&quot;,&quot;s-office&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;s-results&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-results&quot;:&quot;Results for “lamp office”&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;input value={query}&quot;,&quot;say&quot;:&quot;Now every render &lt;b&gt;writes the state back&lt;/b&gt;: the input shows &lt;code&gt;query&lt;/code&gt;, and each checkbox is computed from its words.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;s-results&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Recorded: the box read &lt;code&gt;\&quot;lamp office\&quot;&lt;/code&gt;, and typing “audio” ticked the audio checkbox. One source of truth.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;L7&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;ok&quot;,&quot;s-audio&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;lamp office&quot;,&quot;s-audio&quot;:&quot;☑ audio (follows the text)&quot;}}]" data-intro="The same component with &lt;code&gt;value={query}&lt;/code&gt; and a derived &lt;code&gt;checked&lt;/code&gt;."><div class="anim-scn-title">value + onChange</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Search.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Search</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">query</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setQuery</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">''</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> words</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> query</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">split</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">' '</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> value</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">query</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onChange</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">e</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setQuery</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(e</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">target</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">value)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"checkbox"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> name</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"office"</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      checked</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">words</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">includes</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'office'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF">      onChange</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">e</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> toggle</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'office'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> e</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">target</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">checked)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Results</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> query</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">query</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-input" data-k="s-input">lamp</div><div class="an ca-item ca-text" data-k="s-office">☐ office</div><div class="an ca-item ca-text" data-k="s-audio">☐ audio</div><div class="an ca-item ca-muted" data-k="s-results">Results for “lamp”: 1 product</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onChange={e =&gt; toggle('office', e.target.checked)} /&gt;</code><span>The same click on <b>office</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const [query, setQuery] = useState('')</code><span>The same state change.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;input value={query}</code><span>Now every render <b>writes the state back</b>: the input shows <code>query</code>, and each checkbox is computed from its words.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Recorded: the box read <code>"lamp office"</code>, and typing “audio” ticked the audio checkbox. One source of truth.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A search box plus category checkboxes that edit the same query. An input is controlled when every render tells it what to show (both versions recorded).</figcaption></figure>

## The example: product search with category filters

The product store's search box narrows products by name or category. Ticking a category checkbox adds its name to the query (`"lamp office"`).

### First attempt: onChange only

```tsx
function SearchUncontrolled() {
	const [query, setQuery] = useState('')
	function toggle(category: string, checked: boolean) {
		const words = query.split(' ').filter((w) => w && w !== category)
		setQuery([...words, ...(checked ? [category] : [])].join(' '))
	}
	return (
		<>
			<input id="search" type="search" onChange={(e) => setQuery(e.currentTarget.value)} />
			{categories.map((c) => (
				<label key={c}>
					<input type="checkbox" name={c} onChange={(e) => toggle(c, e.currentTarget.checked)} /> {c}
				</label>
			))}
			<Results query={query} />
		</>
	)
}
```

The recorder typed "lamp", ticked **office**, then replaced the text with "audio":

```js
{
  "input": "lamp",
  "officeChecked": true,
  "results": "1 products: Desk Lamp"
}
```

```js
{
  "audioChecked": false,
  "results": "2 products: Wireless Headphones, Bluetooth Speaker"
}
```

State and screen disagree: the results use `"lamp office"`, but the box still shows `"lamp"`; and typing "audio" doesn't tick the audio checkbox. The DOM elements keep their own values, and React only *hears* about changes.

### Controlled and derived

```tsx
function SearchControlled() {
	const [query, setQuery] = useState('')
	const words = query.split(' ') // derived on every render
	function toggle(category: string, checked: boolean) {
		const rest = words.filter((w) => w && w !== category)
		setQuery([...rest, ...(checked ? [category] : [])].join(' '))
	}
	return (
		<>
			<input id="search" type="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
			{categories.map((c) => (
				<label key={c}>
					<input
						type="checkbox"
						name={c}
						checked={words.includes(c)}
						onChange={(e) => toggle(c, e.currentTarget.checked)}
					/>{' '}
					{c}
				</label>
			))}
			<Results query={query} />
		</>
	)
}
```

```js
{
  "input": "lamp office",
  "officeChecked": true,
  "results": "1 products: Desk Lamp"
}
```

```js
{
  "audioChecked": true,
  "results": "2 products: Wireless Headphones, Bluetooth Speaker"
}
```

Two changes fixed both problems:

- **`value={query}`** makes the input controlled: every render writes the state back into it. The browser shows what React says.
- **`checked={words.includes(c)}`** derives the checkboxes from `query` instead of giving each one its own `useState`. There's one source of truth; the checkboxes can't drift from it because they're recomputed on every render.

## Reading the first value from the URL

A shared link like `?query=mug` should pre-fill the search:

```tsx
function getQueryParam() {
	log('getQueryParam() runs')
	return new URLSearchParams(window.location.search).get('query') ?? ''
}

function SearchEager() {
	const [query, setQuery] = useState(getQueryParam()) // called on every render
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}

function SearchLazy() {
	const [query, setQuery] = useState(getQueryParam) // React calls it once
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}
```

The recorder opened `?query=mug` and typed " xl" (three keystrokes, three re-renders). How often `getQueryParam` ran:

`useState(getQueryParam())`:

```text
getQueryParam() runs
getQueryParam() runs
getQueryParam() runs
getQueryParam() runs
```

`useState(getQueryParam)`:

```text
getQueryParam() runs
```

`useState(getQueryParam())` calls the function on every render and throws the result away after the first. Passing the function itself lets React call it once, on mount. That matters for expensive work (parsing `localStorage`, building a big object); for `useState('')` or `useState(0)` it doesn't.

## How it works

- **React stores state per component instance, in call order.** Each `useState` call takes the next slot in a list React keeps for this component. That's why hooks can't be called conditionally or in loops: skip one call and every later hook reads the wrong slot. ([Hooks Under the Hood](../../internals/hooks-under-the-hood/) shows the real data structure.)
- **`setX` schedules, it doesn't assign.** Inside the same handler, `query` still has the old value. The new value arrives in the next render.
- **Controlled needs both halves.** `value` without `onChange` freezes the field ([Inputs](../../fundamentals/inputs/)); `onChange` without `value` leaves the DOM in charge.
- **Initializers must be pure.** In development Strict Mode, React calls them twice to catch side effects.

## Common mistakes

- Copying a prop or another state value into its own `useState` "to keep it handy". Compute it during render instead.
- `useState(expensiveCall())` when `useState(expensiveCall)` or `useState(() => expensiveCall(arg))` was meant.
- Reading state right after setting it and expecting the new value.

## Interview Q&A

<details class="qa"><summary>What does <code>useState</code> give you?</summary>

The current value and a setter. React keeps the value outside the function, so it survives the function being called again on every render; calling the setter schedules a render in which `useState` returns the new value.

</details>

<details class="qa"><summary>What makes an input "controlled"?</summary>

Passing `value` (or `checked`) from state together with an `onChange` that updates that state. Every render writes the state into the DOM, so React is the single source of truth. Recorded: with `onChange` only, ticking "office" changed the query to `"lamp office"` while the box still showed `"lamp"`; with `value={query}` the box showed `"lamp office"`.

</details>

<details class="qa"><summary>Why derive values instead of storing them in more state?</summary>

A second piece of state is a second copy that must be kept in sync by hand. If a value can be computed from existing state or props (`words.includes('audio')`), compute it during render: it can never be out of date. Recorded: the derived audio checkbox ticked itself when "audio" was typed.

</details>

<details class="qa"><summary>What's the difference between <code>useState(fn())</code> and <code>useState(fn)</code>?</summary>

`useState(fn())` calls `fn` on every render and uses the result only the first time. `useState(fn)` hands React the function, which it calls once, on mount. Recorded: four calls vs one over the same three keystrokes.

</details>

<details class="qa"><summary>Why can't hooks be called conditionally?</summary>

React matches each hook call to its stored state by order. If a hook is skipped on one render, every hook after it gets another hook's state.

</details>

## Related

- [Side Effects](../../hooks/side-effects/): keeping the query in sync with the back button.
- [Inputs](../../fundamentals/inputs/) (Fundamentals): `value` vs `defaultValue`.
- [Hooks Under the Hood](../../internals/hooks-under-the-hood/) (React Internals): the hook list and update queue.

## Sources

- react.dev: [`useState`](https://react.dev/reference/react/useState), [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure), [Avoiding recreating the initial state](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)
- Shawn Wang, [Getting Closure on Hooks](https://www.swyx.io/getting-closure-on-hooks/)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
