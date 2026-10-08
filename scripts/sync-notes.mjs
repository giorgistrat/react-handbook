// Builds src/content/notes/<module>/<slug>.md for every module in
// src/lib/modules.mjs, converting Obsidian syntax and injecting diagrams.
// Modules with `vault` read their notes from that vault folder; notes with
// `site: true` (and modules without `vault`) read from content/<module>/.
//
//   node scripts/sync-notes.mjs
//
// Transformations:
//   - [[Note]], [[Note|alias]], [[Note#Heading]], [[#Heading]] → Markdown links
//     (notes outside this folder become plain text)
//   - 🔴 🟡 ⚪ → level dots
//   - "Interview Q&A" paragraphs → collapsible <details> cards
//   - ASCII diagrams → HTML/SVG/Mermaid figures
//   - extra figures inserted after selected headings
//
// Site-only notes may use build-time markers that pull in real
// output from the demo app (examples/how-react-works):
//   <!-- source file="App.jsx" -->                      the demo's source
//   <!-- compiled file="App" mode="automatic" fn="App" --> Babel / Vite output
//   <!-- trace phase="page load" from="createRoot" to="root.render" -->
//   <!-- tree snapshot="0" -->                          a recorded fiber tree
//   <!-- element which="production.app" -->            a recorded element object
//   <!-- figure name="bootAnim" -->                     an animation or diagram
//
// Notes outside React Internals use the shared demo app (examples/product-store):
//   <!-- source file="src/lessons/fundamentals/03-jsx.tsx" region="card" -->
//        a `// #region card` … `// #endregion` block of real source
//   <!-- compiled file="03-jsx" mode="automatic|classic" region="card" -->
//   <!-- output from="fundamentals" path="dom.card.logs" as="log|json|text|html" -->
//        a value recorded by examples/product-store/scripts/record.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import GithubSlugger from 'github-slugger'
import os from 'node:os'
import { MODULES, ALL_NOTES } from '../src/lib/modules.mjs'
import * as D from '../src/lib/diagrams.mjs'
import * as A from '../src/lib/animations.mjs'
import * as H from '../src/lib/animations-hrw.mjs'
import * as M from '../src/lib/engine-map.mjs'
import * as F from '../src/lib/animations-fund.mjs'
import * as HK from '../src/lib/animations-hooks.mjs'
import * as AP from '../src/lib/animations-apis.mjs'
import * as PT from '../src/lib/animations-patterns.mjs'
import * as PF from '../src/lib/animations-performance.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUT_DIR = path.join(ROOT, 'src/content/notes')
const CONTENT_DIR = path.join(ROOT, 'content')
// The vault's React folder (override with NEXUS_REACT_DIR)
const VAULT_ROOT = process.env.NEXUS_REACT_DIR ?? path.join(os.homedir(), 'Nexus/40 Resources/Engineering/JavaScript/React')
const DEMO = path.join(ROOT, 'examples/how-react-works')
const STORE = path.join(ROOT, 'examples/product-store')

const byTitle = new Map(ALL_NOTES.map((n) => [n.file.replace(/\.md$/, ''), n]))
// Vault notes that were merged into a site note as one of its sections:
// `aliases: { 'Old title': 'Heading in the site note' }` in src/lib/notes/<module>.mjs
const aliasOf = new Map(ALL_NOTES.flatMap((n) => Object.entries(n.aliases ?? {}).map(([title, heading]) => [title, { note: n, heading }])))
// [[React Suspense]] etc. link to the module page (only for modules that have notes)
const moduleByTitle = new Map(
	MODULES.filter((m) => m.notes.length).flatMap((m) => [[m.title, m], ...(m.moc ? [[m.moc.replace(/\.md$/, ''), m]] : [])]),
)

