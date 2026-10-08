---
source: https://react.dev/reference/react-dom/components/form
---

# Forms

## In one minute

Forms are mostly a browser feature. When a form is submitted, the browser collects every field with a `name` into **`FormData`** and sends it to the form's `action` URL: by default with **GET**, which puts the fields in the URL. React adds one thing on top: you can pass a **function** as `action`. React then builds the `FormData`, stops the page from navigating, calls your function, and resets the form afterwards.

**You'll be able to:** pick the right `method` and `encType`, explain what each one changes, and use a React form action instead of `onSubmit` + `preventDefault`.

<!-- figure name="submitAnim" -->

## The example: "Become a seller"

The product store lets people open their own store. All four lessons share the same fields:

<!-- source file="src/lessons/fundamentals/07-forms.tsx" region="fields" -->

The recorder typed "Mugs & More", `sam@example.com`, `hunter2` and attached `logo.svg`, then submitted each version.

### 1. The default: GET

<!-- source file="src/lessons/fundamentals/07-forms.tsx" region="get" -->

The address the browser navigated to:

<!-- output from="fundamentals" path="forms.get.url" as="text" -->

Every field is in the URL, **including the password**: it ends up in browser history, server logs and analytics. And the file is only its name.

### 2. POST, but without an encoding

`method="POST"` moves the fields into the request body. What the server received:

<!-- output from="fundamentals" path="forms.postPlain.request" -->

The password left the URL, but the default encoding (`application/x-www-form-urlencoded`) can only send text, so the file is still just `logo.svg`.

### 3. POST + `multipart/form-data`

<!-- source file="src/lessons/fundamentals/07-forms.tsx" region="post" -->

<!-- output from="fundamentals" path="forms.post.request.body" as="text" -->

Each field is a separate part, and the logo's actual bytes (the SVG) are in the body. All three versions still **reload the page**; with plain `onSubmit` you'd call `event.preventDefault()` and build `new FormData(event.currentTarget)` yourself.

### 4. A React action

<!-- source file="src/lessons/fundamentals/07-forms.tsx" region="action" -->

<!-- output from="fundamentals" path="forms.action.logs" as="log" -->

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

**Q: Why not leave a form on the default GET method?**
A: GET serializes every field into the URL. The recording navigated to `…&password=hunter2&logo=logo.svg`: the password is now in the history and in server logs. POST puts fields in the request body.

**Q: Why do file uploads need `encType="multipart/form-data"`?**
A: The default encoding can only carry text, so a file input is sent as its file name (`logo=logo.svg` in the recorded POST body). Multipart sends each field as its own part, including the file's bytes; the server received the SVG's contents.

**Q: What does passing a function to `action` do?**
A: React calls it with the form's `FormData`, prevents the browser's navigation, and resets the form's uncontrolled fields when the action finishes. It replaces the `onSubmit` + `preventDefault` + `new FormData(event.currentTarget)` boilerplate. HTML can't do this: attributes are strings.

**Q: How do `useActionState` and `useFormStatus` relate to form actions?**
A: Both build on function actions (React 19). `useActionState` wraps an action and tracks its result and pending state across submissions; `useFormStatus` lets a component inside the form, such as the submit button, read whether the form is submitting, without passing props.

## Related

- [[Inputs]]: what each kind of input puts in `FormData`.
- [[Error Boundaries]]: reporting errors thrown in an action.

## Sources

- react.dev: [`<form>`](https://react.dev/reference/react-dom/components/form), [`useActionState`](https://react.dev/reference/react/useActionState), [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus)
- MDN: [Sending form data](https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_and_retrieving_form_data), [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
