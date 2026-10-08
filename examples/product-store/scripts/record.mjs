// Runs every lesson in Chrome and records what really happens: the app's
// log() lines, React's console warnings, URLs, request bodies, DOM state and
// TypeScript errors. The handbook embeds these instead of hand-written output.
//
//   node scripts/record.mjs [module…]   → generated/<module>.json (default: every module)

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUT = path.join(ROOT, 'generated')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 5199
const ORIGIN = `http://localhost:${PORT}`

// What the server receives when a form POSTs to /submitted.html
let lastPost = null
const capturePosts = {
	name: 'capture-posts',
	configureServer(s) {
		s.middlewares.use('/submitted.html', (req, res, next) => {
			if (req.method !== 'POST') return next()
			const chunks = []
			req.on('data', (c) => chunks.push(c))
			req.on('end', () => {
				const body = Buffer.concat(chunks).toString('utf8')
				lastPost = {
					contentType: req.headers['content-type'].replace(/boundary=.*/, 'boundary=…'),
					// multipart boundaries are random: show them as ----boundary
					body: body.replace(/-{4,}[\w-]+/g, '------boundary').replace(/\r\n/g, '\n').trim(),
					containsFileBytes: body.includes('<svg'),
				}
				res.setHeader('content-type', 'text/html')
				res.end('<p>received</p>')
			})
		})
	},
}

const server = await createServer({ root: ROOT, logLevel: 'silent', plugins: [capturePosts], server: { port: PORT, strictPort: true } })
await server.listen()
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })

// Record console.error / console.warn with their %s arguments filled in (React's
// warnings use format strings), before any app code runs.
const CAPTURE = () => {
	window.__console = []
	for (const level of ['error', 'warn']) {
		const orig = console[level]
		console[level] = (...args) => {
			let text = typeof args[0] === 'string' ? args[0] : String(args[0])
			let i = 1
			text = text.replace(/%[sdoO]/g, () => String(args[i++]))
			window.__console.push({ level, text: [text, ...args.slice(i).filter((a) => typeof a === 'string')].join(' ') })
			orig.apply(console, args)
		}
	}
}

async function open(lesson, scenario) {
	const page = await browser.newPage()
	await page.evaluateOnNewDocument(CAPTURE)
	const q = `?lesson=${lesson}${scenario ? `&scenario=${scenario}` : ''}`
	await page.goto(`${ORIGIN}/${q}`, { waitUntil: 'networkidle0' })
	await new Promise((r) => setTimeout(r, 150))
	return page
}

const logs = (page) => page.evaluate(() => window.__log ?? [])
// React's dev warnings, first line only (the component stack follows)
const warnings = (page) => page.evaluate(() => (window.__console ?? []).map((c) => c.text.split('\n')[0].trim()))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function run(lesson, scenario, act) {
	const page = await open(lesson, scenario)
	const extra = act ? await act(page) : {}
	const result = { logs: await logs(page).catch(() => []), warnings: await warnings(page).catch(() => []), ...extra }
	await page.close()
	return result
}

async function fillSeller(page) {
	await page.type('#store', 'Mugs & More')
	await page.type('#email', 'sam@example.com')
	await page.type('#password', 'hunter2')
	const file = await page.$('#logo')
	await file.uploadFile(path.join(ROOT, 'public/logo.svg'))
}

async function capturePost(page, click) {
	lastPost = null
	await Promise.all([page.waitForNavigation(), click()])
	return lastPost
}

const rows = (page) => page.$$eval('.cart li', (lis) => lis.map((li) => ({ item: li.querySelector('span').textContent, note: li.querySelector('input').value })))

