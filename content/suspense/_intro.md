# React Suspense

Suspense lets a component **wait for something** (data, code, an image) while React shows a fallback, written as if the data were already there. The core is one line: `const product = use(productPromise)`. If the promise is pending, React stops rendering that component and shows the nearest `<Suspense fallback>`. If it rejects, the nearest error boundary takes over. When it fulfills, React renders again and `use` returns the value.

The rest of this module is about doing that well:

- **Caching promises:** every render must see the same promise.
- **Transitions:** keep the current page instead of a fallback.
- **Optimistic UI:** show the result before the server confirms it.
- **Suspending on images:** new data shouldn't sit next to an old picture.
- **`useDeferredValue`:** keep a search box responsive.
- **Waterfalls and caching:** start requests together, and let the HTTP cache help.

The examples use the product store with a fake API whose requests log when they start and finish, so every timeline here (milliseconds since the click, rounded to 50) was recorded in Chrome (`examples/product-store/src/lessons/suspense`).

> Suspense for data works with any promise, but in a real app the promises usually come from a framework or a data library (Next.js, React Router, TanStack Query, Relay) that handles caching and invalidation for you. This module shows what they do underneath.
