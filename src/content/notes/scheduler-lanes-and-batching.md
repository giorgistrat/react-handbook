---
title: "Scheduler, Lanes and Batching"
slug: "scheduler-lanes-and-batching"
order: 7
level: "good"
illus: "bolt"
summary: "Lanes as a priority bitmask, automatic batching, time slicing, interruption and starvation."
source: "https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberLane.js"
---


> How React decides **when** to render and **how urgently**. It covers update
> priorities (lanes), batching, time slicing, interruption and starvation.
> Read from the React 19.2.5 build (`requestUpdateLane`, `getEventPriority`,
> `getHighestPriorityLanes`, `ensureRootIsScheduled`, `performWorkOnRoot`,
> `scheduleTaskForRootDuringMicrotask`) and the `scheduler` package
> (`scheduler.development.js`). Part of [React Internals](../../). This is the
> machinery behind *Concurrent Rendering* and
> *useTransition and Avoiding Loading Flicker*. My own notes and
> clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>What are lanes?</summary>

React's representation of update **priority**. Each lane is one bit in a
31-bit integer. Every update gets a lane, and every fiber keeps a bitmask of
the lanes it has pending (`lanes`, `childLanes`). Bitmasks let React group
updates ("render everything in these lanes together"), test membership with
one `&`, and pick the most urgent pending work with `lanes & -lanes`.

</details>

<details class="qa"><summary>What is automatic batching?</summary>

Multiple state updates in the same event or tick produce **one** render.
`setState` doesn't render. It queues an update and asks for the root to be
scheduled, which happens in a microtask. Since React 18 this applies
everywhere (promises, timeouts, native listeners), not just inside React
event handlers. In our example, `setA(1); setB(2); setC(3)` in a click
handler renders once.

</details>

<details class="qa"><summary>Does React always render concurrently in React 18+?</summary>

No. Only **non-blocking** lanes (transitions, `useDeferredValue`,
Suspense retries, idle, offscreen) render with the interruptible loop.
Clicks, typing, hover and ordinary default updates render **synchronously**
(`workLoopSync`). Concurrent features are opt-in per update.

</details>

<details class="qa"><summary>What happens if a transition keeps getting interrupted forever?</summary>

It's protected against **starvation**. Each pending lane gets an
expiration time (250ms for sync/continuous lanes, 5s for transitions). Once
it expires, React marks it expired and renders it synchronously, without
yielding.

</details>

<details class="qa"><summary>Why does the Scheduler use <code>MessageChannel</code> instead of <code>setTimeout(0)</code>?</summary>

Browsers clamp nested `setTimeout` to ≥4ms, which wastes time every
slice. A `MessageChannel` message posts a macrotask right away, and still
lets the browser paint and handle input between tasks.

</details>

## The problem: not all updates are equally urgent

A keystroke must show up within a frame. A search-results list for that
keystroke can lag a bit. A prefetched offscreen tab can wait indefinitely. A
single "render queue" can't express that. React needs to:

1. **label** each update with a priority,
2. **group** updates of the same priority into one render (batching),
3. **pick** the most urgent group next,
4. **yield** during low-priority renders so urgent ones can cut in,
5. and **not starve** low-priority work forever.

Lanes handle 1–3 and 5. The Scheduler package handles 4.

## Lanes: priority as bits

Selected lanes from the 19.2.5 build (lower bit = higher priority):

