// Copies the React Internals notes from the Obsidian vault into
// src/content/notes/, converting Obsidian syntax and injecting diagrams.
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
// Site-only notes (NOTES entries with `site: true`) are read from content/
// instead of the vault, and may use build-time markers that pull in real
// output from the demo app (examples/how-react-works):
//   <!-- source file="App.jsx" -->                      the demo's source
//   <!-- compiled file="App" mode="automatic" fn="App" --> Babel / Vite output
//   <!-- trace phase="page load" from="createRoot" to="root.render" -->
//   <!-- tree snapshot="0" -->                          a recorded fiber tree
//   <!-- element which="production.app" -->            a recorded element object
//   <!-- figure name="bootAnim" -->                     an animation or diagram

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import GithubSlugger from 'github-slugger'
import os from 'node:os'
import { NOTES, MOC_FILE } from '../src/lib/notes-meta.mjs'
import * as D from '../src/lib/diagrams.mjs'
import * as A from '../src/lib/animations.mjs'
import * as H from '../src/lib/animations-hrw.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUT_DIR = path.join(ROOT, 'src/content/notes')
const CONTENT_DIR = path.join(ROOT, 'content')
// The Obsidian vault folder these notes come from (override with NEXUS_NOTES_DIR)
const VAULT_DIR =
	process.env.NEXUS_NOTES_DIR ?? path.join(os.homedir(), 'Nexus/40 Resources/Engineering/JavaScript/React/React Internals')
const DEMO = path.join(ROOT, 'examples/how-react-works')

const byTitle = new Map(NOTES.map((n) => [n.file.replace(/\.md$/, ''), n]))
const MOC_TITLE = MOC_FILE.replace(/\.md$/, '')

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
	'start-here': { 'The whole thing in one paragraph': [D.restaurant, D.pipeline] },
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

function convertWikilinks(text, selfSlug) {
	return text.replace(/\[\[([^\]|#]*)(#[^\]|]*)?(\|[^\]]*)?\]\]/g, (_, target, hash, alias) => {
		const heading = hash ? hash.slice(1) : ''
		const label = alias ? alias.slice(1) : target || heading
		if (!target) return `[${label}](#${anchor(heading)})`
		const note = byTitle.get(target)
		if (note) {
			const href = note.slug === selfSlug ? '' : `../${note.slug}/`
			return `[${label}](${href}${heading ? '#' + anchor(heading) : ''})`
		}
		if (target === MOC_TITLE) return `[${label}](../../)`
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
	const text = (e) => (e.app ? `[app] ${e.app}` : `${e.fn}${e.info ? `  ${e.info}` : ''}`)
	let events = p.events
	if (!all)
		events = events.filter(
			(e) => !(e.fn === 'dispatchDiscreteEvent' && NOISY_EVENTS.test(e.info)) && !(e.fn === 'reconcileChildFibersImpl' && / ← (null|undefined)$/.test(e.info)),
		)
	const lines = events.map(text)
	const start = from ? lines.findIndex((l) => l.startsWith(from)) : 0
	if (start < 0) throw new Error(`trace: "${from}" not found in phase "${phase}"`)
	let end = lines.length - 1
	if (to) {
		end = lines.findIndex((l, i) => i >= start && l.startsWith(to))
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

function expandMarkers(md) {
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
				return fence('text', traceLines(getTrace(), a).join('\n'))
			case 'tree':
				return fence('text', treeLines(getTrace().snapshots[Number(a.snapshot)].tree).join('\n'))
			case 'element': {
				const value = a.which.split('.').reduce((o, k) => o[k], getTrace().elements)
				return fence('js', JSON.stringify(value, null, 2).replace(/^(\s*)"([$\w]+)":/gm, '$1$2:'))
			}
			case 'figure': {
				const build = H[a.name] ?? A[a.name] ?? D[a.name]
				if (!build) throw new Error(`figure: unknown "${a.name}"`)
				return '\n' + build() + '\n'
			}
		}
	})
}

function convertNote(note, raw, order) {
	const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
	let body = fm ? raw.slice(fm[0].length) : raw
	if (note.site) body = expandMarkers(body)
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
	lines = insertFigures(lines, { ...(INSERT_AFTER[note.slug] ?? {}) })

	const front = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`slug: ${JSON.stringify(note.slug)}`,
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

if (!fs.existsSync(VAULT_DIR)) {
	console.log(`Vault not found at ${VAULT_DIR}; using the committed notes in src/content/notes.`)
	process.exit(0)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith('.md')) fs.rmSync(path.join(OUT_DIR, f))

NOTES.forEach((note, i) => {
	const raw = fs.readFileSync(path.join(note.site ? CONTENT_DIR : VAULT_DIR, note.file), 'utf8')
	fs.writeFileSync(path.join(OUT_DIR, `${note.slug}.md`), convertNote(note, raw, i))
})

// The MOC intro becomes the home page lead.
const moc = fs.readFileSync(path.join(VAULT_DIR, MOC_FILE), 'utf8')
const mocIntro = moc
	.replace(/^---\n[\s\S]*?\n---\n/, '')
	.replace(/^# .+\n/m, '')
	.split(/\n## /)[0]
	.split(/\n```/)[0]
	.trim()
const introHtml = convertWikilinks(mocIntro, '')
	.replace(/\]\(\.\.\//g, '](notes/')
	.split(/\n\s*\n/)
	.map((para) => {
		const quote = para.startsWith('>')
		let html = inlineHtml(para.replace(/^>\s?/gm, '').replace(/\n/g, ' '))
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
			.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
		for (const [emoji, dot] of Object.entries(LEVEL_DOTS)) html = html.split(emoji).join(dot)
		return quote ? `<p class="callout">${html}</p>` : `<p>${html}</p>`
	})
	.join('\n')
fs.writeFileSync(path.join(ROOT, 'src/lib/moc-intro.json'), JSON.stringify({ introHtml }, null, 2))

const uniq = [...new Set(missing)]
console.log(`Synced ${NOTES.length} notes → src/content/notes`)
if (uniq.length) console.log(`Links to notes outside this folder (rendered as text): ${uniq.join(', ')}`)
