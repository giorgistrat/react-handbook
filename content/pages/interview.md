---
summary: React interview questions from every module of the handbook, answered the way a senior engineer would: a precise definition first, then the key points that show real understanding.
---

# Interview Questions

Each answer follows the same shape: a **precise definition** you could say in the first ten seconds, then the **key points** that separate a senior answer from a memorized one (how it works, the trade-offs, the traps), and a link to the note that explains it in depth. Use **Quiz me** to hide the answers and grade yourself; your "know it" / "review" marks are saved in this browser.

> Answer out loud before you open a card. In interviews, structure matters as much as facts: *definition → how it works → trade-off or pitfall → when you'd use it*.

## React Internals

**Q: What is React Fiber?**
A: Fiber is React's internal data structure and reconciliation engine: one fiber object per component instance or DOM element, linked into a tree, which holds that node's props, state, effects and pending work, and lets React split rendering into small, interruptible units.

- **A fiber is a unit of work.** It has `child`, `sibling` and `return` pointers, so React can walk the tree with a loop instead of recursion and stop at any fiber.
- **It's where state lives.** A component's hooks, props (`memoizedProps`) and pending updates (`lanes`) are stored on its fiber, not in the function.
- **Why it exists:** the old stack reconciler rendered recursively in one go and couldn't pause. Fiber made priorities, interruption, transitions and Suspense possible.
- **Elements vs fibers:** elements are cheap, immutable descriptions recreated every render; fibers are long-lived and reused across renders.

Read more: [[React Fiber]]

**Q: What's the difference between an element, a component, a fiber and a DOM node?**
A: A component is your function; an element is the plain object a render returns to describe what to show (`{ type, props, key }`); a fiber is React's long-lived record of one rendered element, with its state and work; a DOM node is the real browser object a host fiber manages.

- **Elements are immutable and disposable**, created anew on every render.
- **Fibers persist** between renders and are what React compares and updates.
- **Only host fibers** (`div`, `span`…) own DOM nodes; component fibers have none.

Read more: [[React Fiber]], [[Raw React APIs]]

**Q: What are the phases of a React update?**
A: An update goes through trigger (something calls `setState` or `root.render`), schedule (React picks a priority lane and queues the work), render (React calls components and computes what changed), and commit (React applies the changes to the DOM and runs effects).

- **Render is pure and interruptible:** it builds a work-in-progress tree and can be thrown away.
- **Commit is synchronous and never interrupted**, because it mutates the DOM.
- **Effects:** layout effects run during the commit before paint; passive effects (`useEffect`) run after the commit.
- **"Rendering" ≠ updating the DOM.** A render that produces the same output commits nothing.

Read more: [[Render and Commit]], [[A State Update, End to End]]

**Q: What is reconciliation?**
A: Reconciliation is the process of comparing the new element tree from a render with the current fiber tree to decide the minimal set of changes: which fibers to reuse, update, create or delete.

- **Heuristic O(n), not optimal O(n³):** React assumes (1) elements of a different type produce different trees, and (2) `key` identifies children across renders.
- **Same type + same position (or key) → update in place**, keeping state and DOM.
- **Different type → unmount the whole subtree** and mount a new one; all state below is lost.
- **It's diffed against the previous fiber tree, not the real DOM.**

Read more: [[Reconciliation]], [[Child Reconciliation Algorithm]]

**Q: Is the virtual DOM diffed against the real DOM?**
A: No. React compares the new elements with its own previous fiber tree (the last committed state) and only touches the real DOM in the commit phase, for the differences it found.

- Reading the real DOM is slow and could be changed by others; React's fibers are its source of truth.
- "Virtual DOM" is mostly a marketing term today; the precise terms are **elements**, **fibers** and **reconciliation**.
- This is why manual DOM changes to nodes React manages get overwritten or cause mismatches.

Read more: [[Render and Commit]]

**Q: Why are keys important, and why are index keys a problem?**
A: A key gives a list item a stable identity across renders, so React can match old and new children even when they move, and keep each item's state and DOM node attached to the right data.

- **Without keys (or with index keys), identity is position:** remove the first item and every later item's state shifts to its neighbor.
- Index keys are fine only for lists that **never reorder, insert or delete** in the middle.
- **Changing a key on purpose resets** a component: a new key means a new instance with fresh state.
- Keys must be unique among **siblings**, not globally.

Read more: [[Rendering Arrays]], [[Child Reconciliation Algorithm]]

**Q: How does React traverse the tree during a render?**
A: Depth-first, with a loop: `beginWork` processes a fiber on the way down (calls the component and reconciles its children), and `completeWork` runs on the way up (prepares host nodes), then React moves to the sibling or back to the parent.

- A single `workInProgress` pointer marks where to continue, which is what makes **pausing and resuming** possible.
- In the concurrent loop, React checks `shouldYield()` (about every 5 ms) between fibers.
- **Bailout:** if a fiber's props object is the same, it has no pending update and no context change, React skips it, and the whole subtree if `childLanes` is empty.

Read more: [[The Work Loop]]

**Q: What is a bailout, and why does a child re-render when its parent re-renders?**
A: A bailout is React skipping a component because it can prove nothing changed. A child normally re-renders with its parent because the parent's render creates a new element with a new props object, and React compares props by identity, not by content.

- **Same props object + no state/context change → bailout.** That happens when the parent passes the same element (e.g. `children` from above).
- **`memo` replaces the identity check with a shallow per-prop comparison.**
- A re-render isn't necessarily expensive: it's only a problem when it's slow or multiplied.

