// Animations for the Advanced React APIs module. Every outcome shown was recorded
// from examples/product-store (src/lessons/apis, scripts/record.mjs → generated/apis.json).

import { anim, chip, tree, panel } from './anim.mjs'

const lt = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const line = (k, code, s = '') => `<div class="an call" data-k="${k}"${s ? ` data-s="${s}"` : ''}><code>${lt(code)}</code></div>`
const logLine = (k, text, s = 'ghost') => `<div class="an" data-k="${k}" data-s="${s}">${lt(text)}</div>`

// ─── useReducer: dispatch → reducer → render (or bail out) ─────────────────

export function reducerAnim() {
	const scene = `<div class="a-cols">
		${panel('event handler', `<div class="a-col">${chip('act', 'dispatch(…)', 'faint')}</div>`)}
		${panel('cartReducer(state, action)', `<div class="a-col">${chip('case', 'switch (action.type)', 'faint')}${chip('ret', 'returns …', 'ghost')}</div>`)}
		${panel('components', `<div class="a-col">${chip('cart', 'Cart', 'faint')}${chip('note', 'FreeShippingNote', 'faint')}${chip('btns', 'memo(CartButtons)', 'faint')}</div>`)}
	</div>`
	const add = [
		{ phase: 'event', fn: "dispatch({ type: 'added', id: 'p1' })", say: 'The handler only describes <b>what happened</b>. It doesn’t compute the new cart.', set: { act: 'hl' }, txt: { act: "{ type: 'added', id: 'p1' }" } },
		{ phase: 'render', fn: "cartReducer(state, action)", say: 'React calls your reducer while rendering <code>Cart</code>, with the latest state. The <code>\'added\'</code> case builds a <b>new</b> object.', set: { act: '', case: 'hl', ret: 'new', cart: 'run' }, txt: { case: "case 'added'", ret: 'a new { items: [mug × 1] }' } },
		{ phase: 'render', fn: 'Object.is(old, new) → false', say: 'The state changed, so the children render too. <code>CartButtons</code> is skipped: it’s memoized and <code>dispatch</code> is the same function every render.', set: { case: '', ret: 'ok', note: 'run', btns: 'skip' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: <code>Cart render: 1 items, $18.00</code>, <code>FreeShippingNote render</code>.', set: { cart: 'done', note: 'done' } },
	]
	const same = [
		{ phase: 'event', fn: "dispatch({ type: 'removed', id: 'p3' })", say: 'Remove the backpack, which isn’t in the cart.', set: { act: 'hl' }, txt: { act: "{ type: 'removed', id: 'p3' }" } },
		{ phase: 'render', fn: "cartReducer(state, action)", say: 'There’s nothing to remove, so the reducer returns <code>state</code> itself: the <b>same object</b>.', set: { act: '', case: 'hl', ret: 'keep', cart: 'run' }, txt: { case: "case 'removed'", ret: 'return state (same object)' } },
		{ phase: 'render', fn: 'Object.is(old, new) → true', say: '<code>Cart</code> already ran (React calls the reducer during its render), but React sees the same state and <b>bails out</b>: no children render.', set: { case: '', ret: 'ok', cart: 'bail', note: 'skip', btns: 'skip' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: only <code>Cart render: 3 items, $75.00</code>. <code>FreeShippingNote</code> didn’t render.', set: {} },
	]
	return anim({
		id: 'apis-reducer-anim',
		caption: 'Two clicks on the cart (both recorded): a real change, and an action that changes nothing.',
		scenarios: [
			{ name: 'Add mug', intro: 'An action that changes the cart.', scene, steps: add },
			{ name: 'Remove what isn’t there', intro: 'The reducer returns the state it was given.', scene, steps: same },
		],
	})
}

// ─── Context: who re-renders when the value changes ────────────────────────

export function contextAnim() {
	const t = `<div class="t-compact">${tree([
		'app', 'App', { cls: 'comp sm' }, [
			['prov', 'CartProvider', { cls: 'comp sm' }, [
				['head', 'memo Header', { cls: 'comp sm' }, [['badge', 'CartBadge', { cls: 'comp sm' }]]],
				['grid', 'memo Grid', { cls: 'comp sm' }, [
					['cards', 'Card ×3', { cls: 'comp sm' }],
					['addb', 'AddButton', { cls: 'comp sm' }],
				]],
			]],
		],
	])}</div>`
	const scene = `<div class="a-cols">${panel('component tree', t, 'wide')}${panel('context values', `<div class="a-col">${chip('theme', 'ThemeContext: "light"', 'faint')}${chip('cart', 'CartContext: { count: 0, add }', 'faint')}</div>`)}</div>`
	const stable = [
		{ phase: 'schedule', fn: "setTheme('dark')", say: 'Theme state lives in <code>App</code>, so <code>App</code> renders.', set: { app: 'run', theme: 'upd' }, txt: { theme: 'ThemeContext: "dark"' } },
		{ phase: 'render', fn: 'CartProvider', say: '<code>CartProvider</code> is a child of <code>App</code>, so it renders too. Its <code>useMemo</code> returns the same value object (count didn’t change).', set: { prov: 'run', cart: 'keep' } },
		{ phase: 'render', fn: 'memo Header · memo Grid', say: 'Both are memoized and got no new props: skipped. Context doesn’t need them: React finds the components that <b>read</b> the changed context and renders those directly.', set: { head: 'skip', grid: 'skip' } },
		{ phase: 'render', fn: 'use(ThemeContext)', say: 'The three product cards read the theme, so they render. <code>CartBadge</code> and <code>AddButton</code> read only the cart context, which didn’t change.', set: { cards: 'run', badge: 'skip', addb: 'skip' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: <code>App</code>, <code>CartProvider</code> and the three <code>ProductCard</code>s. Nothing else.', set: { app: 'done', prov: 'done', cards: 'done' } },
	]
	const unstable = [
		{ phase: 'schedule', fn: "setTheme('dark')", say: 'Same click.', set: { app: 'run', theme: 'upd' }, txt: { theme: 'ThemeContext: "dark"' } },
		{ phase: 'render', fn: 'value = { count, add }', say: 'This provider builds its value inline: a <b>new object</b> every render, although <code>count</code> is still 0.', set: { prov: 'run', cart: 'bad' }, txt: { cart: 'CartContext: new object' } },
		{ phase: 'render', fn: 'memo Header · memo Grid', say: 'Still skipped.', set: { head: 'skip', grid: 'skip' } },
		{ phase: 'render', fn: 'Object.is(oldValue, newValue) → false', say: 'React compares context values with <code>Object.is</code>. A new object counts as a change, so every cart reader renders as well.', set: { cards: 'run', badge: 'bad', addb: 'bad' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: also <code>CartBadge</code> and <code>AddButton</code>, for a change that had nothing to do with the cart.', set: { app: 'done', prov: 'done', cards: 'done' } },
	]
	const add = [
		{ phase: 'event', fn: 'add()', say: 'Click “Add to cart”. The state lives in <code>CartProvider</code>.', set: { addb: 'hl' } },
		{ phase: 'render', fn: 'CartProvider', say: 'Only <code>CartProvider</code> renders; <code>App</code> is above it and isn’t involved. Its value is new, because <code>count</code> changed.', set: { addb: '', prov: 'run', cart: 'upd' }, txt: { cart: 'CartContext: { count: 1, add }' } },
		{ phase: 'render', fn: 'use(CartContext)', say: 'The two cart readers render. The cards (theme only) and the memoized parents don’t.', set: { badge: 'run', addb: 'run', head: 'skip', grid: 'skip', cards: 'skip' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: <code>CartProvider</code>, <code>CartBadge</code>, <code>AddButton</code>. The badge reads “1 in cart”.', set: { prov: 'done', badge: 'done', addb: 'done' } },
	]
	return anim({
		id: 'apis-context-anim',
		caption: 'Which components render when a context value changes (all three recorded). Grid = ProductGrid, Card = ProductCard.',
		scenarios: [
			{ name: 'Theme, memoized value', intro: 'Toggle the theme; the cart value is kept stable with <code>useMemo</code>.', scene, steps: stable },
			{ name: 'Theme, inline value', intro: 'Toggle the theme; the cart value is written inline.', scene, steps: unstable },
			{ name: 'Add to cart', intro: 'Change the cart instead.', scene, steps: add },
		],
	})
}

// ─── createPortal: DOM placement vs React tree ─────────────────────────────

export function portalAnim() {
	const mk = (portal) => {
		const dom = tree([
			'body', 'body', { cls: 'host sm' }, [
				['root', '#root', { cls: 'host sm' }, [
					['art', 'article', { cls: 'host sm' }, portal ? [] : [['qv', 'dialog', { cls: 'host sm', s: 'ghost' }]]],
				]],
				...(portal ? [['qv', 'dialog', { cls: 'host sm', s: 'ghost' }]] : []),
			],
		])
		const react = tree(['card', 'Card', { cls: 'comp sm' }, [['qvr', 'QuickView', { cls: 'comp sm', s: 'ghost' }]]])
		return `<div class="a-cols">${panel('DOM tree', `<div class="t-compact">${dom}</div>`, 'wide')}${panel('React tree', `<div class="t-compact">${react}</div>`)}${panel('what happened', `<div class="a-col">${chip('seen', 'dialog: not open', 'faint')}${chip('ev1', 'card onClick (React)', 'ghost')}${chip('ev2', 'card DOM listener', 'ghost')}</div>`)}</div>`
	}
	const inline = [
		{ phase: 'render', fn: '{open && <QuickView />}', say: 'Rendered in place: the dialog’s DOM goes <b>inside</b> the card.', set: { qvr: 'new', qv: 'new' } },
		{ phase: 'paint', fn: 'overflow: hidden', say: 'The card (<code>article</code>, with <code>overflow: hidden</code>) clips everything outside its box. (The dialog is <code>position: fixed</code>, but the card’s hover <code>transform</code> makes the card its containing block.) Recorded: the Close button isn’t visible.', set: { art: 'bad', qv: 'bad', seen: 'bad' }, txt: { seen: 'Close button clipped' } },
		{ phase: 'event', fn: 'click Close', say: 'The click bubbles through the DOM <b>and</b> through React: both the plain DOM listener and React’s <code>onClick</code> on the card run.', set: { ev1: 'run', ev2: 'run' }, txt: { ev1: 'card onClick ran', ev2: 'card DOM listener ran' } },
	]
	const portal = [
		{ phase: 'render', fn: 'createPortal(<QuickView />, document.body)', say: 'Same component, but its DOM goes straight into <code>&lt;body&gt;</code>. In the React tree it’s still the card’s child.', set: { qvr: 'new', qv: 'new' } },
		{ phase: 'paint', fn: 'nothing clips it', say: 'Recorded: parent <code>body</code>, Close button visible. It also still reads the card’s context: the dialog got the <code>dark</code> theme class.', set: { qv: 'ok', seen: 'ok' }, txt: { seen: 'fully visible, theme: dark' } },
		{ phase: 'event', fn: 'click Close', say: 'React events follow the <b>React</b> tree, so the card’s <code>onClick</code> still runs. The DOM listener doesn’t: in the DOM, the dialog isn’t inside the card.', set: { qvr: 'hl', card: 'run', ev1: 'run', ev2: 'skip' }, txt: { ev1: 'card onClick ran', ev2: 'DOM listener: not run' } },
	]
	return anim({
		id: 'apis-portal-anim',
		caption: 'The “Quick view” dialog, rendered in place and through a portal (both recorded).',
		scenarios: [
			{ name: 'In place', intro: 'The dialog is rendered inside the card.', scene: mk(false), steps: inline },
			{ name: 'createPortal', intro: 'The dialog is portaled to <code>document.body</code>.', scene: mk(true), steps: portal },
		],
	})
}

// ─── useLayoutEffect: what gets painted ─────────────────────────────────────

export function layoutTimingAnim() {
	const mk = (rows) => `<div class="a-cols">
		${panel('screen', `<div class="a-col">${chip('btn', 'Shipping ⓘ', 'faint')}${chip('tip', 'tooltip: not shown', 'ghost')}</div>`)}
		${panel('recorded order', `<div class="a-log">${rows.map(([k, t]) => logLine(k, t)).join('')}</div>`, 'wide')}
	</div>`
	const effRows = [['r1', 'render: height 0 → above'], ['f1', 'frame 1 painted: covering the button'], ['e1', 'effect: measured 58px'], ['r2', 'render: height 58 → below'], ['f2', 'frame 2 painted: below the button']]
	const layRows = [['r1', 'render: height 0 → above'], ['e1', 'effect: measured 58px'], ['r2', 'render: height 58 → below'], ['f1', 'frame 1 painted: below the button']]
	const eff = [
		{ phase: 'render', fn: 'Tooltip (height 0)', say: 'The height isn’t known yet, so the tooltip is placed “above” the button at a height of 0, which puts it right on top of the button.', set: { r1: 'new' } },
		{ phase: 'commit', fn: 'commit', say: 'React updates the DOM. <code>useEffect</code> is <b>not</b> run yet: React lets the browser continue.', set: { tip: 'upd' }, txt: { tip: 'tooltip in DOM (wrong spot)' } },
		{ phase: 'paint', fn: 'paint', say: 'The browser paints that frame. The user sees the tooltip covering the button.', set: { f1: 'bad', tip: 'bad', btn: 'bad' }, txt: { tip: 'covering the button' } },
		{ phase: 'effect', fn: 'useEffect → measure → setHeight(58)', say: 'Now the effect measures 58px; there’s no room above, so it moves below.', set: { e1: 'new', r2: 'new' } },
		{ phase: 'paint', fn: 'paint', say: 'Next frame: correct. The tooltip visibly jumped.', set: { f2: 'ok', tip: 'ok', btn: '' }, txt: { tip: 'below the button' } },
	]
	const lay = [
		{ phase: 'render', fn: 'Tooltip (height 0)', say: 'Same first render.', set: { r1: 'new' } },
		{ phase: 'commit', fn: 'useLayoutEffect → measure → setHeight(58)', say: 'Layout effects run during the commit, <b>before</b> the browser can paint. Reading the size forces the browser to lay out the new DOM (no paint).', set: { e1: 'new', tip: 'upd' }, txt: { tip: 'in DOM, not painted' } },
		{ phase: 'render', fn: 'Tooltip (height 58)', say: 'A state update from a layout effect is processed <b>synchronously</b>: React renders and commits again right away.', set: { r2: 'new' } },
		{ phase: 'paint', fn: 'paint', say: 'The first frame the user sees is already correct.', set: { f1: 'ok', tip: 'ok' }, txt: { tip: 'below the button' } },
	]
	return anim({
		id: 'apis-layout-anim',
		caption: 'Hovering “Shipping ⓘ”: the recorded order of renders, effects and painted frames (frames read in requestAnimationFrame).',
		scenarios: [
			{ name: 'useEffect', intro: 'Measure in a regular effect.', scene: mk(effRows), steps: eff },
			{ name: 'useLayoutEffect', intro: 'Measure in a layout effect.', scene: mk(layRows), steps: lay },
		],
	})
}

// ─── useImperativeHandle: a command vs a flag ──────────────────────────────

export function imperativeAnim() {
	const mk = (code) => `<div class="a-cols">
		${panel('Apply coupon onClick', `<div class="a-col">${line('code', code)}</div>`, 'wide')}
		${panel('state / handle', `<div class="a-col">${chip('st', code.includes('set') ? 'shouldFocus = false' : 'couponRef.current = { focus, clear }', 'faint')}</div>`)}
		${panel('coupon field', `<div class="a-col">${chip('c1', 'click 1', 'ghost')}${chip('c2', 'click 2', 'ghost')}</div>`)}
	</div>`
	const flag = [
		{ phase: 'event', fn: 'setShouldFocus(true)', say: 'Click 1: the flag goes from <code>false</code> to <code>true</code>.', set: { code: 'hl', st: 'upd' }, txt: { st: 'shouldFocus = true' } },
		{ phase: 'effect', fn: 'useEffect([shouldFocus])', say: 'The dependency changed, so the child’s effect runs and focuses the field.', set: { code: '', c1: 'ok' }, txt: { c1: 'click 1: focused' } },
		{ phase: 'event', fn: 'blur, then setShouldFocus(true)', say: 'Click 2 (after the user clicked elsewhere): the flag is <b>already</b> <code>true</code>. Same value, no re-render, no effect.', set: { code: 'hl', st: 'bad' } },
		{ phase: 'effect', fn: 'nothing', say: 'Recorded: nothing was logged for click 2, and focus stayed on the button. A command doesn’t fit in state.', set: { code: '', c2: 'bad' }, txt: { c2: 'click 2: not focused' } },
	]
	const handle = [
		{ phase: 'event', fn: 'couponRef.current.focus()', say: 'Click 1 calls the method the field exposed.', set: { code: 'hl', st: 'hl' } },
		{ phase: 'event', fn: 'inputRef.current.focus()', say: 'Inside the field, it focuses the real input. No state, no render.', set: { code: '', st: '', c1: 'ok' }, txt: { c1: 'click 1: focused' } },
		{ phase: 'event', fn: 'couponRef.current.focus()', say: 'Click 2 does exactly the same thing again.', set: { code: 'hl', c2: 'ok' }, txt: { c2: 'click 2: focused' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: <code>coupon field focused</code> for both clicks. The handle exposes only <code>focus</code> and <code>clear</code>: <code>handle.value</code> and <code>handle.style</code> are <code>undefined</code>.', set: { code: '' } },
	]
	return anim({
		id: 'apis-imperative-anim',
		caption: '“Apply coupon” clicked twice, with a blur in between (both versions recorded).',
		scenarios: [
			{ name: 'A shouldFocus prop', intro: 'The parent sets state; the child focuses in an effect.', scene: mk('setShouldFocus(true)'), steps: flag },
			{ name: 'useImperativeHandle', intro: 'The child exposes <code>focus()</code>; the parent calls it.', scene: mk('couponRef.current.focus()'), steps: handle },
		],
	})
}

// ─── flushSync: the DOM right after setState ───────────────────────────────

export function flushSyncAnim() {
	const mk = (first) => `<div class="a-cols">
		${panel('startEditing()', `<div class="a-col">${line('l1', first)}${line('l2', 'inputRef.current')}${line('l3', 'inputRef.current?.focus()')}</div>`, 'wide')}
		${panel('DOM', `<div class="a-col">${chip('dom', '&lt;button&gt;Birthday ideas ✎', 'faint')}${chip('focus', 'focus: button', 'faint')}</div>`)}
	</div>`
	const batched = [
		{ phase: 'schedule', fn: 'setEditing(true)', say: 'The update is <b>queued</b>. React will render after the handler returns.', set: { l1: 'hl' } },
		{ phase: 'event', fn: 'inputRef.current → null', say: 'Recorded: <code>inputRef.current = null</code>. The <code>&lt;input&gt;</code> doesn’t exist yet.', set: { l1: '', l2: 'bad' } },
		{ phase: 'event', fn: 'focus() → nothing', say: 'There’s nothing to focus. Recorded: <code>focused: button</code>.', set: { l2: '', l3: 'bad', focus: 'bad' } },
		{ phase: 'render', fn: 'render (editing: true)', say: 'Only now does React render and swap the button for the input. Too late: the code that wanted it has finished.', set: { l3: '', dom: 'upd' }, txt: { dom: '&lt;input value="Birthday ideas"&gt;' } },
	]
	const sync = [
		{ phase: 'render', fn: 'flushSync(() => setEditing(true))', say: '<code>flushSync</code> renders <b>and commits</b> before it returns. Recorded: <code>render (editing: true)</code> is logged inside the click handler.', set: { l1: 'hl', dom: 'upd' }, txt: { dom: '&lt;input value="Birthday ideas"&gt;' } },
		{ phase: 'event', fn: 'inputRef.current → <input>', say: 'The ref is already attached.', set: { l1: '', l2: 'ok' } },
		{ phase: 'event', fn: 'focus()', say: 'Recorded: <code>focused: input</code>.', set: { l2: '', l3: 'ok', focus: 'ok' }, txt: { focus: 'focus: input' } },
	]
	return anim({
		id: 'apis-flushsync-anim',
		caption: 'Click “Birthday ideas ✎” to rename the wishlist (both versions recorded).',
		scenarios: [
			{ name: 'setState', intro: 'A normal state update, then focus.', scene: mk('setEditing(true)'), steps: batched },
			{ name: 'flushSync', intro: 'The update wrapped in <code>flushSync</code>.', scene: mk('flushSync(() => setEditing(true))'), steps: sync },
		],
	})
}

// ─── useSyncExternalStore: subscribe, snapshot, compare ────────────────────

export function externalStoreAnim() {
	const mk = (snap) => `<div class="a-cols">
		${panel('cartStore (plain JS)', `<div class="a-col">${chip('state', 'state = { count: 0 }', 'faint')}${chip('ls', 'listeners: 2', 'faint')}</div>`)}
		${panel('getSnapshot()', `<div class="a-col">${chip('snap', snap, 'faint')}${chip('cmp', 'Object.is(last, next)', 'ghost')}</div>`)}
		${panel('two React roots', `<div class="a-col">${chip('hdr', 'HeaderBadge (0)', 'faint')}${chip('pg', 'ProductPage (0)', 'faint')}</div>`)}
	</div>`
	const good = [
		{ phase: 'event', fn: 'cartStore.add()', say: 'The store replaces its state with a new object, then calls every listener. React doesn’t own this state.', set: { state: 'upd', ls: 'hl' }, txt: { state: 'state = { count: 1 } (new)' } },
		{ phase: 'schedule', fn: 'listener() → getSnapshot()', say: 'Each listener is React asking “did your snapshot change?”. <code>getSnapshot</code> returns the store’s own object.', set: { ls: '', snap: 'hl' }, txt: { snap: 'returns state' } },
		{ phase: 'render', fn: 'Object.is → false', say: 'A different object than last time, so React re-renders the components that read it, in <b>both</b> roots.', set: { snap: '', cmp: 'cmp', hdr: 'run', pg: 'run' }, txt: { hdr: 'HeaderBadge (1)', pg: 'ProductPage (1)' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: <code>render HeaderBadge (1)</code>, <code>render ProductPage (1)</code>; the badge shows 🛒 1. When nothing changed, <code>getSnapshot</code> returns the same object and React does nothing.', set: { cmp: 'ok', hdr: 'done', pg: 'done' } },
	]
	const bad = [
		{ phase: 'render', fn: 'getSnapshot() → { ...state }', say: 'This <code>getSnapshot</code> copies the state: a <b>new object on every call</b>.', set: { snap: 'bad' }, txt: { snap: 'returns a new copy' } },
		{ phase: 'render', fn: 'Object.is(copy1, copy2) → false', say: 'React calls it twice to check it’s stable. Two copies are never <code>Object.is</code>-equal, so React thinks the store changed.', set: { cmp: 'bad' } },
		{ phase: 'render', fn: 'render → getSnapshot → “changed” → render …', say: 'Each render sees “a change” and schedules another. Recorded warning: <code>The result of getSnapshot should be cached to avoid an infinite loop</code>.', set: { hdr: 'bad' }, txt: { hdr: 'BadBadge: re-render loop' } },
		{ phase: 'commit', fn: 'uncaught error', say: 'Recorded: <code>Maximum update depth exceeded</code>. Return the store’s own object, and make the store create a new one only when something changes.', set: {} },
	]
	return anim({
		id: 'apis-store-anim',
		caption: 'A cart store outside React, read by two separate roots (both versions recorded).',
		scenarios: [
			{ name: 'Stable snapshot', intro: 'Click “Add to cart” in the product page root.', scene: mk('() => state'), steps: good },
			{ name: 'New object per call', intro: '<code>getSnapshot</code> written as <code>() =&gt; ({ ...store.getSnapshot() })</code>.', scene: mk('() => ({ ...state })'), steps: bad },
		],
	})
}
