// Renders public/og.png (1200×630), the preview image for shared links.
//   node scripts/og-image.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { illustration } from '../src/lib/illustrations.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
// Theme tokens + the SVG repaint rules, so the illustration matches the site.
const tokens = read('src/styles/global.css').match(/:root \{[\s\S]*?\n\}/)[0]
const svgRules = read('src/styles/diagrams.css').split('/* ─── SVG colors')[1].replace(/^[^\n]*\n/, '')
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${tokens}
/* ${svgRules}
body{margin:0;width:1200px;height:630px;background-color:var(--page);background-image:linear-gradient(var(--grid-major) 1px,transparent 1px),linear-gradient(90deg,var(--grid-major) 1px,transparent 1px),linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:100px 100px,100px 100px,20px 20px,20px 20px;font-family:-apple-system,'Inter',system-ui,sans-serif;display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;color:var(--ink)}
.t{flex:1.2}.eyebrow{display:inline-block;padding:6px 18px;border:2px solid var(--line);border-radius:999px;background:var(--plum-soft);color:var(--plum);font:600 24px -apple-system,system-ui,sans-serif}
h1{font:700 104px/.95 -apple-system,system-ui,sans-serif;letter-spacing:-.05em;margin:26px 0 22px}
p{font-size:30px;font-weight:600;letter-spacing:-.02em;margin:0;color:var(--ink-soft)}
.c{flex:1;background:var(--cream);border:2px solid var(--cream-deep);border-radius:24px;padding:20px}
.panel{background:var(--surface);border:1px solid var(--cream-deep);border-radius:14px;overflow:hidden}svg{display:block;width:100%;height:auto}
</style></head><body><div class="t"><span class="eyebrow">Notes · React 19.2.5</span><h1>React<br>Handbook</h1><p>From JSX to the fiber tree: notes, diagrams and animations.</p></div>
<div class="c"><div class="panel">${illustration('browser')}</div></div></body></html>`

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630 })
await page.setContent(html)
await page.screenshot({ path: path.join(ROOT, 'public/og.png') })
await browser.close()
console.log('Wrote public/og.png')
