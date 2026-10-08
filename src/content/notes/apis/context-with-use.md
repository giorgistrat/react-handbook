---
title: "Context with use"
slug: "context-with-use"
module: "apis"
order: 1
level: "must"
illus: "chain"
summary: "createContext, a provider and use(): skip the prop drilling, and know exactly which components re-render."
source: "https://react.dev/reference/react/createContext"
---


## In one minute

**Prop drilling** means passing a value through layers of components that don't use it, only to reach one that does. **Context** solves it in three steps:

1. `createContext(defaultValue)` declares something that can be shared.
2. `<MyContext value={…}>` provides a value to everything below it.
3. Any component below reads it with `use(MyContext)`.

When the provided value changes, React re-renders **the components that read it**, even if the components in between are memoized. It decides "changed" with `Object.is`, so a provider value written as a new object on every render counts as a change on every render.

**You'll be able to:** share a theme and a cart through context, give consumers a clear error when the provider is missing, and keep context from re-rendering more than it should.

<figure class="fig anim fig-apis-context-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Theme, memoized value</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Theme, inline value</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Add to cart</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;setTheme('dark')&quot;,&quot;say&quot;:&quot;Theme state lives in &lt;code&gt;App&lt;/code&gt;, so &lt;code&gt;App&lt;/code&gt; renders.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;theme&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;theme&quot;:&quot;ThemeContext: \&quot;dark\&quot;&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;CartProvider&quot;,&quot;say&quot;:&quot;&lt;code&gt;CartProvider&lt;/code&gt; is a child of &lt;code&gt;App&lt;/code&gt;, so it renders too. Its &lt;code&gt;useMemo&lt;/code&gt; returns the same value object (count didn’t change).&quot;,&quot;set&quot;:{&quot;prov&quot;:&quot;run&quot;,&quot;cart&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;memo Header · memo Grid&quot;,&quot;say&quot;:&quot;Both are memoized and got no new props: skipped. Context doesn’t need them: React finds the components that &lt;b&gt;read&lt;/b&gt; the changed context and renders those directly.&quot;,&quot;set&quot;:{&quot;head&quot;:&quot;skip&quot;,&quot;grid&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;use(ThemeContext)&quot;,&quot;say&quot;:&quot;The three product cards read the theme, so they render. &lt;code&gt;CartBadge&lt;/code&gt; and &lt;code&gt;AddButton&lt;/code&gt; read only the cart context, which didn’t change.&quot;,&quot;set&quot;:{&quot;cards&quot;:&quot;run&quot;,&quot;badge&quot;:&quot;skip&quot;,&quot;addb&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;App&lt;/code&gt;, &lt;code&gt;CartProvider&lt;/code&gt; and the three &lt;code&gt;ProductCard&lt;/code&gt;s. Nothing else.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;done&quot;,&quot;prov&quot;:&quot;done&quot;,&quot;cards&quot;:&quot;done&quot;}}]" data-intro="Toggle the theme; the cart value is kept stable with &lt;code&gt;useMemo&lt;/code&gt;."><div class="anim-scn-title">Theme, memoized value</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="prov"><span class="node-label" data-k="prov-label">CartProvider</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="head"><span class="node-label" data-k="head-label">memo Header</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="badge"><span class="node-label" data-k="badge-label">CartBadge</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="grid"><span class="node-label" data-k="grid-label">memo Grid</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="cards"><span class="node-label" data-k="cards-label">Card ×3</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="addb"><span class="node-label" data-k="addb-label">AddButton</span></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">context values</div><div class="a-col"><span class="an chip-a" data-k="theme" data-s="faint">ThemeContext: "light"</span><span class="an chip-a" data-k="cart" data-s="faint">CartContext: { count: 0, add }</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-schedule">schedule</span><code>setTheme('dark')</code><span>Theme state lives in <code>App</code>, so <code>App</code> renders.</span></li><li><span class="anim-phase ph-render">render phase</span><code>CartProvider</code><span><code>CartProvider</code> is a child of <code>App</code>, so it renders too. Its <code>useMemo</code> returns the same value object (count didn’t change).</span></li><li><span class="anim-phase ph-render">render phase</span><code>memo Header · memo Grid</code><span>Both are memoized and got no new props: skipped. Context doesn’t need them: React finds the components that <b>read</b> the changed context and renders those directly.</span></li><li><span class="anim-phase ph-render">render phase</span><code>use(ThemeContext)</code><span>The three product cards read the theme, so they render. <code>CartBadge</code> and <code>AddButton</code> read only the cart context, which didn’t change.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>Recorded: <code>App</code>, <code>CartProvider</code> and the three <code>ProductCard</code>s. Nothing else.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;setTheme('dark')&quot;,&quot;say&quot;:&quot;Same click.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;theme&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;theme&quot;:&quot;ThemeContext: \&quot;dark\&quot;&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;value = { count, add }&quot;,&quot;say&quot;:&quot;This provider builds its value inline: a &lt;b&gt;new object&lt;/b&gt; every render, although &lt;code&gt;count&lt;/code&gt; is still 0.&quot;,&quot;set&quot;:{&quot;prov&quot;:&quot;run&quot;,&quot;cart&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;cart&quot;:&quot;CartContext: new object&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;memo Header · memo Grid&quot;,&quot;say&quot;:&quot;Still skipped.&quot;,&quot;set&quot;:{&quot;head&quot;:&quot;skip&quot;,&quot;grid&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Object.is(oldValue, newValue) → false&quot;,&quot;say&quot;:&quot;React compares context values with &lt;code&gt;Object.is&lt;/code&gt;. A new object counts as a change, so every cart reader renders as well.&quot;,&quot;set&quot;:{&quot;cards&quot;:&quot;run&quot;,&quot;badge&quot;:&quot;bad&quot;,&quot;addb&quot;:&quot;bad&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: also &lt;code&gt;CartBadge&lt;/code&gt; and &lt;code&gt;AddButton&lt;/code&gt;, for a change that had nothing to do with the cart.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;done&quot;,&quot;prov&quot;:&quot;done&quot;,&quot;cards&quot;:&quot;done&quot;}}]" data-intro="Toggle the theme; the cart value is written inline."><div class="anim-scn-title">Theme, inline value</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="prov"><span class="node-label" data-k="prov-label">CartProvider</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="head"><span class="node-label" data-k="head-label">memo Header</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="badge"><span class="node-label" data-k="badge-label">CartBadge</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="grid"><span class="node-label" data-k="grid-label">memo Grid</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="cards"><span class="node-label" data-k="cards-label">Card ×3</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="addb"><span class="node-label" data-k="addb-label">AddButton</span></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">context values</div><div class="a-col"><span class="an chip-a" data-k="theme" data-s="faint">ThemeContext: "light"</span><span class="an chip-a" data-k="cart" data-s="faint">CartContext: { count: 0, add }</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-schedule">schedule</span><code>setTheme('dark')</code><span>Same click.</span></li><li><span class="anim-phase ph-render">render phase</span><code>value = { count, add }</code><span>This provider builds its value inline: a <b>new object</b> every render, although <code>count</code> is still 0.</span></li><li><span class="anim-phase ph-render">render phase</span><code>memo Header · memo Grid</code><span>Still skipped.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Object.is(oldValue, newValue) → false</code><span>React compares context values with <code>Object.is</code>. A new object counts as a change, so every cart reader renders as well.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>Recorded: also <code>CartBadge</code> and <code>AddButton</code>, for a change that had nothing to do with the cart.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;add()&quot;,&quot;say&quot;:&quot;Click “Add to cart”. The state lives in &lt;code&gt;CartProvider&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;addb&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;CartProvider&quot;,&quot;say&quot;:&quot;Only &lt;code&gt;CartProvider&lt;/code&gt; renders; &lt;code&gt;App&lt;/code&gt; is above it and isn’t involved. Its value is new, because &lt;code&gt;count&lt;/code&gt; changed.&quot;,&quot;set&quot;:{&quot;addb&quot;:&quot;&quot;,&quot;prov&quot;:&quot;run&quot;,&quot;cart&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;cart&quot;:&quot;CartContext: { count: 1, add }&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;use(CartContext)&quot;,&quot;say&quot;:&quot;The two cart readers render. The cards (theme only) and the memoized parents don’t.&quot;,&quot;set&quot;:{&quot;badge&quot;:&quot;run&quot;,&quot;addb&quot;:&quot;run&quot;,&quot;head&quot;:&quot;skip&quot;,&quot;grid&quot;:&quot;skip&quot;,&quot;cards&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;recorded&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;CartProvider&lt;/code&gt;, &lt;code&gt;CartBadge&lt;/code&gt;, &lt;code&gt;AddButton&lt;/code&gt;. The badge reads “1 in cart”.&quot;,&quot;set&quot;:{&quot;prov&quot;:&quot;done&quot;,&quot;badge&quot;:&quot;done&quot;,&quot;addb&quot;:&quot;done&quot;}}]" data-intro="Change the cart instead."><div class="anim-scn-title">Add to cart</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="prov"><span class="node-label" data-k="prov-label">CartProvider</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="head"><span class="node-label" data-k="head-label">memo Header</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="badge"><span class="node-label" data-k="badge-label">CartBadge</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="grid"><span class="node-label" data-k="grid-label">memo Grid</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="cards"><span class="node-label" data-k="cards-label">Card ×3</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="addb"><span class="node-label" data-k="addb-label">AddButton</span></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">context values</div><div class="a-col"><span class="an chip-a" data-k="theme" data-s="faint">ThemeContext: "light"</span><span class="an chip-a" data-k="cart" data-s="faint">CartContext: { count: 0, add }</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>add()</code><span>Click “Add to cart”. The state lives in <code>CartProvider</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>CartProvider</code><span>Only <code>CartProvider</code> renders; <code>App</code> is above it and isn’t involved. Its value is new, because <code>count</code> changed.</span></li><li><span class="anim-phase ph-render">render phase</span><code>use(CartContext)</code><span>The two cart readers render. The cards (theme only) and the memoized parents don’t.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>recorded</code><span>Recorded: <code>CartProvider</code>, <code>CartBadge</code>, <code>AddButton</code>. The badge reads “1 in cart”.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="keep"></i>reused / kept</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="skip"></i>skipped</span><span><i class="an lg-sw" data-s="done"></i>completed</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Which components render when a context value changes (all three recorded). Grid = ProductGrid, Card = ProductCard.</figcaption></figure>

