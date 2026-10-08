// Animations for the React Performance module. Every outcome shown was
// recorded from examples/product-store (src/lessons/performance,
// scripts/record.mjs → generated/performance.json).

import { anim, chip, tree, panel } from './anim.mjs'

const lt = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const logLine = (k, text, s = 'ghost') => `<div class="an" data-k="${k}" data-s="${s}">${lt(text)}</div>`

// ─── Element optimization: does StoreFooter run when Page re-renders? ──────

export function elementSkipAnim() {
	const scene = `<div class="a-cols">
		${panel('click “Quantity”', `<div class="a-col">${chip('page', 'Page re-renders', 'faint')}</div>`)}
		${panel('React’s check', `<div class="a-col">${chip('el', 'the StoreFooter element', 'faint')}${chip('chk', 'compare…', 'ghost')}</div>`, 'wide')}
		${panel('StoreFooter (recorded)', `<div class="a-col">${chip('ft', '?', 'faint')}</div>`)}
	</div>`
	const go = (el, chk, ok, say, result) => [
		{ phase: 'schedule', fn: 'setQty(qty + 1)', say: 'The quantity is <code>Page</code>’s state, so <code>Page</code> runs again.', set: { page: 'run' } },
		{ phase: 'render', fn: el, say, set: { el: ok ? 'keep' : 'new' }, txt: { el: ok ? 'same element as last time' : 'a new element object' } },
		{ phase: 'render', fn: chk, say: ok ? 'Same props object (or every prop <code>Object.is</code>-equal), so React <b>bails out</b> and reuses last time’s result.' : 'A different props object (or a prop that isn’t <code>Object.is</code>-equal), so React has to call the component.', set: { chk: ok ? 'ok' : 'bad', ft: ok ? 'skip' : 'run' }, txt: { chk: chk, ft: result } },
	]
	return anim({
		id: 'perf-elements-anim',
		caption: 'Two clicks on “Quantity”; the footer doesn’t use the quantity (all versions recorded).',
		scenarios: [
			{ name: 'Inline', intro: '<code>&lt;StoreFooter /&gt;</code> written inside <code>Page</code>.', scene, steps: go('<StoreFooter /> → jsx(StoreFooter, {})', 'oldProps !== newProps', false, 'JSX is a function call: every render builds a new element with a new <code>props</code> object, even if it’s empty.', 'rendered on both clicks') },
			{ name: 'Reused', intro: 'The element is created once, outside <code>Page</code>.', scene, steps: go('{footer}', 'oldProps === newProps', true, 'The hoisted <code>footer</code> constant is the very same object every render. (Passing it in as a prop from a parent that doesn’t re-render works the same way.)', 'skipped (0 renders)') },
			{ name: 'memo', intro: '<code>memo(StoreFooter)</code> with <code>currency="USD"</code>.', scene, steps: go('<MemoFooter currency={currency} />', 'shallowEqual: currency "USD" === "USD"', true, 'A new element, but <code>memo</code> compares the props <b>key by key</b> with <code>Object.is</code> instead of comparing the object.', 'skipped (0 renders)') },
			{ name: 'memo + inline fn', intro: 'The same <code>memo</code>, plus <code>onSubscribe={() =&gt; …}</code>.', scene, steps: go('<MemoFooter onSubscribe={() => …} />', 'shallowEqual: onSubscribe !== onSubscribe', false, 'The arrow function is created anew every render. One unstable prop is enough to make <code>memo</code> pure overhead.', 'rendered on both clicks') },
		],
	})
}

// ─── Optimize context: who renders for each technique ─────────────────────

