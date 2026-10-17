// Animations for the Advanced React Patterns module, in the "code + screen"
// style (src/lib/anim-code.mjs). Every outcome shown was recorded from
// examples/product-store (src/lessons/patterns, scripts/record.mjs → generated/patterns.json).

import { codeAnim } from './anim-code.mjs'

// ─── Composition: data through layout vs elements built at the top ─────────

export function compositionAnim() {
	const renders = ['Nav', 'Main', 'Footer']
	return codeAnim({
		id: 'patterns-composition-anim',
		caption: 'A product page: a nav bar with the shopper’s avatar, a product list next to the selected product’s details, and a footer. Which props does each layout component receive? (Both versions recorded.)',
		file: 'App.tsx',
		renders,
		rendersTitle: 'Props received (recorded)',
		scenarios: [
			{
				name: 'Data drilled',
				intro: 'Layout components receive the data and pass it on.',
				code: `
function App() {
  const [user] = useState(sam)
  const [selected, setSelected] = useState(null)
  return (<>
    <Nav user={user} />
    <Main products={products} selected={selected}
      onSelect={setSelected} />
    <Footer user={user} />
  </>)
}

function Nav({ user }) {
  return <nav><img src={user.avatar} /></nav>
}`,
				steps: [
					{ at: 'const [user] = useState(sam)', phase: 'render', say: '<code>App</code> owns the user, the products and the selected product.' },
					{ at: '<Nav user={user} />', phase: 'render', say: '<code>Nav</code> only places an avatar, yet it has to take the whole <code>user</code> to build it.', rendered: { Nav: 'user' } },
					{ at: ['<Main products={products} selected={selected}', 'onSelect={setSelected} />'], phase: 'render', say: '<code>Main</code> only puts two areas side by side, yet it receives three props it just passes on.', rendered: { Nav: 'user', Main: 'products, selected, onSelect' } },
					{ at: '<Footer user={user} />', phase: 'render', say: 'Same for <code>Footer</code>. Every layout component now depends on data it doesn’t use: change <code>User</code> and their types change too.', rendered: { Nav: 'user', Main: 'products, selected, onSelect', Footer: 'user' } },
				],
			},
			{
				name: 'Elements passed',
				intro: 'Layout components receive finished elements.',
				code: `
function App() {
  const [user] = useState(sam)
  const [selected, setSelected] = useState(null)
  return (<>
    <Nav avatar={<img src={user.avatar} />} />
    <Main
      sidebar={<ProductList onSelect={setSelected} />}
      content={<ProductDetails product={selected} />} />
    <Footer>Happy shopping, {user.name}!</Footer>
  </>)
}

function Nav({ avatar }) {
  return <nav>{avatar}</nav>
}`,
				steps: [
					{ at: 'const [user] = useState(sam)', phase: 'render', say: 'The same state, in the same place.' },
					{ at: '<Nav avatar={<img src={user.avatar} />} />', phase: 'render', say: '<code>App</code> builds the avatar element itself, where <code>user</code> lives, and hands <code>Nav</code> the finished element.', rendered: { Nav: 'avatar' } },
					{ at: ['sidebar={<ProductList', 'content={<ProductDetails'], phase: 'render', say: 'Two areas, two named element props. <code>Main</code> only decides where they go.', rendered: { Nav: 'avatar', Main: 'sidebar, content' } },
					{ at: '<Footer>Happy shopping', phase: 'render', say: 'One area: plain <code>children</code>. Recorded: no layout component received any data.', rendered: { Nav: 'avatar', Main: 'sidebar, content', Footer: 'children' } },
				],
			},
		],
	})
}

// ─── Latest ref: three debounce hooks, four keystrokes ─────────────────────

