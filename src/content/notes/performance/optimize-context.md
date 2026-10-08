---
title: "Optimize Context"
slug: "optimize-context"
module: "performance"
order: 1
level: "must"
illus: "chain"
summary: "Memoize the value, move state into a provider component, split state from setters: who re-renders after each."
source: "https://kentcdodds.com/blog/how-to-optimize-your-context-value"
---


## In one minute

When a provider's `value` changes (by `Object.is`), **every component that reads that context re-renders**, memoized or not. Three techniques cut that down, each removing a different kind of render:

1. **Memoize the value** (`useMemo`), so an unrelated re-render of the provider's parent doesn't create a "new" value.
2. **Move the state into a provider component** that takes `children`, so a change re-renders only the provider and its consumers, not the whole app.
3. **Split the context**: state in one, setters in another. Setters never change, so components that only set never re-render.

Don't do this for every context. It pays off when the value changes often, many components read it, and you've measured a problem.

**You'll be able to:** predict which components re-render after a context change, and apply each technique where it helps.

<figure class="fig anim fig-perf-context-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Inline value</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useMemo value</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Provider component</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="3" aria-selected="false">Split context</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Visits”&quot;,&quot;say&quot;:&quot;A new value object on every &lt;code&gt;App&lt;/code&gt; render, so both memoized consumers render for a click that has nothing to do with the theme.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;run&quot;,&quot;pick&quot;:&quot;run&quot;,&quot;foot&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;5 components&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Purple theme”&quot;,&quot;say&quot;:&quot;Everything renders, as expected for a real change.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;run&quot;,&quot;pick&quot;:&quot;run&quot;,&quot;foot&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;5 components&quot;}}]" data-intro="&lt;code&gt;value={{ color, setColor }}&lt;/code&gt; in &lt;code&gt;App&lt;/code&gt;."><div class="anim-scn-title">Inline value</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="prov"><span class="node-label" data-k="prov-label">Provider</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="main"><span class="node-label" data-k="main-label">Main</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="pick"><span class="node-label" data-k="pick-label">Picker</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="foot"><span class="node-label" data-k="foot-label">Footer</span></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">rendered (recorded)</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="ghost">–</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click “Visits”</code><span>A new value object on every <code>App</code> render, so both memoized consumers render for a click that has nothing to do with the theme.</span></li><li><span class="anim-phase ph-event">event</span><code>click “Purple theme”</code><span>Everything renders, as expected for a real change.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Visits”&quot;,&quot;say&quot;:&quot;Same value object, so the consumers are left alone. &lt;code&gt;Main&lt;/code&gt; still renders: it isn’t memoized and its parent rendered.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;run&quot;,&quot;pick&quot;:&quot;skip&quot;,&quot;foot&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;3 components&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Purple theme”&quot;,&quot;say&quot;:&quot;A real change: everyone renders, including &lt;code&gt;App&lt;/code&gt; and &lt;code&gt;Main&lt;/code&gt;, because the state lives in &lt;code&gt;App&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;run&quot;,&quot;pick&quot;:&quot;run&quot;,&quot;foot&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;5 components&quot;}}]" data-intro="The value memoized on &lt;code&gt;[color]&lt;/code&gt;."><div class="anim-scn-title">useMemo value</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="prov"><span class="node-label" data-k="prov-label">Provider</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="main"><span class="node-label" data-k="main-label">Main</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="pick"><span class="node-label" data-k="pick-label">Picker</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="foot"><span class="node-label" data-k="foot-label">Footer</span></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">rendered (recorded)</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="ghost">–</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click “Visits”</code><span>Same value object, so the consumers are left alone. <code>Main</code> still renders: it isn’t memoized and its parent rendered.</span></li><li><span class="anim-phase ph-event">event</span><code>click “Purple theme”</code><span>A real change: everyone renders, including <code>App</code> and <code>Main</code>, because the state lives in <code>App</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Visits”&quot;,&quot;say&quot;:&quot;The counter still re-renders &lt;code&gt;App&lt;/code&gt;, its provider element and &lt;code&gt;Main&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;run&quot;,&quot;pick&quot;:&quot;skip&quot;,&quot;foot&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;3 components&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Purple theme”&quot;,&quot;say&quot;:&quot;Now the state change starts &lt;b&gt;inside&lt;/b&gt; the provider. Its &lt;code&gt;children&lt;/code&gt; are the same elements as before, so only the consumers render. &lt;code&gt;App&lt;/code&gt; and &lt;code&gt;Main&lt;/code&gt; don’t.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;skip&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;skip&quot;,&quot;pick&quot;:&quot;run&quot;,&quot;foot&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;3 components&quot;}}]" data-intro="A &lt;code&gt;ThemeProvider&lt;/code&gt; owns the color and takes &lt;code&gt;children&lt;/code&gt;."><div class="anim-scn-title">Provider component</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="prov"><span class="node-label" data-k="prov-label">Provider</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="main"><span class="node-label" data-k="main-label">Main</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="pick"><span class="node-label" data-k="pick-label">Picker</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="foot"><span class="node-label" data-k="foot-label">Footer</span></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">rendered (recorded)</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="ghost">–</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click “Visits”</code><span>The counter still re-renders <code>App</code>, its provider element and <code>Main</code>.</span></li><li><span class="anim-phase ph-event">event</span><code>click “Purple theme”</code><span>Now the state change starts <b>inside</b> the provider. Its <code>children</code> are the same elements as before, so only the consumers render. <code>App</code> and <code>Main</code> don’t.</span></li></ol></div><div class="anim-scn" data-anim-scn="3" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Visits”&quot;,&quot;say&quot;:&quot;Same as before.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;run&quot;,&quot;pick&quot;:&quot;skip&quot;,&quot;foot&quot;:&quot;skip&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;3 components&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click “Purple theme”&quot;,&quot;say&quot;:&quot;The picker only reads the setter context, whose value (&lt;code&gt;setColor&lt;/code&gt;) never changes, so it doesn’t render either. Only the footer, which shows the color.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;skip&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;main&quot;:&quot;skip&quot;,&quot;pick&quot;:&quot;skip&quot;,&quot;foot&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;res&quot;:&quot;2 components&quot;}}]" data-intro="One context for &lt;code&gt;color&lt;/code&gt;, one for &lt;code&gt;setColor&lt;/code&gt;."><div class="anim-scn-title">Split context</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="prov"><span class="node-label" data-k="prov-label">Provider</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="main"><span class="node-label" data-k="main-label">Main</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="pick"><span class="node-label" data-k="pick-label">Picker</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="foot"><span class="node-label" data-k="foot-label">Footer</span></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">rendered (recorded)</div><div class="a-col"><span class="an chip-a" data-k="res" data-s="ghost">–</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click “Visits”</code><span>Same as before.</span></li><li><span class="anim-phase ph-event">event</span><code>click “Purple theme”</code><span>The picker only reads the setter context, whose value (<code>setColor</code>) never changes, so it doesn’t render either. Only the footer, which shows the color.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="skip"></i>skipped</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>An unrelated counter click, then a theme change, for each technique (all recorded). Picker = <code>memo(ColorPicker)</code>, Footer = <code>memo(Footer)</code>, both reading the theme context.</figcaption></figure>

