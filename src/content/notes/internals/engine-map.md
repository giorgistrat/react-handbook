---
title: "React Engine Map"
slug: "engine-map"
module: "internals"
order: 11
level: "must"
illus: "map"
summary: "Lost in function names? The map of React’s internals: what calls what, which names matter, a plain-English glossary and flashcards."
source: "https://github.com/facebook/react/tree/v19.2.5/packages/react-reconciler/src"
---


> React's source has hundreds of functions, and the notes mention about 90 of
> them. You don't need most of them. This card is the map: where each
> function sits, what calls what, which ones are worth remembering, and a
> deck of flashcards for the important ones. Anywhere on the site, tap a
> function name to see its card, or switch **Names off** in the top-right
> corner to read the notes in plain English.

## How to read React's function names

Almost every internal function belongs to one of four steps, and the name
usually tells you which:

| If the name starts with… | It belongs to | Example |
|---|---|---|
| `dispatch…`, `schedule…`, `ensure…`, `request…Lane` | **scheduling**: an update was requested | `dispatchSetState` |
| `perform…`, `render…`, `workLoop…`, `begin…`, `complete…`, `reconcile…`, `create…Fiber…`, `bailout…` | **render phase**: working out what changed | `beginWork` |
| `commit…`, `flush…Effects` | **commit phase**: changing the DOM, running effects | `commitRoot` |
| `mount…` / `update…` | the **first render** of something vs. a **re-render** | `mountState` / `updateReducer` |

And three rules cover most of the nesting:

- Everything in a render happens inside **`workLoopSync`** (or its concurrent
  twin), one fiber at a time: **`beginWork`** on the way down,
  **`completeWork`** on the way up.
- **Your component** is called from **`renderWithHooks`**, which is called
  from **`beginWork`**. Your `jsx()` calls and hooks run inside it.
- Everything in a commit happens inside **`commitRoot`**, in a fixed order:
  mutation (`flushMutationEffects`) → layout (`flushLayoutEffects`) → passive
  (`flushPassiveEffects`).

## The map

