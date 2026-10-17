// Animations for the Hooks module, in the "code + screen" style
// (src/lib/anim-code.mjs). Every outcome shown was recorded from
// examples/product-store (src/lessons/hooks, scripts/record.mjs → generated/hooks.json).

import { codeAnim } from './anim-code.mjs'

// ─── Managing UI State: the controlled-input loop ──────────────────────────

export function controlledLoopAnim() {
	const screen = [
		['input', 'lamp', 'input'],
		['office', '☐ office', 'text'],
		['audio', '☐ audio', 'text'],
		['results', 'Results for “lamp”: 1 product', 'muted'],
	]
	return codeAnim({
		id: 'hooks-controlled-anim',
		caption: 'A search box plus category checkboxes that edit the same query. An input is controlled when every render tells it what to show (both versions recorded).',
		file: 'Search.tsx',
		screen,
		scenarios: [
			{
				name: 'onChange only',
				intro: 'The input reports its changes, but nothing writes <code>query</code> back into it.',
				code: `
function Search() {
  const [query, setQuery] = useState('')
  return (<>
    <input onChange={e => setQuery(e.target.value)} />
    <input type="checkbox" name="office"
      onChange={e => toggle('office', e.target.checked)} />
    <Results query={query} />
  </>)
}`,
				steps: [
					{ at: "toggle('office'", phase: 'event', say: 'The user typed “lamp”, then ticks <b>office</b>. The checkbox adds the word to the query.', screen: { office: '☑ office' } },
					{ at: "const [query, setQuery] = useState('')", phase: 'render', say: 'State changes to <code>"lamp office"</code> and React re-renders.', screen: { results: 'Results for “lamp office”' } },
					{ at: '<input onChange=', phase: 'render', say: 'Nothing tells the input what to show, so it keeps its own text. Recorded: the box still read <code>"lamp"</code> while the results used <code>"lamp office"</code>.', screen: { input: ['lamp', 'bad'] } },
					{ at: 'name="office"', say: 'It fails the other way too: typing “audio” didn’t tick the audio checkbox (recorded: <code>audioChecked: false</code>). Two copies of the truth, already out of sync.', screen: { audio: ['☐ audio (typed, but not ticked)', 'bad'] } },
				],
			},
			{
				name: 'value + onChange',
				intro: 'The same component with <code>value={query}</code> and a derived <code>checked</code>.',
				code: `
function Search() {
  const [query, setQuery] = useState('')
  const words = query.split(' ')
  return (<>
    <input value={query}
      onChange={e => setQuery(e.target.value)} />
    <input type="checkbox" name="office"
      checked={words.includes('office')}
      onChange={e => toggle('office', e.target.checked)} />
    <Results query={query} />
  </>)
}`,
				steps: [
					{ at: "toggle('office'", phase: 'event', say: 'The same click on <b>office</b>.', screen: { office: '☑ office' } },
					{ at: "const [query, setQuery] = useState('')", phase: 'render', say: 'The same state change.', screen: { results: 'Results for “lamp office”' } },
					{ at: ['<input value={query}', "checked={words.includes('office')}"], phase: 'render', say: 'Now every render <b>writes the state back</b>: the input shows <code>query</code>, and each checkbox is computed from its words.' },
					{ phase: 'commit', say: 'Recorded: the box read <code>"lamp office"</code>, and typing “audio” ticked the audio checkbox. One source of truth.', screen: { input: ['lamp office', 'ok'], audio: ['☑ audio (follows the text)', 'ok'] } },
				],
			},
		],
	})
}

// ─── Side Effects: listeners pile up without cleanup ───────────────────────

