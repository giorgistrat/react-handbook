import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/TodosPage.jsx");const useContext = __vite__cjsImport0_react["useContext"]; const useEffect = __vite__cjsImport0_react["useEffect"]; const useState = __vite__cjsImport0_react["useState"];const _jsxDEV = __vite__cjsImport3_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=8b2aef9b";
import { ThemeContext } from "/src/ThemeContext.js";
import { log } from "/src/trace.js";
var _jsxFileName = "/project/src/TodosPage.jsx";
import __vite__cjsImport3_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=8b2aef9b";
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
let nextId = 3;
export function TodosPage() {
	_s();
	log("render TodosPage");
	const [todos, setTodos] = useState([{
		id: 1,
		text: "Learn JSX"
	}, {
		id: 2,
		text: "Read about fibers"
	}]);
	const [text, setText] = useState("");
	useEffect(() => {
		log("effect: subscribe to resize");
		const onResize = () => log("window resized");
		window.addEventListener("resize", onResize);
		return () => {
			log("cleanup: unsubscribe from resize");
			window.removeEventListener("resize", onResize);
		};
	}, []);
	function addTodo(event) {
		event.preventDefault();
		if (!text.trim()) return;
		setTodos([...todos, {
			id: nextId++,
			text
		}]);
		setText("");
	}
	return /* @__PURE__ */ _jsxDEV("section", { children: [
		/* @__PURE__ */ _jsxDEV("h2", { children: "Todos" }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 34,
			columnNumber: 4
		}, this),
		/* @__PURE__ */ _jsxDEV("form", {
			onSubmit: addTodo,
			children: [/* @__PURE__ */ _jsxDEV("input", {
				value: text,
				onChange: (e) => setText(e.target.value),
				placeholder: "New todo"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 36,
				columnNumber: 5
			}, this), /* @__PURE__ */ _jsxDEV("button", { children: "Add" }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 37,
				columnNumber: 5
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 35,
			columnNumber: 4
		}, this),
		/* @__PURE__ */ _jsxDEV("ul", { children: todos.map((todo) => /* @__PURE__ */ _jsxDEV(TodoItem, {
			todo,
			onRemove: () => setTodos(todos.filter((t) => t.id !== todo.id))
		}, todo.id, false, {
			fileName: _jsxFileName,
			lineNumber: 41,
			columnNumber: 6
		}, this)) }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 39,
			columnNumber: 4
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 33,
		columnNumber: 3
	}, this);
}
_s(TodosPage, "ZoTZCJXp0KMJSBFVPrsa1cuglHA=");
_c = TodosPage;
function TodoItem({ todo, onRemove }) {
	_s2();
	log("render TodoItem", todo.id);
	const theme = useContext(ThemeContext);
	return /* @__PURE__ */ _jsxDEV("li", {
		className: theme,
		children: [
			todo.text,
			" ",
			/* @__PURE__ */ _jsxDEV("button", {
				onClick: onRemove,
				children: "×"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 57,
				columnNumber: 16
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 56,
		columnNumber: 3
	}, this);
}
_s2(TodoItem, "+C1P7ukOg/azcV4AZ819oyezFOE=");
_c2 = TodoItem;
var _c, _c2;
$RefreshReg$(_c, "TodosPage");
$RefreshReg$(_c2, "TodoItem");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/TodosPage.jsx";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("/project/src/TodosPage.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/project/src/TodosPage.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "/project/src/TodosPage.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

