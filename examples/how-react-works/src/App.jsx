import { useState } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { Layout } from './Layout.jsx'
import { Nav } from './Nav.jsx'
import { CounterPage } from './CounterPage.jsx'
import { TodosPage } from './TodosPage.jsx'
import { log } from './trace.js'

export function App() {
	log('render App')
	const [page, setPage] = useState('counter')
	const [theme, setTheme] = useState('light')

	return (
		<ThemeContext value={theme}>
			<Layout>
				<Nav page={page} onNavigate={setPage} />
				<button className="theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
					Theme: {theme}
				</button>
				{page === 'counter' ? <CounterPage /> : <TodosPage />}
			</Layout>
		</ThemeContext>
	)
}
