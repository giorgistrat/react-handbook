// Advanced React APIs module. Rewritten for the site in content/apis/ from the
// vault's "Advanced React APIs" notes; examples from
// examples/product-store/src/lessons/apis.

export const NOTES = [
	{ file: 'useReducer.md', slug: 'usereducer', level: 'must', illus: 'diff', summary: 'A cart as one pure reducer with typed actions: dispatch, lazy init, testing without React, and when React bails out.' },
	{ file: 'Context with use.md', slug: 'context-with-use', level: 'must', illus: 'chain', summary: 'createContext, a provider and use(): skip the prop drilling, and know exactly which components re-render.' },
	{ file: 'createPortal.md', slug: 'createportal', level: 'must', illus: 'map', summary: 'Render a dialog into document.body so a clipping parent can’t hide it; events and context still follow the React tree.' },
	{ file: 'useLayoutEffect.md', slug: 'uselayouteffect', level: 'good', illus: 'eye', summary: 'Measure before the browser paints: the recorded frame where a useEffect tooltip covers its button.' },
	{ file: 'useImperativeHandle.md', slug: 'useimperativehandle', level: 'good', illus: 'robot', summary: 'Expose a small set of methods (focus, clear) on a ref, for commands that don’t fit in state.' },
	{ file: 'flushSync.md', slug: 'flushsync', level: 'good', illus: 'bolt', summary: 'Make React update the DOM before the next line runs, so you can focus or scroll to what you just rendered.' },
	{ file: 'useSyncExternalStore.md', slug: 'usesyncexternalstore', level: 'good', illus: 'loop', summary: 'Read state React doesn’t own (the browser, a plain JS store) safely, with stable snapshots and a server value.' },
]
