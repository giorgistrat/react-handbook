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

<figure class="fig anim fig-hooks-lifecycle-anim anim-code" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;log(`render (count = ${count})`)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Mount.&lt;/b&gt; The function runs, the hooks are created, and JSX is returned.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;hl&quot;,&quot;c-0&quot;:&quot;new&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;log(`layout effect (count = ${count})`)&quot;,&quot;say&quot;:&quot;React puts the &lt;code&gt;&amp;lt;span&amp;gt;&lt;/code&gt; in the DOM, then runs layout effects &lt;b&gt;before the browser paints&lt;/b&gt;, so they can measure or adjust without a flicker.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;c-0&quot;:&quot;&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;s-badge&quot;:&quot;upd&quot;,&quot;c-1&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;s-badge&quot;:&quot;0 in cart&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;log(`effect (count = ${count})`)&quot;,&quot;say&quot;:&quot;Then the regular effect. React doesn’t make the browser wait for it.&quot;,&quot;set&quot;:{&quot;L3&quot;:&quot;&quot;,&quot;s-badge&quot;:&quot;&quot;,&quot;c-1&quot;:&quot;&quot;,&quot;L7&quot;:&quot;hl&quot;,&quot;c-2&quot;:&quot;new&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;log(`render (count = ${count})`)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Update&lt;/b&gt; (count becomes 1). The function runs again &lt;b&gt;first&lt;/b&gt;. Nothing has been cleaned up yet.&quot;,&quot;set&quot;:{&quot;L7&quot;:&quot;&quot;,&quot;c-2&quot;:&quot;&quot;,&quot;L1&quot;:&quot;hl&quot;,&quot;c-3&quot;:&quot;new&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;return () =&gt; log(`layout cleanup (count = ${count})`)&quot;,&quot;say&quot;:&quot;During the commit: the old layout effect’s cleanup (with &lt;b&gt;count = 0&lt;/b&gt;, its own render’s value), then the new layout effect.&quot;,&quot;set&quot;:{&quot;L1&quot;:&quot;&quot;,&quot;c-3&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;L3&quot;:&quot;hl&quot;,&quot;s-badge&quot;:&quot;upd&quot;,&quot;c-4&quot;:&quot;new&quot;,&quot;c-5&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;s-badge&quot;:&quot;1 in cart&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;return () =&gt; log(`effect cleanup (count = ${count})`)&quot;,&quot;say&quot;:&quot;Then the same for the regular effect. A cleanup always sees the values of the render that created it.&quot;,&quot;set&quot;:{&quot;L4&quot;:&quot;&quot;,&quot;L3&quot;:&quot;&quot;,&quot;s-badge&quot;:&quot;&quot;,&quot;c-4&quot;:&quot;&quot;,&quot;c-5&quot;:&quot;&quot;,&quot;L8&quot;:&quot;hl&quot;,&quot;L7&quot;:&quot;hl&quot;,&quot;c-6&quot;:&quot;new&quot;,&quot;c-7&quot;:&quot;new&quot;},&quot;txt&quot;:{}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;return () =&gt; log(`layout cleanup (count = ${count})`)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Unmount.&lt;/b&gt; No render: React runs the remaining cleanups one last time and removes the DOM.&quot;,&quot;set&quot;:{&quot;L8&quot;:&quot;hl&quot;,&quot;L7&quot;:&quot;&quot;,&quot;c-6&quot;:&quot;&quot;,&quot;c-7&quot;:&quot;&quot;,&quot;L4&quot;:&quot;hl&quot;,&quot;s-badge&quot;:&quot;upd&quot;,&quot;c-8&quot;:&quot;new&quot;,&quot;c-9&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;s-badge&quot;:&quot;(removed)&quot;}}]" data-intro="Press &lt;b&gt;Play&lt;/b&gt;, or step through with the arrows."><div class="anim-stage"><div class="ca"><div class="ca-code"><div class="ca-file">CartBadge.tsx</div><pre class="astro-code ca-pre"><code><span class="line an ca-line" data-k="L0"><span class="ca-num">1</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">function</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> CartBadge</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">({</span><span style="--shiki-light:#E64553;--shiki-light-font-style:italic;--shiki-dark:#EBA0AC;--shiki-dark-font-style:italic"> count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> })</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L1"><span class="ca-num">2</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`render (count = </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">)`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L2"><span class="ca-num">3</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  useLayoutEffect</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L3"><span class="ca-num">4</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`layout effect (count = </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">)`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L4"><span class="ca-num">5</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`layout cleanup (count = </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">)`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L5"><span class="ca-num">6</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  },</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [count])</span></span><span class="line an ca-line" data-k="L6"><span class="ca-num">7</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">  useEffect</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> {</span></span><span class="line an ca-line" data-k="L7"><span class="ca-num">8</span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic">    log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`effect (count = </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">)`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L8"><span class="ca-num">9</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">    return</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2"> ()</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7"> =></span><span style="--shiki-light:#1E66F5;--shiki-light-font-style:italic;--shiki-dark:#89B4FA;--shiki-dark-font-style:italic"> log</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">(</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">`effect cleanup (count = </span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">${</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#40A02B;--shiki-dark:#A6E3A1">)`</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">)</span></span><span class="line an ca-line" data-k="L9"><span class="ca-num">10</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">  },</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> [count])</span></span><span class="line an ca-line" data-k="L10"><span class="ca-num">11</span><span style="--shiki-light:#8839EF;--shiki-dark:#CBA6F7">  return</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5"> &#x3C;</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">span</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">{</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4">count</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span><span style="--shiki-light:#4C4F69;--shiki-dark:#CDD6F4"> in cart</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">&#x3C;/</span><span style="--shiki-light:#1E66F5;--shiki-dark:#89B4FA">span</span><span style="--shiki-light:#179299;--shiki-dark:#94E2D5">></span></span><span class="line an ca-line" data-k="L11"><span class="ca-num">12</span><span style="--shiki-light:#7C7F93;--shiki-dark:#9399B2">}</span></span></code></pre></div><div class="ca-side"><div class="ca-screen"><div class="ca-title">What you see</div><div class="an ca-item ca-box" data-k="s-badge">(not on screen)</div></div><div class="ca-console"><div class="ca-title">Console (recorded)</div><div class="an ca-log" data-k="c-0" data-s="ghost">render (count = 0)</div><div class="an ca-log" data-k="c-1" data-s="ghost">layout effect (count = 0)</div><div class="an ca-log" data-k="c-2" data-s="ghost">effect (count = 0)</div><div class="an ca-log" data-k="c-3" data-s="ghost">render (count = 1)</div><div class="an ca-log" data-k="c-4" data-s="ghost">layout cleanup (count = 0)</div><div class="an ca-log" data-k="c-5" data-s="ghost">layout effect (count = 1)</div><div class="an ca-log" data-k="c-6" data-s="ghost">effect cleanup (count = 0)</div><div class="an ca-log" data-k="c-7" data-s="ghost">effect (count = 1)</div><div class="an ca-log" data-k="c-8" data-s="ghost">layout cleanup (count = 1)</div><div class="an ca-log" data-k="c-9" data-s="ghost">effect cleanup (count = 1)</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>log(`render (count = ${count})`)</code><span><b>Mount.</b> The function runs, the hooks are created, and JSX is returned.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>log(`layout effect (count = ${count})`)</code><span>React puts the <code>&lt;span&gt;</code> in the DOM, then runs layout effects <b>before the browser paints</b>, so they can measure or adjust without a flicker.</span></li><li><span class="anim-phase ph-effect">effects</span><code>log(`effect (count = ${count})`)</code><span>Then the regular effect. React doesn’t make the browser wait for it.</span></li><li><span class="anim-phase ph-render">render phase</span><code>log(`render (count = ${count})`)</code><span><b>Update</b> (count becomes 1). The function runs again <b>first</b>. Nothing has been cleaned up yet.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>return () =&gt; log(`layout cleanup (count = ${count})`)</code><span>During the commit: the old layout effect’s cleanup (with <b>count = 0</b>, its own render’s value), then the new layout effect.</span></li><li><span class="anim-phase ph-effect">effects</span><code>return () =&gt; log(`effect cleanup (count = ${count})`)</code><span>Then the same for the regular effect. A cleanup always sees the values of the render that created it.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>return () =&gt; log(`layout cleanup (count = ${count})`)</code><span><b>Unmount.</b> No render: React runs the remaining cleanups one last time and removes the DOM.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>A cart badge with one layout effect and one effect, each logging its <code>count</code>. Mount, one update, unmount: every line below was logged in this order.</figcaption></figure>

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
