---
source: https://react.dev/reference/react-dom/flushSync
---

# flushSync

## In one minute

`setState` doesn't change the DOM right away. React **queues** the update and renders after your event handler returns, so it can batch several updates into one render. Usually that's what you want. But sometimes the very next line needs the new DOM: to focus an input that's about to appear, or to scroll to an item you just added. `flushSync(() => setState(…))` makes React **render and commit before `flushSync` returns**. It's an escape hatch, because it gives up batching and scheduling for that update.

**You'll be able to:** focus or scroll to something you just rendered, and explain why it's a de-optimization.

<!-- figure name="flushSyncAnim" -->

## The example: a wishlist

### 1. Rename inline, then focus

Clicking the wishlist's name swaps it for an input, which should be focused right away.

<!-- source file="src/lessons/apis/06-flush-sync.tsx" region="rename" -->

With a plain `setEditing(true)` (`sync` false):

<!-- output from="apis" path="flushSync.rename.click" as="log" -->

The `render` line comes **last**. When the handler asked for `inputRef.current`, the input didn't exist yet, so nothing was focused.

With `flushSync`:

<!-- output from="apis" path="flushSync.renameSync.click" as="log" -->

The render happened **inside** the click handler, between `click: start` and the next line, so the ref was attached and focus worked.

### 2. Add, then scroll to it

<!-- source file="src/lessons/apis/06-flush-sync.tsx" region="list" -->

Adding "Notebook Set", without and with `flushSync`:

<!-- output from="apis" path="flushSync.list.click" as="log" -->

<!-- output from="apis" path="flushSync.listSync.click" as="log" -->

Without it, `scrollIntoView` scrolled to the **previous** last item.

## How it works

- **Updates are queued, then rendered together.** Inside a click handler, React renders after the handler finishes ([[Scheduler, Lanes and Batching]]). Every `setState` in that handler ends up in one render.
- **`flushSync` renders now.** It runs your callback, then renders and commits the queued updates synchronously, including layout effects and ref attachment. When it returns, the DOM is up to date.
- **Why it's a de-optimization:** the work can't be batched with later updates or split up, it blocks the main thread, and it may also flush other pending updates. If a `Suspense` boundary would suspend during that render, it may show its fallback.
- **Alternatives:** if the element only needs focus when it appears, `autoFocus` or a ref callback (`ref={(el) => el?.focus()}`) does it without `flushSync`. If the code reacts to the DOM after every relevant render, it belongs in [[useLayoutEffect]].

## Common mistakes

- **Using it to make updates "faster".** It makes them synchronous, which is usually slower overall.
- **Calling it while React is already rendering or committing** (in a component body, or a layout effect). React warns that it can't flush then, and the update waits.
- **Wrapping many updates in many `flushSync` calls.** Each one is a full render and commit.

## Interview Q&A

**Q: What does `flushSync` do?**
A: `flushSync(callback)` runs the callback and makes React apply the resulting updates to the DOM before it returns. The code after it sees the updated DOM.

**Q: Why is the DOM not updated right after `setState`?**
A: React queues updates and renders after the event handler, batching them into one render. Recorded: without `flushSync`, `inputRef.current` was `null` right after `setEditing(true)`, and the render was logged after the handler's last line.

**Q: Give a case where you need it.**
A: Focusing an input that appears because of the same click (inline rename), or scrolling to an item you just added. Recorded: without `flushSync`, the "last `<li>`" was still Desk Lamp; with it, Notebook Set.

**Q: Why does React call it a de-optimization?**
A: It forces a synchronous render and commit that can't be batched or interrupted, may flush unrelated pending updates, and can show `Suspense` fallbacks. Use it only when code outside React needs the DOM immediately.

**Q: How is it related to `useLayoutEffect`?**
A: Both handle "the DOM isn't updated yet". `flushSync` is imperative, inside the handler: update now so my next line sees it. `useLayoutEffect` reacts after a commit and before paint: read the new layout and adjust.

## Related

- [[useLayoutEffect]]: read the DOM before paint.
- [[useImperativeHandle]]: expose `focus()` from a component.
- [[Scheduler, Lanes and Batching]]: how React batches and schedules updates.

## Sources

- react.dev: [`flushSync`](https://react.dev/reference/react-dom/flushSync), [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- Jules Blom, [More than you need to know about ReactDOM.flushSync](https://julesblom.com/writing/flushsync)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
