---
title: "React Internals - Start Here"
slug: "start-here"
order: 0
level: "must"
illus: "robot"
summary: "The beginner entry point: reading order, a plain-English glossary and the top interview questions."
source: ""
---


> The beginner's entry point to [React Internals](../../). The other notes in this
> folder are deep and checked against the React source code. This note
> explains the same ideas **in plain English**: what to read first, what each
> confusing word means, and which parts actually matter in an interview.

## The whole thing in one paragraph

Think of a restaurant. A customer **orders** something (a click calls
`setState`). The **kitchen** prepares the plate on the counter, where the
customer can't see it yet. The cook can stop halfway through to deal with a
more urgent order, or throw the plate away and start again. This is the
**render phase**. When the plate is ready, the **waiter serves it in one
go**. The customer never gets half a plate. This is the **commit phase**.
After serving, the staff do the follow-up chores: wiping the table, updating
the bill. These are the **effects**.

<figure class="fig anim fig-restaurant-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;setState(…)&quot;,&quot;say&quot;:&quot;A customer &lt;b&gt;orders&lt;/b&gt;. In React: an event handler calls &lt;code&gt;setState&lt;/code&gt;. The order is written down; nothing is cooked yet.&quot;,&quot;set&quot;:{&quot;order&quot;:&quot;new hl&quot;,&quot;react&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;order-sub&quot;:&quot;new order on the rail&quot;,&quot;react&quot;:&quot;in React: update queued + render scheduled&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render phase&quot;,&quot;say&quot;:&quot;The &lt;b&gt;kitchen&lt;/b&gt; starts preparing the plate on the counter, where the customer can’t see it. In React: your components are called and the new tree is worked out.&quot;,&quot;set&quot;:{&quot;order&quot;:&quot;done&quot;,&quot;kitchen&quot;:&quot;run hl&quot;},&quot;txt&quot;:{&quot;kitchen-sub&quot;:&quot;plate being prepared&quot;,&quot;react&quot;:&quot;in React: components run, changes are recorded&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;urgent order arrives&quot;,&quot;say&quot;:&quot;A more urgent order comes in. The cook can &lt;b&gt;pause&lt;/b&gt; or &lt;b&gt;throw the plate away&lt;/b&gt; and start again: nothing has been served. In React: transition renders can be interrupted and discarded.&quot;,&quot;set&quot;:{&quot;kitchen&quot;:&quot;bad hl&quot;},&quot;txt&quot;:{&quot;kitchen-sub&quot;:&quot;paused / thrown away&quot;,&quot;react&quot;:&quot;in React: interrupted render, nothing to undo&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render finished&quot;,&quot;say&quot;:&quot;The plate is ready on the counter. The customer &lt;b&gt;still sees the old table&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;kitchen&quot;:&quot;done&quot;},&quot;txt&quot;:{&quot;kitchen-sub&quot;:&quot;plate ready&quot;,&quot;react&quot;:&quot;in React: work-in-progress tree complete&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commit phase&quot;,&quot;say&quot;:&quot;The waiter &lt;b&gt;serves the whole plate in one go&lt;/b&gt;. The customer never gets half a plate. In React: all DOM changes are applied synchronously, at once.&quot;,&quot;set&quot;:{&quot;kitchen&quot;:&quot;faint&quot;,&quot;table&quot;:&quot;new hl&quot;},&quot;txt&quot;:{&quot;table-sub&quot;:&quot;today’s plate, all at once&quot;,&quot;react&quot;:&quot;in React: DOM updated atomically&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;browser paints&quot;,&quot;say&quot;:&quot;The customer looks at the table and sees the food. In React: the browser paints.&quot;,&quot;set&quot;:{&quot;table&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;react&quot;:&quot;in React: pixels on screen&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;useEffect&quot;,&quot;say&quot;:&quot;Afterwards the staff do the &lt;b&gt;follow-up chores&lt;/b&gt;: wipe the table, update the bill. In React: &lt;code&gt;useEffect&lt;/code&gt; runs.&quot;,&quot;set&quot;:{&quot;chores&quot;:&quot;done hl&quot;},&quot;txt&quot;:{&quot;chores-sub&quot;:&quot;wipe table, update bill&quot;,&quot;react&quot;:&quot;in React: effects run after paint&quot;}}]" data-intro="The restaurant from the paragraph above. Press &lt;b&gt;Play&lt;/b&gt;."><div class="anim-stage"><div class="stations"><div class="an station" data-k="order"><span class="st-icon">🧾</span><b>Order</b><small data-k="order-sub">nothing ordered</small></div><span class="st-arrow">→</span><div class="an station" data-k="kitchen"><span class="st-icon">🍳</span><b>Kitchen counter</b><small data-k="kitchen-sub">empty</small></div><span class="st-arrow">→</span><div class="an station" data-k="table"><span class="st-icon">🍽️</span><b>Table (what the customer sees)</b><small data-k="table-sub">yesterday’s plate</small></div><span class="st-arrow">→</span><div class="an station" data-k="chores"><span class="st-icon">🧽</span><b>Chores</b><small data-k="chores-sub">—</small></div></div><div class="a-row" style="justify-content:center;margin-top:12px"><span class="an chip-a" data-k="react">in React: –</span></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>setState(…)</code><span>A customer <b>orders</b>. In React: an event handler calls <code>setState</code>. The order is written down; nothing is cooked yet.</span></li><li><span class="anim-phase ph-render">render phase</span><code>render phase</code><span>The <b>kitchen</b> starts preparing the plate on the counter, where the customer can’t see it. In React: your components are called and the new tree is worked out.</span></li><li><span class="anim-phase ph-render">render phase</span><code>urgent order arrives</code><span>A more urgent order comes in. The cook can <b>pause</b> or <b>throw the plate away</b> and start again: nothing has been served. In React: transition renders can be interrupted and discarded.</span></li><li><span class="anim-phase ph-render">render phase</span><code>render finished</code><span>The plate is ready on the counter. The customer <b>still sees the old table</b>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commit phase</code><span>The waiter <b>serves the whole plate in one go</b>. The customer never gets half a plate. In React: all DOM changes are applied synchronously, at once.</span></li><li><span class="anim-phase ph-paint">browser</span><code>browser paints</code><span>The customer looks at the table and sees the food. In React: the browser paints.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>useEffect</code><span>Afterwards the staff do the <b>follow-up chores</b>: wipe the table, update the bill. In React: <code>useEffect</code> runs.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The restaurant analogy, animated: order → kitchen → serve → chores is trigger → render → commit → effects.</figcaption></figure>
<figure class="fig fig-pipeline"><div class="pipe"><div class="pipe-step pipe-trigger"><div class="pipe-head"><span class="pipe-num">1</span><span>Trigger</span></div><ul><li><code>root.render()</code></li><li><code>setState</code> / <code>dispatch</code></li><li>lane picked, update queued</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-render"><div class="pipe-head"><span class="pipe-num">2</span><span>Render phase</span></div><span class="pipe-tag">pure · interruptible</span><ul><li>call components (<code>beginWork</code>)</li><li>reconcile children (diff)</li><li>prepare DOM (<code>completeWork</code>)</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-commit"><div class="pipe-head"><span class="pipe-num">3</span><span>Commit phase</span></div><span class="pipe-tag">sync · atomic</span><ul><li>before mutation</li><li>mutation: DOM writes</li><li>swap trees</li><li>layout: <code>useLayoutEffect</code>, refs</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-paint"><div class="pipe-head"><span class="pipe-num">4</span><span>Browser</span></div><ul><li>style / layout</li><li>paint</li></ul></div><div class="pipe-arrow" aria-hidden="true">→</div><div class="pipe-step pipe-effects"><div class="pipe-head"><span class="pipe-num">5</span><span>After paint</span></div><ul><li>passive effects</li><li><code>useEffect</code></li></ul></div></div><figcaption>Every update goes through the same five steps. Only the render phase can pause.</figcaption></figure>

