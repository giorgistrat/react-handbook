import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { log } from './trace.js';
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
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", null, "Todos"), /*#__PURE__*/React.createElement("form", {
    onSubmit: addTodo
  }, /*#__PURE__*/React.createElement("input", {
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "New todo"
  }), /*#__PURE__*/React.createElement("button", null, "Add")), /*#__PURE__*/React.createElement("ul", null, todos.map(todo => /*#__PURE__*/React.createElement(TodoItem, {
    key: todo.id,
    todo: todo,
    onRemove: () => setTodos(todos.filter(t => t.id !== todo.id))
  }))));
}
function TodoItem({
  todo,
  onRemove
}) {
  log('render TodoItem', todo.id);
  const theme = useContext(ThemeContext);
  return /*#__PURE__*/React.createElement("li", {
    className: theme
  }, todo.text, " ", /*#__PURE__*/React.createElement("button", {
    onClick: onRemove
  }, "×"));
}
