// Step-through animations for the notes. Function names and ordering follow
// the notes (React 19.2.5 source).

import { MICRO, TASK, MUTATION, event, frames, withStacks } from './stacks.mjs'
import { anim, node, chip, tree, panel } from './anim.mjs'

const lt = (s) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ═══ Reconciliation ═════════════════════════════════════════════════════════

export function rule1Anim() {
	const scene = `
		<div class="a-cols">
			${panel('current fibers (on screen)', tree(['c-app', 'App', { cls: 'comp' }, [['c-div', 'div', { cls: 'host', flag: true }, [['c-counter', 'Counter', { cls: 'comp', sub: 'count: 3' }]]]]]))}
			${panel('new elements (App returned)', tree(['e-span', lt('<span>'), { cls: 'el' }, [['e-counter', lt('<Counter />'), { cls: 'el' }]]]))}
			${panel('work-in-progress', tree(['w-span', 'span', { cls: 'host', s: 'ghost', flag: true }, [['w-counter', 'Counter', { cls: 'comp', sub: 'count: 0', s: 'ghost' }]]]))}
		</div>
		<div class="a-cols" style="margin-top:14px">
			${panel('checks', `<div class="a-col">${chip('k-key', 'key: ?')}${chip('k-type', 'type: ?')}</div>`)}
			${panel('DOM', `<div class="a-dom"><div class="an" data-k="d-old">${lt('<div><button>3</button></div>')}</div><div class="an" data-k="d-new" data-s="hide">${lt('<span><button>0</button></span>')}</div></div>`)}
		</div>`
	const steps = [
		{ phase: 'render', fn: 'App()', say: 'App re-renders. Last time it returned <code>&lt;div&gt;&lt;Counter/&gt;&lt;/div&gt;</code>; now it returns <code>&lt;span&gt;&lt;Counter/&gt;&lt;/span&gt;</code>.', set: { 'c-app': 'run' } },
		{ phase: 'render', fn: 'reconcileChildFibers(App, currentFirstChild: div, newChild: <span>)', say: 'React reconciles App’s child: the <b>current</b> <code>div</code> fiber against the <b>new</b> <code>span</code> element. Only this one position is compared.', set: { 'c-app': '', 'c-div': 'cmp', 'e-span': 'cmp' } },
		{ phase: 'render', fn: 'reconcileSingleElement → child.key === element.key', say: 'First the key. Both are <code>null</code>, so this is the same slot.', set: { 'k-key': 'ok' }, txt: { 'k-key': 'key: null === null ✓' } },
		{ phase: 'render', fn: 'child.elementType === element.type', say: 'Then the type: <code>\'div\' !== \'span\'</code>. A different type means React assumes a completely different subtree. <b>It doesn’t look inside.</b>', set: { 'k-type': 'bad' }, txt: { 'k-type': "type: 'div' !== 'span' ✗" } },
		{ phase: 'render', fn: 'deleteRemainingChildren(App, div)   // App.flags |= ChildDeletion', say: 'The old <code>div</code> fiber is marked for deletion, and its whole subtree goes with it: <code>Counter</code> and its state (<code>count: 3</code>), even though a <code>&lt;Counter/&gt;</code> is still being rendered.', set: { 'c-div': 'del', 'c-counter': 'del', 'c-div-flag': '' }, txt: { 'c-div-flag': 'delete' } },
		{ phase: 'render', fn: 'createFiberFromElement(<span>)', say: 'A brand-new fiber for <code>span</code>: no alternate, nothing reused. It is flagged <b>Placement</b> (insert).', set: { 'e-span': '', 'w-span': 'new', 'w-span-flag': '' }, txt: { 'w-span-flag': 'Placement' } },
		{ phase: 'render', fn: 'beginWork(span) → mountChildFibers(span, null, <Counter />)', say: 'Inside a new subtree there is nothing old to compare against, so every child is <b>mounted</b> from scratch.', set: { 'e-counter': 'cmp', 'w-counter': 'new' } },
		{ phase: 'render', fn: 'Counter() → mountState(0)', say: '<code>Counter</code> runs as a mount: <code>useState</code> returns the initial value <code>0</code>. The old <code>count: 3</code> lives on a fiber that is about to be destroyed.', set: { 'e-counter': '', 'w-counter': 'new hl' } },
		{ phase: 'commit', fn: 'commitDeletionEffects(div)', say: 'Commit, mutation phase: the deleted <code>Counter</code> runs its effect cleanups and refs are detached…', set: { 'w-counter': 'new', 'c-counter': 'del hl', 'd-old': 'del' } },
		{ phase: 'commit', fn: 'removeChild(<div>) · appendChild(<span>)', say: '…then the old <code>&lt;div&gt;</code> is removed and the new <code>&lt;span&gt;</code> subtree (built off-screen during <code>completeWork</code>) is inserted in one go. The counter shows <b>0</b>.', set: { 'c-counter': 'del faint', 'c-div': 'del faint', 'd-old': 'hide', 'd-new': 'new' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		const single = f.reconcileAfterCall('App', 'reconcileSingleElement')
		return [f.call('App'), f.reconcileAfterCall('App'), single, single, [...single, 'deleteRemainingChildren'], [...single, 'createFiberFromElement', 'createFiberFromTypeAndProps'], f.reconcile('span'), f.call('Counter', 'mountState'), f.commit(...MUTATION, 'commitDeletionEffects'), f.commit(...MUTATION, 'commitPlacement', 'insertOrAppendPlacementNode')]
	})())
	return anim({
		id: 'rule1',
		caption: 'Rule 1, animated: one failed type check throws away the entire subtree, including state that “looks” identical.',
		scenarios: [{ name: 'div → span', intro: 'The parent changes <code>&lt;div&gt;</code> to <code>&lt;span&gt;</code> around an identical <code>&lt;Counter /&gt;</code>. Press <b>Play</b>.', scene, steps: stacked }],
	})
}

export function rule2Anim() {
	const scene = `
		<div class="a-cols">
			${panel('current fiber', tree(['c-div', 'div', { cls: 'host', sub: '#node-1', flag: true }, [['c-counter', 'Counter', { cls: 'comp', sub: 'count: 3' }]]]))}
			${panel('new element', tree(['e-div', lt('<div className="after">'), { cls: 'el' }, [['e-counter', lt('<Counter />'), { cls: 'el' }]]]))}
		</div>
		<div class="a-cols" style="margin-top:14px">
			${panel('checks', `<div class="a-col">${chip('k-key', 'key: ?')}${chip('k-type', 'type: ?')}</div>`)}
			${panel('props diff (commitUpdate)', `<div class="a-col">${chip('p-class', "className: 'before' → 'after'", 'faint')}${chip('p-title', "title: 'stuff' → 'stuff'", 'faint')}</div>`)}
			${panel('DOM', `<div class="a-dom">&lt;div class="<span class="an" data-k="d-class">before</span>" title="stuff"&gt;<br>&nbsp;&nbsp;&lt;button&gt;3&lt;/button&gt;<br>&lt;/div&gt;</div>`)}
		</div>`
	const steps = [
		{ phase: 'render', fn: 'reconcileSingleElement(parent, div, <div className="after">)', say: 'Same position, so React compares the current <code>div</code> fiber with the new <code>&lt;div&gt;</code> element.', set: { 'c-div': 'cmp', 'e-div': 'cmp' } },
		{ phase: 'render', fn: 'child.key === element.key', say: 'Keys match (<code>null</code>).', set: { 'k-key': 'ok' }, txt: { 'k-key': 'key: null === null ✓' } },
		{ phase: 'render', fn: 'child.elementType === element.type', say: 'Types match: <code>\'div\' === \'div\'</code>.', set: { 'k-type': 'ok' }, txt: { 'k-type': "type: 'div' === 'div' ✓" } },
		{ phase: 'render', fn: 'useFiber(div, newProps) → createWorkInProgress(div, pendingProps)', say: '<b>Same type → keep it.</b> React reuses the fiber (via its alternate) and with it the same DOM node (<code>stateNode</code>). Only the props are new.', set: { 'c-div': 'keep', 'e-div': '' } },
		{ phase: 'render', fn: 'beginWork(Counter): same type → reuse, call Counter(props)', say: 'Going down, <code>Counter</code> is also the same type at the same position, so its hook list, and <code>count: 3</code>, survive.', set: { 'c-counter': 'keep hl', 'e-counter': 'cmp' } },
		{ phase: 'render', fn: 'completeWork(div): oldProps !== newProps → markUpdate()', say: 'On the way back up, the host fiber got a new props object, so it is flagged <b>Update</b>. Nothing is written to the DOM yet.', set: { 'c-counter': 'keep', 'e-counter': '', 'c-div-flag': '' }, txt: { 'c-div-flag': 'Update' } },
		{ phase: 'commit', fn: "commitUpdate(dom, 'div', oldProps, newProps)", say: 'Commit compares the old and new props one by one…', set: { 'p-class': 'upd', 'p-title': 'ok' }, txt: { 'p-title': "title: 'stuff' === 'stuff' (skip)" } },
		{ phase: 'commit', fn: "dom.className = 'after'", say: '…and writes <b>only</b> what changed. <code>title</code> isn’t touched, the node isn’t recreated, and <code>Counter</code> still shows 3.', set: { 'd-class': 'upd' }, txt: { 'd-class': 'after' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		const single = f.reconcile('parent', 'reconcileSingleElement')
		return [single, single, single, [...single, 'useFiber', 'createWorkInProgress'], f.call('Counter'), f.complete('div'), f.commit(...MUTATION, 'commitUpdate'), f.commit(...MUTATION, 'commitUpdate')]
	})())
	return anim({
		id: 'rule2',
		caption: 'Rule 2, animated: same type keeps the fiber, the DOM node and the state; only changed attributes are written.',
		scenarios: [{ name: 'className change', intro: '<code>&lt;div className="before"&gt;</code> becomes <code>&lt;div className="after"&gt;</code>. Press <b>Play</b>.', scene, steps: stacked }],
	})
}

