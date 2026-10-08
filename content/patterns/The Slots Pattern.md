---
source: https://react-aria.adobe.com/customization
---

# The Slots Pattern

## In one minute

Compound components give each role its own component (`ToggleOn`, `ToggleOff`). **Slots** go one step further. The root component publishes a map of **props per slot name** in context: `{ label: { htmlFor: id }, input: { id, … } }`. Small generic pieces (`Label`, `Input`, `Text`) look up their slot and merge those props in. The same `Label` then works inside a form field, a toggle or a combobox, and the root still controls the accessibility wiring (`id`s, `htmlFor`, `aria-describedby`). The cost: slot names are strings, so a typo fails silently.

**You'll be able to:** build a slot context with a `useSlotProps` hook, reuse one set of pieces across components, and explain the type-safety trade-off.

<!-- figure name="slotsAnim" -->

## The example: checkout fields

At checkout there's an email field with a description, and the gift-wrap toggle. Both need a label wired to their control.

### 1. The slot context and the pieces

<!-- source file="src/lessons/patterns/04-slots.tsx" region="slots" -->

<!-- source file="src/lessons/patterns/04-slots.tsx" region="parts" -->

### 2. Two roots, one set of pieces

<!-- source file="src/lessons/patterns/04-slots.tsx" region="field" -->

<!-- source file="src/lessons/patterns/04-slots.tsx" region="toggle" -->

### 3. What the consumer writes

<!-- source file="src/lessons/patterns/04-slots.tsx" region="usage" -->

The email field's wiring, recorded from the DOM:

<!-- output from="patterns" path="slots.slots.field" as="json" -->

Clicking the label focused the input, although the input sits inside an extra `div`:

<!-- output from="patterns" path="slots.slots.labelClickFocused" as="text" -->

In the gift-wrap toggle, the **same** `Label` component got the switch's id instead (`label for === switch id` was `true`). The two `Text`s, before and after clicking the switch:

<!-- output from="patterns" path="slots.slots.before" as="log" -->

<!-- output from="patterns" path="slots.slots.after" as="log" -->

### 4. A typo in a slot name

<!-- source file="src/lessons/patterns/04-slots.tsx" region="typo" -->

<!-- output from="patterns" path="slots.typo.field" as="json" -->

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

**Q: What is the slots pattern?**
A: A root component provides a context mapping slot names to props; generic child components read their slot's props and merge them into their own. One `Label` or `Text` component can fill different roles in different parents.

**Q: How is it different from compound components?**
A: Compound components usually have one component per role (`ToggleOn`, `ToggleOff`). Slots share generic pieces across many components, chosen by slot name, so `Label` is written once for a field, a toggle and a combobox.

**Q: Why does the merge order matter?**
A: `{ ...slotProps, ...ownProps }` lets explicit props override the slot's defaults. The reverse would make the consumer unable to customize anything the root sets.

**Q: What's the main downside?**
A: Weak type safety. Slot names are strings, and a typo gives no error. Recorded: `slot="descripton"` left `aria-describedby` pointing at nothing.

**Q: Where is this used for real?**
A: React Aria Components: `Label`, `Input`, `Text slot="description"`, `Button` are reused across `TextField`, `ComboBox`, `NumberField` and more, each root providing its own slot props.

## Related

- [[Compound Components]]: the one-component-per-role version.
- [[The useId Hook]]: the ids the roots generate.
- [[Context with use]]: how the slot map reaches the pieces.

## Sources

- React Aria: [Advanced customization](https://react-aria.adobe.com/customization) (slots and contexts)
- Sandro Roth: [Building component slots in React](https://sandroroth.com/blog/react-slots/)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
