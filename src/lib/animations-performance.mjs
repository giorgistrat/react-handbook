// Animations for the React Performance module, in the "code + screen" style
// (src/lib/anim-code.mjs). Every outcome shown was recorded from
// examples/product-store (src/lessons/performance, scripts/record.mjs →
// generated/performance.json). Timings are from one machine.

import { codeAnim } from './anim-code.mjs'

// ─── Element optimization: does StoreFooter run when Page re-renders? ──────

export function elementSkipAnim() {
	const footer = `
function StoreFooter({ currency = 'USD', onSubscribe }) {
  log('render StoreFooter')
  return <footer>Prices in {currency} …</footer>
}
`
	const screen = [['qty', 'Quantity: 1', 'button']]
	const renders = ['Page', 'StoreFooter']
	const steps = (elementLine, check, skipped, say2, say3) => [
		{ phase: 'event', say: 'Click <b>Quantity</b>. The quantity is <code>Page</code>’s state, so <code>Page</code> runs again.', screen: { qty: 'Quantity: 2' }, rendered: { Page: 'ran' } },
		{ at: elementLine, phase: 'render', say: say2 },
		{ at: check, phase: 'render', say: say3, rendered: { Page: 'ran', StoreFooter: skipped ? 'skipped' : 'ran' } },
	]
	return codeAnim({
		id: 'perf-elements-anim',
		caption: 'A product page with a quantity counter, and a footer that has nothing to do with the quantity. Does the footer re-render? (All four versions recorded, two clicks each.)',
		file: 'ProductPage.tsx',
		screen,
		renders,
		scenarios: [
			{
				name: 'Inline',
				intro: '<code>&lt;StoreFooter /&gt;</code> written inside <code>Page</code>.',
				code: `${footer}
function Page() {
  const [qty, setQty] = useState(1)
  return (<>
    <QtyButton qty={qty} setQty={setQty} />
    <StoreFooter />
  </>)
}`,
				steps: steps('<StoreFooter />', "log('render StoreFooter')", false, 'JSX is a function call: every render builds a <b>new</b> element with a new, empty <code>props</code> object.', 'React compares an ordinary component’s props by identity: a new object means “may have changed”, so it calls <code>StoreFooter</code>. Recorded: the footer rendered on both clicks.'),
			},
			{
				name: 'Reused',
				intro: 'The element is created once, outside <code>Page</code>.',
				code: `${footer}
const footer = <StoreFooter /> // created once

function Page() {
  const [qty, setQty] = useState(1)
  return (<>
    <QtyButton qty={qty} setQty={setQty} />
    {footer}
  </>)
}`,
				steps: steps('{footer}', 'const footer = <StoreFooter />', true, '<code>Page</code> returns the hoisted <code>footer</code>: the <b>very same</b> object as last time.', 'Same element, same props object, so React <b>bails out</b> without calling <code>StoreFooter</code>. Recorded: only <code>Page</code> rendered. (Passing the element in from a parent that doesn’t re-render works the same way.)'),
			},
			{
				name: 'memo',
				intro: '<code>memo(StoreFooter)</code>, given a string prop.',
				code: `${footer}
const MemoFooter = memo(StoreFooter)

function Page() {
  const [qty, setQty] = useState(1)
  const [currency, setCurrency] = useState('USD')
  return (<>
    <QtyButton qty={qty} setQty={setQty} />
    <MemoFooter currency={currency} />
  </>)
}`,
				steps: steps('<MemoFooter currency={currency} />', 'const MemoFooter = memo(StoreFooter)', true, 'A new element, but <code>MemoFooter</code> is wrapped in <code>memo</code>…', '…so React compares the props <b>key by key</b> with <code>Object.is</code>: <code>"USD" === "USD"</code>. All equal, so it skips the footer. Recorded: only <code>Page</code>; and when the currency really changed, the footer rendered.'),
			},
			{
				name: 'memo + inline function',
				intro: 'The same <code>memo</code>, plus <code>onSubscribe={() =&gt; …}</code>.',
				code: `${footer}
const MemoFooter = memo(StoreFooter)

function Page() {
  const [qty, setQty] = useState(1)
  return (<>
    <QtyButton qty={qty} setQty={setQty} />
    <MemoFooter currency="USD"
      onSubscribe={() => log('subscribed')} />
  </>)
}`,
				steps: steps("onSubscribe={() => log('subscribed')} />", 'const MemoFooter = memo(StoreFooter)', false, 'The arrow function is created anew on every render.', '<code>currency</code> is equal, but <code>onSubscribe</code> isn’t: one unstable prop is enough. <code>memo</code> now costs a comparison <b>and</b> the render. Recorded: the footer rendered on both clicks.'),
			},
		],
	})
}

