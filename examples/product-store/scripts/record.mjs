// Runs every lesson in Chrome and records what really happens: the app's
// log() lines, React's console warnings, URLs, request bodies, DOM state and
// TypeScript errors. The handbook embeds these instead of hand-written output.
//
//   node scripts/record.mjs          → generated/fundamentals.json

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
	const q = `?lesson=fundamentals/${lesson}${scenario ? `&scenario=${scenario}` : ''}`
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

const data = {}

data.dom = {
	card: await run('01-dom'),
	escape: await run('01-dom', 'escape', async () => (await wait(500), {})),
}
data.createElement = await run('02-create-element')
// the logged objects, parsed back for pretty printing
data.createElement.element = JSON.parse(data.createElement.logs[0].replace(/^element: /, ''))
data.createElement.keyed = JSON.parse(data.createElement.logs[2].replace(/^keyed element: /, ''))
data.jsx = await run('03-jsx')
data.components = {
	rerender: await run('04-components'),
	called: await run('04-components', 'called'),
	element: await run('04-components', 'element'),
}
data.typescript = {
	...(await run('05-typescript')),
	tscErrors: (() => {
		try {
			execFileSync('npx', ['tsc', '--ignoreConfig', '--noEmit', '--strict', '--jsx', 'react-jsx', '--moduleResolution', 'bundler', '--module', 'esnext', '--target', 'es2022', '--lib', 'es2022,dom', '--types', 'vite/client', '--skipLibCheck', 'src/lessons/fundamentals/05-typescript.bad.tsx'], { cwd: ROOT, encoding: 'utf8' })
			return []
		} catch (e) {
			return e.stdout.trim().split('\n').map((l) => l.replace('src/lessons/fundamentals/', ''))
		}
	})(),
}
data.styling = await run('06-styling')

data.forms = {
	get: await run('07-forms', 'get', async (page) => {
		await fillSeller(page)
		await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')])
		return { url: page.url().replace(ORIGIN, '') }
	}),
	postPlain: await run('07-forms', 'post-plain', async (page) => {
		await fillSeller(page)
		return { request: await capturePost(page, () => page.click('button[type=submit]')) }
	}),
	post: await run('07-forms', 'post', async (page) => {
		await fillSeller(page)
		return { request: await capturePost(page, () => page.click('button[type=submit]')) }
	}),
	action: await run('07-forms', 'action', async (page) => {
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
	untouched: await run('08-inputs', null, async (page) => (await page.click('button[type=submit]'), await wait(150), {})),
	filled: await run('08-inputs', null, async (page) => {
		await page.select('#size', 'large')
		await page.click('input[name=rating][value="5"]')
		await page.click('input[name=recommend]')
		await page.click('button[type=submit]')
		await wait(150)
		return {}
	}),
	controlled: await run('08-inputs', 'controlled', async (page) => {
		await page.type('#pinned', 'XYZ')
		await page.type('#prefilled', ' XL')
		return { typed: { pinned: await page.$eval('#pinned', (i) => i.value), prefilled: await page.$eval('#prefilled', (i) => i.value) } }
	}),
}

data.errors = {
	noBoundary: await run('09-error-boundaries', 'no-boundary', async (page) => ({ rootHtml: await page.$eval('#root', (r) => r.innerHTML) })),
	boundary: await run('09-error-boundaries', 'boundary', async (page) => ({ text: await page.$eval('#root', (r) => r.innerText.trim().split('\n').filter(Boolean)) })),
	reset: await run('09-error-boundaries', 'reset', async (page) => {
		const before = await page.$eval('#root', (r) => r.innerText.trim().split('\n').filter(Boolean))
		await page.click('[role=alert] button')
		await wait(150)
		await page.type('#note', 'Ship fast')
		return { before, after: await page.$eval('#root', (r) => r.innerText.trim().split('\n').filter(Boolean)) }
	}),
	unsafe: await run('09-error-boundaries', 'events', async (page) => {
		await page.click('#unsafe')
		await wait(150)
		return { fallbackShown: Boolean(await page.$('[role=alert]')) }
	}),
	safe: await run('09-error-boundaries', 'events', async (page) => {
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
	none: await run('10-arrays', 'none', removeFirst),
	index: await run('10-arrays', 'index', removeFirst),
	id: await run('10-arrays', 'id', removeFirst),
	reset: await run('10-arrays', 'reset', async (page) => {
		await page.type('#coupon', 'SAVE10')
		const before = await page.$eval('#coupon', (i) => i.value)
		await page.click('#clear')
		await wait(100)
		return { before, after: await page.$eval('#coupon', (i) => i.value) }
	}),
}

await browser.close()
await server.close()
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'fundamentals.json'), JSON.stringify(data, null, 2) + '\n')
console.log('Recorded → generated/fundamentals.json')
