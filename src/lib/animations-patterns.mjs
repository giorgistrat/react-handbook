// Animations for the Advanced React Patterns module. Every outcome shown was
// recorded from examples/product-store (src/lessons/patterns,
// scripts/record.mjs → generated/patterns.json).

import { anim, chip, tree, panel } from './anim.mjs'

const lt = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const line = (k, code, s = '') => `<div class="an call" data-k="${k}"${s ? ` data-s="${s}"` : ''}><code>${lt(code)}</code></div>`

// ─── Composition: data through layout vs elements built at the top ─────────

export function compositionAnim() {
	const t = `<div class="t-compact">${tree([
		'app', 'App', { cls: 'comp sm' }, [
			['nav', 'Nav', { cls: 'comp sm' }, [['img', '&lt;img&gt;', { cls: 'host sm' }]]],
			['main', 'Main', { cls: 'comp sm' }, [['list', 'List', { cls: 'comp sm' }], ['det', 'Details', { cls: 'comp sm' }]]],
			['foot', 'Footer', { cls: 'comp sm' }],
		],
	])}</div>`
	const scene = `<div class="a-cols">${panel('component tree', t, 'wide')}${panel('props received (recorded)', `<div class="a-col">${chip('pn', 'Nav: …', 'faint')}${chip('pm', 'Main: …', 'faint')}${chip('pf', 'Footer: …', 'faint')}</div>`)}</div>`
	const drilled = [
		{ phase: 'render', fn: 'App', say: '<code>App</code> owns <code>user</code>, the products and the selected product.', set: { app: 'run' } },
		{ phase: 'render', fn: '<Nav user={user} />', say: '<code>Nav</code> only places an avatar, but it has to accept the whole <code>user</code> to build it.', set: { nav: 'bad', img: 'run' }, txt: { pn: 'Nav: user' } },
		{ phase: 'render', fn: '<Main products selected onSelect />', say: '<code>Main</code> only puts two regions side by side, yet it receives three props it just passes on.', set: { main: 'bad', list: 'run', det: 'run' }, txt: { pm: 'Main: products, selected, onSelect' } },
		{ phase: 'render', fn: '<Footer user={user} />', say: 'Same for <code>Footer</code>. Each layout component now depends on data it doesn’t use: change <code>User</code> and their types change too.', set: { foot: 'bad' }, txt: { pf: 'Footer: user' } },
	]
	const composed = [
		{ phase: 'render', fn: 'App', say: 'Same state, same place.', set: { app: 'run' } },
		{ phase: 'render', fn: 'avatar={<img … />}', say: '<code>App</code> builds the avatar element itself, where <code>user</code> is, and hands <code>Nav</code> the finished element.', set: { img: 'new', nav: 'ok' }, txt: { pn: 'Nav: avatar' } },
		{ phase: 'render', fn: 'sidebar={<List …/>} content={<Details …/>}', say: 'Two regions, two named element props. <code>Main</code> only decides where they go.', set: { list: 'new', det: 'new', main: 'ok' }, txt: { pm: 'Main: sidebar, content' } },
		{ phase: 'render', fn: '<Footer>…</Footer>', say: 'One region: plain <code>children</code>. Recorded: no layout component received any data.', set: { foot: 'ok' }, txt: { pf: 'Footer: children' } },
	]
	return anim({
		id: 'patterns-composition-anim',
		caption: 'The product page layout, both versions recorded.',
		scenarios: [
			{ name: 'Data drilled', intro: 'Layout components receive data and pass it on.', scene, steps: drilled },
			{ name: 'Elements passed', intro: 'Layout components receive finished elements.', scene, steps: composed },
		],
	})
}

// ─── Latest ref: three debounce hooks, four keystrokes ─────────────────────

