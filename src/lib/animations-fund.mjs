// Animations for the React Fundamentals module, in the "code + screen" style
// (src/lib/anim-code.mjs). Every outcome shown here was recorded from
// examples/product-store (scripts/record.mjs → generated/fundamentals.json).

import { codeAnim } from './anim-code.mjs'
import { flashcards } from './engine-map.mjs'

/** Flashcards for the public APIs (the Fundamentals quiz). */
export const apiFlashcards = () => flashcards('api')

// ─── Hello World in JS: built in memory, then appended ─────────────────────

export function domCardAnim() {
	return codeAnim({
		id: 'fund-dom-anim',
		caption: 'A product card built with nothing but the DOM API: create, change, then append. React will later do these steps for you.',
		file: 'card.ts',
		code: `
const card = document.createElement('article')
const name = document.createElement('h2')
name.textContent = 'Ceramic Mug'
const price = document.createElement('p')
price.textContent = '$18.00'
card.append(name, price)

rootElement.append(card)`,
		screen: [
			['memory', 'In memory: nothing yet', 'box'],
			['page', 'The page: an empty #root', 'box'],
			['check', 'document.body.contains(card): –', 'muted'],
		],
		scenarios: [
			{
				name: 'Building a card by hand',
				intro: 'Press <b>Play</b>, or step through with the arrows.',
				steps: [
					{ at: "createElement('article')", say: 'A real DOM node is created, but only <b>in memory</b>. Nothing on the page changes.', screen: { memory: 'In memory: &lt;article&gt;' } },
					{ at: ["createElement('h2')", "'Ceramic Mug'"], say: 'A heading gets its text. Still in memory.', screen: { memory: 'In memory: &lt;article&gt;, &lt;h2&gt;Ceramic Mug' } },
					{ at: ["createElement('p')", "'$18.00'"], say: 'Same for the price.', screen: { memory: 'In memory: &lt;article&gt;, &lt;h2&gt;, &lt;p&gt;$18.00' } },
					{ at: 'card.append(name, price)', say: 'The pieces are put together into one card, still detached from the page.', screen: { memory: 'In memory: &lt;article&gt;&lt;h2&gt;Ceramic Mug&lt;/h2&gt;&lt;p&gt;$18.00&lt;/p&gt;&lt;/article&gt;', check: ['document.body.contains(card): false (recorded)', 'bad'] } },
					{ at: 'rootElement.append(card)', say: '<b>Only now</b> does the card appear: appending to a node that’s already on the page attaches it.', screen: { memory: 'In memory: (moved to the page)', page: ['The page: #root › Ceramic Mug $18.00', 'ok'], check: ['document.body.contains(card): true (recorded)', 'ok'] } },
				],
			},
		],
	})
}

// ─── Raw React APIs: objects first, DOM later ───────────────────────────────

export function elementObjectAnim() {
	return codeAnim({
		id: 'fund-element-anim',
		caption: 'createElement only builds a description (a plain object). React creates the DOM later.',
		file: 'card.js (no JSX)',
		code: `
const h2 = createElement('h2', null, 'Ceramic Mug')
const p = createElement('p', { className: 'price' }, '$18.00')
const article = createElement('article',
  { className: 'product-card' }, h2, p)

createRoot(root).render(article)
// …a moment later, React updates the DOM`,
		screen: [
			['objects', 'Objects: –', 'box'],
			['dom', '#root on the page: (empty)', 'box'],
		],
		scenarios: [
			{
				name: 'createElement → render',
				intro: 'The product card with React, without JSX.',
				steps: [
					{ at: "createElement('h2'", say: '<code>createElement</code> returns a <b>plain object</b> that describes a heading, not a DOM node.', screen: { objects: 'Objects: { type: "h2", props: { children: "Ceramic Mug" } }' } },
					{ at: "createElement('p'", say: 'Another plain object for the price.', screen: { objects: 'Objects: h2, { type: "p", props: { className: "price", … } }' } },
					{ at: ["createElement('article',", "{ className: 'product-card' }"], say: 'The outer element gets the two objects as its children. The result describes the whole card, and it’s <b>frozen</b> (recorded: <code>frozen? true true</code>).', screen: { objects: 'Objects: { type: "article", props: { children: [h2, p] } }' } },
					{ at: 'createRoot(root).render(article)', phase: 'schedule', say: '<code>render()</code> only <b>schedules</b> the work. Right after it returns, <code>#root</code> is still empty (recorded: <code>right after render(): ""</code>).', screen: { dom: ['#root on the page: (still empty)', 'bad'] } },
					{ at: '…a moment later', phase: 'commit', say: 'React turns the objects into DOM nodes and appends them in one go.', screen: { dom: ['#root on the page: &lt;article&gt;&lt;h2&gt;Ceramic Mug&lt;/h2&gt;&lt;p&gt;$18.00&lt;/p&gt;&lt;/article&gt;', 'ok'] } },
				],
			},
		],
	})
}

