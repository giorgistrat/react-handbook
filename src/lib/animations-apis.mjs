// Animations for the Advanced React APIs module. Every outcome shown was recorded
// from examples/product-store (src/lessons/apis, scripts/record.mjs → generated/apis.json).

import { codeAnim } from './anim-code.mjs'

const lt = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const line = (k, code, s = '') => `<div class="an call" data-k="${k}"${s ? ` data-s="${s}"` : ''}><code>${lt(code)}</code></div>`
const logLine = (k, text, s = 'ghost') => `<div class="an" data-k="${k}" data-s="${s}">${lt(text)}</div>`

// ─── useReducer: dispatch → reducer → render (or bail out) ─────────────────

export function reducerAnim() {
	return codeAnim({
		id: 'apis-reducer-anim',
		caption: 'A cart keeps its items in a reducer. Click a button and follow which line runs, what renders and what changes on screen (both runs recorded).',
		file: 'cart.tsx (simplified)',
		code: `
// CartButtons (a memo component), on click:
dispatch({ type: 'added', id: 'p1' })   // mug
dispatch({ type: 'removed', id: 'p3' }) // backpack

function Cart() {
  const [cart, dispatch] =
    useReducer(cartReducer, initial)
  return (<>
    <FreeShippingNote total={total(cart)} />
    <CartButtons dispatch={dispatch} />
  </>)
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'added':
      return { items: [...state.items, newItem] }
    case 'removed':
      if (!inCart(state, action.id)) return state
      return { items: without(state, action.id) }
  }
}`,
		screen: [
			['total', 'Cart: 0 items · $0.00'],
			['add', 'Add mug', 'button'],
			['remove', 'Remove backpack', 'button'],
			['ship', '$50.00 to free shipping', 'muted'],
		],
		renders: ['Cart', 'FreeShippingNote', 'CartButtons (memo)'],
		scenarios: [
			{
				name: 'Add mug',
				intro: 'An action that changes the cart. Press <b>Play</b> or step with the arrows.',
				steps: [
					{ at: "type: 'added'", phase: 'event', say: 'The shopper clicks <b>Add mug</b>. The handler doesn’t change anything itself: it only <b>dispatches an action</b>, a plain object that says what happened.', screen: { add: [null, 'upd'] } },
					{ at: ["case 'added'", 'return { items: [...state.items'], phase: 'render', say: 'React calls <b>your reducer</b> with the current state and that action. The <code>\'added\'</code> case returns a <b>new</b> object.', rendered: { Cart: 'ran' } },
					{ at: 'useReducer(cartReducer', phase: 'render', say: 'The new state isn’t the same object as the old one, so <code>Cart</code> renders with it, and so does its child <code>FreeShippingNote</code>. <code>CartButtons</code> is skipped: it’s <code>memo</code>, and <code>dispatch</code> is the same function on every render.', rendered: { Cart: 'ran', FreeShippingNote: 'ran', CartButtons: 'skipped' } },
					{ phase: 'commit', say: 'React updates the page. Recorded: <code>Cart render: 1 items, $18.00</code>, then <code>FreeShippingNote render</code>.', screen: { total: ['Cart: 1 item · $18.00', 'ok'], ship: ['$32.00 to free shipping', 'ok'] } },
				],
			},
			{
				name: 'Remove what isn’t there',
				intro: 'An action that changes nothing: there’s no backpack in the cart.',
				steps: [
					{ at: "type: 'removed'", phase: 'event', say: 'The shopper clicks <b>Remove backpack</b>, but the cart has no backpack.', screen: { remove: [null, 'upd'] } },
					{ at: 'return state', phase: 'render', say: 'The <code>\'removed\'</code> case finds nothing to remove and returns <code>state</code> itself: the <b>same object</b>.', rendered: { Cart: 'ran' } },
					{ at: 'useReducer(cartReducer', phase: 'render', say: '<code>Cart</code> has already run (React runs the reducer while rendering it). Now React sees the same state object and <b>bails out</b>: no children render.', rendered: { Cart: 'bailed out', FreeShippingNote: 'skipped', CartButtons: 'skipped' } },
					{ phase: 'commit', say: 'Nothing changes on the page. Recorded: only <code>Cart render</code> was logged, no <code>FreeShippingNote render</code>.' },
				],
			},
		],
	})
}

