---
title: "Reconciliation"
slug: "reconciliation"
order: 2
level: "must"
illus: "diff"
summary: "The O(n³) → O(n) heuristics (type and key), and why state is tied to position in the tree."
source: "https://legacy.reactjs.org/docs/reconciliation.html"
---


> Notes from the legacy React docs page [Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html),
> react.dev's [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state),
> and the React 19.2 source (`updateElement`, `updateSlot`, `useFiber`).
> Part of [React Internals](../../). It follows [Render and Commit](../render-and-commit/), and the list
> algorithm itself is in [Child Reconciliation Algorithm](../child-reconciliation-algorithm/). My own notes and
> clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>What is reconciliation?</summary>

The process of comparing the elements a component just returned with what
React rendered last time, to decide which fibers (and DOM nodes) to keep,
update, create or destroy. The fiber architecture doc defines it as "the
algorithm React uses to diff one tree with another to determine which parts
need to be changed." It happens in the render phase. The DOM changes it
decides on are applied later, in the commit.

</details>

<details class="qa"><summary>Why doesn't React use an optimal tree-diff algorithm?</summary>

The best general algorithms for turning one tree into another are
**O(n³)**. The legacy docs note that for 1,000 elements that's on the order
of a billion comparisons. React uses an **O(n)** heuristic instead, based on
two assumptions that hold for real UIs.

</details>

<details class="qa"><summary>What are those two assumptions?</summary>

(1) "Two elements of different types will produce different trees", so a
type change replaces the whole subtree without comparing inside it. (2) "The
developer can hint at which child elements may be stable across different
renders with a `key` prop."

</details>

<details class="qa"><summary>How does React decide whether a component keeps its state?</summary>

By **position in the tree** plus **type** plus **key**. The same component
type at the same position (with the same key) keeps its fiber, and therefore
its state. Change any of the three and React unmounts the old one and mounts
a fresh one. In our example, `<Chat key={to.id} />` resets the draft message
when you switch contacts.

</details>

<details class="qa"><summary>Why should you never define a component inside another component?</summary>

Every render creates a **new function**, so the element's `type` is a
different value each time. React sees a different type at the same position
and remounts the subtree, losing its state and DOM, on every render.

</details>

## The problem: diffing two trees is expensive

A component returns a tree of elements. On the next render it returns
another. React has to turn "old tree" into "new tree" with as few DOM
operations as possible. Solving that minimum edit distance between two
arbitrary trees is O(n³), which the legacy docs call "far too expensive". A
UI with 1,000 elements would take about a billion comparisons per update.

React gives up on finding the *minimal* set of edits and settles for a
*good-enough* one found in a **single top-down pass**. Each node is compared
only with the node at the same position in the previous tree. React never
searches the tree to see whether a subtree moved somewhere else. That makes
it O(n), and two rules make the result good in practice.

## Rule 1: different type → throw away the subtree

When an element at a position has a different `type` than last time, React
does not try to match up the children. The legacy docs: "Whenever the root
elements have different types, React will tear down the old tree and build
the new tree from scratch."

