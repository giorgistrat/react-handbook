---
source: https://react.dev/learn/lifecycle-of-reactive-effects
---

# React Lifecycle

## In one minute

A component goes through three stages: **mount** (first appears), **update** (renders again because its state, its parent or a context it reads changed; any number of times) and **unmount** (removed). In every render React calls the **whole function** again, then commits the changes to the DOM, then runs effects. The details people get wrong are the order: an effect's **cleanup runs after the next render**, not before it, and with the values of its own render; layout effects run before the browser paints, regular effects don't hold the paint up.

**You'll be able to:** say exactly what runs, in what order, on mount, update and unmount, and in Strict Mode.

<!-- figure name="lifecycleAnim" -->

## The example: a cart badge that logs everything

<!-- source file="src/lessons/hooks/03-lifecycle.tsx" region="badge" -->

The page renders the badge, the recorder clicks "Add to cart" once, then "Hide badge". Logged, phase by phase:

**Mount**

<!-- output from="hooks" path="lifecycle.normal.mount" as="log" -->

**Update** (count 0 → 1)

<!-- output from="hooks" path="lifecycle.normal.update" as="log" -->

**Unmount**

<!-- output from="hooks" path="lifecycle.normal.unmount" as="log" -->

## What the recording shows

1. **The function runs first, cleanups later.** On update, `render (count = 1)` is logged **before** `effect cleanup (count = 0)`. React has to run the component to find out what changed; only when it commits does it clean up the previous effects and run the new ones. (A common diagram puts the cleanup before the re-render. The recording shows that's not the order.)
2. **Cleanups see their own render's values.** The cleanup logged `count = 0` even though the component was already rendering `count = 1`: it's a closure from render 0.
3. **Layout effects come first and finish before paint.** `useLayoutEffect` (and its cleanup) runs right after the DOM is updated, before the browser paints. Use it to measure or adjust layout without a visible flicker; keep it short, because the paint waits for it.
4. **Regular effects don't block paint, but aren't guaranteed to run after it.** React lets the browser paint before running them when it can. After a discrete interaction like a click, React runs them right away to keep the UI consistent: here `effect (count = 1)` ran before the next frame started. Don't rely on either timing.
5. **Unmount is cleanups only.** No render happens; every remaining cleanup runs once, then the DOM is removed and the component's state is gone.

## Strict Mode

In development, `<StrictMode>` adds checks. The same mount, wrapped in it:

<!-- output from="hooks" path="lifecycle.strict.mount" as="log" -->

The component rendered **twice** (to catch impure renders), and the effects ran, were cleaned up, and ran again (to catch missing cleanups). None of this happens in production builds. If your effect breaks under this, it would also break when the component remounts for real.

## The stages, summed up

| | Mount | Update | Unmount |
|---|---|---|---|
| Component function | runs | runs again (all of it) | — |
| `useState` | initial value (initializer runs) | current value | discarded |
| DOM | created | changed where needed | removed |
| `useLayoutEffect` | runs (before paint) | old cleanup → new run, if deps changed | cleanup |
| `useEffect` | runs | old cleanup → new run, if deps changed | cleanup |

## Server Components, briefly

React Server Components (for example in Next.js' App Router) run on the server only. They have no state and no effects, so none of this lifecycle applies to them; they render, their output is sent to the client, and a later request or a server action re-runs them. Client components inside them go through mount, update and unmount as above.

## Common mistakes

- Expecting a cleanup to run before the next render, or to see the new values.
- Doing slow work in `useLayoutEffect`, which delays the paint.
- Treating Strict Mode's double calls as a bug to silence rather than a sign of a missing cleanup.

## Interview Q&A

**Q: What are the three stages of a component's lifecycle?**
A: Mount (first render and commit), update (re-render because of its own state, its parent, or a context it reads; repeatable) and unmount (removal). Effects map onto them: they run after mount, re-run after updates where dependencies changed, and their cleanups run before re-runs and on unmount.

**Q: Does React re-run the whole component on every render?**
A: Yes, top to bottom. What React limits is the output: it compares the new elements with the previous ones and changes only the DOM that differs.

**Q: In what order do render, cleanup and effect happen on an update?**
A: Render first, then the commit: layout-effect cleanups, layout effects, and then effect cleanups and effects. Recorded: `render (count = 1)` → `layout cleanup (count = 0)` → `layout effect (count = 1)` → `effect cleanup (count = 0)` → `effect (count = 1)`.

**Q: Why does a cleanup function see "old" values?**
A: It's a closure created during the render that ran the effect. The recording's update logged `effect cleanup (count = 0)` while the new render had `count = 1`.

**Q: When would you use `useLayoutEffect` instead of `useEffect`?**
A: When the effect reads or changes layout and the user must not see the intermediate state (measuring an element to position a tooltip). It runs before the browser paints, so keep it fast; everything else belongs in `useEffect`.

**Q: What does Strict Mode do to the lifecycle?**
A: In development only, it calls component functions twice and runs mount effects as setup → cleanup → setup. Recorded: two `render (count = 0)` lines and the effect/cleanup/effect sequence.

## Related

- [[Side Effects]]: why cleanups exist.
- [[Commit Phase and Effects]] (React Internals): how React schedules layout and passive effects inside the commit.

## Sources

- react.dev: [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects), [`useEffect`](https://react.dev/reference/react/useEffect), [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect), [`StrictMode`](https://react.dev/reference/react/StrictMode)
- Darius Cosden, [The React Lifecycle: Simply Explained](https://www.youtube.com/watch?v=kKVVan3EGoU) (the vault note this one started from); Donavon West's [hook-flow diagram](https://github.com/donavon/hook-flow)
