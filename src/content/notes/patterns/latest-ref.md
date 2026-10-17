---
title: "The Latest Ref Pattern"
slug: "latest-ref"
module: "patterns"
order: 1
level: "good"
illus: "loop"
summary: "A function built once that still calls the newest callback: debounce done right, and useEffectEvent."
source: "https://epicreact.dev/the-latest-ref-pattern-in-react"
---


## In one minute

Each render's functions see **that render's** props and state. Usually that's a feature: an async handler can't suddenly see values from a later render. But some functions are **created once and called much later**: a debounced save, a timer callback, a subscription. They need the *latest* values when they run. The latest ref pattern keeps the newest callback in a ref (`callbackRef.current = callback` after every render), and the long-lived function calls `callbackRef.current(...)` at call time. Its identity stays stable, but it always runs the newest code. Inside effects, React 19.2's `useEffectEvent` does the same job for you.

**You'll be able to:** write a `useDebounce` hook that neither fires too often nor saves stale values, and know when to use `useEffectEvent` instead.

<figure class="fig anim fig-patterns-latest-ref-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">[callback, delay]</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">[delay]</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Latest ref</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;&quot;,&quot;say&quot;:&quot;The first key, “G”, starts a 300 ms timer inside the debounced function.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;hl&quot;,&quot;s-input&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;G&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;[callback, delay],&quot;,&quot;say&quot;:&quot;The state change re-renders the note. &lt;code&gt;saveNote&lt;/code&gt; is a new function, so &lt;code&gt;useMemo&lt;/code&gt; builds a &lt;b&gt;new&lt;/b&gt; debounced function, with its own, empty timer.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;&quot;,&quot;L10&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;&quot;,&quot;say&quot;:&quot;“i”, “f”, “t”: each key calls the newest function, which can’t cancel the timers the older ones started.&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;s-input&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;Gift&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;const saveNote = text =&gt; log(`saved \&quot;${text}\&quot; for ${product}`)&quot;,&quot;say&quot;:&quot;300 ms later, four timers fire.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;&quot;,&quot;L2&quot;:&quot;hl&quot;,&quot;c-0&quot;:&quot;new&quot;,&quot;c-1&quot;:&quot;new&quot;,&quot;c-2&quot;:&quot;new&quot;,&quot;c-3&quot;:&quot;new&quot;},&quot;txt&quot;:{}}]" data-intro="Rebuild the debounced function whenever the callback changes."><div class="anim-scn-title">[callback, delay]</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftNote.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> GiftNote</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setProduct</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'Ceramic Mug'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> saveNote</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> text</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`saved "</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">text</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">" for </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> debouncedSave</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useDebounce</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(saveNote</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 300</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onChange</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">e</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> debouncedSave</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(e</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">target</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">value)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useDebounce</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">callback</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> delay</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useMemo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> debounce</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(callback</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> delay)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    [callback</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> delay]</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-muted" data-k="s-product">Product: Desk Lamp (picked first)</div><div class="an ca-item ca-input" data-k="s-input"></div></div><div class="ca-console"><div class="ca-title">Saved (recorded)</div><div class="an ca-log" data-k="c-0" data-s="ghost">saved "G" for Desk Lamp</div><div class="an ca-log" data-k="c-1" data-s="ghost">saved "Gi" for Desk Lamp</div><div class="an ca-log" data-k="c-2" data-s="ghost">saved "Gif" for Desk Lamp</div><div class="an ca-log" data-k="c-3" data-s="ghost">saved "Gift" for Desk Lamp</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;</code><span>The first key, “G”, starts a 300 ms timer inside the debounced function.</span></li><li><span class="anim-phase ph-render">render phase</span><code>[callback, delay],</code><span>The state change re-renders the note. <code>saveNote</code> is a new function, so <code>useMemo</code> builds a <b>new</b> debounced function, with its own, empty timer.</span></li><li><span class="anim-phase ph-event">event</span><code>return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;</code><span>“i”, “f”, “t”: each key calls the newest function, which can’t cancel the timers the older ones started.</span></li><li><span class="anim-phase ph-effect">effects</span><code>const saveNote = text =&gt; log(`saved "${text}" for ${product}`)</code><span>300 ms later, four timers fire.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;[delay], // callback left out&quot;,&quot;say&quot;:&quot;The debounced function is built &lt;b&gt;once&lt;/b&gt;, so the timer is reused and cancelled correctly…&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;&quot;,&quot;say&quot;:&quot;Typing “Gift” restarts the same timer each time.&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;s-input&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;Gift&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;const saveNote = text =&gt; log(`saved \&quot;${text}\&quot; for ${product}`)&quot;,&quot;say&quot;:&quot;…but it wraps the &lt;code&gt;saveNote&lt;/code&gt; from the &lt;b&gt;first&lt;/b&gt; render, whose &lt;code&gt;product&lt;/code&gt; was still “Ceramic Mug”. One save, for the wrong product: a stale closure.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;&quot;,&quot;L2&quot;:&quot;hl&quot;,&quot;c-0&quot;:&quot;new&quot;},&quot;txt&quot;:{}}]" data-intro="Build the debounced function once, around the first callback."><div class="anim-scn-title">[delay]</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftNote.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> GiftNote</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setProduct</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'Ceramic Mug'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> saveNote</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> text</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`saved "</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">text</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">" for </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> debouncedSave</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useDebounce</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(saveNote</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 300</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onChange</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">e</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> debouncedSave</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(e</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">target</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">value)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useDebounce</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">callback</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> delay</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useMemo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> debounce</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(callback</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> delay)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    [delay]</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic"> // callback left out</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-muted" data-k="s-product">Product: Desk Lamp (picked first)</div><div class="an ca-item ca-input" data-k="s-input"></div></div><div class="ca-console"><div class="ca-title">Saved (recorded)</div><div class="an ca-log" data-k="c-0" data-s="ghost">saved "Gift" for Ceramic Mug</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>[delay], // callback left out</code><span>The debounced function is built <b>once</b>, so the timer is reused and cancelled correctly…</span></li><li><span class="anim-phase ph-event">event</span><code>return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;</code><span>Typing “Gift” restarts the same timer each time.</span></li><li><span class="anim-phase ph-effect">effects</span><code>const saveNote = text =&gt; log(`saved "${text}" for ${product}`)</code><span>…but it wraps the <code>saveNote</code> from the <b>first</b> render, whose <code>product</code> was still “Ceramic Mug”. One save, for the wrong product: a stale closure.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;useEffect(() =&gt; { callbackRef.current = callback })&quot;,&quot;say&quot;:&quot;After every render, an effect stores the newest &lt;code&gt;saveNote&lt;/code&gt; in a ref.&quot;,&quot;set&quot;:{&quot;L9&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;&quot;,&quot;say&quot;:&quot;The debounced function is built once, so each key restarts the same timer.&quot;,&quot;set&quot;:{&quot;L9&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;s-input&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;Gift&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;() =&gt; debounce((...args) =&gt; callbackRef.current(...args), delay),&quot;,&quot;say&quot;:&quot;When the timer fires, it reads the ref &lt;b&gt;at that moment&lt;/b&gt;: the latest &lt;code&gt;saveNote&lt;/code&gt;, which knows the product is the Desk Lamp.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;&quot;,&quot;L11&quot;:&quot;hl&quot;,&quot;c-0&quot;:&quot;new&quot;},&quot;txt&quot;:{}}]" data-intro="Build it once, and read the newest callback from a ref."><div class="anim-scn-title">Latest ref</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftNote.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> GiftNote</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setProduct</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">'Ceramic Mug'</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> saveNote</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> text</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`saved "</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">text</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">" for </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">product</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> debouncedSave</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useDebounce</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(saveNote</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> 300</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onChange</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">e</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> debouncedSave</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(e</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">target</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">value)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useDebounce</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">callback</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> delay</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> callbackRef</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useRef</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(callback)</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  useEffect</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> callbackRef</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">current </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> callback </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useMemo</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> debounce</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> callbackRef</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">current</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">args)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> delay)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    [delay]</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-muted" data-k="s-product">Product: Desk Lamp (picked first)</div><div class="an ca-item ca-input" data-k="s-input"></div></div><div class="ca-console"><div class="ca-title">Saved (recorded)</div><div class="an ca-log" data-k="c-0" data-s="ghost">saved "Gift" for Desk Lamp</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-effect">effects</span><code>useEffect(() =&gt; { callbackRef.current = callback })</code><span>After every render, an effect stores the newest <code>saveNote</code> in a ref.</span></li><li><span class="anim-phase ph-event">event</span><code>return &lt;input onChange={e =&gt; debouncedSave(e.target.value)} /&gt;</code><span>The debounced function is built once, so each key restarts the same timer.</span></li><li><span class="anim-phase ph-effect">effects</span><code>() =&gt; debounce((...args) =&gt; callbackRef.current(...args), delay),</code><span>When the timer fires, it reads the ref <b>at that moment</b>: the latest <code>saveNote</code>, which knows the product is the Desk Lamp.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A gift note saves itself 300 ms after you stop typing. The shopper picks “Desk Lamp”, then types “Gift” quickly (all three hooks recorded).</figcaption></figure>

## The example: a debounced gift note

The cart has a gift note field that saves itself 300 ms after you stop typing. The save also needs to know which product the note is for. The shopper picks "Desk Lamp", then types "Gift" quickly.

```tsx
function debounce<A extends unknown[]>(fn: Fn<A>, ms: number): Fn<A> {
	let timer: ReturnType<typeof setTimeout> | undefined
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), ms)
	}
}
```

```tsx
function GiftNote({ useDebounceHook }: { useDebounceHook: typeof useDebounce }) {
	const [product, setProduct] = useState('Ceramic Mug')
	const [note, setNote] = useState('')
	const saveNote = (text: string) => log(`saved "${text}" for ${product}`)
	const debouncedSave = useDebounceHook(saveNote, 300)

	return (
		<>
			<select id="product" value={product} onChange={(e) => setProduct(e.target.value)}>
				<option>Ceramic Mug</option>
				<option>Desk Lamp</option>
			</select>
			<input
				id="note"
				value={note}
				onChange={(e) => {
					setNote(e.target.value)
					debouncedSave(e.target.value)
				}}
			/>
		</>
	)
}
```

### 1. Rebuild when the callback changes

```tsx
function useDebounceRebuild<A extends unknown[]>(callback: Fn<A>, delay: number) {
	return useMemo(() => debounce(callback, delay), [callback, delay])
}
```

```text
saved "G" for Desk Lamp
saved "Gi" for Desk Lamp
saved "Gif" for Desk Lamp
saved "Gift" for Desk Lamp
```

Four saves instead of one. `saveNote` is a new function on every render, so `useMemo` builds a new debounced function each time, and a new one can't cancel the timer an old one started. Wrapping `saveNote` in `useCallback` doesn't help: it depends on `product`, so it changes too, just less often.

### 2. Build it once

```tsx
function useDebounceOnce<A extends unknown[]>(callback: Fn<A>, delay: number) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => debounce(callback, delay), [delay])
}
```

```text
saved "Gift" for Ceramic Mug
```

One save now, but for the wrong product. The debounced function wraps the `saveNote` from the **first** render, when the product was still Ceramic Mug. That's a stale closure.

### 3. The latest ref

```tsx
function useDebounce<A extends unknown[]>(callback: Fn<A>, delay: number) {
	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback // after every render: the latest callback
	})
	return useMemo(() => debounce((...args: A) => callbackRef.current(...args), delay), [delay])
}
```

```text
saved "Gift" for Desk Lamp
```

One save, right product. The debounced function is built once (deps `[delay]`), so its timer survives re-renders. It doesn't hold `callback`: it holds the ref, and reads `callbackRef.current` **when the timer fires**.

Don't write `debounce(callbackRef.current, delay)`. That reads `.current` once, when `useMemo` runs, which is the same bug as version 2. The extra arrow function is what delays the read.

## Inside effects: `useEffectEvent`

A stock watcher checks the product's stock every 200 ms. Clicking "Watch Desk Lamp" changes the `product` prop.

```tsx
function StockWatchStale({ product }: { product: string }) {
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => log(`checking stock: ${product}`), 200)
		return () => (log('watch stopped'), clearInterval(id))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return null
}
```

Before and after the click:

```text
watch started
checking stock: Ceramic Mug   (repeats)
```

```text
checking stock: Ceramic Mug   (repeats)
```

Stale: still checking the mug. Adding `product` to the dependencies fixes the value, but restarts the interval on every change:

```tsx
function StockWatchRestart({ product }: { product: string }) {
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => log(`checking stock: ${product}`), 200)
		return () => (log('watch stopped'), clearInterval(id))
	}, [product])
	return null
}
```

```text
watch stopped
watch started
checking stock: Desk Lamp   (repeats)
```

`useEffectEvent` separates the two. The effect sets up the interval once; the event function always sees the latest `product`:

```tsx
function StockWatch({ product }: { product: string }) {
	const onTick = useEffectEvent(() => log(`checking stock: ${product}`))
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => onTick(), 200)
		return () => (log('watch stopped'), clearInterval(id))
	}, [])
	return null
}
```

```text
checking stock: Desk Lamp   (repeats)
```

No restart, and the new product. `useEffectEvent` is meant to be called **only from effects** (and things they set up, like this interval). It's not a general stable-callback tool for event handlers or props, which is where the hand-written ref is still the answer.

## How it works

- **Closures capture a render.** A function created during render reads the variables of that render forever. That's why hooks avoid a whole class of async bugs that class components had: there, `this.props` and `this.state` could change in the middle of an `await`.
- **A ref is one box for the component's whole life.** Writing `.current` doesn't re-render, and every closure that holds the ref sees the newest value.
- **Write the ref in an effect, not during render.** Render must stay pure: React may render a component and throw the result away. An effect runs only for renders that were committed. (`useLayoutEffect` updates it a bit earlier, before paint, if a callback could fire in between.)
- **No dependency array on that effect.** It should run after every render, to always copy the newest callback.

## Common mistakes

- **Using the pattern to silence the dependency lint rule.** It opts out of the "this render's values" guarantee on purpose. Use it only for functions that genuinely run later.
- **Reading `ref.current` during render.** Render would depend on something React doesn't track.
- **Passing `callbackRef.current` instead of a wrapper function** (see above).
- **Calling a `useEffectEvent` function from an event handler or passing it to a child.** It's for effects only.

## Interview Q&A

<details class="qa"><summary>What problem does the latest ref pattern solve?</summary>

A function that's created once but called later (a debounced or throttled function, a timer or subscription callback) needs the latest props and state when it runs. Rebuilding it on every change loses its internal state (pending timers); not rebuilding it leaves it with stale values.

</details>

<details class="qa"><summary>Walk through the buggy <code>useDebounce</code>.</summary>

`useMemo(() => debounce(callback, delay), [callback, delay])` builds a new debounced function whenever `callback` changes, which is every render for an inline function. Each new function has its own timer, so older timers are never cancelled. Recorded: typing "Gift" saved four times.

</details>

<details class="qa"><summary>Why doesn't <code>useCallback</code> fix it?</summary>

The callback still changes whenever its own dependencies change (here, `product`), so the debounced function is still rebuilt at those moments. It also pushes the burden onto every caller.

</details>

<details class="qa"><summary>How does the ref version work?</summary>

An effect copies the newest callback into `callbackRef.current` after every render. The debounced function is built once and calls `callbackRef.current(...args)` when the timer fires. Recorded: one save, `"Gift" for Desk Lamp`.

</details>

<details class="qa"><summary>Why write the ref in an effect and not in the render body?</summary>

Render should be pure. React can render without committing (Strict Mode, interrupted concurrent renders), and writing during such a render would store a callback from a render that never happened.

</details>

<details class="qa"><summary>What is <code>useEffectEvent</code>?</summary>

A React 19.2 hook that wraps a function so it always sees the latest props and state, without being an effect dependency. It's the built-in version of this pattern for code called from effects. Recorded: the stock watcher switched to Desk Lamp without restarting its interval.

</details>

## Related

- [Side Effects](../../hooks/side-effects/) and [DOM Refs and Effect Dependencies](../../hooks/dom-refs-and-effect-dependencies/): effects, refs and dependencies.
- [React Re-rendering](../../hooks/react-re-rendering/): stale closures and `useCallback`.
- [useLayoutEffect](../../apis/uselayouteffect/): an earlier place to update the ref.

## Sources

- Kent C. Dodds: [The latest ref pattern in React](https://epicreact.dev/the-latest-ref-pattern-in-react), [How React uses closures to avoid bugs](https://epicreact.dev/how-react-uses-closures-to-avoid-bugs)
- react.dev: [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent), [Separating events from effects](https://react.dev/learn/separating-events-from-effects), [`useRef`](https://react.dev/reference/react/useRef)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