<figure class="fig fig-lanes"><div class="lanes"><div class="lanes-axis"><span>← higher priority</span><span>lower priority →</span></div><div class="lanes-grid"><span class="lane " title="bit 0">0</span><span class="lane lane-sync" title="SyncLane · bit 1 · 2">1</span><span class="lane " title="bit 2">2</span><span class="lane lane-cont" title="InputContinuousLane · bit 3 · 8">3</span><span class="lane " title="bit 4">4</span><span class="lane lane-def" title="DefaultLane · bit 5 · 32">5</span><span class="lane " title="bit 6">6</span><span class="lane " title="bit 7">7</span><span class="lane lane-trans" title="TransitionLane · bit 8">8</span><span class="lane lane-trans" title="TransitionLane · bit 9">9</span><span class="lane lane-trans" title="TransitionLane · bit 10">10</span><span class="lane lane-trans" title="TransitionLane · bit 11">11</span><span class="lane lane-trans" title="TransitionLane · bit 12">12</span><span class="lane lane-trans" title="TransitionLane · bit 13">13</span><span class="lane lane-trans" title="TransitionLane · bit 14">14</span><span class="lane lane-trans" title="TransitionLane · bit 15">15</span><span class="lane lane-trans" title="TransitionLane · bit 16">16</span><span class="lane lane-trans" title="TransitionLane · bit 17">17</span><span class="lane lane-trans" title="TransitionLane · bit 18">18</span><span class="lane lane-trans" title="TransitionLane · bit 19">19</span><span class="lane lane-trans" title="TransitionLane · bit 20">20</span><span class="lane lane-trans" title="TransitionLane · bit 21">21</span><span class="lane lane-retry" title="RetryLane · bit 22">22</span><span class="lane lane-retry" title="RetryLane · bit 23">23</span><span class="lane lane-retry" title="RetryLane · bit 24">24</span><span class="lane lane-retry" title="RetryLane · bit 25">25</span><span class="lane " title="bit 26">26</span><span class="lane " title="bit 27">27</span><span class="lane lane-idle" title="IdleLane · bit 28 · 268435456">28</span><span class="lane lane-off" title="OffscreenLane · bit 29 · 536870912">29</span><span class="lane " title="bit 30">30</span></div><div class="legend"><span><i class="sw lane-sync"></i>Sync (click, keydown)</span><span><i class="sw lane-cont"></i>InputContinuous (scroll, mousemove)</span><span><i class="sw lane-def"></i>Default (setTimeout, fetch)</span><span><i class="sw lane-trans"></i>Transitions</span><span><i class="sw lane-retry"></i>Retry</span><span><i class="sw lane-idle"></i>Idle</span><span><i class="sw lane-off"></i>Offscreen</span></div></div><figcaption>Lanes are bits in one 31-bit number. Lower bit = higher priority, and <code>lanes &amp; -lanes</code> picks the most urgent.</figcaption></figure>

| Lane | Value | Used for |
|---|---|---|
| `SyncLane` | `0b10` (2) | discrete events: `click`, `keydown`, `input`, `focus`…, and `flushSync` |
| `InputContinuousLane` | `0b1000` (8) | continuous events: `mousemove`, `pointermove`, `scroll`, `wheel`, `drag*` |
| `DefaultLane` | `0b100000` (32) | updates outside any event: `setTimeout`, promise callbacks, `fetch().then` |
| `TransitionLane1…` | `256` and up (a range of bits) | `startTransition`, `useTransition`, `useDeferredValue` background renders |
| `RetryLane…` | higher bits | re-rendering a Suspense boundary after its data resolved |
| `IdleLane` | `268435456` | idle-priority work |
| `OffscreenLane` | `536870912` | hidden `<Activity>` / offscreen trees |

Because they're bits:

```js
const pending = SyncLane | TransitionLane1          // two kinds of work pending
(pending & SyncLane) !== 0                          // "is sync work pending?" → true
pending & -pending                                  // lowest set bit → SyncLane (most urgent)
fiber.childLanes |= lane                            // "something below me has this work"
```

`getHighestPriorityLanes` does exactly `lanes & -lanes` (two's complement
isolates the lowest set bit), except that all transition bits are returned
together so they render as one batch.

### How an update picks its lane

From `requestUpdateLane(fiber)`:

```js
function requestUpdateLane(fiber) {
	if (isRendering && workInProgressRootRenderLanes !== 0)
		return pickArbitraryLane(workInProgressRootRenderLanes)  // setState during render
	const transition = ReactSharedInternals.T
	if (transition !== null) return requestTransitionLane()      // inside startTransition
	return resolveUpdatePriority()                                // from the current event
}

function resolveUpdatePriority() {
	const updatePriority = ReactDOMSharedInternals.p   // set by flushSync etc.
	if (updatePriority !== 0) return updatePriority
	const event = window.event
	return event === undefined ? DefaultEventPriority : getEventPriority(event.type)
}
```

`getEventPriority` is a big `switch` over DOM event names: `click`,
`keydown`, `input`, `focusin` and similar → `DiscreteEventPriority` (=
`SyncLane`). `mousemove`, `scroll`, `wheel`, `pointermove` and similar →
`ContinuousEventPriority` (= `InputContinuousLane`). Everything else →
`DefaultEventPriority` (= `DefaultLane`).

