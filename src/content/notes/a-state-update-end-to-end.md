---
title: "A State Update, End to End"
slug: "a-state-update-end-to-end"
order: 9
level: "good"
illus: "plane"
summary: "One click traced through ~30 real React functions, from the native event to paint and effects."
source: "https://github.com/facebook/react/tree/main/packages/react-reconciler/src"
---


> A line-by-line execution trace of one click through React 19.2.5, naming
> the real functions in `react-dom-client.development.js` at each step. This
> note is about **invocation order**. The *concepts* are explained in
> [Render and Commit](../render-and-commit/), [Reconciliation](../reconciliation/), [React Fiber](../react-fiber/),
> [The Work Loop](../the-work-loop/), [Commit Phase and Effects](../commit-phase-and-effects/),
> [Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/) and [Hooks Under the Hood](../hooks-under-the-hood/). Part of
> [React Internals](../../).

## The app

```tsx
function App() {
	return (
		<main>
			<Header />
			<Counter />
		</main>
	)
}

function Header() {
	return <h1>Clicks</h1>
}

function Counter() {
	const [count, setCount] = useState(0)
	const buttonRef = useRef<HTMLButtonElement>(null)

	useLayoutEffect(() => {
		buttonRef.current!.style.width = `${40 + count * 10}px`
	}, [count])

	useEffect(() => {
		document.title = `Clicks: ${count}`
	}, [count])

	return (
		<button ref={buttonRef} onClick={() => setCount(count + 1)}>
			{count}
		</button>
	)
}
```

The fiber tree after mount (`current`), with the hook list on `Counter`:

<figure class="fig fig-e2e-tree"><div class="tree-list"><div class="tl" style="--d:0"><span class="tl-n tl-root">HostRoot</span></div><div class="tl" style="--d:1"><span class="tl-n tl-comp">App</span></div><div class="tl" style="--d:2"><span class="tl-n tl-host">main</span></div><div class="tl" style="--d:3"><span class="tl-n tl-comp">Header</span></div><div class="tl" style="--d:4"><span class="tl-n tl-host">h1</span> → <span class="tl-n tl-text">"Clicks"</span></div><div class="tl" style="--d:3"><span class="tl-n tl-comp tl-hot">Counter</span></div><div class="tl" style="--d:4"><span class="tl-n tl-host">button</span> → <span class="tl-n tl-text">"0"</span></div></div><div class="nested"><div class="chain"><div class="chain-start"><code>Counter</code> fiber<small>.memoizedState</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#1</span><b>useState</b><code>0</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#2</span><b>useRef</b><code>{ current: &lt;button&gt; }</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#3</span><b>useLayoutEffect</b><code>deps [0]</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#4</span><b>useEffect</b><code>deps [0]</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-null">null</div></div></div><figcaption>The <code>current</code> fiber tree after mount, with <code>Counter</code>’s hook list.</figcaption></figure>

## Render trace: clicking the button once

<figure class="fig fig-mermaid"><pre class="mermaid">
sequenceDiagram
  autonumber
  participant B as Browser
  participant D as React DOM root listener
  participant C as Counter handler
  participant S as Microtask
  participant W as Work loop
  participant K as Commit
  B-&gt;&gt;D: native click
  D-&gt;&gt;C: dispatchDiscreteEvent → onClick
  C-&gt;&gt;S: setCount(1) · SyncLane · queueMicrotask
  C--&gt;&gt;B: handler returns, nothing rendered yet
  S-&gt;&gt;W: performSyncWorkOnRoot → renderRootSync
  W-&gt;&gt;W: HostRoot, App, main bail out · Header skipped
  W-&gt;&gt;W: Counter() runs → count = 1
  W-&gt;&gt;K: commitRoot
  K-&gt;&gt;K: mutation: "0" → "1", then root.current = finishedWork
  K-&gt;&gt;K: layout: useLayoutEffect sets width 50px
  K-&gt;&gt;K: passive (SyncLane): document.title = "Clicks: 1"
  K--&gt;&gt;B: microtask ends → paint
</pre><figcaption>One click, end to end. Steps 1–4 are the event, 5–7 render, 8–11 commit, 12 paint.</figcaption></figure>

### Phase 1: the event

1. The browser dispatches a native `click`. React doesn't attach listeners to
   individual nodes. At `createRoot` time, `listenToAllSupportedEvents`
   registered one listener per event type on the **root container**.
2. The root listener for a discrete event is `dispatchDiscreteEvent`. It sets
   `ReactDOMSharedInternals.p = DiscreteEventPriority` (and clears any
   ambient transition), then calls `dispatchEvent`.
3. `dispatchEvent` → `dispatchEventForPluginEventSystem` finds the fiber for
   the target DOM node (React stores a pointer to it on the node), walks
   `return` pointers up to the root collecting `onClick` props, and creates a
   `SyntheticEvent`.
4. Your handler runs: `setCount(count + 1)`, which is `setCount(1)`.

### Phase 2: scheduling the update