export function latestRefAnim() {
	const note = `
function GiftNote() {
  const [product, setProduct] = useState('Ceramic Mug')
  const saveNote = text => log(\`saved "\${text}" for \${product}\`)
  const debouncedSave = useDebounce(saveNote, 300)
  return <input onChange={e => debouncedSave(e.target.value)} />
}
`
	const screen = [
		['product', 'Product: Desk Lamp (picked first)', 'muted'],
		['input', '', 'input'],
	]
	return codeAnim({
		id: 'patterns-latest-ref-anim',
		caption: 'A gift note saves itself 300 ms after you stop typing. The shopper picks “Desk Lamp”, then types “Gift” quickly (all three hooks recorded).',
		file: 'GiftNote.tsx',
		screen,
		consoleTitle: 'Saved (recorded)',
		scenarios: [
			{
				name: '[callback, delay]',
				intro: 'Rebuild the debounced function whenever the callback changes.',
				code: `${note}
function useDebounce(callback, delay) {
  return useMemo(
    () => debounce(callback, delay),
    [callback, delay],
  )
}`,
				console: ['saved "G" for Desk Lamp', 'saved "Gi" for Desk Lamp', 'saved "Gif" for Desk Lamp', 'saved "Gift" for Desk Lamp'],
				steps: [
					{ at: 'debouncedSave(e.target.value)', phase: 'event', say: 'The first key, “G”, starts a 300 ms timer inside the debounced function.', screen: { input: 'G' } },
					{ at: '[callback, delay],', phase: 'render', say: 'The state change re-renders the note. <code>saveNote</code> is a new function, so <code>useMemo</code> builds a <b>new</b> debounced function, with its own, empty timer.' },
					{ at: 'debouncedSave(e.target.value)', phase: 'event', say: '“i”, “f”, “t”: each key calls the newest function, which can’t cancel the timers the older ones started.', screen: { input: 'Gift' } },
					{ at: 'const saveNote', phase: 'effect', say: '300 ms later, four timers fire.', log: ['"G"', '"Gi"', '"Gif"', '"Gift"'] },
				],
			},
			{
				name: '[delay]',
				intro: 'Build the debounced function once, around the first callback.',
				code: `${note}
function useDebounce(callback, delay) {
  return useMemo(
    () => debounce(callback, delay),
    [delay], // callback left out
  )
}`,
				console: ['saved "Gift" for Ceramic Mug'],
				steps: [
					{ at: '[delay], // callback left out', phase: 'render', say: 'The debounced function is built <b>once</b>, so the timer is reused and cancelled correctly…' },
					{ at: 'debouncedSave(e.target.value)', phase: 'event', say: 'Typing “Gift” restarts the same timer each time.', screen: { input: 'Gift' } },
					{ at: 'const saveNote', phase: 'effect', say: '…but it wraps the <code>saveNote</code> from the <b>first</b> render, whose <code>product</code> was still “Ceramic Mug”. One save, for the wrong product: a stale closure.', log: 'Ceramic Mug' },
				],
			},
			{
				name: 'Latest ref',
				intro: 'Build it once, and read the newest callback from a ref.',
				code: `${note}
function useDebounce(callback, delay) {
  const callbackRef = useRef(callback)
  useEffect(() => { callbackRef.current = callback })
  return useMemo(
    () => debounce((...args) => callbackRef.current(...args), delay),
    [delay],
  )
}`,
				console: ['saved "Gift" for Desk Lamp'],
				steps: [
					{ at: 'useEffect(() => { callbackRef.current = callback })', phase: 'effect', say: 'After every render, an effect stores the newest <code>saveNote</code> in a ref.' },
					{ at: 'debouncedSave(e.target.value)', phase: 'event', say: 'The debounced function is built once, so each key restarts the same timer.', screen: { input: 'Gift' } },
					{ at: '(...args) => callbackRef.current(...args)', phase: 'effect', say: 'When the timer fires, it reads the ref <b>at that moment</b>: the latest <code>saveNote</code>, which knows the product is the Desk Lamp.', log: 'for Desk Lamp' },
				],
			},
		],
	})
}

// ─── Compound components: context vs cloneElement ──────────────────────────

