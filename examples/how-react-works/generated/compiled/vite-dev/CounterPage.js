import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/CounterPage.jsx");const useEffect = __vite__cjsImport0_react["useEffect"]; const useLayoutEffect = __vite__cjsImport0_react["useLayoutEffect"]; const useRef = __vite__cjsImport0_react["useRef"]; const useState = __vite__cjsImport0_react["useState"];const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=8b2aef9b";
import { log } from "/src/trace.js";
var _jsxFileName = "/project/src/CounterPage.jsx";
import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=8b2aef9b";
var _s = $RefreshSig$();
export function CounterPage() {
	_s();
	log("render CounterPage");
	const [count, setCount] = useState(0);
	const buttonRef = useRef(null);
	useLayoutEffect(() => {
		log("layout effect: button is", buttonRef.current.offsetWidth, "px wide");
	}, [count]);
	useEffect(() => {
		log("effect: set title", count);
		document.title = `Clicked ${count} times`;
		return () => log("cleanup: title effect", count);
	}, [count]);
	return /* @__PURE__ */ _jsxDEV("section", { children: [
		/* @__PURE__ */ _jsxDEV("h2", { children: "Counter" }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 21,
			columnNumber: 4
		}, this),
		/* @__PURE__ */ _jsxDEV(Display, { value: count }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 22,
			columnNumber: 4
		}, this),
		/* @__PURE__ */ _jsxDEV("button", {
			ref: buttonRef,
			onClick: () => setCount(count + 1),
			children: "Add one"
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 23,
			columnNumber: 4
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 20,
		columnNumber: 3
	}, this);
}
_s(CounterPage, "GUjjRySN0sAnsGJ9o8Yaj2OQXy4=");
_c = CounterPage;
function Display({ value }) {
	log("render Display", value);
	return /* @__PURE__ */ _jsxDEV("p", {
		className: "display",
		children: ["Count: ", value]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 32,
		columnNumber: 9
	}, this);
}
_c2 = Display;
var _c, _c2;
$RefreshReg$(_c, "CounterPage");
$RefreshReg$(_c2, "Display");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/CounterPage.jsx";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("/project/src/CounterPage.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/project/src/CounterPage.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "/project/src/CounterPage.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

