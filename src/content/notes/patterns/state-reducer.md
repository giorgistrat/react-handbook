---
title: "The State Reducer Pattern"
slug: "state-reducer"
module: "patterns"
order: 6
level: "must"
illus: "diff"
summary: "Let the consumer decide what each action does, by passing their own reducer that can veto or delegate."
source: "https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks"
---


## In one minute

A reusable hook can't predict every rule its users will want: "don't close on outside click", "keep the menu open after selecting", "no changes after the order is placed". Adding a boolean option for each doesn't scale. The **state reducer** pattern is **inversion of control**: the hook takes a `reducer` option and uses it instead of its own. The hook still decides *when* an action happens (a click dispatches `{ type: 'toggle' }`); the consumer decides *what it does*. Export the default reducer so consumers can override one case and delegate the rest.

**You'll be able to:** add a `reducer` option to a hook, veto an action from outside, and explain what React does when a reducer returns the same state.

<figure class="fig anim fig-patterns-state-reducer-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Before the order</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">After the order</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click switch → toggle()&quot;,&quot;say&quot;:&quot;The hook dispatches its normal action. It doesn’t know about any custom rules.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reducer(state, action)&quot;,&quot;say&quot;:&quot;&lt;code&gt;useReducer&lt;/code&gt; runs &lt;b&gt;your&lt;/b&gt; reducer. The order isn’t placed, so it delegates to the exported &lt;code&gt;toggleReducer&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;&quot;,&quot;def&quot;:&quot;ok&quot;,&quot;go&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;New state &lt;code&gt;{ on: true }&lt;/code&gt;: &lt;code&gt;GiftOptions&lt;/code&gt; and &lt;code&gt;WrapNote&lt;/code&gt; render.&quot;,&quot;set&quot;:{&quot;go&quot;:&quot;done&quot;,&quot;wn&quot;:&quot;done&quot;}}]" data-intro="The default behavior."><div class="anim-scn-title">Before the order</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">useToggle (the hook)</div><div class="a-col"><div class="an call" data-k="d"><code>dispatch({ type: 'toggle' })</code></div></div></div><div class="a-panel "><div class="a-panel-title">your reducer</div><div class="a-col"><span class="an chip-a" data-k="veto" data-s="faint">orderPlaced? → return state</span><span class="an chip-a" data-k="def" data-s="faint">else → toggleReducer(…)</span></div></div><div class="a-panel "><div class="a-panel-title">renders (recorded)</div><div class="a-col"><span class="an chip-a" data-k="go" data-s="faint">GiftOptions</span><span class="an chip-a" data-k="wn" data-s="faint">WrapNote</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click switch → toggle()</code><span>The hook dispatches its normal action. It doesn’t know about any custom rules.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reducer(state, action)</code><span><code>useReducer</code> runs <b>your</b> reducer. The order isn’t placed, so it delegates to the exported <code>toggleReducer</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>New state <code>{ on: true }</code>: <code>GiftOptions</code> and <code>WrapNote</code> render.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click switch → toggle()&quot;,&quot;say&quot;:&quot;After “Place order”, the same click dispatches the same action.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return state&quot;,&quot;say&quot;:&quot;Your reducer returns the state it was given: a veto. No special API needed.&quot;,&quot;set&quot;:{&quot;d&quot;:&quot;&quot;,&quot;veto&quot;:&quot;hl&quot;,&quot;go&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Object.is(old, new) → true&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;GiftOptions&lt;/code&gt; still ran once (React runs the reducer while rendering it), then bailed out: &lt;code&gt;WrapNote&lt;/code&gt; didn’t render and the switch stayed on.&quot;,&quot;set&quot;:{&quot;veto&quot;:&quot;ok&quot;,&quot;go&quot;:&quot;bail&quot;,&quot;wn&quot;:&quot;skip&quot;}}]" data-intro="The consumer’s rule kicks in."><div class="anim-scn-title">After the order</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">useToggle (the hook)</div><div class="a-col"><div class="an call" data-k="d"><code>dispatch({ type: 'toggle' })</code></div></div></div><div class="a-panel "><div class="a-panel-title">your reducer</div><div class="a-col"><span class="an chip-a" data-k="veto" data-s="faint">orderPlaced? → return state</span><span class="an chip-a" data-k="def" data-s="faint">else → toggleReducer(…)</span></div></div><div class="a-panel "><div class="a-panel-title">renders (recorded)</div><div class="a-col"><span class="an chip-a" data-k="go" data-s="faint">GiftOptions</span><span class="an chip-a" data-k="wn" data-s="faint">WrapNote</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click switch → toggle()</code><span>After “Place order”, the same click dispatches the same action.</span></li><li><span class="anim-phase ph-render">render phase</span><code>return state</code><span>Your reducer returns the state it was given: a veto. No special API needed.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Object.is(old, new) → true</code><span>Recorded: <code>GiftOptions</code> still ran once (React runs the reducer while rendering it), then bailed out: <code>WrapNote</code> didn’t render and the switch stayed on.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="bail"></i>bailed out</span><span><i class="an lg-sw" data-s="skip"></i>skipped</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="ok"></i>ok</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The gift-wrap switch before and after the order is placed (recorded).</figcaption></figure>