export function compoundAnim() {
	const usage = (root, btn, on, off) => `
<${root}>
  <${btn} />
  <div className="note">
    <${on}>We'll wrap it in recycled paper 🎁</${on}>
    <${off}>No gift wrap</${off}>
  </div>
</${root}>`
	const screen = [
		['switch', 'Gift wrap: off', 'button'],
		['text', 'No gift wrap', 'text'],
	]
	return codeAnim({
		id: 'patterns-compound-anim',
		caption: 'A gift-wrap toggle built from compound components. The consumer wrapped the two texts in a <code>div</code> (both versions recorded).',
		file: 'GiftWrap.tsx',
		screen,
		scenarios: [
			{
				name: 'Context',
				intro: 'The pieces read <code>ToggleContext</code>.',
				code: `
function Toggle({ children }) {
  const [on, setOn] = useState(false)
  return <ToggleContext value={{ on, toggle: () => setOn(!on) }}>
    {children}
  </ToggleContext>
}
function ToggleOn({ children }) {
  const { on } = useToggleContext()
  return on ? children : null
}
${usage('Toggle', 'ToggleButton', 'ToggleOn', 'ToggleOff')}`,
				steps: [
					{ at: '<ToggleContext value=', phase: 'render', say: '<code>Toggle</code> owns the state and puts it in context around whatever children it was given.' },
					{ at: 'const { on } = useToggleContext()', phase: 'render', say: 'Each piece reads the context, however deep it is. The consumer’s <code>div</code> in between doesn’t matter.' },
					{ at: '<ToggleButton />', phase: 'event', say: 'Click the switch: <code>on</code> becomes true, the context value changes, and all the pieces re-render.', screen: { switch: 'Gift wrap: on' } },
					{ phase: 'commit', say: 'Recorded: the text changed with the switch.', screen: { text: ['We’ll wrap it in recycled paper 🎁', 'ok'] } },
				],
			},
			{
				name: 'cloneElement',
				intro: 'The older way: props are copied onto direct children.',
				code: `
function ToggleClone({ children }) {
  const [on, setOn] = useState(false)
  return Children.map(children, child =>
    typeof child.type !== 'string' // skip <div>, <p>…
      ? cloneElement(child, { on, toggle: () => setOn(!on) })
      : child,
  )
}
${usage('ToggleClone', 'CloneButton', 'CloneOn', 'CloneOff')}`,
				steps: [
					{ at: 'Children.map(children', phase: 'render', say: '<code>ToggleClone</code> walks its <b>direct</b> children and copies <code>on</code> and <code>toggle</code> onto each component element.' },
					{ at: "typeof child.type !== 'string'", phase: 'render', say: 'The <code>div</code> is a DOM element, so it’s passed through untouched, and <code>Children.map</code> never looks inside it. <code>CloneOn</code> and <code>CloneOff</code> get no <code>on</code> at all.' },
					{ at: '<CloneButton />', phase: 'event', say: 'Click the switch. It flips: <code>CloneButton</code> was a direct child.', screen: { switch: 'Gift wrap: on' } },
					{ phase: 'commit', say: 'But the text doesn’t change. Recorded: still “No gift wrap”.', screen: { text: ['No gift wrap', 'bad'] } },
				],
			},
		],
	})
}

// ─── Slots: one map of props, looked up by name ────────────────────────────