// ASCII code blocks to replace, keyed by note slug + first non-empty line.
const REPLACE_BLOCKS = {
	'render-and-commit': { TRIGGER: () => D.pipeline() },
	'react-fiber': {
		'<App>': (body) => {
			const jsx = body.split('\n\n')[0]
			return '```tsx\n' + jsx.trim() + '\n```\n\n' + D.fiberTree()
		},
		'render 1:': () => A.doubleBufferAnim(),
	},
	'a-state-update-end-to-end': { HostRoot: () => D.e2eTree() },
}

// Figures inserted after the first paragraph following a heading.
const INSERT_AFTER = {
	'start-here': { 'The whole thing in one paragraph': [A.restaurantAnim, D.pipeline] },
	'render-and-commit': {
		'Why render and commit are separate': [A.whySeparateAnim],
		'"The virtual DOM", precisely': [A.virtualDomAnim],
		'Render and commit, step by step': [A.renderCommitStepsAnim],
	},
	reconciliation: {
		'Rule 1: different type → throw away the subtree': [A.rule1Anim],
		'Rule 2: same type → keep it and update': [A.rule2Anim],
		'Rule 3: keys identify children in a list': [A.keysAnim],
		'What this means for your code: state is tied to position': [A.positionAnim],
	},
	'react-fiber': {
		"The problem: a call stack can't be paused": [D.stackVsFiber],
		'What a fiber holds': [D.fiberAnatomy],
	},
	'hooks-under-the-hood': {
		'The hook list': [() => D.hookList()],
		'Why conditional hooks break, concretely': [A.conditionalHooksAnim],
		'Queue processing, step by step': [A.setStateQueueAnim],
		'`setState`: from call to render': [D.updateRing],
	},
	'commit-phase-and-effects': {
		'The sub-phases of `commitRoot`': [D.commitPhases],
		'Effect ordering, step by step': [A.effectOrderAnim],
	},
	'the-work-loop': {
		'One unit of work: begin, then maybe complete': [D.workLoopFlow],
		'The work loop, step by step': [A.workLoopAnim],
	},
	'scheduler-lanes-and-batching': {
		'Lanes: priority as bits': [D.laneBits],
		'Batching: queue now, render later': [A.batchingAnim],
		'Interruption and restart': [A.interruptionAnim],
	},
	'child-reconciliation-algorithm': { 'Child reconciliation, step by step': [A.listDiffAnim] },
	'a-state-update-end-to-end': { 'Render trace: clicking the button once': [A.e2eAnim, D.e2eSequence] },
}

const LEVEL_DOTS = {
	'🔴': '<span class="lvl lvl-must" title="Must know"></span>',
	'🟡': '<span class="lvl lvl-good" title="Good to know"></span>',
	'⚪': '<span class="lvl lvl-skip" title="Skip for interviews"></span>',
}

