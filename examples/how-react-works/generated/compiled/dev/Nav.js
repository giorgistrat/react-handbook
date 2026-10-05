import { log } from './trace.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export function Nav({
  page,
  onNavigate
}) {
  log('render Nav', page);
  return /*#__PURE__*/_jsxDEV("nav", {
    children: [/*#__PURE__*/_jsxDEV("button", {
      "aria-current": page === 'counter',
      onClick: () => onNavigate('counter'),
      children: "Counter"
    }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
      "aria-current": page === 'todos',
      onClick: () => onNavigate('todos'),
      children: "Todos"
    }, void 0, false)]
  }, void 0, true);
}