export function slotsAnim() {
	const code = (slot) => `
function Field({ children }) {
  const id = useId()
  const slots = {
    label: { htmlFor: id },
    input: { id, 'aria-describedby': id + '-description' },
    description: { id: id + '-description' },
  }
  return <SlotContext value={slots}>{children}</SlotContext>
}

<Field>
  <Label>Email for the receipt</Label>
  <div className="row"><Input type="email" /></div>
  <Text slot="${slot}">We only use it for this order.</Text>
</Field>`
	const screen = [
		['label', 'label for = ?', 'muted'],
		['input', 'input id = ? · aria-describedby = ?', 'muted'],
		['desc', 'description id = ?', 'muted'],
	]
	return codeAnim({
		id: 'patterns-slots-anim',
		caption: 'A checkout email field built from generic <code>Label</code>, <code>Input</code> and <code>Text</code> pieces that pick up their props by slot name (both versions recorded).',
		file: 'CheckoutEmail.tsx',
		screen,
		scenarios: [
			{
				name: 'slot="description"',
				intro: 'Every piece finds its slot.',
				code: code('description'),
				steps: [
					{ at: ['const id = useId()', 'const slots = {'], phase: 'render', say: '<code>Field</code> makes one id and builds a map of which props each <b>slot</b> gets.' },
					{ at: ['label: { htmlFor: id },', '<Label>Email'], phase: 'render', say: '<code>Label</code> reads the map from context and merges in <code>htmlFor</code>. Its own props would win.', screen: { label: ['label for = _r_0_', 'ok'] } },
					{ at: ["input: { id, 'aria-describedby'", '<Input type="email" />'], phase: 'render', say: '<code>Input</code> gets <code>id</code> and <code>aria-describedby</code>, though it sits inside an extra <code>div</code>.', screen: { input: ['input id = _r_0_ · aria-describedby = _r_0_-description', 'ok'] } },
					{ at: ['description: { id:', '<Text slot="description">'], phase: 'render', say: '<code>Text</code> is generic; its <code>slot</code> prop says which entry to use. Recorded: clicking the label focused the input, and the description is linked.', screen: { desc: ['description id = _r_0_-description', 'ok'] } },
				],
			},
			{
				name: 'slot="descripton"',
				intro: 'A typo in a slot name.',
				code: code('descripton'),
				steps: [
					{ at: 'const slots = {', phase: 'render', say: 'The same map.' },
					{ at: ['<Label>Email', '<Input type="email" />'], phase: 'render', say: 'Label and input are wired as before.', screen: { label: ['label for = _r_0_', 'ok'], input: ['input id = _r_0_ · aria-describedby = _r_0_-description', 'ok'] } },
					{ at: '<Text slot="descripton">', phase: 'render', say: 'There’s no <code>"descripton"</code> entry, so <code>Text</code> gets nothing extra. No error, no warning.', screen: { desc: ['description id = (none)', 'bad'] } },
					{ phase: 'commit', say: 'Recorded: the input still says <code>aria-describedby="_r_0_-description"</code>, but no element has that id. Screen readers lose the description.', screen: { input: ['input aria-describedby → points at nothing', 'bad'] } },
				],
			},
		],
	})
}

// ─── Prop getters: who owns onClick ────────────────────────────────────────

export function propGettersAnim() {
	const hook = `
function useToggle() {
  const [on, setOn] = useState(false)
  const toggle = () => setOn(!on)
  const togglerProps = { 'aria-checked': on, onClick: toggle }
  return { on, togglerProps }
}
`
	const screen = [
		['btn', 'Gift wrap: off', 'button'],
		['log', 'Analytics: –', 'muted'],
	]
	return codeAnim({
		id: 'patterns-prop-getters-anim',
		caption: 'The store wants an analytics event every time the gift-wrap button is clicked. The button is clicked twice (all three versions recorded).',
		file: 'GiftWrap.tsx',
		screen,
		scenarios: [
			{
				name: 'Spread, then onClick',
				intro: 'A prop collection spread before the consumer’s handler.',
				code: `${hook}
const { on, togglerProps } = useToggle()
<button {...togglerProps} onClick={track}>
  Gift wrap: {on ? 'on' : 'off'}
</button>`,
				steps: [
					{ at: '<button {...togglerProps} onClick={track}>', phase: 'render', say: 'JSX props behave like object keys: the <b>last</b> <code>onClick</code> wins, so <code>track</code> replaces the hook’s <code>toggle</code>.' },
					{ phase: 'event', say: 'Recorded after two clicks: analytics logged both times, but the button never toggled.', screen: { btn: ['Gift wrap: off', 'bad'], log: ['Analytics: logged ×2', 'ok'] } },
				],
			},
			{
				name: 'onClick, then spread',
				intro: 'The consumer’s handler before the spread.',
				code: `${hook}
const { on, togglerProps } = useToggle()
<button onClick={track} {...togglerProps}>
  Gift wrap: {on ? 'on' : 'off'}
</button>`,
				steps: [
					{ at: '<button onClick={track} {...togglerProps}>', phase: 'render', say: 'The other order: now the hook’s <code>onClick</code> wins. TypeScript actually flags this one (TS2783: “specified more than once”).' },
					{ phase: 'event', say: 'Recorded: the button toggles, but analytics never logged.', screen: { btn: ['Gift wrap: on → off', 'ok'], log: ['Analytics: never', 'bad'] } },
				],
			},
			{
				name: 'Prop getter',
				intro: 'A function that merges the props.',
				code: `
const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

function useToggle() {
  const [on, setOn] = useState(false)
  const toggle = () => setOn(!on)
  function getTogglerProps({ onClick, ...props } = {}) {
    return { 'aria-checked': on, onClick: callAll(onClick, toggle), ...props }
  }
  return { on, getTogglerProps }
}

<button {...getTogglerProps({ onClick: track, id: 'gift-wrap' })}>`,
				steps: [
					{ at: "getTogglerProps({ onClick: track, id: 'gift-wrap' })", phase: 'render', say: 'The consumer hands <b>its</b> props to the hook instead of spreading them next to the hook’s.' },
					{ at: 'onClick: callAll(onClick, toggle)', phase: 'render', say: 'The hook combines both handlers into one function that calls each. Other props, like <code>id</code>, pass through.' },
					{ at: 'const callAll', phase: 'event', say: 'Recorded: on, then off, with analytics logged each time.', screen: { btn: ['Gift wrap: on → off', 'ok'], log: ['Analytics: logged ×2', 'ok'] } },
				],
			},
		],
	})
}

