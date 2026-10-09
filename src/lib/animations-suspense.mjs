// Animations for the React Suspense module. Every outcome shown was recorded
// from examples/product-store (src/lessons/suspense, scripts/record.mjs →
// generated/suspense.json). Times are ms since the action, rounded to 50 ms.

import { anim, chip, panel } from './anim.mjs'

const lt = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const logLine = (k, text, s = 'ghost') => `<div class="an" data-k="${k}" data-s="${s}">${lt(text)}</div>`

// A "recorded order" timeline: rows appear one by one, each with a phase and an explanation.
// rows: [[text, phase, say, state?]]
function timeline(name, intro, rows, screen) {
	const scene = `<div class="a-cols">
		${panel('recorded order', `<div class="a-log">${rows.map(([t], i) => logLine(`l${i}`, t)).join('')}</div>`, 'wide')}
		${screen ? panel('the shopper sees', `<div class="a-col">${chip('scr', screen[0], 'faint')}</div>`) : ''}
	</div>`
	const steps = rows.map(([t, phase, say, state = 'new', seen], i) => ({ phase, fn: t, say, set: { [`l${i}`]: state, ...(seen ? { scr: seen[1] } : {}) }, ...(seen ? { txt: { scr: seen[0] } } : {}) }))
	return { name, intro, scene, steps }
}

// ─── use(promise): pending, fulfilled, rejected ────────────────────────────

export function useAnim() {
	return anim({
		id: 'suspense-use-anim',
		caption: 'Opening a product page whose data takes 300 ms (both recorded).',
		scenarios: [
			timeline('Fulfilled', '<code>fetchProduct(\'p4\')</code> started before rendering.', [
				['0 ms  → GET /products/p4', 'trigger', 'The request starts <b>before</b> React renders, and its promise is passed down as a prop.'],
				['ProductDetails render started', 'render', '<code>use(productPromise)</code>: the promise is pending, so <code>use</code> throws a special exception and the render stops here.', 'upd', ['rendering…', 'run']],
				['screen: fallback “Loading product…”', 'commit', 'React catches it, finds the nearest <code>&lt;Suspense&gt;</code> and commits its fallback.', 'new', ['Loading product…', 'upd']],
				['300 ms  ← GET /products/p4', 'trigger', 'The promise fulfills. React was listening (<code>.then</code>) and schedules a retry.'],
				['ProductDetails render finished', 'render', 'This time <code>use</code> returns the product <b>synchronously</b>, and the component runs to the end.', 'ok'],
				['screen: details: Desk Lamp', 'commit', 'The fallback is replaced by the content.', 'ok', ['Desk Lamp · $39.00', 'ok']],
			], ['(blank)']),
			timeline('Rejected', 'The same page for a product that doesn’t exist.', [
				['0 ms  → GET /products/p999', 'trigger', 'Same start.'],
				['screen: fallback “Loading product…”', 'commit', 'Pending, so the fallback shows.', 'new', ['Loading product…', 'upd']],
				['300 ms  ✗ No product with id "p999"', 'trigger', 'The promise rejects.', 'bad'],
				['ProductDetails render started (×2)', 'render', 'On the retry, <code>use</code> throws the rejection <b>reason</b>, a real error. React renders once more to be sure, then gives up.', 'bad'],
				['screen: error “Couldn’t load this product.”', 'commit', 'The nearest <b>error boundary</b> (outside the <code>Suspense</code>) shows its fallback.', 'bad', ['Couldn’t load this product.', 'bad']],
			], ['(blank)']),
		],
	})
}

// ─── Switching products: urgent vs transition ──────────────────────────────

export function transitionAnim() {
	return anim({
		id: 'suspense-transition-anim',
		caption: 'Switching from the Ceramic Mug to the Desk Lamp (500 ms request), recorded both ways.',
		scenarios: [
			timeline('setId (urgent)', 'A plain state update.', [
				['→ GET /products/p4', 'trigger', 'The new id renders <code>ProductDetails</code>, which asks the cache for p4: a new request.'],
				['screen: fallback “Loading product…”', 'commit', 'An urgent update that suspends <b>replaces</b> the content with the fallback: the mug disappears.', 'bad', ['Loading product…', 'bad']],
				['+500 ms  ← GET /products/p4', 'trigger', 'The data arrives.'],
				['screen: details: Desk Lamp', 'commit', 'The lamp appears.', 'ok', ['Desk Lamp', 'ok']],
			], ['Ceramic Mug']),
			timeline('startTransition', 'The update wrapped in <code>startTransition</code>.', [
				['screen: pending ⏳ · Ceramic Mug (dimmed)', 'commit', '<code>isPending</code> becomes true in an urgent render, so the page can show it.', 'upd', ['Ceramic Mug (dimmed) ⏳', 'upd']],
				['→ GET /products/p4', 'render', 'The transition render suspends on the new product…'],
				['+500 ms  ← GET /products/p4', 'trigger', '…and React <b>keeps the current content</b> instead of showing the fallback: content that’s already revealed isn’t hidden by a transition.'],
				['screen: details: Desk Lamp', 'commit', 'The new content replaces the old in one step.', 'ok', ['Desk Lamp', 'ok']],
			], ['Ceramic Mug']),
		],
	})
}

