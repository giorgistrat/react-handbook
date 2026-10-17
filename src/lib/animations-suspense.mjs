// Animations for the React Suspense module, in the "code + screen" style
// (src/lib/anim-code.mjs). Every outcome shown was recorded from
// examples/product-store (src/lessons/suspense, scripts/record.mjs →
// generated/suspense.json). Times are ms since the action, rounded to 50 ms.

import { codeAnim } from './anim-code.mjs'

// ─── use(promise): pending, fulfilled, rejected ────────────────────────────

export function useAnim() {
	const code = (id) => `
function ProductDetails({ productPromise }) {
  const product = use(productPromise) // suspends while pending
  return <h2>{product.name}</h2>
}

const productPromise = fetchProduct('${id}') // started before rendering
root.render(
  <ErrorBoundary fallback={<p>Couldn’t load this product.</p>}>
    <Suspense fallback={<p>Loading product…</p>}>
      <ProductDetails productPromise={productPromise} />
    </Suspense>
  </ErrorBoundary>,
)`
	const screen = [['page', '(blank)', 'box']]
	return codeAnim({
		id: 'suspense-use-anim',
		caption: 'A product page whose data takes 300 ms to arrive (both runs recorded).',
		file: 'ProductPage.tsx',
		screen,
		scenarios: [
			{
				name: 'Fulfilled',
				intro: 'An existing product.',
				code: code('p4'),
				console: ['0 ms  → GET /products/p4', 'ProductDetails render started', 'screen: Loading product…', '300 ms  ← GET /products/p4', 'ProductDetails render finished'],
				steps: [
					{ at: 'const productPromise = fetchProduct', phase: 'trigger', say: 'The request starts <b>before</b> React renders, and its promise is passed down as a prop.', log: '→ GET' },
					{ at: 'const product = use(productPromise)', phase: 'render', say: 'The promise is still pending, so <code>use</code> interrupts the render here.', log: 'render started' },
					{ at: '<Suspense fallback={<p>Loading product…</p>}>', phase: 'commit', say: 'React finds the nearest <code>&lt;Suspense&gt;</code> and commits its fallback.', screen: { page: ['Loading product…', 'upd'] }, log: 'screen: Loading' },
					{ phase: 'trigger', say: 'The promise fulfills. React was listening, and schedules a retry.', log: '← GET' },
					{ at: ['const product = use(productPromise)', 'return <h2>{product.name}</h2>'], phase: 'render', say: 'This time <code>use</code> returns the product <b>synchronously</b>, and the component runs to the end.', log: 'render finished' },
					{ phase: 'commit', say: 'The fallback is replaced by the content.', screen: { page: ['Desk Lamp · $39.00', 'ok'] } },
				],
			},
			{
				name: 'Rejected',
				intro: 'A product that doesn’t exist.',
				code: code('p999'),
				console: ['0 ms  → GET /products/p999', 'screen: Loading product…', '300 ms  ✗ No product with id "p999"', 'ProductDetails render started (×2)', 'screen: Couldn’t load this product.'],
				steps: [
					{ at: 'const productPromise = fetchProduct', phase: 'trigger', say: 'The same start.', log: '→ GET' },
					{ at: '<Suspense fallback={<p>Loading product…</p>}>', phase: 'commit', say: 'Pending, so the fallback shows.', screen: { page: ['Loading product…', 'upd'] }, log: 'screen: Loading' },
					{ phase: 'trigger', say: 'The promise rejects.', log: '✗ No product' },
					{ at: 'const product = use(productPromise)', phase: 'render', say: 'On the retry, <code>use</code> throws the rejection <b>reason</b>, a real error. React renders once more to be sure, then gives up.', log: '(×2)' },
					{ at: '<ErrorBoundary fallback={<p>Couldn’t load this product.</p>}>', phase: 'commit', say: 'The nearest <b>error boundary</b>, outside the <code>Suspense</code>, shows its fallback.', screen: { page: ['Couldn’t load this product.', 'bad'] }, log: 'screen: Couldn’t' },
				],
			},
		],
	})
}

// ─── Switching products: urgent vs transition ──────────────────────────────

