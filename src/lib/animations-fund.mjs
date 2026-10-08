// Animations for the React Fundamentals module. Every outcome shown here was
// recorded from examples/product-store (scripts/record.mjs → generated/fundamentals.json).

import { anim, node, chip, tree, panel } from './anim.mjs'
import { flashcards } from './engine-map.mjs'

/** Flashcards for the public APIs (the Fundamentals quiz). */
export const apiFlashcards = () => flashcards('api')

const lt = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const line = (k, code, s = '') => `<div class="an call" data-k="${k}"${s ? ` data-s="${s}"` : ''}><code>${lt(code)}</code></div>`
const logLine = (k, text) => `<div class="an" data-k="${k}" data-s="ghost">${lt(text)}</div>`

// ─── Hello World in JS: built in memory, then appended ─────────────────────

export function domCardAnim() {
	const scene = `<div class="a-cols">
		${panel('your code', `<div class="a-col">
			${line('l1', "const card = document.createElement('article')")}
			${line('l2', "name.textContent = 'Ceramic Mug'")}
			${line('l3', "price.textContent = '$18.00'")}
			${line('l4', 'card.append(name, price)')}
			${line('l5', 'rootElement.append(card)')}
		</div>`, 'wide')}
		${panel('in memory (not on the page)', `<div class="a-col">
			${chip('m-card', '&lt;article class="product-card"&gt;', 'ghost')}
			${chip('m-h2', '&lt;h2&gt;Ceramic Mug&lt;/h2&gt;', 'ghost')}
			${chip('m-p', '&lt;p class="price"&gt;$18.00&lt;/p&gt;', 'ghost')}
		</div>`)}
		${panel('the page', `<div class="a-col"><div class="a-dom">&lt;div id="root"&gt;<span class="an" data-k="dom" data-s="ghost"><br>&nbsp;&nbsp;&lt;article&gt;&lt;h2&gt;Ceramic Mug&lt;/h2&gt;&lt;p&gt;$18.00&lt;/p&gt;&lt;/article&gt;<br></span>&lt;/div&gt;</div>
			${chip('onpage', 'document.body.contains(card) → false')}
		</div>`)}
	</div>`
	const steps = [
		{ fn: "document.createElement('article')", say: 'A real DOM node is created, but only <b>in memory</b>. Nothing on the page changes.', set: { l1: 'hl', 'm-card': 'new' } },
		{ fn: "name.textContent = 'Ceramic Mug'", say: 'The <code>h2</code> gets its text. Still in memory.', set: { l1: '', l2: 'hl', 'm-h2': 'new' } },
		{ fn: "price.textContent = '$18.00'", say: 'Same for the price.', set: { l2: '', l3: 'hl', 'm-p': 'new' } },
		{ fn: 'card.append(name, price)', say: 'The pieces are put together into one card, still detached. The recording logged <code>On the page? false</code> at this point.', set: { l3: '', l4: 'hl', 'm-h2': 'keep', 'm-p': 'keep', 'm-card': 'keep' } },
		{ fn: 'rootElement.append(card)', say: '<b>Only now</b> does the card appear: appending to a node that is already on the page attaches it. The recording logged <code>On the page? true</code>.', set: { l4: '', l5: 'hl', 'm-card': 'faint', 'm-h2': 'faint', 'm-p': 'faint', dom: 'new', onpage: 'ok' }, txt: { onpage: 'document.body.contains(card) → true' } },
	]
	return anim({
		id: 'fund-dom-anim',
		caption: 'Create, change, append: the three manual steps that React later does for you.',
		scenarios: [{ name: 'Building a card by hand', intro: 'Building a product card with nothing but the DOM API.', scene, steps }],
	})
}

// ─── Raw React APIs: objects first, DOM later ───────────────────────────────

