---
title: "Composition and Layout Components"
slug: "composition"
module: "patterns"
order: 0
level: "must"
illus: "list"
summary: "Pass finished elements, not data, through components that only lay things out."
source: "https://kentcdodds.com/blog/prop-drilling"
---


## In one minute

**Prop drilling** is passing a prop through components that don't use it, so that a component further down can. It often happens with **layout components**: a `Nav`, a `Main`, a `Footer` whose only job is to decide *where* things go. The fix is to stop passing them data and pass them **finished elements** instead. The component that owns the data builds the element (`<img src={user.avatar} />`), and the layout component just places it. For one region that's `children`; for several regions, named props like `sidebar` and `content`.

**You'll be able to:** spot a layout component that's forwarding data, and turn it into one that takes elements.

<figure class="fig anim fig-patterns-composition-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Data drilled</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Elements passed</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;App&quot;,&quot;say&quot;:&quot;&lt;code&gt;App&lt;/code&gt; owns &lt;code&gt;user&lt;/code&gt;, the products and the selected product.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Nav user={user} /&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;Nav&lt;/code&gt; only places an avatar, but it has to accept the whole &lt;code&gt;user&lt;/code&gt; to build it.&quot;,&quot;set&quot;:{&quot;nav&quot;:&quot;bad&quot;,&quot;img&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;pn&quot;:&quot;Nav: user&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Main products selected onSelect /&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;Main&lt;/code&gt; only puts two regions side by side, yet it receives three props it just passes on.&quot;,&quot;set&quot;:{&quot;main&quot;:&quot;bad&quot;,&quot;list&quot;:&quot;run&quot;,&quot;det&quot;:&quot;run&quot;},&quot;txt&quot;:{&quot;pm&quot;:&quot;Main: products, selected, onSelect&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Footer user={user} /&gt;&quot;,&quot;say&quot;:&quot;Same for &lt;code&gt;Footer&lt;/code&gt;. Each layout component now depends on data it doesn’t use: change &lt;code&gt;User&lt;/code&gt; and their types change too.&quot;,&quot;set&quot;:{&quot;foot&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;pf&quot;:&quot;Footer: user&quot;}}]" data-intro="Layout components receive data and pass it on."><div class="anim-scn-title">Data drilled</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="nav"><span class="node-label" data-k="nav-label">Nav</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="img"><span class="node-label" data-k="img-label">&lt;img&gt;</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="main"><span class="node-label" data-k="main-label">Main</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="list"><span class="node-label" data-k="list-label">List</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="det"><span class="node-label" data-k="det-label">Details</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="foot"><span class="node-label" data-k="foot-label">Footer</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">props received (recorded)</div><div class="a-col"><span class="an chip-a" data-k="pn" data-s="faint">Nav: …</span><span class="an chip-a" data-k="pm" data-s="faint">Main: …</span><span class="an chip-a" data-k="pf" data-s="faint">Footer: …</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>App</code><span><code>App</code> owns <code>user</code>, the products and the selected product.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Nav user={user} /&gt;</code><span><code>Nav</code> only places an avatar, but it has to accept the whole <code>user</code> to build it.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Main products selected onSelect /&gt;</code><span><code>Main</code> only puts two regions side by side, yet it receives three props it just passes on.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Footer user={user} /&gt;</code><span>Same for <code>Footer</code>. Each layout component now depends on data it doesn’t use: change <code>User</code> and their types change too.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;App&quot;,&quot;say&quot;:&quot;Same state, same place.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;avatar={&lt;img … /&gt;}&quot;,&quot;say&quot;:&quot;&lt;code&gt;App&lt;/code&gt; builds the avatar element itself, where &lt;code&gt;user&lt;/code&gt; is, and hands &lt;code&gt;Nav&lt;/code&gt; the finished element.&quot;,&quot;set&quot;:{&quot;img&quot;:&quot;new&quot;,&quot;nav&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;pn&quot;:&quot;Nav: avatar&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;sidebar={&lt;List …/&gt;} content={&lt;Details …/&gt;}&quot;,&quot;say&quot;:&quot;Two regions, two named element props. &lt;code&gt;Main&lt;/code&gt; only decides where they go.&quot;,&quot;set&quot;:{&quot;list&quot;:&quot;new&quot;,&quot;det&quot;:&quot;new&quot;,&quot;main&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;pm&quot;:&quot;Main: sidebar, content&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;&lt;Footer&gt;…&lt;/Footer&gt;&quot;,&quot;say&quot;:&quot;One region: plain &lt;code&gt;children&lt;/code&gt;. Recorded: no layout component received any data.&quot;,&quot;set&quot;:{&quot;foot&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;pf&quot;:&quot;Footer: children&quot;}}]" data-intro="Layout components receive finished elements."><div class="anim-scn-title">Elements passed</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">component tree</div><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="nav"><span class="node-label" data-k="nav-label">Nav</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="img"><span class="node-label" data-k="img-label">&lt;img&gt;</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="main"><span class="node-label" data-k="main-label">Main</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="list"><span class="node-label" data-k="list-label">List</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="det"><span class="node-label" data-k="det-label">Details</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="foot"><span class="node-label" data-k="foot-label">Footer</span></div></div></div></div></div></div></div></div><div class="a-panel "><div class="a-panel-title">props received (recorded)</div><div class="a-col"><span class="an chip-a" data-k="pn" data-s="faint">Nav: …</span><span class="an chip-a" data-k="pm" data-s="faint">Main: …</span><span class="an chip-a" data-k="pf" data-s="faint">Footer: …</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>App</code><span>Same state, same place.</span></li><li><span class="anim-phase ph-render">render phase</span><code>avatar={&lt;img … /&gt;}</code><span><code>App</code> builds the avatar element itself, where <code>user</code> is, and hands <code>Nav</code> the finished element.</span></li><li><span class="anim-phase ph-render">render phase</span><code>sidebar={&lt;List …/&gt;} content={&lt;Details …/&gt;}</code><span>Two regions, two named element props. <code>Main</code> only decides where they go.</span></li><li><span class="anim-phase ph-render">render phase</span><code>&lt;Footer&gt;…&lt;/Footer&gt;</code><span>One region: plain <code>children</code>. Recorded: no layout component received any data.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The product page layout, both versions recorded.</figcaption></figure>

