---
title: "createPortal"
slug: "createportal"
module: "apis"
order: 2
level: "must"
illus: "map"
summary: "Render a dialog into document.body so a clipping parent can’t hide it; events and context still follow the React tree."
source: "https://react.dev/reference/react-dom/createPortal"
---


## In one minute

`createPortal(children, domNode)` renders `children` into a **different DOM node**, usually `document.body`, while in React they stay exactly where you wrote them. Only the DOM placement changes. The portaled content still reads the same context, and its events still **bubble through the React tree** to the component that rendered it. Use it for dialogs, tooltips, dropdown menus and toasts: anything that must escape a parent's `overflow: hidden`, `z-index` or `transform`.

**You'll be able to:** render a dialog that no parent can clip, and predict which click handlers run inside a portal.

<figure class="fig anim fig-apis-portal-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">In place</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">createPortal</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;{open &amp;&amp; &lt;QuickView /&gt;}&quot;,&quot;say&quot;:&quot;Rendered in place: the dialog’s DOM goes &lt;b&gt;inside&lt;/b&gt; the card.&quot;,&quot;set&quot;:{&quot;qvr&quot;:&quot;new&quot;,&quot;qv&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;overflow: hidden&quot;,&quot;say&quot;:&quot;The card (&lt;code&gt;article&lt;/code&gt;, with &lt;code&gt;overflow: hidden&lt;/code&gt;) clips everything outside its box. (The dialog is &lt;code&gt;position: fixed&lt;/code&gt;, but the card’s hover &lt;code&gt;transform&lt;/code&gt; makes the card its containing block.) Recorded: the Close button isn’t visible.&quot;,&quot;set&quot;:{&quot;art&quot;:&quot;bad&quot;,&quot;qv&quot;:&quot;bad&quot;,&quot;seen&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;seen&quot;:&quot;Close button clipped&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click Close&quot;,&quot;say&quot;:&quot;The click bubbles through the DOM &lt;b&gt;and&lt;/b&gt; through React: both the plain DOM listener and React’s &lt;code&gt;onClick&lt;/code&gt; on the card run.&quot;,&quot;set&quot;:{&quot;ev1&quot;:&quot;run&quot;,&quot;ev2&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;ev1&quot;:&quot;card onClick ran&quot;,&quot;ev2&quot;:&quot;card DOM listener ran&quot;}}]" data-intro="The dialog is rendered inside the card."><div class="anim-scn-title">In place</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">DOM tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node host sm" data-k="body"><span class="node-label" data-k="body-label">body</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="root"><span class="node-label" data-k="root-label">#root</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="art"><span class="node-label" data-k="art-label">article</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="qv" data-s="ghost"><span class="node-label" data-k="qv-label">dialog</span></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">React tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="card"><span class="node-label" data-k="card-label">Card</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="qvr" data-s="ghost"><span class="node-label" data-k="qvr-label">QuickView</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">what happened</div><div class="a-col"><span class="an chip-a" data-k="seen" data-s="faint">dialog: not open</span><span class="an chip-a" data-k="ev1" data-s="ghost">card onClick (React)</span><span class="an chip-a" data-k="ev2" data-s="ghost">card DOM listener</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>{open &amp;&amp; &lt;QuickView /&gt;}</code><span>Rendered in place: the dialog’s DOM goes <b>inside</b> the card.</span></li><li><span class="anim-phase ph-paint">browser</span><code>overflow: hidden</code><span>The card (<code>article</code>, with <code>overflow: hidden</code>) clips everything outside its box. (The dialog is <code>position: fixed</code>, but the card’s hover <code>transform</code> makes the card its containing block.) Recorded: the Close button isn’t visible.</span></li><li><span class="anim-phase ph-event">event</span><code>click Close</code><span>The click bubbles through the DOM <b>and</b> through React: both the plain DOM listener and React’s <code>onClick</code> on the card run.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createPortal(&lt;QuickView /&gt;, document.body)&quot;,&quot;say&quot;:&quot;Same component, but its DOM goes straight into &lt;code&gt;&amp;lt;body&amp;gt;&lt;/code&gt;. In the React tree it’s still the card’s child.&quot;,&quot;set&quot;:{&quot;qvr&quot;:&quot;new&quot;,&quot;qv&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;nothing clips it&quot;,&quot;say&quot;:&quot;Recorded: parent &lt;code&gt;body&lt;/code&gt;, Close button visible. It also still reads the card’s context: the dialog got the &lt;code&gt;dark&lt;/code&gt; theme class.&quot;,&quot;set&quot;:{&quot;qv&quot;:&quot;ok&quot;,&quot;seen&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;seen&quot;:&quot;fully visible, theme: dark&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click Close&quot;,&quot;say&quot;:&quot;React events follow the &lt;b&gt;React&lt;/b&gt; tree, so the card’s &lt;code&gt;onClick&lt;/code&gt; still runs. The DOM listener doesn’t: in the DOM, the dialog isn’t inside the card.&quot;,&quot;set&quot;:{&quot;qvr&quot;:&quot;hl&quot;,&quot;card&quot;:&quot;run&quot;,&quot;ev1&quot;:&quot;run&quot;,&quot;ev2&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;ev1&quot;:&quot;card onClick ran&quot;,&quot;ev2&quot;:&quot;DOM listener: not run&quot;}}]" data-intro="The dialog is portaled to &lt;code&gt;document.body&lt;/code&gt;."><div class="anim-scn-title">createPortal</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">DOM tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node host sm" data-k="body"><span class="node-label" data-k="body-label">body</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="root"><span class="node-label" data-k="root-label">#root</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="art"><span class="node-label" data-k="art-label">article</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="qv" data-s="ghost"><span class="node-label" data-k="qv-label">dialog</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">React tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="card"><span class="node-label" data-k="card-label">Card</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="qvr" data-s="ghost"><span class="node-label" data-k="qvr-label">QuickView</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">what happened</div><div class="a-col"><span class="an chip-a" data-k="seen" data-s="faint">dialog: not open</span><span class="an chip-a" data-k="ev1" data-s="ghost">card onClick (React)</span><span class="an chip-a" data-k="ev2" data-s="ghost">card DOM listener</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>createPortal(&lt;QuickView /&gt;, document.body)</code><span>Same component, but its DOM goes straight into <code>&lt;body&gt;</code>. In the React tree it’s still the card’s child.</span></li><li><span class="anim-phase ph-paint">browser</span><code>nothing clips it</code><span>Recorded: parent <code>body</code>, Close button visible. It also still reads the card’s context: the dialog got the <code>dark</code> theme class.</span></li><li><span class="anim-phase ph-event">event</span><code>click Close</code><span>React events follow the <b>React</b> tree, so the card’s <code>onClick</code> still runs. The DOM listener doesn’t: in the DOM, the dialog isn’t inside the card.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="skip"></i>skipped</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The “Quick view” dialog, rendered in place and through a portal (both recorded).</figcaption></figure>

