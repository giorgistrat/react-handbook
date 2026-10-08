// log() writes to the console and to window.__log, so scripts/record.mjs can
// read exactly what ran, in order.

declare global {
	interface Window {
		__log: string[]
	}
}

window.__log ??= []

export function log(...parts: unknown[]) {
	const line = parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ')
	window.__log.push(line)
	console.log(line)
}
