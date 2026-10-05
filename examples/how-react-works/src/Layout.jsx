import { useContext } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { log } from './trace.js'

export function Layout({ children }) {
	log('render Layout')
	const theme = useContext(ThemeContext)
	return (
		<div className={`layout ${theme}`}>
			<h1>How React Works</h1>
			<main>{children}</main>
		</div>
	)
}
