// The React internals glossary: one entry per function or fiber field that
// the notes mention. Drives the hover cards, the "names off" reading mode,
// the engine map and the flashcards.
//
// phase: setup · event · schedule · element · render · commit · effects · data · api (public APIs, used by the non-internals modules)
// level: must (explain it out loud) · good (helps) · skip (implementation detail)
// plain: a short phrase that replaces the name in "names off" mode
// what:  one or two sentences
// calls / calledBy: the main relationships (not exhaustive)
// best:  the card that explains it best (slug)

const E = (name, phase, level, plain, what, extra = {}) => ({ name, phase, level, plain, what, calls: [], calledBy: [], ...extra })
const A = (name, plain, what, best, level = 'must') => E(name, 'api', level, plain, what, { best })

export const GLOSSARY = [
	// ─── Setup ──────────────────────────────────────────────────────────────
	E('createRoot', 'setup', 'must', 'set up React on a DOM node', 'Creates the FiberRoot and the first fiber (HostRoot) for a container, and attaches React’s event listeners to it. Renders nothing.', { calls: ['createFiberRoot', 'listenToAllSupportedEvents'], best: 'how-react-works' }),
	E('createFiberRoot', 'setup', 'skip', 'create the root’s records', 'Allocates the FiberRoot (bookkeeping for one root) and its HostRoot fiber.', { calledBy: ['createRoot'], best: 'how-react-works' }),
	E('listenToAllSupportedEvents', 'setup', 'good', 'listen for every event on the root', 'Attaches one capture and one bubble listener per event type to the root container. This is event delegation: your onClick never becomes an addEventListener on the button.', { calledBy: ['createRoot'], best: 'how-react-works' }),
	E('root.render', 'schedule', 'must', 'ask React to render this element', 'Queues an update whose payload is the element on the HostRoot fiber and schedules a render. Returns before anything renders.', { calls: ['requestUpdateLane', 'updateContainerImpl'], best: 'how-react-works' }),
	E('updateContainerImpl', 'schedule', 'skip', 'queue the root update', 'Creates the root update { element }, enqueues it and calls scheduleUpdateOnFiber.', { calledBy: ['root.render'], calls: ['scheduleUpdateOnFiber'], best: 'how-react-works' }),

	// ─── Elements ───────────────────────────────────────────────────────────
	E('jsx', 'element', 'must', 'create an element object', 'What JSX compiles to (automatic runtime). Returns a plain object { $$typeof, type, key, ref, props }. It does not call the component.', { calledBy: ['your component'], best: 'how-react-works' }),
	E('jsxs', 'element', 'good', 'create an element with static children', 'The same as jsx in production; in development it skips the key warning for children written side by side in JSX.', { calledBy: ['your component'], best: 'how-react-works' }),
	E('jsxDEV', 'element', 'good', 'create an element (development)', 'The development version of jsx: also records where the element was written (file, line) for warnings and DevTools.', { calledBy: ['your component'], best: 'how-react-works' }),
	E('createElement', 'element', 'must', 'create an element', 'Returns a plain object describing UI: { $$typeof, type, key, props }. What JSX compiled to before the automatic runtime; children go in as extra arguments.', { best: 'raw-react-apis' }),

	// ─── Events ─────────────────────────────────────────────────────────────
	E('dispatchDiscreteEvent', 'event', 'good', 'React’s click/keydown listener', 'The root listener for discrete events (click, keydown, input…). Sets the event priority, finds the target fiber, collects onX props on the path and calls your handlers.', { calls: ['dispatchEvent'], best: 'a-state-update-end-to-end' }),
	E('dispatchEvent', 'event', 'skip', 'route a native event to handlers', 'Finds the fiber for the event target and runs the plugin event system that builds the SyntheticEvent.', { calledBy: ['dispatchDiscreteEvent'], best: 'a-state-update-end-to-end' }),

	// ─── Scheduling ─────────────────────────────────────────────────────────
	E('dispatchSetState', 'schedule', 'must', 'setState', 'The function your setState actually is. Creates an update, picks a lane, tries the eager bailout, queues the update and schedules a render.', { calls: ['requestUpdateLane', 'dispatchSetStateInternal', 'scheduleUpdateOnFiber'], calledBy: ['your event handler'], best: 'hooks-under-the-hood' }),
	E('dispatchSetStateInternal', 'schedule', 'skip', 'queue the state update', 'Computes the new state eagerly when the fiber has no pending work; if it’s Object.is-equal, it skips scheduling a render.', { calledBy: ['dispatchSetState'], calls: ['enqueueConcurrentHookUpdate', 'scheduleUpdateOnFiber'], best: 'hooks-under-the-hood' }),
	E('requestUpdateLane', 'schedule', 'good', 'pick the update’s priority', 'Chooses the lane: SyncLane inside a click, DefaultLane outside events, a transition lane inside startTransition.', { calledBy: ['dispatchSetState', 'root.render'], best: 'scheduler-lanes-and-batching' }),
	E('enqueueConcurrentHookUpdate', 'schedule', 'skip', 'stash the update', 'Puts the update in a module-level array until the next render links it into the hook’s queue.', { calledBy: ['dispatchSetStateInternal'], best: 'scheduler-lanes-and-batching' }),
	E('scheduleUpdateOnFiber', 'schedule', 'good', 'mark the root as having work', 'Adds the lane to root.pendingLanes and makes sure the root is scheduled.', { calls: ['ensureRootIsScheduled'], calledBy: ['dispatchSetState', 'updateContainerImpl'], best: 'scheduler-lanes-and-batching' }),
	E('ensureRootIsScheduled', 'schedule', 'good', 'make sure a render is coming', 'Adds the root to the schedule and queues one microtask to process it. Later setStates in the same tick find it already scheduled: that’s batching.', { calledBy: ['scheduleUpdateOnFiber'], calls: ['scheduleImmediateRootScheduleTask'], best: 'scheduler-lanes-and-batching' }),
	E('scheduleImmediateRootScheduleTask', 'schedule', 'skip', 'queue the microtask', 'Calls queueMicrotask(processRootScheduleInMicrotask).', { calledBy: ['ensureRootIsScheduled'], best: 'scheduler-lanes-and-batching' }),
	E('processRootScheduleInMicrotask', 'schedule', 'good', 'decide when to render', 'Runs in the microtask. Sync lanes are rendered right there; other lanes get a Scheduler task at a matching priority.', { calls: ['performSyncWorkOnRoot', 'scheduleCallback'], best: 'scheduler-lanes-and-batching' }),
	E('scheduleCallback', 'schedule', 'good', 'ask the Scheduler for a task', 'The Scheduler’s API: puts a task on a min-heap ordered by expiration time and runs it in a later macrotask.', { calledBy: ['processRootScheduleInMicrotask'], best: 'scheduler-lanes-and-batching' }),
	E('performSyncWorkOnRoot', 'schedule', 'skip', 'render now (Sync lane)', 'The microtask’s entry point for Sync lanes: calls performWorkOnRoot.', { calls: ['performWorkOnRoot'], best: 'a-state-update-end-to-end' }),
	E('performWorkOnRootViaSchedulerTask', 'schedule', 'skip', 'render in a Scheduler task', 'The Scheduler task’s entry point for non-sync lanes: calls performWorkOnRoot.', { calls: ['performWorkOnRoot'], best: 'how-react-works' }),
	E('shouldYield', 'render', 'good', 'is my 5ms slice used up?', 'Asked after every fiber in the concurrent loop. True after about 5ms, so React pauses and lets the browser paint and handle input.', { calledBy: ['workLoopConcurrentByScheduler'], best: 'scheduler-lanes-and-batching' }),

	// ─── Render ─────────────────────────────────────────────────────────────
	E('performWorkOnRoot', 'render', 'good', 'render, then commit, the root', 'Chooses the synchronous or time-sliced loop for the lanes, runs the render, and commits the result.', { calls: ['renderRootSync', 'renderRootConcurrent', 'commitRoot'], best: 'scheduler-lanes-and-batching' }),
	E('renderRootSync', 'render', 'good', 'render without pausing', 'Prepares a fresh stack if needed and runs workLoopSync to the end.', { calledBy: ['performWorkOnRoot'], calls: ['prepareFreshStack', 'workLoopSync'], best: 'the-work-loop' }),
	E('renderRootConcurrent', 'render', 'good', 'render in 5ms slices', 'Like renderRootSync but runs workLoopConcurrentByScheduler, which can pause.', { calledBy: ['performWorkOnRoot'], calls: ['workLoopConcurrentByScheduler'], best: 'scheduler-lanes-and-batching' }),
	E('prepareFreshStack', 'render', 'good', 'start a render from the root', 'Creates the work-in-progress HostRoot and links queued updates in. If a half-built tree exists for other lanes, it is thrown away.', { calledBy: ['renderRootSync'], calls: ['createWorkInProgress', 'finishQueueingConcurrentUpdates'], best: 'scheduler-lanes-and-batching' }),
	E('finishQueueingConcurrentUpdates', 'render', 'skip', 'link stashed updates into queues', 'Moves updates stashed by setState into their hooks’ circular queues and marks lanes up to the root.', { calledBy: ['prepareFreshStack'], calls: ['markUpdateLaneFromFiberToRoot'], best: 'hooks-under-the-hood' }),
	E('markUpdateLaneFromFiberToRoot', 'render', 'good', 'leave a trail to the updated fiber', 'Sets lanes on the updated fiber and childLanes on every ancestor, so the work loop knows which paths to walk down.', { calledBy: ['finishQueueingConcurrentUpdates'], best: 'the-work-loop' }),
	E('workLoopSync', 'render', 'must', 'process fibers until done', 'The render loop: while (workInProgress !== null) performUnitOfWork(workInProgress). No recursion, one pointer.', { calledBy: ['renderRootSync'], calls: ['performUnitOfWork'], best: 'the-work-loop' }),
	E('workLoopConcurrentByScheduler', 'render', 'good', 'process fibers until time’s up', 'The same loop, but it also stops when shouldYield() says the slice is used up.', { calledBy: ['renderRootConcurrent'], calls: ['performUnitOfWork', 'shouldYield'], best: 'the-work-loop' }),
	E('performUnitOfWork', 'render', 'good', 'work on one fiber', 'Calls beginWork on the fiber. If it returned a child, that’s next; otherwise completeUnitOfWork climbs up.', { calledBy: ['workLoopSync'], calls: ['beginWork', 'completeUnitOfWork'], best: 'the-work-loop' }),
	E('beginWork', 'render', 'must', 'start work on a fiber (going down)', 'Decides what to do with one fiber: bail out if nothing changed, otherwise render it (call the component, or reconcile a DOM tag’s children). Returns the first child.', { calledBy: ['performUnitOfWork'], calls: ['bailoutOnAlreadyFinishedWork', 'updateFunctionComponent', 'reconcileChildren'], best: 'the-work-loop' }),
	E('bailoutOnAlreadyFinishedWork', 'render', 'must', 'skip this component', 'Skips calling the component. If childLanes says something below has work, the children are cloned and visited; otherwise the whole subtree is skipped.', { calledBy: ['beginWork'], best: 'the-work-loop' }),
	E('attemptEarlyBailoutIfNoScheduledUpdate', 'render', 'skip', 'try to skip early', 'The fast path in beginWork when props, context and the fiber’s own lanes say nothing changed.', { calledBy: ['beginWork'], calls: ['bailoutOnAlreadyFinishedWork'], best: 'the-work-loop' }),
	E('updateFunctionComponent', 'render', 'good', 'render a function component', 'beginWork’s case for function components: renderWithHooks, then reconcile the returned elements.', { calledBy: ['beginWork'], calls: ['renderWithHooks', 'reconcileChildren'], best: 'how-react-works' }),
	E('renderWithHooks', 'render', 'must', 'call your component', 'Installs the right hook implementations (mount or update), calls your component function, and returns the elements it produced.', { calledBy: ['updateFunctionComponent'], calls: ['your component'], best: 'hooks-under-the-hood' }),
	E('mountState', 'render', 'good', 'useState on the first render', 'Creates the hook object and its update queue, stores the initial value, returns [state, setState].', { calledBy: ['your component'], calls: ['mountWorkInProgressHook'], best: 'hooks-under-the-hood' }),
	E('updateReducer', 'render', 'good', 'useState on a re-render', 'Takes the hook from the current fiber and folds its queued updates into the new state.', { calledBy: ['your component'], calls: ['updateWorkInProgressHook'], best: 'hooks-under-the-hood' }),
	E('mountWorkInProgressHook', 'render', 'skip', 'append a hook', 'Creates a hook object and appends it to fiber.memoizedState. Hooks are matched by this order.', { best: 'hooks-under-the-hood' }),
	E('updateWorkInProgressHook', 'render', 'skip', 'take the next hook', 'Walks the current fiber’s hook list in step with the calls. Calling hooks in a different order breaks here.', { best: 'hooks-under-the-hood' }),
	E('reconcileChildren', 'render', 'must', 'compare new elements with old fibers', 'Diffs what the component returned against the existing child fibers and decides what to reuse, create or delete.', { calledBy: ['beginWork', 'updateFunctionComponent'], calls: ['reconcileChildFibers'], best: 'reconciliation' }),
	E('reconcileChildFibers', 'render', 'good', 'diff the children', 'The entry point of child reconciliation: dispatches to the single-element, text or array case.', { aliases: ['reconcileChildFibersImpl'], calledBy: ['reconcileChildren'], calls: ['reconcileSingleElement', 'reconcileChildrenArray'], best: 'reconciliation' }),
	E('reconcileSingleElement', 'render', 'good', 'diff one child', 'Same key and same type → reuse the fiber; otherwise delete the old one and create a new fiber.', { calledBy: ['reconcileChildFibers'], calls: ['useFiber', 'createFiberFromElement'], best: 'reconciliation' }),
	E('reconcileChildrenArray', 'render', 'must', 'diff a list of children', 'The list diff: walk in step while keys match, then use a Map by key, and decide moves with lastPlacedIndex.', { calledBy: ['reconcileChildFibers'], calls: ['updateSlot', 'mapRemainingChildren', 'updateFromMap', 'placeChild', 'deleteChild'], best: 'child-reconciliation-algorithm' }),
	E('updateSlot', 'render', 'skip', 'compare one list position', 'In the first pass: returns null when keys differ (ends the fast path), otherwise reuses or replaces.', { calledBy: ['reconcileChildrenArray'], best: 'child-reconciliation-algorithm' }),
	E('mapRemainingChildren', 'render', 'good', 'index old children by key', 'Puts the remaining old fibers in a Map keyed by key (or index when there is no key).', { calledBy: ['reconcileChildrenArray'], best: 'child-reconciliation-algorithm' }),
	E('updateFromMap', 'render', 'skip', 'find the old child by key', 'Looks the new element’s key up in the Map: reuse if found, create if not.', { calledBy: ['reconcileChildrenArray'], best: 'child-reconciliation-algorithm' }),
	E('placeChild', 'render', 'good', 'decide stay, move or insert', 'Compares a reused fiber’s old index with lastPlacedIndex: smaller means move (Placement); a new fiber is an insert.', { calledBy: ['reconcileChildrenArray'], best: 'child-reconciliation-algorithm' }),
	E('deleteChild', 'render', 'good', 'mark a child for deletion', 'Adds the old fiber to the parent’s deletions list and flags the parent ChildDeletion. The DOM is removed later, in the commit.', { calledBy: ['reconcileChildrenArray', 'reconcileSingleElement'], best: 'child-reconciliation-algorithm' }),
	E('createFiberFromTypeAndProps', 'render', 'good', 'create a fiber for an element', 'Makes a new fiber and picks its tag from element.type: function → FunctionComponent, string → HostComponent, context → provider.', { calledBy: ['reconcileSingleElement', 'reconcileChildrenArray'], best: 'how-react-works' }),
	E('createFiberFromElement', 'render', 'skip', 'create a fiber for an element', 'A thin wrapper around createFiberFromTypeAndProps.', { calls: ['createFiberFromTypeAndProps'], best: 'reconciliation' }),
	E('createFiberFromText', 'render', 'skip', 'create a text fiber', 'Creates a HostText fiber for a string or number child.', { best: 'how-react-works' }),
	E('useFiber', 'render', 'good', 'reuse an existing fiber', 'Same key and type: gets the fiber’s alternate (createWorkInProgress) with the new props. State and the DOM node are kept.', { calledBy: ['reconcileSingleElement', 'reconcileChildrenArray'], calls: ['createWorkInProgress'], best: 'reconciliation' }),
	E('createWorkInProgress', 'render', 'good', 'make the draft copy of a fiber', 'Returns the fiber’s alternate, creating it the first time, with new props. This is double buffering.', { calledBy: ['useFiber', 'prepareFreshStack'], best: 'react-fiber' }),
	E('completeUnitOfWork', 'render', 'good', 'finish a fiber and climb', 'Calls completeWork, then moves to the sibling, or up to the parent and completes that.', { calledBy: ['performUnitOfWork'], calls: ['completeWork'], best: 'the-work-loop' }),
	E('completeWork', 'render', 'must', 'finish a fiber (going up)', 'For DOM tags: creates the DOM node (detached) on mount and appends its children’s nodes, or flags an Update. For every fiber: bubbles subtreeFlags to the parent.', { calledBy: ['completeUnitOfWork'], best: 'the-work-loop' }),
	E('propagateContextChanges', 'render', 'good', 'find readers of a changed context', 'When a provider’s value changed, searches below for fibers that read that context and schedules them, even through memo.', { best: 'how-react-works' }),
	E('readContext', 'render', 'skip', 'read a context value', 'What useContext calls: reads the nearest provider’s value and records a dependency on the fiber.', { best: 'hooks-under-the-hood' }),

	// ─── Commit ─────────────────────────────────────────────────────────────
	E('commitRoot', 'commit', 'must', 'apply the finished render', 'Runs the commit: before mutation → mutation (DOM writes) → swap trees → layout effects, then schedules or flushes passive effects.', { calledBy: ['performWorkOnRoot'], calls: ['commitBeforeMutationEffects', 'flushMutationEffects', 'flushLayoutEffects', 'flushPassiveEffects'], best: 'commit-phase-and-effects' }),
	E('commitBeforeMutationEffects', 'commit', 'skip', 'read the DOM before it changes', 'Runs getSnapshotBeforeUpdate and focus bookkeeping while the old UI is still in the DOM.', { calledBy: ['commitRoot'], best: 'commit-phase-and-effects' }),
	E('flushMutationEffects', 'commit', 'good', 'write the DOM', 'The mutation phase: inserts, updates and removes DOM nodes as flagged, runs layout cleanups, then sets root.current = finishedWork.', { calledBy: ['commitRoot'], calls: ['commitMutationEffectsOnFiber'], best: 'commit-phase-and-effects' }),
	E('commitMutationEffectsOnFiber', 'commit', 'skip', 'apply one fiber’s DOM changes', 'Walks the flagged fibers and performs their Placement, Update and ChildDeletion work.', { calledBy: ['flushMutationEffects'], calls: ['commitPlacement', 'commitUpdate', 'commitDeletionEffects'], best: 'commit-phase-and-effects' }),
	E('commitPlacement', 'commit', 'good', 'insert into the DOM', 'Inserts a new or moved fiber’s DOM nodes (descending through components to the real nodes) with appendChild or insertBefore.', { calledBy: ['commitMutationEffectsOnFiber'], calls: ['insertOrAppendPlacementNode'], best: 'commit-phase-and-effects' }),
	E('insertOrAppendPlacementNode', 'commit', 'skip', 'append or insert the real nodes', 'For a DOM fiber calls appendChild/insertBefore; for a component fiber descends to its children.', { aliases: ['insertOrAppendPlacementNodeIntoContainer'], calledBy: ['commitPlacement'], best: 'how-react-works' }),
	E('commitUpdate', 'commit', 'good', 'update a DOM node’s attributes', 'Compares old and new props of a DOM element and writes only what changed.', { calledBy: ['commitMutationEffectsOnFiber'], best: 'reconciliation' }),
	E('commitTextUpdate', 'commit', 'skip', 'change a text node', 'Sets a text node’s value.', { best: 'how-react-works' }),
	E('commitDeletionEffects', 'commit', 'good', 'tear down a deleted subtree', 'Walks a deleted subtree parent-first: detaches refs, runs layout cleanups, then removes the top DOM node.', { aliases: ['commitDeletionEffectsOnFiber'], calledBy: ['commitMutationEffectsOnFiber'], calls: ['removeChild'], best: 'commit-phase-and-effects' }),
	E('removeChild', 'commit', 'skip', 'remove a DOM node', 'The DOM call that removes the top node of a deleted subtree.', { calledBy: ['commitDeletionEffects'], best: 'how-react-works' }),
	E('flushLayoutEffects', 'commit', 'good', 'run layout effects', 'The layout phase: attaches refs and runs useLayoutEffect setups and componentDidMount/Update, child before parent, before paint.', { calledBy: ['commitRoot'], calls: ['commitLayoutEffectOnFiber'], best: 'commit-phase-and-effects' }),
	E('commitLayoutEffectOnFiber', 'commit', 'skip', 'one fiber’s layout work', 'Attaches the ref and runs the layout effects of one fiber.', { calledBy: ['flushLayoutEffects'], calls: ['commitHookEffectListMount'], best: 'commit-phase-and-effects' }),
	E('commitHookEffectListMount', 'effects', 'good', 'run effect setups', 'Runs the setup functions of a fiber’s effects that match the flags (Layout or Passive) and changed deps.', { best: 'commit-phase-and-effects' }),
	E('commitHookEffectListUnmount', 'effects', 'good', 'run effect cleanups', 'Runs the cleanup functions of a fiber’s effects that match the flags, before the new setups.', { best: 'commit-phase-and-effects' }),
	E('flushPassiveEffects', 'effects', 'must', 'run useEffect', 'Runs all useEffect cleanups, then all setups. Normally after paint in a separate task; for discrete events like clicks, at the end of the commit.', { calledBy: ['commitRoot'], calls: ['commitHookEffectListUnmount', 'commitHookEffectListMount'], best: 'commit-phase-and-effects' }),
	E('flushPendingEffects', 'effects', 'skip', 'finish leftover commit work', 'Flushes any commit phase or passive effects still pending before new work starts.', { best: 'commit-phase-and-effects' }),
	E('flushSpawnedWork', 'commit', 'skip', 'schedule what comes after the commit', 'Decides whether passive effects run now (Sync lanes) or in a later task.', { best: 'commit-phase-and-effects' }),

	// ─── Fiber fields and key data ──────────────────────────────────────────
	E('workInProgress', 'data', 'must', 'the fiber being worked on', 'Both the draft tree being rendered and the work loop’s one pointer to the next fiber to process.', { best: 'react-fiber' }),
	E('alternate', 'data', 'good', 'the fiber’s other copy', 'Links a fiber in the current tree to its counterpart in the work-in-progress tree (double buffering).', { best: 'react-fiber' }),
	E('memoizedState', 'data', 'good', 'the component’s hooks', 'On a function component fiber: the head of its hook list. Each hook stores its value here, in call order.', { best: 'hooks-under-the-hood' }),
	E('memoizedProps', 'data', 'good', 'props from the last render', 'The props the fiber rendered with last time. Compared by reference to decide whether to bail out.', { best: 'react-fiber' }),
	E('pendingProps', 'data', 'good', 'props for this render', 'The new props the fiber is being rendered with.', { best: 'react-fiber' }),
	E('childLanes', 'data', 'good', 'work pending below', 'A bitmask on each fiber saying that something in its subtree has updates. Zero means the whole subtree can be skipped.', { best: 'the-work-loop' }),
	E('lanes', 'data', 'good', 'this fiber’s pending priorities', 'A bitmask of update priorities pending on the fiber itself.', { best: 'scheduler-lanes-and-batching' }),
	E('subtreeFlags', 'data', 'good', 'changes somewhere below', 'The flags of all descendants ORed together, so the commit can skip subtrees with nothing to do.', { best: 'the-work-loop' }),
	E('flags', 'data', 'good', 'what the commit must do here', 'Bits on a fiber such as Placement, Update, ChildDeletion, Passive: recorded in render, performed in commit.', { best: 'react-fiber' }),
	E('stateNode', 'data', 'skip', 'the real DOM node', 'For a DOM fiber, the DOM element; for a class, the instance; for HostRoot, the FiberRoot.', { best: 'react-fiber' }),
	E('updateQueue', 'data', 'skip', 'queued effects or updates', 'On function components, the circular list of effects the commit walks.', { best: 'react-fiber' }),
	E('lastPlacedIndex', 'data', 'good', 'rightmost position kept in place', 'During the list diff: the largest old index kept so far. A reused child with a smaller old index has to move.', { best: 'child-reconciliation-algorithm' }),
	// ─── Public React APIs (Fundamentals and later modules) ───────────────────
	A('key', 'element identity', 'A special prop that tells React which element is which among siblings. Not passed to the component: React keeps it on the element. Changing it remounts the element.', 'rendering-arrays'),
	A('Fragment', 'group without a wrapper', '<>…</> groups siblings into one element without adding a DOM node.', 'using-jsx'),
	A('dangerouslySetInnerHTML', 'insert raw HTML', 'The opt-in way to set innerHTML. React escapes every string otherwise, so this name is deliberately alarming.', 'hello-world-in-js'),
	A('defaultValue', 'starting value only', 'Sets an input’s first value; after that the browser owns it and the user can edit it (uncontrolled). defaultChecked does the same for checkboxes and radios.', 'inputs'),
	A('defaultChecked', 'starting checked state', 'The checkbox/radio version of defaultValue.', 'inputs', 'good'),
	A('FormData', 'the form’s fields as key/value pairs', 'A browser API that reads every named field of a form. Unchecked checkboxes and empty radio groups are missing from it.', 'forms'),
	A('ErrorBoundary', 'catch render errors below', 'A component (from react-error-boundary) that shows a fallback when a component below it throws while rendering.', 'error-boundaries'),
	A('useErrorBoundary', 'reach the nearest boundary', 'Hook from react-error-boundary; showBoundary(error) sends errors from event handlers or async code to the nearest ErrorBoundary.', 'error-boundaries', 'good'),
	A('showBoundary', 'send an error to the boundary', 'Hands an error the boundary can’t see (event handler, promise) to the nearest ErrorBoundary.', 'error-boundaries', 'good'),
	A('resetErrorBoundary', 'try again', 'Clears the caught error and mounts the boundary’s children again from scratch (their state is gone).', 'error-boundaries', 'good'),
	A('satisfies', 'check without widening', 'TypeScript operator: checks a value against a type but keeps the value’s own, narrower type.', 'typescript-with-react', 'good'),
	A('ComponentProps', 'all props of an element', 'React.ComponentProps<\'span\'> is the full prop type of a native element: handy for components that wrap one.', 'typescript-with-react', 'good'),
	A('useState', 'remembered value', 'Returns [value, setValue]. React keeps the value between renders; calling setValue queues an update and a re-render. Pass a function to compute the first value only once.', 'managing-ui-state'),
	A('useEffect', 'sync with the outside world', 'Runs your function after React commits a render, and again when a dependency changes. The function it returns (cleanup) runs before the next run and on unmount.', 'side-effects'),
	A('useLayoutEffect', 'effect before paint', 'Like useEffect, but runs right after the DOM is updated and before the browser paints. For measuring or adjusting the DOM without flicker.', 'react-lifecycle', 'good'),
	A('useRef', 'a box that survives renders', 'Returns { current }: the same object every render. Changing .current doesn’t re-render. Pass it as ref to get a DOM node.', 'dom-refs-and-effect-dependencies'),
	A('useId', 'a unique id per component', 'Returns an id that is unique on the page and the same on server and client. For label/input and aria-* pairs, not for list keys.', 'the-useid-hook', 'good'),
	A('useReducer', 'state with named updates', 'Returns [state, dispatch]. dispatch(action) asks React to compute the next state with your reducer(state, action).', 'usestate-vs-usereducer'),
	A('useMemo', 'remember a computed value', 'Recomputes only when its dependencies change; otherwise returns the same value (and object identity) as last render.', 'react-re-rendering'),
	A('useCallback', 'remember a function', 'Returns the same function between renders until a dependency changes. useCallback(fn, deps) is useMemo(() => fn, deps).', 'react-re-rendering'),
	A('memo', 'skip if props are the same', 'Wraps a component so it doesn’t re-render when its parent does, as long as every prop is Object.is-equal to last time.', 'react-re-rendering'),
	A('StrictMode', 'development checks', 'In development, renders components twice and runs effects setup → cleanup → setup once more on mount, to expose impure renders and missing cleanups.', 'react-lifecycle', 'good'),
	A('Object.is', 'React’s equality check', 'How React compares dependencies, memo props and state: by value for primitives, by identity for objects, arrays and functions.', 'dom-refs-and-effect-dependencies', 'good'),
]

/** name (or alias) → entry */
export const BY_NAME = new Map()
for (const e of GLOSSARY) {
	BY_NAME.set(e.name, e)
	for (const a of e.aliases ?? []) BY_NAME.set(a, e)
}

export const PHASE_LABEL = {
	setup: 'setup',
	event: 'event',
	schedule: 'scheduling',
	element: 'elements',
	render: 'render phase',
	commit: 'commit phase',
	effects: 'effects',
	data: 'fiber field',
	api: 'React API',
}

/** The compact form shipped to the browser (no relationships that point nowhere). */
export function glossaryJson() {
	const names = new Set(GLOSSARY.map((e) => e.name))
	return JSON.stringify(
		Object.fromEntries(
			[...BY_NAME.entries()].map(([key, e]) => [
				key,
				{ n: e.name, p: e.phase, l: e.level, pl: e.plain, w: e.what, c: e.calls.filter((x) => names.has(x) || x === 'your component'), cb: e.calledBy.filter((x) => names.has(x) || x.startsWith('your')), b: e.best ?? null },
			]),
		),
	)
}
