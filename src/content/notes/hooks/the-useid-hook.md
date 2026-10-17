---
title: "The useId Hook"
slug: "the-useid-hook"
module: "hooks"
order: 5
level: "good"
illus: "map"
summary: "Unique, SSR-safe ids for label/input pairs in components that render many times."
source: "https://react.dev/reference/react/useId"
---


## In one minute

A `<label htmlFor="x">` focuses the input with `id="x"`, and ids must be unique on the page. A reusable `Field` component can't hard-code its id (it may render many times) and shouldn't force every caller to invent one. **`useId()`** returns an id that is unique for each component instance and identical on the server and in the browser, so it also works with server rendering, which a counter or `Math.random()` doesn't.

**You'll be able to:** connect labels and inputs (and `aria-*` attributes) safely in reusable components.

<figure class="fig anim fig-hooks-useid-anim anim-code" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">id="review-title"</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useId()</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;input id=\&quot;review-title\&quot; {...props} /&gt;&quot;,&quot;say&quot;:&quot;Four fields on the page, four inputs with the &lt;b&gt;same&lt;/b&gt; id.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;label htmlFor=\&quot;review-title\&quot;&gt;{label}&lt;/label&gt;&quot;,&quot;say&quot;:&quot;Click the label “Your name” in the &lt;b&gt;Desk Lamp&lt;/b&gt; form. A label focuses the element whose &lt;code&gt;id&lt;/code&gt; matches its &lt;code&gt;htmlFor&lt;/code&gt;…&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;L2&quot;:&quot;hl&quot;,&quot;s-lamp&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;say&quot;:&quot;…and with duplicate ids the browser picks the &lt;b&gt;first&lt;/b&gt; one in the document. Recorded: focus went to the Ceramic Mug form’s Title field.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;s-lamp&quot;:&quot;&quot;,&quot;s-focus&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-focus&quot;:&quot;Focused: Ceramic Mug › Title&quot;}}]" data-intro="Every field uses the same hard-coded id."><div class="anim-scn-title">id="review-title"</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Field.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Field</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> label</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> ...</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">props</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">label</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> htmlFor</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"review-title"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">label</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"review-title"</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">props</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-mug">Ceramic Mug review: Title · Your name</div><div class="an ca-item ca-box" data-k="s-lamp">Desk Lamp review: Title · Your name</div><div class="an ca-item ca-muted" data-k="s-focus">Focused: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>&lt;input id="review-title" {...props} /&gt;</code><span>Four fields on the page, four inputs with the <b>same</b> id.</span></li><li><span class="anim-phase ph-event">event</span><code>&lt;label htmlFor="review-title"&gt;{label}&lt;/label&gt;</code><span>Click the label “Your name” in the <b>Desk Lamp</b> form. A label focuses the element whose <code>id</code> matches its <code>htmlFor</code>…</span></li><li><span>…and with duplicate ids the browser picks the <b>first</b> one in the document. Recorded: focus went to the Ceramic Mug form’s Title field.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;const id = useId()&quot;,&quot;say&quot;:&quot;Each &lt;code&gt;Field&lt;/code&gt; instance gets its own id, based on its place in the tree. Recorded: &lt;code&gt;_r_0_&lt;/code&gt; to &lt;code&gt;_r_3_&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;&lt;label htmlFor={id}&gt;{label}&lt;/label&gt;&quot;,&quot;say&quot;:&quot;Click “Your name” in the Desk Lamp form.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;s-lamp&quot;:&quot;upd&quot;},&quot;txt&quot;:{}},{&quot;say&quot;:&quot;Recorded: focus went to the Desk Lamp form’s name field, the right one.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;s-lamp&quot;:&quot;&quot;,&quot;s-focus&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-focus&quot;:&quot;Focused: Desk Lamp › Your name&quot;}}]" data-intro="Every field calls &lt;code&gt;useId()&lt;/code&gt;."><div class="anim-scn-title">useId()</div><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Field.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> Field</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> label</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">,</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> ...</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic">props</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  const</span><span style="--shiki-light:#FE640B;--shiki-dark:#FAB387"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> =</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> useId</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">()</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> (</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">label</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> htmlFor</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">label</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">label</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">    &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">id</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">...</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">props</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">  &#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">div</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-mug">Ceramic Mug review: Title · Your name</div><div class="an ca-item ca-box" data-k="s-lamp">Desk Lamp review: Title · Your name</div><div class="an ca-item ca-muted" data-k="s-focus">Focused: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>const id = useId()</code><span>Each <code>Field</code> instance gets its own id, based on its place in the tree. Recorded: <code>_r_0_</code> to <code>_r_3_</code>.</span></li><li><span class="anim-phase ph-event">event</span><code>&lt;label htmlFor={id}&gt;{label}&lt;/label&gt;</code><span>Click “Your name” in the Desk Lamp form.</span></li><li><span>Recorded: focus went to the Desk Lamp form’s name field, the right one.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Two review forms on one product page, built from the same <code>Field</code> component (both recorded).</figcaption></figure>

