import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/Layout.jsx");const useContext = __vite__cjsImport0_react["useContext"];const _jsxDEV = __vite__cjsImport3_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=8b2aef9b";
import { ThemeContext } from "/src/ThemeContext.js";
import { log } from "/src/trace.js";
var _jsxFileName = "/project/src/Layout.jsx";
import __vite__cjsImport3_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=8b2aef9b";
var _s = $RefreshSig$();
export function Layout({ children }) {
	_s();
	log("render Layout");
	const theme = useContext(ThemeContext);
	return /* @__PURE__ */ _jsxDEV("div", {
		className: `layout ${theme}`,
		children: [/* @__PURE__ */ _jsxDEV("h1", { children: "How React Works" }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 10,
			columnNumber: 4
		}, this), /* @__PURE__ */ _jsxDEV("main", { children }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 11,
			columnNumber: 4
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 9,
		columnNumber: 3
	}, this);
}
_s(Layout, "+C1P7ukOg/azcV4AZ819oyezFOE=");
_c = Layout;
var _c;
$RefreshReg$(_c, "Layout");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/Layout.jsx";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("/project/src/Layout.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/project/src/Layout.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "/project/src/Layout.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

