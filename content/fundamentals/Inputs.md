---
source: https://react.dev/reference/react-dom/components/input
---

# Inputs

## In one minute

Inputs work in React as they do in HTML, with one big difference: the `value` prop. An input with `value` is **controlled**: React decides what it shows, so typing does nothing unless an `onChange` updates that value. An input with `defaultValue` (or `defaultChecked`) is **uncontrolled**: the prop is only the starting value, and the browser owns it afterwards. The other surprises are browser rules about what each input puts into `FormData`.

**You'll be able to:** choose between `value` and `defaultValue`, and predict exactly what a form submits.

<!-- figure name="controlledAnim" -->

## The example: value vs defaultValue

<!-- source file="src/lessons/fundamentals/08-inputs.tsx" region="controlled" -->

The recorder typed `XYZ` into the first input and ` XL` into the second:

<!-- output from="fundamentals" path="inputs.controlled.typed" -->

React also printed this warning, because a `value` without `onChange` can never change:

<!-- output from="fundamentals" path="inputs.controlled.warnings" as="log" -->

To make a controlled input editable, store the value in state and update it in `onChange` (the Hooks module does this). For "pre-fill but let the user edit", use `defaultValue`.

## The example: a product review form

<!-- source file="src/lessons/fundamentals/08-inputs.tsx" region="review" -->

Submitted without touching anything:

<!-- output from="fundamentals" path="inputs.untouched.logs" as="log" -->

Submitted after choosing Large, "Great" and ticking "I recommend it":

<!-- output from="fundamentals" path="inputs.filled.logs" as="log" -->

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
- **File inputs** can't have a `value` or `defaultValue` (browsers forbid pre-selecting a file). To clear one, reset the form, set `ref.current.value = ''`, or change its `key` ([[Rendering Arrays]]).

## Common mistakes

- `value` without `onChange` → a read-only field and a warning.
- Switching an input between `value={undefined}` and a string (uncontrolled → controlled); React warns.
- Expecting an unchecked checkbox to send `false`.
- A select whose first option is a real value, silently submitted by people who never opened it.

## Interview Q&A

**Q: What's the difference between `value` and `defaultValue`?**
A: `value` makes the input controlled: React sets it on every render, so the user can't change it unless `onChange` updates the state behind it. Recorded: typing into `<input value="Ceramic Mug" />` left it at `"Ceramic Mug"`. `defaultValue` only sets the first value; the other input became `"Ceramic Mug XL"`.

**Q: How do an unchecked checkbox and an empty radio group appear in FormData?**
A: They don't: their names are missing. The untouched review form submitted `{ productId, size: "", title }` with no `rating` and no `recommend`. A checked checkbox sends `"on"` unless it has a `value`.

**Q: Why does a `<select>` always submit something, but a radio group doesn't?**
A: A select always has a selected option (the first one by default), so it always contributes a value (`size: ""` above, from the placeholder option). Radios have no forced default.

**Q: Why can't you set `value` on a file input?**
A: Browsers block it for security: a page must never choose a file for the user. Reset it with `form.reset()`, `ref.current.value = ''`, or by remounting it with a new `key`.

## Related

- [[Forms]]: how the form is submitted.
- [[Rendering Arrays]]: resetting an input with `key`.

## Sources

- react.dev: [`<input>`](https://react.dev/reference/react-dom/components/input), [`<select>`](https://react.dev/reference/react-dom/components/select), [Controlled and uncontrolled components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- MDN: [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData), [`<input type="checkbox">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
