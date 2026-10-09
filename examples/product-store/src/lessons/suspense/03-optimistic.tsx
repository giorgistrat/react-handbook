// Suspense 3: posting a review. The server takes 800 ms; can the review show
// up right away?
import { startTransition, useOptimistic, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { callApi, postReview, startClock, type Review } from '../../data/api'
import { log } from '../../log'
import { watchScreen } from './watch'

const initial: Review[] = [{ id: 'r1', author: 'Ana', text: 'Keeps my tea hot.' }]

function ReviewList({ reviews }: { reviews: (Review & { sending?: boolean })[] }) {
	return (
		<ul>
			{reviews.map((r) => (
				<li key={r.id} data-note>
					{r.author}: {r.text}
					{r.sending ? ' (sending…)' : ''}
				</li>
			))}
		</ul>
	)
}

// #region submit
function SubmitButton() {
	const { pending } = useFormStatus() // the status of the <form> around this button
	return (
		<button type="submit" disabled={pending} data-note>
			{pending ? 'Posting…' : 'Post review'}
		</button>
	)
}
// #endregion

// #region state
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
// #endregion

// #region optimistic
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
				// #region fixed
				startTransition(() => setReviews((r) => [...r, saved])) // part of the action again
				// #endregion
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
// #endregion

// #region steps
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
// #endregion

export function mount(root: HTMLElement, scenario: string | null) {
	watchScreen(root)
	startClock()
	const app = { state: <ReviewsWithState />, fail: <Reviews fail />, fixed: <Reviews fixed />, steps: <Checkout /> }[scenario ?? ''] ?? <Reviews />
	createRoot(root).render(app)
}
