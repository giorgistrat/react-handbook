---
title: "Optimistic UI"
slug: "optimistic-ui"
module: "suspense"
order: 2
level: "must"
illus: "bolt"
summary: "useOptimistic shows a review before the server confirms it; useFormStatus shows the form is busy."
source: "https://react.dev/reference/react/useOptimistic"
---


## In one minute

**Optimistic UI** shows the result of an action before the server confirms it: the review appears in the list the moment you post it, marked "sending…". A `<form action={fn}>` runs `fn` inside a **transition**, and React holds back ordinary state updates made during a transition until it ends, so `useState` can't do this. `useOptimistic` can: its value may change *during* the action, and when the action ends it falls back to the real state, which also gives you **rollback** for free if the request failed. `useFormStatus` lets a button inside the form know the form is submitting. One React 19 catch: a state update after an `await` isn't part of the action any more; wrap it in `startTransition`.

**You'll be able to:** post a form with an optimistic result, show its pending state, roll back on failure, and avoid the after-`await` duplicate.

<figure class="fig anim fig-suspense-optimistic-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">useState</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">useOptimistic</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">+ startTransition</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;→ POST /products/p1/reviews&quot;,&quot;say&quot;:&quot;The form action runs inside a transition. The &lt;code&gt;setReviews&lt;/code&gt; before the request is part of it…&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: Posting… (no new review)&quot;,&quot;say&quot;:&quot;…so React holds it back until the whole action ends. Only the button (via &lt;code&gt;useFormStatus&lt;/code&gt;) shows progress.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;bad&quot;,&quot;scr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Ana’s review · [Posting…]&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;+800 ms  ← POST&quot;,&quot;say&quot;:&quot;The server answers.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: You: Great lamp!&quot;,&quot;say&quot;:&quot;The review appears only now: 800 ms after clicking.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;upd&quot;,&quot;scr&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Ana · You: Great lamp!&quot;}}]" data-intro="&lt;code&gt;setReviews&lt;/code&gt; before the &lt;code&gt;await&lt;/code&gt;."><div class="anim-scn-title">useState</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">→ POST /products/p1/reviews</div><div class="an" data-k="l1" data-s="ghost">screen: Posting… (no new review)</div><div class="an" data-k="l2" data-s="ghost">+800 ms  ← POST</div><div class="an" data-k="l3" data-s="ghost">screen: You: Great lamp!</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">Ana’s review</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>→ POST /products/p1/reviews</code><span>The form action runs inside a transition. The <code>setReviews</code> before the request is part of it…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: Posting… (no new review)</code><span>…so React holds it back until the whole action ends. Only the button (via <code>useFormStatus</code>) shows progress.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>+800 ms  ← POST</code><span>The server answers.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: You: Great lamp!</code><span>The review appears only now: 800 ms after clicking.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: You: Great lamp! (sending…)&quot;,&quot;say&quot;:&quot;&lt;code&gt;addOptimistic(text)&lt;/code&gt; is allowed to render &lt;b&gt;during&lt;/b&gt; the transition: the review shows immediately, marked as sending.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Ana · You: Great lamp! (sending…)&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;+800 ms  ← POST&quot;,&quot;say&quot;:&quot;The server answers.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: both copies for a moment&quot;,&quot;say&quot;:&quot;A &lt;code&gt;setReviews&lt;/code&gt; after an &lt;code&gt;await&lt;/code&gt; isn’t part of the action any more: it renders on its own while the optimistic copy still exists. Recorded: the review appeared twice.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;bad&quot;,&quot;scr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;You: Great lamp! ×2&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: You: Great lamp!&quot;,&quot;say&quot;:&quot;When the action ends, the optimistic value falls back to the real list.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Ana · You: Great lamp!&quot;}}]" data-intro="An optimistic list shown during the action."><div class="anim-scn-title">useOptimistic</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">screen: You: Great lamp! (sending…)</div><div class="an" data-k="l1" data-s="ghost">+800 ms  ← POST</div><div class="an" data-k="l2" data-s="ghost">screen: both copies for a moment</div><div class="an" data-k="l3" data-s="ghost">screen: You: Great lamp!</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">Ana’s review</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>screen: You: Great lamp! (sending…)</code><span><code>addOptimistic(text)</code> is allowed to render <b>during</b> the transition: the review shows immediately, marked as sending.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>+800 ms  ← POST</code><span>The server answers.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: both copies for a moment</code><span>A <code>setReviews</code> after an <code>await</code> isn’t part of the action any more: it renders on its own while the optimistic copy still exists. Recorded: the review appeared twice.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: You: Great lamp!</code><span>When the action ends, the optimistic value falls back to the real list.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: You: Great lamp! (sending…)&quot;,&quot;say&quot;:&quot;Shown immediately, as before.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Ana · You: Great lamp! (sending…)&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;+800 ms  ← POST&quot;,&quot;say&quot;:&quot;&lt;code&gt;startTransition(() =&amp;gt; setReviews(…))&lt;/code&gt; puts the update back into the action.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;screen: You: Great lamp!&quot;,&quot;say&quot;:&quot;Recorded: the real review replaced the optimistic one in a single step, no duplicate.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Ana · You: Great lamp!&quot;}}]" data-intro="The update after the &lt;code&gt;await&lt;/code&gt; wrapped in &lt;code&gt;startTransition&lt;/code&gt;."><div class="anim-scn-title">+ startTransition</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">screen: You: Great lamp! (sending…)</div><div class="an" data-k="l1" data-s="ghost">+800 ms  ← POST</div><div class="an" data-k="l2" data-s="ghost">screen: You: Great lamp!</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">Ana’s review</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-commit">commit phase</span><code>screen: You: Great lamp! (sending…)</code><span>Shown immediately, as before.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>+800 ms  ← POST</code><span><code>startTransition(() =&gt; setReviews(…))</code> puts the update back into the action.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>screen: You: Great lamp!</code><span>Recorded: the real review replaced the optimistic one in a single step, no duplicate.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Posting a review; the server takes 800 ms (all three recorded).</figcaption></figure>

