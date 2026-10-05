// Compiles the demo's JSX the way build tools do, so the docs can show the
// real output instead of a hand-written guess.
//
//   generated/compiled/automatic/*.js   Babel, runtime: 'automatic'  (jsx / jsxs)
//   generated/compiled/dev/*.js         Babel, development: true      (jsxDEV)
//   generated/compiled/classic/*.js     Babel, runtime: 'classic'     (React.createElement)
//   generated/compiled/vite-dev/*.js    what Vite's dev server sends to the browser (Oxc)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformAsync } from '@babel/core'
import { createServer } from 'vite'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SRC = path.join(ROOT, 'src')
const OUT = path.join(ROOT, 'generated/compiled')

const MODES = {
	automatic: { runtime: 'automatic', development: false },
	dev: { runtime: 'automatic', development: true },
	classic: { runtime: 'classic', development: false },
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.jsx'))
fs.rmSync(OUT, { recursive: true, force: true })

for (const [mode, options] of Object.entries(MODES)) {
	fs.mkdirSync(path.join(OUT, mode), { recursive: true })
	for (const file of files) {
		const code = fs.readFileSync(path.join(SRC, file), 'utf8')
		const result = await transformAsync(code, {
			filename: file,
			babelrc: false,
			configFile: false,
			presets: [['@babel/preset-react', options]],
		})
		fs.writeFileSync(path.join(OUT, mode, file.replace(/\.jsx$/, '.js')), result.code + '\n')
	}
}

const server = await createServer({ root: ROOT, logLevel: 'silent', server: { middlewareMode: true } })
fs.mkdirSync(path.join(OUT, 'vite-dev'), { recursive: true })
for (const file of files) {
	const result = await server.transformRequest(`/src/${file}`)
	fs.writeFileSync(path.join(OUT, 'vite-dev', file.replace(/\.jsx$/, '.js')), result.code.replace(/\n\/\/# sourceMappingURL=.*$/s, '').replaceAll(ROOT, '/project') + '\n')
}
await server.close()

console.log(`Compiled ${files.length} files × ${Object.keys(MODES).length + 1} modes → generated/compiled`)
