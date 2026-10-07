// Animations for "How React Works, Start to Finish". Every step follows the
// real call order recorded by examples/how-react-works/scripts/trace.mjs.

import { MICRO, TASK, MUTATION, event, frames, withStacks } from './stacks.mjs'
import { anim, node, chip, tree, panel } from './anim.mjs'

const lt = (s) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
const line = (k, code, s = '') => `<div class="an call" data-k="${k}"${s ? ` data-s="${s}"` : ''}><code>${lt(code)}</code></div>`

/** The demo's fiber tree, compact (text fibers folded into their parent's label). */
function appTree({ s = '', flags = [] } = {}) {
	const o = (k, cls, extra = {}) => ({ cls: `${cls} sm`, s, flag: flags.includes(k), ...extra })
	return `<div class="t-compact">${tree([
		'root', 'HostRoot', o('root', 'root'), [
			['app', 'App', o('app', 'comp'), [
				['ctx', 'ThemeContext', o('ctx', 'comp'), [
					['layout', 'Layout', o('layout', 'comp'), [
						['div', 'div', o('div', 'host'), [
							['h1', 'h1', o('h1', 'host')],
							['main', 'main', o('main', 'host'), [
								['navc', 'Nav', o('navc', 'comp'), [['nav', 'nav', o('nav', 'host', { sub: '2 buttons' })]]],
								['theme', 'button', o('theme', 'host', { sub: '"Theme: light"' })],
								['page', 'CounterPage', o('page', 'comp'), [
									['section', 'section', o('section', 'host'), [
										['h2', 'h2', o('h2', 'host')],
										['display', 'Display', o('display', 'comp'), [['p', 'p', o('p', 'host', { sub: '"Count: 0"' })]]],
										['add', 'button', o('add', 'host', { sub: '"Add one"' })],
									]],
								]],
							]],
						]],
					]],
				]],
			]],
		]])}</div>`
}

// ─── 1. JSX → element objects ───────────────────────────────────────────────

export function jsxElementsAnim() {
	const el = (k, html) => `<div class="an el-obj" data-k="${k}" data-s="ghost">${html}</div>`
	const scene = `<div class="a-cols">
		${panel('App() is running its return statement', `<div class="a-col">
			${line('c-nav', "jsx(Nav, { page, onNavigate: setPage })")}
			${line('c-btn', 'jsxs("button", { className, onClick, children: ["Theme: ", theme] })')}
			${line('c-page', "page === 'counter' ? jsx(CounterPage, {}) : jsx(TodosPage, {})")}
			${line('c-layout', 'jsxs(Layout, { children: [ … ] })')}
			${line('c-ctx', 'jsx(ThemeContext, { value: theme, children: … })')}
		</div>`)}
		${panel('objects created (React elements)', `<div class="a-col">
			${el('e-nav', '{ type: <b>Nav</b>, props: { page: "counter", onNavigate } }')}
			${el('e-btn', '{ type: <b>"button"</b>, props: { className: "theme", onClick, children: ["Theme: ", "light"] } }')}
			${el('e-page', '{ type: <b>CounterPage</b>, props: {} }')}
			${el('e-layout', '{ type: <b>Layout</b>, props: { children: [ Nav el, button el, CounterPage el ] } }')}
			${el('e-ctx', '{ type: <b>ThemeContext</b>, props: { value: "light", children: Layout el } }')}
		</div>`)}
	</div>`
	const steps = [
		{ phase: 'render', fn: "App() → useState('counter'), useState('light')", say: 'React calls <code>App</code>. Its body runs top to bottom: two <code>useState</code> calls, then the <code>return</code> expression is evaluated.' },
		{ phase: 'render', fn: 'jsx(Nav, { page: "counter", onNavigate: setPage })', say: 'JavaScript evaluates <b>arguments before the call they belong to</b>, so the innermost JSX runs first. <code>jsx()</code> returns a plain object. <code>Nav</code> is <b>not called</b>: it’s just the <code>type</code> field.', set: { 'c-nav': 'hl', 'e-nav': 'new' } },
		{ phase: 'render', fn: 'jsxs("button", { …, children: ["Theme: ", "light"] })', say: 'A host element: <code>type</code> is the string <code>"button"</code>. Two children → <code>jsxs</code> with an array.', set: { 'c-nav': '', 'c-btn': 'hl', 'e-btn': 'new' } },
		{ phase: 'render', fn: "jsx(CounterPage, {})", say: 'The ternary picks <code>CounterPage</code>. The <code>TodosPage</code> element is <b>never created</b> on this render.', set: { 'c-btn': '', 'c-page': 'hl', 'e-page': 'new' } },
		{ phase: 'render', fn: 'jsxs(Layout, { children: [navEl, buttonEl, pageEl] })', say: 'The three finished objects become <code>Layout</code>’s <code>props.children</code>. Layout will receive them; it does not create them.', set: { 'c-page': '', 'c-layout': 'hl', 'e-layout': 'new' } },
		{ phase: 'render', fn: 'jsx(ThemeContext, { value: "light", children: layoutEl })', say: 'The outermost call runs last. Its object holds the whole description.', set: { 'c-layout': '', 'c-ctx': 'hl', 'e-ctx': 'new' } },
		{ phase: 'render', fn: 'return { type: ThemeContext, … }', say: '<code>App</code> returns <b>one object</b> (with others nested inside). Only <code>App</code> has run so far: <code>Nav</code>, <code>Layout</code> and <code>CounterPage</code> are still just references, and React decides when to call them.', set: { 'c-ctx': '', 'e-ctx': 'new hl' } },
	]
	const stacked = withStacks(steps, (() => {
		const app = frames(TASK).call('App')
		return [app, [...app, 'jsxDEV'], [...app, 'jsxDEV'], [...app, 'jsxDEV'], [...app, 'jsxDEV'], [...app, 'jsxDEV'], app]
	})())
	return anim({
		id: 'hrw-jsx-anim',
		caption: 'Inside App’s render: each JSX expression is a function call that returns a plain object, innermost first.',
		scenarios: [{ name: 'App’s return', intro: 'What happens when <code>App()</code> reaches its <code>return (…)</code>, in the compiled form.', scene, steps: stacked }],
	})
}