// ─── State initializer: what Reset goes back to ────────────────────────────

export function initializerAnim() {
	const page = `
function GiftOptions() {
  const [giftByDefault, setGiftByDefault] = useState(true)
  const { on, toggle, reset } = useToggle({ initialOn: giftByDefault })
  // checkbox → setGiftByDefault · switch → toggle · Reset → reset
}`
	const screen = [
		['setting', '☑ Gift wrap new orders by default', 'text'],
		['switch', 'Gift wrap: on', 'button'],
		['reset', 'Reset', 'button'],
	]
	const steps = (stable) => [
		{ at: 'useToggle({ initialOn: giftByDefault })', phase: 'render', say: 'First render: the switch starts <b>on</b>, from the store setting.' },
		{ phase: 'event', say: 'The shopper turns gift wrap off.', screen: { switch: 'Gift wrap: off' } },
		{
			at: stable ? 'useRef({ on: initialOn })' : 'const initialState = { on: initialOn }',
			phase: 'render',
			say: stable
				? 'The store setting is unticked, so <code>initialOn</code> is now <code>false</code>. The ref still holds <code>{ on: true }</code> from the first render.'
				: 'The store setting is unticked. This render builds a new <code>initialState = { on: false }</code>, and this render’s <code>reset</code> captures it.',
			screen: { setting: '☐ Gift wrap new orders by default' },
		},
		{
			at: "dispatch({ type: 'reset', initialState })",
			phase: 'event',
			say: stable ? 'Click <b>Reset</b>. Recorded: the switch went back to <b>on</b>, how it actually started.' : 'Click <b>Reset</b>. Recorded: the switch stayed <b>off</b>. It “reset” to the current setting, not to how it started, so nothing visibly happened.',
			screen: { reset: [null, 'upd'], switch: stable ? ['Gift wrap: on', 'ok'] : ['Gift wrap: off', 'bad'] },
		},
	]
	return codeAnim({
		id: 'patterns-initializer-anim',
		caption: 'The gift-wrap switch starts from a store setting and has a Reset button. Start on, switch off, untick the setting, then click Reset (both versions recorded).',
		file: 'useToggle.ts',
		screen,
		scenarios: [
			{
				name: 'Plain object',
				intro: 'The initial state is rebuilt on every render.',
				code: `
function useToggle({ initialOn = false } = {}) {
  const initialState = { on: initialOn } // every render
  const [state, dispatch] = useReducer(toggleReducer, initialState)
  const reset = () => dispatch({ type: 'reset', initialState })
  return { on: state.on, reset /* , toggle */ }
}
${page}`,
				steps: steps(false),
			},
			{
				name: 'useRef',
				intro: 'The initial state is kept from the first render.',
				code: `
function useToggle({ initialOn = false } = {}) {
  const { current: initialState } = useRef({ on: initialOn })
  const [state, dispatch] = useReducer(toggleReducer, initialState)
  const reset = () => dispatch({ type: 'reset', initialState })
  return { on: state.on, reset /* , toggle */ }
}
${page}`,
				steps: steps(true),
			},
		],
	})
}

