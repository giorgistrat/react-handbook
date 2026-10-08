# Advanced React APIs

These are the APIs you don't reach for every day. Each one exists because React's default model sometimes isn't enough:

- `useReducer` puts scattered updates into one pure function.
- Context skips prop drilling.
- `createPortal` escapes the DOM structure without leaving the React tree.
- `useLayoutEffect` and `flushSync` deal with "the DOM hasn't caught up yet".
- `useImperativeHandle` turns a ref into a small command API.
- `useSyncExternalStore` reads state React doesn't own.

The examples are all part of the product store: a cart reducer, a theme and cart context, a "Quick view" dialog, a shipping tooltip, a coupon field, a wishlist, and a cart store shared by two React roots. Every log, render list and painted frame was recorded by running the store in Chrome (`examples/product-store/src/lessons/apis`).

> Reaching for one of these is a sign you've hit a real boundary. Two of them pair up: **`useLayoutEffect`** reads the DOM before paint, and **`flushSync`** writes it before your next line of code.