In real terms: **your components return elements → React compares them with
what it rendered last time (reconciliation) → it records that work on a tree
of objects called fibers, using a loop it can pause → it applies all the DOM
changes at once (commit) → the browser paints → `useEffect` runs.** Every
other topic in this folder is a detail of one step in that sentence.

## Legend

| Label | Meaning |
|---|---|
| <span class="lvl lvl-must" title="Must know"></span> **Must know** | Gets asked often. You should be able to explain it out loud without notes. |
| <span class="lvl lvl-good" title="Good to know"></span> **Good to know** | Rarely asked directly, but mentioning it turns an OK answer into a strong one. |
| <span class="lvl lvl-skip" title="Skip for interviews"></span> **Skip for interviews** | An implementation detail (function names, bit tricks, timing constants) or vague high-level talk. Interesting, but it won't help you answer anything. Each one says *why* it's skippable. |

## Reading order

Read these in order. Each note builds on the ones before it.

1. <span class="lvl lvl-must" title="Must know"></span> **[Render and Commit](../render-and-commit/)**: the big picture. Read the whole note.
   - Read for: what "rendering" really means, the phases, why render must be pure, what the "virtual DOM" actually is.
2. <span class="lvl lvl-must" title="Must know"></span> **[Reconciliation](../reconciliation/)**: how React decides what changed. Read the whole note.
   - Read for: the type rule, keys, why state is tied to position, why you never define components inside components.