export function transitionAnim() {
	const code = (click) => `
const productCache = new Map()
function getProduct(id) {
  if (!productCache.has(id)) productCache.set(id, fetchProduct(id))
  return productCache.get(id) // the same promise for the same id
}

function ProductSwitcher() {
  const [id, setId] = useState('p1')
  const [isPending, startTransition] = useTransition()
  return (<>
    <button onClick={() => ${click}}>Desk Lamp</button>
    <Suspense fallback={<p>Loading product…</p>}>
      <ProductDetails id={id} /> {/* use(getProduct(id)) */}
    </Suspense>
  </>)
}`
	const screen = [['page', 'Ceramic Mug', 'box']]
	return codeAnim({
		id: 'suspense-transition-anim',
		caption: 'Switching from the Ceramic Mug to the Desk Lamp, whose request takes 500 ms (both versions recorded).',
		file: 'ProductSwitcher.tsx',
		screen,
		scenarios: [
			{
				name: 'setId (urgent)',
				intro: 'A plain state update.',
				code: code("setId('p4')"),
				steps: [
					{ at: "onClick={() => setId('p4')}", phase: 'event', say: 'Click <b>Desk Lamp</b>.' },
					{ at: 'productCache.set(id, fetchProduct(id))', phase: 'render', say: 'The new id renders <code>ProductDetails</code>, which asks the cache for p4: a new request, so it suspends.' },
					{ at: '<Suspense fallback={<p>Loading product…</p>}>', phase: 'commit', say: 'An urgent update that suspends <b>replaces</b> the content with the fallback: the mug disappears for 500 ms.', screen: { page: ['Loading product…', 'bad'] } },
					{ phase: 'commit', say: 'The data arrives and the lamp appears.', screen: { page: ['Desk Lamp', 'ok'] } },
				],
			},
			{
				name: 'startTransition',
				intro: 'The update wrapped in <code>startTransition</code>.',
				code: code("startTransition(() => setId('p4'))"),
				steps: [
					{ at: "startTransition(() => setId('p4'))", phase: 'event', say: 'Click <b>Desk Lamp</b>. <code>isPending</code> becomes true right away, so the page can dim itself.', screen: { page: ['Ceramic Mug (dimmed) ⏳', 'upd'] } },
					{ at: 'productCache.set(id, fetchProduct(id))', phase: 'render', say: 'The transition render suspends on the new product…' },
					{ at: '<Suspense fallback={<p>Loading product…</p>}>', phase: 'render', say: '…and React <b>keeps the current content</b> instead of showing the fallback: a transition doesn’t hide content that’s already on screen.' },
					{ phase: 'commit', say: '500 ms later, the new content replaces the old in one step. (Going back to the cached mug made no request.)', screen: { page: ['Desk Lamp', 'ok'] } },
				],
			},
		],
	})
}

// ─── Optimistic UI ─────────────────────────────────────────────────────────

