---
title: "Hooks Under the Hood"
slug: "hooks-under-the-hood"
order: 4
level: "must"
illus: "chain"
summary: "The hook linked list, why the Rules of Hooks exist, the setState update queue and the eager bailout."
source: "https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js"
---


> How hooks are stored and how `setState` turns into a render. Read from
> `renderWithHooks`, `mountWorkInProgressHook`, `updateWorkInProgressHook`,
> `mountState`, `dispatchSetStateInternal`, `updateReducerImpl`, `mountMemo`,
> `mountRef` and `pushSimpleEffect` in the React 19.2.5 build, plus react.dev's
> [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) and
> [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates).
> Part of [React Internals](../../). It builds on [React Fiber](../react-fiber/) (hooks live on
> the fiber). My own notes and clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>Where does React store a function component's state?</summary>

On its fiber. `fiber.memoizedState` points to the **first hook object**,
and each hook points to the `next` one, forming a linked list in call order.
A component function has no memory of its own. Each render, React walks that
list alongside your hook calls.

</details>

<details class="qa"><summary>Why must hooks be called in the same order every render?</summary>

Because the list is matched **by position**, not by name. The 3rd hook
call gets the 3rd hook object. If a condition skips a call, every hook after
it reads the wrong object: state from one `useState` shows up in another, or
React throws "Rendered more hooks than during the previous render."

</details>

<details class="qa"><summary>Why is the <code>setState</code> function stable across renders?</summary>

It's created once on mount: `dispatchSetState.bind(null, fiber, queue)`.
It's bound to the fiber and the hook's queue, which never change, so it can be
left out of dependency arrays. In our example, passing `setCount` to a
memoized child never breaks memoization.

</details>

<details class="qa"><summary>Why does <code>setCount(count + 1)</code> three times only add 1?</summary>

Each call enqueues an update whose action is the **value** `count + 1`,
computed from the same render's `count`. When the queue is processed, each
update replaces the state with that value. An **updater function**
(`setCount(c => c + 1)`) is applied to the result of the previous update
instead, so three of them add 3.

</details>

<details class="qa"><summary>What happens if you set state to the same value?</summary>

If the fiber has no other pending work, `setState` computes the new state
**eagerly** and compares it with `Object.is`. If it's equal, React doesn't
schedule a render at all. Otherwise it renders, and if the result is still
equal, it bails out of the children ([The Work Loop](../the-work-loop/)).

</details>

## How a hook call finds its data

`useState` from the `react` package is almost empty. It forwards to whatever
**dispatcher** is currently installed:

```js
// react package, simplified
export function useState(initialState) {
	return ReactSharedInternals.H.useState(initialState)
}
```

`renderWithHooks` (called from `beginWork` for function components) installs
the right dispatcher, calls your component, and removes it again:

```js
function renderWithHooks(current, workInProgress, Component, props) {
	currentlyRenderingFiber = workInProgress
	workInProgress.memoizedState = null     // hook list is rebuilt this render
	workInProgress.updateQueue = null       // effect list is rebuilt this render
	ReactSharedInternals.H =
		current === null || current.memoizedState === null
			? HooksDispatcherOnMount      // first render: useState → mountState
			: HooksDispatcherOnUpdate     // later renders: useState → updateReducer
	let children = Component(props)
	ReactSharedInternals.H = ContextOnlyDispatcher   // hooks called outside render now throw
	// … checks that the same number of hooks was called
	return children
}
```

> `ContextOnlyDispatcher` is where the "Invalid hook call. Hooks can only
> be called inside of the body of a function component" error comes from.
> Outside a render, `H` points to a dispatcher whose hooks all throw.

## The hook list

Each hook is one object (from `mountWorkInProgressHook`):

<figure class="fig fig-hooklist"><div class="chain"><div class="chain-start"><code>Counter</code> fiber<small>.memoizedState</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#1</span><b>useState</b><code>0</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#2</span><b>useRef</b><code>{ current: &lt;button&gt; }</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#3</span><b>useLayoutEffect</b><code>deps [0]</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#4</span><b>useEffect</b><code>deps [0]</code><small>.next</small></div><span class="chain-arrow">→</span><div class="chain-null">null</div></div><figcaption>Hooks live in a linked list on <code>fiber.memoizedState</code>, matched purely by call order.</figcaption></figure>

