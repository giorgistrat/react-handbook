---
title: "Control Props"
slug: "control-props"
module: "patterns"
order: 7
level: "must"
illus: "pipeline"
summary: "A hook that works on its own, or lets the parent own the value: suggestions through onChange, like input value."
source: "https://kentcdodds.com/blog/control-props-vs-state-reducers"
---


## In one minute

**Control props** apply the controlled `<input value onChange>` idea to your own components. Left alone, `useToggle` manages its own `on` (uncontrolled). Pass it an `on` prop and it becomes **controlled**: it stops updating its own state and only **suggests** the next state through `onChange`. The parent decides whether to accept it (by setting its own state) or ignore it. This lets the parent own the value: keep two components in sync, change it from outside, or refuse a change.

**You'll be able to:** make a hook work both controlled and uncontrolled, explain the round trip a controlled change takes, and choose between control props and a state reducer.

<figure class="fig anim fig-patterns-control-props-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Parent accepts</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Parent ignores</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Uncontrolled</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click Cart switch&quot;,&quot;say&quot;:&quot;&lt;code&gt;on&lt;/code&gt; was passed, so this toggle is &lt;b&gt;controlled&lt;/b&gt;: &lt;code&gt;dispatchWithOnChange&lt;/code&gt; skips its own &lt;code&gt;dispatch&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;t1&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;reducer({ ...state, on }, action)&quot;,&quot;say&quot;:&quot;It calls the reducer directly, to compute what it &lt;b&gt;would&lt;/b&gt; do, and passes that to &lt;code&gt;onChange&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;t1&quot;:&quot;&quot;,&quot;sg&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;sg&quot;:&quot;suggested: { on: true }&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;setGiftWrap(true)&quot;,&quot;say&quot;:&quot;The parent accepts the suggestion and updates &lt;b&gt;its&lt;/b&gt; state.&quot;,&quot;set&quot;:{&quot;gw&quot;:&quot;upd&quot;,&quot;co&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;gw&quot;:&quot;giftWrap = true (Checkout)&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;both toggles get on={true}&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;Checkout&lt;/code&gt; and all three toggles rendered; both gift-wrap switches turned on, though only one was clicked.&quot;,&quot;set&quot;:{&quot;t1&quot;:&quot;run&quot;,&quot;t2&quot;:&quot;run&quot;,&quot;t3&quot;:&quot;run&quot;}}]" data-intro="Click the Cart switch."><div class="anim-scn-title">Parent accepts</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="co"><span class="node-label" data-k="co-label">Checkout</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t1"><span class="node-label" data-k="t1-label">cart</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t2"><span class="node-label" data-k="t2-label">checkout</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t3"><span class="node-label" data-k="t3-label">news</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">state</div><div class="a-col"><span class="an chip-a" data-k="gw" data-s="faint">giftWrap = false (Checkout)</span><span class="an chip-a" data-k="sg" data-s="ghost">suggested: –</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click Cart switch</code><span><code>on</code> was passed, so this toggle is <b>controlled</b>: <code>dispatchWithOnChange</code> skips its own <code>dispatch</code>.</span></li><li><span class="anim-phase ph-event">event</span><code>reducer({ ...state, on }, action)</code><span>It calls the reducer directly, to compute what it <b>would</b> do, and passes that to <code>onChange</code>.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>setGiftWrap(true)</code><span>The parent accepts the suggestion and updates <b>its</b> state.</span></li><li><span class="anim-phase ph-render">render phase</span><code>both toggles get on={true}</code><span>Recorded: <code>Checkout</code> and all three toggles rendered; both gift-wrap switches turned on, though only one was clicked.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click Checkout switch&quot;,&quot;say&quot;:&quot;After “Place order”, the same click.&quot;,&quot;set&quot;:{&quot;t2&quot;:&quot;hl&quot;},&quot;txt&quot;:{&quot;gw&quot;:&quot;giftWrap = true (Checkout)&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onChange({ on: false })&quot;,&quot;say&quot;:&quot;The toggle suggests turning it off.&quot;,&quot;set&quot;:{&quot;t2&quot;:&quot;&quot;,&quot;sg&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;sg&quot;:&quot;suggested: { on: false }&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;return (ignored)&quot;,&quot;say&quot;:&quot;The parent doesn’t call &lt;code&gt;setGiftWrap&lt;/code&gt;. Recorded: &lt;code&gt;Checkout: ignored the change&lt;/code&gt;, and &lt;b&gt;nothing&lt;/b&gt; rendered. The switch stays on.&quot;,&quot;set&quot;:{&quot;sg&quot;:&quot;bad&quot;,&quot;gw&quot;:&quot;keep&quot;}}]" data-intro="The order is placed; click the Checkout switch."><div class="anim-scn-title">Parent ignores</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="co"><span class="node-label" data-k="co-label">Checkout</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t1"><span class="node-label" data-k="t1-label">cart</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t2"><span class="node-label" data-k="t2-label">checkout</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t3"><span class="node-label" data-k="t3-label">news</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">state</div><div class="a-col"><span class="an chip-a" data-k="gw" data-s="faint">giftWrap = false (Checkout)</span><span class="an chip-a" data-k="sg" data-s="ghost">suggested: –</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click Checkout switch</code><span>After “Place order”, the same click.</span></li><li><span class="anim-phase ph-event">event</span><code>onChange({ on: false })</code><span>The toggle suggests turning it off.</span></li><li><span class="anim-phase ph-event">event</span><code>return (ignored)</code><span>The parent doesn’t call <code>setGiftWrap</code>. Recorded: <code>Checkout: ignored the change</code>, and <b>nothing</b> rendered. The switch stays on.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click Newsletter switch&quot;,&quot;say&quot;:&quot;No &lt;code&gt;on&lt;/code&gt; prop: this toggle is &lt;b&gt;uncontrolled&lt;/b&gt;, so it dispatches to its own state.&quot;,&quot;set&quot;:{&quot;t3&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Toggle Newsletter&quot;,&quot;say&quot;:&quot;&lt;code&gt;onChange&lt;/code&gt; is still called, as a notification. Recorded: only this toggle rendered.&quot;,&quot;set&quot;:{&quot;t3&quot;:&quot;run&quot;}}]" data-intro="Click the Newsletter switch."><div class="anim-scn-title">Uncontrolled</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="co"><span class="node-label" data-k="co-label">Checkout</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t1"><span class="node-label" data-k="t1-label">cart</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t2"><span class="node-label" data-k="t2-label">checkout</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t3"><span class="node-label" data-k="t3-label">news</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">state</div><div class="a-col"><span class="an chip-a" data-k="gw" data-s="faint">giftWrap = false (Checkout)</span><span class="an chip-a" data-k="sg" data-s="ghost">suggested: –</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click Newsletter switch</code><span>No <code>on</code> prop: this toggle is <b>uncontrolled</b>, so it dispatches to its own state.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Toggle Newsletter</code><span><code>onChange</code> is still called, as a notification. Recorded: only this toggle rendered.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Two controlled gift-wrap switches and one uncontrolled newsletter switch (all recorded). Each child of <code>Checkout</code> is a <code>Toggle</code>, named by its label.</figcaption></figure>

