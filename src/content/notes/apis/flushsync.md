---
title: "flushSync"
slug: "flushsync"
module: "apis"
order: 5
level: "good"
illus: "bolt"
summary: "Make React update the DOM before the next line runs, so you can focus or scroll to what you just rendered."
source: "https://react.dev/reference/react-dom/flushSync"
---


## In one minute

`setState` doesn't change the DOM right away. React **queues** the update and renders after your event handler returns, so it can batch several updates into one render. Usually that's what you want. But sometimes the very next line needs the new DOM: to focus an input that's about to appear, or to scroll to an item you just added. `flushSync(() => setState(…))` makes React **render and commit before `flushSync` returns**. It's an escape hatch, because it gives up batching and scheduling for that update.

**You'll be able to:** focus or scroll to something you just rendered, and explain why it's a de-optimization.

<figure class="fig anim fig-apis-flushsync-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">setState</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">flushSync</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;setEditing(true)&quot;,&quot;say&quot;:&quot;The update is &lt;b&gt;queued&lt;/b&gt;. React will render after the handler returns.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;inputRef.current → null&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;inputRef.current = null&lt;/code&gt;. The &lt;code&gt;&amp;lt;input&amp;gt;&lt;/code&gt; doesn’t exist yet.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;&quot;,&quot;l2&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;focus() → nothing&quot;,&quot;say&quot;:&quot;There’s nothing to focus. Recorded: &lt;code&gt;focused: button&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;&quot;,&quot;l3&quot;:&quot;bad&quot;,&quot;focus&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render (editing: true)&quot;,&quot;say&quot;:&quot;Only now does React render and swap the button for the input. Too late: the code that wanted it has finished.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;&quot;,&quot;dom&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;&amp;lt;input value=\&quot;Birthday ideas\&quot;&amp;gt;&quot;}}]" data-intro="A normal state update, then focus."><div class="anim-scn-title">setState</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">startEditing()</div><div class="a-col"><div class="an call" data-k="l1"><code>setEditing(true)</code></div><div class="an call" data-k="l2"><code>inputRef.current</code></div><div class="an call" data-k="l3"><code>inputRef.current?.focus()</code></div></div></div><div class="a-panel "><div class="a-panel-title">DOM</div><div class="a-col"><span class="an chip-a" data-k="dom" data-s="faint">&lt;button&gt;Birthday ideas ✎</span><span class="an chip-a" data-k="focus" data-s="faint">focus: button</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-schedule">schedule</span><code>setEditing(true)</code><span>The update is <b>queued</b>. React will render after the handler returns.</span></li><li><span class="anim-phase ph-event">event</span><code>inputRef.current → null</code><span>Recorded: <code>inputRef.current = null</code>. The <code>&lt;input&gt;</code> doesn’t exist yet.</span></li><li><span class="anim-phase ph-event">event</span><code>focus() → nothing</code><span>There’s nothing to focus. Recorded: <code>focused: button</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>render (editing: true)</code><span>Only now does React render and swap the button for the input. Too late: the code that wanted it has finished.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;flushSync(() =&gt; setEditing(true))&quot;,&quot;say&quot;:&quot;&lt;code&gt;flushSync&lt;/code&gt; renders &lt;b&gt;and commits&lt;/b&gt; before it returns. Recorded: &lt;code&gt;render (editing: true)&lt;/code&gt; is logged inside the click handler.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;hl&quot;,&quot;dom&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;dom&quot;:&quot;&amp;lt;input value=\&quot;Birthday ideas\&quot;&amp;gt;&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;inputRef.current → &lt;input&gt;&quot;,&quot;say&quot;:&quot;The ref is already attached.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;&quot;,&quot;l2&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;focus()&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;focused: input&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;&quot;,&quot;l3&quot;:&quot;ok&quot;,&quot;focus&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;focus&quot;:&quot;focus: input&quot;}}]" data-intro="The update wrapped in &lt;code&gt;flushSync&lt;/code&gt;."><div class="anim-scn-title">flushSync</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">startEditing()</div><div class="a-col"><div class="an call" data-k="l1"><code>flushSync(() =&gt; setEditing(true))</code></div><div class="an call" data-k="l2"><code>inputRef.current</code></div><div class="an call" data-k="l3"><code>inputRef.current?.focus()</code></div></div></div><div class="a-panel "><div class="a-panel-title">DOM</div><div class="a-col"><span class="an chip-a" data-k="dom" data-s="faint">&lt;button&gt;Birthday ideas ✎</span><span class="an chip-a" data-k="focus" data-s="faint">focus: button</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>flushSync(() =&gt; setEditing(true))</code><span><code>flushSync</code> renders <b>and commits</b> before it returns. Recorded: <code>render (editing: true)</code> is logged inside the click handler.</span></li><li><span class="anim-phase ph-event">event</span><code>inputRef.current → &lt;input&gt;</code><span>The ref is already attached.</span></li><li><span class="anim-phase ph-event">event</span><code>focus()</code><span>Recorded: <code>focused: input</code>.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Click “Birthday ideas ✎” to rename the wishlist (both versions recorded).</figcaption></figure>

## The example: a wishlist

### 1. Rename inline, then focus

Clicking the wishlist's name swaps it for an input, which should be focused right away.