export function optimisticAnim() {
	const screen = [
		['list', 'Ana: Keeps my tea hot.', 'box'],
		['btn', 'Post review', 'button'],
	]
	return codeAnim({
		id: 'suspense-optimistic-anim',
		caption: 'Posting a review “Great lamp!”; the server takes 800 ms (all three versions recorded).',
		file: 'Reviews.tsx',
		screen,
		scenarios: [
			{
				name: 'useState',
				intro: 'Try to show the review with <code>setReviews</code> before the request.',
				code: `
function Reviews() {
  const [reviews, setReviews] = useState(initial)
  async function addReview(formData) {
    setReviews(r => [...r, temp(formData)]) // show it right away?
    const saved = await postReview(formData)
    setReviews(r => [...replaceTemp(r), saved])
  }
  return <form action={addReview}>… <SubmitButton /></form>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button>{pending ? 'Posting…' : 'Post review'}</button>
}`,
				steps: [
					{ at: ['<form action={addReview}>', 'setReviews(r => [...r, temp(formData)])'], phase: 'event', say: 'Submit. The form action runs inside a transition, and the <code>setReviews</code> before the request is part of it…' },
					{ at: "return <button>{pending ? 'Posting…' : 'Post review'}</button>", phase: 'commit', say: '…so React holds it back until the whole action ends. Only the button shows progress, through <code>useFormStatus</code>.', screen: { btn: ['Posting…', 'upd'], list: ['Ana: Keeps my tea hot. (no new review yet)', 'bad'] } },
					{ at: 'const saved = await postReview(formData)', phase: 'commit', say: 'The review appears only when the server answers, 800 ms after clicking.', screen: { btn: 'Post review', list: ['Ana · You: Great lamp!', 'upd'] } },
				],
			},
			{
				name: 'useOptimistic',
				intro: 'An optimistic list, shown during the action.',
				code: `
function Reviews() {
  const [reviews, setReviews] = useState(initial)
  const [shown, addOptimistic] = useOptimistic(reviews,
    (current, text) => [...current, { text, sending: true }])
  async function addReview(formData) {
    addOptimistic(formData.get('text'))
    const saved = await postReview(formData)
    setReviews(r => [...r, saved]) // after an await
  }
  return <form action={addReview}>…</form>
}`,
				steps: [
					{ at: "addOptimistic(formData.get('text'))", phase: 'commit', say: 'An optimistic value is allowed to render <b>during</b> the transition: the review shows immediately, marked as sending.', screen: { btn: ['Posting…', 'upd'], list: ['Ana · You: Great lamp! (sending…)', 'ok'] } },
					{ at: 'setReviews(r => [...r, saved]) // after an await', phase: 'commit', say: 'The server answers. But a <code>setReviews</code> after an <code>await</code> isn’t part of the action any more: it renders on its own while the optimistic copy still exists.', screen: { list: ['Ana · You: Great lamp! · You: Great lamp! (sending…)', 'bad'] } },
					{ phase: 'commit', say: 'Recorded: the review appeared twice for a moment, then the action ended and the optimistic value fell back to the real list.', screen: { btn: 'Post review', list: ['Ana · You: Great lamp!', 'ok'] } },
				],
			},
			{
				name: '+ startTransition',
				intro: 'The update after the <code>await</code> wrapped in <code>startTransition</code>.',
				code: `
function Reviews() {
  const [reviews, setReviews] = useState(initial)
  const [shown, addOptimistic] = useOptimistic(reviews,
    (current, text) => [...current, { text, sending: true }])
  async function addReview(formData) {
    addOptimistic(formData.get('text'))
    const saved = await postReview(formData)
    startTransition(() => setReviews(r => [...r, saved]))
  }
  return <form action={addReview}>…</form>
}`,
				steps: [
					{ at: "addOptimistic(formData.get('text'))", phase: 'commit', say: 'Shown immediately, as before.', screen: { btn: ['Posting…', 'upd'], list: ['Ana · You: Great lamp! (sending…)', 'ok'] } },
					{ at: 'startTransition(() => setReviews(r => [...r, saved]))', phase: 'commit', say: '<code>startTransition</code> puts the update back into the action. Recorded: the real review replaced the optimistic one in a single step, with no duplicate.', screen: { btn: 'Post review', list: ['Ana · You: Great lamp!', 'ok'] } },
				],
			},
		],
	})
}

// ─── Images ────────────────────────────────────────────────────────────────

