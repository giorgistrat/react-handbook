// APIs 3: a "quick view" dialog that a card's overflow: hidden would clip.
import { createContext, use, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

const ThemeContext = createContext('light')

// #region dialog
function QuickView({ onClose }: { onClose: () => void }) {
	const theme = use(ThemeContext)
	return (
		<div className={`quick-view ${theme}`} role="dialog" aria-label="Quick view">
			<h2>Trail Backpack</h2>
			<p>28 L · water resistant · $64.00</p>
			<button id="close" onClick={onClose}>Close</button>
		</div>
	)
}
// #endregion

// #region inline
function CardInline() {
	const [open, setOpen] = useState(false)
	return (
		<article className="clip-card" onClick={() => log('card onClick ran')}>
			<h2>Trail Backpack</h2>
			<button id="open" onClick={() => setOpen(true)}>Quick view</button>
			{open && <QuickView onClose={() => setOpen(false)} />}
		</article>
	)
}
// #endregion

// #region portal
function CardPortal() {
	const [open, setOpen] = useState(false)
	return (
		<article className="clip-card" onClick={() => log('card onClick ran')}>
			<h2>Trail Backpack</h2>
			<button id="open" onClick={() => setOpen(true)}>Quick view</button>
			{open && createPortal(<QuickView onClose={() => setOpen(false)} />, document.body)}
		</article>
	)
}
// #endregion

const css = `
.clip-card { width: 240px; height: 120px; overflow: hidden; transform: translateY(-2px); /* hover lift */ border: 1px solid #ccd0da; border-radius: 10px; padding: 8px 12px; }
.quick-view { position: fixed; inset: 40px auto auto 60px; width: 320px; padding: 16px; background: #fff; border: 2px solid #8839ef; border-radius: 12px; }
.quick-view.dark { background: #1e1e2e; color: #cdd6f4; }
`

export function mount(root: HTMLElement, scenario: string | null) {
	const style = document.createElement('style')
	style.textContent = css
	document.head.append(style)
	const Card = scenario === 'portal' ? CardPortal : CardInline
	createRoot(root).render(
		<ThemeContext value="dark">
			<Card />
		</ThemeContext>,
	)
	// a plain DOM listener on the card, for comparison with React's onClick
	setTimeout(() => root.querySelector('.clip-card')!.addEventListener('click', () => log('card DOM listener ran')), 50)
}
