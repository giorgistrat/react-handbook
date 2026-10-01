---
title: "Render and Commit"
slug: "render-and-commit"
order: 1
level: "must"
illus: "pipeline"
summary: "The pipeline: trigger → render → commit → paint → effects, why render must be pure, and what the \"virtual DOM\" really is."
source: "https://react.dev/learn/render-and-commit"
---


> Notes on the pipeline every React update goes through, from react.dev's
> [Render and Commit](https://react.dev/learn/render-and-commit), Andrew
> Clark's [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture),
> and the React 19.2 source (`react-dom-client.development.js`). This is the
> entry point of [React Internals](../../). The later notes zoom into each box of
> the diagram below. My own notes and clarifications are marked with `> 💬`.

## Interview Q&A

<details class="qa"><summary>What does "rendering" mean in React?</summary>

Calling your components. react.dev: "'Rendering' is React calling your
components." It produces a description of the UI (React elements). It does
**not** touch the DOM, and it is not what the browser calls rendering. The
browser step is called **painting**. In our example, a `Counter` re-rendering
means `Counter()` ran again, not that its `<button>` was rebuilt.

</details>

<details class="qa"><summary>What are the phases of a React update?</summary>

Trigger, render, commit, then the browser paints and passive effects
(`useEffect`) run. The render phase is pure and can be paused, repeated or
thrown away. The commit phase is synchronous and is the only place the DOM
changes.

</details>

<details class="qa"><summary>Why must components be pure?</summary>

Because React is allowed to call them more times than you expect: twice in
Strict Mode, repeatedly while a transition keeps getting interrupted, or not
at all if it bails out. A render that mutates outside variables or does I/O
would do so a random number of times. Side effects go in event handlers or
effects, which run once per commit.

</details>

<details class="qa"><summary>Is the "virtual DOM" diffed against the real DOM?</summary>

No. React compares the new elements with the **previous render's fiber
tree**, which is its own in-memory record. It never reads the DOM to
decide what changed. See [Reconciliation](../reconciliation/).

</details>

## The pipeline

<figure class="fig fig-pipeline"><div class="pipe"><div class="pipe-step pipe-trigger"><div class="pipe-head"><span class="pipe-num">1</span><span>Trigger</span></div><ul><li><code>root.render()</code></li><li><code>setState</code> / <code>dispatch</code></li><li>lane picked, update queued</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-render"><div class="pipe-head"><span class="pipe-num">2</span><span>Render phase</span></div><span class="pipe-tag">pure · interruptible</span><ul><li>call components (<code>beginWork</code>)</li><li>reconcile children (diff)</li><li>prepare DOM (<code>completeWork</code>)</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-commit"><div class="pipe-head"><span class="pipe-num">3</span><span>Commit phase</span></div><span class="pipe-tag">sync · atomic</span><ul><li>before mutation</li><li>mutation: DOM writes</li><li>swap trees</li><li>layout: <code>useLayoutEffect</code>, refs</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-paint"><div class="pipe-head"><span class="pipe-num">4</span><span>Browser</span></div><ul><li>style / layout</li><li>paint</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-effects"><div class="pipe-head"><span class="pipe-num">5</span><span>After paint</span></div><ul><li>passive effects</li><li><code>useEffect</code></li></ul></div></div><figcaption>Every update goes through the same five steps. Only the render phase can pause.</figcaption></figure>

react.dev describes the first three steps with a restaurant analogy.
**Triggering** delivers the guest's order to the kitchen, **rendering**
prepares the order in the kitchen, and **committing** places it on the table.

### 1. Trigger

There are only two reasons a component renders (react.dev):
1. "It's the component's **initial render**" (`root.render(<App />)`).
2. "The component's (or one of its ancestors') **state has been updated**."

> Context changes and a parent re-rendering are really cases of (2):
> *someone's* state changed and React re-rendered from there downward. Props
> never trigger anything by themselves. See *React Re-rendering*.

Internally a trigger doesn't start work right away. `setState` creates an
update object, assigns it a priority (**lane**), marks the path from the
component to the root, and asks the root to be scheduled. Several
`setState`s in the same event land in the same lane and produce one render
(automatic batching). See [Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/).

### 2. Render phase

react.dev: "On initial render, React will call the root component. For
subsequent renders, React will call the function component whose state
update triggered the render. This process is recursive."

Under the hood React walks the **fiber tree** one fiber at a time
([The Work Loop](../the-work-loop/)):
- **Going down** (`beginWork`), React calls the component, or bails out if
  nothing changed, and **reconciles** the returned elements against the
  existing child fibers. Reconciling means deciding what to reuse, update,
  create or delete ([Reconciliation](../reconciliation/), [Child Reconciliation Algorithm](../child-reconciliation-algorithm/)).
- **Coming back up** (`completeWork`), React creates DOM nodes for new host
  elements (not yet attached to the document), flags existing ones that got
  new props, and bubbles "something below me needs work" flags to the parent.

Everything in this phase is built on a **work-in-progress** copy of the tree
([React Fiber](../react-fiber/), double buffering), so the screen keeps showing the old UI
the whole time. That's what makes the phase safe to interrupt: nothing has
been shown yet, so there is nothing to undo.

### 3. Commit phase

When the work-in-progress tree is complete, React commits it in one
synchronous pass. It applies the collected DOM mutations, swaps the
work-in-progress tree to be the current one, attaches refs and runs layout
effects. See [Commit Phase and Effects](../commit-phase-and-effects/).

react.dev: "React only changes the DOM nodes if there's a difference between
renders. For example, if a component re-renders but the `<input>` element
remains in the same position in the JSX, React won't touch it—or its value."

### 4. Paint, then passive effects

The browser recalculates styles and layout and paints. react.dev calls this
"painting" "to avoid confusion" with React's rendering. After the paint,
React runs `useEffect` callbacks. That ordering is why effects don't block
the user from seeing the update.

## Why render and commit are separate

The split exists so the expensive, error-prone part (running user code and
diffing) can be done without the user seeing anything, while the part the
user *does* see is applied all at once. Andrew Clark's architecture doc lists
the goals Fiber was built for:

- "pause work and come back to it later"
- "assign priority to different types of work"
- "reuse previously completed work"
- "abort work if it's no longer needed"

All four are only possible in the render phase. A half-applied DOM mutation
can't be paused or aborted, so the commit phase never is. That's why the
render phase must be pure. It's also why React can show a consistent UI while
rendering concurrently (*Concurrent Rendering*).

The same doc separates **reconciliation** ("the algorithm React uses to diff
one tree with another to determine which parts need to be changed") from
**rendering to a host**. The reconciler (`react-reconciler`) is shared, and
React DOM and React Native are just different **renderers** plugged into it.
The commit phase calls renderer methods like `appendChild`,
`commitUpdate` and `removeChild`, and only the renderer knows what those
mean.

## "The virtual DOM", precisely

"Virtual DOM" is a loose name for three different things:

| Thing | What it is | Lifetime |
|---|---|---|
| **React element** | `{ $$typeof, type, key, props }` returned by JSX. A cheap, immutable description | created every render, then thrown away |
| **Fiber** | a mutable node that records a component's position, state, hooks, props and effects | lives as long as the component is mounted, reused across renders |
| **DOM node** | the real browser object | lives as long as the host fiber, referenced from `fiber.stateNode` |

React diffs **new elements vs current fibers**, not "virtual DOM vs real
DOM". The output of that diff is a set of flags on the work-in-progress
fibers, which the commit phase turns into DOM calls.

## Render and commit, step by step

A counter button is clicked once:

```tsx
function Counter() {
	const [count, setCount] = useState(0)
	useEffect(() => {
		document.title = `Clicked ${count}`
	}, [count])
	return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

| # | Phase | What happens |
|---|---|---|
| 1 | trigger | the click handler calls `setCount(1)`. React queues an update on `Counter`'s state hook with `SyncLane` (a click is a discrete event) and schedules the root in a microtask |
| 2 | render | React starts at the root, finds nothing to do on the way down to `Counter` and clones those fibers (bailout). It calls `Counter()`, and `useState` returns `1` |
| 3 | render | reconciling `<button>` against the existing button fiber: same type, so the fiber is reused with new props. The text child changes `"0"` → `"1"` |
| 4 | render | `completeWork` on the text fiber flags an update (the text changed). The `useEffect` deps changed, so the fiber is flagged `Passive` |
| 5 | commit | mutation: set the text node's value to `"1"`. Then `root.current` points to the new tree |
| 6 | commit | layout: no layout effects or refs here |
| 7 | paint | the browser paints "1" |
| 8 | effects | `document.title = 'Clicked 1'`. For a discrete event like a click, React 18+ flushes these passive effects synchronously at the end of the commit rather than waiting for a later task |

The end-to-end version with real function names is in
[A State Update, End to End](../a-state-update-end-to-end/).

## Rules and caveats

- **Render is pure, commit is not.** Anything observable (subscriptions,
  mutations, requests) belongs in effects or event handlers.
- **Re-render ≠ DOM update.** A component can render and produce identical
  output. The commit then changes nothing. The cost you pay is the render
  itself.
- **The DOM is never read to diff.** If you mutate React-owned DOM behind
  React's back, React won't notice and may overwrite it.
- **Strict Mode double-invokes renders** (and effects on mount) in
  development only, to surface impurity.

### Sources
- [react.dev: Render and Commit](https://react.dev/learn/render-and-commit)
- [Andrew Clark: React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- React 19.2.5 source: `react-dom/cjs/react-dom-client.development.js` (`performWorkOnRoot`, `commitRoot`, `flushSpawnedWork`)
