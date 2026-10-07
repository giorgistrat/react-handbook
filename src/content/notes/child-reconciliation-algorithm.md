---
title: "Child Reconciliation Algorithm"
slug: "child-reconciliation-algorithm"
order: 8
level: "good"
illus: "list"
summary: "The keyed list diff: lockstep fast path, the key Map and the lastPlacedIndex move heuristic."
source: "https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactChildFiber.js"
---


> The list-diffing algorithm React runs when a component returns several
> children, read from `reconcileChildrenArray`, `updateSlot`,
> `mapRemainingChildren` and `placeChild` in the React 19.2.5 build
> (`react-dom-client.development.js`), whose source is `ReactChildFiber.js`.
> Part of [React Internals](../../). The rules it implements (type and key) are
> explained in [Reconciliation](../reconciliation/). My own notes and clarifications are
> marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>How does React diff a list of children?</summary>

In up to three passes over the new children, all linear. (1) Walk old and
new **in lockstep** while keys match, which is the common case of nothing
moving. (2) If one side runs out, bulk-delete or bulk-insert the rest. (3)
Otherwise put the remaining old fibers in a `Map` by key (or index), look
each new child up in it, and decide per child whether it can **stay** or
must **move**. Old fibers left in the map are deleted.

</details>

<details class="qa"><summary>How does React decide which nodes to move?</summary>

It keeps `lastPlacedIndex`, the highest *old* index among the reused
children so far. A reused child whose old index is **lower** than that has
jumped backwards relative to a sibling, so it's marked to move. Otherwise it
stays and becomes the new `lastPlacedIndex`. New children are always
inserted. In our example, moving the **last** item to the front costs n−1
moves, while moving the first item to the end costs one.

</details>

<details class="qa"><summary>Why are index keys a problem?</summary>

With index keys (or no keys, which falls back to the index), inserting at
the front makes old key `0` match the new first item. React reuses the old
first item's fiber, **with its state and DOM node**, for a different piece
of data. Uncontrolled inputs, focus and local state end up on the wrong row.

</details>

<details class="qa"><summary>Is React's list diff optimal?</summary>

No. It doesn't compute the minimum number of moves. Vue 3 and Inferno use
a longest-increasing-subsequence step for that. React keeps a simpler
single left-to-right pass, because fibers only have forward (`sibling`)
pointers.

</details>

## The problem: pairing old children with new ones

A fiber's children are a **singly linked list**: `parent.child` is the first,
then `.sibling` to the next. The component has just returned a new
**array** of elements. React must decide, for each new element:

- reuse an old fiber (same key and same type) → update props, keep state
- create a new fiber → **insert**
- mark a reused fiber as moved → **move** in the DOM

It must also decide which old fibers have no match → **delete**.

Doing this with nested loops is O(n²), and optimal moves need more
bookkeeping. React does it in O(n) with a `Map`, accepting some extra moves
in rare cases.

## The algorithm

Simplified from `reconcileChildrenArray(returnFiber, currentFirstChild,
newChildren, lanes)`:

```js
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
	let resultingFirstChild = null
	let previousNewFiber = null
	let oldFiber = currentFirstChild
	let lastPlacedIndex = 0
	let newIdx = 0
	let nextOldFiber = null

	// PASS 1: walk both lists in lockstep while keys line up
	for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
		nextOldFiber = oldFiber.sibling
		// updateSlot returns null if the KEYS differ;
		// if keys match but TYPES differ it returns a brand-new fiber
		const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx])
		if (newFiber === null) break                    // keys diverged → leave the fast path
		if (oldFiber && newFiber.alternate === null) {
			deleteChild(returnFiber, oldFiber)          // same key, different type → replace
		}
		lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
		link(newFiber)
		oldFiber = nextOldFiber
	}

	// PASS 2a: the new list ended → everything left in the old list goes
	if (newIdx === newChildren.length) {
		deleteRemainingChildren(returnFiber, oldFiber)
		return resultingFirstChild
	}

	// PASS 2b: the old list ended → everything left in the new list is an insert
	if (oldFiber === null) {
		for (; newIdx < newChildren.length; newIdx++) {
			const newFiber = createChild(returnFiber, newChildren[newIdx])
			lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
			link(newFiber)
		}
		return resultingFirstChild
	}

	// PASS 3: keys diverged in the middle → match by key through a Map
	const existingChildren = mapRemainingChildren(oldFiber)  // key ?? index → fiber
	for (; newIdx < newChildren.length; newIdx++) {
		const newFiber = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx])
		if (newFiber !== null) {
			if (newFiber.alternate !== null) {
				existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key)  // consumed
			}
			lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
			link(newFiber)
		}
	}
	existingChildren.forEach((child) => deleteChild(returnFiber, child))  // leftovers
	return resultingFirstChild
}
```

The move decision, from the actual source (flag constants named):

```js
function placeChild(newFiber, lastPlacedIndex, newIndex) {
	newFiber.index = newIndex
	const current = newFiber.alternate
	if (current !== null) {
		const oldIndex = current.index
		if (oldIndex < lastPlacedIndex) {
			newFiber.flags |= Placement   // this is a MOVE
			return lastPlacedIndex
		} else {
			return oldIndex               // this item can STAY where it is
		}
	} else {
		newFiber.flags |= Placement       // this is an INSERTION
		return lastPlacedIndex
	}
}
```

And the map, verbatim apart from formatting:

```js
function mapRemainingChildren(currentFirstChild) {
	for (var existingChildren = new Map(); null !== currentFirstChild; )
		null !== currentFirstChild.key
			? existingChildren.set(currentFirstChild.key, currentFirstChild)
			: existingChildren.set(currentFirstChild.index, currentFirstChild),
			(currentFirstChild = currentFirstChild.sibling)
	return existingChildren
}
```

> Unkeyed children are stored under their **index**. That's the whole
> reason "no key" behaves exactly like `key={index}`.

## Why it works: the `lastPlacedIndex` idea

