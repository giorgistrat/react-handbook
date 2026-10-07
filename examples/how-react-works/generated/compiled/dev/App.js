import { useState } from "react";
import { ThemeContext } from "./ThemeContext.js";
import { Layout } from "./Layout.jsx";
import { Nav } from "./Nav.jsx";
import { CounterPage } from "./CounterPage.jsx";
import { TodosPage } from "./TodosPage.jsx";
import { log } from "./trace.js";
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export function App() {
  log("render App");
  const [page, setPage] = useState("counter");
  const [theme, setTheme] = useState("light");
  return /*#__PURE__*/_jsxDEV(ThemeContext, {
    value: theme,
    children: /*#__PURE__*/_jsxDEV(Layout, {
      children: [/*#__PURE__*/_jsxDEV(Nav, {
        page: page,
        onNavigate: setPage
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        className: "theme",
        onClick: () => setTheme(theme === "light" ? "dark" : "light"),
        children: ["Theme: ", theme]
      }, void 0, true), page === "counter" ? /*#__PURE__*/_jsxDEV(CounterPage, {}, void 0, false) : /*#__PURE__*/_jsxDEV(TodosPage, {}, void 0, false)]
    }, void 0, true)
  }, void 0, false);
}
