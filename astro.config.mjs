// @ts-check
import { defineConfig } from 'astro/config'

// Published to GitHub Pages at https://giorgistrat.github.io/react-internals/
export default defineConfig({
	site: 'https://giorgistrat.github.io',
	base: '/react-internals',
	markdown: {
		shikiConfig: {
			// Both themes are emitted as CSS variables; prose.css picks one per site theme.
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
			langAlias: { text: 'plaintext' },
			wrap: false,
		},
	},
})
