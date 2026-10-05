import { log } from './trace.js';
export function Nav({
  page,
  onNavigate
}) {
  log('render Nav', page);
  return /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("button", {
    "aria-current": page === 'counter',
    onClick: () => onNavigate('counter')
  }, "Counter"), /*#__PURE__*/React.createElement("button", {
    "aria-current": page === 'todos',
    onClick: () => onNavigate('todos')
  }, "Todos"));
}
