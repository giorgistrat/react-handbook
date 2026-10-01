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

<figure class="fig fig-conditional"><div class="cond"><div class="cond-row"><span class="cond-label">Render 1<br><small>showName = true</small></span><div class="cond-slot ok"><span class="chain-idx">#1</span><small>stored</small><code>'Ada'</code><small>called</small><code>useState</code><b>✓</b></div><div class="cond-slot ok"><span class="chain-idx">#2</span><small>stored</small><code>36</code><small>called</small><code>useState</code><b>✓</b></div><div class="cond-slot ok"><span class="chain-idx">#3</span><small>stored</small><code>effect</code><small>called</small><code>useEffect</code><b>✓</b></div></div><div class="cond-row"><span class="cond-label">Render 2<br><small>showName = false</small></span><div class="cond-slot bad"><span class="chain-idx">#1</span><small>stored</small><code>'Ada'</code><small>called</small><code>useState(36)</code><b>✗</b></div><div class="cond-slot bad"><span class="chain-idx">#2</span><small>stored</small><code>36</code><small>called</small><code>useEffect</code><b>✗</b></div><div class="cond-slot ghost">#3 unused</div></div></div><figcaption>Render 2 skips the first hook, so every later call reads the wrong slot.</figcaption></figure>

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
