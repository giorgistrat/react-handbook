// Lesson 6: className, style, and a component that wraps a native element.
import type { ComponentProps } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region tag
type Tone = 'sale' | 'new' | 'soldout'

function Tag({ tone, className, style, ...rest }: ComponentProps<'span'> & { tone?: Tone }) {
	return (
		<span
			className={['tag', tone && `tag--${tone}`, className].filter(Boolean).join(' ')}
			style={{ fontWeight: 600, ...style }}
			{...rest}
		/>
	)
}
// #endregion

export async function mount(root: HTMLElement) {
	createRoot(root).render(
		<div>
			{/* #region usage */}
			<Tag tone="sale">-20%</Tag>
			<Tag tone="soldout" className="muted" style={{ fontWeight: 400, marginLeft: 8 }} title="Back soon">
				Sold out
			</Tag>
			{/* #endregion */}
		</div>,
	)
	await new Promise((r) => setTimeout(r, 30))
	for (const el of root.querySelectorAll('span')) log(el.outerHTML)
}
