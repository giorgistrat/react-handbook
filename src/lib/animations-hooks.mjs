// Animations for the Hooks module. Every outcome shown was recorded from
// examples/product-store (src/lessons/hooks, scripts/record.mjs → generated/hooks.json).

import { anim, chip, tree, panel } from './anim.mjs'

const lt = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const line = (k, code, s = '') => `<div class="an call" data-k="${k}"${s ? ` data-s="${s}"` : ''}><code>${lt(code)}</code></div>`
const logLine = (k, text, s = 'ghost') => `<div class="an" data-k="${k}" data-s="${s}">${lt(text)}</div>`

// ─── Managing UI State: the controlled-input loop ──────────────────────────

export function controlledLoopAnim() {
	const mk = (controlled) => `<div class="a-cols">
		${panel('the input (DOM)', `<div class="a-col">${chip('dom', 'shows: lamp')}${chip('box', 'office ☐')}</div>`)}
		${panel('React state', `<div class="a-col">${chip('state', 'query = "lamp"')}</div>`)}
		${panel(controlled ? 'render writes back' : 'render', `<div class="a-col">${chip('render', controlled ? 'value={query}' : '(input not given a value)', 'faint')}${chip('results', 'results: 1 product')}</div>`)}
	</div>`
	const un = [
		{ phase: 'event', fn: 'click “office”', say: 'The checkbox’s <code>onChange</code> adds the word to the query.', set: { box: 'hl' }, txt: { box: 'office ☑' } },
		{ phase: 'schedule', fn: 'setQuery("lamp office")', say: 'State changes and React re-renders.', set: { box: '', state: 'upd' }, txt: { state: 'query = "lamp office"' } },
		{ phase: 'render', fn: '<input onChange={…} />', say: 'Nothing tells the input what to show, so it keeps its own text. Recorded: the box still read <code>"lamp"</code> while the results used <code>"lamp office"</code>.', set: { render: 'cmp', dom: 'bad' } },
		{ phase: 'render', fn: 'type “audio”', say: 'The other direction fails too: typing “audio” didn’t tick the audio checkbox (recorded <code>audioChecked: false</code>). Two copies of the truth, already out of sync.', set: { render: '', results: 'bad' }, txt: { results: 'checkbox ignores what you type' } },
	]
	const co = [
		{ phase: 'event', fn: 'click “office”', say: 'Same click.', set: { box: 'hl' }, txt: { box: 'office ☑' } },
		{ phase: 'schedule', fn: 'setQuery("lamp office")', say: 'Same state change.', set: { box: '', state: 'upd' }, txt: { state: 'query = "lamp office"' } },
		{ phase: 'render', fn: 'value={query} · checked={words.includes(c)}', say: 'Now the render <b>writes state back</b> into every field: the input and each checkbox are computed from <code>query</code>.', set: { render: 'hl' } },
		{ phase: 'commit', fn: 'commit', say: 'Recorded: the box read <code>"lamp office"</code>, and typing “audio” ticked the audio checkbox. One source of truth.', set: { render: '', dom: 'ok', results: 'ok' }, txt: { dom: 'shows: lamp office', results: 'checkboxes follow the text' } },
	]
	return anim({
		id: 'hooks-controlled-anim',
		caption: 'An input is controlled when every render tells it what to show.',
		scenarios: [
			{ name: 'onChange only', intro: 'The input reports changes, but nothing writes <code>query</code> back.', scene: mk(false), steps: un },
			{ name: 'value + onChange', intro: 'The same component with <code>value={query}</code> and derived <code>checked</code>.', scene: mk(true), steps: co },
		],
	})
}

// ─── Side Effects: listeners pile up without cleanup ───────────────────────

