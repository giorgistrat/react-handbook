---
source: https://react.dev/learn/rendering-lists
---

# Rendering Arrays

## In one minute

When you render a list with `.map()`, React has to work out, on the next render, which new item corresponds to which old one. A **`key`** answers that: it's the item's identity among its siblings. With a stable id as the key, React moves, keeps and deletes the right rows. With no key or the array **index**, React matches by **position**, which goes wrong as soon as items are added, removed or reordered: anything the DOM remembers (typed text, focus, a component's state) stays at the old position and ends up on the wrong item.

**You'll be able to:** choose a key, explain why index keys break, and use `key` on purpose to reset a component.

<!-- figure name="cartKeysAnim" -->

## The example: a cart with gift notes

<!-- source file="src/lessons/fundamentals/10-arrays.tsx" region="cart" -->

The recorder typed "Gift wrap, please" next to the **Ceramic Mug**, then removed the Mug. The rows afterwards:

With `key={item.id}`:

<!-- output from="fundamentals" path="arrays.id.after" -->

With `key={index}`:

<!-- output from="fundamentals" path="arrays.index.after" -->

With no key at all (React also warned):

<!-- output from="fundamentals" path="arrays.none.after" -->

<!-- output from="fundamentals" path="arrays.none.warnings" as="log" -->

Only the id version is right. With index keys, the Headphones got key `0`, the key the Mug's row used to have, so React kept that row (and its input with the note) and just changed its text. No key behaves exactly like index keys, plus a warning.

## Rules for keys

- **Unique among siblings**, not across the app. Two different lists can both use `p1`.
- **Stable**: the same item gets the same key on every render. Never `Math.random()` or `Date.now()` inside `.map()`: a new key each render means a brand-new element each time, so React remounts every row and loses its state.
- **From the data**: a database id, a SKU, a slug. Index keys are only acceptable for lists that never reorder, filter or insert, and whose rows hold no state.
- **Keys aren't props.** The component never receives `key`; pass the id separately if it needs it ([[Raw React APIs]]).

## `key` as a reset button

Changing an element's key tells React "this is a different element": it unmounts the old one (and its state) and mounts a fresh one. That's an easy way to reset a component without writing reset logic:

<!-- source file="src/lessons/fundamentals/10-arrays.tsx" region="reset" -->

<!-- output from="fundamentals" path="arrays.reset" -->

The same trick clears a file input, or resets a whole form or profile page when the selected product id changes: `<ProductEditor key={productId} />`.

## Common mistakes

- `key={index}` on lists that can change.
- Generating keys during render (`key={crypto.randomUUID()}`).
- Putting the key on the wrong element: it belongs on the outermost element returned from `.map()` (often a `<li>` or a component), not inside it.

## Interview Q&A

**Q: Why does React need a `key` when rendering arrays?**
A: To match items between renders. Without identity, a removed first item looks the same as "every item's content shifted up by one", and React updates by position. Keys let it keep, move or delete the element that actually belongs to each item.

**Q: Why is the array index usually a bad key?**
A: The index *is* the position, so it gives React no new information. Recorded: after removing the Mug with index keys, its gift note stayed on row 0, which now showed the Headphones.

**Q: What makes a valid key?**
A: Unique among the siblings in that list, and stable for the same item across renders. Usually an id from the data.

**Q: What else can changing a `key` be used for?**
A: Resetting state: a new key unmounts the old element and mounts a new one. Recorded: a coupon input with `key={resetKey}` went from `"SAVE10"` to `""` when the key changed.

## Related

- [[Reconciliation]] and [[Child Reconciliation Algorithm]] (React Internals): exactly how React compares keyed and unkeyed lists.
- [[Inputs]]: resetting a file input.

## Sources

- react.dev: [Rendering lists](https://react.dev/learn/rendering-lists), [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
