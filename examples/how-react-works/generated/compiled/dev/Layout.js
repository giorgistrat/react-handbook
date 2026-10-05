import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { log } from './trace.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export function Layout({
  children
}) {
  log('render Layout');
  const theme = useContext(ThemeContext);
  return /*#__PURE__*/_jsxDEV("div", {
    className: `layout ${theme}`,
    children: [/*#__PURE__*/_jsxDEV("h1", {
      children: "How React Works"
    }, void 0, false), /*#__PURE__*/_jsxDEV("main", {
      children: children
    }, void 0, false)]
  }, void 0, true);
}
