import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { log } from './trace.js'

export function CounterPage() {
	log('render CounterPage')
	const [count, setCount] = useState(0)
	const buttonRef = useRef(null)

	useLayoutEffect(() => {
		log('layout effect: button is', buttonRef.current.offsetWidth, 'px wide')
	}, [count])

	useEffect(() => {
		log('effect: set title', count)
		document.title = `Clicked ${count} times`
		return () => log('cleanup: title effect', count)
	}, [count])

	return (
		<section>
			<h2>Counter</h2>
			<Display value={count} />
			<button ref={buttonRef} onClick={() => setCount(count + 1)}>
				Add one
			</button>
		</section>
	)
}

function Display({ value }) {
	log('render Display', value)
	return <p className="display">Count: {value}</p>
}
