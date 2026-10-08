// Compiles the JSX lessons the way build tools do, so the handbook shows the
// real output instead of a hand-written guess.
//
//   generated/compiled/automatic/<file>.js   runtime: 'automatic'  (jsx / jsxs from react/jsx-runtime)
//   generated/compiled/classic/<file>.js     runtime: 'classic'    (React.createElement)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformAsync } from '@babel/core'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUT = path.join(ROOT, 'generated/compiled')
const FILES = ['src/lessons/fundamentals/03-jsx.tsx', 'src/lessons/fundamentals/04-components.tsx']
const MODES = { automatic: { runtime: 'automatic', development: false }, classic: { runtime: 'classic', development: false } }

fs.rmSync(OUT, { recursive: true, force: true })
for (const [mode, options] of Object.entries(MODES)) {
	fs.mkdirSync(path.join(OUT, mode), { recursive: true })
	for (const file of FILES) {
		const result = await transformAsync(fs.readFileSync(path.join(ROOT, file), 'utf8'), {
			filename: file,
			babelrc: false,
			configFile: false,
			presets: ['@babel/preset-typescript', ['@babel/preset-react', options]],
		})
		// /*#__PURE__*/ only helps minifiers drop unused calls; it's noise for reading
		fs.writeFileSync(path.join(OUT, mode, path.basename(file).replace(/\.tsx$/, '.js')), result.code.replaceAll('/*#__PURE__*/', '') + '\n')
	}
}
console.log(`Compiled ${FILES.length} files × ${Object.keys(MODES).length} modes → generated/compiled`)