3. <span class="lvl lvl-must" title="Must know"></span> **[React Fiber](../react-fiber/)**: the data structure everything runs on.
   - Read: the Interview Q&A, "The problem", "The tree is a linked list", "Double buffering".
   - <span class="lvl lvl-skip" title="Skip for interviews"></span> Skim: "What a fiber holds" (the constructor field by field). You only need to know that a fiber stores type, props, state, and links to parent/child/sibling.
4. <span class="lvl lvl-must" title="Must know"></span> **[Hooks Under the Hood](../hooks-under-the-hood/)**: where state lives and why the Rules of Hooks exist.
   - Read: the Interview Q&A, "The hook list", "Why conditional hooks break, concretely", "`setState`: from call to render".
   - <span class="lvl lvl-good" title="Good to know"></span> "Processing the queue during render" and rebasing: read once, don't memorize.
5. <span class="lvl lvl-must" title="Must know"></span> **[Commit Phase and Effects](../commit-phase-and-effects/)**: when the DOM changes and when effects run.
   - <span class="lvl lvl-must" title="Must know"></span> Effect ordering (child before parent, cleanups before setups), and `useLayoutEffect` vs `useEffect`.
   - <span class="lvl lvl-good" title="Good to know"></span> The names of the sub-phases (before mutation → mutation → layout).
6. <span class="lvl lvl-good" title="Good to know"></span> **[The Work Loop](../the-work-loop/)**: how React walks the tree.
   - <span class="lvl lvl-must" title="Must know"></span> The "Bailouts" section: why a child re-renders when its parent does, and how `memo` and `children` stop that.
   - <span class="lvl lvl-skip" title="Skip for interviews"></span> The `beginWork`/`completeWork` code paths: these are function names, not concepts.
7. <span class="lvl lvl-good" title="Good to know"></span> **[Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/)**: priorities and batching.
   - <span class="lvl lvl-must" title="Must know"></span> Batching (multiple `setState` calls → one render).
   - <span class="lvl lvl-good" title="Good to know"></span> Lanes as priorities, and the fact that only transitions are interruptible.
   - <span class="lvl lvl-skip" title="Skip for interviews"></span> The min-heap, the 5ms slices, `MessageChannel`, starvation timeouts: scheduler engineering trivia.
8. <span class="lvl lvl-good" title="Good to know"></span> **[Child Reconciliation Algorithm](../child-reconciliation-algorithm/)**: how lists are diffed.
   - <span class="lvl lvl-must" title="Must know"></span> Why index keys break things (the Interview Q&A covers it).
   - <span class="lvl lvl-skip" title="Skip for interviews"></span> The `lastPlacedIndex` walkthroughs and the Vue LIS comparison: only useful if you're asked to *implement* a diff.
9. <span class="lvl lvl-good" title="Good to know"></span> **[A State Update, End to End](../a-state-update-end-to-end/)**: one click traced through React. **Read this last**, as a review that ties everything together. Don't memorize the ~30 function names (<span class="lvl lvl-skip" title="Skip for interviews"></span>); follow the story.

