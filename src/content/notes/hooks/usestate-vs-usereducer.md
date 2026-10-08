---
title: "useState vs useReducer"
slug: "usestate-vs-usereducer"
module: "hooks"
order: 7
level: "must"
illus: "diff"
summary: "Independent values → useState; values that change together → useReducer. The stale-closure bug that decides it."
source: "https://kentcdodds.com/blog/should-i-usestate-or-usereducer"
---


## In one minute

Both hooks hold state; `useState` is in fact a `useReducer` with a built-in reducer. The choice is about shape. A value that changes **on its own** (a theme, an open flag, a search string) → `useState`. Several values that **change together**, or a next state that depends on **other** state → `useReducer`: all the transition logic goes into one pure function `(state, action) => newState`, React always calls it with the latest state, and the component just sends actions with `dispatch`. Start with `useState`; switch when you notice updates that have to read or keep several values in step.

**You'll be able to:** pick the right hook, explain the stale-closure bug that tips the balance, and test state logic without rendering.

<figure class="fig anim fig-hooks-snapshot-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Three useStates</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useReducer</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;set('Desk Lamp')&quot;,&quot;say&quot;:&quot;&lt;code&gt;set&lt;/code&gt; was created in render 1, so it reads &lt;code&gt;past = []&lt;/code&gt;, &lt;code&gt;present = \&quot;Ceramic Mug\&quot;&lt;/code&gt;. It queues &lt;code&gt;past: [\&quot;Ceramic Mug\&quot;]&lt;/code&gt;, &lt;code&gt;present: \&quot;Desk Lamp\&quot;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;e1&quot;:&quot;hl&quot;,&quot;snap&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;set('Trail Backpack')&quot;,&quot;say&quot;:&quot;Same function, same snapshot: it also queues &lt;code&gt;past: [\&quot;Ceramic Mug\&quot;]&lt;/code&gt;, overwriting the first.&quot;,&quot;set&quot;:{&quot;e1&quot;:&quot;&quot;,&quot;e2&quot;:&quot;hl&quot;,&quot;snap&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;render 2&quot;,&quot;say&quot;:&quot;Desk Lamp is lost from the history.&quot;,&quot;set&quot;:{&quot;e2&quot;:&quot;&quot;,&quot;res&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;past: [\&quot;Ceramic Mug\&quot;] · present: \&quot;Trail Backpack\&quot;&quot;}}]" data-intro="&lt;code&gt;past&lt;/code&gt;, &lt;code&gt;present&lt;/code&gt;, &lt;code&gt;future&lt;/code&gt; as separate state, updated from a callback."><div class="anim-scn-title">Three useStates</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">effects after mount</div><div class="a-col"><div class="an call" data-k="e1"><code>set('Desk Lamp')</code></div><div class="an call" data-k="e2"><code>set('Trail Backpack')</code></div></div></div><div class="a-panel "><div class="a-panel-title">what set() sees</div><div class="a-col"><span class="an chip-a" data-k="snap" data-s="faint">past = [] · present = "Ceramic Mug"</span></div></div><div class="a-panel "><div class="a-panel-title">final state (recorded)</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="ghost">?</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-effect">effects</span><code>set('Desk Lamp')</code><span><code>set</code> was created in render 1, so it reads <code>past = []</code>, <code>present = "Ceramic Mug"</code>. It queues <code>past: ["Ceramic Mug"]</code>, <code>present: "Desk Lamp"</code>.</span></li><li><span class="anim-phase ph-effect">effects</span><code>set('Trail Backpack')</code><span>Same function, same snapshot: it also queues <code>past: ["Ceramic Mug"]</code>, overwriting the first.</span></li><li><span class="anim-phase ph-render">render phase</span><code>render 2</code><span>Desk Lamp is lost from the history.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'set', next: 'Desk Lamp' })&quot;,&quot;say&quot;:&quot;&lt;code&gt;set&lt;/code&gt; only dispatches an action; it reads no state.&quot;,&quot;set&quot;:{&quot;e1&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;effect&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'set', next: 'Trail Backpack' })&quot;,&quot;say&quot;:&quot;Another action is queued.&quot;,&quot;set&quot;:{&quot;e1&quot;:&quot;&quot;,&quot;e2&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;historyReducer(state, action) ×2&quot;,&quot;say&quot;:&quot;React calls the reducer for each action with the &lt;b&gt;current&lt;/b&gt; state, the second one seeing the result of the first.&quot;,&quot;set&quot;:{&quot;e2&quot;:&quot;&quot;,&quot;snap&quot;:&quot;ok&quot;,&quot;res&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;snap&quot;:&quot;reducer gets the latest state&quot;,&quot;res&quot;:&quot;past: [\&quot;Ceramic Mug\&quot;,\&quot;Desk Lamp\&quot;] · present: \&quot;Trail Backpack\&quot;&quot;}}]" data-intro="One reducer owns all three."><div class="anim-scn-title">useReducer</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">effects after mount</div><div class="a-col"><div class="an call" data-k="e1"><code>set('Desk Lamp')</code></div><div class="an call" data-k="e2"><code>set('Trail Backpack')</code></div></div></div><div class="a-panel "><div class="a-panel-title">what the reducer sees</div><div class="a-col"><span class="an chip-a" data-k="snap" data-s="faint">past = [] · present = "Ceramic Mug"</span></div></div><div class="a-panel "><div class="a-panel-title">final state (recorded)</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="ghost">?</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-effect">effects</span><code>dispatch({ type: 'set', next: 'Desk Lamp' })</code><span><code>set</code> only dispatches an action; it reads no state.</span></li><li><span class="anim-phase ph-effect">effects</span><code>dispatch({ type: 'set', next: 'Trail Backpack' })</code><span>Another action is queued.</span></li><li><span class="anim-phase ph-render">render phase</span><code>historyReducer(state, action) ×2</code><span>React calls the reducer for each action with the <b>current</b> state, the second one seeing the result of the first.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="cmp"></i>being compared</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Three related values updated from a closure lose an entry; a reducer can’t.</figcaption></figure>