export function latestRefAnim() {
	const mk = (deps) => `<div class="a-cols">
		${panel('keystrokes (60 ms apart)', `<div class="a-col">${chip('k1', '"G"', 'faint')}${chip('k2', '"Gi"', 'faint')}${chip('k3', '"Gif"', 'faint')}${chip('k4', '"Gift"', 'faint')}</div>`)}
		${panel(`useMemo(…, ${deps})`, `<div class="a-col">${chip('fn', 'debounced function #1', 'faint')}${chip('tm', 'pending timers: 0', 'faint')}</div>`)}
		${panel('saved (recorded)', `<div class="a-col">${chip('out', 'nothing yet', 'ghost')}</div>`)}
	</div>`
	const rebuild = [
		{ phase: 'event', fn: 'debouncedSave("G")', say: 'The first keystroke starts a 300 ms timer inside debounced function #1.', set: { k1: 'hl', tm: 'upd' }, txt: { tm: 'pending timers: 1' } },
		{ phase: 'render', fn: 'useMemo deps: [callback, delay]', say: '<code>setNote</code> re-renders. <code>saveNote</code> is a new function, so <code>useMemo</code> builds a <b>new</b> debounced function, with its own empty timer.', set: { k1: '', fn: 'bad' }, txt: { fn: 'debounced function #2 (new)' } },
		{ phase: 'event', fn: '"Gi", "Gif", "Gift"', say: 'Each keystroke calls the newest function, which can’t cancel the timers the older ones started.', set: { k2: 'hl', k3: 'hl', k4: 'hl', tm: 'bad' }, txt: { fn: 'debounced function #5', tm: 'pending timers: 4' } },
		{ phase: 'effect', fn: '300 ms later', say: 'Recorded: four saves: “G”, “Gi”, “Gif”, “Gift”.', set: { k2: '', k3: '', k4: '', out: 'bad' }, txt: { out: '4 saves' } },
	]
	const once = [
		{ phase: 'event', fn: 'pick Desk Lamp, then type', say: 'The debounced function is built <b>once</b> (deps <code>[delay]</code>), so the timer is reused and cancelled correctly.', set: { k1: 'hl', k2: 'hl', k3: 'hl', k4: 'hl', fn: 'keep', tm: 'ok' }, txt: { tm: 'pending timers: 1' } },
		{ phase: 'effect', fn: 'saveNote from render 1', say: 'But it wraps the <code>saveNote</code> from the <b>first</b> render, whose <code>product</code> is still “Ceramic Mug”.', set: { k1: '', k2: '', k3: '', k4: '', fn: 'bad' } },
		{ phase: 'effect', fn: 'recorded', say: 'Recorded: <code>saved "Gift" for Ceramic Mug</code>. One save, wrong product: a stale closure.', set: { out: 'bad' }, txt: { out: '"Gift" for Ceramic Mug' } },
	]
	const latest = [
		{ phase: 'effect', fn: 'callbackRef.current = callback', say: 'After every render, an effect stores the newest <code>saveNote</code> in a ref.', set: { fn: 'keep' }, txt: { fn: 'debounced function #1 (kept)' } },
		{ phase: 'event', fn: '"G" … "Gift"', say: 'The debounced function is built once and calls <code>(...args) =&gt; callbackRef.current(...args)</code>, so each keystroke restarts the same timer.', set: { k1: 'hl', k2: 'hl', k3: 'hl', k4: 'hl', tm: 'ok' }, txt: { tm: 'pending timers: 1' } },
		{ phase: 'effect', fn: 'callbackRef.current("Gift")', say: 'When it fires, it reads the ref <b>at call time</b>: the latest <code>saveNote</code>. Recorded: <code>saved "Gift" for Desk Lamp</code>.', set: { k1: '', k2: '', k3: '', k4: '', out: 'ok' }, txt: { out: '"Gift" for Desk Lamp' } },
	]
	return anim({
		id: 'patterns-latest-ref-anim',
		caption: 'Pick “Desk Lamp”, then type “Gift” into the gift note (all three hooks recorded).',
		scenarios: [
			{ name: '[callback, delay]', intro: 'Rebuild the debounced function when the callback changes.', scene: mk('[callback, delay]'), steps: rebuild },
			{ name: '[delay]', intro: 'Build it once, around the first callback.', scene: mk('[delay]'), steps: once },
			{ name: 'Latest ref', intro: 'Build it once, and read the newest callback from a ref.', scene: mk('[delay]'), steps: latest },
		],
	})
}

// ─── Compound components: context vs cloneElement ──────────────────────────

