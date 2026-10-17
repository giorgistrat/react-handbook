// "Code + screen" animations: the real code with the running line highlighted,
// next to a small mock of what the user sees, an optional "who rendered" strip
// and an optional console of recorded log lines. Compiles to anim() from
// ./anim.mjs, so the same runtime plays it.
//
// codeAnim({
//   id, caption,
//   file: 'cart.tsx', code: `tsx excerpt`,         defaults for every scenario
//   screen: [[key, initialHtml, kind]],            kind: 'text' | 'button' | 'muted' | 'input' | 'box'
//   renders: ['Cart', 'CartButtons (memo)'],       "who rendered" strip; keys are the first word
//   rendersTitle: 'Rendered this step',
//   console: ['line', …],                          recorded log lines, revealed by steps
//   consoleTitle: 'Console (recorded)',
//   scenarios: [{ name, intro,
//     file?, code?, screen?, renders?, console?,    per-scenario overrides (e.g. a second version of the code)
//     steps: [{
//       at: 'unique substring' | ['…'],            lines to highlight (omit: none)
//       phase, say,                                as in anim()
//       screen: { key: html | [html|null, state] },   state: 'upd' (default) | 'ok' | 'bad'
//       rendered: { Cart: 'ran' },                  any word; ran/skipped/bailed out/… pick the colour
//       log: 'substring' | ['…'],                   console lines to reveal (they stay visible)
//     }] }],
// })
//
// Highlighting uses a Shiki highlighter handed over by scripts/sync-notes.mjs (setHighlighter),
// with the site's two themes, so the code looks like the notes' code blocks.

import { anim } from './anim.mjs'

let highlighter = null
export const setHighlighter = (h) => (highlighter = h)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function highlight(code) {
	if (!highlighter) throw new Error('codeAnim: no highlighter (call setHighlighter first)')
	const html = highlighter.codeToHtml(code, { lang: 'tsx', themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' }, defaultColor: false })
	const inner = html.match(/<code>([\s\S]*)<\/code>/)[1]
	return inner.split('\n').map((line, i) => line.replace('<span class="line">', `<span class="line an ca-line" data-k="L${i}"><span class="ca-num">${i + 1}</span>`))
}

// render-strip words → colour state
const WORD_STATE = {
	ran: 'run',
	rendered: 'run',
	mounted: 'run',
	'ran again': 'run',
	skipped: 'skip',
	'not called': 'skip',
	'bailed out': 'bail',
	unmounted: 'del',
	'cleaned up': 'del',
	cleanup: 'del',
	error: 'bad',
}

const renderKey = (name) => `r-${name.split(/\s/)[0].replace(/[^\w-]/g, '')}`

function buildScene(id, { file, code, screen = [], renders = [], rendersTitle = 'Rendered this step', console: con = [], consoleTitle = 'Console (recorded)' }) {
	const source = code.replace(/^\n+|\s+$/g, '')
	const lines = source.split('\n')
	if (lines.length > 26) throw new Error(`codeAnim ${id}: ${lines.length} lines, keep excerpts short`)
	const html = highlight(source)
	const side = [
		screen.length
			? `<div class="ca-screen"><div class="ca-title">What you see</div>${screen
					.map(([k, v, kind = 'text']) => `<div class="an ca-item ca-${kind}" data-k="s-${k}">${v}</div>`)
					.join('')}</div>`
			: '',
		renders.length
			? `<div class="ca-renders"><div class="ca-title">${rendersTitle}</div>${renders
					.map((r) => `<div class="ca-r"><span class="ca-rname">${esc(r)}</span><span class="an ca-rstate" data-k="${renderKey(r)}">–</span></div>`)
					.join('')}</div>`
			: '',
		con.length
			? `<div class="ca-console"><div class="ca-title">${consoleTitle}</div>${con
					.map((l, i) => `<div class="an ca-log" data-k="c-${i}" data-s="ghost">${esc(l)}</div>`)
					.join('')}</div>`
			: '',
	].join('')
	const scene = `<div class="ca">
		<div class="ca-code">
			${file ? `<div class="ca-file">${esc(file)}</div>` : ''}
			<pre class="astro-code ca-pre"><code>${html.join('\n')}</code></pre>
		</div>
		${side ? `<div class="ca-side">${side}</div>` : ''}
	</div>`
	return { scene, lines, renders, con }
}

export function codeAnim({ id, caption, scenarios, delay, ...defaults }) {
	const compiled = scenarios.map((s) => {
		const opts = { ...defaults }
		for (const k of ['file', 'code', 'screen', 'renders', 'rendersTitle', 'console', 'consoleTitle']) if (s[k] !== undefined) opts[k] = s[k]
		const { scene, lines, renders, con } = buildScene(id, opts)

		const find = (needle, list, what) => {
			// an exact (trimmed) match wins; otherwise the substring must be unique
			const exact = list.flatMap((l, i) => (l.trim() === needle.trim() ? [i] : []))
			if (exact.length === 1) return exact[0]
			const hits = list.flatMap((l, i) => (l.includes(needle) ? [i] : []))
			if (hits.length !== 1) throw new Error(`codeAnim ${id} (${s.name}): ${what} "${needle}" matches ${hits.length} lines`)
			return hits[0]
		}
		const many = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

		let lit = []
		let tinted = []
		let lastLog = []
		const steps = s.steps.map((st) => {
			const set = {}
			const txt = {}
			// highlights and tints last one step: clear the previous ones first
			for (const i of lit) set[`L${i}`] = ''
			for (const k of tinted) set[k] = ''
			for (const i of lastLog) set[`c-${i}`] = ''
			lit = many(st.at).map((n) => find(n, lines, 'line'))
			for (const i of lit) set[`L${i}`] = 'hl'
			tinted = []
			for (const [k, v] of Object.entries(st.screen ?? {})) {
				const [h, state = 'upd'] = Array.isArray(v) ? v : [v]
				if (h != null) txt[`s-${k}`] = h
				set[`s-${k}`] = state
				tinted.push(`s-${k}`)
			}
			if (st.rendered) {
				for (const r of renders) {
					const k = renderKey(r)
					const word = st.rendered[r.split(/\s/)[0]]
					txt[k] = word ?? '–'
					set[k] = word ? (WORD_STATE[word] ?? 'upd') : ''
				}
			}
			lastLog = many(st.log).map((n) => find(n, con, 'console line'))
			for (const i of lastLog) set[`c-${i}`] = 'new'
			const fn = lit.length ? lines[lit[0]].trim() : undefined
			return { phase: st.phase, fn, say: st.say, set, txt }
		})
		return { name: s.name, intro: s.intro, scene, steps }
	})

	return anim({ id, caption, scenarios: compiled, delay, legend: false, kind: 'code' })
}
