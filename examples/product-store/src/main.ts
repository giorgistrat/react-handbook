// Picks the lesson from the URL: /?lesson=fundamentals/10-arrays&scenario=id-keys
// Each lesson module exports mount(root, scenario).

type Lesson = { mount: (root: HTMLElement, scenario: string | null) => void | Promise<void> }

const lessons = import.meta.glob<Lesson>('./lessons/**/*.{ts,tsx}')
const params = new URLSearchParams(location.search)
const name = params.get('lesson')
const root = document.getElementById('root')!

const load = name ? lessons[`./lessons/${name}.tsx`] ?? lessons[`./lessons/${name}.ts`] : undefined
if (load) {
	load().then((m) => m.mount(root, params.get('scenario')))
} else {
	root.innerHTML = `<h1>Product Store</h1><p>Open a lesson:</p><ul>${Object.keys(lessons)
		.map((k) => k.replace('./lessons/', '').replace(/\.tsx?$/, ''))
		.filter((k) => !k.includes('.bad') && /\/\d/.test(k)) // lessons only, not shared helpers
		.map((k) => `<li><a href="?lesson=${k}">${k}</a></li>`)
		.join('')}</ul>`
}