// ─── Optimize context: who renders for each technique ─────────────────────

export function contextOptAnim() {
	const consumers = `
const Footer = memo(function Footer() {
  const { color } = use(ThemeContext) // shows the color
})
const ColorPicker = memo(function ColorPicker() {
  const { setColor } = use(ThemeContext) // only sets it
})
`
	const screen = [
		['visits', 'Visits: 0', 'button'],
		['color', 'Purple theme', 'button'],
	]
	const renders = ['App', 'ThemeProvider', 'Main', 'ColorPicker (memo)', 'Footer (memo)']
	const steps = (count, color, says) => [
		{ phase: 'event', say: says[0], screen: { visits: 'Visits: 1' }, rendered: count },
		{ phase: 'event', say: says[1], screen: { color: 'Purple theme ✓' }, rendered: color },
	]
	const r = (names) => Object.fromEntries(['App', 'ThemeProvider', 'Main', 'ColorPicker', 'Footer'].map((n) => [n, names.includes(n) ? 'ran' : 'skipped']))
	return codeAnim({
		id: 'perf-context-anim',
		caption: 'The store theme in context: a memoized <code>Footer</code> shows the color, a memoized <code>ColorPicker</code> only sets it, and <code>Main</code> uses neither. Each version: one unrelated “Visits” click, then a theme change (all recorded).',
		file: 'Theme.tsx',
		screen,
		renders,
		scenarios: [
			{
				name: 'Inline value',
				intro: 'The value is written inline in <code>App</code>.',
				code: `
function App() {
  const [count, setCount] = useState(0)
  const [color, setColor] = useState('black')
  return <ThemeContext value={{ color, setColor }}>
    <VisitsButton … /><Main /><ColorPicker /><Footer />
  </ThemeContext>
}
${consumers}`,
				steps: steps(r(['App', 'Main', 'ColorPicker', 'Footer']), r(['App', 'Main', 'ColorPicker', 'Footer']), [
					'Visits click: <code>{ color, setColor }</code> is a new object on every <code>App</code> render, so both memoized consumers render for a click that has nothing to do with the theme.',
					'Theme change: everything renders, as expected for a real change.',
				]),
			},
			{
				name: 'useMemo value',
				intro: 'The value is memoized on <code>[color]</code>.',
				code: `
function App() {
  const [count, setCount] = useState(0)
  const [color, setColor] = useState('black')
  const value = useMemo(() => ({ color, setColor }), [color])
  return <ThemeContext value={value}>
    <VisitsButton … /><Main /><ColorPicker /><Footer />
  </ThemeContext>
}
${consumers}`,
				steps: steps(r(['App', 'Main']), r(['App', 'Main', 'ColorPicker', 'Footer']), [
					'Visits click: the same value object, so the consumers are left alone. <code>Main</code> still renders: it isn’t memoized and its parent rendered.',
					'Theme change: everyone renders, <code>App</code> and <code>Main</code> included, because the state lives in <code>App</code>.',
				]),
			},
			{
				name: 'Provider component',
				intro: 'A <code>ThemeProvider</code> owns the color and takes <code>children</code>.',
				code: `
function ThemeProvider({ children }) {
  const [color, setColor] = useState('black')
  const value = useMemo(() => ({ color, setColor }), [color])
  return <ThemeContext value={value}>{children}</ThemeContext>
}
function App() {
  const [count, setCount] = useState(0)
  return <ThemeProvider>
    <VisitsButton … /><Main /><ColorPicker /><Footer />
  </ThemeProvider>
}
${consumers}`,
				steps: steps(r(['App', 'ThemeProvider', 'Main']), r(['ThemeProvider', 'ColorPicker', 'Footer']), [
					'Visits click: <code>App</code> re-renders its provider element and <code>Main</code>, as before.',
					'Theme change: the state change now starts <b>inside</b> <code>ThemeProvider</code>. Its <code>children</code> are the same elements as before, so only the context readers render. <code>App</code> and <code>Main</code> don’t.',
				]),
			},
			{
				name: 'Split context',
				intro: 'One context for <code>color</code>, another for <code>setColor</code>.',
				code: `
function ThemeProvider({ children }) {
  const [color, setColor] = useState('black')
  return <SetColorContext value={setColor}>
    <ColorContext value={color}>{children}</ColorContext>
  </SetColorContext>
}
const Footer = memo(function Footer() {
  const color = use(ColorContext)
})
const ColorPicker = memo(function ColorPicker() {
  const setColor = use(SetColorContext) // never changes
})`,
				steps: steps(r(['App', 'ThemeProvider', 'Main']), r(['ThemeProvider', 'Footer']), [
					'Visits click: the same as before.',
					'Theme change: <code>ColorPicker</code> reads only the setter context, whose value (<code>setColor</code>) never changes, so it doesn’t render either. Only the <code>Footer</code>, which shows the color.',
				]),
			},
		],
	})
}

