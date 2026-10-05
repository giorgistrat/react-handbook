import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { log } from './trace.js'

let nextId = 3

export function TodosPage() {
	log('render TodosPage')
	const [todos, setTodos] = useState([
		{ id: 1, text: 'Learn JSX' },
		{ id: 2, text: 'Read about fibers' },
	])
	const [text, setText] = useState('')

	useEffect(() => {
		log('effect: subscribe to resize')
		const onResize = () => log('window resized')
		window.addEventListener('resize', onResize)
		return () => {
			log('cleanup: unsubscribe from resize')
			window.removeEventListener('resize', onResize)
		}
	}, [])

	function addTodo(event) {
		event.preventDefault()
		if (!text.trim()) return
		setTodos([...todos, { id: nextId++, text }])
		setText('')
	}

	return (
		<section>
			<h2>Todos</h2>
			<form onSubmit={addTodo}>
				<input value={text} onChange={(e) => setText(e.target.value)} placeholder="New todo" />
				<button>Add</button>
			</form>
			<ul>
				{todos.map((todo) => (
					<TodoItem
						key={todo.id}
						todo={todo}
						onRemove={() => setTodos(todos.filter((t) => t.id !== todo.id))}
					/>
				))}
			</ul>
		</section>
	)
}

function TodoItem({ todo, onRemove }) {
	log('render TodoItem', todo.id)
	const theme = useContext(ThemeContext)
	return (
		<li className={theme}>
			{todo.text} <button onClick={onRemove}>×</button>
		</li>
	)
}