5. `dispatchSetState(CounterFiber, queue, 1)` → `requestUpdateLane` → no
   transition, so `resolveUpdatePriority()` returns the priority from step 2:
   **`SyncLane`**.
6. `dispatchSetStateInternal`: `Counter`'s fiber has no pending lanes, so the
   eager path runs. `basicStateReducer(0, 1)` → `1`. `Object.is(1, 0)` is
   false, so it keeps going (the update keeps `eagerState: 1`).
7. `enqueueConcurrentHookUpdate` stashes the update in `concurrentQueues`
   and `getRootForUpdatedFiber` walks up to the `FiberRoot`.
8. `scheduleUpdateOnFiber(root, fiber, SyncLane)` → `markRootUpdated` adds
   `SyncLane` to `root.pendingLanes` → `ensureRootIsScheduled(root)` →
   `scheduleImmediateRootScheduleTask` → **`queueMicrotask`**.
9. The handler returns, and `dispatchDiscreteEvent` restores the previous
   priority. The browser event is over. Nothing has rendered yet. Any other
   `setState` in this handler would have joined the same batch.

### Phase 3: render (synchronous, because the lane is `SyncLane`)

10. The microtask runs `processRootScheduleInMicrotask`. It sees a sync lane
    and calls `flushSyncWorkAcrossRoots_impl` → `performSyncWorkOnRoot` →
    `performWorkOnRoot(root, SyncLane, true)`.
11. `(lanes & 127) !== 0`, so this is a blocking lane → `renderRootSync`.
12. `prepareFreshStack(root, SyncLane)`: `workInProgress =
    createWorkInProgress(root.current, null)`, a WIP HostRoot (the first
    time, a new fiber that becomes the alternate). Then
    `finishQueueingConcurrentUpdates` links the stashed update into
    `queue.pending` and runs `markUpdateLaneFromFiberToRoot`: `Counter.lanes
    |= SyncLane`, and `main`, `App` and `HostRoot` get `childLanes |=
    SyncLane`.
13. `workLoopSync`: `while (workInProgress !== null)
    performUnitOfWork(workInProgress)`.
14. **HostRoot** `beginWork`: no own update, but `childLanes` includes Sync →
    `bailoutOnAlreadyFinishedWork` clones `App` → next = App.
15. **App** `beginWork`: `current.memoizedProps === workInProgress.pendingProps`
    (the same cloned props object), `checkScheduledUpdateOrContext` → false →
    `attemptEarlyBailoutIfNoScheduledUpdate` → `bailoutOnAlreadyFinishedWork`:
    `childLanes` has Sync → clone `main` → next = main. **`App()` is not
    called.**
16. **main** `beginWork`: same → bail out, clone `Header` and `Counter` → next =
    Header.
17. **Header** `beginWork`: same props object, no lanes, `childLanes === 0`
    → `bailoutOnAlreadyFinishedWork` returns **`null`**. The whole Header
    subtree is skipped. `completeUnitOfWork(Header)`: nothing to do → sibling
    → next = Counter.
18. **Counter** `beginWork`: `Counter.lanes & SyncLane` → must render →
    `updateFunctionComponent` → `renderWithHooks` installs
    `HooksDispatcherOnUpdate` and calls **`Counter(props)`**:
    - `useState` → `updateReducer`: `baseQueue = [u1]`, u1 has eager state
      `1` → `count = 1`, which differs from 0 →
      `didReceiveUpdate = true`.
    - `useRef` → returns the same `{ current: <button> }` object.
    - `useLayoutEffect` → `updateEffectImpl`: deps `[1]` vs `[0]` →
      `Object.is(1, 0)` false → fiber gets the `Update` flag, effect pushed
      with `HasEffect | Layout`.
    - `useEffect` → deps changed → fiber gets the `Passive` flag, effect
      pushed with `HasEffect | Passive`.
    - Returns `<button ref={buttonRef} onClick={newFn}>{1}</button>`.
19. `reconcileChildren` → `reconcileChildFibersImpl` (its single-element branch, `reconcileSingleElement` in the unminified source): the old child is a
    `button` with key `null`, and the new element is a `button` with key
    `null` → same type → `useFiber(oldButton, newProps)`. Next = button.