Think of the old list as positions 0…n−1. Walking the new list left to right,
React keeps the largest old index it has decided to keep in place. As long
as each reused child's old index is **increasing**, those children are
already in the right relative order and none of them has to move. The first
child whose old index is *smaller* than `lastPlacedIndex` was before
something that is now before it, so it moves.

A move is implemented as a DOM insert. In the commit, a fiber with
`Placement` is inserted with `insertBefore` its next sibling that is
**not** itself being placed (`getHostSibling`), or appended if there is none.
Inserting an already-attached node moves it.

The React source comments on the tradeoff: this algorithm "can't optimize by
searching from both ends since we don't have backpointers on fibers." A
fiber has `sibling` but no `previousSibling`, so React never walks the list
backwards.

## Child reconciliation, step by step

Notation: letters are keys, and the number in parentheses is the **old
index**. `lp` = `lastPlacedIndex` after that child.

<figure class="fig anim fig-listdiff-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Append</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Remove middle</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Prepend</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="3" aria-selected="false">First → last</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="4" aria-selected="false">Last → first</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'a', new 'a') · placeChild(…, 0)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): keys match → reuse the fiber. Old index 0 ≥ lastPlacedIndex → &lt;b&gt;stay&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;keep&quot;,&quot;n-a&quot;:&quot;keep hl&quot;,&quot;pass&quot;:&quot;on&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;unhl&quot;:{&quot;n-a&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1&quot;,&quot;lp&quot;:&quot;lastPlacedIndex = 0&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'b', new 'b') · placeChild(…, 1)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): keys match → reuse the fiber. Old index 1 ≥ lastPlacedIndex → &lt;b&gt;stay&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;n-a&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;o-b&quot;:&quot;keep&quot;,&quot;n-b&quot;:&quot;keep hl&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;unhl&quot;:{&quot;n-b&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1&quot;,&quot;lp&quot;:&quot;lastPlacedIndex = 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'c', new 'c') · placeChild(…, 2)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): keys match → reuse the fiber. Old index 2 ≥ lastPlacedIndex → &lt;b&gt;stay&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;n-b&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;o-c&quot;:&quot;keep&quot;,&quot;n-c&quot;:&quot;keep hl&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;unhl&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1&quot;,&quot;lp&quot;:&quot;lastPlacedIndex = 2&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createChild(parent, 'd') · placeChild → Placement&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 2b&lt;/b&gt;: the old list ended, so &lt;code&gt;d&lt;/code&gt; is a new fiber, flagged &lt;b&gt;Placement&lt;/b&gt; (insert).&quot;,&quot;set&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;,&quot;n-d&quot;:&quot;new hl&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;unhl&quot;:{&quot;n-d&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 2b&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitPlacement / removeChild for each flagged fiber&quot;,&quot;say&quot;:&quot;Commit applies the flags: &lt;b&gt;1 DOM operation&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;n-d&quot;:&quot;new&quot;,&quot;pass&quot;:&quot;on&quot;,&quot;d-a&quot;:&quot;keep&quot;,&quot;d-b&quot;:&quot;keep&quot;,&quot;d-c&quot;:&quot;keep&quot;,&quot;d-d&quot;:&quot;new&quot;},&quot;css&quot;:{&quot;d-a&quot;:{&quot;--x&quot;:&quot;0&quot;},&quot;d-b&quot;:{&quot;--x&quot;:&quot;1&quot;},&quot;d-c&quot;:{&quot;--x&quot;:&quot;2&quot;},&quot;d-d&quot;:{&quot;--x&quot;:&quot;3&quot;}},&quot;txt&quot;:{&quot;pass&quot;:&quot;commit&quot;}}]" data-intro="Old &lt;code&gt;[a, b, c]&lt;/code&gt; → new &lt;code&gt;[a, b, c, d]&lt;/code&gt;. Press &lt;b&gt;Play&lt;/b&gt; to run &lt;code&gt;reconcileChildrenArray&lt;/code&gt;."><div class="anim-scn-title">Append</div><div class="anim-stage"><div class="ld-scene"><div class="a-label">old fibers</div><div class="a-track"><div style="--x:0" class="an node host" data-k="o-a"><span class="node-label" data-k="o-a-label">a</span><small data-k="o-a-sub">idx 0</small></div><div style="--x:1" class="an node host" data-k="o-b"><span class="node-label" data-k="o-b-label">b</span><small data-k="o-b-sub">idx 1</small></div><div style="--x:2" class="an node host" data-k="o-c"><span class="node-label" data-k="o-c-label">c</span><small data-k="o-c-sub">idx 2</small></div></div><div class="a-label">new elements</div><div class="a-track"><div style="--x:0" class="an node el" data-k="n-a"><span class="node-label" data-k="n-a-label">a</span><small data-k="n-a-sub">#0</small></div><div style="--x:1" class="an node el" data-k="n-b"><span class="node-label" data-k="n-b-label">b</span><small data-k="n-b-sub">#1</small></div><div style="--x:2" class="an node el" data-k="n-c"><span class="node-label" data-k="n-c-label">c</span><small data-k="n-c-sub">#2</small></div><div style="--x:3" class="an node el" data-k="n-d"><span class="node-label" data-k="n-d-label">d</span><small data-k="n-d-sub">#3</small></div></div><div class="a-row" style="margin:6px 0 10px"><span class="an chip-a" data-k="pass">start</span><span class="an chip-a" data-k="lp">lastPlacedIndex = 0</span><span class="a-label" style="margin-left:6px">map</span><span class="an chip-a" data-k="m-a" data-s="ghost">a → fiber</span><span class="an chip-a" data-k="m-b" data-s="ghost">b → fiber</span><span class="an chip-a" data-k="m-c" data-s="ghost">c → fiber</span></div><div class="a-label">DOM</div><div class="a-track"><div class="an node host" data-k="d-a" style="--x:0">&lt;li&gt;a</div><div class="an node host" data-k="d-b" style="--x:1">&lt;li&gt;b</div><div class="an node host" data-k="d-c" style="--x:2">&lt;li&gt;c</div><div class="an node host" data-k="d-d" style="--x:3" data-s="ghost">&lt;li&gt;d</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'a', new 'a') · placeChild(…, 0)</code><span><b>Pass 1</b> (lockstep): keys match → reuse the fiber. Old index 0 ≥ lastPlacedIndex → <b>stay</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'b', new 'b') · placeChild(…, 1)</code><span><b>Pass 1</b> (lockstep): keys match → reuse the fiber. Old index 1 ≥ lastPlacedIndex → <b>stay</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'c', new 'c') · placeChild(…, 2)</code><span><b>Pass 1</b> (lockstep): keys match → reuse the fiber. Old index 2 ≥ lastPlacedIndex → <b>stay</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>createChild(parent, 'd') · placeChild → Placement</code><span><b>Pass 2b</b>: the old list ended, so <code>d</code> is a new fiber, flagged <b>Placement</b> (insert).</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitPlacement / removeChild for each flagged fiber</code><span>Commit applies the flags: <b>1 DOM operation</b>.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'a', new 'a') · placeChild(…, 0)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): keys match → reuse the fiber. Old index 0 ≥ lastPlacedIndex → &lt;b&gt;stay&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;keep&quot;,&quot;n-a&quot;:&quot;keep hl&quot;,&quot;pass&quot;:&quot;on&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;unhl&quot;:{&quot;n-a&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1&quot;,&quot;lp&quot;:&quot;lastPlacedIndex = 0&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'b', new 'c') → null&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): key &lt;code&gt;'c' !== 'b'&lt;/code&gt;, so the fast path breaks.&quot;,&quot;set&quot;:{&quot;n-a&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;,&quot;o-b&quot;:&quot;cmp&quot;,&quot;n-c&quot;:&quot;cmp&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;unhl&quot;:{&quot;o-b&quot;:&quot;&quot;,&quot;n-c&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1 → break&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;mapRemainingChildren(oldFiber)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 3&lt;/b&gt;: the remaining old fibers go into a &lt;code&gt;Map&lt;/code&gt; keyed by key: &lt;code&gt;b&lt;/code&gt;, &lt;code&gt;c&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;o-b&quot;:&quot;&quot;,&quot;n-c&quot;:&quot;&quot;,&quot;m-b&quot;:&quot;&quot;,&quot;m-c&quot;:&quot;&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'c') · placeChild(fiber, 0, 1)&quot;,&quot;say&quot;:&quot;&lt;code&gt;c&lt;/code&gt; found in the map → reuse its fiber. old index 2 ≥ lastPlacedIndex 0 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 2.&quot;,&quot;set&quot;:{&quot;n-c&quot;:&quot;keep hl&quot;,&quot;o-c&quot;:&quot;keep&quot;,&quot;m-c&quot;:&quot;del&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;unhl&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 2&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;existingChildren.forEach(deleteChild)&quot;,&quot;say&quot;:&quot;Leftovers in the map are deleted: &lt;code&gt;b&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;,&quot;o-b&quot;:&quot;del&quot;,&quot;m-b&quot;:&quot;del&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitPlacement / removeChild for each flagged fiber&quot;,&quot;say&quot;:&quot;Commit applies the flags: &lt;b&gt;1 DOM operation&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;pass&quot;:&quot;on&quot;,&quot;d-a&quot;:&quot;keep&quot;,&quot;d-c&quot;:&quot;keep&quot;,&quot;d-b&quot;:&quot;gone&quot;},&quot;css&quot;:{&quot;d-a&quot;:{&quot;--x&quot;:&quot;0&quot;},&quot;d-c&quot;:{&quot;--x&quot;:&quot;1&quot;}},&quot;txt&quot;:{&quot;pass&quot;:&quot;commit&quot;}}]" data-intro="Old &lt;code&gt;[a, b, c]&lt;/code&gt; → new &lt;code&gt;[a, c]&lt;/code&gt;. Press &lt;b&gt;Play&lt;/b&gt; to run &lt;code&gt;reconcileChildrenArray&lt;/code&gt;."><div class="anim-scn-title">Remove middle</div><div class="anim-stage"><div class="ld-scene"><div class="a-label">old fibers</div><div class="a-track"><div style="--x:0" class="an node host" data-k="o-a"><span class="node-label" data-k="o-a-label">a</span><small data-k="o-a-sub">idx 0</small></div><div style="--x:1" class="an node host" data-k="o-b"><span class="node-label" data-k="o-b-label">b</span><small data-k="o-b-sub">idx 1</small></div><div style="--x:2" class="an node host" data-k="o-c"><span class="node-label" data-k="o-c-label">c</span><small data-k="o-c-sub">idx 2</small></div></div><div class="a-label">new elements</div><div class="a-track"><div style="--x:0" class="an node el" data-k="n-a"><span class="node-label" data-k="n-a-label">a</span><small data-k="n-a-sub">#0</small></div><div style="--x:1" class="an node el" data-k="n-c"><span class="node-label" data-k="n-c-label">c</span><small data-k="n-c-sub">#1</small></div></div><div class="a-row" style="margin:6px 0 10px"><span class="an chip-a" data-k="pass">start</span><span class="an chip-a" data-k="lp">lastPlacedIndex = 0</span><span class="a-label" style="margin-left:6px">map</span><span class="an chip-a" data-k="m-a" data-s="ghost">a → fiber</span><span class="an chip-a" data-k="m-b" data-s="ghost">b → fiber</span><span class="an chip-a" data-k="m-c" data-s="ghost">c → fiber</span></div><div class="a-label">DOM</div><div class="a-track"><div class="an node host" data-k="d-a" style="--x:0">&lt;li&gt;a</div><div class="an node host" data-k="d-b" style="--x:1">&lt;li&gt;b</div><div class="an node host" data-k="d-c" style="--x:2">&lt;li&gt;c</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'a', new 'a') · placeChild(…, 0)</code><span><b>Pass 1</b> (lockstep): keys match → reuse the fiber. Old index 0 ≥ lastPlacedIndex → <b>stay</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'b', new 'c') → null</code><span><b>Pass 1</b> (lockstep): key <code>'c' !== 'b'</code>, so the fast path breaks.</span></li><li><span class="anim-phase ph-render">render phase</span><code>mapRemainingChildren(oldFiber)</code><span><b>Pass 3</b>: the remaining old fibers go into a <code>Map</code> keyed by key: <code>b</code>, <code>c</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'c') · placeChild(fiber, 0, 1)</code><span><code>c</code> found in the map → reuse its fiber. old index 2 ≥ lastPlacedIndex 0 → <b>stay</b>, lastPlacedIndex = 2.</span></li><li><span class="anim-phase ph-render">render phase</span><code>existingChildren.forEach(deleteChild)</code><span>Leftovers in the map are deleted: <code>b</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitPlacement / removeChild for each flagged fiber</code><span>Commit applies the flags: <b>1 DOM operation</b>.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'a', new 'x') → null&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): key &lt;code&gt;'x' !== 'a'&lt;/code&gt;, so the fast path breaks.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;cmp&quot;,&quot;n-x&quot;:&quot;cmp&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;unhl&quot;:{&quot;o-a&quot;:&quot;&quot;,&quot;n-x&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1 → break&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;mapRemainingChildren(oldFiber)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 3&lt;/b&gt;: the remaining old fibers go into a &lt;code&gt;Map&lt;/code&gt; keyed by key: &lt;code&gt;a&lt;/code&gt;, &lt;code&gt;b&lt;/code&gt;, &lt;code&gt;c&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;&quot;,&quot;n-x&quot;:&quot;&quot;,&quot;m-a&quot;:&quot;&quot;,&quot;m-b&quot;:&quot;&quot;,&quot;m-c&quot;:&quot;&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'x') → createFiberFromElement&quot;,&quot;say&quot;:&quot;&lt;code&gt;x&lt;/code&gt; isn’t in the map → new fiber, flagged &lt;b&gt;Placement&lt;/b&gt; (insert).&quot;,&quot;set&quot;:{&quot;n-x&quot;:&quot;new hl&quot;},&quot;unhl&quot;:{&quot;n-x&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'a') · placeChild(fiber, 0, 1)&quot;,&quot;say&quot;:&quot;&lt;code&gt;a&lt;/code&gt; found in the map → reuse its fiber. old index 0 ≥ lastPlacedIndex 0 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 0.&quot;,&quot;set&quot;:{&quot;n-x&quot;:&quot;new&quot;,&quot;n-a&quot;:&quot;keep hl&quot;,&quot;o-a&quot;:&quot;keep&quot;,&quot;m-a&quot;:&quot;del&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;unhl&quot;:{&quot;n-a&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 0&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'b') · placeChild(fiber, 0, 2)&quot;,&quot;say&quot;:&quot;&lt;code&gt;b&lt;/code&gt; found in the map → reuse its fiber. old index 1 ≥ lastPlacedIndex 0 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 1.&quot;,&quot;set&quot;:{&quot;n-a&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-b&quot;:&quot;keep hl&quot;,&quot;o-b&quot;:&quot;keep&quot;,&quot;m-b&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-b&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'c') · placeChild(fiber, 1, 3)&quot;,&quot;say&quot;:&quot;&lt;code&gt;c&lt;/code&gt; found in the map → reuse its fiber. old index 2 ≥ lastPlacedIndex 1 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 2.&quot;,&quot;set&quot;:{&quot;n-b&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-c&quot;:&quot;keep hl&quot;,&quot;o-c&quot;:&quot;keep&quot;,&quot;m-c&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 2&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitPlacement / removeChild for each flagged fiber&quot;,&quot;say&quot;:&quot;Commit applies the flags: &lt;b&gt;1 DOM operation&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;,&quot;pass&quot;:&quot;on&quot;,&quot;d-x&quot;:&quot;new&quot;,&quot;d-a&quot;:&quot;keep&quot;,&quot;d-b&quot;:&quot;keep&quot;,&quot;d-c&quot;:&quot;keep&quot;},&quot;css&quot;:{&quot;d-x&quot;:{&quot;--x&quot;:&quot;0&quot;},&quot;d-a&quot;:{&quot;--x&quot;:&quot;1&quot;},&quot;d-b&quot;:{&quot;--x&quot;:&quot;2&quot;},&quot;d-c&quot;:{&quot;--x&quot;:&quot;3&quot;}},&quot;txt&quot;:{&quot;pass&quot;:&quot;commit&quot;}}]" data-intro="Old &lt;code&gt;[a, b, c]&lt;/code&gt; → new &lt;code&gt;[x, a, b, c]&lt;/code&gt;. Press &lt;b&gt;Play&lt;/b&gt; to run &lt;code&gt;reconcileChildrenArray&lt;/code&gt;."><div class="anim-scn-title">Prepend</div><div class="anim-stage"><div class="ld-scene"><div class="a-label">old fibers</div><div class="a-track"><div style="--x:0" class="an node host" data-k="o-a"><span class="node-label" data-k="o-a-label">a</span><small data-k="o-a-sub">idx 0</small></div><div style="--x:1" class="an node host" data-k="o-b"><span class="node-label" data-k="o-b-label">b</span><small data-k="o-b-sub">idx 1</small></div><div style="--x:2" class="an node host" data-k="o-c"><span class="node-label" data-k="o-c-label">c</span><small data-k="o-c-sub">idx 2</small></div></div><div class="a-label">new elements</div><div class="a-track"><div style="--x:0" class="an node el" data-k="n-x"><span class="node-label" data-k="n-x-label">x</span><small data-k="n-x-sub">#0</small></div><div style="--x:1" class="an node el" data-k="n-a"><span class="node-label" data-k="n-a-label">a</span><small data-k="n-a-sub">#1</small></div><div style="--x:2" class="an node el" data-k="n-b"><span class="node-label" data-k="n-b-label">b</span><small data-k="n-b-sub">#2</small></div><div style="--x:3" class="an node el" data-k="n-c"><span class="node-label" data-k="n-c-label">c</span><small data-k="n-c-sub">#3</small></div></div><div class="a-row" style="margin:6px 0 10px"><span class="an chip-a" data-k="pass">start</span><span class="an chip-a" data-k="lp">lastPlacedIndex = 0</span><span class="a-label" style="margin-left:6px">map</span><span class="an chip-a" data-k="m-a" data-s="ghost">a → fiber</span><span class="an chip-a" data-k="m-b" data-s="ghost">b → fiber</span><span class="an chip-a" data-k="m-c" data-s="ghost">c → fiber</span></div><div class="a-label">DOM</div><div class="a-track"><div class="an node host" data-k="d-a" style="--x:0">&lt;li&gt;a</div><div class="an node host" data-k="d-b" style="--x:1">&lt;li&gt;b</div><div class="an node host" data-k="d-c" style="--x:2">&lt;li&gt;c</div><div class="an node host" data-k="d-x" style="--x:0" data-s="ghost">&lt;li&gt;x</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'a', new 'x') → null</code><span><b>Pass 1</b> (lockstep): key <code>'x' !== 'a'</code>, so the fast path breaks.</span></li><li><span class="anim-phase ph-render">render phase</span><code>mapRemainingChildren(oldFiber)</code><span><b>Pass 3</b>: the remaining old fibers go into a <code>Map</code> keyed by key: <code>a</code>, <code>b</code>, <code>c</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'x') → createFiberFromElement</code><span><code>x</code> isn’t in the map → new fiber, flagged <b>Placement</b> (insert).</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'a') · placeChild(fiber, 0, 1)</code><span><code>a</code> found in the map → reuse its fiber. old index 0 ≥ lastPlacedIndex 0 → <b>stay</b>, lastPlacedIndex = 0.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'b') · placeChild(fiber, 0, 2)</code><span><code>b</code> found in the map → reuse its fiber. old index 1 ≥ lastPlacedIndex 0 → <b>stay</b>, lastPlacedIndex = 1.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'c') · placeChild(fiber, 1, 3)</code><span><code>c</code> found in the map → reuse its fiber. old index 2 ≥ lastPlacedIndex 1 → <b>stay</b>, lastPlacedIndex = 2.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitPlacement / removeChild for each flagged fiber</code><span>Commit applies the flags: <b>1 DOM operation</b>.</span></li></ol></div><div class="anim-scn" data-anim-scn="3" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'a', new 'b') → null&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): key &lt;code&gt;'b' !== 'a'&lt;/code&gt;, so the fast path breaks.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;cmp&quot;,&quot;n-b&quot;:&quot;cmp&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;unhl&quot;:{&quot;o-a&quot;:&quot;&quot;,&quot;n-b&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1 → break&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;mapRemainingChildren(oldFiber)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 3&lt;/b&gt;: the remaining old fibers go into a &lt;code&gt;Map&lt;/code&gt; keyed by key: &lt;code&gt;a&lt;/code&gt;, &lt;code&gt;b&lt;/code&gt;, &lt;code&gt;c&lt;/code&gt;, &lt;code&gt;d&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;&quot;,&quot;n-b&quot;:&quot;&quot;,&quot;m-a&quot;:&quot;&quot;,&quot;m-b&quot;:&quot;&quot;,&quot;m-c&quot;:&quot;&quot;,&quot;m-d&quot;:&quot;&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'b') · placeChild(fiber, 0, 0)&quot;,&quot;say&quot;:&quot;&lt;code&gt;b&lt;/code&gt; found in the map → reuse its fiber. old index 1 ≥ lastPlacedIndex 0 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 1.&quot;,&quot;set&quot;:{&quot;n-b&quot;:&quot;keep hl&quot;,&quot;o-b&quot;:&quot;keep&quot;,&quot;m-b&quot;:&quot;del&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;unhl&quot;:{&quot;n-b&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'c') · placeChild(fiber, 1, 1)&quot;,&quot;say&quot;:&quot;&lt;code&gt;c&lt;/code&gt; found in the map → reuse its fiber. old index 2 ≥ lastPlacedIndex 1 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 2.&quot;,&quot;set&quot;:{&quot;n-b&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-c&quot;:&quot;keep hl&quot;,&quot;o-c&quot;:&quot;keep&quot;,&quot;m-c&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 2&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'd') · placeChild(fiber, 2, 2)&quot;,&quot;say&quot;:&quot;&lt;code&gt;d&lt;/code&gt; found in the map → reuse its fiber. old index 3 ≥ lastPlacedIndex 2 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 3.&quot;,&quot;set&quot;:{&quot;n-c&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-d&quot;:&quot;keep hl&quot;,&quot;o-d&quot;:&quot;keep&quot;,&quot;m-d&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-d&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'a') · placeChild(fiber, 3, 3)&quot;,&quot;say&quot;:&quot;&lt;code&gt;a&lt;/code&gt; found in the map → reuse its fiber. old index 0 &amp;lt; lastPlacedIndex 3 → &lt;b&gt;move&lt;/b&gt; (Placement).&quot;,&quot;set&quot;:{&quot;n-d&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-a&quot;:&quot;upd hl&quot;,&quot;o-a&quot;:&quot;keep&quot;,&quot;m-a&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-a&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 3&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitPlacement / removeChild for each flagged fiber&quot;,&quot;say&quot;:&quot;Commit applies the flags: &lt;b&gt;1 DOM operation&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;n-a&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;&quot;,&quot;pass&quot;:&quot;on&quot;,&quot;d-b&quot;:&quot;keep&quot;,&quot;d-c&quot;:&quot;keep&quot;,&quot;d-d&quot;:&quot;keep&quot;,&quot;d-a&quot;:&quot;upd&quot;},&quot;css&quot;:{&quot;d-b&quot;:{&quot;--x&quot;:&quot;0&quot;},&quot;d-c&quot;:{&quot;--x&quot;:&quot;1&quot;},&quot;d-d&quot;:{&quot;--x&quot;:&quot;2&quot;},&quot;d-a&quot;:{&quot;--x&quot;:&quot;3&quot;}},&quot;txt&quot;:{&quot;pass&quot;:&quot;commit&quot;}}]" data-intro="Old &lt;code&gt;[a, b, c, d]&lt;/code&gt; → new &lt;code&gt;[b, c, d, a]&lt;/code&gt;. Press &lt;b&gt;Play&lt;/b&gt; to run &lt;code&gt;reconcileChildrenArray&lt;/code&gt;."><div class="anim-scn-title">First → last</div><div class="anim-stage"><div class="ld-scene"><div class="a-label">old fibers</div><div class="a-track"><div style="--x:0" class="an node host" data-k="o-a"><span class="node-label" data-k="o-a-label">a</span><small data-k="o-a-sub">idx 0</small></div><div style="--x:1" class="an node host" data-k="o-b"><span class="node-label" data-k="o-b-label">b</span><small data-k="o-b-sub">idx 1</small></div><div style="--x:2" class="an node host" data-k="o-c"><span class="node-label" data-k="o-c-label">c</span><small data-k="o-c-sub">idx 2</small></div><div style="--x:3" class="an node host" data-k="o-d"><span class="node-label" data-k="o-d-label">d</span><small data-k="o-d-sub">idx 3</small></div></div><div class="a-label">new elements</div><div class="a-track"><div style="--x:0" class="an node el" data-k="n-b"><span class="node-label" data-k="n-b-label">b</span><small data-k="n-b-sub">#0</small></div><div style="--x:1" class="an node el" data-k="n-c"><span class="node-label" data-k="n-c-label">c</span><small data-k="n-c-sub">#1</small></div><div style="--x:2" class="an node el" data-k="n-d"><span class="node-label" data-k="n-d-label">d</span><small data-k="n-d-sub">#2</small></div><div style="--x:3" class="an node el" data-k="n-a"><span class="node-label" data-k="n-a-label">a</span><small data-k="n-a-sub">#3</small></div></div><div class="a-row" style="margin:6px 0 10px"><span class="an chip-a" data-k="pass">start</span><span class="an chip-a" data-k="lp">lastPlacedIndex = 0</span><span class="a-label" style="margin-left:6px">map</span><span class="an chip-a" data-k="m-a" data-s="ghost">a → fiber</span><span class="an chip-a" data-k="m-b" data-s="ghost">b → fiber</span><span class="an chip-a" data-k="m-c" data-s="ghost">c → fiber</span><span class="an chip-a" data-k="m-d" data-s="ghost">d → fiber</span></div><div class="a-label">DOM</div><div class="a-track"><div class="an node host" data-k="d-a" style="--x:0">&lt;li&gt;a</div><div class="an node host" data-k="d-b" style="--x:1">&lt;li&gt;b</div><div class="an node host" data-k="d-c" style="--x:2">&lt;li&gt;c</div><div class="an node host" data-k="d-d" style="--x:3">&lt;li&gt;d</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'a', new 'b') → null</code><span><b>Pass 1</b> (lockstep): key <code>'b' !== 'a'</code>, so the fast path breaks.</span></li><li><span class="anim-phase ph-render">render phase</span><code>mapRemainingChildren(oldFiber)</code><span><b>Pass 3</b>: the remaining old fibers go into a <code>Map</code> keyed by key: <code>a</code>, <code>b</code>, <code>c</code>, <code>d</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'b') · placeChild(fiber, 0, 0)</code><span><code>b</code> found in the map → reuse its fiber. old index 1 ≥ lastPlacedIndex 0 → <b>stay</b>, lastPlacedIndex = 1.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'c') · placeChild(fiber, 1, 1)</code><span><code>c</code> found in the map → reuse its fiber. old index 2 ≥ lastPlacedIndex 1 → <b>stay</b>, lastPlacedIndex = 2.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'd') · placeChild(fiber, 2, 2)</code><span><code>d</code> found in the map → reuse its fiber. old index 3 ≥ lastPlacedIndex 2 → <b>stay</b>, lastPlacedIndex = 3.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'a') · placeChild(fiber, 3, 3)</code><span><code>a</code> found in the map → reuse its fiber. old index 0 &lt; lastPlacedIndex 3 → <b>move</b> (Placement).</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitPlacement / removeChild for each flagged fiber</code><span>Commit applies the flags: <b>1 DOM operation</b>.</span></li></ol></div><div class="anim-scn" data-anim-scn="4" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(old 'a', new 'd') → null&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 1&lt;/b&gt; (lockstep): key &lt;code&gt;'d' !== 'a'&lt;/code&gt;, so the fast path breaks.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;cmp&quot;,&quot;n-d&quot;:&quot;cmp&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;unhl&quot;:{&quot;o-a&quot;:&quot;&quot;,&quot;n-d&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1 → break&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;mapRemainingChildren(oldFiber)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Pass 3&lt;/b&gt;: the remaining old fibers go into a &lt;code&gt;Map&lt;/code&gt; keyed by key: &lt;code&gt;a&lt;/code&gt;, &lt;code&gt;b&lt;/code&gt;, &lt;code&gt;c&lt;/code&gt;, &lt;code&gt;d&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;o-a&quot;:&quot;&quot;,&quot;n-d&quot;:&quot;&quot;,&quot;m-a&quot;:&quot;&quot;,&quot;m-b&quot;:&quot;&quot;,&quot;m-c&quot;:&quot;&quot;,&quot;m-d&quot;:&quot;&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'd') · placeChild(fiber, 0, 0)&quot;,&quot;say&quot;:&quot;&lt;code&gt;d&lt;/code&gt; found in the map → reuse its fiber. old index 3 ≥ lastPlacedIndex 0 → &lt;b&gt;stay&lt;/b&gt;, lastPlacedIndex = 3.&quot;,&quot;set&quot;:{&quot;n-d&quot;:&quot;keep hl&quot;,&quot;o-d&quot;:&quot;keep&quot;,&quot;m-d&quot;:&quot;del&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;unhl&quot;:{&quot;n-d&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'a') · placeChild(fiber, 3, 1)&quot;,&quot;say&quot;:&quot;&lt;code&gt;a&lt;/code&gt; found in the map → reuse its fiber. old index 0 &amp;lt; lastPlacedIndex 3 → &lt;b&gt;move&lt;/b&gt; (Placement).&quot;,&quot;set&quot;:{&quot;n-d&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-a&quot;:&quot;upd hl&quot;,&quot;o-a&quot;:&quot;keep&quot;,&quot;m-a&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-a&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'b') · placeChild(fiber, 3, 2)&quot;,&quot;say&quot;:&quot;&lt;code&gt;b&lt;/code&gt; found in the map → reuse its fiber. old index 1 &amp;lt; lastPlacedIndex 3 → &lt;b&gt;move&lt;/b&gt; (Placement).&quot;,&quot;set&quot;:{&quot;n-a&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-b&quot;:&quot;upd hl&quot;,&quot;o-b&quot;:&quot;keep&quot;,&quot;m-b&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-b&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap(map, 'c') · placeChild(fiber, 3, 3)&quot;,&quot;say&quot;:&quot;&lt;code&gt;c&lt;/code&gt; found in the map → reuse its fiber. old index 2 &amp;lt; lastPlacedIndex 3 → &lt;b&gt;move&lt;/b&gt; (Placement).&quot;,&quot;set&quot;:{&quot;n-b&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;upd&quot;,&quot;n-c&quot;:&quot;upd hl&quot;,&quot;o-c&quot;:&quot;keep&quot;,&quot;m-c&quot;:&quot;del&quot;},&quot;unhl&quot;:{&quot;n-c&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 3&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitPlacement / removeChild for each flagged fiber&quot;,&quot;say&quot;:&quot;Commit applies the flags: &lt;b&gt;3 DOM operations&lt;/b&gt;. Moving just one item would have been enough: this is the worst case of the left-to-right heuristic.&quot;,&quot;set&quot;:{&quot;n-c&quot;:&quot;upd&quot;,&quot;lp&quot;:&quot;&quot;,&quot;pass&quot;:&quot;on&quot;,&quot;d-d&quot;:&quot;keep&quot;,&quot;d-a&quot;:&quot;upd&quot;,&quot;d-b&quot;:&quot;upd&quot;,&quot;d-c&quot;:&quot;upd&quot;},&quot;css&quot;:{&quot;d-d&quot;:{&quot;--x&quot;:&quot;0&quot;},&quot;d-a&quot;:{&quot;--x&quot;:&quot;1&quot;},&quot;d-b&quot;:{&quot;--x&quot;:&quot;2&quot;},&quot;d-c&quot;:{&quot;--x&quot;:&quot;3&quot;}},&quot;txt&quot;:{&quot;pass&quot;:&quot;commit&quot;}}]" data-intro="Old &lt;code&gt;[a, b, c, d]&lt;/code&gt; → new &lt;code&gt;[d, a, b, c]&lt;/code&gt;. Press &lt;b&gt;Play&lt;/b&gt; to run &lt;code&gt;reconcileChildrenArray&lt;/code&gt;."><div class="anim-scn-title">Last → first</div><div class="anim-stage"><div class="ld-scene"><div class="a-label">old fibers</div><div class="a-track"><div style="--x:0" class="an node host" data-k="o-a"><span class="node-label" data-k="o-a-label">a</span><small data-k="o-a-sub">idx 0</small></div><div style="--x:1" class="an node host" data-k="o-b"><span class="node-label" data-k="o-b-label">b</span><small data-k="o-b-sub">idx 1</small></div><div style="--x:2" class="an node host" data-k="o-c"><span class="node-label" data-k="o-c-label">c</span><small data-k="o-c-sub">idx 2</small></div><div style="--x:3" class="an node host" data-k="o-d"><span class="node-label" data-k="o-d-label">d</span><small data-k="o-d-sub">idx 3</small></div></div><div class="a-label">new elements</div><div class="a-track"><div style="--x:0" class="an node el" data-k="n-d"><span class="node-label" data-k="n-d-label">d</span><small data-k="n-d-sub">#0</small></div><div style="--x:1" class="an node el" data-k="n-a"><span class="node-label" data-k="n-a-label">a</span><small data-k="n-a-sub">#1</small></div><div style="--x:2" class="an node el" data-k="n-b"><span class="node-label" data-k="n-b-label">b</span><small data-k="n-b-sub">#2</small></div><div style="--x:3" class="an node el" data-k="n-c"><span class="node-label" data-k="n-c-label">c</span><small data-k="n-c-sub">#3</small></div></div><div class="a-row" style="margin:6px 0 10px"><span class="an chip-a" data-k="pass">start</span><span class="an chip-a" data-k="lp">lastPlacedIndex = 0</span><span class="a-label" style="margin-left:6px">map</span><span class="an chip-a" data-k="m-a" data-s="ghost">a → fiber</span><span class="an chip-a" data-k="m-b" data-s="ghost">b → fiber</span><span class="an chip-a" data-k="m-c" data-s="ghost">c → fiber</span><span class="an chip-a" data-k="m-d" data-s="ghost">d → fiber</span></div><div class="a-label">DOM</div><div class="a-track"><div class="an node host" data-k="d-a" style="--x:0">&lt;li&gt;a</div><div class="an node host" data-k="d-b" style="--x:1">&lt;li&gt;b</div><div class="an node host" data-k="d-c" style="--x:2">&lt;li&gt;c</div><div class="an node host" data-k="d-d" style="--x:3">&lt;li&gt;d</div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(old 'a', new 'd') → null</code><span><b>Pass 1</b> (lockstep): key <code>'d' !== 'a'</code>, so the fast path breaks.</span></li><li><span class="anim-phase ph-render">render phase</span><code>mapRemainingChildren(oldFiber)</code><span><b>Pass 3</b>: the remaining old fibers go into a <code>Map</code> keyed by key: <code>a</code>, <code>b</code>, <code>c</code>, <code>d</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'd') · placeChild(fiber, 0, 0)</code><span><code>d</code> found in the map → reuse its fiber. old index 3 ≥ lastPlacedIndex 0 → <b>stay</b>, lastPlacedIndex = 3.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'a') · placeChild(fiber, 3, 1)</code><span><code>a</code> found in the map → reuse its fiber. old index 0 &lt; lastPlacedIndex 3 → <b>move</b> (Placement).</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'b') · placeChild(fiber, 3, 2)</code><span><code>b</code> found in the map → reuse its fiber. old index 1 &lt; lastPlacedIndex 3 → <b>move</b> (Placement).</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap(map, 'c') · placeChild(fiber, 3, 3)</code><span><code>c</code> found in the map → reuse its fiber. old index 2 &lt; lastPlacedIndex 3 → <b>move</b> (Placement).</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitPlacement / removeChild for each flagged fiber</code><span>Commit applies the flags: <b>3 DOM operations</b>. Moving just one item would have been enough: this is the worst case of the left-to-right heuristic.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="cmp"></i>being compared</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="del"></i>deleted</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Colors: <b>yellow</b> stay, <b>orange</b> move, <b>green</b> insert, <b>pink</b> delete. A reused fiber moves only if its old index is smaller than <code>lastPlacedIndex</code>.</figcaption></figure>