export function listenerLeakAnim() {
	const mk = () => `<div class="a-cols">
		${panel('&lt;Search /&gt;', `<div class="a-col">${chip('comp', 'mounted (listener #1)', 'ok')}</div>`)}
		${panel('window’s popstate listeners', `<div class="a-col">${chip('l1', 'listener #1', 'new')}${chip('l2', 'listener #2', 'ghost')}${chip('l3', 'listener #3', 'ghost')}${chip('l4', 'listener #4', 'ghost')}</div>`)}
		${panel('back button', `<div class="a-col">${chip('back', 'not pressed', 'faint')}</div>`)}
	</div>`
	const cycle = (n, leak) => [
		{ phase: 'commit', fn: 'hide Search (unmount)', say: leak ? `No cleanup: listener #${n} stays on <code>window</code>, and its closure keeps the dead component’s data alive.` : `React runs the cleanup: <code>removeEventListener</code> takes listener #${n} off.`, set: { comp: 'del', [`l${n}`]: leak ? 'bad' : 'del' }, txt: { comp: 'unmounted' } },
		{ phase: 'effect', fn: 'show Search (mount)', say: `A fresh effect adds listener #${n + 1}.`, set: { comp: 'ok', [`l${n + 1}`]: 'new' }, txt: { comp: `mounted (listener #${n + 1})` } },
	]
	const leak = [...cycle(1, true), ...cycle(2, true), ...cycle(3, true), { phase: 'event', fn: 'history.back()', say: 'One back-button press runs <b>every</b> listener. Recorded: <code>listener #1 runs</code> … <code>#4 runs</code>.', set: { back: 'bad', l1: 'run', l2: 'run', l3: 'run', l4: 'run' }, txt: { back: '4 handlers ran' } }]
	const clean = [...cycle(1, false), ...cycle(2, false), ...cycle(3, false), { phase: 'event', fn: 'history.back()', say: 'Only the mounted component’s listener exists. Recorded: just <code>listener #4 runs</code>.', set: { back: 'ok', l4: 'run' }, txt: { back: '1 handler ran' } }]
	return anim({
		id: 'hooks-leak-anim',
		caption: 'Hide and show the search three times, then press Back (both versions recorded).',
		scenarios: [
			{ name: 'No cleanup', intro: 'The effect adds a listener and never removes it.', scene: mk(), steps: leak },
			{ name: 'With cleanup', intro: 'The effect returns <code>() =&gt; removeEventListener(…)</code>.', scene: mk(), steps: clean },
		],
	})
}

// ─── React Lifecycle: the recorded order ───────────────────────────────────

export function lifecycleAnim() {
	const rows = [
		['m1', 'render (count = 0)'],
		['m2', 'layout effect (count = 0)'],
		['m3', 'effect (count = 0)'],
		['u1', 'render (count = 1)'],
		['u2', 'layout cleanup (count = 0)'],
		['u3', 'layout effect (count = 1)'],
		['u4', 'effect cleanup (count = 0)'],
		['u5', 'effect (count = 1)'],
		['x1', 'layout cleanup (count = 1)'],
		['x2', 'effect cleanup (count = 1)'],
	]
	const scene = `<div class="a-cols">
		${panel('&lt;CartBadge count={count} /&gt;', `<div class="a-col">${chip('stage', 'not on screen', 'faint')}${chip('dom', '&lt;span&gt;?', 'ghost')}</div>`)}
		${panel('console (recorded order)', `<div class="a-log">${rows.map(([k, t]) => logLine(k, t)).join('')}</div>`, 'wide')}
	</div>`
	const steps = [
		{ phase: 'render', fn: 'CartBadge({ count: 0 })', say: '<b>Mount.</b> The function runs; hooks are created; JSX is returned.', set: { stage: 'run', m1: 'new' }, txt: { stage: 'mounting' } },
		{ phase: 'commit', fn: 'commit → useLayoutEffect', say: 'React puts the <code>&lt;span&gt;</code> in the DOM, then runs layout effects <b>before the browser paints</b>, so they can measure or adjust the DOM without a flicker.', set: { dom: 'new', m2: 'new' }, txt: { dom: '&lt;span&gt;0 in cart' } },
		{ phase: 'effect', fn: 'useEffect', say: 'Then the regular effect. React doesn’t make the browser wait for it.', set: { m3: 'new', stage: 'ok' }, txt: { stage: 'mounted' } },
		{ phase: 'render', fn: 'click → CartBadge({ count: 1 })', say: '<b>Update.</b> The function runs again <b>first</b>. Nothing has been cleaned up yet.', set: { stage: 'run', u1: 'new' }, txt: { stage: 'updating' } },
		{ phase: 'commit', fn: 'layout cleanup(0) → layout effect(1)', say: 'During the commit: the old layout effect’s cleanup (with <b>count = 0</b>, its own render’s value), then the new layout effect.', set: { dom: 'upd', u2: 'new', u3: 'new' }, txt: { dom: '&lt;span&gt;1 in cart' } },
		{ phase: 'effect', fn: 'effect cleanup(0) → effect(1)', say: 'Then the same for the regular effect. Cleanups always see the values of the render that created them.', set: { u4: 'new', u5: 'new', stage: 'ok' }, txt: { stage: 'updated' } },
		{ phase: 'commit', fn: 'hide → unmount', say: '<b>Unmount.</b> No render: React runs the remaining cleanups one last time and removes the DOM.', set: { x1: 'new', x2: 'new', dom: 'del', stage: 'del' }, txt: { stage: 'unmounted' } },
	]
	return anim({
		id: 'hooks-lifecycle-anim',
		caption: 'Mount, one update, unmount: every line was logged by the product store in this order.',
		scenarios: [{ name: 'Mount → update → unmount', intro: 'A cart badge with one layout effect and one effect, both logging their <code>count</code>.', scene, steps }],
	})
}

