import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.jsx");const useState = __vite__cjsImport0_react["useState"];const _jsxDEV = __vite__cjsImport7_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=8b2aef9b";
import { ThemeContext } from "/src/ThemeContext.js";
import { Layout } from "/src/Layout.jsx";
import { Nav } from "/src/Nav.jsx";
import { CounterPage } from "/src/CounterPage.jsx";
import { TodosPage } from "/src/TodosPage.jsx";
import { log } from "/src/trace.js";
var _jsxFileName = "/project/src/App.jsx";
import __vite__cjsImport7_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=8b2aef9b";
var _s = $RefreshSig$();
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
				columnNumber: 9
			}, this),
			/* @__PURE__ */ _jsxDEV("button", {
				className: "theme",
				onClick: () => setTheme(theme === "light" ? "dark" : "light"),
				children: ["Theme: ", theme]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 18,
				columnNumber: 9
			}, this),
			page === "counter" ? /* @__PURE__ */ _jsxDEV(CounterPage, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 24,
				columnNumber: 31
			}, this) : /* @__PURE__ */ _jsxDEV(TodosPage, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 24,
				columnNumber: 49
			}, this)
		] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 16,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 15,
		columnNumber: 5
	}, this);
}
_s(App, "v0nJUZx8SPIAo1/KvGn0fdo7lX0=");
_c = App;
var _c;
$RefreshReg$(_c, "App");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/App.jsx";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("/project/src/App.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/project/src/App.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "/project/src/App.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

