---
title: "Scheduler, Lanes and Batching"
slug: "scheduler-lanes-and-batching"
module: "internals"
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
> (`scheduler.development.js`). Part of [React Internals](../../internals/). This is the
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

<figure class="fig anim fig-batching-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchSetState → requestUpdateLane() = SyncLane&quot;,&quot;say&quot;:&quot;Inside a click, the update gets &lt;code&gt;SyncLane&lt;/code&gt;. It is stashed in a queue…&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;hl&quot;,&quot;u0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;ensureRootIsScheduled(root) → queueMicrotask(…)&quot;,&quot;say&quot;:&quot;…and React schedules &lt;b&gt;one&lt;/b&gt; microtask to process the root later.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;&quot;,&quot;micro&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;micro&quot;:&quot;microtask: scheduled&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchSetState(setFlag)&quot;,&quot;say&quot;:&quot;Second update: queued. The microtask is &lt;b&gt;already scheduled&lt;/b&gt;, so nothing new is scheduled.&quot;,&quot;set&quot;:{&quot;micro&quot;:&quot;keep&quot;,&quot;l1&quot;:&quot;hl&quot;,&quot;u1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchSetState(setText)&quot;,&quot;say&quot;:&quot;Third update: queued.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;&quot;,&quot;l2&quot;:&quot;hl&quot;,&quot;u2&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;handler returns&quot;,&quot;say&quot;:&quot;The handler is done. &lt;b&gt;Nothing has rendered yet&lt;/b&gt;: the screen still shows the old UI.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;&quot;,&quot;ret&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;processRootScheduleInMicrotask → performSyncWorkOnRoot&quot;,&quot;say&quot;:&quot;The microtask runs and renders the root &lt;b&gt;once&lt;/b&gt;, applying all three updates together.&quot;,&quot;set&quot;:{&quot;ret&quot;:&quot;faint&quot;,&quot;micro&quot;:&quot;done&quot;,&quot;u0&quot;:&quot;done&quot;,&quot;u1&quot;:&quot;done&quot;,&quot;u2&quot;:&quot;done&quot;,&quot;renders&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;micro&quot;:&quot;microtask: ran&quot;,&quot;renders&quot;:&quot;renders: 1&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitRoot&quot;,&quot;say&quot;:&quot;One commit, one paint. That’s automatic batching (React 18+), and it works the same in &lt;code&gt;setTimeout&lt;/code&gt; or &lt;code&gt;.then&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;renders&quot;:&quot;&quot;,&quot;screen&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;screen&quot;:&quot;screen: count, flag, text updated&quot;}}]" data-intro="A click handler calls three different setters."><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">handleClick()</div><div class="a-col"><div class="an call" data-k="l0"><code>setCount(c => c + 1)</code></div><div class="an call" data-k="l1"><code>setFlag(true)</code></div><div class="an call" data-k="l2"><code>setText('hi')</code></div><div class="an call" data-k="ret" data-s="faint"><code>}  // handler returns</code></div></div></div><div class="a-panel "><div class="a-panel-title">queued updates</div><div class="a-col"><div class="an node comp" data-k="u0" data-s="ghost"><span class="node-label" data-k="u0-label">count</span><small data-k="u0-sub">SyncLane</small></div><div class="an node comp" data-k="u1" data-s="ghost"><span class="node-label" data-k="u1-label">flag</span><small data-k="u1-sub">SyncLane</small></div><div class="an node comp" data-k="u2" data-s="ghost"><span class="node-label" data-k="u2-label">text</span><small data-k="u2-sub">SyncLane</small></div></div></div><div class="a-panel "><div class="a-panel-title">React</div><div class="a-col"><span class="an chip-a" data-k="micro">microtask: none</span><span class="an chip-a" data-k="renders">renders: 0</span><span class="an chip-a" data-k="screen">screen: old</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatchSetState → requestUpdateLane() = SyncLane</code><span>Inside a click, the update gets <code>SyncLane</code>. It is stashed in a queue…</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>ensureRootIsScheduled(root) → queueMicrotask(…)</code><span>…and React schedules <b>one</b> microtask to process the root later.</span></li><li><span class="anim-phase ph-event">event</span><code>dispatchSetState(setFlag)</code><span>Second update: queued. The microtask is <b>already scheduled</b>, so nothing new is scheduled.</span></li><li><span class="anim-phase ph-event">event</span><code>dispatchSetState(setText)</code><span>Third update: queued.</span></li><li><span class="anim-phase ph-event">event</span><code>handler returns</code><span>The handler is done. <b>Nothing has rendered yet</b>: the screen still shows the old UI.</span></li><li><span class="anim-phase ph-render">render phase</span><code>processRootScheduleInMicrotask → performSyncWorkOnRoot</code><span>The microtask runs and renders the root <b>once</b>, applying all three updates together.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitRoot</code><span>One commit, one paint. That’s automatic batching (React 18+), and it works the same in <code>setTimeout</code> or <code>.then</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="ok"></i>ok</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Batching: updates queue up during the handler; one microtask renders them all.</figcaption></figure>

