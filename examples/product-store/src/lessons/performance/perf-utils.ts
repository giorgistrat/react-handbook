// Measuring helpers for the performance lessons.
import { log } from '../../log'

/** After each keystroke, log how long until the browser could paint the next frame. */
export function measureKeystrokes() {
	window.addEventListener(
		'keydown',
		(e) => {
			const t0 = performance.now()
			requestAnimationFrame(() => log(`keystroke "${e.key}": next frame after ${Math.round(performance.now() - t0)} ms`))
		},
		true,
	)
}