export function listenerLeakAnim() {
	const screen = [
		['comp', 'Search: shown', 'text'],
		['listeners', 'popstate listeners on window: 1', 'box'],
	]
	return codeAnim({
		id: 'hooks-leak-anim',
		caption: 'The search box listens for the browser’s Back button. Hide and show it three times, then press Back (both versions recorded).',
		file: 'Search.tsx',
		screen,
		consoleTitle: 'Console after pressing Back (recorded)',
		scenarios: [
			{
				name: 'No cleanup',
				intro: 'The effect adds a listener and never removes it.',
				code: `
useEffect(() => {
  const id = nextId++
  window.addEventListener('popstate', () => {
    log(\`popstate listener #\${id} runs\`)
    setQuery(getQueryParam())
  })
}, [])`,
				console: ['popstate listener #1 runs', 'popstate listener #2 runs', 'popstate listener #3 runs', 'popstate listener #4 runs'],
				steps: [
					{ at: "window.addEventListener('popstate'", phase: 'effect', say: 'On mount, the effect adds listener #1 to <code>window</code>.' },
					{ phase: 'commit', say: 'Hide the search: the component unmounts, but nothing removes its listener. It stays on <code>window</code>, and its closure keeps the dead component’s data alive.', screen: { comp: 'Search: hidden', listeners: ['popstate listeners on window: 1 (orphaned)', 'bad'] } },
					{ at: "window.addEventListener('popstate'", phase: 'effect', say: 'Show it again: a fresh effect adds listener #2. Two more hide/show cycles add #3 and #4.', screen: { comp: 'Search: shown', listeners: ['popstate listeners on window: 4', 'bad'] } },
					{ at: 'log(`popstate listener', phase: 'event', say: 'One press of Back runs <b>every</b> listener, three of them for components that no longer exist.', log: ['#1 runs', '#2 runs', '#3 runs', '#4 runs'] },
				],
			},
			{
				name: 'With cleanup',
				intro: 'The effect returns a function that removes its listener.',
				code: `
useEffect(() => {
  const id = nextId++
  function updateQuery() {
    log(\`popstate listener #\${id} runs\`)
    setQuery(getQueryParam())
  }
  window.addEventListener('popstate', updateQuery)
  return () => window.removeEventListener('popstate', updateQuery)
}, [])`,
				console: ['popstate listener #4 runs'],
				steps: [
					{ at: "window.addEventListener('popstate', updateQuery)", phase: 'effect', say: 'On mount, the effect adds listener #1.' },
					{ at: 'return () => window.removeEventListener', phase: 'commit', say: 'Hide the search: React runs the <b>cleanup</b>, which removes listener #1.', screen: { comp: 'Search: hidden', listeners: ['popstate listeners on window: 0', 'ok'] } },
					{ at: "window.addEventListener('popstate', updateQuery)", phase: 'effect', say: 'Each show adds one listener; each hide removes it. After three cycles there’s exactly one, #4.', screen: { comp: 'Search: shown', listeners: ['popstate listeners on window: 1', 'ok'] } },
					{ at: 'log(`popstate listener', phase: 'event', say: 'Back runs only the mounted component’s listener.', log: '#4 runs' },
				],
			},
		],
	})
}

// ─── React Lifecycle: the recorded order ───────────────────────────────────

