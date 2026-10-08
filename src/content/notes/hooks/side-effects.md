---
title: "Side Effects"
slug: "side-effects"
module: "hooks"
order: 1
level: "must"
illus: "bolt"
summary: "useEffect for syncing with the outside world, and the cleanup that stops listeners from piling up."
source: "https://react.dev/reference/react/useEffect"
---


## In one minute

Rendering should only compute what to show. Anything that reaches outside React (an event listener on `window`, a timer, a subscription, a network request, `localStorage`, a non-React library) belongs in **`useEffect`**. React runs the effect after it has committed a render, and re-runs it only when something in its **dependency array** changed. If the effect sets something up, it should **return a cleanup function** that undoes it; React calls that before the next run and when the component unmounts.

**You'll be able to:** write an effect with the right dependencies and a cleanup, and recognize a leaking one.

<figure class="fig anim fig-hooks-leak-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">No cleanup</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">With cleanup</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;hide Search (unmount)&quot;,&quot;say&quot;:&quot;No cleanup: listener #1 stays on &lt;code&gt;window&lt;/code&gt;, and its closure keeps the dead component’s data alive.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;del&quot;,&quot;l1&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;unmounted&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;show Search (mount)&quot;,&quot;say&quot;:&quot;A fresh effect adds listener #2.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;ok&quot;,&quot;l2&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;mounted (listener #2)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;hide Search (unmount)&quot;,&quot;say&quot;:&quot;No cleanup: listener #2 stays on &lt;code&gt;window&lt;/code&gt;, and its closure keeps the dead component’s data alive.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;del&quot;,&quot;l2&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;unmounted&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;show Search (mount)&quot;,&quot;say&quot;:&quot;A fresh effect adds listener #3.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;ok&quot;,&quot;l3&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;mounted (listener #3)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;hide Search (unmount)&quot;,&quot;say&quot;:&quot;No cleanup: listener #3 stays on &lt;code&gt;window&lt;/code&gt;, and its closure keeps the dead component’s data alive.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;del&quot;,&quot;l3&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;unmounted&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;show Search (mount)&quot;,&quot;say&quot;:&quot;A fresh effect adds listener #4.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;ok&quot;,&quot;l4&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;mounted (listener #4)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;history.back()&quot;,&quot;say&quot;:&quot;One back-button press runs &lt;b&gt;every&lt;/b&gt; listener. Recorded: &lt;code&gt;listener #1 runs&lt;/code&gt; … &lt;code&gt;#4 runs&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;back&quot;:&quot;bad&quot;,&quot;l1&quot;:&quot;run&quot;,&quot;l2&quot;:&quot;run&quot;,&quot;l3&quot;:&quot;run&quot;,&quot;l4&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;back&quot;:&quot;4 handlers ran&quot;}}]" data-intro="The effect adds a listener and never removes it."><div class="anim-scn-title">No cleanup</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">&lt;Search /&gt;</div><div class="a-col"><span class="an chip-a" data-k="comp" data-s="ok">mounted (listener #1)</span></div></div><div class="a-panel "><div class="a-panel-title">window’s popstate listeners</div><div class="a-col"><span class="an chip-a" data-k="l1" data-s="new">listener #1</span><span class="an chip-a" data-k="l2" data-s="ghost">listener #2</span><span class="an chip-a" data-k="l3" data-s="ghost">listener #3</span><span class="an chip-a" data-k="l4" data-s="ghost">listener #4</span></div></div><div class="a-panel "><div class="a-panel-title">back button</div><div class="a-col"><span class="an chip-a" data-k="back" data-s="faint">not pressed</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>hide Search (unmount)</code><span>No cleanup: listener #1 stays on <code>window</code>, and its closure keeps the dead component’s data alive.</span></li><li><span class="anim-phase ph-effect">effects</span><code>show Search (mount)</code><span>A fresh effect adds listener #2.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>hide Search (unmount)</code><span>No cleanup: listener #2 stays on <code>window</code>, and its closure keeps the dead component’s data alive.</span></li><li><span class="anim-phase ph-effect">effects</span><code>show Search (mount)</code><span>A fresh effect adds listener #3.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>hide Search (unmount)</code><span>No cleanup: listener #3 stays on <code>window</code>, and its closure keeps the dead component’s data alive.</span></li><li><span class="anim-phase ph-effect">effects</span><code>show Search (mount)</code><span>A fresh effect adds listener #4.</span></li><li><span class="anim-phase ph-event">event</span><code>history.back()</code><span>One back-button press runs <b>every</b> listener. Recorded: <code>listener #1 runs</code> … <code>#4 runs</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;hide Search (unmount)&quot;,&quot;say&quot;:&quot;React runs the cleanup: &lt;code&gt;removeEventListener&lt;/code&gt; takes listener #1 off.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;del&quot;,&quot;l1&quot;:&quot;del&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;unmounted&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;show Search (mount)&quot;,&quot;say&quot;:&quot;A fresh effect adds listener #2.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;ok&quot;,&quot;l2&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;mounted (listener #2)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;hide Search (unmount)&quot;,&quot;say&quot;:&quot;React runs the cleanup: &lt;code&gt;removeEventListener&lt;/code&gt; takes listener #2 off.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;del&quot;,&quot;l2&quot;:&quot;del&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;unmounted&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;show Search (mount)&quot;,&quot;say&quot;:&quot;A fresh effect adds listener #3.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;ok&quot;,&quot;l3&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;mounted (listener #3)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;hide Search (unmount)&quot;,&quot;say&quot;:&quot;React runs the cleanup: &lt;code&gt;removeEventListener&lt;/code&gt; takes listener #3 off.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;del&quot;,&quot;l3&quot;:&quot;del&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;unmounted&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;show Search (mount)&quot;,&quot;say&quot;:&quot;A fresh effect adds listener #4.&quot;,&quot;set&quot;:{&quot;comp&quot;:&quot;ok&quot;,&quot;l4&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;comp&quot;:&quot;mounted (listener #4)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;history.back()&quot;,&quot;say&quot;:&quot;Only the mounted component’s listener exists. Recorded: just &lt;code&gt;listener #4 runs&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;back&quot;:&quot;ok&quot;,&quot;l4&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;back&quot;:&quot;1 handler ran&quot;}}]" data-intro="The effect returns &lt;code&gt;() =&amp;gt; removeEventListener(…)&lt;/code&gt;."><div class="anim-scn-title">With cleanup</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">&lt;Search /&gt;</div><div class="a-col"><span class="an chip-a" data-k="comp" data-s="ok">mounted (listener #1)</span></div></div><div class="a-panel "><div class="a-panel-title">window’s popstate listeners</div><div class="a-col"><span class="an chip-a" data-k="l1" data-s="new">listener #1</span><span class="an chip-a" data-k="l2" data-s="ghost">listener #2</span><span class="an chip-a" data-k="l3" data-s="ghost">listener #3</span><span class="an chip-a" data-k="l4" data-s="ghost">listener #4</span></div></div><div class="a-panel "><div class="a-panel-title">back button</div><div class="a-col"><span class="an chip-a" data-k="back" data-s="faint">not pressed</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>hide Search (unmount)</code><span>React runs the cleanup: <code>removeEventListener</code> takes listener #1 off.</span></li><li><span class="anim-phase ph-effect">effects</span><code>show Search (mount)</code><span>A fresh effect adds listener #2.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>hide Search (unmount)</code><span>React runs the cleanup: <code>removeEventListener</code> takes listener #2 off.</span></li><li><span class="anim-phase ph-effect">effects</span><code>show Search (mount)</code><span>A fresh effect adds listener #3.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>hide Search (unmount)</code><span>React runs the cleanup: <code>removeEventListener</code> takes listener #3 off.</span></li><li><span class="anim-phase ph-effect">effects</span><code>show Search (mount)</code><span>A fresh effect adds listener #4.</span></li><li><span class="anim-phase ph-event">event</span><code>history.back()</code><span>Only the mounted component’s listener exists. Recorded: just <code>listener #4 runs</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="del"></i>deleted</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Hide and show the search three times, then press Back (both versions recorded).</figcaption></figure>

