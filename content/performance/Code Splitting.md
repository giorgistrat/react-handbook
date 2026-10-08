---
source: https://react.dev/reference/react/lazy
---

# Code Splitting

## In one minute

Every `import` at the top of a file puts that code in the page's initial JavaScript, which the browser must download, parse and run before the page works, even for features most users never open. **Code splitting** loads a feature's code on demand. The dynamic `import('./x')` returns a promise for a module, and bundlers turn each one into a separate file (a **chunk**). `lazy(() => import('./x'))` makes that into a component that **suspends** until its code arrives, with a `<Suspense>` boundary showing a fallback meanwhile. Two refinements: start the download early, when the user hovers or focuses the button (**prefetch**), and use a **transition** so React keeps the current screen instead of flashing the fallback.

**You'll be able to:** lazy-load a component, prefetch it on intent, and avoid the loading flash with `useTransition`.

<!-- figure name="codeSplitAnim" -->

## The example: the size chart

Product pages have a "Size chart" button that few shoppers click. Its module logs `size-chart.tsx evaluated` when it runs. For the recordings, the dev server delays that file by 500 ms, like a slow network.

<!-- source file="src/lessons/performance/04-static-import.tsx" region="static" -->

With a normal `import SizeChart from './size-chart'` at the top, the recorded order, from page load to clicking the button:

<!-- output from="performance" path="split.static.logs" as="log" -->

The chart's code ran before the page even mounted.

### 1. `lazy` + `Suspense`

<!-- source file="src/lessons/performance/04-code-splitting.tsx" region="lazy" -->

<!-- source file="src/lessons/performance/04-code-splitting.tsx" region="onDemand" -->

<!-- output from="performance" path="split.lazy.logs" as="log" -->

Nothing loads until `SizeChart` first renders. Then `lazy` calls the loader, the component suspends, the nearest `Suspense` shows "Loading size chart…", and React retries once the module arrives. The module must **default-export** the component (for a named export: `import('./x').then((m) => ({ default: m.SizeChart }))`), and `lazy` must be called **outside** any component, or it creates a new component (and loses state) every render.

### 2. Prefetch on hover and focus

<!-- source file="src/lessons/performance/04-code-splitting.tsx" region="prefetch" -->

Hover, wait a second, then click:

<!-- output from="performance" path="split.prefetch.logs" as="log" -->

The download started on hover and the module ran **once**, although `import()` was called three times (hover, focus on click, and `lazy`'s own first render): modules are cached by URL. But notice `fallback shown`: even with the code already downloaded, `lazy`'s first render suspended, because an `import()` promise never resolves synchronously. The fallback was brief, but it was there.

### 3. A transition

<!-- source file="src/lessons/performance/04-code-splitting.tsx" region="transition" -->

Clicking right away (the hover starts the download a moment before):

<!-- output from="performance" path="split.transitionCold.logs" as="log" -->

No fallback at all. When an update inside `startTransition` suspends, React keeps showing the current UI and waits; `isPending` lets you show something small (here, ⏳ in the button).

Even with the code prefetched, the pending marker appeared briefly:

<!-- output from="performance" path="split.transitionWarm.logs" as="log" -->

To avoid that one-frame flicker of a pending indicator, libraries like `spin-delay` only show it if loading takes longer than a threshold (say 500 ms), and then keep it visible for a minimum time.

## How it works

- **The bundler splits at `import()`.** Vite or webpack emit the imported module, and everything only it depends on, as a separate file.
- **`lazy` caches.** It calls the loader on the first render only; the promise and the resulting component are cached, so later renders don't load again.
- **Fallbacks follow update priority.** If an urgent update (or the first mount) suspends, the nearest `Suspense` shows its fallback right away. If a transition suspends, React keeps the old UI. React also throttles reveals of suspended content (to about 300 ms) so a fast load doesn't produce a quick flash of several states.
- **Where the boundary goes matters.** The `Suspense` boundary decides what's replaced by the fallback: put it close to the lazy component, not around the whole page.

## Common mistakes

- **Calling `lazy` inside a component.** A new component type every render.
- **A named export** without the `.then((m) => ({ default: … }))` adapter.
- **Splitting tiny components.** Each chunk is an extra request; split features and routes, not buttons.
- **No prefetch for likely actions.** The user waits at the worst moment, right after they asked.

## Interview Q&A

**Q: What is code splitting?**
A: Splitting the JavaScript bundle so each screen downloads only the code it needs, loading the rest on demand with dynamic `import()`. Recorded: with a static import, the size chart's code ran before the page mounted; with `lazy`, only after the click.

**Q: How does `React.lazy` work?**
A: `lazy(load)` returns a component. On its first render it calls `load()`; until the promise resolves it suspends, so the nearest `Suspense` shows its fallback. The resolved module's `default` export is the component, and both are cached.

**Q: Does calling `import()` several times download the module several times?**
A: No. Modules are cached by URL. Recorded: three `import()` calls, one `size-chart.tsx evaluated`.

**Q: Why might the fallback still flash after prefetching?**
A: `lazy`'s first render always suspends, because an `import()` promise can't resolve synchronously, even from cache. Recorded: `fallback shown` after a prefetch that had finished.

**Q: How do you avoid the fallback?**
A: Make the update a transition: `startTransition(() => setShow(true))`. React keeps the current UI while the new one suspends, and `isPending` tells you it's waiting. Recorded: no fallback, just the ⏳ marker.

## Related

- [[Concurrent Rendering]]: transitions and priorities.
- [[Error Boundaries]]: handle a chunk that fails to load.

## Sources

- react.dev: [`lazy`](https://react.dev/reference/react/lazy), [`Suspense`](https://react.dev/reference/react/Suspense), [`useTransition`](https://react.dev/reference/react/useTransition)
- MDN: [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [spin-delay](https://github.com/smeijer/spin-delay): delaying pending indicators
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