> This is why the *same* `setState` call gets different priorities
> depending on where it runs. In an `onClick` it's `SyncLane`. In a
> `setTimeout` it's `DefaultLane`. Inside `startTransition` it's a
> transition lane, whatever the event.

## Batching: queue now, render later

`setState` never renders by itself. The sequence is:

<figure class="fig fig-mermaid"><pre class="mermaid">
sequenceDiagram
  participant H as onClick handler
  participant Q as Update queues
  participant M as Microtask
  participant R as Render + commit
  H-&gt;&gt;Q: setCount(c → c + 1) · SyncLane
  Q--&gt;&gt;M: queueMicrotask (scheduled once)
  H-&gt;&gt;Q: setFlag(true)
  Note right of Q: microtask already scheduled
  H-&gt;&gt;Q: setText('hi')
  H--&gt;&gt;M: handler returns
  M-&gt;&gt;R: processRootScheduleInMicrotask
  R-&gt;&gt;R: ONE render with all 3 updates
</pre><figcaption><code>setState</code> never renders by itself: it queues, and the microtask renders everything from the same tick at once.</figcaption></figure>

1. `dispatchSetState` creates an update `{ lane, action, next }` and stashes
   it in a module-level `concurrentQueues` array, together with its fiber and
   hook queue ([Hooks Under the Hood](../hooks-under-the-hood/)). `getRootForUpdatedFiber` walks
   `return` pointers up to find the root.
2. Later, when the next render starts (`prepareFreshStack` →
   `finishQueueingConcurrentUpdates`), each stashed update is linked into its
   hook's circular queue, and `markUpdateLaneFromFiberToRoot` ORs the lane
   into `fiber.lanes` and into `childLanes` of every ancestor. [The Work Loop](../the-work-loop/)
   uses that trail to find the changed fiber.
3. Right away, `scheduleUpdateOnFiber` → `markRootUpdated` (adds the lane to
   `root.pendingLanes`) → `ensureRootIsScheduled(root)` adds the root to
   a list and, if not already done, schedules a **microtask**
   (`queueMicrotask`).
4. The rest of your handler runs. More `setState` calls repeat 1–3 and find
   the microtask already scheduled.
5. In the microtask, `processRootScheduleInMicrotask` looks at each root's
   pending lanes. **Sync** lanes are rendered right there, at the end of the
   microtask. Other lanes get a Scheduler task at a matching priority
   (continuous → `UserBlockingPriority`, default → `NormalPriority`,
   transitions → `NormalPriority`, idle → `IdlePriority`).

```tsx
function handleClick() {
	setCount((c) => c + 1)   // queue update 1 (SyncLane), schedule microtask
	setFlag(true)            // queue update 2 (SyncLane), microtask already scheduled
	setText('hi')            // queue update 3
}                            // handler returns → microtask → ONE render with all 3
```

> Before React 18, batching only happened inside React's own event
> handlers, because it relied on a "we're in a batch" flag that React set
> around its handlers. Updates in `setTimeout` or `.then` rendered once per
> `setState`. The microtask-based scheduling in 18+ batches everything that
> happens in the same tick. `flushSync` is the opt-out.

## Sync vs concurrent: which loop runs

When the root's task runs, `performWorkOnRoot(root, lanes, forceSync)`
chooses the loop:

```js
const shouldTimeSlice =
	!forceSync &&
	(lanes & 127) === 0 &&               // no Sync / InputContinuous / Default lanes (the "blocking" ones)
	(lanes & root.expiredLanes) === 0 || // and nothing has expired
	checkIfRootIsPrerendering(root, lanes)
shouldTimeSlice ? renderRootConcurrent(root, lanes) : renderRootSync(root, lanes, true)
```

| Update comes from | Lane | Render loop |
|---|---|---|
| click, typing, focus | `SyncLane` | `workLoopSync`, in the microtask |
| hover, scroll | `InputContinuousLane` | `workLoopSync`, in a UserBlocking Scheduler task |
| `setTimeout`, `fetch().then` | `DefaultLane` | `workLoopSync`, in a Normal Scheduler task |
| `startTransition`, `useDeferredValue` | transition lanes | **`workLoopConcurrentByScheduler`**: yields every ~5ms |
| Suspense retry, offscreen, idle | retry / offscreen / idle | concurrent |