export function lifecycleAnim() {
	return codeAnim({
		id: 'hooks-lifecycle-anim',
		caption: 'A cart badge with one layout effect and one effect, each logging its <code>count</code>. Mount, one update, unmount: every line below was logged in this order.',
		file: 'CartBadge.tsx',
		code: `
function CartBadge({ count }) {
  log(\`render (count = \${count})\`)
  useLayoutEffect(() => {
    log(\`layout effect (count = \${count})\`)
    return () => log(\`layout cleanup (count = \${count})\`)
  }, [count])
  useEffect(() => {
    log(\`effect (count = \${count})\`)
    return () => log(\`effect cleanup (count = \${count})\`)
  }, [count])
  return <span>{count} in cart</span>
}`,
		screen: [['badge', '(not on screen)', 'box']],
		console: [
			'render (count = 0)',
			'layout effect (count = 0)',
			'effect (count = 0)',
			'render (count = 1)',
			'layout cleanup (count = 0)',
			'layout effect (count = 1)',
			'effect cleanup (count = 0)',
			'effect (count = 1)',
			'layout cleanup (count = 1)',
			'effect cleanup (count = 1)',
		],
		scenarios: [
			{
				name: 'Mount → update → unmount',
				intro: 'Press <b>Play</b>, or step through with the arrows.',
				steps: [
					{ at: 'log(`render', phase: 'render', say: '<b>Mount.</b> The function runs, the hooks are created, and JSX is returned.', log: 'render (count = 0)' },
					{ at: 'log(`layout effect', phase: 'commit', say: 'React puts the <code>&lt;span&gt;</code> in the DOM, then runs layout effects <b>before the browser paints</b>, so they can measure or adjust without a flicker.', screen: { badge: '0 in cart' }, log: 'layout effect (count = 0)' },
					{ at: 'log(`effect (', phase: 'effect', say: 'Then the regular effect. React doesn’t make the browser wait for it.', log: 'effect (count = 0)' },
					{ at: 'log(`render', phase: 'render', say: '<b>Update</b> (count becomes 1). The function runs again <b>first</b>. Nothing has been cleaned up yet.', log: 'render (count = 1)' },
					{ at: ['log(`layout cleanup', 'log(`layout effect'], phase: 'commit', say: 'During the commit: the old layout effect’s cleanup (with <b>count = 0</b>, its own render’s value), then the new layout effect.', screen: { badge: '1 in cart' }, log: ['layout cleanup (count = 0)', 'layout effect (count = 1)'] },
					{ at: ['log(`effect cleanup', 'log(`effect ('], phase: 'effect', say: 'Then the same for the regular effect. A cleanup always sees the values of the render that created it.', log: ['effect cleanup (count = 0)', 'effect (count = 1)'] },
					{ at: ['log(`layout cleanup', 'log(`effect cleanup'], phase: 'commit', say: '<b>Unmount.</b> No render: React runs the remaining cleanups one last time and removes the DOM.', screen: { badge: ['(removed)', 'upd'] }, log: ['layout cleanup (count = 1)', 'effect cleanup (count = 1)'] },
				],
			},
		],
	})
}

// ─── Lifting State: who re-renders on a heart click ────────────────────────

export function liftAnim() {
	const screen = [
		['list', 'Ceramic Mug ♡ · Trail Backpack ♡ · Desk Lamp ♡ …', 'box'],
		['search', 'Search: (empty)', 'input'],
	]
	const renders = ['ProductGrid', 'Backpack card', 'Other cards (5)']
	return codeAnim({
		id: 'hooks-lift-anim',
		caption: 'The same heart button with its state in two places (both recorded).',
		file: 'ProductGrid.tsx',
		screen,
		renders,
		scenarios: [
			{
				name: 'Lifted to ProductGrid',
				intro: 'The <code>favorites</code> list lives in the grid and is passed to each card.',
				code: `
function ProductGrid({ query }) {
  const [favorites, setFavorites] = useState([])
  const found = searchProducts(query)
    .sort(byFavorite(favorites))
  return found.map(p => (
    <Card key={p.id} product={p}
      isFavorite={favorites.includes(p.id)}
      onToggle={() => setFavorites(toggle(p.id))} />
  ))
}`,
				steps: [
					{ at: 'onToggle={() => setFavorites', phase: 'event', say: 'Click ♡ on the Trail Backpack. The card calls <code>onToggle</code>, a function from <code>ProductGrid</code>.' },
					{ at: 'const [favorites, setFavorites]', phase: 'render', say: 'The state lives in <code>ProductGrid</code>, so the re-render starts there. Recorded: the grid and all six cards rendered.', rendered: { ProductGrid: 'ran', Backpack: 'ran', Other: 'ran' } },
					{ at: '.sort(byFavorite(favorites))', phase: 'commit', say: 'In return, the grid can <b>sort</b> favorites first: the Backpack moved to the top.', screen: { list: ['Trail Backpack ♥ · Ceramic Mug ♡ · Desk Lamp ♡ …', 'ok'] } },
					{ phase: 'commit', say: 'Search “mug”, then clear it. The Backpack is filtered out and comes back still ♥, because the grid that holds the state never unmounted.', screen: { search: 'Search: mug → (cleared)', list: ['Trail Backpack ♥ · Ceramic Mug ♡ …', 'ok'] } },
				],
			},
			{
				name: 'Colocated in Card',
				intro: 'Each card owns its own <code>isFavorite</code>.',
				code: `
function Card({ product }) {
  const [isFavorite, setIsFavorite] = useState(false)
  return (
    <li>
      {product.name}
      <button onClick={() => setIsFavorite(!isFavorite)}>
        {isFavorite ? '♥' : '♡'}
      </button>
    </li>
  )
}`,
				steps: [
					{ at: 'onClick={() => setIsFavorite', phase: 'event', say: 'Click ♡ on the Trail Backpack. The card owns its state.' },
					{ at: 'const [isFavorite, setIsFavorite]', phase: 'render', say: 'The re-render starts at that card. Recorded: one line, <code>Card p3 renders</code>. Less work and simpler props, but nothing above can sort by favorites.', rendered: { Backpack: 'ran' }, screen: { list: 'Ceramic Mug ♡ · Trail Backpack ♥ · Desk Lamp ♡ …' } },
					{ phase: 'commit', say: 'Search “mug”: the Backpack’s card unmounts, and its state with it.', screen: { search: 'Search: mug' }, rendered: { Backpack: 'unmounted' } },
					{ phase: 'commit', say: 'Clear the search: the card comes back as a <b>new</b> instance, ♡ again (recorded). Colocated state lives only as long as its component.', screen: { search: 'Search: (cleared)', list: ['Ceramic Mug ♡ · Trail Backpack ♡ · Desk Lamp ♡ …', 'bad'] } },
				],
			},
		],
	})
}