export function compoundAnim() {
	const mk = (root) => {
		const t = tree([
			'tg', root, { cls: 'comp sm' }, [
				['btn', 'ToggleButton', { cls: 'comp sm' }],
				['div', 'div.note', { cls: 'host sm' }, [['on', 'ToggleOn', { cls: 'comp sm' }], ['off', 'ToggleOff', { cls: 'comp sm' }]]],
			],
		])
		return `<div class="a-cols">${panel('your JSX', `<div class="t-compact">${t}</div>`, 'wide')}${panel('screen', `<div class="a-col">${chip('sw', 'switch: off', 'faint')}${chip('txt', 'No gift wrap', 'faint')}</div>`)}</div>`
	}
	const ctx = [
		{ phase: 'render', fn: '<ToggleContext value={{ on, toggle }}>', say: '<code>Toggle</code> owns the state and puts it in context around whatever children it got.', set: { tg: 'run' } },
		{ phase: 'render', fn: 'useToggleContext()', say: 'Each piece reads the context, however deep it is. The <code>div</code> in between doesn’t matter.', set: { btn: 'ok', on: 'ok', off: 'ok', div: 'keep' } },
		{ phase: 'event', fn: 'click switch → toggle()', say: '<code>on</code> becomes <code>true</code>; the context value changes; all three pieces re-render.', set: { tg: 'upd', btn: 'run', on: 'run', off: 'run', sw: 'ok', txt: 'ok' }, txt: { sw: 'switch: on', txt: 'We’ll wrap it in recycled paper 🎁' } },
	]
	const clone = [
		{ phase: 'render', fn: 'Children.map(children, cloneElement)', say: 'The older way: <code>Toggle</code> walks its <b>direct</b> children and copies <code>on</code> and <code>toggle</code> onto each component element.', set: { tg: 'run', btn: 'ok' } },
		{ phase: 'render', fn: 'div.note is skipped', say: 'The <code>div</code> is a DOM element, so it’s skipped, and <code>Children.map</code> never looks inside it. <code>ToggleOn</code> and <code>ToggleOff</code> get no <code>on</code> at all.', set: { div: 'cmp', on: 'bad', off: 'bad' } },
		{ phase: 'event', fn: 'click switch → toggle()', say: 'The switch flips, but the text below it doesn’t. Recorded: still “No gift wrap”.', set: { div: '', sw: 'ok', txt: 'bad' }, txt: { sw: 'switch: on' } },
	]
	return anim({
		id: 'patterns-compound-anim',
		caption: 'The gift-wrap toggle with the two texts wrapped in a <code>div</code> (both versions recorded).',
		scenarios: [
			{ name: 'Context', intro: 'The pieces read <code>ToggleContext</code>.', scene: mk('Toggle'), steps: ctx },
			{ name: 'cloneElement', intro: 'Props are copied onto direct children.', scene: mk('ToggleClone'), steps: clone },
		],
	})
}

// ─── Slots: one map of props, looked up by name ────────────────────────────

