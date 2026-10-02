// Small progressive enhancements for the rendered notes.

import { setupAnims } from './anim'

function wrapTables() {
	document.querySelectorAll('.prose table').forEach((table) => {
		if (table.parentElement?.classList.contains('table-wrap')) return
		const wrap = document.createElement('div')
		wrap.className = 'table-wrap'
		table.replaceWith(wrap)
		wrap.append(table)
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
setupAnims()
renderMermaid()