async function recordFundamentals() {
	const data = {}

data.dom = {
	card: await run('fundamentals/01-dom'),
	escape: await run('fundamentals/01-dom', 'escape', async () => (await wait(500), {})),
}
data.createElement = await run('fundamentals/02-create-element')
// the logged objects, parsed back for pretty printing
data.createElement.element = JSON.parse(data.createElement.logs[0].replace(/^element: /, ''))
data.createElement.keyed = JSON.parse(data.createElement.logs[2].replace(/^keyed element: /, ''))
data.jsx = await run('fundamentals/03-jsx')
data.components = {
	rerender: await run('fundamentals/04-components'),
	called: await run('fundamentals/04-components', 'called'),
	element: await run('fundamentals/04-components', 'element'),
}
data.typescript = {
	...(await run('fundamentals/05-typescript')),
	tscErrors: (() => {
		try {
			execFileSync('npx', ['tsc', '--ignoreConfig', '--noEmit', '--strict', '--jsx', 'react-jsx', '--moduleResolution', 'bundler', '--module', 'esnext', '--target', 'es2022', '--lib', 'es2022,dom', '--types', 'vite/client', '--skipLibCheck', 'src/lessons/fundamentals/05-typescript.bad.tsx'], { cwd: ROOT, encoding: 'utf8' })
			return []
		} catch (e) {
			return e.stdout.trim().split('\n').map((l) => l.replace('src/lessons/fundamentals/', ''))
		}
	})(),
}
data.styling = await run('fundamentals/06-styling')

data.forms = {
	get: await run('fundamentals/07-forms', 'get', async (page) => {
		await fillSeller(page)
		await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')])
		return { url: page.url().replace(ORIGIN, '') }
	}),
	postPlain: await run('fundamentals/07-forms', 'post-plain', async (page) => {
		await fillSeller(page)
		return { request: await capturePost(page, () => page.click('button[type=submit]')) }
	}),
	post: await run('fundamentals/07-forms', 'post', async (page) => {
		await fillSeller(page)
		return { request: await capturePost(page, () => page.click('button[type=submit]')) }
	}),
	action: await run('fundamentals/07-forms', 'action', async (page) => {
		await fillSeller(page)
		const before = page.url()
		await page.click('button[type=submit]')
		await wait(200)
		return {
			sameUrl: page.url() === before,
			afterSubmit: await page.$eval('#store', (i) => i.value),
		}
	}),
}

data.inputs = {
	untouched: await run('fundamentals/08-inputs', null, async (page) => (await page.click('button[type=submit]'), await wait(150), {})),
	filled: await run('fundamentals/08-inputs', null, async (page) => {
		await page.select('#size', 'large')
		await page.click('input[name=rating][value="5"]')
		await page.click('input[name=recommend]')
		await page.click('button[type=submit]')
		await wait(150)
		return {}
	}),
	controlled: await run('fundamentals/08-inputs', 'controlled', async (page) => {
		await page.type('#pinned', 'XYZ')
		await page.type('#prefilled', ' XL')
		return { typed: { pinned: await page.$eval('#pinned', (i) => i.value), prefilled: await page.$eval('#prefilled', (i) => i.value) } }
	}),
}

data.errors = {
	noBoundary: await run('fundamentals/09-error-boundaries', 'no-boundary', async (page) => ({ rootHtml: await page.$eval('#root', (r) => r.innerHTML) })),
	boundary: await run('fundamentals/09-error-boundaries', 'boundary', async (page) => ({ text: await page.$eval('#root', (r) => r.innerText.trim().split('\n').filter(Boolean)) })),
	reset: await run('fundamentals/09-error-boundaries', 'reset', async (page) => {
		const before = await page.$eval('#root', (r) => r.innerText.trim().split('\n').filter(Boolean))
		await page.click('[role=alert] button')
		await wait(150)
		await page.type('#note', 'Ship fast')
		return { before, after: await page.$eval('#root', (r) => r.innerText.trim().split('\n').filter(Boolean)) }
	}),
	unsafe: await run('fundamentals/09-error-boundaries', 'events', async (page) => {
		await page.click('#unsafe')
		await wait(150)
		return { fallbackShown: Boolean(await page.$('[role=alert]')) }
	}),
	safe: await run('fundamentals/09-error-boundaries', 'events', async (page) => {
		await page.click('#safe')
		await wait(150)
		return { fallbackShown: Boolean(await page.$('[role=alert]')), text: await page.$eval('#root', (r) => r.innerText.trim().split('\n').filter(Boolean)) }
	}),
}

const removeFirst = async (page) => {
	await page.type('.cart li:first-child input', 'Gift wrap, please')
	const before = await rows(page)
	await page.click('.cart li:first-child button')
	await wait(150)
	return { before, after: await rows(page) }
}
data.arrays = {
	none: await run('fundamentals/10-arrays', 'none', removeFirst),
	index: await run('fundamentals/10-arrays', 'index', removeFirst),
	id: await run('fundamentals/10-arrays', 'id', removeFirst),
	reset: await run('fundamentals/10-arrays', 'reset', async (page) => {
		await page.type('#coupon', 'SAVE10')
		const before = await page.$eval('#coupon', (i) => i.value)
		await page.click('#clear')
		await wait(100)
		return { before, after: await page.$eval('#coupon', (i) => i.value) }
	}),
}
	return data
}