## The example: theme and cart

The store has two shared values. The **theme** is read by every product card. The **cart** is read by the header badge and the "Add to cart" button. Without context, `App` would pass `theme` through `ProductGrid`, and the cart through `Header` and `ProductGrid`, though neither of them uses it.

### 1. Create the contexts

```tsx
type Theme = 'light' | 'dark'
const ThemeContext = createContext<Theme>('light') // 'light' is used when no provider is above
```

```tsx
type CartValue = { count: number; add: () => void }
const CartContext = createContext<CartValue | null>(null)

function useCart() {
	const value = use(CartContext)
	if (value === null) throw new Error('useCart must be used inside <CartProvider>')
	return value
}
```

`CartContext` defaults to `null`, meaning "no provider". The `useCart` hook turns that into a clear error and narrows the type from `CartValue | null` to `CartValue` for every caller.

### 2. Provide the values

```tsx
function CartProvider({ children }: { children: ReactNode }) {
	const [count, setCount] = useState(0)
	const value = useMemo(() => ({ count, add: () => setCount((c) => c + 1) }), [count])
	log('render CartProvider')
	return <CartContext value={value}>{children}</CartContext>
}
```

```tsx
function App({ Provider = CartProvider }) {
	const [theme, setTheme] = useState<Theme>('light')
	log('render App')
	return (
		<ThemeContext value={theme}>
			<Provider>
				<button id="theme" onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
					Toggle theme
				</button>
				<Header />
				<ProductGrid />
			</Provider>
		</ThemeContext>
	)
}
```

