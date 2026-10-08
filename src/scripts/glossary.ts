// The glossary on the page: hover/tap cards for React's internal names,
// the "names off" reading mode, the phase bar, and the flashcards.

type Entry = { n: string; p: string; l: 'must' | 'good' | 'skip'; pl: string; w: string; c: string[]; cb: string[]; b: string | null }

const PHASE: Record<string, string> = {
	setup: 'setup',
	event: 'event',
	schedule: 'scheduling',
	element: 'elements',
	render: 'render phase',
	commit: 'commit phase',
	effects: 'effects',
	data: 'fiber field',
}
const LEVEL: Record<string, string> = { must: 'Must know', good: 'Good to know', skip: 'Implementation detail' }
// Phase bar segments
const SEGMENT: Record<string, string> = { setup: 'trigger', event: 'trigger', schedule: 'schedule', element: 'render', render: 'render', commit: 'commit', effects: 'effects' }

const readJson = <T>(id: string, fallback: T): T => {
	try {
		return JSON.parse(document.getElementById(id)?.textContent ?? '') as T
	} catch {
		return fallback
	}
}

export const GLOSSARY = readJson<Record<string, Entry>>('glossary-data', {})
const TITLES = readJson<Record<string, { t: string; p: string }>>('note-titles', {})
const base = document.body.dataset.base ?? '/'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** `beginWork(current, wip)` → beginWork; `root.render(<App/>)` → root.render */
export function lookup(text: string): Entry | undefined {
	const m = text.trim().match(/^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)\s*(\(.*\))?$/s)
	if (!m) return undefined
	return GLOSSARY[m[1]] ?? GLOSSARY[m[1].split('.').pop()!]
}

function mark(el: HTMLElement, entry: Entry, plainable: boolean) {
	el.classList.add('gl', `gl-${entry.l}`)
	el.dataset.gl = entry.n
	el.tabIndex = 0
	el.setAttribute('role', 'button')
	el.setAttribute('aria-label', `${el.textContent}: ${entry.pl}. Show details`)
	if (plainable) {
		el.dataset.real = el.textContent ?? ''
		el.dataset.plain = entry.pl
	}
}

/** Mark every recognised name inside `root` (prose code, trace lines, map nodes, animation text). */
export function markNames(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>('.prose :not(pre) > code:not(.gl), .seq-label code:not(.gl), .anim-print code:not(.gl)').forEach((code) => {
		if (code.closest('.map-node, .gl')) return // already part of a marked element
		const e = lookup(code.textContent ?? '')
		if (e) mark(code, e, !!code.closest('.prose') && !code.closest('.fig, table'))
	})
	root.querySelectorAll<HTMLElement>('.trace .tr-l > b:not(.gl)').forEach((b) => {
		const e = lookup(b.textContent ?? '')
		if (e) mark(b, e, false)
	})
}

/** Wrap known names inside a plain-text string (the animations' function line). */
export function linkifyText(el: HTMLElement) {
	const text = el.textContent ?? ''
	const parts = text.split(/([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)/)
	if (!parts.some((p) => GLOSSARY[p])) return
	el.innerHTML = parts.map((p) => (GLOSSARY[p] ? `<span class="gl gl-${GLOSSARY[p].l}" data-gl="${GLOSSARY[p].n}" tabindex="0" role="button">${esc(p)}</span>` : esc(p))).join('')
}

// ─── The card ───────────────────────────────────────────────────────────────

const pop = document.querySelector<HTMLElement>('.gl-pop')
let anchor: HTMLElement | null = null
let hideTimer = 0

function cardHtml(e: Entry) {
	const rel = (label: string, names: string[]) =>
		names.length
			? `<div class="gp-rel"><span>${label}</span>${names
					.map((x) => (GLOSSARY[x] ? `<button type="button" class="gp-link" data-goto="${x}">${esc(x)}</button>` : `<em>${esc(x)}</em>`))
					.join('')}</div>`
			: ''
	const best = e.b && TITLES[e.b] ? `<a class="gp-more" href="${base}${TITLES[e.b].p}">Explained in “${esc(TITLES[e.b].t)}” →</a>` : ''
	return `<div class="gp-head"><code>${esc(e.n)}</code><span class="gp-phase ph-${e.p}">${PHASE[e.p] ?? e.p}</span></div>
		<div class="gp-plain">${esc(e.pl)}</div>
		<p class="gp-what">${esc(e.w)}</p>
		${rel('Calls', e.c)}${rel('Called by', e.cb)}
		<div class="gp-foot"><span class="gp-level gp-${e.l}"><i class="lvl lvl-${e.l === 'skip' ? 'skip' : e.l}"></i>${LEVEL[e.l]}</span>${best}</div>`
}

function show(el: HTMLElement, name = el.dataset.gl!) {
	const e = GLOSSARY[name]
	if (!pop || !e) return
	clearTimeout(hideTimer)
	anchor = el
	pop.innerHTML = cardHtml(e)
	pop.hidden = false
	const r = el.getBoundingClientRect()
	const w = pop.offsetWidth
	const h = pop.offsetHeight
	let left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8)
	let top = r.bottom + 8
	if (top + h > innerHeight - 8 && r.top - h - 8 > 8) top = r.top - h - 8
	pop.style.left = `${left + scrollX}px`
	pop.style.top = `${top + scrollY}px`
}