// ─── 2. The page opens ──────────────────────────────────────────────────────

export function bootAnim() {
	const scene = `<div class="a-cols">
		${panel('main.jsx (compiled)', `<div class="a-col">
			${line('l1', "import { createRoot } from 'react-dom/client'")}
			${line('l2', "import { App } from './App.jsx'")}
			${line('l3', "const root = createRoot(document.getElementById('root'))")}
			${line('l4', 'root.render(jsxDEV(App, {}))')}
		</div>`, 'wide')}
		${panel('React’s memory', `<div class="a-col">
			${chip('mods', 'React modules: not loaded', 'faint')}
			${chip('froot', 'FiberRoot', 'ghost')}
			${chip('hroot', 'HostRoot fiber (current)', 'ghost')}
			${chip('lis', 'listeners on #root', 'ghost')}
			${chip('elem', '{ type: App, props: {} }', 'ghost')}
			${chip('queue', 'HostRoot update queue: [ ]', 'ghost')}
			${chip('sched', 'scheduled: nothing', 'ghost')}
		</div>`)}
		${panel('the page', `<div class="a-col"><div class="a-dom">&lt;div id="root"&gt;<span class="an" data-k="dom"></span>&lt;/div&gt;</div>${chip('cpu', 'main thread: running main.jsx')}</div>`)}
	</div>`
	const steps = [
		{ phase: 'trigger', fn: "import 'react-dom/client'", say: 'The browser loads <code>index.html</code>, which loads <code>main.jsx</code> as a module. Its imports run first: React, ReactDOM and the Scheduler are <b>evaluated</b> (their top-level code defines functions). Nothing renders.', set: { l1: 'hl', mods: 'ok' }, txt: { mods: 'React modules: loaded' } },
		{ phase: 'trigger', fn: "import { App } from './App.jsx'", say: 'Your component modules run too, which only <b>defines</b> <code>App</code>, <code>Layout</code>, … No component is called by importing it.', set: { l1: '', l2: 'hl' } },
		{ phase: 'trigger', fn: 'createRoot(container) → createFiberRoot(…)', say: 'React creates a <b>FiberRoot</b> (bookkeeping for this root) and the first fiber, <b>HostRoot</b>, then stores a pointer to it on the <code>#root</code> DOM node.', set: { l2: '', l3: 'hl', froot: 'new', hroot: 'new' } },
		{ phase: 'trigger', fn: 'listenToAllSupportedEvents(#root)', say: 'One listener per event type (capture and bubble) is attached to <code>#root</code>. Later, every click inside the app reaches React through these, not through listeners on your buttons.', set: { lis: 'new' } },
		{ phase: 'trigger', fn: 'jsxDEV(App, {})', say: 'Arguments are evaluated first, so <code>&lt;App /&gt;</code> becomes an element object. <code>App</code> still hasn’t run.', set: { l3: '', l4: 'hl', elem: 'new' } },
		{ phase: 'schedule', fn: 'root.render(element) → requestUpdateLane(HostRoot) = DefaultLane (32)', say: 'No event is happening, so the update gets the <b>Default</b> lane.', set: { lis: '', queue: 'new' } },
		{ phase: 'schedule', fn: 'updateContainerImpl → enqueueUpdate({ element }) → scheduleUpdateOnFiber(HostRoot, 32)', say: 'An update whose payload is <code>{ element }</code> is queued on the HostRoot fiber, and the root is marked as having work.', set: { elem: 'keep', queue: 'upd' }, txt: { queue: 'HostRoot update queue: [ { element: <App/> } ]' } },
		{ phase: 'schedule', fn: 'ensureRootIsScheduled → scheduleImmediateRootScheduleTask (microtask)', say: '<code>render()</code> <b>returns without rendering</b>. <code>main.jsx</code> finishes; <code>#root</code> is still empty.', set: { l4: '', sched: 'on' }, txt: { sched: 'scheduled: microtask', cpu: 'main thread: main.jsx done' } },
		{ phase: 'schedule', fn: 'processRootScheduleInMicrotask → Scheduler task', say: 'The microtask sees a <b>Default</b> lane (not Sync), so it asks the Scheduler for a task. The Scheduler posts it as a macrotask (via <code>MessageChannel</code>).', set: { sched: 'upd' }, txt: { sched: 'scheduled: Scheduler task (Normal priority)' } },
		{ phase: 'render', fn: 'performWorkOnRootViaSchedulerTask → performWorkOnRoot(root, 32) → renderRootSync', say: 'The task runs and rendering starts. Default is a “blocking” lane, so it renders with the synchronous loop, without time slicing. The next chapter follows it.', set: { sched: 'done', cpu: 'upd' }, txt: { sched: 'running: render', cpu: 'main thread: React render' } },
	]
	const stacked = withStacks(steps, (() => {
		const m = ['main.jsx (module)']
		return [m, m, [...m, 'createRoot', 'createFiberRoot'], [...m, 'createRoot', 'listenToAllSupportedEvents'], [...m, 'jsxDEV'], [...m, 'root.render', 'requestUpdateLane'], [...m, 'root.render', 'updateContainerImpl', 'scheduleUpdateOnFiber'], [...m, 'root.render', 'updateContainerImpl', 'scheduleUpdateOnFiber', 'ensureRootIsScheduled', 'scheduleImmediateRootScheduleTask'], ['processRootScheduleInMicrotask', 'scheduleCallback'], [...TASK, 'renderRootSync']]
	})())
	return anim({
		id: 'hrw-boot-anim',
		caption: 'From script load to the first render being scheduled. Note how much happens before any component runs.',
		scenarios: [{ name: 'Page load', intro: 'The browser has parsed <code>index.html</code> and starts the <code>main.jsx</code> module.', scene, steps: stacked }],
	})
}