// ─── Concurrent rendering: an urgent render and a background one ──────────

export function deferredAnim() {
	const grid = `
function ProductGrid({ query }) {
  const results = catalog.filter(matches(query)).slice(0, 120)
  return results.map(p => <SlowCard key={p.id} product={p} />)
}
function SlowCard({ product }) {
  burn(1) // ~1 ms each: a stand-in for an expensive card
  return <li>{product.name}</li>
}
`
	const screen = [
		['input', '', 'input'],
		['frame', 'Next frame after the key: –', 'muted'],
	]
	return codeAnim({
		id: 'perf-deferred-anim',
		caption: 'A search box over a grid of 120 cards that take about 1 ms each. The recordings type “c”, “e”, “r” and measure how soon the browser could paint after each key (all three recorded).',
		file: 'Search.tsx',
		screen,
		renders: ['ProductGrid'],
		scenarios: [
			{
				name: 'Plain',
				intro: 'The grid gets <code>query</code> directly.',
				code: `${grid}
function Search() {
  const [query, setQuery] = useState('')
  return (<>
    <input value={query} onChange={e => setQuery(e.target.value)} />
    <ProductGrid query={query} />
  </>)
}`,
				steps: [
					{ at: 'onChange={e => setQuery(e.target.value)}', phase: 'event', say: 'Type “c”.' },
					{ at: '<ProductGrid query={query} />', phase: 'render', say: 'One synchronous render with the input <b>and</b> all 120 slow cards. Nothing can interrupt it.', rendered: { ProductGrid: 'ran (for "c")' } },
					{ phase: 'paint', say: 'Only now can the browser show the typed letter. Recorded: next frame after about 125–135 ms, on every key.', screen: { input: 'c', frame: ['Next frame after the key: ~130 ms', 'bad'] } },
				],
			},
			{
				name: 'Deferred, no memo',
				intro: '<code>useDeferredValue(query)</code>, but the grid isn’t memoized.',
				code: `${grid}
function Search() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  return (<>
    <input value={query} onChange={e => setQuery(e.target.value)} />
    <ProductGrid query={deferredQuery} />
  </>)
}`,
				steps: [
					{ at: 'onChange={e => setQuery(e.target.value)}', phase: 'event', say: 'Type “c”.' },
					{ at: 'const deferredQuery = useDeferredValue(query)', phase: 'render', say: 'In the urgent render, <code>deferredQuery</code> is still the <b>old</b> value, <code>""</code>.' },
					{ at: '<ProductGrid query={deferredQuery} />', phase: 'render', say: 'But <code>ProductGrid</code> isn’t memoized, so it renders anyway, all 120 slow cards, for a query it had already shown.', rendered: { ProductGrid: 'ran (for "", again)' } },
					{ phase: 'paint', say: 'Recorded: no better than plain, about 125 ms per key. Then the background render does the real work: the grid rendered <b>twice</b> per key.', screen: { input: 'c', frame: ['Next frame after the key: ~125 ms', 'bad'] }, rendered: { ProductGrid: 'ran (for "c")' } },
				],
			},
			{
				name: 'Deferred + memo',
				intro: 'The same, with <code>memo(ProductGrid)</code>.',
				code: `${grid}
const MemoGrid = memo(ProductGrid)

function Search() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  return (<>
    <input value={query} onChange={e => setQuery(e.target.value)} />
    <MemoGrid query={deferredQuery} />
  </>)
}`,
				steps: [
					{ at: 'onChange={e => setQuery(e.target.value)}', phase: 'event', say: 'Type “c”.' },
					{ at: ['const deferredQuery = useDeferredValue(query)', '<MemoGrid query={deferredQuery} />'], phase: 'render', say: 'The urgent render gives <code>MemoGrid</code> the same old <code>query</code>, so <code>memo</code> skips it. This render only updates the input.', rendered: { ProductGrid: 'skipped' } },
					{ phase: 'paint', say: 'Recorded: the next frame came within about one frame (~16 ms).', screen: { input: 'c', frame: ['Next frame after the key: ≤ 1 frame', 'ok'] } },
					{ at: '<MemoGrid query={deferredQuery} />', phase: 'render', say: 'Then the grid renders for “c” in the background, in small slices that let the browser handle the next key. If another key arrives, React drops this render and starts again with the newer value.', rendered: { ProductGrid: 'ran (background)' } },
				],
			},
		],
	})
}

