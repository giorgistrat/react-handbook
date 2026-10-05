// Flat, outlined, isometric-ish card illustrations in the site palette.
// Each function returns an SVG string drawn on a 240×150 canvas.

const INK = '#2b2522'
const C = {
	orange: ['#ffb36b', '#ff8a1f', '#d96a0b'],
	pink: ['#f7c4e6', '#e58ccb', '#c4679f'],
	teal: ['#a6ece3', '#62c9bd', '#3a9d93'],
	cream: ['#fffaf0', '#efe3c8', '#d6c6a3'],
	mustard: ['#ffe08a', '#f5c542', '#d39f1c'],
	plum: ['#cdb5e8', '#9d7cc9', '#765aa3'],
	gray: ['#f2f2f2', '#c9c9c9', '#a3a3a3'],
}

const COS = Math.cos(Math.PI / 6)
const SIN = 0.5

function project(x, y, z, s, ox, oy) {
	return [ox + (x - y) * COS * s, oy + (x + y) * SIN * s - z * s]
}

const pts = (arr) => arr.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ')

/** An isometric box. x/y/z in grid units, colors = [top, left, right]. */
function box({ x, y, z = 0, w, d, h, color = C.cream, s = 10, ox = 120, oy = 40 }) {
	const P = (a, b, c) => project(a, b, c, s, ox, oy)
	const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]
	const left = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]
	const right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]
	const attrs = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"`
	return {
		order: x + y + z,
		svg:
			`<polygon points="${pts(left)}" fill="${color[1]}" ${attrs}/>` +
			`<polygon points="${pts(right)}" fill="${color[2]}" ${attrs}/>` +
			`<polygon points="${pts(top)}" fill="${color[0]}" ${attrs}/>`,
		topCenter: P(x + w / 2, y + d / 2, z + h),
	}
}

function scene(boxes, extra = '') {
	return boxes
		.slice()
		.sort((a, b) => a.order - b.order)
		.map((b) => b.svg)
		.join('') + extra
}

function frame(inner) {
	return (
		`<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">` +
		`<line x1="0" y1="78" x2="240" y2="78" stroke="${INK}" stroke-width="1.4"/>` +
		inner +
		`</svg>`
	)
}

function figure(cx, groundY, scale = 1, shirt = C.teal[1]) {
	// a tiny person standing on the ground, like the reference's scale figures
	const t = (dx, dy) => `${cx + dx * scale},${groundY + dy * scale}`
	return (
		`<g stroke="${INK}" stroke-width="1.3" stroke-linejoin="round">` +
		`<line x1="${cx - 2 * scale}" y1="${groundY - 12 * scale}" x2="${cx - 2 * scale}" y2="${groundY}"/>` +
		`<line x1="${cx + 2 * scale}" y1="${groundY - 12 * scale}" x2="${cx + 2 * scale}" y2="${groundY}"/>` +
		`<polygon points="${t(-4, -12)} ${t(4, -12)} ${t(4, -22)} ${t(-4, -22)}" fill="${shirt}"/>` +
		`<circle cx="${cx}" cy="${groundY - 26 * scale}" r="${3.6 * scale}" fill="#fff"/>` +
		`</g>`
	)
}

