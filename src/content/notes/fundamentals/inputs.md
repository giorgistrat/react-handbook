---
title: "Inputs"
slug: "inputs"
module: "fundamentals"
order: 7
level: "must"
illus: "list"
summary: "value vs defaultValue (controlled vs uncontrolled), and exactly what checkboxes, radios, selects and hidden inputs put in FormData."
source: "https://react.dev/reference/react-dom/components/input"
---


## In one minute

Inputs work in React as they do in HTML, with one big difference: the `value` prop. An input with `value` is **controlled**: React decides what it shows, so typing does nothing unless an `onChange` updates that value. An input with `defaultValue` (or `defaultChecked`) is **uncontrolled**: the prop is only the starting value, and the browser owns it afterwards. The other surprises are browser rules about what each input puts into `FormData`.

**You'll be able to:** choose between `value` and `defaultValue`, and predict exactly what a form submits.

<figure class="fig anim fig-fund-controlled-anim anim-code" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;say&quot;:&quot;The user types in both. The browser updates each input’s text right away.&quot;,&quot;set&quot;:{&quot;s-pinned&quot;:&quot;upd&quot;,&quot;s-prefilled&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;s-pinned&quot;:&quot;Ceramic MugXYZ&quot;,&quot;s-prefilled&quot;:&quot;Ceramic Mug XL&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;input id=\&quot;pinned\&quot; value=\&quot;Ceramic Mug\&quot; /&gt;&quot;,&quot;say&quot;:&quot;For the first input, React puts its value back: the &lt;code&gt;value&lt;/code&gt; prop still says &lt;code&gt;\&quot;Ceramic Mug\&quot;&lt;/code&gt;, and nothing changed it.&quot;,&quot;set&quot;:{&quot;s-pinned&quot;:&quot;bad&quot;,&quot;s-prefilled&quot;:&quot;&quot;,&quot;L0&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;s-pinned&quot;:&quot;Ceramic Mug&quot;}},{&quot;fn&quot;:&quot;&lt;input id=\&quot;prefilled\&quot; defaultValue=\&quot;Ceramic Mug\&quot; /&gt;&quot;,&quot;say&quot;:&quot;The &lt;code&gt;defaultValue&lt;/code&gt; input used the prop only once, when it mounted. The typing stays.&quot;,&quot;set&quot;:{&quot;L0&quot;:&quot;&quot;,&quot;s-pinned&quot;:&quot;&quot;,&quot;L2&quot;:&quot;hl&quot;,&quot;s-prefilled&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;s-prefilled&quot;:&quot;Ceramic Mug XL&quot;}},{&quot;fn&quot;:&quot;&lt;input id=\&quot;pinned\&quot; value=\&quot;Ceramic Mug\&quot; /&gt;&quot;,&quot;say&quot;:&quot;React also warned that a &lt;code&gt;value&lt;/code&gt; without an &lt;code&gt;onChange&lt;/code&gt; makes a read-only field. Fix: add &lt;code&gt;onChange&lt;/code&gt; with state, or use &lt;code&gt;defaultValue&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;L2&quot;:&quot;&quot;,&quot;s-prefilled&quot;:&quot;&quot;,&quot;L0&quot;:&quot;hl&quot;,&quot;s-warn&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-warn&quot;:&quot;Console: “You provided a `value` prop to a form field without an `onChange` handler…”&quot;}}]" data-intro="Two inputs that look the same until someone types."><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">Inputs.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"pinned"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> value</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"Ceramic Mug"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">input</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> id</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"prefilled"</span><span style="--shiki-light:#DF8E1D;--shiki-dark:#F9E2AF"> defaultValue</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">=</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">"Ceramic Mug"</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> /></span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-input" data-k="s-pinned">Ceramic Mug</div><div class="an ca-item ca-input" data-k="s-prefilled">Ceramic Mug</div><div class="an ca-item ca-muted" data-k="s-warn">Console: –</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><span>The user types in both. The browser updates each input’s text right away.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;input id="pinned" value="Ceramic Mug" /&gt;</code><span>For the first input, React puts its value back: the <code>value</code> prop still says <code>"Ceramic Mug"</code>, and nothing changed it.</span></li><li><code>&lt;input id="prefilled" defaultValue="Ceramic Mug" /&gt;</code><span>The <code>defaultValue</code> input used the prop only once, when it mounted. The typing stays.</span></li><li><code>&lt;input id="pinned" value="Ceramic Mug" /&gt;</code><span>React also warned that a <code>value</code> without an <code>onChange</code> makes a read-only field. Fix: add <code>onChange</code> with state, or use <code>defaultValue</code>.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption><code>value</code> means “React decides what this shows”; <code>defaultValue</code> means “start here, then it’s the user’s” (recorded).</figcaption></figure>

## The example: value vs defaultValue