// ─── 3. First render: walking the tree ─────────────────────────────────────

export function firstRenderAnim() {
	const scene = appTree({ s: 'ghost' })
	const S = (say, fn, set, txt) => ({ phase: 'render', fn, say, set, txt })
	const steps = [
		S('Render starts at the <b>HostRoot</b> fiber. Its pending update says: render <code>&lt;App /&gt;</code>.', 'beginWork(HostRoot) → reconcileChildFibers(HostRoot, <App>)', { root: 'hl' }),
		S('React needs a fiber for the <code>App</code> element. <code>typeof App === "function"</code> → tag <b>0 (FunctionComponent)</b>.', 'createFiberFromTypeAndProps(App) → tag 0', { root: '', app: 'new' }),
		S('<b>Now <code>App</code> is called</b> for the first time. Its <code>useState</code>s are created, and its <code>jsx()</code> calls create 5 elements.', 'beginWork(App) → renderWithHooks(App) → App(props)', { app: 'run hl' }),
		S('The returned <code>&lt;ThemeContext&gt;</code> element’s type is a context object (<code>$$typeof: react.context</code>) → tag <b>10 (context provider)</b>.', 'createFiberFromTypeAndProps(ThemeContext) → tag 10', { app: 'run', ctx: 'new' }),
		S('Providers aren’t called. React pushes <code>value: "light"</code> on its context stack so components below can read it, then reconciles its child.', 'beginWork(ThemeContext) → pushProvider · createFiber(Layout)', { ctx: 'hl', layout: 'new' }),
		S('<code>Layout</code> is called with <code>props.children</code>: the elements <b>App</b> already created. Layout creates only <code>div</code>, <code>h1</code>, <code>main</code>.', 'beginWork(Layout) → renderWithHooks → Layout({ children })', { ctx: '', layout: 'run hl', div: 'new' }),
		S('A string type → tag <b>5 (HostComponent)</b>. Host fibers aren’t called; React reconciles their <code>props.children</code>.', 'beginWork(div) → reconcileChildrenArray(div, [h1, main])', { layout: 'run', div: 'hl', h1: 'new', main: 'new' }),
		S('<code>h1</code> has a single text child, set directly as text content (no text fiber). No children → it completes immediately: <code>document.createElement("h1")</code>.', 'beginWork(h1) → completeWork(h1)', { div: '', h1: 'done' }),
		S('<code>main</code>’s children are the three elements App created: <code>Nav</code>, the theme <code>button</code>, <code>CounterPage</code>. Fibers for all three are created first (siblings), then React goes <b>down</b> into the first.', 'beginWork(main) → reconcileChildrenArray(main, [Nav, button, CounterPage])', { main: 'hl', navc: 'new', theme: 'new', page: 'new' }),
		S('<code>Nav</code> is called and returns a <code>&lt;nav&gt;</code> with two buttons. They complete, then <code>Nav</code> completes: go <b>across</b> to the sibling.', 'Nav({ page, onNavigate }) → … completeWork(button, button, nav, Nav)', { main: '', navc: 'done', nav: 'done' }),
		S('The theme button has two text children (<code>"Theme: "</code>, <code>"light"</code>), so it gets two text fibers. They complete, then the button does.', 'beginWork(button) → createFiberFromText ×2 → completeWork', { theme: 'done' }),
		S('<code>CounterPage</code> is called: <code>useState(0)</code>, <code>useRef</code>, <code>useLayoutEffect</code> and <code>useEffect</code> are registered (effects only <b>recorded</b>, not run).', 'beginWork(CounterPage) → CounterPage()', { page: 'run hl', section: 'new' }),
		S('<code>section</code>’s three children get fibers. <code>h2</code> completes right away.', 'beginWork(section) → reconcileChildrenArray(section, [h2, Display, button])', { page: 'run', section: 'hl', h2: 'done', display: 'new', add: 'new' }),
		S('<code>Display</code> is called with <code>{ value: 0 }</code> and returns <code>&lt;p&gt;Count: {value}&lt;/p&gt;</code>.', 'beginWork(Display) → Display({ value: 0 })', { section: '', display: 'run hl', p: 'new' }),
		S('The <code>p</code> gets two text fibers, completes, and <code>Display</code> completes.', 'beginWork(p) → … → completeWork(p) · completeWork(Display)', { display: 'done', p: 'done' }),
		S('The last leaf: the “Add one” button.', 'beginWork(button) → completeWork(button)', { add: 'done' }),
		S('No more siblings: React climbs to the root, completing each parent. <code>workInProgress</code> becomes <code>null</code>. <b>The render is finished, but nothing is on screen yet.</b>', 'completeWork(section, CounterPage, main, div, Layout, ThemeContext, App, HostRoot)', { section: 'done', page: 'done', main: 'done', div: 'done', layout: 'done', ctx: 'done', app: 'done', root: 'done' }),
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(TASK)
		return [f.reconcile('HostRoot'), f.reconcile('HostRoot', 'reconcileSingleElement', 'createFiberFromTypeAndProps'), f.call('App', 'mountState'), f.reconcileAfterCall('App', 'reconcileSingleElement', 'createFiberFromTypeAndProps'), f.reconcile('ThemeContext', 'reconcileSingleElement', 'createFiberFromTypeAndProps'), f.call('Layout'), f.reconcile('div', 'reconcileChildrenArray', 'createFiberFromTypeAndProps'), f.complete('h1'), f.reconcile('main', 'reconcileChildrenArray', 'createFiberFromTypeAndProps'), f.call('Nav'), f.complete('button'), f.call('CounterPage', 'mountState'), f.reconcile('section', 'reconcileChildrenArray', 'createFiberFromTypeAndProps'), f.call('Display'), f.complete('p'), f.complete('button'), f.complete('HostRoot')]
	})())
	return anim({
		id: 'hrw-render-anim',
		delay: 2300,
		caption: 'The first render: one fiber at a time, down with <code>beginWork</code>, across, and up with <code>completeWork</code>. Orange = a component being called.',
		scenarios: [{ name: 'First render', intro: 'The Scheduler task has started <code>renderRootSync</code>. The fiber tree doesn’t exist yet.', scene, steps: stacked }],
	})
}

