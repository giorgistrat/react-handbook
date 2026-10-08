// APIs 7: reading state React doesn't own: the browser's online status and a
// cart store shared by two separate React roots.
import { useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { log } from '../../log'

// #region online
function subscribe(onChange: () => void) {
	window.addEventListener('online', onChange)
	window.addEventListener('offline', onChange)
	return () => {
		window.removeEventListener('online', onChange)
		window.removeEventListener('offline', onChange)
	}
}

function useOnlineStatus() {
	return useSyncExternalStore(
		subscribe,
		() => navigator.onLine, // on the client
		() => true, // on the server, and during hydration
	)
}

function CheckoutButton() {
	const online = useOnlineStatus()
	return <button disabled={!online}>{online ? 'Place order' : 'Offline: reconnect to order'}</button>
}
// #endregion

// #region store
type Cart = { count: number }

function createCartStore() {
	let state: Cart = { count: 0 }
	const listeners = new Set<() => void>()
	return {
		getSnapshot: () => state,
		subscribe(listener: () => void) {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
		add() {
			state = { count: state.count + 1 } // a new object only when something changed
			listeners.forEach((l) => l())
		},
	}
}

const cartStore = createCartStore()

function useCartCount() {
	return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot).count
}
// #endregion

// #region roots
function HeaderBadge() {
	const count = useCartCount()
	log(`render HeaderBadge (${count})`)
	return <span id="badge">🛒 {count}</span>
}

function ProductPage() {
	const count = useCartCount()
	log(`render ProductPage (${count})`)
	return <button id="add" onClick={cartStore.add}>Add to cart ({count} so far)</button>
}

// Two separate React apps on one page, e.g. an older header and a new product page
function mountBoth(header: HTMLElement, page: HTMLElement) {
	createRoot(header).render(<HeaderBadge />)
	createRoot(page).render(<ProductPage />)
}
// #endregion

// #region newObject
function useCartBad() {
	return useSyncExternalStore(cartStore.subscribe, () => ({ ...cartStore.getSnapshot() }))
}
// #endregion

function BadBadge() {
	const cart = useCartBad()
	return <span>{cart.count}</span>
}

// #region noServer
function useOnlineStatusClientOnly() {
	return useSyncExternalStore(subscribe, () => navigator.onLine)
}
// #endregion

function ClientOnlyButton() {
	const online = useOnlineStatusClientOnly()
	return <button>{online ? 'Place order' : 'Offline'}</button>
}

export function mount(root: HTMLElement, scenario: string | null) {
	if (scenario === 'store') {
		root.innerHTML = '<div id="header"></div><div id="page"></div>'
		mountBoth(root.querySelector('#header')!, root.querySelector('#page')!)
		return
	}
	if (scenario === 'new-object') {
		createRoot(root, { onUncaughtError: (e) => log('uncaught:', (e as Error).message) }).render(<BadBadge />)
		return
	}
	if (scenario === 'server') {
		// #region server
		log('with getServerSnapshot:', renderToString(<CheckoutButton />))
		try {
			log('without:', renderToString(<ClientOnlyButton />))
		} catch (e) {
			log('without: threw', (e as Error).message)
		}
		// #endregion
		return
	}
	createRoot(root).render(<CheckoutButton />)
}
