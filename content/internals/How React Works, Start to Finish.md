---
source: https://github.com/facebook/react/tree/v19.2.5/packages
---

# How React Works, Start to Finish

> One small, real app followed from the code you write to the pixels on
> screen: what Babel turns your JSX into, when the element objects `{}` are
> created, what runs first when the page opens, how React decides which
> component to call, and what happens on a click, a context change, a list
> edit and a page switch. Each step has a plain-English story and an
> **Under the hood** block with the real React 19.2.5 functions and objects.
> Nothing here is hand-written guesswork: the compiled code, the element
> objects, the fiber trees and every call order were recorded by running the
> demo app (see "How this was recorded" at the end).

## The whole journey in one picture

1. **Compile time.** Babel (or Vite's Oxc) rewrites every `<Tag />` into a
   function call: `jsx(Tag, props)`. Your source no longer contains JSX.
2. **Page load.** The browser runs `main.jsx`. `createRoot` sets React up,
   `<App />` becomes an object, and `root.render()` **schedules** a render.
   No component has run yet.
3. **Render phase.** React walks a tree of *fibers*. When it reaches a
   component fiber it **calls your function**, which runs its `jsx()` calls
   and returns new element objects. React compares them with what was there
   before and records what must change.
4. **Commit phase.** React applies the recorded changes to the DOM in one
   synchronous pass, runs layout effects, and lets the browser paint.
   `useEffect` runs after.
5. **Updates.** `setState` queues an update and schedules another render
   that starts from the root but only *calls* the components that need it.

The rest of this note is each of those steps, in order, on a real app.

## 0. The app

Two pages switched with state (no router), a context, a component that
receives `children`, effects with cleanups, and a keyed list. React and
ReactDOM are pinned to **19.2.5**. There is no `<StrictMode>`, so every
component runs once per render and the traces stay readable.

`main.jsx`, the entry point:

<!-- source file="main.jsx" -->

`App.jsx` owns the two pieces of top-level state: which page is shown, and
the theme.

<!-- source file="App.jsx" -->

`Layout.jsx` reads the theme from context and renders whatever it gets as
`children`:

<!-- source file="Layout.jsx" -->

`Nav.jsx` gets the current page and a callback through props:

<!-- source file="Nav.jsx" -->

`CounterPage.jsx` has state, a ref, a layout effect, an effect with a
cleanup, and a child component:

<!-- source file="CounterPage.jsx" -->

`TodosPage.jsx` has a controlled input and a keyed list, and subscribes to
`resize` in an effect:

<!-- source file="TodosPage.jsx" -->

`ThemeContext.js` and the `log` helper:

<!-- source file="ThemeContext.js" -->

<!-- source file="trace.js" -->

> To follow along, run the demo (`examples/how-react-works` in the site's
> repository: `npm install && npm run dev`) and open
> `http://localhost:5199/?trace`. Every component call, effect and cleanup is
> logged to the console in the order React runs them.

## 1. Compile time: JSX becomes function calls

Browsers don't understand JSX. Before your code ever reaches the browser, a
compiler rewrites each JSX tag into a **function call** that returns a plain
object. This happens once, at build time. At run time there is no JSX left.

This is `App` after Babel's React preset with the **automatic runtime**
(`@babel/preset-react` with `runtime: 'automatic'`, the default since React 17):

<!-- compiled file="App" mode="automatic" fn="App" -->

And the import Babel added at the top of the file, which you never wrote:

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
```

What changed, tag by tag:

- `<Nav page={page} onNavigate={setPage} />` → `_jsx(Nav, { page, onNavigate })`.
  The **first argument is the type**: the `Nav` function itself, not a
  string and not a call.
- `<button className="theme" …>Theme: {theme}</button>` →
  `_jsxs("button", { …, children: ["Theme: ", theme] })`. A lowercase tag
  becomes a **string** type. Children are no longer separate arguments: they
  move into **`props.children`**.
- `jsx` vs `jsxs`: `jsxs` is used when the children are a **static array**
  written in the JSX (several children side by side). One child, or none →
  `jsx`.
- `key` is pulled **out of props** and passed as the **third argument**.
  In `TodosPage`:

<!-- compiled file="TodosPage" mode="automatic" fn="TodosPage" -->

Notice `_jsx("ul", { children: todos.map(...) })`: the children are an
array, but it's `jsx`, not `jsxs`, because the array is created at run time
by `map`. The compiler can't know its length, so React has to check that each
item has a key (the "Each child in a list should have a unique key" warning
comes from here).

The `/*#__PURE__*/` comments tell minifiers the call has no side effects, so
an unused element can be dropped.

### The classic runtime: `React.createElement`

Before React 17, the same JSX compiled to `React.createElement`. Babel still
supports it with `runtime: 'classic'`:

<!-- compiled file="App" mode="classic" fn="App" -->

The differences:

| | Classic: `React.createElement` | Automatic: `jsx` / `jsxs` |
|---|---|---|
| Import | you had to write `import React from 'react'` in every file | the compiler adds `import { jsx } from 'react/jsx-runtime'` |
| Children | extra arguments: `createElement(type, props, child1, child2)` | inside props: `jsx(type, { children: [child1, child2] })` |
| `key` | inside the props object; React had to copy props to remove it | a separate argument, so props can often be used as-is |
| Static vs dynamic children | indistinguishable | `jsxs` marks static arrays, so the key warning only fires for real lists |

Both produce **the same kind of object**. The automatic runtime just makes
the call cheaper and removes the `React` import requirement.

<details class="deep"><summary>Under the hood: the real jsx() and createElement()</summary>

This is the whole production `jsx` from `react/cjs/react-jsx-runtime.production.js`
(19.2.5). `jsx` and `jsxs` are **the same function** in production; they
only differ in development, where `jsxs` skips key validation for static
arrays:

```js
function jsxProd(type, config, maybeKey) {
  var key = null;
  void 0 !== maybeKey && (key = "" + maybeKey);
  void 0 !== config.key && (key = "" + config.key);
  if ("key" in config) {
    maybeKey = {};
    for (var propName in config)
      "key" !== propName && (maybeKey[propName] = config[propName]);
  } else maybeKey = config;
  config = maybeKey.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: void 0 !== config ? config : null,
    props: maybeKey
  };
}
exports.jsx = jsxProd;
exports.jsxs = jsxProd;
```

Three things to notice. The key is turned into a **string** (`"" + maybeKey`),
so `key={1}` becomes `"1"`. When there's no key in the config, **the config
object itself becomes `props`**: no copy. And `ref` is read from props: in
React 19, `ref` is a normal prop.

The classic `createElement` from `react.production.js`, for comparison. It
always copies props and collects children from `arguments`:

```js
exports.createElement = function (type, config, children) {
  var propName, props = {}, key = null;
  if (null != config)
    for (propName in (void 0 !== config.key && (key = "" + config.key), config))
      hasOwnProperty.call(config, propName) && "key" !== propName &&
        "__self" !== propName && "__source" !== propName &&
        (props[propName] = config[propName]);
  var childrenLength = arguments.length - 2;
  if (1 === childrenLength) props.children = children;
  else if (1 < childrenLength) {
    for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  if (type && type.defaultProps) /* … copy defaultProps … */
  return ReactElement(type, key, props);
};
```

</details>

### What your browser actually receives in development

`npm run dev` doesn't use Babel. Vite 8 compiles JSX with **Oxc**, and in
development it uses the **`jsxDEV`** variant, which also records where each
element came from (file, line, column) for warnings and React DevTools. This is
the `App` function exactly as Vite's dev server sends it:

<!-- compiled file="App" mode="vite-dev" fn="App" -->

The extra `_s()`, `$RefreshSig$` and `$RefreshReg$` lines are **Fast
Refresh** bookkeeping (hot reloading that keeps state). Babel produces the
same `jsxDEV` calls with `development: true`. `vite build` produces the
production `jsx`/`jsxs` form shown above.

## 2. The element object `{}`

So `<Display value={count} />` is just a call that returns an object. Here
is a **real** element, produced by React's production runtime for
`<p className="display">Count: {0}</p>`:

<!-- element which="production.p" -->

And for `<App />`:

<!-- element which="production.app" -->

- **`$$typeof`** marks the object as a React element. It's a `Symbol`, and
  JSON can't contain symbols, so a server response or user input can never be
  mistaken for an element (an XSS defence).
- **`type`** is either a **string** (`"p"`: a DOM tag) or **the component
  itself** (`App`: a function). This one field is what React later uses to
  decide what to do.
- **`key`** is `null` or a **string**. `jsx('li', {...}, 1)` gives `key: "1"`.
- **`props`** holds everything else, including `children`.

Elements are **cheap, immutable descriptions**. In development React freezes
them (`Object.freeze(element.props)` and `Object.freeze(element)`). A new
element object is created **every time** the JSX runs, which happens every
time the component renders. They are never updated; they are thrown away.

<details class="deep"><summary>Under the hood: the development element</summary>

The development runtime (`jsxDEV`, what the browser used in the trace) adds
debugging fields. Their names are real; nested objects are abbreviated:

<!-- element which="development.p" -->

`_owner` is the component that created the element (`null` here because the
sample was created outside a render). `_debugStack` and `_debugTask` are what
let React point at the line in your file in warnings and React DevTools.
`_store.validated` tracks the key warning.

</details>

**When exactly are elements created?** Only when the code containing the
`jsx()` call runs:

- `<App />` in `main.jsx` is created **once**, when the module runs.
- Everything inside `App`'s `return` is created **each time React calls
  `App`**.
- `children` are created by the **parent that wrote them**. `<Layout>`'s
  `children` (Nav, the theme button, the page) are created by `App`, not
  by `Layout`.

<!-- figure name="jsxElementsAnim" -->

## 3. The page opens

The browser loads `index.html`, which contains
`<script type="module" src="/src/main.jsx">`. Module scripts run after the
HTML is parsed. Here is everything that happens, in the order it happened in
the recorded trace:

1. **Imports run first.** `react-dom/client`, `react` and the Scheduler
   evaluate their top-level code, which mostly defines functions. Then your
   modules run, which **defines** `App`, `Layout`, … but calls none of them.
2. **`createRoot(container)`** creates the **FiberRoot** (React's bookkeeping
   for this root) and the very first fiber, **HostRoot**. It stores a pointer to
   that fiber on the `#root` DOM node.
3. **`listenToAllSupportedEvents(#root)`** attaches one listener per event
   type to `#root`, for both the capture and bubble phases. Your
   `onClick={...}` will never become a real `addEventListener` on a button.
4. **`<App />`** is evaluated before `render` is called (JavaScript evaluates
   arguments first): `jsxDEV(App, {})` returns `{ type: App, props: {} }`.
5. **`root.render(element)`** asks for a lane: no event is in progress, so
   it's **DefaultLane (32)**. It creates an update with payload
   `{ element }`, queues it on the HostRoot fiber, and calls
   `scheduleUpdateOnFiber`.
6. **`render()` returns.** It doesn't render anything. `ensureRootIsScheduled`
   queued a **microtask**, and `main.jsx` finishes with `#root` still empty.
7. **The microtask** (`processRootScheduleInMicrotask`) sees a Default lane.
   That isn't Sync, so it asks the **Scheduler** for a task.
8. **The Scheduler task** (`performWorkOnRootViaSchedulerTask`) runs
   `performWorkOnRoot(root, 32)` → `renderRootSync`. The render begins.

<!-- figure name="bootAnim" -->

<details class="deep"><summary>Under the hood: the recorded trace, and the source</summary>

The real call order, up to the start of the render:

<!-- trace phase="page load" from="createRoot" to="prepareFreshStack" -->

`createRoot` (React 19.2.5 development build, abbreviated):

```js
exports.createRoot = function(container, options) {
  if (!isValidContainer(container)) throw Error("Target container is not a DOM element.");
  // … read options …
  options = createFiberRoot(container, 1 /* ConcurrentRoot */, false, null, null, isStrictMode, …);
  container[internalContainerInstanceKey] = options.current;   // #root → HostRoot fiber
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(options);
};
```

`root.render` only queues:

```js
ReactDOMRoot.prototype.render = function(children) {
  var root = this._internalRoot;
  var current = root.current;
  updateContainerImpl(current, requestUpdateLane(current), children, root, null, null);
};

function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
  // …
  container = createUpdate(lane);
  container.payload = { element };
  element = enqueueUpdate(rootFiber, container, lane);
  null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
}
```

Why did a *Default* lane render with `renderRootSync`? Only transition,
retry and idle lanes are time-sliced; Sync, InputContinuous and Default are
"blocking" lanes rendered by the synchronous loop (see
[[Scheduler, Lanes and Batching]]).

</details>

## 4. The first render: how React decides what to call

React now walks the tree **one fiber at a time**: down with `beginWork`,
across to siblings, up with `completeWork` ([[The Work Loop]]). There's no
fiber tree yet, so each step **creates** the fibers for the children it
finds.

The question "how does React know whether to call something?" has a short
answer: **the element's `type`**. When React creates a fiber from an
element it picks a **tag**:

| `element.type` | fiber tag | What `beginWork` does with it |
|---|---|---|
| a function (`App`, `Nav`, …) | `0` FunctionComponent | **calls it**: `renderWithHooks` → `Component(props)` |
| a string (`"div"`, `"button"`) | `5` HostComponent | doesn't call anything; reconciles `props.children`. `completeWork` creates the DOM node |
| a context (`ThemeContext`) | `10` ContextProvider | pushes `value` for the components below; reconciles `children` |
| a string or number child | `6` HostText | creates a text node |
| the root | `3` HostRoot | renders the element from its update queue |

So a component is called **when the work loop reaches its fiber**, and only
then. The order is depth-first: a component is called before its children,
and a child is called before the parent's next sibling.

<!-- figure name="firstRenderAnim" -->

In order, the first render called: `App` → `Layout` → `Nav` →
`CounterPage` → `Display`. `ThemeContext` and every DOM tag were never
"called"; they're not functions.

**Each component creates its own output only when it's called.** `App`'s
`jsx()` calls run inside `renderWithHooks(App)`. `Nav`'s run later, inside
`renderWithHooks(Nav)`. That's why in the trace the `jsxDEV` lines appear
right after each `[app] render …` line.

<details class="deep"><summary>Under the hood: how the fiber tag is chosen, and how a component gets called</summary>

`createFiberFromTypeAndProps` (abbreviated) is where an element's `type`
becomes a fiber tag:

```js
function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
  var fiberTag = 0 /* FunctionComponent */, resolvedType = type;
  if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1 /* ClassComponent */);
  else if ("string" === typeof type) fiberTag = /* hoistable / singleton checks */ … 5 /* HostComponent */;
  else switch (type) {
    case REACT_FRAGMENT_TYPE: return createFiberFromFragment(pendingProps.children, mode, lanes, key);
    case REACT_SUSPENSE_TYPE: /* … tag 13 … */
    default:
      if ("object" === typeof type && null !== type) switch (type.$$typeof) {
        case REACT_CONTEXT_TYPE:     fiberTag = 10; break; // <ThemeContext value>
        case REACT_CONSUMER_TYPE:    fiberTag = 9;  break;
        case REACT_FORWARD_REF_TYPE: fiberTag = 11; break;
        case REACT_MEMO_TYPE:        fiberTag = 14; break;
        // …
      }
  }
  // … createFiber(fiberTag, pendingProps, key, mode), set type …
}
```

`beginWork` then switches on that tag. The two cases this app uses most:

```js
switch (workInProgress.tag) {
  case 0: return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
  case 5: /* HostComponent: reconcile props.children (inlined in the build) */ …
  // case 10: pushProvider(workInProgress, context, value); reconcileChildren(…)
  // …
}
```

`updateFunctionComponent` calls `renderWithHooks`, which installs the right
set of hook implementations (mount or update) and then calls your function:

```js
function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = 0;
  ReactSharedInternals.H = null !== current && null !== current.memoizedState
    ? HooksDispatcherOnUpdateInDEV
    : HooksDispatcherOnMountInDEV;          // ← useState means "mountState" on the first render
  var children = callComponentInDEV(Component, props, secondArg);   // ← App(props)
  // …
  return children;                          // the element objects App returned
}
```

The start of the recorded first render, until React enters the context
provider. Note the order of the `jsxDEV` calls inside `App`: **innermost
first**, because JavaScript evaluates arguments before the call:

<!-- trace phase="page load" from="beginWork  HostRoot" to="beginWork  ThemeContext" -->

`Layout` creates only its own tags. Its `children` arrived ready-made:

<!-- trace phase="page load" from="beginWork  Layout" to="reconcileChildrenArray  main" -->

The fiber tree when the first render finished (recorded from the live page).
`hooks` lists each hook's stored value in order:

<!-- tree snapshot="0" -->

Note `Layout`'s empty hook list: `useContext` reads from the context stack
and doesn't create a hook object (see [[Hooks Under the Hood]]). And `h1` has
no text fiber: a single text child is set directly as the element's text
content.

</details>

## 5. Commit and the first paint

During the render, every `completeWork` on a host fiber **created its DOM
node and appended its children's DOM nodes to it**. By the time the render
reaches the root, the whole UI exists as **one detached `<div>`**. The
document hasn't been touched.

Then the **commit** runs in one synchronous pass ([[Commit Phase and Effects]]):

1. **Mutation.** The `App` fiber carries the `Placement` flag. It isn't a DOM
   node, so React descends (App → ThemeContext → Layout) until it finds one,
   and does **one** `appendChild(<div>)` into `#root`.
2. **Swap.** `root.current = finishedWork`: the new tree is now the current
   one.
3. **Layout effects.** `useLayoutEffect` runs. The DOM exists and can be
   measured, but nothing has been painted.
4. **Paint.** The Scheduler task ends; the browser paints.
5. **Passive effects.** Because this render used the Default lane,
   `useEffect` runs in a **later task, after the paint**.

<!-- figure name="firstCommitAnim" -->

<details class="deep"><summary>Under the hood: the recorded commit</summary>

<!-- trace phase="page load" from="commitRoot" to="[app] effect: set title 0" -->

`insertOrAppendPlacementNodeIntoContainer` checks the fiber's tag: for a
host component (5) or text (6) it calls `appendChild`/`insertBefore` on the
real node; otherwise it recurses into the fiber's child. That's how a
component fiber "inserts" the DOM nodes it renders.

</details>

## 6. A click: state update and re-render

The user clicks "Add one". Here is everything that happens:

1. **The event.** The browser dispatches `click`. React's listener on `#root`
   runs (`dispatchDiscreteEvent`, once for the capture phase and once for
   bubble), finds the fiber of the clicked button, collects the `onClick`
   props on the path, and calls yours inside a `SyntheticEvent`.
2. **`setCount(1)`** calls `dispatchSetState(CounterPage fiber, queue, 1)`.
   A click is a discrete event → **SyncLane (2)**. The update is queued on
   the hook and a **microtask** is scheduled. Your handler returns. Nothing
   has re-rendered yet.
3. **Render, starting from the root.** React marks the path:
   `CounterPage.lanes`, and `childLanes` on every ancestor. Then the work loop
   starts at **HostRoot** again. Ancestors with only `childLanes` **bail
   out**: their functions are not called. Siblings with no work (`h1`, `Nav`,
   the theme button) are **skipped with their entire subtree**.
4. **`CounterPage` is called** because it has the update. `useState` now
   returns `1`. Its `jsx()` calls create **brand-new element objects**, the
   same way as on the first render.
5. **Reconciliation.** The new elements are compared with the **existing
   fibers**: same types at the same positions, so the fibers are **reused**
   (`useFiber`) with new props. `Display` is called (its props object is new),
   and its text child changes from `"0"` to `"1"`.
6. **Commit.** One DOM write: the text node becomes `"1"`. The layout effect
   reruns (its deps changed). Because this was a **SyncLane** render,
   `useEffect` is flushed **at the end of the commit**: first the old
   effect's **cleanup** (with `count` 0), then the new effect.
7. **Paint.** The microtask ends and the browser paints "Count: 1".

<!-- figure name="clickAnim" -->

Elements vs fibers on this click: **every element under `CounterPage` was
recreated** (they always are), but **no fiber was created**. Every fiber was
the old one, updated in place through its alternate ([[React Fiber]]).

<details class="deep"><summary>Under the hood: the recorded click</summary>

<!-- trace phase="click &quot;Add one&quot;" from="dispatchDiscreteEvent  click (capture" to="[app] effect: set title 1" -->

Two details in this trace. First, `commitUpdate` is called for
`h2`, `p`, `button` and `section`, even though only a text changed. In
React 19 a host fiber with a **new props object** is flagged in
`completeWork`, and the actual comparison of attributes happens in the
commit (`commitUpdate` diffs old and new props and writes only what
changed, here nothing). Second, `bailoutOnAlreadyFinishedWork  text "Count: "`:
even text fibers bail out when their content is unchanged.

</details>

## 7. A context change

The theme button calls `setTheme('dark')`. The state lives in **`App`**, so
this time `App` re-renders. Because `App` creates new elements for
everything below it, **every component under it re-renders too**: `Layout`,
`Nav`, `CounterPage`, `Display`. None of them is wrapped in `memo`, and
each receives a new props object.

Context propagation only becomes visible when something **would** bail out:
React then searches the subtree for fibers that read the changed context
(`propagateContextChanges`) and schedules them, even through a `memo`
boundary. In this app both `Layout` and every `TodoItem` read `ThemeContext`,
so after a theme change they'd re-render even if their parents were
memoized.

<details class="deep"><summary>Under the hood: the recorded theme change</summary>

<!-- trace phase="click &quot;Theme&quot;" from="dispatchSetState" to="[app] render Layout" -->

And the commit: `commitTextUpdate "light" → "dark"` is the only text that
changed, and `commitUpdate div` applies the new `className` ("layout dark"):

<!-- trace phase="click &quot;Theme&quot;" from="commitRoot" to="flushPassiveEffects" -->

No effects ran: `CounterPage`'s effects depend on `[count]`, which didn't
change.

</details>

## 8. The list: keys at work

On the Todos page, `todos.map(todo => <TodoItem key={todo.id} … />)`
produces an array of elements, and each one carries a `key` (compiled to the
third argument of `jsx`). React matches old and new children **by key**
([[Child Reconciliation Algorithm]]).

**Typing in the input.** Every keystroke calls `setText`, re-renders
`TodosPage`, and with it both `TodoItem`s, because they get new props
objects (a new `onRemove` function every render). The DOM writes are tiny,
but the components run:

<!-- trace phase="type &quot;x&quot; in the input" from="dispatchDiscreteEvent  input (capture" to="[app] render TodoItem 2" -->

**Adding a todo.** The submit handler calls `setTodos` **and** `setText`.
Two updates, **one render**: both are queued during the event and the single
microtask processes them together (batching). The keyed diff reuses keys 1
and 2 and creates key 3:

<!-- trace phase="submit the form (add a todo)" from="dispatchSetState" to="renderRootSync" -->

<!-- trace phase="submit the form (add a todo)" from="reconcileChildrenArray  ul" to="placeChild  TodoItem[key=3]" -->

**Removing the first todo.** The first keys differ, so React builds a
`Map` of the old children, reuses keys 2 and 3, and deletes key 1. That's
**one** `removeChild`:

<!-- trace phase="click × on the first todo (remove)" from="reconcileChildrenArray  ul" to="deleteChild" -->

<!-- trace phase="click × on the first todo (remove)" from="commitDeletionEffectsOnFiber  TodoItem[key=1]" to="removeChild" -->

<!-- figure name="todoListAnim" -->

## 9. A page switch: unmount and mount

"Todos" calls `setPage('todos')`. `App` re-renders and, in the third slot of
`Layout`'s children, returns `<TodosPage />` where there used to be
`<CounterPage />`. Same position, **different type**: React doesn't compare
inside. It deletes the whole `CounterPage` subtree (with `count`) and mounts
`TodosPage` from scratch ([[Reconciliation]], Rule 1).

The order of effects is the part people get wrong:

1. **Render:** `TodosPage` and its items are called and their DOM is built
   off-screen. `CounterPage` is only *marked* for deletion.
2. **Commit, mutation:** React walks the deleted subtree
   (`commitDeletionEffectsOnFiber`), then removes its top DOM node with one
   `removeChild(<section>)`, and inserts the new `<section>` with one
   `appendChild`.
3. **Passive effects:** first the **unmount cleanups** (`cleanup: title
   effect`), then the **new effects** (`effect: subscribe to resize`).

<!-- figure name="pageSwitchAnim" -->

<details class="deep"><summary>Under the hood: the recorded page switch</summary>

<!-- trace phase="click &quot;Todos&quot; (page switch)" from="reconcileChildrenArray  main" to="placeChild  TodosPage" -->

<!-- trace phase="click &quot;Todos&quot; (page switch)" from="commitRoot" to="[app] effect: subscribe to resize" -->

The fiber tree on the Todos page. `CounterPage` and its subtree are gone; the
`TodoItem` fibers carry their keys:

<!-- tree snapshot="1" -->

</details>

## 10. Recap: the order of everything

| When | What runs | Creates |
|---|---|---|
| build | Babel / Oxc rewrites JSX to `jsx()` calls | your compiled modules |
| page load | imports evaluate; `createRoot`; `listenToAllSupportedEvents` | FiberRoot, HostRoot fiber, root listeners |
| page load | `jsx(App)`; `root.render()` queues an update, schedules | the `<App/>` element |
| render | work loop from HostRoot; each component called when reached | fibers (first time), new elements (every time) |
| render, going up | `completeWork` | DOM nodes (detached), flags |
| commit | mutation → `root.current` swap → layout effects | the DOM changes, all at once |
| after commit | paint, then `useEffect` (Sync lane: before paint) | pixels; effect side effects |
| `setState` | queue + schedule; render from the root, bail out where possible | new elements for the components that run |

Rules of thumb that follow from the traces:

- A component runs **when React's work loop reaches its fiber**, not when its
  JSX is written. `<Nav />` in `App` doesn't call `Nav`.
- `children` are created by the component that **writes** them, not the one
  that **renders** them.
- Elements are recreated on every render; fibers and DOM nodes are reused
  when type (and key) match at the same position.
- `setState` never renders by itself: it schedules a render. Several
  `setState`s in one event produce one render.
- The DOM is only touched in the commit, and only where flags say so.

## Interview Q&A

**Q: What does JSX compile to?**
A: A function call that returns an object. With the automatic runtime,
`<Nav page="x" />` becomes `jsx(Nav, { page: "x" })` imported from
`react/jsx-runtime`. With the classic runtime it was
`React.createElement(Nav, { page: "x" })`. Children go into
`props.children`, and `key` is passed separately.

**Q: When is a component function actually called?**
A: When React's work loop reaches its fiber in the render phase:
`beginWork` sees tag 0 and calls `renderWithHooks`, which calls your
function. Writing `<Nav />` only creates an object `{ type: Nav, … }`.

**Q: How does React know whether to call something or create a DOM node?**
A: From `element.type`. A function becomes a FunctionComponent fiber (called).
A string becomes a HostComponent fiber (DOM node created in
`completeWork`). A context object becomes a provider fiber.

**Q: What does `root.render(<App />)` do?**
A: It queues an update with `{ element: <App/> }` on the HostRoot fiber and
schedules a render (microtask → Scheduler task for the Default lane). It
returns before anything is rendered.

**Q: Does React re-render the whole app when state changes?**
A: The render starts at the root, but components above the updated one
**bail out** without being called, and subtrees with no pending work are
skipped. The component that owns the state and its descendants run (unless
memoized).

**Q: In what order do effects run on a page switch?**
A: Render the new page (off-screen), then in the commit remove the old DOM and
insert the new one, then run the old page's effect cleanups, then the new
page's effects.

## How this was recorded

The demo lives in the site's repository under `examples/how-react-works`.

- `npm run compile` runs `@babel/core` with `@babel/preset-react`
  (automatic, development and classic runtimes) on every source file, and
  asks Vite's dev server for its output. Everything in chapter 1 is that
  output.
- `npm run trace` opens the app in Chrome, sets **logpoints** (breakpoints
  that log instead of pausing) on 49 functions of the React DOM 19.2.5
  development build through the Chrome DevTools Protocol, and records them
  together with the app's own `log()` calls. It then clicks "Add one",
  "Theme", "Todos", types, adds and removes a todo. The traces, fiber trees
  and element objects above are that recording, filtered only to hide
  pointer/focus event noise and empty `reconcileChildFibers(… ← null)`
  calls.

Development builds keep function names, which is why the traces read like
the source. Production builds are minified, but run the same functions in
the same order.
