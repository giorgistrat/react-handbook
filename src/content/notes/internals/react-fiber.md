---
title: "React Fiber"
slug: "react-fiber"
module: "internals"
order: 3
level: "must"
illus: "fiber"
summary: "Why the stack reconciler couldn’t pause, what a fiber holds, the child/sibling/return tree and double buffering."
source: "https://github.com/acdlite/react-fiber-architecture"
---


> Notes from Andrew Clark's [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture),
> Lin Clark's talk [A Cartoon Intro to Fiber](https://www.youtube.com/watch?v=ZCuYPiUIONs),
> and the `FiberNode` / `createWorkInProgress` code in the React 19.2.5
> source. Part of [React Internals](../../internals/). How React walks these fibers is covered
> in [The Work Loop](../../internals/the-work-loop/). My own notes and clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>What is React Fiber?</summary>

Two things with one name. **Fiber the architecture** is the reconciler
React has used since React 16, which replaced the old recursive "stack
reconciler". **A fiber** is a plain JavaScript object, one per component or
host element instance, that holds everything React knows about that instance:
its type, props, state, hooks, effects and its links to parent, child and
sibling fibers.

</details>

<details class="qa"><summary>Why did React need Fiber?</summary>

The stack reconciler rendered with **recursive function calls**. Once an
update started, it ran until the whole tree was done, because you can't pause
the JavaScript call stack halfway and resume later. A large update blocked the
main thread, dropping frames and input. Fiber reimplements the call stack as a
linked list of objects React controls, so work can be **paused, resumed,
prioritized and thrown away**.

</details>

<details class="qa"><summary>What's the difference between an element, a component, a fiber and a DOM node?</summary>

An **element** is a disposable description returned by JSX. A
**component** is your function. A **fiber** is React's long-lived record of
one mounted instance. A **DOM node** is what the host fiber creates. In our
example, `<Counter />` creates a new element every render, but there's only
ever one `Counter` fiber (plus its alternate) while it's mounted.

</details>

<details class="qa"><summary>What is double buffering in React?</summary>

React keeps up to two versions of each fiber: `current` (what's on
screen) and `workInProgress` (the version being rendered), linked to each
other through `alternate`. Rendering builds the work-in-progress tree. The
commit swaps a single pointer (`root.current = finishedWork`), and the old
tree becomes the next render's scratch space.

</details>

## The problem: a call stack can't be paused

Before Fiber, rendering looked roughly like this:

<figure class="fig fig-stack-vs-fiber"><div class="versus"><div class="vs-card"><h5>Stack reconciler <small>(≤ React 15)</small></h5><div class="stack"><div class="frame">reconcile(<b>button</b>)</div><div class="frame">reconcile(<b>Counter</b>)</div><div class="frame">reconcile(<b>main</b>)</div><div class="frame">reconcile(<b>App</b>)</div></div><p><span class="chip chip-bad">can’t pause</span><span class="chip chip-bad">can’t prioritize</span><span class="chip chip-bad">can’t throw away</span></p></div><div class="vs-card"><h5>Fiber <small>(React 16+)</small></h5><div class="heap"><span class="obj">App</span><span class="obj">main</span><span class="obj on">Counter</span><span class="obj">button</span><div class="ptr"><code>workInProgress</code> → Counter</div></div><p><span class="chip chip-good">pause</span><span class="chip chip-good">resume</span><span class="chip chip-good">prioritize</span><span class="chip chip-good">discard</span></p></div></div><figcaption>The stack reconciler kept its place on the JS call stack. Fiber keeps it in one variable.</figcaption></figure>

```js
function reconcile(element) {
	const children = render(element)   // call the component
	children.forEach(reconcile)          // recurse
}
```

The state of "where are we in the tree" lived on the **JavaScript call
stack**. That has three consequences:

- **It can't be interrupted.** To yield to the browser you'd have to return
  from every frame, losing your place.
- **It can't be prioritized.** A keystroke arriving mid-render waits for the
  whole tree.
- **It can't be thrown away cleanly** if the result is already stale.

