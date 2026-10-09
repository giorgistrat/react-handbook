// Logs what the shopper sees, whenever it changes: fallbacks, errors,
// product details, pending markers and images. Elements opt in with data-*
// attributes: data-fallback, data-error, data-details="…", data-pending, data-img="…".
import { log } from '../../log'

export function watchScreen(root: HTMLElement) {
	let last = ''
	const describe = () => {
		const parts: string[] = []
		root.querySelectorAll<HTMLElement>('[data-fallback],[data-error],[data-details],[data-pending],[data-img],[data-note]').forEach((el) => {
			if (el.closest('[hidden]') || !el.checkVisibility()) return // React hides suspended content with display: none
			if (el.dataset.fallback !== undefined) parts.push(`fallback “${el.textContent}”`)
			else if (el.dataset.error !== undefined) parts.push(`error “${el.textContent}”`)
			else if (el.dataset.details !== undefined) parts.push(`details: ${el.dataset.details}${el.closest('[data-stale]') ? ' (dimmed)' : ''}`)
			else if (el.dataset.pending !== undefined) parts.push('pending ⏳')
			else if (el.dataset.img !== undefined) parts.push(`image: ${el.dataset.img}`)
			else if (el.dataset.note !== undefined) parts.push(el.textContent!)
		})
		return parts.join(' · ') || '(empty)'
	}
	new MutationObserver(() => {
		const now = describe()
		if (now !== last) log(`screen: ${now}`)
		last = now
	}).observe(root, { childList: true, subtree: true, attributes: true, characterData: true })
}