1. `dispatchSetState` creates an update `{ lane, action, next }` and stashes
   it in a module-level `concurrentQueues` array, together with its fiber and
   hook queue ([Hooks Under the Hood](../../internals/hooks-under-the-hood/)). `getRootForUpdatedFiber` walks
   `return` pointers up to find the root.
2. Later, when the next render starts (`prepareFreshStack` →
   `finishQueueingConcurrentUpdates`), each stashed update is linked into its
   hook's circular queue, and `markUpdateLaneFromFiberToRoot` ORs the lane
   into `fiber.lanes` and into `childLanes` of every ancestor. [The Work Loop](../../internals/the-work-loop/)
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

<figure class="fig anim fig-interruption-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;startTransition(() =&gt; setQuery('a'))&quot;,&quot;say&quot;:&quot;The results update is a &lt;b&gt;transition&lt;/b&gt;. It is rendered by the concurrent loop in a Scheduler task.&quot;,&quot;set&quot;:{&quot;lanes&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;workLoopConcurrentByScheduler → shouldYield() after ~5ms&quot;,&quot;say&quot;:&quot;React works on the tree for about 5ms, then &lt;b&gt;yields&lt;/b&gt; so the browser can paint and handle input.&quot;,&quot;set&quot;:{&quot;lanes&quot;:&quot;&quot;,&quot;t0&quot;:&quot;&quot;,&quot;wip&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;wip&quot;:&quot;WIP tree: half built&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;continuation → next slice, resumes at workInProgress&quot;,&quot;say&quot;:&quot;Each slice resumes exactly where the last one stopped (one pointer: &lt;code&gt;workInProgress&lt;/code&gt;).&quot;,&quot;set&quot;:{&quot;t1&quot;:&quot;&quot;,&quot;t2&quot;:&quot;&quot;,&quot;wip&quot;:&quot;&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;keydown 'b' → setText('ab') · SyncLane&quot;,&quot;say&quot;:&quot;The user types between two slices. That update is urgent: &lt;code&gt;SyncLane&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;key&quot;:&quot;bad&quot;,&quot;lanes&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;lanes&quot;:&quot;pendingLanes: Sync | Transition&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;prepareFreshStack(root, SyncLane)&quot;,&quot;say&quot;:&quot;React switches lanes and &lt;b&gt;throws the half-built tree away&lt;/b&gt;. Nothing was committed, so there is nothing to undo.&quot;,&quot;set&quot;:{&quot;key&quot;:&quot;bad&quot;,&quot;t0&quot;:&quot;del&quot;,&quot;t1&quot;:&quot;del&quot;,&quot;t2&quot;:&quot;del&quot;,&quot;lanes&quot;:&quot;&quot;,&quot;wip&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;wip&quot;:&quot;WIP tree: discarded&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;renderRootSync → commitRoot&quot;,&quot;say&quot;:&quot;The sync update renders and commits &lt;b&gt;without yielding&lt;/b&gt;. The input shows “ab” immediately.&quot;,&quot;set&quot;:{&quot;sync&quot;:&quot;run&quot;,&quot;input&quot;:&quot;ok&quot;,&quot;wip&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;input&quot;:&quot;input: \&quot;ab\&quot;&quot;,&quot;lanes&quot;:&quot;pendingLanes: Transition&quot;,&quot;wip&quot;:&quot;WIP tree: none&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;restart transition from the root (query = 'ab')&quot;,&quot;say&quot;:&quot;The transition is still pending. It &lt;b&gt;starts over&lt;/b&gt; from the root, now with the newer state, yielding every ~5ms again.&quot;,&quot;set&quot;:{&quot;sync&quot;:&quot;done&quot;,&quot;input&quot;:&quot;&quot;,&quot;r0&quot;:&quot;&quot;,&quot;r1&quot;:&quot;&quot;,&quot;r2&quot;:&quot;&quot;,&quot;r3&quot;:&quot;&quot;,&quot;r4&quot;:&quot;&quot;,&quot;wip&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;wip&quot;:&quot;WIP tree: rebuilding&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitRoot&quot;,&quot;say&quot;:&quot;The transition finally commits. This is why transition renders must be pure: they can run many times before one commits.&quot;,&quot;set&quot;:{&quot;commit&quot;:&quot;ok&quot;,&quot;results&quot;:&quot;ok&quot;,&quot;wip&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;results&quot;:&quot;results for: \&quot;ab\&quot;&quot;,&quot;lanes&quot;:&quot;pendingLanes: none&quot;,&quot;wip&quot;:&quot;WIP tree: none&quot;}}]" data-intro="The user typed “a”. The input already shows it; the slow results list renders in a transition."><div class="anim-stage"><div class="a-label">main thread →</div><div class="a-track slices"><div class="an slice sl-t" data-k="t0" data-s="ghost" style="--x:0">5ms</div><div class="an slice sl-t" data-k="t1" data-s="ghost" style="--x:1">5ms</div><div class="an slice sl-t" data-k="t2" data-s="ghost" style="--x:2">5ms</div><div class="an slice sl-k" data-k="key" data-s="ghost" style="--x:3">⌨</div><div class="an slice sl-s wide2" data-k="sync" data-s="ghost" style="--x:4">sync</div><div class="an slice sl-t" data-k="r0" data-s="ghost" style="--x:6">5ms</div><div class="an slice sl-t" data-k="r1" data-s="ghost" style="--x:7">5ms</div><div class="an slice sl-t" data-k="r2" data-s="ghost" style="--x:8">5ms</div><div class="an slice sl-t" data-k="r3" data-s="ghost" style="--x:9">5ms</div><div class="an slice sl-t" data-k="r4" data-s="ghost" style="--x:10">5ms</div><div class="an slice sl-c" data-k="commit" data-s="ghost" style="--x:11">✓</div></div><div class="a-cols" style="margin-top:10px"><div class="a-panel "><div class="a-panel-title">root lanes</div><div class="a-col"><span class="an chip-a" data-k="lanes">pendingLanes: Transition</span><span class="an chip-a" data-k="wip">WIP tree: none</span></div></div><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-col"><span class="an chip-a" data-k="input">input: "a"</span><span class="an chip-a" data-k="results">results for: ""</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-schedule">schedule</span><code>startTransition(() =&gt; setQuery('a'))</code><span>The results update is a <b>transition</b>. It is rendered by the concurrent loop in a Scheduler task.</span></li><li><span class="anim-phase ph-render">render phase</span><code>workLoopConcurrentByScheduler → shouldYield() after ~5ms</code><span>React works on the tree for about 5ms, then <b>yields</b> so the browser can paint and handle input.</span></li><li><span class="anim-phase ph-render">render phase</span><code>continuation → next slice, resumes at workInProgress</code><span>Each slice resumes exactly where the last one stopped (one pointer: <code>workInProgress</code>).</span></li><li><span class="anim-phase ph-event">event</span><code>keydown 'b' → setText('ab') · SyncLane</code><span>The user types between two slices. That update is urgent: <code>SyncLane</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>prepareFreshStack(root, SyncLane)</code><span>React switches lanes and <b>throws the half-built tree away</b>. Nothing was committed, so there is nothing to undo.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>renderRootSync → commitRoot</code><span>The sync update renders and commits <b>without yielding</b>. The input shows “ab” immediately.</span></li><li><span class="anim-phase ph-render">render phase</span><code>restart transition from the root (query = 'ab')</code><span>The transition is still pending. It <b>starts over</b> from the root, now with the newer state, yielding every ~5ms again.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitRoot</code><span>The transition finally commits. This is why transition renders must be pure: they can run many times before one commits.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="del"></i>deleted</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Interruption: an urgent update mid-transition discards the work-in-progress, and the transition restarts.</figcaption></figure>

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
