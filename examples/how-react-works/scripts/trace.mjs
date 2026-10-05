// Records what really runs when the demo app is used, in order:
// React's own functions (via Chrome DevTools Protocol logpoints on the
// development build that Vite serves) interleaved with the app's log() calls.
//
//   node scripts/trace.mjs
//
// Writes generated/trace.json and a readable generated/trace.txt.

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUT = path.join(ROOT, 'generated')
const DEPS = path.join(ROOT, 'node_modules/.vite/deps')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 5198

// name → [file, how to find the declaration, info expression evaluated with `arguments`]
const DOM = 'react-dom_client.js'
const JSX = 'react_jsx-dev-runtime.js'
const fn = (name, info = "''", when = 'true', file = DOM) => [name, file, `function ${name}(`, info, when]
const TRACED = [
	['createRoot', DOM, 'exports.createRoot = function(', "'container #' + arguments[0].id"],
	['root.render', DOM, 'ReactDOMRoot.prototype.render = function(', "__desc(arguments[0])"],
	['jsxDEV', JSX, 'exports.jsxDEV = function(', "__tn(arguments[0]) + (arguments[2] !== undefined ? ' key=' + arguments[2] : (arguments[1] && arguments[1].key !== undefined ? ' key=' + arguments[1].key : ''))"],
	fn('createFiberRoot'),
	fn('listenToAllSupportedEvents'),
	fn('updateContainerImpl', "'lane ' + arguments[1]"),
	fn('requestUpdateLane', '__n(arguments[0])'),
	fn('dispatchDiscreteEvent', "arguments[0] + ((arguments[1] & 4) ? ' (capture listener)' : ' (bubble listener)')"),
	fn('dispatchSetState', "__n(arguments[0]) + ' ← ' + __v(arguments[2])"),
	fn('markUpdateLaneFromFiberToRoot', '__n(arguments[0])'),
	fn('scheduleUpdateOnFiber', "__n(arguments[1]) + ' lane ' + arguments[2]"),
	fn('ensureRootIsScheduled'),
	fn('scheduleImmediateRootScheduleTask'),
	fn('processRootScheduleInMicrotask'),
	fn('performWorkOnRootViaSchedulerTask'),
	fn('performSyncWorkOnRoot'),
	fn('performWorkOnRoot', "'lanes ' + arguments[1]"),
	fn('renderRootSync'),
	fn('prepareFreshStack'),
	fn('beginWork', '__n(arguments[1])'),
	fn('renderWithHooks', "__n(arguments[1]) + (arguments[0] === null ? ' (mount)' : ' (update)')"),
	fn('mountState', '__v(arguments[0])'),
	fn('updateReducer'),
	fn('bailoutOnAlreadyFinishedWork', "__n(arguments[1]) + ((arguments[1].childLanes & arguments[2]) ? ' → children have work' : ' → skip subtree')"),
	fn('propagateContextChanges', '__n(arguments[0])'),
	fn('reconcileChildFibersImpl', "__n(arguments[0]) + ' ← ' + __desc(arguments[2])"),
	fn('reconcileChildrenArray', "__n(arguments[0]) + ' ← [' + arguments[2].length + ' children]'"),
	fn('createFiberFromTypeAndProps', '__tn(arguments[0])'),
	fn('createFiberFromText', 'JSON.stringify(arguments[0])'),
	fn('useFiber', '__n(arguments[0])'),
	fn('placeChild', "__n(arguments[0]) + (arguments[0].alternate ? ' oldIndex ' + arguments[0].alternate.index : ' (new)') + ' lastPlacedIndex ' + arguments[1]"),
	fn('deleteChild', '__n(arguments[1])'),
	fn('mapRemainingChildren'),
	fn('completeWork', '__n(arguments[1])'),
	fn('commitRoot'),
	fn('commitBeforeMutationEffects'),
	fn('flushMutationEffects', "''", 'pendingEffectsStatus === PENDING_MUTATION_PHASE'),
	fn('commitPlacement', '__n(arguments[0])'),
	fn('insertOrAppendPlacementNodeIntoContainer', "(arguments[0].tag === 5 || arguments[0].tag === 6) ? ((arguments[1] ? 'insertBefore(' : 'appendChild(') + '<' + arguments[0].stateNode.nodeName.toLowerCase() + '>) into ' + (arguments[2].id ? '#' + arguments[2].id : '<' + arguments[2].nodeName.toLowerCase() + '>')) : __n(arguments[0]) + ' is not a DOM node → descend to its child'"),
	fn('insertOrAppendPlacementNode', "(arguments[0].tag === 5 || arguments[0].tag === 6) ? ((arguments[1] ? 'insertBefore(' : 'appendChild(') + '<' + arguments[0].stateNode.nodeName.toLowerCase() + '>) into ' + (arguments[2].id ? '#' + arguments[2].id : '<' + arguments[2].nodeName.toLowerCase() + '>')) : __n(arguments[0]) + ' is not a DOM node → descend to its child'"),
	fn('commitDeletionEffectsOnFiber', '__n(arguments[2])'),
	fn('removeChild', "'<' + arguments[1].nodeName.toLowerCase() + '> from <' + arguments[0].nodeName.toLowerCase() + '>'"),
	fn('removeChildFromContainer', "'<' + arguments[1].nodeName.toLowerCase() + '> from #' + arguments[0].id"),
	fn('commitUpdate', 'arguments[1]'),
	fn('commitTextUpdate', "JSON.stringify(arguments[1]) + ' → ' + JSON.stringify(arguments[2])"),
	fn('commitHookEffectListUnmount', "__n(arguments[1]) + ' ' + __flags(arguments[0])", '__effects(arguments[1], arguments[0], true)'),
	fn('flushLayoutEffects', "''", 'pendingEffectsStatus === PENDING_LAYOUT_PHASE'),
	fn('commitHookEffectListMount', "__n(arguments[1]) + ' ' + __flags(arguments[0])", '__effects(arguments[1], arguments[0], false)'),
	fn('flushPassiveEffects', "''", 'pendingEffectsStatus === PENDING_PASSIVE_PHASE'),
]

