---
title: "State Initializers"
slug: "state-initializers"
module: "patterns"
order: 5
level: "good"
illus: "robot"
summary: "Let the consumer choose the starting state, and make reset go back to it, even if the prop changes later."
source: "https://react.dev/reference/react/useRef"
---


## In one minute

A reusable hook shouldn't hard-code its starting state. The **state initializer** pattern adds an `initial…` option (`useToggle({ initialOn: true })`) and usually a `reset()` that goes back to it. Like `useState`'s argument and an input's `defaultValue`, the initial value should count **only on the first render**. The subtle part: if the consumer's `initialOn` changes later, `reset()` must still go back to the value the hook *started* with. Keeping the initial state in a `useRef` makes sure of it.

**You'll be able to:** add an initial value and a reset to a custom hook, and keep reset stable when the prop changes.

<figure class="fig anim fig-patterns-initializer-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Plain object</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useRef</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useToggle({ initialOn: true })&quot;,&quot;say&quot;:&quot;First render: the switch starts &lt;code&gt;on&lt;/code&gt;, from the setting.&quot;,&quot;set&quot;:{&quot;init&quot;:&quot;new&quot;,&quot;sw&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click switch&quot;,&quot;say&quot;:&quot;The shopper turns gift wrap off.&quot;,&quot;set&quot;:{&quot;sw&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;sw&quot;:&quot;off&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;initialOn: false&quot;,&quot;say&quot;:&quot;The store setting is unticked. This render builds a new &lt;code&gt;initialState = { on: false }&lt;/code&gt;, and this render’s &lt;code&gt;reset&lt;/code&gt; captures it.&quot;,&quot;set&quot;:{&quot;set&quot;:&quot;upd&quot;,&quot;init&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;set&quot;:&quot;gift wrap by default: ☐&quot;,&quot;init&quot;:&quot;initialState = { on: false }&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'reset', initialState })&quot;,&quot;say&quot;:&quot;Recorded: Reset went to &lt;code&gt;off&lt;/code&gt;. Nothing visibly happened: it “reset” to the current setting, not to how the switch started.&quot;,&quot;set&quot;:{&quot;sw&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;sw&quot;:&quot;off&quot;}}]" data-intro="&lt;code&gt;const initialState = { on: initialOn }&lt;/code&gt; on every render."><div class="anim-scn-title">Plain object</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">the store setting</div><div class="a-col"><span class="an chip-a" data-k="set" data-s="faint">gift wrap by default: ☑</span></div></div><div class="a-panel "><div class="a-panel-title">this render’s initialState</div><div class="a-col"><span class="an chip-a" data-k="init" data-s="faint">initialState = { on: true }</span></div></div><div class="a-panel "><div class="a-panel-title">gift-wrap switch</div><div class="a-col"><span class="an chip-a" data-k="sw" data-s="faint">on</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>useToggle({ initialOn: true })</code><span>First render: the switch starts <code>on</code>, from the setting.</span></li><li><span class="anim-phase ph-event">event</span><code>click switch</code><span>The shopper turns gift wrap off.</span></li><li><span class="anim-phase ph-render">render phase</span><code>initialOn: false</code><span>The store setting is unticked. This render builds a new <code>initialState = { on: false }</code>, and this render’s <code>reset</code> captures it.</span></li><li><span class="anim-phase ph-event">event</span><code>dispatch({ type: 'reset', initialState })</code><span>Recorded: Reset went to <code>off</code>. Nothing visibly happened: it “reset” to the current setting, not to how the switch started.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;useToggle({ initialOn: true })&quot;,&quot;say&quot;:&quot;First render: the switch starts &lt;code&gt;on&lt;/code&gt;, from the setting.&quot;,&quot;set&quot;:{&quot;init&quot;:&quot;new&quot;,&quot;sw&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click switch&quot;,&quot;say&quot;:&quot;The shopper turns gift wrap off.&quot;,&quot;set&quot;:{&quot;sw&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;sw&quot;:&quot;off&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;initialOn: false&quot;,&quot;say&quot;:&quot;The store setting is unticked, so &lt;code&gt;initialOn&lt;/code&gt; is now &lt;code&gt;false&lt;/code&gt;. The ref still holds &lt;code&gt;{ on: true }&lt;/code&gt; from the first render.&quot;,&quot;set&quot;:{&quot;set&quot;:&quot;upd&quot;,&quot;init&quot;:&quot;keep&quot;},&quot;txt&quot;:{&quot;set&quot;:&quot;gift wrap by default: ☐&quot;,&quot;init&quot;:&quot;ref: { on: true } (kept)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatch({ type: 'reset', initialState })&quot;,&quot;say&quot;:&quot;Recorded: Reset went back to &lt;code&gt;on&lt;/code&gt;, the value the switch actually started with.&quot;,&quot;set&quot;:{&quot;sw&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;sw&quot;:&quot;on&quot;}}]" data-intro="&lt;code&gt;useRef({ on: initialOn })&lt;/code&gt; keeps the first one."><div class="anim-scn-title">useRef</div><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">the store setting</div><div class="a-col"><span class="an chip-a" data-k="set" data-s="faint">gift wrap by default: ☑</span></div></div><div class="a-panel "><div class="a-panel-title">initialState (ref)</div><div class="a-col"><span class="an chip-a" data-k="init" data-s="faint">initialState = { on: true }</span></div></div><div class="a-panel "><div class="a-panel-title">gift-wrap switch</div><div class="a-col"><span class="an chip-a" data-k="sw" data-s="faint">on</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>useToggle({ initialOn: true })</code><span>First render: the switch starts <code>on</code>, from the setting.</span></li><li><span class="anim-phase ph-event">event</span><code>click switch</code><span>The shopper turns gift wrap off.</span></li><li><span class="anim-phase ph-render">render phase</span><code>initialOn: false</code><span>The store setting is unticked, so <code>initialOn</code> is now <code>false</code>. The ref still holds <code>{ on: true }</code> from the first render.</span></li><li><span class="anim-phase ph-event">event</span><code>dispatch({ type: 'reset', initialState })</code><span>Recorded: Reset went back to <code>on</code>, the value the switch actually started with.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Start on, switch off, untick the store setting, then click Reset (both recorded).</figcaption></figure>