Andrew Clark: "a fiber represents a **unit of work**". A fiber is a **virtual
stack frame**. The architecture doc: "The advantage of reimplementing the
stack is that you can keep stack frames in memory and execute them however
(and whenever) you want." Because the "stack" is now heap objects, React's
loop can stop after any fiber, remember `workInProgress` (a single pointer),
let the browser paint, and pick up exactly there.

## What a fiber holds

The constructor from the 19.2.5 build, with profiler and dev-only fields
removed:

<figure class="fig fig-anatomy"><div class="anatomy"><div class="anatomy-title"><code>FiberNode</code></div><div class="anatomy-grid"><div class="anatomy-group g-pink"><h5>Identity</h5><code>tag</code><code>key</code><code>elementType</code><code>type</code><code>stateNode</code></div><div class="anatomy-group g-teal"><h5>Tree links</h5><code>return</code><code>child</code><code>sibling</code><code>index</code><code>ref</code></div><div class="anatomy-group g-mustard"><h5>Props & state</h5><code>pendingProps</code><code>memoizedProps</code><code>memoizedState</code><code>updateQueue</code><code>dependencies</code></div><div class="anatomy-group g-orange"><h5>Effects</h5><code>flags</code><code>subtreeFlags</code><code>deletions</code></div><div class="anatomy-group g-plum"><h5>Scheduling</h5><code>lanes</code><code>childLanes</code></div><div class="anatomy-group g-cream"><h5>Double buffering</h5><code>alternate</code></div></div></div><figcaption>A fiber is a plain object. You only need to remember: type, props, state, and links to parent / child / sibling.</figcaption></figure>

```js
function FiberNode(tag, pendingProps, key, mode) {
	this.tag = tag                  // what kind of fiber: FunctionComponent, HostComponent, …
	this.key = key
	this.elementType = null         // the element's type as written (e.g. the memo wrapper)
	this.type = null                // the resolved function/class, or 'div'
	this.stateNode = null           // DOM node for host fibers, class instance, or FiberRoot

	this.return = null              // parent
	this.child = null               // first child
	this.sibling = null             // next sibling
	this.index = 0                  // position among siblings (used by the list diff)

	this.ref = null
	this.pendingProps = pendingProps  // props for this render
	this.memoizedProps = null         // props used in the last completed render
	this.updateQueue = null           // effects list / class updates
	this.memoizedState = null         // function components: the first hook of the hooks list
	this.dependencies = null          // contexts this fiber reads

	this.mode = mode                  // ConcurrentMode, StrictMode bits
	this.flags = 0                    // side effects on this fiber (Placement, Update, …)
	this.subtreeFlags = 0             // OR of all flags below
	this.deletions = null             // children to delete in the commit

	this.lanes = 0                    // pending update priorities on THIS fiber
	this.childLanes = 0               // pending update priorities somewhere BELOW

	this.alternate = null             // the other version (current ↔ workInProgress)
}
```

Grouped by purpose:

| Group | Fields | Used for |
|---|---|---|
| **Identity** | `tag`, `type`, `elementType`, `key` | reconciliation: "is this the same thing as last time?" ([Reconciliation](../../internals/reconciliation/)) |
| **Tree links** | `return`, `child`, `sibling`, `index` | walking the tree without recursion ([The Work Loop](../../internals/the-work-loop/)) |
| **Inputs** | `pendingProps`, `memoizedProps` | bailout: if they're the same object and nothing else changed, skip |
| **State** | `memoizedState`, `updateQueue`, `dependencies` | hooks list, effect list, context subscriptions ([Hooks Under the Hood](../../internals/hooks-under-the-hood/)) |
| **Output** | `stateNode`, `flags`, `subtreeFlags`, `deletions` | what the commit must do ([Commit Phase and Effects](../../internals/commit-phase-and-effects/)) |
| **Scheduling** | `lanes`, `childLanes` | which updates are pending here or below ([Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/)) |
| **Double buffering** | `alternate` | pairing current and work-in-progress |

Some common `tag` values: `0` FunctionComponent, `1` ClassComponent, `3`
HostRoot, `5` HostComponent (`div`), `6` HostText, `7` Fragment, `11`
ForwardRef, `14` MemoComponent, `15` SimpleMemoComponent, `13`
SuspenseComponent.

