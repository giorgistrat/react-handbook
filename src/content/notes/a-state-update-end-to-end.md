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

<figure class="fig anim fig-e2e-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchDiscreteEvent(\&quot;click\&quot;) → onClick&quot;,&quot;say&quot;:&quot;One listener on the root container catches the click, finds the button’s fiber and calls your &lt;code&gt;onClick&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;button&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;dispatchSetState → requestUpdateLane() = SyncLane&quot;,&quot;say&quot;:&quot;A discrete event, so &lt;code&gt;SyncLane&lt;/code&gt;. The eager check: 1 ≠ 0, so a render is needed.&quot;,&quot;set&quot;:{&quot;button&quot;:&quot;&quot;,&quot;lane&quot;:&quot;upd&quot;,&quot;queue&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;lane&quot;:&quot;lane: SyncLane&quot;,&quot;queue&quot;:&quot;Counter queue: [1]&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;markUpdateLaneFromFiberToRoot&quot;,&quot;say&quot;:&quot;&lt;code&gt;Counter.lanes |= Sync&lt;/code&gt;, and every ancestor gets &lt;code&gt;childLanes |= Sync&lt;/code&gt;: a trail back from the root.&quot;,&quot;set&quot;:{&quot;lane&quot;:&quot;&quot;,&quot;queue&quot;:&quot;&quot;,&quot;counter-flag&quot;:&quot;&quot;,&quot;main-flag&quot;:&quot;&quot;,&quot;app-flag&quot;:&quot;&quot;,&quot;root-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;counter-flag&quot;:&quot;lanes&quot;,&quot;main-flag&quot;:&quot;childLanes&quot;,&quot;app-flag&quot;:&quot;childLanes&quot;,&quot;root-flag&quot;:&quot;childLanes&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;ensureRootIsScheduled → queueMicrotask&quot;,&quot;say&quot;:&quot;The handler returns. Nothing has rendered yet.&quot;,&quot;set&quot;:{&quot;micro&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;micro&quot;:&quot;microtask: scheduled&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;performSyncWorkOnRoot → workLoopSync · beginWork(HostRoot, App, main)&quot;,&quot;say&quot;:&quot;The microtask renders. HostRoot, App and main only have &lt;code&gt;childLanes&lt;/code&gt; → &lt;b&gt;bail out&lt;/b&gt; and continue down. &lt;code&gt;App()&lt;/code&gt; is not called.&quot;,&quot;set&quot;:{&quot;micro&quot;:&quot;done&quot;,&quot;root&quot;:&quot;bail&quot;,&quot;app&quot;:&quot;bail&quot;,&quot;main&quot;:&quot;bail&quot;,&quot;root-flag&quot;:&quot;ghost&quot;,&quot;app-flag&quot;:&quot;ghost&quot;,&quot;main-flag&quot;:&quot;ghost&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(Header) → null&quot;,&quot;say&quot;:&quot;&lt;code&gt;Header&lt;/code&gt; has no work at all (&lt;code&gt;childLanes === 0&lt;/code&gt;): the whole subtree is &lt;b&gt;skipped&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;header&quot;:&quot;skip&quot;,&quot;h1&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Counter() → updateReducer → count = 1&quot;,&quot;say&quot;:&quot;Counter has its own lane → it &lt;b&gt;renders&lt;/b&gt;. Both effects’ deps changed (&lt;code&gt;[0]&lt;/code&gt; → &lt;code&gt;[1]&lt;/code&gt;), so they are flagged.&quot;,&quot;set&quot;:{&quot;counter&quot;:&quot;run hl&quot;,&quot;counter-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;counter-sub&quot;:&quot;count: 1&quot;,&quot;counter-flag&quot;:&quot;Update · Passive&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useFiber(button) · completeWork(button) → markUpdate&quot;,&quot;say&quot;:&quot;The button fiber is reused with new props and flagged &lt;b&gt;Update&lt;/b&gt;. Then &lt;code&gt;completeWork&lt;/code&gt; climbs back up, bubbling flags.&quot;,&quot;set&quot;:{&quot;counter&quot;:&quot;run&quot;,&quot;button&quot;:&quot;upd&quot;,&quot;button-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;button-sub&quot;:&quot;\&quot;1\&quot;&quot;,&quot;button-flag&quot;:&quot;Update&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitMutationEffects → commitUpdate(button)&quot;,&quot;say&quot;:&quot;Commit, mutation: only the flagged path is visited. The text changes from 0 to 1. Then &lt;code&gt;root.current = finishedWork&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;button&quot;:&quot;done&quot;,&quot;txt&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;txt&quot;:&quot;1&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitLayoutEffects → useLayoutEffect&quot;,&quot;say&quot;:&quot;Layout effect: &lt;code&gt;buttonRef.current.style.width = '50px'&lt;/code&gt;. Still before paint.&quot;,&quot;set&quot;:{&quot;txt&quot;:&quot;&quot;,&quot;w&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;w&quot;:&quot;50px&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;flushPendingEffects() (SyncLane) → useEffect&quot;,&quot;say&quot;:&quot;For a discrete update, passive effects are flushed &lt;b&gt;synchronously&lt;/b&gt; at the end of the commit: &lt;code&gt;document.title&lt;/code&gt; updates.&quot;,&quot;set&quot;:{&quot;w&quot;:&quot;&quot;,&quot;title&quot;:&quot;upd&quot;,&quot;counter&quot;:&quot;done&quot;},&quot;txt&quot;:{&quot;title&quot;:&quot;Clicks: 1&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;microtask ends → style · layout · paint&quot;,&quot;say&quot;:&quot;Finally the browser paints: the user sees &lt;b&gt;1&lt;/b&gt; in a 50px button. Only &lt;code&gt;Counter()&lt;/code&gt; ran, and there were 2 DOM writes.&quot;,&quot;set&quot;:{&quot;title&quot;:&quot;&quot;,&quot;txt&quot;:&quot;ok&quot;,&quot;w&quot;:&quot;ok&quot;}}]" data-intro="The app from above. The user clicks the button once."><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">fiber tree</div><div class="t-tree"><div class="t-branch"><div class="an node root" data-k="root"><span class="node-label" data-k="root-label">HostRoot</span><span class="an flag" data-k="root-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="app"><span class="node-label" data-k="app-label">App</span><span class="an flag" data-k="app-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="main"><span class="node-label" data-k="main-label">main</span><span class="an flag" data-k="main-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="header"><span class="node-label" data-k="header-label">Header</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="h1"><span class="node-label" data-k="h1-label">h1</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="counter"><span class="node-label" data-k="counter-label">Counter</span><small data-k="counter-sub">count: 0</small><span class="an flag" data-k="counter-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="button"><span class="node-label" data-k="button-label">button</span><small data-k="button-sub">"0"</small><span class="an flag" data-k="button-flag" data-s="ghost">flag</span></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">React</div><div class="a-col"><span class="an chip-a" data-k="lane">lane: –</span><span class="an chip-a" data-k="queue">Counter queue: empty</span><span class="an chip-a" data-k="micro">microtask: none</span></div></div><div class="a-panel "><div class="a-panel-title">screen</div><div class="a-dom">&lt;button style="width: <span class="an" data-k="w">40px</span>"&gt;<span class="an" data-k="txt">0</span>&lt;/button&gt;<br>document.title = "<span class="an" data-k="title">Clicks: 0</span>"</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatchDiscreteEvent("click") → onClick</code><span>One listener on the root container catches the click, finds the button’s fiber and calls your <code>onClick</code>.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>dispatchSetState → requestUpdateLane() = SyncLane</code><span>A discrete event, so <code>SyncLane</code>. The eager check: 1 ≠ 0, so a render is needed.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>markUpdateLaneFromFiberToRoot</code><span><code>Counter.lanes |= Sync</code>, and every ancestor gets <code>childLanes |= Sync</code>: a trail back from the root.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>ensureRootIsScheduled → queueMicrotask</code><span>The handler returns. Nothing has rendered yet.</span></li><li><span class="anim-phase ph-render">render phase</span><code>performSyncWorkOnRoot → workLoopSync · beginWork(HostRoot, App, main)</code><span>The microtask renders. HostRoot, App and main only have <code>childLanes</code> → <b>bail out</b> and continue down. <code>App()</code> is not called.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(Header) → null</code><span><code>Header</code> has no work at all (<code>childLanes === 0</code>): the whole subtree is <b>skipped</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Counter() → updateReducer → count = 1</code><span>Counter has its own lane → it <b>renders</b>. Both effects’ deps changed (<code>[0]</code> → <code>[1]</code>), so they are flagged.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useFiber(button) · completeWork(button) → markUpdate</code><span>The button fiber is reused with new props and flagged <b>Update</b>. Then <code>completeWork</code> climbs back up, bubbling flags.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitMutationEffects → commitUpdate(button)</code><span>Commit, mutation: only the flagged path is visited. The text changes from 0 to 1. Then <code>root.current = finishedWork</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitLayoutEffects → useLayoutEffect</code><span>Layout effect: <code>buttonRef.current.style.width = '50px'</code>. Still before paint.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>flushPendingEffects() (SyncLane) → useEffect</code><span>For a discrete update, passive effects are flushed <b>synchronously</b> at the end of the commit: <code>document.title</code> updates.</span></li><li><span class="anim-phase ph-paint">browser</span><code>microtask ends → style · layout · paint</code><span>Finally the browser paints: the user sees <b>1</b> in a 50px button. Only <code>Counter()</code> ran, and there were 2 DOM writes.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="bail"></i>bailed out</span><span><i class="an lg-sw" data-s="skip"></i>skipped</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="ok"></i>ok</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>One click, end to end: event → schedule → render → commit → paint.</figcaption></figure>
<figure class="fig fig-seq"><div class="seq" style="--actors:6"><div class="seq-actor seq-a0" style="grid-column:2">Browser</div><div class="seq-actor seq-a1" style="grid-column:3">React root listener</div><div class="seq-actor seq-a2" style="grid-column:4">Counter handler</div><div class="seq-actor seq-a3" style="grid-column:5">Microtask</div><div class="seq-actor seq-a4" style="grid-column:6">Work loop</div><div class="seq-actor seq-a5" style="grid-column:7">Commit</div><div class="seq-life" style="grid-column:2;grid-row:2 / 26"></div><div class="seq-life" style="grid-column:3;grid-row:2 / 26"></div><div class="seq-life" style="grid-column:4;grid-row:2 / 26"></div><div class="seq-life" style="grid-column:5;grid-row:2 / 26"></div><div class="seq-life" style="grid-column:6;grid-row:2 / 26"></div><div class="seq-life" style="grid-column:7;grid-row:2 / 26"></div><div class="seq-num" style="grid-row:2 / span 2">1</div><div class="seq-msg seq-right" style="grid-column:2 / 4;grid-row:3;--span:2"></div><div class="seq-label" style="grid-column:2 / 4;grid-row:2">native <code>click</code></div><div class="seq-num" style="grid-row:4 / span 2">2</div><div class="seq-msg seq-right" style="grid-column:3 / 5;grid-row:5;--span:2"></div><div class="seq-label" style="grid-column:3 / 5;grid-row:4"><code>dispatchDiscreteEvent</code> → <code>onClick</code></div><div class="seq-num" style="grid-row:6 / span 2">3</div><div class="seq-msg seq-right" style="grid-column:4 / 6;grid-row:7;--span:2"></div><div class="seq-label" style="grid-column:4 / 6;grid-row:6"><code>setCount(1)</code> · SyncLane · <code>queueMicrotask</code></div><div class="seq-num" style="grid-row:8 / span 2">4</div><div class="seq-msg seq-left seq-reply" style="grid-column:2 / 5;grid-row:9;--span:3"></div><div class="seq-label" style="grid-column:2 / 5;grid-row:8">handler returns, nothing rendered yet</div><div class="seq-num" style="grid-row:10 / span 2">5</div><div class="seq-msg seq-right" style="grid-column:5 / 7;grid-row:11;--span:2"></div><div class="seq-label" style="grid-column:5 / 7;grid-row:10"><code>performSyncWorkOnRoot</code> → <code>renderRootSync</code></div><div class="seq-num" style="grid-row:12 / span 2">6</div><div class="seq-msg seq-self" style="grid-column:6 / 7;grid-row:13;--span:1"></div><div class="seq-label seq-label-r" style="grid-column:4 / 7;grid-row:12">HostRoot, App, main bail out · Header skipped</div><div class="seq-num" style="grid-row:14 / span 2">7</div><div class="seq-msg seq-self" style="grid-column:6 / 7;grid-row:15;--span:1"></div><div class="seq-label seq-label-r" style="grid-column:4 / 7;grid-row:14"><code>Counter()</code> runs → count = 1</div><div class="seq-num" style="grid-row:16 / span 2">8</div><div class="seq-msg seq-right" style="grid-column:6 / 8;grid-row:17;--span:2"></div><div class="seq-label" style="grid-column:6 / 8;grid-row:16"><code>commitRoot</code></div><div class="seq-num" style="grid-row:18 / span 2">9</div><div class="seq-msg seq-self" style="grid-column:7 / 8;grid-row:19;--span:1"></div><div class="seq-label seq-label-r" style="grid-column:5 / 8;grid-row:18">mutation: "0" → "1", then <code>root.current = finishedWork</code></div><div class="seq-num" style="grid-row:20 / span 2">10</div><div class="seq-msg seq-self" style="grid-column:7 / 8;grid-row:21;--span:1"></div><div class="seq-label seq-label-r" style="grid-column:5 / 8;grid-row:20">layout: <code>useLayoutEffect</code> sets width 50px</div><div class="seq-num" style="grid-row:22 / span 2">11</div><div class="seq-msg seq-self" style="grid-column:7 / 8;grid-row:23;--span:1"></div><div class="seq-label seq-label-r" style="grid-column:5 / 8;grid-row:22">passive (SyncLane): <code>document.title = "Clicks: 1"</code></div><div class="seq-num" style="grid-row:24 / span 2">12</div><div class="seq-msg seq-left seq-reply" style="grid-column:2 / 8;grid-row:25;--span:6"></div><div class="seq-label" style="grid-column:2 / 8;grid-row:24">microtask ends → paint</div></div><figcaption>One click, end to end. Steps 1–4 are the event, 5–7 render, 8–11 commit, 12 paint.</figcaption></figure>

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
