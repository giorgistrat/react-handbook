// Open the app with ?trace to log every component call, effect and cleanup
// in the browser console, in the order React runs them.
const enabled = new URLSearchParams(location.search).has('trace')

export function log(...args) {
	if (!enabled) return
	console.log('%c[app]', 'color:#d9539f;font-weight:bold', ...args)
	// scripts/trace.mjs collects these alongside React's own calls
	globalThis.__TRACE__?.push(['app', args.join(' '), globalThis.__depth?.('log') ?? 0])
}
