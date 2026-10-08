---
title: "Forms"
slug: "forms"
module: "fundamentals"
order: 6
level: "must"
illus: "plane"
summary: "One seller form submitted three ways: GET leaks the password into the URL, multipart sends the file, a React action does it all for you."
source: "https://react.dev/reference/react-dom/components/form"
---


## In one minute

Forms are mostly a browser feature. When a form is submitted, the browser collects every field with a `name` into **`FormData`** and sends it to the form's `action` URL: by default with **GET**, which puts the fields in the URL. React adds one thing on top: you can pass a **function** as `action`. React then builds the `FormData`, stops the page from navigating, calls your function, and resets the form afterwards.

**You'll be able to:** pick the right `method` and `encType`, explain what each one changes, and use a React form action instead of `onSubmit` + `preventDefault`.

<figure class="fig anim fig-fund-submit-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Default (GET)</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">POST + multipart</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">React action</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;submit&quot;,&quot;say&quot;:&quot;Clicking a &lt;code&gt;type=\&quot;submit\&quot;&lt;/code&gt; button submits its form.&quot;,&quot;set&quot;:{&quot;click&quot;:&quot;hl&quot;}},{&quot;fn&quot;:&quot;new FormData(form)&quot;,&quot;say&quot;:&quot;The browser reads every field with a &lt;code&gt;name&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;fd&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;GET /submitted.html?…&quot;,&quot;say&quot;:&quot;With the default &lt;code&gt;GET&lt;/code&gt;, fields become the &lt;b&gt;URL&lt;/b&gt;. Recorded address: &lt;code&gt;…&amp;amp;password=hunter2&amp;amp;logo=logo.svg&lt;/code&gt;. The password is now in the history, and the file is only its name.&quot;,&quot;set&quot;:{&quot;req&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;req&quot;:&quot;GET ?storeName=…&amp;amp;password=hunter2&amp;amp;logo=logo.svg&quot;}},{&quot;fn&quot;:&quot;navigate&quot;,&quot;say&quot;:&quot;The browser leaves the page (a full reload).&quot;,&quot;set&quot;:{&quot;res&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;new page: submitted.html&quot;}}]" data-intro="&lt;code&gt;&amp;lt;form action=&quot;/submitted.html&quot;&amp;gt;&lt;/code&gt;"><div class="anim-scn-title">Default (GET)</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">the form</div><div class="a-col"><div class="an call" data-k="form"><code>&lt;form action="/submitted.html"&gt;</code></div><span class="an chip-a" data-k="click">click “Create store”</span></div></div><div class="a-panel "><div class="a-panel-title">browser</div><div class="a-col"><span class="an chip-a" data-k="fd" data-s="ghost">collects named fields → FormData</span><span class="an chip-a" data-k="req" data-s="ghost">request</span></div></div><div class="a-panel "><div class="a-panel-title">result</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="faint">page</span></div></div></div></div><ol class="anim-print"><li><code>submit</code><span>Clicking a <code>type="submit"</code> button submits its form.</span></li><li><code>new FormData(form)</code><span>The browser reads every field with a <code>name</code>.</span></li><li><code>GET /submitted.html?…</code><span>With the default <code>GET</code>, fields become the <b>URL</b>. Recorded address: <code>…&amp;password=hunter2&amp;logo=logo.svg</code>. The password is now in the history, and the file is only its name.</span></li><li><code>navigate</code><span>The browser leaves the page (a full reload).</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;fn&quot;:&quot;submit&quot;,&quot;say&quot;:&quot;Same click.&quot;,&quot;set&quot;:{&quot;click&quot;:&quot;hl&quot;}},{&quot;fn&quot;:&quot;new FormData(form)&quot;,&quot;say&quot;:&quot;Same fields.&quot;,&quot;set&quot;:{&quot;fd&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;POST multipart/form-data&quot;,&quot;say&quot;:&quot;&lt;code&gt;method=\&quot;POST\&quot;&lt;/code&gt; puts the fields in the request &lt;b&gt;body&lt;/b&gt;; &lt;code&gt;multipart/form-data&lt;/code&gt; sends each field as a part, including the file’s real bytes (the server received the SVG).&quot;,&quot;set&quot;:{&quot;req&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;req&quot;:&quot;POST body: storeName · email · password · logo.svg (bytes)&quot;}},{&quot;fn&quot;:&quot;navigate&quot;,&quot;say&quot;:&quot;Still a full page load, unless you stop it with &lt;code&gt;event.preventDefault()&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;res&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;new page: submitted.html&quot;}}]" data-intro="&lt;code&gt;method=&quot;POST&quot; encType=&quot;multipart/form-data&quot;&lt;/code&gt;"><div class="anim-scn-title">POST + multipart</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">the form</div><div class="a-col"><div class="an call" data-k="form"><code>&lt;form method="POST" encType="multipart/form-data"&gt;</code></div><span class="an chip-a" data-k="click">click “Create store”</span></div></div><div class="a-panel "><div class="a-panel-title">browser</div><div class="a-col"><span class="an chip-a" data-k="fd" data-s="ghost">collects named fields → FormData</span><span class="an chip-a" data-k="req" data-s="ghost">request</span></div></div><div class="a-panel "><div class="a-panel-title">result</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="faint">page</span></div></div></div></div><ol class="anim-print"><li><code>submit</code><span>Same click.</span></li><li><code>new FormData(form)</code><span>Same fields.</span></li><li><code>POST multipart/form-data</code><span><code>method="POST"</code> puts the fields in the request <b>body</b>; <code>multipart/form-data</code> sends each field as a part, including the file’s real bytes (the server received the SVG).</span></li><li><code>navigate</code><span>Still a full page load, unless you stop it with <code>event.preventDefault()</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;fn&quot;:&quot;submit&quot;,&quot;say&quot;:&quot;Same click.&quot;,&quot;set&quot;:{&quot;click&quot;:&quot;hl&quot;}},{&quot;fn&quot;:&quot;new FormData(form)&quot;,&quot;say&quot;:&quot;React builds the &lt;code&gt;FormData&lt;/code&gt; for you…&quot;,&quot;set&quot;:{&quot;fd&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;createStore(formData)&quot;,&quot;say&quot;:&quot;…prevents the navigation, and calls your function. Recorded: &lt;code&gt;action received: { storeName: \&quot;Mugs &amp;amp; More\&quot;, … }&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;req&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;req&quot;:&quot;no request: your function runs&quot;}},{&quot;fn&quot;:&quot;form.reset()&quot;,&quot;say&quot;:&quot;Afterwards React resets the uncontrolled fields. Recorded: the store-name input was &lt;code&gt;\&quot;\&quot;&lt;/code&gt; after submitting, and the URL didn’t change.&quot;,&quot;set&quot;:{&quot;res&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;same page, fields reset&quot;}}]" data-intro="&lt;code&gt;&amp;lt;form action={createStore}&amp;gt;&lt;/code&gt;"><div class="anim-scn-title">React action</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">the form</div><div class="a-col"><div class="an call" data-k="form"><code>&lt;form action={createStore}&gt;</code></div><span class="an chip-a" data-k="click">click “Create store”</span></div></div><div class="a-panel "><div class="a-panel-title">browser</div><div class="a-col"><span class="an chip-a" data-k="fd" data-s="ghost">collects named fields → FormData</span><span class="an chip-a" data-k="req" data-s="ghost">request</span></div></div><div class="a-panel "><div class="a-panel-title">result</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="faint">page</span></div></div></div></div><ol class="anim-print"><li><code>submit</code><span>Same click.</span></li><li><code>new FormData(form)</code><span>React builds the <code>FormData</code> for you…</span></li><li><code>createStore(formData)</code><span>…prevents the navigation, and calls your function. Recorded: <code>action received: { storeName: "Mugs &amp; More", … }</code>.</span></li><li><code>form.reset()</code><span>Afterwards React resets the uncontrolled fields. Recorded: the store-name input was <code>""</code> after submitting, and the URL didn’t change.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The same “Become a seller” form submitted three ways (all three recorded).</figcaption></figure>

