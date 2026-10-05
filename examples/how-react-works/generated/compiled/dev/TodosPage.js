import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { log } from './trace.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
let nextId = 3;
export function TodosPage() {
  log('render TodosPage');
  const [todos, setTodos] = useState([{
    id: 1,
    text: 'Learn JSX'
  }, {
    id: 2,
    text: 'Read about fibers'
  }]);
  const [text, setText] = useState('');
  useEffect(() => {
    log('effect: subscribe to resize');
    const onResize = () => log('window resized');
    window.addEventListener('resize', onResize);
    return () => {
      log('cleanup: unsubscribe from resize');
      window.removeEventListener('resize', onResize);
    };
  }, []);
  function addTodo(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setTodos([...todos, {
      id: nextId++,
      text
    }]);
    setText('');
  }
  return /*#__PURE__*/_jsxDEV("section", {
    children: [/*#__PURE__*/_jsxDEV("h2", {
      children: "Todos"
    }, void 0, false), /*#__PURE__*/_jsxDEV("form", {
      onSubmit: addTodo,
      children: [/*#__PURE__*/_jsxDEV("input", {
        value: text,
        onChange: e => setText(e.target.value),
        placeholder: "New todo"
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        children: "Add"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("ul", {
      children: todos.map(todo => /*#__PURE__*/_jsxDEV(TodoItem, {
        todo: todo,
        onRemove: () => setTodos(todos.filter(t => t.id !== todo.id))
      }, todo.id, false))
    }, void 0, false)]
  }, void 0, true);
}
function TodoItem({
  todo,
  onRemove
}) {
  log('render TodoItem', todo.id);
  const theme = useContext(ThemeContext);
  return /*#__PURE__*/_jsxDEV("li", {
    className: theme,
    children: [todo.text, " ", /*#__PURE__*/_jsxDEV("button", {
      onClick: onRemove,
      children: "×"
    }, void 0, false)]
  }, void 0, true);
}