```tsx
r.render(
	<>
		<input id="pinned" value="Ceramic Mug" />
		<input id="prefilled" defaultValue="Ceramic Mug" />
	</>,
)
```

The recorder typed `XYZ` into the first input and ` XL` into the second:

```js
{
  "pinned": "Ceramic Mug",
  "prefilled": "Ceramic Mug XL"
}
```

React also printed this warning, because a `value` without `onChange` can never change:

```text
You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.
```

To make a controlled input editable, store the value in state and update it in `onChange` (the Hooks module does this). For "pre-fill but let the user edit", use `defaultValue`.

## The example: a product review form

```tsx
function submitReview(formData: FormData) {
	log('FormData:', Object.fromEntries(formData))
}

r.render(
	<form action={submitReview}>
		<input type="hidden" name="productId" value="p1" />

		<label htmlFor="size">Size bought</label>
		<select id="size" name="size">
			<option value="">Please choose</option>
			<option value="small">Small</option>
			<option value="large">Large</option>
		</select>

		<fieldset>
			<legend>Rating</legend>
			<label><input type="radio" name="rating" value="5" /> Great</label>
			<label><input type="radio" name="rating" value="3" /> Okay</label>
		</fieldset>

		<label><input type="checkbox" name="recommend" /> I recommend it</label>

		<label htmlFor="title">Title</label>
		<input id="title" name="title" defaultValue="Love it" />

		<button type="submit">Post review</button>
	</form>,
)
```

Submitted without touching anything:

```text
FormData: {"productId":"p1","size":"","title":"Love it"}
```

Submitted after choosing Large, "Great" and ticking "I recommend it":

```text
FormData: {"productId":"p1","size":"large","rating":"5","recommend":"on","title":"Love it"}
```

## What ends up in FormData

| Input | Not touched | Chosen / checked |
|---|---|---|
| `<input type="hidden">` | always sent (`productId: "p1"`) | — |
| `<select>` | the **first** option's value (`size: ""`) | the chosen value |
| radio group | **missing** | the checked radio's `value` |
| checkbox | **missing** (never `false`) | `"on"`, or its `value` if set |
| text with `defaultValue` | the default (`title: "Love it"`) | what the user typed |
| file | the file, if one was picked | — |

So read a checkbox with `formData.has('recommend')`, and put a "Please choose" option first in a `<select>` unless a real value should be pre-selected.

## How it works

- **Group radios** with the same `name`, and label the group with `<fieldset>` + `<legend>`.
- **Hidden inputs** send values the user doesn't need to see (an id, a context).
- **Everything is a string** in `FormData`: `defaultValue={18}` and `"18"` are the same; a date's value is `YYYY-MM-DD`.
- **File inputs** can't have a `value` or `defaultValue` (browsers forbid pre-selecting a file). To clear one, reset the form, set `ref.current.value = ''`, or change its `key` ([Rendering Arrays](../../fundamentals/rendering-arrays/)).

## Common mistakes

- `value` without `onChange` → a read-only field and a warning.
- Switching an input between `value={undefined}` and a string (uncontrolled → controlled); React warns.
- Expecting an unchecked checkbox to send `false`.
- A select whose first option is a real value, silently submitted by people who never opened it.

## Interview Q&A

<details class="qa"><summary>What's the difference between <code>value</code> and <code>defaultValue</code>?</summary>

`value` makes the input controlled: React sets it on every render, so the user can't change it unless `onChange` updates the state behind it. Recorded: typing into `<input value="Ceramic Mug" />` left it at `"Ceramic Mug"`. `defaultValue` only sets the first value; the other input became `"Ceramic Mug XL"`.

</details>

<details class="qa"><summary>How do an unchecked checkbox and an empty radio group appear in FormData?</summary>

They don't: their names are missing. The untouched review form submitted `{ productId, size: "", title }` with no `rating` and no `recommend`. A checked checkbox sends `"on"` unless it has a `value`.

</details>

<details class="qa"><summary>Why does a <code>&lt;select&gt;</code> always submit something, but a radio group doesn't?</summary>

A select always has a selected option (the first one by default), so it always contributes a value (`size: ""` above, from the placeholder option). Radios have no forced default.

</details>

<details class="qa"><summary>Why can't you set <code>value</code> on a file input?</summary>

Browsers block it for security: a page must never choose a file for the user. Reset it with `form.reset()`, `ref.current.value = ''`, or by remounting it with a new `key`.

</details>

## Related

- [Forms](../../fundamentals/forms/): how the form is submitted.
- [Rendering Arrays](../../fundamentals/rendering-arrays/): resetting an input with `key`.

## Sources

- react.dev: [`<input>`](https://react.dev/reference/react-dom/components/input), [`<select>`](https://react.dev/reference/react-dom/components/select), [Controlled and uncontrolled components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- MDN: [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData), [`<input type="checkbox">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