## The example: one choice, two switches

The gift-wrap switch appears in the cart summary *and* on the checkout step. They must always agree, and after the order is placed neither may change. A newsletter switch on the same page is left uncontrolled.

### 1. The hook

```tsx
type Options = {
	initialOn?: boolean
	reducer?: typeof toggleReducer
	on?: boolean // pass it to control the value
	onChange?: (suggested: ToggleState, action: ToggleAction) => void
}

function useToggle({ initialOn = false, reducer = toggleReducer, on: controlledOn, onChange }: Options = {}) {
	const { current: initialState } = useRef({ on: initialOn })
	const [state, dispatch] = useReducer(reducer, initialState)
	const onIsControlled = controlledOn != null
	const on = onIsControlled ? controlledOn : state.on

	function dispatchWithOnChange(action: ToggleAction) {
		if (!onIsControlled) dispatch(action)
		onChange?.(reducer({ ...state, on }, action), action) // the suggested next state
	}

	const toggle = () => dispatchWithOnChange({ type: 'toggle' })
	return { on, toggle }
}
```

The key lines: `onIsControlled` is decided by whether an `on` prop was passed (`!= null`, so `undefined` and `null` both mean "not controlled"). When controlled, `dispatch` is skipped and the reducer is called **as a plain function**, only to compute the suggestion.

```tsx
function Toggle({ label, on, onChange }: { label: string } & Pick<Options, 'on' | 'onChange'>) {
	const toggle = useToggle({ on, onChange })
	log(`render Toggle "${label}" (on: ${toggle.on})`)
	return <Switch id={label.toLowerCase()} on={toggle.on} onClick={toggle.toggle} aria-label={label} />
}
```

### 2. The page owns the value

```tsx
function Checkout() {
	const [giftWrap, setGiftWrap] = useState(false)
	const [orderPlaced, setOrderPlaced] = useState(false)
	log('render Checkout')

	function handleGiftWrapChange(suggested: ToggleState) {
		if (orderPlaced) return log('Checkout: ignored the change (order placed)')
		log(`Checkout: setGiftWrap(${suggested.on})`)
		setGiftWrap(suggested.on)
	}

	return (
		<>
			<Toggle label="Cart" on={giftWrap} onChange={handleGiftWrapChange} />
			<Toggle label="Checkout" on={giftWrap} onChange={handleGiftWrapChange} />
			<Toggle label="Newsletter" onChange={(s) => log(`newsletter onChange: ${s.on}`)} />
			<button id="place" onClick={() => setOrderPlaced(true)}>Place order</button>
		</>
	)
}
```

