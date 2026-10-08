// APIs 5: "Apply coupon" with an empty field should put the cursor back in it.
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region flag
function CouponFieldFlag({ shouldFocus }: { shouldFocus: boolean }) {
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(() => {
		if (shouldFocus) inputRef.current!.focus()
	}, [shouldFocus])
	return <input id="coupon" ref={inputRef} placeholder="Coupon code" onFocus={() => log('  coupon field focused')} />
}

function CheckoutFlag() {
	const [shouldFocus, setShouldFocus] = useState(false)
	return (
		<>
			<CouponFieldFlag shouldFocus={shouldFocus} />
			<button id="apply" onClick={() => setShouldFocus(true)}>Apply coupon</button>
		</>
	)
}
// #endregion

// #region handle
type CouponHandle = { focus: () => void; clear: () => void }

function CouponField({ ref }: { ref: Ref<CouponHandle> }) {
	const inputRef = useRef<HTMLInputElement>(null)
	useImperativeHandle(
		ref,
		() => ({
			focus: () => inputRef.current!.focus(),
			clear: () => (inputRef.current!.value = ''),
		}),
		[],
	)
	return <input id="coupon" ref={inputRef} placeholder="Coupon code" onFocus={() => log('  coupon field focused')} />
}

function Checkout() {
	const couponRef = useRef<CouponHandle>(null)
	return (
		<>
			<CouponField ref={couponRef} />
			<button id="apply" onClick={() => couponRef.current!.focus()}>Apply coupon</button>
		</>
	)
}
// #endregion

function Inspect() {
	const couponRef = useRef<CouponHandle>(null)
	useEffect(() => {
		// #region inspect
		const handle = couponRef.current as unknown as Record<string, unknown>
		log('keys:', Object.keys(handle))
		log('handle.value:', String(handle.value), '· handle.style:', String(handle.style))
		log('is it the <input>?', handle instanceof HTMLInputElement)
		// #endregion
	}, [])
	return <CouponField ref={couponRef} />
}

export function mount(root: HTMLElement, scenario: string | null) {
	const App = { flag: CheckoutFlag, inspect: Inspect }[scenario ?? ''] ?? Checkout
	createRoot(root).render(<App />)
}
