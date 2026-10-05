import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { log } from './trace.js';
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
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", null, "Counter"), /*#__PURE__*/React.createElement(Display, {
    value: count
  }), /*#__PURE__*/React.createElement("button", {
    ref: buttonRef,
    onClick: () => setCount(count + 1)
  }, "Add one"));
}
function Display({
  value
}) {
  log('render Display', value);
  return /*#__PURE__*/React.createElement("p", {
    className: "display"
  }, "Count: ", value);
}