<figure class="fig engine-map" data-engine-map data-pagefind-ignore><div class="btn-row map-filter" role="group" aria-label="Show"><button type="button" class="btn" data-map-level="all" aria-pressed="true">Everything</button><button type="button" class="btn btn-ghost" data-map-level="good" aria-pressed="false">Must + good to know</button><button type="button" class="btn btn-ghost" data-map-level="must" aria-pressed="false">Only must know</button></div><div class="map-legend"><span><i class="lvl lvl-must"></i>must know</span><span><i class="lvl lvl-good"></i>good to know</span><span><i class="lvl lvl-skip"></i>implementation detail</span><span>· indented = called by the line above · tap a name for its card</span></div><section class="map-lane lane-setup"><header><b>1 · Setup and events</b><span>Once at start-up, then every time the user does something</span></header><ul class="map-tree"><li><button type="button" class="map-node gl gl-must" data-gl="createRoot" data-level="must"><code>createRoot</code><small>set up React on a DOM node</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="createFiberRoot" data-level="skip"><code>createFiberRoot</code><small>create the root’s records</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="listenToAllSupportedEvents" data-level="good"><code>listenToAllSupportedEvents</code><small>listen for every event on the root</small></button></li></ul></li><li><button type="button" class="map-node gl gl-must" data-gl="root.render" data-level="must"><code>root.render</code><small>ask React to render this element</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="requestUpdateLane" data-level="good"><code>requestUpdateLane</code><small>pick the update’s priority</small></button></li><li><button type="button" class="map-node gl gl-skip" data-gl="updateContainerImpl" data-level="skip"><code>updateContainerImpl</code><small>queue the root update</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="scheduleUpdateOnFiber" data-level="good"><code>scheduleUpdateOnFiber</code><small>mark the root as having work</small></button></li></ul></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="dispatchDiscreteEvent" data-level="good"><code>dispatchDiscreteEvent</code><small>React’s click/keydown listener</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="dispatchEvent" data-level="skip"><code>dispatchEvent</code><small>route a native event to handlers</small></button><ul><li><span class="map-node map-plain" data-level="must"><code>your onClick</code></span><ul><li><button type="button" class="map-node gl gl-must" data-gl="dispatchSetState" data-level="must"><code>dispatchSetState</code><small>setState</small></button></li></ul></li></ul></li></ul></li></ul></section><div class="map-between" aria-hidden="true">↓</div><section class="map-lane lane-schedule"><header><b>2 · Scheduling</b><span>setState never renders: it queues and schedules</span></header><ul class="map-tree"><li><button type="button" class="map-node gl gl-must" data-gl="dispatchSetState" data-level="must"><code>dispatchSetState</code><small>setState</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="requestUpdateLane" data-level="good"><code>requestUpdateLane</code><small>pick the update’s priority</small></button></li><li><button type="button" class="map-node gl gl-skip" data-gl="dispatchSetStateInternal" data-level="skip"><code>dispatchSetStateInternal</code><small>queue the state update</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="enqueueConcurrentHookUpdate" data-level="skip"><code>enqueueConcurrentHookUpdate</code><small>stash the update</small></button></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="scheduleUpdateOnFiber" data-level="good"><code>scheduleUpdateOnFiber</code><small>mark the root as having work</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="ensureRootIsScheduled" data-level="good"><code>ensureRootIsScheduled</code><small>make sure a render is coming</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="scheduleImmediateRootScheduleTask" data-level="skip"><code>scheduleImmediateRootScheduleTask</code><small>queue the microtask</small></button></li></ul></li></ul></li></ul></li></ul><div class="map-then">↓ microtask ↓</div><ul class="map-tree"><li><button type="button" class="map-node gl gl-good" data-gl="processRootScheduleInMicrotask" data-level="good"><code>processRootScheduleInMicrotask</code><small>decide when to render</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="performSyncWorkOnRoot" data-level="skip"><code>performSyncWorkOnRoot</code><small>render now (Sync lane)</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="performWorkOnRoot" data-level="good"><code>performWorkOnRoot</code><small>render, then commit, the root</small></button></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="scheduleCallback" data-level="good"><code>scheduleCallback</code><small>ask the Scheduler for a task</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="performWorkOnRootViaSchedulerTask" data-level="skip"><code>performWorkOnRootViaSchedulerTask</code><small>render in a Scheduler task</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="performWorkOnRoot" data-level="good"><code>performWorkOnRoot</code><small>render, then commit, the root</small></button></li></ul></li></ul></li></ul></li></ul></section><div class="map-between" aria-hidden="true">↓</div><section class="map-lane lane-render"><header><b>3 · Render phase</b><span>Pure, off-screen, can be paused or thrown away</span></header><ul class="map-tree"><li><button type="button" class="map-node gl gl-good" data-gl="performWorkOnRoot" data-level="good"><code>performWorkOnRoot</code><small>render, then commit, the root</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="renderRootSync" data-level="good"><code>renderRootSync</code><small>render without pausing</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="prepareFreshStack" data-level="good"><code>prepareFreshStack</code><small>start a render from the root</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="createWorkInProgress" data-level="good"><code>createWorkInProgress</code><small>make the draft copy of a fiber</small></button></li><li><button type="button" class="map-node gl gl-skip" data-gl="finishQueueingConcurrentUpdates" data-level="skip"><code>finishQueueingConcurrentUpdates</code><small>link stashed updates into queues</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="markUpdateLaneFromFiberToRoot" data-level="good"><code>markUpdateLaneFromFiberToRoot</code><small>leave a trail to the updated fiber</small></button></li></ul></li></ul></li><li><button type="button" class="map-node gl gl-must" data-gl="workLoopSync" data-level="must"><code>workLoopSync</code><small>process fibers until done</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="performUnitOfWork" data-level="good"><code>performUnitOfWork</code><small>work on one fiber</small></button><ul><li><button type="button" class="map-node gl gl-must" data-gl="beginWork" data-level="must"><code>beginWork</code><small>start work on a fiber (going down)</small></button><ul><li><button type="button" class="map-node gl gl-must" data-gl="bailoutOnAlreadyFinishedWork" data-level="must"><code>bailoutOnAlreadyFinishedWork</code><small>skip this component</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="updateFunctionComponent" data-level="good"><code>updateFunctionComponent</code><small>render a function component</small></button><ul><li><button type="button" class="map-node gl gl-must" data-gl="renderWithHooks" data-level="must"><code>renderWithHooks</code><small>call your component</small></button><ul><li><span class="map-node map-plain" data-level="must"><code>YourComponent()</code></span><ul><li><button type="button" class="map-node gl gl-good" data-gl="mountState" data-level="good"><code>mountState</code><small>useState on the first render</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="updateReducer" data-level="good"><code>updateReducer</code><small>useState on a re-render</small></button></li><li><button type="button" class="map-node gl gl-must" data-gl="jsx" data-level="must"><code>jsx</code><small>create an element object</small></button></li></ul></li></ul></li><li><button type="button" class="map-node gl gl-must" data-gl="reconcileChildren" data-level="must"><code>reconcileChildren</code><small>compare new elements with old fibers</small></button></li></ul></li><li><button type="button" class="map-node gl gl-must" data-gl="reconcileChildren" data-level="must"><code>reconcileChildren</code><small>compare new elements with old fibers</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="reconcileChildFibers" data-level="good"><code>reconcileChildFibers</code><small>diff the children</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="reconcileSingleElement" data-level="good"><code>reconcileSingleElement</code><small>diff one child</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="useFiber" data-level="good"><code>useFiber</code><small>reuse an existing fiber</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="createWorkInProgress" data-level="good"><code>createWorkInProgress</code><small>make the draft copy of a fiber</small></button></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="createFiberFromTypeAndProps" data-level="good"><code>createFiberFromTypeAndProps</code><small>create a fiber for an element</small></button></li></ul></li><li><button type="button" class="map-node gl gl-must" data-gl="reconcileChildrenArray" data-level="must"><code>reconcileChildrenArray</code><small>diff a list of children</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="mapRemainingChildren" data-level="good"><code>mapRemainingChildren</code><small>index old children by key</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="placeChild" data-level="good"><code>placeChild</code><small>decide stay, move or insert</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="deleteChild" data-level="good"><code>deleteChild</code><small>mark a child for deletion</small></button></li></ul></li></ul></li></ul></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="completeUnitOfWork" data-level="good"><code>completeUnitOfWork</code><small>finish a fiber and climb</small></button><ul><li><button type="button" class="map-node gl gl-must" data-gl="completeWork" data-level="must"><code>completeWork</code><small>finish a fiber (going up)</small></button></li></ul></li></ul></li></ul></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="renderRootConcurrent" data-level="good"><code>renderRootConcurrent</code><small>render in 5ms slices</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="workLoopConcurrentByScheduler" data-level="good"><code>workLoopConcurrentByScheduler</code><small>process fibers until time’s up</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="shouldYield" data-level="good"><code>shouldYield</code><small>is my 5ms slice used up?</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="performUnitOfWork" data-level="good"><code>performUnitOfWork</code><small>work on one fiber</small></button></li></ul></li></ul></li></ul></li></ul></section><div class="map-between" aria-hidden="true">↓</div><section class="map-lane lane-commit"><header><b>4 · Commit phase</b><span>Synchronous, all at once, then effects</span></header><ul class="map-tree"><li><button type="button" class="map-node gl gl-must" data-gl="commitRoot" data-level="must"><code>commitRoot</code><small>apply the finished render</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="commitBeforeMutationEffects" data-level="skip"><code>commitBeforeMutationEffects</code><small>read the DOM before it changes</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="flushMutationEffects" data-level="good"><code>flushMutationEffects</code><small>write the DOM</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="commitMutationEffectsOnFiber" data-level="skip"><code>commitMutationEffectsOnFiber</code><small>apply one fiber’s DOM changes</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="commitPlacement" data-level="good"><code>commitPlacement</code><small>insert into the DOM</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="insertOrAppendPlacementNode" data-level="skip"><code>insertOrAppendPlacementNode</code><small>append or insert the real nodes</small></button></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="commitUpdate" data-level="good"><code>commitUpdate</code><small>update a DOM node’s attributes</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="commitDeletionEffects" data-level="good"><code>commitDeletionEffects</code><small>tear down a deleted subtree</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="removeChild" data-level="skip"><code>removeChild</code><small>remove a DOM node</small></button></li></ul></li></ul></li><li><span class="map-node map-plain" data-level="must"><code>root.current = finishedWork</code></span></li></ul></li><li><button type="button" class="map-node gl gl-good" data-gl="flushLayoutEffects" data-level="good"><code>flushLayoutEffects</code><small>run layout effects</small></button><ul><li><button type="button" class="map-node gl gl-skip" data-gl="commitLayoutEffectOnFiber" data-level="skip"><code>commitLayoutEffectOnFiber</code><small>one fiber’s layout work</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="commitHookEffectListMount" data-level="good"><code>commitHookEffectListMount</code><small>run effect setups</small></button></li></ul></li></ul></li><li><button type="button" class="map-node gl gl-must" data-gl="flushPassiveEffects" data-level="must"><code>flushPassiveEffects</code><small>run useEffect</small></button><ul><li><button type="button" class="map-node gl gl-good" data-gl="commitHookEffectListUnmount" data-level="good"><code>commitHookEffectListUnmount</code><small>run effect cleanups</small></button></li><li><button type="button" class="map-node gl gl-good" data-gl="commitHookEffectListMount" data-level="good"><code>commitHookEffectListMount</code><small>run effect setups</small></button></li></ul></li></ul></li></ul></section><figcaption>The main functions of React DOM 19.2.5, nested the way they call each other. Each lane is one step of every update: setup/event → scheduling → render → commit.</figcaption></figure>