## The example: gift wrap by default

The store has a setting: "Gift wrap new orders by default". The checkout's gift-wrap switch starts from that setting, and has a Reset button.

```tsx
type ToggleState = { on: boolean }
type ToggleAction = { type: 'toggle' } | { type: 'reset'; initialState: ToggleState }

function toggleReducer(state: ToggleState, action: ToggleAction): ToggleState {
	switch (action.type) {
		case 'toggle':
			return { on: !state.on }
		case 'reset':
			return action.initialState
	}
}
```

```tsx
function GiftOptions({ useToggleHook }: { useToggleHook: typeof useToggle }) {
	const [giftByDefault, setGiftByDefault] = useState(true) // a store setting
	const { on, toggle, reset } = useToggleHook({ initialOn: giftByDefault })
	return (
		<>
			<label>
				<input id="setting" type="checkbox" checked={giftByDefault} onChange={(e) => setGiftByDefault(e.target.checked)} />
				Gift wrap new orders by default
			</label>
			<Switch id="gift" on={on} onClick={toggle} aria-label="Gift wrap" />
			<button id="reset" onClick={reset}>Reset</button>
		</>
	)
}
```

The recorded steps: start (setting ticked), click the switch off, untick the setting, then click Reset.

### 1. Initial state rebuilt every render

