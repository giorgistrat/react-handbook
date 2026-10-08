// Exports every note as an A4 PDF, one folder per module plus one combined
// PDF per module, using the locally installed Google Chrome.
//
//   npm run build && node scripts/export-pdf.mjs [outDir]   (default: ~/Desktop/React Handbook PDFs)
//
// Pages are served from dist/; links inside the PDFs point to the live site.

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { PDFDocument } from 'pdf-lib'
import os from 'node:os'
import { MODULES } from '../src/lib/modules.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const DIST = path.join(ROOT, 'dist')
const BASE = '/react-handbook/'
const LIVE = 'https://giorgistrat.github.io'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = path.resolve(process.argv[2] ?? path.join(os.homedir(), 'Desktop/React Handbook PDFs'))

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

async function exportNote(mod, note, file) {
	const page = await browser.newPage()
	await page.setViewport({ width: 900, height: 1200 })
	await page.goto(`${origin}${BASE}${mod.id}/${note.slug}/`, { waitUntil: 'networkidle0' })
	await page.evaluate(async (live) => {
		await document.fonts.ready
		// Static versions of the interactive bits
		document.querySelectorAll('details').forEach((d) => (d.open = true))
		// Animations: final state of every scenario, plus the printed step list
		window.dispatchEvent(new Event('beforeprint'))
		// Links should work from the iPad, so point them at the live site
		document.querySelectorAll('a[href]').forEach((a) => {
			const url = new URL(a.getAttribute('href'), location.href)
			if (url.origin === location.origin) a.href = live + url.pathname + url.hash
		})
	}, LIVE)
	const title = await page.$eval('h1', (h) => h.textContent.trim())
	const out = file(title)
	await page.pdf({
		path: out,
		format: 'A4',
		printBackground: true,
		preferCSSPageSize: true,
		displayHeaderFooter: true,
		headerTemplate: '<span></span>',
		footerTemplate: `<div style="width:100%;font:8px Helvetica,Arial,sans-serif;color:#888;padding:0 15mm;display:flex;justify-content:space-between"><span>React Handbook · ${mod.title} · ${title}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
	})
	await page.close()
	return out
}

try {
	for (const [m, mod] of MODULES.entries()) {
		if (!mod.notes.length) continue
		const dir = path.join(OUT, `${String(m + 1).padStart(2, '0')} - ${mod.title}`)
		fs.rmSync(dir, { recursive: true, force: true })
		fs.mkdirSync(dir, { recursive: true })
		const written = []
		for (const [i, note] of mod.notes.entries()) {
			const out = await exportNote(mod, note, (title) => path.join(dir, `${String(i + 1).padStart(2, '0')} - ${title.replace(/[/:]/g, '-')}.pdf`))
			written.push(out)
			console.log(`✓ ${mod.title} / ${path.basename(out)}`)
		}
		const merged = await PDFDocument.create()
		merged.setTitle(`React Handbook · ${mod.title}`)
		for (const file of written) {
			const doc = await PDFDocument.load(fs.readFileSync(file))
			const pages = await merged.copyPages(doc, doc.getPageIndices())
			pages.forEach((p) => merged.addPage(p))
		}
		const all = path.join(dir, `${mod.title} - all notes.pdf`)
		fs.writeFileSync(all, await merged.save())
		console.log(`✓ ${mod.title} / ${path.basename(all)} (${merged.getPageCount()} pages)`)
	}
} finally {
	await browser.close()
	server.close()
}
