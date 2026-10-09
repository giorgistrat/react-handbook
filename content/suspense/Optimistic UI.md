---
source: https://react.dev/reference/react/useOptimistic
---

# Optimistic UI

## In one minute

**Optimistic UI** shows the result of an action before the server confirms it: the review appears in the list the moment you post it, marked "sending…". A `<form action={fn}>` runs `fn` inside a **transition**, and React holds back ordinary state updates made during a transition until it ends, so `useState` can't do this. `useOptimistic` can: its value may change *during* the action, and when the action ends it falls back to the real state, which also gives you **rollback** for free if the request failed. `useFormStatus` lets a button inside the form know the form is submitting. One React 19 catch: a state update after an `await` isn't part of the action any more; wrap it in `startTransition`.

**You'll be able to:** post a form with an optimistic result, show its pending state, roll back on failure, and avoid the after-`await` duplicate.

<!-- figure name="optimisticAnim" -->

## The example: posting a review

Posting a review takes the server 800 ms. Each recording types "Great lamp!" and clicks "Post review".

### The submit button: useFormStatus

<!-- source file="src/lessons/suspense/03-optimistic.tsx" region="submit" -->

`useFormStatus` reads the status of the `<form>` the component is rendered **inside** (it must be a child of the form, so the button is its own component). It also gives you the submitted `data`, `method` and `action`.

### 1. Plain state

<!-- source file="src/lessons/suspense/03-optimistic.tsx" region="state" -->

<!-- output from="suspense" path="optimistic.state.afterSubmit" as="log" -->

The button said "Posting…" right away, but the review only appeared when the server answered, 800 ms later. The `setReviews` before the `await` was part of the action's transition, so React held it back.

### 2. useOptimistic

<!-- source file="src/lessons/suspense/03-optimistic.tsx" region="optimistic" -->

<!-- output from="suspense" path="optimistic.optimistic.afterSubmit" as="log" -->

The review appeared immediately, marked "(sending…)". But when the server answered, the list briefly showed it **twice**: the saved review and the optimistic one. The `setReviews` after the `await` ran as a separate update while the action's optimistic state was still alive. Wrapping it in `startTransition` makes it part of the action again:

<!-- source file="src/lessons/suspense/03-optimistic.tsx" region="fixed" -->

<!-- output from="suspense" path="optimistic.fixed.afterSubmit" as="log" -->

One step from "sending…" to saved.

### 3. When the server fails

<!-- output from="suspense" path="optimistic.fail.afterSubmit" as="log" -->

The optimistic review disappeared on its own when the action ended: the optimistic value fell back to the real list, which never got the review. Show an error message too, so the shopper knows why.

### 4. Several steps in one action

<!-- source file="src/lessons/suspense/03-optimistic.tsx" region="steps" -->

<!-- output from="suspense" path="optimistic.steps.afterSubmit" as="log" -->

An optimistic value can change as often as you like during the action, then falls back to "Place order" when it ends.

## How it works

- **Actions are transitions.** A function passed to `<form action>` (or called inside `startTransition`) runs as a transition: its state updates render together when it completes.
- **`useOptimistic(value, reducer?)`** returns `[optimisticValue, setOptimistic]`. Outside an action, `optimisticValue` is just `value`. During one, `setOptimistic` overrides it; when the action ends, it's `value` again, whatever happened.
- **After an `await`, React 19 loses track** of which action an update belongs to (async context isn't preserved yet), so updates after the `await` need their own `startTransition`. React's docs note this limitation.

## Common mistakes

- **`useState` for optimistic results** inside an action (recorded: nothing until the server answered).
- **Updating real state after `await` without `startTransition`** (recorded: a duplicate review).
- **`useFormStatus` in the component that renders the `<form>`.** It only sees forms *above* it.
- **No error message on failure.** The rollback is silent.

## Interview Q&A

**Q: What is optimistic UI?**
A: Showing the expected result of an action immediately, before the server confirms it, and correcting it if the server disagrees.

**Q: Why doesn't `useState` work for it inside a form action?**
A: Form actions run in a transition, and React holds state updates in a transition until it finishes. Recorded: the review appeared only after the 800 ms request.

**Q: How does `useOptimistic` work?**
A: It returns a value that can be updated during an action and falls back to the real state when the action ends. Recorded: the review showed "(sending…)" immediately.

**Q: How do you get rollback on failure?**
A: Do nothing special: when the action ends, the optimistic value reverts to the real state, which didn't change. Recorded: after a server error the optimistic review disappeared.

**Q: Why did the review appear twice for a moment?**
A: The `setReviews` after `await` wasn't part of the action's transition in React 19, so it rendered while the optimistic copy still existed. Wrapping it in `startTransition` fixed it (recorded).

**Q: What does `useFormStatus` give you?**
A: `{ pending, data, method, action }` for the form the component is inside, without passing props. It must be called from a child of the `<form>`.

## Related

- [[Forms]]: form actions and `FormData`.
- [[Promise Caching and Transitions]]: transitions and `isPending`.

## Sources

- react.dev: [`useOptimistic`](https://react.dev/reference/react/useOptimistic), [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus), [`useTransition` (state updates after `await`)](https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