```tsx
function useTogglePlain({ initialOn = false } = {}) {
	const initialState = { on: initialOn } // rebuilt on every render
	const [state, dispatch] = useReducer(toggleReducer, initialState)
	const toggle = () => dispatch({ type: 'toggle' })
	const reset = () => dispatch({ type: 'reset', initialState })
	return { on: state.on, toggle, reset }
}
```

```text
mount (setting on): true
click switch: false
untick "by default": false
click Reset: false
```

Reset did nothing visible. `useReducer` used `initialState` only on the first render, but `reset` is a new function each render, and it captured **that** render's `initialState`, built from the current `initialOn` (`false`).

### 2. Initial state kept in a ref

```tsx
function useToggle({ initialOn = false } = {}) {
	const { current: initialState } = useRef({ on: initialOn }) // kept from the first render
	const [state, dispatch] = useReducer(toggleReducer, initialState)
	const toggle = () => dispatch({ type: 'toggle' })
	const reset = () => dispatch({ type: 'reset', initialState })
	return { on: state.on, toggle, reset }
}
```

```text
mount (setting on): true
click switch: false
untick "by default": false
click Reset: true
```

Reset went back to `on`, where the switch started. The ref is created on the first render and React returns the same object after that, so `initialState` is always the first one.

## How it works

- **`useRef(value)` keeps the first value.** The argument is evaluated on every render but only used on the first; after that `ref.current` is whatever was there. (`useState(() => …)` keeps a first value too, but it's state, meant for values the UI displays.)
- **`reset` is an action, not a computation.** `{ type: 'reset', initialState }` says "replace the state with this", which the reducer can't derive from the current state.
- **Initial means initial.** The same contract as `useState(initial)` and `<input defaultValue>`: later changes to the prop are ignored. If the consumer needs to change the value from outside at any time, that's [Control Props](../../patterns/control-props/).
- **To start over completely,** the consumer can also change the component's `key`, which remounts it with fresh state ([Rendering Arrays](../../fundamentals/rendering-arrays/)).

## Common mistakes

- **Expecting a new `initialOn` to change the current state.** It's only read on the first render.
- **Building the reset target from the current props** (recorded above).
- **Expensive initial values in `useRef(expensive())`.** The argument runs every render; compute it lazily if it's costly.

## Interview Q&A

<details class="qa"><summary>What is the state initializer pattern?</summary>

Letting the consumer of a hook or component choose its starting state with an `initial…` option, usually with a `reset` that returns to it. It's the same contract as `useState(initialValue)` or `defaultValue`.

</details>

<details class="qa"><summary>Why should a later change to <code>initialOn</code> be ignored?</summary>

Because it's an *initial* value, read once like `useState`'s argument. Following later changes would make it a controlled value, which is a different pattern ([Control Props](../../patterns/control-props/)).

</details>

<details class="qa"><summary>What's the bug with <code>const initialState = { on: initialOn }</code> and <code>reset</code>?</summary>

`reset` is recreated each render and captures that render's `initialState`. If `initialOn` changed, reset goes to the new value, not the starting one. Recorded: after unticking the setting, Reset left the switch `off` instead of returning to `on`.

</details>

<details class="qa"><summary>How does <code>useRef</code> fix it?</summary>

The ref object is created once, on the first render, with `{ on: initialOn }`; later renders get the same object. `reset` dispatches that object, so it always goes back to the true starting state. Recorded: Reset returned to `on`.

</details>

<details class="qa"><summary>How else can a consumer reset a component?</summary>

Change its `key`. React unmounts it and mounts a new one, with all state starting over.

</details>

## Related

- [The State Reducer Pattern](../../patterns/state-reducer/): the next step, the consumer controls transitions.
- [Control Props](../../patterns/control-props/): the consumer controls the value at any time.
- [Managing UI State](../../hooks/managing-ui-state/): `useState`'s initial value and lazy initialization.

## Sources

- react.dev: [`useRef`](https://react.dev/reference/react/useRef), [`useReducer`](https://react.dev/reference/react/useReducer), [Resetting state with a key](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