export function elementObjectAnim() {
	const el = (k, html) => `<div class="an el-obj" data-k="${k}" data-s="ghost">${html}</div>`
	const scene = `<div class="a-cols">
		${panel('calls (innermost runs first)', `<div class="a-col">
			${line('c-h2', "createElement('h2', null, 'Ceramic Mug')")}
			${line('c-p', "createElement('p', { className: 'price' }, '$18.00')")}
			${line('c-art', "createElement('article', { className: 'product-card' }, h2, p)")}
			${line('c-render', 'createRoot(root).render(article)')}
		</div>`, 'wide')}
		${panel('objects returned', `<div class="a-col">
			${el('e-h2', '{ type: "h2", props: { children: "Ceramic Mug" } }')}
			${el('e-p', '{ type: "p", props: { className: "price", children: "$18.00" } }')}
			${el('e-art', '{ type: "article", props: { className: "product-card", children: [h2, p] } }')}
		</div>`)}
		${panel('#root on the page', `<div class="a-col"><div class="a-dom"><span class="an" data-k="dom">(empty)</span></div></div>`)}
	</div>`
	const steps = [
		{ fn: "createElement('h2', null, 'Ceramic Mug')", say: 'JavaScript evaluates arguments before the call they belong to, so the inner calls run first. Each returns a <b>plain object</b>, not a DOM node.', set: { 'c-h2': 'hl', 'e-h2': 'new' } },
		{ fn: "createElement('p', { className: 'price' }, '$18.00')", say: 'Another plain object.', set: { 'c-h2': '', 'c-p': 'hl', 'e-p': 'new' } },
		{ fn: "createElement('article', …, h2, p)", say: 'The outer call receives the two objects as children. The result describes the whole card. It is <b>frozen</b>: the recording logged <code>frozen? true true</code>.', set: { 'c-p': '', 'c-art': 'hl', 'e-art': 'new' } },
		{ fn: 'root.render(article)', say: '<code>render()</code> only <b>schedules</b> work. Right after it returns, <code>#root</code> is still empty: the recording logged <code>right after render(): ""</code>.', set: { 'c-art': '', 'c-render': 'hl', dom: 'faint' }, txt: { dom: '(still empty)' } },
		{ fn: '…a moment later', say: 'React turns the objects into DOM nodes and appends them in one go.', set: { 'c-render': '', dom: 'new' }, txt: { dom: '&lt;article class="product-card"&gt;&lt;h2&gt;Ceramic Mug&lt;/h2&gt;&lt;p class="price"&gt;$18.00&lt;/p&gt;&lt;/article&gt;' } },
	]
	return anim({
		id: 'fund-element-anim',
		caption: 'createElement builds a description; React creates the DOM later.',
		scenarios: [{ name: 'createElement → render', intro: 'The product card with React, no JSX.', scene, steps }],
	})
}

// ─── Using JSX: why `{stock && …}` prints 0 ────────────────────────────────

export function andZeroAnim() {
	const mk = (cond) => `<div class="a-cols">
		${panel('the expression', `<div class="a-col">${line('expr', `{${cond} && <span>In stock</span>}`)}${chip('val', 'headphones.stock = 0')}</div>`, 'wide')}
		${panel('what React gets', `<div class="a-col">${chip('child', '?', 'faint')}</div>`)}
		${panel('on the page', `<div class="a-col"><div class="a-dom"><span class="an" data-k="out">&lt;p&gt;&lt;/p&gt;</span></div></div>`)}
	</div>`
	const buggy = [
		{ fn: 'stock && <span>…</span>', say: '<code>&&</code> returns the <b>left side</b> if it is falsy. <code>0</code> is falsy, so the whole expression is <code>0</code>; the span is never created.', set: { expr: 'hl', val: 'cmp' } },
		{ fn: 'children: 0', say: 'React skips <code>false</code>, <code>null</code> and <code>undefined</code>, but a number is valid content.', set: { child: 'bad' }, txt: { child: '0 (a number)' } },
		{ fn: 'render', say: 'So a stray <b>0</b> appears. Recorded HTML: <code>&lt;p&gt;0&lt;/p&gt;</code>.', set: { out: 'bad' }, txt: { out: '&lt;p&gt;0&lt;/p&gt;' } },
	]
	const fixed = [
		{ fn: 'stock > 0 && <span>…</span>', say: 'Compare first: <code>0 > 0</code> is <code>false</code>, a real boolean.', set: { expr: 'hl', val: 'cmp' } },
		{ fn: 'children: false', say: 'React renders nothing for <code>false</code>.', set: { child: 'ok' }, txt: { child: 'false' } },
		{ fn: 'render', say: 'Nothing is printed. Recorded HTML: <code>&lt;p&gt;&lt;/p&gt;</code>.', set: { out: 'ok' } },
	]
	return anim({
		id: 'fund-and-anim',
		caption: 'The most common JSX bug, and its one-character fix.',
		scenarios: [
			{ name: 'stock && …', intro: '<code>{stock && …}</code> when the headphones are out of stock.', scene: mk('stock'), steps: buggy },
			{ name: 'stock > 0 && …', intro: 'The same with an explicit comparison.', scene: mk('stock > 0'), steps: fixed },
		],
	})
}