function hideSoon() {
	clearTimeout(hideTimer)
	hideTimer = window.setTimeout(() => {
		if (pop) pop.hidden = true
		anchor = null
	}, 180)
}

export function setupCards() {
	if (!pop) return
	let hoverTimer = 0
	const touch = matchMedia('(hover: none)').matches
	document.addEventListener('mouseover', (ev) => {
		if (touch) return
		const el = (ev.target as HTMLElement).closest<HTMLElement>('.gl')
		if (el) {
			clearTimeout(hideTimer)
			clearTimeout(hoverTimer)
			if (el !== anchor) hoverTimer = window.setTimeout(() => show(el), 160)
		} else if ((ev.target as HTMLElement).closest('.gl-pop')) clearTimeout(hideTimer)
		else {
			clearTimeout(hoverTimer)
			if (anchor) hideSoon()
		}
	})
	document.addEventListener('click', (ev) => {
		const t = ev.target as HTMLElement
		const goto = t.closest<HTMLElement>('[data-goto]')
		if (goto && anchor) return show(anchor, goto.dataset.goto)
		const el = t.closest<HTMLElement>('.gl')
		if (el) {
			ev.preventDefault()
			ev.stopPropagation()
			return el === anchor && !pop.hidden ? hideSoon() : show(el)
		}
		if (!t.closest('.gl-pop') && anchor) hideSoon()
	}, true)
	document.addEventListener('focusin', (ev) => {
		const el = (ev.target as HTMLElement).closest<HTMLElement>('.gl')
		if (el) show(el)
	})
	document.addEventListener('keydown', (ev) => {
		if (ev.key === 'Escape' && anchor) {
			pop.hidden = true
			anchor = null
		}
		const el = (ev.target as HTMLElement).closest<HTMLElement>('.gl')
		if (el && (ev.key === 'Enter' || ev.key === ' ')) {
			ev.preventDefault()
			show(el)
		}
	})
	addEventListener('scroll', () => anchor && !touch && hideSoon(), { passive: true })
}

// ─── "Names off": plain English in the prose ────────────────────────────────

export function setupNamesToggle() {
	const btn = document.querySelector<HTMLButtonElement>('[data-names-toggle]')
	const label = document.querySelector<HTMLElement>('[data-names-label]')
	if (!btn) return
	let off = false
	try {
		off = localStorage.getItem('namesOff') === '1'
	} catch {}
	const apply = () => {
		document.querySelectorAll<HTMLElement>('code[data-plain]').forEach((c) => {
			c.textContent = off ? c.dataset.plain! : c.dataset.real!
			c.classList.toggle('gl-plain', off)
		})
		document.documentElement.classList.toggle('names-off', off)
		btn.setAttribute('aria-pressed', String(off))
		if (label) label.textContent = off ? 'Names off' : 'Names on'
	}
	btn.addEventListener('click', () => {
		off = !off
		try {
			localStorage.setItem('namesOff', off ? '1' : '0')
		} catch {}
		apply()
	})
	apply()
}

// ─── Phase bar: which phases the current section is about ──────────────────