Read more: [[The Work Loop]], [[Element Optimization]]

**Q: What are lanes?**
A: Lanes are React's priority model: each update is assigned a lane, one bit in a 31-bit mask, and every fiber tracks the lanes of its pending work, so React can group, compare and pick the most urgent updates with cheap bitwise operations.

- **Discrete input** (click, keypress) gets the `SyncLane`; transitions get `TransitionLanes`; there are lanes for continuous input, default updates, retries and idle work.
- **Starvation protection:** a lane that waits too long expires and renders synchronously.
- Lanes are what make "urgent first, the rest later" possible.

Read more: [[Scheduler, Lanes and Batching]]

**Q: What is automatic batching?**
A: Automatic batching means multiple state updates made in the same event or tick are combined into a single render; since React 18 this applies everywhere (promises, timeouts, native listeners), not only inside React event handlers.

- `setState` **doesn't render immediately**: it queues an update and schedules the root (in a microtask).
- Fewer renders and no half-updated intermediate UI.
- **Opt out with `flushSync`** when code needs the DOM updated before the next line (focus, scroll).

Read more: [[Scheduler, Lanes and Batching]], [[flushSync]]

**Q: Does React always render concurrently since React 18?**
A: No. Concurrent, interruptible rendering is opt-in per update: transitions, `useDeferredValue` and Suspense retries render concurrently, while clicks, typing and ordinary updates still render synchronously.

- **`createRoot` enables** concurrent features; it doesn't make every render concurrent.
- Interruptible renders yield to the browser roughly every 5 ms and can be abandoned when newer input arrives.
- **The commit is always synchronous**, even for concurrent renders.

Read more: [[Scheduler, Lanes and Batching]], [[Concurrent Rendering]]

**Q: Where does a function component's state live, and why must hooks be called in the same order?**
A: State lives on the component's fiber, as a linked list of hook objects (`fiber.memoizedState`) in call order; React matches each hook call to its object by position, so the order must be identical on every render.

- **No names, only positions:** skip a hook conditionally and every later hook reads the wrong state, or React throws "Rendered more hooks than during the previous render".
- `use` is the exception: it doesn't keep a slot in that list, so it can be called conditionally.
- **The `setState` function is stable**: it's bound once to the fiber and the hook's queue.

Read more: [[Hooks Under the Hood]]

**Q: What happens in the commit phase, and in what order do effects run?**
A: The commit applies the finished work-in-progress tree in one synchronous pass: DOM mutations, then the tree swap (`root.current = finishedWork`), then refs and layout effects; passive effects (`useEffect`) run afterwards.

- **Children before parents**, and for each kind of effect **all cleanups run before any setup**.
- **Cleanups run with the values of the render that created them**, during the next commit (not before the next render).
- `useEffect` usually runs after paint, but **not guaranteed**: after a discrete event like a click, React flushes it before the next frame.

Read more: [[Commit Phase and Effects]], [[React Lifecycle]]

**Q: What is double buffering in React?**
A: React keeps two versions of each fiber, the current one (on screen) and a work-in-progress alternate; a render builds the work-in-progress tree, and the commit swaps it in by pointing `root.current` at it.

- The two fibers point to each other through `alternate`, so React **reuses objects** instead of allocating a new tree each render.
- An interrupted or discarded render never affects what's on screen.
- Like a graphics back buffer: draw off-screen, then flip.

Read more: [[React Fiber]]

**Q: Walk me through what happens when I call `setState` in a click handler.**
A: React queues an update on the hook's queue with a lane based on the event's priority, marks the fiber and its ancestors as having pending work, schedules the root, renders from the root while bailing out of untouched subtrees, calls the component that owns the state, reconciles its children, and commits the resulting DOM changes before running effects.

- **Batched:** several `setState` calls in the handler produce one render.
- **Eager bailout:** if the new state is `Object.is`-equal and nothing else is pending, React may skip scheduling entirely.
- A good answer names the path: **trigger → schedule (lane) → render (beginWork/completeWork) → commit → effects**.

Read more: [[A State Update, End to End]], [[How React Works, Start to Finish]]

## JSX & Fundamentals

**Q: What is JSX?**
A: JSX is a syntax extension for JavaScript that lets you describe UI with HTML-like markup; a compiler turns each tag into a function call (`jsx(type, props)`) that returns a plain element object, so JSX is just JavaScript expressions.

- **Not HTML:** `className`, `htmlFor`, camelCase events, `{}` for expressions, and every tag must close.
- **Since React 17, the automatic runtime** imports `jsx` for you; you don't need `React` in scope.
- Because it's an expression, you can store JSX in variables, pass it as props and return it from functions.
- **Text is escaped by default**, which protects against XSS; `dangerouslySetInnerHTML` is the explicit opt-out.

Read more: [[Using JSX]], [[Raw React APIs]]

**Q: What does a React element look like, and is it the same as a component?**
A: An element is an immutable plain object, `{ $$typeof, type, key, ref, props }`, that describes one piece of UI; a component is a function (or class) that React calls to turn props into elements.

- `<Card title="Mug" />` doesn't call `Card`: it creates an element whose `type` is `Card`. **React** calls it later.
- **Elements are cheap to create**; the expensive part is rendering and committing.
- That's why you never call components directly like functions: React needs to own the call to manage state and hooks.

Read more: [[Raw React APIs]], [[Custom Components]]

**Q: What are props?**
A: Props are the read-only inputs a parent passes to a component, an object of values, functions and elements that the component uses to decide what to render.

