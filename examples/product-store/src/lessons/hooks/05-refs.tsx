// Hooks 5: hand a DOM node to a plain-JS "zoom on hover" library.
import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// A tiny non-React library: it wants a real DOM node.
type ZoomOptions = { scale: number; speed: number }
function attachZoom(node: HTMLElement, options: ZoomOptions) {
	log(`  attachZoom(scale ${options.scale})`)
	const enter = () => (node.style.transform = `scale(${options.scale})`)
	const leave = () => (node.style.transform = '')
	node.addEventListener('mouseenter', enter)
	node.addEventListener('mouseleave', leave)
	return () => {
		log('  zoom destroyed')
		node.removeEventListener('mouseenter', enter)
		node.removeEventListener('mouseleave', leave)
	}
}

// #region callbackRef
function ZoomCallbackRef({ scale, speed }: ZoomOptions) {
	return (
		<img
			alt="Ceramic Mug"
			ref={(node) => {
				if (!node) return
				return attachZoom(node, { scale, speed })
			}}
		/>
	)
}
// #endregion

// #region objectDep
function ZoomObjectDep({ scale, speed }: ZoomOptions) {
	const ref = useRef<HTMLImageElement>(null)
	const options = { scale, speed } // a new object on every render
	useEffect(() => attachZoom(ref.current!, options), [options])
	return <img alt="Ceramic Mug" ref={ref} />
}
// #endregion

// #region primitiveDeps
function ZoomPrimitiveDeps({ scale, speed }: ZoomOptions) {
	const ref = useRef<HTMLImageElement>(null)
	useEffect(() => attachZoom(ref.current!, { scale, speed }), [scale, speed])
	return <img alt="Ceramic Mug" ref={ref} />
}
// #endregion

function Product({ Zoom }: { Zoom: (p: ZoomOptions) => React.ReactNode }) {
	const [qty, setQty] = useState(1)
	const [scale, setScale] = useState(1.2)
	return (
		<>
			<Zoom scale={scale} speed={300} />
			<button id="qty" onClick={() => setQty((q) => q + 1)}>Quantity: {qty}</button>
			<button id="bigger" onClick={() => setScale(1.5)}>Bigger zoom</button>
		</>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	const Z = { callback: ZoomCallbackRef, object: ZoomObjectDep, primitives: ZoomPrimitiveDeps }[scenario ?? 'primitives']!
	// #region objectIs
	const a = { scale: 1.2, speed: 300 }
	const b = { scale: 1.2, speed: 300 }
	log('Object.is(a, b) →', Object.is(a, b), '· Object.is(1.2, 1.2) →', Object.is(1.2, 1.2))
	// #endregion
	createRoot(root).render(<Product Zoom={Z} />)
}