## The example: "Recently viewed" with undo

The product page remembers what you looked at: `past`, `present` and `future`. Two things set it right after mount (a product opened from a link, another restored from a tab):

```tsx
function RecentlyViewed({ useUndo }: { useUndo: typeof useUndoReducer }) {
	const [state, set] = useUndo('Ceramic Mug')
	useEffect(() => set('Desk Lamp'), []) // e.g. opened from a link
	useEffect(() => set('Trail Backpack'), []) // e.g. restored from a tab
	return <pre id="state">{JSON.stringify(state)}</pre>
}
```

### Three `useState`s

```tsx
function useUndoStates(initial: string) {
	const [past, setPast] = useState<string[]>([])
	const [present, setPresent] = useState(initial)
	const [future, setFuture] = useState<string[]>([])
	const set = useCallback(
		(next: string) => {
			if (next === present) return
			setPast([...past, present]) // past and present come from this render
			setPresent(next)
			setFuture([])
		},
		[past, present],
	)
	return [{ past, present, future }, set] as const
}
```

```text
final state: {"past":["Ceramic Mug"],"present":"Trail Backpack","future":[]}
```

"Desk Lamp" is missing from `past`. Both effects called the same `set`, created during the first render, so both read `past = []` and `present = "Ceramic Mug"`; the second update overwrote the first. Adding `set` to the effects' dependencies makes it worse: `set` changes whenever `past`/`present` change, so the effects would run again and again.

### `useReducer`

```tsx
type Action = { type: 'set'; next: string } | { type: 'undo' } | { type: 'redo' }

function historyReducer(state: History, action: Action): History {
	const { past, present, future } = state
	switch (action.type) {
		case 'set':
			if (action.next === present) return state
			return { past: [...past, present], present: action.next, future: [] }
		case 'undo':
			if (!past.length) return state
			return { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future] }
		case 'redo':
			if (!future.length) return state
			return { past: [...past, present], present: future[0], future: future.slice(1) }
	}
}

function useUndoReducer(initial: string) {
	const [state, dispatch] = useReducer(historyReducer, { past: [], present: initial, future: [] })
	const set = useCallback((next: string) => dispatch({ type: 'set', next }), [])
	return [state, set] as const
}
```