## The ten names worth knowing

If you only remember ten, make it these. Everything else is a helper of one
of them.

1. `dispatchSetState`: what your `setState` really is. It queues and schedules.
2. `ensureRootIsScheduled`: makes sure one render is coming (batching happens here).
3. `performWorkOnRoot`: renders, then commits, the root.
4. `workLoopSync`: the loop that processes one fiber at a time.
5. `beginWork`: going down: bail out, or render this fiber.
6. `renderWithHooks`: calls your component.
7. `reconcileChildren`: compares the new elements with the old fibers.
8. `completeWork`: going up: create DOM nodes, bubble flags.
9. `commitRoot`: applies everything to the DOM, all at once.
10. `flushPassiveEffects`: runs your `useEffect`s.

## Flashcards

<figure class="fig flashcards" data-flashcards data-pagefind-ignore><div class="btn-row fc-top"><button type="button" class="btn" data-fc="must" aria-pressed="true">Must know</button><button type="button" class="btn btn-ghost" data-fc="all" aria-pressed="false">Must + good to know</button><span class="fc-stats"></span><button type="button" class="btn btn-ghost fc-reset" data-fc="reset">Reset</button></div><div class="fc-card"><div class="fc-front"></div><div class="fc-back" hidden></div></div><div class="btn-row fc-actions"><button type="button" class="btn" data-fc="show">Show answer</button><button type="button" class="btn btn-ghost" data-fc="again" hidden>↻ Again</button><button type="button" class="btn" data-fc="known" hidden>✓ I knew it</button></div><figcaption>Say the answer out loud first, then check. Cards you got wrong come back first. Progress is saved in this browser only.</figcaption></figure>