```js
function mountWorkInProgressHook() {
	var hook = {
		memoizedState: null,   // this hook's value (meaning depends on the hook type)
		baseState: null,       // state before any skipped low-priority updates
		baseQueue: null,       // skipped updates, to replay later
		queue: null,           // pending updates (useState/useReducer)
		next: null             // the next hook
	}
	null === workInProgressHook
		? (currentlyRenderingFiber.memoizedState = workInProgressHook = hook)  // first hook
		: (workInProgressHook = workInProgressHook.next = hook)                // append
	return workInProgressHook
}
```

On updates, `updateWorkInProgressHook` walks **two lists in lockstep**: the
current fiber's hooks (`currentHook`) and the new work-in-progress hooks. It
clones each current hook as it goes. If the current list runs out early, it
throws:

```js
if (null === nextCurrentHook) {
	throw Error("Rendered more hooks than during the previous render.")
}
```

What `memoizedState` holds, per hook type (from `mountState`, `mountRef`,
`mountMemo`, `mountEffectImpl`):

| Hook | `hook.memoizedState` | Extra |
|---|---|---|
| `useState` / `useReducer` | the current state | `hook.queue` = `{ pending, lanes, dispatch, lastRenderedReducer, lastRenderedState }` |
| `useRef` | `{ current: initialValue }`, the same object forever | – |
| `useMemo` | `[value, deps]` | recomputed when `areHookInputsEqual(deps, prevDeps)` fails |
| `useCallback` | `[callback, deps]` | same as `useMemo`, without calling it |
| `useEffect` / `useLayoutEffect` | an effect `{ tag, create, deps, inst: { destroy }, next }` | also pushed onto `fiber.updateQueue.lastEffect`, a circular list the commit walks |
| `useContext` | **no hook object**. It reads from the context stack and records a dependency on `fiber.dependencies` | that's why it's the one hook that *could* be called conditionally (`use(Context)` is allowed to be) |

`areHookInputsEqual` compares deps element by element with `Object.is`:

```js
for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
	if (!objectIs(nextDeps[i], prevDeps[i])) return false
return true
```

### Why conditional hooks break, concretely

```tsx
function Form({ showName }) {
	if (showName) {
		const [name, setName] = useState('Ada')   // hook #1 (only sometimes)
	}
	const [age, setAge] = useState(36)          // hook #1 or #2
	useEffect(() => { document.title = age })   // hook #2 or #3
}
```

