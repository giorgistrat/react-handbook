---
source: https://react.dev/reference/react/useSyncExternalStore
---

# useSyncExternalStore

## In one minute

Some state lives **outside React**: the browser's online status, `localStorage`, a plain JavaScript store, a third-party library. `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` lets components read it and re-render when it changes:

- `subscribe(onChange)` connects to the store and returns an unsubscribe function.
- `getSnapshot()` returns the current value. When nothing changed, it must return **the same value**.
- `getServerSnapshot()` gives the value to use on the server and during hydration.

It's safer than `useEffect` + `useState`, because React can check the store during rendering and never show two different versions at once ("tearing"). State libraries like Redux and Zustand are built on it.

**You'll be able to:** subscribe to a browser API and to your own store, and avoid the two classic mistakes: an unstable snapshot and a missing server snapshot.

<!-- figure name="externalStoreAnim" -->

## The example

### 1. Online status

<!-- source file="src/lessons/apis/07-external-store.tsx" region="online" -->

`subscribe` is defined outside the component, so it's the same function every render, and React doesn't resubscribe. Recorded while Chrome was switched offline and back:

<!-- output from="apis" path="store.online" as="json" -->

### 2. A cart store shared by two React roots

Some pages have more than one React root: say, an older header and a new product page. They can't share React state or context, but they can share a store.

<!-- source file="src/lessons/apis/07-external-store.tsx" region="store" -->

<!-- source file="src/lessons/apis/07-external-store.tsx" region="roots" -->

Clicking "Add to cart" in the product page:

<!-- output from="apis" path="store.twoRoots.add" as="log" -->

Both roots re-rendered. The header badge now shows `🛒 1`.

### 3. Mistake: a new snapshot on every call

<!-- source file="src/lessons/apis/07-external-store.tsx" region="newObject" -->

Recorded:

<!-- output from="apis" path="store.newObject.warnings" as="log" -->

<!-- output from="apis" path="store.newObject.logs" as="log" -->

Every call returns a new object, so to React the store looks like it changes on every render, which schedules another render, and so on. The store above avoids this by creating a new state object only in `add()`.

### 4. Mistake: no server snapshot

<!-- source file="src/lessons/apis/07-external-store.tsx" region="noServer" -->

Rendering both buttons with `renderToString`, as a server would:

<!-- source file="src/lessons/apis/07-external-store.tsx" region="server" -->

<!-- output from="apis" path="store.server.logs" as="log" -->

The server has no `navigator.onLine`. With `getServerSnapshot`, it renders "Place order", and the client updates after hydration if the real value is different. Without it, server rendering fails, and React falls back to rendering that part on the client.

## How it works

- **Subscribe once, read on every render.** React calls `subscribe` after mounting (and again only if you pass a different `subscribe` function). On every render it calls `getSnapshot` and compares the result with the last one using `Object.is`.
- **Changes come from the store.** When the store calls the listener, React calls `getSnapshot` again. If the snapshot changed, it re-renders that component. Updates from external stores are rendered synchronously, never as a background transition, so the screen can't show a mix of old and new store values.
- **The snapshot must be immutable and cached.** Return the store's own value, and replace it with a new object only when something changes. In development, React calls `getSnapshot` twice and warns if the results differ (recorded).
- **Select small values.** `useCartCount()` returns `count`, a number, so components re-render only when the number changes. For derived objects, memoize them in the store, or use a library's selector API.

## Common mistakes

- **Building a new object or array in `getSnapshot`**: `() => ({ ...state })`, `() => items.filter(…)`. This causes an infinite loop (recorded).
- **Defining `subscribe` inside the component** without `useCallback`: React unsubscribes and resubscribes on every render.
- **Leaving out `getServerSnapshot` in server-rendered apps** (recorded error).
- **Using it for state React could own.** If the state is only used by your components, `useState`, `useReducer` or context is simpler.

## Interview Q&A

**Q: What problem does `useSyncExternalStore` solve?**
A: Reading state that lives outside React and re-rendering when it changes, without tearing during concurrent rendering. A hand-rolled `useEffect` + `useState` subscription can miss updates between render and subscribe, and can show inconsistent values.

**Q: What are its arguments?**
A: `subscribe(callback)` registers a listener and returns an unsubscribe function, and should be stable. `getSnapshot()` returns the current value and must return the same value when nothing changed. `getServerSnapshot()` is optional; it supplies the value for server rendering and hydration.

**Q: What happens if `getSnapshot` returns a new object every call?**
A: React sees a change on every render and loops. Recorded: the warning "The result of getSnapshot should be cached to avoid an infinite loop", then "Maximum update depth exceeded".

**Q: Why does `getServerSnapshot` matter?**
A: There's no browser store on the server, and the first client render must match the server HTML. Recorded: without it, `renderToString` threw "Missing getServerSnapshot, which is required for server-rendered content."

**Q: Do you usually call it directly?**
A: Not often. Redux, Zustand and similar libraries call it inside their hooks. Calling it directly is reasonable for browser APIs (online status, media queries, `localStorage`) and small app-specific stores. Recorded: one store kept two separate React roots in sync.

## Related

- [[Context with use]]: shared state inside React.
- [[Side Effects]]: why subscriptions need cleanup.
- [[Scheduler, Lanes and Batching]]: why store updates are rendered synchronously.

## Sources

- react.dev: [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), [Subscribing to an external store](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)
- The `useSyncExternalStore` working-group discussion: [What is tearing?](https://github.com/reactwg/react-18/discussions/69)
- Topic order inspired by Kent C. Dodds' EpicReact *Advanced React APIs* workshop; the example app and code here are this handbook's own.
