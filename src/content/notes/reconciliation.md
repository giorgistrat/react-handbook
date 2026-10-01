---
title: "Reconciliation"
slug: "reconciliation"
order: 2
level: "must"
illus: "diff"
summary: "The O(n³) → O(n) heuristics (type and key), and why state is tied to position in the tree."
source: "https://legacy.reactjs.org/docs/reconciliation.html"
---


> Notes from the legacy React docs page [Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html),
> react.dev's [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state),
> and the React 19.2 source (`updateElement`, `updateSlot`, `useFiber`).
> Part of [React Internals](../../). It follows [Render and Commit](../render-and-commit/), and the list
> algorithm itself is in [Child Reconciliation Algorithm](../child-reconciliation-algorithm/). My own notes and
> clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>What is reconciliation?</summary>

The process of comparing the elements a component just returned with what
React rendered last time, to decide which fibers (and DOM nodes) to keep,
update, create or destroy. The fiber architecture doc defines it as "the
algorithm React uses to diff one tree with another to determine which parts
need to be changed." It happens in the render phase. The DOM changes it
decides on are applied later, in the commit.

</details>

<details class="qa"><summary>Why doesn't React use an optimal tree-diff algorithm?</summary>

The best general algorithms for turning one tree into another are
**O(n³)**. The legacy docs note that for 1,000 elements that's on the order
of a billion comparisons. React uses an **O(n)** heuristic instead, based on
two assumptions that hold for real UIs.

</details>

<details class="qa"><summary>What are those two assumptions?</summary>

(1) "Two elements of different types will produce different trees", so a
type change replaces the whole subtree without comparing inside it. (2) "The
developer can hint at which child elements may be stable across different
renders with a `key` prop."

</details>

<details class="qa"><summary>How does React decide whether a component keeps its state?</summary>

By **position in the tree** plus **type** plus **key**. The same component
type at the same position (with the same key) keeps its fiber, and therefore
its state. Change any of the three and React unmounts the old one and mounts
a fresh one. In our example, `<Chat key={to.id} />` resets the draft message
when you switch contacts.

</details>

<details class="qa"><summary>Why should you never define a component inside another component?</summary>

Every render creates a **new function**, so the element's `type` is a
different value each time. React sees a different type at the same position
and remounts the subtree, losing its state and DOM, on every render.

</details>

## The problem: diffing two trees is expensive

A component returns a tree of elements. On the next render it returns
another. React has to turn "old tree" into "new tree" with as few DOM
operations as possible. Solving that minimum edit distance between two
arbitrary trees is O(n³), which the legacy docs call "far too expensive". A
UI with 1,000 elements would take about a billion comparisons per update.

React gives up on finding the *minimal* set of edits and settles for a
*good-enough* one found in a **single top-down pass**. Each node is compared
only with the node at the same position in the previous tree. React never
searches the tree to see whether a subtree moved somewhere else. That makes
it O(n), and two rules make the result good in practice.

## Rule 1: different type → throw away the subtree

When an element at a position has a different `type` than last time, React
does not try to match up the children. The legacy docs: "Whenever the root
elements have different types, React will tear down the old tree and build
the new tree from scratch."

<figure class="fig fig-type-change"><div class="before-after"><div class="mini-tree"><div class="mt-node mt-host">&lt;div&gt;</div><div class="mt-edge"></div><div class="mt-node mt-comp gone">&lt;Counter /&gt;<small>count: 3</small></div><span class="chip chip-bad">unmounted</span></div><div class="ba-arrow">→</div><div class="mini-tree"><div class="mt-node mt-host">&lt;span&gt;</div><div class="mt-edge"></div><div class="mt-node mt-comp fresh">&lt;Counter /&gt;<small>count: 0</small></div><span class="chip chip-good">fresh mount</span></div></div><figcaption>Different type at the same position → React throws the old subtree away, state included.</figcaption></figure>

```tsx
// before                 // after
<div>                     <span>
	<Counter />               <Counter />
</div>                    </span>
```