// ─── Using JSX: why `{stock && …}` prints 0 ────────────────────────────────

export function andZeroAnim() {
	const screen = [
		['data', 'headphones.stock = 0', 'muted'],
		['out', 'Wireless Headphones', 'text'],
	]
	return codeAnim({
		id: 'fund-and-anim',
		caption: 'The most common JSX bug, and its fix: an out-of-stock product shows a stray “0” (both versions recorded).',
		file: 'ProductRow.tsx',
		screen,
		scenarios: [
			{
				name: 'stock && …',
				intro: 'The headphones are out of stock (<code>stock</code> is 0).',
				code: `
<p>
  {headphones.name}
  {headphones.stock && <span>In stock</span>}
</p>`,
				steps: [
					{ at: 'stock &&', say: '<code>a && b</code> returns <code>a</code> when <code>a</code> is falsy. <code>0</code> is falsy, so the whole expression is <code>0</code> and the span is never created.', screen: { data: [null, 'upd'] } },
					{ at: 'stock &&', phase: 'render', say: 'React skips <code>false</code>, <code>null</code> and <code>undefined</code>, but a number is valid content, so it renders the <code>0</code>.' },
					{ phase: 'commit', say: 'A stray zero appears. Recorded HTML: <code>&lt;p&gt;0&lt;/p&gt;</code>.', screen: { out: ['Wireless Headphones 0', 'bad'] } },
				],
			},
			{
				name: 'stock > 0 && …',
				intro: 'The same with an explicit comparison.',
				code: `
<p>
  {headphones.name}
  {headphones.stock > 0 && <span>In stock</span>}
</p>`,
				steps: [
					{ at: 'stock > 0', say: '<code>0 > 0</code> is <code>false</code>, a real boolean.', screen: { data: [null, 'upd'] } },
					{ at: 'stock > 0', phase: 'render', say: 'React renders nothing for <code>false</code>.' },
					{ phase: 'commit', say: 'Nothing extra is shown. Recorded HTML: <code>&lt;p&gt;&lt;/p&gt;</code>.', screen: { out: ['Wireless Headphones', 'ok'] } },
				],
			},
		],
	})
}

// ─── Custom Components: who calls the function, and when ───────────────────