> If you only have one evening: read notes 1, 2, 4 and 5, plus the Bailouts
> section of note 6, then the [Top interview questions](#top-interview-questions) below.

## Plain-English glossary

Each term has a short explanation, a label, and a link to the note that goes deeper.

### The pipeline ([Render and Commit](../render-and-commit/))

- <span class="lvl lvl-must" title="Must know"></span> **Element**: the plain object JSX turns into, e.g. `{ type: 'button', props: {...} }`. It's a *description* of what you want on screen, like a shopping list. It's cheap, and a new one is created on every render, then thrown away.
- <span class="lvl lvl-must" title="Must know"></span> **Component**: your function. React calls it, and it returns elements.
- <span class="lvl lvl-must" title="Must know"></span> **Render (phase)**: React *calling your components* to find out what the UI should look like. It does **not** touch the DOM. "Re-render" means "your function ran again", not "the screen was rebuilt".
- <span class="lvl lvl-must" title="Must know"></span> **Commit (phase)**: React applying the changes it found to the real DOM, all in one go.
- <span class="lvl lvl-must" title="Must know"></span> **Paint**: the browser drawing pixels. This is the browser's job, not React's, and it happens after the commit.
- <span class="lvl lvl-must" title="Must know"></span> **Trigger**: what starts an update. Either the first `root.render()`, or a state update (`setState`, a reducer `dispatch`, etc.).
- <span class="lvl lvl-must" title="Must know"></span> **Pure render**: your component must give the same output for the same input and must not change anything outside itself. React may call it twice (Strict Mode), several times (interrupted transitions) or not at all (bailouts).
- <span class="lvl lvl-good" title="Good to know"></span> **Virtual DOM**: a marketing term. Precisely: React compares new **elements** against its **previous fiber tree**. It never reads the real DOM to find out what changed. If an interviewer says "virtual DOM", it's fine to say this.

### Reconciliation ([Reconciliation](../reconciliation/))

- <span class="lvl lvl-must" title="Must know"></span> **Reconciliation**: the "spot the difference" step. React compares what your component returned now with what it returned last time, and decides what to keep, update, create or delete. It happens *during render*. The actual DOM changes happen later, in the commit.
- <span class="lvl lvl-must" title="Must know"></span> **Type rule**: if an element's type changes (`<div>` → `<span>`, or `ComponentA` → `ComponentB`), React throws away the whole old subtree, including its state, and builds a new one. It doesn't look inside.
- <span class="lvl lvl-must" title="Must know"></span> **Key**: a name tag for list items, so React can recognize "the same item" even if it moved. Without keys, React matches items by their position in the list.
- <span class="lvl lvl-must" title="Must know"></span> **State is tied to position**: React remembers state by *where a component sits in the tree* (plus its type and key), not by the variable name. Same type at the same spot keeps its state.
- <span class="lvl lvl-must" title="Must know"></span> **Remount**: destroy and re-create a component, losing its state and DOM. Changing the `key` forces one, which is a common trick to reset a form.
- <span class="lvl lvl-good" title="Good to know"></span> **O(n) heuristic**: a perfect tree diff costs O(n³). React gets O(n) by assuming that "different type means a different tree" and by trusting keys. Say this in one sentence and move on.

### Fiber ([React Fiber](../react-fiber/))

- <span class="lvl lvl-must" title="Must know"></span> **Fiber**: a plain JS object, one for each mounted component or DOM element, that stores everything React knows about it: type, props, state, hooks, pending work, and links to its relatives. Unlike elements, fibers *persist* between renders. Think of it as the component's "file" in React's records.
- <span class="lvl lvl-must" title="Must know"></span> **Why Fiber exists**: the old "stack reconciler" used recursion, and you can't pause recursion halfway through. Fiber turns the tree into linked objects that a loop walks one at a time, so React can **pause, resume, prioritize, or throw away** work.
- <span class="lvl lvl-good" title="Good to know"></span> **Stack reconciler**: the pre-React-16 engine. You only need to know it as "the one that couldn't pause".
- <span class="lvl lvl-good" title="Good to know"></span> **Unit of work**: processing one fiber. React can stop between any two units of work.
- <span class="lvl lvl-good" title="Good to know"></span> **child / sibling / return**: the three pointers on each fiber: first child, next sibling, and parent ("return" because that's where you return to when you're done). Together they let a loop walk the tree without recursion.
- <span class="lvl lvl-must" title="Must know"></span> **current vs workInProgress**: `current` is the tree on screen right now. `workInProgress` is the draft being built during render. The user only ever sees `current`.
- <span class="lvl lvl-good" title="Good to know"></span> **alternate**: the pointer connecting a fiber's "current" version with its "draft" version.
- <span class="lvl lvl-good" title="Good to know"></span> **Double buffering**: borrowed from graphics. You draw the next frame off-screen, then swap. The commit makes the draft the new `current` by switching a single pointer, and the old tree is reused as scratch space for the next render.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **stateNode**: the fiber field that points to the real DOM node (or class instance). It's a field name, not a concept.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **flags / effect tags**: bits on a fiber that say things like "insert me" or "update me", so the commit knows what to do. It's enough to know that render marks the work and commit performs it.

### The work loop ([The Work Loop](../the-work-loop/))

- <span class="lvl lvl-good" title="Good to know"></span> **Work loop**: a `while` loop that processes one fiber at a time. It goes down to the children, then across to the siblings, then back up to the parent.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **performUnitOfWork / beginWork / completeWork**: the internal functions for "process this fiber on the way down" and "finish it on the way up". These are just names; describe the down-then-up walk instead.
- <span class="lvl lvl-must" title="Must know"></span> **Bailout**: React *skipping* a component because it can tell nothing changed: the props object is the same, there's no state update, and no context change. If nothing below it changed either, React skips the whole subtree.
- <span class="lvl lvl-must" title="Must know"></span> **Why children re-render with the "same" props**: a parent's render creates new elements, which means a **new props object**, and React compares props by reference (`!==`). `memo` switches this to a shallow comparison of each prop. Passing elements in as `children` keeps the same object, so the child is skipped without needing `memo`.
- <span class="lvl lvl-good" title="Good to know"></span> **childLanes**: a "something below me has pending work" flag on each fiber. It's how React knows it can skip a whole subtree.

### Commit and effects ([Commit Phase and Effects](../commit-phase-and-effects/))

- <span class="lvl lvl-must" title="Must know"></span> **Commit is synchronous**: once React starts changing the DOM, it doesn't stop, so you never see a half-updated UI. All the pausable work happens before the first DOM write.
- <span class="lvl lvl-good" title="Good to know"></span> **Sub-phases**: *before mutation* (read the DOM, e.g. `getSnapshotBeforeUpdate`) → *mutation* (change the DOM) → *swap* (`current` = the new tree) → *layout* (attach refs, run `useLayoutEffect`).
- <span class="lvl lvl-must" title="Must know"></span> **useLayoutEffect**: runs after the DOM changes but **before the browser paints**. Use it to measure the DOM and fix up layout without a visible flicker. It blocks painting, so keep it short.
- <span class="lvl lvl-must" title="Must know"></span> **useEffect**: runs **after paint**, so it doesn't delay what the user sees. It's the default choice for data fetching, subscriptions and logging.
- <span class="lvl lvl-must" title="Must know"></span> **Effect order**: children's effects run before their parent's. For each kind of effect, **all cleanups run before any new setup**.
- <span class="lvl lvl-good" title="Good to know"></span> **Refs**: `ref.current` is set during the layout sub-phase, which is why a ref is available inside `useLayoutEffect` and `useEffect` but not during render.

### Scheduling ([Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/))

- <span class="lvl lvl-must" title="Must know"></span> **Batching**: `setState` doesn't render right away. It *queues* an update. All the updates made in the same event (or the same tick) are rendered together **once**. Since React 18 this happens everywhere: in promises, timeouts and native event listeners too ("automatic batching").
- <span class="lvl lvl-must" title="Must know"></span> **Transition** (`startTransition`, `useTransition`): marks an update as "not urgent". React renders it in the interruptible mode and will drop it if something urgent, like typing, comes in.
- <span class="lvl lvl-good" title="Good to know"></span> **Priority / lane**: every update gets a priority. A **lane** is React's name for a priority, stored as one bit in a number so React can group and compare priorities cheaply. Say "lanes are how React represents update priority", and that's enough.
- <span class="lvl lvl-must" title="Must know"></span> **Not everything is concurrent**: clicks, typing and normal updates render **synchronously**, without stopping. Only transitions, `useDeferredValue`, and a few internal cases use the interruptible loop. People get this wrong in interviews all the time.
- <span class="lvl lvl-good" title="Good to know"></span> **Time slicing / yielding**: in the interruptible mode, React works for a few milliseconds, then hands control back to the browser so it can handle input and paint, then continues.
- <span class="lvl lvl-good" title="Good to know"></span> **Interruption**: if an urgent update arrives in the middle of a transition render, React throws the draft away, handles the urgent update, and redoes the transition later. This is why render must be pure.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **Starvation protection**: transitions that keep being interrupted eventually get forced through synchronously. It's a safety net and doesn't affect how you write code.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **Scheduler package internals** (min-heap, 5ms slice, `MessageChannel`): engineering details of the task queue.

### Hooks ([Hooks Under the Hood](../hooks-under-the-hood/))

- <span class="lvl lvl-must" title="Must know"></span> **Where state lives**: on the component's **fiber**, not in the function. Your function forgets everything when it returns. React hands the state back on every call.
- <span class="lvl lvl-must" title="Must know"></span> **Hook list**: each fiber keeps its hooks in a linked list, **in call order**: the 1st `useState`, the 2nd `useEffect`, and so on. React matches hook calls to stored data **by position, not by name**.
- <span class="lvl lvl-must" title="Must know"></span> **Why the Rules of Hooks exist**: because of the point above. If an `if` skips one hook call, every later hook reads the wrong slot, which gives you swapped state or the error "Rendered more hooks than during the previous render".
- <span class="lvl lvl-must" title="Must know"></span> **`setState` with a value vs an updater**: `setCount(count + 1)` three times adds 1, because all three use the same stale `count`. `setCount(c => c + 1)` three times adds 3, because each one gets the previous result.
- <span class="lvl lvl-must" title="Must know"></span> **`setState` is stable**: it's created once on mount and bound to the fiber, so it never changes. That's why it's safe to leave out of dependency arrays.
- <span class="lvl lvl-good" title="Good to know"></span> **Update queue**: each state hook has a queue of pending updates, which React processes during the next render.
- <span class="lvl lvl-good" title="Good to know"></span> **Eager bailout**: if you set the same value (`Object.is`) and nothing else is pending, React often doesn't schedule a render at all.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **Dispatcher**: the internal object that makes `useState` mean "mount" on the first render and "update" after that. It's also why calling a hook outside a component throws an error. It's a mechanism, not something you'll be asked about.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **memoizedState**: the fiber field that holds the first hook. It's just a field name.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **Rebasing**: how low-priority updates are replayed after high-priority ones. It's correct, but too deep for almost any interview.

### List diffing ([Child Reconciliation Algorithm](../child-reconciliation-algorithm/))

- <span class="lvl lvl-must" title="Must know"></span> **Index keys are dangerous**: if you insert an item at the front, the old item 0's state and DOM node get reused for the new item 0. Inputs, focus and local state end up on the wrong row.
- <span class="lvl lvl-good" title="Good to know"></span> **Key Map**: when items move, React puts the old children in a `Map` by key and looks up each new child in it.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **lastPlacedIndex**: the trick React uses to decide which items to move. Moving the last item to the front costs n−1 moves. It's only useful if you're asked to implement a diff.
- <span class="lvl lvl-skip" title="Skip for interviews"></span> **LIS (Vue)**: Vue computes the minimum number of moves and React doesn't. It's a fun fact, not interview material.

## Commonly confused pairs

| Pair                             | The difference in one line                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Element vs fiber vs DOM node     | Element = a throwaway description (new every render). Fiber = React's long-lived record of the instance. DOM node = the real thing on the page. |
| Render vs commit vs paint        | Render = call components (no DOM). Commit = apply DOM changes. Paint = the browser draws the pixels.                                            |
| Rendering vs reconciliation      | Rendering is calling your component. Reconciliation is comparing its output with last time. Both happen in the render phase.                    |
| `useLayoutEffect` vs `useEffect` | Layout effect: before paint, blocks it. Effect: after paint, doesn't block.                                                                     |
| current vs workInProgress        | On screen vs the draft being built. Commit swaps them.                                                                                          |
| Batching vs time slicing         | Batching = many updates → one render. Time slicing = one render split into small chunks. They're unrelated.                                     |
| Re-render vs remount             | Re-render = function runs again, state kept. Remount = destroyed and recreated, state lost.                                                     |
| Sync vs concurrent rendering     | Sync = can't be interrupted (default for clicks/typing). Concurrent = interruptible (transitions, deferred values).                             |

## Top interview questions

Short answers you can say out loud. Each one links to the note that goes deeper.

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> What happens when you call <code>setState</code>?</summary>

React queues an update on that component's fiber, gives it a priority, and schedules a render. It doesn't render immediately, so several updates get batched. During render it recalculates the state, compares the output, and in the commit it applies only what changed to the DOM. → [A State Update, End to End](../a-state-update-end-to-end/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> What is reconciliation?</summary>

Comparing the new elements with the previous tree to decide what to keep, update, create or delete. It's O(n) because of two rules: a different type means a new subtree, and keys identify list items. → [Reconciliation](../reconciliation/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> What is React Fiber and why was it introduced?</summary>

It's React's engine since v16. Each component instance is a fiber object, linked into a tree that a loop processes one unit at a time. Unlike the old recursive engine, it can pause, prioritize and discard work, which is what makes concurrent features possible. → [React Fiber](../react-fiber/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> What are the render and commit phases?</summary>

Render: React calls your components and works out what changed. It's pure and can be interrupted. Commit: React applies the changes to the DOM synchronously, then runs layout effects. The browser paints, then `useEffect` runs. → [Render and Commit](../render-and-commit/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> Is the virtual DOM compared with the real DOM?</summary>

No. React compares new elements with its previous fiber tree, which it keeps in memory. It never reads the DOM to find differences. → [Render and Commit](../render-and-commit/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> Why do keys matter, and why are index keys bad?</summary>

Keys let React match items across renders even when they move. With index keys, inserting or reordering makes React reuse the wrong item's state and DOM node. → [Child Reconciliation Algorithm](../child-reconciliation-algorithm/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> Why can't you call hooks conditionally?</summary>

Hooks are stored in a list on the fiber and matched by call order. Skipping one shifts every later hook onto the wrong data. → [Hooks Under the Hood](../hooks-under-the-hood/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> Why does <code>setCount(count + 1)</code> three times only add one?</summary>

All three calls use the same `count` from that render. Use the updater form, `setCount(c => c + 1)`, to chain them. → [Hooks Under the Hood](../hooks-under-the-hood/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> <code>useEffect</code> vs <code>useLayoutEffect</code>?</summary>

Layout effects run after the DOM update but before paint, which is good for measuring and avoiding flicker. Regular effects run after paint and don't block it. → [Commit Phase and Effects](../commit-phase-and-effects/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> Why does a child re-render when the parent re-renders?</summary>

The parent creates a new props object every render, and React compares props by reference. Use `memo`, or pass the child in as `children` so the element is created higher up. → [The Work Loop](../the-work-loop/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> What is automatic batching?</summary>

Several state updates in the same event or tick produce one render. Since React 18 this also works in promises, timeouts and native listeners. → [Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/)

</details>

<details class="qa"><summary><span class="lvl lvl-must" title="Must know"></span> Why must components be pure?</summary>

React may call them multiple times or throw a render away (Strict Mode, interrupted transitions). Side effects in render would run an unpredictable number of times. → [Render and Commit](../render-and-commit/)

</details>

<details class="qa"><summary><span class="lvl lvl-good" title="Good to know"></span> Does React 18+ always render concurrently?</summary>

No. Normal updates render synchronously. Only transitions and deferred values use the interruptible mode. → [Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/)

</details>

<details class="qa"><summary><span class="lvl lvl-good" title="Good to know"></span> How does <code>startTransition</code> keep typing responsive?</summary>

It marks the update as low priority. React renders it in small chunks, yields to the browser between them, and abandons it if an urgent update (a keystroke) arrives. → [Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/)

</details>

<details class="qa"><summary><span class="lvl lvl-good" title="Good to know"></span> Why does changing a <code>key</code> reset a component's state?</summary>

State is tied to type, position and key. A new key means React treats it as a different component: it unmounts the old one and mounts a fresh one. → [Reconciliation](../reconciliation/)

</details>

<details class="qa"><summary><span class="lvl lvl-good" title="Good to know"></span> What's double buffering in React?</summary>

React builds the next tree as a draft (`workInProgress`) next to the visible one (`current`), and the commit swaps a pointer. The user never sees a half-built tree. → [React Fiber](../react-fiber/)

</details>

## Self-check

Try to explain each of these out loud, without looking. If you get stuck, reread the linked note.

- [ ] Walk through what happens from a button click to the pixels changing. ([A State Update, End to End](../a-state-update-end-to-end/))
- [ ] What's the difference between an element and a fiber? ([React Fiber](../react-fiber/))
- [ ] Why is `<Child />` defined inside `Parent` a bug? ([Reconciliation](../reconciliation/))
- [ ] Where does `useState` actually keep its value? ([Hooks Under the Hood](../hooks-under-the-hood/))
- [ ] In what order do parent and child effects and cleanups run? ([Commit Phase and Effects](../commit-phase-and-effects/))
- [ ] Give two ways to stop a child from re-rendering when its parent does. ([The Work Loop](../the-work-loop/))
- [ ] Which updates can be interrupted, and why can the commit never be? ([Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/))
- [ ] What goes wrong with index keys when you prepend an item? ([Child Reconciliation Algorithm](../child-reconciliation-algorithm/))
