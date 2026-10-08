// @ts-check
import { defineConfig } from 'astro/config'

// Published to GitHub Pages at https://giorgistrat.github.io/react-handbook/
export default defineConfig({
	site: 'https://giorgistrat.github.io',
	base: '/react-handbook',
	markdown: {
		shikiConfig: {
			// Both themes are emitted as CSS variables; prose.css picks one per site theme.
			themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
			defaultColor: false,
			langAlias: { text: 'plaintext' },
			wrap: false,
		},
	},
})