- **Read-only:** a component must never mutate its props; it asks the owner to change them through callbacks.
- **One-way data flow:** data goes down through props, events go up through callbacks.
- `children` is just a prop: whatever is written between the tags.
- Passing a new object or function each render is fine until you rely on `memo`.

Read more: [[Custom Components]]

**Q: What is state in React?**
A: State is data owned by a component that can change over time and that React preserves between renders; updating it through its setter tells React to re-render the component so the UI reflects the new value.

- **State is a snapshot:** each render sees its own values; `setState` schedules a new render rather than changing the current variable.
- **Keep it minimal:** anything you can compute from props or other state should be derived during render, not stored.
- **Updates are batched**, and updater functions (`setCount(c => c + 1)`) avoid stale values when several updates depend on each other.
- State lives with the component's position in the tree: unmount it or change its `key` and the state is gone.

Read more: [[Managing UI State]], [[Hooks Under the Hood]]

**Q: What's the difference between props and state?**
A: Props are inputs passed in by the parent and read-only for the component; state is internal data the component owns and updates itself, which triggers a re-render.

- **Who owns it** is the real question: the owner holds state and passes it down as props.
- A parent's state is the child's props, which is how **lifting state up** shares data between siblings.
- Copying props into state ("mirroring") is a common bug: the copy goes stale when the prop changes.

Read more: [[Lifting State]], [[Managing UI State]]

**Q: How does conditional rendering work, and what's the `&&` pitfall?**
A: Because JSX is an expression, you render conditionally with plain JavaScript: `if` before the return, the ternary `a ? <X /> : <Y />`, or `cond && <X />`.

- **The `&&` trap:** `{count && <Badge />}` renders `0` when `count` is 0, because React renders numbers. Use `count > 0 &&`.
- `null`, `undefined`, `false` and `true` render nothing.
- Prefer early returns for whole-component branches; ternaries for small inline choices.

Read more: [[Using JSX]]

**Q: What are fragments, and why do they exist?**
A: A fragment (`<>…</>` or `<Fragment>`) groups several elements without adding a wrapper DOM node, because a component must return a single value.

- Keeps markup valid (table rows, list items, flex/grid children) without extra `div`s.
- **Only the long form takes a `key`**: `<Fragment key={id}>` when mapping to multiple siblings.

Read more: [[Using JSX]]

**Q: What are controlled and uncontrolled inputs?**
A: A controlled input gets its value from React state on every render and reports changes through `onChange`; an uncontrolled input keeps its own value in the DOM, optionally starting from `defaultValue`, and you read it when needed (e.g. from `FormData`).

- **Controlled:** single source of truth, instant validation and formatting, at the cost of a render per keystroke.
- **Uncontrolled:** less code, ideal with form actions and `FormData`.
- **Never switch between the two** during a component's life: React warns and the behavior is undefined.
- `value` without `onChange` makes a read-only field.

Read more: [[Inputs]], [[Forms]]

**Q: How do forms work in React 19?**
A: A `<form>` can take an `action` function that receives the form's `FormData`; React runs it inside a transition, tracks its pending state and resets uncontrolled fields after it succeeds, so many forms no longer need state per field.

- **`FormData`** reads every named field; unchecked checkboxes are simply absent.
- **`useFormStatus`** lets a child (like a submit button) read `pending`; `useActionState` returns the action's result.
- Without an action, `onSubmit` + `e.preventDefault()` is still the standard pattern.

Read more: [[Forms]], [[Optimistic UI]]

**Q: What is an error boundary, and what doesn't it catch?**
A: An error boundary is a component that catches errors thrown while rendering its children (and in their lifecycle methods and effects) and shows a fallback UI instead of unmounting the whole app.

- **It doesn't catch** errors in event handlers, async code (timeouts, promises outside `use`) or the boundary itself; route those to it explicitly (e.g. `showBoundary` from `react-error-boundary`).
- **Built-in boundaries are still class components** (`getDerivedStateFromError`); in practice teams use `react-error-boundary`.
- **Place them deliberately:** around independent widgets, not only at the root; resetting with a `key` or `resetErrorBoundary` gives a retry.
- With Suspense, put the error boundary **outside** the `Suspense` boundary.

Read more: [[Error Boundaries]], [[Data Fetching with use]]

**Q: Why should you never define a component inside another component?**
A: Because every render of the outer component creates a new function, which React sees as a different component type, so it unmounts the old subtree and mounts a new one, losing all state and DOM, on every render.

- Symptoms: inputs losing focus after each keystroke, effects re-running, animations restarting.
- **Define components at module level**, and pass data through props.

Read more: [[Reconciliation]]

**Q: How do you style React components, and what are the trade-offs?**
A: React supports class names (`className` with CSS, CSS Modules, utility CSS like Tailwind) and inline `style` objects; most teams use classes for styling and reserve inline styles for truly dynamic values.

- **`style` takes an object** with camelCase properties; numbers get `px` for most properties.
- Inline styles can't do pseudo-classes, media queries or keyframes.
- CSS-in-JS with runtime injection costs render time; **zero-runtime** solutions (CSS Modules, Tailwind, extracted CSS) are favored with Server Components.

Read more: [[Styling]]

**Q: How do you type React components with TypeScript?**
A: Type props as a plain object type and let TypeScript infer the return type; use `React.ComponentProps<'button'>` to extend native element props, `ReactNode` for anything renderable, and discriminated unions for props that depend on each other.