<figure class="fig anim fig-rule1" data-anim><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;App()&quot;,&quot;say&quot;:&quot;App re-renders. Last time it returned &lt;code&gt;&amp;lt;div&amp;gt;&amp;lt;Counter/&amp;gt;&amp;lt;/div&amp;gt;&lt;/code&gt;; now it returns &lt;code&gt;&amp;lt;span&amp;gt;&amp;lt;Counter/&amp;gt;&amp;lt;/span&amp;gt;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;c-app&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildFibers(App, currentFirstChild: div, newChild: &lt;span&gt;)&quot;,&quot;say&quot;:&quot;React reconciles App’s child: the &lt;b&gt;current&lt;/b&gt; &lt;code&gt;div&lt;/code&gt; fiber against the &lt;b&gt;new&lt;/b&gt; &lt;code&gt;span&lt;/code&gt; element. Only this one position is compared.&quot;,&quot;set&quot;:{&quot;c-app&quot;:&quot;&quot;,&quot;c-div&quot;:&quot;cmp&quot;,&quot;e-span&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileSingleElement → child.key === element.key&quot;,&quot;say&quot;:&quot;First the key. Both are &lt;code&gt;null&lt;/code&gt;, so this is the same slot.&quot;,&quot;set&quot;:{&quot;k-key&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;k-key&quot;:&quot;key: null === null ✓&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;child.elementType === element.type&quot;,&quot;say&quot;:&quot;Then the type: &lt;code&gt;'div' !== 'span'&lt;/code&gt;. A different type means React assumes a completely different subtree. &lt;b&gt;It doesn’t look inside.&lt;/b&gt;&quot;,&quot;set&quot;:{&quot;k-type&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;k-type&quot;:&quot;type: 'div' !== 'span' ✗&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;deleteRemainingChildren(App, div)   // App.flags |= ChildDeletion&quot;,&quot;say&quot;:&quot;The old &lt;code&gt;div&lt;/code&gt; fiber is marked for deletion, and its whole subtree goes with it: &lt;code&gt;Counter&lt;/code&gt; and its state (&lt;code&gt;count: 3&lt;/code&gt;), even though a &lt;code&gt;&amp;lt;Counter/&amp;gt;&lt;/code&gt; is still being rendered.&quot;,&quot;set&quot;:{&quot;c-div&quot;:&quot;del&quot;,&quot;c-counter&quot;:&quot;del&quot;,&quot;c-div-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;c-div-flag&quot;:&quot;delete&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createFiberFromElement(&lt;span&gt;)&quot;,&quot;say&quot;:&quot;A brand-new fiber for &lt;code&gt;span&lt;/code&gt;: no alternate, nothing reused. It is flagged &lt;b&gt;Placement&lt;/b&gt; (insert).&quot;,&quot;set&quot;:{&quot;e-span&quot;:&quot;&quot;,&quot;w-span&quot;:&quot;new&quot;,&quot;w-span-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;w-span-flag&quot;:&quot;Placement&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(span) → mountChildFibers(span, null, &lt;Counter /&gt;)&quot;,&quot;say&quot;:&quot;Inside a new subtree there is nothing old to compare against, so every child is &lt;b&gt;mounted&lt;/b&gt; from scratch.&quot;,&quot;set&quot;:{&quot;e-counter&quot;:&quot;cmp&quot;,&quot;w-counter&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Counter() → mountState(0)&quot;,&quot;say&quot;:&quot;&lt;code&gt;Counter&lt;/code&gt; runs as a mount: &lt;code&gt;useState&lt;/code&gt; returns the initial value &lt;code&gt;0&lt;/code&gt;. The old &lt;code&gt;count: 3&lt;/code&gt; lives on a fiber that is about to be destroyed.&quot;,&quot;set&quot;:{&quot;e-counter&quot;:&quot;&quot;,&quot;w-counter&quot;:&quot;new hl&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitDeletionEffects(div)&quot;,&quot;say&quot;:&quot;Commit, mutation phase: the deleted &lt;code&gt;Counter&lt;/code&gt; runs its effect cleanups and refs are detached…&quot;,&quot;set&quot;:{&quot;w-counter&quot;:&quot;new&quot;,&quot;c-counter&quot;:&quot;del hl&quot;,&quot;d-old&quot;:&quot;del&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;removeChild(&lt;div&gt;) · appendChild(&lt;span&gt;)&quot;,&quot;say&quot;:&quot;…then the old &lt;code&gt;&amp;lt;div&amp;gt;&lt;/code&gt; is removed and the new &lt;code&gt;&amp;lt;span&amp;gt;&lt;/code&gt; subtree (built off-screen during &lt;code&gt;completeWork&lt;/code&gt;) is inserted in one go. The counter shows &lt;b&gt;0&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;c-counter&quot;:&quot;del faint&quot;,&quot;c-div&quot;:&quot;del faint&quot;,&quot;d-old&quot;:&quot;hide&quot;,&quot;d-new&quot;:&quot;new&quot;}}]" data-intro="The parent changes &lt;code&gt;&amp;lt;div&amp;gt;&lt;/code&gt; to &lt;code&gt;&amp;lt;span&amp;gt;&lt;/code&gt; around an identical &lt;code&gt;&amp;lt;Counter /&amp;gt;&lt;/code&gt;. Press &lt;b&gt;Play&lt;/b&gt;."><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">current fibers (on screen)</div><div class="t-tree"><div class="t-branch"><div class="an node comp" data-k="c-app"><span class="node-label" data-k="c-app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="c-div"><span class="node-label" data-k="c-div-label">div</span><span class="an flag" data-k="c-div-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="c-counter"><span class="node-label" data-k="c-counter-label">Counter</span><small data-k="c-counter-sub">count: 3</small></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">new elements (App returned)</div><div class="t-tree"><div class="t-branch"><div class="an node el" data-k="e-span"><span class="node-label" data-k="e-span-label">&lt;span&gt;</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node el" data-k="e-counter"><span class="node-label" data-k="e-counter-label">&lt;Counter /&gt;</span></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">work-in-progress</div><div class="t-tree"><div class="t-branch"><div class="an node host" data-k="w-span" data-s="ghost"><span class="node-label" data-k="w-span-label">span</span><span class="an flag" data-k="w-span-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="w-counter" data-s="ghost"><span class="node-label" data-k="w-counter-label">Counter</span><small data-k="w-counter-sub">count: 0</small></div></div></div></div></div></div></div></div><div class="a-cols" style="margin-top:14px"><div class="a-panel "><div class="a-panel-title">checks</div><div class="a-col"><span class="an chip-a" data-k="k-key">key: ?</span><span class="an chip-a" data-k="k-type">type: ?</span></div></div><div class="a-panel "><div class="a-panel-title">DOM</div><div class="a-dom"><div class="an" data-k="d-old">&lt;div&gt;&lt;button&gt;3&lt;/button&gt;&lt;/div&gt;</div><div class="an" data-k="d-new" data-s="hide">&lt;span&gt;&lt;button&gt;0&lt;/button&gt;&lt;/span&gt;</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>App()</code><span>App re-renders. Last time it returned <code>&lt;div&gt;&lt;Counter/&gt;&lt;/div&gt;</code>; now it returns <code>&lt;span&gt;&lt;Counter/&gt;&lt;/span&gt;</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildFibers(App, currentFirstChild: div, newChild: &lt;span&gt;)</code><span>React reconciles App’s child: the <b>current</b> <code>div</code> fiber against the <b>new</b> <code>span</code> element. Only this one position is compared.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileSingleElement → child.key === element.key</code><span>First the key. Both are <code>null</code>, so this is the same slot.</span></li><li><span class="anim-phase ph-render">render phase</span><code>child.elementType === element.type</code><span>Then the type: <code>'div' !== 'span'</code>. A different type means React assumes a completely different subtree. <b>It doesn’t look inside.</b></span></li><li><span class="anim-phase ph-render">render phase</span><code>deleteRemainingChildren(App, div)   // App.flags |= ChildDeletion</code><span>The old <code>div</code> fiber is marked for deletion, and its whole subtree goes with it: <code>Counter</code> and its state (<code>count: 3</code>), even though a <code>&lt;Counter/&gt;</code> is still being rendered.</span></li><li><span class="anim-phase ph-render">render phase</span><code>createFiberFromElement(&lt;span&gt;)</code><span>A brand-new fiber for <code>span</code>: no alternate, nothing reused. It is flagged <b>Placement</b> (insert).</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(span) → mountChildFibers(span, null, &lt;Counter /&gt;)</code><span>Inside a new subtree there is nothing old to compare against, so every child is <b>mounted</b> from scratch.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Counter() → mountState(0)</code><span><code>Counter</code> runs as a mount: <code>useState</code> returns the initial value <code>0</code>. The old <code>count: 3</code> lives on a fiber that is about to be destroyed.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitDeletionEffects(div)</code><span>Commit, mutation phase: the deleted <code>Counter</code> runs its effect cleanups and refs are detached…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>removeChild(&lt;div&gt;) · appendChild(&lt;span&gt;)</code><span>…then the old <code>&lt;div&gt;</code> is removed and the new <code>&lt;span&gt;</code> subtree (built off-screen during <code>completeWork</code>) is inserted in one go. The counter shows <b>0</b>.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>Rule 1, animated: one failed type check throws away the entire subtree, including state that “looks” identical.</figcaption></figure>

```tsx
// before                 // after
<div>                     <span>
	<Counter />               <Counter />
</div>                    </span>
```

`Counter` looks identical, but its parent changed from `div` to `span`, so
the old `Counter` is **unmounted**, meaning its state is destroyed and its
effect cleanups run. A brand-new `Counter` is mounted. The same happens for
component types: `<Article />` → `<Comment />` at the same spot remounts.

In the source this is the check in `updateElement` (for list children) and
`reconcileSingleElement` (for a single child, inlined into
`reconcileChildFibersImpl` in the build), in simplified form:

```js
if (current !== null && current.elementType === element.type) {
	// same type: reuse the fiber (and its state and DOM node), only props change
	const existing = useFiber(current, element.props)
	existing.return = returnFiber
	return existing
}
// different type (or nothing there before): create a new fiber
const created = createFiberFromElement(element, returnFiber.mode, lanes)
created.return = returnFiber
return created
```

`useFiber` calls `createWorkInProgress(current, pendingProps)`, which returns
the **alternate** of the existing fiber with the new props. That's why state
survives: the hooks list lives on the fiber (see [React Fiber](../react-fiber/) and
[Hooks Under the Hood](../hooks-under-the-hood/)).

## Rule 2: same type → keep it and update

**Same host element** (`<div>` → `<div>`): the fiber and its DOM node are
kept. The render phase flags the fiber `Update` if it got a new props object.
The commit (`commitUpdate`) then compares old and new props and touches only
the attributes that changed. The legacy docs' example: going from
`<div className="before" title="stuff" />` to
`<div className="after" title="stuff" />`, "React knows to only modify the
`className` on the underlying DOM node." For `style`, only the changed style
properties are updated.

<figure class="fig anim fig-rule2" data-anim><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileSingleElement(parent, div, &lt;div className=\&quot;after\&quot;&gt;)&quot;,&quot;say&quot;:&quot;Same position, so React compares the current &lt;code&gt;div&lt;/code&gt; fiber with the new &lt;code&gt;&amp;lt;div&amp;gt;&lt;/code&gt; element.&quot;,&quot;set&quot;:{&quot;c-div&quot;:&quot;cmp&quot;,&quot;e-div&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;child.key === element.key&quot;,&quot;say&quot;:&quot;Keys match (&lt;code&gt;null&lt;/code&gt;).&quot;,&quot;set&quot;:{&quot;k-key&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;k-key&quot;:&quot;key: null === null ✓&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;child.elementType === element.type&quot;,&quot;say&quot;:&quot;Types match: &lt;code&gt;'div' === 'div'&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;k-type&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;k-type&quot;:&quot;type: 'div' === 'div' ✓&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useFiber(div, newProps) → createWorkInProgress(div, pendingProps)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Same type → keep it.&lt;/b&gt; React reuses the fiber (via its alternate) and with it the same DOM node (&lt;code&gt;stateNode&lt;/code&gt;). Only the props are new.&quot;,&quot;set&quot;:{&quot;c-div&quot;:&quot;keep&quot;,&quot;e-div&quot;:&quot;&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(Counter): same type → reuse, call Counter(props)&quot;,&quot;say&quot;:&quot;Going down, &lt;code&gt;Counter&lt;/code&gt; is also the same type at the same position, so its hook list, and &lt;code&gt;count: 3&lt;/code&gt;, survive.&quot;,&quot;set&quot;:{&quot;c-counter&quot;:&quot;keep hl&quot;,&quot;e-counter&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(div): oldProps !== newProps → markUpdate()&quot;,&quot;say&quot;:&quot;On the way back up, the host fiber got a new props object, so it is flagged &lt;b&gt;Update&lt;/b&gt;. Nothing is written to the DOM yet.&quot;,&quot;set&quot;:{&quot;c-counter&quot;:&quot;keep&quot;,&quot;e-counter&quot;:&quot;&quot;,&quot;c-div-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;c-div-flag&quot;:&quot;Update&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitUpdate(dom, 'div', oldProps, newProps)&quot;,&quot;say&quot;:&quot;Commit compares the old and new props one by one…&quot;,&quot;set&quot;:{&quot;p-class&quot;:&quot;upd&quot;,&quot;p-title&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;p-title&quot;:&quot;title: 'stuff' === 'stuff' (skip)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;dom.className = 'after'&quot;,&quot;say&quot;:&quot;…and writes &lt;b&gt;only&lt;/b&gt; what changed. &lt;code&gt;title&lt;/code&gt; isn’t touched, the node isn’t recreated, and &lt;code&gt;Counter&lt;/code&gt; still shows 3.&quot;,&quot;set&quot;:{&quot;d-class&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;d-class&quot;:&quot;after&quot;}}]" data-intro="&lt;code&gt;&amp;lt;div className=&quot;before&quot;&amp;gt;&lt;/code&gt; becomes &lt;code&gt;&amp;lt;div className=&quot;after&quot;&amp;gt;&lt;/code&gt;. Press &lt;b&gt;Play&lt;/b&gt;."><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">current fiber</div><div class="t-tree"><div class="t-branch"><div class="an node host" data-k="c-div"><span class="node-label" data-k="c-div-label">div</span><small data-k="c-div-sub">#node-1</small><span class="an flag" data-k="c-div-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="c-counter"><span class="node-label" data-k="c-counter-label">Counter</span><small data-k="c-counter-sub">count: 3</small></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">new element</div><div class="t-tree"><div class="t-branch"><div class="an node el" data-k="e-div"><span class="node-label" data-k="e-div-label">&lt;div className="after"&gt;</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node el" data-k="e-counter"><span class="node-label" data-k="e-counter-label">&lt;Counter /&gt;</span></div></div></div></div></div></div></div></div><div class="a-cols" style="margin-top:14px"><div class="a-panel "><div class="a-panel-title">checks</div><div class="a-col"><span class="an chip-a" data-k="k-key">key: ?</span><span class="an chip-a" data-k="k-type">type: ?</span></div></div><div class="a-panel "><div class="a-panel-title">props diff (commitUpdate)</div><div class="a-col"><span class="an chip-a" data-k="p-class" data-s="faint">className: 'before' → 'after'</span><span class="an chip-a" data-k="p-title" data-s="faint">title: 'stuff' → 'stuff'</span></div></div><div class="a-panel "><div class="a-panel-title">DOM</div><div class="a-dom">&lt;div class="<span class="an" data-k="d-class">before</span>" title="stuff"&gt;<br>&nbsp;&nbsp;&lt;button&gt;3&lt;/button&gt;<br>&lt;/div&gt;</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>reconcileSingleElement(parent, div, &lt;div className="after"&gt;)</code><span>Same position, so React compares the current <code>div</code> fiber with the new <code>&lt;div&gt;</code> element.</span></li><li><span class="anim-phase ph-render">render phase</span><code>child.key === element.key</code><span>Keys match (<code>null</code>).</span></li><li><span class="anim-phase ph-render">render phase</span><code>child.elementType === element.type</code><span>Types match: <code>'div' === 'div'</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useFiber(div, newProps) → createWorkInProgress(div, pendingProps)</code><span><b>Same type → keep it.</b> React reuses the fiber (via its alternate) and with it the same DOM node (<code>stateNode</code>). Only the props are new.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(Counter): same type → reuse, call Counter(props)</code><span>Going down, <code>Counter</code> is also the same type at the same position, so its hook list, and <code>count: 3</code>, survive.</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork(div): oldProps !== newProps → markUpdate()</code><span>On the way back up, the host fiber got a new props object, so it is flagged <b>Update</b>. Nothing is written to the DOM yet.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitUpdate(dom, 'div', oldProps, newProps)</code><span>Commit compares the old and new props one by one…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>dom.className = 'after'</code><span>…and writes <b>only</b> what changed. <code>title</code> isn’t touched, the node isn’t recreated, and <code>Counter</code> still shows 3.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>Rule 2, animated: same type keeps the fiber, the DOM node and the state; only changed attributes are written.</figcaption></figure>

**Same component type**: the fiber is kept, so hooks and state are
preserved. React calls the component with the new props (unless it can bail
out, see [The Work Loop](../the-work-loop/)) and then reconciles its output against the old
children, going down level by level.

## Rule 3: keys identify children in a list

When a fiber has several children, React has to pair each new child with an
old one. Without keys it pairs them **by index**. The legacy docs' example
shows why that breaks when inserting at the front:

<figure class="fig anim fig-keys" data-anim><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">No keys (by index)</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">With keys</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildrenArray(ul, [Duke, Villanova], [Connecticut, Duke, Villanova])&quot;,&quot;say&quot;:&quot;No keys, so children are matched &lt;b&gt;by position&lt;/b&gt;: old #0 with new #0, and so on.&quot;},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old #0 Duke, new #0 Connecticut)&quot;,&quot;say&quot;:&quot;Slot 0: key &lt;code&gt;null === null&lt;/code&gt;, type &lt;code&gt;li === li&lt;/code&gt; → reuse the &lt;b&gt;Duke&lt;/b&gt; fiber and give it the text “Connecticut”.&quot;,&quot;set&quot;:{&quot;o0&quot;:&quot;upd hl&quot;,&quot;n0&quot;:&quot;cmp&quot;},&quot;txt&quot;:{&quot;o0-label&quot;:&quot;0 · Duke → Connecticut&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old #1 Villanova, new #1 Duke)&quot;,&quot;say&quot;:&quot;Slot 1: same story. The &lt;b&gt;Villanova&lt;/b&gt; fiber is reused to show “Duke”.&quot;,&quot;set&quot;:{&quot;o0&quot;:&quot;upd&quot;,&quot;n0&quot;:&quot;&quot;,&quot;o1&quot;:&quot;upd hl&quot;,&quot;n1&quot;:&quot;cmp&quot;},&quot;txt&quot;:{&quot;o1-label&quot;:&quot;1 · Villanova → Duke&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createChild(ul, &lt;li&gt;Villanova&lt;/li&gt;)   // Placement&quot;,&quot;say&quot;:&quot;The old list ran out, so new #2 is a brand-new fiber.&quot;,&quot;set&quot;:{&quot;o1&quot;:&quot;upd&quot;,&quot;n1&quot;:&quot;&quot;,&quot;n2&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitTextUpdate ×2 · appendChild(&lt;li&gt;)&quot;,&quot;say&quot;:&quot;&lt;b&gt;3 DOM operations.&lt;/b&gt; Every existing row was rewritten, and any state inside a row (an input, a checkbox) is now attached to the wrong school.&quot;,&quot;set&quot;:{&quot;n2&quot;:&quot;&quot;,&quot;d0&quot;:&quot;upd&quot;,&quot;d1&quot;:&quot;upd&quot;,&quot;d2&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;d0-t&quot;:&quot;Connecticut&quot;,&quot;d1-t&quot;:&quot;Duke&quot;}}]" data-intro="Old: Duke, Villanova. New: &lt;b&gt;Connecticut&lt;/b&gt;, Duke, Villanova. No &lt;code&gt;key&lt;/code&gt;s."><div class="anim-scn-title">No keys (by index)</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">old fibers (by index)</div><div class="a-col"><div class="an node host" data-k="o0"><span class="node-label" data-k="o0-label">0 · Duke</span></div><div class="an node host" data-k="o1"><span class="node-label" data-k="o1-label">1 · Villanova</span></div></div></div><div class="a-panel "><div class="a-panel-title">new elements</div><div class="a-col"><div class="an node " data-k="n0" data-s="x"><span class="node-label" data-k="n0-label">0 · Connecticut</span></div><div class="an node " data-k="n1" data-s="x"><span class="node-label" data-k="n1-label">1 · Duke</span></div><div class="an node " data-k="n2" data-s="x"><span class="node-label" data-k="n2-label">2 · Villanova</span></div></div></div><div class="a-panel "><div class="a-panel-title">DOM</div><div class="a-dom">&lt;ul&gt;<div class="an" data-k="d0">&nbsp;&nbsp;&lt;li&gt;<span data-k="d0-t">Duke</span>&lt;/li&gt;</div><div class="an" data-k="d1">&nbsp;&nbsp;&lt;li&gt;<span data-k="d1-t">Villanova</span>&lt;/li&gt;</div><div class="an" data-k="d2" data-s="hide">&nbsp;&nbsp;&lt;li&gt;<span data-k="d2-t">Villanova</span>&lt;/li&gt;</div>&lt;/ul&gt;</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildrenArray(ul, [Duke, Villanova], [Connecticut, Duke, Villanova])</code><span>No keys, so children are matched <b>by position</b>: old #0 with new #0, and so on.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old #0 Duke, new #0 Connecticut)</code><span>Slot 0: key <code>null === null</code>, type <code>li === li</code> → reuse the <b>Duke</b> fiber and give it the text “Connecticut”.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old #1 Villanova, new #1 Duke)</code><span>Slot 1: same story. The <b>Villanova</b> fiber is reused to show “Duke”.</span></li><li><span class="anim-phase ph-render">render phase</span><code>createChild(ul, &lt;li&gt;Villanova&lt;/li&gt;)   // Placement</code><span>The old list ran out, so new #2 is a brand-new fiber.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitTextUpdate ×2 · appendChild(&lt;li&gt;)</code><span><b>3 DOM operations.</b> Every existing row was rewritten, and any state inside a row (an input, a checkbox) is now attached to the wrong school.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old #0 key='duke', new #0 key='conn')&quot;,&quot;say&quot;:&quot;Pass 1 walks both lists while keys line up. &lt;code&gt;'conn' !== 'duke'&lt;/code&gt;, so &lt;code&gt;updateSlot&lt;/code&gt; returns &lt;code&gt;null&lt;/code&gt; and the fast path stops.&quot;,&quot;set&quot;:{&quot;od&quot;:&quot;cmp&quot;,&quot;nc&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;mapRemainingChildren(oldFiber)&quot;,&quot;say&quot;:&quot;Pass 3: the remaining old fibers go into a &lt;code&gt;Map&lt;/code&gt; keyed by &lt;code&gt;key&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;od&quot;:&quot;&quot;,&quot;nc&quot;:&quot;&quot;,&quot;m-d&quot;:&quot;&quot;,&quot;m-v&quot;:&quot;&quot;,&quot;lp&quot;:&quot;&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'conn') → not found → createFiberFromElement&quot;,&quot;say&quot;:&quot;“conn” isn’t in the map: a new fiber, flagged &lt;b&gt;Placement&lt;/b&gt; (insert).&quot;,&quot;set&quot;:{&quot;nc&quot;:&quot;new hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'duke') → reuse · placeChild: oldIndex 0 ≥ lastPlacedIndex 0&quot;,&quot;say&quot;:&quot;“duke” is found and its fiber reused (removed from the map). Its old index 0 isn’t smaller than &lt;code&gt;lastPlacedIndex&lt;/code&gt;, so it &lt;b&gt;stays&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;nc&quot;:&quot;new&quot;,&quot;nd&quot;:&quot;keep hl&quot;,&quot;od&quot;:&quot;keep&quot;,&quot;m-d&quot;:&quot;del&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'vill') → reuse · placeChild: oldIndex 1 ≥ 0&quot;,&quot;say&quot;:&quot;“vill” is reused and stays too. &lt;code&gt;lastPlacedIndex&lt;/code&gt; becomes 1. The map is now empty, so nothing is deleted.&quot;,&quot;set&quot;:{&quot;nd&quot;:&quot;keep&quot;,&quot;nv&quot;:&quot;keep hl&quot;,&quot;ov&quot;:&quot;keep&quot;,&quot;m-v&quot;:&quot;del&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 1&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;insertBefore(&lt;li&gt;Connecticut&lt;/li&gt;, &lt;li&gt;Duke&lt;/li&gt;)&quot;,&quot;say&quot;:&quot;&lt;b&gt;1 DOM operation.&lt;/b&gt; Duke and Villanova are untouched, with their state.&quot;,&quot;set&quot;:{&quot;nv&quot;:&quot;keep&quot;,&quot;dc&quot;:&quot;new&quot;}}]" data-intro="Same change, but every &lt;code&gt;&amp;lt;li&amp;gt;&lt;/code&gt; has a stable &lt;code&gt;key&lt;/code&gt;."><div class="anim-scn-title">With keys</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">old fibers</div><div class="a-col"><div class="an node host" data-k="od"><span class="node-label" data-k="od-label">key="duke"</span></div><div class="an node host" data-k="ov"><span class="node-label" data-k="ov-label">key="vill"</span></div></div></div><div class="a-panel "><div class="a-panel-title">new elements</div><div class="a-col"><div class="an node " data-k="nc" data-s="x"><span class="node-label" data-k="nc-label">key="conn"</span></div><div class="an node " data-k="nd" data-s="x"><span class="node-label" data-k="nd-label">key="duke"</span></div><div class="an node " data-k="nv" data-s="x"><span class="node-label" data-k="nv-label">key="vill"</span></div></div></div><div class="a-panel "><div class="a-panel-title">existingChildren (Map)</div><div class="a-col"><span class="an chip-a" data-k="m-d" data-s="ghost">duke → fiber</span><span class="an chip-a" data-k="m-v" data-s="ghost">vill → fiber</span><span class="an chip-a" data-k="lp" data-s="ghost">lastPlacedIndex = 0</span></div></div><div class="a-panel "><div class="a-panel-title">DOM</div><div class="a-dom">&lt;ul&gt;<div class="an" data-k="dc" data-s="hide">&nbsp;&nbsp;&lt;li&gt;<span data-k="dc-t">Connecticut</span>&lt;/li&gt;</div><div class="an" data-k="dd">&nbsp;&nbsp;&lt;li&gt;<span data-k="dd-t">Duke</span>&lt;/li&gt;</div><div class="an" data-k="dv">&nbsp;&nbsp;&lt;li&gt;<span data-k="dv-t">Villanova</span>&lt;/li&gt;</div>&lt;/ul&gt;</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old #0 key='duke', new #0 key='conn')</code><span>Pass 1 walks both lists while keys line up. <code>'conn' !== 'duke'</code>, so <code>updateSlot</code> returns <code>null</code> and the fast path stops.</span></li><li><span class="anim-phase ph-render">render phase</span><code>mapRemainingChildren(oldFiber)</code><span>Pass 3: the remaining old fibers go into a <code>Map</code> keyed by <code>key</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'conn') → not found → createFiberFromElement</code><span>“conn” isn’t in the map: a new fiber, flagged <b>Placement</b> (insert).</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'duke') → reuse · placeChild: oldIndex 0 ≥ lastPlacedIndex 0</code><span>“duke” is found and its fiber reused (removed from the map). Its old index 0 isn’t smaller than <code>lastPlacedIndex</code>, so it <b>stays</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'vill') → reuse · placeChild: oldIndex 1 ≥ 0</code><span>“vill” is reused and stays too. <code>lastPlacedIndex</code> becomes 1. The map is now empty, so nothing is deleted.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>insertBefore(&lt;li&gt;Connecticut&lt;/li&gt;, &lt;li&gt;Duke&lt;/li&gt;)</code><span><b>1 DOM operation.</b> Duke and Villanova are untouched, with their state.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>Inserting at the front of a list, with and without keys.</figcaption></figure>

```tsx
<ul>                           <ul>
	<li>Duke</li>                  <li>Connecticut</li>   ← index 0: "Duke" fiber, text changed
	<li>Villanova</li>             <li>Duke</li>          ← index 1: "Villanova" fiber, text changed
</ul>                            <li>Villanova</li>     ← index 2: new fiber
                               </ul>
```

"React will mutate every child instead of realizing it can keep the `<li>Duke</li>`
and `<li>Villanova</li>` subtrees intact." With `key`s, React matches
children by key instead, so it keeps both existing items and inserts one new
node. The exact matching algorithm (a fast path in order, then a `Map` of the
remaining keys, then deciding which nodes have to move) is covered in
[Child Reconciliation Algorithm](../child-reconciliation-algorithm/).

react.dev adds that keys are local: "Keys are not globally unique. They only
specify the position *within the parent*."

## What this means for your code: state is tied to position

react.dev's rule: "React keeps track of which state belongs to which
component based on their place in the UI tree." A few consequences follow
from that.

<figure class="fig anim fig-position" data-anim><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Ternary, no key</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">&& slots</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Different keys</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;setIsPlayerA(false)&quot;,&quot;say&quot;:&quot;Switch players.&quot;,&quot;set&quot;:{&quot;flag&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;flag&quot;:&quot;isPlayerA = false&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileSingleElement(div, Counter, &lt;Counter person=\&quot;Sarah\&quot; /&gt;)&quot;,&quot;say&quot;:&quot;Both branches put a &lt;code&gt;Counter&lt;/code&gt; as child &lt;b&gt;#0&lt;/b&gt;. React only sees the position, not which line of JSX produced it.&quot;,&quot;set&quot;:{&quot;flag&quot;:&quot;&quot;,&quot;c0&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;key null === null ✓ · type Counter === Counter ✓ → useFiber&quot;,&quot;say&quot;:&quot;Same key, same type → &lt;b&gt;reuse&lt;/b&gt; the fiber, hooks and all.&quot;,&quot;set&quot;:{&quot;c0&quot;:&quot;keep hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Counter({ person: \&quot;Sarah\&quot; })&quot;,&quot;say&quot;:&quot;Counter re-renders with the new props but the &lt;b&gt;old state&lt;/b&gt;: Sarah inherits Taylor’s score.&quot;,&quot;set&quot;:{&quot;c0&quot;:&quot;keep&quot;},&quot;txt&quot;:{&quot;c0-sub&quot;:&quot;Sarah · count 5&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitTextUpdate(\&quot;Taylor\&quot; → \&quot;Sarah\&quot;)&quot;,&quot;say&quot;:&quot;Only the name changes on screen. Usually not what you want.&quot;,&quot;set&quot;:{&quot;s-who&quot;:&quot;upd&quot;,&quot;s-n&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;s-who&quot;:&quot;Sarah&quot;}}]" data-intro="&lt;code&gt;{isPlayerA ? &amp;lt;Counter person=&quot;Taylor&quot; /&amp;gt; : &amp;lt;Counter person=&quot;Sarah&quot; /&amp;gt;}&lt;/code&gt;. Taylor has scored 5."><div class="anim-scn-title">Ternary, no key</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">state</div><div class="a-col"><span class="an chip-a" data-k="flag">isPlayerA = true</span></div></div><div class="a-panel "><div class="a-panel-title">children of div</div><div class="slots"><div class="slot"><span class="a-label">#0</span><div class="an node comp" data-k="c0"><span class="node-label" data-k="c0-label">Counter</span><small data-k="c0-sub">Taylor · count 5</small></div></div></div></div><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-dom">Score for <span class="an" data-k="s-who">Taylor</span>: <span class="an" data-k="s-n">5</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>setIsPlayerA(false)</code><span>Switch players.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileSingleElement(div, Counter, &lt;Counter person="Sarah" /&gt;)</code><span>Both branches put a <code>Counter</code> as child <b>#0</b>. React only sees the position, not which line of JSX produced it.</span></li><li><span class="anim-phase ph-render">render phase</span><code>key null === null ✓ · type Counter === Counter ✓ → useFiber</code><span>Same key, same type → <b>reuse</b> the fiber, hooks and all.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Counter({ person: "Sarah" })</code><span>Counter re-renders with the new props but the <b>old state</b>: Sarah inherits Taylor’s score.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitTextUpdate("Taylor" → "Sarah")</code><span>Only the name changes on screen. Usually not what you want.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;setIsPlayerA(false)&quot;,&quot;say&quot;:&quot;Switch players.&quot;,&quot;set&quot;:{&quot;flag&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;flag&quot;:&quot;isPlayerA = false&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildrenArray(div, [Counter, null], [false, &lt;Counter /&gt;])&quot;,&quot;say&quot;:&quot;The children array always has &lt;b&gt;two&lt;/b&gt; slots. A &lt;code&gt;false&lt;/code&gt; leaves a hole, so the counters never share an index.&quot;,&quot;set&quot;:{&quot;flag&quot;:&quot;&quot;,&quot;c0&quot;:&quot;cmp&quot;,&quot;f1&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;slot #0: Counter vs false → deleteChild(Counter)&quot;,&quot;say&quot;:&quot;Slot 0 now renders nothing: Taylor’s Counter is deleted, with its state.&quot;,&quot;set&quot;:{&quot;c0&quot;:&quot;del&quot;,&quot;f1&quot;:&quot;&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;slot #1: nothing vs &lt;Counter /&gt; → createChild · mountState(0)&quot;,&quot;say&quot;:&quot;Slot 1 had nothing before, so Sarah gets a &lt;b&gt;fresh&lt;/b&gt; Counter starting at 0.&quot;,&quot;set&quot;:{&quot;f1&quot;:&quot;hide&quot;,&quot;c1&quot;:&quot;new hl&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;removeChild(old) · insertBefore(new)&quot;,&quot;say&quot;:&quot;Different positions = different components. Each player keeps a separate counter.&quot;,&quot;set&quot;:{&quot;c1&quot;:&quot;new&quot;,&quot;c0&quot;:&quot;del faint&quot;,&quot;s-who&quot;:&quot;new&quot;,&quot;s-n&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;s-who&quot;:&quot;Sarah&quot;,&quot;s-n&quot;:&quot;0&quot;}}]" data-intro="&lt;code&gt;{isPlayerA &amp;amp;&amp;amp; &amp;lt;Counter person=&quot;Taylor&quot; /&amp;gt;}{!isPlayerA &amp;amp;&amp;amp; &amp;lt;Counter person=&quot;Sarah&quot; /&amp;gt;}&lt;/code&gt;"><div class="anim-scn-title">&& slots</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">state</div><div class="a-col"><span class="an chip-a" data-k="flag">isPlayerA = true</span></div></div><div class="a-panel "><div class="a-panel-title">children of div</div><div class="slots"><div class="slot"><span class="a-label">#0</span><div class="an node comp" data-k="c0"><span class="node-label" data-k="c0-label">Counter</span><small data-k="c0-sub">Taylor · count 5</small></div></div><div class="slot"><span class="a-label">#1</span><div class="an node el" data-k="f1"><span class="node-label" data-k="f1-label">false</span></div><div class="an node comp" data-k="c1" data-s="hide"><span class="node-label" data-k="c1-label">Counter</span><small data-k="c1-sub">Sarah · count 0</small></div></div></div></div><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-dom">Score for <span class="an" data-k="s-who">Taylor</span>: <span class="an" data-k="s-n">5</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>setIsPlayerA(false)</code><span>Switch players.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildrenArray(div, [Counter, null], [false, &lt;Counter /&gt;])</code><span>The children array always has <b>two</b> slots. A <code>false</code> leaves a hole, so the counters never share an index.</span></li><li><span class="anim-phase ph-render">render phase</span><code>slot #0: Counter vs false → deleteChild(Counter)</code><span>Slot 0 now renders nothing: Taylor’s Counter is deleted, with its state.</span></li><li><span class="anim-phase ph-render">render phase</span><code>slot #1: nothing vs &lt;Counter /&gt; → createChild · mountState(0)</code><span>Slot 1 had nothing before, so Sarah gets a <b>fresh</b> Counter starting at 0.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>removeChild(old) · insertBefore(new)</code><span>Different positions = different components. Each player keeps a separate counter.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;setIsPlayerA(false)&quot;,&quot;say&quot;:&quot;Switch players.&quot;,&quot;set&quot;:{&quot;flag&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;flag&quot;:&quot;isPlayerA = false&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileSingleElement(div, Counter, &lt;Counter key=\&quot;Sarah\&quot; /&gt;)&quot;,&quot;say&quot;:&quot;Same position (#0), same type, but now there is a key to check first.&quot;,&quot;set&quot;:{&quot;flag&quot;:&quot;&quot;,&quot;c0&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;child.key === element.key → 'Taylor' !== 'Sarah' ✗&quot;,&quot;say&quot;:&quot;Different key → not the same component. The old fiber is deleted…&quot;,&quot;set&quot;:{&quot;c0&quot;:&quot;del&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createFiberFromElement(&lt;Counter key=\&quot;Sarah\&quot; /&gt;) · mountState(0)&quot;,&quot;say&quot;:&quot;…and a new one is mounted with fresh state.&quot;,&quot;set&quot;:{&quot;c1&quot;:&quot;new hl&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;removeChild(old) · insertBefore(new)&quot;,&quot;say&quot;:&quot;Changing the &lt;code&gt;key&lt;/code&gt; is the standard way to reset a component.&quot;,&quot;set&quot;:{&quot;c1&quot;:&quot;new&quot;,&quot;c0&quot;:&quot;hide&quot;,&quot;s-who&quot;:&quot;new&quot;,&quot;s-n&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;s-who&quot;:&quot;Sarah&quot;,&quot;s-n&quot;:&quot;0&quot;}}]" data-intro="&lt;code&gt;{isPlayerA ? &amp;lt;Counter key=&quot;Taylor&quot; … /&amp;gt; : &amp;lt;Counter key=&quot;Sarah&quot; … /&amp;gt;}&lt;/code&gt;"><div class="anim-scn-title">Different keys</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">state</div><div class="a-col"><span class="an chip-a" data-k="flag">isPlayerA = true</span></div></div><div class="a-panel "><div class="a-panel-title">children of div</div><div class="slots"><div class="slot"><span class="a-label">#0</span><div class="an node comp" data-k="c0"><span class="node-label" data-k="c0-label">Counter</span><small data-k="c0-sub">key="Taylor" · count 5</small></div><div class="an node comp" data-k="c1" data-s="hide"><span class="node-label" data-k="c1-label">Counter</span><small data-k="c1-sub">key="Sarah" · count 0</small></div></div></div></div><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-dom">Score for <span class="an" data-k="s-who">Taylor</span>: <span class="an" data-k="s-n">5</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>setIsPlayerA(false)</code><span>Switch players.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileSingleElement(div, Counter, &lt;Counter key="Sarah" /&gt;)</code><span>Same position (#0), same type, but now there is a key to check first.</span></li><li><span class="anim-phase ph-render">render phase</span><code>child.key === element.key → 'Taylor' !== 'Sarah' ✗</code><span>Different key → not the same component. The old fiber is deleted…</span></li><li><span class="anim-phase ph-render">render phase</span><code>createFiberFromElement(&lt;Counter key="Sarah" /&gt;) · mountState(0)</code><span>…and a new one is mounted with fresh state.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>removeChild(old) · insertBefore(new)</code><span>Changing the <code>key</code> is the standard way to reset a component.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>State belongs to a position in the tree (plus type and key), not to the JSX that produced it.</figcaption></figure>

**It's the tree position, not where the JSX is written.** These two
branches render `Counter` at the same position (first child of a `div`), so
state is **preserved** when `isFancy` flips:

```tsx
if (isFancy) {
	return (
		<div>
			<Counter isFancy={true} />
		</div>
	)
}
return (
	<div>
		<Counter isFancy={false} />
	</div>
)
```

react.dev: "It's the position in the UI tree—not in the JSX markup—that
matters to React!"

**Different type at the same position resets state:**

```tsx
{isPaused ? <p>See you later!</p> : <Counter />}
```

**Two ways to force a reset** when the same component shows different
things:

```tsx
// 1. different positions: two separate slots, only one filled at a time
{isPlayerA && <Counter person="Taylor" />}
{!isPlayerA && <Counter person="Sarah" />}

// 2. different keys at the same position
{isPlayerA ? (
	<Counter key="Taylor" person="Taylor" />
) : (
	<Counter key="Sarah" person="Sarah" />
)}
```

> Option 1 works because `{cond && <X/>}` leaves a `false` hole in the
> children array. The two counters are children #0 and #1, never the same
> index. That's also why conditional rendering with `&&` doesn't shift the
> positions of siblings that come after it.

**Components defined inside components remount every render:**

```tsx
function MyComponent() {
	function MyTextField() {   // a NEW function on every render of MyComponent
		const [text, setText] = useState('')
		return <input value={text} onChange={(e) => setText(e.target.value)} />
	}
	return <MyTextField />
}
```

`element.type` is a new function each time, so `current.elementType ===
element.type` is false and Rule 1 applies. The input loses its text and focus
on every keystroke. Define components at module level.

## Reconciliation, step by step

`App` re-renders after `setShowBanner(false)`:

```tsx
// previous render                // this render
<main>                            <main>
	<Banner />                        {false}
	<Header title="Hi" />             <Header title="Hi!" />
	<ul>                              <ul>
		<li key="a">A</li>                <li key="b">B</li>
		<li key="b">B</li>                <li key="a">A</li>
	</ul>                             </ul>
</main>                           </main>
```

| Position | Old | New | Decision |
|---|---|---|---|
| `main` | `main` | `main` | same type → reuse fiber and DOM node, reconcile children |
| `main` › #0 | `Banner` | `false` | nothing to render → **delete** `Banner` (unmount, effect cleanups) |
| `main` › #1 | `Header` | `Header` | same type → reuse fiber and state, call `Header` with new props |
| `main` › #2 | `ul` | `ul` | same type → reuse, reconcile keyed children |
| `ul` › keys | `a, b` | `b, a` | both keys found → reuse both fibers. One of them gets a **Placement** (move) flag. See [Child Reconciliation Algorithm](../child-reconciliation-algorithm/) |

The render phase only *records* these decisions as flags (`ChildDeletion`,
`Placement`, `Update`). The commit phase applies them
([Commit Phase and Effects](../commit-phase-and-effects/)).

## Rules and caveats

- **Type identity matters.** Don't create components (or `memo`/`lazy`
  wrappers) during render. Hoist them to module scope.
- **Keys must be stable, predictable and unique among siblings.** The legacy
  docs warn that unstable keys "(like those produced by `Math.random()`)
  will cause many component instances and DOM nodes to be unnecessarily
  recreated, which can cause performance degradation and lost state in child
  components."
- **Index keys are fine only for static lists.** If items are inserted,
  removed or reordered, state and DOM (inputs, focus) stick to the wrong item.
- **Use `key` to reset on purpose.** `<Profile key={userId} />` is the
  idiomatic way to discard all state when the identity changes, instead of
  syncing it in an effect.
- **Wrapping changes the position.** Adding a `<div>` or a `<Suspense>`
  around a component changes its parent type, and it remounts.

### Sources
- [Legacy React docs: Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)
- [react.dev: Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [Andrew Clark: React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- React 19.2.5 source: `updateElement`, `updateSlot`, `useFiber`, `createWorkInProgress`
