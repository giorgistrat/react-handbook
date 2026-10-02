// Exports every note as an A4 PDF (plus one combined PDF) using the locally
// installed Google Chrome.
//
//   npm run build && node scripts/export-pdf.mjs [outDir]
//
// Pages are served from dist/; links inside the PDFs point to the live site.

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { PDFDocument } from 'pdf-lib'
import { NOTES } from '../src/lib/notes-meta.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const DIST = path.join(ROOT, 'dist')
const BASE = '/react-internals/'
const LIVE = 'https://giorgistrat.github.io'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, 'pdf'))

if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/ is missing: run `npm run build` first')

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' }

const server = http.createServer((req, res) => {
	let url = decodeURIComponent(new URL(req.url, 'http://x').pathname)
	if (!url.startsWith(BASE)) return res.writeHead(404).end()
	let file = path.join(DIST, url.slice(BASE.length))
	if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
	if (!file.startsWith(DIST) || !fs.existsSync(file)) return res.writeHead(404).end()
	res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
	fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
fs.mkdirSync(OUT, { recursive: true })
const written = []

try {
	for (const [i, note] of NOTES.entries()) {
		const page = await browser.newPage()
		await page.setViewport({ width: 900, height: 1200 })
		await page.goto(`${origin}${BASE}notes/${note.slug}/`, { waitUntil: 'networkidle0' })
		await page.evaluate(async (live) => {
			await document.fonts.ready
			// Mermaid renders asynchronously
			for (let t = 0; t < 100; t++) {
				const pending = [...document.querySelectorAll('pre.mermaid')].some((p) => !p.querySelector('svg'))
				if (!pending) break
				await new Promise((r) => setTimeout(r, 100))
			}
			// Static versions of the interactive bits
			document.querySelectorAll('details').forEach((d) => (d.open = true))
			document.querySelectorAll('[data-walker] [data-act="next"]').forEach((btn) => {
				for (let k = 0; k < 20; k++) btn.click()
			})
			document.querySelectorAll('[data-tabs]').forEach((root) => {
				const names = [...root.querySelectorAll('[data-tab]')].map((b) => b.textContent)
				root.querySelectorAll('[data-panel]').forEach((p) => {
					p.hidden = false
					p.insertAdjacentHTML('afterbegin', `<div class="ld-title">${names[+p.dataset.panel]}</div>`)
				})
			})
			// Links should work from the iPad, so point them at the live site
			document.querySelectorAll('a[href]').forEach((a) => {
				const url = new URL(a.getAttribute('href'), location.href)
				if (url.origin === location.origin) a.href = live + url.pathname + url.hash
			})
		}, LIVE)

		const title = await page.$eval('h1', (h) => h.textContent.trim())
		const file = path.join(OUT, `${String(i).padStart(2, '0')} - ${title.replace(/[/:]/g, '-')}.pdf`)
		await page.pdf({
			path: file,
			format: 'A4',
			printBackground: true,
			preferCSSPageSize: true,
			displayHeaderFooter: true,
			headerTemplate: '<span></span>',
			footerTemplate: `<div style="width:100%;font:8px Helvetica,Arial,sans-serif;color:#888;padding:0 15mm;display:flex;justify-content:space-between"><span>React Internals · ${title}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
		})
		await page.close()
		written.push(file)
		console.log(`✓ ${path.basename(file)}`)
	}

	const merged = await PDFDocument.create()
	merged.setTitle('React Internals')
	for (const file of written) {
		const doc = await PDFDocument.load(fs.readFileSync(file))
		const pages = await merged.copyPages(doc, doc.getPageIndices())
		pages.forEach((p) => merged.addPage(p))
	}
	const all = path.join(OUT, 'React Internals - all notes.pdf')
	fs.writeFileSync(all, await merged.save())
	console.log(`✓ ${path.basename(all)} (${merged.getPageCount()} pages)`)
} finally {
	await browser.close()
	server.close()
}