- **Avoid `React.FC`** for new code: no real benefit, and it used to add implicit `children`.
- Type event handlers from the element (`React.ChangeEvent<HTMLInputElement>`); type `useState` when the initial value doesn't show the full type (`useState<User | null>(null)`).
- **`satisfies`** checks a value against a type without widening it.

Read more: [[TypeScript with React]]

**Q: What does `ReactDOM.createRoot` do, and what's the difference from the old `render`?**
A: `createRoot(container)` creates a React root (the FiberRoot) attached to a DOM node, with event delegation set up on it; `root.render(element)` schedules the first render. It replaced `ReactDOM.render` in React 18 and enables concurrent features and automatic batching.

- **Nothing renders synchronously** inside `root.render`: it queues an update.
- React listens for events on the **root container**, not on each element (event delegation).
- Multiple roots on one page are independent React apps.

Read more: [[Hello World in JS]], [[How React Works, Start to Finish]]

**Q: Why must components be pure?**
A: A pure component returns the same output for the same props, state and context, and doesn't change anything outside itself while rendering; React relies on this to render components in any order, more than once, or not at all, and to throw renders away.

- **Side effects belong in event handlers or effects**, never in the render body (no mutations of outside variables, no fetching, no DOM writes).
- **Strict Mode renders twice in development** to expose impure components.
- Purity is what makes memoization, concurrent rendering and the React Compiler safe.

Read more: [[Render and Commit]]

## Optimization

**Q: How do you approach a performance problem in a React app?**
A: Measure first: reproduce it on a realistic device, profile it with the React DevTools Profiler and the browser's Performance panel on a production build, identify whether the cost is rendering, a calculation, the DOM or loading, and then apply the cheapest fix for that cause.

- **Order of fixes:** restructure (move state down, pass elements) → memoize → defer (transitions) → do less (windowing, splitting) → move off the main thread.
- **Fix slow renders before unnecessary re-renders.**
- Every optimization has a cost in complexity; remove the ones that don't measurably help.

Read more: [[Optimize Rendering]], [[Expensive Calculations]]

**Q: What are the reasons a component re-renders?**
A: A component re-renders when its own state changes, when a context it reads changes, or when its parent re-renders; a "props change" is really just the parent re-rendering with new props.

- The parent case is the default because React can't know a child's output didn't change.
- An "unnecessary" re-render does render and reconciliation but commits nothing to the DOM.
- **It matters when it's slow or multiplied** (lists, big trees, high-frequency updates).

Read more: [[React Re-rendering]], [[Optimize Rendering]]

**Q: How does `React.memo` work, and what silently breaks it?**
A: `memo(Component)` skips re-rendering when every prop is `Object.is`-equal to the previous render's, by replacing React's props-identity check with a shallow, per-prop comparison.

- **Broken by props created during render:** inline objects, arrays, arrow functions and JSX children are new references every time.
- **Doesn't stop** re-renders from the component's own state or from contexts it reads.
- **A custom comparator** (second argument) returns `true` to skip, but it must cover every prop the component uses, or the UI goes stale.
- Recorded in the handbook: one inline `onSubscribe={() => …}` made a memoized footer render on every click again.

Read more: [[Element Optimization]], [[Optimize Rendering]]

**Q: `useMemo` vs `useCallback` vs `memo`?**
A: `useMemo` caches a computed value and `useCallback` caches a function, both by a dependency array; `memo` caches a component's rendered result by its props. `useCallback(fn, deps)` is `useMemo(() => fn, deps)`.

- **`useMemo`/`useCallback` are for referential stability** (props to memoized children, effect dependencies) **or expensive calculations** (around 1 ms or more).
- On their own they make nothing faster: a stable function only helps if something compares it.
- **The React Compiler** inserts most of this memoization automatically.

Read more: [[React Re-rendering]], [[Expensive Calculations]]

**Q: How can you avoid re-renders without using `memo`?**
A: Hand React the same element object across renders: lift static elements out of the component, pass elements in as props or `children` from a parent that doesn't re-render, or move the frequently changing state down into a smaller component.

- **An element's identity follows the component that creates it.** Children created above a re-rendering component are reused.
- These are structural fixes: no comparisons, no dependency arrays to maintain.
- This is why "layout" components that take `children` are cheap.

Read more: [[Element Optimization]], [[Composition and Layout Components]]

**Q: Why can context cause performance problems, and how do you fix them?**
A: When a provider's value changes by `Object.is`, every component that reads that context re-renders, memoized or not; an inline object value changes on every render of the provider's parent, so all consumers re-render even when nothing changed.

- **Memoize the value** (`useMemo`, plus stable setters).
- **Move the state into a provider component** that takes `children`, so changes only re-render the provider and the readers.
- **Split contexts** by update frequency (state vs setters/dispatch).
- For high-frequency shared state, a store with selectors (`useSyncExternalStore`) scales better.

Read more: [[Optimize Context]], [[Context with use]]

**Q: What is concurrent rendering, and how do `useTransition` and `useDeferredValue` use it?**
A: Concurrent rendering lets React prepare an update in the background, in small interruptible slices that yield to the browser, and abandon it if newer input arrives; `useTransition` marks a state update as non-urgent, and `useDeferredValue` gives you a lagging copy of a value for the slow parts of the UI.

- **Urgent updates** (typing) render immediately; transitions can wait without blocking them.
- **`useDeferredValue` needs `memo`** on the slow component: otherwise the urgent render renders it anyway with the old value. Recorded: ~125 ms per keystroke without `memo`, about one frame with it.
- **It doesn't make work smaller**, it stops it from blocking. If the component can be made faster, do that first.