// ─── 4. Commit and first paint ──────────────────────────────────────────────

export function firstCommitAnim() {
	const d = (k, html) => `<div class="an dom-row" data-k="${k}" data-s="ghost">${html}</div>`
	const scene = `<div class="a-cols">
		${panel('DOM built in memory (completeWork)', `<div class="a-dom">
			${d('d-div', '&lt;div class="layout light"&gt;')}
			${d('d-h1', '&nbsp;&nbsp;&lt;h1&gt;How React Works&lt;/h1&gt;')}
			${d('d-main', '&nbsp;&nbsp;&lt;main&gt;')}
			${d('d-nav', '&nbsp;&nbsp;&nbsp;&nbsp;&lt;nav&gt;…2 buttons…&lt;/nav&gt;')}
			${d('d-theme', '&nbsp;&nbsp;&nbsp;&nbsp;&lt;button&gt;Theme: light&lt;/button&gt;')}
			${d('d-section', '&nbsp;&nbsp;&nbsp;&nbsp;&lt;section&gt; h2 · p "Count: 0" · button &lt;/section&gt;')}
		</div>`, 'wide')}
		${panel('document', `<div class="a-col"><div class="a-dom">&lt;div id="root"&gt;<span class="an" data-k="doc">(empty)</span>&lt;/div&gt;</div>${chip('pixels', 'pixels: blank page')}</div>`)}
		${panel('console (?trace)', `<div class="a-log">${['layout effect: button is 88 px wide', 'effect: set title 0'].map((t, i) => `<div class="an" data-k="log${i}" data-s="hide">${t}</div>`).join('')}</div>`)}
	</div>`
	const steps = [
		{ phase: 'render', fn: 'completeWork(h1) → document.createElement("h1")', say: 'DOM nodes are created during the render phase, on the way <b>up</b>, completely detached from the page.', set: { 'd-h1': 'new' } },
		{ phase: 'render', fn: 'completeWork(nav) → createElement + appendAllChildren', say: 'Each completed host fiber appends its children’s DOM nodes to its own node, which builds the DOM tree bottom-up.', set: { 'd-nav': 'new', 'd-theme': 'new' } },
		{ phase: 'render', fn: 'completeWork(section) → appendAllChildren(h2, p, button)', say: '<code>Display</code> is a component, not a DOM node, so React reaches through it and appends its <code>&lt;p&gt;</code>.', set: { 'd-section': 'new' } },
		{ phase: 'render', fn: 'completeWork(main) · completeWork(div)', say: 'At the top host fiber the whole UI exists as one detached <code>&lt;div&gt;</code>. Still nothing on screen.', set: { 'd-main': 'new', 'd-div': 'new' } },
		{ phase: 'commit', fn: 'commitRoot → flushMutationEffects → commitPlacement(App)', say: 'Commit starts. <code>App</code> is the fiber flagged <b>Placement</b>. It isn’t a DOM node, so React descends: App → ThemeContext → Layout → <code>div</code>.', set: { 'd-div': 'hl' } },
		{ phase: 'commit', fn: 'insertOrAppendPlacementNodeIntoContainer → appendChild(<div>) into #root', say: '<b>One</b> DOM insertion puts the whole tree into the document. Then <code>root.current = finishedWork</code>.', set: { 'd-div': 'done', 'd-h1': 'done', 'd-main': 'done', 'd-nav': 'done', 'd-theme': 'done', 'd-section': 'done', doc: 'upd' }, txt: { doc: '&lt;div class="layout light"&gt;…&lt;/div&gt;' } },
		{ phase: 'commit', fn: 'flushLayoutEffects → commitHookEffectListMount(CounterPage, Layout)', say: 'Layout effects run now: the DOM exists and can be measured, but the browser <b>hasn’t painted</b>.', set: { doc: '', log0: 'keep' } },
		{ phase: 'paint', fn: 'task ends → style · layout · paint', say: 'The Scheduler task returns and the browser paints: the user sees the app.', set: { pixels: 'ok' }, txt: { pixels: 'pixels: the app is visible' } },
		{ phase: 'effects', fn: 'flushPassiveEffects → commitHookEffectListMount(CounterPage, Passive)', say: 'This render used the Default lane, so <code>useEffect</code> runs in a <b>later task, after paint</b>. (For a click it runs at the end of the commit: see chapter 5.)', set: { log1: 'done' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(TASK)
		return [f.complete('h1'), f.complete('nav'), f.complete('section'), f.complete('div'), f.commit(...MUTATION, 'commitPlacement'), f.commit(...MUTATION, 'commitPlacement', 'insertOrAppendPlacementNode'), f.commit('flushLayoutEffects', 'commitLayoutEffectOnFiber', 'commitHookEffectListMount'), [], ['(Scheduler task)', 'flushPassiveEffects', 'commitHookEffectListMount']]
	})())
	return anim({
		id: 'hrw-commit-anim',
		caption: 'The DOM is built off-screen during render, inserted with one appendChild during commit, then painted.',
		scenarios: [{ name: 'First commit', intro: 'The render phase from the previous animation, seen from the DOM’s side.', scene, steps: stacked }],
	})
}