// ─── Code splitting: when the size chart's code arrives ────────────────────

export function codeSplitAnim() {
	const screen = [
		['btn', 'Size chart', 'button'],
		['area', '(nothing)', 'box'],
	]
	return codeAnim({
		id: 'perf-split-anim',
		caption: 'A product page has a “Size chart” that few shoppers open. Its code takes 500 ms to download (all four versions recorded).',
		file: 'ProductPage.tsx',
		screen,
		scenarios: [
			{
				name: 'Static import',
				intro: 'An ordinary <code>import</code> at the top of the page.',
				code: `
import SizeChart from './size-chart' // part of the page's JS

function ProductPage() {
  const [show, setShow] = useState(false)
  return (<>
    <button onClick={() => setShow(true)}>Size chart</button>
    {show && <SizeChart />}
  </>)
}`,
				console: ['size-chart.tsx evaluated', 'page mounted', 'chart shown'],
				steps: [
					{ at: "import SizeChart from './size-chart'", phase: 'trigger', say: 'The chart’s code is downloaded and run <b>before the page even mounts</b>, though most shoppers never open it.', log: 'evaluated' },
					{ phase: 'commit', say: 'Then the page appears.', log: 'page mounted' },
					{ at: '{show && <SizeChart />}', phase: 'commit', say: 'Clicking is instant: the code is already there.', screen: { area: ['Size chart: S · M · L', 'ok'] }, log: 'chart shown' },
				],
			},
			{
				name: 'lazy',
				intro: '<code>lazy</code> plus <code>Suspense</code>.',
				code: `
const SizeChart = lazy(() => import('./size-chart'))

function ProductPage() {
  const [show, setShow] = useState(false)
  return (<>
    <button onClick={() => setShow(true)}>Size chart</button>
    <Suspense fallback={<p>Loading size chart…</p>}>
      {show && <SizeChart />}
    </Suspense>
  </>)
}`,
				console: ['page mounted', 'import() called', 'fallback shown', 'size-chart.tsx evaluated', 'chart shown'],
				steps: [
					{ phase: 'commit', say: 'The page mounts without the chart’s code.', log: 'page mounted' },
					{ at: ['onClick={() => setShow(true)}', "lazy(() => import('./size-chart'))"], phase: 'event', say: 'Click. The first render of <code>SizeChart</code> calls the loader…', log: 'import() called' },
					{ at: '<Suspense fallback=', phase: 'commit', say: '…and suspends, so the nearest <code>Suspense</code> shows its fallback while the code downloads.', screen: { area: ['Loading size chart…', 'upd'] }, log: 'fallback shown' },
					{ phase: 'commit', say: '500 ms later the module arrives; React retries and shows the chart.', screen: { area: ['Size chart: S · M · L', 'ok'] }, log: ['evaluated', 'chart shown'] },
				],
			},
			{
				name: 'Prefetch on hover',
				intro: 'The same loader also runs on hover and focus.',
				code: `
const loadSizeChart = () => import('./size-chart')
const SizeChart = lazy(loadSizeChart)

<button onMouseEnter={loadSizeChart} onFocus={loadSizeChart}
  onClick={() => setShow(true)}>Size chart</button>
<Suspense fallback={<p>Loading size chart…</p>}>
  {show && <SizeChart />}
</Suspense>`,
				console: ['import() called (hover)', 'size-chart.tsx evaluated', 'import() called (focus, lazy)', 'fallback shown', 'chart shown'],
				steps: [
					{ at: 'onMouseEnter={loadSizeChart}', phase: 'event', say: 'Hovering the button starts the download early.', log: '(hover)' },
					{ phase: 'trigger', say: 'The code is ready before the click.', log: 'evaluated' },
					{ at: 'onClick={() => setShow(true)}', phase: 'event', say: 'The click calls <code>import()</code> again (focus, then <code>lazy</code>’s first render). No new download: modules are cached by URL.', log: '(focus, lazy)' },
					{ at: '<Suspense fallback=', phase: 'commit', say: 'But the fallback <b>still</b> appeared: an <code>import()</code> promise never resolves synchronously, so <code>lazy</code>’s first render suspends anyway.', screen: { area: ['Loading size chart… (briefly)', 'bad'] }, log: 'fallback shown' },
					{ phase: 'commit', say: 'The chart replaces it moments later.', screen: { area: ['Size chart: S · M · L', 'ok'] }, log: 'chart shown' },
				],
			},
			{
				name: 'Transition',
				intro: 'The click is wrapped in <code>startTransition</code>.',
				code: `
const [isPending, startTransition] = useTransition()

<button onMouseEnter={loadSizeChart}
  onClick={() => startTransition(() => setShow(true))}>
  Size chart {isPending && '⏳'}
</button>
<Suspense fallback={<p>Loading size chart…</p>}>
  {show && <SizeChart />}
</Suspense>`,
				console: ['import() called', 'pending ⏳ shown', 'size-chart.tsx evaluated', 'chart shown'],
				steps: [
					{ at: 'startTransition(() => setShow(true))', phase: 'event', say: 'Click (the hover started the download a moment before).', log: 'import() called' },
					{ at: "Size chart {isPending && '⏳'}", phase: 'commit', say: 'A transition that suspends keeps the <b>current</b> screen instead of showing a fallback. <code>isPending</code> shows a small ⏳ in the button.', screen: { btn: ['Size chart ⏳', 'upd'] }, log: 'pending' },
					{ phase: 'commit', say: 'The code arrives, and the chart replaces the old screen in one step. Recorded: no “Loading size chart…” at all.', screen: { btn: 'Size chart', area: ['Size chart: S · M · L', 'ok'] }, log: ['evaluated', 'chart shown'] },
				],
			},
		],
	})
}