## The example: the product page

The page has a nav bar with the shopper's avatar, a main area with a product list and the selected product's details, and a footer greeting. `App` owns the user, the products and the selection.

### 1. Data drilled through the layout

```tsx
function AppDrilled() {
	const [user] = useState<User>({ name: 'Sam', avatar: '/logo.svg' })
	const [selected, setSelected] = useState<Product | null>(null)
	return (
		<>
			<NavDrilled user={user} />
			<MainDrilled products={products} selected={selected} onSelect={setSelected} />
			<FooterDrilled user={user} />
		</>
	)
}

function NavDrilled(p: { user: User }) {
	props('Nav', p)
	return <nav><img src={p.user.avatar} alt={`${p.user.name}'s profile`} /></nav>
}

function MainDrilled(p: { products: Product[]; selected: Product | null; onSelect: (p: Product) => void }) {
	props('Main', p)
	return (
		<main>
			<ProductList products={p.products} onSelect={p.onSelect} />
			<ProductDetails product={p.selected} />
		</main>
	)
}

function FooterDrilled(p: { user: User }) {
	props('Footer', p)
	return <footer>Happy shopping, {p.user.name}!</footer>
}
```

What each layout component received:

```text
Nav got: user
Main got: products, selected, onSelect
Footer got: user
```

`Nav` and `Footer` take the whole `user` to show an image and a name. `Main` takes three props it never reads, only passes on.

### 2. Elements built where the data is

```tsx
function AppComposed() {
	const [user] = useState<User>({ name: 'Sam', avatar: '/logo.svg' })
	const [selected, setSelected] = useState<Product | null>(null)
	return (
		<>
			<Nav avatar={<img src={user.avatar} alt={`${user.name}'s profile`} />} />
			<Main
				sidebar={<ProductList products={products} onSelect={setSelected} />}
				content={<ProductDetails product={selected} />}
			/>
			<Footer>Happy shopping, {user.name}!</Footer>
		</>
	)
}

