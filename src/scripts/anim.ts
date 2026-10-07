// Runtime for the step-through animations built by src/lib/anim.mjs.

type Step = {
	phase?: string
	fn?: string
	say?: string
	set?: Record<string, string>
	txt?: Record<string, string>
	css?: Record<string, Record<string, string>>
}

const PHASE_LABEL: Record<string, string> = {
	trigger: 'trigger',
	schedule: 'schedule',
	render: 'render phase',
	commit: 'commit phase',
	paint: 'browser',
	effects: 'after paint',
	event: 'event',
}

const DELAY = 2600

class Scenario {
	steps: Step[]
	intro: string
	els = new Map<string, HTMLElement[]>()
	initial = new Map<HTMLElement, { s: string; html: string; style: string }>()
	changed = new Set<HTMLElement>()

	constructor(public root: HTMLElement) {
		this.steps = JSON.parse(root.dataset.steps ?? '[]')
		this.intro = root.dataset.intro ?? ''
		root.querySelectorAll<HTMLElement>('[data-k]').forEach((el) => {
			const k = el.dataset.k!
			if (!this.els.has(k)) this.els.set(k, [])
			this.els.get(k)!.push(el)
			this.initial.set(el, { s: el.dataset.s ?? '', html: el.innerHTML, style: el.getAttribute('style') ?? '' })
		})
		const missing = new Set<string>()
		for (const st of this.steps)
			for (const map of [st.set, st.txt, st.css]) for (const k of Object.keys(map ?? {})) if (!this.els.has(k)) missing.add(k)
		if (missing.size) console.warn('anim: unknown keys', [...missing], root)
	}

	/** Show the state after `i` steps (0 = initial). */
	show(i: number) {
		const s = new Map<string, string>()
		const txt = new Map<string, string>()
		const css = new Map<string, Record<string, string>>()
		for (const st of this.steps.slice(0, i)) {
			for (const [k, v] of Object.entries(st.set ?? {})) s.set(k, v)
			for (const [k, v] of Object.entries(st.txt ?? {})) txt.set(k, v)
			for (const [k, v] of Object.entries(st.css ?? {})) css.set(k, { ...(css.get(k) ?? {}), ...v })
		}
		for (const [k, els] of this.els) {
			for (const el of els) {
				const init = this.initial.get(el)!
				const nextS = s.has(k) ? s.get(k)! : init.s
				if ((el.dataset.s ?? '') !== nextS) el.dataset.s = nextS
				// Only touch text on keys a step targets (txt keys must be leaf elements).
				if (txt.has(k) || this.changed.has(el)) {
					const nextHtml = txt.has(k) ? txt.get(k)! : init.html
					if (txt.has(k)) this.changed.add(el)
					else this.changed.delete(el)
					if (el.innerHTML !== nextHtml) {
						el.innerHTML = nextHtml
						el.classList.remove('flash')
						void el.offsetWidth
						el.classList.add('flash')
					}
				}
				el.setAttribute('style', init.style)
				for (const [prop, val] of Object.entries(css.get(k) ?? {})) el.style.setProperty(prop, val)
			}
		}
	}
}

class Anim {
	scenarios: Scenario[]
	active = 0
	i = 0
	timer: number | undefined
	fn: HTMLElement
	phase: HTMLElement
	say: HTMLElement
	count: HTMLElement
	range: HTMLInputElement
	play: HTMLButtonElement
	speedBtn: HTMLButtonElement
	speed = 1