// ─── Custom Components: who calls the function, and when ───────────────────

export function whoCallsAnim() {
	const mk = (call) => `<div class="a-cols">
		${panel('lesson code', `<div class="a-col">
			${line('a', "log('1. building elements')")}
			${line('b', `const element = <div>{${call}}</div>`)}
			${line('c', "log('2. elements built, calling render()')")}
			${line('d', 'reactRoot.render(element)')}
		</div>`, 'wide')}
		${panel('console (recorded)', `<div class="a-log">
			${logLine('o1', '1. building elements')}
			${logLine('o2a', '  Price runs')}
			${logLine('o3', '2. elements built, calling render()')}
			${logLine('o2b', '  Price runs')}
			${logLine('o4', '3. on screen')}
		</div>`)}
	</div>`
	const called = [
		{ fn: "log('1. building elements')", say: 'Logs the first line.', set: { a: 'hl', o1: 'new' } },
		{ fn: 'Price({ cents: 1800 })', say: '<b>You</b> call <code>Price</code>, like any function. It runs immediately, while the JSX is still being built.', set: { a: '', b: 'hl', o2a: 'run' } },
		{ fn: "log('2. …')", say: 'Only after that is the element finished.', set: { b: '', c: 'hl', o2a: 'done', o3: 'new' } },
		{ fn: 'render(element)', say: 'React gets a <code>&lt;p&gt;</code> element: it never sees <code>Price</code>, so it can’t give it state, skip it, or call it again later.', set: { c: '', d: 'hl', o4: 'new' } },
	]
	const element = [
		{ fn: "log('1. building elements')", say: 'Logs the first line.', set: { a: 'hl', o1: 'new' } },
		{ fn: 'createElement(Price, { cents: 1800 })', say: 'Passing <code>Price</code> itself creates an element <code>{ type: Price, props }</code>. <code>Price</code> does <b>not</b> run.', set: { a: '', b: 'hl' } },
		{ fn: "log('2. …')", say: 'The element is done and <code>Price</code> still hasn’t run.', set: { b: '', c: 'hl', o3: 'new' } },
		{ fn: 'render(element) → Price(props)', say: '<b>React</b> calls <code>Price</code> while rendering. Because React owns the call, it can attach state to it, skip it, or call it again on the next render.', set: { c: '', d: 'hl', o2b: 'run' } },
		{ fn: 'commit', say: 'Then the result reaches the screen.', set: { d: '', o2b: 'done', o4: 'new' } },
	]
	return anim({
		id: 'fund-who-anim',
		caption: 'Same output, different owner: the log order was recorded from the product store.',
		scenarios: [
			{ name: 'You call Price()', intro: '<code>{Price({ cents })}</code>: a plain function call.', scene: mk('Price({ cents })'), steps: called },
			{ name: 'React calls Price', intro: '<code>{createElement(Price, { cents })}</code>, which is what <code>&lt;Price cents={…} /&gt;</code> compiles to.', scene: mk('createElement(Price, { cents })'), steps: element },
		],
	})
}

// ─── TypeScript: one object, the type derived from it ──────────────────────

