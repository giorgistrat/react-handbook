import { log } from './trace.js';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Nav({
  page,
  onNavigate
}) {
  log('render Nav', page);
  return /*#__PURE__*/_jsxs("nav", {
    children: [/*#__PURE__*/_jsx("button", {
      "aria-current": page === 'counter',
      onClick: () => onNavigate('counter'),
      children: "Counter"
    }), /*#__PURE__*/_jsx("button", {
      "aria-current": page === 'todos',
      onClick: () => onNavigate('todos'),
      children: "Todos"
    })]
  });
}
