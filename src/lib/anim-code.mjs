// "Code + screen" animations: the real code with the running line highlighted,
// next to a small mock of what the user sees and an optional "who rendered"
// strip. Compiles to anim() from ./anim.mjs, so the same runtime plays it.
//
// codeAnim({
//   id, caption, file: 'cart.tsx',
//   code: `tsx excerpt (≤ 16 lines)`,
//   screen: [[key, initialHtml, kind]],          kind: 'text' | 'button' | 'muted'
//   renders: ['Cart', 'CartButtons (memo)'],      optional; keys are the first word
//   scenarios: [{ name, intro, steps: [{
//     at: 'unique substring' | ['…', '…'],        lines to highlight (none: keep nothing highlighted)
//     phase, say,                                 as in anim()
//     screen: { key: html | [html, state] },      state: 'upd' (default) | 'ok' | 'bad'
//     rendered: { Cart: 'ran' | 'skipped' | 'bailed out' },
//   }] }],
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

const RENDER_WORD = { ran: 'ran', skipped: 'skipped', 'bailed out': 'bailed out' }
const RENDER_STATE = { ran: 'run', skipped: 'skip', 'bailed out': 'bail' }

export function codeAnim({ id, caption, file, code, screen = [], renders = [], scenarios, delay }) {
	const source = code.replace(/^\n+|\s+$/g, '')
	const lines = source.split('\n')
	if (lines.length > 24) throw new Error(`codeAnim ${id}: ${lines.length} lines, keep excerpts short`)
	const html = highlight(source)

	const find = (needle) => {
		const hits = lines.flatMap((l, i) => (l.includes(needle) ? [i] : []))
		if (hits.length !== 1) throw new Error(`codeAnim ${id}: "${needle}" matches ${hits.length} lines`)
		return hits[0]
	}

	const renderKey = (name) => `r-${name.split(/\s/)[0]}`
	const scene = `<div class="ca">
		<div class="ca-code">
			${file ? `<div class="ca-file">${esc(file)}</div>` : ''}
			<pre class="astro-code ca-pre"><code>${html.join('\n')}</code></pre>
		</div>
		<div class="ca-side">
			<div class="ca-screen">
				<div class="ca-title">What you see</div>
				${screen.map(([k, v, kind = 'text']) => `<div class="an ca-item ca-${kind}" data-k="s-${k}">${v}</div>`).join('')}
			</div>
			${
				renders.length
					? `<div class="ca-renders"><div class="ca-title">Rendered this step</div>${renders
							.map((r) => `<div class="ca-r"><span class="ca-rname">${esc(r)}</span><span class="an ca-rstate" data-k="${renderKey(r)}">–</span></div>`)
							.join('')}</div>`
					: ''
			}
		</div>
	</div>`

	const compiled = scenarios.map((s) => {
		let lit = []
		let tinted = []
		const steps = s.steps.map((st) => {
			const set = {}
			const txt = {}
			// line highlight and screen tints last one step: clear the previous ones first
			for (const i of lit) set[`L${i}`] = ''
			for (const k of tinted) set[k] = ''
			const at = st.at == null ? [] : Array.isArray(st.at) ? st.at : [st.at]
			lit = at.map(find)
			for (const i of lit) set[`L${i}`] = 'hl'
			// screen changes
			tinted = []
			for (const [k, v] of Object.entries(st.screen ?? {})) {
				const [h, state = 'upd'] = Array.isArray(v) ? v : [v]
				if (h != null) txt[`s-${k}`] = h
				set[`s-${k}`] = state
				tinted.push(`s-${k}`)
			}
			// render strip: every listed component gets a word each time `rendered` is given
			if (st.rendered) {
				for (const r of renders) {
					const k = renderKey(r)
					const word = st.rendered[r.split(/\s/)[0]]
					txt[k] = word ? RENDER_WORD[word] : '–'
					set[k] = word ? RENDER_STATE[word] : ''
				}
			}
			const fn = lit.length ? lines[lit[0]].trim() : undefined
			return { phase: st.phase, fn, say: st.say, set, txt }
		})
		return { name: s.name, intro: s.intro, scene, steps }
	})

	return anim({ id, caption, scenarios: compiled, delay, legend: false, kind: 'code' })
}