// ─── Optimistic UI ─────────────────────────────────────────────────────────

export function optimisticAnim() {
	return anim({
		id: 'suspense-optimistic-anim',
		caption: 'Posting a review; the server takes 800 ms (all three recorded).',
		scenarios: [
			timeline('useState', '<code>setReviews</code> before the <code>await</code>.', [
				['→ POST /products/p1/reviews', 'event', 'The form action runs inside a transition. The <code>setReviews</code> before the request is part of it…'],
				['screen: Posting… (no new review)', 'commit', '…so React holds it back until the whole action ends. Only the button (via <code>useFormStatus</code>) shows progress.', 'bad', ['Ana’s review · [Posting…]', 'bad']],
				['+800 ms  ← POST', 'trigger', 'The server answers.'],
				['screen: You: Great lamp!', 'commit', 'The review appears only now: 800 ms after clicking.', 'upd', ['Ana · You: Great lamp!', 'upd']],
			], ['Ana’s review']),
			timeline('useOptimistic', 'An optimistic list shown during the action.', [
				['screen: You: Great lamp! (sending…)', 'commit', '<code>addOptimistic(text)</code> is allowed to render <b>during</b> the transition: the review shows immediately, marked as sending.', 'ok', ['Ana · You: Great lamp! (sending…)', 'ok']],
				['+800 ms  ← POST', 'trigger', 'The server answers.'],
				['screen: both copies for a moment', 'commit', 'A <code>setReviews</code> after an <code>await</code> isn’t part of the action any more: it renders on its own while the optimistic copy still exists. Recorded: the review appeared twice.', 'bad', ['You: Great lamp! ×2', 'bad']],
				['screen: You: Great lamp!', 'commit', 'When the action ends, the optimistic value falls back to the real list.', 'ok', ['Ana · You: Great lamp!', 'ok']],
			], ['Ana’s review']),
			timeline('+ startTransition', 'The update after the <code>await</code> wrapped in <code>startTransition</code>.', [
				['screen: You: Great lamp! (sending…)', 'commit', 'Shown immediately, as before.', 'ok', ['Ana · You: Great lamp! (sending…)', 'ok']],
				['+800 ms  ← POST', 'trigger', '<code>startTransition(() =&gt; setReviews(…))</code> puts the update back into the action.'],
				['screen: You: Great lamp!', 'commit', 'Recorded: the real review replaced the optimistic one in a single step, no duplicate.', 'ok', ['Ana · You: Great lamp!', 'ok']],
			], ['Ana’s review']),
		],
	})
}

// ─── Images ────────────────────────────────────────────────────────────────

