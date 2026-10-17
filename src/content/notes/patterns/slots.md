---
title: "The Slots Pattern"
slug: "slots"
module: "patterns"
order: 3
level: "good"
illus: "map"
summary: "A root component publishes props per slot name; generic Label, Input and Text pieces pick theirs up."
source: "https://react-aria.adobe.com/customization"
---


## In one minute

Compound components give each role its own component (`ToggleOn`, `ToggleOff`). **Slots** go one step further. The root component publishes a map of **props per slot name** in context: `{ label: { htmlFor: id }, input: { id, … } }`. Small generic pieces (`Label`, `Input`, `Text`) look up their slot and merge those props in. The same `Label` then works inside a form field, a toggle or a combobox, and the root still controls the accessibility wiring (`id`s, `htmlFor`, `aria-describedby`). The cost: slot names are strings, so a typo fails silently.

**You'll be able to:** build a slot context with a `useSlotProps` hook, reuse one set of pieces across components, and explain the type-safety trade-off.

<figure class="fig anim fig-patterns-slots-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">slot="description"</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">slot="descripton"</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const id = useId()&quot;,&quot;say&quot;:&quot;&lt;code&gt;Field&lt;/code&gt; makes one id and builds a map of which props each &lt;b&gt;slot&lt;/b&gt; gets.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;,&quot;L2&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;label: { htmlFor: id },&quot;,&quot;say&quot;:&quot;&lt;code&gt;Label&lt;/code&gt; reads the map from context and merges in &lt;code&gt;htmlFor&lt;/code&gt;. Its own props would win.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L2&quot;:&quot;&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;L11&quot;:&quot;hl&quot;,&quot;s-label&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-label&quot;:&quot;label for = _r_0_&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;input: { id, 'aria-describedby': id + '-description' },&quot;,&quot;say&quot;:&quot;&lt;code&gt;Input&lt;/code&gt; gets &lt;code&gt;id&lt;/code&gt; and &lt;code&gt;aria-describedby&lt;/code&gt;, though it sits inside an extra &lt;code&gt;div&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;L11&quot;:&quot;&quot;,&quot;s-label&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;L12&quot;:&quot;hl&quot;,&quot;s-input&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;input id = _r_0_ · aria-describedby = _r_0_-description&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;description: { id: id + '-description' },&quot;,&quot;say&quot;:&quot;&lt;code&gt;Text&lt;/code&gt; is generic; its &lt;code&gt;slot&lt;/code&gt; prop says which entry to use. Recorded: clicking the label focused the input, and the description is linked.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;L12&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;&quot;,&quot;L5&quot;:&quot;hl&quot;,&quot;L13&quot;:&quot;hl&quot;,&quot;s-desc&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-desc&quot;:&quot;description id = _r_0_-description&quot;}}]" data-intro="Every piece finds its slot."><div class="anim-scn-title">slot="description"</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">CheckoutEmail.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Field</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useId</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> slots</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> htmlFor</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">},</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    input</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'aria-describedby'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">+</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '-description'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> },</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    description</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">+</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '-description'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> },</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">SlotContext</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> value</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">slots</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">SlotContext</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Field</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Email for the receipt</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"row"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">>&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"email"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> />&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Text</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> slot</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"description"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">We only use it for this order.</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Text</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Field</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-muted" data-k="s-label">label for = ?</div><div class="an ca-item ca-muted" data-k="s-input">input id = ? · aria-describedby = ?</div><div class="an ca-item ca-muted" data-k="s-desc">description id = ?</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>const id = useId()</code><span><code>Field</code> makes one id and builds a map of which props each <b>slot</b> gets.</span></li><li><span class="anim-phase ph-render">render phase</span><code>label: { htmlFor: id },</code><span><code>Label</code> reads the map from context and merges in <code>htmlFor</code>. Its own props would win.</span></li><li><span class="anim-phase ph-render">render phase</span><code>input: { id, 'aria-describedby': id + '-description' },</code><span><code>Input</code> gets <code>id</code> and <code>aria-describedby</code>, though it sits inside an extra <code>div</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>description: { id: id + '-description' },</code><span><code>Text</code> is generic; its <code>slot</code> prop says which entry to use. Recorded: clicking the label focused the input, and the description is linked.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const slots = {&quot;,&quot;say&quot;:&quot;The same map.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Label&gt;Email for the receipt&lt;/Label&gt;&quot;,&quot;say&quot;:&quot;Label and input are wired as before.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;L11&quot;:&quot;hl&quot;,&quot;L12&quot;:&quot;hl&quot;,&quot;s-label&quot;:&quot;ok&quot;,&quot;s-input&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-label&quot;:&quot;label for = _r_0_&quot;,&quot;s-input&quot;:&quot;input id = _r_0_ · aria-describedby = _r_0_-description&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Text slot=\&quot;descripton\&quot;&gt;We only use it for this order.&lt;/Text&gt;&quot;,&quot;say&quot;:&quot;There’s no &lt;code&gt;\&quot;descripton\&quot;&lt;/code&gt; entry, so &lt;code&gt;Text&lt;/code&gt; gets nothing extra. No error, no warning.&quot;,&quot;set&quot;:{&quot;L11&quot;:&quot;&quot;,&quot;L12&quot;:&quot;&quot;,&quot;s-label&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;&quot;,&quot;L13&quot;:&quot;hl&quot;,&quot;s-desc&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-desc&quot;:&quot;description id = (none)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;say&quot;:&quot;Recorded: the input still says &lt;code&gt;aria-describedby=\&quot;_r_0_-description\&quot;&lt;/code&gt;, but no element has that id. Screen readers lose the description.&quot;,&quot;set&quot;:{&quot;L13&quot;:&quot;&quot;,&quot;s-desc&quot;:&quot;&quot;,&quot;s-input&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-input&quot;:&quot;input aria-describedby → points at nothing&quot;}}]" data-intro="A typo in a slot name."><div class="anim-scn-title">slot="descripton"</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">CheckoutEmail.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Field</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useId</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> slots</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> htmlFor</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">},</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    input</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> 'aria-describedby'</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">+</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '-description'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> },</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">    description</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">:</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> id </span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">+</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1"> '-description'</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> },</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  }</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">SlotContext</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> value</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">slots</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">children</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">SlotContext</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Field</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">Email for the receipt</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L12"><span class="ca-num">13</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> className</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"row"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">>&#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> type</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"email"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> />&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L13"><span class="ca-num">14</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Text</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> slot</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"descripton"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">We only use it for this order.</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Text</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L14"><span class="ca-num">15</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#EA76CB;--shiki-dark:#F5C2E7">Field</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-muted" data-k="s-label">label for = ?</div><div class="an ca-item ca-muted" data-k="s-input">input id = ? · aria-describedby = ?</div><div class="an ca-item ca-muted" data-k="s-desc">description id = ?</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>const slots = {</code><span>The same map.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Label&gt;Email for the receipt&lt;/Label&gt;</code><span>Label and input are wired as before.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Text slot="descripton"&gt;We only use it for this order.&lt;/Text&gt;</code><span>There’s no <code>"descripton"</code> entry, so <code>Text</code> gets nothing extra. No error, no warning.</span></li><li><span class="anim-phase ph-commit">commit phase</span><span>Recorded: the input still says <code>aria-describedby="_r_0_-description"</code>, but no element has that id. Screen readers lose the description.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A checkout email field built from generic <code>Label</code>, <code>Input</code> and <code>Text</code> pieces that pick up their props by slot name (both versions recorded).</figcaption></figure>