## Glossary

Every function and fiber field used in the notes, grouped by step. Must-know
names come first in each group.

### Setup

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-must" title="must"></span> `createRoot` | set up React on a DOM node | Creates the FiberRoot and the first fiber (HostRoot) for a container, and attaches React’s event listeners to it. Renders nothing. |
| <span class="lvl lvl-good" title="good"></span> `listenToAllSupportedEvents` | listen for every event on the root | Attaches one capture and one bubble listener per event type to the root container. This is event delegation: your onClick never becomes an addEventListener on the button. |
| <span class="lvl lvl-skip" title="skip"></span> `createFiberRoot` | create the root’s records | Allocates the FiberRoot (bookkeeping for one root) and its HostRoot fiber. |

### Event

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-good" title="good"></span> `dispatchDiscreteEvent` | React’s click/keydown listener | The root listener for discrete events (click, keydown, input…). Sets the event priority, finds the target fiber, collects onX props on the path and calls your handlers. |
| <span class="lvl lvl-skip" title="skip"></span> `dispatchEvent` | route a native event to handlers | Finds the fiber for the event target and runs the plugin event system that builds the SyntheticEvent. |

### Scheduling

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-must" title="must"></span> `dispatchSetState` | setState | The function your setState actually is. Creates an update, picks a lane, tries the eager bailout, queues the update and schedules a render. |
| <span class="lvl lvl-must" title="must"></span> `root.render` | ask React to render this element | Queues an update whose payload is the element on the HostRoot fiber and schedules a render. Returns before anything renders. |
| <span class="lvl lvl-good" title="good"></span> `ensureRootIsScheduled` | make sure a render is coming | Adds the root to the schedule and queues one microtask to process it. Later setStates in the same tick find it already scheduled: that’s batching. |
| <span class="lvl lvl-good" title="good"></span> `processRootScheduleInMicrotask` | decide when to render | Runs in the microtask. Sync lanes are rendered right there; other lanes get a Scheduler task at a matching priority. |
| <span class="lvl lvl-good" title="good"></span> `requestUpdateLane` | pick the update’s priority | Chooses the lane: SyncLane inside a click, DefaultLane outside events, a transition lane inside startTransition. |
| <span class="lvl lvl-good" title="good"></span> `scheduleCallback` | ask the Scheduler for a task | The Scheduler’s API: puts a task on a min-heap ordered by expiration time and runs it in a later macrotask. |
| <span class="lvl lvl-good" title="good"></span> `scheduleUpdateOnFiber` | mark the root as having work | Adds the lane to root.pendingLanes and makes sure the root is scheduled. |
| <span class="lvl lvl-skip" title="skip"></span> `dispatchSetStateInternal` | queue the state update | Computes the new state eagerly when the fiber has no pending work; if it’s Object.is-equal, it skips scheduling a render. |
| <span class="lvl lvl-skip" title="skip"></span> `enqueueConcurrentHookUpdate` | stash the update | Puts the update in a module-level array until the next render links it into the hook’s queue. |
| <span class="lvl lvl-skip" title="skip"></span> `performSyncWorkOnRoot` | render now (Sync lane) | The microtask’s entry point for Sync lanes: calls performWorkOnRoot. |
| <span class="lvl lvl-skip" title="skip"></span> `performWorkOnRootViaSchedulerTask` | render in a Scheduler task | The Scheduler task’s entry point for non-sync lanes: calls performWorkOnRoot. |
| <span class="lvl lvl-skip" title="skip"></span> `scheduleImmediateRootScheduleTask` | queue the microtask | Calls queueMicrotask(processRootScheduleInMicrotask). |
| <span class="lvl lvl-skip" title="skip"></span> `updateContainerImpl` | queue the root update | Creates the root update { element }, enqueues it and calls scheduleUpdateOnFiber. |

