// Renders public/og.png (1200×630), the preview image for shared links.
//   node scripts/og-image.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { illustration } from '../src/lib/illustrations.mjs'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;width:1200px;height:630px;background:#f6c744;font-family:-apple-system,'Inter',system-ui,sans-serif;display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;color:#1d1a18}
.t{flex:1.2}.eyebrow{display:inline-block;padding:6px 18px;border:3px solid #1d1a18;border-radius:999px;background:#ee95e3;font-weight:800;font-size:24px}
h1{font-size:104px;line-height:.92;letter-spacing:-.055em;margin:26px 0 22px;font-weight:900}
p{font-size:32px;font-weight:800;letter-spacing:-.02em;margin:0;color:#4a4440}
.c{flex:1;background:#fcf5e4;border:3px solid #1d1a18;border-radius:22px;box-shadow:0 12px 0 #1d1a18;padding:20px}
.p{background:#e8a6d2;border-radius:10px}svg{display:block;width:100%;height:auto}
</style></head><body><div class="t"><span class="eyebrow">Notes · React 19.2.5</span><h1>React<br>Internals</h1><p>Fiber, reconciliation, the work loop, commit, hooks — animated.</p></div>
<div class="c"><div class="p">${illustration('browser')}</div></div></body></html>`

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630 })
await page.setContent(html)
await page.screenshot({ path: path.join(ROOT, 'public/og.png') })
await browser.close()
console.log('Wrote public/og.png')