export function keysAnim() {
	const rows = (prefix, items) => `<div class="a-col">${items.map(([k, label, s = '']) => node(`${prefix}${k}`, label, { cls: s ? '' : 'host', s })).join('')}</div>`
	const domList = (items) => `<div class="a-dom">&lt;ul&gt;${items.map(([k, label, s = '']) => `<div class="an" data-k="d${k}"${s ? ` data-s="${s}"` : ''}>&nbsp;&nbsp;&lt;li&gt;<span data-k="d${k}-t">${label}</span>&lt;/li&gt;</div>`).join('')}&lt;/ul&gt;</div>`

	const noKeyScene = `<div class="a-cols">
		${panel('old fibers (by index)', rows('o', [['0', '0 · Duke'], ['1', '1 · Villanova']]))}
		${panel('new elements', rows('n', [['0', '0 · Connecticut', 'x'], ['1', '1 · Duke', 'x'], ['2', '2 · Villanova', 'x']]))}
		${panel('DOM', domList([['0', 'Duke'], ['1', 'Villanova'], ['2', 'Villanova', 'hide']]))}
	</div>`
	const noKeySteps = [
		{ phase: 'render', fn: 'reconcileChildrenArray(ul, [Duke, Villanova], [Connecticut, Duke, Villanova])', say: 'No keys, so children are matched <b>by position</b>: old #0 with new #0, and so on.' },
		{ phase: 'render', fn: 'updateSlot(old #0 Duke, new #0 Connecticut)', say: 'Slot 0: key <code>null === null</code>, type <code>li === li</code> → reuse the <b>Duke</b> fiber and give it the text “Connecticut”.', set: { o0: 'upd hl', n0: 'cmp' }, txt: { 'o0-label': '0 · Duke → Connecticut' } },
		{ phase: 'render', fn: 'updateSlot(old #1 Villanova, new #1 Duke)', say: 'Slot 1: same story. The <b>Villanova</b> fiber is reused to show “Duke”.', set: { o0: 'upd', n0: '', o1: 'upd hl', n1: 'cmp' }, txt: { 'o1-label': '1 · Villanova → Duke' } },
		{ phase: 'render', fn: 'createChild(ul, <li>Villanova</li>)   // Placement', say: 'The old list ran out, so new #2 is a brand-new fiber.', set: { o1: 'upd', n1: '', n2: 'new' } },
		{ phase: 'commit', fn: 'commitTextUpdate ×2 · appendChild(<li>)', say: '<b>3 DOM operations.</b> Every existing row was rewritten, and any state inside a row (an input, a checkbox) is now attached to the wrong school.', set: { n2: '', d0: 'upd', d1: 'upd', d2: 'new' }, txt: { 'd0-t': 'Connecticut', 'd1-t': 'Duke' } },
	]

	const keyScene = `<div class="a-cols">
		${panel('old fibers', rows('o', [['d', 'key="duke"'], ['v', 'key="vill"']]))}
		${panel('new elements', rows('n', [['c', 'key="conn"', 'x'], ['d', 'key="duke"', 'x'], ['v', 'key="vill"', 'x']]))}
		${panel('existingChildren (Map)', `<div class="a-col">${chip('m-d', 'duke → fiber', 'ghost')}${chip('m-v', 'vill → fiber', 'ghost')}${chip('lp', 'lastPlacedIndex = 0', 'ghost')}</div>`)}
		${panel('DOM', domList([['c', 'Connecticut', 'hide'], ['d', 'Duke'], ['v', 'Villanova']]))}
	</div>`
	const keySteps = [
		{ phase: 'render', fn: "updateSlot(old #0 key='duke', new #0 key='conn')", say: 'Pass 1 walks both lists while keys line up. <code>\'conn\' !== \'duke\'</code>, so <code>updateSlot</code> returns <code>null</code> and the fast path stops.', set: { od: 'cmp', nc: 'cmp' } },
		{ phase: 'render', fn: 'mapRemainingChildren(oldFiber)', say: 'Pass 3: the remaining old fibers go into a <code>Map</code> keyed by <code>key</code>.', set: { od: '', nc: '', 'm-d': '', 'm-v': '', lp: '' } },
		{ phase: 'render', fn: "updateFromMap(map, 'conn') → not found → createFiberFromElement", say: '“conn” isn’t in the map: a new fiber, flagged <b>Placement</b> (insert).', set: { nc: 'new hl' } },
		{ phase: 'render', fn: "updateFromMap(map, 'duke') → reuse · placeChild: oldIndex 0 ≥ lastPlacedIndex 0", say: '“duke” is found and its fiber reused (removed from the map). Its old index 0 isn’t smaller than <code>lastPlacedIndex</code>, so it <b>stays</b>.', set: { nc: 'new', nd: 'keep hl', od: 'keep', 'm-d': 'del' } },
		{ phase: 'render', fn: "updateFromMap(map, 'vill') → reuse · placeChild: oldIndex 1 ≥ 0", say: '“vill” is reused and stays too. <code>lastPlacedIndex</code> becomes 1. The map is now empty, so nothing is deleted.', set: { nd: 'keep', nv: 'keep hl', ov: 'keep', 'm-v': 'del', lp: 'upd' }, txt: { lp: 'lastPlacedIndex = 1' } },
		{ phase: 'commit', fn: 'insertBefore(<li>Connecticut</li>, <li>Duke</li>)', say: '<b>1 DOM operation.</b> Duke and Villanova are untouched, with their state.', set: { nv: 'keep', dc: 'new' } },
	]
	return anim({
		id: 'keys',
		caption: 'Inserting at the front of a list, with and without keys.',
		scenarios: [
			{ name: 'No keys (by index)', intro: 'Old: Duke, Villanova. New: <b>Connecticut</b>, Duke, Villanova. No <code>key</code>s.', scene: noKeyScene, steps: noKeySteps },
			{ name: 'With keys', intro: 'Same change, but every <code>&lt;li&gt;</code> has a stable <code>key</code>.', scene: keyScene, steps: keySteps },
		],
	})
}

export function positionAnim() {
	const slot = (n, inner) => `<div class="slot"><span class="a-label">#${n}</span>${inner}</div>`
	const toggle = chip('flag', 'isPlayerA = true')
	const screen = (k) => `<div class="a-dom">Score for <span class="an" data-k="${k}-who">Taylor</span>: <span class="an" data-k="${k}-n">5</span></div>`

	const ternary = {
		name: 'Ternary, no key',
		intro: '<code>{isPlayerA ? &lt;Counter person="Taylor" /&gt; : &lt;Counter person="Sarah" /&gt;}</code>. Taylor has scored 5.',
		scene: `<div class="a-cols">
			${panel('state', `<div class="a-col">${toggle}</div>`)}
			${panel('children of div', `<div class="slots">${slot(0, node('c0', 'Counter', { cls: 'comp', sub: 'Taylor · count 5' }))}</div>`)}
			${panel('screen', screen('s'))}
		</div>`,
		steps: [
			{ phase: 'trigger', fn: 'setIsPlayerA(false)', say: 'Switch players.', set: { flag: 'upd' }, txt: { flag: 'isPlayerA = false' } },
			{ phase: 'render', fn: 'reconcileSingleElement(div, Counter, <Counter person="Sarah" />)', say: 'Both branches put a <code>Counter</code> as child <b>#0</b>. React only sees the position, not which line of JSX produced it.', set: { flag: '', c0: 'cmp' } },
			{ phase: 'render', fn: 'key null === null ✓ · type Counter === Counter ✓ → useFiber', say: 'Same key, same type → <b>reuse</b> the fiber, hooks and all.', set: { c0: 'keep hl' } },
			{ phase: 'render', fn: 'Counter({ person: "Sarah" })', say: 'Counter re-renders with the new props but the <b>old state</b>: Sarah inherits Taylor’s score.', set: { c0: 'keep' }, txt: { 'c0-sub': 'Sarah · count 5' } },
			{ phase: 'commit', fn: 'commitTextUpdate("Taylor" → "Sarah")', say: 'Only the name changes on screen. Usually not what you want.', set: { 's-who': 'upd', 's-n': 'bad' }, txt: { 's-who': 'Sarah' } },
		],
	}
	const slots = {
		name: '&& slots',
		intro: '<code>{isPlayerA &amp;&amp; &lt;Counter person="Taylor" /&gt;}{!isPlayerA &amp;&amp; &lt;Counter person="Sarah" /&gt;}</code>',
		scene: `<div class="a-cols">
			${panel('state', `<div class="a-col">${toggle}</div>`)}
			${panel('children of div', `<div class="slots">${slot(0, node('c0', 'Counter', { cls: 'comp', sub: 'Taylor · count 5' }))}${slot(1, `${node('f1', 'false', { cls: 'el' })}${node('c1', 'Counter', { cls: 'comp', sub: 'Sarah · count 0', s: 'hide' })}`)}</div>`)}
			${panel('screen', screen('s'))}
		</div>`,
		steps: [
			{ phase: 'trigger', fn: 'setIsPlayerA(false)', say: 'Switch players.', set: { flag: 'upd' }, txt: { flag: 'isPlayerA = false' } },
			{ phase: 'render', fn: 'reconcileChildrenArray(div, [Counter, null], [false, <Counter />])', say: 'The children array always has <b>two</b> slots. A <code>false</code> leaves a hole, so the counters never share an index.', set: { flag: '', c0: 'cmp', f1: 'cmp' } },
			{ phase: 'render', fn: 'slot #0: Counter vs false → deleteChild(Counter)', say: 'Slot 0 now renders nothing: Taylor’s Counter is deleted, with its state.', set: { c0: 'del', f1: '' } },
			{ phase: 'render', fn: 'slot #1: nothing vs <Counter /> → createChild · mountState(0)', say: 'Slot 1 had nothing before, so Sarah gets a <b>fresh</b> Counter starting at 0.', set: { f1: 'hide', c1: 'new hl' } },
			{ phase: 'commit', fn: 'removeChild(old) · insertBefore(new)', say: 'Different positions = different components. Each player keeps a separate counter.', set: { c1: 'new', c0: 'del faint', 's-who': 'new', 's-n': 'new' }, txt: { 's-who': 'Sarah', 's-n': '0' } },
		],
	}
	const keyed = {
		name: 'Different keys',
		intro: '<code>{isPlayerA ? &lt;Counter key="Taylor" … /&gt; : &lt;Counter key="Sarah" … /&gt;}</code>',
		scene: `<div class="a-cols">
			${panel('state', `<div class="a-col">${toggle}</div>`)}
			${panel('children of div', `<div class="slots">${slot(0, `${node('c0', 'Counter', { cls: 'comp', sub: 'key="Taylor" · count 5' })}${node('c1', 'Counter', { cls: 'comp', sub: 'key="Sarah" · count 0', s: 'hide' })}`)}</div>`)}
			${panel('screen', screen('s'))}
		</div>`,
		steps: [
			{ phase: 'trigger', fn: 'setIsPlayerA(false)', say: 'Switch players.', set: { flag: 'upd' }, txt: { flag: 'isPlayerA = false' } },
			{ phase: 'render', fn: 'reconcileSingleElement(div, Counter, <Counter key="Sarah" />)', say: 'Same position (#0), same type, but now there is a key to check first.', set: { flag: '', c0: 'cmp' } },
			{ phase: 'render', fn: "child.key === element.key → 'Taylor' !== 'Sarah' ✗", say: 'Different key → not the same component. The old fiber is deleted…', set: { c0: 'del' } },
			{ phase: 'render', fn: 'createFiberFromElement(<Counter key="Sarah" />) · mountState(0)', say: '…and a new one is mounted with fresh state.', set: { c1: 'new hl' } },
			{ phase: 'commit', fn: 'removeChild(old) · insertBefore(new)', say: 'Changing the <code>key</code> is the standard way to reset a component.', set: { c1: 'new', c0: 'hide', 's-who': 'new', 's-n': 'new' }, txt: { 's-who': 'Sarah', 's-n': '0' } },
		],
	}
	return anim({
		id: 'position',
		caption: 'State belongs to a position in the tree (plus type and key), not to the JSX that produced it.',
		scenarios: [ternary, slots, keyed],
	})
}

