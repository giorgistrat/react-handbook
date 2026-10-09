import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// A tiny fake backend for the Suspense lessons:
//   /img/<id>.svg            a product picture, sent after 600 ms (p2's is missing: 404)
//   /api/exchange-rate       counts how often the server is really hit; ?cache=1 adds Cache-Control
const COLORS: Record<string, string> = { p1: '#f9e2af', p3: '#a6e3a1', p4: '#89b4fa', p5: '#cba6f7', p6: '#fab387' }
const rateHits = { cached: 0, uncached: 0 }

const storeServer: Plugin = {
	name: 'store-server',
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			const url = new URL(req.url!, 'http://x')
			const img = url.pathname.match(/^\/img\/(\w+)\.svg$/)
			if (img) {
				return setTimeout(() => {
					const color = COLORS[img[1]]
					if (!color) return ((res.statusCode = 404), res.end('not found'))
					res.setHeader('content-type', 'image/svg+xml')
					res.setHeader('cache-control', 'no-store') // so every recording sees the real delay
					res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" rx="12" fill="${color}"/><text x="80" y="66" font-family="sans-serif" font-size="18" text-anchor="middle">${img[1]}</text></svg>`)
				}, 600)
			}
			if (url.pathname === '/api/exchange-rate') {
				const mode = url.searchParams.has('cache') ? 'cached' : 'uncached'
				rateHits[mode]++
				res.setHeader('content-type', 'application/json')
				res.setHeader('cache-control', mode === 'cached' ? 'max-age=60' : 'no-store')
				return res.end(JSON.stringify({ eur: 0.92, serverHits: rateHits[mode] }))
			}
			next()
		})
	},
}

export default defineConfig({ plugins: [react(), storeServer] })