## The example: "Quick view"

A product card has a "Quick view" button that opens a dialog with more details. The card has `overflow: hidden` (for its rounded image corners) and a small hover `transform`.

```tsx
function QuickView({ onClose }: { onClose: () => void }) {
	const theme = use(ThemeContext)
	return (
		<div className={`quick-view ${theme}`} role="dialog" aria-label="Quick view">
			<h2>Trail Backpack</h2>
			<p>28 L · water resistant · $64.00</p>
			<button id="close" onClick={onClose}>Close</button>
		</div>
	)
}
```

### 1. Rendered in place

```tsx
function CardInline() {
	const [open, setOpen] = useState(false)
	return (
		<article className="clip-card" onClick={() => log('card onClick ran')}>
			<h2>Trail Backpack</h2>
			<button id="open" onClick={() => setOpen(true)}>Quick view</button>
			{open && <QuickView onClose={() => setOpen(false)} />}
		</article>
	)
}
```

Recorded after opening it:

```js
{
  "parent": "article.clip-card",
  "closeButtonVisible": false,
  "card": {
    "bottom": 160,
    "right": 290
  },
  "close": {
    "top": 200,
    "left": 103
  },
  "themeClass": "quick-view dark"
}
```

The dialog is `position: fixed`, which would normally place it relative to the viewport. But a `transform` on an ancestor makes **that ancestor** the containing block for fixed children, so the dialog was positioned inside the card and clipped by `overflow: hidden`. The Close button at `top: 200` sits below the card's bottom edge (`160`), and nothing visible was under it.