// ═══ Child reconciliation: simulate reconcileChildrenArray ══════════════════

function simulateListDiff(oldKeys, newKeys) {
	const steps = []
	const oldIdx = Object.fromEntries(oldKeys.map((k, i) => [k, i]))
	const result = {} // key -> stay | move | insert
	let lp = 0
	let newIdx = 0
	let oi = 0
	const lpTxt = () => `lastPlacedIndex = ${lp}`
	const place = (k) => {
		if (k in oldIdx) {
			if (oldIdx[k] < lp) return (result[k] = 'move')
			lp = oldIdx[k]
			return (result[k] = 'stay')
		}
		return (result[k] = 'insert')
	}
	const S = { stay: 'keep', move: 'upd', insert: 'new' }
	let prevHl = {}
	const step = (st) => {
		const set = { ...prevHl, ...(st.set ?? {}) }
		steps.push({ ...st, set })
		prevHl = st.unhl ?? {}
	}

	// Pass 1
	let broke = false
	for (; oi < oldKeys.length && newIdx < newKeys.length; newIdx++, oi++) {
		const ok = oldKeys[oi]
		const nk = newKeys[newIdx]
		if (ok !== nk) {
			broke = true
			step({ phase: 'render', fn: `updateSlot(old '${ok}', new '${nk}') → null`, say: `<b>Pass 1</b> (lockstep): key <code>'${nk}' !== '${ok}'</code>, so the fast path breaks.`, set: { [`o-${ok}`]: 'cmp', [`n-${nk}`]: 'cmp', pass: 'on' }, unhl: { [`o-${ok}`]: '', [`n-${nk}`]: '' }, txt: { pass: 'pass 1 → break' } })
			break
		}
		const r = place(nk)
		step({ phase: 'render', fn: `updateSlot(old '${ok}', new '${nk}') · placeChild(…, ${newIdx})`, say: `<b>Pass 1</b> (lockstep): keys match → reuse the fiber. Old index ${oldIdx[nk]} ≥ lastPlacedIndex → <b>stay</b>.`, set: { [`o-${ok}`]: 'keep', [`n-${nk}`]: `${S[r]} hl`, pass: 'on', lp: 'upd' }, unhl: { [`n-${nk}`]: S[r], lp: '' }, txt: { pass: 'pass 1', lp: lpTxt() } })
	}

	if (!broke && newIdx === newKeys.length) {
		const rest = oldKeys.slice(oi)
		if (rest.length) step({ phase: 'render', fn: `deleteRemainingChildren(parent, '${rest[0]}')`, say: `<b>Pass 2a</b>: the new list ended, so everything left in the old list is deleted: ${rest.map((k) => `<code>${k}</code>`).join(', ')}.`, set: Object.fromEntries([...rest.map((k) => [`o-${k}`, 'del']), ['pass', 'on']]), txt: { pass: 'pass 2a' } })
		rest.forEach((k) => (result[k] = 'delete'))
	} else if (!broke && oi === oldKeys.length) {
		for (; newIdx < newKeys.length; newIdx++) {
			const nk = newKeys[newIdx]
			place(nk)
			step({ phase: 'render', fn: `createChild(parent, '${nk}') · placeChild → Placement`, say: `<b>Pass 2b</b>: the old list ended, so <code>${nk}</code> is a new fiber, flagged <b>Placement</b> (insert).`, set: { [`n-${nk}`]: 'new hl', pass: 'on' }, unhl: { [`n-${nk}`]: 'new' }, txt: { pass: 'pass 2b' } })
		}
	} else {
		const remaining = oldKeys.slice(oi)
		step({ phase: 'render', fn: 'mapRemainingChildren(oldFiber)', say: `<b>Pass 3</b>: the remaining old fibers go into a <code>Map</code> keyed by key: ${remaining.map((k) => `<code>${k}</code>`).join(', ')}.`, set: { ...Object.fromEntries(remaining.map((k) => [`m-${k}`, ''])), pass: 'on' }, txt: { pass: 'pass 3' } })
		const map = new Set(remaining)
		for (; newIdx < newKeys.length; newIdx++) {
			const nk = newKeys[newIdx]
			if (map.has(nk)) {
				map.delete(nk)
				const before = lp
				const r = place(nk)
				const why = r === 'move' ? `old index ${oldIdx[nk]} &lt; lastPlacedIndex ${before} → <b>move</b> (Placement)` : `old index ${oldIdx[nk]} ≥ lastPlacedIndex ${before} → <b>stay</b>, lastPlacedIndex = ${lp}`
				step({ phase: 'render', fn: `updateFromMap(map, '${nk}') · placeChild(fiber, ${before}, ${newIdx})`, say: `<code>${nk}</code> found in the map → reuse its fiber. ${why}.`, set: { [`n-${nk}`]: `${S[r]} hl`, [`o-${nk}`]: 'keep', [`m-${nk}`]: 'del', lp: 'upd' }, unhl: { [`n-${nk}`]: S[r], lp: '' }, txt: { lp: lpTxt() } })
			} else {
				place(nk)
				step({ phase: 'render', fn: `updateFromMap(map, '${nk}') → createFiberFromElement`, say: `<code>${nk}</code> isn’t in the map → new fiber, flagged <b>Placement</b> (insert).`, set: { [`n-${nk}`]: 'new hl' }, unhl: { [`n-${nk}`]: 'new' } })
			}
		}
		if (map.size) {
			const left = [...map]
			step({ phase: 'render', fn: `existingChildren.forEach(deleteChild)`, say: `Leftovers in the map are deleted: ${left.map((k) => `<code>${k}</code>`).join(', ')}.`, set: Object.fromEntries(left.flatMap((k) => [[`o-${k}`, 'del'], [`m-${k}`, 'del']])) })
			left.forEach((k) => (result[k] = 'delete'))
		}
	}

	// Commit: move DOM nodes into the new order
	const ops = Object.values(result).filter((r) => r !== 'stay').length
	const css = {}
	const set = { pass: 'on' }
	newKeys.forEach((k, i) => {
		css[`d-${k}`] = { '--x': String(i) }
		set[`d-${k}`] = S[result[k]]
	})
	oldKeys.filter((k) => result[k] === 'delete').forEach((k) => (set[`d-${k}`] = 'gone'))
	step({ phase: 'commit', fn: 'commitPlacement / removeChild for each flagged fiber', say: `Commit applies the flags: <b>${ops} DOM operation${ops === 1 ? '' : 's'}</b>.${ops > 1 && Object.values(result).filter((r) => r === 'move').length > 1 ? ' Moving just one item would have been enough: this is the worst case of the left-to-right heuristic.' : ''}`, set, css, txt: { pass: 'commit' } })
	return steps
}

