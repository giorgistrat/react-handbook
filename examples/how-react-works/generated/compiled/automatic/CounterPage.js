import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { log } from './trace.js';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
  return /*#__PURE__*/_jsxs("section", {
    children: [/*#__PURE__*/_jsx("h2", {
      children: "Counter"
    }), /*#__PURE__*/_jsx(Display, {
      value: count
    }), /*#__PURE__*/_jsx("button", {
      ref: buttonRef,
      onClick: () => setCount(count + 1),
      children: "Add one"
    })]
  });
}
function Display({
  value
}) {
  log('render Display', value);
  return /*#__PURE__*/_jsxs("p", {
    className: "display",
    children: ["Count: ", value]
  });
}
