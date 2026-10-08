---
source: https://react.dev/reference/react-dom/createPortal
---

# createPortal

## In one minute

`createPortal(children, domNode)` renders `children` into a **different DOM node**, usually `document.body`, while in React they stay exactly where you wrote them. Only the DOM placement changes. The portaled content still reads the same context, and its events still **bubble through the React tree** to the component that rendered it. Use it for dialogs, tooltips, dropdown menus and toasts: anything that must escape a parent's `overflow: hidden`, `z-index` or `transform`.

**You'll be able to:** render a dialog that no parent can clip, and predict which click handlers run inside a portal.

<!-- figure name="portalAnim" -->

## The example: "Quick view"

A product card has a "Quick view" button that opens a dialog with more details. The card has `overflow: hidden` (for its rounded image corners) and a small hover `transform`.

<!-- source file="src/lessons/apis/03-portal.tsx" region="dialog" -->

### 1. Rendered in place

<!-- source file="src/lessons/apis/03-portal.tsx" region="inline" -->

Recorded after opening it:

<!-- output from="apis" path="portal.inline.where" as="json" -->

The dialog is `position: fixed`, which would normally place it relative to the viewport. But a `transform` on an ancestor makes **that ancestor** the containing block for fixed children, so the dialog was positioned inside the card and clipped by `overflow: hidden`. The Close button at `top: 200` sits below the card's bottom edge (`160`), and nothing visible was under it.

### 2. Rendered through a portal

<!-- source file="src/lessons/apis/03-portal.tsx" region="portal" -->

<!-- output from="apis" path="portal.portal.where" as="json" -->

Its DOM parent is now `body`, so nothing clips it, and it still has the `dark` theme class from the context the card is inside.

### 3. Where does a click go?

The card has a React `onClick`, and the lesson also adds a plain DOM listener to the card for comparison. Clicking Close, in place:

<!-- output from="apis" path="portal.inline.clickClose" as="log" -->

Through the portal:

<!-- output from="apis" path="portal.portal.clickClose" as="log" -->

React's `onClick` on the card ran **in both cases**, because the dialog is the card's child in the React tree. The DOM listener ran only when the dialog was really inside the card in the DOM.

## How it works

- **React tree vs DOM tree.** A portal is a fiber like any other, so context, state, effects and error boundaries all follow the React tree. Only the host DOM nodes are attached under `domNode` instead of the nearest parent DOM node.
- **Events.** React listens at the root container and dispatches events along the fiber tree ([[How React Works, Start to Finish]]). That's why `onClick` on an ancestor component fires for clicks inside its portal. Native listeners follow the DOM. If you need a click inside a dialog not to reach the card's `onClick`, call `e.stopPropagation()` in the dialog.
- **The target node must exist** when the portal renders. `document.body` always does; a custom `#modal-root` must be in the HTML before React renders into it.
- **Accessibility is still your job.** A portal moves DOM; it doesn't add focus trapping, `aria-modal` or Escape handling. The native `<dialog>` element with `showModal()` gives you the top layer, focus handling and Escape, and is worth considering for modals.

## Common mistakes

- **Expecting the portal to stop React events.** Clicks inside it still trigger the card's `onClick` (recorded).
- **Making the dialog `position: fixed` and expecting that to be enough.** It isn't when an ancestor has a `transform`, `filter` or `contain` (recorded: clipped).
- **Portaling to a node that isn't in the document yet.**
- **Forgetting focus.** When a dialog opens, move focus into it, and return focus to the trigger when it closes.

## Interview Q&A

**Q: What does `createPortal` do?**
A: `createPortal(children, domNode)` renders `children`'s DOM into `domNode` instead of the parent component's DOM. In React they're still the parent's children.

**Q: Why use a portal instead of `position: fixed` and a big `z-index`?**
A: Ancestors can still trap the element. `overflow: hidden` clips it, `z-index` only works within the ancestor's stacking context, and a `transform` makes the ancestor the containing block even for `position: fixed`. Recorded: the in-place dialog was clipped by the card; the portaled one wasn't.

**Q: Do events inside a portal bubble to the parent component?**
A: Yes. React events follow the React tree, not the DOM tree. Recorded: clicking Close in the portaled dialog ran the card's React `onClick`, but not a plain DOM listener on the card.

**Q: Does portaled content see the parent's context?**
A: Yes. Context comes from the React tree. Recorded: the portaled dialog got the card's `dark` theme.

**Q: Name common uses.**
A: Modals, tooltips and popovers, dropdown menus inside scrolling containers, toasts, and rendering into a DOM node owned by a non-React part of the page.

## Related

- [[Context with use]]: context passes through portals.
- [[useLayoutEffect]]: positioning a tooltip, which is often portaled.
- [[How React Works, Start to Finish]]: how React dispatches events from the root.

## Sources

- react.dev: [`createPortal`](https://react.dev/reference/react-dom/createPortal)
- MDN: [Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block) (why a `transform` traps `position: fixed`), [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