> Fibers are the "instances" of function components. A function component
> has no `this`. Its state lives on its fiber, in `memoizedState`. That's why
> state survives exactly as long as the fiber does, and why [Reconciliation](../../internals/reconciliation/)
> decisions ("reuse this fiber or not") decide whether state survives.

## The tree is a linked list

A fiber doesn't hold an array of children. It points to its **first child**,
each child points to its **next sibling**, and every fiber points to its
**parent** through `return` (named after the return address of a stack
frame):

```tsx
<App>
	<Header />
	<main>
		<Counter />
		<p>hi</p>
	</main>
</App>
```

<figure class="fig fig-fiber-tree"><svg viewBox="0 0 560 380" class="diagram-svg" role="img" aria-label="Fiber tree with child, sibling and return pointers"><defs><marker id="ah-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2b2522"/></marker><marker id="ah-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#ff7a00"/></marker><marker id="ah-pink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#d9539f"/></marker></defs><path d="M56 47 V85" class="e-child" marker-end="url(#ah-ink)"/><path d="M56 127 V165" class="e-child" marker-end="url(#ah-ink)"/><path d="M256 207 V245" class="e-child" marker-end="url(#ah-ink)"/><path d="M456 287 V325" class="e-child" marker-end="url(#ah-ink)"/><path d="M129 188 H207" class="e-sibling" marker-end="url(#ah-orange)"/><path d="M329 268 H407" class="e-sibling" marker-end="url(#ah-orange)"/><path d="M84 89 V51" class="e-return" marker-end="url(#ah-pink)"/><path d="M84 169 V131" class="e-return" marker-end="url(#ah-pink)"/><path d="M240 169 C240 138 169 108 133 108" class="e-return" marker-end="url(#ah-pink)"/><path d="M284 249 V211" class="e-return" marker-end="url(#ah-pink)"/><path d="M440 249 C440 218 369 188 333 188" class="e-return" marker-end="url(#ah-pink)"/><path d="M484 329 V291" class="e-return" marker-end="url(#ah-pink)"/><g><rect x="11" y="9" width="118" height="38" rx="9" fill="#efe3c8" stroke="#2b2522" stroke-width="2"/><text x="70" y="33" text-anchor="middle" class="t-node">HostRoot</text></g><g><rect x="11" y="89" width="118" height="38" rx="9" fill="#f7c4e6" stroke="#2b2522" stroke-width="2"/><text x="70" y="113" text-anchor="middle" class="t-node">App</text></g><g><rect x="11" y="169" width="118" height="38" rx="9" fill="#f7c4e6" stroke="#2b2522" stroke-width="2"/><text x="70" y="193" text-anchor="middle" class="t-node">Header</text></g><g><rect x="211" y="169" width="118" height="38" rx="9" fill="#a6ece3" stroke="#2b2522" stroke-width="2"/><text x="270" y="193" text-anchor="middle" class="t-node">main</text></g><g><rect x="211" y="249" width="118" height="38" rx="9" fill="#f7c4e6" stroke="#2b2522" stroke-width="2"/><text x="270" y="273" text-anchor="middle" class="t-node">Counter</text></g><g><rect x="411" y="249" width="118" height="38" rx="9" fill="#a6ece3" stroke="#2b2522" stroke-width="2"/><text x="470" y="273" text-anchor="middle" class="t-node">p</text></g><g><rect x="411" y="329" width="118" height="38" rx="9" fill="#ffe08a" stroke="#2b2522" stroke-width="2"/><text x="470" y="353" text-anchor="middle" class="t-node">"hi" (HostText)</text></g></svg><div class="legend"><span><i class="sw sw-child"></i>child (first child only)</span><span><i class="sw sw-sibling"></i>sibling</span><span><i class="sw sw-return"></i>return (parent)</span></div><figcaption>No children arrays: each fiber points to its first <code>child</code>, its next <code>sibling</code>, and its parent via <code>return</code>.</figcaption></figure>

This shape is what lets the work loop do a depth-first traversal with a
`while` loop and one pointer instead of recursion.

## Double buffering: current and work-in-progress

A fiber tree is never edited while it's on screen. React keeps two trees:

- **current**: `root.current`, what the DOM reflects right now.
- **workInProgress**: the tree being rendered.

Each fiber in one tree points to its counterpart in the other through
`alternate`. When React starts on a fiber it calls
`createWorkInProgress(current, pendingProps)`, from the source:

```js
function createWorkInProgress(current, pendingProps) {
	var workInProgress = current.alternate
	null === workInProgress
		? ((workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode)),
			(workInProgress.elementType = current.elementType),
			(workInProgress.type = current.type),
			(workInProgress.stateNode = current.stateNode),
			(workInProgress.alternate = current),
			(current.alternate = workInProgress))
		: ((workInProgress.pendingProps = pendingProps),
			(workInProgress.type = current.type),
			(workInProgress.flags = 0),
			(workInProgress.subtreeFlags = 0),
			(workInProgress.deletions = null))
	// … then copy lanes, child, memoizedProps, memoizedState, updateQueue, sibling, index, ref
	return workInProgress
}
```

So after the first update, React **recycles** the fiber from two renders ago
instead of allocating a new one. When the render completes, the commit does
`root.current = finishedWork`, and the trees swap roles:

<figure class="fig anim fig-double-buffer-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;root.current = A&quot;,&quot;say&quot;:&quot;After mount there is one tree, &lt;b&gt;A&lt;/b&gt;. It is &lt;code&gt;current&lt;/code&gt;: what the DOM reflects.&quot;,&quot;set&quot;:{&quot;a-root&quot;:&quot;done&quot;,&quot;a-counter&quot;:&quot;done&quot;,&quot;a-button&quot;:&quot;done&quot;},&quot;stack&quot;:[]},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setCount(1)&quot;,&quot;say&quot;:&quot;Click. An update is queued on Counter’s hook. Nothing is rendered yet.&quot;,&quot;set&quot;:{&quot;a-counter&quot;:&quot;done hl&quot;},&quot;stack&quot;:[&quot;dispatchDiscreteEvent&quot;,&quot;dispatchEvent&quot;,&quot;onClick&quot;,&quot;dispatchSetState&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createWorkInProgress(A.root)&quot;,&quot;say&quot;:&quot;Render starts by creating a &lt;b&gt;work-in-progress&lt;/b&gt; copy of the root. The copies are linked to the originals through &lt;code&gt;alternate&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;a-counter&quot;:&quot;done&quot;,&quot;b-root&quot;:&quot;new&quot;,&quot;alt&quot;:&quot;&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;prepareFreshStack&quot;,&quot;createWorkInProgress&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createWorkInProgress(A.counter) → Counter() → count = 1&quot;,&quot;say&quot;:&quot;Counter runs &lt;b&gt;on tree B&lt;/b&gt;: its hook says 1. Tree A still says 0, and A is what is on screen.&quot;,&quot;set&quot;:{&quot;b-counter&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;b-counter-sub&quot;:&quot;count: 1&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(Counter)&quot;,&quot;updateFunctionComponent&quot;,&quot;renderWithHooks&quot;,&quot;Counter()&quot;,&quot;updateReducer&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildren → useFiber(A.button) → completeWork: flag Update&quot;,&quot;say&quot;:&quot;The button fiber is copied too, with new props. If React abandoned this render now, it would just drop B: A was never touched.&quot;,&quot;set&quot;:{&quot;b-counter&quot;:&quot;new&quot;,&quot;b-button&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;b-button-sub&quot;:&quot;\&quot;1\&quot;&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(Counter)&quot;,&quot;updateFunctionComponent&quot;,&quot;reconcileChildren&quot;,&quot;reconcileChildFibers&quot;,&quot;reconcileSingleElement&quot;,&quot;useFiber&quot;,&quot;createWorkInProgress&quot;]},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;root.current = finishedWork&quot;,&quot;say&quot;:&quot;Commit writes the DOM, then flips &lt;b&gt;one pointer&lt;/b&gt;. B is now current; A becomes the spare.&quot;,&quot;set&quot;:{&quot;ptr&quot;:&quot;on&quot;,&quot;b-root&quot;:&quot;done&quot;,&quot;b-counter&quot;:&quot;done&quot;,&quot;b-button&quot;:&quot;done&quot;,&quot;a-root&quot;:&quot;faint&quot;,&quot;a-counter&quot;:&quot;faint&quot;,&quot;a-button&quot;:&quot;faint&quot;,&quot;screen&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;ptr&quot;:&quot;root.current → tree B&quot;,&quot;screen&quot;:&quot;1&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;commitRoot&quot;,&quot;flushMutationEffects&quot;]},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setCount(2)&quot;,&quot;say&quot;:&quot;Second click.&quot;,&quot;set&quot;:{&quot;ptr&quot;:&quot;&quot;,&quot;b-counter&quot;:&quot;done hl&quot;,&quot;screen&quot;:&quot;&quot;},&quot;stack&quot;:[&quot;dispatchDiscreteEvent&quot;,&quot;dispatchEvent&quot;,&quot;onClick&quot;,&quot;dispatchSetState&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createWorkInProgress(B.counter) → reuses B.alternate (tree A)&quot;,&quot;say&quot;:&quot;No new allocation this time: the work-in-progress &lt;b&gt;is&lt;/b&gt; tree A, recycled. Counter runs on it: count 2.&quot;,&quot;set&quot;:{&quot;b-counter&quot;:&quot;done&quot;,&quot;a-root&quot;:&quot;new&quot;,&quot;a-counter&quot;:&quot;run&quot;,&quot;a-button&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;a-counter-sub&quot;:&quot;count: 2&quot;,&quot;a-button-sub&quot;:&quot;\&quot;2\&quot;&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(Counter)&quot;,&quot;updateFunctionComponent&quot;,&quot;renderWithHooks&quot;,&quot;Counter()&quot;,&quot;updateReducer&quot;]},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;root.current = finishedWork&quot;,&quot;say&quot;:&quot;Commit flips the pointer back to A. The two trees keep taking turns.&quot;,&quot;set&quot;:{&quot;ptr&quot;:&quot;on&quot;,&quot;a-root&quot;:&quot;done&quot;,&quot;a-counter&quot;:&quot;done&quot;,&quot;a-button&quot;:&quot;done&quot;,&quot;b-root&quot;:&quot;faint&quot;,&quot;b-counter&quot;:&quot;faint&quot;,&quot;b-button&quot;:&quot;faint&quot;,&quot;screen&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;ptr&quot;:&quot;root.current → tree A&quot;,&quot;screen&quot;:&quot;2&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;commitRoot&quot;,&quot;flushMutationEffects&quot;]}]" data-intro="A Counter is clicked twice. Watch which tree is &lt;code&gt;current&lt;/code&gt;."><div class="anim-stage"><div class="a-row" style="justify-content:center;margin-bottom:12px"><span class="an chip-a" data-k="ptr">root.current → tree A</span><span class="an chip-a" data-k="alt" data-s="ghost">A.alternate ↔ B</span></div><div class="a-cols"><div class="a-panel db-a"><div class="a-panel-title">tree A</div><div class="t-tree"><div class="t-branch"><div class="an node root" data-k="a-root"><span class="node-label" data-k="a-root-label">HostRoot</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="a-counter"><span class="node-label" data-k="a-counter-label">Counter</span><small data-k="a-counter-sub">count: 0</small></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="a-button"><span class="node-label" data-k="a-button-label">button</span><small data-k="a-button-sub">"0"</small></div></div></div></div></div></div></div></div></div></div><div class="a-panel db-b"><div class="a-panel-title">tree B</div><div class="t-tree"><div class="t-branch"><div class="an node root" data-k="b-root" data-s="ghost"><span class="node-label" data-k="b-root-label">HostRoot</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="b-counter" data-s="ghost"><span class="node-label" data-k="b-counter-label">Counter</span><small data-k="b-counter-sub">count: 0</small></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="b-button" data-s="ghost"><span class="node-label" data-k="b-button-label">button</span><small data-k="b-button-sub">"0"</small></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-dom">&lt;button&gt;<span class="an" data-k="screen">0</span>&lt;/button&gt;</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>root.current = A</code><span>After mount there is one tree, <b>A</b>. It is <code>current</code>: what the DOM reflects.</span><span class="anim-print-stack">stack: </span></li><li><span class="anim-phase ph-event">event</span><code>setCount(1)</code><span>Click. An update is queued on Counter’s hook. Nothing is rendered yet.</span><span class="anim-print-stack">stack: dispatchDiscreteEvent › dispatchEvent › onClick › dispatchSetState</span></li><li><span class="anim-phase ph-render">render phase</span><code>createWorkInProgress(A.root)</code><span>Render starts by creating a <b>work-in-progress</b> copy of the root. The copies are linked to the originals through <code>alternate</code>.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › prepareFreshStack › createWorkInProgress</span></li><li><span class="anim-phase ph-render">render phase</span><code>createWorkInProgress(A.counter) → Counter() → count = 1</code><span>Counter runs <b>on tree B</b>: its hook says 1. Tree A still says 0, and A is what is on screen.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(Counter) › updateFunctionComponent › renderWithHooks › Counter() › updateReducer</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildren → useFiber(A.button) → completeWork: flag Update</code><span>The button fiber is copied too, with new props. If React abandoned this render now, it would just drop B: A was never touched.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(Counter) › updateFunctionComponent › reconcileChildren › reconcileChildFibers › reconcileSingleElement › useFiber › createWorkInProgress</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>root.current = finishedWork</code><span>Commit writes the DOM, then flips <b>one pointer</b>. B is now current; A becomes the spare.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › commitRoot › flushMutationEffects</span></li><li><span class="anim-phase ph-event">event</span><code>setCount(2)</code><span>Second click.</span><span class="anim-print-stack">stack: dispatchDiscreteEvent › dispatchEvent › onClick › dispatchSetState</span></li><li><span class="anim-phase ph-render">render phase</span><code>createWorkInProgress(B.counter) → reuses B.alternate (tree A)</code><span>No new allocation this time: the work-in-progress <b>is</b> tree A, recycled. Counter runs on it: count 2.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(Counter) › updateFunctionComponent › renderWithHooks › Counter() › updateReducer</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>root.current = finishedWork</code><span>Commit flips the pointer back to A. The two trees keep taking turns.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › commitRoot › flushMutationEffects</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="done"></i>completed</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Double buffering: render builds the other tree off-screen; commit swaps a single pointer.</figcaption></figure>

