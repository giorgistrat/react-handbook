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

<figure class="fig fig-listdiff"><div class="listdiff" data-tabs><div class="btn-row tabs"><button type="button" class="btn " data-tab="0">Append</button><button type="button" class="btn btn-ghost" data-tab="1">Remove middle</button><button type="button" class="btn btn-ghost" data-tab="2">Prepend</button><button type="button" class="btn btn-ghost" data-tab="3">First → last</button><button type="button" class="btn btn-ghost" data-tab="4">Last → first</button></div><div class="ld-panel" data-panel="0" ><div class="ld-row"><span class="ld-label">old</span><span class="ld-chip ">a<sub>0</sub></span><span class="ld-chip ">b<sub>1</sub></span><span class="ld-chip ">c<sub>2</sub></span></div><div class="ld-row"><span class="ld-label">new</span><span class="ld-chip op-stay">a<sub>0</sub><em>stay</em><small>lp 0</small></span><span class="ld-chip op-stay">b<sub>1</sub><em>stay</em><small>lp 1</small></span><span class="ld-chip op-stay">c<sub>2</sub><em>stay</em><small>lp 2</small></span><span class="ld-chip op-insert">d<em>insert</em><small>lp 2</small></span></div><p class="ld-note">1 DOM operation. The lockstep fast path handles it.</p></div><div class="ld-panel" data-panel="1" hidden><div class="ld-row"><span class="ld-label">old</span><span class="ld-chip ">a<sub>0</sub></span><span class="ld-chip op-delete">b<sub>1</sub></span><span class="ld-chip ">c<sub>2</sub></span></div><div class="ld-row"><span class="ld-label">new</span><span class="ld-chip op-stay">a<sub>0</sub><em>stay</em><small>lp 0</small></span><span class="ld-chip op-stay">c<sub>2</sub><em>stay</em><small>lp 2</small></span></div><p class="ld-note">1 DOM operation: b is left in the map and deleted.</p></div><div class="ld-panel" data-panel="2" hidden><div class="ld-row"><span class="ld-label">old</span><span class="ld-chip ">a<sub>0</sub></span><span class="ld-chip ">b<sub>1</sub></span><span class="ld-chip ">c<sub>2</sub></span></div><div class="ld-row"><span class="ld-label">new</span><span class="ld-chip op-insert">x<em>insert</em><small>lp 0</small></span><span class="ld-chip op-stay">a<sub>0</sub><em>stay</em><small>lp 0</small></span><span class="ld-chip op-stay">b<sub>1</sub><em>stay</em><small>lp 1</small></span><span class="ld-chip op-stay">c<sub>2</sub><em>stay</em><small>lp 2</small></span></div><p class="ld-note">1 DOM operation. With index keys it would be 3 updates + 1 insert.</p></div><div class="ld-panel" data-panel="3" hidden><div class="ld-row"><span class="ld-label">old</span><span class="ld-chip ">a<sub>0</sub></span><span class="ld-chip ">b<sub>1</sub></span><span class="ld-chip ">c<sub>2</sub></span><span class="ld-chip ">d<sub>3</sub></span></div><div class="ld-row"><span class="ld-label">new</span><span class="ld-chip op-stay">b<sub>1</sub><em>stay</em><small>lp 1</small></span><span class="ld-chip op-stay">c<sub>2</sub><em>stay</em><small>lp 2</small></span><span class="ld-chip op-stay">d<sub>3</sub><em>stay</em><small>lp 3</small></span><span class="ld-chip op-move">a<sub>0</sub><em>move</em><small>lp 3</small></span></div><p class="ld-note">1 move: a’s old index 0 < lastPlacedIndex 3.</p></div><div class="ld-panel" data-panel="4" hidden><div class="ld-row"><span class="ld-label">old</span><span class="ld-chip ">a<sub>0</sub></span><span class="ld-chip ">b<sub>1</sub></span><span class="ld-chip ">c<sub>2</sub></span><span class="ld-chip ">d<sub>3</sub></span></div><div class="ld-row"><span class="ld-label">new</span><span class="ld-chip op-stay">d<sub>3</sub><em>stay</em><small>lp 3</small></span><span class="ld-chip op-move">a<sub>0</sub><em>move</em><small>lp 3</small></span><span class="ld-chip op-move">b<sub>1</sub><em>move</em><small>lp 3</small></span><span class="ld-chip op-move">c<sub>2</sub><em>move</em><small>lp 3</small></span></div><p class="ld-note">3 moves, though moving d alone would do. The known worst case.</p></div><div class="legend"><span><i class="sw op-stay"></i>stay</span><span><i class="sw op-insert"></i>insert</span><span><i class="sw op-move"></i>move</span><span><i class="sw op-delete"></i>delete</span></div></div><figcaption>Subscript = old index, <code>lp</code> = <code>lastPlacedIndex</code> after that child. An old index smaller than <code>lp</code> means “move”.</figcaption></figure>

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