## The example: checkout fields

At checkout there's an email field with a description, and the gift-wrap toggle. Both need a label wired to their control.

### 1. The slot context and the pieces

```tsx
type Slots = Record<string, Record<string, unknown>>
const SlotContext = createContext<Slots>({})

function useSlotProps<P extends { slot?: string }>(props: P, defaultSlot: string) {
	const slots = use(SlotContext)
	const { slot = defaultSlot, ...own } = props
	return { ...slots[slot], ...own } // what you pass yourself wins
}
```

```tsx
type WithSlot<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T> & { slot?: string }

function Label(props: WithSlot<'label'>) {
	return <label {...useSlotProps(props, 'label')} />
}

function Input(props: WithSlot<'input'>) {
	return <input {...useSlotProps(props, 'input')} />
}

function Text(props: WithSlot<'span'>) {
	return <span {...useSlotProps(props, 'text')} />
}

function SlotSwitch(props: { slot?: string }) {
	const { on = false, ...rest } = useSlotProps(props, 'switch') as { on?: boolean }
	return <Switch on={on} {...rest} />
}
```

### 2. Two roots, one set of pieces

```tsx
function Field({ children }: { children: ReactNode }) {
	const id = useId()
	const descriptionId = `${id}-description`
	const slots = {
		label: { htmlFor: id },
		input: { id, 'aria-describedby': descriptionId },
		description: { id: descriptionId },
	}
	return <SlotContext value={slots}>{children}</SlotContext>
}
```

