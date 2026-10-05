import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { log } from './trace.js';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Layout({
  children
}) {
  log('render Layout');
  const theme = useContext(ThemeContext);
  return /*#__PURE__*/_jsxs("div", {
    className: `layout ${theme}`,
    children: [/*#__PURE__*/_jsx("h1", {
      children: "How React Works"
    }), /*#__PURE__*/_jsx("main", {
      children: children
    })]
  });
}