20. **button** `beginWork` (the HostComponent case, `updateHostComponent` in the unminified source, where `shouldSetTextContent` is checked): its children is the single
    text value `1`, which React handles as direct text content (a "single
    text child" optimization), so there's no child fiber to descend into. It
    returns `null`.
21. `completeUnitOfWork(button)` → `completeWork`: `memoizedProps !==
    newProps` → `markUpdate` (flag `Update`). The ref object is the same, so
    there's no `Ref` flag. Bubble: `Counter.subtreeFlags |= Update`.
22. Climb: `completeWork(Counter)`, `completeWork(main)`, `completeWork(App)`,
    `completeWork(HostRoot)`, each bubbling `subtreeFlags`. `workInProgress`
    becomes `null`, and the render is done. The only component that ran is
    `Counter`.

### Phase 4: commit (synchronous)

23. `commitRoot`: first `flushPendingEffects()` (none pending from earlier).
24. `flushSpawnedWork` will need to handle passive effects later, because
    `subtreeFlags` contains `Passive`. For a non-sync lane that would mean
    `scheduleCallback(NormalPriority, flushPassiveEffects)`. For `SyncLane`,
    React flushes them at the end of the commit (step 29).
25. **Before mutation** `commitBeforeMutationEffects`: nothing relevant
    (no class `getSnapshotBeforeUpdate`).
26. **Mutation** `flushMutationEffects` → `commitMutationEffectsOnFiber`
    walks down only where `subtreeFlags` is set (`HostRoot → App → main →
    Counter → button`, and `Header` is skipped):
    - `button` has `Update` → `commitUpdate(dom, type, oldProps, newProps)`
      → text content `"0"` → `"1"`, and the stored `onClick` prop is
      replaced.
    - `Counter` has `Update` → run the **layout effect cleanup** from the
      previous commit (there was none, since the effect returned nothing).
    - Then `root.current = finishedWork`. **The new tree is now current.**
27. **Layout** `flushLayoutEffects` → `commitLayoutEffectOnFiber`, child
    before parent: the button has no ref change. For `Counter`, run
    `useLayoutEffect` setup → `button.style.width = '50px'`. This is still
    before paint.
28. The browser hasn't painted yet, because we're still inside the
    microtask.
29. `flushSpawnedWork`: `pendingEffectsLanes & 3` → SyncLane → run
    `flushPendingEffects()` now → `flushPassiveEffects`:
    - unmount pass: no previous `useEffect` cleanup
    - mount pass: `document.title = 'Clicks: 1'`
30. Microtask ends → the browser runs style, layout and **paint**. The user
    sees `1` in a 50px-wide button, and the tab title reads "Clicks: 1".

### Summary of who ran

| Function | Ran? | Why |
|---|---|---|
| `App()` | no | bailout: same props, no update, only `childLanes` |
| `Header()` | no | bailout with `childLanes === 0`: subtree skipped |
| `Counter()` | yes | its own hook had a `SyncLane` update |
| DOM writes | 2 | button text + `style.width` (from the layout effect) |

## Contrast: the same click inside `startTransition`

```tsx
onClick={() => startTransition(() => setCount(count + 1))}
```

1. Steps 1–4 are the same, but inside the callback `ReactSharedInternals.T`
   is a transition object.
2. Step 5: `requestUpdateLane` sees `T !== null` → `requestTransitionLane()`
   → **`TransitionLane1`**.
3. Step 10: the microtask finds no sync lanes, so
   `scheduleTaskForRootDuringMicrotask` sets an expiration time for the lane
   (+5000ms) and calls `scheduleCallback(NormalPriority,
   performWorkOnRootViaSchedulerTask)`. **The microtask ends without
   rendering.** The browser can paint and handle input.
4. In a later macrotask (posted through `MessageChannel`), the Scheduler runs the
   task → `performWorkOnRoot(root, TransitionLane1, false)` → `(lanes & 127)
   === 0` → **`renderRootConcurrent`** → `workLoopConcurrentByScheduler`,
   which checks `shouldYield()` after every fiber.
5. Here the tree is tiny and finishes in one 5ms slice. For a large tree, the
   loop would exit mid-tree, return a continuation, and resume later. If a
   `SyncLane` update arrived in between, `prepareFreshStack` would discard
   this WIP and restart ([Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/)).
6. The commit is the same as steps 23–27, except step 29. The lanes aren't
   sync, so passive effects are **scheduled** as a separate Normal-priority
   task and run after the browser paints.

## Contrast: `setCount(count)` with the same value

1. Steps 1–5 are the same.
2. Step 6: the eager path computes `basicStateReducer(0, 0)` → `0` →
   `Object.is(0, 0)` → **true** → the update is enqueued with no lane and
   `dispatchSetStateInternal` returns **without calling
   `scheduleUpdateOnFiber`**. No microtask, no render, no commit.

### Sources
- React 19.2.5 source: `dispatchDiscreteEvent`, `dispatchEventForPluginEventSystem`, `dispatchSetState`, `dispatchSetStateInternal`, `requestUpdateLane`, `enqueueConcurrentHookUpdate`, `scheduleUpdateOnFiber`, `ensureRootIsScheduled`, `processRootScheduleInMicrotask`, `performWorkOnRoot`, `renderRootSync`, `renderRootConcurrent`, `prepareFreshStack`, `finishQueueingConcurrentUpdates`, `workLoopSync`, `beginWork`, `bailoutOnAlreadyFinishedWork`, `renderWithHooks`, `completeWork`, `commitRoot`, `flushMutationEffects`, `flushLayoutEffects`, `flushSpawnedWork`, `flushPassiveEffects`
- [React source: `packages/react-reconciler/src`](https://github.com/facebook/react/tree/main/packages/react-reconciler/src)