// ─── 5. A click ─────────────────────────────────────────────────────────────

export function clickAnim() {
	const scene = `${appTree({ s: 'done', flags: ['p', 'page'] })}
		<div class="a-row" style="justify-content:center;margin-top:12px">${chip('lane', 'lane: –')}${chip('task', 'scheduled: nothing')}${chip('scr', 'screen: Count: 0')}</div>
		<div class="a-log" style="margin-top:10px">${['cleanup: title effect 0', 'effect: set title 1'].map((t, i) => `<div class="an" data-k="log${i}" data-s="hide">${t}</div>`).join('')}</div>`
	const path = ['root', 'app', 'ctx', 'layout', 'div', 'main']
	const each = (keys, v) => Object.fromEntries(keys.map((k) => [k, v]))
	const steps = [
		{ phase: 'event', fn: 'dispatchDiscreteEvent("click") · capture, then bubble listener on #root', say: 'The click lands on the “Add one” button, but the listener is on <code>#root</code>. React finds the button’s fiber, collects <code>onClick</code> props along the path, and calls yours.', set: { add: 'done hl' } },
		{ phase: 'event', fn: 'setCount(1) → dispatchSetState(CounterPage, 1)', say: 'Your handler calls <code>setCount(1)</code>. An update is queued on <code>CounterPage</code>’s state hook. Nothing renders yet.', set: { add: 'done', page: 'done hl', lane: 'upd' }, txt: { lane: 'lane: SyncLane (2)' } },
		{ phase: 'schedule', fn: 'scheduleUpdateOnFiber(CounterPage, SyncLane) → ensureRootIsScheduled', say: 'A click is a discrete event → <b>SyncLane</b>. React schedules a <b>microtask</b>; the event handler returns first.', set: { page: 'done', lane: '', task: 'on' }, txt: { task: 'scheduled: microtask' } },
		{ phase: 'render', fn: 'processRootScheduleInMicrotask → performSyncWorkOnRoot → markUpdateLaneFromFiberToRoot', say: 'The microtask renders. First React marks the path: CounterPage gets <code>lanes</code>, every ancestor gets <code>childLanes</code>.', set: { task: 'done', ...each(path, 'cmp') }, txt: { task: 'running: render' } },
		{ phase: 'render', fn: 'beginWork(HostRoot … main) → bailoutOnAlreadyFinishedWork → children have work', say: 'Each ancestor has no update of its own, so it <b>bails out</b>, and its function isn’t called. <code>App()</code> doesn’t run.', set: each(path, 'bail') },
		{ phase: 'render', fn: 'beginWork(h1 · Nav · button) → bailout → skip subtree', say: 'Siblings with no pending work are <b>skipped with their whole subtree</b>.', set: each(['h1', 'navc', 'nav', 'theme'], 'skip') },
		{ phase: 'render', fn: 'renderWithHooks(CounterPage) → CounterPage() → updateReducer → count = 1', say: '<code>CounterPage</code> has the update → it’s called. <code>useState</code> returns 1, and <b>new element objects</b> are created for its whole output.', set: { page: 'run hl' } },
		{ phase: 'render', fn: 'reconcileChildrenArray(section) → useFiber(h2, Display, button)', say: 'Same types at the same positions → the existing fibers are <b>reused</b> with new props.', set: { page: 'run', section: 'keep', h2: 'keep', add: 'keep' } },
		{ phase: 'render', fn: 'Display({ value: 1 }) → text "0" → "1"', say: '<code>Display</code> receives a new props object, so it re-renders. Its text child changed → flagged <b>Update</b>.', set: { display: 'run hl', p: 'upd', 'p-flag': '' }, txt: { 'p-sub': '"Count: 1"', 'p-flag': 'Update' } },
		{ phase: 'render', fn: 'completeWork(… → HostRoot)', say: 'React climbs back to the root. Only <code>CounterPage</code> and <code>Display</code> ran.', set: { display: 'done', page: 'done', section: 'done', h2: 'done', add: 'done' } },
		{ phase: 'commit', fn: 'flushMutationEffects → commitTextUpdate("0" → "1")', say: 'One text write. (<code>commitUpdate</code> is also called for the re-rendered host nodes, but it finds no changed props.)', set: { p: 'done', 'p-flag': 'ghost', scr: 'upd' }, txt: { scr: 'DOM: Count: 1 (not painted yet)' } },
		{ phase: 'commit', fn: 'flushLayoutEffects → layout effect (button width)', say: 'The layout effect’s deps <code>[count]</code> changed, so it runs again, still before paint.' },
		{ phase: 'effects', fn: 'flushPassiveEffects (SyncLane: at the end of the commit)', say: 'For a <b>click</b>, React flushes <code>useEffect</code> right away: first the <b>previous</b> effect’s cleanup (with the old <code>count</code>, 0)…', set: { log0: 'upd' } },
		{ phase: 'effects', fn: 'commitHookEffectListMount(CounterPage, Passive)', say: '…then the new effect with <code>count = 1</code>.', set: { log1: 'done' } },
		{ phase: 'paint', fn: 'microtask ends → paint', say: 'The browser paints “Count: 1”.', set: { scr: 'ok' }, txt: { scr: 'screen: Count: 1' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		return [event(), event('dispatchSetState'), event('dispatchSetState', 'scheduleUpdateOnFiber', 'ensureRootIsScheduled'), f.start('finishQueueingConcurrentUpdates', 'markUpdateLaneFromFiberToRoot'), f.bail('main'), f.bail('Nav'), f.call('CounterPage', 'updateReducer'), f.reconcile('section', 'reconcileChildrenArray', 'useFiber'), f.call('Display'), f.complete('HostRoot'), f.commit(...MUTATION, 'commitTextUpdate'), f.commit('flushLayoutEffects', 'commitLayoutEffectOnFiber', 'commitHookEffectListMount'), f.commit('flushPassiveEffects', 'commitHookEffectListUnmount'), f.commit('flushPassiveEffects', 'commitHookEffectListMount'), []]
	})())
	return anim({
		id: 'hrw-click-anim',
		delay: 2400,
		caption: 'One click on “Add one”: only the component that owns the state and its children run. Everything above bails out.',
		scenarios: [{ name: 'Add one', intro: 'The app is on screen, count is 0. The user clicks “Add one”.', scene, steps: stacked }],
	})
}