// ─── DOM refs: what React compares ─────────────────────────────────────────

export function depsCompareAnim() {
	const screen = [
		['qty', 'Quantity: 1', 'button'],
		['zoom', 'Zoom on hover: attached (scale 1.2)', 'box'],
	]
	return codeAnim({
		id: 'hooks-deps-anim',
		caption: 'A product photo zooms on hover through a small non-React library. Clicking “Quantity” (unrelated state) shows how effect dependencies are compared (both recorded).',
		file: 'ProductPhoto.tsx',
		screen,
		consoleTitle: 'Console after two Quantity clicks (recorded)',
		scenarios: [
			{
				name: '[options] (object)',
				intro: 'The effect depends on an object built during render.',
				code: `
function ProductPhoto({ scale, speed }) {
  const ref = useRef(null)
  const options = { scale, speed } // new every render
  useEffect(
    () => attachZoom(ref.current, options),
    [options],
  )
  return <img ref={ref} alt="Ceramic Mug" />
}`,
				console: ['click 1: zoom destroyed', 'click 1: attachZoom(scale 1.2)', 'click 2: zoom destroyed', 'click 2: attachZoom(scale 1.2)'],
				steps: [
					{ phase: 'event', say: 'Click “Quantity”. Unrelated state changes, so the product re-renders.', screen: { qty: 'Quantity: 2' } },
					{ at: 'const options = { scale, speed }', phase: 'render', say: 'The render creates a <b>new</b> <code>options</code> object with the same contents.' },
					{ at: '[options],', phase: 'commit', say: 'React compares each dependency with <code>Object.is</code>, and objects compare by identity. Recorded: <code>Object.is(a, b) → false</code> for two equal objects.' },
					{ at: 'attachZoom(ref.current, options)', phase: 'effect', say: 'So React tears the zoom down and sets it up again, on <b>every</b> click.', screen: { zoom: ['Zoom: destroyed and attached again', 'bad'] }, log: ['click 1: zoom destroyed', 'click 1: attachZoom(scale 1.2)', 'click 2: zoom destroyed', 'click 2: attachZoom(scale 1.2)'] },
				],
			},
			{
				name: '[scale, speed]',
				intro: 'The effect depends on the two numbers and builds the object inside.',
				code: `
function ProductPhoto({ scale, speed }) {
  const ref = useRef(null)
  useEffect(
    () => attachZoom(ref.current, { scale, speed }),
    [scale, speed],
  )
  return <img ref={ref} alt="Ceramic Mug" />
}`,
				console: ['(nothing logged)'],
				steps: [
					{ phase: 'event', say: 'The same unrelated click.', screen: { qty: 'Quantity: 2' } },
					{ at: '[scale, speed],', phase: 'commit', say: 'The dependencies are plain numbers, and numbers compare by value: <code>Object.is(1.2, 1.2)</code> is true, so nothing “changed”.' },
					{ phase: 'effect', say: 'The effect doesn’t run. Recorded: nothing logged for two clicks. Only “Bigger zoom” (scale 1.5) re-ran it, once.', screen: { zoom: ['Zoom on hover: untouched', 'ok'] }, log: 'nothing logged' },
				],
			},
		],
	})
}

