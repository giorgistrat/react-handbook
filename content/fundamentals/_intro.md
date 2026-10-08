# React Fundamentals

React builds on a handful of plain ideas: DOM nodes, function calls that return objects, functions that return those objects, and the browser's own forms. This module peels them back one layer at a time, starting from a product card built by hand with the DOM and ending with lists that keep the right state on the right item. By the end, nothing in React's core API should feel like magic.

Every example comes from one small **product store** app (`examples/product-store` in the site's repository). The outputs you see (console logs, HTML, URLs, request bodies, warnings, TypeScript errors) were recorded by running it in Chrome, not written by hand.

> Read the notes in order: each one removes one layer of sugar. JSX → `createElement` → plain objects → DOM is the thread that runs through all of them.
