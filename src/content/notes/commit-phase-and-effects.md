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

<figure class="fig anim fig-effects-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Mount</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Update</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Unmount</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitMutationEffects → appendChild(subtree)&quot;,&quot;say&quot;:&quot;Mutation: the whole new DOM subtree (already built in &lt;code&gt;completeWork&lt;/code&gt;) is inserted with one &lt;code&gt;appendChild&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;new hl&quot;,&quot;C&quot;:&quot;new hl&quot;,&quot;D&quot;:&quot;new hl&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitLayoutEffects: attach ref&quot;,&quot;say&quot;:&quot;Layout phase walks &lt;b&gt;child before parent&lt;/b&gt;. The deepest node first: the ref is attached.&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;new&quot;,&quot;C&quot;:&quot;new&quot;,&quot;D&quot;:&quot;new hl&quot;,&quot;log0&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitLayoutEffectOnFiber(Child) → useLayoutEffect&quot;,&quot;say&quot;:&quot;Then Child’s layout effect…&quot;,&quot;set&quot;:{&quot;D&quot;:&quot;new&quot;,&quot;C&quot;:&quot;new hl&quot;,&quot;log1&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitLayoutEffectOnFiber(Parent) → useLayoutEffect&quot;,&quot;say&quot;:&quot;…then Parent’s. All before the browser paints.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;new&quot;,&quot;P&quot;:&quot;new hl&quot;,&quot;log2&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;browser paints&quot;,&quot;say&quot;:&quot;Now the user sees the UI.&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;flushPassiveEffects → commitPassiveMountOnFiber(Child)&quot;,&quot;say&quot;:&quot;Passive effects, again &lt;b&gt;child first&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;new hl&quot;,&quot;log3&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitPassiveMountOnFiber(Parent)&quot;,&quot;say&quot;:&quot;Parent’s &lt;code&gt;useEffect&lt;/code&gt; runs last.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;new&quot;,&quot;P&quot;:&quot;new hl&quot;,&quot;log4&quot;:&quot;done&quot;}}]" data-intro="First render of &lt;code&gt;&amp;lt;Parent&amp;gt;&amp;lt;Child&amp;gt;&amp;lt;div ref /&amp;gt;&amp;lt;/Child&amp;gt;&amp;lt;/Parent&amp;gt;&lt;/code&gt;."><div class="anim-scn-title">Mount</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">tree</div><div class="t-tree"><div class="t-branch"><div class="an node comp" data-k="P"><span class="node-label" data-k="P-label">Parent</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="C"><span class="node-label" data-k="C-label">Child</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="D"><span class="node-label" data-k="D-label">div</span><small data-k="D-sub">ref</small></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">console</div><div class="a-log"><div class="an" data-k="log0" data-s="hide">ref attached</div><div class="an" data-k="log1" data-s="hide">C layout</div><div class="an" data-k="log2" data-s="hide">P layout</div><div class="an" data-k="log3" data-s="hide">C effect</div><div class="an" data-k="log4" data-s="hide">P effect</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>commitMutationEffects → appendChild(subtree)</code><span>Mutation: the whole new DOM subtree (already built in <code>completeWork</code>) is inserted with one <code>appendChild</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitLayoutEffects: attach ref</code><span>Layout phase walks <b>child before parent</b>. The deepest node first: the ref is attached.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitLayoutEffectOnFiber(Child) → useLayoutEffect</code><span>Then Child’s layout effect…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitLayoutEffectOnFiber(Parent) → useLayoutEffect</code><span>…then Parent’s. All before the browser paints.</span></li><li><span class="anim-phase ph-paint">browser</span><code>browser paints</code><span>Now the user sees the UI.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>flushPassiveEffects → commitPassiveMountOnFiber(Child)</code><span>Passive effects, again <b>child first</b>.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitPassiveMountOnFiber(Parent)</code><span>Parent’s <code>useEffect</code> runs last.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitMutationEffects: layout cleanups (Child)&quot;,&quot;say&quot;:&quot;Mutation phase: &lt;b&gt;layout cleanups&lt;/b&gt; run, child first.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;hl&quot;,&quot;log0&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitMutationEffects: layout cleanups (Parent)&quot;,&quot;say&quot;:&quot;Then the parent’s.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;&quot;,&quot;P&quot;:&quot;hl&quot;,&quot;log1&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;root.current = finishedWork · layout: Child&quot;,&quot;say&quot;:&quot;After the tree swap, layout setups: child…&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;&quot;,&quot;C&quot;:&quot;hl&quot;,&quot;log2&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;layout: Parent&quot;,&quot;say&quot;:&quot;…then parent.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;&quot;,&quot;P&quot;:&quot;hl&quot;,&quot;log3&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;browser paints&quot;,&quot;say&quot;:&quot;Paint.&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitPassiveUnmountEffects (all cleanups)&quot;,&quot;say&quot;:&quot;Passive effects run in &lt;b&gt;two full passes&lt;/b&gt;. First every cleanup, child first…&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;hl&quot;,&quot;log4&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitPassiveUnmountEffects&quot;,&quot;say&quot;:&quot;…parent cleanup…&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;&quot;,&quot;P&quot;:&quot;hl&quot;,&quot;log5&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitPassiveMountEffects (all setups)&quot;,&quot;say&quot;:&quot;…then every setup, child first…&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;&quot;,&quot;C&quot;:&quot;hl&quot;,&quot;log6&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitPassiveMountEffects&quot;,&quot;say&quot;:&quot;…and parent last. Rule: cleanups before setups, children before parents.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;&quot;,&quot;P&quot;:&quot;hl&quot;,&quot;log7&quot;:&quot;done&quot;}}]" data-intro="Both components re-render; no deps arrays, so every effect re-runs."><div class="anim-scn-title">Update</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">tree</div><div class="t-tree"><div class="t-branch"><div class="an node comp" data-k="P"><span class="node-label" data-k="P-label">Parent</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="C"><span class="node-label" data-k="C-label">Child</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="D"><span class="node-label" data-k="D-label">div</span><small data-k="D-sub">ref</small></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">console</div><div class="a-log"><div class="an" data-k="log0" data-s="hide">C layout cleanup</div><div class="an" data-k="log1" data-s="hide">P layout cleanup</div><div class="an" data-k="log2" data-s="hide">C layout</div><div class="an" data-k="log3" data-s="hide">P layout</div><div class="an" data-k="log4" data-s="hide">C effect cleanup</div><div class="an" data-k="log5" data-s="hide">P effect cleanup</div><div class="an" data-k="log6" data-s="hide">C effect</div><div class="an" data-k="log7" data-s="hide">P effect</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>commitMutationEffects: layout cleanups (Child)</code><span>Mutation phase: <b>layout cleanups</b> run, child first.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitMutationEffects: layout cleanups (Parent)</code><span>Then the parent’s.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>root.current = finishedWork · layout: Child</code><span>After the tree swap, layout setups: child…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>layout: Parent</code><span>…then parent.</span></li><li><span class="anim-phase ph-paint">browser</span><code>browser paints</code><span>Paint.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitPassiveUnmountEffects (all cleanups)</code><span>Passive effects run in <b>two full passes</b>. First every cleanup, child first…</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitPassiveUnmountEffects</code><span>…parent cleanup…</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitPassiveMountEffects (all setups)</code><span>…then every setup, child first…</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitPassiveMountEffects</code><span>…and parent last. Rule: cleanups before setups, children before parents.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitDeletionEffects(Parent)&quot;,&quot;say&quot;:&quot;Deletion walks the removed subtree &lt;b&gt;parent first&lt;/b&gt;: Parent’s layout cleanup…&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;del hl&quot;,&quot;log0&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitDeletionEffectsOnFiber(Child)&quot;,&quot;say&quot;:&quot;…then it recurses into Child.&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;del&quot;,&quot;C&quot;:&quot;del hl&quot;,&quot;log1&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;safelyDetachRef(div) · removeChild(topNode)&quot;,&quot;say&quot;:&quot;Refs are detached and the top DOM node is removed.&quot;,&quot;set&quot;:{&quot;C&quot;:&quot;del&quot;,&quot;D&quot;:&quot;del hl&quot;,&quot;log2&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;flushPassiveEffects (deleted subtree)&quot;,&quot;say&quot;:&quot;In the next passive flush, effect cleanups for the deleted subtree, &lt;b&gt;also parent first&lt;/b&gt;…&quot;,&quot;set&quot;:{&quot;D&quot;:&quot;del&quot;,&quot;P&quot;:&quot;del hl&quot;,&quot;log3&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitPassiveUnmountEffectsInsideOfDeletedTree&quot;,&quot;say&quot;:&quot;…then the child. Deletions are the one place the order flips.&quot;,&quot;set&quot;:{&quot;P&quot;:&quot;del&quot;,&quot;C&quot;:&quot;del hl&quot;,&quot;log4&quot;:&quot;upd&quot;}}]" data-intro="&lt;code&gt;Parent&lt;/code&gt; is removed from the tree."><div class="anim-scn-title">Unmount</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">tree</div><div class="t-tree"><div class="t-branch"><div class="an node comp" data-k="P"><span class="node-label" data-k="P-label">Parent</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp" data-k="C"><span class="node-label" data-k="C-label">Child</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host" data-k="D"><span class="node-label" data-k="D-label">div</span><small data-k="D-sub">ref</small></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">console</div><div class="a-log"><div class="an" data-k="log0" data-s="hide">P layout cleanup</div><div class="an" data-k="log1" data-s="hide">C layout cleanup</div><div class="an" data-k="log2" data-s="hide">ref detached (null)</div><div class="an" data-k="log3" data-s="hide">P effect cleanup</div><div class="an" data-k="log4" data-s="hide">C effect cleanup</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>commitDeletionEffects(Parent)</code><span>Deletion walks the removed subtree <b>parent first</b>: Parent’s layout cleanup…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitDeletionEffectsOnFiber(Child)</code><span>…then it recurses into Child.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>safelyDetachRef(div) · removeChild(topNode)</code><span>Refs are detached and the top DOM node is removed.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>flushPassiveEffects (deleted subtree)</code><span>In the next passive flush, effect cleanups for the deleted subtree, <b>also parent first</b>…</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitPassiveUnmountEffectsInsideOfDeletedTree</code><span>…then the child. Deletions are the one place the order flips.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="del"></i>deleted</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Effect ordering for mount, update and unmount. Watch which node is active and what gets logged.</figcaption></figure>

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