// ─── 6. Page switch ─────────────────────────────────────────────────────────

export function pageSwitchAnim() {
	const sub = (s) => ({ cls: 'comp sm', s })
	const h = (s) => ({ cls: 'host sm', s })
	const scene = `<div class="t-compact">${tree(['main', 'main', { cls: 'host sm', flag: true }, [
		['navc', 'Nav', sub('')],
		['theme', 'button', h('')],
		['cp', 'CounterPage', { cls: 'comp sm', sub: 'count: 1' }, [['cs', 'section', h(''), [['ch2', 'h2', h('')], ['cd', 'Display', sub('')], ['cb', 'button', h('')]]]]],
		['tp', 'TodosPage', { cls: 'comp sm', s: 'hide', flag: true }, [['ts', 'section', h('hide'), [['tf', 'form', h('hide')], ['tu', 'ul', h('hide'), [['t1', 'TodoItem', { cls: 'comp sm', sub: 'key 1', s: 'hide' }], ['t2', 'TodoItem', { cls: 'comp sm', sub: 'key 2', s: 'hide' }]]]]]]],
	]])}</div>
	<div class="a-cols" style="margin-top:12px">
		${panel('DOM inside &lt;main&gt;', `<div class="a-dom">&lt;nav&gt; · &lt;button&gt; · <span class="an" data-k="dsec">&lt;section&gt;Counter…&lt;/section&gt;</span></div>`)}
		${panel('console (?trace)', `<div class="a-log">${['cleanup: title effect 1', 'effect: subscribe to resize'].map((t, i) => `<div class="an" data-k="log${i}" data-s="hide">${t}</div>`).join('')}</div>`)}
	</div>`
	const steps = [
		{ phase: 'event', fn: "onNavigate('todos') → dispatchSetState(App, 'todos')", say: 'The “Todos” button calls <code>onNavigate</code>, which is <code>App</code>’s <code>setPage</code>. The update goes on <b>App</b>, which owns the state.' },
		{ phase: 'render', fn: 'App() → page === "todos" → jsx(TodosPage, {})', say: 'App re-renders. This time the ternary creates a <code>TodosPage</code> element in the third slot of <code>Layout</code>’s children.' },
		{ phase: 'render', fn: 'Layout() · Nav({ page: "todos" })', say: 'Both re-render: App created new elements for them, so their props are new objects.', set: { navc: 'run' } },
		{ phase: 'render', fn: 'reconcileChildrenArray(main, [Nav, button, TodosPage])', say: 'Slots 0 and 1 match. Slot 2: element type <code>TodosPage</code> vs fiber type <code>CounterPage</code> → <b>different type</b>.', set: { navc: 'done', cp: 'cmp' } },
		{ phase: 'render', fn: 'createFiberFromTypeAndProps(TodosPage) · deleteChild(CounterPage)', say: 'A new fiber for TodosPage (flagged Placement), and CounterPage is added to <code>main.deletions</code> (main flagged ChildDeletion). <code>count: 1</code> will be lost.', set: { cp: 'del', cs: 'del', ch2: 'del', cd: 'del', cb: 'del', tp: 'new', 'tp-flag': '', 'main-flag': '' }, txt: { 'tp-flag': 'Placement', 'main-flag': 'ChildDeletion' } },
		{ phase: 'render', fn: "TodosPage() → mountState([…]), mountState(''), useEffect", say: 'TodosPage <b>mounts</b>: fresh state. Its <code>todos.map</code> creates two <code>TodoItem</code> elements with keys 1 and 2.', set: { tp: 'run hl', ts: 'new', tf: 'new', tu: 'new' } },
		{ phase: 'render', fn: 'TodoItem[key=1]() · TodoItem[key=2]() · completeWork(…)', say: 'Both items mount, and their DOM is built off-screen as React climbs.', set: { tp: 'new', t1: 'new', t2: 'new' } },
		{ phase: 'commit', fn: 'commitDeletionEffectsOnFiber(CounterPage → section → …)', say: 'Mutation phase: React walks the deleted subtree (detaching refs, running layout cleanups)…', set: { cp: 'del hl' } },
		{ phase: 'commit', fn: 'removeChild(<section>) from <main>', say: '…then removes only the <b>top</b> DOM node of that subtree.', set: { cp: 'del faint', cs: 'hide', ch2: 'hide', cd: 'hide', cb: 'hide', dsec: 'del' } },
		{ phase: 'commit', fn: 'commitPlacement(TodosPage) → appendChild(<section>) into <main>', say: 'The new subtree goes in with one insertion.', set: { cp: 'hide', 'tp-flag': 'ghost', 'main-flag': 'ghost', dsec: 'new' }, txt: { dsec: '&lt;section&gt;Todos…&lt;/section&gt;' } },
		{ phase: 'effects', fn: 'flushPassiveEffects → commitHookEffectListUnmount(CounterPage, Passive)', say: 'Passive effects: <b>unmount cleanups first</b>. The deleted CounterPage’s title effect cleans up…', set: { log0: 'upd' } },
		{ phase: 'effects', fn: 'commitHookEffectListMount(TodosPage, Passive)', say: '…then the new page’s effect runs and subscribes to <code>resize</code>.', set: { log1: 'done', tp: 'done', ts: 'done', tf: 'done', tu: 'done', t1: 'done', t2: 'done' } },
	]
	const stacked = withStacks(steps, (() => {
		const f = frames(MICRO)
		return [event('dispatchSetState'), f.call('App', 'jsxDEV'), f.call('Nav'), f.reconcile('main', 'reconcileChildrenArray'), f.reconcile('main', 'reconcileChildrenArray', 'deleteChild'), f.call('TodosPage', 'mountState'), f.call('TodoItem'), f.commit(...MUTATION, 'commitDeletionEffects'), f.commit(...MUTATION, 'commitDeletionEffects', 'removeChild'), f.commit(...MUTATION, 'commitPlacement', 'insertOrAppendPlacementNode'), f.commit('flushPassiveEffects', 'commitHookEffectListUnmount'), f.commit('flushPassiveEffects', 'commitHookEffectListMount')]
	})())
	return anim({
		id: 'hrw-switch-anim',
		delay: 2400,
		caption: 'Switching pages is Rule 1 of reconciliation: a different type at the same position deletes one subtree and mounts another.',
		scenarios: [{ name: 'Counter → Todos', intro: 'The Counter page is showing with <code>count: 1</code>. The user clicks “Todos”.', scene, steps: stacked }],
	})
}

