// APIs 2: the theme and the cart in context, read with use().
import { createContext, memo, use, useMemo, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { products } from '../../data/products'
import { log } from '../../log'

// #region create
type Theme = 'light' | 'dark'
const ThemeContext = createContext<Theme>('light') // 'light' is used when no provider is above
// #endregion

// #region cartContext
type CartValue = { count: number; add: () => void }
const CartContext = createContext<CartValue | null>(null)

function useCart() {
	const value = use(CartContext)
	if (value === null) throw new Error('useCart must be used inside <CartProvider>')
	return value
}
// #endregion

// #region provider
function CartProvider({ children }: { children: ReactNode }) {
	const [count, setCount] = useState(0)
	const value = useMemo(() => ({ count, add: () => setCount((c) => c + 1) }), [count])
	log('render CartProvider')
	return <CartContext value={value}>{children}</CartContext>
}
// #endregion

function UnstableCartProvider({ children }: { children: ReactNode }) {
	const [count, setCount] = useState(0)
	// #region unstable
	const value = { count, add: () => setCount((c) => c + 1) } // a new object every render
	// #endregion
	log('render CartProvider')
	return <CartContext value={value}>{children}</CartContext>
}

// #region consumers
function CartBadge() {
	const { count } = useCart()
	log('render CartBadge')
	return <span id="badge">{count} in cart</span>
}

function ProductCard({ name, onSale }: { name: string; onSale: boolean }) {
	const theme = use(ThemeContext)
	log(`render ProductCard (${name})`)
	return (
		<article className={`product-card ${theme}`}>
			<h2>{name}</h2>
			<SaleTag onSale={onSale} />
		</article>
	)
}

function SaleTag({ onSale }: { onSale: boolean }) {
	if (!onSale) return null
	const theme = use(ThemeContext) // use() may be called after an early return
	return <span className={`tag tag--sale ${theme}`}>Sale</span>
}
// #endregion

function AddButton() {
	const { add } = useCart()
	log('render AddButton')
	return <button id="add" onClick={add}>Add to cart</button>
}

const Header = memo(function Header() {
	log('render Header')
	return (
		<header>
			<CartBadge />
		</header>
	)
})

const ProductGrid = memo(function ProductGrid() {
	log('render ProductGrid')
	return (
		<main>
			{products.slice(0, 3).map((p) => (
				<ProductCard key={p.id} name={p.name} onSale={p.id === 'p3'} />
			))}
			<AddButton />
		</main>
	)
})

// #region app
function App({ Provider = CartProvider }) {
	const [theme, setTheme] = useState<Theme>('light')
	log('render App')
	return (
		<ThemeContext value={theme}>
			<Provider>
				<button id="theme" onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}>
					Toggle theme
				</button>
				<Header />
				<ProductGrid />
			</Provider>
		</ThemeContext>
	)
}
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root)
	if (scenario === 'no-provider') {
		r.render(
			<>
				{/* #region noProvider */}
				<ProductCard name="Desk Lamp" onSale />
				<ErrorBoundary fallbackRender={({ error }) => <p role="alert">{(error as Error).message}</p>}>
					<CartBadge />
				</ErrorBoundary>
				{/* #endregion */}
			</>,
		)
		return
	}
	r.render(<App Provider={scenario === 'unstable' ? UnstableCartProvider : CartProvider} />)
}