// ─── useId: two forms on one page ──────────────────────────────────────────

export function useIdAnim() {
	const screen = [
		['mug', 'Ceramic Mug review: Title · Your name', 'box'],
		['lamp', 'Desk Lamp review: Title · Your name', 'box'],
		['focus', 'Focused: –', 'muted'],
	]
	return codeAnim({
		id: 'hooks-useid-anim',
		caption: 'Two review forms on one product page, built from the same <code>Field</code> component (both recorded).',
		file: 'Field.tsx',
		screen,
		scenarios: [
			{
				name: 'id="review-title"',
				intro: 'Every field uses the same hard-coded id.',
				code: `
function Field({ label, ...props }) {
  return (<div>
    <label htmlFor="review-title">{label}</label>
    <input id="review-title" {...props} />
  </div>)
}`,
				steps: [
					{ at: 'id="review-title"', phase: 'render', say: 'Four fields on the page, four inputs with the <b>same</b> id.' },
					{ at: 'htmlFor="review-title"', phase: 'event', say: 'Click the label “Your name” in the <b>Desk Lamp</b> form. A label focuses the element whose <code>id</code> matches its <code>htmlFor</code>…', screen: { lamp: [null, 'upd'] } },
					{ say: '…and with duplicate ids the browser picks the <b>first</b> one in the document. Recorded: focus went to the Ceramic Mug form’s Title field.', screen: { focus: ['Focused: Ceramic Mug › Title', 'bad'] } },
				],
			},
			{
				name: 'useId()',
				intro: 'Every field calls <code>useId()</code>.',
				code: `
function Field({ label, ...props }) {
  const id = useId()
  return (<div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...props} />
  </div>)
}`,
				steps: [
					{ at: 'const id = useId()', phase: 'render', say: 'Each <code>Field</code> instance gets its own id, based on its place in the tree. Recorded: <code>_r_0_</code> to <code>_r_3_</code>.' },
					{ at: 'htmlFor={id}', phase: 'event', say: 'Click “Your name” in the Desk Lamp form.', screen: { lamp: [null, 'upd'] } },
					{ say: 'Recorded: focus went to the Desk Lamp form’s name field, the right one.', screen: { focus: ['Focused: Desk Lamp › Your name', 'ok'] } },
				],
			},
		],
	})
}

// ─── Cart: the update queue ─────────────────────────────────────────────────