// Helpers available to the logpoints
const HELPERS = `
window.__TRACE__ = [];
window.__tn = (t) => typeof t === 'string' ? t : typeof t === 'function' ? (t.displayName || t.name) : t == null ? String(t) : (t.displayName || (t.$$typeof && t.$$typeof.description) || typeof t);
window.__n = (f) => { if (!f) return 'null'; if (f.tag === 3) return 'HostRoot'; if (f.tag === 6) return 'text ' + JSON.stringify(f.pendingProps); if (f.tag === 7) return 'Fragment'; return window.__tn(f.type) + (f.key != null ? '[key=' + f.key + ']' : ''); };
window.__v = (v) => { try { return typeof v === 'function' ? 'updater fn' : JSON.stringify(v).slice(0, 60); } catch (e) { return String(v); } };
window.__desc = (c) => c == null ? String(c) : Array.isArray(c) ? 'array[' + c.length + ']' : (typeof c === 'object' && c.$$typeof) ? '<' + window.__tn(c.type) + '>' : JSON.stringify(c);
window.__effects = (fiber, flags, needDestroy) => { const q = fiber && fiber.updateQueue; const last = q && q.lastEffect; if (!last) return false; let e = last.next; do { if ((e.tag & flags) === flags && (!needDestroy || (e.inst && e.inst.destroy !== undefined))) return true; e = e.next } while (e !== last.next); return false; };
window.__flags = (f) => [[1, 'HasEffect'], [2, 'Insertion'], [4, 'Layout'], [8, 'Passive']].filter(([b]) => f & b).map(([, n]) => n).join('|') || String(f);
`

function findLocations() {
	const locs = []
	const missing = []
	for (const [name, file, needle, info, when = 'true'] of TRACED) {
		const lines = fs.readFileSync(path.join(DEPS, file), 'utf8').split('\n')
		const i = lines.findIndex((l) => l.includes(needle))
		if (i < 0) {
			missing.push(name)
			continue
		}
		const col = lines[i].indexOf('{', lines[i].indexOf(needle) + needle.length) + 1
		locs.push({ name, file, line: i, col, info, when })
	}
	if (missing.length) console.warn('Not found in the React build (skipped):', missing.join(', '))
	return locs
}

// Real element objects: the dev runtime (what the browser used) and the production runtime.
function productionElements() {
	const require = createRequire(path.join(ROOT, 'package.json'))
	const prod = require(path.join(ROOT, 'node_modules/react/cjs/react-jsx-runtime.production.js'))
	const ser = (el) => JSON.parse(JSON.stringify(el, (k, v) => (typeof v === 'symbol' ? `Symbol(${v.description})` : typeof v === 'function' ? `[Function ${v.name}]` : v)))
	function App() {}
	return {
		app: ser(prod.jsx(App, {})),
		p: ser(prod.jsxs('p', { className: 'display', children: ['Count: ', 0] })),
		keyed: ser(prod.jsx('li', { className: 'light', children: 'Learn JSX' }, 1)),
	}
}

const server = await createServer({ root: ROOT, logLevel: 'error', server: { port: PORT, strictPort: true } })
await server.listen()
const url = `http://localhost:${PORT}/?trace`
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

