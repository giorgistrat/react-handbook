// Hooks 8: an undo history for the "recently viewed" product, two ways.
import { useCallback, useEffect, useReducer, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

type History = { past: string[]; present: string; future: string[] }

// #region states
function useUndoStates(initial: string) {
	const [past, setPast] = useState<string[]>([])
	const [present, setPresent] = useState(initial)
	const [future, setFuture] = useState<string[]>([])
	const set = useCallback(
		(next: string) => {
			if (next === present) return
			setPast([...past, present]) // past and present come from this render
			setPresent(next)
			setFuture([])
		},
		[past, present],
	)
	return [{ past, present, future }, set] as const
}
// #endregion

// #region reducer
type Action = { type: 'set'; next: string } | { type: 'undo' } | { type: 'redo' }

function historyReducer(state: History, action: Action): History {
	const { past, present, future } = state
	switch (action.type) {
		case 'set':
			if (action.next === present) return state
			return { past: [...past, present], present: action.next, future: [] }
		case 'undo':
			if (!past.length) return state
			return { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future] }
		case 'redo':
			if (!future.length) return state
			return { past: [...past, present], present: future[0], future: future.slice(1) }
	}
}

function useUndoReducer(initial: string) {
	const [state, dispatch] = useReducer(historyReducer, { past: [], present: initial, future: [] })
	const set = useCallback((next: string) => dispatch({ type: 'set', next }), [])
	return [state, set] as const
}
// #endregion

// #region viewer
function RecentlyViewed({ useUndo }: { useUndo: typeof useUndoReducer }) {
	const [state, set] = useUndo('Ceramic Mug')
	useEffect(() => set('Desk Lamp'), []) // e.g. opened from a link
	useEffect(() => set('Trail Backpack'), []) // e.g. restored from a tab
	return <pre id="state">{JSON.stringify(state)}</pre>
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	createRoot(root).render(<RecentlyViewed useUndo={scenario === 'states' ? useUndoStates : useUndoReducer} />)
	setTimeout(() => log('final state:', JSON.parse(root.querySelector('#state')!.textContent!)), 100)
	// #region pure
	const s0: History = { past: ['Ceramic Mug'], present: 'Desk Lamp', future: [] }
	log('historyReducer(s0, undo) →', historyReducer(s0, { type: 'undo' }))
	// #endregion
}
