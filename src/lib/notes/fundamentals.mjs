// React Fundamentals module. Rewritten for the site in content/fundamentals/
// (the vault's workshop notes stay as they are); examples come from
// examples/product-store/src/lessons/fundamentals.

export const NOTES = [
	{ file: 'Hello World in JS.md', slug: 'hello-world-in-js', level: 'good', illus: 'browser', summary: 'A product card built with the raw DOM API: created in memory, then appended. What React automates, and why textContent is safe.' },
	{ file: 'Raw React APIs.md', slug: 'raw-react-apis', level: 'must', illus: 'fiber', summary: 'createElement returns a plain, frozen object; createRoot().render() turns it into DOM later. React vs ReactDOM, and why key isn’t a prop.' },
	{ file: 'Using JSX.md', slug: 'using-jsx', level: 'must', illus: 'diff', summary: 'JSX is function calls: the real Babel output, curly-brace expressions, spread order, Fragments, and the stray-0 bug.' },
	{ file: 'Custom Components.md', slug: 'custom-components', level: 'must', illus: 'chain', summary: 'A component is a function React calls for you. The recorded call order proves it, and why capital letters and props matter.' },
	{ file: 'TypeScript with React.md', slug: 'typescript-with-react', level: 'good', illus: 'map', summary: 'Typing props like any function: literal unions, deriving types with typeof/keyof, satisfies, and the errors tsc reports.' },
	{ file: 'Styling.md', slug: 'styling', level: 'good', illus: 'eye', summary: 'className vs style objects, a Tag component that wraps a span, and why the order of a spread decides who wins.' },
	{ file: 'Forms.md', slug: 'forms', level: 'must', illus: 'plane', summary: 'One seller form submitted three ways: GET leaks the password into the URL, multipart sends the file, a React action does it all for you.' },
	{ file: 'Inputs.md', slug: 'inputs', level: 'must', illus: 'list', summary: 'value vs defaultValue (controlled vs uncontrolled), and exactly what checkboxes, radios, selects and hidden inputs put in FormData.' },
	{ file: 'Error Boundaries.md', slug: 'error-boundaries', level: 'must', illus: 'bolt', summary: 'Why try/catch can’t catch render errors, how a boundary contains them, what it can’t catch, and how reset works.' },
	{ file: 'Rendering Arrays.md', slug: 'rendering-arrays', level: 'must', illus: 'pipeline', summary: 'Keys give list items an identity. A cart with gift notes shows what goes wrong with index keys, and how a key resets an input.' },
	{ file: 'Fundamentals Quiz.md', slug: 'fundamentals-quiz', level: 'must', illus: 'robot', summary: 'Ten questions, one per note, with quiz mode, plus flashcards for every React API in this module.' },
]
