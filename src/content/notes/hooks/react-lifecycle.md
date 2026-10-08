---
title: "React Lifecycle"
slug: "react-lifecycle"
module: "hooks"
order: 2
level: "must"
illus: "loop"
summary: "Mount, update, unmount: the recorded order of renders, layout effects, effects and cleanups."
source: "https://react.dev/learn/lifecycle-of-reactive-effects"
---


## In one minute

A component goes through three stages: **mount** (first appears), **update** (renders again because its state, its parent or a context it reads changed; any number of times) and **unmount** (removed). In every render React calls the **whole function** again, then commits the changes to the DOM, then runs effects. The details people get wrong are the order: an effect's **cleanup runs after the next render**, not before it, and with the values of its own render; layout effects run before the browser paints, regular effects don't hold the paint up.

**You'll be able to:** say exactly what runs, in what order, on mount, update and unmount, and in Strict Mode.

<figure class="fig anim fig-hooks-lifecycle-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;CartBadge({ count: 0 })&quot;,&quot;say&quot;:&quot;&lt;b&gt;Mount.&lt;/b&gt; The function runs; hooks are created; JSX is returned.&quot;,&quot;set&quot;:{&quot;stage&quot;:&quot;run&quot;,&quot;m1&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;stage&quot;:&quot;mounting&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commit → useLayoutEffect&quot;,&quot;say&quot;:&quot;React puts the &lt;code&gt;&amp;lt;span&amp;gt;&lt;/code&gt; in the DOM, then runs layout effects &lt;b&gt;before the browser paints&lt;/b&gt;, so they can measure or adjust the DOM without a flicker.&quot;,&quot;set&quot;:{&quot;dom&quot;:&quot;new&quot;,&quot;m2&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;&amp;lt;span&amp;gt;0 in cart&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;useEffect&quot;,&quot;say&quot;:&quot;Then the regular effect. React doesn’t make the browser wait for it.&quot;,&quot;set&quot;:{&quot;m3&quot;:&quot;new&quot;,&quot;stage&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;stage&quot;:&quot;mounted&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;click → CartBadge({ count: 1 })&quot;,&quot;say&quot;:&quot;&lt;b&gt;Update.&lt;/b&gt; The function runs again &lt;b&gt;first&lt;/b&gt;. Nothing has been cleaned up yet.&quot;,&quot;set&quot;:{&quot;stage&quot;:&quot;run&quot;,&quot;u1&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;stage&quot;:&quot;updating&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;layout cleanup(0) → layout effect(1)&quot;,&quot;say&quot;:&quot;During the commit: the old layout effect’s cleanup (with &lt;b&gt;count = 0&lt;/b&gt;, its own render’s value), then the new layout effect.&quot;,&quot;set&quot;:{&quot;dom&quot;:&quot;upd&quot;,&quot;u2&quot;:&quot;new&quot;,&quot;u3&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;&amp;lt;span&amp;gt;1 in cart&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;effect cleanup(0) → effect(1)&quot;,&quot;say&quot;:&quot;Then the same for the regular effect. Cleanups always see the values of the render that created them.&quot;,&quot;set&quot;:{&quot;u4&quot;:&quot;new&quot;,&quot;u5&quot;:&quot;new&quot;,&quot;stage&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;stage&quot;:&quot;updated&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;hide → unmount&quot;,&quot;say&quot;:&quot;&lt;b&gt;Unmount.&lt;/b&gt; No render: React runs the remaining cleanups one last time and removes the DOM.&quot;,&quot;set&quot;:{&quot;x1&quot;:&quot;new&quot;,&quot;x2&quot;:&quot;new&quot;,&quot;dom&quot;:&quot;del&quot;,&quot;stage&quot;:&quot;del&quot;},&quot;txt&quot;:{&quot;stage&quot;:&quot;unmounted&quot;}}]" data-intro="A cart badge with one layout effect and one effect, both logging their &lt;code&gt;count&lt;/code&gt;."><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">&lt;CartBadge count={count} /&gt;</div><div class="a-col"><span class="an chip-a" data-k="stage" data-s="faint">not on screen</span><span class="an chip-a" data-k="dom" data-s="ghost">&lt;span&gt;?</span></div></div><div class="a-panel wide"><div class="a-panel-title">console (recorded order)</div><div class="a-log"><div class="an" data-k="m1" data-s="ghost">render (count = 0)</div><div class="an" data-k="m2" data-s="ghost">layout effect (count = 0)</div><div class="an" data-k="m3" data-s="ghost">effect (count = 0)</div><div class="an" data-k="u1" data-s="ghost">render (count = 1)</div><div class="an" data-k="u2" data-s="ghost">layout cleanup (count = 0)</div><div class="an" data-k="u3" data-s="ghost">layout effect (count = 1)</div><div class="an" data-k="u4" data-s="ghost">effect cleanup (count = 0)</div><div class="an" data-k="u5" data-s="ghost">effect (count = 1)</div><div class="an" data-k="x1" data-s="ghost">layout cleanup (count = 1)</div><div class="an" data-k="x2" data-s="ghost">effect cleanup (count = 1)</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>CartBadge({ count: 0 })</code><span><b>Mount.</b> The function runs; hooks are created; JSX is returned.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commit → useLayoutEffect</code><span>React puts the <code>&lt;span&gt;</code> in the DOM, then runs layout effects <b>before the browser paints</b>, so they can measure or adjust the DOM without a flicker.</span></li><li><span class="anim-phase ph-effect">effects</span><code>useEffect</code><span>Then the regular effect. React doesn’t make the browser wait for it.</span></li><li><span class="anim-phase ph-render">render phase</span><code>click → CartBadge({ count: 1 })</code><span><b>Update.</b> The function runs again <b>first</b>. Nothing has been cleaned up yet.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>layout cleanup(0) → layout effect(1)</code><span>During the commit: the old layout effect’s cleanup (with <b>count = 0</b>, its own render’s value), then the new layout effect.</span></li><li><span class="anim-phase ph-effect">effects</span><code>effect cleanup(0) → effect(1)</code><span>Then the same for the regular effect. Cleanups always see the values of the render that created them.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>hide → unmount</code><span><b>Unmount.</b> No render: React runs the remaining cleanups one last time and removes the DOM.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="del"></i>deleted</span><span><i class="an lg-sw" data-s="ok"></i>ok</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Mount, one update, unmount: every line was logged by the product store in this order.</figcaption></figure>

