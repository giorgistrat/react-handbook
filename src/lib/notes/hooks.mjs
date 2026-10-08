// Hooks module. Rewritten for the site in content/hooks/ from the vault's
// React Hooks Workshop notes, "useState vs useReducer", "React Lifecycle" and
// "React Re-rendering"; examples from examples/product-store/src/lessons/hooks.

export const NOTES = [
	{ file: 'Managing UI State.md', slug: 'managing-ui-state', level: 'must', illus: 'list', summary: 'useState, controlled inputs, deriving values instead of storing them twice, and lazy initial state.' },
	{ file: 'Side Effects.md', slug: 'side-effects', level: 'must', illus: 'bolt', summary: 'useEffect for syncing with the outside world, and the cleanup that stops listeners from piling up.' },
	{ file: 'React Lifecycle.md', slug: 'react-lifecycle', level: 'must', illus: 'loop', summary: 'Mount, update, unmount: the recorded order of renders, layout effects, effects and cleanups.' },
	{ file: 'Lifting State.md', slug: 'lifting-state', level: 'must', illus: 'chain', summary: 'Move state up so siblings can share it, and back down (colocate) when only one component needs it.' },
	{ file: 'DOM Refs and Effect Dependencies.md', slug: 'dom-refs-and-effect-dependencies', level: 'must', illus: 'eye', summary: 'useRef and ref callbacks for real DOM nodes, and why object dependencies make effects re-run.' },
	{ file: 'The useId Hook.md', slug: 'the-useid-hook', level: 'good', illus: 'map', summary: 'Unique, SSR-safe ids for label/input pairs in components that render many times.' },
	{ file: 'Building a Cart.md', slug: 'building-a-cart', level: 'must', illus: 'plane', summary: 'Updater functions, immutable updates, saving to localStorage and an undo history, in one cart.' },
	{ file: 'useState vs useReducer.md', slug: 'usestate-vs-usereducer', level: 'must', illus: 'diff', summary: 'Independent values → useState; values that change together → useReducer. The stale-closure bug that decides it.' },
	{ file: 'React Re-rendering.md', slug: 'react-re-rendering', level: 'must', illus: 'pipeline', summary: 'What triggers a re-render, why memo fails on new objects, stale closures, and when to use useMemo/useCallback.' },
]