export function contextOptAnim() {
	const t = `<div class="t-compact">${tree([
		'app', 'App', { cls: 'comp sm' }, [
			['prov', 'Provider', { cls: 'comp sm' }, [
				['main', 'Main', { cls: 'comp sm' }],
				['pick', 'Picker', { cls: 'comp sm' }],
				['foot', 'Footer', { cls: 'comp sm' }],
			]],
		],
	])}</div>`
	const scene = `<div class="a-cols">${panel('component tree', t, 'wide')}${panel('rendered (recorded)', `<div class="a-col">${chip('res', '–', 'ghost')}</div>`)}</div>`
	const all = ['app', 'prov', 'main', 'pick', 'foot']
	const mark = (who) => Object.fromEntries(all.map((k) => [k, who.includes(k) ? 'run' : 'skip']))
	const sc = (count, color, notes) => [
		{ phase: 'event', fn: 'click “Visits”', say: notes[0], set: mark(count), txt: { res: `${count.length} components` } },
		{ phase: 'event', fn: 'click “Purple theme”', say: notes[1], set: mark(color), txt: { res: `${color.length} components` } },
	]
	return anim({
		id: 'perf-context-anim',
		caption: 'An unrelated counter click, then a theme change, for each technique (all recorded). Picker = <code>memo(ColorPicker)</code>, Footer = <code>memo(Footer)</code>, both reading the theme context.',
		scenarios: [
			{ name: 'Inline value', intro: '<code>value={{ color, setColor }}</code> in <code>App</code>.', scene, steps: sc(['app', 'prov', 'main', 'pick', 'foot'], ['app', 'prov', 'main', 'pick', 'foot'], ['A new value object on every <code>App</code> render, so both memoized consumers render for a click that has nothing to do with the theme.', 'Everything renders, as expected for a real change.']) },
			{ name: 'useMemo value', intro: 'The value memoized on <code>[color]</code>.', scene, steps: sc(['app', 'prov', 'main'], ['app', 'prov', 'main', 'pick', 'foot'], ['Same value object, so the consumers are left alone. <code>Main</code> still renders: it isn’t memoized and its parent rendered.', 'A real change: everyone renders, including <code>App</code> and <code>Main</code>, because the state lives in <code>App</code>.']) },
			{ name: 'Provider component', intro: 'A <code>ThemeProvider</code> owns the color and takes <code>children</code>.', scene, steps: sc(['app', 'prov', 'main'], ['prov', 'pick', 'foot'], ['The counter still re-renders <code>App</code>, its provider element and <code>Main</code>.', 'Now the state change starts <b>inside</b> the provider. Its <code>children</code> are the same elements as before, so only the consumers render. <code>App</code> and <code>Main</code> don’t.']) },
			{ name: 'Split context', intro: 'One context for <code>color</code>, one for <code>setColor</code>.', scene, steps: sc(['app', 'prov', 'main'], ['prov', 'foot'], ['Same as before.', 'The picker only reads the setter context, whose value (<code>setColor</code>) never changes, so it doesn’t render either. Only the footer, which shows the color.']) },
		],
	})
}

// ─── Concurrent rendering: an urgent render and a background one ──────────

export function deferredAnim() {
	const mk = () => `<div class="a-cols">
		${panel('keystroke “c”', `<div class="a-col">${chip('inp', 'input shows: ""', 'faint')}</div>`)}
		${panel('renders', `<div class="a-col">${chip('r1', 'render 1', 'ghost')}${chip('r2', 'render 2', 'ghost')}</div>`, 'wide')}
		${panel('next frame (recorded)', `<div class="a-col">${chip('fr', '?', 'faint')}</div>`)}
	</div>`
	return anim({
		id: 'perf-deferred-anim',
		caption: 'Typing “c” over a grid of 120 cards that take ~1 ms each (all three recorded).',
		scenarios: [
			{
				name: 'Plain', intro: 'The grid gets <code>query</code> directly.', scene: mk(), steps: [
					{ phase: 'render', fn: 'render 1: query "c", grid for "c"', say: 'One synchronous render with the input <b>and</b> the 120 slow cards. Nothing can interrupt it.', set: { r1: 'bad' }, txt: { r1: 'input + grid: ~125 ms, blocking' } },
					{ phase: 'paint', fn: 'paint', say: 'Only now can the browser show the typed letter.', set: { inp: 'upd', fr: 'bad' }, txt: { inp: 'input shows: "c"', fr: '~130 ms' } },
				],
			},
			{
				name: 'Deferred, no memo', intro: '<code>useDeferredValue(query)</code>, but the grid isn’t memoized.', scene: mk(), steps: [
					{ phase: 'render', fn: 'render 1: query "c", deferred ""', say: 'The urgent render passes the <b>old</b> value to the grid. But the grid isn’t memoized, so it renders anyway, all 120 cards, for the old query.', set: { r1: 'bad' }, txt: { r1: 'grid for "" (again!): ~125 ms' } },
					{ phase: 'paint', fn: 'paint', say: 'Recorded: no better than plain.', set: { inp: 'upd', fr: 'bad' }, txt: { inp: 'input shows: "c"', fr: '~125 ms' } },
					{ phase: 'render', fn: 'render 2: deferred "c"', say: 'Then the background render does the real work. The grid rendered twice per keystroke.', set: { r2: 'upd' }, txt: { r2: 'grid for "c" (background)' } },
				],
			},
			{
				name: 'Deferred + memo', intro: 'The same, with <code>memo(ProductGrid)</code>.', scene: mk(), steps: [
					{ phase: 'render', fn: 'render 1: query "c", deferred ""', say: 'The grid gets the same <code>query</code> prop as last time, so <code>memo</code> skips it. This render only updates the input.', set: { r1: 'ok' }, txt: { r1: 'input only: fast' } },
					{ phase: 'paint', fn: 'paint', say: 'Recorded: the next frame came within about one frame (~16 ms).', set: { inp: 'upd', fr: 'ok' }, txt: { inp: 'input shows: "c"', fr: '≤ 1 frame' } },
					{ phase: 'render', fn: 'render 2: deferred "c" (interruptible)', say: 'The slow grid renders in the background, yielding to the browser between pieces of work. If another key arrives, React drops this render and starts again with the newer value.', set: { r2: 'upd' }, txt: { r2: 'grid for "c", in chunks' } },
				],
			},
		],
	})
}

