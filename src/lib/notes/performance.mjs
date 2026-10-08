// React Performance module. Rewritten for the site in content/performance/
// from the vault's "React Performance" notes: one site note per workshop
// exercise, merging its overview, its step notes and its Render Trace.
// Examples from examples/product-store/src/lessons/performance.

export const NOTES = [
	{ file: 'Element Optimization.md', slug: 'element-optimization', aliases: { 'Reusing Elements': '2. Reuse the element', 'Element Props': '3. Pass the element in', 'Memoize Elements': '4. Cache the element with useMemo', 'Memoize Components': '5. memo the component' }, level: 'must', illus: 'diff', summary: 'Hand React the same element, or props that compare equal, and it skips the render: reuse, element props, useMemo and memo.' },
	{ file: 'Optimize Context.md', slug: 'optimize-context', aliases: { 'Memoize Context': '2. Memoize the value', 'Provider Component': '3. A provider component', 'Split Context': '4. Split state from setters' }, level: 'must', illus: 'chain', summary: 'Memoize the value, move state into a provider component, split state from setters: who re-renders after each.' },
	{ file: 'Concurrent Rendering.md', slug: 'concurrent-rendering', aliases: { 'useDeferredValue + memo': '3. useDeferredValue with memo' }, level: 'must', illus: 'loop', summary: 'useDeferredValue + memo keeps typing instant over a slow grid; without memo it does nothing (recorded).' },
	{ file: 'Code Splitting.md', slug: 'code-splitting', aliases: { 'Lazy Loading': '1. lazy + Suspense', 'Eager Loading': '2. Prefetch on hover and focus', 'Code Splitting Transitions': '3. A transition' }, level: 'good', illus: 'plane', summary: 'lazy and Suspense load a feature’s code on demand; prefetch on hover; a transition avoids the fallback.' },
	{ file: 'Expensive Calculations.md', slug: 'expensive-calculations', aliases: { 'useMemo for Calculations': '2. useMemo', 'Web Worker': '3. A Web Worker', 'Async Results': '3. A Web Worker' }, level: 'good', illus: 'robot', summary: 'Measure, cache with useMemo, or move the work to a Web Worker and read the result with use.' },
	{ file: 'Optimize Rendering.md', slug: 'optimize-rendering', aliases: { 'Component Memoization': '2. memo', 'Custom Comparator': '3. A custom comparator', 'Primitive Props': '4. Primitive props' }, level: 'must', illus: 'list', summary: 'memo on 500 list rows, why one changing prop defeats it, and fixing that with a comparator or primitive props.' },
	{ file: 'Windowing.md', slug: 'windowing', aliases: { 'Virtualizer': '2. Virtualized' }, level: 'good', illus: 'map', summary: 'Render only the visible rows of a 10,000-item list with @tanstack/react-virtual.' },
]