export function updateQueueAnim() {
	const screen = [['btn', 'Add 2 (now 1)', 'button']]
	return codeAnim({
		id: 'hooks-queue-anim',
		caption: 'An “Add 2” button clicked once, with the quantity starting at 1 (both versions recorded).',
		file: 'Quantity.tsx',
		screen,
		rendersTitle: 'React’s queue for qty',
		scenarios: [
			{
				name: 'setQty(qty + 1) ×2',
				intro: 'The new value is computed from this render’s <code>qty</code>.',
				code: `
function Quantity() {
  const [qty, setQty] = useState(1)
  function addTwo() {
    setQty(qty + 1) // first
    setQty(qty + 1) // second
  }
  return <button onClick={addTwo}>Add 2 (now {qty})</button>
}`,
				renders: ['first update', 'second update'],
				steps: [
					{ at: '// first', phase: 'event', say: 'In this render <code>qty</code> is <code>1</code>, so this queues “replace with <b>2</b>”.', rendered: { first: 'replace with 2' } },
					{ at: '// second', phase: 'event', say: '<code>qty</code> is <b>still</b> <code>1</code> in this closure (state doesn’t change during the handler), so this also queues “replace with <b>2</b>”.', rendered: { first: 'replace with 2' } },
					{ at: 'const [qty, setQty] = useState(1)', phase: 'render', say: 'React processes the queue: 2, then 2 again. One of the two increments was lost.', screen: { btn: ['Add 2 (now 2)', 'bad'] } },
				],
			},
			{
				name: 'setQty(q => q + 1) ×2',
				intro: 'Updater functions.',
				code: `
function Quantity() {
  const [qty, setQty] = useState(1)
  function addTwo() {
    setQty(q => q + 1) // first
    setQty(q => q + 1) // second
  }
  return <button onClick={addTwo}>Add 2 (now {qty})</button>
}`,
				renders: ['first update', 'second update'],
				steps: [
					{ at: '// first', phase: 'event', say: 'This queues a <b>function</b>, not a value.', rendered: { first: 'q => q + 1' } },
					{ at: '// second', phase: 'event', say: 'And another one.', rendered: { first: 'q => q + 1', second: 'q => q + 1' } },
					{ at: 'const [qty, setQty] = useState(1)', phase: 'render', say: 'React runs them in order, passing each one the result of the previous: 1 → 2 → 3. Recorded button: <code>Add 2 (now 3)</code>.', screen: { btn: ['Add 2 (now 3)', 'ok'] } },
				],
			},
		],
	})
}

// ─── useState vs useReducer: two effects, one snapshot ─────────────────────

export function staleSnapshotAnim() {
	const screen = [['state', 'past: [] · present: “Ceramic Mug”', 'box']]
	return codeAnim({
		id: 'hooks-snapshot-anim',
		caption: 'A “recently viewed” history with undo. Two effects record two products right after mount: three related values updated from a closure lose an entry; a reducer can’t (both recorded).',
		file: 'RecentlyViewed.tsx',
		screen,
		scenarios: [
			{
				name: 'Three useStates',
				intro: '<code>past</code>, <code>present</code> and <code>future</code> as separate state, updated from a callback.',
				code: `
const [past, setPast] = useState([])
const [present, setPresent] = useState('Ceramic Mug')
const set = useCallback(next => {
  setPast([...past, present]) // values from render 1
  setPresent(next)
}, [past, present])

useEffect(() => set('Desk Lamp'), [])
useEffect(() => set('Trail Backpack'), [])`,
				steps: [
					{ at: "set('Desk Lamp')", phase: 'effect', say: 'The first effect calls <code>set</code>. It was created in render 1, so it reads <code>past = []</code> and <code>present = "Ceramic Mug"</code>.' },
					{ at: 'setPast([...past, present])', phase: 'effect', say: 'It queues <code>past: ["Ceramic Mug"]</code> and <code>present: "Desk Lamp"</code>.' },
					{ at: "set('Trail Backpack')", phase: 'effect', say: 'The second effect calls the <b>same</b> function, with the same old snapshot. It also queues <code>past: ["Ceramic Mug"]</code>, overwriting the first.' },
					{ phase: 'render', say: 'Recorded final state: Desk Lamp is missing from the history.', screen: { state: ['past: [“Ceramic Mug”] · present: “Trail Backpack”', 'bad'] } },
				],
			},
			{
				name: 'useReducer',
				intro: 'One reducer owns all three values.',
				code: `
function historyReducer(state, action) {
  const { past, present } = state
  if (action.type === 'set') return {
    past: [...past, present],
    present: action.next, future: [],
  }
}

const [state, dispatch] = useReducer(historyReducer, initial)
const set = useCallback(next => dispatch({ type: 'set', next }), [])

useEffect(() => set('Desk Lamp'), [])
useEffect(() => set('Trail Backpack'), [])`,
				steps: [
					{ at: ["set('Desk Lamp')", "dispatch({ type: 'set', next })"], phase: 'effect', say: '<code>set</code> only dispatches an action. It reads no state, so there’s nothing to go stale.' },
					{ at: "set('Trail Backpack')", phase: 'effect', say: 'A second action is queued.' },
					{ at: 'past: [...past, present],', phase: 'render', say: 'React runs the reducer for each action with the <b>current</b> state; the second call sees the result of the first.', screen: { state: ['past: [“Ceramic Mug”, “Desk Lamp”] · present: “Trail Backpack”', 'ok'] } },
				],
			},
		],
	})
}