// ─── Lifting State: who re-renders on a heart click ────────────────────────

export function liftAnim() {
	const t = (owner) =>
		`<div class="t-compact">${tree([
			'app', 'App', { cls: 'comp sm' }, [
				['search', 'Search', { cls: 'comp sm' }],
				['grid', owner === 'grid' ? 'Grid · ♥ state' : 'Grid', { cls: 'comp sm' }, [
					['c1', 'p1', { cls: 'comp sm' }],
					['c2', 'p2', { cls: 'comp sm' }],
					['c3', owner === 'card' ? 'p3 · ♥ state' : 'p3', { cls: 'comp sm' }],
					['c4', 'p4–6', { cls: 'comp sm' }],
				]],
			],
		])}</div>`
	const lifted = [
		{ phase: 'event', fn: 'click ♡ on Trail Backpack', say: 'The card calls <code>onToggle</code>, a function from <code>ProductGrid</code>.', set: { c3: 'hl' } },
		{ phase: 'schedule', fn: 'setFavorites([...f, "p3"])', say: 'The state lives in <code>ProductGrid</code>, so that’s where the re-render starts.', set: { c3: '', grid: 'run' } },
		{ phase: 'render', fn: 'ProductGrid + every Card', say: 'Recorded: <code>ProductGrid</code> and all six cards rendered. In return, the grid can <b>sort</b> favorites first: the Backpack moved to the top.', set: { c1: 'run', c2: 'run', c3: 'run', c4: 'run' } },
		{ phase: 'commit', fn: 'search “mug”, then clear', say: 'The Backpack is filtered out and comes back: it’s still ♥, because the grid that holds the state never unmounted.', set: { grid: 'ok', c1: '', c2: '', c3: 'ok', c4: '' } },
	]
	const colocated = [
		{ phase: 'event', fn: 'click ♡ on Trail Backpack', say: 'The card owns its own <code>isFavorite</code>.', set: { c3: 'hl' } },
		{ phase: 'schedule', fn: 'setIsFavorite(true)', say: 'The re-render starts at the card.', set: { c3: 'run' } },
		{ phase: 'render', fn: 'Card p3 only', say: 'Recorded: one line, <code>Card p3 renders</code>. Less work, simpler props, but nothing above can sort by favorites.', set: { c3: 'ok' } },
		{ phase: 'commit', fn: 'search “mug”, then clear', say: 'Filtering unmounts the card and its state; when it comes back it’s ♡ again (recorded). Colocated state lives only as long as its component.', set: { c3: 'bad' } },
	]
	return anim({
		id: 'hooks-lift-anim',
		caption: 'The same heart button with the state in two places (both recorded). Cards are labelled by product id: p3 is the Trail Backpack.',
		scenarios: [
			{ name: 'Lifted to ProductGrid', intro: '<code>favorites</code> in the grid, passed to each card.', scene: t('grid'), steps: lifted },
			{ name: 'Colocated in Card', intro: 'Each card owns <code>isFavorite</code>.', scene: t('card'), steps: colocated },
		],
	})
}

// ─── DOM refs: what React compares ─────────────────────────────────────────