// ─── Expensive calculations: main thread vs worker ────────────────────────

export function workerAnim() {
	const screen = [
		['input', '', 'input'],
		['frame', 'Next frame after the key: –', 'muted'],
		['results', 'Results: (all products)', 'box'],
	]
	return codeAnim({
		id: 'perf-worker-anim',
		caption: 'A search across 150,000 products: every product is scored and sorted. Typing “l” (both versions recorded).',
		file: 'Search.tsx',
		screen,
		scenarios: [
			{
				name: 'Main thread',
				intro: 'The search runs during render (with or without <code>useMemo</code>: the query changed).',
				code: `
function Search() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => rankProducts(query), [query])
  return (<>
    <input value={query} onChange={e => setQuery(e.target.value)} />
    <Results names={results} />
  </>)
}`,
				steps: [
					{ at: 'onChange={e => setQuery(e.target.value)}', phase: 'event', say: 'Type “l”.' },
					{ at: 'const results = useMemo(() => rankProducts(query), [query])', phase: 'render', say: 'The query changed, so <code>useMemo</code> runs the search, on the main thread. Recorded: about 55 ms for “l”. (<code>useMemo</code> only helped for the unrelated “Refresh prices” click.)' },
					{ phase: 'paint', say: 'The input can’t show the letter until the search is done.', screen: { input: 'l', frame: ['Next frame after the key: ~58 ms', 'bad'], results: 'Results: Desk Lamp 1, Desk Lamp 10, …' } },
				],
			},
			{
				name: 'Web Worker',
				intro: 'The search runs in a worker; the result is a promise read with <code>use</code>.',
				code: `
// search.worker.ts
self.onmessage = e =>
  self.postMessage({ id: e.data.id, results: rankProducts(e.data.query) })

function Search() {
  const [query, setQuery] = useState('')
  const [promise, setPromise] = useState(() => searchInWorker(''))
  function handleChange(q) {
    setQuery(q) // urgent
    startTransition(() => setPromise(searchInWorker(q)))
  }
  return (<>
    <input value={query} onChange={e => handleChange(e.target.value)} />
    <Suspense fallback="Searching…"><Results names={use(promise)} /></Suspense>
  </>)
}`,
				steps: [
					{ at: 'setQuery(q) // urgent', phase: 'event', say: 'Type “l”. The input’s state is updated as an urgent update.' },
					{ at: 'startTransition(() => setPromise(searchInWorker(q)))', phase: 'event', say: 'The search is sent to the worker (a message, almost free), and the new promise goes into state inside a transition.' },
					{ phase: 'paint', say: 'Recorded: the next frame came within about one frame on every key. The main thread was free.', screen: { input: 'l', frame: ['Next frame after the key: ≤ 1 frame', 'ok'] } },
					{ at: ['rankProducts(e.data.query)', '<Results names={use(promise)} />'], phase: 'render', say: 'Meanwhile the worker ranks the products on its own thread. When it replies, the transition finishes and the results appear; until then the old results stay on screen.', screen: { results: ['Results: Desk Lamp 1, Desk Lamp 10, …', 'ok'] } },
				],
			},
		],
	})
}