// ─── State reducer: the consumer's reducer decides ─────────────────────────

export function stateReducerAnim() {
	return codeAnim({
		id: 'patterns-state-reducer-anim',
		caption: 'Once the order is placed, gift wrap can’t be changed. The page adds that rule from outside, through its own reducer (recorded).',
		file: 'GiftOptions.tsx',
		code: `
export function toggleReducer(state, action) {
  if (action.type === 'toggle') return { on: !state.on }
  if (action.type === 'reset') return action.initialState
}
function useToggle({ reducer = toggleReducer } = {}) {
  const [state, dispatch] = useReducer(reducer, { on: false })
  return { on: state.on, toggle: () => dispatch({ type: 'toggle' }) }
}

function GiftOptions() {
  const [orderPlaced, setOrderPlaced] = useState(false)
  const { on, toggle } = useToggle({
    reducer(state, action) {
      if (orderPlaced && action.type === 'toggle') return state
      return toggleReducer(state, action)
    },
  })
  return <><Switch on={on} onClick={toggle} /><WrapNote on={on} /></>
}`,
		screen: [
			['switch', 'Gift wrap: off', 'button'],
			['order', 'Place order', 'button'],
		],
		renders: ['GiftOptions', 'WrapNote'],
		scenarios: [
			{
				name: 'Before the order',
				intro: 'The default behavior.',
				steps: [
					{ at: "toggle: () => dispatch({ type: 'toggle' })", phase: 'event', say: 'Click the switch. The hook dispatches its normal action; it knows nothing about custom rules.' },
					{ at: 'return toggleReducer(state, action)', phase: 'render', say: '<code>useReducer</code> runs the <b>consumer’s</b> reducer. The order isn’t placed, so it delegates to the exported default.', rendered: { GiftOptions: 'ran' } },
					{ at: "if (action.type === 'toggle') return { on: !state.on }", phase: 'commit', say: 'A new state, <code>{ on: true }</code>: <code>GiftOptions</code> and <code>WrapNote</code> render.', screen: { switch: ['Gift wrap: on', 'ok'] }, rendered: { GiftOptions: 'ran', WrapNote: 'ran' } },
				],
			},
			{
				name: 'After the order',
				intro: 'The consumer’s rule kicks in.',
				steps: [
					{ at: 'const [orderPlaced, setOrderPlaced]', phase: 'event', say: 'Click <b>Place order</b>, then click the switch again. The same action is dispatched.', screen: { order: ['Order placed', 'upd'], switch: 'Gift wrap: on' } },
					{ at: "if (orderPlaced && action.type === 'toggle') return state", phase: 'render', say: 'The consumer’s reducer returns the state it was given: a veto, with no special API.', rendered: { GiftOptions: 'ran' } },
					{ phase: 'commit', say: 'Recorded: <code>GiftOptions</code> still ran once (React runs the reducer while rendering it), then bailed out: <code>WrapNote</code> didn’t render, and the switch stayed on.', screen: { switch: ['Gift wrap: on (locked)', 'ok'] }, rendered: { GiftOptions: 'bailed out', WrapNote: 'skipped' } },
				],
			},
		],
	})
}

// ─── Control props: a suggestion, and the parent decides ───────────────────

