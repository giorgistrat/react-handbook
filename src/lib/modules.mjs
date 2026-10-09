// The handbook's modules, in learning-path order. Each module's notes live in
// src/lib/notes/<id>.mjs. A module with `vault` syncs its notes from that
// folder of the Obsidian vault; the others are written in this repo
// (content/<id>/*.md). Modules without notes yet show as "coming soon".

import { NOTES as FUNDAMENTALS } from './notes/fundamentals.mjs'
import { NOTES as HOOKS } from './notes/hooks.mjs'
import { NOTES as APIS } from './notes/apis.mjs'
import { NOTES as PATTERNS } from './notes/patterns.mjs'
import { NOTES as PERFORMANCE } from './notes/performance.mjs'
import { NOTES as SUSPENSE } from './notes/suspense.mjs'
import { NOTES as INTERNALS } from './notes/internals.mjs'

export const MODULES = [
	{
		id: 'fundamentals',
		title: 'React Fundamentals',
		illus: 'robot',
		summary: 'From the raw DOM to JSX, components, props, forms, error boundaries and keys: nothing about React’s core API feels like magic.',
		notes: FUNDAMENTALS,
	},
	{
		id: 'hooks',
		title: 'Hooks',
		illus: 'chain',
		summary: 'State, effects and their cleanup, the component lifecycle, lifting state, refs, unique IDs, useState vs useReducer, and what makes components re-render.',
		notes: HOOKS,
	},
	{
		id: 'apis',
		title: 'Advanced React APIs',
		illus: 'bolt',
		summary: 'The escape hatches: reducers, context with use, portals, layout effects, imperative handles, flushSync and external stores.',
		notes: APIS,
	},
	{
		id: 'patterns',
		title: 'Advanced React Patterns',
		illus: 'list',
		summary: 'Component API design: composition, latest ref, compound components, slots, prop getters, state initializers, state reducers and control props.',
		notes: PATTERNS,
	},
	{
		id: 'performance',
		title: 'React Performance',
		illus: 'loop',
		summary: 'Render less and respond faster: element and context optimization, concurrent rendering, code splitting, expensive calculations, memo for lists and windowing.',
		notes: PERFORMANCE,
	},
	{
		id: 'suspense',
		title: 'React Suspense',
		illus: 'plane',
		summary: 'Data fetching with use, Suspense and error boundaries, transitions, optimistic UI, suspending images and avoiding waterfalls.',
		notes: SUSPENSE,
	},
	{
		id: 'internals',
		title: 'React Internals',
		illus: 'fiber',
		summary: 'How React works under the hood: reconciliation, Fiber, the work loop, commit, scheduling and hooks, checked against the React 19.2.5 source.',
		vault: 'React Internals',
		moc: 'React Internals.md',
		notes: INTERNALS,
	},
]

export const LEVELS = {
	must: { label: 'Must know', className: 'lvl-must' },
	good: { label: 'Good to know', className: 'lvl-good' },
	skip: { label: 'Skip for interviews', className: 'lvl-skip' },
}

/** Every note, flattened, with its module id. Slugs are unique across modules. */
export const ALL_NOTES = MODULES.flatMap((m) => m.notes.map((n) => ({ ...n, module: m.id })))

const seen = new Set()
for (const n of ALL_NOTES) {
	if (seen.has(n.slug)) throw new Error(`Duplicate note slug: ${n.slug}`)
	seen.add(n.slug)
}

export const moduleById = (id) => MODULES.find((m) => m.id === id)
export const noteTitle = (n) => n.file.replace(/\.md$/, '').replace(/^React Internals - /, '')
/** Path of a note below the site base, e.g. "internals/react-fiber/". */
export const notePath = (n) => `${n.module}/${n.slug}/`