// ─── Context: who re-renders when the value changes ────────────────────────

export function contextAnim() {
	const renders = ['App', 'CartProvider', 'Header (memo)', 'ProductGrid (memo)', 'ProductCard ×3', 'CartBadge', 'AddButton']
	const code = (value) => `
const ThemeContext = createContext('light')
const CartContext = createContext(null)

function CartProvider({ children }) {
  const [count, setCount] = useState(0)
  const value = ${value}
  return <CartContext value={value}>{children}</CartContext>
}

function ProductCard({ name }) {
  const theme = use(ThemeContext)
  return <article className={theme}>{name}</article>
}

function CartBadge() {
  const { count } = use(CartContext)
  return <span>{count} in cart</span>
}`
	const stableValue = 'useMemo(() => ({ count, add }), [count])'
	const screen = [
		['theme', 'Theme: light', 'button'],
		['badge', '0 in cart', 'text'],
		['add', 'Add to cart', 'button'],
	]
	return codeAnim({
		id: 'apis-context-anim',
		caption: 'A store with two contexts: the theme (read by the product cards) and the cart (read by the badge and the Add button). Header and ProductGrid sit in between and are memoized (all three runs recorded).',
		file: 'Store.tsx',
		screen,
		renders,
		scenarios: [
			{
				name: 'Theme, memoized value',
				intro: 'Toggle the theme. The cart value is kept stable with <code>useMemo</code>.',
				code: code(stableValue),
				steps: [
					{ phase: 'event', say: 'Click the theme toggle. The theme state lives in <code>App</code>, so <code>App</code> renders and passes <code>"dark"</code> to <code>ThemeContext</code>.', screen: { theme: 'Theme: dark' }, rendered: { App: 'ran' } },
					{ at: 'const value = useMemo', phase: 'render', say: '<code>CartProvider</code> is a child of <code>App</code>, so it renders too. Its <code>useMemo</code> returns the same value object, because <code>count</code> didn’t change.', rendered: { App: 'ran', CartProvider: 'ran' } },
					{ at: 'const theme = use(ThemeContext)', phase: 'render', say: '<code>Header</code> and <code>ProductGrid</code> are memoized and got no new props, so they’re skipped. React doesn’t need them: it finds the components that <b>read</b> the changed context and renders those directly.', rendered: { App: 'ran', CartProvider: 'ran', Header: 'skipped', ProductGrid: 'skipped', ProductCard: 'ran', CartBadge: 'skipped', AddButton: 'skipped' } },
					{ phase: 'commit', say: 'Recorded: <code>App</code>, <code>CartProvider</code> and the three cards. The cart readers didn’t render: their context didn’t change.' },
				],
			},
			{
				name: 'Theme, inline value',
				intro: 'The same toggle, with the cart value written inline.',
				code: code('{ count, add } // new object each render'),
				steps: [
					{ phase: 'event', say: 'The same click on the theme toggle.', screen: { theme: 'Theme: dark' }, rendered: { App: 'ran' } },
					{ at: 'const value = { count, add }', phase: 'render', say: '<code>CartProvider</code> renders and builds its value inline: a <b>new object</b> every time, although <code>count</code> is still 0.', rendered: { App: 'ran', CartProvider: 'ran' } },
					{ at: 'const { count } = use(CartContext)', phase: 'render', say: 'React compares context values with <code>Object.is</code>. A new object counts as a change, so every cart reader renders as well.', rendered: { App: 'ran', CartProvider: 'ran', Header: 'skipped', ProductGrid: 'skipped', ProductCard: 'ran', CartBadge: 'ran', AddButton: 'ran' } },
					{ phase: 'commit', say: 'Recorded: also <code>CartBadge</code> and <code>AddButton</code>, for a change that had nothing to do with the cart.' },
				],
			},
			{
				name: 'Add to cart',
				intro: 'Change the cart instead of the theme.',
				code: code(stableValue),
				steps: [
					{ phase: 'event', say: 'Click <b>Add to cart</b>. The cart state lives in <code>CartProvider</code>.', screen: { add: [null, 'upd'] } },
					{ at: ['const [count, setCount]', 'const value = useMemo'], phase: 'render', say: 'Only <code>CartProvider</code> renders; <code>App</code> is above it and isn’t involved. Its value is new, because <code>count</code> changed.', rendered: { CartProvider: 'ran' } },
					{ at: 'const { count } = use(CartContext)', phase: 'render', say: 'The two cart readers render. The cards (theme only) and the memoized parents don’t.', rendered: { CartProvider: 'ran', Header: 'skipped', ProductGrid: 'skipped', ProductCard: 'skipped', CartBadge: 'ran', AddButton: 'ran' } },
					{ phase: 'commit', say: 'Recorded: <code>CartProvider</code>, <code>CartBadge</code>, <code>AddButton</code>.', screen: { badge: ['1 in cart', 'ok'] } },
				],
			},
		],
	})
}

