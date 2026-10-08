// The React Engine Map card: the call map, the glossary table, flashcards.

import { BY_NAME, GLOSSARY, PHASE_LABEL } from './glossary.mjs'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const oneLine = (html) =>
	html
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.join('')

// [name, children] — a name that isn't in the glossary is shown as a plain step.
const N = (name, ...children) => [name, children]

const LANES = [
	{
		id: 'setup',
		title: '1 · Setup and events',
		sub: 'Once at start-up, then every time the user does something',
		tree: [
			N('createRoot', N('createFiberRoot'), N('listenToAllSupportedEvents')),
			N('root.render', N('requestUpdateLane'), N('updateContainerImpl', N('scheduleUpdateOnFiber'))),
			N('dispatchDiscreteEvent', N('dispatchEvent', N('your onClick', N('dispatchSetState')))),
		],
	},
	{
		id: 'schedule',
		title: '2 · Scheduling',
		sub: 'setState never renders: it queues and schedules',
		tree: [
			N('dispatchSetState', N('requestUpdateLane'), N('dispatchSetStateInternal', N('enqueueConcurrentHookUpdate')), N('scheduleUpdateOnFiber', N('ensureRootIsScheduled', N('scheduleImmediateRootScheduleTask')))),
		],
		then: 'microtask',
		tree2: [N('processRootScheduleInMicrotask', N('performSyncWorkOnRoot', N('performWorkOnRoot')), N('scheduleCallback', N('performWorkOnRootViaSchedulerTask', N('performWorkOnRoot'))))],
	},
	{
		id: 'render',
		title: '3 · Render phase',
		sub: 'Pure, off-screen, can be paused or thrown away',
		tree: [
			N(
				'performWorkOnRoot',
				N(
					'renderRootSync',
					N('prepareFreshStack', N('createWorkInProgress'), N('finishQueueingConcurrentUpdates', N('markUpdateLaneFromFiberToRoot'))),
					N(
						'workLoopSync',
						N(
							'performUnitOfWork',
							N(
								'beginWork',
								N('bailoutOnAlreadyFinishedWork'),
								N('updateFunctionComponent', N('renderWithHooks', N('YourComponent()', N('mountState'), N('updateReducer'), N('jsx'))), N('reconcileChildren')),
								N('reconcileChildren', N('reconcileChildFibers', N('reconcileSingleElement', N('useFiber', N('createWorkInProgress')), N('createFiberFromTypeAndProps')), N('reconcileChildrenArray', N('mapRemainingChildren'), N('placeChild'), N('deleteChild')))),
							),
							N('completeUnitOfWork', N('completeWork')),
						),
					),
				),
				N('renderRootConcurrent', N('workLoopConcurrentByScheduler', N('shouldYield'), N('performUnitOfWork'))),
			),
		],
	},
	{
		id: 'commit',
		title: '4 · Commit phase',
		sub: 'Synchronous, all at once, then effects',
		tree: [
			N(
				'commitRoot',
				N('commitBeforeMutationEffects'),
				N('flushMutationEffects', N('commitMutationEffectsOnFiber', N('commitPlacement', N('insertOrAppendPlacementNode')), N('commitUpdate'), N('commitDeletionEffects', N('removeChild'))), N('root.current = finishedWork')),
				N('flushLayoutEffects', N('commitLayoutEffectOnFiber', N('commitHookEffectListMount'))),
				N('flushPassiveEffects', N('commitHookEffectListUnmount'), N('commitHookEffectListMount')),
			),
		],
	},
]

function nodeHtml([name, children]) {
	const e = BY_NAME.get(name)
	const label = e
		? `<button type="button" class="map-node gl gl-${e.level}" data-gl="${esc(e.name)}" data-level="${e.level}"><code>${esc(name)}</code><small>${esc(e.plain)}</small></button>`
		: `<span class="map-node map-plain" data-level="must"><code>${esc(name)}</code></span>`
	return `<li>${label}${children.length ? `<ul>${children.map(nodeHtml).join('')}</ul>` : ''}</li>`
}

export function engineMap() {
	const lanes = LANES.map(
		(l) => `<section class="map-lane lane-${l.id}">
			<header><b>${l.title}</b><span>${l.sub}</span></header>
			<ul class="map-tree">${l.tree.map(nodeHtml).join('')}</ul>
			${l.then ? `<div class="map-then">↓ ${l.then} ↓</div><ul class="map-tree">${l.tree2.map(nodeHtml).join('')}</ul>` : ''}
		</section>`,
	).join('<div class="map-between" aria-hidden="true">↓</div>')
	return oneLine(`<figure class="fig engine-map" data-engine-map data-pagefind-ignore>
		<div class="btn-row map-filter" role="group" aria-label="Show">
			<button type="button" class="btn" data-map-level="all" aria-pressed="true">Everything</button>
			<button type="button" class="btn btn-ghost" data-map-level="good" aria-pressed="false">Must + good to know</button>
			<button type="button" class="btn btn-ghost" data-map-level="must" aria-pressed="false">Only must know</button>
		</div>
		<div class="map-legend"><span><i class="lvl lvl-must"></i>must know</span><span><i class="lvl lvl-good"></i>good to know</span><span><i class="lvl lvl-skip"></i>implementation detail</span><span>· indented = called by the line above · tap a name for its card</span></div>
		${lanes}
		<figcaption>The main functions of React DOM 19.2.5, nested the way they call each other. Each lane is one step of every update: setup/event → scheduling → render → commit.</figcaption>
	</figure>`)
}

export function glossaryTable() {
	const order = ['setup', 'event', 'schedule', 'element', 'render', 'commit', 'effects', 'data']
	const levelRank = { must: 0, good: 1, skip: 2 }
	return order
		.map((phase) => {
			const rows = GLOSSARY.filter((e) => e.phase === phase).sort((a, b) => levelRank[a.level] - levelRank[b.level] || a.name.localeCompare(b.name))
			if (!rows.length) return ''
			return `### ${PHASE_LABEL[phase][0].toUpperCase() + PHASE_LABEL[phase].slice(1)}\n\n| Name | In plain English | What it does |\n|---|---|---|\n${rows
				.map((e) => `| <span class="lvl lvl-${e.level}" title="${e.level}"></span> \`${e.name}\` | ${e.plain} | ${e.what.replace(/\|/g, '\\|')} |`)
				.join('\n')}\n`
		})
		.join('\n')
}

/** scope: '' → React's internals, 'api' → public React APIs */
export function flashcards(scope = '') {
	return oneLine(`<figure class="fig flashcards" data-flashcards="${scope}" data-pagefind-ignore>
		<div class="btn-row fc-top">
			<button type="button" class="btn" data-fc="must" aria-pressed="true">Must know</button>
			<button type="button" class="btn btn-ghost" data-fc="all" aria-pressed="false">Must + good to know</button>
			<span class="fc-stats"></span>
			<button type="button" class="btn btn-ghost fc-reset" data-fc="reset">Reset</button>
		</div>
		<div class="fc-card">
			<div class="fc-front"></div>
			<div class="fc-back" hidden></div>
		</div>
		<div class="btn-row fc-actions">
			<button type="button" class="btn" data-fc="show">Show answer</button>
			<button type="button" class="btn btn-ghost" data-fc="again" hidden>↻ Again</button>
			<button type="button" class="btn" data-fc="known" hidden>✓ I knew it</button>
		</div>
		<figcaption>Say the answer out loud first, then check. Cards you got wrong come back first. Progress is saved in this browser only.</figcaption>
	</figure>`)
}