const slugger = new GithubSlugger()
const anchor = (heading) => {
	slugger.reset()
	return slugger.slug(heading.replace(/`/g, ''))
}

const missing = []

// Links are relative to a note page (/<module>/<slug>/).
function convertWikilinks(text, selfSlug) {
	return text.replace(/\[\[([^\]|#]*)(#[^\]|]*)?(\|[^\]]*)?\]\]/g, (_, target, hash, alias) => {
		const heading = hash ? hash.slice(1) : ''
		const label = alias ? alias.slice(1) : target || heading
		if (!target) return `[${label}](#${anchor(heading)})`
		const note = byTitle.get(target)
		if (note) {
			const href = note.slug === selfSlug ? '' : `../../${note.module}/${note.slug}/`
			return `[${label}](${href}${heading ? '#' + anchor(heading) : ''})`
		}
		const merged = aliasOf.get(target)
		if (merged) {
			const href = merged.note.slug === selfSlug ? '' : `../../${merged.note.module}/${merged.note.slug}/`
			return `[${label}](${href}#${anchor(heading || merged.heading)})`
		}
		const mod = moduleByTitle.get(target)
		if (mod) return `[${label}](../../${mod.id}/)`
		missing.push(target)
		return `*${label}*`
	})
}

const inlineHtml = (s) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

function convertLine(line, selfSlug) {
	let out = convertWikilinks(line, selfSlug)
	for (const [emoji, html] of Object.entries(LEVEL_DOTS)) out = out.split(emoji).join(html)
	out = out.replace(/^>\s?💬\s*/, '> ')
	return out
}

/** Split markdown into segments: { type: 'code', lang, body, fence } | { type: 'text', lines } */
function segments(md) {
	const lines = md.split('\n')
	const segs = []
	let text = []
	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].match(/^(```+)(\S*)\s*$/)
		if (!m) {
			text.push(lines[i])
			continue
		}
		if (text.length) segs.push({ type: 'text', lines: text }), (text = [])
		const fence = m[1]
		const body = []
		i++
		while (i < lines.length && lines[i].trim() !== fence) body.push(lines[i++])
		segs.push({ type: 'code', lang: m[2], body: body.join('\n'), fence })
	}
	if (text.length) segs.push({ type: 'text', lines: text })
	return segs
}

/** Wrap each "**Q: …**" + answer inside the Interview Q&A section in <details>. */
function convertQA(lines) {
	const out = []
	let inQA = false
	let current = null
	const flush = () => {
		if (!current) return
		const body = current.body.join('\n').trim().replace(/^A:\s*/, '')
		out.push(`<details class="qa"><summary>${inlineHtml(current.q)}</summary>`, '', body, '', '</details>', '')
		current = null
	}
	for (const line of lines) {
		if (/^#{1,6} /.test(line)) {
			flush()
			inQA = /^## Interview Q&A/.test(line)
			out.push(line)
			continue
		}
		const q = inQA && line.match(/^\*\*Q:\s*(.+?)\*\*\s*$/)
		if (q) {
			flush()
			current = { q: q[1], body: [] }
			continue
		}
		if (current) current.body.push(line)
		else out.push(line)
	}
	flush()
	return out
}

/**
 * Numbered interview questions ("1. 🔴 **Question?**" followed by an indented
 * answer) → the same collapsible Q&A cards, so quiz mode works on them too.
 */
function convertNumberedQA(lines, sectionTitles) {
	const out = []
	let inSection = false
	let current = null
	const flush = () => {
		if (!current) return
		out.push(`<details class="qa"><summary>${current.dot}${inlineHtml(current.q)}</summary>`, '', current.body.join('\n').trim(), '', '</details>', '')
		current = null
	}
	for (const line of lines) {
		if (/^#{1,6} /.test(line)) {
			flush()
			inSection = sectionTitles.some((t) => line.replace(/^#+ /, '') === t)
			out.push(line)
			continue
		}
		const m = inSection && line.match(/^\d+\.\s+((?:<span class="lvl[^>]*><\/span>\s*)?)\*\*(.+?)\*\*\s*$/)
		if (m) {
			flush()
			current = { dot: m[1].trim() ? m[1].trim() + ' ' : '', q: m[2], body: [] }
			continue
		}
		if (current && (line.startsWith('   ') || line.trim() === '')) {
			current.body.push(line.replace(/^ {3,4}/, ''))
			continue
		}
		flush()
		out.push(line)
	}
	flush()
	return out
}

function insertFigures(lines, inserts) {
	if (!inserts) return lines
	const out = []
	let pending = null
	let seenPara = false
	let inFence = false
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const h = line.match(/^#{2,4} (.+)$/)
		if (h && inserts[h[1]]) {
			out.push(line)
			pending = inserts[h[1]]
			seenPara = false
			delete inserts[h[1]]
			continue
		}
		if (pending && /^```/.test(line)) {
			// a code block right after the heading counts as the first block:
			// the figure goes after its closing fence, never inside it
			if (!inFence && !seenPara) seenPara = true
			inFence = !inFence
			out.push(line)
			continue
		}
		if (pending && !inFence) {
			const blank = line.trim() === ''
			const isPara = !blank && !/^(\||<|>|-|\d+\.|#)/.test(line)
			if (!seenPara && isPara) seenPara = true
			else if (!seenPara && !blank) {
				// heading not followed by a plain paragraph: insert right away
				out.push('', ...pending.map((f) => f()), '')
				pending = null
			} else if (seenPara && blank) {
				out.push('', ...pending.map((f) => f()), '')
				pending = null
			}
		}
		out.push(line)
	}
	if (pending) out.push('', ...pending.map((f) => f()), '')
	const left = Object.keys(inserts)
	if (left.length) throw new Error(`Headings not found for figures: ${left.join(', ')}`)
	return out
}

// ─── Build-time markers (site-only notes) ──────────────────────────────────

const NOISY_EVENTS = /^(pointer|mouse|focus|selection|key|textInput)/

function traceLines(trace, { phase, from, to, all }) {
	const p = trace.phases.find((x) => x.label === phase)
	if (!p) throw new Error(`trace: no phase "${phase}"`)
	let events = p.events
	if (!all)
		events = events.filter(
			(e) => !(e.fn === 'dispatchDiscreteEvent' && NOISY_EVENTS.test(e.info)) && !(e.fn === 'reconcileChildFibersImpl' && / ← (null|undefined)$/.test(e.info)),
		)
	// "[app] render X" is logged from inside X(): show it as the X() call itself
	const lines = events.map((e) =>
		e.app ? { text: `[app] ${e.app}`, d: (e.d ?? 0) - (e.app.startsWith('render ') ? 1 : 0), app: true } : { text: `${e.fn}${e.info ? `  ${e.info}` : ''}`, fn: e.fn, info: e.info, d: e.d ?? 0 },
	)
	const start = from ? lines.findIndex((l) => l.text.startsWith(from)) : 0
	if (start < 0) throw new Error(`trace: "${from}" not found in phase "${phase}"`)
	let end = lines.length - 1
	if (to) {
		end = lines.findIndex((l, i) => i >= start && l.text.startsWith(to))
		if (end < 0) throw new Error(`trace: "${to}" not found after "${from}" in phase "${phase}"`)
	}
	return lines.slice(start, end + 1)
}

function treeLines(node, depth = 0) {
	const extra = [node.hooks ? `hooks: [${node.hooks.join(', ')}]` : '', node.dom ? `→ <${node.dom}>` : ''].filter(Boolean).join('  ')
	return [`${'  '.repeat(depth)}${node.name}  (tag ${node.tag})${extra ? '  ' + extra : ''}`, ...(node.children ?? []).flatMap((c) => treeLines(c, depth + 1))]
}

function extractFunction(code, name) {
	const lines = code.split('\n')
	const start = lines.findIndex((l) => new RegExp(`^(export )?function ${name}\\(`).test(l))
	if (start < 0) throw new Error(`compiled: function ${name} not found`)
	const end = lines.findIndex((l, i) => i > start && l === '}')
	return lines.slice(start, end + 1).join('\n')
}

const TRACE_KIND = [
	['event', /^dispatchDiscreteEvent$/],
	['elements', /^jsxDEV$/],
	['commit', /^(commit|flush|insertOrAppend|removeChild)/],
	['schedule', /^(createRoot|createFiberRoot|listenToAllSupportedEvents|root\.render|updateContainerImpl|requestUpdateLane|dispatchSetState|markUpdateLaneFromFiberToRoot|scheduleUpdateOnFiber|ensureRootIsScheduled|scheduleImmediateRootScheduleTask|processRootScheduleInMicrotask|performWorkOnRootViaSchedulerTask|performSyncWorkOnRoot|performWorkOnRoot|renderRootSync|prepareFreshStack)$/],
]
const TRACE_LEGEND = [
	['event', 'browser event'],
	['schedule', 'scheduling'],
	['render', 'render phase'],
	['elements', 'element created'],
	['commit', 'commit phase'],
	['app', 'your component’s log()'],
]

/** A recorded trace as a coloured, indented, foldable call tree. */
function traceHtml(lines) {
	const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
	const min = Math.min(...lines.map((l) => l.d))
	const body = lines
		.map((l, i) => {
			const d = Math.max(0, l.d - min)
			const kids = i + 1 < lines.length && lines[i + 1].d > l.d ? ' has-kids' : ''
			const fold = kids ? '<button type="button" class="tr-fold" aria-label="Fold or unfold the calls below">▾</button>' : ''
			if (l.app) return `<span class="tr-l tr-app${kids}" style="--d:${d}">${fold}${esc(l.text)}</span>`
			const kind = TRACE_KIND.find(([, re]) => re.test(l.fn))?.[0] ?? 'render'
			return `<span class="tr-l tr-${kind}${kids}" style="--d:${d}" data-fn="${esc(l.fn)}">${fold}<b>${esc(l.fn)}</b>${l.info ? `  <i>${esc(l.info)}</i>` : ''}</span>`
		})
		.join('')
	const legend = TRACE_LEGEND.map(([k, label]) => `<span><i class="trl-${k}"></i>${label}</span>`).join('')
	return `\n<div class="trace-legend">${legend}<span class="trace-hint">indent = called by the line above · ▾ folds · tap a name for its card</span></div>\n<pre class="trace">${body}</pre>\n`
}

// The lines between a "#region name" comment (// or {/* … */} form) and its #endregion, dedented.
function region(code, name, where) {
	const lines = code.split('\n')
	const isStart = (l) => new RegExp(`^\\s*(//|\\{/\\*)\\s*#region ${name}\\b`).test(l)
	const isMarker = (l) => /^\s*(\/\/|\{\/\*)\s*#(end)?region\b/.test(l)
	const start = lines.findIndex(isStart)
	if (start < 0) throw new Error(`${where}: region "${name}" not found`)
	let depth = 0
	let end = start
	for (let i = start; i < lines.length; i++) {
		if (/#region\b/.test(lines[i]) && isMarker(lines[i])) depth++
		if (/#endregion\b/.test(lines[i]) && isMarker(lines[i]) && --depth === 0) {
			end = i
			break
		}
	}
	const body = lines.slice(start + 1, end).filter((l) => !isMarker(l))
	const indent = Math.min(...body.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length))
	return body.map((l) => l.slice(indent)).join('\n')
}

const recorded = {}
const getRecorded = (from) => (recorded[from] ??= JSON.parse(fs.readFileSync(path.join(STORE, 'generated', `${from}.json`), 'utf8')))

function expandMarkers(md, note) {
	if (note.module !== 'internals') return expandStoreMarkers(md)
	let trace
	const getTrace = () => (trace ??= JSON.parse(fs.readFileSync(path.join(DEMO, 'generated/trace.json'), 'utf8')))
	const fence = (lang, body) => '```' + lang + '\n' + body.replace(/\n+$/, '') + '\n```'
	return md.replace(/^<!-- (source|compiled|trace|tree|element|figure)((?:\s+\w+="[^"]*")*)\s*-->$/gm, (_, kind, rawAttrs) => {
		const a = Object.fromEntries([...rawAttrs.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2].replaceAll('&quot;', '"')]))
		switch (kind) {
			case 'source': {
				const ext = path.extname(a.file).slice(1)
				return fence({ jsx: 'jsx', js: 'js', html: 'html', css: 'css' }[ext] ?? 'text', fs.readFileSync(path.join(DEMO, a.file.includes('/') ? a.file : `src/${a.file}`), 'utf8'))
			}
			case 'compiled': {
				let code = fs.readFileSync(path.join(DEMO, 'generated/compiled', a.mode, `${a.file}.js`), 'utf8')
				if (a.fn) code = extractFunction(code, a.fn)
				return fence('js', code)
			}
			case 'trace':
				return traceHtml(traceLines(getTrace(), a))
			case 'tree':
				return fence('text', treeLines(getTrace().snapshots[Number(a.snapshot)].tree).join('\n'))
			case 'element': {
				const value = a.which.split('.').reduce((o, k) => o[k], getTrace().elements)
				return fence('js', JSON.stringify(value, null, 2).replace(/^(\s*)"([$\w]+)":/gm, '$1$2:'))
			}
			case 'figure': {
				const build = M[a.name] ?? H[a.name] ?? A[a.name] ?? D[a.name]
				if (!build) throw new Error(`figure: unknown "${a.name}"`)
				return '\n' + build() + '\n'
			}
		}
	})
}