// ─── createPortal: DOM placement vs React tree ─────────────────────────────

export function portalAnim() {
	const screen = [
		['dialog', 'Quick view dialog: closed', 'box'],
		['events', 'Handlers that ran: –', 'muted'],
	]
	const card = (render) => `
function Card() {
  const [open, setOpen] = useState(false)
  return (
    <article className="clip-card" // overflow: hidden
      onClick={() => log('card onClick ran')}>
      <button onClick={() => setOpen(true)}>Quick view</button>
      {open && ${render}}
    </article>
  )
}
// plus, for comparison, a plain DOM listener on the card:
card.addEventListener('click', () => log('card DOM listener ran'))`
	return codeAnim({
		id: 'apis-portal-anim',
		caption: 'A product card has a “Quick view” dialog. The card has <code>overflow: hidden</code> and a hover <code>transform</code> (both versions recorded).',
		file: 'Card.tsx',
		screen,
		scenarios: [
			{
				name: 'In place',
				intro: 'The dialog is rendered inside the card.',
				code: card('<QuickView onClose={() => setOpen(false)} />'),
				steps: [
					{ at: '{open && <QuickView', phase: 'render', say: 'Click <b>Quick view</b>. The dialog renders in place, so its DOM goes <b>inside</b> the card.' },
					{ at: 'overflow: hidden', phase: 'paint', say: 'The card clips everything outside its box. (The dialog is <code>position: fixed</code>, but the card’s <code>transform</code> makes the card its containing block.) Recorded: the Close button wasn’t visible.', screen: { dialog: ['Quick view dialog: clipped by the card', 'bad'] } },
					{ at: ["onClick={() => log('card onClick ran')}", "card.addEventListener('click'"], phase: 'event', say: 'Click <b>Close</b>: the click bubbles through the DOM <b>and</b> through React, so both the plain listener and React’s <code>onClick</code> run.', screen: { events: 'Handlers that ran: card DOM listener, card onClick' } },
				],
			},
			{
				name: 'createPortal',
				intro: 'The dialog is portaled to <code>document.body</code>.',
				code: card('createPortal(<QuickView … />, document.body)'),
				steps: [
					{ at: 'createPortal(', phase: 'render', say: 'Click <b>Quick view</b>. Same component, but its DOM goes straight into <code>&lt;body&gt;</code>. In the React tree it’s still the card’s child.' },
					{ at: 'createPortal(', phase: 'paint', say: 'Nothing clips it. Recorded: parent <code>body</code>, Close button visible. It also still reads the card’s context: the dialog got the <code>dark</code> theme class.', screen: { dialog: ['Quick view dialog: fully visible, dark theme', 'ok'] } },
					{ at: "onClick={() => log('card onClick ran')}", phase: 'event', say: 'Click <b>Close</b>. React events follow the <b>React</b> tree, so the card’s <code>onClick</code> still runs. The DOM listener doesn’t: in the DOM, the dialog isn’t inside the card.', screen: { events: 'Handlers that ran: card onClick only' } },
				],
			},
		],
	})
}

// ─── useLayoutEffect: what gets painted ─────────────────────────────────────

