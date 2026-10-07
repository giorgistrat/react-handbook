// Renders public/og.png (1200×630), the preview image for shared links.
//   node scripts/og-image.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { illustration } from '../src/lib/illustrations.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
// Blueprint tokens + the SVG repaint rules, so the illustration matches the site.
const tokens = read('src/styles/global.css').match(/:root \{[\s\S]*?\n\}/)[0]
const svgRules = read('src/styles/diagrams.css').split('/* ─── SVG colors')[1].replace(/^[^\n]*\n/, '')
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${tokens}
/* ${svgRules}
body{margin:0;width:1200px;height:630px;background-color:var(--page);background-image:linear-gradient(var(--grid-major) 1px,transparent 1px),linear-gradient(90deg,var(--grid-major) 1px,transparent 1px),linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:100px 100px,100px 100px,20px 20px,20px 20px;font-family:-apple-system,'Inter',system-ui,sans-serif;display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;color:var(--ink)}
.t{flex:1.2}.eyebrow{display:inline-block;padding:6px 16px;border:2px solid var(--accent);color:var(--accent);font:500 22px Menlo,monospace;letter-spacing:.08em;text-transform:uppercase}
h1{font:600 100px/.95 Menlo,monospace;letter-spacing:-.07em;margin:26px 0 22px}
p{font-size:30px;font-weight:600;letter-spacing:-.02em;margin:0;color:var(--ink-soft)}
.c{flex:1;position:relative;background:var(--cream);border:2px solid var(--line);padding:20px}
.c::before,.c::after{content:'';position:absolute;width:18px;height:18px;border:0 solid var(--orange)}
.c::before{top:-7px;left:-7px;border-top-width:3px;border-left-width:3px}.c::after{bottom:-7px;right:-7px;border-bottom-width:3px;border-right-width:3px}
.panel{background:var(--pink-panel);border:1px solid var(--cream-deep)}svg{display:block;width:100%;height:auto}
</style></head><body><div class="t"><span class="eyebrow">Sheet set · React 19.2.5</span><h1>React<br>Internals</h1><p>Fiber, reconciliation, the work loop, commit, hooks — animated.</p></div>
<div class="c"><div class="panel">${illustration('browser')}</div></div></body></html>`

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630 })
await page.setContent(html)
await page.screenshot({ path: path.join(ROOT, 'public/og.png') })
await browser.close()
console.log('Wrote public/og.png')