export function slotsAnim() {
	const mk = (slot) => `<div class="a-cols">
		${panel('Field provides (SlotContext)', `<div class="a-col">${chip('sl', 'label: { htmlFor: id }', 'faint')}${chip('si', 'input: { id, aria-describedby }', 'faint')}${chip('sd', 'description: { id: descId }', 'faint')}</div>`, 'wide')}
		${panel('pieces look up their slot', `<div class="a-col">${chip('cl', '&lt;Label&gt; → "label"', 'faint')}${chip('ci', '&lt;Input&gt; → "input"', 'faint')}${chip('ct', `&lt;Text slot="${slot}"&gt;`, 'faint')}</div>`)}
		${panel('result (recorded)', `<div class="a-col">${chip('res', '…', 'ghost')}</div>`)}
	</div>`
	const ok = [
		{ phase: 'render', fn: 'useId() → slots', say: '<code>Field</code> makes one id and builds a map: which props each <b>slot</b> should get.', set: { sl: 'new', si: 'new', sd: 'new' } },
		{ phase: 'render', fn: 'useSlotProps(props, "label")', say: '<code>Label</code> reads the map from context and merges in <code>htmlFor</code>. Its own props win.', set: { sl: 'hl', cl: 'ok' } },
		{ phase: 'render', fn: 'useSlotProps(props, "input")', say: '<code>Input</code> gets <code>id</code> and <code>aria-describedby</code>, though it’s inside an extra <code>div</code>.', set: { sl: '', si: 'hl', ci: 'ok' } },
		{ phase: 'render', fn: 'useSlotProps(props, "description")', say: '<code>Text</code> is generic; its <code>slot</code> prop says which entry to use.', set: { si: '', sd: 'hl', ct: 'ok' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: label <code>for</code> = input <code>id</code>, clicking the label focused the input, and <code>aria-describedby</code> points to the description text.', set: { sd: '', res: 'ok' }, txt: { res: 'all three wired up' } },
	]
	const typo = [
		{ phase: 'render', fn: 'useId() → slots', say: 'Same map.', set: { sl: 'new', si: 'new', sd: 'new' } },
		{ phase: 'render', fn: 'Label, Input', say: 'Wired as before.', set: { cl: 'ok', ci: 'ok' } },
		{ phase: 'render', fn: 'useSlotProps(props, "descripton")', say: 'There’s no <code>"descripton"</code> entry, so <code>Text</code> gets nothing extra. No error, no warning.', set: { ct: 'bad', sd: 'cmp' } },
		{ phase: 'commit', fn: 'recorded', say: 'Recorded: the input still has <code>aria-describedby</code>, but no element has that id. Screen readers lose the description.', set: { sd: '', res: 'bad' }, txt: { res: 'describedby → (nothing)' } },
	]
	return anim({
		id: 'patterns-slots-anim',
		caption: 'The checkout email field (both recorded).',
		scenarios: [
			{ name: 'slot="description"', intro: 'Every piece finds its slot.', scene: mk('description'), steps: ok },
			{ name: 'slot="descripton"', intro: 'A typo in a slot name.', scene: mk('descripton'), steps: typo },
		],
	})
}

// ─── Prop getters: who owns onClick ────────────────────────────────────────

export function propGettersAnim() {
	const mk = (code) => `<div class="a-cols">
		${panel('the button’s props', `<div class="a-col">${line('code', code)}</div>`, 'wide')}
		${panel('final onClick', `<div class="a-col">${chip('fin', '?', 'faint')}</div>`)}
		${panel('click twice (recorded)', `<div class="a-col">${chip('tg', 'toggles', 'ghost')}${chip('an', 'analytics', 'ghost')}</div>`)}
	</div>`
	const first = [
		{ phase: 'render', fn: '{...togglerProps} onClick={track}', say: 'JSX props are like object keys: the <b>last</b> <code>onClick</code> wins.', set: { code: 'hl', fin: 'bad' }, txt: { fin: 'track' } },
		{ phase: 'event', fn: 'click × 2', say: 'Recorded: analytics logged, but the switch stayed <code>off</code>. The hook’s <code>toggle</code> was silently replaced.', set: { code: '', tg: 'bad', an: 'ok' }, txt: { tg: 'toggles: no', an: 'analytics: yes' } },
	]
	const last = [
		{ phase: 'render', fn: 'onClick={track} {...togglerProps}', say: 'The other order: now the hook’s <code>onClick</code> wins. TypeScript actually flags this one (TS2783: “specified more than once”).', set: { code: 'hl', fin: 'bad' }, txt: { fin: 'toggle' } },
		{ phase: 'event', fn: 'click × 2', say: 'Recorded: the switch toggles, but analytics never logged.', set: { code: '', tg: 'ok', an: 'bad' }, txt: { tg: 'toggles: yes', an: 'analytics: no' } },
	]
	const getter = [
		{ phase: 'render', fn: 'getTogglerProps({ onClick: track, id })', say: 'Hand <b>your</b> props to the hook instead of spreading next to its props.', set: { code: 'hl' } },
		{ phase: 'render', fn: 'onClick: callAll(onClick, toggle)', say: 'The hook combines the two handlers into one function that calls both. Other props (<code>id</code>) pass through.', set: { fin: 'ok' }, txt: { fin: 'callAll(track, toggle)' } },
		{ phase: 'event', fn: 'click × 2', say: 'Recorded: on, then off, with analytics logged each time.', set: { code: '', tg: 'ok', an: 'ok' }, txt: { tg: 'toggles: yes', an: 'analytics: yes' } },
	]
	return anim({
		id: 'patterns-prop-getters-anim',
		caption: 'Adding an analytics <code>onClick</code> to the gift-wrap button (all three recorded).',
		scenarios: [
			{ name: 'Spread, then onClick', intro: 'A prop collection spread before your handler.', scene: mk('{...togglerProps} onClick={track}'), steps: first },
			{ name: 'onClick, then spread', intro: 'Your handler before the spread.', scene: mk('onClick={track} {...togglerProps}'), steps: last },
			{ name: 'Prop getter', intro: 'A function that merges.', scene: mk('{...getTogglerProps({ onClick: track })}'), steps: getter },
		],
	})
}

// ─── State initializer: what Reset goes back to ────────────────────────────

export function initializerAnim() {
	const mk = (box) => `<div class="a-cols">
		${panel('the store setting', `<div class="a-col">${chip('set', 'gift wrap by default: ☑', 'faint')}</div>`)}
		${panel(box, `<div class="a-col">${chip('init', 'initialState = { on: true }', 'faint')}</div>`)}
		${panel('gift-wrap switch', `<div class="a-col">${chip('sw', 'on', 'faint')}</div>`)}
	</div>`
	const steps = (stable) => [
		{ phase: 'render', fn: 'useToggle({ initialOn: true })', say: 'First render: the switch starts <code>on</code>, from the setting.', set: { init: 'new', sw: 'ok' } },
		{ phase: 'event', fn: 'click switch', say: 'The shopper turns gift wrap off.', set: { sw: 'upd' }, txt: { sw: 'off' } },
		{ phase: 'render', fn: 'initialOn: false', say: stable ? 'The store setting is unticked, so <code>initialOn</code> is now <code>false</code>. The ref still holds <code>{ on: true }</code> from the first render.' : 'The store setting is unticked. This render builds a new <code>initialState = { on: false }</code>, and this render’s <code>reset</code> captures it.', set: { set: 'upd', init: stable ? 'keep' : 'bad' }, txt: { set: 'gift wrap by default: ☐', init: stable ? 'ref: { on: true } (kept)' : 'initialState = { on: false }' } },
		{ phase: 'event', fn: "dispatch({ type: 'reset', initialState })", say: stable ? 'Recorded: Reset went back to <code>on</code>, the value the switch actually started with.' : 'Recorded: Reset went to <code>off</code>. Nothing visibly happened: it “reset” to the current setting, not to how the switch started.', set: { sw: stable ? 'ok' : 'bad' }, txt: { sw: stable ? 'on' : 'off' } },
	]
	return anim({
		id: 'patterns-initializer-anim',
		caption: 'Start on, switch off, untick the store setting, then click Reset (both recorded).',
		scenarios: [
			{ name: 'Plain object', intro: '<code>const initialState = { on: initialOn }</code> on every render.', scene: mk('this render’s initialState'), steps: steps(false) },
			{ name: 'useRef', intro: '<code>useRef({ on: initialOn })</code> keeps the first one.', scene: mk('initialState (ref)'), steps: steps(true) },
		],
	})
}

// ─── State reducer: the consumer's reducer decides ─────────────────────────

export function stateReducerAnim() {
	const scene = `<div class="a-cols">
		${panel('useToggle (the hook)', `<div class="a-col">${line('d', "dispatch({ type: 'toggle' })")}</div>`, 'wide')}
		${panel('your reducer', `<div class="a-col">${chip('veto', 'orderPlaced? → return state', 'faint')}${chip('def', 'else → toggleReducer(…)', 'faint')}</div>`)}
		${panel('renders (recorded)', `<div class="a-col">${chip('go', 'GiftOptions', 'faint')}${chip('wn', 'WrapNote', 'faint')}</div>`)}
	</div>`
	const before = [
		{ phase: 'event', fn: 'click switch → toggle()', say: 'The hook dispatches its normal action. It doesn’t know about any custom rules.', set: { d: 'hl' } },
		{ phase: 'render', fn: 'reducer(state, action)', say: '<code>useReducer</code> runs <b>your</b> reducer. The order isn’t placed, so it delegates to the exported <code>toggleReducer</code>.', set: { d: '', def: 'ok', go: 'run' } },
		{ phase: 'commit', fn: 'recorded', say: 'New state <code>{ on: true }</code>: <code>GiftOptions</code> and <code>WrapNote</code> render.', set: { go: 'done', wn: 'done' } },
	]
	const after = [
		{ phase: 'event', fn: 'click switch → toggle()', say: 'After “Place order”, the same click dispatches the same action.', set: { d: 'hl' } },
		{ phase: 'render', fn: 'return state', say: 'Your reducer returns the state it was given: a veto. No special API needed.', set: { d: '', veto: 'hl', go: 'run' } },
		{ phase: 'render', fn: 'Object.is(old, new) → true', say: 'Recorded: <code>GiftOptions</code> still ran once (React runs the reducer while rendering it), then bailed out: <code>WrapNote</code> didn’t render and the switch stayed on.', set: { veto: 'ok', go: 'bail', wn: 'skip' } },
	]
	return anim({
		id: 'patterns-state-reducer-anim',
		caption: 'The gift-wrap switch before and after the order is placed (recorded).',
		scenarios: [
			{ name: 'Before the order', intro: 'The default behavior.', scene, steps: before },
			{ name: 'After the order', intro: 'The consumer’s rule kicks in.', scene, steps: after },
		],
	})
}

// ─── Control props: a suggestion, and the parent decides ───────────────────

export function controlPropsAnim() {
	const t = `<div class="t-compact">${tree([
		'co', 'Checkout', { cls: 'comp sm' }, [
			['t1', 'cart', { cls: 'comp sm' }],
			['t2', 'checkout', { cls: 'comp sm' }],
			['t3', 'news', { cls: 'comp sm' }],
		],
	])}</div>`
	const scene = `<div class="a-cols">${panel('component tree', t, 'wide')}${panel('state', `<div class="a-col">${chip('gw', 'giftWrap = false (Checkout)', 'faint')}${chip('sg', 'suggested: –', 'ghost')}</div>`)}</div>`
	const sync = [
		{ phase: 'event', fn: 'click Cart switch', say: '<code>on</code> was passed, so this toggle is <b>controlled</b>: <code>dispatchWithOnChange</code> skips its own <code>dispatch</code>.', set: { t1: 'hl' } },
		{ phase: 'event', fn: 'reducer({ ...state, on }, action)', say: 'It calls the reducer directly, to compute what it <b>would</b> do, and passes that to <code>onChange</code>.', set: { t1: '', sg: 'upd' }, txt: { sg: 'suggested: { on: true }' } },
		{ phase: 'schedule', fn: 'setGiftWrap(true)', say: 'The parent accepts the suggestion and updates <b>its</b> state.', set: { gw: 'upd', co: 'run' }, txt: { gw: 'giftWrap = true (Checkout)' } },
		{ phase: 'render', fn: 'both toggles get on={true}', say: 'Recorded: <code>Checkout</code> and all three toggles rendered; both gift-wrap switches turned on, though only one was clicked.', set: { t1: 'run', t2: 'run', t3: 'run' } },
	]
	const veto = [
		{ phase: 'event', fn: 'click Checkout switch', say: 'After “Place order”, the same click.', set: { t2: 'hl' }, txt: { gw: 'giftWrap = true (Checkout)' } },
		{ phase: 'event', fn: 'onChange({ on: false })', say: 'The toggle suggests turning it off.', set: { t2: '', sg: 'upd' }, txt: { sg: 'suggested: { on: false }' } },
		{ phase: 'event', fn: 'return (ignored)', say: 'The parent doesn’t call <code>setGiftWrap</code>. Recorded: <code>Checkout: ignored the change</code>, and <b>nothing</b> rendered. The switch stays on.', set: { sg: 'bad', gw: 'keep' } },
	]
	const unc = [
		{ phase: 'event', fn: 'click Newsletter switch', say: 'No <code>on</code> prop: this toggle is <b>uncontrolled</b>, so it dispatches to its own state.', set: { t3: 'hl' } },
		{ phase: 'render', fn: 'Toggle Newsletter', say: '<code>onChange</code> is still called, as a notification. Recorded: only this toggle rendered.', set: { t3: 'run' } },
	]
	return anim({
		id: 'patterns-control-props-anim',
		caption: 'Two controlled gift-wrap switches and one uncontrolled newsletter switch (all recorded). Each child of <code>Checkout</code> is a <code>Toggle</code>, named by its label.',
		scenarios: [
			{ name: 'Parent accepts', intro: 'Click the Cart switch.', scene, steps: sync },
			{ name: 'Parent ignores', intro: 'The order is placed; click the Checkout switch.', scene, steps: veto },
			{ name: 'Uncontrolled', intro: 'Click the Newsletter switch.', scene, steps: unc },
		],
	})
}