function Nav(p: { avatar: ReactNode }) {
	props('Nav', p)
	return <nav>{p.avatar}</nav>
}

function Main(p: { sidebar: ReactNode; content: ReactNode }) {
	props('Main', p)
	return (
		<main>
			{p.sidebar}
			{p.content}
		</main>
	)
}

function Footer(p: { children: ReactNode }) {
	props('Footer', p)
	return <footer>{p.children}</footer>
}
```

```text
Nav got: avatar
Main got: sidebar, content
Footer got: children
```

None of the layout components sees `user`, the products or `setSelected` any more. Both versions behave the same (clicking Desk Lamp showed `Desk Lamp: $39.00` in each). What changed is the **dependencies**: if `User` gains a field, or the list needs a new prop, only `App` and the component that actually uses it change.

The components that really *use* the data, `ProductList` and `ProductDetails`, still take normal props. The pattern is for the components **in between**.

## How it works

- **A JSX element is just a value.** `<img … />` is an object you can store in a variable or pass as a prop ([Using JSX](../../fundamentals/using-jsx/)). The layout component renders it with `{avatar}`, wherever it wants.
- **`children` is the one-slot case.** `<Footer>Happy shopping</Footer>` is `Footer({ children: 'Happy shopping' })`. Use named element props (`sidebar`, `content`) only when there's more than one region.
- **State doesn't move.** `selected` still lives in `App`. Composition changes how the pieces that read it get to their place, not where it's stored.
- **A performance bonus:** an element passed in from above is the same object when only the layout component re-renders, so React can skip it. That's covered in the Performance module.

## Common mistakes

- **Reaching for context first.** Context is for values many unrelated components need (theme, user). If one piece of UI just needs to be *placed* somewhere, pass the element.
- **Turning every prop into an element prop.** A component that reads and branches on data (like `ProductDetails` checking whether a product is selected) should take the data.
- **Ten named slots.** If a layout takes so many element props that it's hard to read, look at [Compound Components](../../patterns/compound-components/) or [The Slots Pattern](../../patterns/slots/).

## Interview Q&A

<details class="qa"><summary>What is prop drilling, and why is it a problem?</summary>

Passing props through components that don't use them, just to reach a descendant. Every component in the chain then depends on data it doesn't care about, so changes to that data ripple through all of them. Recorded: `Main` received `products, selected, onSelect` and used none of them.

</details>

<details class="qa"><summary>How does composition fix it?</summary>

Build the element where the data lives and pass the element down. Layout components take `ReactNode` props (or `children`) and only decide where to render them. Recorded: `Nav` got `avatar`, `Main` got `sidebar, content`, `Footer` got `children`: no data at all.

</details>

<details class="qa"><summary>When do you use <code>children</code> vs named element props?</summary>

`children` when there's one region to fill. Named props like `sidebar` and `content` when a layout has several independent regions.

</details>

<details class="qa"><summary>Isn't this just context with extra steps?</summary>

No. Context shares a value with many components implicitly. Composition places a specific piece of UI. Reach for composition first: it adds no provider, no hook, and no extra re-renders.

</details>

<details class="qa"><summary>When does it stop paying off?</summary>

When a layout component's list of element props gets long and hard to follow. Then the pieces often belong together as compound components or slots.

</details>

## Related

- [Custom Components](../../fundamentals/custom-components/): props and `children`.
- [Compound Components](../../patterns/compound-components/) and [The Slots Pattern](../../patterns/slots/): composition with implicit wiring.
- [Context with use](../../apis/context-with-use/): the alternative for widely shared values.

## Sources

- Kent C. Dodds: [Prop drilling](https://kentcdodds.com/blog/prop-drilling), [One React mistake that's slowing you down](https://www.epicreact.dev/one-react-mistake-thats-slowing-you-down)
- react.dev: [Passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React Patterns* workshop; the example app and code here are this handbook's own.