Why this matters for you:
- **Interruptible rendering is safe.** Abandoning a render just drops the
  work-in-progress pointers. The current tree was never touched.
- **State reads are consistent.** A render reads from the work-in-progress
  hooks, which start as copies of `current`'s. Nothing leaks to the screen
  until commit.
- **"Tearing" is only possible with outside stores.** React's own state is
  snapshotted per render. External mutable stores need
  `useSyncExternalStore` (*useSyncExternalStore*) to stay consistent across
  a render that yields.

## Fiber, step by step

What exists at each moment for a `Counter` whose button is clicked:

| Moment | `root.current` | Counter fibers | `memoizedState` (the `useState` hook) |
|---|---|---|---|
| after mount | tree A | `CounterA` (alternate `null`) | `CounterA`: `0` |
| click → render starts | tree A | `createWorkInProgress(CounterA)` → new `CounterB`, `CounterA.alternate = CounterB` | `CounterB` copies the hook list from A. The hook's queue holds the pending update |
| `Counter()` runs | tree A | `CounterB` | `CounterB`: `1`. `CounterA` still `0`, still on screen |
| commit | **tree B** | `CounterB` is current | screen shows `1` |
| next click | tree B | `createWorkInProgress(CounterB)` → **reuses `CounterA`** as the WIP | `CounterA` becomes `2` |

## Rules and caveats

- **Fibers are internal.** Never rely on fields like `_reactInternals` or
  `__reactFiber$…` on DOM nodes. They're for DevTools and change between
  versions.
- **One fiber = one mounted instance.** Rendering the same component in two
  places makes two fibers with independent state.
- **Unmounted means the fiber is gone.** Its hooks, and therefore its state,
  are garbage.
- **"Fiber" doesn't mean faster by default.** It makes *scheduling* possible.
  Most updates (clicks, typing) still render synchronously. Only transitions
  and deferred values are time-sliced. See
  [Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/).

### Sources
- [Andrew Clark: React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [Lin Clark: A Cartoon Intro to Fiber (React Conf 2017)](https://www.youtube.com/watch?v=ZCuYPiUIONs)
- React 19.2.5 source: `FiberNode`, `createFiber`, `createWorkInProgress`, and `root.current = finishedWork` in `flushMutationEffects`
