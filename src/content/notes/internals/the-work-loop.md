---
title: "The Work Loop"
slug: "the-work-loop"
module: "internals"
order: 6
level: "good"
illus: "loop"
summary: "beginWork / completeWork, depth-first traversal without recursion, and bailouts."
source: "https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js"
---


> How React walks the fiber tree during the render phase and decides which
> components to skip. Read from `workLoopSync`, `workLoopConcurrentByScheduler`,
> `performUnitOfWork`, `completeUnitOfWork`, `beginWork` and
> `bailoutOnAlreadyFinishedWork` in the React 19.2.5 build. Part of
> [React Internals](../../internals/). It builds on [React Fiber](../../internals/react-fiber/) and explains the mechanism
> behind the [React Performance](../../performance/) module's optimizations. My own notes and
> clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>How does React traverse the component tree?</summary>

Depth-first, with a loop instead of recursion. A single pointer,
`workInProgress`, says which fiber to process next. `beginWork` handles a
fiber on the way **down** (render it, reconcile its children, return the
first child). When a fiber has no children, `completeWork` runs on the way
**up**, then React moves to the `sibling`, or back to the `return` (parent)
when there are no more siblings.

</details>

<details class="qa"><summary>What does "bailout" mean?</summary>

React skipping work for a fiber because it can prove nothing changed:
the same props object, no pending update on it, and no context change. If
nothing below it has pending work either (`childLanes`), React skips the
**entire subtree** in one step. In our example, when only `Counter`'s state
changes, `App` and `Header` are never called.

</details>

<details class="qa"><summary>Why does a child re-render when its parent re-renders, even with the same props?</summary>

Because the parent's render creates a **new element**, so the child gets a
**new props object**. React compares props with `!==`, not deeply, so
`oldProps !== newProps` and the child renders. `memo` replaces that check with
a shallow comparison of each prop. Passing the element in from above
(`children`) keeps the same props object, so React bails out without `memo`.

</details>

<details class="qa"><summary>How can rendering be interrupted?</summary>

The concurrent loop checks `shouldYield()` between units of work. If
~5ms have passed, it returns, and the `workInProgress` pointer remembers
where to resume. The sync loop never checks.

</details>

## The problem: walking a tree without the call stack

Recursion is the natural way to walk a tree, but recursion keeps its
position on the JS call stack ([React Fiber](../../internals/react-fiber/) explains why that's a
problem). Fiber stores the position in a **variable** instead. The whole
render phase is these few lines:

```js
function workLoopSync() {
	while (workInProgress !== null) performUnitOfWork(workInProgress)
}

function workLoopConcurrentByScheduler() {
	while (workInProgress !== null && !shouldYield()) performUnitOfWork(workInProgress)
}
```

The only difference between synchronous and concurrent rendering is the
`!shouldYield()` check. Which loop runs depends on the update's priority.
See [Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/).

## One unit of work: begin, then maybe complete

From the source, with profiling removed:

<figure class="fig fig-workloop"><svg viewBox="0 0 680 300" class="diagram-svg" role="img" aria-label="Work loop flowchart"><defs><marker id="wl-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2b2522"/></marker></defs><path d="M253 70 H300" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><path d="M458 70 H510" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><path d="M570 38 V16 H175 V41" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><text x="372" y="11" text-anchor="middle" class="t-small t-bold">yes → go DOWN: workInProgress = child</text><path d="M570 102 V173" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><text x="580" y="142" text-anchor="start" class="t-small t-bold">no</text><path d="M492 200 H440" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><path d="M380 168 V130 H200 V99" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><text x="290" y="124" text-anchor="middle" class="t-small t-bold">yes → go ACROSS to sibling</text><path d="M322 200 H235" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><text x="278" y="192" text-anchor="middle" class="t-small t-bold">no → go UP</text><path d="M175 232 V270 H570 V229" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><text x="372" y="288" text-anchor="middle" class="t-small t-bold">no → complete the parent (bubble flags)</text><path d="M117 200 H88" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#wl-ah)"/><text x="102" y="192" text-anchor="middle" class="t-small t-bold">yes</text><g><rect x="97" y="43" width="156" height="54" rx="10" fill="#fcf5e4" stroke="#2b2522" stroke-width="2"/><text x="175" y="68" text-anchor="middle" class="t-node">performUnitOfWork</text><text x="175" y="85" text-anchor="middle" class="t-small">one fiber</text></g><g><rect x="302" y="43" width="156" height="54" rx="10" fill="#f7c4e6" stroke="#2b2522" stroke-width="2"/><text x="380" y="68" text-anchor="middle" class="t-node">beginWork ↓</text><text x="380" y="85" text-anchor="middle" class="t-small">call it, or bail out</text></g><g><polygon points="570,38 628,70 570,102 512,70" fill="#ffe08a" stroke="#2b2522" stroke-width="2"/><text x="570" y="75" text-anchor="middle" class="t-node">child?</text></g><g><rect x="492" y="173" width="156" height="54" rx="10" fill="#a6ece3" stroke="#2b2522" stroke-width="2"/><text x="570" y="198" text-anchor="middle" class="t-node">completeWork ↑</text><text x="570" y="215" text-anchor="middle" class="t-small">create / flag DOM</text></g><g><polygon points="380,168 438,200 380,232 322,200" fill="#ffe08a" stroke="#2b2522" stroke-width="2"/><text x="380" y="205" text-anchor="middle" class="t-node">sibling?</text></g><g><polygon points="175,168 233,200 175,232 117,200" fill="#ffe08a" stroke="#2b2522" stroke-width="2"/><text x="175" y="205" text-anchor="middle" class="t-node">past root?</text></g><g><rect x="12" y="182" width="74" height="36" rx="18" fill="#ff7a00" stroke="#2b2522" stroke-width="2"/><text x="49" y="205" text-anchor="middle" class="t-node">commit</text></g></svg><figcaption>Down with <code>beginWork</code>, across to siblings, up with <code>completeWork</code>. No recursion: just one <code>workInProgress</code> pointer.</figcaption></figure>