## The Scheduler package: time slicing

`scheduler` is a small standalone package that React uses as a cooperative
task queue for the main thread.

**A min-heap of tasks.** `scheduleCallback(priority, callback)` creates a task
with `expirationTime = startTime + timeout`, where the timeout depends on
the priority (from the source):

| Scheduler priority | timeout |
|---|---|
| `ImmediatePriority` | −1 (already expired) |
| `UserBlockingPriority` | 250ms |
| `NormalPriority` | 5000ms |
| `LowPriority` | 10000ms |
| `IdlePriority` | ~12 days (effectively never) |

Tasks are pushed onto a binary **min-heap** (`push`/`siftUp`/`pop`) keyed by
`sortIndex = expirationTime`, so the most urgent task is always at the root
of the heap, found in O(1) and removed in O(log n). Delayed tasks wait in a
separate `timerQueue` heap, keyed by start time.

**Running tasks in slices.** The Scheduler's host loop (`performWorkUntilDeadline`) pops tasks and runs
them until `shouldYieldToHost()` says to stop:

```js
function shouldYieldToHost() {
	// (simplified) keep going only while the current slice is under frameInterval
	return getCurrentTime() - startTime >= frameInterval   // frameInterval = 5 (ms)
}
```

If work remains, the Scheduler posts itself a new macrotask through a
`MessageChannel` (`setImmediate` in Node, and `setTimeout` as a last
resort). Between those macrotasks the browser can paint and dispatch input
events.

**Continuations.** A task callback can return a function, which means "not
done, call me again". React's concurrent render uses that. When
`workLoopConcurrentByScheduler` exits because `shouldYield()` returned true,
React's task returns a continuation, and the next slice resumes at the
remembered `workInProgress` fiber.

## Interruption and restart

Say a transition render for a big list is halfway done and the user types a
character:

<figure class="fig fig-interruption"><svg viewBox="0 0 640 126" class="diagram-svg"><line x1="10" y1="96" x2="630" y2="96" stroke="#2b2522" stroke-width="2"/><g><rect x="20" y="40" width="26" height="34" rx="4" class="sl-discard"/></g><g><rect x="50" y="40" width="26" height="34" rx="4" class="sl-discard"/></g><g><rect x="80" y="40" width="26" height="34" rx="4" class="sl-discard"/></g><g><rect x="110" y="40" width="26" height="34" rx="4" class="sl-discard"/></g><path d="M20 34 H136" stroke="#2b2522" stroke-width="1.5" stroke-dasharray="3 3"/><text x="78" y="28" text-anchor="middle" class="t-small">transition WIP · discarded</text><line x1="152" y1="20" x2="152" y2="96" stroke="#d9539f" stroke-width="3"/><text x="146" y="116" text-anchor="end" class="t-small t-bold">keydown</text><rect x="162" y="40" width="96" height="34" rx="4" class="sl-sync"/><text x="210" y="54" text-anchor="middle" class="t-small t-bold">sync render</text><text x="210" y="68" text-anchor="middle" class="t-small t-bold">+ commit</text><text x="210" y="116" text-anchor="middle" class="t-small">input updates</text><g><rect x="270" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><g><rect x="300" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><g><rect x="330" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><g><rect x="360" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><g><rect x="390" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><g><rect x="420" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><g><rect x="450" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><g><rect x="480" y="40" width="26" height="34" rx="4" class="sl-trans"/></g><text x="390" y="28" text-anchor="middle" class="t-small">transition restarts from the root · 5ms slices</text><rect x="514" y="40" width="70" height="34" rx="4" class="sl-commit"/><text x="549" y="62" text-anchor="middle" class="t-small t-bold">commit</text><text x="630" y="116" text-anchor="end" class="t-small">main thread → time</text></svg><figcaption>An urgent update mid-transition: the half-built tree is thrown away (nothing was committed, so nothing to undo), then the transition starts over.</figcaption></figure>

1. The `keydown` handler calls `setQuery`, which gets `SyncLane`. The root now has
   `SyncLane | TransitionLane1` pending.
2. The current slice ends (`shouldYield`). The microtask runs, sees a sync
   lane, and renders the root for `SyncLane`.