// ─── Re-rendering: the cascade and memo ────────────────────────────────────

export function cascadeAnim() {
	const renders = ['CartPage', 'Recommendations (memo)', 'CheckoutButton (memo)', 'Footer']
	const screen = [['add', 'Add (0)', 'button']]
	return codeAnim({
		id: 'hooks-cascade-anim',
		caption: 'One click on “Add” in a cart page. Who re-renders depends on memo and on whether props keep the same identity (both recorded).',
		file: 'CartPage.tsx',
		screen,
		renders,
		scenarios: [
			{
				name: 'Inline props',
				intro: 'An object and an arrow function written inline.',
				code: `
function CartPage() {
  const [count, setCount] = useState(0)
  return (<>
    <button onClick={() => setCount(c => c + 1)}>Add ({count})</button>
    <Recommendations options={{ limit: 3 }} />
    <CheckoutButton onCheckout={() => log('checkout')} />
    <Footer />
  </>)
}`,
				steps: [
					{ at: 'setCount(c => c + 1)', phase: 'event', say: 'A state change in <code>CartPage</code>: the only real trigger.', screen: { add: 'Add (1)' } },
					{ at: 'const [count, setCount]', phase: 'render', say: '<code>CartPage</code> runs again.', rendered: { CartPage: 'ran' } },
					{ at: ['options={{ limit: 3 }}', "onCheckout={() => log('checkout')}"], phase: 'render', say: 'It creates a <b>new</b> <code>options</code> object and a <b>new</b> function. <code>memo</code> compares props with <code>Object.is</code>, sees “changes”, and renders both anyway.', rendered: { CartPage: 'ran', Recommendations: 'ran', CheckoutButton: 'ran' } },
					{ at: '<Footer />', phase: 'commit', say: '<code>Footer</code> isn’t memoized, so it renders whenever its parent does. Recorded: all four rendered; <code>memo</code> did nothing.', rendered: { CartPage: 'ran', Recommendations: 'ran', CheckoutButton: 'ran', Footer: 'ran' } },
				],
			},
			{
				name: 'useMemo + useCallback',
				intro: 'The same props, kept stable between renders.',
				code: `
function CartPage() {
  const [count, setCount] = useState(0)
  const options = useMemo(() => ({ limit: 3 }), [])
  const onCheckout = useCallback(() => log('checkout'), [])
  return (<>
    <button onClick={() => setCount(c => c + 1)}>Add ({count})</button>
    <Recommendations options={options} />
    <CheckoutButton onCheckout={onCheckout} />
    <Footer />
  </>)
}`,
				steps: [
					{ at: 'setCount(c => c + 1)', phase: 'event', say: 'The same click.', screen: { add: 'Add (1)' } },
					{ at: ['useMemo(() => ({ limit: 3 }), [])', "useCallback(() => log('checkout'), [])"], phase: 'render', say: '<code>CartPage</code> runs, but <code>useMemo</code> and <code>useCallback</code> return the <b>same</b> object and function as last time.', rendered: { CartPage: 'ran' } },
					{ at: ['options={options}', 'onCheckout={onCheckout}'], phase: 'render', say: 'Every prop is <code>Object.is</code>-equal, so <code>memo</code> skips both children.', rendered: { CartPage: 'ran', Recommendations: 'skipped', CheckoutButton: 'skipped' } },
					{ at: '<Footer />', phase: 'commit', say: '<code>Footer</code> still renders: it has no <code>memo</code>. Recorded: only <code>CartPage</code> and <code>Footer</code>.', rendered: { CartPage: 'ran', Recommendations: 'skipped', CheckoutButton: 'skipped', Footer: 'ran' } },
				],
			},
		],
	})
}