## The example: the search follows the back button

The search reads its first value from the URL. When the user presses **Back**, the URL changes, and the box should follow. The browser reports that with a `popstate` event, so the component subscribes to it.

### Without cleanup

```tsx
function SearchLeaky() {
	const [query, setQuery] = useState(getQueryParam)
	useEffect(() => {
		const id = nextId++
		window.addEventListener('popstate', () => {
			log(`popstate listener #${id} runs`)
			setQuery(getQueryParam())
		})
	}, [])
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}
```

The search can be hidden and shown with a checkbox:

```tsx
function Page({ Search }: { Search: () => React.ReactNode }) {
	const [show, setShow] = useState(true)
	return (
		<>
			<label>
				<input id="show" type="checkbox" checked={show} onChange={(e) => setShow(e.currentTarget.checked)} /> Show search
			</label>
			{show ? <Search /> : null}
		</>
	)
}
```

The recorder hid and showed it three times, then pressed Back once:

```text
popstate listener #1 runs
popstate listener #2 runs
popstate listener #3 runs
popstate listener #4 runs
```

Four handlers ran for one click: one per mount. The first three belong to components that no longer exist, and each closure keeps whatever it references alive in memory.

### With cleanup

```tsx
function SearchClean() {
	const [query, setQuery] = useState(getQueryParam)
	useEffect(() => {
		const id = nextId++
		function updateQuery() {
			log(`popstate listener #${id} runs`)
			setQuery(getQueryParam())
		}
		window.addEventListener('popstate', updateQuery)
		return () => window.removeEventListener('popstate', updateQuery)
	}, [])
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}
```

```text
popstate listener #4 runs
```

Only the mounted component's listener ran. The handler is a named function because `removeEventListener` only removes the **exact same function** that was added; a second arrow function with the same body is a different object.

## How it works

- **Why not in the component body?** The body runs on every render, so it would add a new listener every time. An effect runs after a commit, and only when its dependencies change.
- **Dependencies:** no array → after every render; `[]` → after the first render only; `[a, b]` → when `a` or `b` changed (compared with `Object.is`).
- **Cleanup timing:** the previous run's cleanup runs right before the next run, and once more on unmount. Each cleanup sees the values of the render that created it. The exact order is in [React Lifecycle](../../hooks/react-lifecycle/).
- **Strict Mode** (development only) mounts, cleans up and mounts again once, so an effect without a proper cleanup misbehaves immediately instead of leaking quietly in production.

## Common mistakes

- Subscriptions, timers or library instances with no cleanup.
- Passing a new inline function to `removeEventListener`.
- Using an effect to compute something from state or props. Compute it during render ([Managing UI State](../../hooks/managing-ui-state/)).
- Leaving out dependencies to make an effect "run once" when it reads values that change. Its closure keeps the old values ([React Re-rendering](../../hooks/react-re-rendering/)).

## Interview Q&A

<details class="qa"><summary>What is a side effect, and why does it need <code>useEffect</code>?</summary>

Anything that touches the world outside React's rendering: listeners, timers, subscriptions, network, storage, DOM libraries. The component body runs on every render, so doing it there would repeat it every time; `useEffect` runs after a commit and only when the dependencies change.

</details>

<details class="qa"><summary>What happens if an effect adds an event listener and returns no cleanup?</summary>

Each mount adds another listener and none are removed. Recorded: after three hide/show cycles, one Back press ran listeners #1–#4. They keep their closures (and everything those reference) alive: a memory leak plus duplicate work.

</details>

<details class="qa"><summary>When does the cleanup function run?</summary>

Before the effect runs again because a dependency changed, and when the component unmounts. It always sees the values from the render that created it.

</details>

<details class="qa"><summary>Why must the handler be the same function for <code>addEventListener</code> and <code>removeEventListener</code>?</summary>

Listeners are matched by reference. Two inline arrow functions are two different objects, so removing a new one does nothing. Name the function once inside the effect and use it in both calls.

</details>

<details class="qa"><summary>What does an empty dependency array mean?</summary>

Run the effect after the first commit only, and run its cleanup on unmount. It's right when the effect reads nothing that can change (here, `setQuery` is stable); otherwise list what it reads.

</details>

## Related

- [React Lifecycle](../../hooks/react-lifecycle/): the exact order of effects and cleanups.
- [DOM Refs and Effect Dependencies](../../hooks/dom-refs-and-effect-dependencies/): dependencies that change on every render.

## Sources

- react.dev: [`useEffect`](https://react.dev/reference/react/useEffect), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), [You might not need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- Max Rozen, [Demystifying useEffect's clean-up function](https://maxrozen.com/demystifying-useeffect-cleanup-function)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