// ─── Code splitting: when the size chart's code arrives ────────────────────

export function codeSplitAnim() {
	const mk = (rows) => `<div class="a-cols">
		${panel('recorded order', `<div class="a-log">${rows.map(([k, t]) => logLine(k, t)).join('')}</div>`, 'wide')}
	</div>`
	const steps = (rows, says) => rows.map(([k], i) => ({ phase: says[i][0], fn: rows[i][1], say: says[i][1], set: { [k]: says[i][2] ?? 'new' } }))
	const sc = (name, intro, rows, says) => ({ name, intro, scene: mk(rows), steps: steps(rows, says) })
	return anim({
		id: 'perf-split-anim',
		caption: 'Opening the size chart; its code takes 500 ms to download (all recorded).',
		scenarios: [
			sc('Static import', 'An ordinary <code>import</code> at the top of the page.', [['a', 'size-chart.tsx evaluated'], ['b', 'page mounted'], ['c', 'chart shown']], [
				['trigger', 'The chart’s code is downloaded and run <b>before the page even mounts</b>, though most shoppers never open it.', 'bad'],
				['commit', 'The page appears after the extra code.'],
				['commit', 'Clicking is instant: the code is already there.', 'ok'],
			]),
			sc('lazy', '<code>lazy(() =&gt; import(\'./size-chart\'))</code> in <code>Suspense</code>.', [['a', 'page mounted'], ['b', 'import() called'], ['c', 'fallback shown'], ['d', 'size-chart.tsx evaluated'], ['e', 'chart shown']], [
				['commit', 'The page mounts without the chart’s code.', 'ok'],
				['event', 'The first render of <code>SizeChart</code> calls the loader…'],
				['commit', '…and suspends, so the nearest <code>Suspense</code> shows its fallback while the code downloads.', 'upd'],
				['trigger', '500 ms later the module arrives.'],
				['commit', 'React retries and shows the chart.', 'ok'],
			]),
			sc('Prefetch on hover', 'The same loader also runs on <code>mouseenter</code>/<code>focus</code>.', [['a', 'page mounted'], ['b', 'import() called (hover)'], ['c', 'size-chart.tsx evaluated'], ['d', 'import() called (×2)'], ['e', 'fallback shown'], ['f', 'chart shown']], [
				['commit', 'Same start.', 'ok'],
				['event', 'Hovering the button starts the download early.'],
				['trigger', 'The code is ready before the click. Later <code>import()</code> calls reuse the same module.', 'ok'],
				['event', 'The click (focus, then <code>lazy</code>’s own first render) calls <code>import()</code> again: no new download.'],
				['commit', 'But the fallback <b>still</b> appeared: an <code>import()</code> promise can’t resolve synchronously, so <code>lazy</code>’s first render suspends anyway.', 'bad'],
				['commit', 'The chart replaces it moments later.', 'ok'],
			]),
			sc('Transition', 'The click wrapped in <code>startTransition</code>.', [['a', 'page mounted'], ['b', 'import() called'], ['c', 'pending ⏳ shown'], ['d', 'size-chart.tsx evaluated'], ['e', 'chart shown']], [
				['commit', 'Same start.', 'ok'],
				['event', 'Click (the hover started the download just before).'],
				['commit', 'A transition that suspends keeps the <b>current</b> screen instead of a fallback. <code>isPending</code> shows a small ⏳ in the button.', 'ok'],
				['trigger', 'The code arrives.'],
				['commit', 'Recorded: no “Loading size chart…” at all, the chart replaces the old screen in one step.', 'ok'],
			]),
		],
	})
}