```js
function performUnitOfWork(unitOfWork) {
	const current = unitOfWork.alternate
	const next = beginWork(current, unitOfWork, entangledRenderLanes)  // go DOWN
	unitOfWork.memoizedProps = unitOfWork.pendingProps
	if (next === null) {
		completeUnitOfWork(unitOfWork)   // no child → finish this one and climb
	} else {
		workInProgress = next            // descend into the first child
	}
}

function completeUnitOfWork(unitOfWork) {
	let completedWork = unitOfWork
	do {
		const returnFiber = completedWork.return
		const next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes)
		if (next !== null) { workInProgress = next; return }   // rare: completeWork spawned more work
		const sibling = completedWork.sibling
		if (sibling !== null) { workInProgress = sibling; return }  // go ACROSS
		completedWork = returnFiber                                   // go UP
		workInProgress = completedWork
	} while (completedWork !== null)
	workInProgressRootExitStatus = RootCompleted   // climbed past the root: tree is done
}
```

`beginWork` and `completeWork` split the per-fiber work:

| | `beginWork` (down) | `completeWork` (up) |
|---|---|---|
| Function component | try to bail out, or call it (with hooks), then reconcile the returned children | nothing much |
| Host component (`div`) | reconcile `props.children` | **mount:** create the DOM node (`document.createElement`), append the already-completed child DOM nodes, set initial props. **update:** if `memoizedProps !== newProps`, flag `Update`. In React 19 the per-attribute diff happens later, in the commit (`commitUpdate`) |
| Every fiber | – | **bubble**: `subtreeFlags \|= child.flags \| child.subtreeFlags` so the commit can skip clean subtrees |
| Returns | first child fiber, or `null` | usually `null` |

> On mount, the DOM tree is built bottom-up, detached from the document,
> during `completeWork`. The commit then inserts only the **top** new node.
> That's one `appendChild` for a whole new subtree instead of one per node.

## Bailouts: how React skips work

This is where all performance tricks end up. The start of `beginWork`,
from the 19.2.5 source:

```js
if (current !== null) {
	if (current.memoizedProps !== workInProgress.pendingProps ||
	    workInProgress.type !== current.type) {
		didReceiveUpdate = true                          // props object changed → must render
	} else {
		if (!checkScheduledUpdateOrContext(current, renderLanes) &&
		    (workInProgress.flags & DidCapture) === 0) {
			didReceiveUpdate = false
			return attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes)
		}
		// ...
	}
}
```

`checkScheduledUpdateOrContext` returns true if the fiber itself has an
update in the lanes being rendered, or a context it reads has changed:

```js
function checkScheduledUpdateOrContext(current, renderLanes) {
	if ((current.lanes & renderLanes) !== 0) return true
	const dependencies = current.dependencies
	return dependencies !== null && checkIfContextChanged(dependencies)
}
```

If the fiber can bail out, `bailoutOnAlreadyFinishedWork` decides **how
much** to skip:

```js
function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
	if ((renderLanes & workInProgress.childLanes) === 0) {
		// (after checking for context changes propagated from above)
		return null                // NOTHING below needs work → skip the whole subtree
	}
	// something below does → clone the children (createWorkInProgress on each) and keep going
	return workInProgress.child
}
```

So there are three outcomes for each fiber:

| Case | Condition | What happens |
|---|---|---|
| **Render** | new props object, or own state update, or context changed | the component function runs, and children are reconciled |
| **Bail out, continue** | nothing changed here, but `childLanes` has work | the component is **not called**. Its children are cloned and the walk continues down |
| **Bail out, skip subtree** | nothing changed here or below | `beginWork` returns `null`. The whole subtree is skipped in O(1) |

`childLanes` is set for every queued update just before the render starts
(`prepareFreshStack` → `finishQueueingConcurrentUpdates` →
`markUpdateLaneFromFiberToRoot`). That ORs the lane into `fiber.lanes` and
into `childLanes` of every ancestor up to the root. That trail of breadcrumbs is how React finds the one changed
component without calling every component above it.

### Where `memo` fits

A `memo` component whose parent re-rendered *does* get a new props object, so
the `!==` check above says "changed". `updateMemoComponent` /
`updateSimpleMemoComponent` then run a second check,
`shallowEqual(prevProps, nextProps)` (or your `arePropsEqual`), and bail out if
it passes. See [Memoize Components](../../performance/element-optimization/#5-memo-the-component).

### A second chance after rendering

Even when a function component *does* run, if its hooks produced no change
(the state updates all computed to `Object.is`-equal values), then
`didReceiveUpdate` stays false and React calls `bailoutHooks` +
`bailoutOnAlreadyFinishedWork`, discarding the output and skipping the
children. This is why a component that sets the same state can render once
and still not re-render its children.

## The work loop, step by step

```tsx
function App() {
	return (
		<>
			<Header />
			<Counter />
		</>
	)
}
function Counter() {
	const [n, setN] = useState(0)
	return <button onClick={() => setN(n + 1)}>{n}</button>
}
```

<figure class="fig anim fig-workloop-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(HostRoot)&quot;,&quot;say&quot;:&quot;No own update, but &lt;code&gt;childLanes&lt;/code&gt; has Sync → clone the children and continue.&quot;,&quot;set&quot;:{&quot;HostRoot&quot;:&quot;bail hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(HostRoot)&quot;,&quot;bailoutOnAlreadyFinishedWork&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(App)&quot;,&quot;say&quot;:&quot;Same props object, no update, &lt;code&gt;childLanes&lt;/code&gt; has Sync → &lt;b&gt;bail out, continue&lt;/b&gt;. &lt;code&gt;App()&lt;/code&gt; is not called.&quot;,&quot;set&quot;:{&quot;HostRoot&quot;:&quot;bail&quot;,&quot;App&quot;:&quot;bail hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(App)&quot;,&quot;bailoutOnAlreadyFinishedWork&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(Fragment)&quot;,&quot;say&quot;:&quot;Same → bail out, continue down.&quot;,&quot;set&quot;:{&quot;App&quot;:&quot;bail&quot;,&quot;Fragment&quot;:&quot;bail hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(Fragment)&quot;,&quot;bailoutOnAlreadyFinishedWork&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(Header) → null&quot;,&quot;say&quot;:&quot;Same props, no update, &lt;code&gt;childLanes = 0&lt;/code&gt; → &lt;b&gt;skip the whole subtree&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;Fragment&quot;:&quot;bail&quot;,&quot;Header&quot;:&quot;skip hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(Header)&quot;,&quot;bailoutOnAlreadyFinishedWork&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeUnitOfWork(Header) → sibling&quot;,&quot;say&quot;:&quot;Nothing to complete. Go &lt;b&gt;across&lt;/b&gt; to the sibling.&quot;,&quot;set&quot;:{&quot;Header&quot;:&quot;skip hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;completeUnitOfWork&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(Counter) → Counter()&quot;,&quot;say&quot;:&quot;&lt;code&gt;lanes&lt;/code&gt; has Sync → &lt;b&gt;render&lt;/b&gt;: &lt;code&gt;Counter()&lt;/code&gt; runs, &lt;code&gt;useState&lt;/code&gt; → 1, reconcile &lt;code&gt;&amp;lt;button&amp;gt;&lt;/code&gt; → reuse its fiber.&quot;,&quot;set&quot;:{&quot;Header&quot;:&quot;skip&quot;,&quot;Counter&quot;:&quot;run hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(Counter)&quot;,&quot;updateFunctionComponent&quot;,&quot;renderWithHooks&quot;,&quot;Counter()&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(button)&quot;,&quot;say&quot;:&quot;New props object → reconcile its text child &lt;code&gt;\&quot;1\&quot;&lt;/code&gt;. Go &lt;b&gt;down&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;Counter&quot;:&quot;run&quot;,&quot;button&quot;:&quot;run hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;beginWork(button)&quot;,&quot;reconcileChildren&quot;,&quot;reconcileChildFibers&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(text) → null · completeWork(text)&quot;,&quot;say&quot;:&quot;No children. Text changed → flag &lt;code&gt;Update&lt;/code&gt;. Climb &lt;b&gt;up&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;button&quot;:&quot;run&quot;,&quot;text&quot;:&quot;done hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;completeUnitOfWork&quot;,&quot;completeWork(\&quot;1\&quot;)&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(button)&quot;,&quot;say&quot;:&quot;New props → flag &lt;code&gt;Update&lt;/code&gt;. Bubble &lt;code&gt;subtreeFlags&lt;/code&gt; to the parent.&quot;,&quot;set&quot;:{&quot;text&quot;:&quot;done&quot;,&quot;button&quot;:&quot;done hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;completeUnitOfWork&quot;,&quot;completeWork(button)&quot;]},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork × 4 → workInProgress = null&quot;,&quot;say&quot;:&quot;Bubble up to the root. Done: &lt;b&gt;only &lt;code&gt;Counter()&lt;/code&gt; ran&lt;/b&gt;, and the commit will only visit the flagged path.&quot;,&quot;set&quot;:{&quot;button&quot;:&quot;done&quot;,&quot;Counter&quot;:&quot;done hl&quot;,&quot;Fragment&quot;:&quot;done hl&quot;,&quot;App&quot;:&quot;done hl&quot;,&quot;HostRoot&quot;:&quot;done hl&quot;},&quot;stack&quot;:[&quot;processRootScheduleInMicrotask&quot;,&quot;performSyncWorkOnRoot&quot;,&quot;performWorkOnRoot&quot;,&quot;renderRootSync&quot;,&quot;workLoopSync&quot;,&quot;performUnitOfWork&quot;,&quot;completeUnitOfWork&quot;,&quot;completeWork(HostRoot)&quot;]}]" data-intro="The button was clicked; &lt;code&gt;setN(1)&lt;/code&gt; queued an update with &lt;code&gt;SyncLane&lt;/code&gt; and marked &lt;code&gt;childLanes&lt;/code&gt; up to the root."><div class="anim-stage"><div class="t-tree"><div class="t-branch"><div class="an node root" data-k="HostRoot"><span class="node-label" data-k="HostRoot-label">HostRoot</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="App"><span class="node-label" data-k="App-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="Fragment"><span class="node-label" data-k="Fragment-label">Fragment</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="Header"><span class="node-label" data-k="Header-label">Header</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="Counter"><span class="node-label" data-k="Counter-label">Counter</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="button"><span class="node-label" data-k="button-label">button</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node text" data-k="text"><span class="node-label" data-k="text-label">"1"</span></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>beginWork(HostRoot)</code><span>No own update, but <code>childLanes</code> has Sync → clone the children and continue.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(HostRoot) › bailoutOnAlreadyFinishedWork</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(App)</code><span>Same props object, no update, <code>childLanes</code> has Sync → <b>bail out, continue</b>. <code>App()</code> is not called.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(App) › bailoutOnAlreadyFinishedWork</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(Fragment)</code><span>Same → bail out, continue down.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(Fragment) › bailoutOnAlreadyFinishedWork</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(Header) → null</code><span>Same props, no update, <code>childLanes = 0</code> → <b>skip the whole subtree</b>.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(Header) › bailoutOnAlreadyFinishedWork</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeUnitOfWork(Header) → sibling</code><span>Nothing to complete. Go <b>across</b> to the sibling.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › completeUnitOfWork</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(Counter) → Counter()</code><span><code>lanes</code> has Sync → <b>render</b>: <code>Counter()</code> runs, <code>useState</code> → 1, reconcile <code>&lt;button&gt;</code> → reuse its fiber.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(Counter) › updateFunctionComponent › renderWithHooks › Counter()</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(button)</code><span>New props object → reconcile its text child <code>"1"</code>. Go <b>down</b>.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › beginWork(button) › reconcileChildren › reconcileChildFibers</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(text) → null · completeWork(text)</code><span>No children. Text changed → flag <code>Update</code>. Climb <b>up</b>.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › completeUnitOfWork › completeWork("1")</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork(button)</code><span>New props → flag <code>Update</code>. Bubble <code>subtreeFlags</code> to the parent.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › completeUnitOfWork › completeWork(button)</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork × 4 → workInProgress = null</code><span>Bubble up to the root. Done: <b>only <code>Counter()</code> ran</b>, and the commit will only visit the flagged path.</span><span class="anim-print-stack">stack: processRootScheduleInMicrotask › performSyncWorkOnRoot › performWorkOnRoot › renderRootSync › workLoopSync › performUnitOfWork › completeUnitOfWork › completeWork(HostRoot)</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="bail"></i>bailed out</span><span><i class="an lg-sw" data-s="skip"></i>skipped</span><span><i class="an lg-sw" data-s="done"></i>completed</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The work loop for one <code>setN(1)</code>: down with <code>beginWork</code>, across, and up with <code>completeWork</code>.</figcaption></figure>

The fiber tree is `HostRoot → App → Fragment → [Header, Counter → button →
"0"]`. The button is clicked and `setN(1)` queues an update. When the render starts,
`Counter.lanes` gets `SyncLane`, and so do the `childLanes` of Fragment, App
and HostRoot.

| # | `workInProgress` | Call | Decision | Next |
|---|---|---|---|---|
| 1 | HostRoot | `beginWork` | no own update, `childLanes` has Sync → clone children | App |
| 2 | App | `beginWork` | same props object (`null` props, cloned), no update, `childLanes` has Sync → **bail out, continue** (App not called) | Fragment |
| 3 | Fragment | `beginWork` | same → bail out, continue | Header |
| 4 | Header | `beginWork` | same props, no update, `childLanes` = 0 → **skip subtree** → `null` | – |
| 5 | Header | `completeUnitOfWork` | nothing to complete → sibling | Counter |
| 6 | Counter | `beginWork` | `lanes` has Sync → **render**: `Counter()` runs, `useState` → 1, reconcile `<button>` → reuse fiber, new props | button |
| 7 | button | `beginWork` | new props object → reconcile its text child `"1"` | text |
| 8 | text | `beginWork` → `null`, then `completeWork` | text changed → flag `Update` | back up |
| 9 | button | `completeWork` | new props object → flag `Update` (the commit will find that only `onClick` changed, which React stores on the node rather than as an attribute). Bubble `subtreeFlags` | up |
| 10 | Counter → Fragment → App → HostRoot | `completeWork` each | bubble `subtreeFlags` | done |

Result: only `Counter()` ran. The commit walks down only where
`subtreeFlags` is set and updates one text node (and the button's stored props).

> Step 2 is the answer to "why doesn't `App` re-render when `Counter`'s
> state changes?" Updates start at the component that owns the state, and
> everything above it bails out.

### Yielding in the concurrent loop

If this update were a transition, the loop would be
`workLoopConcurrentByScheduler`. After each `performUnitOfWork`,
`shouldYield()` checks whether the current slice has used ~5ms. If so, the
loop exits, `workInProgress` still points at, say, the button fiber, and
React asks the Scheduler to call it back. The next slice resumes at exactly
that fiber. If a higher-priority update arrived in between, React instead
throws the work-in-progress away (`prepareFreshStack`) and starts over from
the root with the new lanes.

## Rules and caveats

- **Updates start where the state lives.** Keep state as low as possible so
  fewer components sit between it and the fibers that read it.
- **Props are compared by reference.** A new JSX element means a new props
  object, which means a render unless `memo` says otherwise.
- **Reusing an element skips it for free.** `children` passed from a parent
  that didn't re-render carry the *same* props object, so they bail out.
  This is the basis of [Element Optimization](../../performance/element-optimization/) and [Provider Component](../../performance/optimize-context/#3-a-provider-component).
- **Context bypasses bailouts.** A fiber that reads a changed context renders
  even if its parent bailed out and its props are identical
  ([Optimize Context](../../performance/optimize-context/)).
- **Rendering ≠ committing.** The loop can run a component and then discard
  the result (bailout after render, abandoned transitions).

### Sources
- React 19.2.5 source: `workLoopSync`, `workLoopConcurrentByScheduler`, `performUnitOfWork`, `completeUnitOfWork`, `beginWork`, `checkScheduledUpdateOrContext`, `bailoutOnAlreadyFinishedWork`, `markUpdateLaneFromFiberToRoot`
- [React source: `ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js) and [`ReactFiberBeginWork.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js)
- [Andrew Clark: React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