export function layoutTimingAnim() {
	const code = (hook) => `
function Tooltip({ anchor }) {
  const ref = useRef(null)
  const [height, setHeight] = useState(0) // unknown at first
  ${hook}(() => {
    setHeight(ref.current.getBoundingClientRect().height)
  }, [])
  const fitsAbove = anchor.top - height >= 0
  const top = fitsAbove ? anchor.top - height : anchor.bottom
  return <div ref={ref} style={{ top }}>Free shipping…</div>
}`
	const screen = [['tip', 'Tooltip: not shown', 'box']]
	return codeAnim({
		id: 'apis-layout-anim',
		caption: 'Hovering “Shipping ⓘ” shows a tooltip that measures itself to decide whether it fits above the button. Frames were read in requestAnimationFrame, right before each paint (recorded).',
		file: 'Tooltip.tsx',
		screen,
		scenarios: [
			{
				name: 'useEffect',
				intro: 'Measure in a regular effect.',
				code: code('useEffect'),
				console: ['render: height 0 → above', 'frame 1 painted: covering the button', 'effect: measured 58px', 'render: height 58 → below', 'frame 2 painted: below the button'],
				steps: [
					{ at: ['const [height, setHeight] = useState(0)', 'const top = fitsAbove'], phase: 'render', say: 'The height isn’t known yet (0), so the tooltip is placed “above” the button at a height of 0: right on top of the button.', log: 'height 0' },
					{ phase: 'paint', say: 'React commits, and <code>useEffect</code> hasn’t run yet, so the browser paints that frame. The user sees the tooltip covering the button.', screen: { tip: ['Tooltip: covering the button', 'bad'] }, log: 'frame 1' },
					{ at: 'setHeight(ref.current.getBoundingClientRect().height)', phase: 'effect', say: 'Now the effect measures 58px; there’s no room above, so it moves below.', log: ['measured 58px', 'height 58'] },
					{ phase: 'paint', say: 'The next frame is correct. The tooltip visibly jumped.', screen: { tip: ['Tooltip: below the button', 'ok'] }, log: 'frame 2' },
				],
			},
			{
				name: 'useLayoutEffect',
				intro: 'Measure in a layout effect.',
				code: code('useLayoutEffect'),
				console: ['render: height 0 → above', 'effect: measured 58px', 'render: height 58 → below', 'frame 1 painted: below the button'],
				steps: [
					{ at: ['const [height, setHeight] = useState(0)', 'const top = fitsAbove'], phase: 'render', say: 'The same first render, with height 0.', log: 'height 0' },
					{ at: 'setHeight(ref.current.getBoundingClientRect().height)', phase: 'commit', say: 'Layout effects run during the commit, <b>before</b> the browser can paint. Reading the size makes the browser lay out the new DOM, but nothing is painted.', log: 'measured 58px' },
					{ at: 'const top = fitsAbove', phase: 'render', say: 'An update from a layout effect is processed <b>synchronously</b>: React renders and commits again right away.', log: 'height 58' },
					{ phase: 'paint', say: 'The first frame the user sees is already correct.', screen: { tip: ['Tooltip: below the button', 'ok'] }, log: 'frame 1' },
				],
			},
		],
	})
}

// ─── useImperativeHandle: a command vs a flag ──────────────────────────────