export function deriveTypeAnim() {
	const scene = `<div class="a-cols">
		${panel('value (runs in the browser)', `<div class="a-col">${line('obj', "const formatters = { USD: …, EUR: …, GBP: … }")}${line('sat', 'satisfies Record<string, Formatter>', 'faint')}</div>`, 'wide')}
		${panel('types (erased before running)', `<div class="a-col">
			${chip('t1', 'typeof formatters → { USD: (c) => string; EUR: …; GBP: … }', 'ghost')}
			${chip('t2', 'keyof … → "USD" | "EUR" | "GBP"', 'ghost')}
			${chip('t3', 'PriceProps.currency?: Currency', 'ghost')}
		</div>`)}
		${panel('tsc on the mistakes file', `<div class="a-col">
			${chip('e1', '&lt;Price cents="89.00" /&gt; → TS2322', 'ghost')}
			${chip('e2', '&lt;Price currency="JPY" /&gt; → TS2322', 'ghost')}
			${chip('e3', '&lt;Price currency="EUR" /&gt; → TS2741', 'ghost')}
		</div>`)}
	</div>`
	const steps = [
		{ fn: 'satisfies Record<string, Formatter>', say: '<code>satisfies</code> checks every value is a <code>(cents: number) => string</code> but does <b>not</b> widen the object: its keys stay exactly <code>USD</code>, <code>EUR</code>, <code>GBP</code>.', set: { obj: 'hl', sat: 'cmp' } },
		{ fn: 'typeof formatters', say: '<code>typeof</code> (in a type position) turns the <b>value</b> into its type.', set: { sat: '', t1: 'new' } },
		{ fn: 'keyof typeof formatters', say: '<code>keyof</code> takes that type’s keys as a union. Add a currency to the object and the type follows.', set: { t2: 'new' } },
		{ fn: 'type PriceProps = { cents: number; currency?: Currency }', say: 'The props use the derived union.', set: { obj: '', t3: 'new' } },
		{ fn: 'tsc --noEmit', say: 'Three mistakes, three compile errors, before any code runs (recorded output below).', set: { e1: 'bad', e2: 'bad', e3: 'bad' } },
	]
	return anim({
		id: 'fund-types-anim',
		caption: 'One source of truth: the object defines the allowed currencies, the types follow.',
		scenarios: [{ name: 'Deriving Currency', intro: 'From the <code>formatters</code> object to a checked <code>Price</code> component.', scene, steps }],
	})
}

// ─── Styling: later keys win ────────────────────────────────────────────────

export function mergeOrderAnim() {
	const mk = (order) => `<div class="a-cols">
		${panel('object literal, written left to right', `<div class="a-col">${line('lit', order)}</div>`, 'wide')}
		${panel('resulting style', `<div class="a-col">
			${chip('fw', 'fontWeight: —', 'faint')}
			${chip('ml', 'marginLeft: —', 'faint')}
		</div>`)}
	</div>`
	const defaultFirst = [
		{ fn: 'fontWeight: 600', say: 'The component’s default is written first.', set: { lit: 'hl', fw: 'new' }, txt: { fw: 'fontWeight: 600 (default)' } },
		{ fn: '...style  // { fontWeight: 400, marginLeft: 8 }', say: 'The caller’s keys are copied after it. Same key → the <b>later</b> one replaces it.', set: { fw: 'upd', ml: 'new' }, txt: { fw: 'fontWeight: 400 (caller)', ml: 'marginLeft: 8 (caller)' } },
		{ fn: 'result', say: 'The caller can override the default. Recorded HTML: <code>style="font-weight: 400; margin-left: 8px;"</code>.', set: { lit: '', fw: 'ok', ml: 'ok' } },
	]
	const spreadFirst = [
		{ fn: '...style  // { fontWeight: 400, marginLeft: 8 }', say: 'The caller’s keys are copied first.', set: { lit: 'hl', fw: 'new', ml: 'new' }, txt: { fw: 'fontWeight: 400 (caller)', ml: 'marginLeft: 8 (caller)' } },
		{ fn: 'fontWeight: 600', say: 'The default comes later, so it replaces the caller’s value.', set: { fw: 'upd' }, txt: { fw: 'fontWeight: 600 (default)' } },
		{ fn: 'result', say: 'The default can’t be overridden; the caller can only add other keys.', set: { lit: '', fw: 'ok', ml: 'ok' } },
	]
	return anim({
		id: 'fund-merge-anim',
		caption: 'Object spread follows one rule: for the same key, whatever is written later wins. Props spread in JSX work the same way.',
		scenarios: [
			{ name: '{ fontWeight: 600, ...style }', intro: 'Default first, caller second.', scene: mk('{ fontWeight: 600, ...style }'), steps: defaultFirst },
			{ name: '{ ...style, fontWeight: 600 }', intro: 'Caller first, default second.', scene: mk('{ ...style, fontWeight: 600 }'), steps: spreadFirst },
		],
	})
}