function expandStoreMarkers(md) {
	const fence = (lang, body) => '```' + lang + '\n' + String(body).replace(/\n+$/, '') + '\n```'
	const LANG = { tsx: 'tsx', ts: 'ts', jsx: 'jsx', js: 'js', html: 'html', css: 'css' }
	return md.replace(/^<!-- (source|compiled|output|figure)((?:\s+\w+="[^"]*")*)\s*-->$/gm, (_, kind, rawAttrs) => {
		const a = Object.fromEntries([...rawAttrs.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2].replaceAll('&quot;', '"')]))
		switch (kind) {
			case 'source': {
				let code = fs.readFileSync(path.join(STORE, a.file), 'utf8')
				if (a.region) code = region(code, a.region, a.file)
				return fence(LANG[path.extname(a.file).slice(1)] ?? 'text', code)
			}
			case 'compiled': {
				let code = fs.readFileSync(path.join(STORE, 'generated/compiled', a.mode, `${a.file}.js`), 'utf8')
				if (a.region) code = region(code, a.region, a.file)
				return fence('js', code)
			}
			case 'output': {
				const value = a.path.split('.').reduce((o, k) => {
					if (o?.[k] === undefined) throw new Error(`output: ${a.from}.${a.path} not recorded`)
					return o[k]
				}, getRecorded(a.from))
				const as = a.as ?? 'json'
				if (as === 'log') return fence('text', (Array.isArray(value) ? value : [value]).join('\n'))
				if (as === 'text') return fence('text', value)
				if (as === 'html') return fence('html', value)
				return fence('js', JSON.stringify(value, null, 2))
			}
			case 'figure': {
				const build = F[a.name] ?? HK[a.name] ?? AP[a.name] ?? PT[a.name] ?? PF[a.name] ?? D[a.name] ?? A[a.name]
				if (!build) throw new Error(`figure: unknown "${a.name}"`)
				return '\n' + build() + '\n'
			}
		}
	})
}