### 2. Rendered through a portal

```tsx
function CardPortal() {
	const [open, setOpen] = useState(false)
	return (
		<article className="clip-card" onClick={() => log('card onClick ran')}>
			<h2>Trail Backpack</h2>
			<button id="open" onClick={() => setOpen(true)}>Quick view</button>
			{open && createPortal(<QuickView onClose={() => setOpen(false)} />, document.body)}
		</article>
	)
}
```

```js
{
  "parent": "body",
  "closeButtonVisible": true,
  "card": {
    "bottom": 160,
    "right": 290
  },
  "close": {
    "top": 177,
    "left": 78
  },
  "themeClass": "quick-view dark"
}
```

Its DOM parent is now `body`, so nothing clips it, and it still has the `dark` theme class from the context the card is inside.

### 3. Where does a click go?

The card has a React `onClick`, and the lesson also adds a plain DOM listener to the card for comparison. Clicking Close, in place:

```text
card DOM listener ran
card onClick ran
```

Through the portal:

```text
card onClick ran
```

React's `onClick` on the card ran **in both cases**, because the dialog is the card's child in the React tree. The DOM listener ran only when the dialog was really inside the card in the DOM.

## How it works

- **React tree vs DOM tree.** A portal is a fiber like any other, so context, state, effects and error boundaries all follow the React tree. Only the host DOM nodes are attached under `domNode` instead of the nearest parent DOM node.
- **Events.** React listens at the root container and dispatches events along the fiber tree ([How React Works, Start to Finish](../../internals/how-react-works/)). That's why `onClick` on an ancestor component fires for clicks inside its portal. Native listeners follow the DOM. If you need a click inside a dialog not to reach the card's `onClick`, call `e.stopPropagation()` in the dialog.
- **The target node must exist** when the portal renders. `document.body` always does; a custom `#modal-root` must be in the HTML before React renders into it.
- **Accessibility is still your job.** A portal moves DOM; it doesn't add focus trapping, `aria-modal` or Escape handling. The native `<dialog>` element with `showModal()` gives you the top layer, focus handling and Escape, and is worth considering for modals.

## Common mistakes

- **Expecting the portal to stop React events.** Clicks inside it still trigger the card's `onClick` (recorded).
- **Making the dialog `position: fixed` and expecting that to be enough.** It isn't when an ancestor has a `transform`, `filter` or `contain` (recorded: clipped).
- **Portaling to a node that isn't in the document yet.**
- **Forgetting focus.** When a dialog opens, move focus into it, and return focus to the trigger when it closes.

## Interview Q&A

<details class="qa"><summary>What does <code>createPortal</code> do?</summary>

`createPortal(children, domNode)` renders `children`'s DOM into `domNode` instead of the parent component's DOM. In React they're still the parent's children.

</details>

<details class="qa"><summary>Why use a portal instead of <code>position: fixed</code> and a big <code>z-index</code>?</summary>

Ancestors can still trap the element. `overflow: hidden` clips it, `z-index` only works within the ancestor's stacking context, and a `transform` makes the ancestor the containing block even for `position: fixed`. Recorded: the in-place dialog was clipped by the card; the portaled one wasn't.

</details>

<details class="qa"><summary>Do events inside a portal bubble to the parent component?</summary>

Yes. React events follow the React tree, not the DOM tree. Recorded: clicking Close in the portaled dialog ran the card's React `onClick`, but not a plain DOM listener on the card.

</details>

<details class="qa"><summary>Does portaled content see the parent's context?</summary>

Yes. Context comes from the React tree. Recorded: the portaled dialog got the card's `dark` theme.

</details>

<details class="qa"><summary>Name common uses.</summary>

Modals, tooltips and popovers, dropdown menus inside scrolling containers, toasts, and rendering into a DOM node owned by a non-React part of the page.

</details>

## Related

- [Context with use](../../apis/context-with-use/): context passes through portals.
- [useLayoutEffect](../../apis/uselayouteffect/): positioning a tooltip, which is often portaled.
- [How React Works, Start to Finish](../../internals/how-react-works/): how React dispatches events from the root.

## Sources

- react.dev: [`createPortal`](https://react.dev/reference/react-dom/createPortal)
- MDN: [Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block) (why a `transform` traps `position: fixed`), [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