### Append: `[a, b, c]` → `[a, b, c, d]`

| Pass | New child | Match | Old idx | `lp` | Result |
|---|---|---|---|---|---|
| 1 | a | a | 0 | 0 | stay |
| 1 | b | b | 1 | 1 | stay |
| 1 | c | c | 2 | 2 | stay |
| 2b | d | – | – | 2 | **insert** |

1 DOM operation. The fast path handles it.

### Remove from the middle: `[a, b, c]` → `[a, c]`

| Pass | New child | Match | Old idx | `lp` | Result |
|---|---|---|---|---|---|
| 1 | a | a | 0 | 0 | stay |
| 1 | c | key ≠ b | – | – | break → pass 3, map = {b, c} |
| 3 | c | c | 2 | 2 | stay |
| end | – | b left in map | – | – | **delete b** |

1 DOM operation.

### Prepend: `[a, b, c]` → `[x, a, b, c]`

| Pass | New child | Match | Old idx | `lp` | Result |
|---|---|---|---|---|---|
| 1 | x | key ≠ a | – | – | break → pass 3, map = {a, b, c} |
| 3 | x | – | – | 0 | **insert** (before `a`) |
| 3 | a | a | 0 | 0 | stay |
| 3 | b | b | 1 | 1 | stay |
| 3 | c | c | 2 | 2 | stay |