Read more: [[Concurrent Rendering]]

**Q: Deferring vs debouncing: which and when?**
A: Debouncing waits a fixed time after the last input before doing anything; deferring (`useDeferredValue`) starts the low-priority render immediately, in interruptible chunks, and drops it when newer input arrives.

- **Debounce network requests** (fewer calls); **defer rendering** (responsive UI).
- Deferring adapts to the device: instant on a fast machine, lagging gracefully on a slow one.
- They combine well: debounce the fetch, defer the rendering of results.

Read more: [[Concurrent Rendering]], [[useDeferredValue with Suspense]]

**Q: What is code splitting, and how do you do it in React?**
A: Code splitting divides the JavaScript bundle into chunks loaded on demand, so users download only what the current screen needs; in React you use dynamic `import()` with `lazy` and a `Suspense` boundary for the loading state.

- **Split by route and by heavy, rarely used features**, not by small components.
- **Prefetch on intent** (hover, focus, idle time) so the chunk is ready before the click.
- **Wrap the navigation in a transition** to keep the current screen instead of flashing the fallback.
- Recorded: even after prefetching, `lazy`'s first render still suspended briefly, because an `import()` promise never resolves synchronously.

Read more: [[Code Splitting]]

**Q: How do you handle an expensive calculation in a component?**
A: Measure it; if it's slow and re-runs with the same inputs, cache it with `useMemo`; if it's slow even when inputs change, make the algorithm faster, defer the render around it, or move it off the main thread into a Web Worker.

- **`useMemo` only helps when the inputs didn't change.** Recorded: it removed the search on an unrelated click, but every keystroke still blocked for tens of milliseconds.
- **A Web Worker** keeps the main thread free; results come back as a promise you can read with `use` inside a transition.
- Data crosses threads by copying (`postMessage`), so send queries, not huge objects.

Read more: [[Expensive Calculations]]

**Q: What is list virtualization (windowing), and when do you need it?**
A: Windowing renders only the rows currently visible in a scroll container, plus a few extra (overscan), inside a spacer with the full list's height, and swaps rows in and out as the user scrolls.

- **For large lists** (hundreds to thousands of rows) where even memoized rows are too many: the DOM size itself is the cost.
- Recorded: 10,000 rows took ~75 ms to render; virtualized, 18 rows in the DOM and ~2 ms.
- **Trade-offs:** in-page find, screen readers, keyboard navigation and scroll restoration need extra work.
- Libraries: TanStack Virtual, react-window.

Read more: [[Windowing]]

**Q: Why might `memo` on list items still not help, and how do you fix it?**
A: If every row receives a prop that changes for all rows at once, such as `highlightedIndex` or `selectedId`, every row fails the comparison and re-renders, even though only one or two look different.

- **Fix by passing derived primitives:** `isHighlighted={i === highlightedIndex}`, so each row's prop changes only when its own state does.
- **Or a custom comparator** that checks only what the row displays, at the risk of drifting out of sync.
- Recorded: 500 renders per hover with plain `memo`, 1–2 with primitive props.

Read more: [[Optimize Rendering]]

**Q: What does the React Compiler change about manual memoization?**
A: The React Compiler analyses components at build time and automatically memoizes values, functions and JSX where it's safe, which removes most hand-written `useMemo`, `useCallback` and `memo`.

- It **relies on the Rules of React** (pure render, no mutation of props/state); code that breaks them is skipped.
- **It doesn't fix architecture:** heavy calculations, huge lists, waterfalls and bundle size still need the techniques above.
- Knowing how memoization works still matters, to read compiled behavior and debug.

Read more: [[Element Optimization]]

**Q: What is a request waterfall, and how do you avoid it?**
A: A waterfall is when requests run one after another although they could run in parallel, typically because a child component only starts its fetch after its parent's data has loaded (fetch-on-render).

- **Start every request a screen needs before waiting on any** (route loaders, click handlers): render-as-you-fetch.
- **Starting is cheap, waiting is what blocks:** create all promises first, then `use` them.
- Recorded: 1,200 ms as a waterfall vs 600 ms in parallel. React 19 pre-warms suspended siblings, but you shouldn't rely on it.

Read more: [[Waterfalls and Caching]]

**Q: How do you measure React performance?**
A: With the React DevTools Profiler (which components rendered, why, and for how long), the browser's Performance panel (main-thread time, long tasks, layout, paint), and in code with the `<Profiler onRender>` API, always on a production build and with CPU throttling.

- **"Highlight updates"** in DevTools shows unexpected re-renders immediately.
- Look at **interaction latency** (INP), not just render counts.
- Development builds include extra checks and double renders: never draw conclusions from them.

Read more: [[Windowing]], [[Optimize Rendering]]

## Hooks

**Q: What are hooks, and what are the rules of hooks?**
A: Hooks are functions (named `use…`) that let function components use React features such as state, effects, context and refs; they must be called at the top level of a component or custom hook, in the same order on every render, and never inside conditions, loops or regular functions.

- **The order rule exists because React stores hooks by position** on the fiber.
- **Custom hooks** compose built-in hooks to share stateful logic, not state itself: each call gets its own state.
- `use` is the exception: it can be called conditionally.
- The `eslint-plugin-react-hooks` rules catch most violations.

Read more: [[Hooks Under the Hood]]

**Q: How does `useState` work, and when should you pass a function to it?**
A: `useState(initial)` returns the current value and a setter; calling the setter queues an update and schedules a re-render, and React keeps the value on the component's fiber between renders.