export function depsCompareAnim() {
	const mk = (deps) => `<div class="a-cols">
		${panel('dependencies', `<div class="a-col">${chip('prev', `render 1: ${deps}`)}${chip('next', `render 2: ${deps}`, 'ghost')}</div>`, 'wide')}
		${panel('React’s check', `<div class="a-col">${chip('cmp', 'Object.is(prev[i], next[i])', 'faint')}</div>`)}
		${panel('zoom library', `<div class="a-col">${chip('zoom', 'attachZoom(scale 1.2)', 'ok')}</div>`)}
	</div>`
	const object = [
		{ phase: 'event', fn: 'click “Quantity”', say: 'An unrelated state change re-renders the product.', set: { next: 'new' } },
		{ phase: 'render', fn: 'const options = { scale, speed }', say: 'The render creates a <b>new</b> object with the same contents.', set: { next: 'upd' } },
		{ phase: 'commit', fn: 'Object.is(oldOptions, newOptions) → false', say: 'Objects are compared by identity. Recorded: <code>Object.is(a, b) → false</code> for two equal objects.', set: { cmp: 'bad' } },
		{ phase: 'effect', fn: 'cleanup → effect', say: 'So React tears the zoom down and sets it up again on every click. Recorded: <code>zoom destroyed</code>, <code>attachZoom(scale 1.2)</code> twice for two clicks.', set: { zoom: 'bad' }, txt: { zoom: 'destroyed + attached again' } },
	]
	const prims = [
		{ phase: 'event', fn: 'click “Quantity”', say: 'Same unrelated re-render.', set: { next: 'new' } },
		{ phase: 'render', fn: '[scale, speed] = [1.2, 300]', say: 'The dependencies are plain numbers.', set: { next: 'keep' } },
		{ phase: 'commit', fn: 'Object.is(1.2, 1.2) → true', say: 'Numbers compare by value, so nothing “changed”.', set: { cmp: 'ok' } },
		{ phase: 'effect', fn: 'effect skipped', say: 'Recorded: no log at all for the two clicks. Only “Bigger zoom” (scale 1.5) re-ran it.', set: { zoom: 'ok' }, txt: { zoom: 'untouched' } },
	]
	return anim({
		id: 'hooks-deps-anim',
		caption: 'Effect dependencies are compared with <code>Object.is</code>, item by item.',
		scenarios: [
			{ name: '[options] (object)', intro: '<code>useEffect(…, [options])</code> with an object built during render.', scene: mk('[{ scale: 1.2, speed: 300 }]'), steps: object },
			{ name: '[scale, speed]', intro: '<code>useEffect(…, [scale, speed])</code>, building the object inside the effect.', scene: mk('[1.2, 300]'), steps: prims },
		],
	})
}

// ─── useId: two forms on one page ──────────────────────────────────────────

export function useIdAnim() {
	const mk = (ids) => `<div class="a-cols">
		${panel('Ceramic Mug review', `<div class="a-col">${chip('a1', `Title → id="${ids[0]}"`)}${chip('a2', `Your name → id="${ids[1]}"`)}</div>`)}
		${panel('Desk Lamp review', `<div class="a-col">${chip('b1', `Title → id="${ids[2]}"`)}${chip('b2', `Your name → id="${ids[3]}"`)}</div>`)}
	</div>`
	const hard = [
		{ phase: 'event', fn: 'click label “Your name” (Desk Lamp)', say: 'A label focuses the element whose <code>id</code> matches its <code>htmlFor</code>.', set: { b2: 'hl' } },
		{ phase: 'commit', fn: 'document.getElementById("review-title")', say: 'Four inputs share one id; the browser picks the <b>first</b> in the document. Recorded focus: the Ceramic Mug form’s Title field.', set: { b2: '', a1: 'bad' } },
	]
	const useid = [
		{ phase: 'render', fn: 'useId() ×4', say: 'Each <code>Field</code> instance gets its own id from its position in the tree. Recorded: <code>_r_0_</code> … <code>_r_3_</code>.', set: { a1: 'new', a2: 'new', b1: 'new', b2: 'new' } },
		{ phase: 'event', fn: 'click label “Your name” (Desk Lamp)', say: 'Recorded focus: the Desk Lamp form’s <code>author</code> field, the right one.', set: { a1: '', a2: '', b1: '', b2: 'ok' } },
	]
	return anim({
		id: 'hooks-useid-anim',
		caption: 'A reusable field can’t hard-code an id: it may appear many times on a page.',
		scenarios: [
			{ name: 'id="review-title"', intro: 'Every field uses the same hard-coded id.', scene: mk(['review-title', 'review-title', 'review-title', 'review-title']), steps: hard },
			{ name: 'useId()', intro: 'Every field calls <code>useId()</code>.', scene: mk(['_r_0_', '_r_1_', '_r_2_', '_r_3_']), steps: useid },
		],
	})
}

