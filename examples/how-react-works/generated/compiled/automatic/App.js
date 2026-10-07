import { useState } from "react";
import { ThemeContext } from "./ThemeContext.js";
import { Layout } from "./Layout.jsx";
import { Nav } from "./Nav.jsx";
import { CounterPage } from "./CounterPage.jsx";
import { TodosPage } from "./TodosPage.jsx";
import { log } from "./trace.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function App() {
  log("render App");
  const [page, setPage] = useState("counter");
  const [theme, setTheme] = useState("light");
  return /*#__PURE__*/_jsx(ThemeContext, {
    value: theme,
    children: /*#__PURE__*/_jsxs(Layout, {
      children: [/*#__PURE__*/_jsx(Nav, {
        page: page,
        onNavigate: setPage
      }), /*#__PURE__*/_jsxs("button", {
        className: "theme",
        onClick: () => setTheme(theme === "light" ? "dark" : "light"),
        children: ["Theme: ", theme]
      }), page === "counter" ? /*#__PURE__*/_jsx(CounterPage, {}) : /*#__PURE__*/_jsx(TodosPage, {})]
    })
  });
}
