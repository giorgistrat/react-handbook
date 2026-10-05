// Builder for step-through animations. The client runtime lives in
// src/scripts/anim.ts; styles in src/styles/anim.css.
//
// anim({ id, caption, delay?, scenarios: [{ name, intro, scene, steps }] })  (delay: ms per step when playing)
//
// scene: HTML. Elements that change carry data-k="key" (and optionally an
//        initial data-s="state tokens").
// steps: [{ phase, fn, say, set: { key: 'tokens' }, txt: { key: 'html' }, css: { key: { prop: value } } }]
//        Steps are applied cumulatively, so going back replays from the start.
//        `fn` is shown as code (plain text, escaped); `say` is HTML.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const attr = (s) => esc(s).replace(/"/g, '&quot;')

const oneLine = (html) =>
	html
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.join('')

const PHASES = {
	trigger: 'trigger',
	schedule: 'schedule',
	render: 'render phase',
	commit: 'commit phase',
	paint: 'browser',
	effects: 'after paint',
	event: 'event',
}

export function anim({ id, caption, scenarios, delay }) {
	const multi = scenarios.length > 1
	const tabs = multi
		? `<div class="btn-row anim-tabs" role="tablist">${scenarios
				.map((s, i) => `<button type="button" role="tab" class="btn ${i ? 'btn-ghost' : ''}" data-anim-tab="${i}" aria-selected="${i === 0}">${s.name}</button>`)
				.join('')}</div>`
		: ''
	const scns = scenarios
		.map((s, i) => {
			const printSteps = s.steps
				.map(
					(st) =>
						`<li>${st.phase ? `<span class="anim-phase ph-${st.phase}">${PHASES[st.phase] ?? st.phase}</span>` : ''}${st.fn ? `<code>${esc(st.fn)}</code>` : ''}<span>${st.say ?? ''}</span></li>`,
				)
				.join('')
			return `<div class="anim-scn" data-anim-scn="${i}" ${i ? 'hidden' : ''} data-steps="${attr(JSON.stringify(s.steps))}" data-intro="${attr(s.intro ?? '')}">
				${multi ? `<div class="anim-scn-title">${s.name}</div>` : ''}
				<div class="anim-stage">${s.scene}</div>
				<ol class="anim-print">${printSteps}</ol>
			</div>`
		})
		.join('')
	return oneLine(`
		<figure class="fig anim fig-${id}" data-anim${delay ? ` data-delay="${delay}"` : ''}>
			${tabs}
			${scns}
			<div class="anim-hud" aria-live="polite">
				<div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div>
				<p class="anim-say"></p>
			</div>
			<div class="anim-controls">
				<button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button>
				<button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button>
				<button type="button" class="btn anim-play" data-act="play">▶ Play</button>
				<button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button>
				<div class="anim-progress"><div class="anim-bar"></div></div>
				<span class="anim-count">0 / 0</span>
			</div>
			${caption ? `<figcaption>${caption}</figcaption>` : ''}
		</figure>`)
}

// ─── Scene helpers ──────────────────────────────────────────────────────────

/** A node box. */
export const node = (k, label, { sub = '', cls = '', s = '', flag = false } = {}) =>
	`<div class="an node ${cls}" data-k="${k}"${s ? ` data-s="${s}"` : ''}><span class="node-label" data-k="${k}-label">${label}</span>${
		sub ? `<small data-k="${k}-sub">${sub}</small>` : ''
	}${flag ? `<span class="an flag" data-k="${k}-flag" data-s="ghost">flag</span>` : ''}</div>`

/** A small labelled value chip. */
export const chip = (k, html, s = '') => `<span class="an chip-a" data-k="${k}"${s ? ` data-s="${s}"` : ''}>${html}</span>`

/** A vertical mini tree: [[label, key, opts], [children...]] rendered as nested columns. */
export function tree(spec) {
	const render = ([k, label, opts = {}, children = []]) =>
		`<div class="t-branch">${node(k, label, opts)}${
			children.length
				? `<div class="t-kids">${children.map((c) => `<div class="t-kid">${render(c)}</div>`).join('')}</div>`
				: ''
		}</div>`
	return `<div class="t-tree">${render(spec)}</div>`
}

export const panel = (title, inner, cls = '') => `<div class="a-panel ${cls}"><div class="a-panel-title">${title}</div>${inner}</div>`