// ─── Forms: three ways to submit ────────────────────────────────────────────

export function submitAnim() {
	const mk = (form) => `<div class="a-cols">
		${panel('the form', `<div class="a-col">${line('form', form)}${chip('click', 'click “Create store”')}</div>`, 'wide')}
		${panel('browser', `<div class="a-col">
			${chip('fd', 'collects named fields → FormData', 'ghost')}
			${chip('req', 'request', 'ghost')}
		</div>`)}
		${panel('result', `<div class="a-col">${chip('res', 'page', 'faint')}</div>`)}
	</div>`
	const get = [
		{ fn: 'submit', say: 'Clicking a <code>type="submit"</code> button submits its form.', set: { click: 'hl' } },
		{ fn: 'new FormData(form)', say: 'The browser reads every field with a <code>name</code>.', set: { fd: 'new' } },
		{ fn: 'GET /submitted.html?…', say: 'With the default <code>GET</code>, fields become the <b>URL</b>. Recorded address: <code>…&amp;password=hunter2&amp;logo=logo.svg</code>. The password is now in the history, and the file is only its name.', set: { req: 'bad' }, txt: { req: 'GET ?storeName=…&amp;password=hunter2&amp;logo=logo.svg' } },
		{ fn: 'navigate', say: 'The browser leaves the page (a full reload).', set: { res: 'upd' }, txt: { res: 'new page: submitted.html' } },
	]
	const post = [
		{ fn: 'submit', say: 'Same click.', set: { click: 'hl' } },
		{ fn: 'new FormData(form)', say: 'Same fields.', set: { fd: 'new' } },
		{ fn: 'POST multipart/form-data', say: '<code>method="POST"</code> puts the fields in the request <b>body</b>; <code>multipart/form-data</code> sends each field as a part, including the file’s real bytes (the server received the SVG).', set: { req: 'ok' }, txt: { req: 'POST body: storeName · email · password · logo.svg (bytes)' } },
		{ fn: 'navigate', say: 'Still a full page load, unless you stop it with <code>event.preventDefault()</code>.', set: { res: 'upd' }, txt: { res: 'new page: submitted.html' } },
	]
	const action = [
		{ fn: 'submit', say: 'Same click.', set: { click: 'hl' } },
		{ fn: 'new FormData(form)', say: 'React builds the <code>FormData</code> for you…', set: { fd: 'new' } },
		{ fn: 'createStore(formData)', say: '…prevents the navigation, and calls your function. Recorded: <code>action received: { storeName: "Mugs &amp; More", … }</code>.', set: { req: 'ok' }, txt: { req: 'no request: your function runs' } },
		{ fn: 'form.reset()', say: 'Afterwards React resets the uncontrolled fields. Recorded: the store-name input was <code>""</code> after submitting, and the URL didn’t change.', set: { res: 'ok' }, txt: { res: 'same page, fields reset' } },
	]
	return anim({
		id: 'fund-submit-anim',
		caption: 'The same “Become a seller” form submitted three ways (all three recorded).',
		scenarios: [
			{ name: 'Default (GET)', intro: '<code>&lt;form action="/submitted.html"&gt;</code>', scene: mk('<form action="/submitted.html">'), steps: get },
			{ name: 'POST + multipart', intro: '<code>method="POST" encType="multipart/form-data"</code>', scene: mk('<form method="POST" encType="multipart/form-data">'), steps: post },
			{ name: 'React action', intro: '<code>&lt;form action={createStore}&gt;</code>', scene: mk('<form action={createStore}>'), steps: action },
		],
	})
}

// ─── Inputs: value vs defaultValue ─────────────────────────────────────────