export function setupPhaseBar() {
	const bar = document.querySelector<HTMLElement>('.phase-bar')
	const prose = document.querySelector<HTMLElement>('.prose')
	if (!bar || !prose) return
	const headings = [...prose.querySelectorAll<HTMLElement>('h2[id]')]
	// Collect the phases of the names used in each section
	const sections = headings.map((h, i) => {
		const counts: Record<string, number> = {}
		let el = h.nextElementSibling
		while (el && el !== headings[i + 1]) {
			el.querySelectorAll<HTMLElement>('[data-gl]').forEach((g) => {
				const seg = SEGMENT[GLOSSARY[g.dataset.gl!]?.p]
				if (seg) counts[seg] = (counts[seg] ?? 0) + 1
			})
			el = el.nextElementSibling
		}
		return { h, counts }
	})
	const segs = [...bar.querySelectorAll<HTMLElement>('[data-pb]')]
	let frame = 0
	const update = () => {
		frame = 0
		let cur = sections[0]
		for (const s of sections) if (s.h.getBoundingClientRect().top <= 140) cur = s
		const total = Object.values(cur?.counts ?? {}).reduce((a, b) => a + b, 0)
		bar.classList.toggle('pb-none', !total)
		segs.forEach((s) => {
			const n = cur?.counts[s.dataset.pb!] ?? 0
			s.classList.toggle('on', n > 0)
			s.classList.toggle('main', total > 0 && n / total >= 0.4)
			s.title = n ? `${n} internal name${n === 1 ? '' : 's'} from the ${s.dataset.pb} step in this section` : ''
		})
	}
	addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true })
	update()
}

// ─── Flashcards ─────────────────────────────────────────────────────────────

export function setupFlashcards() {
	const root = document.querySelector<HTMLElement>('[data-flashcards]')
	if (!root) return
	// data-flashcards="api" → public APIs; otherwise React's internals
	const api = root.dataset.flashcards === 'api'
	const all = Object.values(GLOSSARY).filter((e, i, arr) => arr.findIndex((x) => x.n === e.n) === i && e.l !== 'skip' && (e.p === 'api') === api)
	const key = (n: string) => `fc:${n}`
	const grade = (n: string) => {
		try {
			return localStorage.getItem(key(n))
		} catch {
			return null
		}
	}
	let level: 'must' | 'all' = 'must'
	let deck: Entry[] = []
	let i = 0
	const front = root.querySelector<HTMLElement>('.fc-front')!
	const back = root.querySelector<HTMLElement>('.fc-back')!
	const stats = root.querySelector<HTMLElement>('.fc-stats')!
	const build = () => {
		const pool = all.filter((e) => level === 'all' || e.l === 'must')
		// unknown first, then "again", then known; shuffled inside each group
		const rank = (e: Entry) => ({ null: 0, again: 1, known: 2 })[String(grade(e.n)) as 'null'] ?? 0
		deck = pool.map((e) => ({ e, r: Math.random() })).sort((a, b) => rank(a.e) - rank(b.e) || a.r - b.r).map((x) => x.e)
		i = 0
		render()
	}
	const render = () => {
		const known = deck.filter((e) => grade(e.n) === 'known').length
		stats.textContent = `${known} of ${deck.length} known`
		const e = deck[i % deck.length]
		front.innerHTML = `<span class="fc-count">${(i % deck.length) + 1} / ${deck.length}</span><code>${esc(e.n)}</code><span class="fc-q">${api ? 'What is it for?' : 'What does it do, and in which phase?'}</span>`
		back.innerHTML = `<span class="gp-phase ph-${e.p}">${PHASE[e.p]}</span><div class="gp-plain">${esc(e.pl)}</div><p class="gp-what">${esc(e.w)}</p>`
		back.hidden = true
		root.querySelector<HTMLElement>('[data-fc="show"]')!.hidden = false
		root.querySelectorAll<HTMLElement>('[data-fc="known"], [data-fc="again"]').forEach((b) => (b.hidden = true))
	}
	root.addEventListener('click', (ev) => {
		const act = (ev.target as HTMLElement).closest<HTMLElement>('[data-fc]')?.dataset.fc
		if (!act) return
		const e = deck[i % deck.length]
		if (act === 'show') {
			back.hidden = false
			root.querySelector<HTMLElement>('[data-fc="show"]')!.hidden = true
			root.querySelectorAll<HTMLElement>('[data-fc="known"], [data-fc="again"]').forEach((b) => (b.hidden = false))
		}
		if (act === 'known' || act === 'again') {
			try {
				localStorage.setItem(key(e.n), act)
			} catch {}
			i++
			render()
		}
		if (act === 'must' || act === 'all') {
			level = act
			root.querySelectorAll<HTMLElement>('[data-fc="must"], [data-fc="all"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fc === act)))
			build()
		}
		if (act === 'reset') {
			deck.forEach((d) => {
				try {
					localStorage.removeItem(key(d.n))
				} catch {}
			})
			build()
		}
	})
	build()
}