// ─── Expensive calculations: main thread vs worker ────────────────────────

export function workerAnim() {
	const mk = () => `<div class="a-cols">
		${panel('main thread', `<div class="a-col">${chip('m1', 'keystroke “l”', 'faint')}${chip('m2', '…', 'ghost')}${chip('m3', 'next frame', 'ghost')}</div>`, 'wide')}
		${panel('worker thread', `<div class="a-col">${chip('w1', 'idle', 'faint')}</div>`)}
	</div>`
	return anim({
		id: 'perf-worker-anim',
		caption: 'Typing “l” into a search over 150,000 products (both recorded).',
		scenarios: [
			{
				name: 'Main thread', intro: '<code>rankProducts(query)</code> during render (with or without <code>useMemo</code>: the query changed).', scene: mk(), steps: [
					{ phase: 'render', fn: 'rankProducts("l")', say: 'The search runs during render, on the main thread. Recorded: 55 ms.', set: { m1: 'hl', m2: 'bad' }, txt: { m2: 'ranking 150,000 products: ~55 ms' } },
					{ phase: 'paint', fn: 'paint', say: 'The input can’t show the letter until it’s done. <code>useMemo</code> only helps when the query <b>didn’t</b> change (the “Refresh prices” click).', set: { m1: '', m3: 'bad' }, txt: { m3: 'next frame after ~58 ms' } },
				],
			},
			{
				name: 'Web Worker', intro: 'The search runs in a worker; the result is a promise read with <code>use</code>.', scene: mk(), steps: [
					{ phase: 'event', fn: 'setQuery("l")', say: 'An urgent update: the input will show the letter.', set: { m1: 'hl' } },
					{ phase: 'event', fn: 'worker.postMessage({ id, query })', say: 'The search is sent to the worker, inside <code>startTransition</code>, as a new promise in state.', set: { m2: 'ok', w1: 'run' }, txt: { m2: 'post a message: ~0 ms', w1: 'ranking 150,000 products' } },
					{ phase: 'paint', fn: 'paint', say: 'Recorded: the next frame came within about one frame on every keystroke. The main thread was free.', set: { m1: '', m3: 'ok' }, txt: { m3: 'next frame: ≤ 1 frame' } },
					{ phase: 'render', fn: 'use(promise)', say: 'When the worker replies, the transition finishes and the results appear. While it waits, the old results stay on screen, dimmed by <code>isPending</code>.', set: { w1: 'done' }, txt: { w1: 'done, results posted back' } },
				],
			},
		],
	})
}

// ─── Optimize rendering: ListItem renders per hover ────────────────────────