<figure class="fig anim fig-conditional-anim" data-anim><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useState('Ada') → mountWorkInProgressHook()&quot;,&quot;say&quot;:&quot;First render (mount). Each hook call &lt;b&gt;appends&lt;/b&gt; a new object to the list.&quot;,&quot;set&quot;:{&quot;c1&quot;:&quot;hl&quot;,&quot;h1&quot;:&quot;new&quot;,&quot;r-name&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useState(36) → mountWorkInProgressHook()&quot;,&quot;say&quot;:&quot;Second call → hook #2.&quot;,&quot;set&quot;:{&quot;c1&quot;:&quot;&quot;,&quot;c2&quot;:&quot;hl&quot;,&quot;h2&quot;:&quot;new&quot;,&quot;r-age&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useEffect(…) → mountWorkInProgressHook()&quot;,&quot;say&quot;:&quot;Third call → hook #3. Notice the list stores &lt;b&gt;no names&lt;/b&gt;: only order.&quot;,&quot;set&quot;:{&quot;c2&quot;:&quot;&quot;,&quot;c3&quot;:&quot;hl&quot;,&quot;h3&quot;:&quot;new&quot;,&quot;r-eff&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Form({ showName: false })&quot;,&quot;say&quot;:&quot;Render 2: &lt;code&gt;showName&lt;/code&gt; is false, so the first &lt;code&gt;useState&lt;/code&gt; is skipped. The hook list from render 1 is still there.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;&quot;,&quot;c1&quot;:&quot;hide&quot;,&quot;render&quot;:&quot;upd&quot;,&quot;h1&quot;:&quot;&quot;,&quot;h2&quot;:&quot;&quot;,&quot;h3&quot;:&quot;&quot;,&quot;r-name&quot;:&quot;ghost&quot;,&quot;r-age&quot;:&quot;ghost&quot;,&quot;r-eff&quot;:&quot;ghost&quot;},&quot;txt&quot;:{&quot;render&quot;:&quot;Render 2 · showName = false&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useState(36) → updateWorkInProgressHook() → takes hook #1&quot;,&quot;say&quot;:&quot;The &lt;b&gt;first&lt;/b&gt; call takes hook &lt;b&gt;#1&lt;/b&gt;, because that’s the next one in the list. It stores &lt;code&gt;'Ada'&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;render&quot;:&quot;&quot;,&quot;c2&quot;:&quot;hl&quot;,&quot;h1&quot;:&quot;bad hl&quot;,&quot;r-age&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;r-age&quot;:&quot;age = 'Ada' ✗&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useEffect(…) → updateWorkInProgressHook() → takes hook #2&quot;,&quot;say&quot;:&quot;The effect call takes hook #2, which is a &lt;b&gt;state&lt;/b&gt; hook. It reads garbage as effect deps.&quot;,&quot;set&quot;:{&quot;c2&quot;:&quot;&quot;,&quot;h1&quot;:&quot;bad&quot;,&quot;c3&quot;:&quot;hl&quot;,&quot;h2&quot;:&quot;bad hl&quot;,&quot;r-eff&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;r-eff&quot;:&quot;effect reads a state hook ✗&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;console.error(…)&quot;,&quot;say&quot;:&quot;Hook #3 is never used. React warns in development. That’s the whole reason for the Rules of Hooks: hooks are matched &lt;b&gt;by call order&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;&quot;,&quot;h2&quot;:&quot;bad&quot;,&quot;h3&quot;:&quot;faint&quot;,&quot;warn&quot;:&quot;bad&quot;}}]" data-intro="&lt;code&gt;if (showName) { useState('Ada') }&lt;/code&gt;, then &lt;code&gt;useState(36)&lt;/code&gt; and &lt;code&gt;useEffect&lt;/code&gt;."><div class="anim-stage"><div class="a-row" style="margin-bottom:12px"><span class="an chip-a" data-k="render">Render 1 · showName = true</span><span class="an chip-a" data-k="warn" data-s="hide">⚠ React has detected a change in the order of Hooks</span></div><div class="a-cols"><div class="a-panel "><div class="a-panel-title">hooks called (in order)</div><div class="a-col"><div class="an call" data-k="c1" data-s="ghost"><code data-k="c1-t">useState('Ada')</code></div><div class="an call" data-k="c2" data-s="ghost"><code data-k="c2-t">useState(36)</code></div><div class="an call" data-k="c3" data-s="ghost"><code data-k="c3-t">useEffect(…)</code></div></div></div><div class="a-panel "><div class="a-panel-title">fiber.memoizedState (hook list)</div><div class="a-col"><div class="an node comp" data-k="h1" data-s="ghost"><span class="node-label" data-k="h1-label">#1 state</span><small data-k="h1-sub">'Ada'</small></div><div class="an node comp" data-k="h2" data-s="ghost"><span class="node-label" data-k="h2-label">#2 state</span><small data-k="h2-sub">36</small></div><div class="an node comp" data-k="h3" data-s="ghost"><span class="node-label" data-k="h3-label">#3 effect</span><small data-k="h3-sub">deps: none</small></div></div></div><div class="a-panel "><div class="a-panel-title">what the component gets</div><div class="a-col"><span class="an chip-a" data-k="r-name" data-s="ghost">name = 'Ada'</span><span class="an chip-a" data-k="r-age" data-s="ghost">age = 36</span><span class="an chip-a" data-k="r-eff" data-s="ghost">effect ✓</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>useState('Ada') → mountWorkInProgressHook()</code><span>First render (mount). Each hook call <b>appends</b> a new object to the list.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useState(36) → mountWorkInProgressHook()</code><span>Second call → hook #2.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useEffect(…) → mountWorkInProgressHook()</code><span>Third call → hook #3. Notice the list stores <b>no names</b>: only order.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Form({ showName: false })</code><span>Render 2: <code>showName</code> is false, so the first <code>useState</code> is skipped. The hook list from render 1 is still there.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useState(36) → updateWorkInProgressHook() → takes hook #1</code><span>The <b>first</b> call takes hook <b>#1</b>, because that’s the next one in the list. It stores <code>'Ada'</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>useEffect(…) → updateWorkInProgressHook() → takes hook #2</code><span>The effect call takes hook #2, which is a <b>state</b> hook. It reads garbage as effect deps.</span></li><li><span class="anim-phase ph-render">render phase</span><code>console.error(…)</code><span>Hook #3 is never used. React warns in development. That’s the whole reason for the Rules of Hooks: hooks are matched <b>by call order</b>.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>Hooks are matched purely by call order. Skip one, and every later call reads someone else’s slot.</figcaption></figure>

| Render | `showName` | Calls | List walked | Result |
|---|---|---|---|---|
| 1 (mount) | `true` | useState, useState, useEffect | builds `[ 'Ada', 36, effect ]` | ok |
| 2 | `false` | useState(36), useEffect | takes hook #1 (`'Ada'`) for `age`, hook #2 (`36`) as the effect | `age === 'Ada'`. The effect hook reads a state hook object (crash or nonsense). React warns: "React has detected a change in the order of Hooks" |

react.dev's rule: "Don't call Hooks inside loops, conditions, nested
functions, or `try`/`catch`/`finally` blocks."

## `setState`: from call to render

`mountState` creates the queue and the bound dispatcher:

<figure class="fig fig-ring"><svg viewBox="0 0 420 220" class="diagram-svg"><defs><marker id="ring-ah" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#2b2522"/></marker></defs><path d="M210 40 A70 70 0 0 1 270.6217782649107 145" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#ring-ah)" class="ring-arc"/><path d="M270.6217782649107 145 A70 70 0 0 1 149.3782217350893 145.00000000000003" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#ring-ah)" class="ring-arc"/><path d="M149.3782217350893 145.00000000000003 A70 70 0 0 1 210 40" fill="none" stroke="#2b2522" stroke-width="2" marker-end="url(#ring-ah)" class="ring-arc"/><g><circle cx="210" cy="40" r="24" fill="#f7c4e6" stroke="#2b2522" stroke-width="2"/><text x="210" y="45" text-anchor="middle" class="t-node">u1</text></g><g><circle cx="270.6217782649107" cy="145" r="24" fill="#f7c4e6" stroke="#2b2522" stroke-width="2"/><text x="270.6217782649107" y="150" text-anchor="middle" class="t-node">u2</text></g><g><circle cx="149.3782217350893" cy="145.00000000000003" r="24" fill="#ffb36b" stroke="#2b2522" stroke-width="2"/><text x="149.3782217350893" y="150.00000000000003" text-anchor="middle" class="t-node">u3</text></g><text x="119.37822173508931" y="149.00000000000003" text-anchor="end" class="t-small t-bold">queue.pending →</text><text x="210" y="115" text-anchor="middle" class="t-small">.next</text></svg><figcaption>The pending queue is circular: <code>queue.pending</code> points at the <b>last</b> update, and <code>last.next</code> is the first. Appending is O(1).</figcaption></figure>

```js
function mountState(initialState) {
	const hook = mountStateImpl(initialState)   // memoizedState = initialState (or initializer())
	const queue = hook.queue
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)
	queue.dispatch = dispatch
	return [hook.memoizedState, dispatch]
}
```

Calling `dispatch(action)` → `dispatchSetState` picks a lane
(`requestUpdateLane`, see [Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/)) → then
`dispatchSetStateInternal`, simplified from the source:

```js
function dispatchSetStateInternal(fiber, queue, action, lane) {
	const update = { lane, action, hasEagerState: false, eagerState: null, next: null }

	// EAGER BAILOUT: only if this fiber has no other pending updates
	if (fiber.lanes === 0 && (fiber.alternate === null || fiber.alternate.lanes === 0)) {
		const currentState = queue.lastRenderedState
		const eagerState = queue.lastRenderedReducer(currentState, action)  // run the update NOW
		update.hasEagerState = true
		update.eagerState = eagerState
		if (Object.is(eagerState, currentState)) {
			enqueueUpdate(fiber, queue, update, NoLane)   // keep it, but DON'T schedule a render
			return false
		}
	}

	const root = enqueueConcurrentHookUpdate(fiber, queue, update, lane)  // stash update, walk up to the root
	if (root !== null) scheduleUpdateOnFiber(root, fiber, lane)            // mark lanes, schedule root
	return true
}
```

Stashed updates are linked into `queue.pending` when the next render starts
(`finishQueueingConcurrentUpdates`). The pending queue is a **circular linked
list**. `queue.pending` points to
the last update, and `last.next` is the first, so appending is O(1) and
reading from the start is O(1).

### Processing the queue during render

When the component renders again, the update dispatcher's `useState` calls
`updateReducer(basicStateReducer)`. `basicStateReducer` is:

```js
function basicStateReducer(state, action) {
	return typeof action === 'function' ? action(state) : action
}
```

`updateReducerImpl` moves `queue.pending` into the hook's `baseQueue`, then
loops over the updates:

```text
newState = hook.baseState
for each update in baseQueue:
	if update.lane is NOT in the lanes being rendered:
		skip it: copy it into a new baseQueue (and keep newBaseState frozen at this point)
	else:
		newState = update.hasEagerState ? update.eagerState : reducer(newState, update.action)
hook.memoizedState = newState
if newState is not Object.is-equal to the old state: didReceiveUpdate = true
```

> The "skip and keep" branch is what makes priorities safe. A sync render
> in the middle of a pending transition applies only the sync updates, but it
> keeps the transition updates *and everything queued after them* in
> `baseQueue`. When the transition renders, it replays them all in the
> original order from `baseState`. That's why updater functions can run more
> than once, and why they must be pure.

## Queue processing, step by step

```tsx
const [count, setCount] = useState(0)

function handleClick() {
	setCount(count + 1)        // action: 1
	setCount((c) => c + 1)     // action: c => c + 1
	setCount(42)               // action: 42
	setCount((c) => c * 2)     // action: c => c * 2
}
```

<figure class="fig anim fig-queue-anim" data-anim><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchSetState(fiber, queue, 1) · eager: 0 → 1&quot;,&quot;say&quot;:&quot;The fiber has no pending work, so React computes the new state &lt;b&gt;eagerly&lt;/b&gt;: 1 ≠ 0, so a render is needed.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;hl&quot;,&quot;u0&quot;:&quot;new&quot;,&quot;pending&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;u0-sub&quot;:&quot;action: 1 · eagerState 1&quot;,&quot;pending&quot;:&quot;queue.pending → u1&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;scheduleUpdateOnFiber(root, fiber, SyncLane) → queueMicrotask&quot;,&quot;say&quot;:&quot;A render is scheduled for later, in a microtask. Nothing renders now.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;&quot;,&quot;micro&quot;:&quot;on&quot;,&quot;pending&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;micro&quot;:&quot;microtask: scheduled&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchSetState(fiber, queue, c =&gt; c + 1)&quot;,&quot;say&quot;:&quot;The fiber now has pending lanes, so no eager computation: the update is just appended. &lt;code&gt;queue.pending&lt;/code&gt; always points at the &lt;b&gt;last&lt;/b&gt; update.&quot;,&quot;set&quot;:{&quot;micro&quot;:&quot;keep&quot;,&quot;l1&quot;:&quot;hl&quot;,&quot;u1&quot;:&quot;new&quot;,&quot;pending&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;pending&quot;:&quot;queue.pending → u2 (u2.next = u1)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchSetState(fiber, queue, 42)&quot;,&quot;say&quot;:&quot;Appended. The microtask is already scheduled.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;&quot;,&quot;l2&quot;:&quot;hl&quot;,&quot;u2&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;pending&quot;:&quot;queue.pending → u3 (u3.next = u1)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchSetState(fiber, queue, c =&gt; c * 2)&quot;,&quot;say&quot;:&quot;Appended. The handler returns. Four updates are waiting; nothing has rendered.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;&quot;,&quot;l3&quot;:&quot;hl&quot;,&quot;u3&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;pending&quot;:&quot;queue.pending → u4 (u4.next = u1)&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Counter() → useState → updateReducer(basicStateReducer)&quot;,&quot;say&quot;:&quot;The microtask renders Counter once. &lt;code&gt;updateReducer&lt;/code&gt; folds the queue, starting from the base state 0.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;&quot;,&quot;pending&quot;:&quot;&quot;,&quot;micro&quot;:&quot;done&quot;,&quot;renders&quot;:&quot;upd&quot;,&quot;state&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;micro&quot;:&quot;microtask: running&quot;,&quot;renders&quot;:&quot;renders: 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;u1: hasEagerState → 1&quot;,&quot;say&quot;:&quot;u1 already has its eager result: &lt;b&gt;1&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;u0&quot;:&quot;done hl&quot;,&quot;state&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;state&quot;:&quot;1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;u2: basicStateReducer(1, c =&gt; c + 1) → 2&quot;,&quot;say&quot;:&quot;An updater function receives the &lt;b&gt;latest&lt;/b&gt; state: 1 + 1 = &lt;b&gt;2&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;u0&quot;:&quot;done&quot;,&quot;u1&quot;:&quot;done hl&quot;},&quot;txt&quot;:{&quot;state&quot;:&quot;2&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;u3: basicStateReducer(2, 42) → 42&quot;,&quot;say&quot;:&quot;A plain value replaces whatever came before: &lt;b&gt;42&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;u1&quot;:&quot;done&quot;,&quot;u2&quot;:&quot;done hl&quot;},&quot;txt&quot;:{&quot;state&quot;:&quot;42&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;u4: basicStateReducer(42, c =&gt; c * 2) → 84&quot;,&quot;say&quot;:&quot;42 × 2 = &lt;b&gt;84&lt;/b&gt;. One render, all four updates, in order.&quot;,&quot;set&quot;:{&quot;u2&quot;:&quot;done&quot;,&quot;u3&quot;:&quot;done hl&quot;,&quot;state&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;state&quot;:&quot;84&quot;}}]" data-intro="&lt;code&gt;count&lt;/code&gt; is 0 and &lt;code&gt;handleClick&lt;/code&gt; calls &lt;code&gt;setCount&lt;/code&gt; four times."><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">handleClick()</div><div class="a-col"><div class="an call" data-k="l0"><code>setCount(count + 1)</code></div><div class="an call" data-k="l1"><code>setCount(c => c + 1)</code></div><div class="an call" data-k="l2"><code>setCount(42)</code></div><div class="an call" data-k="l3"><code>setCount(c => c * 2)</code></div></div></div><div class="a-panel "><div class="a-panel-title">hook.queue (circular)</div><div class="a-col"><div class="an node comp" data-k="u0" data-s="ghost"><span class="node-label" data-k="u0-label">u1</span><small data-k="u0-sub">action: 1</small></div><div class="an node comp" data-k="u1" data-s="ghost"><span class="node-label" data-k="u1-label">u2</span><small data-k="u1-sub">action: c => c + 1</small></div><div class="an node comp" data-k="u2" data-s="ghost"><span class="node-label" data-k="u2-label">u3</span><small data-k="u2-sub">action: 42</small></div><div class="an node comp" data-k="u3" data-s="ghost"><span class="node-label" data-k="u3-label">u4</span><small data-k="u3-sub">action: c => c * 2</small></div><span class="an chip-a" data-k="pending">queue.pending = null</span></div></div><div class="a-panel "><div class="a-panel-title">scheduling & state</div><div class="a-col"><span class="an chip-a" data-k="micro">microtask: none</span><span class="an chip-a" data-k="renders">renders: 0</span><div class="a-label" style="margin-top:6px">count</div><span class="an chip-a" data-k="state">0</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatchSetState(fiber, queue, 1) · eager: 0 → 1</code><span>The fiber has no pending work, so React computes the new state <b>eagerly</b>: 1 ≠ 0, so a render is needed.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>scheduleUpdateOnFiber(root, fiber, SyncLane) → queueMicrotask</code><span>A render is scheduled for later, in a microtask. Nothing renders now.</span></li><li><span class="anim-phase ph-event">event</span><code>dispatchSetState(fiber, queue, c =&gt; c + 1)</code><span>The fiber now has pending lanes, so no eager computation: the update is just appended. <code>queue.pending</code> always points at the <b>last</b> update.</span></li><li><span class="anim-phase ph-event">event</span><code>dispatchSetState(fiber, queue, 42)</code><span>Appended. The microtask is already scheduled.</span></li><li><span class="anim-phase ph-event">event</span><code>dispatchSetState(fiber, queue, c =&gt; c * 2)</code><span>Appended. The handler returns. Four updates are waiting; nothing has rendered.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Counter() → useState → updateReducer(basicStateReducer)</code><span>The microtask renders Counter once. <code>updateReducer</code> folds the queue, starting from the base state 0.</span></li><li><span class="anim-phase ph-render">render phase</span><code>u1: hasEagerState → 1</code><span>u1 already has its eager result: <b>1</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>u2: basicStateReducer(1, c =&gt; c + 1) → 2</code><span>An updater function receives the <b>latest</b> state: 1 + 1 = <b>2</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>u3: basicStateReducer(2, 42) → 42</code><span>A plain value replaces whatever came before: <b>42</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>u4: basicStateReducer(42, c =&gt; c * 2) → 84</code><span>42 × 2 = <b>84</b>. One render, all four updates, in order.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption><code>setState</code> only queues. The render folds every queued update in order.</figcaption></figure>