export function imagesAnim() {
	const screen = [
		['details', 'Ceramic Mug · $18.00', 'text'],
		['img', '🖼 mug picture', 'box'],
	]
	return codeAnim({
		id: 'suspense-images-anim',
		caption: 'Switching to the Desk Lamp in a transition: its data takes 200 ms, its picture 600 ms (all three versions recorded).',
		file: 'ProductImage.tsx',
		screen,
		scenarios: [
			{
				name: 'Plain <img>',
				intro: 'The new <code>src</code> is just rendered.',
				code: `
function Details({ id }) {
  const product = use(getProduct(id)) // 200 ms
  return (<article>
    <img src={product.image} />  {/* 600 ms */}
    <h2>{product.name}</h2>
  </article>)
}`,
				steps: [
					{ at: 'const product = use(getProduct(id))', phase: 'render', say: 'The transition waits for the product data only.' },
					{ at: '<img src={product.image} />', phase: 'commit', say: 'After 200 ms the new name and price commit, with <code>src</code> pointing at the new picture…', screen: { details: 'Desk Lamp · $39.00', img: ['🖼 mug picture (still)', 'bad'] } },
					{ phase: 'paint', say: '…but the browser keeps showing the <b>old</b> picture until the new one has loaded: about 600 ms of the lamp’s details next to the mug.', screen: { img: ['🖼 lamp picture', 'ok'] } },
				],
			},
			{
				name: 'Suspend on the image',
				intro: 'The image component suspends until the picture has loaded.',
				code: `
function Img({ src }) {
  use(preloadImage(src)) // resolves on the image's load event
  return <img src={src} />
}

function Details({ id }) {
  const product = use(getProduct(id))
  return (<article>
    <Img src={product.image} />
    <h2>{product.name}</h2>
  </article>)
}`,
				steps: [
					{ at: 'const product = use(getProduct(id))', phase: 'render', say: 'The data arrives after 200 ms…' },
					{ at: 'use(preloadImage(src))', phase: 'render', say: '…then the image component suspends on a promise that resolves when the picture has loaded. The transition waits for both.' },
					{ phase: 'commit', say: 'After 600 ms more, data and picture switch together. But the details waited for the picture, and one broken picture now breaks the whole card (recorded: “Couldn’t load this product.”).', screen: { details: ['Desk Lamp · $39.00', 'ok'], img: ['🖼 lamp picture', 'ok'] } },
				],
			},
			{
				name: 'Keyed boundary',
				intro: 'The image gets its own boundaries, keyed by <code>src</code>.',
				code: `
function ProductImage({ src }) {
  return (
    <ErrorBoundary key={src} fallback={<span>Image unavailable</span>}>
      <Suspense fallback={<span>🖼️</span>}>
        <Img src={src} />
      </Suspense>
    </ErrorBoundary>
  )
}`,
				steps: [
					{ at: '<ErrorBoundary key={src}', phase: 'render', say: 'With <code>key={src}</code>, the image boundaries are <b>new</b> for every picture. A transition only protects content that’s already on screen, so a new boundary may show its fallback.' },
					{ at: '<Suspense fallback={<span>🖼️</span>}>', phase: 'commit', say: 'So the details commit after 200 ms, with a placeholder where the picture goes.', screen: { details: ['Desk Lamp · $39.00', 'ok'], img: ['🖼️ placeholder', 'upd'] } },
					{ at: '<Img src={src} />', phase: 'commit', say: 'The picture replaces the placeholder when it’s ready. For a broken picture, the narrow error boundary shows “Image unavailable” and the details stay (recorded).', screen: { img: ['🖼 lamp picture', 'ok'] } },
				],
			},
		],
	})
}

// ─── Search: transition vs deferred value ──────────────────────────────────

export function deferredSearchAnim() {
	const results = `
function Results({ query }) {
  const products = use(search(query)) // 400 ms per query, cached
  return <p>{products.length} results for "{query}"</p>
}
`
	const screen = [
		['input', '', 'input'],
		['results', '6 results for ""', 'box'],
	]
	return codeAnim({
		id: 'suspense-search-anim',
		caption: 'Typing “la” quickly into a search whose results come from the server, 400 ms per search (both versions recorded).',
		file: 'Search.tsx',
		screen,
		scenarios: [
			{
				name: 'startTransition',
				intro: 'The query state is updated inside a transition.',
				code: `${results}
function Search() {
  const [query, setQuery] = useState('')
  return (<>
    <input value={query}
      onChange={e => startTransition(() => setQuery(e.target.value))} />
    <Suspense fallback="Searching…"><Results query={query} /></Suspense>
  </>)
}`,
				steps: [
					{ at: 'onChange={e => startTransition(', phase: 'event', say: 'Type “l”. The input’s own value is this transition state, which waits for the results, so React puts the old value back in the box.', screen: { input: ['', 'bad'] } },
					{ at: 'onChange={e => startTransition(', phase: 'event', say: 'Type “a”. It lands in an empty box, so the query becomes “a”, not “la”.', screen: { input: ['a', 'bad'] } },
					{ at: 'const products = use(search(query))', phase: 'commit', say: 'Recorded: the box ended up containing “a”, and the results were for “a”. The typed “l” was lost.', screen: { results: ['5 results for "a"', 'bad'] } },
				],
			},
			{
				name: 'useDeferredValue',
				intro: 'The query stays urgent; the results use a deferred copy.',
				code: `${results}
function Search() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  return (<>
    <input value={query} onChange={e => setQuery(e.target.value)} />
    <Suspense fallback="Searching…">
      <Results query={deferredQuery} />
    </Suspense>
  </>)
}`,
				steps: [
					{ at: 'onChange={e => setQuery(e.target.value)}', phase: 'event', say: 'Type “l”. The urgent render updates the input right away; the results still get the old deferred value, so nothing suspends.', screen: { input: ['l', 'ok'] } },
					{ at: '<Results query={deferredQuery} />', phase: 'render', say: 'The background render with the new value suspends, so React keeps the old results; dim them with <code>query !== deferredQuery</code>.', screen: { results: ['6 results for "" (dimmed)', 'upd'] } },
					{ at: 'onChange={e => setQuery(e.target.value)}', phase: 'event', say: 'Type “a”: typing continues normally.', screen: { input: ['la', 'ok'] } },
					{ at: 'const products = use(search(query))', phase: 'commit', say: 'The latest results replace the stale ones. The in-between search for “l” was never shown.', screen: { results: ['1 result for "la"', 'ok'] } },
				],
			},
		],
	})
}