export function listDiffAnim() {
	const scenarios = [
		['Append', 'abc', 'abcd'],
		['Remove middle', 'abc', 'ac'],
		['Prepend', 'abc', 'xabc'],
		['First → last', 'abcd', 'bcda'],
		['Last → first', 'abcd', 'dabc'],
	].map(([name, o, n]) => {
		const oldKeys = [...o]
		const newKeys = [...n]
		const all = [...new Set([...oldKeys, ...newKeys])]
		const track = (prefix, keys, label) =>
			`<div class="a-label">${label}</div><div class="a-track">${keys
				.map((k, i) => node(`${prefix}-${k}`, k, { sub: prefix === 'o' ? `idx ${i}` : `#${i}`, cls: prefix === 'n' ? 'el' : 'host', s: '' }).replace('class="an node', `style="--x:${i}" class="an node`))
				.join('')}</div>`
		const dom = `<div class="a-label">DOM</div><div class="a-track">${all
			.map((k) => {
				const i = oldKeys.includes(k) ? oldKeys.indexOf(k) : newKeys.indexOf(k)
				return `<div class="an node host" data-k="d-${k}" style="--x:${i}"${oldKeys.includes(k) ? '' : ' data-s="ghost"'}>&lt;li&gt;${k}</div>`
			})
			.join('')}</div>`
		const info = `<div class="a-row" style="margin:6px 0 10px">${chip('pass', 'start')}${chip('lp', 'lastPlacedIndex = 0')}<span class="a-label" style="margin-left:6px">map</span>${oldKeys.map((k) => chip(`m-${k}`, `${k} → fiber`, 'ghost')).join('')}</div>`
		return {
			name,
			intro: `Old <code>[${oldKeys.join(', ')}]</code> → new <code>[${newKeys.join(', ')}]</code>. Press <b>Play</b> to run <code>reconcileChildrenArray</code>.`,
			scene: `<div class="ld-scene">${track('o', oldKeys, 'old fibers')}${track('n', newKeys, 'new elements')}${info}${dom}</div>`,
			steps: simulateListDiff(oldKeys, newKeys),
		}
	})
	return anim({
		id: 'listdiff-anim',
		caption: 'Colors: <b>yellow</b> stay, <b>orange</b> move, <b>green</b> insert, <b>pink</b> delete. A reused fiber moves only if its old index is smaller than <code>lastPlacedIndex</code>.',
		scenarios,
	})
}

// ═══ React Fiber ════════════════════════════════════════════════════════════

export function doubleBufferAnim() {
	const t = (p, s = '') =>
		tree([`${p}-root`, 'HostRoot', { cls: 'root', s }, [[`${p}-counter`, 'Counter', { cls: 'comp', sub: 'count: 0', s }, [[`${p}-button`, 'button', { cls: 'host', sub: '"0"', s }]]]]])
	const scene = `
		<div class="a-row" style="justify-content:center;margin-bottom:12px">${chip('ptr', 'root.current → tree A')}${chip('alt', 'A.alternate ↔ B', 'ghost')}</div>
		<div class="a-cols">
			${panel('tree A', t('a'), 'db-a')}
			${panel('tree B', t('b', 'ghost'), 'db-b')}
			${panel('screen', `<div class="a-dom">&lt;button&gt;<span class="an" data-k="screen">0</span>&lt;/button&gt;</div>`)}
		</div>`
	const steps = [
		{ phase: 'commit', fn: 'root.current = A', say: 'After mount there is one tree, <b>A</b>. It is <code>current</code>: what the DOM reflects.', set: { 'a-root': 'done', 'a-counter': 'done', 'a-button': 'done' } },
		{ phase: 'event', fn: 'setCount(1)', say: 'Click. An update is queued on Counter’s hook. Nothing is rendered yet.', set: { 'a-counter': 'done hl' } },
		{ phase: 'render', fn: 'createWorkInProgress(A.root)', say: 'Render starts by creating a <b>work-in-progress</b> copy of the root. The copies are linked to the originals through <code>alternate</code>.', set: { 'a-counter': 'done', 'b-root': 'new', alt: '' } },
		{ phase: 'render', fn: 'createWorkInProgress(A.counter) → Counter() → count = 1', say: 'Counter runs <b>on tree B</b>: its hook says 1. Tree A still says 0, and A is what is on screen.', set: { 'b-counter': 'run' }, txt: { 'b-counter-sub': 'count: 1' } },
		{ phase: 'render', fn: 'reconcileChildren → useFiber(A.button) → completeWork: flag Update', say: 'The button fiber is copied too, with new props. If React abandoned this render now, it would just drop B: A was never touched.', set: { 'b-counter': 'new', 'b-button': 'new' }, txt: { 'b-button-sub': '"1"' } },
		{ phase: 'commit', fn: 'root.current = finishedWork', say: 'Commit writes the DOM, then flips <b>one pointer</b>. B is now current; A becomes the spare.', set: { ptr: 'on', 'b-root': 'done', 'b-counter': 'done', 'b-button': 'done', 'a-root': 'faint', 'a-counter': 'faint', 'a-button': 'faint', screen: 'upd' }, txt: { ptr: 'root.current → tree B', screen: '1' } },
		{ phase: 'event', fn: 'setCount(2)', say: 'Second click.', set: { ptr: '', 'b-counter': 'done hl', screen: '' } },
		{ phase: 'render', fn: 'createWorkInProgress(B.counter) → reuses B.alternate (tree A)', say: 'No new allocation this time: the work-in-progress <b>is</b> tree A, recycled. Counter runs on it: count 2.', set: { 'b-counter': 'done', 'a-root': 'new', 'a-counter': 'run', 'a-button': 'new' }, txt: { 'a-counter-sub': 'count: 2', 'a-button-sub': '"2"' } },
		{ phase: 'commit', fn: 'root.current = finishedWork', say: 'Commit flips the pointer back to A. The two trees keep taking turns.', set: { ptr: 'on', 'a-root': 'done', 'a-counter': 'done', 'a-button': 'done', 'b-root': 'faint', 'b-counter': 'faint', 'b-button': 'faint', screen: 'upd' }, txt: { ptr: 'root.current → tree A', screen: '2' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		const reuse = [...f.reconcileAfterCall('Counter', 'reconcileSingleElement', 'useFiber', 'createWorkInProgress')]
		return [[], event('dispatchSetState'), f.start('createWorkInProgress'), f.call('Counter', 'updateReducer'), reuse, f.commit('flushMutationEffects'), event('dispatchSetState'), f.call('Counter', 'updateReducer'), f.commit('flushMutationEffects')]
	})())
	return anim({
		id: 'double-buffer-anim',
		caption: 'Double buffering: render builds the other tree off-screen; commit swaps a single pointer.',
		scenarios: [{ name: 'Two clicks', intro: 'A Counter is clicked twice. Watch which tree is <code>current</code>.', scene, steps: stacked }],
	})
}

// ═══ Hooks ══════════════════════════════════════════════════════════════════

export function conditionalHooksAnim() {
	const call = (k, label, s = 'ghost') => `<div class="an call" data-k="${k}" data-s="${s}"><code data-k="${k}-t">${label}</code></div>`
	const hook = (n, label, val) => node(`h${n}`, `#${n} ${label}`, { cls: 'comp', sub: val, s: 'ghost' })
	const scene = `
		<div class="a-row" style="margin-bottom:12px">${chip('render', 'Render 1 · showName = true')}${chip('warn', '⚠ React has detected a change in the order of Hooks', 'hide')}</div>
		<div class="a-cols">
			${panel('hooks called (in order)', `<div class="a-col">${call('c1', "useState('Ada')")}${call('c2', 'useState(36)')}${call('c3', 'useEffect(…)')}</div>`)}
			${panel('fiber.memoizedState (hook list)', `<div class="a-col">${hook(1, 'state', "'Ada'")}${hook(2, 'state', '36')}${hook(3, 'effect', 'deps: none')}</div>`)}
			${panel('what the component gets', `<div class="a-col">${chip('r-name', "name = 'Ada'", 'ghost')}${chip('r-age', 'age = 36', 'ghost')}${chip('r-eff', 'effect ✓', 'ghost')}</div>`)}
		</div>`
	const steps = [
		{ phase: 'render', fn: "useState('Ada') → mountWorkInProgressHook()", say: 'First render (mount). Each hook call <b>appends</b> a new object to the list.', set: { c1: 'hl', h1: 'new', 'r-name': 'ok' } },
		{ phase: 'render', fn: 'useState(36) → mountWorkInProgressHook()', say: 'Second call → hook #2.', set: { c1: '', c2: 'hl', h2: 'new', 'r-age': 'ok' } },
		{ phase: 'render', fn: 'useEffect(…) → mountWorkInProgressHook()', say: 'Third call → hook #3. Notice the list stores <b>no names</b>: only order.', set: { c2: '', c3: 'hl', h3: 'new', 'r-eff': 'ok' } },
		{ phase: 'render', fn: 'Form({ showName: false })', say: 'Render 2: <code>showName</code> is false, so the first <code>useState</code> is skipped. The hook list from render 1 is still there.', set: { c3: '', c1: 'hide', render: 'upd', h1: '', h2: '', h3: '', 'r-name': 'ghost', 'r-age': 'ghost', 'r-eff': 'ghost' }, txt: { render: 'Render 2 · showName = false' } },
		{ phase: 'render', fn: 'useState(36) → updateWorkInProgressHook() → takes hook #1', say: 'The <b>first</b> call takes hook <b>#1</b>, because that’s the next one in the list. It stores <code>\'Ada\'</code>.', set: { render: '', c2: 'hl', h1: 'bad hl', 'r-age': 'bad' }, txt: { 'r-age': "age = 'Ada' ✗" } },
		{ phase: 'render', fn: 'useEffect(…) → updateWorkInProgressHook() → takes hook #2', say: 'The effect call takes hook #2, which is a <b>state</b> hook. It reads garbage as effect deps.', set: { c2: '', h1: 'bad', c3: 'hl', h2: 'bad hl', 'r-eff': 'bad' }, txt: { 'r-eff': 'effect reads a state hook ✗' } },
		{ phase: 'render', fn: 'console.error(…)', say: 'Hook #3 is never used. React warns in development. That’s the whole reason for the Rules of Hooks: hooks are matched <b>by call order</b>.', set: { c3: '', h2: 'bad', h3: 'faint', warn: 'bad' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		return [f.call('Form', 'mountState', 'mountWorkInProgressHook'), f.call('Form', 'mountState', 'mountWorkInProgressHook'), f.call('Form', 'mountEffect', 'mountWorkInProgressHook'), f.call('Form'), f.call('Form', 'updateReducer', 'updateWorkInProgressHook'), f.call('Form', 'updateEffect', 'updateWorkInProgressHook'), f.call('Form')]
	})())
	return anim({
		id: 'conditional-anim',
		caption: 'Hooks are matched purely by call order. Skip one, and every later call reads someone else’s slot.',
		scenarios: [{ name: 'Conditional hook', intro: '<code>if (showName) { useState(\'Ada\') }</code>, then <code>useState(36)</code> and <code>useEffect</code>.', scene, steps: stacked }],
	})
}

export function setStateQueueAnim() {
	const lines = ['setCount(count + 1)', 'setCount(c => c + 1)', 'setCount(42)', 'setCount(c => c * 2)']
	const actions = ['1', 'c => c + 1', '42', 'c => c * 2']
	const scene = `
		<div class="a-cols">
			${panel('handleClick()', `<div class="a-col">${lines.map((l, i) => `<div class="an call" data-k="l${i}"><code>${l}</code></div>`).join('')}</div>`)}
			${panel('hook.queue (circular)', `<div class="a-col">${lines.map((_, i) => node(`u${i}`, `u${i + 1}`, { cls: 'comp', sub: `action: ${actions[i]}`, s: 'ghost' })).join('')}${chip('pending', 'queue.pending = null')}</div>`)}
			${panel('scheduling & state', `<div class="a-col">${chip('micro', 'microtask: none')}${chip('renders', 'renders: 0')}<div class="a-label" style="margin-top:6px">count</div>${chip('state', '0')}</div>`)}
		</div>`
	const steps = [
		{ phase: 'event', fn: 'dispatchSetState(fiber, queue, 1) · eager: 0 → 1', say: 'The fiber has no pending work, so React computes the new state <b>eagerly</b>: 1 ≠ 0, so a render is needed.', set: { l0: 'hl', u0: 'new', pending: 'upd' }, txt: { 'u0-sub': 'action: 1 · eagerState 1', pending: 'queue.pending → u1' } },
		{ phase: 'schedule', fn: 'scheduleUpdateOnFiber(root, fiber, SyncLane) → queueMicrotask', say: 'A render is scheduled for later, in a microtask. Nothing renders now.', set: { l0: '', micro: 'on', pending: '' }, txt: { micro: 'microtask: scheduled' } },
		{ phase: 'event', fn: 'dispatchSetState(fiber, queue, c => c + 1)', say: 'The fiber now has pending lanes, so no eager computation: the update is just appended. <code>queue.pending</code> always points at the <b>last</b> update.', set: { micro: 'keep', l1: 'hl', u1: 'new', pending: 'upd' }, txt: { pending: 'queue.pending → u2 (u2.next = u1)' } },
		{ phase: 'event', fn: 'dispatchSetState(fiber, queue, 42)', say: 'Appended. The microtask is already scheduled.', set: { l1: '', l2: 'hl', u2: 'new' }, txt: { pending: 'queue.pending → u3 (u3.next = u1)' } },
		{ phase: 'event', fn: 'dispatchSetState(fiber, queue, c => c * 2)', say: 'Appended. The handler returns. Four updates are waiting; nothing has rendered.', set: { l2: '', l3: 'hl', u3: 'new' }, txt: { pending: 'queue.pending → u4 (u4.next = u1)' } },
		{ phase: 'render', fn: 'Counter() → useState → updateReducer(basicStateReducer)', say: 'The microtask renders Counter once. <code>updateReducer</code> folds the queue, starting from the base state 0.', set: { l3: '', pending: '', micro: 'done', renders: 'upd', state: 'hl' }, txt: { micro: 'microtask: running', renders: 'renders: 1' } },
		{ phase: 'render', fn: 'u1: hasEagerState → 1', say: 'u1 already has its eager result: <b>1</b>.', set: { u0: 'done hl', state: 'upd' }, txt: { state: '1' } },
		{ phase: 'render', fn: 'u2: basicStateReducer(1, c => c + 1) → 2', say: 'An updater function receives the <b>latest</b> state: 1 + 1 = <b>2</b>.', set: { u0: 'done', u1: 'done hl' }, txt: { state: '2' } },
		{ phase: 'render', fn: 'u3: basicStateReducer(2, 42) → 42', say: 'A plain value replaces whatever came before: <b>42</b>.', set: { u1: 'done', u2: 'done hl' }, txt: { state: '42' } },
		{ phase: 'render', fn: 'u4: basicStateReducer(42, c => c * 2) → 84', say: '42 × 2 = <b>84</b>. One render, all four updates, in order.', set: { u2: 'done', u3: 'done hl', state: 'ok' }, txt: { state: '84' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		const ds = event('handleClick', 'dispatchSetState')
		return [[...ds, 'dispatchSetStateInternal'], [...ds, 'scheduleUpdateOnFiber', 'ensureRootIsScheduled'], [...ds, 'dispatchSetStateInternal'], [...ds, 'dispatchSetStateInternal'], [...ds, 'dispatchSetStateInternal'], f.call('Counter', 'updateReducer'), f.call('Counter', 'updateReducer'), f.call('Counter', 'updateReducer'), f.call('Counter', 'updateReducer'), f.call('Counter', 'updateReducer')]
	})())
	return anim({
		id: 'queue-anim',
		caption: '<code>setState</code> only queues. The render folds every queued update in order.',
		scenarios: [{ name: 'Four setCount calls', intro: '<code>count</code> is 0 and <code>handleClick</code> calls <code>setCount</code> four times.', scene, steps: stacked }],
	})
}

// ═══ Work loop ══════════════════════════════════════════════════════════════

export function workLoopAnim() {
	const scene = tree([
		'HostRoot',
		'HostRoot',
		{ cls: 'root' },
		[['App', 'App', { cls: 'comp' }, [['Fragment', 'Fragment', { cls: 'comp' }, [['Header', 'Header', { cls: 'comp' }], ['Counter', 'Counter', { cls: 'comp' }, [['button', 'button', { cls: 'host' }, [['text', '"1"', { cls: 'text' }]]]]]]]]]],
	])
	const raw = [
		[['HostRoot'], 'beginWork(HostRoot)', 'bail', 'No own update, but <code>childLanes</code> has Sync → clone the children and continue.'],
		[['App'], 'beginWork(App)', 'bail', 'Same props object, no update, <code>childLanes</code> has Sync → <b>bail out, continue</b>. <code>App()</code> is not called.'],
		[['Fragment'], 'beginWork(Fragment)', 'bail', 'Same → bail out, continue down.'],
		[['Header'], 'beginWork(Header) → null', 'skip', 'Same props, no update, <code>childLanes = 0</code> → <b>skip the whole subtree</b>.'],
		[['Header'], 'completeUnitOfWork(Header) → sibling', 'skip', 'Nothing to complete. Go <b>across</b> to the sibling.'],
		[['Counter'], 'beginWork(Counter) → Counter()', 'run', '<code>lanes</code> has Sync → <b>render</b>: <code>Counter()</code> runs, <code>useState</code> → 1, reconcile <code>&lt;button&gt;</code> → reuse its fiber.'],
		[['button'], 'beginWork(button)', 'run', 'New props object → reconcile its text child <code>"1"</code>. Go <b>down</b>.'],
		[['text'], 'beginWork(text) → null · completeWork(text)', 'done', 'No children. Text changed → flag <code>Update</code>. Climb <b>up</b>.'],
		[['button'], 'completeWork(button)', 'done', 'New props → flag <code>Update</code>. Bubble <code>subtreeFlags</code> to the parent.'],
		[['Counter', 'Fragment', 'App', 'HostRoot'], 'completeWork × 4 → workInProgress = null', 'done', 'Bubble up to the root. Done: <b>only <code>Counter()</code> ran</b>, and the commit will only visit the flagged path.'],
	]
	const final = {}
	let prev = []
	const steps = raw.map(([nodes, fn, s, say]) => {
		const set = {}
		for (const n of prev) set[n] = final[n]
		for (const n of nodes) {
			final[n] = s
			set[n] = `${s} hl`
		}
		prev = nodes
		return { phase: 'render', fn, say, set }
	})
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		return [f.bail('HostRoot'), f.bail('App'), f.bail('Fragment'), f.bail('Header'), [...MICRO, 'renderRootSync', 'workLoopSync', 'performUnitOfWork', 'completeUnitOfWork'], f.call('Counter'), f.reconcile('button'), f.complete('"1"'), f.complete('button'), f.complete('HostRoot')]
	})())
	return anim({
		id: 'workloop-anim',
		caption: 'The work loop for one <code>setN(1)</code>: down with <code>beginWork</code>, across, and up with <code>completeWork</code>.',
		scenarios: [{ name: 'setN(1)', intro: 'The button was clicked; <code>setN(1)</code> queued an update with <code>SyncLane</code> and marked <code>childLanes</code> up to the root.', scene, steps: stacked }],
	})
}