function convertNote(note, raw, order) {
	const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
	let body = fm ? raw.slice(fm[0].length) : raw
	if (note.site || note.module !== 'internals') body = expandMarkers(body, note)
	const titleMatch = body.match(/^# (.+)$/m)
	const title = titleMatch ? titleMatch[1].trim() : note.file.replace(/\.md$/, '')
	body = body.replace(/^# .+\n/m, '')
	const source = fm?.[1].match(/^source:\s*(.+)$/m)?.[1].trim() ?? ''

	const replacers = REPLACE_BLOCKS[note.slug] ?? {}
	const parts = []
	for (const seg of segments(body)) {
		if (seg.type === 'code') {
			const first = seg.body.split('\n').find((l) => l.trim())?.trim() ?? ''
			const key = Object.keys(replacers).find((k) => first.startsWith(k))
			if (!seg.lang && key) {
				parts.push(...['', replacers[key](seg.body), ''])
				delete replacers[key]
			} else {
				parts.push(seg.fence + (seg.lang || 'text'), seg.body, seg.fence)
			}
		} else {
			parts.push(...seg.lines.map((l) => convertLine(l, note.slug)))
		}
	}
	const leftover = Object.keys(replacers)
	if (leftover.length) throw new Error(`${note.file}: diagram blocks not found: ${leftover.join(', ')}`)

	let lines = parts.join('\n').split('\n')
	lines = convertQA(lines)
	lines = convertNumberedQA(lines, ['Top interview questions'])
	lines = insertFigures(lines, { ...(INSERT_AFTER[note.slug] ?? {}) })

	const front = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`slug: ${JSON.stringify(note.slug)}`,
		`module: ${JSON.stringify(note.module)}`,
		`order: ${order}`,
		`level: ${JSON.stringify(note.level)}`,
		`illus: ${JSON.stringify(note.illus)}`,
		`summary: ${JSON.stringify(note.summary)}`,
		`source: ${JSON.stringify(source)}`,
		'---',
		'',
	]
	return front.join('\n') + lines.join('\n').replace(/\n{3,}/g, '\n\n')
}

if (!fs.existsSync(VAULT_ROOT)) {
	console.log(`Vault not found at ${VAULT_ROOT}; using the committed notes in src/content/notes.`)
	process.exit(0)
}

fs.rmSync(OUT_DIR, { recursive: true, force: true })
const intros = {}

for (const mod of MODULES) {
	if (!mod.notes.length) continue
	const dir = path.join(OUT_DIR, mod.id)
	fs.mkdirSync(dir, { recursive: true })
	mod.notes.forEach((n, i) => {
		const note = { ...n, module: mod.id }
		const from = note.site || !mod.vault ? path.join(CONTENT_DIR, mod.id) : path.join(VAULT_ROOT, mod.vault)
		const raw = fs.readFileSync(path.join(from, note.file), 'utf8')
		fs.writeFileSync(path.join(dir, `${note.slug}.md`), convertNote(note, raw, i))
	})
	// The module's MOC intro (vault) or content/<module>/_intro.md becomes the module page lead.
	const introFile = mod.moc ? path.join(VAULT_ROOT, mod.vault, mod.moc) : path.join(CONTENT_DIR, mod.id, '_intro.md')
	if (fs.existsSync(introFile)) intros[mod.id] = introHtml(fs.readFileSync(introFile, 'utf8'))
}

function introHtml(moc) {
	const intro = moc
		.replace(/^---\n[\s\S]*?\n---\n/, '')
		.replace(/^# .+\n/m, '')
		.split(/\n## /)[0]
		.split(/\n```/)[0]
		.trim()
	// note-relative links (../../<module>/<slug>/) → "@base/<module>/<slug>/", resolved by the page
	return convertWikilinks(intro, '')
		.replace(/\]\(\.\.\/\.\.\//g, '](@base/')
		.split(/\n\s*\n/)
		.map((para) => {
			const quote = para.startsWith('>')
			const inline = (text) => {
				let html = inlineHtml(text)
					.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
					.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
				for (const [emoji, dot] of Object.entries(LEVEL_DOTS)) html = html.split(emoji).join(dot)
				return html
			}
			// a paragraph that is a "- " list (optionally after a lead-in line) → <p> + <ul>
			const lines = para.split('\n')
			const first = lines.findIndex((l) => l.startsWith('- '))
			if (!quote && first >= 0 && lines.slice(first).every((l) => l.startsWith('- '))) {
				const lead = lines.slice(0, first).join(' ')
				const items = lines.slice(first).map((l) => `<li>${inline(l.slice(2))}</li>`).join('')
				return `${lead ? `<p>${inline(lead)}</p>` : ''}<ul>${items}</ul>`
			}
			const html = inline(para.replace(/^>\s?/gm, '').replace(/\n/g, ' '))
			return quote ? `<p class="callout">${html}</p>` : `<p>${html}</p>`
		})
		.join('\n')
}

fs.writeFileSync(path.join(ROOT, 'src/lib/module-intros.json'), JSON.stringify(intros, null, 2))

const uniq = [...new Set(missing)]
console.log(`Synced ${ALL_NOTES.length} notes in ${Object.keys(intros).length} module(s) → src/content/notes`)
if (uniq.length) console.log(`Links to notes not on the site (rendered as text): ${uniq.join(', ')}`)