## The example: the store theme

The store has a theme color. A memoized `Footer` shows it; a memoized `ColorPicker` only changes it; `Main` uses neither. `App` also has an unrelated "Visits" counter.

```tsx
const Footer = memo(function Footer() {
	const { color } = use(ThemeContext)!
	log('  render Footer')
	return <footer style={{ color }}>Free returns for 30 days</footer>
})

const ColorPicker = memo(function ColorPicker() {
	const { setColor } = use(ThemeContext)!
	log('  render ColorPicker')
	return <button id="color" onClick={() => setColor('purple')}>Purple theme</button>
})
```

Each version below was recorded with one "Visits" click, then one "Purple theme" click.

### 1. An inline value

```tsx
function AppInline() {
	const [count, setCount] = useState(0)
	const [color, setColor] = useState('black')
	log('render App')
	return (
		<ThemeContext value={{ color, setColor }}>
			<button id="count" onClick={() => setCount(count + 1)}>Visits: {count}</button>
			<Main />
			<ColorPicker />
			<Footer />
		</ThemeContext>
	)
}
```

Visits click, then theme click:

```text
render App
  render Main
  render ColorPicker
  render Footer
```

```text
render App
  render Main
  render ColorPicker
  render Footer
```

The counter has nothing to do with the theme, yet both memoized consumers rendered. `{ color, setColor }` is a new object on every `App` render, and React compares context values with `Object.is`. `memo` can't help: it only compares props, and context updates go around it.

### 2. Memoize the value

```tsx
function AppMemoValue() {
	const [count, setCount] = useState(0)
	const [color, setColor] = useState('black')
	log('render App')
	const value = useMemo(() => ({ color, setColor }), [color])
	return (
		<ThemeContext value={value}>
			<button id="count" onClick={() => setCount(count + 1)}>Visits: {count}</button>
			<Main />
			<ColorPicker />
			<Footer />
		</ThemeContext>
	)
}
```

```text
render App
  render Main
```

```text
render App
  render Main
  render ColorPicker
  render Footer
```

The counter no longer touches the consumers. `setColor` doesn't need to be in the dependencies: `useState` setters never change. But a theme change still re-renders `App` and `Main`, because the state lives in `App`.

### 3. A provider component

```tsx
function ThemeProvider({ children }: { children: ReactNode }) {
	const [color, setColor] = useState('black')
	log('  render ThemeProvider')
	const value = useMemo(() => ({ color, setColor }), [color])
	return <ThemeContext value={value}>{children}</ThemeContext>
}

function AppProvider() {
	const [count, setCount] = useState(0)
	log('render App')
	return (
		<ThemeProvider>
			<button id="count" onClick={() => setCount(count + 1)}>Visits: {count}</button>
			<Main />
			<ColorPicker />
			<Footer />
		</ThemeProvider>
	)
}
```