| # | Call | Eager? | Queue after | Render scheduled? |
|---|---|---|---|---|
| 1 | `setCount(1)` | yes (fiber had no lanes). `eagerState = 1` ≠ 0 | `[u1]` | yes (SyncLane, microtask) |
| 2 | `setCount(c => c + 1)` | no (fiber now has `lanes`) | `[u1, u2]` | already scheduled |
| 3 | `setCount(42)` | no | `[u1, u2, u3]` | – |
| 4 | `setCount(c => c * 2)` | no | `[u1, u2, u3, u4]` | – |

In the render, `updateReducer` folds the queue:

| Update | Action | State |
|---|---|---|
| start | – | `0` |
| u1 | `1` (eager state) | `1` |
| u2 | `c => c + 1` | `2` |
| u3 | `42` | `42` |
| u4 | `c => c * 2` | `84` |

One render, and `count === 84`. react.dev's summary: React "waits until
*all* code in the event handlers has run before processing your state
updates."

## Rules and caveats

- **Call hooks at the top level, in the same order, every render.** The hook
  list is positional.
- **Setters are stable, state values are snapshots.** `count` inside a
  handler is the value from the render that created the handler. Use updater
  functions when the next state depends on the previous one.
- **Setting equal state is (nearly) free.** The eager `Object.is` check skips
  scheduling when possible. When it can't run early, the render still
  bails out of children.
- **Updater functions and reducers must be pure.** They can be replayed when
  lanes are rebased, and Strict Mode calls them twice.
- **`useRef` is just a hook whose `memoizedState` is a mutable object**
  React never looks inside. Changing `.current` never schedules anything.
- **Deps are compared with `Object.is` per element.** A new object or array
  in deps means "changed" every render.

### Sources
- React 19.2.5 source: `renderWithHooks`, `mountWorkInProgressHook`, `updateWorkInProgressHook`, `mountState`, `dispatchSetState`, `dispatchSetStateInternal`, `basicStateReducer`, `updateReducerImpl`, `mountMemo`, `updateMemo`, `mountRef`, `mountEffectImpl`, `pushSimpleEffect`, `areHookInputsEqual`
- [React source: `ReactFiberHooks.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js)
- [react.dev: Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [react.dev: Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