// ─── Waterfalls ────────────────────────────────────────────────────────────

export function waterfallAnim() {
	const page = `
function ProductPage({ id }) {
  const product = use(getProduct(id)) // 300 ms
  return (<article>
    <h2>{product.name}</h2>
    <Suspense fallback="Loading picture and reviews…">
      <ProductImage src={product.image} /> {/* 600 ms */}
      <Reviews id={id} />                  {/* 300 ms */}
    </Suspense>
  </article>)
}
`
	const screen = [['page', '(loading)', 'box']]
	return codeAnim({
		id: 'suspense-waterfall-anim',
		caption: 'A product page needs the product (300 ms), its picture (600 ms) and its reviews (300 ms). Times since the page started (both versions recorded).',
		file: 'ProductPage.tsx',
		screen,
		scenarios: [
			{
				name: 'Fetch on render',
				intro: 'Each component starts its own request when it renders.',
				code: page,
				console: ['0 ms  → GET /products/p4', '300 ms  → GET /img/p4.svg', '900 ms  → GET /products/p4/reviews', '1200 ms  page complete'],
				steps: [
					{ at: 'const product = use(getProduct(id))', phase: 'trigger', say: '<code>ProductPage</code> renders and suspends on the product.', log: '0 ms  → GET /products/p4' },
					{ at: '<ProductImage src={product.image} />', phase: 'render', say: 'Only once the product is known do its children render and ask for the picture.', log: '300 ms  → GET /img/p4.svg' },
					{ at: '<Reviews id={id} />', phase: 'render', say: 'And here even the reviews waited for the picture: they didn’t start until it had loaded.', log: '900 ms  → GET /products/p4/reviews' },
					{ phase: 'commit', say: 'Three steps, one after another.', screen: { page: ['Complete after 1,200 ms', 'bad'] }, log: '1200 ms  page complete' },
				],
			},
			{
				name: 'Start everything first',
				intro: '<code>startLoading(id)</code> runs before rendering.',
				code: `
function startLoading(id) {
  getProduct(id)                 // start, don't wait
  getReviews(id)
  preloadImage(\`/img/\${id}.svg\`)
}

startLoading('p4') // in a route loader or click handler
root.render(<ProductPage id="p4" />)
${page}`,
				console: ['0 ms  → product, reviews and picture', '300 ms  ← product, reviews', '600 ms  page complete'],
				steps: [
					{ at: "startLoading('p4')", phase: 'trigger', say: 'All three requests start together, from code that runs before React renders (a route loader, a click handler).', log: '0 ms  → product, reviews and picture' },
					{ at: 'const product = use(getProduct(id))', phase: 'render', say: 'The components didn’t change: their <code>use</code> calls find the promises already in the caches.', log: '300 ms  ← product, reviews' },
					{ phase: 'commit', say: 'The total time is the slowest request, half of the waterfall.', screen: { page: ['Complete after 600 ms', 'ok'] }, log: '600 ms  page complete' },
				],
			},
		],
	})
}
