// Lesson 5: typing props. 05-typescript.bad.tsx holds the mistakes the
// compiler catches (recorded by scripts/record.mjs with `tsc`).
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region formatters
type Formatter = (cents: number) => string

const formatters = {
	USD: (cents: number) => `$${(cents / 100).toFixed(2)}`,
	EUR: (cents: number) => `€${(cents / 100).toFixed(2)}`,
	GBP: (cents: number) => `£${(cents / 100).toFixed(2)}`,
} satisfies Record<string, Formatter>

export type Currency = keyof typeof formatters // 'USD' | 'EUR' | 'GBP'
// #endregion

// #region price
type PriceProps = {
	cents: number
	currency?: Currency
}

export function Price({ cents, currency = 'USD' }: PriceProps) {
	return <p className="price">{formatters[currency](cents)}</p>
}
// #endregion

export async function mount(root: HTMLElement) {
	createRoot(root).render(
		<>
			<Price cents={8900} />
			<Price cents={8900} currency="EUR" />
		</>,
	)
	await new Promise((r) => setTimeout(r, 30))
	log('rendered:', [...root.querySelectorAll('.price')].map((p) => p.textContent).join(' · '))
}