1 DOM operation. With **index keys** the same change becomes: key 0 matches
old key 0 (the `a` fiber) → updated to show x, key 1 → shows a, key 2 →
shows b, and key 3 is inserted to show c. That's 3 updates and 1 insert, and
all local state is shifted by one row.

### Move first to last: `[a, b, c, d]` → `[b, c, d, a]`

| Pass | New child | Old idx | `lp` | Result |
|---|---|---|---|---|
| 1 | b | key ≠ a | – | break, map all |
| 3 | b | 1 | 1 | stay |
| 3 | c | 2 | 2 | stay |
| 3 | d | 3 | 3 | stay |
| 3 | a | 0 < 3 | 3 | **move** |

1 move.

### Move last to first: `[a, b, c, d]` → `[d, a, b, c]`

| Pass | New child | Old idx | `lp` | Result |
|---|---|---|---|---|
| 1 | d | key ≠ a | – | break, map all |
| 3 | d | 3 | 3 | stay |
| 3 | a | 0 < 3 | 3 | **move** |
| 3 | b | 1 < 3 | 3 | **move** |
| 3 | c | 2 < 3 | 3 | **move** |

3 moves, although moving `d` alone would do. This is the known worst case:
because React commits to "stay" greedily from the left, bringing an item from
the end to the front moves everything else.

