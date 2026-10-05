import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { log } from './trace.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export function CounterPage() {
  log('render CounterPage');
  const [count, setCount] = useState(0);
  const buttonRef = useRef(null);
  useLayoutEffect(() => {
    log('layout effect: button is', buttonRef.current.offsetWidth, 'px wide');
  }, [count]);
  useEffect(() => {
    log('effect: set title', count);
    document.title = `Clicked ${count} times`;
    return () => log('cleanup: title effect', count);
  }, [count]);
  return /*#__PURE__*/_jsxDEV("section", {
    children: [/*#__PURE__*/_jsxDEV("h2", {
      children: "Counter"
    }, void 0, false), /*#__PURE__*/_jsxDEV(Display, {
      value: count
    }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
      ref: buttonRef,
      onClick: () => setCount(count + 1),
      children: "Add one"
    }, void 0, false)]
  }, void 0, true);
}
function Display({
  value
}) {
  log('render Display', value);
  return /*#__PURE__*/_jsxDEV("p", {
    className: "display",
    children: ["Count: ", value]
  }, void 0, true);
}
