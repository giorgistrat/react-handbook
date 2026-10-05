// Per-note metadata: the reading order from "React Internals - Start Here",
// a one-line summary (from the "React Internals" MOC) and which card
// illustration to draw. Shared by the sync script and the pages.

export const MOC_FILE = 'React Internals.md'

export const NOTES = [
	{
		file: 'React Internals - Start Here.md',
		slug: 'start-here',
		level: 'must',
		illus: 'robot',
		summary: 'The beginner entry point: reading order, a plain-English glossary and the top interview questions.',
	},
	{
		file: 'Render and Commit.md',
		slug: 'render-and-commit',
		level: 'must',
		illus: 'pipeline',
		summary: 'The pipeline: trigger → render → commit → paint → effects, why render must be pure, and what the "virtual DOM" really is.',
	},
	{
		file: 'Reconciliation.md',
		slug: 'reconciliation',
		level: 'must',
		illus: 'diff',
		summary: 'The O(n³) → O(n) heuristics (type and key), and why state is tied to position in the tree.',
	},
	{
		file: 'React Fiber.md',
		slug: 'react-fiber',
		level: 'must',
		illus: 'fiber',
		summary: 'Why the stack reconciler couldn’t pause, what a fiber holds, the child/sibling/return tree and double buffering.',
	},
	{
		file: 'Hooks Under the Hood.md',
		slug: 'hooks-under-the-hood',
		level: 'must',
		illus: 'chain',
		summary: 'The hook linked list, why the Rules of Hooks exist, the setState update queue and the eager bailout.',
	},
	{
		file: 'Commit Phase and Effects.md',
		slug: 'commit-phase-and-effects',
		level: 'must',
		illus: 'eye',
		summary: 'Commit sub-phases, the tree swap, and exactly when refs, useLayoutEffect and useEffect run.',
	},
	{
		file: 'The Work Loop.md',
		slug: 'the-work-loop',
		level: 'good',
		illus: 'loop',
		summary: 'beginWork / completeWork, depth-first traversal without recursion, and bailouts.',
	},
	{
		file: 'Scheduler, Lanes and Batching.md',
		slug: 'scheduler-lanes-and-batching',
		level: 'good',
		illus: 'bolt',
		summary: 'Lanes as a priority bitmask, automatic batching, time slicing, interruption and starvation.',
	},
	{
		file: 'Child Reconciliation Algorithm.md',
		slug: 'child-reconciliation-algorithm',
		level: 'good',
		illus: 'list',
		summary: 'The keyed list diff: lockstep fast path, the key Map and the lastPlacedIndex move heuristic.',
	},
	{
		file: 'A State Update, End to End.md',
		slug: 'a-state-update-end-to-end',
		level: 'good',
		illus: 'plane',
		summary: 'One click traced through ~30 real React functions, from the native event to paint and effects.',
	},
	{
		// Site-only: written in content/, not in the vault
		file: 'How React Works, Start to Finish.md',
		site: true,
		slug: 'how-react-works',
		level: 'must',
		illus: 'browser',
		summary: 'A real 2-page app followed from JSX to pixels: Babel output, element objects, every component call, commit, clicks, lists and a page switch.',
	},
]

export const LEVELS = {
	must: { label: 'Must know', className: 'lvl-must' },
	good: { label: 'Good to know', className: 'lvl-good' },
	skip: { label: 'Skip for interviews', className: 'lvl-skip' },
}