export function listMemoAnim() {
	const rows = (n) => Array.from({ length: n }, (_, i) => chip(`r${i}`, `row ${i + 4}`, 'faint')).join('')
	const scene = `<div class="a-cols">${panel('500 rows (4 shown)', `<div class="a-col">${rows(4)}</div>`)}${panel('props compared', `<div class="a-col">${chip('cmp', '–', 'ghost')}</div>`, 'wide')}${panel('ListItem renders (recorded)', `<div class="a-col">${chip('cnt', '–', 'faint')}</div>`)}</div>`
	const all = { r0: 'run', r1: 'run', r2: 'run', r3: 'run' }
	return anim({
		id: 'perf-list-anim',
		caption: 'Hovering row 6 after row 5 (all four versions recorded).',
		scenarios: [
			{ name: 'Plain', intro: 'No <code>memo</code>.', scene, steps: [{ phase: 'render', fn: 'setHighlightedIndex(6)', say: 'The list re-renders, so every row does.', set: all, txt: { cnt: '500', cmp: 'nothing: plain components' } }] },
			{ name: 'memo', intro: '<code>memo(ListItem)</code>.', scene, steps: [
				{ phase: 'render', fn: 'Refresh', say: 'For an unrelated update, <code>memo</code> works: every prop is the same. Recorded: 0 renders.', set: {}, txt: { cmp: 'all props equal', cnt: 'Refresh: 0' } },
				{ phase: 'render', fn: 'setHighlightedIndex(6)', say: 'But every row receives <code>highlightedIndex</code>, which changed from 5 to 6, so every row fails the comparison.', set: { ...all, cmp: 'bad' }, txt: { cmp: 'highlightedIndex: 5 → 6 (every row)', cnt: 'hover: 500' } },
			] },
			{ name: 'Custom comparator', intro: '<code>memo(ListItem, arePropsEqual)</code>.', scene, steps: [
				{ phase: 'render', fn: 'arePropsEqual(prev, next)', say: 'The comparator asks what the row <b>shows</b>: “was I highlighted, am I highlighted?” Only rows 5 and 6 change their answer.', set: { r1: 'run', r2: 'run', r0: 'skip', r3: 'skip', cmp: 'ok' }, txt: { cmp: 'isHighlighted changed: rows 5, 6', cnt: 'hover: 2' } },
			] },
			{ name: 'Primitive props', intro: 'The list passes <code>isHighlighted</code> and <code>isSelected</code> booleans.', scene, steps: [
				{ phase: 'render', fn: 'isHighlighted={i === highlightedIndex}', say: 'The comparison moves into the parent: each row gets a boolean, and only two booleans changed. Plain <code>memo</code> does the rest, with no custom code to keep in sync.', set: { r1: 'run', r2: 'run', r0: 'skip', r3: 'skip', cmp: 'ok' }, txt: { cmp: 'isHighlighted: rows 5, 6', cnt: 'hover: 2' } },
			] },
		],
	})
}

// ─── Windowing: render only what's visible ─────────────────────────────────

export function windowingAnim() {
	const mk = (virtual) => `<div class="a-cols">
		${panel('scroll container (300 px)', `<div class="a-col">${chip('top', virtual ? 'spacer: 240,000 px tall' : '10,000 &lt;li&gt; in the DOM', 'faint')}${chip('vis', 'rows 0–12 visible', 'faint')}</div>`, 'wide')}
		${panel('recorded', `<div class="a-col">${chip('dom', '&lt;li&gt; in DOM: ?', 'faint')}${chip('ms', 'render: ?', 'faint')}</div>`)}
	</div>`
	return anim({
		id: 'perf-windowing-anim',
		caption: 'The whole catalog, 10,000 products, in one scrolling list (both recorded with React’s &lt;Profiler&gt;).',
		scenarios: [
			{
				name: 'Render everything', intro: '<code>products.map(…)</code>.', scene: mk(false), steps: [
					{ phase: 'render', fn: 'mount', say: 'React creates 10,000 elements and 10,000 DOM nodes, though only 13 fit in the box.', set: { top: 'bad', dom: 'bad', ms: 'bad' }, txt: { dom: '&lt;li&gt; in DOM: 10,000', ms: 'mount: ~80 ms' } },
					{ phase: 'render', fn: 'Refresh', say: 'Every re-render of the list repeats the work for all 10,000 rows.', set: { ms: 'bad' }, txt: { ms: 'update: ~80 ms' } },
				],
			},
			{
				name: 'useVirtualizer', intro: '<code>@tanstack/react-virtual</code>, 24 px rows, overscan 5.', scene: mk(true), steps: [
					{ phase: 'render', fn: 'getVirtualItems()', say: 'From the scroll position, the box height and the row size, the virtualizer computes which rows are visible (plus 5 extra). A tall inner element keeps the scrollbar right.', set: { top: 'ok', vis: 'hl' } },
					{ phase: 'commit', fn: 'mount', say: 'Recorded: 18 rows in the DOM, mounted in ~3 ms.', set: { dom: 'ok', ms: 'ok', vis: '' }, txt: { dom: '&lt;li&gt; in DOM: 18', ms: 'mount: ~3 ms' } },
					{ phase: 'event', fn: 'scroll to row 5,000', say: 'Rows that leave the window unmount, new ones mount, each placed with <code>translateY(row.start)</code>. Recorded: 23 rows in the DOM, first visible “Velvet Kettle 35”, the same row as the full list.', set: { vis: 'upd' }, txt: { vis: 'rows 5,000–5,012 visible', dom: '&lt;li&gt; in DOM: 23' } },
				],
			},
		],
	})
}
