// Hooks 3: what runs, in which order, on mount, update and unmount.
import { StrictMode, useEffect, useLayoutEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region badge
function CartBadge({ count }: { count: number }) {
	log(`render (count = ${count})`)

	useLayoutEffect(() => {
		log(`  layout effect (count = ${count})`)
		requestAnimationFrame(() => log(`  next frame starts (count = ${count})`))
		return () => log(`  layout cleanup (count = ${count})`)
	}, [count])

	useEffect(() => {
		log(`  effect (count = ${count})`)
		return () => log(`  effect cleanup (count = ${count})`)
	}, [count])

	return <span id="badge">{count} in cart</span>
}
// #endregion

function Shop() {
	const [count, setCount] = useState(0)
	const [open, setOpen] = useState(true)
	return (
		<>
			<button id="add" onClick={() => setCount((c) => c + 1)}>Add to cart</button>
			<button id="close" onClick={() => setOpen(false)}>Hide badge</button>
			{open && <CartBadge count={count} />}
		</>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	log('createRoot().render()')
	createRoot(root).render(scenario === 'strict' ? <StrictMode><Shop /></StrictMode> : <Shop />)
}