## The example: posting a review

Posting a review takes the server 800 ms. Each recording types "Great lamp!" and clicks "Post review".

### The submit button: useFormStatus

```tsx
function SubmitButton() {
	const { pending } = useFormStatus() // the status of the <form> around this button
	return (
		<button type="submit" disabled={pending} data-note>
			{pending ? 'Posting…' : 'Post review'}
		</button>
	)
}
```

`useFormStatus` reads the status of the `<form>` the component is rendered **inside** (it must be a child of the form, so the button is its own component). It also gives you the submitted `data`, `method` and `action`.

### 1. Plain state

```tsx
function ReviewsWithState() {
	const [reviews, setReviews] = useState(initial)
	async function addReview(formData: FormData) {
		const text = String(formData.get('text'))
		setReviews((r) => [...r, { id: 'temp', author: 'You', text }]) // try to show it right away
		const saved = await postReview('p1', { author: 'You', text })
		setReviews((r) => [...r.filter((x) => x.id !== 'temp'), saved])
	}
	return (
		<>
			<ReviewList reviews={reviews} />
			<form action={addReview}>
				<input name="text" id="text" />
				<SubmitButton />
			</form>
		</>
	)
}
```

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · Posting…
2050 ms  ← POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! · Posting…
screen: Ana: Keeps my tea hot. · You: Great lamp! · Post review
```

The button said "Posting…" right away, but the review only appeared when the server answered, 800 ms later. The `setReviews` before the `await` was part of the action's transition, so React held it back.

### 2. useOptimistic

```tsx
function Reviews({ fail = false, fixed = false }) {
	const [reviews, setReviews] = useState(initial)
	const [optimisticReviews, addOptimistic] = useOptimistic(reviews, (current, text: string) => [
		...current,
		{ id: 'temp', author: 'You', text, sending: true },
	])

	async function addReview(formData: FormData) {
		const text = String(formData.get('text'))
		addOptimistic(text) // shown immediately, during the action
		try {
			const saved = await postReview('p1', { author: 'You', text }, 800, fail)
			if (fixed) {
				startTransition(() => setReviews((r) => [...r, saved])) // part of the action again
			} else {
				setReviews((r) => [...r, saved]) // after an await: no longer part of the action
			}
		} catch {
			log('action: the server rejected the review')
		}
	}

	return (
		<>
			<ReviewList reviews={optimisticReviews} />
			<form action={addReview}>
				<input name="text" id="text" />
				<SubmitButton />
			</form>
		</>
	)
}
```

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! (sending…) · Posting…
2050 ms  ← POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! · You: Great lamp! (sending…) · Posting…
screen: Ana: Keeps my tea hot. · You: Great lamp! · Post review
```

