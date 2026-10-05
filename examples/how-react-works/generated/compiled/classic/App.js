import { useState } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { Layout } from './Layout.jsx';
import { Nav } from './Nav.jsx';
import { CounterPage } from './CounterPage.jsx';
import { TodosPage } from './TodosPage.jsx';
import { log } from './trace.js';
export function App() {
  log('render App');
  const [page, setPage] = useState('counter');
  const [theme, setTheme] = useState('light');
  return /*#__PURE__*/React.createElement(ThemeContext, {
    value: theme
  }, /*#__PURE__*/React.createElement(Layout, null, /*#__PURE__*/React.createElement(Nav, {
    page: page,
    onNavigate: setPage
  }), /*#__PURE__*/React.createElement("button", {
    className: "theme",
    onClick: () => setTheme(theme === 'light' ? 'dark' : 'light')
  }, "Theme: ", theme), page === 'counter' ? /*#__PURE__*/React.createElement(CounterPage, null) : /*#__PURE__*/React.createElement(TodosPage, null)));
}