// ═══ Scheduler ══════════════════════════════════════════════════════════════

export function batchingAnim() {
	const lines = ['setCount(c => c + 1)', 'setFlag(true)', "setText('hi')"]
	const scene = `
		<div class="a-cols">
			${panel('handleClick()', `<div class="a-col">${lines.map((l, i) => `<div class="an call" data-k="l${i}"><code>${l}</code></div>`).join('')}<div class="an call" data-k="ret" data-s="faint"><code>}  // handler returns</code></div></div>`)}
			${panel('queued updates', `<div class="a-col">${lines.map((l, i) => node(`u${i}`, ['count', 'flag', 'text'][i], { cls: 'comp', sub: 'SyncLane', s: 'ghost' })).join('')}</div>`)}
			${panel('React', `<div class="a-col">${chip('micro', 'microtask: none')}${chip('renders', 'renders: 0')}${chip('screen', 'screen: old')}</div>`)}
		</div>`
	const steps = [
		{ phase: 'event', fn: 'dispatchSetState → requestUpdateLane() = SyncLane', say: 'Inside a click, the update gets <code>SyncLane</code>. It is stashed in a queue…', set: { l0: 'hl', u0: 'new' } },
		{ phase: 'schedule', fn: 'ensureRootIsScheduled(root) → queueMicrotask(…)', say: '…and React schedules <b>one</b> microtask to process the root later.', set: { l0: '', micro: 'on' }, txt: { micro: 'microtask: scheduled' } },
		{ phase: 'event', fn: 'dispatchSetState(setFlag)', say: 'Second update: queued. The microtask is <b>already scheduled</b>, so nothing new is scheduled.', set: { micro: 'keep', l1: 'hl', u1: 'new' } },
		{ phase: 'event', fn: "dispatchSetState(setText)", say: 'Third update: queued.', set: { l1: '', l2: 'hl', u2: 'new' } },
		{ phase: 'event', fn: 'handler returns', say: 'The handler is done. <b>Nothing has rendered yet</b>: the screen still shows the old UI.', set: { l2: '', ret: 'hl' } },
		{ phase: 'render', fn: 'processRootScheduleInMicrotask → performSyncWorkOnRoot', say: 'The microtask runs and renders the root <b>once</b>, applying all three updates together.', set: { ret: 'faint', micro: 'done', u0: 'done', u1: 'done', u2: 'done', renders: 'upd' }, txt: { micro: 'microtask: ran', renders: 'renders: 1' } },
		{ phase: 'commit', fn: 'commitRoot', say: 'One commit, one paint. That’s automatic batching (React 18+), and it works the same in <code>setTimeout</code> or <code>.then</code>.', set: { renders: '', screen: 'ok' }, txt: { screen: 'screen: count, flag, text updated' } },
	]
	return anim({
		id: 'batching-anim',
		caption: 'Batching: updates queue up during the handler; one microtask renders them all.',
		scenarios: [{ name: 'Three setState calls', intro: 'A click handler calls three different setters.', scene, steps }],
	})
}

export function interruptionAnim() {
	const slot = (k, x, cls, label = '', s = 'ghost') => `<div class="an slice ${cls}" data-k="${k}" data-s="${s}" style="--x:${x}">${label}</div>`
	const t1 = [0, 1, 2].map((i) => slot(`t${i}`, i, 'sl-t', '5ms'))
	const r = [0, 1, 2, 3, 4].map((i) => slot(`r${i}`, 6 + i, 'sl-t', '5ms'))
	const scene = `
		<div class="a-label">main thread →</div>
		<div class="a-track slices">${t1.join('')}${slot('key', 3, 'sl-k', '⌨')}${slot('sync', 4, 'sl-s wide2', 'sync')}${r.join('')}${slot('commit', 11, 'sl-c', '✓')}</div>
		<div class="a-cols" style="margin-top:10px">
			${panel('root lanes', `<div class="a-col">${chip('lanes', 'pendingLanes: Transition')}${chip('wip', 'WIP tree: none')}</div>`)}
			${panel('screen', `<div class="a-col">${chip('input', 'input: "a"')}${chip('results', 'results for: ""')}</div>`)}
		</div>`
	const steps = [
		{ phase: 'schedule', fn: "startTransition(() => setQuery('a'))", say: 'The results update is a <b>transition</b>. It is rendered by the concurrent loop in a Scheduler task.', set: { lanes: 'upd' } },
		{ phase: 'render', fn: 'workLoopConcurrentByScheduler → shouldYield() after ~5ms', say: 'React works on the tree for about 5ms, then <b>yields</b> so the browser can paint and handle input.', set: { lanes: '', t0: '', wip: 'upd' }, txt: { wip: 'WIP tree: half built' } },
		{ phase: 'render', fn: 'continuation → next slice, resumes at workInProgress', say: 'Each slice resumes exactly where the last one stopped (one pointer: <code>workInProgress</code>).', set: { t1: '', t2: '', wip: '' } },
		{ phase: 'event', fn: "keydown 'b' → setText('ab') · SyncLane", say: 'The user types between two slices. That update is urgent: <code>SyncLane</code>.', set: { key: 'bad', lanes: 'upd' }, txt: { lanes: 'pendingLanes: Sync | Transition' } },
		{ phase: 'render', fn: 'prepareFreshStack(root, SyncLane)', say: 'React switches lanes and <b>throws the half-built tree away</b>. Nothing was committed, so there is nothing to undo.', set: { key: 'bad', t0: 'del', t1: 'del', t2: 'del', lanes: '', wip: 'bad' }, txt: { wip: 'WIP tree: discarded' } },
		{ phase: 'commit', fn: 'renderRootSync → commitRoot', say: 'The sync update renders and commits <b>without yielding</b>. The input shows “ab” immediately.', set: { sync: 'run', input: 'ok', wip: '' }, txt: { input: 'input: "ab"', lanes: 'pendingLanes: Transition', wip: 'WIP tree: none' } },
		{ phase: 'render', fn: "restart transition from the root (query = 'ab')", say: 'The transition is still pending. It <b>starts over</b> from the root, now with the newer state, yielding every ~5ms again.', set: { sync: 'done', input: '', r0: '', r1: '', r2: '', r3: '', r4: '', wip: 'upd' }, txt: { wip: 'WIP tree: rebuilding' } },
		{ phase: 'commit', fn: 'commitRoot', say: 'The transition finally commits. This is why transition renders must be pure: they can run many times before one commits.', set: { commit: 'ok', results: 'ok', wip: '' }, txt: { results: 'results for: "ab"', lanes: 'pendingLanes: none', wip: 'WIP tree: none' } },
	]
	return anim({
		id: 'interruption-anim',
		caption: 'Interruption: an urgent update mid-transition discards the work-in-progress, and the transition restarts.',
		scenarios: [{ name: 'Typing during a transition', intro: 'The user typed “a”. The input already shows it; the slow results list renders in a transition.', scene, steps }],
	})
}

// ═══ Commit ═════════════════════════════════════════════════════════════════

export function effectOrderAnim() {
	const t = tree(['P', 'Parent', { cls: 'comp' }, [['C', 'Child', { cls: 'comp' }, [['D', 'div', { cls: 'host', sub: 'ref' }]]]]])
	const scn = (name, intro, entries) => {
		const logs = entries.filter((e) => e.log)
		const scene = `<div class="a-cols">
			${panel('tree', t)}
			${panel('console', `<div class="a-log">${logs.map((e, i) => `<div class="an" data-k="log${i}" data-s="hide">${e.log}</div>`).join('')}</div>`)}
		</div>`
		let li = 0
		let prev = []
		const sticky = {}
		const steps = entries.map((e) => {
			const set = {}
			for (const n of prev) set[n] = sticky[n] ?? ''
			for (const n of e.nodes ?? []) {
				if (e.cls) sticky[n] = e.cls
				set[n] = `${sticky[n] ?? ''} hl`.trim()
			}
			if (e.log) set[`log${li++}`] = e.logCls ?? ''
			prev = e.nodes ?? []
			return { phase: e.phase, fn: e.fn, say: e.say, set }
		})
		return { name, intro, scene, steps }
	}
	const mount = scn('Mount', 'First render of <code>&lt;Parent&gt;&lt;Child&gt;&lt;div ref /&gt;&lt;/Child&gt;&lt;/Parent&gt;</code>.', [
		{ phase: 'commit', fn: 'commitMutationEffects → appendChild(subtree)', say: 'Mutation: the whole new DOM subtree (already built in <code>completeWork</code>) is inserted with one <code>appendChild</code>.', nodes: ['P', 'C', 'D'], cls: 'new' },
		{ phase: 'commit', fn: 'commitLayoutEffects: attach ref', say: 'Layout phase walks <b>child before parent</b>. The deepest node first: the ref is attached.', nodes: ['D'], log: 'ref attached', logCls: 'keep' },
		{ phase: 'commit', fn: 'commitLayoutEffectOnFiber(Child) → useLayoutEffect', say: 'Then Child’s layout effect…', nodes: ['C'], log: 'C layout', logCls: 'keep' },
		{ phase: 'commit', fn: 'commitLayoutEffectOnFiber(Parent) → useLayoutEffect', say: '…then Parent’s. All before the browser paints.', nodes: ['P'], log: 'P layout', logCls: 'keep' },
		{ phase: 'paint', fn: 'browser paints', say: 'Now the user sees the UI.' },
		{ phase: 'effects', fn: 'flushPassiveEffects → commitPassiveMountOnFiber(Child)', say: 'Passive effects, again <b>child first</b>.', nodes: ['C'], log: 'C effect', logCls: 'done' },
		{ phase: 'effects', fn: 'commitPassiveMountOnFiber(Parent)', say: 'Parent’s <code>useEffect</code> runs last.', nodes: ['P'], log: 'P effect', logCls: 'done' },
	])
	const update = scn('Update', 'Both components re-render; no deps arrays, so every effect re-runs.', [
		{ phase: 'commit', fn: 'commitMutationEffects: layout cleanups (Child)', say: 'Mutation phase: <b>layout cleanups</b> run, child first.', nodes: ['C'], log: 'C layout cleanup', logCls: 'upd' },
		{ phase: 'commit', fn: 'commitMutationEffects: layout cleanups (Parent)', say: 'Then the parent’s.', nodes: ['P'], log: 'P layout cleanup', logCls: 'upd' },
		{ phase: 'commit', fn: 'root.current = finishedWork · layout: Child', say: 'After the tree swap, layout setups: child…', nodes: ['C'], log: 'C layout', logCls: 'keep' },
		{ phase: 'commit', fn: 'layout: Parent', say: '…then parent.', nodes: ['P'], log: 'P layout', logCls: 'keep' },
		{ phase: 'paint', fn: 'browser paints', say: 'Paint.' },
		{ phase: 'effects', fn: 'commitPassiveUnmountEffects (all cleanups)', say: 'Passive effects run in <b>two full passes</b>. First every cleanup, child first…', nodes: ['C'], log: 'C effect cleanup', logCls: 'upd' },
		{ phase: 'effects', fn: 'commitPassiveUnmountEffects', say: '…parent cleanup…', nodes: ['P'], log: 'P effect cleanup', logCls: 'upd' },
		{ phase: 'effects', fn: 'commitPassiveMountEffects (all setups)', say: '…then every setup, child first…', nodes: ['C'], log: 'C effect', logCls: 'done' },
		{ phase: 'effects', fn: 'commitPassiveMountEffects', say: '…and parent last. Rule: cleanups before setups, children before parents.', nodes: ['P'], log: 'P effect', logCls: 'done' },
	])
	const unmount = scn('Unmount', '<code>Parent</code> is removed from the tree.', [
		{ phase: 'commit', fn: 'commitDeletionEffects(Parent)', say: 'Deletion walks the removed subtree <b>parent first</b>: Parent’s layout cleanup…', nodes: ['P'], cls: 'del', log: 'P layout cleanup', logCls: 'upd' },
		{ phase: 'commit', fn: 'commitDeletionEffectsOnFiber(Child)', say: '…then it recurses into Child.', nodes: ['C'], cls: 'del', log: 'C layout cleanup', logCls: 'upd' },
		{ phase: 'commit', fn: 'safelyDetachRef(div) · removeChild(topNode)', say: 'Refs are detached and the top DOM node is removed.', nodes: ['D'], cls: 'del', log: 'ref detached (null)', logCls: 'upd' },
		{ phase: 'effects', fn: 'flushPassiveEffects (deleted subtree)', say: 'In the next passive flush, effect cleanups for the deleted subtree, <b>also parent first</b>…', nodes: ['P'], cls: 'del', log: 'P effect cleanup', logCls: 'upd' },
		{ phase: 'effects', fn: 'commitPassiveUnmountEffectsInsideOfDeletedTree', say: '…then the child. Deletions are the one place the order flips.', nodes: ['C'], cls: 'del', log: 'C effect cleanup', logCls: 'upd' },
	])
	return anim({
		id: 'effects-anim',
		caption: 'Effect ordering for mount, update and unmount. Watch which node is active and what gets logged.',
		scenarios: [mount, update, unmount],
	})
}

// ═══ End to end ═════════════════════════════════════════════════════════════

export function e2eAnim() {
	const t = tree([
		'root',
		'HostRoot',
		{ cls: 'root', flag: true },
		[['app', 'App', { cls: 'comp', flag: true }, [['main', 'main', { cls: 'host', flag: true }, [['header', 'Header', { cls: 'comp' }, [['h1', 'h1', { cls: 'host' }]]], ['counter', 'Counter', { cls: 'comp', sub: 'count: 0', flag: true }, [['button', 'button', { cls: 'host', sub: '"0"', flag: true }]]]]]]]],
	])
	const scene = `<div class="a-cols">
		${panel('fiber tree', t, 'wide')}
		${panel('React', `<div class="a-col">${chip('lane', 'lane: –')}${chip('queue', 'Counter queue: empty')}${chip('micro', 'microtask: none')}</div>`)}
		${panel('screen', `<div class="a-dom">&lt;button style="width: <span class="an" data-k="w">40px</span>"&gt;<span class="an" data-k="txt">0</span>&lt;/button&gt;<br>document.title = "<span class="an" data-k="title">Clicks: 0</span>"</div>`)}
	</div>`
	const steps = [
		{ phase: 'event', fn: 'dispatchDiscreteEvent("click") → onClick', say: 'One listener on the root container catches the click, finds the button’s fiber and calls your <code>onClick</code>.', set: { button: 'hl' } },
		{ phase: 'schedule', fn: 'dispatchSetState → requestUpdateLane() = SyncLane', say: 'A discrete event, so <code>SyncLane</code>. The eager check: 1 ≠ 0, so a render is needed.', set: { button: '', lane: 'upd', queue: 'upd' }, txt: { lane: 'lane: SyncLane', queue: 'Counter queue: [1]' } },
		{ phase: 'schedule', fn: 'ensureRootIsScheduled → queueMicrotask', say: 'The handler returns. Nothing has rendered yet.', set: { micro: 'on' }, txt: { micro: 'microtask: scheduled' } },
		{ phase: 'render', fn: 'performSyncWorkOnRoot → prepareFreshStack → markUpdateLaneFromFiberToRoot', say: 'The microtask starts the render. First the queued update is linked into the hook, then <code>Counter.lanes |= Sync</code> and every ancestor gets <code>childLanes |= Sync</code>: a trail back from the root.', set: { lane: '', queue: '', 'counter-flag': '', 'main-flag': '', 'app-flag': '', 'root-flag': '' }, txt: { 'counter-flag': 'lanes', 'main-flag': 'childLanes', 'app-flag': 'childLanes', 'root-flag': 'childLanes' } },
		{ phase: 'render', fn: 'workLoopSync · beginWork(HostRoot, App, main)', say: 'Now the work loop. HostRoot, App and main only have <code>childLanes</code> → <b>bail out</b> and continue down. <code>App()</code> is not called.', set: { micro: 'done', root: 'bail', app: 'bail', main: 'bail', 'root-flag': 'ghost', 'app-flag': 'ghost', 'main-flag': 'ghost' } },
		{ phase: 'render', fn: 'beginWork(Header) → null', say: '<code>Header</code> has no work at all (<code>childLanes === 0</code>): the whole subtree is <b>skipped</b>.', set: { header: 'skip', h1: 'skip' } },
		{ phase: 'render', fn: 'Counter() → updateReducer → count = 1', say: 'Counter has its own lane → it <b>renders</b>. Both effects’ deps changed (<code>[0]</code> → <code>[1]</code>), so they are flagged.', set: { counter: 'run hl', 'counter-flag': '' }, txt: { 'counter-sub': 'count: 1', 'counter-flag': 'Update · Passive' } },
		{ phase: 'render', fn: 'useFiber(button) · completeWork(button) → markUpdate', say: 'The button fiber is reused with new props and flagged <b>Update</b>. Then <code>completeWork</code> climbs back up, bubbling flags.', set: { counter: 'run', button: 'upd', 'button-flag': '' }, txt: { 'button-sub': '"1"', 'button-flag': 'Update' } },
		{ phase: 'commit', fn: 'commitMutationEffects → commitUpdate(button)', say: 'Commit, mutation: only the flagged path is visited. The text changes from 0 to 1. Then <code>root.current = finishedWork</code>.', set: { button: 'done', txt: 'upd' }, txt: { txt: '1' } },
		{ phase: 'commit', fn: 'commitLayoutEffects → useLayoutEffect', say: 'Layout effect: <code>buttonRef.current.style.width = \'50px\'</code>. Still before paint.', set: { txt: '', w: 'upd' }, txt: { w: '50px' } },
		{ phase: 'commit', fn: 'flushPendingEffects() (SyncLane) → useEffect', say: 'For a discrete update, passive effects are flushed <b>synchronously</b> at the end of the commit: <code>document.title</code> updates.', set: { w: '', title: 'upd', counter: 'done' }, txt: { title: 'Clicks: 1' } },
		{ phase: 'paint', fn: 'microtask ends → style · layout · paint', say: 'Finally the browser paints: the user sees <b>1</b> in a 50px button. Only <code>Counter()</code> ran, and there were 2 DOM writes.', set: { title: '', txt: 'ok', w: 'ok' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		return [event(), event('dispatchSetState', 'requestUpdateLane'), event('dispatchSetState', 'scheduleUpdateOnFiber', 'ensureRootIsScheduled'), f.start('finishQueueingConcurrentUpdates', 'markUpdateLaneFromFiberToRoot'), f.bail('main'), f.bail('Header'), f.call('Counter', 'updateReducer'), f.complete('button'), f.commit(...MUTATION, 'commitUpdate'), f.commit('flushLayoutEffects', 'commitLayoutEffectOnFiber', 'commitHookEffectListMount'), f.commit('flushPassiveEffects', 'commitHookEffectListMount'), []]
	})())
	return anim({
		id: 'e2e-anim',
		caption: 'One click, end to end: event → schedule → render → commit → paint.',
		scenarios: [{ name: 'One click', intro: 'The app from above. The user clicks the button once.', scene, steps: stacked }],
	})
}

// ═══ Render and Commit ══════════════════════════════════════════════════════

const stages = () =>
	`<div class="a-row" style="justify-content:center;margin-bottom:12px">${['trigger', 'render', 'commit', 'paint', 'effects']
		.map((s) => chip(`st-${s}`, s, 'faint'))
		.join('<span class="a-label">→</span>')}</div>`

export function renderCommitStepsAnim() {
	const t = (p, s = '', flag = false) =>
		tree([`${p}-root`, 'HostRoot', { cls: 'root', s }, [[`${p}-counter`, 'Counter', { cls: 'comp', sub: 'count: 0', s, flag }, [[`${p}-button`, 'button', { cls: 'host', s }, [[`${p}-text`, '"0"', { cls: 'text', s, flag }]]]]]]])
	const scene = `${stages()}
		<div class="a-cols">
			${panel('current tree (on screen)', t('c'))}
			${panel('work-in-progress', t('w', 'ghost', true))}
			${panel('browser', `<div class="a-col"><div class="a-label">DOM</div><div class="a-dom">&lt;button&gt;<span class="an" data-k="dom">0</span>&lt;/button&gt;</div><div class="a-label">pixels</div>${chip('px', '0')}<div class="a-label">document.title</div>${chip('title', '"Clicked 0"')}</div>`)}
		</div>`
	const steps = [
		{ phase: 'trigger', fn: 'setCount(1)', say: 'The click handler queues an update on <code>Counter</code>’s state hook with <code>SyncLane</code> and schedules the root in a microtask. Nothing renders yet.', set: { 'st-trigger': 'on', 'c-button': 'hl' } },
		{ phase: 'render', fn: 'beginWork(HostRoot) → bail out, clone children', say: 'Render starts at the root. Nothing to do on the way down to <code>Counter</code>, so those fibers are cloned into the work-in-progress tree.', set: { 'st-trigger': '', 'st-render': 'on', 'c-button': '', 'w-root': 'bail' } },
		{ phase: 'render', fn: 'Counter() → useState returns 1', say: 'React <b>calls your component</b>. That is all “rendering” means. <code>useState</code> returns 1 on the work-in-progress fiber; the current one still says 0.', set: { 'w-counter': 'run hl' }, txt: { 'w-counter-sub': 'count: 1' } },
		{ phase: 'render', fn: 'reconcileChildren: <button> vs button fiber → same type, reuse', say: 'The returned <code>&lt;button&gt;</code> is compared with the existing button fiber: same type, so the fiber is reused with new props. Its text child goes from "0" to "1".', set: { 'w-counter': 'run', 'w-button': 'keep', 'w-text': 'keep hl' }, txt: { 'w-text-label': '"1"' } },
		{ phase: 'render', fn: 'completeWork(text) → Update · effect deps changed → Passive', say: 'On the way back up, the changes are only <b>recorded</b> as flags. The DOM, and the screen, still show 0.', set: { 'w-text': 'keep', 'w-text-flag': '', 'w-counter-flag': '' }, txt: { 'w-text-flag': 'Update', 'w-counter-flag': 'Passive' } },
		{ phase: 'commit', fn: 'commitTextUpdate(textNode, "0", "1")', say: 'Commit, mutation: the one flagged DOM write happens. The <b>DOM</b> now says 1, but the browser hasn’t <b>painted</b> it yet.', set: { 'st-render': '', 'st-commit': 'on', dom: 'upd' }, txt: { dom: '1' } },
		{ phase: 'commit', fn: 'root.current = finishedWork', say: 'The work-in-progress tree becomes <code>current</code>. Layout phase: no layout effects or refs here.', set: { dom: '', 'c-root': 'faint', 'c-counter': 'faint', 'c-button': 'faint', 'c-text': 'faint', 'w-root': 'done', 'w-counter': 'done', 'w-button': 'done', 'w-text': 'done', 'w-text-flag': 'ghost', 'w-counter-flag': 'ghost' } },
		{ phase: 'effects', fn: 'flushPassiveEffects() (SyncLane: at the end of the commit)', say: 'Normally <code>useEffect</code> runs after paint. For a discrete event like a click, React 18+ flushes it synchronously at the end of the commit: <code>document.title = "Clicked 1"</code>.', set: { 'st-commit': '', 'st-effects': 'on', title: 'upd' }, txt: { title: '"Clicked 1"' } },
		{ phase: 'paint', fn: 'browser: style → layout → paint', say: 'The microtask ends and the browser paints. Only now do the <b>pixels</b> show 1.', set: { 'st-effects': '', 'st-paint': 'on', title: '', px: 'ok' }, txt: { px: '1' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		return [event('dispatchSetState'), f.bail('HostRoot'), f.call('Counter', 'updateReducer'), f.reconcileAfterCall('Counter', 'reconcileSingleElement', 'useFiber'), f.complete('"1"'), f.commit(...MUTATION, 'commitTextUpdate'), f.commit('flushMutationEffects'), f.commit('flushPassiveEffects', 'commitHookEffectListMount'), []]
	})())
	return anim({
		id: 'rc-steps-anim',
		caption: 'Render works on a copy and only records changes; commit writes the DOM; the browser paints afterwards.',
		scenarios: [{ name: 'One click', intro: 'The <code>Counter</code> above is clicked once. Watch the two trees, the DOM, and what is actually on screen.', scene, steps: stacked }],
	})
}

export function whySeparateAnim() {
	const rows = (p, vals, s = '') => `<div class="a-col">${vals.map((v, i) => chip(`${p}${i}`, v, s)).join('')}</div>`
	const usd = ['Tea · $10', 'Cake · $20', 'Pie · $30']
	const eur = ['Tea · €9', 'Cake · €18', 'Pie · €27']

	const react = {
		name: 'React: render, then commit',
		intro: 'A transition switches prices to euros. A keystroke arrives halfway through.',
		scene: `<div class="a-cols">
			${panel('work-in-progress', rows('w', eur, 'ghost'))}
			${panel('screen', rows('s', usd))}
			${panel('status', `<div class="a-col">${chip('state', 'idle')}</div>`)}
		</div>`,
		steps: [
			{ phase: 'render', fn: "startTransition(() => setCurrency('EUR'))", say: 'The update is a transition, so it renders in ~5ms slices.', set: { state: 'upd' }, txt: { state: 'rendering (concurrent)' } },
			{ phase: 'render', fn: 'slice 1: performUnitOfWork(Tea)', say: 'The first row is rendered <b>into the work-in-progress tree</b>. The screen is untouched.', set: { w0: 'new' } },
			{ phase: 'render', fn: 'slice 2: performUnitOfWork(Cake)', say: 'Second row. Still nothing visible: the user sees a consistent dollar list.', set: { w1: 'new' } },
			{ phase: 'event', fn: 'keydown → urgent update → prepareFreshStack()', say: 'An urgent update arrives. React <b>throws the half-built tree away</b>. Nothing was shown, so there is nothing to undo.', set: { w0: 'del', w1: 'del', state: 'bad' }, txt: { state: 'interrupted: WIP discarded' } },
			{ phase: 'render', fn: 'restart from the root', say: 'After the urgent update, the transition starts over and renders all three rows.', set: { w0: 'new', w1: 'new', w2: 'new', state: 'upd' }, txt: { state: 'rendering again' } },
			{ phase: 'commit', fn: 'commitRoot()', say: 'Commit applies every change <b>at once</b>, synchronously. The screen jumps from all-dollars to all-euros. Never a mix.', set: { s0: 'ok', s1: 'ok', s2: 'ok', state: 'ok' }, txt: { s0: eur[0], s1: eur[1], s2: eur[2], state: 'committed' } },
		],
	}
	const naive = {
		name: 'Hypothetical: render writes the DOM',
		intro: 'What if a renderer wrote to the DOM <b>while</b> rendering? React never does this; this is what the split prevents.',
		scene: `<div class="a-cols">
			${panel('screen', rows('s', usd))}
			${panel('status', `<div class="a-col">${chip('state', 'idle')}</div>`)}
		</div>`,
		steps: [
			{ phase: 'render', fn: "setCurrency('EUR')", say: 'Same update, but each component writes its DOM as soon as it renders.', set: { state: 'upd' }, txt: { state: 'rendering + writing' } },
			{ phase: 'render', fn: 'render(Tea) → write DOM', say: 'Row one changes on screen immediately.', set: { s0: 'upd' }, txt: { s0: eur[0] } },
			{ phase: 'render', fn: 'render(Cake) → write DOM', say: 'Row two. The user now sees euros <b>and</b> dollars in the same list.', set: { s1: 'upd' }, txt: { s1: eur[1] } },
			{ phase: 'event', fn: 'keydown → must stop now', say: 'An urgent update arrives. Pausing leaves the screen <b>half-updated</b>; aborting would mean undoing DOM writes. Neither is safe.', set: { s2: 'bad', state: 'bad' }, txt: { state: 'stuck: inconsistent UI' } },
			{ phase: 'render', fn: '— why React splits the phases —', say: 'So React keeps all pausable, abortable work in the render phase (pure, off-screen), and makes the commit phase small, synchronous and atomic.', set: { s0: 'bad', s1: 'bad' } },
		],
	}
	return anim({
		id: 'why-separate-anim',
		caption: 'Why render and commit are separate: rendering off-screen is what makes pausing and aborting safe.',
		scenarios: [react, naive],
	})
}

export function virtualDomAnim() {
	const scene = `<div class="a-cols">
		${panel('React elements', `<div class="a-col">${chip('e1', '{ type: "button", props: { children: 0 } }', 'ghost')}${chip('e2', '{ type: "button", props: { children: 1 } }', 'ghost')}</div>`)}
		${panel('fiber', `<div class="a-col">${node('f', 'button fiber', { cls: 'host', sub: 'memoizedProps: –', s: 'ghost', flag: true })}${chip('sn', 'stateNode → DOM node #1', 'ghost')}</div>`)}
		${panel('DOM node', `<div class="a-col">${chip('d', '&lt;button&gt;0&lt;/button&gt; · node #1', 'ghost')}</div>`)}
	</div>`
	const steps = [
		{ phase: 'render', fn: 'Counter() → <button>{0}</button>', say: 'Render 1. JSX produces a <b>React element</b>: a cheap, immutable plain object describing what you want.', set: { e1: 'new hl' } },
		{ phase: 'render', fn: 'createFiberFromElement(element)', say: 'React creates a <b>fiber</b> for it: a long-lived, mutable record of this button’s position, props and effects.', set: { e1: 'new', f: 'new hl' }, txt: { 'f-sub': 'memoizedProps: { children: 0 }' } },
		{ phase: 'render', fn: "completeWork → document.createElement('button')", say: 'The real <b>DOM node</b> is created off-screen and linked from <code>fiber.stateNode</code>.', set: { f: 'new', d: 'new hl', sn: 'new' } },
		{ phase: 'commit', fn: 'appendChild(container, button)', say: 'Commit puts it on screen. The element has done its job and is <b>thrown away</b>.', set: { d: 'done', sn: '', e1: 'gone' } },
		{ phase: 'render', fn: 'Counter() → <button>{1}</button>', say: 'Render 2 creates a <b>brand-new</b> element object. Elements are never reused.', set: { e1: 'hide', e2: 'new hl', f: 'done', d: '' } },
		{ phase: 'render', fn: 'reconcile: new element vs current fiber', say: 'React diffs the <b>new element against the fiber</b>, not against the DOM. Same type → the same fiber is kept, with new props, and flagged Update.', set: { e2: 'cmp', f: 'keep hl', 'f-flag': '' }, txt: { 'f-sub': 'memoizedProps: { children: 1 }', 'f-flag': 'Update' } },
		{ phase: 'commit', fn: 'commitUpdate(fiber.stateNode, …)', say: 'Commit updates the <b>same DOM node</b> (#1) through <code>stateNode</code>. Element 2 is thrown away too. Fiber and DOM node live on; elements come and go.', set: { e2: 'gone', f: 'keep', 'f-flag': 'ghost', d: 'upd' }, txt: { d: '&lt;button&gt;1&lt;/button&gt; · node #1' } },
	]
	return anim({
		id: 'vdom-anim',
		caption: 'Elements are recreated every render; fibers and DOM nodes persist. React diffs elements against fibers.',
		scenarios: [{ name: 'Two renders', intro: 'A <code>&lt;button&gt;{count}&lt;/button&gt;</code> renders twice: count 0, then 1.', scene, steps }],
	})
}

// ═══ Start Here ═════════════════════════════════════════════════════════════

export function restaurantAnim() {
	const station = (k, icon, title, sub, s = '') =>
		`<div class="an station" data-k="${k}"${s ? ` data-s="${s}"` : ''}><span class="st-icon">${icon}</span><b>${title}</b><small data-k="${k}-sub">${sub}</small></div>`
	const scene = `<div class="stations">
		${station('order', '🧾', 'Order', 'nothing ordered')}
		<span class="st-arrow">→</span>
		${station('kitchen', '🍳', 'Kitchen counter', 'empty')}
		<span class="st-arrow">→</span>
		${station('table', '🍽️', 'Table (what the customer sees)', 'yesterday’s plate')}
		<span class="st-arrow">→</span>
		${station('chores', '🧽', 'Chores', '—')}
	</div>
	<div class="a-row" style="justify-content:center;margin-top:12px">${chip('react', 'in React: –')}</div>`
	const steps = [
		{ phase: 'trigger', fn: 'setState(…)', say: 'A customer <b>orders</b>. In React: an event handler calls <code>setState</code>. The order is written down; nothing is cooked yet.', set: { order: 'new hl', react: 'upd' }, txt: { 'order-sub': 'new order on the rail', react: 'in React: update queued + render scheduled' } },
		{ phase: 'render', fn: 'render phase', say: 'The <b>kitchen</b> starts preparing the plate on the counter, where the customer can’t see it. In React: your components are called and the new tree is worked out.', set: { order: 'done', kitchen: 'run hl' }, txt: { 'kitchen-sub': 'plate being prepared', react: 'in React: components run, changes are recorded' } },
		{ phase: 'render', fn: 'urgent order arrives', say: 'A more urgent order comes in. The cook can <b>pause</b> or <b>throw the plate away</b> and start again: nothing has been served. In React: transition renders can be interrupted and discarded.', set: { kitchen: 'bad hl' }, txt: { 'kitchen-sub': 'paused / thrown away', react: 'in React: interrupted render, nothing to undo' } },
		{ phase: 'render', fn: 'render finished', say: 'The plate is ready on the counter. The customer <b>still sees the old table</b>.', set: { kitchen: 'done' }, txt: { 'kitchen-sub': 'plate ready', react: 'in React: work-in-progress tree complete' } },
		{ phase: 'commit', fn: 'commit phase', say: 'The waiter <b>serves the whole plate in one go</b>. The customer never gets half a plate. In React: all DOM changes are applied synchronously, at once.', set: { kitchen: 'faint', table: 'new hl' }, txt: { 'table-sub': 'today’s plate, all at once', react: 'in React: DOM updated atomically' } },
		{ phase: 'paint', fn: 'browser paints', say: 'The customer looks at the table and sees the food. In React: the browser paints.', set: { table: 'ok' }, txt: { react: 'in React: pixels on screen' } },
		{ phase: 'effects', fn: 'useEffect', say: 'Afterwards the staff do the <b>follow-up chores</b>: wipe the table, update the bill. In React: <code>useEffect</code> runs.', set: { chores: 'done hl' }, txt: { 'chores-sub': 'wipe table, update bill', react: 'in React: effects run after paint' } },
	]
	return anim({
		id: 'restaurant-anim',
		caption: 'The restaurant analogy, animated: order → kitchen → serve → chores is trigger → render → commit → effects.',
		scenarios: [{ name: 'One order', intro: 'The restaurant from the paragraph above. Press <b>Play</b>.', scene, steps }],
	})
}