```tsx
function WishlistName({ sync }: { sync: boolean }) {
	const [editing, setEditing] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	log(`render (editing: ${editing})`)

	function startEditing() {
		log('click: start')
		if (sync) {
			flushSync(() => setEditing(true))
		} else {
			setEditing(true)
		}
		log(`after setEditing: inputRef.current = ${inputRef.current ? '<input>' : 'null'}`)
		inputRef.current?.focus()
		log(`focused: ${document.activeElement?.tagName.toLowerCase()}`)
	}

	return editing ? (
		<input id="name" ref={inputRef} defaultValue="Birthday ideas" onBlur={() => setEditing(false)} />
	) : (
		<button id="edit" onClick={startEditing}>Birthday ideas ✎</button>
	)
}
```

With a plain `setEditing(true)` (`sync` false):

```text
click: start
after setEditing: inputRef.current = null
focused: button
render (editing: true)
```

The `render` line comes **last**. When the handler asked for `inputRef.current`, the input didn't exist yet, so nothing was focused.

With `flushSync`:

```text
click: start
render (editing: true)
after setEditing: inputRef.current = <input>
focused: input
```

The render happened **inside** the click handler, between `click: start` and the next line, so the ref was attached and focus worked.

### 2. Add, then scroll to it

```tsx
function Wishlist({ sync }: { sync: boolean }) {
	const [items, setItems] = useState(['Ceramic Mug', 'Desk Lamp'])
	const listRef = useRef<HTMLUListElement>(null)

	function add(name: string) {
		if (sync) {
			flushSync(() => setItems([...items, name]))
		} else {
			setItems([...items, name])
		}
		const last = listRef.current!.lastElementChild!
		log(`last <li> right after the update: ${last.textContent}`)
		last.scrollIntoView({ block: 'nearest' })
	}

	return (
		<>
			<ul ref={listRef} className="wishlist">
				{items.map((i) => (
					<li key={i}>{i}</li>
				))}
			</ul>
			<button id="add" onClick={() => add('Notebook Set')}>Add Notebook Set</button>
		</>
	)
}
```

Adding "Notebook Set", without and with `flushSync`:

```text
last <li> right after the update: Desk Lamp
```

```text
last <li> right after the update: Notebook Set
```

Without it, `scrollIntoView` scrolled to the **previous** last item.

## How it works

- **Updates are queued, then rendered together.** Inside a click handler, React renders after the handler finishes ([Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/)). Every `setState` in that handler ends up in one render.
- **`flushSync` renders now.** It runs your callback, then renders and commits the queued updates synchronously, including layout effects and ref attachment. When it returns, the DOM is up to date.
- **Why it's a de-optimization:** the work can't be batched with later updates or split up, it blocks the main thread, and it may also flush other pending updates. If a `Suspense` boundary would suspend during that render, it may show its fallback.
- **Alternatives:** if the element only needs focus when it appears, `autoFocus` or a ref callback (`ref={(el) => el?.focus()}`) does it without `flushSync`. If the code reacts to the DOM after every relevant render, it belongs in [useLayoutEffect](../../apis/uselayouteffect/).

## Common mistakes

- **Using it to make updates "faster".** It makes them synchronous, which is usually slower overall.
- **Calling it while React is already rendering or committing** (in a component body, or a layout effect). React warns that it can't flush then, and the update waits.
- **Wrapping many updates in many `flushSync` calls.** Each one is a full render and commit.

## Interview Q&A

<details class="qa"><summary>What does <code>flushSync</code> do?</summary>

`flushSync(callback)` runs the callback and makes React apply the resulting updates to the DOM before it returns. The code after it sees the updated DOM.

</details>

<details class="qa"><summary>Why is the DOM not updated right after <code>setState</code>?</summary>

React queues updates and renders after the event handler, batching them into one render. Recorded: without `flushSync`, `inputRef.current` was `null` right after `setEditing(true)`, and the render was logged after the handler's last line.

</details>

<details class="qa"><summary>Give a case where you need it.</summary>

Focusing an input that appears because of the same click (inline rename), or scrolling to an item you just added. Recorded: without `flushSync`, the "last `<li>`" was still Desk Lamp; with it, Notebook Set.

</details>

<details class="qa"><summary>Why does React call it a de-optimization?</summary>

It forces a synchronous render and commit that can't be batched or interrupted, may flush unrelated pending updates, and can show `Suspense` fallbacks. Use it only when code outside React needs the DOM immediately.

</details>

<details class="qa"><summary>How is it related to <code>useLayoutEffect</code>?</summary>

Both handle "the DOM isn't updated yet". `flushSync` is imperative, inside the handler: update now so my next line sees it. `useLayoutEffect` reacts after a commit and before paint: read the new layout and adjust.

</details>

## Related

- [useLayoutEffect](../../apis/uselayouteffect/): read the DOM before paint.
- [useImperativeHandle](../../apis/useimperativehandle/): expose `focus()` from a component.
- [Scheduler, Lanes and Batching](../../internals/scheduler-lanes-and-batching/): how React batches and schedules updates.

## Sources

- react.dev: [`flushSync`](https://react.dev/reference/react-dom/flushSync), [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- Jules Blom, [More than you need to know about ReactDOM.flushSync](https://julesblom.com/writing/flushsync)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
