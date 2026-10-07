// Small progressive enhancements for the rendered notes.

import { setupAnims } from './anim'

const store = {
	get<T>(key: string, fallback: T): T {
		try {
			const v = localStorage.getItem(key)
			return v === null ? fallback : (JSON.parse(v) as T)
		} catch {
			return fallback
		}
	},
	set(key: string, value: unknown) {
		try {
			localStorage.setItem(key, JSON.stringify(value))
		} catch {
			/* private mode etc.: the feature just won't persist */
		}
	},
}

const base = document.body.dataset.base ?? '/'
const slug = document.querySelector<HTMLElement>('[data-slug]')?.dataset.slug

function wrapTables() {
	document.querySelectorAll('.prose table').forEach((table) => {
		if (table.parentElement?.classList.contains('table-wrap')) return
		const wrap = document.createElement('div')
		wrap.className = 'table-wrap'
		table.replaceWith(wrap)
		wrap.append(table)
	})
}

// ─── Theme ──────────────────────────────────────────────────────────────────

function setupTheme() {
	const root = document.documentElement
	const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches)
	document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
		const next = isDark() ? 'light' : 'dark'
		root.dataset.theme = next
		try {
			localStorage.setItem('theme', next)
		} catch {
			/* not persisted */
		}
	})
}

// ─── Search (Pagefind, built by `npm run build`) ────────────────────────────

type PagefindResult = { url: string; excerpt: string; meta: { title?: string }; sub_results?: { title: string; url: string; excerpt: string }[] }
type Pagefind = { debouncedSearch(q: string): Promise<{ results: { data(): Promise<PagefindResult> }[] } | null> }

function setupSearch() {
	const dialog = document.querySelector<HTMLDialogElement>('.search-dlg')
	if (!dialog) return
	const input = dialog.querySelector<HTMLInputElement>('.search-input')!
	const status = dialog.querySelector<HTMLElement>('.search-status')!
	const list = dialog.querySelector<HTMLOListElement>('.search-results')!
	let pagefind: Promise<Pagefind | null> | null = null

	const load = () =>
		(pagefind ??= import(/* @vite-ignore */ `${base}pagefind/pagefind.js`).catch(() => {
			status.textContent = 'The search index is created by `npm run build`; it isn’t available in dev mode.'
			return null
		}))

	const open = () => {
		dialog.showModal()
		input.select()
		load()
	}
	document.querySelector('[data-search-open]')?.addEventListener('click', open)
	document.addEventListener('keydown', (e) => {
		const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable]')
		if ((e.key === '/' && !typing) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
			e.preventDefault()
			open()
		}
	})
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) dialog.close() // click on the backdrop
	})
	// In a search field Chrome's first Escape only clears the text; close instead
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			e.preventDefault()
			dialog.close()
		}
	})

	input.addEventListener('input', async () => {
		const q = input.value.trim()
		const pf = await load()
		if (!pf) return
		if (!q) {
			list.innerHTML = ''
			status.textContent = ''
			return
		}
		const search = await pf.debouncedSearch(q)
		if (!search) return // superseded by a newer query
		const results = await Promise.all(search.results.slice(0, 8).map((r) => r.data()))
		status.textContent = search.results.length ? `${search.results.length} page${search.results.length === 1 ? '' : 's'} match` : 'No matches.'
		list.innerHTML = results
			.map((r) => {
				const subs = (r.sub_results ?? []).filter((s) => s.url.includes('#')).slice(0, 3)
				const title = (r.meta.title ?? '').replace(' · React Internals', '')
				const main = `<li><a href="${r.url}"><span class="sr-title">${title}</span><span class="sr-excerpt">${r.excerpt}</span></a></li>`
				return main + subs.map((s) => `<li><a href="${s.url}"><span class="sr-section">${title} › ${s.title}</span><span class="sr-excerpt">${s.excerpt}</span></a></li>`).join('')
			})
			.join('')
	})
}

// ─── Table of contents: highlight the section being read ───────────────────

function setupScrollSpy() {
	const headings = [...document.querySelectorAll<HTMLElement>('.prose h2[id]')]
	const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc a')]
	if (!headings.length || !links.length) return
	let frame = 0
	const update = () => {
		frame = 0
		const y = 120
		let current = headings[0].id
		for (const h of headings) if (h.getBoundingClientRect().top <= y) current = h.id
		for (const a of links) a.classList.toggle('active', a.hash === `#${current}`)
	}
	addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true })
	update()
	// Close the phone/tablet TOC after choosing a section
	document.querySelectorAll('.toc-mobile a').forEach((a) =>
		a.addEventListener('click', () => a.closest('details')?.removeAttribute('open')),
	)
}

// ─── Read tracking (stored only in this browser) ────────────────────────────

function setupReadState() {
	const read = new Set(store.get<string[]>('read', []))
	const save = () => store.set('read', [...read])

	const btn = document.querySelector<HTMLButtonElement>('[data-mark-read]')
	if (btn && slug) {
		const render = () => {
			const on = read.has(slug)
			btn.setAttribute('aria-pressed', String(on))
			btn.textContent = on ? '✓ Read · mark as unread' : 'Mark as read'
		}
		btn.addEventListener('click', () => {
			read.has(slug) ? read.delete(slug) : read.add(slug)
			save()
			render()
		})
		// Reaching the end of the note counts as reading it
		const article = document.querySelector('.prose')
		if (article) {
			const io = new IntersectionObserver((entries) => {
				if (entries.some((e) => e.isIntersecting) && !read.has(slug)) {
					read.add(slug)
					save()
					render()
				}
			})
			const end = document.createElement('div')
			article.append(end)
			io.observe(end)
		}
		render()
	}

	const cards = document.querySelectorAll<HTMLElement>('[data-card]')
	if (cards.length) {
		let n = 0
		cards.forEach((card) => {
			const done = read.has(card.dataset.card!)
			if (done) n++
			card.querySelector<HTMLElement>('.read-pill')!.hidden = !done
		})
		const progress = document.querySelector<HTMLElement>('[data-read-progress]')
		if (progress && n) {
			progress.hidden = false
			progress.textContent = `${n} of ${cards.length} read`
		}
	}
}

