// Call stacks for the animations' "Call stack" panel. They follow the real
// nesting recorded by examples/how-react-works/scripts/trace.mjs
// (outermost frame first, the running function last).

const EVENT = ['dispatchDiscreteEvent', 'dispatchEvent', 'onClick']
export const MICRO = ['processRootScheduleInMicrotask', 'performSyncWorkOnRoot', 'performWorkOnRoot']
export const TASK = ['performWorkOnRootViaSchedulerTask', 'performWorkOnRoot']

export const event = (...rest) => [...EVENT, ...rest]

/** Stack builders for one render+commit that starts from `base` (MICRO or TASK). */
export function frames(base) {
	const loop = [...base, 'renderRootSync', 'workLoopSync', 'performUnitOfWork']
	const begin = (f) => [...loop, `beginWork(${f})`]
	return {
		start: (...rest) => [...base, 'renderRootSync', 'prepareFreshStack', ...rest],
		begin: (f, ...rest) => [...begin(f), ...rest],
		bail: (f) => [...begin(f), 'bailoutOnAlreadyFinishedWork'],
		call: (f, ...rest) => [...begin(f), 'updateFunctionComponent', 'renderWithHooks', `${f}()`, ...rest],
		reconcile: (f, ...rest) => [...begin(f), 'reconcileChildren', 'reconcileChildFibers', ...rest],
		reconcileAfterCall: (f, ...rest) => [...begin(f), 'updateFunctionComponent', 'reconcileChildren', 'reconcileChildFibers', ...rest],
		complete: (f) => [...loop, 'completeUnitOfWork', `completeWork(${f})`],
		commit: (...rest) => [...base, 'commitRoot', ...rest],
	}
}

/** Attach one stack per step (null = keep the step without a stack). */
export function withStacks(steps, stacks) {
	if (stacks.length !== steps.length) throw new Error(`withStacks: ${steps.length} steps but ${stacks.length} stacks`)
	return steps.map((s, i) => (stacks[i] ? { ...s, stack: stacks[i] } : s))
}

export const MUTATION = ['flushMutationEffects', 'commitMutationEffectsOnFiber']
