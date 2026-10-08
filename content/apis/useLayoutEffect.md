---
source: https://react.dev/reference/react/useLayoutEffect
---

# useLayoutEffect

## In one minute

`useLayoutEffect(setup, deps)` has the same signature as `useEffect`, but different timing. It runs **during the commit, after the DOM is updated and before the browser can paint**, and a state update made inside it is rendered **synchronously**, also before paint. Use it when an effect **measures the DOM and changes what's shown** (position, size, scroll), so the user never sees the unmeasured version. Default to `useEffect`; layout effects block painting.

**You'll be able to:** spot the measure-then-adjust flicker, fix it with `useLayoutEffect`, and explain why it's not the default.

<!-- figure name="layoutTimingAnim" -->

## The example: the shipping tooltip

Next to the price there's a "Shipping ⓘ" button. Hovering it for 200 ms shows a tooltip. The tooltip prefers to sit **above** the button, but if there isn't room it goes **below**. It can't know whether it fits until it knows its own height, and it can't know its height until it's in the DOM.

<!-- source file="src/lessons/apis/04-layout-effect.tsx" region="tooltip" -->

`useMeasureEffect` is `useEffect` or `useLayoutEffect`. The button is near the top of the page and the tooltip is 58px tall, so the right answer is "below".

To see what the user sees, the lesson logs what's on screen in `requestAnimationFrame`, which the browser runs **right before each paint**. Each hover was recorded 20 times.

### With `useEffect`

The most common sequence:

<!-- output from="apis" path="layout.effect.typical" as="log" -->

<!-- output from="apis" path="layout.effect.summary" as="text" -->

The browser painted a frame between the commit and the effect. For one frame, the tooltip sat on top of the button, then jumped below it.

### With `useLayoutEffect`

<!-- output from="apis" path="layout.layout.typical" as="log" -->

<!-- output from="apis" path="layout.layout.summary" as="text" -->

The measurement and the second render both happened **before the first frame**, so the first thing painted was the correct position.

## How it works

- **The commit, in order:** React writes DOM changes, attaches refs, then runs layout effects (cleanups first). Then it returns and the browser can paint. Regular effects run later ([[React Lifecycle]], [[Commit Phase and Effects]]).
- **Reading layout in a layout effect** (`getBoundingClientRect`, `offsetHeight`) makes the browser calculate layout right away. That costs time, but nothing is painted.
- **An update from a layout effect is synchronous.** React renders and commits it immediately, still before paint. That's why there's no wrong frame, and also why heavy work there delays the frame the user is waiting for.
- **`useEffect` isn't always after paint.** After a click, React runs effects before the next frame ([[Side Effects]]). The flicker appears when the update isn't from a click: here, a hover timer. Only `useLayoutEffect` guarantees it.
- **On the server,** neither effect runs. For a server-rendered tooltip, render nothing until the client has measured, or use CSS.

## Common mistakes

- **Using `useLayoutEffect` by default.** It blocks paint every time it runs. Use it only for the measure-then-adjust case.
- **Expensive work in a layout effect.** It delays the frame directly.
- **Measuring in render.** The DOM isn't updated yet, and refs aren't attached.
- **Reaching for it when CSS can do it.** Sticky positioning, CSS anchor positioning and container queries need no JavaScript measurement.

## Interview Q&A

**Q: What's the difference between `useEffect` and `useLayoutEffect`?**
A: Same signature, different timing. `useLayoutEffect` runs during the commit, after DOM updates and before the browser paints, and its state updates render synchronously. `useEffect` runs after the commit and can run after paint.

**Q: When does `useEffect` cause a visible bug here?**
A: When it measures the DOM and then moves or resizes something. The browser may paint the unmeasured version first. Recorded: with `useEffect`, most hovers painted the tooltip covering the button for one frame. With `useLayoutEffect`, none did.

**Q: Why not always use `useLayoutEffect`?**
A: It blocks painting until it's done, and so do its updates. For effects that don't change what's on screen (subscriptions, logging, fetching), that's delay for nothing.

**Q: Give real uses.**
A: Positioning a tooltip or popover based on available space; computing how many cards fit a measured container; keeping a chat scrolled to the bottom when messages arrive; measuring text to truncate it.

**Q: How did the recording know what was painted?**
A: `requestAnimationFrame` callbacks run right before each paint, so the tooltip's position read there is what that frame shows.

## Related

- [[React Lifecycle]]: the recorded order of layout effects and effects.
- [[flushSync]]: the other half of "the DOM hasn't caught up": write it before your next line.
- [[createPortal]]: tooltips are often portaled too.
- [[Commit Phase and Effects]]: where React runs each kind of effect.

## Sources

- react.dev: [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect)
- MDN: [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
