// Performance 7: the full catalog, 10,000 products, in one scrolling list.
import { useVirtualizer } from '@tanstack/react-virtual'
import { Profiler, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { makeCatalog } from '../../data/catalog'
import { log } from '../../log'

const products = makeCatalog(10_000)

// #region all
function ListAll() {
	return (
		<div className="scroller">
			<ul>
				{products.map((p) => (
					<li key={p.id}>{p.name}</li>
				))}
			</ul>
		</div>
	)
}
// #endregion

// #region virtual
function ListVirtual() {
	const scrollerRef = useRef<HTMLDivElement>(null)
	const virtualizer = useVirtualizer({
		count: products.length,
		getScrollElement: () => scrollerRef.current,
		estimateSize: () => 24, // px per row
		overscan: 5, // extra rows above and below the visible ones
	})
	return (
		<div ref={scrollerRef} className="scroller">
			<ul style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
				{virtualizer.getVirtualItems().map((row) => (
					<li
						key={row.key}
						data-index={row.index}
						style={{ position: 'absolute', top: 0, width: '100%', height: row.size, transform: `translateY(${row.start}px)` }}
					>
						{products[row.index].name}
					</li>
				))}
			</ul>
		</div>
	)
}
// #endregion

function Page({ List }: { List: typeof ListAll }) {
	const [, setRefresh] = useState(0)
	return (
		<>
			<button id="refresh" onClick={() => setRefresh((n) => n + 1)}>Refresh</button>
			{/* #region profiler */}
			<Profiler id="list" onRender={(_id, phase, actualDuration) => log(`${phase}: React spent ${Math.round(actualDuration)} ms rendering the list`)}>
				<List />
			</Profiler>
			{/* #endregion */}
		</>
	)
}

const css = `.scroller { height: 300px; overflow: auto; border: 1px solid #ccd0da; } .scroller ul { margin: 0; padding: 0; list-style: none; } .scroller li { height: 24px; line-height: 24px; padding: 0 8px; box-sizing: border-box; }`

export function mount(root: HTMLElement, scenario: string | null) {
	const style = document.createElement('style')
	style.textContent = css
	document.head.append(style)
	createRoot(root).render(<Page List={scenario === 'virtual' ? ListVirtual : ListAll} />)
}
