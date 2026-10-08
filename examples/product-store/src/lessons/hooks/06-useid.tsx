// Hooks 6: a reusable Field, rendered in two review forms on one page.
import { useId, type ComponentProps } from 'react'
import { createRoot } from 'react-dom/client'

// #region hardcoded
function FieldHardcoded({ label, ...props }: { label: string } & ComponentProps<'input'>) {
	return (
		<div>
			<label htmlFor="review-title">{label}</label>
			<input id="review-title" {...props} />
		</div>
	)
}
// #endregion

// #region useId
function Field({ label, ...props }: { label: string } & ComponentProps<'input'>) {
	const generatedId = useId()
	const id = props.id ?? generatedId
	return (
		<div>
			<label htmlFor={id}>{label}</label>
			<input {...props} id={id} />
		</div>
	)
}
// #endregion

function ReviewForm({ product, F }: { product: string; F: typeof Field }) {
	return (
		<form className="review" data-product={product}>
			<h3>Review: {product}</h3>
			<F label="Title" name="title" />
			<F label="Your name" name="author" />
		</form>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	const F = scenario === 'hardcoded' ? FieldHardcoded : Field
	createRoot(root).render(
		<>
			<ReviewForm product="Ceramic Mug" F={F} />
			<ReviewForm product="Desk Lamp" F={F} />
		</>,
	)
}
