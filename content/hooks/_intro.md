# Hooks

A component function runs from the top on every render, so it can't remember anything by itself. Hooks are how it asks React to remember things (`useState`, `useReducer`, `useRef`), to do things after rendering (`useEffect`, `useLayoutEffect`) and to stay stable between renders (`useMemo`, `useCallback`, `useId`). This module builds them up on the product store: a search box, a back button, a cart badge, favorites, a zoom effect, review forms, a cart with undo, and a cart page that re-renders more than it should.

Every log, order of calls and "before/after" in these notes was recorded by running the product store in Chrome (`examples/product-store/src/lessons/hooks`).

> Two facts explain most hook behavior: **each render is a separate function call with its own values** (closures), and **React compares things with `Object.is`** (dependencies, memo props, state). Keep both in mind while reading.
