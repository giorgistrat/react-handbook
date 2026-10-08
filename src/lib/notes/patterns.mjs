// Advanced React Patterns module. Rewritten for the site in content/patterns/
// from the vault's "Advanced React Patterns" notes and their Render Trace
// companions; examples from examples/product-store/src/lessons/patterns.

export const NOTES = [
	{ file: 'Composition and Layout Components.md', slug: 'composition', level: 'must', illus: 'list', summary: 'Pass finished elements, not data, through components that only lay things out.' },
	{ file: 'The Latest Ref Pattern.md', slug: 'latest-ref', level: 'good', illus: 'loop', summary: 'A function built once that still calls the newest callback: debounce done right, and useEffectEvent.' },
	{ file: 'Compound Components.md', slug: 'compound-components', level: 'must', illus: 'chain', summary: 'Toggle, ToggleButton, ToggleOn and ToggleOff sharing state through context, like select and option.' },
	{ file: 'The Slots Pattern.md', slug: 'slots', level: 'good', illus: 'map', summary: 'A root component publishes props per slot name; generic Label, Input and Text pieces pick theirs up.' },
	{ file: 'Prop Collections and Getters.md', slug: 'prop-getters', level: 'must', illus: 'bolt', summary: 'Hand out the props an element needs, and merge the consumer’s own handlers instead of overwriting them.' },
	{ file: 'State Initializers.md', slug: 'state-initializers', level: 'good', illus: 'robot', summary: 'Let the consumer choose the starting state, and make reset go back to it, even if the prop changes later.' },
	{ file: 'The State Reducer Pattern.md', slug: 'state-reducer', level: 'must', illus: 'diff', summary: 'Let the consumer decide what each action does, by passing their own reducer that can veto or delegate.' },
	{ file: 'Control Props.md', slug: 'control-props', level: 'must', illus: 'pipeline', summary: 'A hook that works on its own, or lets the parent own the value: suggestions through onChange, like input value.' },
]
