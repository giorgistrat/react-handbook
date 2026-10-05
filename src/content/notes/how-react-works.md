---
title: "How React Works, Start to Finish"
slug: "how-react-works"
order: 10
level: "must"
illus: "browser"
summary: "A real 2-page app followed from JSX to pixels: Babel output, element objects, every component call, commit, clicks, lists and a page switch."
source: "https://github.com/facebook/react/tree/v19.2.5/packages"
---


> One small, real app followed from the code you write to the pixels on
> screen: what Babel turns your JSX into, when the element objects `{}` are
> created, what runs first when the page opens, how React decides which
> component to call, and what happens on a click, a context change, a list
> edit and a page switch. Each step has a plain-English story and an
> **Under the hood** block with the real React 19.2.5 functions and objects.
> Nothing here is hand-written guesswork: the compiled code, the element
> objects, the fiber trees and every call order were recorded by running the
> demo app (see "How this was recorded" at the end).

## The whole journey in one picture

1. **Compile time.** Babel (or Vite's Oxc) rewrites every `<Tag />` into a
   function call: `jsx(Tag, props)`. Your source no longer contains JSX.
2. **Page load.** The browser runs `main.jsx`. `createRoot` sets React up,
   `<App />` becomes an object, and `root.render()` **schedules** a render.
   No component has run yet.
3. **Render phase.** React walks a tree of *fibers*. When it reaches a
   component fiber it **calls your function**, which runs its `jsx()` calls
   and returns new element objects. React compares them with what was there
   before and records what must change.
4. **Commit phase.** React applies the recorded changes to the DOM in one
   synchronous pass, runs layout effects, and lets the browser paint.
   `useEffect` runs after.
5. **Updates.** `setState` queues an update and schedules another render
   that starts from the root but only *calls* the components that need it.

The rest of this note is each of those steps, in order, on a real app.

## 0. The app

Two pages switched with state (no router), a context, a component that
receives `children`, effects with cleanups, and a keyed list. React and
ReactDOM are pinned to **19.2.5**. There is no `<StrictMode>`, so every
component runs once per render and the traces stay readable.

`main.jsx`, the entry point:

```jsx
import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'
import './styles.css'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
```

`App.jsx` owns the two pieces of top-level state: which page is shown, and
the theme.

```jsx
import { useState } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { Layout } from './Layout.jsx'
import { Nav } from './Nav.jsx'
import { CounterPage } from './CounterPage.jsx'
import { TodosPage } from './TodosPage.jsx'
import { log } from './trace.js'

export function App() {
	log('render App')
	const [page, setPage] = useState('counter')
	const [theme, setTheme] = useState('light')

	return (
		<ThemeContext value={theme}>
			<Layout>
				<Nav page={page} onNavigate={setPage} />
				<button className="theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
					Theme: {theme}
				</button>
				{page === 'counter' ? <CounterPage /> : <TodosPage />}
			</Layout>
		</ThemeContext>
	)
}
```

`Layout.jsx` reads the theme from context and renders whatever it gets as
`children`:

```jsx
import { useContext } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { log } from './trace.js'

export function Layout({ children }) {
	log('render Layout')
	const theme = useContext(ThemeContext)
	return (
		<div className={`layout ${theme}`}>
			<h1>How React Works</h1>
			<main>{children}</main>
		</div>
	)
}
```

`Nav.jsx` gets the current page and a callback through props:

```jsx
import { log } from './trace.js'

export function Nav({ page, onNavigate }) {
	log('render Nav', page)
	return (
		<nav>
			<button aria-current={page === 'counter'} onClick={() => onNavigate('counter')}>
				Counter
			</button>
			<button aria-current={page === 'todos'} onClick={() => onNavigate('todos')}>
				Todos
			</button>
		</nav>
	)
}
```

`CounterPage.jsx` has state, a ref, a layout effect, an effect with a
cleanup, and a child component:

```jsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { log } from './trace.js'

export function CounterPage() {
	log('render CounterPage')
	const [count, setCount] = useState(0)
	const buttonRef = useRef(null)

	useLayoutEffect(() => {
		log('layout effect: button is', buttonRef.current.offsetWidth, 'px wide')
	}, [count])

	useEffect(() => {
		log('effect: set title', count)
		document.title = `Clicked ${count} times`
		return () => log('cleanup: title effect', count)
	}, [count])

	return (
		<section>
			<h2>Counter</h2>
			<Display value={count} />
			<button ref={buttonRef} onClick={() => setCount(count + 1)}>
				Add one
			</button>
		</section>
	)
}

function Display({ value }) {
	log('render Display', value)
	return <p className="display">Count: {value}</p>
}
```

`TodosPage.jsx` has a controlled input and a keyed list, and subscribes to
`resize` in an effect:

```jsx
import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { log } from './trace.js'

let nextId = 3

export function TodosPage() {
	log('render TodosPage')
	const [todos, setTodos] = useState([
		{ id: 1, text: 'Learn JSX' },
		{ id: 2, text: 'Read about fibers' },
	])
	const [text, setText] = useState('')

	useEffect(() => {
		log('effect: subscribe to resize')
		const onResize = () => log('window resized')
		window.addEventListener('resize', onResize)
		return () => {
			log('cleanup: unsubscribe from resize')
			window.removeEventListener('resize', onResize)
		}
	}, [])

	function addTodo(event) {
		event.preventDefault()
		if (!text.trim()) return
		setTodos([...todos, { id: nextId++, text }])
		setText('')
	}

	return (
		<section>
			<h2>Todos</h2>
			<form onSubmit={addTodo}>
				<input value={text} onChange={(e) => setText(e.target.value)} placeholder="New todo" />
				<button>Add</button>
			</form>
			<ul>
				{todos.map((todo) => (
					<TodoItem
						key={todo.id}
						todo={todo}
						onRemove={() => setTodos(todos.filter((t) => t.id !== todo.id))}
					/>
				))}
			</ul>
		</section>
	)
}

function TodoItem({ todo, onRemove }) {
	log('render TodoItem', todo.id)
	const theme = useContext(ThemeContext)
	return (
		<li className={theme}>
			{todo.text} <button onClick={onRemove}>×</button>
		</li>
	)
}
```

`ThemeContext.js` and the `log` helper:

```js
import { createContext } from 'react'

export const ThemeContext = createContext('light')
ThemeContext.displayName = 'ThemeContext'
```

```js
// Open the app with ?trace to log every component call, effect and cleanup
// in the browser console, in the order React runs them.
const enabled = new URLSearchParams(location.search).has('trace')

export function log(...args) {
	if (!enabled) return
	console.log('%c[app]', 'color:#d9539f;font-weight:bold', ...args)
	// scripts/trace.mjs collects these alongside React's own calls
	globalThis.__TRACE__?.push(['app', args.join(' ')])
}
```

> To follow along, run the demo (`examples/how-react-works` in the site's
> repository: `npm install && npm run dev`) and open
> `http://localhost:5199/?trace`. Every component call, effect and cleanup is
> logged to the console in the order React runs them.

## 1. Compile time: JSX becomes function calls

Browsers don't understand JSX. Before your code ever reaches the browser, a
compiler rewrites each JSX tag into a **function call** that returns a plain
object. This happens once, at build time. At run time there is no JSX left.

This is `App` after Babel's React preset with the **automatic runtime**
(`@babel/preset-react` with `runtime: 'automatic'`, the default since React 17):

```js
export function App() {
  log('render App');
  const [page, setPage] = useState('counter');
  const [theme, setTheme] = useState('light');
  return /*#__PURE__*/_jsx(ThemeContext, {
    value: theme,
    children: /*#__PURE__*/_jsxs(Layout, {
      children: [/*#__PURE__*/_jsx(Nav, {
        page: page,
        onNavigate: setPage
      }), /*#__PURE__*/_jsxs("button", {
        className: "theme",
        onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'),
        children: ["Theme: ", theme]
      }), page === 'counter' ? /*#__PURE__*/_jsx(CounterPage, {}) : /*#__PURE__*/_jsx(TodosPage, {})]
    })
  });
}
```

And the import Babel added at the top of the file, which you never wrote:

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
```

What changed, tag by tag:

- `<Nav page={page} onNavigate={setPage} />` → `_jsx(Nav, { page, onNavigate })`.
  The **first argument is the type**: the `Nav` function itself, not a
  string and not a call.
- `<button className="theme" …>Theme: {theme}</button>` →
  `_jsxs("button", { …, children: ["Theme: ", theme] })`. A lowercase tag
  becomes a **string** type. Children are no longer separate arguments: they
  move into **`props.children`**.
- `jsx` vs `jsxs`: `jsxs` is used when the children are a **static array**
  written in the JSX (several children side by side). One child, or none →
  `jsx`.
- `key` is pulled **out of props** and passed as the **third argument**.
  In `TodosPage`:

```js
export function TodosPage() {
  log('render TodosPage');
  const [todos, setTodos] = useState([{
    id: 1,
    text: 'Learn JSX'
  }, {
    id: 2,
    text: 'Read about fibers'
  }]);
  const [text, setText] = useState('');
  useEffect(() => {
    log('effect: subscribe to resize');
    const onResize = () => log('window resized');
    window.addEventListener('resize', onResize);
    return () => {
      log('cleanup: unsubscribe from resize');
      window.removeEventListener('resize', onResize);
    };
  }, []);
  function addTodo(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, {
      id: nextId++,
      text
    }]);
    setText('');
  }
  return /*#__PURE__*/_jsxs("section", {
    children: [/*#__PURE__*/_jsx("h2", {
      children: "Todos"
    }), /*#__PURE__*/_jsxs("form", {
      onSubmit: addTodo,
      children: [/*#__PURE__*/_jsx("input", {
        value: text,
        onChange: e => setText(e.target.value),
        placeholder: "New todo"
      }), /*#__PURE__*/_jsx("button", {
        children: "Add"
      })]
    }), /*#__PURE__*/_jsx("ul", {
      children: todos.map(todo => /*#__PURE__*/_jsx(TodoItem, {
        todo: todo,
        onRemove: () => setTodos(todos.filter(t => t.id !== todo.id))
      }, todo.id))
    })]
  });
}
```

Notice `_jsx("ul", { children: todos.map(...) })`: the children are an
array, but it's `jsx`, not `jsxs`, because the array is created at run time
by `map`. The compiler can't know its length, so React has to check that each
item has a key (the "Each child in a list should have a unique key" warning
comes from here).

The `/*#__PURE__*/` comments tell minifiers the call has no side effects, so
an unused element can be dropped.

### The classic runtime: `React.createElement`

Before React 17, the same JSX compiled to `React.createElement`. Babel still
supports it with `runtime: 'classic'`:

```js
export function App() {
  log('render App');
  const [page, setPage] = useState('counter');
  const [theme, setTheme] = useState('light');
  return /*#__PURE__*/React.createElement(ThemeContext, {
    value: theme
  }, /*#__PURE__*/React.createElement(Layout, null, /*#__PURE__*/React.createElement(Nav, {
    page: page,
    onNavigate: setPage
  }), /*#__PURE__*/React.createElement("button", {
    className: "theme",
    onClick: () => setTheme(theme === 'light' ? 'dark' : 'light')
  }, "Theme: ", theme), page === 'counter' ? /*#__PURE__*/React.createElement(CounterPage, null) : /*#__PURE__*/React.createElement(TodosPage, null)));
}
```

The differences:

| | Classic: `React.createElement` | Automatic: `jsx` / `jsxs` |
|---|---|---|
| Import | you had to write `import React from 'react'` in every file | the compiler adds `import { jsx } from 'react/jsx-runtime'` |
| Children | extra arguments: `createElement(type, props, child1, child2)` | inside props: `jsx(type, { children: [child1, child2] })` |
| `key` | inside the props object; React had to copy props to remove it | a separate argument, so props can often be used as-is |
| Static vs dynamic children | indistinguishable | `jsxs` marks static arrays, so the key warning only fires for real lists |

Both produce **the same kind of object**. The automatic runtime just makes
the call cheaper and removes the `React` import requirement.

<details class="deep"><summary>Under the hood: the real jsx() and createElement()</summary>

This is the whole production `jsx` from `react/cjs/react-jsx-runtime.production.js`
(19.2.5). `jsx` and `jsxs` are **the same function** in production; they
only differ in development, where `jsxs` skips key validation for static
arrays:

```js
function jsxProd(type, config, maybeKey) {
  var key = null;
  void 0 !== maybeKey && (key = "" + maybeKey);
  void 0 !== config.key && (key = "" + config.key);
  if ("key" in config) {
    maybeKey = {};
    for (var propName in config)
      "key" !== propName && (maybeKey[propName] = config[propName]);
  } else maybeKey = config;
  config = maybeKey.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: void 0 !== config ? config : null,
    props: maybeKey
  };
}
exports.jsx = jsxProd;
exports.jsxs = jsxProd;
```

Three things to notice. The key is turned into a **string** (`"" + maybeKey`),
so `key={1}` becomes `"1"`. When there's no key in the config, **the config
object itself becomes `props`**: no copy. And `ref` is read from props: in
React 19, `ref` is a normal prop.

The classic `createElement` from `react.production.js`, for comparison. It
always copies props and collects children from `arguments`:

```js
exports.createElement = function (type, config, children) {
  var propName, props = {}, key = null;
  if (null != config)
    for (propName in (void 0 !== config.key && (key = "" + config.key), config))
      hasOwnProperty.call(config, propName) && "key" !== propName &&
        "__self" !== propName && "__source" !== propName &&
        (props[propName] = config[propName]);
  var childrenLength = arguments.length - 2;
  if (1 === childrenLength) props.children = children;
  else if (1 < childrenLength) {
    for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  if (type && type.defaultProps) /* … copy defaultProps … */
  return ReactElement(type, key, props);
};
```

</details>

### What your browser actually receives in development

`npm run dev` doesn't use Babel. Vite 8 compiles JSX with **Oxc**, and in
development it uses the **`jsxDEV`** variant, which also records where each
element came from (file, line, column) for warnings and React DevTools. This is
the `App` function exactly as Vite's dev server sends it:

```js
export function App() {
	_s();
	log("render App");
	const [page, setPage] = useState("counter");
	const [theme, setTheme] = useState("light");
	return /* @__PURE__ */ _jsxDEV(ThemeContext, {
		value: theme,
		children: /* @__PURE__ */ _jsxDEV(Layout, { children: [
			/* @__PURE__ */ _jsxDEV(Nav, {
				page,
				onNavigate: setPage
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 17,
				columnNumber: 5
			}, this),
			/* @__PURE__ */ _jsxDEV("button", {
				className: "theme",
				onClick: () => setTheme(theme === "light" ? "dark" : "light"),
				children: ["Theme: ", theme]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 18,
				columnNumber: 5
			}, this),
			page === "counter" ? /* @__PURE__ */ _jsxDEV(CounterPage, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 21,
				columnNumber: 27
			}, this) : /* @__PURE__ */ _jsxDEV(TodosPage, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 21,
				columnNumber: 45
			}, this)
		] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 16,
			columnNumber: 4
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 15,
		columnNumber: 3
	}, this);
}
```

The extra `_s()`, `$RefreshSig$` and `$RefreshReg$` lines are **Fast
Refresh** bookkeeping (hot reloading that keeps state). Babel produces the
same `jsxDEV` calls with `development: true`. `vite build` produces the
production `jsx`/`jsxs` form shown above.

## 2. The element object `{}`

So `<Display value={count} />` is just a call that returns an object. Here
is a **real** element, produced by React's production runtime for
`<p className="display">Count: {0}</p>`:

```js
{
  $$typeof: "Symbol(react.transitional.element)",
  type: "p",
  key: null,
  ref: null,
  props: {
    className: "display",
    children: [
      "Count: ",
      0
    ]
  }
}
```

And for `<App />`:

```js
{
  $$typeof: "Symbol(react.transitional.element)",
  type: "[Function App]",
  key: null,
  ref: null,
  props: {}
}
```

- **`$$typeof`** marks the object as a React element. It's a `Symbol`, and
  JSON can't contain symbols, so a server response or user input can never be
  mistaken for an element (an XSS defence).
- **`type`** is either a **string** (`"p"`: a DOM tag) or **the component
  itself** (`App`: a function). This one field is what React later uses to
  decide what to do.
- **`key`** is `null` or a **string**. `jsx('li', {...}, 1)` gives `key: "1"`.
- **`props`** holds everything else, including `children`.

Elements are **cheap, immutable descriptions**. In development React freezes
them (`Object.freeze(element.props)` and `Object.freeze(element)`). A new
element object is created **every time** the JSX runs, which happens every
time the component renders. They are never updated; they are thrown away.

<details class="deep"><summary>Under the hood: the development element</summary>

The development runtime (`jsxDEV`, what the browser used in the trace) adds
debugging fields. Their names are real; nested objects are abbreviated:

```js
{
  $$typeof: "Symbol(react.transitional.element)",
  type: "p",
  key: null,
  props: {
    className: "display",
    children: [
      "Count: ",
      0
    ]
  },
  _owner: null,
  ref: null,
  _store: "{…}",
  _debugInfo: null,
  _debugStack: "{…}",
  _debugTask: "{…}"
}
```

`_owner` is the component that created the element (`null` here because the
sample was created outside a render). `_debugStack` and `_debugTask` are what
let React point at the line in your file in warnings and React DevTools.
`_store.validated` tracks the key warning.

</details>

**When exactly are elements created?** Only when the code containing the
`jsx()` call runs:

- `<App />` in `main.jsx` is created **once**, when the module runs.
- Everything inside `App`'s `return` is created **each time React calls
  `App`**.
- `children` are created by the **parent that wrote them**. `<Layout>`'s
  `children` (Nav, the theme button, the page) are created by `App`, not
  by `Layout`.

<figure class="fig anim fig-hrw-jsx-anim" data-anim><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;App() → useState('counter'), useState('light')&quot;,&quot;say&quot;:&quot;React calls &lt;code&gt;App&lt;/code&gt;. Its body runs top to bottom: two &lt;code&gt;useState&lt;/code&gt; calls, then the &lt;code&gt;return&lt;/code&gt; expression is evaluated.&quot;},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;jsx(Nav, { page: \&quot;counter\&quot;, onNavigate: setPage })&quot;,&quot;say&quot;:&quot;JavaScript evaluates &lt;b&gt;arguments before the call they belong to&lt;/b&gt;, so the innermost JSX runs first. &lt;code&gt;jsx()&lt;/code&gt; returns a plain object. &lt;code&gt;Nav&lt;/code&gt; is &lt;b&gt;not called&lt;/b&gt;: it’s just the &lt;code&gt;type&lt;/code&gt; field.&quot;,&quot;set&quot;:{&quot;c-nav&quot;:&quot;hl&quot;,&quot;e-nav&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;jsxs(\&quot;button\&quot;, { …, children: [\&quot;Theme: \&quot;, \&quot;light\&quot;] })&quot;,&quot;say&quot;:&quot;A host element: &lt;code&gt;type&lt;/code&gt; is the string &lt;code&gt;\&quot;button\&quot;&lt;/code&gt;. Two children → &lt;code&gt;jsxs&lt;/code&gt; with an array.&quot;,&quot;set&quot;:{&quot;c-nav&quot;:&quot;&quot;,&quot;c-btn&quot;:&quot;hl&quot;,&quot;e-btn&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;jsx(CounterPage, {})&quot;,&quot;say&quot;:&quot;The ternary picks &lt;code&gt;CounterPage&lt;/code&gt;. The &lt;code&gt;TodosPage&lt;/code&gt; element is &lt;b&gt;never created&lt;/b&gt; on this render.&quot;,&quot;set&quot;:{&quot;c-btn&quot;:&quot;&quot;,&quot;c-page&quot;:&quot;hl&quot;,&quot;e-page&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;jsxs(Layout, { children: [navEl, buttonEl, pageEl] })&quot;,&quot;say&quot;:&quot;The three finished objects become &lt;code&gt;Layout&lt;/code&gt;’s &lt;code&gt;props.children&lt;/code&gt;. Layout will receive them; it does not create them.&quot;,&quot;set&quot;:{&quot;c-page&quot;:&quot;&quot;,&quot;c-layout&quot;:&quot;hl&quot;,&quot;e-layout&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;jsx(ThemeContext, { value: \&quot;light\&quot;, children: layoutEl })&quot;,&quot;say&quot;:&quot;The outermost call runs last. Its object holds the whole description.&quot;,&quot;set&quot;:{&quot;c-layout&quot;:&quot;&quot;,&quot;c-ctx&quot;:&quot;hl&quot;,&quot;e-ctx&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;return { type: ThemeContext, … }&quot;,&quot;say&quot;:&quot;&lt;code&gt;App&lt;/code&gt; returns &lt;b&gt;one object&lt;/b&gt; (with others nested inside). Only &lt;code&gt;App&lt;/code&gt; has run so far: &lt;code&gt;Nav&lt;/code&gt;, &lt;code&gt;Layout&lt;/code&gt; and &lt;code&gt;CounterPage&lt;/code&gt; are still just references, and React decides when to call them.&quot;,&quot;set&quot;:{&quot;c-ctx&quot;:&quot;&quot;,&quot;e-ctx&quot;:&quot;new hl&quot;}}]" data-intro="What happens when &lt;code&gt;App()&lt;/code&gt; reaches its &lt;code&gt;return (…)&lt;/code&gt;, in the compiled form."><div class="anim-stage"><div class="a-cols"><div class="a-panel "><div class="a-panel-title">App() is running its return statement</div><div class="a-col"><div class="an call" data-k="c-nav"><code>jsx(Nav, { page, onNavigate: setPage })</code></div><div class="an call" data-k="c-btn"><code>jsxs("button", { className, onClick, children: ["Theme: ", theme] })</code></div><div class="an call" data-k="c-page"><code>page === 'counter' ? jsx(CounterPage, {}) : jsx(TodosPage, {})</code></div><div class="an call" data-k="c-layout"><code>jsxs(Layout, { children: [ … ] })</code></div><div class="an call" data-k="c-ctx"><code>jsx(ThemeContext, { value: theme, children: … })</code></div></div></div><div class="a-panel "><div class="a-panel-title">objects created (React elements)</div><div class="a-col"><div class="an el-obj" data-k="e-nav" data-s="ghost">{ type: <b>Nav</b>, props: { page: "counter", onNavigate } }</div><div class="an el-obj" data-k="e-btn" data-s="ghost">{ type: <b>"button"</b>, props: { className: "theme", onClick, children: ["Theme: ", "light"] } }</div><div class="an el-obj" data-k="e-page" data-s="ghost">{ type: <b>CounterPage</b>, props: {} }</div><div class="an el-obj" data-k="e-layout" data-s="ghost">{ type: <b>Layout</b>, props: { children: [ Nav el, button el, CounterPage el ] } }</div><div class="an el-obj" data-k="e-ctx" data-s="ghost">{ type: <b>ThemeContext</b>, props: { value: "light", children: Layout el } }</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>App() → useState('counter'), useState('light')</code><span>React calls <code>App</code>. Its body runs top to bottom: two <code>useState</code> calls, then the <code>return</code> expression is evaluated.</span></li><li><span class="anim-phase ph-render">render phase</span><code>jsx(Nav, { page: "counter", onNavigate: setPage })</code><span>JavaScript evaluates <b>arguments before the call they belong to</b>, so the innermost JSX runs first. <code>jsx()</code> returns a plain object. <code>Nav</code> is <b>not called</b>: it’s just the <code>type</code> field.</span></li><li><span class="anim-phase ph-render">render phase</span><code>jsxs("button", { …, children: ["Theme: ", "light"] })</code><span>A host element: <code>type</code> is the string <code>"button"</code>. Two children → <code>jsxs</code> with an array.</span></li><li><span class="anim-phase ph-render">render phase</span><code>jsx(CounterPage, {})</code><span>The ternary picks <code>CounterPage</code>. The <code>TodosPage</code> element is <b>never created</b> on this render.</span></li><li><span class="anim-phase ph-render">render phase</span><code>jsxs(Layout, { children: [navEl, buttonEl, pageEl] })</code><span>The three finished objects become <code>Layout</code>’s <code>props.children</code>. Layout will receive them; it does not create them.</span></li><li><span class="anim-phase ph-render">render phase</span><code>jsx(ThemeContext, { value: "light", children: layoutEl })</code><span>The outermost call runs last. Its object holds the whole description.</span></li><li><span class="anim-phase ph-render">render phase</span><code>return { type: ThemeContext, … }</code><span><code>App</code> returns <b>one object</b> (with others nested inside). Only <code>App</code> has run so far: <code>Nav</code>, <code>Layout</code> and <code>CounterPage</code> are still just references, and React decides when to call them.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>Inside App’s render: each JSX expression is a function call that returns a plain object, innermost first.</figcaption></figure>

## 3. The page opens

The browser loads `index.html`, which contains
`<script type="module" src="/src/main.jsx">`. Module scripts run after the
HTML is parsed. Here is everything that happens, in the order it happened in
the recorded trace:

1. **Imports run first.** `react-dom/client`, `react` and the Scheduler
   evaluate their top-level code, which mostly defines functions. Then your
   modules run, which **defines** `App`, `Layout`, … but calls none of them.
2. **`createRoot(container)`** creates the **FiberRoot** (React's bookkeeping
   for this root) and the very first fiber, **HostRoot**. It stores a pointer to
   that fiber on the `#root` DOM node.
3. **`listenToAllSupportedEvents(#root)`** attaches one listener per event
   type to `#root`, for both the capture and bubble phases. Your
   `onClick={...}` will never become a real `addEventListener` on a button.
4. **`<App />`** is evaluated before `render` is called (JavaScript evaluates
   arguments first): `jsxDEV(App, {})` returns `{ type: App, props: {} }`.
5. **`root.render(element)`** asks for a lane: no event is in progress, so
   it's **DefaultLane (32)**. It creates an update with payload
   `{ element }`, queues it on the HostRoot fiber, and calls
   `scheduleUpdateOnFiber`.
6. **`render()` returns.** It doesn't render anything. `ensureRootIsScheduled`
   queued a **microtask**, and `main.jsx` finishes with `#root` still empty.
7. **The microtask** (`processRootScheduleInMicrotask`) sees a Default lane.
   That isn't Sync, so it asks the **Scheduler** for a task.
8. **The Scheduler task** (`performWorkOnRootViaSchedulerTask`) runs
   `performWorkOnRoot(root, 32)` → `renderRootSync`. The render begins.

<figure class="fig anim fig-hrw-boot-anim" data-anim><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;import 'react-dom/client'&quot;,&quot;say&quot;:&quot;The browser loads &lt;code&gt;index.html&lt;/code&gt;, which loads &lt;code&gt;main.jsx&lt;/code&gt; as a module. Its imports run first: React, ReactDOM and the Scheduler are &lt;b&gt;evaluated&lt;/b&gt; (their top-level code defines functions). Nothing renders.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;hl&quot;,&quot;mods&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;mods&quot;:&quot;React modules: loaded&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;import { App } from './App.jsx'&quot;,&quot;say&quot;:&quot;Your component modules run too, which only &lt;b&gt;defines&lt;/b&gt; &lt;code&gt;App&lt;/code&gt;, &lt;code&gt;Layout&lt;/code&gt;, … No component is called by importing it.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;&quot;,&quot;l2&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;createRoot(container) → createFiberRoot(…)&quot;,&quot;say&quot;:&quot;React creates a &lt;b&gt;FiberRoot&lt;/b&gt; (bookkeeping for this root) and the first fiber, &lt;b&gt;HostRoot&lt;/b&gt;, then stores a pointer to it on the &lt;code&gt;#root&lt;/code&gt; DOM node.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;&quot;,&quot;l3&quot;:&quot;hl&quot;,&quot;froot&quot;:&quot;new&quot;,&quot;hroot&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;listenToAllSupportedEvents(#root)&quot;,&quot;say&quot;:&quot;One listener per event type (capture and bubble) is attached to &lt;code&gt;#root&lt;/code&gt;. Later, every click inside the app reaches React through these, not through listeners on your buttons.&quot;,&quot;set&quot;:{&quot;lis&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;jsxDEV(App, {})&quot;,&quot;say&quot;:&quot;Arguments are evaluated first, so &lt;code&gt;&amp;lt;App /&amp;gt;&lt;/code&gt; becomes an element object. &lt;code&gt;App&lt;/code&gt; still hasn’t run.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;&quot;,&quot;l4&quot;:&quot;hl&quot;,&quot;elem&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;root.render(element) → requestUpdateLane(HostRoot) = DefaultLane (32)&quot;,&quot;say&quot;:&quot;No event is happening, so the update gets the &lt;b&gt;Default&lt;/b&gt; lane.&quot;,&quot;set&quot;:{&quot;lis&quot;:&quot;&quot;,&quot;queue&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;updateContainerImpl → enqueueUpdate({ element }) → scheduleUpdateOnFiber(HostRoot, 32)&quot;,&quot;say&quot;:&quot;An update whose payload is &lt;code&gt;{ element }&lt;/code&gt; is queued on the HostRoot fiber, and the root is marked as having work.&quot;,&quot;set&quot;:{&quot;elem&quot;:&quot;keep&quot;,&quot;queue&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;queue&quot;:&quot;HostRoot update queue: [ { element: &lt;App/&gt; } ]&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;ensureRootIsScheduled → scheduleImmediateRootScheduleTask (microtask)&quot;,&quot;say&quot;:&quot;&lt;code&gt;render()&lt;/code&gt; &lt;b&gt;returns without rendering&lt;/b&gt;. &lt;code&gt;main.jsx&lt;/code&gt; finishes; &lt;code&gt;#root&lt;/code&gt; is still empty.&quot;,&quot;set&quot;:{&quot;l4&quot;:&quot;&quot;,&quot;sched&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;sched&quot;:&quot;scheduled: microtask&quot;,&quot;cpu&quot;:&quot;main thread: main.jsx done&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;processRootScheduleInMicrotask → Scheduler task&quot;,&quot;say&quot;:&quot;The microtask sees a &lt;b&gt;Default&lt;/b&gt; lane (not Sync), so it asks the Scheduler for a task. The Scheduler posts it as a macrotask (via &lt;code&gt;MessageChannel&lt;/code&gt;).&quot;,&quot;set&quot;:{&quot;sched&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;sched&quot;:&quot;scheduled: Scheduler task (Normal priority)&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;performWorkOnRootViaSchedulerTask → performWorkOnRoot(root, 32) → renderRootSync&quot;,&quot;say&quot;:&quot;The task runs and rendering starts. Default is a “blocking” lane, so it renders with the synchronous loop, without time slicing. The next chapter follows it.&quot;,&quot;set&quot;:{&quot;sched&quot;:&quot;done&quot;,&quot;cpu&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;sched&quot;:&quot;running: render&quot;,&quot;cpu&quot;:&quot;main thread: React render&quot;}}]" data-intro="The browser has parsed &lt;code&gt;index.html&lt;/code&gt; and starts the &lt;code&gt;main.jsx&lt;/code&gt; module."><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">main.jsx (compiled)</div><div class="a-col"><div class="an call" data-k="l1"><code>import { createRoot } from 'react-dom/client'</code></div><div class="an call" data-k="l2"><code>import { App } from './App.jsx'</code></div><div class="an call" data-k="l3"><code>const root = createRoot(document.getElementById('root'))</code></div><div class="an call" data-k="l4"><code>root.render(jsxDEV(App, {}))</code></div></div></div><div class="a-panel "><div class="a-panel-title">React’s memory</div><div class="a-col"><span class="an chip-a" data-k="mods" data-s="faint">React modules: not loaded</span><span class="an chip-a" data-k="froot" data-s="ghost">FiberRoot</span><span class="an chip-a" data-k="hroot" data-s="ghost">HostRoot fiber (current)</span><span class="an chip-a" data-k="lis" data-s="ghost">listeners on #root</span><span class="an chip-a" data-k="elem" data-s="ghost">{ type: App, props: {} }</span><span class="an chip-a" data-k="queue" data-s="ghost">HostRoot update queue: [ ]</span><span class="an chip-a" data-k="sched" data-s="ghost">scheduled: nothing</span></div></div><div class="a-panel "><div class="a-panel-title">the page</div><div class="a-col"><div class="a-dom">&lt;div id="root"&gt;<span class="an" data-k="dom"></span>&lt;/div&gt;</div><span class="an chip-a" data-k="cpu">main thread: running main.jsx</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>import 'react-dom/client'</code><span>The browser loads <code>index.html</code>, which loads <code>main.jsx</code> as a module. Its imports run first: React, ReactDOM and the Scheduler are <b>evaluated</b> (their top-level code defines functions). Nothing renders.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>import { App } from './App.jsx'</code><span>Your component modules run too, which only <b>defines</b> <code>App</code>, <code>Layout</code>, … No component is called by importing it.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>createRoot(container) → createFiberRoot(…)</code><span>React creates a <b>FiberRoot</b> (bookkeeping for this root) and the first fiber, <b>HostRoot</b>, then stores a pointer to it on the <code>#root</code> DOM node.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>listenToAllSupportedEvents(#root)</code><span>One listener per event type (capture and bubble) is attached to <code>#root</code>. Later, every click inside the app reaches React through these, not through listeners on your buttons.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>jsxDEV(App, {})</code><span>Arguments are evaluated first, so <code>&lt;App /&gt;</code> becomes an element object. <code>App</code> still hasn’t run.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>root.render(element) → requestUpdateLane(HostRoot) = DefaultLane (32)</code><span>No event is happening, so the update gets the <b>Default</b> lane.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>updateContainerImpl → enqueueUpdate({ element }) → scheduleUpdateOnFiber(HostRoot, 32)</code><span>An update whose payload is <code>{ element }</code> is queued on the HostRoot fiber, and the root is marked as having work.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>ensureRootIsScheduled → scheduleImmediateRootScheduleTask (microtask)</code><span><code>render()</code> <b>returns without rendering</b>. <code>main.jsx</code> finishes; <code>#root</code> is still empty.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>processRootScheduleInMicrotask → Scheduler task</code><span>The microtask sees a <b>Default</b> lane (not Sync), so it asks the Scheduler for a task. The Scheduler posts it as a macrotask (via <code>MessageChannel</code>).</span></li><li><span class="anim-phase ph-render">render phase</span><code>performWorkOnRootViaSchedulerTask → performWorkOnRoot(root, 32) → renderRootSync</code><span>The task runs and rendering starts. Default is a “blocking” lane, so it renders with the synchronous loop, without time slicing. The next chapter follows it.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>From script load to the first render being scheduled. Note how much happens before any component runs.</figcaption></figure>

<details class="deep"><summary>Under the hood: the recorded trace, and the source</summary>

The real call order, up to the start of the render:

```text
createRoot  container #root
createFiberRoot
listenToAllSupportedEvents
jsxDEV  App
root.render  <App>
requestUpdateLane  HostRoot
updateContainerImpl  lane 32
scheduleUpdateOnFiber  HostRoot lane 32
ensureRootIsScheduled
scheduleImmediateRootScheduleTask
processRootScheduleInMicrotask
performWorkOnRootViaSchedulerTask
performWorkOnRoot  lanes 32
renderRootSync
prepareFreshStack
```

`createRoot` (React 19.2.5 development build, abbreviated):

```js
exports.createRoot = function(container, options) {
  if (!isValidContainer(container)) throw Error("Target container is not a DOM element.");
  // … read options …
  options = createFiberRoot(container, 1 /* ConcurrentRoot */, false, null, null, isStrictMode, …);
  container[internalContainerInstanceKey] = options.current;   // #root → HostRoot fiber
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(options);
};
```

`root.render` only queues:

```js
ReactDOMRoot.prototype.render = function(children) {
  var root = this._internalRoot;
  var current = root.current;
  updateContainerImpl(current, requestUpdateLane(current), children, root, null, null);
};

function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
  // …
  container = createUpdate(lane);
  container.payload = { element };
  element = enqueueUpdate(rootFiber, container, lane);
  null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
}
```

Why did a *Default* lane render with `renderRootSync`? Only transition,
retry and idle lanes are time-sliced; Sync, InputContinuous and Default are
"blocking" lanes rendered by the synchronous loop (see
[Scheduler, Lanes and Batching](../scheduler-lanes-and-batching/)).

</details>

## 4. The first render: how React decides what to call

React now walks the tree **one fiber at a time**: down with `beginWork`,
across to siblings, up with `completeWork` ([The Work Loop](../the-work-loop/)). There's no
fiber tree yet, so each step **creates** the fibers for the children it
finds.

The question "how does React know whether to call something?" has a short
answer: **the element's `type`**. When React creates a fiber from an
element it picks a **tag**:

| `element.type` | fiber tag | What `beginWork` does with it |
|---|---|---|
| a function (`App`, `Nav`, …) | `0` FunctionComponent | **calls it**: `renderWithHooks` → `Component(props)` |
| a string (`"div"`, `"button"`) | `5` HostComponent | doesn't call anything; reconciles `props.children`. `completeWork` creates the DOM node |
| a context (`ThemeContext`) | `10` ContextProvider | pushes `value` for the components below; reconciles `children` |
| a string or number child | `6` HostText | creates a text node |
| the root | `3` HostRoot | renders the element from its update queue |

So a component is called **when the work loop reaches its fiber**, and only
then. The order is depth-first: a component is called before its children,
and a child is called before the parent's next sibling.

<figure class="fig anim fig-hrw-render-anim" data-anim data-delay="2300"><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(HostRoot) → reconcileChildFibers(HostRoot, &lt;App&gt;)&quot;,&quot;say&quot;:&quot;Render starts at the &lt;b&gt;HostRoot&lt;/b&gt; fiber. Its pending update says: render &lt;code&gt;&amp;lt;App /&amp;gt;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;root&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createFiberFromTypeAndProps(App) → tag 0&quot;,&quot;say&quot;:&quot;React needs a fiber for the &lt;code&gt;App&lt;/code&gt; element. &lt;code&gt;typeof App === \&quot;function\&quot;&lt;/code&gt; → tag &lt;b&gt;0 (FunctionComponent)&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;root&quot;:&quot;&quot;,&quot;app&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(App) → renderWithHooks(App) → App(props)&quot;,&quot;say&quot;:&quot;&lt;b&gt;Now &lt;code&gt;App&lt;/code&gt; is called&lt;/b&gt; for the first time. Its &lt;code&gt;useState&lt;/code&gt;s are created, and its &lt;code&gt;jsx()&lt;/code&gt; calls create 5 elements.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createFiberFromTypeAndProps(ThemeContext) → tag 10&quot;,&quot;say&quot;:&quot;The returned &lt;code&gt;&amp;lt;ThemeContext&amp;gt;&lt;/code&gt; element’s type is a context object (&lt;code&gt;$$typeof: react.context&lt;/code&gt;) → tag &lt;b&gt;10 (context provider)&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;app&quot;:&quot;run&quot;,&quot;ctx&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(ThemeContext) → pushProvider · createFiber(Layout)&quot;,&quot;say&quot;:&quot;Providers aren’t called. React pushes &lt;code&gt;value: \&quot;light\&quot;&lt;/code&gt; on its context stack so components below can read it, then reconciles its child.&quot;,&quot;set&quot;:{&quot;ctx&quot;:&quot;hl&quot;,&quot;layout&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(Layout) → renderWithHooks → Layout({ children })&quot;,&quot;say&quot;:&quot;&lt;code&gt;Layout&lt;/code&gt; is called with &lt;code&gt;props.children&lt;/code&gt;: the elements &lt;b&gt;App&lt;/b&gt; already created. Layout creates only &lt;code&gt;div&lt;/code&gt;, &lt;code&gt;h1&lt;/code&gt;, &lt;code&gt;main&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;ctx&quot;:&quot;&quot;,&quot;layout&quot;:&quot;run hl&quot;,&quot;div&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(div) → reconcileChildrenArray(div, [h1, main])&quot;,&quot;say&quot;:&quot;A string type → tag &lt;b&gt;5 (HostComponent)&lt;/b&gt;. Host fibers aren’t called; React reconciles their &lt;code&gt;props.children&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;layout&quot;:&quot;run&quot;,&quot;div&quot;:&quot;hl&quot;,&quot;h1&quot;:&quot;new&quot;,&quot;main&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(h1) → completeWork(h1)&quot;,&quot;say&quot;:&quot;&lt;code&gt;h1&lt;/code&gt; has a single text child, set directly as text content (no text fiber). No children → it completes immediately: &lt;code&gt;document.createElement(\&quot;h1\&quot;)&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;div&quot;:&quot;&quot;,&quot;h1&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(main) → reconcileChildrenArray(main, [Nav, button, CounterPage])&quot;,&quot;say&quot;:&quot;&lt;code&gt;main&lt;/code&gt;’s children are the three elements App created: &lt;code&gt;Nav&lt;/code&gt;, the theme &lt;code&gt;button&lt;/code&gt;, &lt;code&gt;CounterPage&lt;/code&gt;. Fibers for all three are created first (siblings), then React goes &lt;b&gt;down&lt;/b&gt; into the first.&quot;,&quot;set&quot;:{&quot;main&quot;:&quot;hl&quot;,&quot;navc&quot;:&quot;new&quot;,&quot;theme&quot;:&quot;new&quot;,&quot;page&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Nav({ page, onNavigate }) → … completeWork(button, button, nav, Nav)&quot;,&quot;say&quot;:&quot;&lt;code&gt;Nav&lt;/code&gt; is called and returns a &lt;code&gt;&amp;lt;nav&amp;gt;&lt;/code&gt; with two buttons. They complete, then &lt;code&gt;Nav&lt;/code&gt; completes: go &lt;b&gt;across&lt;/b&gt; to the sibling.&quot;,&quot;set&quot;:{&quot;main&quot;:&quot;&quot;,&quot;navc&quot;:&quot;done&quot;,&quot;nav&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(button) → createFiberFromText ×2 → completeWork&quot;,&quot;say&quot;:&quot;The theme button has two text children (&lt;code&gt;\&quot;Theme: \&quot;&lt;/code&gt;, &lt;code&gt;\&quot;light\&quot;&lt;/code&gt;), so it gets two text fibers. They complete, then the button does.&quot;,&quot;set&quot;:{&quot;theme&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(CounterPage) → CounterPage()&quot;,&quot;say&quot;:&quot;&lt;code&gt;CounterPage&lt;/code&gt; is called: &lt;code&gt;useState(0)&lt;/code&gt;, &lt;code&gt;useRef&lt;/code&gt;, &lt;code&gt;useLayoutEffect&lt;/code&gt; and &lt;code&gt;useEffect&lt;/code&gt; are registered (effects only &lt;b&gt;recorded&lt;/b&gt;, not run).&quot;,&quot;set&quot;:{&quot;page&quot;:&quot;run hl&quot;,&quot;section&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(section) → reconcileChildrenArray(section, [h2, Display, button])&quot;,&quot;say&quot;:&quot;&lt;code&gt;section&lt;/code&gt;’s three children get fibers. &lt;code&gt;h2&lt;/code&gt; completes right away.&quot;,&quot;set&quot;:{&quot;page&quot;:&quot;run&quot;,&quot;section&quot;:&quot;hl&quot;,&quot;h2&quot;:&quot;done&quot;,&quot;display&quot;:&quot;new&quot;,&quot;add&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(Display) → Display({ value: 0 })&quot;,&quot;say&quot;:&quot;&lt;code&gt;Display&lt;/code&gt; is called with &lt;code&gt;{ value: 0 }&lt;/code&gt; and returns &lt;code&gt;&amp;lt;p&amp;gt;Count: {value}&amp;lt;/p&amp;gt;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;section&quot;:&quot;&quot;,&quot;display&quot;:&quot;run hl&quot;,&quot;p&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(p) → … → completeWork(p) · completeWork(Display)&quot;,&quot;say&quot;:&quot;The &lt;code&gt;p&lt;/code&gt; gets two text fibers, completes, and &lt;code&gt;Display&lt;/code&gt; completes.&quot;,&quot;set&quot;:{&quot;display&quot;:&quot;done&quot;,&quot;p&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(button) → completeWork(button)&quot;,&quot;say&quot;:&quot;The last leaf: the “Add one” button.&quot;,&quot;set&quot;:{&quot;add&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(section, CounterPage, main, div, Layout, ThemeContext, App, HostRoot)&quot;,&quot;say&quot;:&quot;No more siblings: React climbs to the root, completing each parent. &lt;code&gt;workInProgress&lt;/code&gt; becomes &lt;code&gt;null&lt;/code&gt;. &lt;b&gt;The render is finished, but nothing is on screen yet.&lt;/b&gt;&quot;,&quot;set&quot;:{&quot;section&quot;:&quot;done&quot;,&quot;page&quot;:&quot;done&quot;,&quot;main&quot;:&quot;done&quot;,&quot;div&quot;:&quot;done&quot;,&quot;layout&quot;:&quot;done&quot;,&quot;ctx&quot;:&quot;done&quot;,&quot;app&quot;:&quot;done&quot;,&quot;root&quot;:&quot;done&quot;}}]" data-intro="The Scheduler task has started &lt;code&gt;renderRootSync&lt;/code&gt;. The fiber tree doesn’t exist yet."><div class="anim-stage"><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node root sm" data-k="root" data-s="ghost"><span class="node-label" data-k="root-label">HostRoot</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="app" data-s="ghost"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="ctx" data-s="ghost"><span class="node-label" data-k="ctx-label">ThemeContext</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="layout" data-s="ghost"><span class="node-label" data-k="layout-label">Layout</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="div" data-s="ghost"><span class="node-label" data-k="div-label">div</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="h1" data-s="ghost"><span class="node-label" data-k="h1-label">h1</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="main" data-s="ghost"><span class="node-label" data-k="main-label">main</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="navc" data-s="ghost"><span class="node-label" data-k="navc-label">Nav</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="nav" data-s="ghost"><span class="node-label" data-k="nav-label">nav</span><small data-k="nav-sub">2 buttons</small></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="theme" data-s="ghost"><span class="node-label" data-k="theme-label">button</span><small data-k="theme-sub">"Theme: light"</small></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="page" data-s="ghost"><span class="node-label" data-k="page-label">CounterPage</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="section" data-s="ghost"><span class="node-label" data-k="section-label">section</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="h2" data-s="ghost"><span class="node-label" data-k="h2-label">h2</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="display" data-s="ghost"><span class="node-label" data-k="display-label">Display</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="p" data-s="ghost"><span class="node-label" data-k="p-label">p</span><small data-k="p-sub">"Count: 0"</small></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="add" data-s="ghost"><span class="node-label" data-k="add-label">button</span><small data-k="add-sub">"Add one"</small></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>beginWork(HostRoot) → reconcileChildFibers(HostRoot, &lt;App&gt;)</code><span>Render starts at the <b>HostRoot</b> fiber. Its pending update says: render <code>&lt;App /&gt;</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>createFiberFromTypeAndProps(App) → tag 0</code><span>React needs a fiber for the <code>App</code> element. <code>typeof App === "function"</code> → tag <b>0 (FunctionComponent)</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(App) → renderWithHooks(App) → App(props)</code><span><b>Now <code>App</code> is called</b> for the first time. Its <code>useState</code>s are created, and its <code>jsx()</code> calls create 5 elements.</span></li><li><span class="anim-phase ph-render">render phase</span><code>createFiberFromTypeAndProps(ThemeContext) → tag 10</code><span>The returned <code>&lt;ThemeContext&gt;</code> element’s type is a context object (<code>$$typeof: react.context</code>) → tag <b>10 (context provider)</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(ThemeContext) → pushProvider · createFiber(Layout)</code><span>Providers aren’t called. React pushes <code>value: "light"</code> on its context stack so components below can read it, then reconciles its child.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(Layout) → renderWithHooks → Layout({ children })</code><span><code>Layout</code> is called with <code>props.children</code>: the elements <b>App</b> already created. Layout creates only <code>div</code>, <code>h1</code>, <code>main</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(div) → reconcileChildrenArray(div, [h1, main])</code><span>A string type → tag <b>5 (HostComponent)</b>. Host fibers aren’t called; React reconciles their <code>props.children</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(h1) → completeWork(h1)</code><span><code>h1</code> has a single text child, set directly as text content (no text fiber). No children → it completes immediately: <code>document.createElement("h1")</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(main) → reconcileChildrenArray(main, [Nav, button, CounterPage])</code><span><code>main</code>’s children are the three elements App created: <code>Nav</code>, the theme <code>button</code>, <code>CounterPage</code>. Fibers for all three are created first (siblings), then React goes <b>down</b> into the first.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Nav({ page, onNavigate }) → … completeWork(button, button, nav, Nav)</code><span><code>Nav</code> is called and returns a <code>&lt;nav&gt;</code> with two buttons. They complete, then <code>Nav</code> completes: go <b>across</b> to the sibling.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(button) → createFiberFromText ×2 → completeWork</code><span>The theme button has two text children (<code>"Theme: "</code>, <code>"light"</code>), so it gets two text fibers. They complete, then the button does.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(CounterPage) → CounterPage()</code><span><code>CounterPage</code> is called: <code>useState(0)</code>, <code>useRef</code>, <code>useLayoutEffect</code> and <code>useEffect</code> are registered (effects only <b>recorded</b>, not run).</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(section) → reconcileChildrenArray(section, [h2, Display, button])</code><span><code>section</code>’s three children get fibers. <code>h2</code> completes right away.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(Display) → Display({ value: 0 })</code><span><code>Display</code> is called with <code>{ value: 0 }</code> and returns <code>&lt;p&gt;Count: {value}&lt;/p&gt;</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(p) → … → completeWork(p) · completeWork(Display)</code><span>The <code>p</code> gets two text fibers, completes, and <code>Display</code> completes.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(button) → completeWork(button)</code><span>The last leaf: the “Add one” button.</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork(section, CounterPage, main, div, Layout, ThemeContext, App, HostRoot)</code><span>No more siblings: React climbs to the root, completing each parent. <code>workInProgress</code> becomes <code>null</code>. <b>The render is finished, but nothing is on screen yet.</b></span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>The first render: one fiber at a time, down with <code>beginWork</code>, across, and up with <code>completeWork</code>. Orange = a component being called.</figcaption></figure>

In order, the first render called: `App` → `Layout` → `Nav` →
`CounterPage` → `Display`. `ThemeContext` and every DOM tag were never
"called"; they're not functions.

**Each component creates its own output only when it's called.** `App`'s
`jsx()` calls run inside `renderWithHooks(App)`. `Nav`'s run later, inside
`renderWithHooks(Nav)`. That's why in the trace the `jsxDEV` lines appear
right after each `[app] render …` line.

<details class="deep"><summary>Under the hood: how the fiber tag is chosen, and how a component gets called</summary>

`createFiberFromTypeAndProps` (abbreviated) is where an element's `type`
becomes a fiber tag:

```js
function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
  var fiberTag = 0 /* FunctionComponent */, resolvedType = type;
  if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1 /* ClassComponent */);
  else if ("string" === typeof type) fiberTag = /* hoistable / singleton checks */ … 5 /* HostComponent */;
  else switch (type) {
    case REACT_FRAGMENT_TYPE: return createFiberFromFragment(pendingProps.children, mode, lanes, key);
    case REACT_SUSPENSE_TYPE: /* … tag 13 … */
    default:
      if ("object" === typeof type && null !== type) switch (type.$$typeof) {
        case REACT_CONTEXT_TYPE:     fiberTag = 10; break; // <ThemeContext value>
        case REACT_CONSUMER_TYPE:    fiberTag = 9;  break;
        case REACT_FORWARD_REF_TYPE: fiberTag = 11; break;
        case REACT_MEMO_TYPE:        fiberTag = 14; break;
        // …
      }
  }
  // … createFiber(fiberTag, pendingProps, key, mode), set type …
}
```

`beginWork` then switches on that tag. The two cases this app uses most:

```js
switch (workInProgress.tag) {
  case 0: return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
  case 5: /* HostComponent: reconcile props.children (inlined in the build) */ …
  // case 10: pushProvider(workInProgress, context, value); reconcileChildren(…)
  // …
}
```

`updateFunctionComponent` calls `renderWithHooks`, which installs the right
set of hook implementations (mount or update) and then calls your function:

```js
function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = 0;
  ReactSharedInternals.H = null !== current && null !== current.memoizedState
    ? HooksDispatcherOnUpdateInDEV
    : HooksDispatcherOnMountInDEV;          // ← useState means "mountState" on the first render
  var children = callComponentInDEV(Component, props, secondArg);   // ← App(props)
  // …
  return children;                          // the element objects App returned
}
```

The start of the recorded first render, until React enters the context
provider. Note the order of the `jsxDEV` calls inside `App`: **innermost
first**, because JavaScript evaluates arguments before the call:

```text
beginWork  HostRoot
reconcileChildFibersImpl  HostRoot ← <App>
createFiberFromTypeAndProps  App
beginWork  App
renderWithHooks  App (mount)
[app] render App
mountState  "counter"
mountState  "light"
jsxDEV  Nav
jsxDEV  button
jsxDEV  CounterPage
jsxDEV  Layout
jsxDEV  ThemeContext
reconcileChildFibersImpl  App ← <ThemeContext>
createFiberFromTypeAndProps  ThemeContext
beginWork  ThemeContext
```

`Layout` creates only its own tags. Its `children` arrived ready-made:

```text
beginWork  Layout
renderWithHooks  Layout (mount)
[app] render Layout
jsxDEV  h1
jsxDEV  main
jsxDEV  div
reconcileChildFibersImpl  Layout ← <div>
createFiberFromTypeAndProps  div
beginWork  div
reconcileChildFibersImpl  div ← array[2]
reconcileChildrenArray  div ← [2 children]
createFiberFromTypeAndProps  h1
placeChild  h1 (new) lastPlacedIndex 0
createFiberFromTypeAndProps  main
placeChild  main (new) lastPlacedIndex 0
beginWork  h1
completeWork  h1
beginWork  main
reconcileChildFibersImpl  main ← array[3]
reconcileChildrenArray  main ← [3 children]
```

The fiber tree when the first render finished (recorded from the live page).
`hooks` lists each hook's stored value in order:

```text
HostRoot  (tag 3)
  App  (tag 0)  hooks: ["counter", "light"]
    ThemeContext  (tag 10)
      Layout  (tag 0)  hooks: []
        div  (tag 5)  → <div>
          h1  (tag 5)  → <h1>
          main  (tag 5)  → <main>
            Nav  (tag 0)  hooks: []
              nav  (tag 5)  → <nav>
                button  (tag 5)  → <button>
                button  (tag 5)  → <button>
            button  (tag 5)  → <button>
              text "Theme: "  (tag 6)  → <#text>
              text "light"  (tag 6)  → <#text>
            CounterPage  (tag 0)  hooks: [0, ref, effect, effect]
              section  (tag 5)  → <section>
                h2  (tag 5)  → <h2>
                Display  (tag 0)  hooks: []
                  p  (tag 5)  → <p>
                    text "Count: "  (tag 6)  → <#text>
                    text "0"  (tag 6)  → <#text>
                button  (tag 5)  → <button>
```

Note `Layout`'s empty hook list: `useContext` reads from the context stack
and doesn't create a hook object (see [Hooks Under the Hood](../hooks-under-the-hood/)). And `h1` has
no text fiber: a single text child is set directly as the element's text
content.

</details>

## 5. Commit and the first paint

During the render, every `completeWork` on a host fiber **created its DOM
node and appended its children's DOM nodes to it**. By the time the render
reaches the root, the whole UI exists as **one detached `<div>`**. The
document hasn't been touched.

Then the **commit** runs in one synchronous pass ([Commit Phase and Effects](../commit-phase-and-effects/)):

1. **Mutation.** The `App` fiber carries the `Placement` flag. It isn't a DOM
   node, so React descends (App → ThemeContext → Layout) until it finds one,
   and does **one** `appendChild(<div>)` into `#root`.
2. **Swap.** `root.current = finishedWork`: the new tree is now the current
   one.
3. **Layout effects.** `useLayoutEffect` runs. The DOM exists and can be
   measured, but nothing has been painted.
4. **Paint.** The Scheduler task ends; the browser paints.
5. **Passive effects.** Because this render used the Default lane,
   `useEffect` runs in a **later task, after the paint**.

<figure class="fig anim fig-hrw-commit-anim" data-anim><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(h1) → document.createElement(\&quot;h1\&quot;)&quot;,&quot;say&quot;:&quot;DOM nodes are created during the render phase, on the way &lt;b&gt;up&lt;/b&gt;, completely detached from the page.&quot;,&quot;set&quot;:{&quot;d-h1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(nav) → createElement + appendAllChildren&quot;,&quot;say&quot;:&quot;Each completed host fiber appends its children’s DOM nodes to its own node, which builds the DOM tree bottom-up.&quot;,&quot;set&quot;:{&quot;d-nav&quot;:&quot;new&quot;,&quot;d-theme&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(section) → appendAllChildren(h2, p, button)&quot;,&quot;say&quot;:&quot;&lt;code&gt;Display&lt;/code&gt; is a component, not a DOM node, so React reaches through it and appends its &lt;code&gt;&amp;lt;p&amp;gt;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;d-section&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(main) · completeWork(div)&quot;,&quot;say&quot;:&quot;At the top host fiber the whole UI exists as one detached &lt;code&gt;&amp;lt;div&amp;gt;&lt;/code&gt;. Still nothing on screen.&quot;,&quot;set&quot;:{&quot;d-main&quot;:&quot;new&quot;,&quot;d-div&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitRoot → flushMutationEffects → commitPlacement(App)&quot;,&quot;say&quot;:&quot;Commit starts. &lt;code&gt;App&lt;/code&gt; is the fiber flagged &lt;b&gt;Placement&lt;/b&gt;. It isn’t a DOM node, so React descends: App → ThemeContext → Layout → &lt;code&gt;div&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;d-div&quot;:&quot;hl&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;insertOrAppendPlacementNodeIntoContainer → appendChild(&lt;div&gt;) into #root&quot;,&quot;say&quot;:&quot;&lt;b&gt;One&lt;/b&gt; DOM insertion puts the whole tree into the document. Then &lt;code&gt;root.current = finishedWork&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;d-div&quot;:&quot;done&quot;,&quot;d-h1&quot;:&quot;done&quot;,&quot;d-main&quot;:&quot;done&quot;,&quot;d-nav&quot;:&quot;done&quot;,&quot;d-theme&quot;:&quot;done&quot;,&quot;d-section&quot;:&quot;done&quot;,&quot;doc&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;doc&quot;:&quot;&amp;lt;div class=\&quot;layout light\&quot;&amp;gt;…&amp;lt;/div&amp;gt;&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;flushLayoutEffects → commitHookEffectListMount(CounterPage, Layout)&quot;,&quot;say&quot;:&quot;Layout effects run now: the DOM exists and can be measured, but the browser &lt;b&gt;hasn’t painted&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;doc&quot;:&quot;&quot;,&quot;log0&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;task ends → style · layout · paint&quot;,&quot;say&quot;:&quot;The Scheduler task returns and the browser paints: the user sees the app.&quot;,&quot;set&quot;:{&quot;pixels&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;pixels&quot;:&quot;pixels: the app is visible&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;flushPassiveEffects → commitHookEffectListMount(CounterPage, Passive)&quot;,&quot;say&quot;:&quot;This render used the Default lane, so &lt;code&gt;useEffect&lt;/code&gt; runs in a &lt;b&gt;later task, after paint&lt;/b&gt;. (For a click it runs at the end of the commit: see chapter 5.)&quot;,&quot;set&quot;:{&quot;log1&quot;:&quot;done&quot;}}]" data-intro="The render phase from the previous animation, seen from the DOM’s side."><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">DOM built in memory (completeWork)</div><div class="a-dom"><div class="an dom-row" data-k="d-div" data-s="ghost">&lt;div class="layout light"&gt;</div><div class="an dom-row" data-k="d-h1" data-s="ghost">&nbsp;&nbsp;&lt;h1&gt;How React Works&lt;/h1&gt;</div><div class="an dom-row" data-k="d-main" data-s="ghost">&nbsp;&nbsp;&lt;main&gt;</div><div class="an dom-row" data-k="d-nav" data-s="ghost">&nbsp;&nbsp;&nbsp;&nbsp;&lt;nav&gt;…2 buttons…&lt;/nav&gt;</div><div class="an dom-row" data-k="d-theme" data-s="ghost">&nbsp;&nbsp;&nbsp;&nbsp;&lt;button&gt;Theme: light&lt;/button&gt;</div><div class="an dom-row" data-k="d-section" data-s="ghost">&nbsp;&nbsp;&nbsp;&nbsp;&lt;section&gt; h2 · p "Count: 0" · button &lt;/section&gt;</div></div></div><div class="a-panel "><div class="a-panel-title">document</div><div class="a-col"><div class="a-dom">&lt;div id="root"&gt;<span class="an" data-k="doc">(empty)</span>&lt;/div&gt;</div><span class="an chip-a" data-k="pixels">pixels: blank page</span></div></div><div class="a-panel "><div class="a-panel-title">console (?trace)</div><div class="a-log"><div class="an" data-k="log0" data-s="hide">layout effect: button is 88 px wide</div><div class="an" data-k="log1" data-s="hide">effect: set title 0</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>completeWork(h1) → document.createElement("h1")</code><span>DOM nodes are created during the render phase, on the way <b>up</b>, completely detached from the page.</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork(nav) → createElement + appendAllChildren</code><span>Each completed host fiber appends its children’s DOM nodes to its own node, which builds the DOM tree bottom-up.</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork(section) → appendAllChildren(h2, p, button)</code><span><code>Display</code> is a component, not a DOM node, so React reaches through it and appends its <code>&lt;p&gt;</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork(main) · completeWork(div)</code><span>At the top host fiber the whole UI exists as one detached <code>&lt;div&gt;</code>. Still nothing on screen.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitRoot → flushMutationEffects → commitPlacement(App)</code><span>Commit starts. <code>App</code> is the fiber flagged <b>Placement</b>. It isn’t a DOM node, so React descends: App → ThemeContext → Layout → <code>div</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>insertOrAppendPlacementNodeIntoContainer → appendChild(&lt;div&gt;) into #root</code><span><b>One</b> DOM insertion puts the whole tree into the document. Then <code>root.current = finishedWork</code>.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>flushLayoutEffects → commitHookEffectListMount(CounterPage, Layout)</code><span>Layout effects run now: the DOM exists and can be measured, but the browser <b>hasn’t painted</b>.</span></li><li><span class="anim-phase ph-paint">browser</span><code>task ends → style · layout · paint</code><span>The Scheduler task returns and the browser paints: the user sees the app.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>flushPassiveEffects → commitHookEffectListMount(CounterPage, Passive)</code><span>This render used the Default lane, so <code>useEffect</code> runs in a <b>later task, after paint</b>. (For a click it runs at the end of the commit: see chapter 5.)</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>The DOM is built off-screen during render, inserted with one appendChild during commit, then painted.</figcaption></figure>

<details class="deep"><summary>Under the hood: the recorded commit</summary>

```text
commitRoot
commitBeforeMutationEffects
flushMutationEffects
commitPlacement  App
insertOrAppendPlacementNodeIntoContainer  App is not a DOM node → descend to its child
insertOrAppendPlacementNodeIntoContainer  ThemeContext is not a DOM node → descend to its child
insertOrAppendPlacementNodeIntoContainer  Layout is not a DOM node → descend to its child
insertOrAppendPlacementNodeIntoContainer  appendChild(<div>) into #root
flushLayoutEffects
commitHookEffectListMount  CounterPage HasEffect|Layout
[app] layout effect: button is 88 px wide
ensureRootIsScheduled
scheduleImmediateRootScheduleTask
ensureRootIsScheduled
processRootScheduleInMicrotask
flushPassiveEffects
commitHookEffectListMount  CounterPage HasEffect|Passive
[app] effect: set title 0
```

`insertOrAppendPlacementNodeIntoContainer` checks the fiber's tag: for a
host component (5) or text (6) it calls `appendChild`/`insertBefore` on the
real node; otherwise it recurses into the fiber's child. That's how a
component fiber "inserts" the DOM nodes it renders.

</details>

## 6. A click: state update and re-render

The user clicks "Add one". Here is everything that happens:

1. **The event.** The browser dispatches `click`. React's listener on `#root`
   runs (`dispatchDiscreteEvent`, once for the capture phase and once for
   bubble), finds the fiber of the clicked button, collects the `onClick`
   props on the path, and calls yours inside a `SyntheticEvent`.
2. **`setCount(1)`** calls `dispatchSetState(CounterPage fiber, queue, 1)`.
   A click is a discrete event → **SyncLane (2)**. The update is queued on
   the hook and a **microtask** is scheduled. Your handler returns. Nothing
   has re-rendered yet.
3. **Render, starting from the root.** React marks the path:
   `CounterPage.lanes`, and `childLanes` on every ancestor. Then the work loop
   starts at **HostRoot** again. Ancestors with only `childLanes` **bail
   out**: their functions are not called. Siblings with no work (`h1`, `Nav`,
   the theme button) are **skipped with their entire subtree**.
4. **`CounterPage` is called** because it has the update. `useState` now
   returns `1`. Its `jsx()` calls create **brand-new element objects**, the
   same way as on the first render.
5. **Reconciliation.** The new elements are compared with the **existing
   fibers**: same types at the same positions, so the fibers are **reused**
   (`useFiber`) with new props. `Display` is called (its props object is new),
   and its text child changes from `"0"` to `"1"`.
6. **Commit.** One DOM write: the text node becomes `"1"`. The layout effect
   reruns (its deps changed). Because this was a **SyncLane** render,
   `useEffect` is flushed **at the end of the commit**: first the old
   effect's **cleanup** (with `count` 0), then the new effect.
7. **Paint.** The microtask ends and the browser paints "Count: 1".

<figure class="fig anim fig-hrw-click-anim" data-anim data-delay="2400"><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;dispatchDiscreteEvent(\&quot;click\&quot;) · capture, then bubble listener on #root&quot;,&quot;say&quot;:&quot;The click lands on the “Add one” button, but the listener is on &lt;code&gt;#root&lt;/code&gt;. React finds the button’s fiber, collects &lt;code&gt;onClick&lt;/code&gt; props along the path, and calls yours.&quot;,&quot;set&quot;:{&quot;add&quot;:&quot;done hl&quot;}},{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;setCount(1) → dispatchSetState(CounterPage, 1)&quot;,&quot;say&quot;:&quot;Your handler calls &lt;code&gt;setCount(1)&lt;/code&gt;. An update is queued on &lt;code&gt;CounterPage&lt;/code&gt;’s state hook. Nothing renders yet.&quot;,&quot;set&quot;:{&quot;add&quot;:&quot;done&quot;,&quot;page&quot;:&quot;done hl&quot;,&quot;lane&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;lane&quot;:&quot;lane: SyncLane (2)&quot;}},{&quot;phase&quot;:&quot;schedule&quot;,&quot;fn&quot;:&quot;scheduleUpdateOnFiber(CounterPage, SyncLane) → ensureRootIsScheduled&quot;,&quot;say&quot;:&quot;A click is a discrete event → &lt;b&gt;SyncLane&lt;/b&gt;. React schedules a &lt;b&gt;microtask&lt;/b&gt;; the event handler returns first.&quot;,&quot;set&quot;:{&quot;page&quot;:&quot;done&quot;,&quot;lane&quot;:&quot;&quot;,&quot;task&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;task&quot;:&quot;scheduled: microtask&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;processRootScheduleInMicrotask → performSyncWorkOnRoot → markUpdateLaneFromFiberToRoot&quot;,&quot;say&quot;:&quot;The microtask renders. First React marks the path: CounterPage gets &lt;code&gt;lanes&lt;/code&gt;, every ancestor gets &lt;code&gt;childLanes&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;task&quot;:&quot;done&quot;,&quot;root&quot;:&quot;cmp&quot;,&quot;app&quot;:&quot;cmp&quot;,&quot;ctx&quot;:&quot;cmp&quot;,&quot;layout&quot;:&quot;cmp&quot;,&quot;div&quot;:&quot;cmp&quot;,&quot;main&quot;:&quot;cmp&quot;},&quot;txt&quot;:{&quot;task&quot;:&quot;running: render&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(HostRoot … main) → bailoutOnAlreadyFinishedWork → children have work&quot;,&quot;say&quot;:&quot;Each ancestor has no update of its own, so it &lt;b&gt;bails out&lt;/b&gt;, and its function isn’t called. &lt;code&gt;App()&lt;/code&gt; doesn’t run.&quot;,&quot;set&quot;:{&quot;root&quot;:&quot;bail&quot;,&quot;app&quot;:&quot;bail&quot;,&quot;ctx&quot;:&quot;bail&quot;,&quot;layout&quot;:&quot;bail&quot;,&quot;div&quot;:&quot;bail&quot;,&quot;main&quot;:&quot;bail&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;beginWork(h1 · Nav · button) → bailout → skip subtree&quot;,&quot;say&quot;:&quot;Siblings with no pending work are &lt;b&gt;skipped with their whole subtree&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;h1&quot;:&quot;skip&quot;,&quot;navc&quot;:&quot;skip&quot;,&quot;nav&quot;:&quot;skip&quot;,&quot;theme&quot;:&quot;skip&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;renderWithHooks(CounterPage) → CounterPage() → updateReducer → count = 1&quot;,&quot;say&quot;:&quot;&lt;code&gt;CounterPage&lt;/code&gt; has the update → it’s called. &lt;code&gt;useState&lt;/code&gt; returns 1, and &lt;b&gt;new element objects&lt;/b&gt; are created for its whole output.&quot;,&quot;set&quot;:{&quot;page&quot;:&quot;run hl&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildrenArray(section) → useFiber(h2, Display, button)&quot;,&quot;say&quot;:&quot;Same types at the same positions → the existing fibers are &lt;b&gt;reused&lt;/b&gt; with new props.&quot;,&quot;set&quot;:{&quot;page&quot;:&quot;run&quot;,&quot;section&quot;:&quot;keep&quot;,&quot;h2&quot;:&quot;keep&quot;,&quot;add&quot;:&quot;keep&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Display({ value: 1 }) → text \&quot;0\&quot; → \&quot;1\&quot;&quot;,&quot;say&quot;:&quot;&lt;code&gt;Display&lt;/code&gt; receives a new props object, so it re-renders. Its text child changed → flagged &lt;b&gt;Update&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;display&quot;:&quot;run hl&quot;,&quot;p&quot;:&quot;upd&quot;,&quot;p-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;p-sub&quot;:&quot;\&quot;Count: 1\&quot;&quot;,&quot;p-flag&quot;:&quot;Update&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;completeWork(… → HostRoot)&quot;,&quot;say&quot;:&quot;React climbs back to the root. Only &lt;code&gt;CounterPage&lt;/code&gt; and &lt;code&gt;Display&lt;/code&gt; ran.&quot;,&quot;set&quot;:{&quot;display&quot;:&quot;done&quot;,&quot;page&quot;:&quot;done&quot;,&quot;section&quot;:&quot;done&quot;,&quot;h2&quot;:&quot;done&quot;,&quot;add&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;flushMutationEffects → commitTextUpdate(\&quot;0\&quot; → \&quot;1\&quot;)&quot;,&quot;say&quot;:&quot;One text write. (&lt;code&gt;commitUpdate&lt;/code&gt; is also called for the re-rendered host nodes, but it finds no changed props.)&quot;,&quot;set&quot;:{&quot;p&quot;:&quot;done&quot;,&quot;p-flag&quot;:&quot;ghost&quot;,&quot;scr&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;DOM: Count: 1 (not painted yet)&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;flushLayoutEffects → layout effect (button width)&quot;,&quot;say&quot;:&quot;The layout effect’s deps &lt;code&gt;[count]&lt;/code&gt; changed, so it runs again, still before paint.&quot;},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;flushPassiveEffects (SyncLane: at the end of the commit)&quot;,&quot;say&quot;:&quot;For a &lt;b&gt;click&lt;/b&gt;, React flushes &lt;code&gt;useEffect&lt;/code&gt; right away: first the &lt;b&gt;previous&lt;/b&gt; effect’s cleanup (with the old &lt;code&gt;count&lt;/code&gt;, 0)…&quot;,&quot;set&quot;:{&quot;log0&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitHookEffectListMount(CounterPage, Passive)&quot;,&quot;say&quot;:&quot;…then the new effect with &lt;code&gt;count = 1&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;log1&quot;:&quot;done&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;microtask ends → paint&quot;,&quot;say&quot;:&quot;The browser paints “Count: 1”.&quot;,&quot;set&quot;:{&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;screen: Count: 1&quot;}}]" data-intro="The app is on screen, count is 0. The user clicks “Add one”."><div class="anim-stage"><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node root sm" data-k="root" data-s="done"><span class="node-label" data-k="root-label">HostRoot</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="app" data-s="done"><span class="node-label" data-k="app-label">App</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="ctx" data-s="done"><span class="node-label" data-k="ctx-label">ThemeContext</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="layout" data-s="done"><span class="node-label" data-k="layout-label">Layout</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="div" data-s="done"><span class="node-label" data-k="div-label">div</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="h1" data-s="done"><span class="node-label" data-k="h1-label">h1</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="main" data-s="done"><span class="node-label" data-k="main-label">main</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="navc" data-s="done"><span class="node-label" data-k="navc-label">Nav</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="nav" data-s="done"><span class="node-label" data-k="nav-label">nav</span><small data-k="nav-sub">2 buttons</small></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="theme" data-s="done"><span class="node-label" data-k="theme-label">button</span><small data-k="theme-sub">"Theme: light"</small></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="page" data-s="done"><span class="node-label" data-k="page-label">CounterPage</span><span class="an flag" data-k="page-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="section" data-s="done"><span class="node-label" data-k="section-label">section</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="h2" data-s="done"><span class="node-label" data-k="h2-label">h2</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="display" data-s="done"><span class="node-label" data-k="display-label">Display</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="p" data-s="done"><span class="node-label" data-k="p-label">p</span><small data-k="p-sub">"Count: 0"</small><span class="an flag" data-k="p-flag" data-s="ghost">flag</span></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="add" data-s="done"><span class="node-label" data-k="add-label">button</span><small data-k="add-sub">"Add one"</small></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="a-row" style="justify-content:center;margin-top:12px"><span class="an chip-a" data-k="lane">lane: –</span><span class="an chip-a" data-k="task">scheduled: nothing</span><span class="an chip-a" data-k="scr">screen: Count: 0</span></div><div class="a-log" style="margin-top:10px"><div class="an" data-k="log0" data-s="hide">cleanup: title effect 0</div><div class="an" data-k="log1" data-s="hide">effect: set title 1</div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>dispatchDiscreteEvent("click") · capture, then bubble listener on #root</code><span>The click lands on the “Add one” button, but the listener is on <code>#root</code>. React finds the button’s fiber, collects <code>onClick</code> props along the path, and calls yours.</span></li><li><span class="anim-phase ph-event">event</span><code>setCount(1) → dispatchSetState(CounterPage, 1)</code><span>Your handler calls <code>setCount(1)</code>. An update is queued on <code>CounterPage</code>’s state hook. Nothing renders yet.</span></li><li><span class="anim-phase ph-schedule">schedule</span><code>scheduleUpdateOnFiber(CounterPage, SyncLane) → ensureRootIsScheduled</code><span>A click is a discrete event → <b>SyncLane</b>. React schedules a <b>microtask</b>; the event handler returns first.</span></li><li><span class="anim-phase ph-render">render phase</span><code>processRootScheduleInMicrotask → performSyncWorkOnRoot → markUpdateLaneFromFiberToRoot</code><span>The microtask renders. First React marks the path: CounterPage gets <code>lanes</code>, every ancestor gets <code>childLanes</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(HostRoot … main) → bailoutOnAlreadyFinishedWork → children have work</code><span>Each ancestor has no update of its own, so it <b>bails out</b>, and its function isn’t called. <code>App()</code> doesn’t run.</span></li><li><span class="anim-phase ph-render">render phase</span><code>beginWork(h1 · Nav · button) → bailout → skip subtree</code><span>Siblings with no pending work are <b>skipped with their whole subtree</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>renderWithHooks(CounterPage) → CounterPage() → updateReducer → count = 1</code><span><code>CounterPage</code> has the update → it’s called. <code>useState</code> returns 1, and <b>new element objects</b> are created for its whole output.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildrenArray(section) → useFiber(h2, Display, button)</code><span>Same types at the same positions → the existing fibers are <b>reused</b> with new props.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Display({ value: 1 }) → text "0" → "1"</code><span><code>Display</code> receives a new props object, so it re-renders. Its text child changed → flagged <b>Update</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>completeWork(… → HostRoot)</code><span>React climbs back to the root. Only <code>CounterPage</code> and <code>Display</code> ran.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>flushMutationEffects → commitTextUpdate("0" → "1")</code><span>One text write. (<code>commitUpdate</code> is also called for the re-rendered host nodes, but it finds no changed props.)</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>flushLayoutEffects → layout effect (button width)</code><span>The layout effect’s deps <code>[count]</code> changed, so it runs again, still before paint.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>flushPassiveEffects (SyncLane: at the end of the commit)</code><span>For a <b>click</b>, React flushes <code>useEffect</code> right away: first the <b>previous</b> effect’s cleanup (with the old <code>count</code>, 0)…</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitHookEffectListMount(CounterPage, Passive)</code><span>…then the new effect with <code>count = 1</code>.</span></li><li><span class="anim-phase ph-paint">browser</span><code>microtask ends → paint</code><span>The browser paints “Count: 1”.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>One click on “Add one”: only the component that owns the state and its children run. Everything above bails out.</figcaption></figure>

Elements vs fibers on this click: **every element under `CounterPage` was
recreated** (they always are), but **no fiber was created**. Every fiber was
the old one, updated in place through its alternate ([React Fiber](../react-fiber/)).

<details class="deep"><summary>Under the hood: the recorded click</summary>

```text
dispatchDiscreteEvent  click (capture listener)
dispatchDiscreteEvent  click (bubble listener)
dispatchSetState  CounterPage ← 1
requestUpdateLane  CounterPage
scheduleUpdateOnFiber  CounterPage lane 2
ensureRootIsScheduled
scheduleImmediateRootScheduleTask
processRootScheduleInMicrotask
performSyncWorkOnRoot
performWorkOnRoot  lanes 2
renderRootSync
prepareFreshStack
markUpdateLaneFromFiberToRoot  CounterPage
beginWork  HostRoot
bailoutOnAlreadyFinishedWork  HostRoot → children have work
beginWork  App
bailoutOnAlreadyFinishedWork  App → children have work
beginWork  ThemeContext
bailoutOnAlreadyFinishedWork  ThemeContext → children have work
beginWork  Layout
bailoutOnAlreadyFinishedWork  Layout → children have work
beginWork  div
bailoutOnAlreadyFinishedWork  div → children have work
beginWork  h1
bailoutOnAlreadyFinishedWork  h1 → skip subtree
completeWork  h1
beginWork  main
bailoutOnAlreadyFinishedWork  main → children have work
beginWork  Nav
bailoutOnAlreadyFinishedWork  Nav → skip subtree
completeWork  Nav
beginWork  button
bailoutOnAlreadyFinishedWork  button → skip subtree
completeWork  button
beginWork  CounterPage
renderWithHooks  CounterPage (update)
[app] render CounterPage
updateReducer
jsxDEV  h2
jsxDEV  Display
jsxDEV  button
jsxDEV  section
reconcileChildFibersImpl  CounterPage ← <section>
useFiber  section
beginWork  section
reconcileChildFibersImpl  section ← array[3]
reconcileChildrenArray  section ← [3 children]
useFiber  h2
placeChild  h2 oldIndex 0 lastPlacedIndex 0
useFiber  Display
placeChild  Display oldIndex 1 lastPlacedIndex 0
useFiber  button
placeChild  button oldIndex 2 lastPlacedIndex 1
beginWork  h2
completeWork  h2
beginWork  Display
renderWithHooks  Display (update)
[app] render Display 1
jsxDEV  p
reconcileChildFibersImpl  Display ← <p>
useFiber  p
beginWork  p
reconcileChildFibersImpl  p ← array[2]
reconcileChildrenArray  p ← [2 children]
useFiber  text "Count: "
placeChild  text "Count: " oldIndex 0 lastPlacedIndex 0
useFiber  text "0"
placeChild  text "1" oldIndex 1 lastPlacedIndex 0
beginWork  text "Count: "
bailoutOnAlreadyFinishedWork  text "Count: " → skip subtree
completeWork  text "Count: "
beginWork  text "1"
completeWork  text "1"
completeWork  p
completeWork  Display
beginWork  button
completeWork  button
completeWork  section
completeWork  CounterPage
completeWork  main
completeWork  div
completeWork  Layout
completeWork  ThemeContext
completeWork  App
completeWork  HostRoot
commitRoot
commitBeforeMutationEffects
flushMutationEffects
commitUpdate  h2
commitTextUpdate  "0" → "1"
commitUpdate  p
commitUpdate  button
commitUpdate  section
flushLayoutEffects
commitHookEffectListMount  CounterPage HasEffect|Layout
[app] layout effect: button is 88 px wide
flushPassiveEffects
commitHookEffectListUnmount  CounterPage HasEffect|Passive
[app] cleanup: title effect 0
commitHookEffectListMount  CounterPage HasEffect|Passive
[app] effect: set title 1
```

Two details in this trace. First, `commitUpdate` is called for
`h2`, `p`, `button` and `section`, even though only a text changed. In
React 19 a host fiber with a **new props object** is flagged in
`completeWork`, and the actual comparison of attributes happens in the
commit (`commitUpdate` diffs old and new props and writes only what
changed, here nothing). Second, `bailoutOnAlreadyFinishedWork  text "Count: "`:
even text fibers bail out when their content is unchanged.

</details>

## 7. A context change

The theme button calls `setTheme('dark')`. The state lives in **`App`**, so
this time `App` re-renders. Because `App` creates new elements for
everything below it, **every component under it re-renders too**: `Layout`,
`Nav`, `CounterPage`, `Display`. None of them is wrapped in `memo`, and
each receives a new props object.

Context propagation only becomes visible when something **would** bail out:
React then searches the subtree for fibers that read the changed context
(`propagateContextChanges`) and schedules them, even through a `memo`
boundary. In this app both `Layout` and every `TodoItem` read `ThemeContext`,
so after a theme change they'd re-render even if their parents were
memoized.

<details class="deep"><summary>Under the hood: the recorded theme change</summary>

```text
dispatchSetState  App ← "dark"
requestUpdateLane  App
scheduleUpdateOnFiber  App lane 2
ensureRootIsScheduled
scheduleImmediateRootScheduleTask
processRootScheduleInMicrotask
performSyncWorkOnRoot
performWorkOnRoot  lanes 2
renderRootSync
prepareFreshStack
markUpdateLaneFromFiberToRoot  App
beginWork  HostRoot
bailoutOnAlreadyFinishedWork  HostRoot → children have work
beginWork  App
renderWithHooks  App (update)
[app] render App
updateReducer
updateReducer
jsxDEV  Nav
jsxDEV  button
jsxDEV  CounterPage
jsxDEV  Layout
jsxDEV  ThemeContext
reconcileChildFibersImpl  App ← <ThemeContext>
useFiber  ThemeContext
beginWork  ThemeContext
reconcileChildFibersImpl  ThemeContext ← <Layout>
useFiber  Layout
beginWork  Layout
renderWithHooks  Layout (update)
[app] render Layout
```

And the commit: `commitTextUpdate "light" → "dark"` is the only text that
changed, and `commitUpdate div` applies the new `className` ("layout dark"):

```text
commitRoot
commitBeforeMutationEffects
flushMutationEffects
commitUpdate  h1
commitUpdate  button
commitUpdate  button
commitUpdate  nav
commitTextUpdate  "light" → "dark"
commitUpdate  button
commitUpdate  h2
commitUpdate  p
commitUpdate  button
commitUpdate  section
commitUpdate  main
commitUpdate  div
flushLayoutEffects
flushPassiveEffects
```

No effects ran: `CounterPage`'s effects depend on `[count]`, which didn't
change.

</details>

## 8. The list: keys at work

On the Todos page, `todos.map(todo => <TodoItem key={todo.id} … />)`
produces an array of elements, and each one carries a `key` (compiled to the
third argument of `jsx`). React matches old and new children **by key**
([Child Reconciliation Algorithm](../child-reconciliation-algorithm/)).

**Typing in the input.** Every keystroke calls `setText`, re-renders
`TodosPage`, and with it both `TodoItem`s, because they get new props
objects (a new `onRemove` function every render). The DOM writes are tiny,
but the components run:

```text
dispatchDiscreteEvent  input (capture listener)
dispatchDiscreteEvent  input (bubble listener)
dispatchSetState  TodosPage ← "x"
requestUpdateLane  TodosPage
scheduleUpdateOnFiber  TodosPage lane 2
ensureRootIsScheduled
scheduleImmediateRootScheduleTask
performSyncWorkOnRoot
performWorkOnRoot  lanes 2
renderRootSync
prepareFreshStack
markUpdateLaneFromFiberToRoot  TodosPage
beginWork  HostRoot
bailoutOnAlreadyFinishedWork  HostRoot → children have work
beginWork  App
bailoutOnAlreadyFinishedWork  App → children have work
beginWork  ThemeContext
bailoutOnAlreadyFinishedWork  ThemeContext → children have work
beginWork  Layout
bailoutOnAlreadyFinishedWork  Layout → children have work
beginWork  div
bailoutOnAlreadyFinishedWork  div → children have work
beginWork  h1
bailoutOnAlreadyFinishedWork  h1 → skip subtree
completeWork  h1
beginWork  main
bailoutOnAlreadyFinishedWork  main → children have work
beginWork  Nav
bailoutOnAlreadyFinishedWork  Nav → skip subtree
completeWork  Nav
beginWork  button
bailoutOnAlreadyFinishedWork  button → skip subtree
completeWork  button
beginWork  TodosPage
renderWithHooks  TodosPage (update)
[app] render TodosPage
updateReducer
updateReducer
jsxDEV  h2
jsxDEV  input
jsxDEV  button
jsxDEV  form
jsxDEV  TodoItem key=1
jsxDEV  TodoItem key=2
jsxDEV  ul
jsxDEV  section
reconcileChildFibersImpl  TodosPage ← <section>
useFiber  section
beginWork  section
reconcileChildFibersImpl  section ← array[3]
reconcileChildrenArray  section ← [3 children]
useFiber  h2
placeChild  h2 oldIndex 0 lastPlacedIndex 0
useFiber  form
placeChild  form oldIndex 1 lastPlacedIndex 0
useFiber  ul
placeChild  ul oldIndex 2 lastPlacedIndex 1
beginWork  h2
completeWork  h2
beginWork  form
reconcileChildFibersImpl  form ← array[2]
reconcileChildrenArray  form ← [2 children]
useFiber  input
placeChild  input oldIndex 0 lastPlacedIndex 0
useFiber  button
placeChild  button oldIndex 1 lastPlacedIndex 0
beginWork  input
completeWork  input
beginWork  button
completeWork  button
completeWork  form
beginWork  ul
reconcileChildFibersImpl  ul ← array[2]
reconcileChildrenArray  ul ← [2 children]
useFiber  TodoItem[key=1]
placeChild  TodoItem[key=1] oldIndex 0 lastPlacedIndex 0
useFiber  TodoItem[key=2]
placeChild  TodoItem[key=2] oldIndex 1 lastPlacedIndex 0
beginWork  TodoItem[key=1]
renderWithHooks  TodoItem[key=1] (update)
[app] render TodoItem 1
jsxDEV  button
jsxDEV  li
reconcileChildFibersImpl  TodoItem[key=1] ← <li>
useFiber  li
beginWork  li
reconcileChildFibersImpl  li ← array[3]
reconcileChildrenArray  li ← [3 children]
useFiber  text "Learn JSX"
placeChild  text "Learn JSX" oldIndex 0 lastPlacedIndex 0
useFiber  text " "
placeChild  text " " oldIndex 1 lastPlacedIndex 0
useFiber  button
placeChild  button oldIndex 2 lastPlacedIndex 1
beginWork  text "Learn JSX"
bailoutOnAlreadyFinishedWork  text "Learn JSX" → skip subtree
completeWork  text "Learn JSX"
beginWork  text " "
bailoutOnAlreadyFinishedWork  text " " → skip subtree
completeWork  text " "
beginWork  button
completeWork  button
completeWork  li
completeWork  TodoItem[key=1]
beginWork  TodoItem[key=2]
renderWithHooks  TodoItem[key=2] (update)
[app] render TodoItem 2
```

**Adding a todo.** The submit handler calls `setTodos` **and** `setText`.
Two updates, **one render**: both are queued during the event and the single
microtask processes them together (batching). The keyed diff reuses keys 1
and 2 and creates key 3:

```text
dispatchSetState  TodosPage ← [{"id":1,"text":"Learn JSX"},{"id":2,"text":"Read about fibe
requestUpdateLane  TodosPage
scheduleUpdateOnFiber  TodosPage lane 2
ensureRootIsScheduled
scheduleImmediateRootScheduleTask
dispatchSetState  TodosPage ← ""
requestUpdateLane  TodosPage
scheduleUpdateOnFiber  TodosPage lane 2
ensureRootIsScheduled
processRootScheduleInMicrotask
performSyncWorkOnRoot
performWorkOnRoot  lanes 2
renderRootSync
```

```text
reconcileChildrenArray  ul ← [3 children]
useFiber  TodoItem[key=1]
placeChild  TodoItem[key=1] oldIndex 0 lastPlacedIndex 0
useFiber  TodoItem[key=2]
placeChild  TodoItem[key=2] oldIndex 1 lastPlacedIndex 0
createFiberFromTypeAndProps  TodoItem
placeChild  TodoItem[key=3] (new) lastPlacedIndex 1
```

**Removing the first todo.** The first keys differ, so React builds a
`Map` of the old children, reuses keys 2 and 3, and deletes key 1. That's
**one** `removeChild`:

```text
reconcileChildrenArray  ul ← [2 children]
mapRemainingChildren
useFiber  TodoItem[key=2]
placeChild  TodoItem[key=2] oldIndex 1 lastPlacedIndex 0
useFiber  TodoItem[key=3]
placeChild  TodoItem[key=3] oldIndex 2 lastPlacedIndex 1
deleteChild  TodoItem[key=1]
```

```text
commitDeletionEffectsOnFiber  TodoItem[key=1]
commitDeletionEffectsOnFiber  li
commitDeletionEffectsOnFiber  text "Learn JSX"
commitDeletionEffectsOnFiber  text " "
commitDeletionEffectsOnFiber  button
removeChild  <li> from <ul>
```

<figure class="fig anim fig-hrw-list-anim" data-anim><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Add a todo</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Remove the first todo</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;submit → setTodos([...]) · setText(\&quot;\&quot;)&quot;,&quot;say&quot;:&quot;Two state updates in one handler. The trace shows &lt;b&gt;one&lt;/b&gt; render: both were queued and the microtask processed them together (batching).&quot;},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;TodosPage() → todos.map → jsx(TodoItem, {…}, 1 / 2 / 3)&quot;,&quot;say&quot;:&quot;TodosPage re-renders and creates three &lt;code&gt;TodoItem&lt;/code&gt; elements. The key is the third argument of &lt;code&gt;jsx()&lt;/code&gt;.&quot;},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildrenArray(ul) · updateSlot(key 1, key 1) · placeChild&quot;,&quot;say&quot;:&quot;Pass 1 walks both lists while keys match. Key 1 = key 1 → reuse.&quot;,&quot;set&quot;:{&quot;o-1&quot;:&quot;keep&quot;,&quot;n-1&quot;:&quot;keep hl&quot;,&quot;pass&quot;:&quot;on&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateSlot(key 2, key 2) · placeChild&quot;,&quot;say&quot;:&quot;Key 2 = key 2 → reuse. &lt;code&gt;lastPlacedIndex&lt;/code&gt; becomes 1.&quot;,&quot;set&quot;:{&quot;n-1&quot;:&quot;keep&quot;,&quot;lp&quot;:&quot;&quot;,&quot;o-2&quot;:&quot;keep&quot;,&quot;n-2&quot;:&quot;keep hl&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createFiberFromTypeAndProps(TodoItem) · placeChild → Placement&quot;,&quot;say&quot;:&quot;The old list ran out. Key 3 is a &lt;b&gt;new fiber&lt;/b&gt;, flagged Placement. TodoItem 3 mounts; items 1 and 2 re-render (their parent did) but keep their fibers.&quot;,&quot;set&quot;:{&quot;n-2&quot;:&quot;keep&quot;,&quot;n-3&quot;:&quot;new hl&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 2b&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitPlacement(TodoItem[key=3]) → appendChild(&lt;li&gt;) into &lt;ul&gt;&quot;,&quot;say&quot;:&quot;One DOM insertion.&quot;,&quot;set&quot;:{&quot;n-3&quot;:&quot;new&quot;,&quot;d-3&quot;:&quot;new&quot;,&quot;pass&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;commit&quot;}}]" data-intro="&lt;code&gt;setTodos([...todos, { id: 3, text: &quot;x&quot; }])&lt;/code&gt; and &lt;code&gt;setText(&quot;&quot;)&lt;/code&gt; are called in the same submit handler."><div class="anim-scn-title">Add a todo</div><div class="anim-stage"><div class="ld-scene"><div class="a-label">old fibers</div><div class="a-track" style="--slot:92px"><div style="--x:0" class="an node comp sm" data-k="o-1"><span class="node-label" data-k="o-1-label">key 1</span><small data-k="o-1-sub">“Learn JSX”</small></div><div style="--x:1" class="an node comp sm" data-k="o-2"><span class="node-label" data-k="o-2-label">key 2</span><small data-k="o-2-sub">“Read about…”</small></div></div><div class="a-label">new elements</div><div class="a-track" style="--slot:92px"><div style="--x:0" class="an node el sm" data-k="n-1"><span class="node-label" data-k="n-1-label">key 1</span><small data-k="n-1-sub">“Learn JSX”</small></div><div style="--x:1" class="an node el sm" data-k="n-2"><span class="node-label" data-k="n-2-label">key 2</span><small data-k="n-2-sub">“Read about…”</small></div><div style="--x:2" class="an node el sm" data-k="n-3"><span class="node-label" data-k="n-3-label">key 3</span><small data-k="n-3-sub">“x”</small></div></div><div class="a-row" style="margin:6px 0 10px"><span class="an chip-a" data-k="pass">start</span><span class="an chip-a" data-k="lp">lastPlacedIndex = 0</span><span class="a-label">map</span></div><div class="a-label">DOM &lt;ul&gt;</div><div class="a-track" style="--slot:92px"><div class="an node host sm" data-k="d-1" style="--x:0">&lt;li&gt;<small>“Learn JSX”</small></div><div class="an node host sm" data-k="d-2" style="--x:1">&lt;li&gt;<small>“Read about…”</small></div><div class="an node host sm" data-k="d-3" style="--x:2" data-s="ghost">&lt;li&gt;<small>“x”</small></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>submit → setTodos([...]) · setText("")</code><span>Two state updates in one handler. The trace shows <b>one</b> render: both were queued and the microtask processed them together (batching).</span></li><li><span class="anim-phase ph-render">render phase</span><code>TodosPage() → todos.map → jsx(TodoItem, {…}, 1 / 2 / 3)</code><span>TodosPage re-renders and creates three <code>TodoItem</code> elements. The key is the third argument of <code>jsx()</code>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildrenArray(ul) · updateSlot(key 1, key 1) · placeChild</code><span>Pass 1 walks both lists while keys match. Key 1 = key 1 → reuse.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateSlot(key 2, key 2) · placeChild</code><span>Key 2 = key 2 → reuse. <code>lastPlacedIndex</code> becomes 1.</span></li><li><span class="anim-phase ph-render">render phase</span><code>createFiberFromTypeAndProps(TodoItem) · placeChild → Placement</code><span>The old list ran out. Key 3 is a <b>new fiber</b>, flagged Placement. TodoItem 3 mounts; items 1 and 2 re-render (their parent did) but keep their fibers.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitPlacement(TodoItem[key=3]) → appendChild(&lt;li&gt;) into &lt;ul&gt;</code><span>One DOM insertion.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onRemove → setTodos(todos.filter(t =&gt; t.id !== 1))&quot;,&quot;say&quot;:&quot;The &lt;code&gt;onRemove&lt;/code&gt; closure was created by TodosPage for this item.&quot;},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildrenArray(ul) · updateSlot(old key 1, new key 2) → null&quot;,&quot;say&quot;:&quot;Pass 1: the first keys differ, so the fast path stops immediately.&quot;,&quot;set&quot;:{&quot;o-1&quot;:&quot;cmp&quot;,&quot;n-2&quot;:&quot;cmp&quot;,&quot;pass&quot;:&quot;on&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 1 → break&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;mapRemainingChildren(oldFiber)&quot;,&quot;say&quot;:&quot;All old fibers go into a Map by key.&quot;,&quot;set&quot;:{&quot;o-1&quot;:&quot;&quot;,&quot;n-2&quot;:&quot;&quot;,&quot;m-1&quot;:&quot;&quot;,&quot;m-2&quot;:&quot;&quot;,&quot;m-3&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;pass&quot;:&quot;pass 3&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap('2') → useFiber · placeChild: oldIndex 1 ≥ 0&quot;,&quot;say&quot;:&quot;Key 2 found → reused, it &lt;b&gt;stays&lt;/b&gt;. &lt;code&gt;lastPlacedIndex&lt;/code&gt; = 1.&quot;,&quot;set&quot;:{&quot;n-2&quot;:&quot;keep hl&quot;,&quot;o-2&quot;:&quot;keep&quot;,&quot;m-2&quot;:&quot;del&quot;,&quot;lp&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 1&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;updateFromMap('3') → useFiber · placeChild: oldIndex 2 ≥ 1&quot;,&quot;say&quot;:&quot;Key 3 found → reused, stays.&quot;,&quot;set&quot;:{&quot;n-2&quot;:&quot;keep&quot;,&quot;n-3&quot;:&quot;keep hl&quot;,&quot;o-3&quot;:&quot;keep&quot;,&quot;m-3&quot;:&quot;del&quot;,&quot;lp&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;lp&quot;:&quot;lastPlacedIndex = 2&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;deleteChild(TodoItem[key=1])&quot;,&quot;say&quot;:&quot;Key 1 is left in the map → deleted.&quot;,&quot;set&quot;:{&quot;n-3&quot;:&quot;keep&quot;,&quot;o-1&quot;:&quot;del&quot;,&quot;m-1&quot;:&quot;del&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitDeletionEffectsOnFiber(TodoItem[key=1]) → removeChild(&lt;li&gt;) from &lt;ul&gt;&quot;,&quot;say&quot;:&quot;&lt;b&gt;One DOM operation.&lt;/b&gt; The other two &lt;code&gt;&amp;lt;li&amp;gt;&lt;/code&gt;s are untouched. Without keys, React would have rewritten the text of rows 1 and 2 and removed the last row.&quot;,&quot;set&quot;:{&quot;d-1&quot;:&quot;gone&quot;,&quot;d-2&quot;:&quot;keep&quot;,&quot;d-3&quot;:&quot;keep&quot;,&quot;pass&quot;:&quot;&quot;},&quot;css&quot;:{&quot;d-2&quot;:{&quot;--x&quot;:&quot;0&quot;},&quot;d-3&quot;:{&quot;--x&quot;:&quot;1&quot;}},&quot;txt&quot;:{&quot;pass&quot;:&quot;commit&quot;}}]" data-intro="The list holds keys 1, 2, 3. The user clicks × on “Learn JSX” (key 1)."><div class="anim-scn-title">Remove the first todo</div><div class="anim-stage"><div class="ld-scene"><div class="a-label">old fibers</div><div class="a-track" style="--slot:92px"><div style="--x:0" class="an node comp sm" data-k="o-1"><span class="node-label" data-k="o-1-label">key 1</span><small data-k="o-1-sub">“Learn JSX”</small></div><div style="--x:1" class="an node comp sm" data-k="o-2"><span class="node-label" data-k="o-2-label">key 2</span><small data-k="o-2-sub">“Read about…”</small></div><div style="--x:2" class="an node comp sm" data-k="o-3"><span class="node-label" data-k="o-3-label">key 3</span><small data-k="o-3-sub">“x”</small></div></div><div class="a-label">new elements</div><div class="a-track" style="--slot:92px"><div style="--x:0" class="an node el sm" data-k="n-2"><span class="node-label" data-k="n-2-label">key 2</span><small data-k="n-2-sub">“Read about…”</small></div><div style="--x:1" class="an node el sm" data-k="n-3"><span class="node-label" data-k="n-3-label">key 3</span><small data-k="n-3-sub">“x”</small></div></div><div class="a-row" style="margin:6px 0 10px"><span class="an chip-a" data-k="pass">start</span><span class="an chip-a" data-k="lp">lastPlacedIndex = 0</span><span class="a-label">map</span><span class="an chip-a" data-k="m-1" data-s="ghost">1 → fiber</span><span class="an chip-a" data-k="m-2" data-s="ghost">2 → fiber</span><span class="an chip-a" data-k="m-3" data-s="ghost">3 → fiber</span></div><div class="a-label">DOM &lt;ul&gt;</div><div class="a-track" style="--slot:92px"><div class="an node host sm" data-k="d-1" style="--x:0">&lt;li&gt;<small>“Learn JSX”</small></div><div class="an node host sm" data-k="d-2" style="--x:1">&lt;li&gt;<small>“Read about…”</small></div><div class="an node host sm" data-k="d-3" style="--x:2">&lt;li&gt;<small>“x”</small></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onRemove → setTodos(todos.filter(t =&gt; t.id !== 1))</code><span>The <code>onRemove</code> closure was created by TodosPage for this item.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildrenArray(ul) · updateSlot(old key 1, new key 2) → null</code><span>Pass 1: the first keys differ, so the fast path stops immediately.</span></li><li><span class="anim-phase ph-render">render phase</span><code>mapRemainingChildren(oldFiber)</code><span>All old fibers go into a Map by key.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap('2') → useFiber · placeChild: oldIndex 1 ≥ 0</code><span>Key 2 found → reused, it <b>stays</b>. <code>lastPlacedIndex</code> = 1.</span></li><li><span class="anim-phase ph-render">render phase</span><code>updateFromMap('3') → useFiber · placeChild: oldIndex 2 ≥ 1</code><span>Key 3 found → reused, stays.</span></li><li><span class="anim-phase ph-render">render phase</span><code>deleteChild(TodoItem[key=1])</code><span>Key 1 is left in the map → deleted.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitDeletionEffectsOnFiber(TodoItem[key=1]) → removeChild(&lt;li&gt;) from &lt;ul&gt;</code><span><b>One DOM operation.</b> The other two <code>&lt;li&gt;</code>s are untouched. Without keys, React would have rewritten the text of rows 1 and 2 and removed the last row.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>The todo list with keys: adding appends one <code>&lt;li&gt;</code>; removing deletes exactly one.</figcaption></figure>

## 9. A page switch: unmount and mount

"Todos" calls `setPage('todos')`. `App` re-renders and, in the third slot of
`Layout`'s children, returns `<TodosPage />` where there used to be
`<CounterPage />`. Same position, **different type**: React doesn't compare
inside. It deletes the whole `CounterPage` subtree (with `count`) and mounts
`TodosPage` from scratch ([Reconciliation](../reconciliation/), Rule 1).

The order of effects is the part people get wrong:

1. **Render:** `TodosPage` and its items are called and their DOM is built
   off-screen. `CounterPage` is only *marked* for deletion.
2. **Commit, mutation:** React walks the deleted subtree
   (`commitDeletionEffectsOnFiber`), then removes its top DOM node with one
   `removeChild(<section>)`, and inserts the new `<section>` with one
   `appendChild`.
3. **Passive effects:** first the **unmount cleanups** (`cleanup: title
   effect`), then the **new effects** (`effect: subscribe to resize`).

<figure class="fig anim fig-hrw-switch-anim" data-anim data-delay="2400"><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;event&quot;,&quot;fn&quot;:&quot;onNavigate('todos') → dispatchSetState(App, 'todos')&quot;,&quot;say&quot;:&quot;The “Todos” button calls &lt;code&gt;onNavigate&lt;/code&gt;, which is &lt;code&gt;App&lt;/code&gt;’s &lt;code&gt;setPage&lt;/code&gt;. The update goes on &lt;b&gt;App&lt;/b&gt;, which owns the state.&quot;},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;App() → page === \&quot;todos\&quot; → jsx(TodosPage, {})&quot;,&quot;say&quot;:&quot;App re-renders. This time the ternary creates a &lt;code&gt;TodosPage&lt;/code&gt; element in the third slot of &lt;code&gt;Layout&lt;/code&gt;’s children.&quot;},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;Layout() · Nav({ page: \&quot;todos\&quot; })&quot;,&quot;say&quot;:&quot;Both re-render: App created new elements for them, so their props are new objects.&quot;,&quot;set&quot;:{&quot;navc&quot;:&quot;run&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;reconcileChildrenArray(main, [Nav, button, TodosPage])&quot;,&quot;say&quot;:&quot;Slots 0 and 1 match. Slot 2: element type &lt;code&gt;TodosPage&lt;/code&gt; vs fiber type &lt;code&gt;CounterPage&lt;/code&gt; → &lt;b&gt;different type&lt;/b&gt;.&quot;,&quot;set&quot;:{&quot;navc&quot;:&quot;done&quot;,&quot;cp&quot;:&quot;cmp&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;createFiberFromTypeAndProps(TodosPage) · deleteChild(CounterPage)&quot;,&quot;say&quot;:&quot;A new fiber for TodosPage (flagged Placement), and CounterPage is added to &lt;code&gt;main.deletions&lt;/code&gt; (main flagged ChildDeletion). &lt;code&gt;count: 1&lt;/code&gt; will be lost.&quot;,&quot;set&quot;:{&quot;cp&quot;:&quot;del&quot;,&quot;cs&quot;:&quot;del&quot;,&quot;ch2&quot;:&quot;del&quot;,&quot;cd&quot;:&quot;del&quot;,&quot;cb&quot;:&quot;del&quot;,&quot;tp&quot;:&quot;new&quot;,&quot;tp-flag&quot;:&quot;&quot;,&quot;main-flag&quot;:&quot;&quot;},&quot;txt&quot;:{&quot;tp-flag&quot;:&quot;Placement&quot;,&quot;main-flag&quot;:&quot;ChildDeletion&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;TodosPage() → mountState([…]), mountState(''), useEffect&quot;,&quot;say&quot;:&quot;TodosPage &lt;b&gt;mounts&lt;/b&gt;: fresh state. Its &lt;code&gt;todos.map&lt;/code&gt; creates two &lt;code&gt;TodoItem&lt;/code&gt; elements with keys 1 and 2.&quot;,&quot;set&quot;:{&quot;tp&quot;:&quot;run hl&quot;,&quot;ts&quot;:&quot;new&quot;,&quot;tf&quot;:&quot;new&quot;,&quot;tu&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;TodoItem[key=1]() · TodoItem[key=2]() · completeWork(…)&quot;,&quot;say&quot;:&quot;Both items mount, and their DOM is built off-screen as React climbs.&quot;,&quot;set&quot;:{&quot;tp&quot;:&quot;new&quot;,&quot;t1&quot;:&quot;new&quot;,&quot;t2&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitDeletionEffectsOnFiber(CounterPage → section → …)&quot;,&quot;say&quot;:&quot;Mutation phase: React walks the deleted subtree (detaching refs, running layout cleanups)…&quot;,&quot;set&quot;:{&quot;cp&quot;:&quot;del hl&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;removeChild(&lt;section&gt;) from &lt;main&gt;&quot;,&quot;say&quot;:&quot;…then removes only the &lt;b&gt;top&lt;/b&gt; DOM node of that subtree.&quot;,&quot;set&quot;:{&quot;cp&quot;:&quot;del faint&quot;,&quot;cs&quot;:&quot;hide&quot;,&quot;ch2&quot;:&quot;hide&quot;,&quot;cd&quot;:&quot;hide&quot;,&quot;cb&quot;:&quot;hide&quot;,&quot;dsec&quot;:&quot;del&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;commitPlacement(TodosPage) → appendChild(&lt;section&gt;) into &lt;main&gt;&quot;,&quot;say&quot;:&quot;The new subtree goes in with one insertion.&quot;,&quot;set&quot;:{&quot;cp&quot;:&quot;hide&quot;,&quot;tp-flag&quot;:&quot;ghost&quot;,&quot;main-flag&quot;:&quot;ghost&quot;,&quot;dsec&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;dsec&quot;:&quot;&amp;lt;section&amp;gt;Todos…&amp;lt;/section&amp;gt;&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;flushPassiveEffects → commitHookEffectListUnmount(CounterPage, Passive)&quot;,&quot;say&quot;:&quot;Passive effects: &lt;b&gt;unmount cleanups first&lt;/b&gt;. The deleted CounterPage’s title effect cleans up…&quot;,&quot;set&quot;:{&quot;log0&quot;:&quot;upd&quot;}},{&quot;phase&quot;:&quot;effects&quot;,&quot;fn&quot;:&quot;commitHookEffectListMount(TodosPage, Passive)&quot;,&quot;say&quot;:&quot;…then the new page’s effect runs and subscribes to &lt;code&gt;resize&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;log1&quot;:&quot;done&quot;,&quot;tp&quot;:&quot;done&quot;,&quot;ts&quot;:&quot;done&quot;,&quot;tf&quot;:&quot;done&quot;,&quot;tu&quot;:&quot;done&quot;,&quot;t1&quot;:&quot;done&quot;,&quot;t2&quot;:&quot;done&quot;}}]" data-intro="The Counter page is showing with &lt;code&gt;count: 1&lt;/code&gt;. The user clicks “Todos”."><div class="anim-stage"><div class="t-compact"><div class="t-tree"><div class="t-branch"><div class="an node host sm" data-k="main"><span class="node-label" data-k="main-label">main</span><span class="an flag" data-k="main-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="navc"><span class="node-label" data-k="navc-label">Nav</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="theme"><span class="node-label" data-k="theme-label">button</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="cp"><span class="node-label" data-k="cp-label">CounterPage</span><small data-k="cp-sub">count: 1</small></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="cs"><span class="node-label" data-k="cs-label">section</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="ch2"><span class="node-label" data-k="ch2-label">h2</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="cd"><span class="node-label" data-k="cd-label">Display</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="cb"><span class="node-label" data-k="cb-label">button</span></div></div></div></div></div></div></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="tp" data-s="hide"><span class="node-label" data-k="tp-label">TodosPage</span><span class="an flag" data-k="tp-flag" data-s="ghost">flag</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="ts" data-s="hide"><span class="node-label" data-k="ts-label">section</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="tf" data-s="hide"><span class="node-label" data-k="tf-label">form</span></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node host sm" data-k="tu" data-s="hide"><span class="node-label" data-k="tu-label">ul</span></div><div class="t-kids"><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t1" data-s="hide"><span class="node-label" data-k="t1-label">TodoItem</span><small data-k="t1-sub">key 1</small></div></div></div><div class="t-kid"><div class="t-branch"><div class="an node comp sm" data-k="t2" data-s="hide"><span class="node-label" data-k="t2-label">TodoItem</span><small data-k="t2-sub">key 2</small></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div class="a-cols" style="margin-top:12px"><div class="a-panel "><div class="a-panel-title">DOM inside &lt;main&gt;</div><div class="a-dom">&lt;nav&gt; · &lt;button&gt; · <span class="an" data-k="dsec">&lt;section&gt;Counter…&lt;/section&gt;</span></div></div><div class="a-panel "><div class="a-panel-title">console (?trace)</div><div class="a-log"><div class="an" data-k="log0" data-s="hide">cleanup: title effect 1</div><div class="an" data-k="log1" data-s="hide">effect: subscribe to resize</div></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-event">event</span><code>onNavigate('todos') → dispatchSetState(App, 'todos')</code><span>The “Todos” button calls <code>onNavigate</code>, which is <code>App</code>’s <code>setPage</code>. The update goes on <b>App</b>, which owns the state.</span></li><li><span class="anim-phase ph-render">render phase</span><code>App() → page === "todos" → jsx(TodosPage, {})</code><span>App re-renders. This time the ternary creates a <code>TodosPage</code> element in the third slot of <code>Layout</code>’s children.</span></li><li><span class="anim-phase ph-render">render phase</span><code>Layout() · Nav({ page: "todos" })</code><span>Both re-render: App created new elements for them, so their props are new objects.</span></li><li><span class="anim-phase ph-render">render phase</span><code>reconcileChildrenArray(main, [Nav, button, TodosPage])</code><span>Slots 0 and 1 match. Slot 2: element type <code>TodosPage</code> vs fiber type <code>CounterPage</code> → <b>different type</b>.</span></li><li><span class="anim-phase ph-render">render phase</span><code>createFiberFromTypeAndProps(TodosPage) · deleteChild(CounterPage)</code><span>A new fiber for TodosPage (flagged Placement), and CounterPage is added to <code>main.deletions</code> (main flagged ChildDeletion). <code>count: 1</code> will be lost.</span></li><li><span class="anim-phase ph-render">render phase</span><code>TodosPage() → mountState([…]), mountState(''), useEffect</code><span>TodosPage <b>mounts</b>: fresh state. Its <code>todos.map</code> creates two <code>TodoItem</code> elements with keys 1 and 2.</span></li><li><span class="anim-phase ph-render">render phase</span><code>TodoItem[key=1]() · TodoItem[key=2]() · completeWork(…)</code><span>Both items mount, and their DOM is built off-screen as React climbs.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitDeletionEffectsOnFiber(CounterPage → section → …)</code><span>Mutation phase: React walks the deleted subtree (detaching refs, running layout cleanups)…</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>removeChild(&lt;section&gt;) from &lt;main&gt;</code><span>…then removes only the <b>top</b> DOM node of that subtree.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>commitPlacement(TodosPage) → appendChild(&lt;section&gt;) into &lt;main&gt;</code><span>The new subtree goes in with one insertion.</span></li><li><span class="anim-phase ph-effects">after paint</span><code>flushPassiveEffects → commitHookEffectListUnmount(CounterPage, Passive)</code><span>Passive effects: <b>unmount cleanups first</b>. The deleted CounterPage’s title effect cleans up…</span></li><li><span class="anim-phase ph-effects">after paint</span><code>commitHookEffectListMount(TodosPage, Passive)</code><span>…then the new page’s effect runs and subscribes to <code>resize</code>.</span></li></ol></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><div class="anim-progress"><div class="anim-bar"></div></div><span class="anim-count">0 / 0</span></div><figcaption>Switching pages is Rule 1 of reconciliation: a different type at the same position deletes one subtree and mounts another.</figcaption></figure>

<details class="deep"><summary>Under the hood: the recorded page switch</summary>

```text
reconcileChildrenArray  main ← [3 children]
useFiber  Nav
placeChild  Nav oldIndex 0 lastPlacedIndex 0
useFiber  button
placeChild  button oldIndex 1 lastPlacedIndex 0
createFiberFromTypeAndProps  TodosPage
deleteChild  CounterPage
placeChild  TodosPage (new) lastPlacedIndex 1
```

```text
commitRoot
commitBeforeMutationEffects
flushMutationEffects
commitUpdate  h1
commitDeletionEffectsOnFiber  CounterPage
commitDeletionEffectsOnFiber  section
commitDeletionEffectsOnFiber  h2
commitDeletionEffectsOnFiber  Display
commitDeletionEffectsOnFiber  p
commitDeletionEffectsOnFiber  text "Count: "
commitDeletionEffectsOnFiber  text "1"
commitDeletionEffectsOnFiber  button
removeChild  <section> from <main>
commitUpdate  button
commitUpdate  button
commitUpdate  nav
commitUpdate  button
commitPlacement  TodosPage
insertOrAppendPlacementNode  TodosPage is not a DOM node → descend to its child
insertOrAppendPlacementNode  appendChild(<section>) into <main>
commitUpdate  main
commitUpdate  div
flushLayoutEffects
flushPassiveEffects
commitHookEffectListUnmount  CounterPage Passive
[app] cleanup: title effect 1
commitHookEffectListMount  TodosPage HasEffect|Passive
[app] effect: subscribe to resize
```

The fiber tree on the Todos page. `CounterPage` and its subtree are gone; the
`TodoItem` fibers carry their keys:

```text
HostRoot  (tag 3)
  App  (tag 0)  hooks: ["todos", "dark"]
    ThemeContext  (tag 10)
      Layout  (tag 0)  hooks: []
        div  (tag 5)  → <div>
          h1  (tag 5)  → <h1>
          main  (tag 5)  → <main>
            Nav  (tag 0)  hooks: []
              nav  (tag 5)  → <nav>
                button  (tag 5)  → <button>
                button  (tag 5)  → <button>
            button  (tag 5)  → <button>
              text "Theme: "  (tag 6)  → <#text>
              text "dark"  (tag 6)  → <#text>
            TodosPage  (tag 0)  hooks: [[{"id":1,"text":"Learn JSX"},{"id":2,"text":"Read about fibe, "", effect]
              section  (tag 5)  → <section>
                h2  (tag 5)  → <h2>
                form  (tag 5)  → <form>
                  input  (tag 5)  → <input>
                  button  (tag 5)  → <button>
                ul  (tag 5)  → <ul>
                  TodoItem[key=1]  (tag 0)  hooks: []
                    li  (tag 5)  → <li>
                      text "Learn JSX"  (tag 6)  → <#text>
                      text " "  (tag 6)  → <#text>
                      button  (tag 5)  → <button>
                  TodoItem[key=2]  (tag 0)  hooks: []
                    li  (tag 5)  → <li>
                      text "Read about fibers"  (tag 6)  → <#text>
                      text " "  (tag 6)  → <#text>
                      button  (tag 5)  → <button>
```

</details>

## 10. Recap: the order of everything

| When | What runs | Creates |
|---|---|---|
| build | Babel / Oxc rewrites JSX to `jsx()` calls | your compiled modules |
| page load | imports evaluate; `createRoot`; `listenToAllSupportedEvents` | FiberRoot, HostRoot fiber, root listeners |
| page load | `jsx(App)`; `root.render()` queues an update, schedules | the `<App/>` element |
| render | work loop from HostRoot; each component called when reached | fibers (first time), new elements (every time) |
| render, going up | `completeWork` | DOM nodes (detached), flags |
| commit | mutation → `root.current` swap → layout effects | the DOM changes, all at once |
| after commit | paint, then `useEffect` (Sync lane: before paint) | pixels; effect side effects |
| `setState` | queue + schedule; render from the root, bail out where possible | new elements for the components that run |

Rules of thumb that follow from the traces:

- A component runs **when React's work loop reaches its fiber**, not when its
  JSX is written. `<Nav />` in `App` doesn't call `Nav`.
- `children` are created by the component that **writes** them, not the one
  that **renders** them.
- Elements are recreated on every render; fibers and DOM nodes are reused
  when type (and key) match at the same position.
- `setState` never renders by itself: it schedules a render. Several
  `setState`s in one event produce one render.
- The DOM is only touched in the commit, and only where flags say so.

## Interview Q&A

<details class="qa"><summary>What does JSX compile to?</summary>

A function call that returns an object. With the automatic runtime,
`<Nav page="x" />` becomes `jsx(Nav, { page: "x" })` imported from
`react/jsx-runtime`. With the classic runtime it was
`React.createElement(Nav, { page: "x" })`. Children go into
`props.children`, and `key` is passed separately.

</details>

<details class="qa"><summary>When is a component function actually called?</summary>

When React's work loop reaches its fiber in the render phase:
`beginWork` sees tag 0 and calls `renderWithHooks`, which calls your
function. Writing `<Nav />` only creates an object `{ type: Nav, … }`.

</details>

<details class="qa"><summary>How does React know whether to call something or create a DOM node?</summary>

From `element.type`. A function becomes a FunctionComponent fiber (called).
A string becomes a HostComponent fiber (DOM node created in
`completeWork`). A context object becomes a provider fiber.

</details>

<details class="qa"><summary>What does <code>root.render(&lt;App /&gt;)</code> do?</summary>

It queues an update with `{ element: <App/> }` on the HostRoot fiber and
schedules a render (microtask → Scheduler task for the Default lane). It
returns before anything is rendered.

</details>

<details class="qa"><summary>Does React re-render the whole app when state changes?</summary>

The render starts at the root, but components above the updated one
**bail out** without being called, and subtrees with no pending work are
skipped. The component that owns the state and its descendants run (unless
memoized).

</details>

<details class="qa"><summary>In what order do effects run on a page switch?</summary>

Render the new page (off-screen), then in the commit remove the old DOM and
insert the new one, then run the old page's effect cleanups, then the new
page's effects.

</details>

## How this was recorded

The demo lives in the site's repository under `examples/how-react-works`.

- `npm run compile` runs `@babel/core` with `@babel/preset-react`
  (automatic, development and classic runtimes) on every source file, and
  asks Vite's dev server for its output. Everything in chapter 1 is that
  output.
- `npm run trace` opens the app in Chrome, sets **logpoints** (breakpoints
  that log instead of pausing) on 49 functions of the React DOM 19.2.5
  development build through the Chrome DevTools Protocol, and records them
  together with the app's own `log()` calls. It then clicks "Add one",
  "Theme", "Todos", types, adds and removes a todo. The traces, fiber trees
  and element objects above are that recording, filtered only to hide
  pointer/focus event noise and empty `reconcileChildFibers(… ← null)`
  calls.

Development builds keep function names, which is why the traces read like
the source. Production builds are minified, but run the same functions in
the same order.