### Elements

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-must" title="must"></span> `jsx` | create an element object | What JSX compiles to (automatic runtime). Returns a plain object { $$typeof, type, key, ref, props }. It does not call the component. |
| <span class="lvl lvl-good" title="good"></span> `createElement` | create an element (classic) | The pre-React 17 way JSX compiled: children as extra arguments, props copied to remove key. Produces the same kind of object as jsx. |
| <span class="lvl lvl-good" title="good"></span> `jsxDEV` | create an element (development) | The development version of jsx: also records where the element was written (file, line) for warnings and DevTools. |
| <span class="lvl lvl-good" title="good"></span> `jsxs` | create an element with static children | The same as jsx in production; in development it skips the key warning for children written side by side in JSX. |

### Render phase

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-must" title="must"></span> `bailoutOnAlreadyFinishedWork` | skip this component | Skips calling the component. If childLanes says something below has work, the children are cloned and visited; otherwise the whole subtree is skipped. |
| <span class="lvl lvl-must" title="must"></span> `beginWork` | start work on a fiber (going down) | Decides what to do with one fiber: bail out if nothing changed, otherwise render it (call the component, or reconcile a DOM tag’s children). Returns the first child. |
| <span class="lvl lvl-must" title="must"></span> `completeWork` | finish a fiber (going up) | For DOM tags: creates the DOM node (detached) on mount and appends its children’s nodes, or flags an Update. For every fiber: bubbles subtreeFlags to the parent. |
| <span class="lvl lvl-must" title="must"></span> `reconcileChildren` | compare new elements with old fibers | Diffs what the component returned against the existing child fibers and decides what to reuse, create or delete. |
| <span class="lvl lvl-must" title="must"></span> `reconcileChildrenArray` | diff a list of children | The list diff: walk in step while keys match, then use a Map by key, and decide moves with lastPlacedIndex. |
| <span class="lvl lvl-must" title="must"></span> `renderWithHooks` | call your component | Installs the right hook implementations (mount or update), calls your component function, and returns the elements it produced. |
| <span class="lvl lvl-must" title="must"></span> `workLoopSync` | process fibers until done | The render loop: while (workInProgress !== null) performUnitOfWork(workInProgress). No recursion, one pointer. |
| <span class="lvl lvl-good" title="good"></span> `completeUnitOfWork` | finish a fiber and climb | Calls completeWork, then moves to the sibling, or up to the parent and completes that. |
| <span class="lvl lvl-good" title="good"></span> `createFiberFromTypeAndProps` | create a fiber for an element | Makes a new fiber and picks its tag from element.type: function → FunctionComponent, string → HostComponent, context → provider. |
| <span class="lvl lvl-good" title="good"></span> `createWorkInProgress` | make the draft copy of a fiber | Returns the fiber’s alternate, creating it the first time, with new props. This is double buffering. |
| <span class="lvl lvl-good" title="good"></span> `deleteChild` | mark a child for deletion | Adds the old fiber to the parent’s deletions list and flags the parent ChildDeletion. The DOM is removed later, in the commit. |
| <span class="lvl lvl-good" title="good"></span> `mapRemainingChildren` | index old children by key | Puts the remaining old fibers in a Map keyed by key (or index when there is no key). |
| <span class="lvl lvl-good" title="good"></span> `markUpdateLaneFromFiberToRoot` | leave a trail to the updated fiber | Sets lanes on the updated fiber and childLanes on every ancestor, so the work loop knows which paths to walk down. |
| <span class="lvl lvl-good" title="good"></span> `mountState` | useState on the first render | Creates the hook object and its update queue, stores the initial value, returns [state, setState]. |
| <span class="lvl lvl-good" title="good"></span> `performUnitOfWork` | work on one fiber | Calls beginWork on the fiber. If it returned a child, that’s next; otherwise completeUnitOfWork climbs up. |
| <span class="lvl lvl-good" title="good"></span> `performWorkOnRoot` | render, then commit, the root | Chooses the synchronous or time-sliced loop for the lanes, runs the render, and commits the result. |
| <span class="lvl lvl-good" title="good"></span> `placeChild` | decide stay, move or insert | Compares a reused fiber’s old index with lastPlacedIndex: smaller means move (Placement); a new fiber is an insert. |
| <span class="lvl lvl-good" title="good"></span> `prepareFreshStack` | start a render from the root | Creates the work-in-progress HostRoot and links queued updates in. If a half-built tree exists for other lanes, it is thrown away. |
| <span class="lvl lvl-good" title="good"></span> `propagateContextChanges` | find readers of a changed context | When a provider’s value changed, searches below for fibers that read that context and schedules them, even through memo. |
| <span class="lvl lvl-good" title="good"></span> `reconcileChildFibers` | diff the children | The entry point of child reconciliation: dispatches to the single-element, text or array case. |
| <span class="lvl lvl-good" title="good"></span> `reconcileSingleElement` | diff one child | Same key and same type → reuse the fiber; otherwise delete the old one and create a new fiber. |
| <span class="lvl lvl-good" title="good"></span> `renderRootConcurrent` | render in 5ms slices | Like renderRootSync but runs workLoopConcurrentByScheduler, which can pause. |
| <span class="lvl lvl-good" title="good"></span> `renderRootSync` | render without pausing | Prepares a fresh stack if needed and runs workLoopSync to the end. |
| <span class="lvl lvl-good" title="good"></span> `shouldYield` | is my 5ms slice used up? | Asked after every fiber in the concurrent loop. True after about 5ms, so React pauses and lets the browser paint and handle input. |
| <span class="lvl lvl-good" title="good"></span> `updateFunctionComponent` | render a function component | beginWork’s case for function components: renderWithHooks, then reconcile the returned elements. |
| <span class="lvl lvl-good" title="good"></span> `updateReducer` | useState on a re-render | Takes the hook from the current fiber and folds its queued updates into the new state. |
| <span class="lvl lvl-good" title="good"></span> `useFiber` | reuse an existing fiber | Same key and type: gets the fiber’s alternate (createWorkInProgress) with the new props. State and the DOM node are kept. |
| <span class="lvl lvl-good" title="good"></span> `workLoopConcurrentByScheduler` | process fibers until time’s up | The same loop, but it also stops when shouldYield() says the slice is used up. |
| <span class="lvl lvl-skip" title="skip"></span> `attemptEarlyBailoutIfNoScheduledUpdate` | try to skip early | The fast path in beginWork when props, context and the fiber’s own lanes say nothing changed. |
| <span class="lvl lvl-skip" title="skip"></span> `createFiberFromElement` | create a fiber for an element | A thin wrapper around createFiberFromTypeAndProps. |
| <span class="lvl lvl-skip" title="skip"></span> `createFiberFromText` | create a text fiber | Creates a HostText fiber for a string or number child. |
| <span class="lvl lvl-skip" title="skip"></span> `finishQueueingConcurrentUpdates` | link stashed updates into queues | Moves updates stashed by setState into their hooks’ circular queues and marks lanes up to the root. |
| <span class="lvl lvl-skip" title="skip"></span> `mountWorkInProgressHook` | append a hook | Creates a hook object and appends it to fiber.memoizedState. Hooks are matched by this order. |
| <span class="lvl lvl-skip" title="skip"></span> `readContext` | read a context value | What useContext calls: reads the nearest provider’s value and records a dependency on the fiber. |
| <span class="lvl lvl-skip" title="skip"></span> `updateFromMap` | find the old child by key | Looks the new element’s key up in the Map: reuse if found, create if not. |
| <span class="lvl lvl-skip" title="skip"></span> `updateSlot` | compare one list position | In the first pass: returns null when keys differ (ends the fast path), otherwise reuses or replaces. |
| <span class="lvl lvl-skip" title="skip"></span> `updateWorkInProgressHook` | take the next hook | Walks the current fiber’s hook list in step with the calls. Calling hooks in a different order breaks here. |