// ─── Copy buttons on code + links on headings ───────────────────────────────

function setupCodeAndHeadings() {
	document.querySelectorAll<HTMLPreElement>('.prose pre.astro-code, .prose pre.trace').forEach((pre) => {
		const wrap = document.createElement('div')
		wrap.className = 'code-wrap'
		pre.replaceWith(wrap)
		wrap.append(pre)
		const btn = document.createElement('button')
		btn.type = 'button'
		btn.className = 'copy-btn'
		btn.textContent = 'Copy'
		btn.setAttribute('aria-label', 'Copy code')
		btn.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ''))
				btn.textContent = 'Copied'
				btn.classList.add('done')
				setTimeout(() => {
					btn.textContent = 'Copy'
					btn.classList.remove('done')
				}, 1400)
			} catch {
				btn.textContent = 'Press ⌘C'
			}
		})
		wrap.append(btn)
	})

	document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]').forEach((h) => {
		const a = document.createElement('a')
		a.className = 'heading-link'
		a.href = `#${h.id}`
		a.textContent = '#'
		a.setAttribute('aria-label', `Link to “${h.textContent}”`)
		a.dataset.pagefindIgnore = ''
		h.append(a)
	})
}

// ─── Interview Q&A: expand all, quiz mode, known / review ──────────────────

function setupQA() {
	const all = [...document.querySelectorAll<HTMLDetailsElement>('.prose details.qa')]
	if (!all.length || !slug) return
	const key = (i: number) => `qa:${slug}:${i}`
	const grades = all.map((_, i) => store.get<string | null>(key(i), null))

	const tools = document.createElement('div')
	tools.className = 'qa-tools'
	tools.innerHTML = `
		<button type="button" class="btn btn-ghost" data-qa="expand">Expand all</button>
		<button type="button" class="btn btn-ghost" data-qa="quiz" aria-pressed="false">Quiz me</button>
		<button type="button" class="btn btn-ghost" data-qa="filter" aria-pressed="false">Only “review”</button>
		<span class="qa-score"></span>`
	all[0].before(tools)

	const score = tools.querySelector<HTMLElement>('.qa-score')!
	const renderScore = () => {
		const known = grades.filter((g) => g === 'known').length
		const review = grades.filter((g) => g === 'review').length
		score.textContent = known || review ? `Known ${known} / ${all.length}${review ? ` · ${review} to review` : ''}` : ''
	}

	all.forEach((d, i) => {
		const grade = document.createElement('div')
		grade.className = 'qa-grade'
		grade.innerHTML = `<button type="button" class="btn btn-ghost" data-grade="known">✓ I knew it</button><button type="button" class="btn btn-ghost" data-grade="review">↻ Review again</button>`
		d.append(grade)
		const paint = () => {
			if (grades[i]) d.dataset.grade = grades[i]!
			else delete d.dataset.grade
			grade.querySelectorAll<HTMLElement>('[data-grade]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grade === grades[i])))
		}
		grade.addEventListener('click', (e) => {
			const g = (e.target as HTMLElement).closest<HTMLElement>('[data-grade]')?.dataset.grade
			if (!g) return
			grades[i] = grades[i] === g ? null : g
			store.set(key(i), grades[i])
			paint()
			renderScore()
			// In quiz mode, move on to the next question
			if (document.body.classList.contains('quiz-on') && grades[i]) {
				d.open = false
				const next = all.slice(i + 1).find((x) => !x.classList.contains('filtered-out'))
				if (next) {
					next.open = false
					next.scrollIntoView({ block: 'center', behavior: 'smooth' })
					next.querySelector('summary')?.focus()
				}
			}
		})
		paint()
	})
	renderScore()

	tools.addEventListener('click', (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-qa]')
		if (!btn) return
		const mode = btn.dataset.qa
		if (mode === 'expand') {
			const open = all.some((d) => !d.open)
			all.forEach((d) => (d.open = open))
			btn.textContent = open ? 'Collapse all' : 'Expand all'
		}
		if (mode === 'quiz') {
			const on = document.body.classList.toggle('quiz-on')
			btn.setAttribute('aria-pressed', String(on))
			btn.textContent = on ? 'Quiz on: try to answer, then open' : 'Quiz me'
			if (on) all.forEach((d) => (d.open = false))
		}
		if (mode === 'filter') {
			const on = btn.getAttribute('aria-pressed') !== 'true'
			btn.setAttribute('aria-pressed', String(on))
			all.forEach((d, i) => d.classList.toggle('filtered-out', on && grades[i] !== 'review'))
		}
	})
}

// ─── Self-check lists: real, remembered checkboxes ──────────────────────────

function setupChecklists() {
	if (!slug) return
	document.querySelectorAll<HTMLInputElement>('.prose li > input[type="checkbox"]').forEach((box, i) => {
		const key = `check:${slug}:${i}`
		box.disabled = false
		box.checked = store.get(key, false)
		box.setAttribute('aria-label', box.parentElement?.textContent?.trim() ?? 'Done')
		box.addEventListener('change', () => store.set(key, box.checked))
	})
}

wrapTables()
setupTheme()
setupChecklists()
setupSearch()
setupScrollSpy()
setupReadState()
setupCodeAndHeadings()
setupQA()
setupAnims()
