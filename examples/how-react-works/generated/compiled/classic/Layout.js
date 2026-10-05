import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { log } from './trace.js';
export function Layout({
  children
}) {
  log('render Layout');
  const theme = useContext(ThemeContext);
  return /*#__PURE__*/React.createElement("div", {
    className: `layout ${theme}`
  }, /*#__PURE__*/React.createElement("h1", null, "How React Works"), /*#__PURE__*/React.createElement("main", null, children));
}