```text
final state: {"past":["Ceramic Mug","Desk Lamp"],"present":"Trail Backpack","future":[]}
```

Nothing was lost. `set` only dispatches; it reads no state, so there's nothing to go stale, and its dependency list is empty. React runs the reducer for each action in order with the current state.

(You could also fix the `useState` version by merging the three values into one object and using updater functions everywhere. It works, but you end up writing a reducer inside each callback.)

### Reducers are plain functions

```tsx
const s0: History = { past: ['Ceramic Mug'], present: 'Desk Lamp', future: [] }
log('historyReducer(s0, undo) →', historyReducer(s0, { type: 'undo' }))
```

```text
historyReducer(s0, undo) → {"past":[],"present":"Ceramic Mug","future":["Desk Lamp"]}
```

No component, no hooks, no DOM: every transition can be unit-tested with a function call.

## When `useState` is the better choice

A theme toggle is one independent value:

```tsx
function useTheme() {
	const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light')
	useEffect(() => localStorage.setItem('theme', theme), [theme])
	return [theme, setTheme] as const
}
```

Rewriting it with `useReducer`, action types and a `switch` adds ceremony and nothing else. Simplify that reducer to `(prev, next) => next` and you've reinvented `useState`.

## Decision guide

| Situation | Use |
|---|---|
| One independent value | `useState` |
| Several values that always change together | `useReducer` |
| Next state depends on other state | `useReducer` (or one `useState` object + updater functions) |
| A fixed set of named transitions (idle → loading → success/error) | `useReducer` |
| You want to unit-test the transitions | `useReducer` |
| Passing "how to update" deep through context | `useReducer` (`dispatch` never changes) |

Both setters (`setState` and `dispatch`) keep the same identity across renders, so either is safe in dependency arrays and as a prop to memoized children.

## Interview Q&A

<details class="qa"><summary>When do you use <code>useState</code> and when <code>useReducer</code>?</summary>

`useState` for independent values; `useReducer` when several values change together, when the next state depends on other state, or when you want named, testable transitions. Start with `useState` and move when updates start reading each other.

</details>

<details class="qa"><summary>Is <code>useReducer</code> more powerful than <code>useState</code>?</summary>

Structurally yes: `useState` is `useReducer` with a reducer that returns the new value (or calls it if it's a function). Anything you can do with one, you can do with the other; the question is which reads better.

</details>

<details class="qa"><summary>What bug appears when related state is split across several <code>useState</code>s?</summary>

Callbacks capture the values of the render that created them. Two updates before the next render both read the same snapshot and the second overwrites the first. Recorded: `past` ended as `["Ceramic Mug"]` instead of `["Ceramic Mug", "Desk Lamp"]`. A reducer gets the current state from React for each action, so it can't happen.

</details>

<details class="qa"><summary>Why is a reducer easier to test?</summary>

It's a pure function: `historyReducer(state, { type: 'undo' })` returns the next state, no rendering involved.

</details>

<details class="qa"><summary>Why is <code>dispatch</code> handy to pass through context?</summary>

It never changes identity and it's one entry point for every kind of update, so consumers that only dispatch don't need to re-render when the state changes.

</details>

## Related

- [Building a Cart](../../hooks/building-a-cart/): the same history logic with `useState` + updater functions.
- [React Re-rendering](../../hooks/react-re-rendering/): stale closures in general.
- [Hooks Under the Hood](../../internals/hooks-under-the-hood/) (React Internals): `useState` is `useReducer` inside React.

## Sources

- Kent C. Dodds, [Should I useState or useReducer?](https://kentcdodds.com/blog/should-i-usestate-or-usereducer) (the vault note this one is based on)
- react.dev: [`useReducer`](https://react.dev/reference/react/useReducer), [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