export function controlledAnim() {
	const scene = `<div class="a-cols">
		${panel('&lt;input value="Ceramic Mug" /&gt;', `<div class="a-col">${chip('p-dom', 'DOM: Ceramic Mug')}${chip('p-react', 'React says: Ceramic Mug', 'faint')}</div>`)}
		${panel('&lt;input defaultValue="Ceramic Mug" /&gt;', `<div class="a-col">${chip('d-dom', 'DOM: Ceramic Mug')}${chip('d-react', 'React: not involved after mount', 'faint')}</div>`)}
	</div>`
	const steps = [
		{ fn: 'user types "X"', say: 'The browser changes both inputs’ DOM value right away.', set: { 'p-dom': 'upd', 'd-dom': 'upd' }, txt: { 'p-dom': 'DOM: Ceramic MugX', 'd-dom': 'DOM: Ceramic MugX' } },
		{ fn: 'React restores value', say: 'For the input with <code>value</code>, React puts its value back: the prop still says <code>"Ceramic Mug"</code> and nothing changed it.', set: { 'p-react': 'cmp', 'p-dom': 'bad' }, txt: { 'p-dom': 'DOM: Ceramic Mug' } },
		{ fn: 'defaultValue', say: 'The <code>defaultValue</code> input only used the prop once, at mount. The user’s typing stays.', set: { 'd-dom': 'ok' } },
		{ fn: 'recorded result', say: 'After typing <code>XYZ</code> and <code> XL</code>: the pinned input still read <code>"Ceramic Mug"</code>, the other <code>"Ceramic Mug XL"</code>. React also warned: “You provided a <code>value</code> prop to a form field without an <code>onChange</code> handler…”.', set: { 'p-react': '', 'p-dom': 'bad', 'd-dom': 'ok' }, txt: { 'd-dom': 'DOM: Ceramic Mug XL' } },
	]
	return anim({
		id: 'fund-controlled-anim',
		caption: '<code>value</code> means “React decides what this shows”; <code>defaultValue</code> means “start here, then it’s the user’s”.',
		scenarios: [{ name: 'Typing into both', intro: 'Two inputs that look identical before anyone types.', scene, steps }],
	})
}

// ─── Error Boundaries ───────────────────────────────────────────────────────

export function boundaryAnim() {
	const t = (withBoundary) =>
		`<div class="t-compact">${tree([
			'main', 'main', { cls: 'host sm' }, [
				['h1', 'h1', { cls: 'host sm' }],
				...(withBoundary
					? [['eb', 'Boundary', { cls: 'comp sm' }, [['bad', 'Details p404', { cls: 'comp sm' }], ['fb', 'Fallback', { cls: 'comp sm', s: 'ghost' }]]], ['ok', 'Details p1', { cls: 'comp sm' }]]
					: [['bad', 'Details p404', { cls: 'comp sm' }]]),
			],
		])}</div>`
	const mk = (withBoundary) => `<div class="a-cols">${panel('component tree', t(withBoundary), 'wide')}${panel('screen', `<div class="a-col">${chip('screen', 'rendering…', 'faint')}</div>`)}</div>`
	const none = [
		{ phase: 'render', fn: 'ProductDetails({ product: p404 })', say: '<code>product.price.cents</code> throws <code>TypeError: Cannot read properties of undefined (reading \'cents\')</code>.', set: { bad: 'bad' } },
		{ phase: 'render', fn: 'retry once', say: 'React renders once more to rule out a one-off glitch: the recording shows <code>ProductDetails renders p404</code> twice. It throws again.', set: { bad: 'bad hl' } },
		{ phase: 'render', fn: 'look for a boundary', say: 'React walks up the tree looking for an error boundary. There is none.', set: { bad: 'bad', main: 'cmp' } },
		{ phase: 'commit', fn: 'unmount the whole root', say: 'With no boundary, React removes <b>everything</b>. Recorded: <code>#root</code> was <code>""</code>, and <code>onUncaughtError</code> fired.', set: { main: 'del', h1: 'del', bad: 'del', screen: 'bad' }, txt: { screen: 'blank page' } },
	]
	const wrapped = [
		{ phase: 'render', fn: 'ProductDetails({ product: p404 })', say: 'The same error is thrown, this time inside an <code>ErrorBoundary</code>.', set: { bad: 'bad' } },
		{ phase: 'render', fn: 'retry once', say: 'React retries once; it throws again.', set: { bad: 'bad hl' } },
		{ phase: 'render', fn: 'nearest boundary', say: 'Walking up, React finds the <b>nearest</b> boundary and renders its fallback instead of its children.', set: { bad: 'del', eb: 'cmp', fb: 'new' } },
		{ phase: 'commit', fn: 'commit', say: 'Only that part of the page changes. Recorded screen: “Store”, “Couldn’t show this product: …”, “Try again”, and the other product, “Ceramic Mug $18.00”, still there.', set: { eb: 'ok', ok: 'ok', h1: 'ok', screen: 'ok' }, txt: { screen: 'Store · fallback · Ceramic Mug $18.00' } },
	]
	return anim({
		id: 'fund-boundary-anim',
		caption: 'An error while rendering travels up to the nearest error boundary, like an exception to the nearest catch.',
		scenarios: [
			{ name: 'No boundary', intro: 'A product with no price, rendered without protection.', scene: mk(false), steps: none },
			{ name: 'With a boundary', intro: 'The same product inside <code>&lt;ErrorBoundary&gt;</code>, next to a healthy one.', scene: mk(true), steps: wrapped },
		],
	})
}

