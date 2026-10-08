// Lesson 8: a product review form. Inputs, defaults, and what FormData contains.
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root)

	if (scenario === 'controlled') {
		// #region controlled
		r.render(
			<>
				<input id="pinned" value="Ceramic Mug" />
				<input id="prefilled" defaultValue="Ceramic Mug" />
			</>,
		)
		// #endregion
		return
	}

	// #region review
	function submitReview(formData: FormData) {
		log('FormData:', Object.fromEntries(formData))
	}

	r.render(
		<form action={submitReview}>
			<input type="hidden" name="productId" value="p1" />

			<label htmlFor="size">Size bought</label>
			<select id="size" name="size">
				<option value="">Please choose</option>
				<option value="small">Small</option>
				<option value="large">Large</option>
			</select>

			<fieldset>
				<legend>Rating</legend>
				<label><input type="radio" name="rating" value="5" /> Great</label>
				<label><input type="radio" name="rating" value="3" /> Okay</label>
			</fieldset>

			<label><input type="checkbox" name="recommend" /> I recommend it</label>

			<label htmlFor="title">Title</label>
			<input id="title" name="title" defaultValue="Love it" />

			<button type="submit">Post review</button>
		</form>,
	)
	// #endregion
}