try {
	// Warm-up load so Vite pre-bundles React into node_modules/.vite/deps
	const warm = await browser.newPage()
	await warm.goto(url, { waitUntil: 'networkidle0' })
	await warm.close()

	const locations = findLocations()
	const page = await browser.newPage()
	await page.evaluateOnNewDocument(HELPERS)
	const cdp = await page.createCDPSession()
	await cdp.send('Debugger.enable')
	for (const loc of locations) {
		const expr = `(window.__TRACE__ && (() => { try { return ${loc.when} } catch (e) { return true } })() && window.__TRACE__.push(['react', ${JSON.stringify(loc.name)}, (() => { try { return String(${loc.info}) } catch (e) { return '?' } })()]), false)`
		await cdp.send('Debugger.setBreakpointByUrl', {
			urlRegex: loc.file.replace(/[.]/g, '\\.') + '(\\?|$)',
			lineNumber: loc.line,
			columnNumber: loc.col,
			condition: expr,
		})
	}

	const mark = (label) => page.evaluate((l) => window.__TRACE__.push(['mark', l]), label)
	const settle = () => new Promise((r) => setTimeout(r, 400))
	const snapshot = (label) =>
		page.evaluate((l) => {
			const container = document.getElementById('root')
			const key = Object.keys(container).find((k) => k.startsWith('__reactContainer$'))
			const hookValues = (f) => {
				const out = []
				for (let h = f.memoizedState; h && typeof h === 'object' && 'next' in h; h = h.next) {
					const s = h.memoizedState
					out.push(s && typeof s === 'object' && 'create' in s ? 'effect' : s && typeof s === 'object' && 'current' in s ? 'ref' : window.__v(s))
				}
				return out
			}
			const walk = (f) => {
				const node = { name: window.__n(f), tag: f.tag }
				if (f.tag === 0) node.hooks = hookValues(f)
				if (f.stateNode instanceof Node) node.dom = f.stateNode.nodeName.toLowerCase()
				const kids = []
				for (let c = f.child; c; c = c.sibling) kids.push(walk(c))
				if (kids.length) node.children = kids
				return node
			}
			return { label: l, tree: walk(container[key].stateNode.current), html: container.innerHTML }
		}, label)

	await page.goto(url, { waitUntil: 'networkidle0' })
	await settle()
	const snapshots = [await snapshot('after first render')]

	const devElements = await page.evaluate(async () => {
		const entry = performance.getEntriesByType('resource').find((e) => e.name.includes('react_jsx-dev-runtime'))
		const mod = await import(entry.name)
		const rt = mod.default ?? mod
		const { App } = await import('/src/App.jsx')
		const T = window.__TRACE__
		window.__TRACE__ = null // don't record these sample calls
		const describe = (el) => {
			const out = {}
			for (const k of Reflect.ownKeys(el)) {
				const v = el[k]
				out[String(k)] =
					typeof v === 'symbol' ? `Symbol(${v.description})` : typeof v === 'function' ? `[Function ${v.name}]` : k === 'props' ? JSON.parse(JSON.stringify(v)) : k === '_owner' ? v : typeof v === 'object' && v !== null ? '{…}' : v
			}
			return out
		}
		const res = { app: describe(rt.jsxDEV(App, {}, undefined, false)), p: describe(rt.jsxDEV('p', { className: 'display', children: ['Count: ', 0] }, undefined, true)) }
		window.__TRACE__ = T
		return res
	})

	await mark('click "Add one"')
	await page.click('section button')
	await settle()

	await mark('click "Theme"')
	await page.click('button.theme')
	await settle()

	await mark('click "Todos" (page switch)')
	await page.click('nav button:nth-child(2)')
	await settle()
	snapshots.push(await snapshot('on the Todos page'))

	await mark('type "x" in the input')
	await page.type('form input', 'x')
	await settle()

	await mark('submit the form (add a todo)')
	await page.click('form button')
	await settle()

	await mark('click × on the first todo (remove)')
	await page.click('ul li:first-child button')
	await settle()
	snapshots.push(await snapshot('after removing a todo'))

	const events = await page.evaluate(() => window.__TRACE__)
	const phases = []
	let current = { label: 'page load', events: [] }
	for (const e of events) {
		if (e[0] === 'mark') {
			phases.push(current)
			current = { label: e[1], events: [] }
		} else current.events.push(e[0] === 'app' ? { app: e[1] } : { fn: e[1], info: e[2] })
	}
	phases.push(current)

	const result = {
		react: '19.2.5 (development build served by Vite)',
		traced: locations.map((l) => l.name),
		elements: { development: devElements, production: productionElements() },
		phases,
		snapshots,
	}
	fs.writeFileSync(path.join(OUT, 'trace.json'), JSON.stringify(result, null, 2) + '\n')

	const txt = phases
		.map((p) => `### ${p.label}\n` + p.events.map((e) => (e.app ? `  [app] ${e.app}` : `  ${e.fn}${e.info ? `  ${e.info}` : ''}`)).join('\n'))
		.join('\n\n')
	fs.writeFileSync(path.join(OUT, 'trace.txt'), txt + '\n')
	console.log(`Traced ${locations.length} functions, ${events.length} events → generated/trace.json, trace.txt`)
} finally {
	await browser.close()
	await server.close()
}