3. Since the new lanes differ from the in-progress ones, React calls
   `prepareFreshStack`, which **throws away** the half-built work-in-progress
   tree. Nothing was committed, so there's nothing to undo.
4. The sync render and commit run. The input updates.
5. The transition lane is still pending. It's rescheduled and **starts over
   from the root**, now with the newer state.

This is why transitions stay responsive and why their renders must be pure:
they can run many times before one of them commits.

## Starvation protection

In `scheduleTaskForRootDuringMicrotask`, React walks every pending lane
bit. A lane that doesn't have an expiration time yet gets one
(`computeExpirationTime`: **current time + 250ms** for sync and continuous
lanes, **+ 5000ms** for default, transition and retry lanes; idle and
offscreen never expire). A lane whose
time has passed is added to `root.expiredLanes`:

```js
expirationTime <= currentTime && (root.expiredLanes |= lane)
```

As shown above, any expired lane forces `renderRootSync`. A transition that
has been interrupted for 5 seconds finishes without yielding.

## Scheduling, step by step

A search box whose results update inside `startTransition`:

```tsx
function Search() {
	const [text, setText] = useState('')
	const [query, setQuery] = useState('')
	const [isPending, startTransition] = useTransition()
	return (
		<>
			<input
				value={text}
				onChange={(e) => {
					setText(e.target.value)                        // urgent
					startTransition(() => setQuery(e.target.value)) // non-urgent
				}}
			/>
			<SlowResults query={query} dim={isPending} />
		</>
	)
}
```

| t | Event | Lanes pending | What runs |
|---|---|---|---|
| 0ms | type "a" | `setText` → Sync. `setQuery` → Transition1. `useTransition` also queues `isPending = true` at Sync | microtask scheduled |
| 0ms | microtask | Sync \| Transition1 | **sync render** of Sync updates only: `text = "a"`, `isPending = true`, `query` still `""`. Commit, and the input shows "a" |
| 0ms+ | Scheduler task (Normal) | Transition1 | **concurrent render**: `query = "a"`, `isPending = false`, `SlowResults` starts rendering… yields every 5ms |
| 30ms | type "b" (dispatched between two 5ms slices) | Sync \| Transition1 | microtask: sync render `text = "ab"`. The half-built Transition1 WIP is **discarded** (`prepareFreshStack`) |
| 30ms+ | Scheduler task | Transition1 (now with `query = "ab"`) | restart concurrent render from the root |
| 90ms | – | – | transition render completes and **commits**: results for "ab", un-dimmed |

The `"a"` results were never committed. The user saw every keystroke
immediately.

## Rules and caveats

- **The default is synchronous.** Clicks and typing render in one blocking
  pass. Use `startTransition`/`useDeferredValue` to make specific renders
  interruptible.
- **Transitions must be pure and restartable.** They can be thrown away and
  re-run any number of times.
- **Batching is per tick.** Updates separated by an `await` are in different
  ticks, and therefore separate renders.
- **`flushSync` breaks batching on purpose.** It renders and commits
  immediately at `SyncLane`. Use it sparingly (*flushSync*).
- **Time slicing doesn't make work cheaper.** A 300ms render in a transition
  still costs 300ms of CPU. It just stops blocking input. Fix slow renders
  first (*Optimize Rendering*).
- **Lane numbers are internal** and change between versions (React 19 added
  a gesture lane, for example). Think in categories (sync, continuous,
  default, transition, idle), not values.

### Sources
- React 19.2.5 source: `requestUpdateLane`, `resolveUpdatePriority`, `getEventPriority`, `getHighestPriorityLanes`, `computeExpirationTime`, `ensureRootIsScheduled`, `processRootScheduleInMicrotask`, `scheduleTaskForRootDuringMicrotask`, `performWorkOnRoot`, `prepareFreshStack`
- `scheduler` package source: `unstable_scheduleCallback`, `push`/`pop` (min-heap), `shouldYieldToHost`, `frameInterval = 5`, `MessageChannel` host loop
- [React source: `ReactFiberLane.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberLane.js)
- [React 18 release post: automatic batching, concurrent React](https://react.dev/blog/2022/03/29/react-v18)
- [react.dev: `useTransition`](https://react.dev/reference/react/useTransition)
