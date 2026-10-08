// Patterns 2: a debounced "save gift note" and a stock watcher, both needing
// the latest values from a function that was created earlier.
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

type Fn<A extends unknown[]> = (...args: A) => void

// #region debounce
function debounce<A extends unknown[]>(fn: Fn<A>, ms: number): Fn<A> {
	let timer: ReturnType<typeof setTimeout> | undefined
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), ms)
	}
}
// #endregion

// #region rebuild
function useDebounceRebuild<A extends unknown[]>(callback: Fn<A>, delay: number) {
	return useMemo(() => debounce(callback, delay), [callback, delay])
}
// #endregion

// #region once
function useDebounceOnce<A extends unknown[]>(callback: Fn<A>, delay: number) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => debounce(callback, delay), [delay])
}
// #endregion

// #region latest
function useDebounce<A extends unknown[]>(callback: Fn<A>, delay: number) {
	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback // after every render: the latest callback
	})
	return useMemo(() => debounce((...args: A) => callbackRef.current(...args), delay), [delay])
}
// #endregion

// #region note
function GiftNote({ useDebounceHook }: { useDebounceHook: typeof useDebounce }) {
	const [product, setProduct] = useState('Ceramic Mug')
	const [note, setNote] = useState('')
	const saveNote = (text: string) => log(`saved "${text}" for ${product}`)
	const debouncedSave = useDebounceHook(saveNote, 300)

	return (
		<>
			<select id="product" value={product} onChange={(e) => setProduct(e.target.value)}>
				<option>Ceramic Mug</option>
				<option>Desk Lamp</option>
			</select>
			<input
				id="note"
				value={note}
				onChange={(e) => {
					setNote(e.target.value)
					debouncedSave(e.target.value)
				}}
			/>
		</>
	)
}
// #endregion

// #region watchStale
function StockWatchStale({ product }: { product: string }) {
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => log(`checking stock: ${product}`), 200)
		return () => (log('watch stopped'), clearInterval(id))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return null
}
// #endregion

// #region watchRestart
function StockWatchRestart({ product }: { product: string }) {
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => log(`checking stock: ${product}`), 200)
		return () => (log('watch stopped'), clearInterval(id))
	}, [product])
	return null
}
// #endregion

// #region watchEvent
function StockWatch({ product }: { product: string }) {
	const onTick = useEffectEvent(() => log(`checking stock: ${product}`))
	useEffect(() => {
		log('watch started')
		const id = setInterval(() => onTick(), 200)
		return () => (log('watch stopped'), clearInterval(id))
	}, [])
	return null
}
// #endregion

function Watcher({ Watch }: { Watch: typeof StockWatch }) {
	const [product, setProduct] = useState('Ceramic Mug')
	return (
		<>
			<button id="switch" onClick={() => setProduct('Desk Lamp')}>Watch Desk Lamp</button>
			<Watch product={product} />
		</>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root)
	const watch = { 'watch-stale': StockWatchStale, 'watch-restart': StockWatchRestart, 'watch-event': StockWatch }[scenario ?? '']
	if (watch) return r.render(<Watcher Watch={watch} />)
	const hook = { rebuild: useDebounceRebuild, once: useDebounceOnce }[scenario ?? ''] ?? useDebounce
	r.render(<GiftNote useDebounceHook={hook} />)
}