The review appeared immediately, marked "(sending…)". But when the server answered, the list briefly showed it **twice**: the saved review and the optimistic one. The `setReviews` after the `await` ran as a separate update while the action's optimistic state was still alive. Wrapping it in `startTransition` makes it part of the action again:

```tsx
startTransition(() => setReviews((r) => [...r, saved])) // part of the action again
```

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! (sending…) · Posting…
2050 ms  ← POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! · Post review
```

One step from "sending…" to saved.

### 3. When the server fails

```text
1250 ms  → POST /products/p1/reviews
screen: Ana: Keeps my tea hot. · You: Great lamp! (sending…) · Posting…
2100 ms  ✗ POST /products/p1/reviews: Server error, review not saved
action: the server rejected the review
screen: Ana: Keeps my tea hot. · Post review
```

The optimistic review disappeared on its own when the action ended: the optimistic value fell back to the real list, which never got the review. Show an error message too, so the shopper knows why.

### 4. Several steps in one action

```tsx
function Checkout() {
	const [message, setMessage] = useOptimistic('Place order')
	async function placeOrder() {
		setMessage('Reserving stock…')
		await callApi('POST /orders', 400)
		setMessage('Charging card…')
		await callApi('POST /payments', 400)
	}
	return (
		<form action={placeOrder}>
			<button type="submit" data-note>{message}</button>
		</form>
	)
}
```

```text
1200 ms  → POST /orders
screen: Reserving stock…
1600 ms  ← POST /orders
1600 ms  → POST /payments
screen: Charging card…
2000 ms  ← POST /payments
screen: Place order
```

An optimistic value can change as often as you like during the action, then falls back to "Place order" when it ends.

## How it works

- **Actions are transitions.** A function passed to `<form action>` (or called inside `startTransition`) runs as a transition: its state updates render together when it completes.
- **`useOptimistic(value, reducer?)`** returns `[optimisticValue, setOptimistic]`. Outside an action, `optimisticValue` is just `value`. During one, `setOptimistic` overrides it; when the action ends, it's `value` again, whatever happened.
- **After an `await`, React 19 loses track** of which action an update belongs to (async context isn't preserved yet), so updates after the `await` need their own `startTransition`. React's docs note this limitation.

## Common mistakes

- **`useState` for optimistic results** inside an action (recorded: nothing until the server answered).
- **Updating real state after `await` without `startTransition`** (recorded: a duplicate review).
- **`useFormStatus` in the component that renders the `<form>`.** It only sees forms *above* it.
- **No error message on failure.** The rollback is silent.

## Interview Q&A

<details class="qa"><summary>What is optimistic UI?</summary>

Showing the expected result of an action immediately, before the server confirms it, and correcting it if the server disagrees.

</details>

<details class="qa"><summary>Why doesn't <code>useState</code> work for it inside a form action?</summary>

Form actions run in a transition, and React holds state updates in a transition until it finishes. Recorded: the review appeared only after the 800 ms request.

</details>

<details class="qa"><summary>How does <code>useOptimistic</code> work?</summary>

It returns a value that can be updated during an action and falls back to the real state when the action ends. Recorded: the review showed "(sending…)" immediately.

</details>

<details class="qa"><summary>How do you get rollback on failure?</summary>

Do nothing special: when the action ends, the optimistic value reverts to the real state, which didn't change. Recorded: after a server error the optimistic review disappeared.

</details>

<details class="qa"><summary>Why did the review appear twice for a moment?</summary>

The `setReviews` after `await` wasn't part of the action's transition in React 19, so it rendered while the optimistic copy still existed. Wrapping it in `startTransition` fixed it (recorded).

</details>

<details class="qa"><summary>What does <code>useFormStatus</code> give you?</summary>

`{ pending, data, method, action }` for the form the component is inside, without passing props. It must be called from a child of the `<form>`.

</details>

## Related

- [Forms](../../fundamentals/forms/): form actions and `FormData`.
- [Promise Caching and Transitions](../../suspense/promise-caching/): transitions and `isPending`.

## Sources

- react.dev: [`useOptimistic`](https://react.dev/reference/react/useOptimistic), [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus), [`useTransition` (state updates after `await`)](https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