// Log lines added since the last call (to split one page's log into phases)
const since = async (page) => {
	const all = await logs(page)
	const seen = page.__seen ?? 0
	page.__seen = all.length
	return all.slice(seen)
}

async function recordHooks() {
	const H = (lesson) => `hooks/${lesson}`
	const value = (page, sel) => page.$eval(sel, (el) => el.value)
	const text = (page, sel) => page.$eval(sel, (el) => el.textContent)
	const data = {}

	const searchFlow = async (page) => {
		await page.type('#search', 'lamp')
		await page.click('input[name=office]')
		await wait(100)
		const afterCheckbox = { input: await value(page, '#search'), officeChecked: await page.$eval('input[name=office]', (c) => c.checked), results: await text(page, '#results') }
		await page.$eval('#search', (el) => (el.focus(), el.select())) // select everything typed so far
		await page.keyboard.press('Backspace')
		await page.type('#search', 'audio')
		await wait(100)
		return { afterCheckbox, typedAudio: { audioChecked: await page.$eval('input[name=audio]', (c) => c.checked), results: await text(page, '#results') } }
	}
	data.search = {
		uncontrolled: await run(H('01-search'), 'uncontrolled', searchFlow),
		controlled: await run(H('01-search'), 'controlled', searchFlow),
		eager: await run(H('01-search'), 'eager&query=mug', async (page) => (await page.type('#search', ' xl'), { value: await value(page, '#search') })),
		lazy: await run(H('01-search'), 'lazy&query=mug', async (page) => (await page.type('#search', ' xl'), { value: await value(page, '#search') })),
	}

	const backButton = async (page) => {
		for (let i = 0; i < 6; i++) await page.click('#show') // 3 × hide + show
		await since(page)
		await page.evaluate(() => {
			history.pushState({}, '', location.search + '&query=lamp')
			history.back()
		})
		await wait(300)
		return { afterBack: await since(page), input: await value(page, '#search') }
	}
	data.effects = {
		leak: await run(H('02-effects'), 'leak', backButton),
		cleanup: await run(H('02-effects'), 'cleanup', backButton),
	}

	data.lifecycle = {
		normal: await run(H('03-lifecycle'), null, async (page) => {
			await wait(200)
			const mount = await since(page)
			await page.click('#add')
			await wait(200)
			const update = await since(page)
			await page.click('#close')
			await wait(200)
			return { mount, update, unmount: await since(page) }
		}),
		strict: await run(H('03-lifecycle'), 'strict', async (page) => (await wait(200), { mount: await since(page) })),
	}

	const heart = async (page, id) => {
		await since(page)
		await page.click(`li[data-id=${id}] button`)
		await wait(100)
		return since(page)
	}
	const favoriteFlow = async (page) => {
		await wait(100)
		const click = await heart(page, 'p3')
		const order = await page.$$eval('li', (lis) => lis.map((l) => l.textContent))
		await page.type('#search', 'mug') // Trail Backpack is filtered out…
		await wait(100)
		for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace') // …and comes back
		await wait(100)
		return { click, order, backpackAfterFilter: await page.$eval('li[data-id=p3]', (li) => li.textContent) }
	}
	data.lifting = {
		lifted: await run(H('04-lifting'), 'lifted', favoriteFlow),
		colocated: await run(H('04-lifting'), 'colocated', favoriteFlow),
	}

	const zoomFlow = async (page) => {
		await wait(100)
		const mount = await since(page)
		await page.click('#qty')
		await page.click('#qty')
		await wait(100)
		const unrelated = await since(page)
		await page.click('#bigger')
		await wait(100)
		return { mount, unrelated, scaleChanged: await since(page) }
	}
	data.refs = {
		callback: await run(H('05-refs'), 'callback', zoomFlow),
		object: await run(H('05-refs'), 'object', zoomFlow),
		primitives: await run(H('05-refs'), 'primitives', zoomFlow),
	}

	const labelFlow = async (page) => {
		const ids = await page.$$eval('form', (forms) => forms.map((f) => [...f.querySelectorAll('input')].map((i) => i.id)))
		const labels = await page.$$('form:nth-of-type(2) label')
		await labels[1].click() // "Your name" in the Desk Lamp form
		const focused = await page.evaluate(() => {
			const el = document.activeElement
			return { form: el.closest('form')?.dataset.product, field: el.getAttribute('name') }
		})
		return { ids, clickedLabel: 'Desk Lamp form → "Your name"', focused }
	}
	data.useId = {
		hardcoded: await run(H('06-useid'), 'hardcoded', labelFlow),
		useId: await run(H('06-useid'), null, labelFlow),
	}

	data.cart = {
		stale: await run(H('07-cart'), 'stale', async (page) => (await page.click('#add2'), await wait(100), { button: await text(page, '#add2') })),
		updater: await run(H('07-cart'), 'updater', async (page) => (await page.click('#add2'), await wait(100), { button: await text(page, '#add2') })),
		mutate: await run(H('07-cart'), 'mutate', async (page) => (await page.click('#addItem'), await page.click('#addItem'), await wait(100), { button: await text(page, '#addItem') })),
		saved: await run(H('07-cart'), 'saved', async (page) => {
			await page.evaluate(() => localStorage.removeItem('cart'))
			await page.reload({ waitUntil: 'networkidle0' })
			await page.click('#mug')
			await page.click('#lamp')
			await page.click('#mug')
			await wait(100)
			const afterAdds = await text(page, '#items')
			await page.click('#undo')
			await wait(100)
			const afterUndo = await text(page, '#items')
			await page.click('#lamp')
			await wait(100)
			const afterNewAdd = await text(page, '#items')
			const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('cart')))
			await page.reload({ waitUntil: 'networkidle0' })
			const afterReloadItems = await text(page, '#items')
			await page.click('#mug') // a re-render: does readSavedCart run again?
			await wait(100)
			const afterReload = await logs(page)
			await page.evaluate(() => localStorage.removeItem('cart'))
			return { afterAdds, afterUndo, afterNewAdd, stored, afterReloadItems, logsAfterReloadAndClick: afterReload }
		}),
	}

	data.reducer = {
		states: await run(H('08-reducer'), 'states', async () => (await wait(300), {})),
		reducer: await run(H('08-reducer'), null, async () => (await wait(300), {})),
	}

	const addOnce = async (page) => {
		await wait(100)
		await since(page)
		await page.click('#add')
		await wait(100)
		return { click: await since(page) }
	}
	data.rerender = {
		unstable: await run(H('09-rerender'), null, addOnce),
		stable: await run(H('09-rerender'), 'stable', addOnce),
		timerStale: await run(H('09-rerender'), 'timer-stale', async (page) => (await wait(1000), { text: await text(page, '#timer') })),
		timerFixed: await run(H('09-rerender'), 'timer-fixed', async (page) => (await wait(1000), { text: await text(page, '#timer') })),
		inner: await run(H('09-rerender'), 'inner', async (page) => {
			await page.type('#inner', 'mug')
			const before = await value(page, '#inner')
			await page.click('#bump')
			await wait(100)
			return { before, after: await value(page, '#inner') }
		}),
	}
	return data
}

