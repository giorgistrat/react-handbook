// React Suspense module. Rewritten for the site in content/suspense/ from the
// vault's "React Suspense" notes: one site note per workshop exercise, merging
// its notes and Render Trace. Examples from examples/product-store/src/lessons/suspense.

export const NOTES = [
	{ file: 'Data Fetching with use.md', slug: 'data-fetching', level: 'must', illus: 'plane', summary: 'Promises, use(promise), Suspense and error boundaries, and what really happens when use “throws”.', aliases: { 'JavaScript Promises': 'Promises in two minutes', 'The use Hook': 'How use works', 'Suspense and ErrorBoundary for Data Fetching': 'The example: a product page' } },
	{ file: 'Promise Caching and Transitions.md', slug: 'promise-caching', level: 'must', illus: 'loop', summary: 'One promise per id, and startTransition to keep the old page instead of a fallback, without a flickering spinner.', aliases: { 'Promise Caching': '1. One promise per product', 'useTransition and Avoiding Loading Flicker': '3. A transition' } },
	{ file: 'Optimistic UI.md', slug: 'optimistic-ui', level: 'must', illus: 'bolt', summary: 'useOptimistic shows a review before the server confirms it; useFormStatus shows the form is busy.', aliases: { 'useOptimistic Hook': '2. useOptimistic', useFormStatus: 'The submit button: useFormStatus' } },
	{ file: 'Suspending on Images.md', slug: 'suspending-on-images', level: 'good', illus: 'eye', summary: 'Keep new details from appearing next to an old picture, and keep a broken picture from breaking the card.', aliases: { 'Resetting Suspense Boundaries with key': '3. A keyed image boundary' } },
	{ file: 'useDeferredValue with Suspense.md', slug: 'deferred-search', level: 'good', illus: 'list', summary: 'A search box that stays responsive while results load; a transition around the input loses keystrokes (recorded).' },
	{ file: 'Waterfalls and Caching.md', slug: 'waterfalls-and-caching', level: 'must', illus: 'pipeline', summary: 'Requests that wait for each other, starting them together, and the HTTP cache that survives a reload.', aliases: { 'Request Waterfalls and Parallel Loading': 'The example: one product page, three requests', 'HTTP Cache-Control Headers': 'The HTTP cache' } },
]