Since React 19 you render the context itself as the provider: `<ThemeContext value={…}>`. The older `<ThemeContext.Provider value={…}>` still works.

### 3. Read them

```tsx
function CartBadge() {
	const { count } = useCart()
	log('render CartBadge')
	return <span id="badge">{count} in cart</span>
}

function ProductCard({ name, onSale }: { name: string; onSale: boolean }) {
	const theme = use(ThemeContext)
	log(`render ProductCard (${name})`)
	return (
		<article className={`product-card ${theme}`}>
			<h2>{name}</h2>
			<SaleTag onSale={onSale} />
		</article>
	)
}

function SaleTag({ onSale }: { onSale: boolean }) {
	if (!onSale) return null
	const theme = use(ThemeContext) // use() may be called after an early return
	return <span className={`tag tag--sale ${theme}`}>Sale</span>
}
```

`SaleTag` calls `use` **after an early return**. That's allowed for `use` and not for any hook, including `useContext`.

### Who re-rendered

Toggling the theme:

```text
render App
render CartProvider
render ProductCard (Ceramic Mug)
render ProductCard (Wireless Headphones)
render ProductCard (Trail Backpack)
```

`Header` and `ProductGrid` are `memo` components with no changed props, so they were skipped. React still reached the three `ProductCard`s below `ProductGrid`, because they read the theme. `CartBadge` and `AddButton` didn't render: the cart value is memoized and didn't change.

Clicking "Add to cart":

```text
render CartProvider
render CartBadge
render AddButton
```

Now the same toggle with a provider that builds its value inline:

```tsx
const value = { count, add: () => setCount((c) => c + 1) } // a new object every render
```

```text
render App
render CartProvider
render CartBadge
render ProductCard (Ceramic Mug)
render ProductCard (Wireless Headphones)
render ProductCard (Trail Backpack)
render AddButton
```

`CartBadge` and `AddButton` rendered too. The theme toggle re-rendered `CartProvider`, which built a **new object** with the same contents, and React treats a new object as a new value.

### No provider

```tsx
<ProductCard name="Desk Lamp" onSale />
<ErrorBoundary fallbackRender={({ error }) => <p role="alert">{(error as Error).message}</p>}>
	<CartBadge />
</ErrorBoundary>
```

