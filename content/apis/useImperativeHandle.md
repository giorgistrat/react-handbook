---
source: https://react.dev/reference/react/useImperativeHandle
---

# useImperativeHandle

## In one minute

A parent can pass a `ref` to a component. By default, if the component puts that ref on an `<input>`, the parent gets the whole DOM node. `useImperativeHandle(ref, createHandle, deps)` lets the component hand back **its own object** instead, with only the methods it chooses, like `focus()` and `clear()`. It's for **commands**: "focus now", "scroll now", "play now". Those are things that happen once at a moment, not facts the UI should keep showing, so they fit badly in state and props. In React 19, `ref` is a normal prop for function components, so you don't need `forwardRef`.

**You'll be able to:** expose a small imperative API from a component, and explain why a "shouldFocus" prop doesn't work.

<!-- figure name="imperativeAnim" -->

## The example: "Apply coupon"

At checkout, clicking "Apply coupon" with an empty field should put the cursor back in the coupon field, every time.

### 1. With a prop

<!-- source file="src/lessons/apis/05-imperative.tsx" region="flag" -->

Click "Apply coupon", click elsewhere on the page, then click it again:

<!-- output from="apis" path="imperative.flag.first" as="log" -->

The second click logged nothing:

<!-- output from="apis" path="imperative.flag.second" -->

`shouldFocus` was already `true`, so `setShouldFocus(true)` changed nothing: no render and no effect. To make it work, you'd have to reset the flag after focusing, or bump a counter (`setFocusRequest(n => n + 1)`) just to make the effect run again. Both are state that exists only to fake a function call.

### 2. With `useImperativeHandle`

<!-- source file="src/lessons/apis/05-imperative.tsx" region="handle" -->

Same two clicks:

<!-- output from="apis" path="imperative.handle.logs" as="log" -->

Both clicks focused the field, with no state and no render.

### 3. What the parent can reach

<!-- source file="src/lessons/apis/05-imperative.tsx" region="inspect" -->

<!-- output from="apis" path="imperative.inspect.logs" as="log" -->

The parent gets exactly `focus` and `clear`. It can't read `.value`, change `.style` or call anything else on the input. The component can change its markup later without breaking the parent.

## How it works

- **`ref` as a prop.** In React 19 a function component receives `ref` like any other prop. `useImperativeHandle(ref, () => handle)` sets `ref.current` to `handle` during the commit (when refs are attached) and clears it on unmount.
- **The handle is recreated when `deps` change.** Methods that read state must list that state, or they'll see old values. Methods that only use refs, like these, can use `[]`.
- **It's still a ref.** `couponRef.current` is `null` until the child has mounted, so call it from event handlers or effects, not during render.

### State or a command?

Ask: "does this change what's shown?" If yes, it's state or props, like `isOpen`, `value` or `selectedId`. If it's "do this once, now" (focus, scroll into view, play, shake, validate and report), an imperative method is the honest model. Libraries do this too: form libraries expose `setFocus()`, media players `seekTo()`, chart wrappers `resetZoom()`.

## Common mistakes

- **Exposing everything** (`useImperativeHandle(ref, () => inputRef.current)`). That's the DOM node again, with no encapsulation.
- **Using it for things props can express.** "Open the modal" is better as an `open` prop if the parent needs to know whether it's open.
- **Missing dependencies.** A `validate()` that reads state needs that state in `deps`.
- **Calling `ref.current.method()` during render.** Refs are set in the commit.

## Interview Q&A

**Q: What does `useImperativeHandle` do?**
A: It sets the parent's ref to an object you create, instead of a DOM node. `useImperativeHandle(ref, () => ({ focus() {…} }), deps)` gives the parent only the methods you list.

**Q: Why not just a `shouldFocus` prop?**
A: Because focusing is a command, not a state. Recorded: the second "Apply coupon" click did nothing, because `setShouldFocus(true)` on a value that was already `true` causes no render and no effect. The imperative version focused on both clicks.

**Q: How does a function component receive a ref in React 19?**
A: As a regular `ref` prop. Before React 19 you had to wrap the component in `forwardRef`.

**Q: What can the parent do with the handle?**
A: Only what's in it. Recorded: `Object.keys(handle)` was `["focus", "clear"]`, `handle.value` and `handle.style` were `undefined`, and it wasn't an `HTMLInputElement`.

**Q: When would you use it in real code?**
A: Focusing or validating form fields, scrolling a message list to the bottom, play/pause/seek on a media wrapper, wrapping a non-React library (a map, a chart, an animation) behind a few methods.

## Related

- [[DOM Refs and Effect Dependencies]]: refs to DOM nodes.
- [[flushSync]]: focus something you just rendered.
- [[TypeScript with React]]: typing props, including `Ref<…>`.

## Sources

- react.dev: [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle), [`ref` as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