## The example: a cart badge that logs everything

```tsx
function CartBadge({ count }: { count: number }) {
	log(`render (count = ${count})`)

	useLayoutEffect(() => {
		log(`  layout effect (count = ${count})`)
		requestAnimationFrame(() => log(`  next frame starts (count = ${count})`))
		return () => log(`  layout cleanup (count = ${count})`)
	}, [count])

	useEffect(() => {
		log(`  effect (count = ${count})`)
		return () => log(`  effect cleanup (count = ${count})`)
	}, [count])

	return <span id="badge">{count} in cart</span>
}
```

The page renders the badge, the recorder clicks "Add to cart" once, then "Hide badge". Logged, phase by phase:

**Mount**

```text
createRoot().render()
render (count = 0)
  layout effect (count = 0)
  next frame starts (count = 0)
  effect (count = 0)
```

**Update** (count 0 → 1)

```text
render (count = 1)
  layout cleanup (count = 0)
  layout effect (count = 1)
  effect cleanup (count = 0)
  effect (count = 1)
  next frame starts (count = 1)
```

**Unmount**

```text
  layout cleanup (count = 1)
  effect cleanup (count = 1)
```

## What the recording shows

1. **The function runs first, cleanups later.** On update, `render (count = 1)` is logged **before** `effect cleanup (count = 0)`. React has to run the component to find out what changed; only when it commits does it clean up the previous effects and run the new ones. (A common diagram puts the cleanup before the re-render. The recording shows that's not the order.)
2. **Cleanups see their own render's values.** The cleanup logged `count = 0` even though the component was already rendering `count = 1`: it's a closure from render 0.
3. **Layout effects come first and finish before paint.** `useLayoutEffect` (and its cleanup) runs right after the DOM is updated, before the browser paints. Use it to measure or adjust layout without a visible flicker; keep it short, because the paint waits for it.
4. **Regular effects don't block paint, but aren't guaranteed to run after it.** React lets the browser paint before running them when it can. After a discrete interaction like a click, React runs them right away to keep the UI consistent: here `effect (count = 1)` ran before the next frame started. Don't rely on either timing.
5. **Unmount is cleanups only.** No render happens; every remaining cleanup runs once, then the DOM is removed and the component's state is gone.

## Strict Mode

In development, `<StrictMode>` adds checks. The same mount, wrapped in it:

```text
createRoot().render()
render (count = 0)
render (count = 0)
  layout effect (count = 0)
  effect (count = 0)
  layout cleanup (count = 0)
  effect cleanup (count = 0)
  layout effect (count = 0)
  effect (count = 0)
  next frame starts (count = 0)
  next frame starts (count = 0)
```

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

<details class="qa"><summary>What are the three stages of a component's lifecycle?</summary>

Mount (first render and commit), update (re-render because of its own state, its parent, or a context it reads; repeatable) and unmount (removal). Effects map onto them: they run after mount, re-run after updates where dependencies changed, and their cleanups run before re-runs and on unmount.

</details>

<details class="qa"><summary>Does React re-run the whole component on every render?</summary>

Yes, top to bottom. What React limits is the output: it compares the new elements with the previous ones and changes only the DOM that differs.

</details>

<details class="qa"><summary>In what order do render, cleanup and effect happen on an update?</summary>

Render first, then the commit: layout-effect cleanups, layout effects, and then effect cleanups and effects. Recorded: `render (count = 1)` → `layout cleanup (count = 0)` → `layout effect (count = 1)` → `effect cleanup (count = 0)` → `effect (count = 1)`.

</details>

<details class="qa"><summary>Why does a cleanup function see "old" values?</summary>

It's a closure created during the render that ran the effect. The recording's update logged `effect cleanup (count = 0)` while the new render had `count = 1`.

</details>

<details class="qa"><summary>When would you use <code>useLayoutEffect</code> instead of <code>useEffect</code>?</summary>

When the effect reads or changes layout and the user must not see the intermediate state (measuring an element to position a tooltip). It runs before the browser paints, so keep it fast; everything else belongs in `useEffect`.

</details>

<details class="qa"><summary>What does Strict Mode do to the lifecycle?</summary>

In development only, it calls component functions twice and runs mount effects as setup → cleanup → setup. Recorded: two `render (count = 0)` lines and the effect/cleanup/effect sequence.

</details>

## Related

- [Side Effects](../../hooks/side-effects/): why cleanups exist.
- [Commit Phase and Effects](../../internals/commit-phase-and-effects/) (React Internals): how React schedules layout and passive effects inside the commit.

## Sources

- react.dev: [Lifecycle of reactive effects](https://react.dev/learn/lifecycle-of-reactive-effects), [`useEffect`](https://react.dev/reference/react/useEffect), [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect), [`StrictMode`](https://react.dev/reference/react/StrictMode)
- Darius Cosden, [The React Lifecycle: Simply Explained](https://www.youtube.com/watch?v=kKVVan3EGoU) (the vault note this one started from); Donavon West's [hook-flow diagram](https://github.com/donavon/hook-flow)
