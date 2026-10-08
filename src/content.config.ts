import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// src/content/notes/<module>/<slug>.md, written by scripts/sync-notes.mjs
const notes = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		module: z.string(),
		order: z.number(),
		level: z.enum(['must', 'good', 'skip']),
		illus: z.string(),
		summary: z.string(),
		source: z.string(),
	}),
})

export const collections = { notes }