Recorded. Clicking the **Cart** switch:

```text
Checkout: setGiftWrap(true)
render Checkout
render Toggle "Cart" (on: true)
render Toggle "Checkout" (on: true)
render Toggle "Newsletter" (on: false)
```

```text
cart: true, checkout: true
```

Both switches turned on, though only one was clicked: the click became a suggestion, `Checkout` stored it, and both toggles got the new `on`.

Clicking the uncontrolled **Newsletter** switch:

```text
newsletter onChange: true
render Toggle "Newsletter" (on: true)
```

It updated its own state; only it re-rendered, and `onChange` was just a notification.

After "Place order", clicking the **Checkout** switch:

```text
Checkout: ignored the change (order placed)
```

```text
cart: true, checkout: true
```

The parent ignored the suggestion, so **nothing rendered at all**: the toggle had skipped its own `dispatch`, and the parent didn't set state. A controlled component can only change through its parent.

## How it works

- **Two sources, one chosen.** `useReducer` always runs, but when controlled, `on` comes from the prop and the internal state is ignored. That avoids two copies of the truth drifting apart.
- **Suggestions come from the same reducer.** `reducer({ ...state, on }, action)` computes "what I'd do" without committing it. A custom reducer ([The State Reducer Pattern](../../patterns/state-reducer/)) shapes the suggestion too.
- **The round trip:** click → `onChange(suggestion)` → parent `setState` → parent re-renders → new `on` prop → toggle shows it. If the parent doesn't call `setState`, nothing happens.
- **Same contract as form inputs.** An `<input value={v}>` ignores typing until your `onChange` sets `v` ([Inputs](../../fundamentals/inputs/)). Like inputs, a component shouldn't switch between controlled and uncontrolled during its life; libraries such as Downshift warn when it does.

## Common mistakes

- **Passing `on` without `onChange`.** The component becomes read-only, like `<input value>` without `onChange`.
- **Passing `on={undefined}` sometimes and a boolean other times.** That silently switches modes.
- **Expecting `onChange` to mean the value changed.** In controlled mode it's a suggestion; the value changes only if the parent accepts it.
- **Using control props when a state reducer would do.** If the consumer only needs to tweak how the component reacts to its own clicks, a reducer is less work for them: they don't have to own and pass back the state.

## Interview Q&A

<details class="qa"><summary>What are control props?</summary>

Props that let the parent own a component's state, the way `value` and `onChange` do for `<input>`. Without them the component manages its own state; with them, it only suggests changes through `onChange`.

</details>

<details class="qa"><summary>How does the hook know it's controlled?</summary>

An `on` prop was passed: `const onIsControlled = controlledOn != null`. Then `on` is taken from the prop and internal `dispatch` is skipped.

</details>

<details class="qa"><summary>Walk through a click on a controlled toggle.</summary>

The toggle computes the suggested next state with its reducer and calls `onChange`. The parent sets its own state, re-renders, and passes the new `on` down. Recorded: clicking one switch logged `Checkout: setGiftWrap(true)`, then `Checkout` and both toggles rendered with `on: true`.

</details>

<details class="qa"><summary>How does a parent veto a change?</summary>

It doesn't call `setState`. Recorded: after the order was placed, the click logged only "ignored the change", and no component rendered.

</details>

<details class="qa"><summary>Control props or state reducer?</summary>

State reducer: the consumer changes how the component responds to its own actions, but the component still owns the state. Control props: the consumer owns the state, so it can change it from outside, sync several components, or drive it from a URL or a server. Control props are more powerful and more work for the consumer. They combine fine: this hook accepts both.

</details>

<details class="qa"><summary>Where do you see this in real libraries?</summary>

Every form input; Radix (`value`/`onValueChange`, `open`/`onOpenChange`); Downshift (`selectedItem`, `isOpen` with `onStateChange`).

</details>

## Related

- [Inputs](../../fundamentals/inputs/): controlled and uncontrolled inputs.
- [The State Reducer Pattern](../../patterns/state-reducer/) and [State Initializers](../../patterns/state-initializers/): the earlier steps of this hook.
- [Lifting State](../../hooks/lifting-state/): owning shared state in the parent.

## Sources

- Kent C. Dodds: [When to use control props or state reducers](https://kentcdodds.com/blog/control-props-vs-state-reducers)
- react.dev: [Controlling an input with a state variable](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
- Radix UI: [Select](https://www.radix-ui.com/primitives/docs/components/select) (`value` / `onValueChange`)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