export function whoCallsAnim() {
	const con = ['1. building elements', '  Price runs', '2. elements built, calling render()', '3. on screen']
	return codeAnim({
		id: 'fund-who-anim',
		caption: 'Same output, different owner. The order of the log lines was recorded from the product store.',
		file: 'main.tsx',
		console: con,
		scenarios: [
			{
				name: 'You call Price()',
				intro: '<code>{Price({ cents })}</code>: a plain function call.',
				code: `
function Price({ cents }) {
  log('  Price runs')
  return <p>{formatUSD(cents)}</p>
}

log('1. building elements')
const element = <div>{Price({ cents: 1800 })}</div>
log('2. elements built, calling render()')
reactRoot.render(element)`,
				steps: [
					{ at: "log('1. building", say: 'The first log line.', log: '1. building' },
					{ at: ['Price({ cents: 1800 })', "log('  Price runs')"], say: '<b>You</b> call <code>Price</code>, like any function: it runs right away, while the JSX is still being built.', log: 'Price runs' },
					{ at: "log('2. elements", say: 'Only then is the element finished.', log: '2. elements built' },
					{ at: 'reactRoot.render(element)', say: 'React receives a <code>&lt;p&gt;</code> element and never sees <code>Price</code>, so it can’t give it state, skip it, or call it again later.', log: '3. on screen' },
				],
			},
			{
				name: 'React calls Price',
				intro: '<code>{createElement(Price, { cents })}</code>, which is what <code>&lt;Price cents={…} /&gt;</code> compiles to.',
				code: `
function Price({ cents }) {
  log('  Price runs')
  return <p>{formatUSD(cents)}</p>
}

log('1. building elements')
const element = <div>{createElement(Price, { cents: 1800 })}</div>
log('2. elements built, calling render()')
reactRoot.render(element)`,
				console: ['1. building elements', '2. elements built, calling render()', '  Price runs', '3. on screen'],
				steps: [
					{ at: "log('1. building", say: 'The first log line.', log: '1. building' },
					{ at: 'createElement(Price', say: 'Passing <code>Price</code> itself creates an element <code>{ type: Price, props }</code>. <code>Price</code> does <b>not</b> run.' },
					{ at: "log('2. elements", say: 'The element is finished, and <code>Price</code> still hasn’t run.', log: '2. elements built' },
					{ at: ['reactRoot.render(element)', "log('  Price runs')"], phase: 'render', say: '<b>React</b> calls <code>Price</code> while rendering. Because React owns the call, it can attach state to it, skip it, or call it again on the next render.', log: 'Price runs' },
					{ phase: 'commit', say: 'Then the result reaches the screen.', log: '3. on screen' },
				],
			},
		],
	})
}

// ─── TypeScript: one object, the type derived from it ──────────────────────

export function deriveTypeAnim() {
	return codeAnim({
		id: 'fund-types-anim',
		caption: 'One source of truth: the object defines the allowed currencies, and the types follow it.',
		file: 'price.tsx',
		code: `
const formatters = {
  USD: (cents: number) => \`$\${cents / 100}\`,
  EUR: (cents: number) => \`€\${cents / 100}\`,
  GBP: (cents: number) => \`£\${cents / 100}\`,
} satisfies Record<string, Formatter>

type Currency = keyof typeof formatters

type PriceProps = { cents: number; currency?: Currency }

<Price cents="89.00" />      // ✗
<Price currency="JPY" />     // ✗
<Price currency="EUR" />     // ✗`,
		screen: [
			['type', 'Currency = ?', 'box'],
			['tsc', 'tsc: not run yet', 'muted'],
		],
		scenarios: [
			{
				name: 'Deriving Currency',
				intro: 'From the <code>formatters</code> object to a checked <code>Price</code> component.',
				steps: [
					{ at: 'satisfies Record', say: '<code>satisfies</code> checks that every value is a <code>(cents: number) =&gt; string</code>, but does <b>not</b> widen the object: its keys stay exactly <code>USD</code>, <code>EUR</code>, <code>GBP</code>.' },
					{ at: 'keyof typeof formatters', say: '<code>typeof</code> turns the <b>value</b> into its type, and <code>keyof</code> takes its keys as a union. Add a currency to the object and the type follows.', screen: { type: 'Currency = "USD" | "EUR" | "GBP"' } },
					{ at: 'type PriceProps', say: 'The props use the derived union.' },
					{ at: ['cents="89.00"', 'currency="JPY"', 'currency="EUR"'], say: 'Three mistakes, three compile errors, before any code runs: a string for a number (TS2322), an unknown currency (TS2322), and a missing <code>cents</code> (TS2741).', screen: { tsc: ['tsc: 3 errors (recorded)', 'bad'] } },
				],
			},
		],
	})
}

// ─── Styling: later keys win ────────────────────────────────────────────────