- **Updater functions** (`setCount(c => c + 1)`) compute from the latest queued state: needed when an update depends on the previous one or several happen in one event.
- **Lazy initial state** (`useState(() => readFromStorage())`) runs the initializer only on mount.
- **Same value → no re-render** (compared with `Object.is`), so always create new objects and arrays instead of mutating.

Read more: [[Managing UI State]], [[Building a Cart]]

**Q: What is `useEffect` for, and what is the cleanup function?**
A: `useEffect` synchronizes a component with something outside React (subscriptions, timers, the DOM, network) after a render is committed; the function it returns is the cleanup, which undoes that synchronization before the effect runs again and when the component unmounts.

- **Dependencies** decide when it re-runs; they're compared with `Object.is`.
- **Missing cleanup leaks:** recorded, three hide/show cycles left four `popstate` listeners running.
- **Cleanup runs during the next commit**, after the new render, with the old render's values.
- **You might not need an effect:** derive values during render, and handle user events in event handlers.

Read more: [[Side Effects]], [[React Lifecycle]]

**Q: In what order do render, effects and cleanups run?**
A: On mount: render → layout effects → effects. On update: render first, then the old layout cleanup and new layout effect during the commit, then the old effect cleanup and the new effect. On unmount: only the cleanups.

- **Cleanups don't run before the next render**, they run after it, during the commit.
- **Strict Mode** in development runs setup → cleanup → setup once on mount to expose missing cleanups.
- `useEffect` isn't guaranteed to run after paint: after a click it ran before the next frame (recorded).

Read more: [[React Lifecycle]], [[Commit Phase and Effects]]

**Q: `useEffect` vs `useLayoutEffect`?**
A: Both have the same signature; `useLayoutEffect` runs synchronously during the commit, after the DOM is updated but before the browser paints, and its state updates render before paint too, while `useEffect` runs after the commit and may run after paint.

- **Use `useLayoutEffect` to measure and adjust layout** (tooltips, scroll position) without a visible flicker. Recorded: with `useEffect`, most hovers painted a tooltip in the wrong place for one frame.
- **It blocks painting**, so default to `useEffect`.
- Neither runs on the server.

Read more: [[useLayoutEffect]]

**Q: What is `useRef`, and how is it different from state?**
A: `useRef(initial)` returns a mutable object `{ current }` that stays the same for the component's whole life; changing `.current` doesn't trigger a re-render, which makes refs suitable for DOM nodes and for values the UI doesn't display.

- **State is for what's rendered; refs are for what isn't** (timers, previous values, DOM handles).
- **Don't read or write refs during render** (except lazy initialization): render must stay pure.
- **Ref callbacks** run when a node is attached and can return a cleanup (React 19).

Read more: [[DOM Refs and Effect Dependencies]]

**Q: Why does an effect with an object dependency run on every render?**
A: Because React compares dependencies with `Object.is`, and an object or function created during render is a new reference every time, so the dependency always looks "changed".

- **Depend on primitives** (`[scale, speed]`) and build the object inside the effect.
- Or stabilize it with `useMemo`/`useCallback`, or move it outside the component.
- **Don't silence the exhaustive-deps lint rule**: a missing dependency is usually a stale-closure bug.

Read more: [[DOM Refs and Effect Dependencies]]

**Q: What is a stale closure in hooks?**
A: A stale closure is a function that keeps reading the props and state of the render that created it, after newer renders have happened, because it was never recreated, typically in effects with missing dependencies, intervals and memoized callbacks.

- Each render's functions capture **that render's values**, which protects async code from seeing values change mid-flight.
- **Fixes:** correct dependencies, updater functions (`setX(x => …)`), a reducer, or a ref holding the latest value.
- **`useEffectEvent`** (React 19.2) gives effects a function that always sees the latest values without being a dependency.

Read more: [[React Re-rendering]], [[The Latest Ref Pattern]]

**Q: `useState` vs `useReducer`?**
A: Use `useState` for independent values; use `useReducer` when several values change together, or the next state depends on the previous one in non-trivial ways, so that all transitions live in one pure `reducer(state, action)` function.

- **A reducer can't read stale state:** React passes it the latest state for every action. Recorded: three `useState`s lost a history entry that the reducer kept.
- **Reducers are testable without React** (plain function calls).
- **`dispatch` is stable**, so it can be passed down without breaking `memo`.
- Returning the same state object makes React bail out of the children (the component itself still runs once).

Read more: [[useState vs useReducer]], [[useReducer]]

**Q: What is lifting state up, and when do you colocate state instead?**
A: Lifting state means moving it to the closest common parent of the components that need it and passing it down as props; colocating means keeping state as close as possible to where it's used.

- **Lift when siblings must share or sync** a value.
- **Colocate otherwise:** state high up re-renders everything below it on each change.
- If lifting forces passing props through many layers, consider composition first, then context.

Read more: [[Lifting State]]

**Q: How do `createContext` and `use` work together?**
A: `createContext(default)` defines a value that can be provided to a subtree; `<Ctx value={…}>` provides it; and `use(Ctx)` (or `useContext`) reads the nearest provider's value, re-rendering the component when that value changes.

- **Use it for widely read, rarely changing values:** theme, user, locale, feature flags.
- **Every reader re-renders on change**, even inside memoized parents.
- **Throw a clear error** from a custom hook when a required provider is missing.
- In React 19 the context itself is the provider (`<ThemeContext value>`).

Read more: [[Context with use]]

