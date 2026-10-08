---
title: "Lifting State"
slug: "lifting-state"
module: "hooks"
order: 3
level: "must"
illus: "chain"
summary: "Move state up so siblings can share it, and back down (colocate) when only one component needs it."
source: "https://react.dev/learn/sharing-state-between-components"
---


## In one minute

Data in React flows down through props, so two sibling components can't share state directly. **Lifting state** moves the `useState` up to their closest common parent, which passes the value (and a way to change it) down to both. The opposite skill is **colocation**: once only one component needs a piece of state, move it back down into that component. Lower state means less code passing props around and fewer components re-rendering when it changes, but the state now lives only as long as that component does.

**You'll be able to:** decide where a piece of state belongs, and predict who re-renders when it changes.

<figure class="fig anim fig-hooks-lift-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Lifted to ProductGrid</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Colocated in Card</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click ♡ on Trail Backpack&quot;,&quot;say&quot;:&quot;The card calls &lt;code&gt;onToggle&lt;/code&gt;, a function from &lt;code&gt;ProductGrid&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;setFavorites([...f, \&quot;p3\&quot;])&quot;,&quot;say&quot;:&quot;The state lives in &lt;code&gt;ProductGrid&lt;/code&gt;, so that’s where the re-render starts.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;&quot;,&quot;grid&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;ProductGrid + every Card&quot;,&quot;say&quot;:&quot;Recorded: &lt;code&gt;ProductGrid&lt;/code&gt; and all six cards rendered. In return, the grid can &lt;b&gt;sort&lt;/b&gt; favorites first: the Backpack moved to the top.&quot;,&quot;set&quot;:{&quot;c1&quot;:&quot;run&quot;,&quot;c2&quot;:&quot;run&quot;,&quot;c3&quot;:&quot;run&quot;,&quot;c4&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;search “mug”, then clear&quot;,&quot;say&quot;:&quot;The Backpack is filtered out and comes back: it’s still ♥, because the grid that holds the state never unmounted.&quot;,&quot;set&quot;:{&quot;grid&quot;:&quot;ok&quot;,&quot;c1&quot;:&quot;&quot;,&quot;c2&quot;:&quot;&quot;,&quot;c3&quot;:&quot;ok&quot;,&quot;c4&quot;:&quot;&quot;}}]" data-intro="&lt;code&gt;favorites&lt;/code&gt; in the grid, passed to each card."><div class="anim-scn-title">Lifted to ProductGrid</div><div class="anim-stage"><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="search"><span class="node-label" data-k="search-label">Search</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="grid"><span class="node-label" data-k="grid-label">Grid · ♥ state</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c1"><span class="node-label" data-k="c1-label">p1</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c2"><span class="node-label" data-k="c2-label">p2</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c3"><span class="node-label" data-k="c3-label">p3</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c4"><span class="node-label" data-k="c4-label">p4–6</span></div></div></div></div></div></div></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click ♡ on Trail Backpack</code><span>The card calls <code>onToggle</code>, a function from <code>ProductGrid</code>.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>setFavorites([...f, "p3"])</code><span>The state lives in <code>ProductGrid</code>, so that’s where the re-render starts.</span></li><li><span class="anim-phase ph-render">render phase</span><code>ProductGrid + every Card</code><span>Recorded: <code>ProductGrid</code> and all six cards rendered. In return, the grid can <b>sort</b> favorites first: the Backpack moved to the top.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>search “mug”, then clear</code><span>The Backpack is filtered out and comes back: it’s still ♥, because the grid that holds the state never unmounted.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;click ♡ on Trail Backpack&quot;,&quot;say&quot;:&quot;The card owns its own &lt;code&gt;isFavorite&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;setIsFavorite(true)&quot;,&quot;say&quot;:&quot;The re-render starts at the card.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Card p3 only&quot;,&quot;say&quot;:&quot;Recorded: one line, &lt;code&gt;Card p3 renders&lt;/code&gt;. Less work, simpler props, but nothing above can sort by favorites.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;ok&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;search “mug”, then clear&quot;,&quot;say&quot;:&quot;Filtering unmounts the card and its state; when it comes back it’s ♡ again (recorded). Colocated state lives only as long as its component.&quot;,&quot;set&quot;:{&quot;c3&quot;:&quot;bad&quot;}}]" data-intro="Each card owns &lt;code&gt;isFavorite&lt;/code&gt;."><div class="anim-scn-title">Colocated in Card</div><div class="anim-stage"><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node comp sm" data-k="app"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="search"><span class="node-label" data-k="search-label">Search</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="grid"><span class="node-label" data-k="grid-label">Grid</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c1"><span class="node-label" data-k="c1-label">p1</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c2"><span class="node-label" data-k="c2-label">p2</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c3"><span class="node-label" data-k="c3-label">p3 · ♥ state</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="c4"><span class="node-label" data-k="c4-label">p4–6</span></div></div></div></div></div></div></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>click ♡ on Trail Backpack</code><span>The card owns its own <code>isFavorite</code>.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>setIsFavorite(true)</code><span>The re-render starts at the card.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Card p3 only</code><span>Recorded: one line, <code>Card p3 renders</code>. Less work, simpler props, but nothing above can sort by favorites.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>search “mug”, then clear</code><span>Filtering unmounts the card and its state; when it comes back it’s ♡ again (recorded). Colocated state lives only as long as its component.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="run"></i>component running</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>The same heart button with the state in two places (both recorded). Cards are labelled by product id: p3 is the Trail Backpack.</figcaption></figure>