`Counter` looks identical, but its parent changed from `div` to `span`, so
the old `Counter` is **unmounted**, meaning its state is destroyed and its
effect cleanups run. A brand-new `Counter` is mounted. The same happens for
component types: `<Article />` → `<Comment />` at the same spot remounts.

In the source this is the check in `updateElement` (for list children) and
`reconcileSingleElement` (for a single child, inlined into
`reconcileChildFibersImpl` in the build), in simplified form:

```js
if (current !== null && current.elementType === element.type) {
	// same type: reuse the fiber (and its state and DOM node), only props change
	const existing = useFiber(current, element.props)
	existing.return = returnFiber
	return existing
}
// different type (or nothing there before): create a new fiber
const created = createFiberFromElement(element, returnFiber.mode, lanes)
created.return = returnFiber
return created
```

`useFiber` calls `createWorkInProgress(current, pendingProps)`, which returns
the **alternate** of the existing fiber with the new props. That's why state
survives: the hooks list lives on the fiber (see [React Fiber](../react-fiber/) and
[Hooks Under the Hood](../hooks-under-the-hood/)).

## Rule 2: same type → keep it and update

**Same host element** (`<div>` → `<div>`): the fiber and its DOM node are
kept. The render phase flags the fiber `Update` if it got a new props object.
The commit (`commitUpdate`) then compares old and new props and touches only
the attributes that changed. The legacy docs' example: going from
`<div className="before" title="stuff" />` to
`<div className="after" title="stuff" />`, "React knows to only modify the
`className` on the underlying DOM node." For `style`, only the changed style
properties are updated.

**Same component type**: the fiber is kept, so hooks and state are
preserved. React calls the component with the new props (unless it can bail
out, see [The Work Loop](../the-work-loop/)) and then reconciles its output against the old
children, going down level by level.

## Rule 3: keys identify children in a list

When a fiber has several children, React has to pair each new child with an
old one. Without keys it pairs them **by index**. The legacy docs' example
shows why that breaks when inserting at the front:

<figure class="fig fig-keys"><div class="versus"><div class="vs-card"><h5>No keys → matched by index</h5><ul class="rows"><li class="op-update"><span class="k">0</span>Connecticut<span class="op">update</span></li><li class="op-update"><span class="k">1</span>Duke<span class="op">update</span></li><li class="op-insert"><span class="k">2</span>Villanova<span class="op">insert</span></li></ul></div><div class="vs-card"><h5>With keys → matched by key</h5><ul class="rows"><li class="op-insert"><span class="k">conn</span>Connecticut<span class="op">insert</span></li><li class="op-keep"><span class="k">duke</span>Duke<span class="op">keep</span></li><li class="op-keep"><span class="k">vill</span>Villanova<span class="op">keep</span></li></ul></div></div><figcaption>Inserting at the front: by index every row is touched; by key the existing rows are kept.</figcaption></figure>

```tsx
<ul>                           <ul>
	<li>Duke</li>                  <li>Connecticut</li>   ← index 0: "Duke" fiber, text changed
	<li>Villanova</li>             <li>Duke</li>          ← index 1: "Villanova" fiber, text changed
</ul>                            <li>Villanova</li>     ← index 2: new fiber
                               </ul>
```

"React will mutate every child instead of realizing it can keep the `<li>Duke</li>`
and `<li>Villanova</li>` subtrees intact." With `key`s, React matches
children by key instead, so it keeps both existing items and inserts one new
node. The exact matching algorithm (a fast path in order, then a `Map` of the
remaining keys, then deciding which nodes have to move) is covered in
[Child Reconciliation Algorithm](../child-reconciliation-algorithm/).

react.dev adds that keys are local: "Keys are not globally unique. They only
specify the position *within the parent*."

## What this means for your code: state is tied to position

react.dev's rule: "React keeps track of which state belongs to which
component based on their place in the UI tree." A few consequences follow
from that.

