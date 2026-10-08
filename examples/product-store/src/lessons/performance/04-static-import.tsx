// Performance 4, before splitting: the size chart imported statically, so its
// code is part of the page's initial JavaScript.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { watch } from './04-code-splitting'
import StaticSizeChart from './size-chart'

// #region static
function PageStatic() {
	const [show, setShow] = useState(false)
	return (
		<>
			<button id="show" onClick={() => setShow(true)}>Size chart</button>
			{show && <StaticSizeChart />}
		</>
	)
}
// #endregion

export function mount(root: HTMLElement) {
	watch(root)
	log('page mounted')
	createRoot(root).render(<PageStatic />)
}
