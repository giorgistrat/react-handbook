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

<figure class="fig anim fig-fund-controlled-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;user types \&quot;X\&quot;&quot;,&quot;say&quot;:&quot;The browser changes both inputs’ DOM value right away.&quot;,&quot;set&quot;:{&quot;p-dom&quot;:&quot;upd&quot;,&quot;d-dom&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;p-dom&quot;:&quot;DOM: Ceramic MugX&quot;,&quot;d-dom&quot;:&quot;DOM: Ceramic MugX&quot;}},{&quot;fn&quot;:&quot;React restores value&quot;,&quot;say&quot;:&quot;For the input with &lt;code&gt;value&lt;/code&gt;, React puts its value back: the prop still says &lt;code&gt;\&quot;Ceramic Mug\&quot;&lt;/code&gt; and nothing changed it.&quot;,&quot;set&quot;:{&quot;p-react&quot;:&quot;cmp&quot;,&quot;p-dom&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;p-dom&quot;:&quot;DOM: Ceramic Mug&quot;}},{&quot;fn&quot;:&quot;defaultValue&quot;,&quot;say&quot;:&quot;The &lt;code&gt;defaultValue&lt;/code&gt; input only used the prop once, at mount. The user’s typing stays.&quot;,&quot;set&quot;:{&quot;d-dom&quot;:&quot;ok&quot;}},{&quot;fn&quot;:&quot;recorded result&quot;,&quot;say&quot;:&quot;After typing &lt;code&gt;XYZ&lt;/code&gt; and &lt;code&gt; XL&lt;/code&gt;: the pinned input still read &lt;code&gt;\&quot;Ceramic Mug\&quot;&lt;/code&gt;, the other &lt;code&gt;\&quot;Ceramic Mug XL\&quot;&lt;/code&gt;. React also warned: “You provided a &lt;code&gt;value&lt;/code&gt; prop to a form field without an &lt;code&gt;onChange&lt;/code&gt; handler…”.&quot;,&quot;set&quot;:{&quot;p-react&quot;:&quot;&quot;,&quot;p-dom&quot;:&quot;bad&quot;,&quot;d-dom&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;d-dom&quot;:&quot;DOM: Ceramic Mug XL&quot;}}]" data-intro="Two inputs that look identical before anyone types."><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">&lt;input value="Ceramic Mug" /&gt;</div><div class="a-col"><span class="an chip-a" data-k="p-dom">DOM: Ceramic Mug</span><span class="an chip-a" data-k="p-react" data-s="faint">React says: Ceramic Mug</span></div></div><div class="a-panel "><div class="a-panel-title">&lt;input defaultValue="Ceramic Mug" /&gt;</div><div class="a-col"><span class="an chip-a" data-k="d-dom">DOM: Ceramic Mug</span><span class="an chip-a" data-k="d-react" data-s="faint">React: not involved after mount</span></div></div></div></div><ol class="anim-print"><li><code>user types "X"</code><span>The browser changes both inputs’ DOM value right away.</span></li><li><code>React restores value</code><span>For the input with <code>value</code>, React puts its value back: the prop still says <code>"Ceramic Mug"</code> and nothing changed it.</span></li><li><code>defaultValue</code><span>The <code>defaultValue</code> input only used the prop once, at mount. The user’s typing stays.</span></li><li><code>recorded result</code><span>After typing <code>XYZ</code> and <code> XL</code>: the pinned input still read <code>"Ceramic Mug"</code>, the other <code>"Ceramic Mug XL"</code>. React also warned: “You provided a <code>value</code> prop to a form field without an <code>onChange</code> handler…”.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="cmp"></i>being compared</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption><code>value</code> means “React decides what this shows”; <code>defaultValue</code> means “start here, then it’s the user’s”.</figcaption></figure>

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
