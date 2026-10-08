// Performance 6: a 500-product list. Hovering highlights a row; clicking selects
// it; "Refresh" re-renders the list for an unrelated reason.
import { memo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { makeCatalog } from '../../data/catalog'
import type { Product } from '../../data/products'
import { log } from '../../log'

const products = makeCatalog(500)
let itemRenders = 0
// Called by the recorder after each action
;(window as unknown as { __countRenders: () => void }).__countRenders = () => {
	log(`ListItem renders: ${itemRenders}`)
	itemRenders = 0
}

type ItemProps = {
	product: Product
	index: number
	highlightedIndex: number
	selectedId: string | null
	onHover: (index: number) => void
	onSelect: (id: string) => void
}

// #region item
function ListItem({ product, index, highlightedIndex, selectedId, onHover, onSelect }: ItemProps) {
	itemRenders++
	const isHighlighted = index === highlightedIndex
	const isSelected = product.id === selectedId
	return (
		<li
			data-index={index}
			className={`${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
			onMouseEnter={() => onHover(index)}
			onClick={() => onSelect(product.id)}
		>
			{product.name}
		</li>
	)
}
// #endregion

// #region memo
const MemoItem = memo(ListItem)
// #endregion

// #region comparator
const ComparedItem = memo(ListItem, (prev, next) => {
	// re-render only if something this row shows has changed
	if (prev.product !== next.product || prev.index !== next.index) return false
	const wasHighlighted = prev.index === prev.highlightedIndex
	const isHighlighted = next.index === next.highlightedIndex
	const wasSelected = prev.product.id === prev.selectedId
	const isSelected = next.product.id === next.selectedId
	return wasHighlighted === isHighlighted && wasSelected === isSelected
})
// #endregion

// #region primitive
const PrimitiveItem = memo(function PrimitiveItem({ product, index, isHighlighted, isSelected, onHover, onSelect }: {
	product: Product
	index: number
	isHighlighted: boolean
	isSelected: boolean
	onHover: (index: number) => void
	onSelect: (id: string) => void
}) {
	itemRenders++
	return (
		<li
			data-index={index}
			className={`${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
			onMouseEnter={() => onHover(index)}
			onClick={() => onSelect(product.id)}
		>
			{product.name}
		</li>
	)
})
// #endregion

// #region list
function ProductList({ Item }: { Item: typeof ListItem }) {
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [, setRefresh] = useState(0)
	return (
		<>
			<button id="refresh" onClick={() => setRefresh((n) => n + 1)}>Refresh</button>
			<ul className="list">
				{products.map((p, i) => (
					<Item key={p.id} product={p} index={i} highlightedIndex={highlightedIndex} selectedId={selectedId} onHover={setHighlightedIndex} onSelect={setSelectedId} />
				))}
			</ul>
		</>
	)
}
// #endregion

function ProductListPrimitive() {
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [, setRefresh] = useState(0)
	return (
		<>
			<button id="refresh" onClick={() => setRefresh((n) => n + 1)}>Refresh</button>
			<ul className="list">
				{/* #region primitiveUse */}
				{products.map((p, i) => (
					<PrimitiveItem
						key={p.id}
						product={p}
						index={i}
						isHighlighted={i === highlightedIndex}
						isSelected={p.id === selectedId}
						onHover={setHighlightedIndex}
						onSelect={setSelectedId}
					/>
				))}
				{/* #endregion */}
			</ul>
		</>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root)
	if (scenario === 'primitive') return r.render(<ProductListPrimitive />)
	const Item = { memo: MemoItem, comparator: ComparedItem }[scenario ?? ''] ?? ListItem
	r.render(<ProductList Item={Item as typeof ListItem} />)
}
