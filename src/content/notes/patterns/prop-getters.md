---
title: "Prop Collections and Getters"
slug: "prop-getters"
module: "patterns"
order: 4
level: "must"
illus: "bolt"
summary: "Hand out the props an element needs, and merge the consumer’s own handlers instead of overwriting them."
source: "https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters"
---


## In one minute

A toggle button needs `aria-checked` set from state *and* an `onClick` that toggles. Every consumer of a `useToggle` hook has to remember both. A **prop collection** bundles them into an object (`togglerProps`) you spread onto the element. But a spread is just object keys: if you add your own `onClick`, one of the two handlers **silently replaces** the other. A **prop getter** fixes that. It's a function, `getTogglerProps(yourProps)`, that merges your props with the hook's and **chains** handlers so both run.

**You'll be able to:** write a prop getter with a `callAll` helper, and explain why a plain prop collection breaks custom handlers.

<figure class="fig anim fig-patterns-prop-getters-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Spread, then onClick</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">onClick, then spread</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Prop getter</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;button {...togglerProps} onClick={track}&gt;&quot;,&quot;say&quot;:&quot;JSX props behave like object keys: the &lt;b&gt;last&lt;/b&gt; &lt;code&gt;onClick&lt;/code&gt; wins, so &lt;code&gt;track&lt;/code&gt; replaces the hook’s &lt;code&gt;toggle&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;say&quot;:&quot;Recorded after two clicks: analytics logged both times, but the button never toggled.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;&quot;,&quot;s-btn&quot;:&quot;bad&quot;,&quot;s-log&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Gift wrap: off&quot;,&quot;s-log&quot;:&quot;Analytics: logged ×2&quot;}}]" data-intro="A prop collection spread before the consumer’s handler."><div class="anim-scn-title">Spread, then onClick</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftWrap.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useToggle</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setOn</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">false</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> toggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setOn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">on)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> togglerProps</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'aria-checked'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> toggle </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> togglerProps </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> togglerProps</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useToggle</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">togglerProps</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">track</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  Gift wrap: </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">on </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">?</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'on'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> :</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'off'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-btn">Gift wrap: off</div><div class="an ca-item ca-muted" data-k="s-log">Analytics: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>&lt;button {...togglerProps} onClick={track}&gt;</code><span>JSX props behave like object keys: the <b>last</b> <code>onClick</code> wins, so <code>track</code> replaces the hook’s <code>toggle</code>.</span></li><li><span class="anim-phase ph-event">event</span><span>Recorded after two clicks: analytics logged both times, but the button never toggled.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;button onClick={track} {...togglerProps}&gt;&quot;,&quot;say&quot;:&quot;The other order: now the hook’s &lt;code&gt;onClick&lt;/code&gt; wins. TypeScript actually flags this one (TS2783: “specified more than once”).&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;say&quot;:&quot;Recorded: the button toggles, but analytics never logged.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;&quot;,&quot;s-btn&quot;:&quot;ok&quot;,&quot;s-log&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Gift wrap: on → off&quot;,&quot;s-log&quot;:&quot;Analytics: never&quot;}}]" data-intro="The consumer’s handler before the spread."><div class="anim-scn-title">onClick, then spread</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftWrap.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useToggle</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setOn</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">false</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> toggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setOn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">on)</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> togglerProps</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'aria-checked'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> toggle </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> togglerProps </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> togglerProps</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useToggle</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">track</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">togglerProps</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  Gift wrap: </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">on </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">?</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'on'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> :</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'off'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-btn">Gift wrap: off</div><div class="an ca-item ca-muted" data-k="s-log">Analytics: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>&lt;button onClick={track} {...togglerProps}&gt;</code><span>The other order: now the hook’s <code>onClick</code> wins. TypeScript actually flags this one (TS2783: “specified more than once”).</span></li><li><span class="anim-phase ph-event">event</span><span>Recorded: the button toggles, but analytics never logged.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;button {...getTogglerProps({ onClick: track, id: 'gift-wrap' })}&gt;&quot;,&quot;say&quot;:&quot;The consumer hands &lt;b&gt;its&lt;/b&gt; props to the hook instead of spreading them next to the hook’s.&quot;,&quot;set&quot;:{&quot;L11&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return { 'aria-checked': on, onClick: callAll(onClick, toggle), ...props }&quot;,&quot;say&quot;:&quot;The hook combines both handlers into one function that calls each. Other props, like &lt;code&gt;id&lt;/code&gt;, pass through.&quot;,&quot;set&quot;:{&quot;L11&quot;:&quot;&quot;,&quot;L6&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;const callAll = (...fns) =&gt; (...args) =&gt; fns.forEach(fn =&gt; fn?.(...args))&quot;,&quot;say&quot;:&quot;Recorded: on, then off, with analytics logged each time.&quot;,&quot;set&quot;:{&quot;L6&quot;:&quot;&quot;,&quot;L0&quot;:&quot;hl&quot;,&quot;s-btn&quot;:&quot;ok&quot;,&quot;s-log&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-btn&quot;:&quot;Gift wrap: on → off&quot;,&quot;s-log&quot;:&quot;Analytics: logged ×2&quot;}}]" data-intro="A function that merges the props."><div class="anim-scn-title">Prop getter</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftWrap.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">const</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> callAll</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">fns</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">args</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">)</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> fns</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">forEach</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">fn</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> fn</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">?.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">args))</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useToggle</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setOn</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">false</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> toggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setOn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">on)</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> getTogglerProps</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> onClick</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> ...</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">props</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {})</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'aria-checked'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> callAll</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(onClick</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> toggle)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> ...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">props </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> getTogglerProps </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">button</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">getTogglerProps</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> onClick</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> track</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'gift-wrap'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-btn">Gift wrap: off</div><div class="an ca-item ca-muted" data-k="s-log">Analytics: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>&lt;button {...getTogglerProps({ onClick: track, id: 'gift-wrap' })}&gt;</code><span>The consumer hands <b>its</b> props to the hook instead of spreading them next to the hook’s.</span></li><li><span class="anim-phase ph-render">render phase</span><code>return { 'aria-checked': on, onClick: callAll(onClick, toggle), ...props }</code><span>The hook combines both handlers into one function that calls each. Other props, like <code>id</code>, pass through.</span></li><li><span class="anim-phase ph-event">event</span><code>const callAll = (...fns) =&gt; (...args) =&gt; fns.forEach(fn =&gt; fn?.(...args))</code><span>Recorded: on, then off, with analytics logged each time.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The store wants an analytics event every time the gift-wrap button is clicked. The button is clicked twice (all three versions recorded).</figcaption></figure>

