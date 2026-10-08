// Lesson 7: a "Become a seller" form, submitted four ways.
import { createRoot } from 'react-dom/client'
import { log } from '../../log'

function Fields() {
	return (
		<>
			{/* #region fields */}
			<label htmlFor="store">Store name</label>
			<input id="store" name="storeName" type="text" />
			<label htmlFor="email">Email</label>
			<input id="email" name="email" type="email" />
			<label htmlFor="password">Password</label>
			<input id="password" name="password" type="password" />
			<label htmlFor="logo">Logo</label>
			<input id="logo" name="logo" type="file" accept="image/*" />
			<button type="submit">Create store</button>
			{/* #endregion */}
		</>
	)
}

export function mount(root: HTMLElement, scenario: string | null) {
	const r = createRoot(root)
	if (scenario === 'get') {
		// #region get
		r.render(
			<form action="/submitted.html">
				<Fields />
			</form>,
		)
		// #endregion
	} else if (scenario === 'post') {
		// #region post
		r.render(
			<form action="/submitted.html" method="POST" encType="multipart/form-data">
				<Fields />
			</form>,
		)
		// #endregion
	} else if (scenario === 'post-plain') {
		r.render(
			<form action="/submitted.html" method="POST">
				<Fields />
			</form>,
		)
	} else {
		// #region action
		function createStore(formData: FormData) {
			const { password, logo, ...rest } = Object.fromEntries(formData)
			log('action received:', { ...rest, password: password ? '(hidden)' : '', logo: (logo as File).name })
		}

		r.render(
			<form action={createStore}>
				<Fields />
			</form>,
		)
		// #endregion
	}
}