## The example: "Become a seller"

The product store lets people open their own store. All four lessons share the same fields:

```tsx
<label htmlFor="store">Store name</label>
<input id="store" name="storeName" type="text" />
<label htmlFor="email">Email</label>
<input id="email" name="email" type="email" />
<label htmlFor="password">Password</label>
<input id="password" name="password" type="password" />
<label htmlFor="logo">Logo</label>
<input id="logo" name="logo" type="file" accept="image/*" />
<button type="submit">Create store</button>
```

The recorder typed "Mugs & More", `sam@example.com`, `hunter2` and attached `logo.svg`, then submitted each version.

### 1. The default: GET

```tsx
r.render(
	<form action="/submitted.html">
		<Fields />
	</form>,
)
```

The address the browser navigated to:

```text
/submitted.html?storeName=Mugs+%26+More&email=sam%40example.com&password=hunter2&logo=logo.svg
```

Every field is in the URL, **including the password**: it ends up in browser history, server logs and analytics. And the file is only its name.

### 2. POST, but without an encoding

`method="POST"` moves the fields into the request body. What the server received:

```js
{
  "contentType": "application/x-www-form-urlencoded",
  "body": "storeName=Mugs+%26+More&email=sam%40example.com&password=hunter2&logo=logo.svg",
  "containsFileBytes": false
}
```

