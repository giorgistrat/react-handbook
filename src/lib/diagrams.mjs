// Diagrams injected into the synced notes. Each returns an HTML string with no
// blank lines, so Markdown treats it as one raw HTML block.

const INK = '#2b2522'
const PINK = '#d9539f'
const ORANGE = '#ff7a00'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Collapse whitespace-only lines and newlines so the block stays one HTML block. */
function block(html) {
	return html
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.join('')
}

function fig(id, caption, inner) {
	return block(
		`<figure class="fig fig-${id}">${inner}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`,
	)
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

const PIPELINE = [
	{
		key: 'trigger',
		title: 'Trigger',
		items: ['<code>root.render()</code>', '<code>setState</code> / <code>dispatch</code>', 'lane picked, update queued'],
		link: 'scheduler-lanes-and-batching',
	},
	{
		key: 'render',
		title: 'Render phase',
		tag: 'pure · interruptible',
		items: ['call components (<code>beginWork</code>)', 'reconcile children (diff)', 'prepare DOM (<code>completeWork</code>)'],
		link: 'the-work-loop',
	},
	{
		key: 'commit',
		title: 'Commit phase',
		tag: 'sync · atomic',
		items: ['before mutation', 'mutation: DOM writes', 'swap trees', 'layout: <code>useLayoutEffect</code>, refs'],
		link: 'commit-phase-and-effects',
	},
	{ key: 'paint', title: 'Browser', items: ['style / layout', 'paint'] },
	{
		key: 'effects',
		title: 'After paint',
		items: ['passive effects', '<code>useEffect</code>'],
		link: 'commit-phase-and-effects',
	},
]

export function pipeline({ hrefFor } = {}) {
	const steps = PIPELINE.map(
		(s, i) => `
		<div class="pipe-step pipe-${s.key}">
			<div class="pipe-head"><span class="pipe-num">${i + 1}</span><span>${s.title}</span></div>
			${s.tag ? `<span class="pipe-tag">${s.tag}</span>` : ''}
			<ul>${s.items.map((it) => `<li>${it}</li>`).join('')}</ul>
			${hrefFor && s.link ? `<a class="pipe-link" href="${hrefFor(s.link)}">Read →</a>` : ''}
		</div>`,
	).join('<div class="pipe-arrow" aria-hidden="true">→</div>')
	return fig('pipeline', 'Every update goes through the same five steps. Only the render phase can pause.', `<div class="pipe">${steps}</div>`)
}

// ─── Fiber: linked tree ────────────────────────────────────────────────────

export function fiberTree() {
	const W = 118
	const H = 38
	const N = {
		HostRoot: [70, 28],
		App: [70, 108],
		Header: [70, 188],
		main: [270, 188],
		Counter: [270, 268],
		p: [470, 268],
		hi: [470, 348],
	}
	const label = { hi: '"hi" (HostText)' }
	const fill = { HostRoot: '#efe3c8', App: '#f7c4e6', Header: '#f7c4e6', Counter: '#f7c4e6', main: '#a6ece3', p: '#a6ece3', hi: '#ffe08a' }
	const node = (k) => {
		const [cx, cy] = N[k]
		return `<g><rect x="${cx - W / 2}" y="${cy - H / 2}" width="${W}" height="${H}" rx="9" fill="${fill[k]}" stroke="${INK}" stroke-width="2"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" class="t-node">${label[k] ?? k}</text></g>`
	}
	const child = (a, b) => {
		const [x1, y1] = N[a]
		const [x2, y2] = N[b]
		if (x1 === x2) return `<path d="M${x1 - 14} ${y1 + H / 2} V${y2 - H / 2 - 4}" class="e-child" marker-end="url(#ah-ink)"/>`
		return `<path d="M${x1} ${y1 + H / 2} V${y2 - H / 2 - 4}" class="e-child" marker-end="url(#ah-ink)"/>`
	}
	const sibling = (a, b) => {
		const [x1, y1] = N[a]
		const [x2] = N[b]
		return `<path d="M${x1 + W / 2} ${y1} H${x2 - W / 2 - 4}" class="e-sibling" marker-end="url(#ah-orange)"/>`
	}
	const ret = (a, b) => {
		const [x1, y1] = N[a]
		const [x2, y2] = N[b]
		if (x1 === x2) return `<path d="M${x1 + 14} ${y1 - H / 2} V${y2 + H / 2 + 4}" class="e-return" marker-end="url(#ah-pink)"/>`
		return `<path d="M${x1 - 30} ${y1 - H / 2} C${x1 - 30} ${y1 - 50} ${x2 + W / 2 + 40} ${y2} ${x2 + W / 2 + 4} ${y2}" class="e-return" marker-end="url(#ah-pink)"/>`
	}
	const defs = `<defs>${[
		['ink', INK],
		['orange', ORANGE],
		['pink', PINK],
	]
		.map(
			([id, c]) =>
				`<marker id="ah-${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${c}"/></marker>`,
		)
		.join('')}</defs>`
	const svg = `<svg viewBox="0 0 560 380" class="diagram-svg" role="img" aria-label="Fiber tree with child, sibling and return pointers">${defs}
		${child('HostRoot', 'App')}${child('App', 'Header')}${child('main', 'Counter')}${child('p', 'hi')}
		${sibling('Header', 'main')}${sibling('Counter', 'p')}
		${ret('App', 'HostRoot')}${ret('Header', 'App')}${ret('main', 'App')}${ret('Counter', 'main')}${ret('p', 'main')}${ret('hi', 'p')}
		${Object.keys(N).map(node).join('')}
	</svg>`
	const legend = `<div class="legend"><span><i class="sw sw-child"></i>child (first child only)</span><span><i class="sw sw-sibling"></i>sibling</span><span><i class="sw sw-return"></i>return (parent)</span></div>`
	return fig('fiber-tree', 'No children arrays: each fiber points to its first <code>child</code>, its next <code>sibling</code>, and its parent via <code>return</code>.', svg + legend)
}

export function fiberAnatomy() {
	const groups = [
		['Identity', ['tag', 'key', 'elementType', 'type', 'stateNode'], 'pink'],
		['Tree links', ['return', 'child', 'sibling', 'index', 'ref'], 'teal'],
		['Props & state', ['pendingProps', 'memoizedProps', 'memoizedState', 'updateQueue', 'dependencies'], 'mustard'],
		['Effects', ['flags', 'subtreeFlags', 'deletions'], 'orange'],
		['Scheduling', ['lanes', 'childLanes'], 'plum'],
		['Double buffering', ['alternate'], 'cream'],
	]
	return fig(
		'anatomy',
		'A fiber is a plain object. You only need to remember: type, props, state, and links to parent / child / sibling.',
		`<div class="anatomy"><div class="anatomy-title"><code>FiberNode</code></div><div class="anatomy-grid">${groups
			.map(
				([t, fields, c]) =>
					`<div class="anatomy-group g-${c}"><h5>${t}</h5>${fields.map((f) => `<code>${f}</code>`).join('')}</div>`,
			)
			.join('')}</div></div>`,
	)
}

export function stackVsFiber() {
	return fig(
		'stack-vs-fiber',
		'The stack reconciler kept its place on the JS call stack. Fiber keeps it in one variable.',
		`<div class="versus">
			<div class="vs-card">
				<h5>Stack reconciler <small>(≤ React 15)</small></h5>
				<div class="stack">
					<div class="frame">reconcile(<b>button</b>)</div>
					<div class="frame">reconcile(<b>Counter</b>)</div>
					<div class="frame">reconcile(<b>main</b>)</div>
					<div class="frame">reconcile(<b>App</b>)</div>
				</div>
				<p><span class="chip chip-bad">can’t pause</span><span class="chip chip-bad">can’t prioritize</span><span class="chip chip-bad">can’t throw away</span></p>
			</div>
			<div class="vs-card">
				<h5>Fiber <small>(React 16+)</small></h5>
				<div class="heap">
					<span class="obj">App</span><span class="obj">main</span><span class="obj on">Counter</span><span class="obj">button</span>
					<div class="ptr"><code>workInProgress</code> → Counter</div>
				</div>
				<p><span class="chip chip-good">pause</span><span class="chip chip-good">resume</span><span class="chip chip-good">prioritize</span><span class="chip chip-good">discard</span></p>
			</div>
		</div>`,
	)
}

// ─── Work loop ─────────────────────────────────────────────────────────────

export function workLoopFlow() {
	const box = (cx, cy, title, sub, fill) =>
		`<g><rect x="${cx - 78}" y="${cy - 27}" width="156" height="54" rx="10" fill="${fill}" stroke="${INK}" stroke-width="2"/><text x="${cx}" y="${cy - 2}" text-anchor="middle" class="t-node">${title}</text>${sub ? `<text x="${cx}" y="${cy + 15}" text-anchor="middle" class="t-small">${sub}</text>` : ''}</g>`
	const diamond = (cx, cy, label) =>
		`<g><polygon points="${cx},${cy - 32} ${cx + 58},${cy} ${cx},${cy + 32} ${cx - 58},${cy}" fill="#ffe08a" stroke="${INK}" stroke-width="2"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" class="t-node">${label}</text></g>`
	const lbl = (x, y, t, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="t-small t-bold">${t}</text>`
	const arrow = (d, color = INK) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" marker-end="url(#wl-ah)"/>`
	const svg = `<svg viewBox="0 0 680 300" class="diagram-svg" role="img" aria-label="Work loop flowchart"><defs><marker id="wl-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${INK}"/></marker></defs>
		${arrow('M253 70 H300')}
		${arrow('M458 70 H510')}
		${arrow('M570 38 V16 H175 V41')}${lbl(372, 11, 'yes → go DOWN: workInProgress = child')}
		${arrow('M570 102 V173')}${lbl(580, 142, 'no', 'start')}
		${arrow('M492 200 H440')}
		${arrow('M380 168 V130 H200 V99')}${lbl(290, 124, 'yes → go ACROSS to sibling')}
		${arrow('M322 200 H235')}${lbl(278, 192, 'no → go UP')}
		${arrow('M175 232 V270 H570 V229')}${lbl(372, 288, 'no → complete the parent (bubble flags)')}
		${arrow('M117 200 H88')}${lbl(102, 192, 'yes')}
		${box(175, 70, 'performUnitOfWork', 'one fiber', '#fcf5e4')}
		${box(380, 70, 'beginWork ↓', 'call it, or bail out', '#f7c4e6')}
		${diamond(570, 70, 'child?')}
		${box(570, 200, 'completeWork ↑', 'create / flag DOM', '#a6ece3')}
		${diamond(380, 200, 'sibling?')}
		${diamond(175, 200, 'past root?')}
		<g><rect x="12" y="182" width="74" height="36" rx="18" fill="#ff7a00" stroke="${INK}" stroke-width="2"/><text x="49" y="205" text-anchor="middle" class="t-node">commit</text></g>
	</svg>`
	return fig('workloop', 'Down with <code>beginWork</code>, across to siblings, up with <code>completeWork</code>. No recursion: just one <code>workInProgress</code> pointer.', svg)
}

// ─── Scheduler ─────────────────────────────────────────────────────────────

export function laneBits() {
	const named = { 1: ['Sync', 'sync'], 3: ['InputContinuous', 'cont'], 5: ['Default', 'def'], 28: ['Idle', 'idle'], 29: ['Offscreen', 'off'] }
	const cells = []
	for (let bit = 0; bit <= 30; bit++) {
		let cls = ''
		let title = `bit ${bit}`
		if (named[bit]) {
			cls = `lane-${named[bit][1]}`
			title = `${named[bit][0]}Lane · bit ${bit} · ${2 ** bit}`
		} else if (bit >= 8 && bit <= 21) {
			cls = 'lane-trans'
			title = `TransitionLane · bit ${bit}`
		} else if (bit >= 22 && bit <= 25) {
			cls = 'lane-retry'
			title = `RetryLane · bit ${bit}`
		}
		cells.push(`<span class="lane ${cls}" title="${title}">${bit}</span>`)
	}
	return fig(
		'lanes',
		'Lanes are bits in one 31-bit number. Lower bit = higher priority, and <code>lanes &amp; -lanes</code> picks the most urgent.',
		`<div class="lanes"><div class="lanes-axis"><span>← higher priority</span><span>lower priority →</span></div><div class="lanes-grid">${cells.join('')}</div>
		<div class="legend"><span><i class="sw lane-sync"></i>Sync (click, keydown)</span><span><i class="sw lane-cont"></i>InputContinuous (scroll, mousemove)</span><span><i class="sw lane-def"></i>Default (setTimeout, fetch)</span><span><i class="sw lane-trans"></i>Transitions</span><span><i class="sw lane-retry"></i>Retry</span><span><i class="sw lane-idle"></i>Idle</span><span><i class="sw lane-off"></i>Offscreen</span></div></div>`,
	)
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function hookList({ states = ['0', '{ current: &lt;button&gt; }', 'deps [0]', 'deps [0]'], fiber = 'Counter' } = {}) {
	const hooks = ['useState', 'useRef', 'useLayoutEffect', 'useEffect']
	return fig(
		'hooklist',
		'Hooks live in a linked list on <code>fiber.memoizedState</code>, matched purely by call order.',
		`<div class="chain"><div class="chain-start"><code>${fiber}</code> fiber<small>.memoizedState</small></div>${hooks
			.map(
				(h, i) =>
					`<span class="chain-arrow">→</span><div class="chain-node"><span class="chain-idx">#${i + 1}</span><b>${h}</b><code>${states[i]}</code><small>.next</small></div>`,
			)
			.join('')}<span class="chain-arrow">→</span><div class="chain-null">null</div></div>`,
	)
}

export function updateRing() {
	const R = 70
	const cx = 210
	const cy = 110
	const pos = (i) => {
		const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3
		return [cx + R * Math.cos(a), cy + R * Math.sin(a)]
	}
	const ups = ['u1', 'u2', 'u3']
	const P = ups.map((_, i) => pos(i))
	const arc = (i, j) => {
		const [x1, y1] = P[i]
		const [x2, y2] = P[j]
		return `<path d="M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}" fill="none" stroke="${INK}" stroke-width="2" marker-end="url(#ring-ah)" class="ring-arc"/>`
	}
	const svg = `<svg viewBox="0 0 420 220" class="diagram-svg"><defs><marker id="ring-ah" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${INK}"/></marker></defs>
		${arc(0, 1)}${arc(1, 2)}${arc(2, 0)}
		${ups
			.map(
				(u, i) =>
					`<g><circle cx="${P[i][0]}" cy="${P[i][1]}" r="24" fill="${i === 2 ? '#ffb36b' : '#f7c4e6'}" stroke="${INK}" stroke-width="2"/><text x="${P[i][0]}" y="${P[i][1] + 5}" text-anchor="middle" class="t-node">${u}</text></g>`,
			)
			.join('')}
		<text x="${P[2][0] - 30}" y="${P[2][1] + 4}" text-anchor="end" class="t-small t-bold">queue.pending →</text>
		<text x="${cx}" y="${cy + 5}" text-anchor="middle" class="t-small">.next</text>
	</svg>`
	return fig(
		'ring',
		'The pending queue is circular: <code>queue.pending</code> points at the <b>last</b> update, and <code>last.next</code> is the first. Appending is O(1).',
		svg,
	)
}

// ─── Commit ────────────────────────────────────────────────────────────────

export function commitPhases() {
	const steps = [
		['commit', 'Before mutation', ['DOM still shows the old UI', '<code>getSnapshotBeforeUpdate</code>']],
		['commit', 'Mutation', ['DOM writes (insert, update, remove)', 'layout-effect cleanups', '<code>useInsertionEffect</code>', 'detach old refs']],
		['swap', 'Swap', ['<code>root.current = finishedWork</code>']],
		['commit', 'Layout', ['attach refs', '<code>useLayoutEffect</code> setups', '<code>componentDidMount/Update</code>']],
		['paint', 'Paint', ['browser draws pixels']],
		['effects', 'Passive', ['all <code>useEffect</code> cleanups, then all setups', 'SyncLane: flushed before paint']],
	]
	return fig(
		'commit-phases',
		'Everything left of “Paint” is one synchronous pass. Layout effects run child → parent, before the user sees anything.',
		`<div class="pipe">${steps
			.map(
				([k, t, items], i) =>
					`<div class="pipe-step pipe-${k}"><div class="pipe-head"><span class="pipe-num">${i + 1}</span><span>${t}</span></div><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul></div>`,
			)
			.join('<div class="pipe-arrow" aria-hidden="true">→</div>')}</div>`,
	)
}

// ─── End to end ────────────────────────────────────────────────────────────

export function e2eTree() {
	return block(`
		<figure class="fig fig-e2e-tree">
			<div class="tree-list">
				<div class="tl" style="--d:0"><span class="tl-n tl-root">HostRoot</span></div>
				<div class="tl" style="--d:1"><span class="tl-n tl-comp">App</span></div>
				<div class="tl" style="--d:2"><span class="tl-n tl-host">main</span></div>
				<div class="tl" style="--d:3"><span class="tl-n tl-comp">Header</span></div>
				<div class="tl" style="--d:4"><span class="tl-n tl-host">h1</span> → <span class="tl-n tl-text">"Clicks"</span></div>
				<div class="tl" style="--d:3"><span class="tl-n tl-comp tl-hot">Counter</span></div>
				<div class="tl" style="--d:4"><span class="tl-n tl-host">button</span> → <span class="tl-n tl-text">"0"</span></div>
			</div>
			${hookList({ states: ['0', '{ current: &lt;button&gt; }', 'deps [0]', 'deps [0]'] }).replace('<figure class="fig fig-hooklist">', '<div class="nested">').replace(/<figcaption>.*<\/figcaption><\/figure>$/, '</div>')}
			<figcaption>The <code>current</code> fiber tree after mount, with <code>Counter</code>’s hook list.</figcaption>
		</figure>`)
}

/** A sequence diagram drawn in HTML: one column per actor, one row per message. */
function sequence({ actors, messages, caption, id }) {
	const n = actors.length
	const head = actors.map((a, i) => `<div class="seq-actor seq-a${i % 6}" style="grid-column:${i + 2}">${a}</div>`).join('')
	const rows = messages
		.map(([from, to, label, phase], k) => {
			const lo = Math.min(from, to) + 2
			const hi = Math.max(from, to) + 2
			const self = from === to
			const dir = self ? 'self' : to > from ? 'right' : 'left'
			const reply = phase === 'reply' ? ' seq-reply' : ''
			// self-messages get a 3-column-wide label; near the right edge it grows leftwards
			const alignRight = self && lo + 3 > n + 2
			const labelCols = !self ? `${lo} / ${hi + 1}` : alignRight ? `${lo - 2} / ${lo + 1}` : `${lo} / ${lo + 3}`
			return `<div class="seq-num" style="grid-row:${k * 2 + 2} / span 2">${k + 1}</div>
				<div class="seq-msg seq-${dir}${reply}" style="grid-column:${self ? `${lo} / ${lo + 1}` : `${lo} / ${hi + 1}`};grid-row:${k * 2 + 3};--span:${hi - lo + 1}"></div>
				<div class="seq-label${alignRight ? ' seq-label-r' : ''}" style="grid-column:${labelCols};grid-row:${k * 2 + 2}">${label}</div>`
		})
		.join('')
	const lifelines = actors.map((_, i) => `<div class="seq-life" style="grid-column:${i + 2};grid-row:2 / ${messages.length * 2 + 2}"></div>`).join('')
	return fig(id, caption, `<div class="seq" style="--actors:${n}">${head}${lifelines}${rows}</div>`)
}

export function e2eSequence() {
	return sequence({
		id: 'seq',
		actors: ['Browser', 'React root listener', 'Counter handler', 'Microtask', 'Work loop', 'Commit'],
		messages: [
			[0, 1, 'native <code>click</code>'],
			[1, 2, '<code>dispatchDiscreteEvent</code> → <code>onClick</code>'],
			[2, 3, '<code>setCount(1)</code> · SyncLane · <code>queueMicrotask</code>'],
			[2, 0, 'handler returns, nothing rendered yet', 'reply'],
			[3, 4, '<code>performSyncWorkOnRoot</code> → <code>renderRootSync</code>'],
			[4, 4, 'HostRoot, App, main bail out · Header skipped'],
			[4, 4, '<code>Counter()</code> runs → count = 1'],
			[4, 5, '<code>commitRoot</code>'],
			[5, 5, 'mutation: "0" → "1", then <code>root.current = finishedWork</code>'],
			[5, 5, 'layout: <code>useLayoutEffect</code> sets width 50px'],
			[5, 5, 'passive (SyncLane): <code>document.title = "Clicks: 1"</code>'],
			[5, 0, 'microtask ends → paint', 'reply'],
		],
		caption: 'One click, end to end. Steps 1–4 are the event, 5–7 render, 8–11 commit, 12 paint.',
	})
}