// ─── 7. The keyed list ──────────────────────────────────────────────────────

export function todoListAnim() {
	const track = (prefix, keys, label, s = '') =>
		`<div class="a-label">${label}</div><div class="a-track" style="--slot:92px">${keys
			.map(([k, text], i) => node(`${prefix}-${k}`, `key ${k}`, { cls: prefix === 'n' ? 'el sm' : 'comp sm', sub: text, s }).replace('class="an node', `style="--x:${i}" class="an node`))
			.join('')}</div>`
	const dom = (keys) => `<div class="a-label">DOM &lt;ul&gt;</div><div class="a-track" style="--slot:92px">${keys.map(([k, text, s = ''], i) => `<div class="an node host sm" data-k="d-${k}" style="--x:${i}"${s ? ` data-s="${s}"` : ''}>&lt;li&gt;<small>${text}</small></div>`).join('')}</div>`
	const info = (keys) => `<div class="a-row" style="margin:6px 0 10px">${chip('pass', 'start')}${chip('lp', 'lastPlacedIndex = 0')}<span class="a-label">map</span>${keys.map((k) => chip(`m-${k}`, `${k} → fiber`, 'ghost')).join('')}</div>`
	const T = { 1: '“Learn JSX”', 2: '“Read about…”', 3: '“x”' }

	const add = {
		name: 'Add a todo',
		intro: '<code>setTodos([...todos, { id: 3, text: "x" }])</code> and <code>setText("")</code> are called in the same submit handler.',
		scene: `<div class="ld-scene">${track('o', [[1, T[1]], [2, T[2]]], 'old fibers')}${track('n', [[1, T[1]], [2, T[2]], [3, T[3]]], 'new elements')}${info([])}${dom([[1, T[1]], [2, T[2]], [3, T[3], 'ghost']])}</div>`,
		steps: [
			{ phase: 'event', fn: 'submit → setTodos([...]) · setText("")', say: 'Two state updates in one handler. The trace shows <b>one</b> render: both were queued and the microtask processed them together (batching).' },
			{ phase: 'render', fn: 'TodosPage() → todos.map → jsx(TodoItem, {…}, 1 / 2 / 3)', say: 'TodosPage re-renders and creates three <code>TodoItem</code> elements. The key is the third argument of <code>jsx()</code>.' },
			{ phase: 'render', fn: 'reconcileChildrenArray(ul) · updateSlot(key 1, key 1) · placeChild', say: 'Pass 1 walks both lists while keys match. Key 1 = key 1 → reuse.', set: { 'o-1': 'keep', 'n-1': 'keep hl', pass: 'on', lp: 'upd' }, txt: { pass: 'pass 1' } },
			{ phase: 'render', fn: 'updateSlot(key 2, key 2) · placeChild', say: 'Key 2 = key 2 → reuse. <code>lastPlacedIndex</code> becomes 1.', set: { 'n-1': 'keep', lp: '', 'o-2': 'keep', 'n-2': 'keep hl' }, txt: { lp: 'lastPlacedIndex = 1' } },
			{ phase: 'render', fn: 'createFiberFromTypeAndProps(TodoItem) · placeChild → Placement', say: 'The old list ran out. Key 3 is a <b>new fiber</b>, flagged Placement. TodoItem 3 mounts; items 1 and 2 re-render (their parent did) but keep their fibers.', set: { 'n-2': 'keep', 'n-3': 'new hl', pass: 'on' }, txt: { pass: 'pass 2b' } },
			{ phase: 'commit', fn: 'commitPlacement(TodoItem[key=3]) → appendChild(<li>) into <ul>', say: 'One DOM insertion.', set: { 'n-3': 'new', 'd-3': 'new', pass: '' }, txt: { pass: 'commit' } },
		],
	}
	const remove = {
		name: 'Remove the first todo',
		intro: 'The list holds keys 1, 2, 3. The user clicks × on “Learn JSX” (key 1).',
		scene: `<div class="ld-scene">${track('o', [[1, T[1]], [2, T[2]], [3, T[3]]], 'old fibers')}${track('n', [[2, T[2]], [3, T[3]]], 'new elements')}${info([1, 2, 3])}${dom([[1, T[1]], [2, T[2]], [3, T[3]]])}</div>`,
		steps: [
			{ phase: 'event', fn: 'onRemove → setTodos(todos.filter(t => t.id !== 1))', say: 'The <code>onRemove</code> closure was created by TodosPage for this item.' },
			{ phase: 'render', fn: "reconcileChildrenArray(ul) · updateSlot(old key 1, new key 2) → null", say: 'Pass 1: the first keys differ, so the fast path stops immediately.', set: { 'o-1': 'cmp', 'n-2': 'cmp', pass: 'on' }, txt: { pass: 'pass 1 → break' } },
			{ phase: 'render', fn: 'mapRemainingChildren(oldFiber)', say: 'All old fibers go into a Map by key.', set: { 'o-1': '', 'n-2': '', 'm-1': '', 'm-2': '', 'm-3': '' }, txt: { pass: 'pass 3' } },
			{ phase: 'render', fn: "updateFromMap('2') → useFiber · placeChild: oldIndex 1 ≥ 0", say: 'Key 2 found → reused, it <b>stays</b>. <code>lastPlacedIndex</code> = 1.', set: { 'n-2': 'keep hl', 'o-2': 'keep', 'm-2': 'del', lp: 'upd' }, txt: { lp: 'lastPlacedIndex = 1' } },
			{ phase: 'render', fn: "updateFromMap('3') → useFiber · placeChild: oldIndex 2 ≥ 1", say: 'Key 3 found → reused, stays.', set: { 'n-2': 'keep', 'n-3': 'keep hl', 'o-3': 'keep', 'm-3': 'del', lp: '' }, txt: { lp: 'lastPlacedIndex = 2' } },
			{ phase: 'render', fn: 'deleteChild(TodoItem[key=1])', say: 'Key 1 is left in the map → deleted.', set: { 'n-3': 'keep', 'o-1': 'del', 'm-1': 'del' } },
			{ phase: 'commit', fn: 'commitDeletionEffectsOnFiber(TodoItem[key=1]) → removeChild(<li>) from <ul>', say: '<b>One DOM operation.</b> The other two <code>&lt;li&gt;</code>s are untouched. Without keys, React would have rewritten the text of rows 1 and 2 and removed the last row.', set: { 'd-1': 'gone', 'd-2': 'keep', 'd-3': 'keep', pass: '' }, css: { 'd-2': { '--x': '0' }, 'd-3': { '--x': '1' } }, txt: { pass: 'commit' } },
		],
	}
	return anim({
		id: 'hrw-list-anim',
		caption: 'The todo list with keys: adding appends one <code>&lt;li&gt;</code>; removing deletes exactly one.',
		scenarios: [add, remove],
	})
}