// ─── Optimize rendering: ListItem renders per hover ────────────────────────

export function listMemoAnim() {
	const list = (item) => `
function ProductList() {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  return products.map((p, i) => (
    ${item}
  ))
}`
	const screen = [
		['rows', 'Rows 4–7: Desk Lamp 1 · Bluetooth … (row 5 highlighted)', 'box'],
		['count', 'ListItem renders on this hover: –', 'muted'],
	]
	return codeAnim({
		id: 'perf-list-anim',
		caption: 'A list of 500 products. Hovering highlights a row. The mouse moves from row 5 to row 6 (all four versions recorded).',
		file: 'ProductList.tsx',
		screen,
		scenarios: [
			{
				name: 'Plain',
				intro: 'No <code>memo</code>.',
				code: `${list('<ListItem key={p.id} product={p} index={i}\n      highlightedIndex={highlightedIndex}\n      onHover={setHighlightedIndex} />')}`,
				steps: [
					{ at: 'onHover={setHighlightedIndex}', phase: 'event', say: 'The mouse moves to row 6: <code>setHighlightedIndex(6)</code>.' },
					{ at: 'const [highlightedIndex', phase: 'render', say: 'The list re-renders, so every row does.', screen: { count: ['ListItem renders on this hover: 500', 'bad'] } },
				],
			},
			{
				name: 'memo',
				intro: '<code>memo(ListItem)</code>.',
				code: `const ListItem = memo(Row)\n${list('<ListItem key={p.id} product={p} index={i}\n      highlightedIndex={highlightedIndex}\n      onHover={setHighlightedIndex} />')}`,
				steps: [
					{ at: 'const ListItem = memo(Row)', say: 'For an unrelated update (“Refresh”), <code>memo</code> works: every prop is the same. Recorded: 0 row renders.' },
					{ at: 'onHover={setHighlightedIndex}', phase: 'event', say: 'The mouse moves to row 6.' },
					{ at: 'highlightedIndex={highlightedIndex}', phase: 'render', say: 'But <b>every</b> row receives <code>highlightedIndex</code>, which changed from 5 to 6, so every row fails the comparison.', screen: { count: ['ListItem renders on this hover: 500', 'bad'] } },
				],
			},
			{
				name: 'Custom comparator',
				intro: '<code>memo(Row, arePropsEqual)</code>.',
				code: `const ListItem = memo(Row, (prev, next) =>
  (prev.index === prev.highlightedIndex) ===
  (next.index === next.highlightedIndex))
${list('<ListItem key={p.id} product={p} index={i}\n      highlightedIndex={highlightedIndex}\n      onHover={setHighlightedIndex} />')}`,
				steps: [
					{ at: 'onHover={setHighlightedIndex}', phase: 'event', say: 'The mouse moves to row 6.' },
					{ at: ['(prev.index === prev.highlightedIndex) ===', '(next.index === next.highlightedIndex))'], phase: 'render', say: 'The comparator asks what the row <b>shows</b>: “was I highlighted, am I now?” Only rows 5 and 6 change their answer.', screen: { count: ['ListItem renders on this hover: 2', 'ok'], rows: 'Rows 4–7: … (row 6 highlighted)' } },
				],
			},
			{
				name: 'Primitive props',
				intro: 'The list passes an <code>isHighlighted</code> boolean.',
				code: `const ListItem = memo(Row)\n${list('<ListItem key={p.id} product={p} index={i}\n      isHighlighted={i === highlightedIndex}\n      onHover={setHighlightedIndex} />')}`,
				steps: [
					{ at: 'onHover={setHighlightedIndex}', phase: 'event', say: 'The mouse moves to row 6.' },
					{ at: 'isHighlighted={i === highlightedIndex}', phase: 'render', say: 'The comparison moves into the parent: each row gets a boolean, and only two booleans changed. Plain <code>memo</code> does the rest, with no custom code to keep in sync.', screen: { count: ['ListItem renders on this hover: 2', 'ok'], rows: 'Rows 4–7: … (row 6 highlighted)' } },
				],
			},
		],
	})
}

