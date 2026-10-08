// APIs 4: a tooltip that measures itself to decide whether it fits above its button.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

type Rect = { top: number; bottom: number; left: number }

// #region tooltip
function Tooltip({ anchor, useMeasureEffect }: { anchor: Rect; useMeasureEffect: typeof useLayoutEffect }) {
	const ref = useRef<HTMLDivElement>(null)
	const [height, setHeight] = useState(0) // unknown until it's in the DOM

	useMeasureEffect(() => {
		const measured = ref.current!.getBoundingClientRect().height
		log(`  effect: measured ${measured}px`)
		setHeight(measured)
	}, [])

	const fitsAbove = anchor.top - height >= 0
	const top = fitsAbove ? anchor.top - height : anchor.bottom
	log(`  render: height ${height} → ${fitsAbove ? 'above' : 'below'}`)
	return (
		<div ref={ref} className="tooltip" style={{ top, left: anchor.left }}>
			Free shipping on orders over $50. Returns are free for 30 days.
		</div>
	)
}
// #endregion

function ShippingInfo({ useMeasureEffect }: { useMeasureEffect: typeof useLayoutEffect }) {
	const [anchor, setAnchor] = useState<Rect | null>(null)
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
	return (
		<p className="shipping">
			<button
				id="info"
				onMouseEnter={(e) => {
					const rect = e.currentTarget.getBoundingClientRect()
					clearTimeout(timer.current)
					timer.current = setTimeout(() => (watchFrames(), setAnchor(rect)), 200) // hover intent
				}}
				onMouseLeave={() => (clearTimeout(timer.current), setAnchor(null))}
			>
				Shipping ⓘ
			</button>
			{anchor && <Tooltip anchor={anchor} useMeasureEffect={useMeasureEffect} />}
		</p>
	)
}

// What the browser is about to paint, read in requestAnimationFrame (which runs
// right before each paint), for the next few frames.
function watchFrames() {
	let n = 0
	const tick = () => {
		const tip = document.querySelector<HTMLElement>('.tooltip')
		const button = document.querySelector('#info')!.getBoundingClientRect()
		const where = !tip ? 'no tooltip yet' : tip.getBoundingClientRect().top < button.bottom ? 'covering the button' : 'below the button'
		log(`frame ${++n} painted: ${where}`)
		if (where !== 'below the button' && n < 6) requestAnimationFrame(tick)
	}
	requestAnimationFrame(tick)
}

const css = `
.shipping { margin: 8px 0 0; }
.tooltip { position: fixed; pointer-events: none; width: 220px; padding: 8px 10px; font-size: 14px; background: #1e1e2e; color: #cdd6f4; border-radius: 8px; }
`

export function mount(root: HTMLElement, scenario: string | null) {
	const style = document.createElement('style')
	style.textContent = css
	document.head.append(style)
	createRoot(root).render(<ShippingInfo useMeasureEffect={scenario === 'effect' ? useEffect : useLayoutEffect} />)
}