**Q: What is `useId` for?**
A: `useId` returns a unique, stable id per component instance that's the same on the server and the client, for linking labels, inputs and `aria-*` attributes.

- **Not for list keys** (keys come from your data).
- Hard-coded ids break as soon as a component renders twice on a page.

Read more: [[The useId Hook]]

**Q: What is `useImperativeHandle`?**
A: `useImperativeHandle(ref, () => handle)` lets a component expose a custom object on the ref its parent passes, typically a few methods like `focus()` or `scrollToBottom()`, instead of the raw DOM node.

- **For commands, not state:** "focus now" doesn't fit in a prop. Recorded: a `shouldFocus` prop worked once, then never again.
- **Encapsulation:** the parent can only call what you expose.
- In React 19 `ref` is a regular prop; `forwardRef` is no longer needed.

Read more: [[useImperativeHandle]]

**Q: What is `useSyncExternalStore`?**
A: `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` subscribes a component to a store React doesn't own (browser APIs, a plain JS store, a state library) and re-renders it when the snapshot changes, without tearing under concurrent rendering.

- **`getSnapshot` must return the same value when nothing changed.** A new object every call causes an infinite loop (recorded).
- **`getServerSnapshot`** is required for server rendering.
- Redux, Zustand and similar libraries are built on it.

Read more: [[useSyncExternalStore]]

**Q: How do `use`, `Suspense` and error boundaries work together?**
A: `use(promise)` returns a fulfilled promise's value; if the promise is pending, React suspends the component and shows the nearest `Suspense` fallback, retrying when it settles; if it rejects, the error goes to the nearest error boundary.

- **The promise must be stable** (created outside render or cached); a new promise each render suspends forever.
- **Pending content is not a thrown promise** in React 19: `use` throws an internal Suspense Exception and tracks the promise itself (recorded).
- **In a transition,** React keeps the current UI instead of showing the fallback.

Read more: [[Data Fetching with use]], [[Promise Caching and Transitions]]

**Q: What is `useOptimistic`?**
A: `useOptimistic` returns a value that you can update during an action or transition to show the expected result immediately; when the action ends it falls back to the real state, which also rolls back automatically on failure.

- **Needed because ordinary state updates inside a transition are held** until it finishes.
- **After an `await`,** wrap real state updates in `startTransition`, or they render separately (recorded: a duplicate review).
- Pair with `useFormStatus` for the button's pending state.

Read more: [[Optimistic UI]]

## Patterns

**Q: What is composition in React, and how does it reduce prop drilling?**
A: Composition means building components that accept other elements (through `children` or named element props) instead of the data needed to create them, so the component that owns the data builds the element and layout components only decide where to place it.

- **Prop drilling** passes data through components that don't use it; composition removes those dependencies.
- **`children`** for one slot, named props (`sidebar`, `content`) for several.
- **Reach for composition before context:** no provider, no hidden dependencies, no extra re-renders.
- Bonus: elements passed in from above are skipped when only the layout re-renders.

Read more: [[Composition and Layout Components]]

**Q: What are compound components?**
A: Compound components are a set of components designed to work together (like `<select>` and `<option>`) that share state implicitly through context provided by the parent, while the consumer controls the structure and markup.

- **Context, not `cloneElement`:** `cloneElement` only reaches direct children and breaks when a child is wrapped (recorded).
- **Validate usage:** a custom hook that throws "must be used inside `<Toggle>`" turns a cryptic null error into a clear one.
- Common in headless libraries (Radix, Headless UI, Reach): `Tabs`, `Accordion`, `Menu`.

Read more: [[Compound Components]]

**Q: What is the slots pattern?**
A: In the slots pattern, a root component provides, through context, a map of props for each named slot (`label`, `input`, `description`), and generic child components look up their slot and merge those props, so the same `Label` or `Text` can fill roles in many components.

- **The root owns accessibility wiring** (`id`, `htmlFor`, `aria-describedby`); the consumer only arranges pieces.
- **Merge order:** slot props first, explicit props last, so consumers can override.
- **Trade-off:** slot names are strings, so a typo fails silently (recorded: `aria-describedby` pointing at nothing).
- React Aria Components are built this way.

Read more: [[The Slots Pattern]]

**Q: What are prop collections and prop getters?**
A: A prop collection is an object of props a hook returns for a typical element (e.g. `aria-checked` and `onClick`); a prop getter is a function (`getTogglerProps(userProps)`) that merges the consumer's props with the hook's and chains event handlers so neither overwrites the other.

- **Collections break on custom handlers:** spread order decides which single `onClick` survives (recorded: either the toggle or the analytics call was lost).
- **Getters compose:** `onClick: callAll(userOnClick, toggle)`.
- Downshift popularized the `get…Props` convention.

Read more: [[Prop Collections and Getters]]

**Q: What is the state initializer pattern?**
A: The state initializer pattern lets the consumer of a hook or component set its starting state with an `initial…` option, usually alongside a `reset()` that returns to it, mirroring `useState(initial)` and `defaultValue`.

- **Initial means initial:** later changes to the prop are ignored.
- **Store the reset target in a ref** captured on mount, otherwise `reset` follows the current prop (recorded).
- To reset everything, remounting with a new `key` also works.

Read more: [[State Initializers]]

**Q: What is the state reducer pattern?**
A: The state reducer pattern is inversion of control for state transitions: a hook accepts a `reducer` from the consumer and uses it instead of its own, so the consumer can modify, veto or extend what each action does while the hook still decides when actions happen.