async function recordApis() {
	const P = (lesson) => `apis/${lesson}`
	const text = (page, sel) => page.$eval(sel, (el) => el.textContent)
	const data = {}

	const click = async (page, sel) => {
		await since(page)
		await page.click(sel)
		await wait(100)
		return since(page)
	}

	data.reducer = {
		pure: await run(P('01-reducer'), 'pure'),
		clicks: await run(P('01-reducer'), null, async (page) => {
			await wait(100)
			const mount = await since(page)
			const addMug = await click(page, '#add-mug')
			const addMugAgain = await click(page, '#add-mug')
			const addLamp = await click(page, '#add-lamp')
			const removeMissing = await click(page, '#remove-backpack')
			const summary = await text(page, '#summary')
			const clear = await click(page, '#clear')
			const clearAgain = await click(page, '#clear')
			return { mount, addMug, addMugAgain, addLamp, removeMissing, summary, clear, clearAgain }
		}),
		saved: await run(P('01-reducer'), 'saved', async (page) => {
			await wait(100)
			const mount = await since(page)
			const add1 = await click(page, '#add-mug')
			const add2 = await click(page, '#add-mug')
			return { mount, add1, add2, summary: await text(page, '#summary') }
		}),
		eager: await run(P('01-reducer'), 'eager', async (page) => {
			await wait(100)
			const mount = await since(page)
			const add1 = await click(page, '#add-mug')
			const add2 = await click(page, '#add-mug')
			return { mount, add1, add2 }
		}),
		typo: await run(P('01-reducer'), 'typo', async (page) => {
			await page.click('#typo')
			await wait(150)
			return { shown: await text(page, '#root') }
		}),
	}

	const contextFlow = async (page) => {
		await wait(100)
		const mount = await since(page)
		const theme = await click(page, '#theme')
		const classes = await page.$$eval('article', (as) => as.map((a) => a.className))
		const add = await click(page, '#add')
		return { mount, theme, classes, add, badge: await text(page, '#badge') }
	}
	data.context = {
		stable: await run(P('02-context'), null, contextFlow),
		unstable: await run(P('02-context'), 'unstable', contextFlow),
		noProvider: await run(P('02-context'), 'no-provider', async (page) => ({
			article: await page.$eval('article', (a) => a.className),
			sale: await page.$eval('.tag', (t) => t.className),
			alert: await text(page, '[role=alert]'),
		})),
	}

	const portalFlow = async (page) => {
		await page.click('#open')
		await wait(100)
		await since(page)
		const where = await page.evaluate(() => {
			const dialog = document.querySelector('[role=dialog]')
			const close = document.querySelector('#close').getBoundingClientRect()
			const card = document.querySelector('.clip-card').getBoundingClientRect()
			const hit = document.elementFromPoint(close.x + close.width / 2, close.y + close.height / 2)
			const parent = dialog.parentElement
			return {
				parent: parent.tagName.toLowerCase() + (parent.className ? `.${parent.className}` : ''),
				closeButtonVisible: hit?.id === 'close',
				card: { bottom: Math.round(card.bottom), right: Math.round(card.right) },
				close: { top: Math.round(close.top), left: Math.round(close.left) },
				themeClass: dialog.className,
			}
		})
		await page.$eval('#close', (b) => b.click()) // a real click event on the button, wherever it is
		await wait(100)
		return { where, clickClose: await since(page), dialogGone: !(await page.$('[role=dialog]')) }
	}
	data.portal = {
		inline: await run(P('03-portal'), null, portalFlow),
		portal: await run(P('03-portal'), 'portal', portalFlow),
	}

	const hoverTrials = async (page) => {
		const trials = []
		for (let i = 0; i < 20; i++) {
			await page.mouse.move(400, 400)
			await wait(150)
			await since(page)
			await page.hover('#info')
			await wait(450)
			trials.push(await since(page))
		}
		const count = new Map()
		for (const t of trials) count.set(t.join('\n'), (count.get(t.join('\n')) ?? 0) + 1)
		const typical = [...count].sort((a, b) => b[1] - a[1])[0][0].split('\n')
		const wrong = trials.filter((t) => t.some((l) => l.includes('covering'))).length
		return { trials, typical, wrongFrames: wrong, summary: `${wrong} of ${trials.length} hovers painted the tooltip covering the button` }
	}
	data.layout = {
		effect: await run(P('04-layout-effect'), 'effect', hoverTrials),
		layout: await run(P('04-layout-effect'), null, hoverTrials),
	}

	const applyTwice = async (page) => {
		const first = await click(page, '#apply')
		await page.click('body', { offset: { x: 5, y: 300 } }) // focus leaves the field
		await wait(100)
		await since(page)
		const second = await click(page, '#apply')
		return { first, second, focused: await page.evaluate(() => document.activeElement.id || document.activeElement.tagName.toLowerCase()) }
	}
	data.imperative = {
		flag: await run(P('05-imperative'), 'flag', applyTwice),
		handle: await run(P('05-imperative'), null, applyTwice),
		inspect: await run(P('05-imperative'), 'inspect', async () => (await wait(100), {})),
	}

	data.flushSync = {
		rename: await run(P('06-flush-sync'), 'rename', async (page) => ({ click: await click(page, '#edit') })),
		renameSync: await run(P('06-flush-sync'), 'rename-sync', async (page) => ({ click: await click(page, '#edit') })),
		list: await run(P('06-flush-sync'), 'list', async (page) => ({ click: await click(page, '#add') })),
		listSync: await run(P('06-flush-sync'), 'list-sync', async (page) => ({ click: await click(page, '#add') })),
	}

	data.store = {
		online: await run(P('07-external-store'), null, async (page) => {
			const before = await text(page, 'button')
			await page.setOfflineMode(true)
			await wait(150)
			const offline = { text: await text(page, 'button'), disabled: await page.$eval('button', (b) => b.disabled) }
			await page.setOfflineMode(false)
			await wait(150)
			return { before, offline, back: await text(page, 'button') }
		}),
		twoRoots: await run(P('07-external-store'), 'store', async (page) => {
			await wait(100)
			const mount = await since(page)
			const add = await click(page, '#add')
			return { mount, add, badge: await text(page, '#badge') }
		}),
		newObject: await run(P('07-external-store'), 'new-object', async () => (await wait(300), {})),
		server: await run(P('07-external-store'), 'server'),
	}
	return data
}