```tsx
function GiftToggle({ children }: { children: ReactNode }) {
	const [on, setOn] = useState(false)
	const id = useId()
	const slots = {
		label: { htmlFor: id },
		switch: { id, on, onClick: () => setOn(!on) },
		onText: { hidden: !on },
		offText: { hidden: on },
	}
	return <SlotContext value={slots}>{children}</SlotContext>
}
```

### 3. What the consumer writes

```tsx
<Field>
	<Label>Email for the receipt</Label>
	<div className="row">
		<Input type="email" />
	</div>
	<Text slot="description">We only use it for this order.</Text>
</Field>

<GiftToggle>
	<Label>Gift wrap</Label>
	<SlotSwitch />
	<Text slot="onText">Wrapped in recycled paper 🎁</Text>
	<Text slot="offText">No gift wrap</Text>
</GiftToggle>
```

The email field's wiring, recorded from the DOM:

```js
{
  "label for": "_r_0_",
  "input id": "_r_0_",
  "input aria-describedby": "_r_0_-description",
  "description id": "_r_0_-description",
  "aria-describedby points to": "We only use it for this order.",
  "label for === input id": true
}
```

Clicking the label focused the input, although the input sits inside an extra `div`:

```text
input#_r_0_
```

In the gift-wrap toggle, the **same** `Label` component got the switch's id instead (`label for === switch id` was `true`). The two `Text`s, before and after clicking the switch:

```text
Wrapped in recycled paper 🎁 (hidden)
No gift wrap
```

```text
Wrapped in recycled paper 🎁
No gift wrap (hidden)
```

### 4. A typo in a slot name

```tsx
<Field>
	<Label>Email for the receipt</Label>
	<Input type="email" />
	<Text slot="descripton">We only use it for this order.</Text>
</Field>
```

```js
{
  "label for": "_r_0_",
  "input id": "_r_0_",
  "input aria-describedby": "_r_0_-description",
  "description id": null,
  "aria-describedby points to": "(nothing)",
  "label for === input id": true
}
```

No error, no warning. The input still says it's described by an element that doesn't exist, so screen readers lose the description.

## How it works

- **Context instead of tree walking.** Like compound components with context, any piece below the root finds the map, at any depth and in any order.
- **Merge order: slot first, own props last.** `{ ...slots[slot], ...own }` lets the consumer override anything the slot provides, such as passing their own `id`.
- **A default slot per piece.** `Label` defaults to `"label"`, so you only write `slot="…"` on generic pieces like `Text` that play different roles.
- **The root owns accessibility.** The consumer arranges the pieces; the root decides which `id` goes where, so the wiring can't be forgotten.
- **In production:** React Aria Components work this way (`<Text slot="description">`), with their own slot contexts and dev warnings.

## Common mistakes

- **Expecting type safety on slot names.** A string slot isn't checked by TypeScript (recorded: a typo silently dropped the description's id). Libraries add runtime warnings for unknown slots.
- **Overriding wiring by accident.** Since your props win, passing `id` to an `Input` breaks the label link unless you mean it.
- **Using slots where a fixed structure is fine.** For a component whose pieces never move, separate compound components are simpler and typo-proof.

## Interview Q&A

<details class="qa"><summary>What is the slots pattern?</summary>

A root component provides a context mapping slot names to props; generic child components read their slot's props and merge them into their own. One `Label` or `Text` component can fill different roles in different parents.

</details>

<details class="qa"><summary>How is it different from compound components?</summary>

Compound components usually have one component per role (`ToggleOn`, `ToggleOff`). Slots share generic pieces across many components, chosen by slot name, so `Label` is written once for a field, a toggle and a combobox.

</details>

<details class="qa"><summary>Why does the merge order matter?</summary>

`{ ...slotProps, ...ownProps }` lets explicit props override the slot's defaults. The reverse would make the consumer unable to customize anything the root sets.

</details>

<details class="qa"><summary>What's the main downside?</summary>

Weak type safety. Slot names are strings, and a typo gives no error. Recorded: `slot="descripton"` left `aria-describedby` pointing at nothing.

</details>

<details class="qa"><summary>Where is this used for real?</summary>

React Aria Components: `Label`, `Input`, `Text slot="description"`, `Button` are reused across `TextField`, `ComboBox`, `NumberField` and more, each root providing its own slot props.

</details>

## Related

- [Compound Components](../../patterns/compound-components/): the one-component-per-role version.
- [The useId Hook](../../hooks/the-useid-hook/): the ids the roots generate.
- [Context with use](../../apis/context-with-use/): how the slot map reaches the pieces.

## Sources

- React Aria: [Advanced customization](https://react-aria.adobe.com/customization) (slots and contexts)
- Sandro Roth: [Building component slots in React](https://sandroroth.com/blog/react-slots/)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
