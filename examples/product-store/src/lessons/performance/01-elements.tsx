// Performance 1: a product page with a quantity counter, and a footer that
// has nothing to do with the quantity. When does the footer re-render?
import { memo, useMemo, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region footer
function StoreFooter({ currency = 'USD', onSubscribe }: { currency?: string; onSubscribe?: () => void }) {
	log('  render StoreFooter')
	return (
		<footer>
			Prices in {currency} · <button onClick={onSubscribe}>Subscribe</button>
		</footer>
	)
}
// #endregion

function QtyButton({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
	return <button id="qty" onClick={() => setQty(qty + 1)}>Quantity: {qty}</button>
}

// #region inline
function PageInline() {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<StoreFooter />
		</>
	)
}
// #endregion

// #region reuse
const footer = <StoreFooter /> // created once, when the module loads

function PageReuse() {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			{footer}
		</>
	)
}
// #endregion

// #region prop
function App() {
	return <PageWithFooter footer={<StoreFooter />} /> // App doesn't re-render
}

function PageWithFooter({ footer }: { footer: ReactNode }) {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			{footer}
		</>
	)
}
// #endregion

// #region memoElement
function PageMemoElement() {
	const [qty, setQty] = useState(1)
	const [currency, setCurrency] = useState('USD')
	log('render Page')
	const footer = useMemo(() => <StoreFooter currency={currency} />, [currency])
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<button id="currency" onClick={() => setCurrency('EUR')}>Show EUR</button>
			{footer}
		</>
	)
}
// #endregion

// #region memo
const MemoFooter = memo(StoreFooter)

function PageMemo() {
	const [qty, setQty] = useState(1)
	const [currency, setCurrency] = useState('USD')
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<button id="currency" onClick={() => setCurrency('EUR')}>Show EUR</button>
			<MemoFooter currency={currency} />
		</>
	)
}
// #endregion

// #region memoBroken
function PageMemoBroken() {
	const [qty, setQty] = useState(1)
	log('render Page')
	return (
		<>
			<QtyButton qty={qty} setQty={setQty} />
			<MemoFooter currency="USD" onSubscribe={() => log('subscribed')} />
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	if (scenario === 'identity') {
		// #region identity
		const a = <StoreFooter />
		const b = <StoreFooter />
		log('a === b →', a === b, '· a === a →', a === a)
		log('a.props === b.props →', a.props === b.props)
		log('a →', { type: (a.type as { name: string }).name, key: a.key, props: a.props })
		// #endregion
		return
	}
	const pages = { inline: PageInline, reuse: PageReuse, prop: App, 'memo-element': PageMemoElement, memo: PageMemo, 'memo-broken': PageMemoBroken }
	const Page = pages[(scenario ?? 'inline') as keyof typeof pages]
	createRoot(root).render(<Page />)
}