**It's the tree position, not where the JSX is written.** These two
branches render `Counter` at the same position (first child of a `div`), so
state is **preserved** when `isFancy` flips:

```tsx
if (isFancy) {
	return (
		<div>
			<Counter isFancy={true} />
		</div>
	)
}
return (
	<div>
		<Counter isFancy={false} />
	</div>
)
```

react.dev: "It's the position in the UI tree—not in the JSX markup—that
matters to React!"

**Different type at the same position resets state:**

```tsx
{isPaused ? <p>See you later!</p> : <Counter />}
```

**Two ways to force a reset** when the same component shows different
things:

```tsx
// 1. different positions: two separate slots, only one filled at a time
{isPlayerA && <Counter person="Taylor" />}
{!isPlayerA && <Counter person="Sarah" />}

// 2. different keys at the same position
{isPlayerA ? (
	<Counter key="Taylor" person="Taylor" />
) : (
	<Counter key="Sarah" person="Sarah" />
)}
```

> Option 1 works because `{cond && <X/>}` leaves a `false` hole in the
> children array. The two counters are children #0 and #1, never the same
> index. That's also why conditional rendering with `&&` doesn't shift the
> positions of siblings that come after it.

**Components defined inside components remount every render:**

```tsx
function MyComponent() {
	function MyTextField() {   // a NEW function on every render of MyComponent
		const [text, setText] = useState('')
		return <input value={text} onChange={(e) => setText(e.target.value)} />
	}
	return <MyTextField />
}
```

`element.type` is a new function each time, so `current.elementType ===
element.type` is false and Rule 1 applies. The input loses its text and focus
on every keystroke. Define components at module level.

## Reconciliation, step by step

`App` re-renders after `setShowBanner(false)`:

```tsx
// previous render                // this render
<main>                            <main>
	<Banner />                        {false}
	<Header title="Hi" />             <Header title="Hi!" />
	<ul>                              <ul>
		<li key="a">A</li>                <li key="b">B</li>
		<li key="b">B</li>                <li key="a">A</li>
	</ul>                             </ul>
</main>                           </main>
```

| Position | Old | New | Decision |
|---|---|---|---|
| `main` | `main` | `main` | same type → reuse fiber and DOM node, reconcile children |
| `main` › #0 | `Banner` | `false` | nothing to render → **delete** `Banner` (unmount, effect cleanups) |
| `main` › #1 | `Header` | `Header` | same type → reuse fiber and state, call `Header` with new props |
| `main` › #2 | `ul` | `ul` | same type → reuse, reconcile keyed children |
| `ul` › keys | `a, b` | `b, a` | both keys found → reuse both fibers. One of them gets a **Placement** (move) flag. See [Child Reconciliation Algorithm](../child-reconciliation-algorithm/) |

The render phase only *records* these decisions as flags (`ChildDeletion`,
`Placement`, `Update`). The commit phase applies them
([Commit Phase and Effects](../commit-phase-and-effects/)).

## Rules and caveats

- **Type identity matters.** Don't create components (or `memo`/`lazy`
  wrappers) during render. Hoist them to module scope.
- **Keys must be stable, predictable and unique among siblings.** The legacy
  docs warn that unstable keys "(like those produced by `Math.random()`)
  will cause many component instances and DOM nodes to be unnecessarily
  recreated, which can cause performance degradation and lost state in child
  components."
- **Index keys are fine only for static lists.** If items are inserted,
  removed or reordered, state and DOM (inputs, focus) stick to the wrong item.
- **Use `key` to reset on purpose.** `<Profile key={userId} />` is the
  idiomatic way to discard all state when the identity changes, instead of
  syncing it in an effect.
- **Wrapping changes the position.** Adding a `<div>` or a `<Suspense>`
  around a component changes its parent type, and it remounts.

### Sources
- [Legacy React docs: Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)
- [react.dev: Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [Andrew Clark: React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- React 19.2.5 source: `updateElement`, `updateSlot`, `useFiber`, `createWorkInProgress`