## The example: tracking the gift-wrap button

The store wants an analytics event every time the gift-wrap button is clicked.

### 1. A prop collection

```tsx
export function useToggleCollection() {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	const togglerProps = { 'aria-checked': on, onClick: toggle }
	return { on, toggle, togglerProps }
}
```

Adding `onClick={track}` after the spread:

```tsx
function GiftWrapSpreadFirst() {
	const { on, togglerProps } = useToggleCollection()
	return (
		<button role="switch" {...togglerProps} onClick={track}>
			Gift wrap: {on ? 'on' : 'off'}
		</button>
	)
}
```

Clicked twice:

```text
Gift wrap: off (aria-checked=false)
Gift wrap: off (aria-checked=false)
```

```text
analytics: gift wrap clicked
analytics: gift wrap clicked
```

Analytics ran, but the button never toggled: the later `onClick` replaced the hook's.

Putting it **before** the spread instead:

```tsx
function GiftWrapSpreadLast() {
	const { on, togglerProps } = useToggleCollection()
	return (
		<button role="switch" onClick={track} {...togglerProps}>
			Gift wrap: {on ? 'on' : 'off'}
		</button>
	)
}
```

```text
Gift wrap: on (aria-checked=true)
Gift wrap: off (aria-checked=false)
```

```js
[]
```

Now it toggles, and analytics never runs. TypeScript does catch this order, because `togglerProps` definitely has an `onClick`:

```text
05-prop-getters.bad.tsx(10,25): error TS2783: 'onClick' is specified more than once, so this usage will be overwritten.
```

