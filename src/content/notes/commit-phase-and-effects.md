---
title: "Commit Phase and Effects"
slug: "commit-phase-and-effects"
order: 5
level: "must"
illus: "eye"
summary: "Commit sub-phases, the tree swap, and exactly when refs, useLayoutEffect and useEffect run."
source: "https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js"
---


> What React does after the render phase finishes: the sub-phases of
> `commitRoot` and exactly when refs, `useLayoutEffect` and `useEffect` run.
> Read from `commitRoot`, `flushMutationEffects`, `flushLayoutEffects`,
> `flushSpawnedWork` and `flushPassiveEffects` in the React 19.2.5 build,
> plus react.dev's [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect)
> and [`useEffect`](https://react.dev/reference/react/useEffect) pages. Part
> of [React Internals](../../), and a lower-level companion to *React Lifecycle*.
> My own notes and clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>What happens in the commit phase?</summary>

React applies the finished work-in-progress tree to the screen in one
**synchronous, uninterruptible** pass: DOM mutations, then the tree swap
(`root.current = finishedWork`), then layout effects and ref attachment.
Passive effects (`useEffect`) are scheduled to run after it.

</details>

<details class="qa"><summary><code>useLayoutEffect</code> vs <code>useEffect</code>: when exactly does each run?</summary>

`useLayoutEffect` runs **inside** the commit, after the DOM is mutated but
**before the browser paints**, so it can measure layout and make changes the
user never sees in an intermediate state. `useEffect` runs **after the
commit**, normally after the paint, so it doesn't delay what the user sees. In
our example, a tooltip measures itself in `useLayoutEffect` to avoid a flash
at the wrong position.

</details>

<details class="qa"><summary>In what order do effects run between parent and child?</summary>

Children first, then the parent. React walks the tree and handles a
fiber's subtree before the fiber itself. For each kind of effect, **all
cleanups run before any setup**.

</details>

<details class="qa"><summary>Why can the commit phase not be interrupted?</summary>

Because it changes the DOM. Pausing halfway would show the user a
half-updated UI. All the interruptible work happens in the render phase,
before the first DOM write.

</details>

## The problem: applying a finished tree atomically

After the render phase, React has a work-in-progress tree whose fibers carry
**flags** (`Placement`, `Update`, `ChildDeletion`, `Ref`, `Passive`,
`LayoutMask`…) and whose ancestors carry `subtreeFlags`. The commit has to:

1. turn those flags into DOM calls,
2. make the new tree official,
3. give user code (refs, layout effects, passive effects) a chance to run at
   the right moments: some *before* paint because they must, and some
   *after* paint because they shouldn't block it.

`subtreeFlags` makes each pass cheap. A traversal descends into a child
only if `child.subtreeFlags & mask` or `child.flags & mask` is non-zero, so
an update deep in a big tree only visits the path to it.

## The sub-phases of `commitRoot`

In 19.2.5, `commitRoot` runs these in order (the helpers are split out so
view transitions can pause between them):

<figure class="fig fig-commit-phases"><div class="pipe"><div class="pipe-step pipe-commit"><div class="pipe-head"><span class="pipe-num">1</span><span>Before mutation</span></div><ul><li>DOM still shows the old UI</li><li><code>getSnapshotBeforeUpdate</code></li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-commit"><div class="pipe-head"><span class="pipe-num">2</span><span>Mutation</span></div><ul><li>DOM writes (insert, update, remove)</li><li>layout-effect cleanups</li><li><code>useInsertionEffect</code></li><li>detach old refs</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-swap"><div class="pipe-head"><span class="pipe-num">3</span><span>Swap</span></div><ul><li><code>root.current = finishedWork</code></li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-commit"><div class="pipe-head"><span class="pipe-num">4</span><span>Layout</span></div><ul><li>attach refs</li><li><code>useLayoutEffect</code> setups</li><li><code>componentDidMount/Update</code></li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-paint"><div class="pipe-head"><span class="pipe-num">5</span><span>Paint</span></div><ul><li>browser draws pixels</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-effects"><div class="pipe-head"><span class="pipe-num">6</span><span>Passive</span></div><ul><li>all <code>useEffect</code> cleanups, then all setups</li><li>SyncLane: flushed before paint</li></ul></div></div><figcaption>Everything left of “Paint” is one synchronous pass. Layout effects run child → parent, before the user sees anything.</figcaption></figure>

```js
commitBeforeMutationEffects(root, finishedWork, lanes)  // 1. before mutation
flushMutationEffects()                                   // 2. mutation (+ 3. swap)
flushLayoutEffects()                                     // 4. layout
flushSpawnedWork()                                       // 5. schedule / flush passive effects
```

### 1. Before mutation

This runs while the DOM still shows the **old** UI. It's for reading
things that the mutation is about to change: class components'
`getSnapshotBeforeUpdate` (for example, a chat list reading `scrollHeight`
before new messages are inserted), and focus/blur bookkeeping.

### 2. Mutation

`commitMutationEffectsOnFiber` walks the flagged fibers and performs host
operations:

| Flag | DOM work |
|---|---|
| `ChildDeletion` | for each deleted child: detach refs, **run layout-effect cleanups** and (later) passive cleanups for the whole deleted subtree, then `removeChild` the top host node |
| `Placement` | `commitPlacement` finds the next stable host sibling (`getHostSibling`) and `insertBefore` it, or `appendChild` |
| `Update` (host) | `commitUpdate` diffs old and new props and sets only the changed attributes, styles and listeners. Text fibers call `commitTextUpdate` |
| `Update` (function component) | **run `useLayoutEffect` cleanups** of effects whose deps changed, and run `useInsertionEffect` cleanup + setup |
| `Ref` | detach the old ref (set to `null`, or call the React 19 ref cleanup) |

> `useInsertionEffect` runs here, *during* mutation and before any layout
> effect, so CSS-in-JS libraries can inject `<style>` tags before anything
> measures layout. It's the only effect that runs this early. It's not meant
> for app code.

### 3. The swap

At the end of `flushMutationEffects`:

```js
root.current = finishedWork
```

From this line on, the work-in-progress tree is the current tree (see double
buffering in [React Fiber](../react-fiber/)). It happens **after** mutation and **before**
layout, so class `componentWillUnmount` still sees the old tree, while
`componentDidMount`/`useLayoutEffect` see the new one.

### 4. Layout

`commitLayoutEffectOnFiber` walks the flagged fibers **child before parent**:

- **attach refs** (`ref.current = node`, or call a callback ref)
- run **`useLayoutEffect` setups**
- class `componentDidMount` / `componentDidUpdate`

All of this is synchronous JavaScript that runs **before the browser gets a
chance to paint**. If a layout effect calls `setState`, React processes that
update **synchronously**, before the paint, which is how "measure then
reposition" works without a visible flicker. The cost: a slow layout effect
directly delays the frame.

### 5. Passive effects (`useEffect`)

`flushSpawnedWork` checks whether any fiber had the `Passive` flag. If so,
React normally schedules `flushPassiveEffects` as a **separate Scheduler
task** (`NormalPriority`). The browser paints in between, so `useEffect`
runs after the user already sees the update.

There's one exception in the source:

```js
0 !== (pendingEffectsLanes & 3) && flushPendingEffects()
// lanes 1 and 2 = SyncHydrationLane | SyncLane
```

If the render was for a **discrete** update (a click, a keypress →
`SyncLane`), React flushes the passive effects **synchronously at the end of
the commit**. That's the React 18 change react.dev mentions: effects caused
by a discrete input may run before the paint, so the result of an
interaction is consistent before the next input can arrive. If passive
effects are still pending when a new render starts, React always flushes them
first, so effects from render N always run before render N+1 commits.

`flushPassiveEffects` does two full traversals:
1. **All passive cleanups** (`commitPassiveUnmountOnFiber`): for deleted
   fibers and for effects whose deps changed.
2. **All passive setups** (`commitPassiveMountOnFiber`).

Both traverse child before parent.

## Effect ordering, step by step

```tsx
function Parent() {
	useLayoutEffect(() => { log('P layout'); return () => log('P layout cleanup') })
	useEffect(() => { log('P effect'); return () => log('P effect cleanup') })
	return <Child />
}
function Child() {
	useLayoutEffect(() => { log('C layout'); return () => log('C layout cleanup') })
	useEffect(() => { log('C effect'); return () => log('C effect cleanup') })
	return <div ref={() => log('ref attached')} />
}
```

<figure class="fig fig-effect-order"><div class="eo-wrap"><div class="eo-lane"><span class="eo-label">mutation</span><span class="eo eo-clean">C layout cleanup</span><span class="eo eo-clean">P layout cleanup</span></div><div class="eo-lane"><span class="eo-label">layout</span><span class="eo eo-setup">C layout</span><span class="eo eo-setup">P layout</span></div><div class="eo-lane"><span class="eo-label">paint</span><span class="eo eo-paint">🖌 browser paints</span></div><div class="eo-lane"><span class="eo-label">passive</span><span class="eo eo-clean">C effect cleanup</span><span class="eo eo-clean">P effect cleanup</span><span class="eo eo-setup">C effect</span><span class="eo eo-setup">P effect</span></div></div><figcaption>On update: cleanups before setups, children before parents. On unmount the order flips to parent → child.</figcaption></figure>

**Mount:**

| Order | Log | Phase |
|---|---|---|
| – | (DOM inserted: one `appendChild` of the whole subtree) | mutation |
| 1 | `ref attached` | layout (the `div` is deepest) |
| 2 | `C layout` | layout |
| 3 | `P layout` | layout |
| – | browser paints (for a non-discrete update like the initial render) | – |
| 4 | `C effect` | passive |
| 5 | `P effect` | passive |

**Update** (both re-render, no deps arrays, so every effect re-runs):

| Order | Log | Phase |
|---|---|---|
| 1 | `C layout cleanup` | mutation |
| 2 | `P layout cleanup` | mutation |
| 3 | `C layout` | layout |
| 4 | `P layout` | layout |
| 5 | `C effect cleanup` | passive, cleanups pass |
| 6 | `P effect cleanup` | passive, cleanups pass |
| 7 | `C effect` | passive, setups pass |
| 8 | `P effect` | passive, setups pass |

> The callback ref didn't log again on update only if it's a *stable*
> function. An inline arrow is a new function every render, so React
> detaches it (`null`) in mutation and attaches the new one in layout on
> every commit.

**Unmount** of `Parent`: in mutation, `commitDeletionEffectsOnFiber` walks
the deleted subtree **parent first**. It runs a fiber's layout cleanups and
then recurses into its children, so the log is `P layout cleanup` → `C layout
cleanup`. Refs are detached along the way, and then the top DOM node is
removed. Passive cleanups for the deleted subtree (`P effect cleanup` → `C
effect cleanup`, also parent first for deletions) run in the next passive
flush.

> This is the one place the order flips. For updates, cleanups go
> child → parent. For deletions, React tears down parent → child.

## Where `flushSync` fits

`flushSync(() => setState(x))` forces the update into `SyncLane` and
renders **and commits** it before `flushSync` returns. So the DOM is
updated synchronously inside your event handler, which is useful when you
need to read the new DOM right away (scrolling to a newly added item,
focusing it). It's the imperative escape hatch for the same guarantee layout
effects give. See *flushSync*.

## Rules and caveats

- **Measure in `useLayoutEffect`, fetch/subscribe in `useEffect`.** Layout
  effects block paint. Passive effects don't (except after discrete
  events, where they're flushed early, but still after the commit).
- **Cleanups always run before the next setup**, and all cleanups in a
  pass run before any setup in that pass.
- **Children's effects run before their parent's.** A parent's effect can rely
  on children's refs being attached and their effects having run.
- **`setState` in a layout effect re-renders synchronously before paint.**
  This is correct for measure-and-adjust, and a performance trap if overused.
- **Strict Mode** (dev only) mounts, unmounts and remounts every component
  once to check that cleanups mirror setups.
- **Refs are `null` during render**, set in layout and cleared in mutation.
  Read them in effects or event handlers, not during render.

### Sources
- React 19.2.5 source: `commitRoot`, `commitBeforeMutationEffects`, `flushMutationEffects` (`root.current = finishedWork`), `commitMutationEffectsOnFiber`, `commitPlacement`, `getHostSibling`, `flushLayoutEffects`, `flushSpawnedWork`, `flushPassiveEffects`
- [react.dev: `useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect)
- [react.dev: `useEffect`](https://react.dev/reference/react/useEffect)
- [React 18 upgrade guide: consistent useEffect timing](https://react.dev/blog/2022/03/08/react-18-upgrade-guide#other-breaking-changes)
