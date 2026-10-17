---
title: "Compound Components"
slug: "compound-components"
module: "patterns"
order: 2
level: "must"
illus: "chain"
summary: "Toggle, ToggleButton, ToggleOn and ToggleOff sharing state through context, like select and option."
source: "https://kentcdodds.com/blog/compound-components-with-react-hooks"
---


## In one minute

Compound components are a set of components that only make sense together and **share state implicitly**, like HTML's `<select>` and `<option>`: you don't wire each `<option>` to the select, it just works. In React, the parent (`Toggle`) owns the state and puts it in **context**; the pieces (`ToggleButton`, `ToggleOn`, `ToggleOff`) read it. The consumer decides which pieces to render, in what order, wrapped in whatever markup they like. A small hook that throws a clear error when a piece is used outside its parent makes the API safe.

**You'll be able to:** build a compound component with context, explain why the older `cloneElement` version breaks, and give a missing parent a helpful error.

<figure class="fig anim fig-patterns-compound-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Context</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">cloneElement</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return &lt;ToggleContext value={{ on, toggle: () =&gt; setOn(!on) }}&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;Toggle&lt;/code&gt; owns the state and puts it in context around whatever children it was given.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const { on } = useToggleContext()&quot;,&quot;say&quot;:&quot;Each piece reads the context, however deep it is. The consumer’s &lt;code&gt;div&lt;/code&gt; in between doesn’t matter.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L7&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;ToggleButton /&gt;&quot;,&quot;say&quot;:&quot;Click the switch: &lt;code&gt;on&lt;/code&gt; becomes true, the context value changes, and all the pieces re-render.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;L12&quot;:&quot;hl&quot;,&quot;s-switch&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-switch&quot;:&quot;Gift wrap: on&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Recorded: the text changed with the switch.&quot;,&quot;set&quot;:{&quot;L12&quot;:&quot;&quot;,&quot;s-switch&quot;:&quot;&quot;,&quot;s-text&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-text&quot;:&quot;We’ll wrap it in recycled paper 🎁&quot;}}]" data-intro="The pieces read &lt;code&gt;ToggleContext&lt;/code&gt;."><div class="anim-scn-title">Context</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftWrap.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Toggle</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setOn</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">false</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleContext</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> value</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> toggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setOn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">on) </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">    {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleContext</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ToggleOn</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> }</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useToggleContext</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">?</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> children </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#D20F39;--shiki-dark:#F38BA8"> null</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Toggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleButton</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"note"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleOn</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">We'll wrap it in recycled paper 🎁</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleOn</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L15"><span class="ca-num">16</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleOff</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">No gift wrap</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleOff</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L16"><span class="ca-num">17</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L17"><span class="ca-num">18</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Toggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-switch">Gift wrap: off</div><div class="an ca-item ca-text" data-k="s-text">No gift wrap</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>return &lt;ToggleContext value={{ on, toggle: () =&gt; setOn(!on) }}&gt;</code><span><code>Toggle</code> owns the state and puts it in context around whatever children it was given.</span></li><li><span class="anim-phase ph-render">render phase</span><code>const { on } = useToggleContext()</code><span>Each piece reads the context, however deep it is. The consumer’s <code>div</code> in between doesn’t matter.</span></li><li><span class="anim-phase ph-event">event</span><code>&lt;ToggleButton /&gt;</code><span>Click the switch: <code>on</code> becomes true, the context value changes, and all the pieces re-render.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Recorded: the text changed with the switch.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return Children.map(children, child =&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;ToggleClone&lt;/code&gt; walks its &lt;b&gt;direct&lt;/b&gt; children and copies &lt;code&gt;on&lt;/code&gt; and &lt;code&gt;toggle&lt;/code&gt; onto each component element.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;typeof child.type !== 'string' // skip &lt;div&gt;, &lt;p&gt;…&quot;,&quot;say&quot;:&quot;The &lt;code&gt;div&lt;/code&gt; is a DOM element, so it’s passed through untouched, and &lt;code&gt;Children.map&lt;/code&gt; never looks inside it. &lt;code&gt;CloneOn&lt;/code&gt; and &lt;code&gt;CloneOff&lt;/code&gt; get no &lt;code&gt;on&lt;/code&gt; at all.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L3&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;CloneButton /&gt;&quot;,&quot;say&quot;:&quot;Click the switch. It flips: &lt;code&gt;CloneButton&lt;/code&gt; was a direct child.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;L10&quot;:&quot;hl&quot;,&quot;s-switch&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-switch&quot;:&quot;Gift wrap: on&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;But the text doesn’t change. Recorded: still “No gift wrap”.&quot;,&quot;set&quot;:{&quot;L10&quot;:&quot;&quot;,&quot;s-switch&quot;:&quot;&quot;,&quot;s-text&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-text&quot;:&quot;No gift wrap&quot;}}]" data-intro="The older way: props are copied onto direct children."><div class="anim-scn-title">cloneElement</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">GiftWrap.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> ToggleClone</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> [</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> setOn</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">]</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useState</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387">false</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> Children</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">map</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> child</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    typeof</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> child</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">.</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">type </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!==</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'string'</span><span style="--shiki-light:#7C7F93;--shiki-light-font-style:italic;--shiki-dark:#9399B2;--shiki-dark-font-style:italic"> // skip &#x3C;div>, &#x3C;p>…</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      ?</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> cloneElement</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(child</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> on</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> toggle</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> setOn</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">!</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">on) </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">      :</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> child</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">  )</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleClone</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CloneButton</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"note"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CloneOn</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">We'll wrap it in recycled paper 🎁</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CloneOn</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CloneOff</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">No gift wrap</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">CloneOff</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L15"><span class="ca-num">16</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">ToggleClone</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-button" data-k="s-switch">Gift wrap: off</div><div class="an ca-item ca-text" data-k="s-text">No gift wrap</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>return Children.map(children, child =&gt;</code><span><code>ToggleClone</code> walks its <b>direct</b> children and copies <code>on</code> and <code>toggle</code> onto each component element.</span></li><li><span class="anim-phase ph-render">render phase</span><code>typeof child.type !== 'string' // skip &lt;div&gt;, &lt;p&gt;…</code><span>The <code>div</code> is a DOM element, so it’s passed through untouched, and <code>Children.map</code> never looks inside it. <code>CloneOn</code> and <code>CloneOff</code> get no <code>on</code> at all.</span></li><li><span class="anim-phase ph-event">event</span><code>&lt;CloneButton /&gt;</code><span>Click the switch. It flips: <code>CloneButton</code> was a direct child.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>But the text doesn’t change. Recorded: still “No gift wrap”.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A gift-wrap toggle built from compound components. The consumer wrapped the two texts in a <code>div</code> (both versions recorded).</figcaption></figure>

## The example: "Gift wrap"

At checkout there's a gift-wrap switch, with a line of text that changes with it.

### 1. One owner, shared through context

```tsx
type ToggleValue = { on: boolean; toggle: () => void }
const ToggleContext = createContext<ToggleValue | null>(null)

function Toggle({ children }: { children: ReactNode }) {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	return <ToggleContext value={{ on, toggle }}>{children}</ToggleContext>
}
```

```tsx
function useToggleContext() {
	const context = use(ToggleContext)
	if (!context) throw new Error('Toggle components must be rendered inside <Toggle>')
	return context
}
```

```tsx
function ToggleOn({ children }: { children: ReactNode }) {
	const { on } = useToggleContext()
	return on ? children : null
}

function ToggleOff({ children }: { children: ReactNode }) {
	const { on } = useToggleContext()
	return on ? null : children
}

function ToggleButton(props: { 'aria-label': string }) {
	const { on, toggle } = useToggleContext()
	return <Switch on={on} onClick={toggle} {...props} />
}
```

### 2. What the consumer writes

```tsx
function GiftWrap() {
	return (
		<Toggle>
			<ToggleButton aria-label="Gift wrap" />
			<div className="note">
				<ToggleOn>We'll wrap it in recycled paper 🎁</ToggleOn>
				<ToggleOff>No gift wrap</ToggleOff>
			</div>
		</Toggle>
	)
}
```

No state and no props to wire. The texts sit inside the consumer's own `div`. Recorded, before and after clicking the switch:

```js
{
  "logs": [
    "scenario: context"
  ],
  "warnings": [],
  "before": "No gift wrap",
  "after": "We'll wrap it in recycled paper 🎁",
  "switch": "true"
}
```

### 3. The older way: `cloneElement`

Before hooks, compound components were often built by copying props onto children:

```tsx
function ToggleClone({ children }: { children: ReactNode }) {
	const [on, setOn] = useState(false)
	const toggle = () => setOn(!on)
	return Children.map(children, (child) =>
		isValidElement(child) && typeof child.type !== 'string' // skip <div>, <p>…
			? cloneElement(child as ReactElement<Injected>, { on, toggle })
			: child,
	)
}
```

With the same layout (texts inside a `div`):

```js
{
  "logs": [
    "scenario: clone"
  ],
  "warnings": [],
  "before": "No gift wrap",
  "after": "No gift wrap",
  "switch": "true"
}
```

The switch turned on, but the text didn't change. `Children.map` only sees **direct** children. The `div` is a direct child; the text components inside it never received `on`.

### 4. Used outside `<Toggle>`

Two buttons with no `Toggle` above them, one reading the context with `!`, one with `useToggleContext`:

```tsx
function ToggleButtonUnchecked(props: { 'aria-label': string }) {
	const { on, toggle } = use(ToggleContext)! // "!" tells TypeScript it's never null
	return <Switch on={on} onClick={toggle} {...props} />
}
```

What each error boundary showed:

```text
Cannot destructure property 'on' of 'use(...)' as it is null.
Toggle components must be rendered inside <Toggle>
```

The `!` only silenced TypeScript; at runtime the code crashed with an error that doesn't mention `Toggle`. The checking hook names the fix, and its `throw` lets TypeScript narrow the type to non-null on its own.

## How it works

- **Context carries the state through any depth.** Readers find the nearest provider above them ([Context with use](../../apis/context-with-use/)), so wrappers, fragments and conditional rendering don't break the connection.
- **The parent owns state, the consumer owns structure.** That split is the whole point: compared with one component that takes a big config prop (`options={[…]}`), every new layout need is just JSX, not a new prop.
- **The context value is a new object on every render** of `Toggle`, so every piece re-renders when `Toggle` does. That's fine for three pieces; for many, memoize the value.
- **Libraries use this everywhere:** Radix (`Tabs`, `Accordion`), Reach UI, Headless UI.

## Common mistakes

- **`use(Context)!` at every call site.** Centralize the read in one hook that throws a clear error.
- **Using `cloneElement`** for new code. It breaks as soon as a child is wrapped (recorded).
- **Exporting pieces that can't work alone** without saying so in the error message.

## Interview Q&A

<details class="qa"><summary>What are compound components?</summary>

Components designed to be used together that share state implicitly, the way `<select>` and `<option>` do. The parent owns the state; the children read it without the consumer passing props between them.

</details>

<details class="qa"><summary>How do you build them today?</summary>

The parent puts its state (`{ on, toggle }`) in a context provider around `children`; each piece reads the context through a custom hook. The consumer composes the pieces freely.

</details>

<details class="qa"><summary>Why not <code>Children.map</code> + <code>cloneElement</code>?</summary>

It only reaches direct children. Recorded: with the text components wrapped in a `div`, the switch turned on but the text stayed "No gift wrap". Context works at any depth.

</details>

<details class="qa"><summary>What happens if a piece is rendered without its parent?</summary>

With `use(ToggleContext)!`, the context is `null` and the code crashes with "Cannot destructure property 'on' of 'use(...)' as it is null." A checking hook throws "Toggle components must be rendered inside &lt;Toggle&gt;" instead, which also narrows the TypeScript type.

</details>

<details class="qa"><summary>What's the advantage over a single component with a config prop?</summary>

The consumer controls structure and markup with plain JSX, so the author doesn't have to add a prop for every layout variation.

</details>

## Related

- [Composition and Layout Components](../../patterns/composition/): pass elements, not data.
- [The Slots Pattern](../../patterns/slots/): share props by name instead of separate components per role.
- [Context with use](../../apis/context-with-use/): how context reaches readers.

## Sources

- Kent C. Dodds: [React Hooks: Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- react.dev: [`cloneElement`](https://react.dev/reference/react/cloneElement) (and its alternatives), [`Children`](https://react.dev/reference/react/Children)
- Radix UI: [Tabs](https://www.radix-ui.com/primitives/docs/components/tabs), a production compound component
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
