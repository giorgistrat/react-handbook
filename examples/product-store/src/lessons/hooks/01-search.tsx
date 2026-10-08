// Hooks 1: a product search box with category checkboxes.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'
import { categories, searchProducts } from '../../data/products'

function Results({ query }: { query: string }) {
	const found = searchProducts(query)
	return <p id="results">{found.length} products: {found.map((p) => p.name).join(', ')}</p>
}

// #region uncontrolled
function SearchUncontrolled() {
	const [query, setQuery] = useState('')
	function toggle(category: string, checked: boolean) {
		const words = query.split(' ').filter((w) => w && w !== category)
		setQuery([...words, ...(checked ? [category] : [])].join(' '))
	}
	return (
		<>
			<input id="search" type="search" onChange={(e) => setQuery(e.currentTarget.value)} />
			{categories.map((c) => (
				<label key={c}>
					<input type="checkbox" name={c} onChange={(e) => toggle(c, e.currentTarget.checked)} /> {c}
				</label>
			))}
			<Results query={query} />
		</>
	)
}
// #endregion

// #region controlled
function SearchControlled() {
	const [query, setQuery] = useState('')
	const words = query.split(' ') // derived on every render
	function toggle(category: string, checked: boolean) {
		const rest = words.filter((w) => w && w !== category)
		setQuery([...rest, ...(checked ? [category] : [])].join(' '))
	}
	return (
		<>
			<input id="search" type="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
			{categories.map((c) => (
				<label key={c}>
					<input
						type="checkbox"
						name={c}
						checked={words.includes(c)}
						onChange={(e) => toggle(c, e.currentTarget.checked)}
					/>{' '}
					{c}
				</label>
			))}
			<Results query={query} />
		</>
	)
}
// #endregion

// #region init
function getQueryParam() {
	log('getQueryParam() runs')
	return new URLSearchParams(window.location.search).get('query') ?? ''
}

function SearchEager() {
	const [query, setQuery] = useState(getQueryParam()) // called on every render
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}

function SearchLazy() {
	const [query, setQuery] = useState(getQueryParam) // React calls it once
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const C = { uncontrolled: SearchUncontrolled, controlled: SearchControlled, eager: SearchEager, lazy: SearchLazy }[scenario ?? 'controlled']!
	createRoot(root).render(<C />)
}
