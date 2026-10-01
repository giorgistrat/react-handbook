---
title: "The Work Loop"
slug: "the-work-loop"
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
> [React Internals](../../). It builds on [React Fiber](../react-fiber/) and explains the mechanism
> behind the *React Performance* module's optimizations. My own notes and
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
position on the JS call stack ([React Fiber](../react-fiber/) explains why that's a
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
See [Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/).

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
it passes. See *Memoize Components*.

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

<figure class="fig fig-walker"><div class="walker" data-walker data-steps="[{&quot;n&quot;:[&quot;HostRoot&quot;],&quot;call&quot;:&quot;beginWork&quot;,&quot;s&quot;:&quot;bail&quot;,&quot;d&quot;:&quot;No own update, but &lt;code&gt;childLanes&lt;/code&gt; has Sync → clone the children.&quot;},{&quot;n&quot;:[&quot;App&quot;],&quot;call&quot;:&quot;beginWork&quot;,&quot;s&quot;:&quot;bail&quot;,&quot;d&quot;:&quot;Same props object, no update, &lt;code&gt;childLanes&lt;/code&gt; has Sync → &lt;b&gt;bail out, continue&lt;/b&gt;. &lt;code&gt;App()&lt;/code&gt; is not called.&quot;},{&quot;n&quot;:[&quot;Fragment&quot;],&quot;call&quot;:&quot;beginWork&quot;,&quot;s&quot;:&quot;bail&quot;,&quot;d&quot;:&quot;Same → bail out, continue.&quot;},{&quot;n&quot;:[&quot;Header&quot;],&quot;call&quot;:&quot;beginWork&quot;,&quot;s&quot;:&quot;skip&quot;,&quot;d&quot;:&quot;Same props, no update, &lt;code&gt;childLanes = 0&lt;/code&gt; → &lt;b&gt;skip the whole subtree&lt;/b&gt;, return &lt;code&gt;null&lt;/code&gt;.&quot;},{&quot;n&quot;:[&quot;Header&quot;],&quot;call&quot;:&quot;completeUnitOfWork&quot;,&quot;s&quot;:&quot;skip&quot;,&quot;d&quot;:&quot;Nothing to complete → move to the sibling.&quot;},{&quot;n&quot;:[&quot;Counter&quot;],&quot;call&quot;:&quot;beginWork&quot;,&quot;s&quot;:&quot;render&quot;,&quot;d&quot;:&quot;&lt;code&gt;lanes&lt;/code&gt; has Sync → &lt;b&gt;render&lt;/b&gt;: &lt;code&gt;Counter()&lt;/code&gt; runs, &lt;code&gt;useState&lt;/code&gt; → 1, reconcile &lt;code&gt;&amp;lt;button&amp;gt;&lt;/code&gt; → reuse fiber.&quot;},{&quot;n&quot;:[&quot;button&quot;],&quot;call&quot;:&quot;beginWork&quot;,&quot;s&quot;:&quot;render&quot;,&quot;d&quot;:&quot;New props object → reconcile its text child &lt;code&gt;\&quot;1\&quot;&lt;/code&gt;.&quot;},{&quot;n&quot;:[&quot;text&quot;],&quot;call&quot;:&quot;beginWork → completeWork&quot;,&quot;s&quot;:&quot;complete&quot;,&quot;d&quot;:&quot;Text changed → flag &lt;code&gt;Update&lt;/code&gt;. No child, so climb.&quot;},{&quot;n&quot;:[&quot;button&quot;],&quot;call&quot;:&quot;completeWork&quot;,&quot;s&quot;:&quot;complete&quot;,&quot;d&quot;:&quot;New props → flag &lt;code&gt;Update&lt;/code&gt;. Bubble &lt;code&gt;subtreeFlags&lt;/code&gt;.&quot;},{&quot;n&quot;:[&quot;Counter&quot;,&quot;Fragment&quot;,&quot;App&quot;,&quot;HostRoot&quot;],&quot;call&quot;:&quot;completeWork ×4&quot;,&quot;s&quot;:&quot;complete&quot;,&quot;d&quot;:&quot;Bubble &lt;code&gt;subtreeFlags&lt;/code&gt; up to the root. Done: only &lt;code&gt;Counter()&lt;/code&gt; ran.&quot;}]"><svg viewBox="0 0 400 340" class="diagram-svg walker-svg"><line x1="200" y1="42" x2="200" y2="68" stroke="#2b2522" stroke-width="2"/><line x1="200" y1="100" x2="200" y2="126" stroke="#2b2522" stroke-width="2"/><line x1="200" y1="158" x2="110" y2="184" stroke="#2b2522" stroke-width="2"/><line x1="200" y1="158" x2="290" y2="184" stroke="#2b2522" stroke-width="2"/><line x1="290" y1="216" x2="290" y2="242" stroke="#2b2522" stroke-width="2"/><line x1="290" y1="274" x2="290" y2="300" stroke="#2b2522" stroke-width="2"/><g class="w-node" data-node="HostRoot"><rect x="144" y="10" width="112" height="32" rx="8"/><text x="200" y="31" text-anchor="middle" class="t-node">HostRoot</text></g><g class="w-node" data-node="App"><rect x="144" y="68" width="112" height="32" rx="8"/><text x="200" y="89" text-anchor="middle" class="t-node">App</text></g><g class="w-node" data-node="Fragment"><rect x="144" y="126" width="112" height="32" rx="8"/><text x="200" y="147" text-anchor="middle" class="t-node">Fragment</text></g><g class="w-node" data-node="Header"><rect x="54" y="184" width="112" height="32" rx="8"/><text x="110" y="205" text-anchor="middle" class="t-node">Header</text></g><g class="w-node" data-node="Counter"><rect x="234" y="184" width="112" height="32" rx="8"/><text x="290" y="205" text-anchor="middle" class="t-node">Counter</text></g><g class="w-node" data-node="button"><rect x="234" y="242" width="112" height="32" rx="8"/><text x="290" y="263" text-anchor="middle" class="t-node">button</text></g><g class="w-node" data-node="text"><rect x="234" y="300" width="112" height="32" rx="8"/><text x="290" y="321" text-anchor="middle" class="t-node">"1"</text></g></svg><div class="walker-side"><div class="walker-legend"><span class="st st-bail">bail out</span><span class="st st-skip">skipped</span><span class="st st-render">rendered</span><span class="st st-complete">completed</span></div><div class="walker-step"><span class="walker-count">Step 0 / 10</span><div class="walker-call"><code>workLoopSync()</code></div><p class="walker-desc">The button was clicked; <code>setN(1)</code> queued an update with <code>SyncLane</code> and marked <code>childLanes</code> up to the root.</p></div><div class="btn-row"><button type="button" class="btn btn-ghost" data-act="reset">Reset</button><button type="button" class="btn btn-ghost" data-act="prev">← Prev</button><button type="button" class="btn" data-act="next">Next →</button></div></div></div><figcaption>Click <b>Next</b> to walk the loop for one <code>setN(1)</code>. Colors: bailed out, skipped, rendered, completed.</figcaption></figure>

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
  This is the basis of *Element Optimization* and *Provider Component*.
- **Context bypasses bailouts.** A fiber that reads a changed context renders
  even if its parent bailed out and its props are identical
  (*Optimize Context*).
- **Rendering ≠ committing.** The loop can run a component and then discard
  the result (bailout after render, abandoned transitions).

### Sources
- React 19.2.5 source: `workLoopSync`, `workLoopConcurrentByScheduler`, `performUnitOfWork`, `completeUnitOfWork`, `beginWork`, `checkScheduledUpdateOrContext`, `bailoutOnAlreadyFinishedWork`, `markUpdateLaneFromFiberToRoot`
- [React source: `ReactFiberWorkLoop.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js) and [`ReactFiberBeginWork.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js)
- [Andrew Clark: React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