### Commit phase

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-must" title="must"></span> `commitRoot` | apply the finished render | Runs the commit: before mutation → mutation (DOM writes) → swap trees → layout effects, then schedules or flushes passive effects. |
| <span class="lvl lvl-good" title="good"></span> `commitDeletionEffects` | tear down a deleted subtree | Walks a deleted subtree parent-first: detaches refs, runs layout cleanups, then removes the top DOM node. |
| <span class="lvl lvl-good" title="good"></span> `commitPlacement` | insert into the DOM | Inserts a new or moved fiber’s DOM nodes (descending through components to the real nodes) with appendChild or insertBefore. |
| <span class="lvl lvl-good" title="good"></span> `commitUpdate` | update a DOM node’s attributes | Compares old and new props of a DOM element and writes only what changed. |
| <span class="lvl lvl-good" title="good"></span> `flushLayoutEffects` | run layout effects | The layout phase: attaches refs and runs useLayoutEffect setups and componentDidMount/Update, child before parent, before paint. |
| <span class="lvl lvl-good" title="good"></span> `flushMutationEffects` | write the DOM | The mutation phase: inserts, updates and removes DOM nodes as flagged, runs layout cleanups, then sets root.current = finishedWork. |
| <span class="lvl lvl-skip" title="skip"></span> `commitBeforeMutationEffects` | read the DOM before it changes | Runs getSnapshotBeforeUpdate and focus bookkeeping while the old UI is still in the DOM. |
| <span class="lvl lvl-skip" title="skip"></span> `commitLayoutEffectOnFiber` | one fiber’s layout work | Attaches the ref and runs the layout effects of one fiber. |
| <span class="lvl lvl-skip" title="skip"></span> `commitMutationEffectsOnFiber` | apply one fiber’s DOM changes | Walks the flagged fibers and performs their Placement, Update and ChildDeletion work. |
| <span class="lvl lvl-skip" title="skip"></span> `commitTextUpdate` | change a text node | Sets a text node’s value. |
| <span class="lvl lvl-skip" title="skip"></span> `flushSpawnedWork` | schedule what comes after the commit | Decides whether passive effects run now (Sync lanes) or in a later task. |
| <span class="lvl lvl-skip" title="skip"></span> `insertOrAppendPlacementNode` | append or insert the real nodes | For a DOM fiber calls appendChild/insertBefore; for a component fiber descends to its children. |
| <span class="lvl lvl-skip" title="skip"></span> `removeChild` | remove a DOM node | The DOM call that removes the top node of a deleted subtree. |

