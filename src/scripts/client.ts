// Small progressive enhancements for the rendered notes.

type Step = { n: string[]; call: string; s: string; d: string }

function wrapTables() {
	document.querySelectorAll('.prose table').forEach((table) => {
		if (table.parentElement?.classList.contains('table-wrap')) return
		const wrap = document.createElement('div')
		wrap.className = 'table-wrap'
		table.replaceWith(wrap)
		wrap.append(table)
	})
}

function setupWalkers() {
	document.querySelectorAll<HTMLElement>('[data-walker]').forEach((root) => {
		const steps: Step[] = JSON.parse(root.dataset.steps ?? '[]')
		const count = root.querySelector('.walker-count')!
		const call = root.querySelector('.walker-call')!
		const desc = root.querySelector('.walker-desc')!
		const initial = { call: call.innerHTML, desc: desc.innerHTML }
		const nodes = new Map<string, Element>()
		root.querySelectorAll<SVGGElement>('[data-node]').forEach((g) => nodes.set(g.dataset.node!, g))
		let i = 0

		const render = () => {
			nodes.forEach((g) => g.setAttribute('class', 'w-node'))
			for (let k = 0; k < i; k++) {
				const step = steps[k]
				for (const n of step.n) nodes.get(n)?.setAttribute('class', `w-node st-${step.s}${k === i - 1 ? ' active' : ''}`)
			}
			count.textContent = `Step ${i} / ${steps.length}`
			if (i === 0) {
				call.innerHTML = initial.call
				desc.innerHTML = initial.desc
			} else {
				const step = steps[i - 1]
				call.innerHTML = `${step.n.join(' → ')} · <code>${step.call}</code>`
				desc.innerHTML = step.d
			}
		}

		root.addEventListener('click', (e) => {
			const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act
			if (act === 'next') i = Math.min(steps.length, i + 1)
			if (act === 'prev') i = Math.max(0, i - 1)
			if (act === 'reset') i = 0
			if (act) render()
		})
		render()
	})
}

function setupTabs() {
	document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
		const buttons = root.querySelectorAll<HTMLElement>('[data-tab]')
		const panels = root.querySelectorAll<HTMLElement>('[data-panel]')
		buttons.forEach((btn) =>
			btn.addEventListener('click', () => {
				buttons.forEach((b) => b.classList.toggle('btn-ghost', b !== btn))
				panels.forEach((p) => (p.hidden = p.dataset.panel !== btn.dataset.tab))
			}),
		)
	})
}

async function renderMermaid() {
	if (!document.querySelector('pre.mermaid')) return
	const { default: mermaid } = await import('mermaid')
	mermaid.initialize({
		startOnLoad: false,
		theme: 'base',
		fontFamily: "'Inter Variable', system-ui, sans-serif",
		themeVariables: {
			primaryColor: '#f7c4e6',
			primaryBorderColor: '#1d1a18',
			primaryTextColor: '#1d1a18',
			secondaryColor: '#a6ece3',
			tertiaryColor: '#fcf5e4',
			lineColor: '#1d1a18',
			fontSize: '15px',
			actorBkg: '#f7c4e6',
			actorBorder: '#1d1a18',
			signalColor: '#1d1a18',
			signalTextColor: '#1d1a18',
			noteBkgColor: '#ffe08a',
			noteBorderColor: '#1d1a18',
			activationBkgColor: '#ffb36b',
			sequenceNumberColor: '#ffffff',
		},
		flowchart: { curve: 'basis', htmlLabels: true },
		sequence: { mirrorActors: false, wrap: true, width: 170, actorMargin: 70, boxMargin: 8, noteMargin: 12, messageMargin: 34 },
	})
	await mermaid.run({ querySelector: 'pre.mermaid' })
}

wrapTables()
setupWalkers()
setupTabs()
renderMermaid()
