import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';
import { jsx as _jsx } from "react/jsx-runtime";
const container = document.getElementById('root');
const root = createRoot(container);
root.render(/*#__PURE__*/_jsx(App, {}));