export function imperativeAnim() {
	const screen = [
		['field', 'Coupon code', 'input'],
		['apply', 'Apply coupon', 'button'],
		['focus', 'Focus: –', 'muted'],
	]
	return codeAnim({
		id: 'apis-imperative-anim',
		caption: '“Apply coupon” with an empty field should put the cursor in the coupon field, every time. It’s clicked twice, with a click elsewhere in between (both versions recorded).',
		file: 'Checkout.tsx',
		screen,
		scenarios: [
			{
				name: 'A shouldFocus prop',
				intro: 'The parent sets state; the field focuses itself in an effect.',
				code: `
function CouponField({ shouldFocus }) {
  const inputRef = useRef(null)
  useEffect(() => {
    if (shouldFocus) inputRef.current.focus()
  }, [shouldFocus])
  return <input ref={inputRef} />
}

function Checkout() {
  const [shouldFocus, setShouldFocus] = useState(false)
  return (<>
    <CouponField shouldFocus={shouldFocus} />
    <button onClick={() => setShouldFocus(true)}>Apply coupon</button>
  </>)
}`,
				steps: [
					{ at: 'onClick={() => setShouldFocus(true)}', phase: 'event', say: 'Click 1: the flag goes from <code>false</code> to <code>true</code>.', screen: { apply: [null, 'upd'] } },
					{ at: 'if (shouldFocus) inputRef.current.focus()', phase: 'effect', say: 'The dependency changed, so the effect runs and focuses the field.', screen: { focus: ['Focus: coupon field', 'ok'] } },
					{ at: 'onClick={() => setShouldFocus(true)}', phase: 'event', say: 'The user clicks elsewhere, then click 2. The flag is <b>already</b> <code>true</code>: same value, no re-render, no effect.', screen: { apply: [null, 'upd'] } },
					{ phase: 'effect', say: 'Recorded: nothing happened on click 2, and focus stayed on the button. A command doesn’t fit in state.', screen: { focus: ['Focus: still on the button', 'bad'] } },
				],
			},
			{
				name: 'useImperativeHandle',
				intro: 'The field exposes <code>focus()</code>; the parent calls it.',
				code: `
function CouponField({ ref }) {
  const inputRef = useRef(null)
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => (inputRef.current.value = ''),
  }), [])
  return <input ref={inputRef} />
}

function Checkout() {
  const couponRef = useRef(null)
  return (<>
    <CouponField ref={couponRef} />
    <button onClick={() => couponRef.current.focus()}>Apply coupon</button>
  </>)
}`,
				steps: [
					{ at: 'onClick={() => couponRef.current.focus()}', phase: 'event', say: 'Click 1 calls the <code>focus</code> method the field exposed.', screen: { apply: [null, 'upd'] } },
					{ at: 'focus: () => inputRef.current.focus(),', say: 'Inside the field, it focuses the real input. No state, no render.', screen: { focus: ['Focus: coupon field', 'ok'] } },
					{ at: 'onClick={() => couponRef.current.focus()}', phase: 'event', say: 'Click 2 does exactly the same.', screen: { apply: [null, 'upd'], focus: ['Focus: coupon field', 'ok'] } },
					{ at: 'useImperativeHandle(ref', say: 'Recorded: focused both times. The parent can only use what’s exposed: <code>Object.keys(handle)</code> was <code>["focus", "clear"]</code>, and <code>handle.style</code> was <code>undefined</code>.' },
				],
			},
		],
	})
}

// ─── flushSync: the DOM right after setState ───────────────────────────────

export function flushSyncAnim() {
	const code = (update) => `
function WishlistName() {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)
  log(\`render (editing: \${editing})\`)

  function startEditing() {
    ${update}
    log(\`inputRef.current = \${inputRef.current}\`)
    inputRef.current?.focus()
  }
  return editing
    ? <input ref={inputRef} defaultValue="Birthday ideas" />
    : <button onClick={startEditing}>Birthday ideas ✎</button>
}`
	const screen = [
		['ui', 'Birthday ideas ✎', 'button'],
		['focus', 'Focus: –', 'muted'],
	]
	return codeAnim({
		id: 'apis-flushsync-anim',
		caption: 'Clicking a wishlist’s name swaps it for an input that should be focused right away (both versions recorded).',
		file: 'WishlistName.tsx',
		screen,
		scenarios: [
			{
				name: 'setState',
				intro: 'A normal state update, then focus.',
				code: code('setEditing(true)'),
				console: ['inputRef.current = null', 'render (editing: true)'],
				steps: [
					{ at: '    setEditing(true)', phase: 'schedule', say: 'The update is <b>queued</b>. React will render after the click handler returns.' },
					{ at: 'log(`inputRef.current', phase: 'event', say: 'The input doesn’t exist yet.', log: 'inputRef.current = null' },
					{ at: 'inputRef.current?.focus()', phase: 'event', say: 'So there’s nothing to focus.', screen: { focus: ['Focus: still on the button', 'bad'] } },
					{ at: 'log(`render', phase: 'render', say: 'Only now does React render and swap the button for the input. Too late: the code that wanted it has finished.', screen: { ui: ['[ Birthday ideas ] (not focused)', 'upd'] }, log: 'render (editing: true)' },
				],
			},
			{
				name: 'flushSync',
				intro: 'The update wrapped in <code>flushSync</code>.',
				code: code('flushSync(() => setEditing(true))'),
				console: ['render (editing: true)', 'inputRef.current = <input>'],
				steps: [
					{ at: ['flushSync(() => setEditing(true))', 'log(`render'], phase: 'render', say: '<code>flushSync</code> renders <b>and commits</b> before it returns. Recorded: the render line is logged inside the click handler.', screen: { ui: '[ Birthday ideas ]' }, log: 'render (editing: true)' },
					{ at: 'log(`inputRef.current', phase: 'event', say: 'The ref is already attached.', log: 'inputRef.current = <input>' },
					{ at: 'inputRef.current?.focus()', phase: 'event', say: 'Focus works.', screen: { focus: ['Focus: the input', 'ok'], ui: ['[ Birthday ideas ] (focused)', 'ok'] } },
				],
			},
		],
	})
}