```text
render App
  render ThemeProvider
  render Main
```

```text
  render ThemeProvider
  render ColorPicker
  render Footer
```

A theme change now starts **inside** `ThemeProvider`. Its `children` were created by `App`, which didn't re-render, so they're the same elements as last time and React skips them ([Element Optimization](../../performance/element-optimization/)). Only the context readers render. This is the standard shape for real providers: `AuthProvider`, `CartProvider`, `QueryClientProvider`.

### 4. Split state from setters

```tsx
const ColorContext = createContext('black')
const SetColorContext = createContext<(c: string) => void>(() => {})

function SplitThemeProvider({ children }: { children: ReactNode }) {
	const [color, setColor] = useState('black')
	log('  render ThemeProvider')
	return (
		<SetColorContext value={setColor}>
			<ColorContext value={color}>{children}</ColorContext>
		</SetColorContext>
	)
}

const SplitFooter = memo(function Footer() {
	const color = use(ColorContext)
	log('  render Footer')
	return <footer style={{ color }}>Free returns for 30 days</footer>
})

const SplitColorPicker = memo(function ColorPicker() {
	const setColor = use(SetColorContext) // never changes: setters are stable
	log('  render ColorPicker')
	return <button id="color" onClick={() => setColor('purple')}>Purple theme</button>
})
```

```text
render App
  render ThemeProvider
  render Main
```

```text
  render ThemeProvider
  render Footer
```

`ColorPicker` reads only `SetColorContext`, whose value is `setColor`, which never changes. So a theme change re-renders only the footer that displays it.

### Summary

| Version | "Visits" click renders | Theme click renders |
| --- | --- | --- |
| Inline value | App, Main, ColorPicker, Footer | App, Main, ColorPicker, Footer |
| `useMemo` value | App, Main | App, Main, ColorPicker, Footer |
| Provider component | App, ThemeProvider, Main | ThemeProvider, ColorPicker, Footer |
| Split context | App, ThemeProvider, Main | ThemeProvider, Footer |

(From the recordings above. `Main` renders on a Visits click in every version: its parent rendered and it isn't memoized.)

## How it works

- **A provider compares its old and new value with `Object.is`.** If they differ, React walks down from the provider, finds every component that read that context, and schedules it, skipping `memo` checks ([React Engine Map](../../internals/engine-map/), `propagateContextChanges`).
- **Each technique removes one kind of render.** `useMemo` removes consumer renders when nothing changed. The provider component removes the **tree** render when something did change. Splitting removes **setter-only** consumer renders.
- **`useReducer` makes splitting easy:** `dispatch` is stable, so one context can hold `state` and another `dispatch`.

## Common mistakes

- **Inline object values** (`value={{ a, b }}`), recorded above.
- **One giant app context.** Every reader of any field re-renders on any change. Split by what changes together.
- **Expecting `memo` to block context.** It doesn't; a component that shouldn't re-render must not read the changing context.
- **Doing all three everywhere.** It's more code to read. For a theme that changes once a session, an inline value is fine.

## Interview Q&A

<details class="qa"><summary>When does a context consumer re-render?</summary>

When the nearest provider's value changes by `Object.is`, whether or not the consumer is memoized.

</details>

<details class="qa"><summary>Why is <code>&lt;Ctx value={{ state, setState }}&gt;</code> a performance problem?</summary>

The object is new on every render of the component that renders the provider, so every consumer re-renders every time, even when nothing changed. Recorded: an unrelated counter click rendered both memoized consumers.

</details>

<details class="qa"><summary>Why does a provider component with <code>children</code> help?</summary>

When its state changes, only it re-renders. Its `children` prop holds elements created by its parent, which didn't re-render, so React reuses them and only renders the context readers. Recorded: a theme change no longer rendered `App` or `Main`.

</details>

<details class="qa"><summary>What does splitting a context buy you?</summary>

Components that only call setters read a context whose value never changes, so they never re-render from it. Recorded: after splitting, a theme change rendered only `ThemeProvider` and `Footer`.

</details>

<details class="qa"><summary>Should you optimize every context like this?</summary>

No. Measure first. These techniques matter for values that change often with many consumers.

</details>

## Related

- [Context with use](../../apis/context-with-use/): the basics, including the memoized cart value.
- [Element Optimization](../../performance/element-optimization/): why `children` from above are skipped.
- [useSyncExternalStore](../../apis/usesyncexternalstore/): a store with selectors, for fast-changing shared state.

## Sources

- Kent C. Dodds: [How to optimize your context value](https://kentcdodds.com/blog/how-to-optimize-your-context-value), [How to use React context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- react.dev: [Optimizing re-renders when passing objects and functions](https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions)
- Topic order inspired by Kent C. Dodds' EpicReact *React Performance* workshop; the example app and code here are this handbook's own.