The password left the URL, but the default encoding (`application/x-www-form-urlencoded`) can only send text, so the file is still just `logo.svg`.

### 3. POST + `multipart/form-data`

```tsx
r.render(
	<form action="/submitted.html" method="POST" encType="multipart/form-data">
		<Fields />
	</form>,
)
```

```text
------boundary
Content-Disposition: form-data; name="storeName"

Mugs & More
------boundary
Content-Disposition: form-data; name="email"

sam@example.com
------boundary
Content-Disposition: form-data; name="password"

hunter2
------boundary
Content-Disposition: form-data; name="logo"; filename="logo.svg"
Content-Type: image/svg+xml

<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#cba6f7"/></svg>

------boundary
```

Each field is a separate part, and the logo's actual bytes (the SVG) are in the body. All three versions still **reload the page**; with plain `onSubmit` you'd call `event.preventDefault()` and build `new FormData(event.currentTarget)` yourself.

### 4. A React action

```tsx
function createStore(formData: FormData) {
	const { password, logo, ...rest } = Object.fromEntries(formData)
	log('action received:', { ...rest, password: password ? '(hidden)' : '', logo: (logo as File).name })
}

r.render(
	<form action={createStore}>
		<Fields />
	</form>,
)
```

```text
action received: {"storeName":"Mugs & More","email":"sam@example.com","password":"(hidden)","logo":"logo.svg"}
```

The URL didn't change (`sameUrl: true`) and the store-name field was empty afterwards: React reset the form. No `preventDefault`, no `new FormData`. A function `action` can also be `async`, and React 19's `useActionState` and `useFormStatus` build on it to show pending states and results (covered in the Suspense module).

## How it works

- **Only named fields are sent.** No `name`, no entry in `FormData`.
- **`method`**: `GET` (default) → fields in the URL; `POST` → fields in the body.
- **`encType`**: `application/x-www-form-urlencoded` (default, text only) or `multipart/form-data` (needed for files).
- **A function `action` is React-only.** HTML attributes are strings; React intercepts the submit when you pass a function.
- **Labels matter.** `htmlFor`/`id` (or wrapping the input in the `<label>`) gives the input an accessible name and a bigger click target.
- **Give every button a `type`.** A `<button>` inside a form defaults to `type="submit"`.

## Common mistakes

- Leaving login or signup forms on GET.
- Uploading files without `encType="multipart/form-data"` and receiving only file names.
- `onSubmit` without `event.preventDefault()`: the page reloads and your state is lost.
- Untyped buttons (`<button>Show password</button>`) submitting the form.

## Interview Q&A

<details class="qa"><summary>Why not leave a form on the default GET method?</summary>

GET serializes every field into the URL. The recording navigated to `…&password=hunter2&logo=logo.svg`: the password is now in the history and in server logs. POST puts fields in the request body.

</details>

<details class="qa"><summary>Why do file uploads need <code>encType="multipart/form-data"</code>?</summary>

The default encoding can only carry text, so a file input is sent as its file name (`logo=logo.svg` in the recorded POST body). Multipart sends each field as its own part, including the file's bytes; the server received the SVG's contents.

</details>

<details class="qa"><summary>What does passing a function to <code>action</code> do?</summary>

React calls it with the form's `FormData`, prevents the browser's navigation, and resets the form's uncontrolled fields when the action finishes. It replaces the `onSubmit` + `preventDefault` + `new FormData(event.currentTarget)` boilerplate. HTML can't do this: attributes are strings.

</details>

<details class="qa"><summary>How do <code>useActionState</code> and <code>useFormStatus</code> relate to form actions?</summary>

Both build on function actions (React 19). `useActionState` wraps an action and tracks its result and pending state across submissions; `useFormStatus` lets a component inside the form, such as the submit button, read whether the form is submitting, without passing props.

</details>

## Related

- [Inputs](../../fundamentals/inputs/): what each kind of input puts in `FormData`.
- [Error Boundaries](../../fundamentals/error-boundaries/): reporting errors thrown in an action.

## Sources

- react.dev: [`<form>`](https://react.dev/reference/react-dom/components/form), [`useActionState`](https://react.dev/reference/react/useActionState), [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)
- MDN: [Sending form data](https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_and_retrieving_form_data), [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
