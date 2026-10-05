import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { log } from './trace.js';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
  return /*#__PURE__*/_jsxs("section", {
    children: [/*#__PURE__*/_jsx("h2", {
      children: "Todos"
    }), /*#__PURE__*/_jsxs("form", {
      onSubmit: addTodo,
      children: [/*#__PURE__*/_jsx("input", {
        value: text,
        onChange: e => setText(e.target.value),
        placeholder: "New todo"
      }), /*#__PURE__*/_jsx("button", {
        children: "Add"
      })]
    }), /*#__PURE__*/_jsx("ul", {
      children: todos.map(todo => /*#__PURE__*/_jsx(TodoItem, {
        todo: todo,
        onRemove: () => setTodos(todos.filter(t => t.id !== todo.id))
      }, todo.id))
    })]
  });
}
function TodoItem({
  todo,
  onRemove
}) {
  log('render TodoItem', todo.id);
  const theme = useContext(ThemeContext);
  return /*#__PURE__*/_jsxs("li", {
    className: theme,
    children: [todo.text, " ", /*#__PURE__*/_jsx("button", {
      onClick: onRemove,
      children: "×"
    })]
  });
}