// ─── Rendering Arrays: index keys vs id keys ───────────────────────────────

export function cartKeysAnim() {
	const row = (k, name, note = '') => `<div class="an node sm" data-k="${k}"><span data-k="${k}-label">${name}</span><small data-k="${k}-note">${note ? `note: “${note}”` : 'note: (empty)'}</small></div>`
	const mk = () => `<div class="a-cols">
		${panel('cart rows (DOM, with their inputs)', `<div class="a-col">${row('r0', 'Ceramic Mug', 'Gift wrap, please')}${row('r1', 'Wireless Headphones')}${row('r2', 'Trail Backpack')}</div>`)}
		${panel('React’s matching', `<div class="a-col">${chip('m', 'remove “Ceramic Mug” → new list has 2 items', 'faint')}</div>`)}
	</div>`
	const index = [
		{ phase: 'render', fn: 'keys 0, 1, 2 → 0, 1', say: 'With index keys, the new first item (Headphones) has key <code>0</code>, the same key the Mug row had.', set: { m: 'cmp' }, txt: { m: 'key 0 = Headphones? key 1 = Backpack? key 2 gone' } },
		{ phase: 'commit', fn: 'update row 0 text', say: 'So React <b>keeps</b> row 0’s DOM, input included, and just changes its text to “Wireless Headphones”.', set: { r0: 'upd' }, txt: { 'r0-label': 'Wireless Headphones' } },
		{ phase: 'commit', fn: 'update row 1, delete row 2', say: 'Row 1 becomes Backpack; the last row is deleted.', set: { r1: 'upd', r2: 'del' }, txt: { 'r1-label': 'Trail Backpack' } },
		{ phase: 'commit', fn: 'result', say: 'The Mug’s gift note now sits next to the <b>Headphones</b>. Recorded: <code>{ item: "Wireless Headphones", note: "Gift wrap, please" }</code>. No key gives the same wrong result.', set: { r0: 'bad', m: '' } },
	]
	const id = [
		{ phase: 'render', fn: 'keys p1, p2, p3 → p2, p3', say: 'With id keys, React sees that <code>p1</code> is gone and <code>p2</code>, <code>p3</code> are still there.', set: { m: 'cmp' }, txt: { m: 'p1 gone · p2 kept · p3 kept' } },
		{ phase: 'commit', fn: 'delete p1’s row', say: 'The Mug’s row is removed, with its input and note.', set: { r0: 'del' } },
		{ phase: 'commit', fn: 'keep p2, p3', say: 'The other rows keep their DOM and inputs untouched.', set: { r1: 'keep', r2: 'keep' } },
		{ phase: 'commit', fn: 'result', say: 'Recorded: <code>{ item: "Wireless Headphones", note: "" }</code>: every note stays with its product.', set: { r1: 'ok', r2: 'ok', m: '' } },
	]
	return anim({
		id: 'fund-cart-keys-anim',
		caption: 'Type a gift note on the first cart item, then remove it. The key decides whose note survives.',
		scenarios: [
			{ name: 'key={index}', intro: 'Rows keyed by their position.', scene: mk(), steps: index },
			{ name: 'key={item.id}', intro: 'Rows keyed by the product’s id.', scene: mk(), steps: id },
		],
	})
}