What rendered:

```js
{
  "logs": [
    "render ProductCard (Desk Lamp)",
    "render ProductCard (Desk Lamp)"
  ],
  "warnings": [
    "Error: useCart must be used inside <CartProvider>"
  ],
  "article": "product-card light",
  "sale": "tag tag--sale light",
  "alert": "useCart must be used inside <CartProvider>"
}
```

The card fell back to `ThemeContext`'s default, `'light'`. The badge hit `useCart`'s check, and the error boundary showed the message instead of a confusing `Cannot read properties of null`.

## How it works

- **A provider sets a value for a subtree.** `use(Ctx)` returns the value from the **nearest** provider above, or the default from `createContext` if there's none. Providers can be nested, and an inner one overrides an outer one.
- **Changes go straight to readers.** When a provider's value changes, React walks down from the provider and marks every component that reads that context (`propagateContextChanges` in the [React Engine Map](../../internals/engine-map/)). Readers inside a memoized, skipped parent are still rendered. You can't block a context update with `memo`.
- **Changes are detected with `Object.is`.** For object values, memoize the object (`useMemo`) and its functions (`useCallback`, or a `setState` updater as in `CartProvider`), so the value only changes when its contents do.
- **`use` vs `useContext`.** Both read context. `use` can also be called conditionally and in loops, and it can read promises (see the Suspense notes). New code can use `use` everywhere.
- **Context is for values that are read widely and change rarely:** theme, signed-in user, locale, feature flags. A value that changes on every keystroke and has many readers re-renders all of them each time. For that, split the context, or use a store with selectors ([useSyncExternalStore](../../apis/usesyncexternalstore/)).

## Common mistakes

- **An inline object as the value** (`value={{ count, add }}`). Every render of the provider's parent re-renders every reader (recorded above).
- **One big context for everything.** A theme change re-renders cart readers, and a cart change re-renders theme readers. Split contexts by how often they change.
- **Reading a nullable context without a check.** Wrap it in a hook that throws a clear error.
- **Using context to avoid passing props one or two levels.** Passing props is clearer. Composition (passing JSX as `children`) often removes drilling without context.

## Interview Q&A

<details class="qa"><summary>What problem does context solve?</summary>

Prop drilling: passing a value through components that don't use it so a deep descendant can. With context, any component below a provider reads the value directly.

</details>

<details class="qa"><summary>Walk through the three pieces of the context API.</summary>

`createContext(default)` creates the context. `<Ctx value={v}>` (React 19; `<Ctx.Provider>` before that) provides a value to its subtree. `use(Ctx)` or `useContext(Ctx)` reads the nearest provider's value, or the default if there's none.

</details>

<details class="qa"><summary>What's the difference between <code>use</code> and <code>useContext</code>?</summary>

They read context the same way. `use` isn't bound by the rules of hooks, so it can run inside conditions, loops or after an early return, and it can also unwrap a promise. `useContext` must be called at the top level every render and only reads context.

</details>

<details class="qa"><summary>When a context value changes, which components re-render?</summary>

Every component that reads that context, wherever it is below the provider, even inside memoized parents. Recorded: toggling the theme rendered the three `ProductCard`s, while the memoized `Header` and `ProductGrid` were skipped.

</details>

<details class="qa"><summary>Why can an inline provider value hurt performance?</summary>

Context changes are detected with `Object.is`, and `{ count, add }` is a new object on every render. Recorded: with the inline value, a theme toggle also rendered `CartBadge` and `AddButton`, although the cart hadn't changed. `useMemo` fixed it.

</details>

<details class="qa"><summary>How do you make a missing provider fail loudly?</summary>

Default the context to `null` and read it through a custom hook that throws if the value is `null`. Recorded: "useCart must be used inside &lt;CartProvider&gt;", shown by the error boundary.

</details>

<details class="qa"><summary>When is context the wrong tool?</summary>

For values that change very often and are read by many components (every reader re-renders each time). Use a store with selectors, or split the context.

</details>

## Related

- [useReducer](../../apis/usereducer/): share `dispatch` through context to give distant components the cart actions.
- [React Re-rendering](../../hooks/react-re-rendering/): `memo`, `useMemo` and `Object.is`.
- [useSyncExternalStore](../../apis/usesyncexternalstore/): a store outside React, for frequently changing shared state.
- [React Engine Map](../../internals/engine-map/): `readContext` and `propagateContextChanges`, how React finds context readers.

## Sources

- react.dev: [`createContext`](https://react.dev/reference/react/createContext), [`use`](https://react.dev/reference/react/use), [`useContext`](https://react.dev/reference/react/useContext), [Passing data deeply with context](https://react.dev/learn/passing-data-deeply-with-context)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