### Effects

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-must" title="must"></span> `flushPassiveEffects` | run useEffect | Runs all useEffect cleanups, then all setups. Normally after paint in a separate task; for discrete events like clicks, at the end of the commit. |
| <span class="lvl lvl-good" title="good"></span> `commitHookEffectListMount` | run effect setups | Runs the setup functions of a fiber’s effects that match the flags (Layout or Passive) and changed deps. |
| <span class="lvl lvl-good" title="good"></span> `commitHookEffectListUnmount` | run effect cleanups | Runs the cleanup functions of a fiber’s effects that match the flags, before the new setups. |
| <span class="lvl lvl-skip" title="skip"></span> `flushPendingEffects` | finish leftover commit work | Flushes any commit phase or passive effects still pending before new work starts. |

### Fiber field

| Name | In plain English | What it does |
|---|---|---|
| <span class="lvl lvl-must" title="must"></span> `workInProgress` | the fiber being worked on | Both the draft tree being rendered and the work loop’s one pointer to the next fiber to process. |
| <span class="lvl lvl-good" title="good"></span> `alternate` | the fiber’s other copy | Links a fiber in the current tree to its counterpart in the work-in-progress tree (double buffering). |
| <span class="lvl lvl-good" title="good"></span> `childLanes` | work pending below | A bitmask on each fiber saying that something in its subtree has updates. Zero means the whole subtree can be skipped. |
| <span class="lvl lvl-good" title="good"></span> `flags` | what the commit must do here | Bits on a fiber such as Placement, Update, ChildDeletion, Passive: recorded in render, performed in commit. |
| <span class="lvl lvl-good" title="good"></span> `lanes` | this fiber’s pending priorities | A bitmask of update priorities pending on the fiber itself. |
| <span class="lvl lvl-good" title="good"></span> `lastPlacedIndex` | rightmost position kept in place | During the list diff: the largest old index kept so far. A reused child with a smaller old index has to move. |
| <span class="lvl lvl-good" title="good"></span> `memoizedProps` | props from the last render | The props the fiber rendered with last time. Compared by reference to decide whether to bail out. |
| <span class="lvl lvl-good" title="good"></span> `memoizedState` | the component’s hooks | On a function component fiber: the head of its hook list. Each hook stores its value here, in call order. |
| <span class="lvl lvl-good" title="good"></span> `pendingProps` | props for this render | The new props the fiber is being rendered with. |
| <span class="lvl lvl-good" title="good"></span> `subtreeFlags` | changes somewhere below | The flags of all descendants ORed together, so the commit can skip subtrees with nothing to do. |
| <span class="lvl lvl-skip" title="skip"></span> `stateNode` | the real DOM node | For a DOM fiber, the DOM element; for a class, the instance; for HostRoot, the FiberRoot. |
| <span class="lvl lvl-skip" title="skip"></span> `updateQueue` | queued effects or updates | On function components, the circular list of effects the commit walks. |