export function mergeOrderAnim() {
	const screen = [
		['call', '&lt;Tag style={{ fontWeight: 400, marginLeft: 8 }}&gt;', 'muted'],
		['result', 'style = ?', 'box'],
	]
	return codeAnim({
		id: 'fund-merge-anim',
		caption: 'Object spread follows one rule: for the same key, whatever comes later wins. Props spread in JSX works the same way.',
		file: 'Tag.tsx',
		screen,
		scenarios: [
			{
				name: '{ fontWeight: 600, ...style }',
				intro: 'The default first, the caller’s style second.',
				code: `
function Tag({ style, ...rest }) {
  return <span style={{
    fontWeight: 600,
    ...style,
  }} {...rest} />
}`,
				steps: [
					{ at: 'fontWeight: 600', say: 'The component’s default is written first.', screen: { result: 'style = { fontWeight: 600 }' } },
					{ at: '...style,', say: 'The caller’s keys are copied after it. For the same key, the <b>later</b> one replaces it.', screen: { result: 'style = { fontWeight: 400, marginLeft: 8 }' } },
					{ phase: 'commit', say: 'The caller can override the default. Recorded HTML: <code>style="font-weight: 400; margin-left: 8px;"</code>.', screen: { result: ['font-weight: 400; margin-left: 8px', 'ok'] } },
				],
			},
			{
				name: '{ ...style, fontWeight: 600 }',
				intro: 'The caller’s style first, the default second.',
				code: `
function Tag({ style, ...rest }) {
  return <span style={{
    ...style,
    fontWeight: 600,
  }} {...rest} />
}`,
				steps: [
					{ at: '...style,', say: 'The caller’s keys are copied first.', screen: { result: 'style = { fontWeight: 400, marginLeft: 8 }' } },
					{ at: 'fontWeight: 600', say: 'The default comes later, so it replaces the caller’s value.', screen: { result: 'style = { fontWeight: 600, marginLeft: 8 }' } },
					{ phase: 'commit', say: 'The default can’t be overridden; the caller can only add other keys.', screen: { result: ['font-weight: 600; margin-left: 8px', 'bad'] } },
				],
			},
		],
	})
}

// ─── Forms: three ways to submit ────────────────────────────────────────────

export function submitAnim() {
	const fields = `  <input name="storeName" />
  <input name="password" type="password" />
  <input name="logo" type="file" />
  <button type="submit">Create store</button>
</form>`
	const screen = [
		['click', 'Create store', 'button'],
		['req', 'Request: –', 'box'],
		['page', 'Page: the form', 'muted'],
	]
	return codeAnim({
		id: 'fund-submit-anim',
		caption: 'The same “Become a seller” form submitted three ways (all three recorded).',
		file: 'SellerForm.tsx',
		screen,
		scenarios: [
			{
				name: 'Default (GET)',
				intro: 'A form with only an <code>action</code> URL.',
				code: `<form action="/submitted.html">\n${fields}`,
				steps: [
					{ at: 'type="submit"', phase: 'event', say: 'Clicking a <code>type="submit"</code> button submits its form.', screen: { click: [null, 'upd'] } },
					{ at: 'name="storeName"', say: 'The browser collects every field that has a <code>name</code>.' },
					{ at: '<form action', say: 'With the default method (<code>GET</code>), the fields go into the <b>URL</b>. Recorded: <code>?storeName=…&amp;password=hunter2&amp;logo=logo.svg</code>. The password is now in the browser history, and the file is only its name.', screen: { req: ['GET /submitted.html?…&amp;password=hunter2&amp;logo=logo.svg', 'bad'] } },
					{ say: 'The browser leaves the page: a full page load.', screen: { page: ['Page: submitted.html (new page)', 'upd'] } },
				],
			},
			{
				name: 'POST + multipart',
				intro: '<code>method="POST"</code> and <code>encType="multipart/form-data"</code>.',
				code: `<form action="/submitted.html"\n  method="POST" encType="multipart/form-data">\n${fields}`,
				steps: [
					{ at: 'type="submit"', phase: 'event', say: 'The same click.', screen: { click: [null, 'upd'] } },
					{ at: 'method="POST"', say: '<code>POST</code> puts the fields in the request <b>body</b>, and <code>multipart/form-data</code> sends each field as a part, including the file’s real bytes. Recorded: the server received the SVG.', screen: { req: ['POST body: storeName · password · logo.svg (file bytes)', 'ok'] } },
					{ say: 'Still a full page load, unless you stop it with <code>event.preventDefault()</code>.', screen: { page: ['Page: submitted.html (new page)', 'upd'] } },
				],
			},
			{
				name: 'React action',
				intro: 'A function as the <code>action</code>.',
				code: `function createStore(formData: FormData) {\n  log('action received:', Object.fromEntries(formData))\n}\n\n<form action={createStore}>\n${fields}`,
				steps: [
					{ at: 'type="submit"', phase: 'event', say: 'The same click.', screen: { click: [null, 'upd'] } },
					{ at: 'action={createStore}', say: 'React builds the <code>FormData</code>, prevents the navigation, and calls your function.' },
					{ at: "log('action received:'", say: 'Recorded: <code>action received: { storeName: "Mugs &amp; More", … }</code>. No request was sent by the browser.', screen: { req: ['No request: your function ran', 'ok'] } },
					{ phase: 'commit', say: 'Afterwards React resets the uncontrolled fields. Recorded: the store-name input was empty after submitting, and the URL didn’t change.', screen: { page: ['Page: the same form, fields cleared', 'ok'] } },
				],
			},
		],
	})
}