## The example: two review forms on one product page

### Hard-coded id

```tsx
function FieldHardcoded({ label, ...props }: { label: string } & ComponentProps<'input'>) {
	return (
		<div>
			<label htmlFor="review-title">{label}</label>
			<input id="review-title" {...props} />
		</div>
	)
}
```

Both review forms render two `Field`s. The ids in the page:

```js
[
  [
    "review-title",
    "review-title"
  ],
  [
    "review-title",
    "review-title"
  ]
]
```

The recorder clicked the label "Your name" in the **Desk Lamp** form. What received focus:

```js
{
  "form": "Ceramic Mug",
  "field": "title"
}
```

The wrong field in the wrong form: with duplicate ids, the browser uses the first matching element.

### `useId`

```tsx
function Field({ label, ...props }: { label: string } & ComponentProps<'input'>) {
	const generatedId = useId()
	const id = props.id ?? generatedId
	return (
		<div>
			<label htmlFor={id}>{label}</label>
			<input {...props} id={id} />
		</div>
	)
}
```

```js
[
  [
    "_r_0_",
    "_r_1_"
  ],
  [
    "_r_2_",
    "_r_3_"
  ]
]
```

```js
{
  "form": "Desk Lamp",
  "field": "author"
}
```

Every field got its own id, and the label focused its own input. A caller can still pass an explicit `id`; the component only falls back to the generated one.

## How it works

- **The id comes from the component's position in the tree**, not from a counter. Server and client render the same tree, so they produce the same ids, and hydration matches. A module-level counter can differ between server and client (separate runtimes, different hydration order); `Math.random()` always does.
- **It's stable** for the life of the component: re-renders return the same string. There's no setter because it never needs to change.
- **One call, many ids:** derive related ids from it (`${id}-hint`, `${id}-error`) for `aria-describedby`.
- **Several React roots on one page** can pass `identifierPrefix` to `createRoot` / `hydrateRoot` (and the matching server API) so their ids don't collide.

## Common mistakes

- Using `useId` for list `key`s. Keys must come from the data ([Rendering Arrays](../../fundamentals/rendering-arrays/)).
- Hard-coded ids in reusable components.
- Generating ids with a counter or `Math.random()` in apps that render on the server.

## Interview Q&A

<details class="qa"><summary>What problem does <code>useId</code> solve?</summary>

Unique ids for label/input and `aria-*` pairs inside components that can appear many times. Recorded: with a hard-coded id, clicking a label in the second form focused the first form's input; with `useId` (ids `_r_0_` … `_r_3_`) it focused its own.

</details>

<details class="qa"><summary>Why not <code>Math.random()</code> or a counter?</summary>

They can produce different values on the server and the client, which breaks hydration. `useId` derives the id from the component's place in the tree, which is the same in both.

</details>

<details class="qa"><summary>Can you use <code>useId</code> for list keys?</summary>

No. It identifies a component instance's position, not a data item. Keys must stay with the data as items move.

</details>

<details class="qa"><summary>Why does <code>useId</code> return no setter?</summary>

The id is an identity, not data: it's fixed for the component's lifetime so `htmlFor` and `id` never get out of sync.

</details>

## Related

- [Forms](../../fundamentals/forms/) and [Inputs](../../fundamentals/inputs/) (Fundamentals): labels and accessible fields.

## Sources

- react.dev: [`useId`](https://react.dev/reference/react/useId), [`hydrateRoot` `identifierPrefix`](https://react.dev/reference/react-dom/client/hydrateRoot#parameters)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
