// Patterns 1: a product page layout, with data drilled through layout
// components vs elements built where the data lives.
import { useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { formatUSD, products, type Product } from '../../data/products'
import { log } from '../../log'

type User = { name: string; avatar: string }
const props = (name: string, p: object) => log(`${name} got: ${Object.keys(p).join(', ') || '(nothing)'}`)

// #region drilled
function AppDrilled() {
	const [user] = useState<User>({ name: 'Sam', avatar: '/logo.svg' })
	const [selected, setSelected] = useState<Product | null>(null)
	return (
		<>
			<NavDrilled user={user} />
			<MainDrilled products={products} selected={selected} onSelect={setSelected} />
			<FooterDrilled user={user} />
		</>
	)
}

function NavDrilled(p: { user: User }) {
	props('Nav', p)
	return <nav><img src={p.user.avatar} alt={`${p.user.name}'s profile`} /></nav>
}

function MainDrilled(p: { products: Product[]; selected: Product | null; onSelect: (p: Product) => void }) {
	props('Main', p)
	return (
		<main>
			<ProductList products={p.products} onSelect={p.onSelect} />
			<ProductDetails product={p.selected} />
		</main>
	)
}

function FooterDrilled(p: { user: User }) {
	props('Footer', p)
	return <footer>Happy shopping, {p.user.name}!</footer>
}
// #endregion

// #region composed
function AppComposed() {
	const [user] = useState<User>({ name: 'Sam', avatar: '/logo.svg' })
	const [selected, setSelected] = useState<Product | null>(null)
	return (
		<>
			<Nav avatar={<img src={user.avatar} alt={`${user.name}'s profile`} />} />
			<Main
				sidebar={<ProductList products={products} onSelect={setSelected} />}
				content={<ProductDetails product={selected} />}
			/>
			<Footer>Happy shopping, {user.name}!</Footer>
		</>
	)
}

function Nav(p: { avatar: ReactNode }) {
	props('Nav', p)
	return <nav>{p.avatar}</nav>
}

function Main(p: { sidebar: ReactNode; content: ReactNode }) {
	props('Main', p)
	return (
		<main>
			{p.sidebar}
			{p.content}
		</main>
	)
}

function Footer(p: { children: ReactNode }) {
	props('Footer', p)
	return <footer>{p.children}</footer>
}
// #endregion

// Components that really use the data take it as normal props
function ProductList({ products, onSelect }: { products: Product[]; onSelect: (p: Product) => void }) {
	return (
		<ul>
			{products.map((p) => (
				<li key={p.id}>
					<button onClick={() => onSelect(p)}>{p.name}</button>
				</li>
			))}
		</ul>
	)
}

function ProductDetails({ product }: { product: Product | null }) {
	return <section id="details">{product ? `${product.name}: ${formatUSD(product.priceCents)}` : 'Pick a product'}</section>
}

export function mount(root: HTMLElement, scenario: string | null) {
	createRoot(root).render(scenario === 'drilled' ? <AppDrilled /> : <AppComposed />)
}