// ─── Inputs: value vs defaultValue ─────────────────────────────────────────

export function controlledAnim() {
	return codeAnim({
		id: 'fund-controlled-anim',
		caption: '<code>value</code> means “React decides what this shows”; <code>defaultValue</code> means “start here, then it’s the user’s” (recorded).',
		file: 'Inputs.tsx',
		code: `
<input id="pinned" value="Ceramic Mug" />

<input id="prefilled" defaultValue="Ceramic Mug" />`,
		screen: [
			['pinned', 'Ceramic Mug', 'input'],
			['prefilled', 'Ceramic Mug', 'input'],
			['warn', 'Console: –', 'muted'],
		],
		scenarios: [
			{
				name: 'Typing into both',
				intro: 'Two inputs that look the same until someone types.',
				steps: [
					{ phase: 'event', say: 'The user types in both. The browser updates each input’s text right away.', screen: { pinned: 'Ceramic MugXYZ', prefilled: 'Ceramic Mug XL' } },
					{ at: 'value="Ceramic Mug"', phase: 'render', say: 'For the first input, React puts its value back: the <code>value</code> prop still says <code>"Ceramic Mug"</code>, and nothing changed it.', screen: { pinned: ['Ceramic Mug', 'bad'] } },
					{ at: 'defaultValue', say: 'The <code>defaultValue</code> input used the prop only once, when it mounted. The typing stays.', screen: { prefilled: ['Ceramic Mug XL', 'ok'] } },
					{ at: 'value="Ceramic Mug"', say: 'React also warned that a <code>value</code> without an <code>onChange</code> makes a read-only field. Fix: add <code>onChange</code> with state, or use <code>defaultValue</code>.', screen: { warn: ['Console: “You provided a `value` prop to a form field without an `onChange` handler…”', 'bad'] } },
				],
			},
		],
	})
}

// ─── Error Boundaries ───────────────────────────────────────────────────────

export function boundaryAnim() {
	const details = `function ProductDetails({ product }) {
  return <p>{formatUSD(product.price.cents)}</p>
}`
	return codeAnim({
		id: 'fund-boundary-anim',
		caption: 'A product with no price throws while rendering. The error travels up to the nearest error boundary, like an exception to the nearest catch (both recorded).',
		file: 'Store.tsx',
		rendersTitle: 'Components',
		scenarios: [
			{
				name: 'No boundary',
				intro: 'The broken product, rendered without protection.',
				code: `${details}\n\n<main>\n  <h1>Store</h1>\n  <ProductDetails product={mysteryBox} />\n</main>`,
				screen: [['page', 'Store · Mystery Box …', 'box']],
				renders: ['ProductDetails (Mystery Box)'],
				steps: [
					{ at: 'product.price.cents', phase: 'render', say: 'The product has no <code>price</code>, so this throws: <code>Cannot read properties of undefined (reading \'cents\')</code>.', rendered: { ProductDetails: 'error' } },
					{ at: 'product.price.cents', phase: 'render', say: 'React renders once more to rule out a one-off glitch (recorded: <code>ProductDetails renders p404</code> twice). It throws again.', rendered: { ProductDetails: 'error' } },
					{ at: '<main>', say: 'React walks up the tree looking for an error boundary. There is none.' },
					{ phase: 'commit', say: 'With no boundary, React removes <b>everything</b>. Recorded: <code>#root</code> was empty, and <code>onUncaughtError</code> fired.', screen: { page: ['(blank page)', 'bad'] }, rendered: { ProductDetails: 'unmounted' } },
				],
			},
			{
				name: 'With a boundary',
				intro: 'The same product inside an <code>ErrorBoundary</code>, next to a healthy one.',
				code: `${details}\n\n<main>\n  <h1>Store</h1>\n  <ErrorBoundary FallbackComponent={ErrorFallback}>\n    <ProductDetails product={mysteryBox} />\n  </ErrorBoundary>\n  <ProductDetails product={mug} />\n</main>`,
				screen: [['page', 'Store · …', 'box']],
				renders: ['ProductDetails (Mystery Box)'],
				steps: [
					{ at: 'product.price.cents', phase: 'render', say: 'The same error is thrown, this time inside an <code>ErrorBoundary</code>.', rendered: { ProductDetails: 'error' } },
					{ at: '<ErrorBoundary', phase: 'render', say: 'React retries once, then walks up and finds the <b>nearest</b> boundary. It renders the boundary’s fallback instead of its children.', rendered: { ProductDetails: 'unmounted' } },
					{ phase: 'commit', say: 'Only that part of the page changes. Recorded screen: “Store”, “Couldn’t show this product: …”, “Try again”, and the healthy Ceramic Mug still there.', screen: { page: ['Store · “Couldn’t show this product” [Try again] · Ceramic Mug $18.00', 'ok'] } },
				],
			},
		],
	})
}

