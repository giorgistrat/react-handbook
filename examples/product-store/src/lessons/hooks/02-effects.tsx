// Hooks 2: keep the search box in sync with the browser's back button.
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

const getQueryParam = () => new URLSearchParams(window.location.search).get('query') ?? ''
let nextId = 1

// #region leak
function SearchLeaky() {
	const [query, setQuery] = useState(getQueryParam)
	useEffect(() => {
		const id = nextId++
		window.addEventListener('popstate', () => {
			log(`popstate listener #${id} runs`)
			setQuery(getQueryParam())
		})
	}, [])
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}
// #endregion

// #region cleanup
function SearchClean() {
	const [query, setQuery] = useState(getQueryParam)
	useEffect(() => {
		const id = nextId++
		function updateQuery() {
			log(`popstate listener #${id} runs`)
			setQuery(getQueryParam())
		}
		window.addEventListener('popstate', updateQuery)
		return () => window.removeEventListener('popstate', updateQuery)
	}, [])
	return <input id="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
}
// #endregion

// #region toggle
function Page({ Search }: { Search: () => React.ReactNode }) {
	const [show, setShow] = useState(true)
	return (
		<>
			<label>
				<input id="show" type="checkbox" checked={show} onChange={(e) => setShow(e.currentTarget.checked)} /> Show search
			</label>
			{show ? <Search /> : null}
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	createRoot(root).render(<Page Search={scenario === 'leak' ? SearchLeaky : SearchClean} />)
}