## The example: search + favorites

The search box and the product grid are siblings, so the query lives in their parent:

```tsx
function App({ Grid }: { Grid: (props: { query: string }) => React.ReactNode }) {
	log('App renders')
	const [query, setQuery] = useState('')
	return (
		<>
			<Search query={query} setQuery={setQuery} />
			<Grid query={query} />
		</>
	)
}
```

Each product card has a ♡ button. Where should "is this a favorite" live?

### Lifted into the grid (so it can sort)

```tsx
function GridLifted({ query }: { query: string }) {
	log('  ProductGrid renders')
	const [favorites, setFavorites] = useState<string[]>([])
	const found = searchProducts(query).sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)))
	return (
		<ul>
			{found.map((p) => (
				<CardLifted
					key={p.id}
					product={p}
					isFavorite={favorites.includes(p.id)}
					onToggle={() => setFavorites((f) => (f.includes(p.id) ? f.filter((id) => id !== p.id) : [...f, p.id]))}
				/>
			))}
		</ul>
	)
}

function CardLifted({ product, isFavorite, onToggle }: { product: Product; isFavorite: boolean; onToggle: () => void }) {
	log(`  Card ${product.id} renders`)
	return (
		<li data-id={product.id}>
			{product.name}
			<button onClick={onToggle}>{isFavorite ? '♥' : '♡'}</button>
		</li>
	)
}
```

Clicking ♡ on the Trail Backpack, recorded:

```text
  ProductGrid renders
  Card p3 renders
  Card p1 renders
  Card p2 renders
  Card p4 renders
  Card p5 renders
  Card p6 renders
```

```js
[
  "Trail Backpack♥",
  "Ceramic Mug♡",
  "Wireless Headphones♡",
  "Desk Lamp♡",
  "Bluetooth Speaker♡",
  "Notebook Set♡"
]
```

The grid and all six cards re-rendered, but the grid could sort favorites first. Searching "mug" (which hides the Backpack) and clearing the search again:

```text
Trail Backpack♥
```

Still a favorite: the grid never unmounted.

### Colocated in each card (no sorting)

```tsx
function GridColocated({ query }: { query: string }) {
	log('  ProductGrid renders')
	return (
		<ul>
			{searchProducts(query).map((p) => (
				<CardColocated key={p.id} product={p} />
			))}
		</ul>
	)
}

function CardColocated({ product }: { product: Product }) {
	log(`  Card ${product.id} renders`)
	const [isFavorite, setIsFavorite] = useState(false)
	return (
		<li data-id={product.id}>
			{product.name}
			<button onClick={() => setIsFavorite(!isFavorite)}>{isFavorite ? '♥' : '♡'}</button>
		</li>
	)
}
```

```text
  Card p3 renders
```

One card re-rendered. After hiding and showing it with the search:

```text
Trail Backpack♡
```

The heart reset: the card unmounted when filtered out, and its state went with it.

## How it works

- **Re-renders start where the state lives.** `setFavorites` in the grid re-renders the grid and its children; `setIsFavorite` in a card re-renders that card. Lifting state up widens that circle; colocating narrows it.
- **Lift to the lowest common parent**, not higher. The query lives in `App` because both `Search` and `ProductGrid` need it; favorites didn't need to go to `App`.
- **Effects follow their state.** An effect that syncs a piece of state (like the `popstate` listener for the query) moves with it.
- **Colocation trades lifetime for simplicity.** If a value must survive its component being unmounted (filtered out, a tab switched), keep it higher, or outside React (URL, storage, server).

## Common mistakes

- Lifting everything to the top "just in case", which makes every change re-render the whole page.
- Leaving state lifted after the feature that needed it is gone.
- Duplicating state in parent and child instead of passing it down.

## Interview Q&A

<details class="qa"><summary>What does lifting state mean, and when do you need it?</summary>

Moving state to the closest common parent of the components that need it, then passing it down as props (plus a setter or callback). You need it when siblings must read or change the same value.

</details>

<details class="qa"><summary>Why did favorites have to live in the grid to sort by them?</summary>

Sorting compares every card's favorite status, and only a component that sees all of them can do that. A card can't sort a list it doesn't own.

</details>

<details class="qa"><summary>What is state colocation, and why does it help?</summary>

Keeping state in the lowest component that uses it. Fewer props, simpler parents, and fewer re-renders: recorded, a lifted favorite re-rendered the grid and six cards, a colocated one re-rendered a single card.

</details>

<details class="qa"><summary>What's the downside of colocating?</summary>

State disappears when its component unmounts. Recorded: the colocated Backpack lost its ♥ after being filtered out and back; the lifted one kept it.

</details>

## Related

- [Managing UI State](../../hooks/managing-ui-state/): derived state and controlled inputs.
- [React Re-rendering](../../hooks/react-re-rendering/): why children re-render with their parent.

## Sources

- react.dev: [Sharing state between components](https://react.dev/learn/sharing-state-between-components), [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- Kent C. Dodds, [State Colocation will make your React app faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- Topic order inspired by Kent C. Dodds' EpicReact *React Hooks* workshop; the example app and code here are this handbook's own.