// ─── Windowing: render only what's visible ─────────────────────────────────

export function windowingAnim() {
	const screen = [
		['dom', '&lt;li&gt; in the DOM: –', 'muted'],
		['time', 'Render time (Profiler): –', 'muted'],
		['view', 'Visible: rows 0–12', 'box'],
	]
	return codeAnim({
		id: 'perf-windowing-anim',
		caption: 'The whole catalog, 10,000 products, in one 300 px scrolling list. Timings from React’s &lt;Profiler&gt; (both versions recorded).',
		file: 'Catalog.tsx',
		screen,
		scenarios: [
			{
				name: 'Render everything',
				intro: '<code>products.map(…)</code>.',
				code: `
function ListAll() {
  return (
    <div className="scroller">
      <ul>
        {products.map(p => <li key={p.id}>{p.name}</li>)}
      </ul>
    </div>
  )
}`,
				steps: [
					{ at: 'products.map(p =>', phase: 'render', say: 'React creates 10,000 elements and 10,000 DOM nodes, though only 13 fit in the box.', screen: { dom: ['&lt;li&gt; in the DOM: 10,000', 'bad'], time: ['Render time (Profiler): mount ~75 ms', 'bad'] } },
					{ at: 'products.map(p =>', phase: 'render', say: 'Every re-render of the list (the “Refresh” button) repeats the work for all 10,000 rows.', screen: { time: ['Render time (Profiler): update ~75 ms', 'bad'] } },
				],
			},
			{
				name: 'useVirtualizer',
				intro: '<code>@tanstack/react-virtual</code>, 24 px rows, overscan 5.',
				code: `
function ListVirtual() {
  const scrollerRef = useRef(null)
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => 24,
    overscan: 5,
  })
  return (
    <div ref={scrollerRef} className="scroller">
      <ul style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(row => (
          <li key={row.key}
            style={{ transform: \`translateY(\${row.start}px)\` }}>
            {products[row.index].name}
          </li>
        ))}
      </ul>
    </div>
  )
}`,
				steps: [
					{ at: ['const virtualizer = useVirtualizer({', 'estimateSize: () => 24,'], phase: 'render', say: 'From the scroll position, the box height and the row size, the virtualizer works out which rows are visible, plus 5 extra.' },
					{ at: 'height: virtualizer.getTotalSize()', phase: 'render', say: 'A tall inner element (10,000 × 24 px) keeps the scrollbar the same as with the full list.' },
					{ at: 'virtualizer.getVirtualItems().map', phase: 'commit', say: 'Only those rows are rendered. Recorded: 18 rows in the DOM, mounted in about 2 ms.', screen: { dom: ['&lt;li&gt; in the DOM: 18', 'ok'], time: ['Render time (Profiler): mount ~2 ms', 'ok'] } },
					{ at: 'translateY(${row.start}px)', phase: 'event', say: 'Scroll to row 5,000: rows that leave the window unmount, new ones mount, each placed with <code>translateY</code>. Recorded: 23 rows in the DOM, and the same first visible product as the full list.', screen: { dom: ['&lt;li&gt; in the DOM: 23', 'ok'], view: ['Visible: rows 5,000–5,012', 'upd'] } },
				],
			},
		],
	})
}