export function controlPropsAnim() {
	return codeAnim({
		id: 'patterns-control-props-anim',
		caption: 'The gift-wrap switch appears in the cart and at checkout and must always agree; a newsletter switch is left uncontrolled (all three runs recorded).',
		file: 'Checkout.tsx',
		code: `
function useToggle({ on: controlledOn, onChange, reducer = toggleReducer }) {
  const [state, dispatch] = useReducer(reducer, { on: false })
  const onIsControlled = controlledOn != null
  const on = onIsControlled ? controlledOn : state.on
  function dispatchWithOnChange(action) {
    if (!onIsControlled) dispatch(action)
    onChange?.(reducer({ ...state, on }, action)) // a suggestion
  }
  return { on, toggle: () => dispatchWithOnChange({ type: 'toggle' }) }
}

function Checkout() {
  const [giftWrap, setGiftWrap] = useState(false)
  function handleChange(suggested) {
    if (orderPlaced) return // ignore it
    setGiftWrap(suggested.on)
  }
  return (<>
    <Toggle on={giftWrap} onChange={handleChange} />
    <Toggle on={giftWrap} onChange={handleChange} />
    <Toggle onChange={s => log(s.on)} />
  </>)
}`,
		screen: [
			['cart', 'Cart: gift wrap off', 'button'],
			['check', 'Checkout: gift wrap off', 'button'],
			['news', 'Newsletter: off', 'button'],
		],
		renders: ['Checkout', 'Toggle1 (cart)', 'Toggle2 (checkout)', 'Toggle3 (newsletter)'],
		scenarios: [
			{
				name: 'Parent accepts',
				intro: 'Click the switch in the cart.',
				steps: [
					{ at: 'if (!onIsControlled) dispatch(action)', phase: 'event', say: 'An <code>on</code> prop was passed, so this toggle is <b>controlled</b>: it skips its own <code>dispatch</code>.', screen: { cart: [null, 'upd'] } },
					{ at: 'onChange?.(reducer({ ...state, on }, action))', phase: 'event', say: 'It runs the reducer directly, only to compute what it <b>would</b> do, and passes that to <code>onChange</code> as a suggestion.' },
					{ at: 'setGiftWrap(suggested.on)', phase: 'schedule', say: 'The parent accepts the suggestion and updates <b>its</b> state.', rendered: { Checkout: 'ran' } },
					{ phase: 'commit', say: 'Recorded: <code>Checkout</code> and all three toggles rendered, and both gift-wrap switches turned on, though only one was clicked.', screen: { cart: ['Cart: gift wrap on', 'ok'], check: ['Checkout: gift wrap on', 'ok'] }, rendered: { Checkout: 'ran', Toggle1: 'ran', Toggle2: 'ran', Toggle3: 'ran' } },
				],
			},
			{
				name: 'Parent ignores',
				intro: 'After “Place order”, click the checkout switch.',
				steps: [
					{ at: 'onChange?.(reducer({ ...state, on }, action))', phase: 'event', say: 'The toggle suggests turning gift wrap off.', screen: { check: [null, 'upd'] } },
					{ at: 'if (orderPlaced) return // ignore it', phase: 'event', say: 'The parent doesn’t call <code>setGiftWrap</code>.' },
					{ phase: 'commit', say: 'Recorded: “ignored the change”, and <b>nothing</b> rendered. A controlled component can only change through its parent.', screen: { cart: ['Cart: gift wrap on', 'ok'], check: ['Checkout: gift wrap on', 'ok'] }, rendered: { Checkout: 'skipped', Toggle1: 'skipped', Toggle2: 'skipped', Toggle3: 'skipped' } },
				],
			},
			{
				name: 'Uncontrolled',
				intro: 'Click the newsletter switch.',
				steps: [
					{ at: '<Toggle onChange={s => log(s.on)} />', phase: 'event', say: 'No <code>on</code> prop: this toggle is <b>uncontrolled</b>.', screen: { news: [null, 'upd'] } },
					{ at: 'if (!onIsControlled) dispatch(action)', phase: 'render', say: 'So it dispatches to its own state; <code>onChange</code> is only a notification. Recorded: only this toggle rendered.', screen: { news: ['Newsletter: on', 'ok'] }, rendered: { Checkout: 'skipped', Toggle1: 'skipped', Toggle2: 'skipped', Toggle3: 'ran' } },
				],
			},
		],
	})
}