// ─── Cart: the update queue ─────────────────────────────────────────────────

export function updateQueueAnim() {
	const mk = (a, b) => `<div class="a-cols">
		${panel('click handler', `<div class="a-col">${line('s1', a)}${line('s2', b)}</div>`, 'wide')}
		${panel('React’s queue for qty', `<div class="a-col">${chip('q1', '—', 'ghost')}${chip('q2', '—', 'ghost')}</div>`)}
		${panel('next render', `<div class="a-col">${chip('res', 'qty = 1', 'faint')}</div>`)}
	</div>`
	const stale = [
		{ phase: 'event', fn: 'setQty(qty + 1)', say: 'In this render <code>qty</code> is <code>1</code>, so this queues “replace with <b>2</b>”.', set: { s1: 'hl', q1: 'new' }, txt: { q1: 'replace with 2' } },
		{ phase: 'event', fn: 'setQty(qty + 1)', say: '<code>qty</code> is still <code>1</code> in this closure (state doesn’t change mid-handler), so this also queues “replace with <b>2</b>”.', set: { s1: '', s2: 'hl', q2: 'new' }, txt: { q2: 'replace with 2' } },
		{ phase: 'render', fn: 'process queue', say: 'Recorded button: <code>Add 2 (now 2)</code>. One of the two clicks was lost.', set: { s2: '', res: 'bad' }, txt: { res: 'qty = 2' } },
	]
	const upd = [
		{ phase: 'event', fn: 'setQty(q => q + 1)', say: 'Queues a <b>function</b> instead of a value.', set: { s1: 'hl', q1: 'new' }, txt: { q1: 'q => q + 1' } },
		{ phase: 'event', fn: 'setQty(q => q + 1)', say: 'Queues another one.', set: { s1: '', s2: 'hl', q2: 'new' }, txt: { q2: 'q => q + 1' } },
		{ phase: 'render', fn: '1 → 2 → 3', say: 'React runs them in order, passing each one the result of the previous. Recorded button: <code>Add 2 (now 3)</code>.', set: { s2: '', res: 'ok' }, txt: { res: 'qty = 3' } },
	]
	return anim({
		id: 'hooks-queue-anim',
		caption: '“Add 2” clicked once, quantity starting at 1 (both versions recorded).',
		scenarios: [
			{ name: 'setQty(qty + 1) ×2', intro: 'New value computed from the render’s <code>qty</code>.', scene: mk('setQty(qty + 1)', 'setQty(qty + 1)'), steps: stale },
			{ name: 'setQty(q => q + 1) ×2', intro: 'Updater functions.', scene: mk('setQty(q => q + 1)', 'setQty(q => q + 1)'), steps: upd },
		],
	})
}

// ─── useState vs useReducer: two effects, one snapshot ─────────────────────