- **Export the default reducer** so consumers override one case and delegate the rest.
- **Returning the same state vetoes** an action; React still runs the component once, then bails out of its children (recorded).
- **The action types become public API**: renaming one is a breaking change.
- Downshift's `stateReducer` is the canonical example.

Read more: [[The State Reducer Pattern]]

**Q: What are control props?**
A: Control props let a parent own a component's state the way `value`/`onChange` control an `<input>`: when the prop is passed, the component stops updating its internal state and only suggests changes through a callback, which the parent can accept or ignore.

- **Use them to sync components, drive state from outside** (URL, server) or veto changes.
- **The round trip:** click → `onChange(suggestion)` → parent `setState` → new prop. If the parent ignores it, nothing renders (recorded).
- **Don't switch** between controlled and uncontrolled during a component's life.
- **State reducer vs control props:** the former customizes transitions while the component keeps the state; the latter hands the state to the parent.

Read more: [[Control Props]]

**Q: What is the latest ref pattern?**
A: The latest ref pattern stores the most recent callback (or value) in a ref, updated after every render, so a long-lived function such as a debounced handler or subscription can call the latest version without being recreated.

- **Separates identity from content:** the debounced function stays the same (its timers survive), but it reads `ref.current` when it runs.
- Rebuilding instead loses pending timers (recorded: four saves instead of one); building once around the first callback is stale (recorded: saved for the wrong product).
- **Update the ref in an effect,** not during render.
- **`useEffectEvent`** is the built-in equivalent for functions called from effects.

Read more: [[The Latest Ref Pattern]]

**Q: What is a portal, and how do events behave inside one?**
A: `createPortal(children, domNode)` renders children into a different DOM node (usually `document.body`) while they stay in the same place in the React tree, so they escape `overflow: hidden`, `z-index` and `transform` traps but keep context and state.

- **React events bubble through the React tree**, not the DOM tree: a click in a portaled dialog still triggers the parent component's `onClick` (recorded).
- Used for modals, tooltips, menus and toasts.
- **Accessibility is still on you:** focus management, `aria-modal`, Escape to close.

Read more: [[createPortal]]

**Q: What are custom hooks, and how do they differ from utility functions or HOCs?**
A: A custom hook is a function starting with `use` that calls other hooks to encapsulate reusable stateful logic; each component that calls it gets its own independent state, unlike a utility function (no hooks) or a higher-order component (wraps components).

- **Share logic, not state:** two components using `useCart()` don't share a cart unless the hook reads a shared context or store.
- **Hooks replaced most HOCs and render props:** no wrapper hell, explicit inputs and outputs, easy to compose.
- Name them for what they do (`useOnlineStatus`), not how.

Read more: [[useReducer]], [[Prop Collections and Getters]]

**Q: Render props vs hooks vs compound components: how do you choose an API?**
A: Choose by how much control the consumer needs: hooks expose logic and let the consumer render anything; compound components give a structured, declarative API with implicit wiring; render props are an older way to share rendering logic, mostly replaced by hooks.

- **Libraries often ship both:** a headless hook for full control and compound components for convenience.
- Add control layers progressively: initializers → state reducer → control props.
- **Optimize for the common case** and keep escape hatches for the rare one.

Read more: [[Compound Components]], [[Control Props]]

**Q: What is `flushSync`, and when is it justified?**
A: `flushSync(() => setState(…))` forces React to render and commit the update synchronously before it returns, so the next line can read the updated DOM, for example to focus or scroll to an element that was just rendered.

- **It defeats batching and scheduling**, so it's a de-optimization: use it only when imperative DOM code needs the result immediately.
- Recorded: without it, `inputRef.current` was still `null` right after `setEditing(true)`.
- Alternatives: `autoFocus`, ref callbacks, or `useLayoutEffect`.

Read more: [[flushSync]]

**Q: What is a higher-order component, and is it still used?**
A: A higher-order component (HOC) is a function that takes a component and returns a new component with added behavior or props, such as `withRouter(Component)`; hooks have replaced most HOCs, but they still appear for cross-cutting wrappers and in older code.

- **Downsides:** wrapper nesting, props colliding by name, unclear where a prop comes from, and static typing friction.
- **`memo` is technically a HOC**, and so are many library wrappers (`observer`, `connect`).
- Prefer a custom hook when the goal is sharing logic.

Read more: [[Element Optimization]]

**Q: How do you combine these patterns in a real component library?**
A: Layer them: a headless hook owns the logic (prop getters, state reducer, control props, initializers), compound components or slots provide the declarative API on top of it, and composition keeps layout flexible, so consumers can pick the level of control they need.

- **Start simple:** a component with sensible defaults; add control layers only for real use cases.
- **Accessibility lives in the library**, wired through context or slots, so consumers can't forget it.
- Examples: Downshift (hooks + getters + reducer), Radix (compound components + control props), React Aria (hooks + slots).

Read more: [[Compound Components]], [[The State Reducer Pattern]]

**Q: How do you design a reusable component's API?**
A: Start from the consumer's code: keep the common case to a few props, make it composable (`children`, slots), accessible by default, and controllable when needed (`value`/`onChange` alongside defaults), and expose escape hatches such as a state reducer or prop getters only where real use cases demand them.

- **Prefer composition over configuration:** a growing list of boolean props is a smell.
- **Support controlled and uncontrolled** modes the way native inputs do.
- **Forward native props** (`...rest` typed with `ComponentProps<'button'>`) and `ref`.
- **Document behavior as API:** action types, events and slot names become contracts.

Read more: [[Composition and Layout Components]], [[TypeScript with React]]