// ─── Rendering Arrays: index keys vs id keys ───────────────────────────────

export function cartKeysAnim() {
	const screen = [
		['r0', 'Ceramic Mug · note: “Gift wrap, please”', 'input'],
		['r1', 'Wireless Headphones · note: (empty)', 'input'],
		['r2', 'Trail Backpack · note: (empty)', 'input'],
	]
	const code = (key) => `
function Cart() {
  const [items, setItems] = useState(initial)
  return items.map((item, index) => (
    <li key={${key}}>
      <span>{item.name}</span>
      <input placeholder="Gift note" />
      <button onClick={() => remove(item.id)}>Remove</button>
    </li>
  ))
}`
	return codeAnim({
		id: 'fund-cart-keys-anim',
		caption: 'A gift note is typed on the first cart item, then that item is removed. The key decides whose note survives (both recorded).',
		file: 'Cart.tsx',
		screen,
		scenarios: [
			{
				name: 'key={index}',
				intro: 'Rows keyed by their position.',
				code: code('index'),
				steps: [
					{ at: 'remove(item.id)', phase: 'event', say: 'Click <b>Remove</b> on the Ceramic Mug. The list now has two items: Headphones, Backpack.' },
					{ at: 'key={index}', phase: 'render', say: 'With index keys, the Headphones now have key <code>0</code>, the key the Mug’s row had. So React thinks row 0 is still the same row.' },
					{ at: '<span>{item.name}</span>', phase: 'commit', say: 'React <b>keeps</b> row 0’s DOM, its input included, and only changes the text. The last row is deleted.', screen: { r0: 'Wireless Headphones · note: “Gift wrap, please”', r1: 'Trail Backpack · note: (empty)', r2: ['(removed)', 'bad'] } },
					{ say: 'The Mug’s gift note now sits next to the <b>Headphones</b>. Recorded: <code>{ item: "Wireless Headphones", note: "Gift wrap, please" }</code>. No key at all gives the same wrong result.', screen: { r0: ['Wireless Headphones · note: “Gift wrap, please”', 'bad'] } },
				],
			},
			{
				name: 'key={item.id}',
				intro: 'Rows keyed by the product’s id.',
				code: code('item.id'),
				steps: [
					{ at: 'remove(item.id)', phase: 'event', say: 'The same click.' },
					{ at: 'key={item.id}', phase: 'render', say: 'With id keys, React sees that <code>p1</code> is gone and <code>p2</code> and <code>p3</code> are still there.' },
					{ phase: 'commit', say: 'The Mug’s row is removed, with its input and its note. The other rows keep their DOM untouched.', screen: { r0: ['(removed)', 'upd'], r1: ['Wireless Headphones · note: (empty)', 'ok'], r2: ['Trail Backpack · note: (empty)', 'ok'] } },
					{ say: 'Recorded: <code>{ item: "Wireless Headphones", note: "" }</code>. Every note stays with its product.' },
				],
			},
		],
	})
}
