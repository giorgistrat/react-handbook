// APIs 6: rename a wishlist inline, and add an item then scroll to it.
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

// #region rename
function WishlistName({ sync }: { sync: boolean }) {
	const [editing, setEditing] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	log(`render (editing: ${editing})`)

	function startEditing() {
		log('click: start')
		if (sync) {
			flushSync(() => setEditing(true))
		} else {
			setEditing(true)
		}
		log(`after setEditing: inputRef.current = ${inputRef.current ? '<input>' : 'null'}`)
		inputRef.current?.focus()
		log(`focused: ${document.activeElement?.tagName.toLowerCase()}`)
	}

	return editing ? (
		<input id="name" ref={inputRef} defaultValue="Birthday ideas" onBlur={() => setEditing(false)} />
	) : (
		<button id="edit" onClick={startEditing}>Birthday ideas ✎</button>
	)
}
// #endregion

// #region list
function Wishlist({ sync }: { sync: boolean }) {
	const [items, setItems] = useState(['Ceramic Mug', 'Desk Lamp'])
	const listRef = useRef<HTMLUListElement>(null)

	function add(name: string) {
		if (sync) {
			flushSync(() => setItems([...items, name]))
		} else {
			setItems([...items, name])
		}
		const last = listRef.current!.lastElementChild!
		log(`last <li> right after the update: ${last.textContent}`)
		last.scrollIntoView({ block: 'nearest' })
	}

	return (
		<>
			<ul ref={listRef} className="wishlist">
				{items.map((i) => (
					<li key={i}>{i}</li>
				))}
			</ul>
			<button id="add" onClick={() => add('Notebook Set')}>Add Notebook Set</button>
		</>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const sync = scenario?.endsWith('sync') ?? false
	createRoot(root).render(scenario?.startsWith('list') ? <Wishlist sync={sync} /> : <WishlistName sync={sync} />)
}