> In practice this rarely matters. Moves are cheap next to rendering, and
> the fibers (and their state) are all reused either way. It matters for
> things that are sensitive to DOM moves: an `<iframe>` or `<video>` that
> restarts when moved, CSS transitions, or focus. If you have a list where
> items often jump to the top, the moved items are the ones that lose
> iframe/video state.

## How other frameworks differ

Vue 3 (and Inferno before it) also trims the matching prefix, but it trims
the matching **suffix** too, because its virtual nodes live in arrays that
can be indexed from both ends. For the middle it computes the **longest
increasing subsequence** of old indices, which is exactly the largest set of
nodes that can stay, and moves only the rest. That's optimal in moves at
O(n log n). React's greedy `lastPlacedIndex` is a cheap approximation of the
same idea: it keeps an increasing subsequence, just not necessarily the
longest one.

## Rules and caveats

- **Give dynamic lists stable, unique keys from the data** (`id`), never
  `Math.random()` (every item remounts every render) and not the index
  unless the list never reorders or inserts.
- **Keys only need to be unique among siblings.** They're compared within one
  parent's children.
- **Same key and different type is not a match.** The old fiber is deleted
  and a new one created.
- **Duplicate keys** trigger a dev warning (`warnOnInvalidKey`). The second
  one behaves unpredictably because the `Map` holds only one fiber per key.
- **Fragments and nested arrays are separate lists.** `[<A/>, [<B/>, <C/>]]`
  reconciles the inner array as its own child with its own index.

### Sources
- React 19.2.5 source: `react-dom-client.development.js` (`reconcileChildrenArray`, `updateSlot`, `updateElement`, `mapRemainingChildren`, `placeChild`, `useFiber`)
- [React source: `ReactChildFiber.js`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactChildFiber.js) (unminified, with comments)
- [Legacy React docs: Reconciliation, Keys](https://legacy.reactjs.org/docs/reconciliation.html#keys)