const ILLUSTRATIONS = {
	robot() {
		const o = { ox: 120, oy: 70, s: 8 }
		const b = [
			box({ ...o, x: 0, y: 0, z: 0, w: 4, d: 3, h: 1, color: C.teal }),
			box({ ...o, x: 5, y: 0, z: 0, w: 4, d: 3, h: 1, color: C.teal }),
			box({ ...o, x: 0, y: 0, z: 1, w: 9, d: 3, h: 4, color: C.orange }),
			box({ ...o, x: 2, y: 0.5, z: 5, w: 5, d: 2, h: 3, color: C.mustard }),
			box({ ...o, x: 3.5, y: 1, z: 8, w: 2, d: 1, h: 1.5, color: C.pink }),
		]
		const head = b[3].topCenter
		return frame(
			scene(b) +
				`<circle cx="${head[0] - 9}" cy="${head[1] + 22}" r="4" fill="${C.teal[0]}" stroke="${INK}" stroke-width="1.5"/>` +
				`<circle cx="${head[0] + 9}" cy="${head[1] + 26}" r="4" fill="${C.teal[0]}" stroke="${INK}" stroke-width="1.5"/>` +
				figure(46, 128, 1, C.plum[1]) +
				figure(198, 122, 0.9),
		)
	},
	pipeline() {
		const o = { ox: 70, oy: 58, s: 9 }
		const belt = box({ ...o, x: 0, y: 0, z: 0, w: 14, d: 3, h: 0.8, color: C.gray })
		const colors = [C.orange, C.pink, C.teal, C.mustard]
		const items = colors.map((c, i) => box({ ...o, x: 0.6 + i * 3.4, y: 0.6, z: 0.8, w: 2, d: 2, h: 2, color: c }))
		return frame(scene([belt]) + scene(items) + figure(205, 132, 1, C.orange[1]))
	},
	diff() {
		const o = { ox: 120, oy: 95, s: 8 }
		const L = [0, 1, 2].map((i) => box({ ...o, x: -6, y: 0, z: i * 2.2, w: 3, d: 3, h: 2, color: i === 2 ? C.pink : C.cream }))
		const R = [0, 1, 2].map((i) => box({ ...o, x: 3, y: 0, z: i * 2.2, w: 3, d: 3, h: 2, color: i === 2 ? C.orange : C.cream }))
		return frame(
			scene(L) +
				scene(R) +
				`<path d="M104 30 q16 -14 32 0" fill="none" stroke="${INK}" stroke-width="1.8"/>` +
				`<polygon points="136,30 130,24 128,32" fill="${INK}"/>`,
		)
	},
	fiber() {
		const o = { ox: 136, oy: 36, s: 8 }
		const nodes = [
			[3, 0],
			[3, 4],
			[0, 8],
			[6, 8],
			[6, 12],
		].map(([x, y], i) => box({ ...o, x, y, z: 0, w: 2, d: 2, h: 2, color: [C.orange, C.pink, C.teal, C.mustard, C.plum][i] }))
		const link = (a, b, dash = '') => {
			const [x1, y1] = nodes[a].topCenter
			const [x2, y2] = nodes[b].topCenter
			return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="1.8" ${dash}/>`
		}
		return frame(link(0, 1) + link(1, 2) + link(2, 3, 'stroke-dasharray="4 3"') + link(3, 4) + scene(nodes))
	},
	chain() {
		const o = { ox: 92, oy: 60, s: 8 }
		const items = [0, 1, 2, 3].map((i) =>
			box({ ...o, x: i * 4, y: 0, z: 0, w: 2.4, d: 2.4, h: 2.4, color: [C.pink, C.teal, C.mustard, C.orange][i] }),
		)
		const links = items
			.slice(0, -1)
			.map((it, i) => {
				const [x1, y1] = it.topCenter
				const [x2, y2] = items[i + 1].topCenter
				return `<ellipse cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2 + 8}" rx="9" ry="5" fill="none" stroke="${INK}" stroke-width="2.2"/>`
			})
			.join('')
		return frame(scene(items) + links)
	},
	eye() {
		return frame(
			`<g transform="translate(120 76)" stroke="${INK}" stroke-width="2" stroke-linejoin="round">` +
				`<path d="M-62 4 Q-6 -46 62 -6 L66 2 Q4 40 -58 12 Z" fill="${C.gray[1]}"/>` +
				`<path d="M-64 -2 Q-6 -52 60 -12 Q4 34 -64 -2 Z" fill="#fffdf6"/>` +
				`<ellipse cx="-4" cy="-10" rx="20" ry="22" fill="${C.cream[1]}"/>` +
				`<ellipse cx="-4" cy="-10" rx="10" ry="12" fill="${INK}"/>` +
				`<circle cx="-8" cy="-14" r="3" fill="#fff" stroke="none"/>` +
				`</g>`,
		)
	},
	loop() {
		const o = { ox: 120, oy: 64, s: 8 }
		const cube = box({ ...o, x: -1.5, y: -1.5, z: 0, w: 3, d: 3, h: 3, color: C.teal })
		return frame(
			`<g fill="none" stroke="${INK}" stroke-width="2.2">` +
				`<path d="M70 92 A58 30 0 1 1 168 104"/>` +
				`</g>` +
				`<polygon points="168,104 156,110 172,94" fill="${C.orange[1]}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
				scene([cube]) +
				figure(60, 130, 1, C.pink[1]),
		)
	},
	bolt() {
		const bolt = 'M10 -50 L-14 2 L2 2 L-10 50 L22 -8 L6 -8 L18 -50 Z'
		return frame(
			`<g transform="translate(124 76) skewY(-8)" stroke="${INK}" stroke-width="2" stroke-linejoin="round">` +
				`<path d="${bolt}" transform="translate(7 5)" fill="${C.gray[1]}"/>` +
				`<path d="${bolt}" fill="${C.mustard[1]}"/>` +
				`<path d="M6 -42 L-6 -6" stroke="#fff3c4" stroke-width="3"/>` +
				`</g>`,
		)
	},
	list() {
		const o = { ox: 120, oy: 44, s: 8 }
		const rows = [0, 1, 2, 3].map((i) =>
			box({ ...o, x: i === 2 ? 2.5 : 0, y: i * 3, z: 0, w: 7, d: 2.2, h: 0.9, color: i === 2 ? C.orange : C.cream }),
		)
		return frame(scene(rows) + `<path d="M186 96 l14 -8" stroke="${INK}" stroke-width="2"/><polygon points="200,88 192,86 196,94" fill="${INK}"/>`)
	},
	browser() {
		const o = { ox: 176, oy: 70, s: 7 }
		const cubes = [
			box({ ...o, x: 0, y: 0, z: 0, w: 2, d: 2, h: 2, color: C.pink }),
			box({ ...o, x: -3, y: 3, z: 0, w: 2, d: 2, h: 2, color: C.teal }),
			box({ ...o, x: 3, y: 3, z: 0, w: 2, d: 2, h: 2, color: C.mustard }),
		]
		const link = (a, b) => `<line x1="${cubes[a].topCenter[0]}" y1="${cubes[a].topCenter[1]}" x2="${cubes[b].topCenter[0]}" y2="${cubes[b].topCenter[1]}" stroke="${INK}" stroke-width="1.8"/>`
		return frame(
			`<g stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">` +
				`<rect x="22" y="26" width="102" height="78" rx="8" fill="#fffdf6"/>` +
				`<path d="M22 34 a8 8 0 0 1 8 -8 h86 a8 8 0 0 1 8 8 v8 h-102 z" fill="${C.orange[1]}"/>` +
				`<circle cx="32" cy="34" r="2.6" fill="#fff"/><circle cx="41" cy="34" r="2.6" fill="#fff"/>` +
				`</g>` +
				`<text x="73" y="80" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="800" font-size="22" fill="${INK}">&lt;/&gt;</text>` +
				`<path d="M130 66 h18" stroke="${INK}" stroke-width="2"/><polygon points="150,66 143,62 143,70" fill="${INK}"/>` +
				link(0, 1) + link(0, 2) + scene(cubes) +
				figure(204, 132, 0.9, C.plum[1]),
		)
	},
	plane() {
		return frame(
			`<g stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">` +
				`<line x1="36" y1="56" x2="54" y2="64"/><line x1="44" y1="46" x2="60" y2="56"/><line x1="56" y1="40" x2="66" y2="50"/>` +
				`<polygon points="72,70 196,96 120,88" fill="${C.gray[0]}"/>` +
				`<polygon points="120,88 196,96 132,108" fill="${C.cream[1]}"/>` +
				`<polygon points="72,70 120,88 108,96" fill="${INK}"/>` +
				`</g>`,
		)
	},
}

export function illustration(name) {
	const fn = ILLUSTRATIONS[name] ?? ILLUSTRATIONS.robot
	return fn()
}

export const ILLUSTRATION_NAMES = Object.keys(ILLUSTRATIONS)