## The example: locking gift wrap after the order

Once the order is placed, the gift-wrap choice can't change. That's a rule of this checkout page, not of `useToggle`, so it belongs to the consumer.

### 1. The hook takes a reducer

```tsx
type ToggleState = { on: boolean }
type ToggleAction = { type: 'toggle' } | { type: 'reset'; initialState: ToggleState }

export function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
	switch (action.type) {
		case 'toggle':
			return { on: !state.on }
		case 'reset':
			return action.initialState
	}
}

function useToggle({ initialOn = false, reducer = toggleReducer } = {}) {
	const { current: initialState } = useRef({ on: initialOn })
	const [state, dispatch] = useReducer(reducer, initialState)
	const toggle = () => dispatch({ type: 'toggle' })
	const reset = () => dispatch({ type: 'reset', initialState })
	return { on: state.on, toggle, reset }
}
```

The only change from [State Initializers](../../patterns/state-initializers/) is `reducer = toggleReducer` as an option, and `export` on the default reducer.

### 2. The consumer's rule

```tsx
function GiftOptions() {
	const [orderPlaced, setOrderPlaced] = useState(false)
	const { on, toggle } = useToggle({
		reducer(state, action) {
			if (orderPlaced && action.type === 'toggle') return state // too late: keep it as is
			return toggleReducer(state, action) // everything else: the default behavior
		},
	})
	log(`render GiftOptions (on: ${on})`)
	return (
		<>
			<Switch id="gift" on={on} onClick={toggle} aria-label="Gift wrap" />
			<WrapNote on={on} />
			<button id="place" onClick={() => setOrderPlaced(true)}>Place order</button>
		</>
	)
}
```

Recorded: click the switch, place the order, click the switch again.

```text
render GiftOptions (on: true)
render WrapNote
```

```text
render GiftOptions (on: true)
render WrapNote
```

```text
render GiftOptions (on: true)
```

The last click was vetoed: the switch stayed on. Look at what rendered. React **did** call `GiftOptions` again, because `useReducer` runs the reducer while rendering the component. Then it saw the same state object and **bailed out**: `WrapNote` didn't render and nothing changed on the page. (It's often said that React skips the render entirely. The recording shows the component itself still runs once; only its children are skipped.)

## How it works

- **`useReducer` never cared where the reducer came from.** The extension point already exists: it's the first argument. The pattern is just "don't hard-code it".
- **The latest reducer is used.** The consumer's reducer is an inline function that reads `orderPlaced` from the current render; React runs the queued action with the reducer from the render that processes it, so it sees the current value.
- **Returning `state` is a veto.** Same object → React bails out ([useReducer](../../apis/usereducer/)). Return a new object only when something should change.
- **Delegate to the exported default.** `return toggleReducer(state, action)` handles every case you didn't customize, and keeps working when the hook adds new action types.
- **The action shapes become public API.** Consumers' reducers depend on `{ type: 'toggle' }` and `{ type: 'reset', initialState }`. Renaming an action is a breaking change. Downshift exports its action types as constants for this reason.

## Common mistakes

- **Forcing consumers to reimplement the whole reducer** because the default isn't exported.
- **Returning `{ ...state }` to mean "no change".** That's a new object, so it's treated as a change.
- **Using it when the consumer needs to change the state from outside** (a reset button elsewhere, syncing two components). The reducer only sees the hook's own actions; for that, use [Control Props](../../patterns/control-props/).

## Interview Q&A

<details class="qa"><summary>What problem does the state reducer pattern solve?</summary>

Consumers need custom behavior that the hook author can't predict. Instead of adding an option per request, the hook accepts a reducer and lets the consumer decide how each action changes the state.

</details>

<details class="qa"><summary>Why is it called inversion of control?</summary>

Normally the hook decides what every action does. Here the hook still decides when actions happen, but hands the decision of what they do to the caller.

</details>

<details class="qa"><summary>How does a consumer veto an action?</summary>

Return the current `state` unchanged. Recorded: after the order was placed, clicking the switch left it on. `GiftOptions` rendered once and bailed out; its child `WrapNote` didn't render.

</details>

<details class="qa"><summary>Why export the default reducer?</summary>

So a custom reducer can override one case and delegate everything else: `return toggleReducer(state, action)`. Without it, every consumer copies the whole reducer and it drifts from the hook's.

</details>

<details class="qa"><summary>State reducer or control props?</summary>

State reducer when the consumer wants to change how the component reacts to its own actions. Control props when the consumer needs to own the value, change it from outside, or keep several components in sync. Downshift supports both.

</details>

## Related

- [useReducer](../../apis/usereducer/): reducers and bail-outs.
- [State Initializers](../../patterns/state-initializers/): the previous step of this hook.
- [Control Props](../../patterns/control-props/): the next step, the consumer owns the value.

## Sources

- Kent C. Dodds: [The state reducer pattern with React Hooks](https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks), [When to use control props or state reducers](https://kentcdodds.com/blog/control-props-vs-state-reducers)
- [Downshift](https://github.com/downshift-js/downshift)'s `stateReducer` prop
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
