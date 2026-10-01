// @ts-check
import { defineConfig } from 'astro/config'

// Published to GitHub Pages at https://giorgistrat.github.io/react-internals/
export default defineConfig({
	site: 'https://giorgistrat.github.io',
	base: '/react-internals',
	markdown: {
		shikiConfig: {
			theme: 'github-light',
			langAlias: { text: 'plaintext' },
			wrap: false,
		},
	},
})
