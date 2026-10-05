import { log } from './trace.js'

export function Nav({ page, onNavigate }) {
	log('render Nav', page)
	return (
		<nav>
			<button aria-current={page === 'counter'} onClick={() => onNavigate('counter')}>
				Counter
			</button>
			<button aria-current={page === 'todos'} onClick={() => onNavigate('todos')}>
				Todos
			</button>
		</nav>
	)
}