async function recordPatterns() {
	const P = (lesson) => `patterns/${lesson}`
	const text = (page, sel) => page.$eval(sel, (el) => el.textContent)
	const checked = (page, sel) => page.$eval(sel, (el) => el.getAttribute('aria-checked'))
	const click = async (page, sel) => {
		await since(page)
		await page.click(sel)
		await wait(100)
		return since(page)
	}
	const data = {}

	const pick = async (page) => {
		await wait(100)
		const mount = await since(page)
		await page.click('li:nth-child(4) button') // Desk Lamp
		await wait(100)
		return { mount, details: await text(page, '#details') }
	}
	data.composition = {
		drilled: await run(P('01-composition'), 'drilled', pick),
		composed: await run(P('01-composition'), null, pick),
	}

	const typeNote = async (page) => {
		await page.select('#product', 'Desk Lamp')
		await wait(100)
		await since(page)
		await page.type('#note', 'Gift', { delay: 60 }) // faster than the 300 ms debounce
		await wait(800)
		return { saves: await since(page) }
	}
	// the interval ticks every 200 ms, so collapse repeats ("… (repeats)")
	const collapse = (lines) => lines.filter((l, i) => l !== lines[i - 1]).map((l) => (lines.filter((x) => x === l).length > 1 ? `${l}   (repeats)` : l))
	const watch = async (page) => {
		await wait(330)
		const before = collapse(await since(page))
		await page.click('#switch')
		await wait(450)
		return { before, after: collapse(await since(page)) }
	}
	data.latestRef = {
		rebuild: await run(P('02-latest-ref'), 'rebuild', typeNote),
		once: await run(P('02-latest-ref'), 'once', typeNote),
		latest: await run(P('02-latest-ref'), null, typeNote),
		watchStale: await run(P('02-latest-ref'), 'watch-stale', watch),
		watchRestart: await run(P('02-latest-ref'), 'watch-restart', watch),
		watchEvent: await run(P('02-latest-ref'), 'watch-event', watch),
	}

	const flip = async (page) => {
		const before = await text(page, '.note')
		await page.click('[role=switch]')
		await wait(100)
		return { before, after: await text(page, '.note'), switch: await checked(page, '[role=switch]') }
	}
	data.compound = {
		context: await run(P('03-compound'), null, flip),
		clone: await run(P('03-compound'), 'clone', flip),
		outside: await run(P('03-compound'), 'outside', async (page) => ({ alerts: await page.$$eval('[role=alert]', (as) => as.map((a) => a.textContent)) })),
	}

	const wiring = (page) =>
		page.evaluate(() => {
			const a = (sel, name) => document.querySelector(sel)?.getAttribute(name) ?? null
			const label = document.querySelector('label')
			const input = document.querySelector('input')
			const describedBy = a('input', 'aria-describedby')
			return {
				'label for': a('label', 'for'),
				'input id': a('input', 'id'),
				'input aria-describedby': describedBy,
				'description id': a('span', 'id'),
				'aria-describedby points to': describedBy ? document.getElementById(describedBy)?.textContent ?? '(nothing)' : '(not set)',
				'label for === input id': label.htmlFor === input.id,
			}
		})
	data.slots = {
		slots: await run(P('04-slots'), null, async (page) => {
			const field = await wiring(page)
			await page.click('label') // clicking the email label…
			const focused = await page.evaluate(() => document.activeElement.tagName.toLowerCase() + '#' + document.activeElement.id)
			const shown = () => page.$$eval('span', (ss) => ss.slice(1).map((s) => `${s.textContent}${s.hidden ? ' (hidden)' : ''}`))
			const toggleLabel = await page.evaluate(() => document.querySelectorAll('label')[1].htmlFor === document.querySelector('[role=switch]').id)
			const before = await shown()
			await page.click('[role=switch]')
			await wait(100)
			return { field, labelClickFocused: focused, toggleLabelMatchesSwitch: toggleLabel, before, after: await shown() }
		}),
		typo: await run(P('04-slots'), 'typo', async (page) => ({ field: await wiring(page) })),
	}

	const clickTwice = async (page) => {
		const states = []
		for (let i = 0; i < 2; i++) {
			await page.click('[role=switch]')
			await wait(100)
			states.push(`${await text(page, '[role=switch]')} (aria-checked=${await checked(page, '[role=switch]')})`)
		}
		return { afterEachClick: states }
	}
	data.propGetters = {
		spreadFirst: await run(P('05-prop-getters'), 'spread-first', clickTwice),
		spreadLast: await run(P('05-prop-getters.bad'), null, clickTwice),
		getter: await run(P('05-prop-getters'), null, async (page) => ({ ...(await clickTwice(page)), id: await page.$eval('[role=switch]', (b) => b.id) })),
		tscErrors: (() => {
			try {
				execFileSync('npx', ['tsc', '--ignoreConfig', '--noEmit', '--strict', '--jsx', 'react-jsx', '--moduleResolution', 'bundler', '--module', 'esnext', '--target', 'es2022', '--lib', 'es2022,dom', '--types', 'vite/client', '--skipLibCheck', 'src/lessons/patterns/05-prop-getters.bad.tsx'], { cwd: ROOT, encoding: 'utf8' })
				return []
			} catch (e) {
				return e.stdout.trim().split('\n').map((l) => l.replace('src/lessons/patterns/', ''))
			}
		})(),
	}

	const resetFlow = async (page) => {
		const steps = [`mount (setting on): ${await checked(page, '#gift')}`]
		await page.click('#gift')
		await wait(100)
		steps.push(`click switch: ${await checked(page, '#gift')}`)
		await page.click('#setting')
		await wait(100)
		steps.push(`untick "by default": ${await checked(page, '#gift')}`)
		await page.click('#reset')
		await wait(100)
		steps.push(`click Reset: ${await checked(page, '#gift')}`)
		return { steps }
	}
	data.initializer = {
		plain: await run(P('06-state-initializer'), 'plain', resetFlow),
		stable: await run(P('06-state-initializer'), null, resetFlow),
	}

	data.stateReducer = await run(P('07-state-reducer'), null, async (page) => {
		await wait(100)
		const mount = await since(page)
		const toggleBefore = await click(page, '#gift')
		const place = await click(page, '#place')
		const toggleAfter = await click(page, '#gift')
		return { mount, toggleBefore, place, toggleAfter, final: await checked(page, '#gift') }
	})

	const both = async (page) => `cart: ${await checked(page, '#cart')}, checkout: ${await checked(page, '#checkout')}`
	data.controlProps = await run(P('08-control-props'), null, async (page) => {
		await wait(100)
		const mount = await since(page)
		const clickCart = await click(page, '#cart')
		const afterCart = await both(page)
		const clickNewsletter = await click(page, '#newsletter')
		const newsletter = await checked(page, '#newsletter')
		const place = await click(page, '#place')
		const clickCheckout = await click(page, '#checkout')
		return { mount, clickCart, afterCart, clickNewsletter, newsletter, place, clickCheckout, final: await both(page) }
	})
	return data
}

const MODULES = { fundamentals: recordFundamentals, hooks: recordHooks, apis: recordApis, patterns: recordPatterns }
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(MODULES)
fs.mkdirSync(OUT, { recursive: true })
try {
	for (const name of wanted) {
		const data = await MODULES[name]()
		fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(data, null, 2) + '\n')
		console.log(`Recorded ${name} → generated/${name}.json`)
	}
} finally {
	await browser.close()
	await server.close()
}