// ─── useSyncExternalStore: subscribe, snapshot, compare ────────────────────

export function externalStoreAnim() {
	const renders = ['HeaderBadge (root 1)', 'ProductPage (root 2)']
	const screen = [
		['badge', '🛒 0', 'text'],
		['add', 'Add to cart (0 so far)', 'button'],
	]
	return codeAnim({
		id: 'apis-store-anim',
		caption: 'A cart store written in plain JavaScript, read by two separate React roots on one page (both versions recorded).',
		file: 'cartStore.ts',
		screen,
		renders,
		scenarios: [
			{
				name: 'Stable snapshot',
				intro: 'Click <b>Add to cart</b> in the product page.',
				code: `
let state = { count: 0 }
const listeners = new Set()
const cartStore = {
  getSnapshot: () => state,
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  add() {
    state = { count: state.count + 1 } // new only when it changes
    listeners.forEach(l => l())
  },
}

function useCartCount() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot).count
}`,
				steps: [
					{ at: 'state = { count: state.count + 1 }', phase: 'event', say: 'The store replaces its state with a new object, then calls every listener. React doesn’t own this state.', screen: { add: [null, 'upd'] } },
					{ at: 'listeners.forEach(l => l())', phase: 'schedule', say: 'Each listener is React asking: did your snapshot change?' },
					{ at: 'getSnapshot: () => state,', phase: 'render', say: '<code>getSnapshot</code> returns the store’s own object, a different one than last time, so React re-renders the components that read it, in <b>both</b> roots.', rendered: { HeaderBadge: 'ran', ProductPage: 'ran' } },
					{ phase: 'commit', say: 'Recorded: <code>render HeaderBadge (1)</code>, <code>render ProductPage (1)</code>. When nothing changes, <code>getSnapshot</code> returns the same object and React does nothing.', screen: { badge: ['🛒 1', 'ok'], add: ['Add to cart (1 so far)', 'ok'] } },
				],
			},
			{
				name: 'New object per call',
				intro: '<code>getSnapshot</code> copies the state on every call.',
				code: `
function useCartBad() {
  return useSyncExternalStore(
    cartStore.subscribe,
    () => ({ ...cartStore.getSnapshot() }), // a new copy every call
  )
}`,
				console: ['The result of getSnapshot should be cached to avoid an infinite loop', 'Maximum update depth exceeded.'],
				renders: ['BadBadge'],
				screen: [['badge', '🛒 ?', 'text']],
				steps: [
					{ at: '() => ({ ...cartStore.getSnapshot() })', phase: 'render', say: 'Every call returns a <b>new object</b>. In development React calls it twice to check it’s stable; two copies are never <code>Object.is</code>-equal.', log: 'should be cached' },
					{ at: 'useSyncExternalStore(', phase: 'render', say: 'So React thinks the store changed on every render, and schedules another render, again and again.', rendered: { BadBadge: 'ran again' } },
					{ phase: 'commit', say: 'Recorded: <code>Maximum update depth exceeded</code>. Return the store’s own object, and create a new one only when something changes.', screen: { badge: ['(crashed)', 'bad'] }, rendered: { BadBadge: 'error' }, log: 'Maximum update depth' },
				],
			},
		],
	})
}