export function staleSnapshotAnim() {
	const mk = (label) => `<div class="a-cols">
		${panel('effects after mount', `<div class="a-col">${line('e1', "set('Desk Lamp')")}${line('e2', "set('Trail Backpack')")}</div>`, 'wide')}
		${panel(label, `<div class="a-col">${chip('snap', 'past = [] · present = "Ceramic Mug"', 'faint')}</div>`)}
		${panel('final state (recorded)', `<div class="a-col">${chip('res', '?', 'ghost')}</div>`)}
	</div>`
	const states = [
		{ phase: 'effect', fn: "set('Desk Lamp')", say: '<code>set</code> was created in render 1, so it reads <code>past = []</code>, <code>present = "Ceramic Mug"</code>. It queues <code>past: ["Ceramic Mug"]</code>, <code>present: "Desk Lamp"</code>.', set: { e1: 'hl', snap: 'cmp' } },
		{ phase: 'effect', fn: "set('Trail Backpack')", say: 'Same function, same snapshot: it also queues <code>past: ["Ceramic Mug"]</code>, overwriting the first.', set: { e1: '', e2: 'hl', snap: 'bad' } },
		{ phase: 'render', fn: 'render 2', say: 'Desk Lamp is lost from the history.', set: { e2: '', res: 'bad' }, txt: { res: 'past: ["Ceramic Mug"] · present: "Trail Backpack"' } },
	]
	const reducer = [
		{ phase: 'effect', fn: "dispatch({ type: 'set', next: 'Desk Lamp' })", say: '<code>set</code> only dispatches an action; it reads no state.', set: { e1: 'hl' } },
		{ phase: 'effect', fn: "dispatch({ type: 'set', next: 'Trail Backpack' })", say: 'Another action is queued.', set: { e1: '', e2: 'hl' } },
		{ phase: 'render', fn: 'historyReducer(state, action) ×2', say: 'React calls the reducer for each action with the <b>current</b> state, the second one seeing the result of the first.', set: { e2: '', snap: 'ok', res: 'ok' }, txt: { snap: 'reducer gets the latest state', res: 'past: ["Ceramic Mug","Desk Lamp"] · present: "Trail Backpack"' } },
	]
	return anim({
		id: 'hooks-snapshot-anim',
		caption: 'Three related values updated from a closure lose an entry; a reducer can’t.',
		scenarios: [
			{ name: 'Three useStates', intro: '<code>past</code>, <code>present</code>, <code>future</code> as separate state, updated from a callback.', scene: mk('what set() sees'), steps: states },
			{ name: 'useReducer', intro: 'One reducer owns all three.', scene: mk('what the reducer sees'), steps: reducer },
		],
	})
}

// ─── Re-rendering: the cascade and memo ────────────────────────────────────

export function cascadeAnim() {
	const t = `<div class="t-compact">${tree([
		'page', 'CartPage', { cls: 'comp sm' }, [
			['rec', 'memo(Recs)', { cls: 'comp sm' }],
			['btn', 'memo(Checkout)', { cls: 'comp sm' }],
			['foot', 'Footer', { cls: 'comp sm' }],
		],
	])}</div>`
	const scene = `<div class="a-cols">${panel('component tree', t, 'wide')}${panel('props this render', `<div class="a-col">${chip('p1', 'options', 'faint')}${chip('p2', 'onCheckout', 'faint')}</div>`)}</div>`
	const inline = [
		{ phase: 'schedule', fn: 'setCount(c => c + 1)', say: 'A state change in <code>CartPage</code>: the only real trigger.', set: { page: 'run' } },
		{ phase: 'render', fn: 'Footer', say: 'Not memoized: a child re-renders whenever its parent does, props or not.', set: { foot: 'run' } },
		{ phase: 'render', fn: '{ limit: 3 } !== { limit: 3 }', say: 'The page created a new <code>options</code> object and a new arrow function. <code>memo</code> compares props with <code>Object.is</code>, sees “changes”, and renders anyway.', set: { p1: 'bad', p2: 'bad', rec: 'run', btn: 'run' }, txt: { p1: 'options: new object', p2: 'onCheckout: new function' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: <code>CartPage</code>, <code>Recommendations</code>, <code>CheckoutButton</code> and <code>Footer</code> all rendered. <code>memo</code> did nothing.', set: { page: '', rec: 'bad', btn: 'bad', foot: 'done' } },
	]
	const stable = [
		{ phase: 'schedule', fn: 'setCount(c => c + 1)', say: 'Same state change.', set: { page: 'run' } },
		{ phase: 'render', fn: 'Footer', say: 'Still re-renders: no <code>memo</code>.', set: { foot: 'run' } },
		{ phase: 'render', fn: 'useMemo / useCallback → same references', say: 'This time <code>options</code> and <code>onCheckout</code> are the same objects as last render, so <code>memo</code> skips both children.', set: { p1: 'ok', p2: 'ok', rec: 'skip', btn: 'skip' }, txt: { p1: 'options: same object', p2: 'onCheckout: same function' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: only <code>CartPage</code> and <code>Footer</code> rendered.', set: { page: '', foot: 'done' } },
	]
	return anim({
		id: 'hooks-cascade-anim',
		caption: 'One click on “Add”: who renders depends on memo and on prop identity (both recorded). Recs = Recommendations.',
		scenarios: [
			{ name: 'Inline props', intro: '<code>options={{ limit: 3 }}</code> and <code>onCheckout={() => …}</code> written inline.', scene, steps: inline },
			{ name: 'useMemo + useCallback', intro: 'The same props kept stable between renders.', scene, steps: stable },
		],
	})
}