	constructor(public root: HTMLElement) {
		this.scenarios = [...root.querySelectorAll<HTMLElement>('[data-anim-scn]')].map((el) => new Scenario(el))
		this.fn = root.querySelector('.anim-fn')!
		this.phase = root.querySelector('.anim-call .anim-phase')!
		this.say = root.querySelector('.anim-say')!
		this.count = root.querySelector('.anim-count')!
		this.range = root.querySelector('.anim-range')!
		this.play = root.querySelector('.anim-play')!
		this.speedBtn = root.querySelector('.anim-speed')!

		// Drag or click the slider to jump to any step
		this.range.addEventListener('input', () => {
			this.stop()
			this.go(Number(this.range.value))
		})

		// Pause when the animation scrolls out of view
		new IntersectionObserver((entries) => {
			if (!entries[0].isIntersecting && this.timer) this.stop()
		}).observe(root)

		root.addEventListener('click', (e) => {
			const t = e.target as HTMLElement
			const tab = t.closest<HTMLElement>('[data-anim-tab]')
			if (tab) return this.select(+tab.dataset.animTab!)
			const act = t.closest<HTMLElement>('[data-act]')?.dataset.act
			if (!act) return
			if (act === 'play') return this.timer ? this.stop() : this.start()
			if (act === 'speed') return this.cycleSpeed()
			this.stop()
			if (act === 'next') this.go(this.i + 1)
			if (act === 'prev') this.go(this.i - 1)
			if (act === 'restart') this.go(0)
		})
		root.addEventListener('keydown', (e) => {
			if ((e.target as HTMLElement).closest('input,textarea')) return
			if (e.key === 'ArrowRight') (this.stop(), this.go(this.i + 1))
			if (e.key === 'ArrowLeft') (this.stop(), this.go(this.i - 1))
		})
		this.go(0)
	}

	get scn() {
		return this.scenarios[this.active]
	}

	select(n: number) {
		this.stop()
		this.active = n
		this.root.querySelectorAll<HTMLElement>('[data-anim-tab]').forEach((b) => {
			const on = +b.dataset.animTab! === n
			b.classList.toggle('btn-ghost', !on)
			b.setAttribute('aria-selected', String(on))
		})
		this.scenarios.forEach((s, k) => (s.root.hidden = k !== n))
		this.go(0)
	}

	go(i: number) {
		const n = this.scn.steps.length
		this.i = Math.max(0, Math.min(n, i))
		this.scn.show(this.i)
		const st = this.i ? this.scn.steps[this.i - 1] : undefined
		this.fn.hidden = !st?.fn
		this.fn.textContent = st?.fn ?? ''
		this.phase.hidden = !st?.phase
		this.phase.className = `anim-phase ph-${st?.phase ?? ''}`
		this.phase.textContent = st?.phase ? (PHASE_LABEL[st.phase] ?? st.phase) : ''
		this.say.innerHTML = st ? (st.say ?? '') : this.scn.intro || 'Press <b>Play</b>, or step through with the arrows.'
		this.count.textContent = `${this.i} / ${n}`
		this.range.max = String(n)
		this.range.value = String(this.i)
		this.range.style.setProperty('--fill', `${n ? (this.i / n) * 100 : 0}%`)
	}

	start() {
		if (this.i >= this.scn.steps.length) this.go(0)
		this.play.textContent = '❚❚ Pause'
		this.root.classList.add('playing')
		const tick = () => {
			if (this.i >= this.scn.steps.length) return this.stop()
			this.go(this.i + 1)
			this.timer = window.setTimeout(tick, (Number(this.root.dataset.delay) || DELAY) / this.speed)
		}
		this.timer = window.setTimeout(tick, 350)
	}

	stop() {
		window.clearTimeout(this.timer)
		this.timer = undefined
		this.play.textContent = this.i >= this.scn.steps.length && this.i > 0 ? '↺ Replay' : '▶ Play'
		this.root.classList.remove('playing')
	}

	cycleSpeed() {
		const speeds = [1, 2, 0.5]
		this.speed = speeds[(speeds.indexOf(this.speed) + 1) % speeds.length]
		this.speedBtn.textContent = `${this.speed}×`
		this.speedBtn.setAttribute('aria-label', `Playback speed ${this.speed}×`)
		if (this.timer) {
			this.stop()
			this.start()
		}
	}

	/** Final state of every scenario, for printing. */
	toEnd() {
		this.stop()
		this.scenarios.forEach((s) => {
			s.root.hidden = false
			s.show(s.steps.length)
		})
	}
}

export function setupAnims() {
	const anims = [...document.querySelectorAll<HTMLElement>('[data-anim]')].map((el) => new Anim(el))
	window.addEventListener('beforeprint', () => anims.forEach((a) => a.toEnd()))
	window.addEventListener('afterprint', () => anims.forEach((a) => a.select(a.active)))
	;(window as any).__anims = anims
}