export function imagesAnim() {
	return anim({
		id: 'suspense-images-anim',
		caption: 'Switching to the Desk Lamp in a transition: data 200 ms, picture 600 ms (all three recorded).',
		scenarios: [
			timeline('Plain <img>', 'The new <code>src</code> is just rendered.', [
				['→ GET /products/p4', 'trigger', 'The transition waits for the product data only.'],
				['+200 ms  details: Desk Lamp', 'commit', 'The new name and price commit, with <code>src</code> pointing at the new picture…', 'bad', ['Desk Lamp text · Mug picture', 'bad']],
				['≈ +800 ms  <img> finished loading p4', 'paint', '…but the browser keeps showing the <b>old</b> picture until the new one has loaded: about 600 ms of the lamp’s details next to the mug.', 'upd', ['Desk Lamp · lamp picture', 'ok']],
			], ['Ceramic Mug']),
			timeline('Suspend on the image', '<code>use(preloadImage(src))</code> in the image component.', [
				['→ GET /products/p4', 'trigger', 'Same start.'],
				['+200 ms  → GET /img/p4.svg', 'render', 'The image component now suspends on a promise that resolves when the picture has loaded.'],
				['+800 ms  ← GET /img/p4.svg', 'trigger', 'The transition waits for both.'],
				['+800 ms  image: p4 · details: Desk Lamp', 'commit', 'Data and picture switch together. But the details waited 600 ms for the picture, and a broken picture now breaks the whole card.', 'upd', ['Desk Lamp · lamp picture', 'ok']],
			], ['Ceramic Mug']),
			timeline('Keyed boundary', 'The image gets its own <code>ErrorBoundary</code> + <code>Suspense</code>, keyed by <code>src</code>.', [
				['+200 ms  → GET /img/p4.svg', 'render', 'With <code>key={src}</code> the image boundary is <b>new</b> in this render, so the transition may show its fallback (it only protects content that’s already revealed).'],
				['+200 ms  placeholder · details: Desk Lamp', 'commit', 'The details commit right away, with a placeholder where the picture goes.', 'ok', ['Desk Lamp · 🖼️ placeholder', 'upd']],
				['+800 ms  image: p4', 'commit', 'The picture replaces the placeholder. For a broken picture, the narrow error boundary shows “Image unavailable” and the details stay.', 'ok', ['Desk Lamp · lamp picture', 'ok']],
			], ['Ceramic Mug']),
		],
	})
}

// ─── Search: transition vs deferred value ──────────────────────────────────

export function deferredSearchAnim() {
	return anim({
		id: 'suspense-search-anim',
		caption: 'Typing “la” quickly; each search takes 400 ms (both recorded).',
		scenarios: [
			timeline('startTransition', '<code>startTransition(() =&gt; setQuery(value))</code>.', [
				['after "l" the input shows ""', 'event', 'The input’s own value is in transition state, which waits for the results. React puts the old value back in the box.', 'bad', ['input: ""', 'bad']],
				['after "a" the input shows ""', 'event', 'The second key lands in an empty box, so the query becomes “a”, not “la”.', 'bad', ['input: ""', 'bad']],
				['→ GET /search?q=a', 'trigger', 'Recorded: the box ended up containing “a”. The typed “l” was lost.', 'bad', ['input: "a"', 'bad']],
			], ['input: ""']),
			timeline('useDeferredValue', '<code>query</code> stays urgent; the results use <code>useDeferredValue(query)</code>.', [
				['after "l" the input shows "l"', 'event', 'The urgent render updates the input right away; the results get the old deferred value, so nothing suspends.', 'ok', ['input: "l"', 'ok']],
				['6 results for "" (dimmed)', 'render', 'The background render with the new value suspends; React keeps the old results, which you can dim with <code>query !== deferredQuery</code>.', 'upd'],
				['after "a" the input shows "la"', 'event', 'Typing continues normally.', 'ok', ['input: "la"', 'ok']],
				['+400 ms  1 result for "la"', 'commit', 'The latest results replace the stale ones; the in-between query “l” was never shown.', 'ok'],
			], ['input: ""']),
		],
	})
}

// ─── Waterfalls ────────────────────────────────────────────────────────────

export function waterfallAnim() {
	return anim({
		id: 'suspense-waterfall-anim',
		caption: 'A product page that needs the product (300 ms), its picture (600 ms) and its reviews (300 ms), recorded.',
		scenarios: [
			timeline('Fetch on render', 'Each component starts its own request when it renders.', [
				['0 ms  → GET /products/p4', 'trigger', '<code>ProductPage</code> renders and suspends on the product.'],
				['300 ms  → GET /img/p4.svg', 'render', 'Only once the product is known do its children render and ask for the picture…', 'bad'],
				['900 ms  → GET /products/p4/reviews', 'render', '…and here even the reviews waited for the picture: the second request’s component didn’t render until the first was done.', 'bad'],
				['1200 ms  page complete', 'commit', 'Three steps, one after another: 1,200 ms.', 'bad'],
			]),
			timeline('Start everything first', '<code>startLoading(id)</code> before rendering.', [
				['0 ms  → product, reviews and picture', 'trigger', 'All three requests start together, from code that runs before React renders (a route loader, a click handler).', 'ok'],
				['300 ms  ← product, reviews', 'commit', 'The page renders as soon as the data is there.'],
				['600 ms  page complete', 'commit', 'Total time = the slowest request: 600 ms, half of the waterfall.', 'ok'],
			]),
		],
	})
}