It can't catch the first order, which is valid code that just does the wrong thing.

### 2. A prop getter

```tsx
function callAll<A extends unknown[]>(...fns: Array<((...args: A) => unknown) | undefined>) {
	return (...args: A) => fns.forEach((fn) => fn?.(...args))
}
```

```tsx
type ButtonClick = (e: MouseEvent<HTMLButtonElement>) => void

function useToggle() {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	function getTogglerProps<P extends object>({ onClick, ...props }: P & { onClick?: ButtonClick } = {} as P) {
		return { 'aria-checked': on, onClick: callAll(onClick, toggle), ...props }
	}
	return { on, toggle, getTogglerProps }
}
```

```tsx
function GiftWrap() {
	const { on, getTogglerProps } = useToggle()
	return (
		<button role="switch" {...getTogglerProps({ onClick: track, id: 'gift-wrap' })}>
			Gift wrap: {on ? 'on' : 'off'}
		</button>
	)
}
```

```text
Gift wrap: on (aria-checked=true)
Gift wrap: off (aria-checked=false)
```

```text
analytics: gift wrap clicked
analytics: gift wrap clicked
```

Both ran on every click, and the extra `id` passed straight through (`id="gift-wrap"` on the button).

## How it works

- **Spreading is last-key-wins.** JSX props behave like an object literal, so two `onClick`s can't both survive a spread. Only code that runs can combine two functions.
- **The getter takes your props and returns the merged result.** It pulls out the handlers it needs to merge (`onClick`), chains them with `callAll`, and spreads everything else, so other props like `id` or `aria-label` pass through or override.
- **`callAll(onClick, toggle)`** returns one function that calls each one that's defined, in order. `callAll(undefined, toggle)` just toggles.
- **Name them `get…Props`.** Downshift (`getInputProps`, `getItemProps`, `getMenuProps`), React Table and Conform use this convention. Seeing it tells you: call this, don't spread your own handlers next to it.

## Common mistakes

- **Shipping a collection when consumers will add handlers.** Default to getters for anything with event handlers.
- **Letting the consumer override the handler entirely.** Chain the hook's handler; don't let a spread of `...props` after it replace it.
- **Needing a veto and only having `callAll`.** If the consumer's handler should be able to stop the hook's (say, after `preventDefault()`), check `event.defaultPrevented` before calling the hook's handler.

## Interview Q&A

<details class="qa"><summary>What's a prop collection?</summary>

An object of props a hook returns for a typical element, like `{ 'aria-checked': on, onClick: toggle }`, so the consumer can spread it in one line and get the behavior and accessibility right.

</details>

<details class="qa"><summary>What breaks when the consumer adds their own <code>onClick</code>?</summary>

Spread order decides which single `onClick` survives. Recorded: with the consumer's handler last, the switch never toggled; with it first, analytics never logged. TypeScript only flagged the second case (TS2783).

</details>

<details class="qa"><summary>What's a prop getter, and how does it fix this?</summary>

A function the hook returns, like `getTogglerProps(props)`, that takes the consumer's props and returns merged props, combining handlers with something like `callAll(theirs, ours)`. Recorded: both the toggle and the analytics call ran on each click.

</details>

<details class="qa"><summary>Why destructure <code>onClick</code> separately in the getter?</summary>

Because it's the prop that must be merged. Everything else is spread through as is, so the consumer can still add or override non-function props.

</details>

<details class="qa"><summary>Where have you seen this pattern?</summary>

Downshift's `getInputProps`/`getItemProps`, React Table's `getTableProps`, Conform's `getFormProps`: all prop getters.

</details>

## Related

- [Compound Components](../../patterns/compound-components/): the component-level way to share toggle state.
- [The State Reducer Pattern](../../patterns/state-reducer/): the same `useToggle`, letting consumers control transitions.
- [Inputs](../../fundamentals/inputs/): `aria-*` attributes and form controls.

## Sources

- Kent C. Dodds: [How to give rendering control to users with prop getters](https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters), [Mixing component patterns](https://kentcdodds.com/blog/mixing-component-patterns)
- [Downshift](https://github.com/downshift-js/downshift), a library built on prop getters
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
