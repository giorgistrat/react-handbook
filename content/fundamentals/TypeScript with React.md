---
source: https://react.dev/learn/typescript
---

# TypeScript with React

## In one minute

A component is a function, so typing it is typing a function's parameter: describe the props object. React adds only a few types of its own (`ReactNode`, `ComponentProps<'span'>`, event types). The rest is everyday TypeScript, and a few techniques make it much stronger: literal unions instead of `string`, deriving types from values with `typeof`/`keyof`, and `satisfies` to check an object without losing its exact keys.

**You'll be able to:** type a component's props, keep one source of truth for allowed values, and read the errors `tsc` gives you.

<!-- figure name="deriveTypeAnim" -->

## The example: a `Price` that knows its currencies

<!-- source file="src/lessons/fundamentals/05-typescript.tsx" region="formatters" -->

<!-- source file="src/lessons/fundamentals/05-typescript.tsx" region="price" -->

Three mistakes the compiler catches (the lesson's `05-typescript.bad.tsx`):

<!-- source file="src/lessons/fundamentals/05-typescript.bad.tsx" -->

What `tsc --noEmit` reported:

<!-- output from="fundamentals" path="typescript.tscErrors" as="log" -->

None of these would have failed loudly at runtime: `"89.00" / 100` quietly becomes `0.89`, and `formatters["JPY"]` is `undefined`, which crashes only when that price is shown.

## How it works

- **Type the parameter, not the function.** `function Price({ cents, currency = 'USD' }: PriceProps)`. Prefer this to `React.FC<PriceProps>`, which historically added a `children` prop you didn't ask for and makes generic components awkward.
- **Literal unions beat `string`.** `'USD' | 'EUR' | 'GBP'` rejects typos and gives autocomplete.
- **Derive instead of repeating.** `typeof formatters` reads the object's type; `keyof` takes its keys. Add a currency to the object, and `Currency` updates itself.
- **`satisfies` checks without widening.** `const formatters: Record<string, Formatter> = …` would widen the keys to `string` (so `keyof` gives `string`). `satisfies Record<string, Formatter>` checks every value but keeps the exact keys.
- **Optional + default.** `currency?: Currency` lets callers omit it; the destructuring default `= 'USD'` means the function body sees a `Currency`, never `undefined`.
- **Wrapping a native element:** `ComponentProps<'span'>` gives every prop a `<span>` accepts. [[Styling]] uses it for a `Tag` component. In React 19, `ref` is a regular prop for function components, so it's included and simply forwarded when you spread `...rest`.

## Common mistakes

- `operator: string` / `currency: string` when only a few values are valid.
- Writing the allowed values twice (a union **and** an object) and letting them drift apart.
- Annotating with `: Record<…>` when you need the exact keys later; use `satisfies`.
- Marking a prop optional but forgetting the default, then handling `undefined` everywhere.

## Interview Q&A

**Q: Should you type components with `React.FC`?**
A: Usually not. Type the props parameter directly: it covers everything `React.FC` does, works naturally for generic components (`function List<T>(props: ListProps<T>)`), and doesn't imply props you didn't declare.

**Q: Why a union of string literals instead of `string`?**
A: `string` accepts any value, including ones nothing handles. A union like `'USD' | 'EUR' | 'GBP'` turns a runtime bug into a compile error: the recorded `tsc` output rejects `currency="JPY"` with TS2322.

**Q: What do `typeof` and `keyof` do when combined?**
A: In a type position, `typeof formatters` gives the type of the runtime value; `keyof` then gives the union of its keys. `keyof typeof formatters` is `'USD' | 'EUR' | 'GBP'`, derived from the object so there's one source of truth.

**Q: What does `satisfies` give you that an annotation doesn't?**
A: An annotation (`const x: T = …`) makes the variable's type exactly `T`, losing detail such as the exact keys. `satisfies T` checks the value against `T` but keeps the value's own inferred type, so `keyof typeof formatters` still lists the three currencies.

**Q: How do you type a component that wraps a native element?**
A: Intersect the element's props with your own: `ComponentProps<'span'> & { tone?: Tone }`, destructure what you use, and spread the rest onto the element.

## Related

- [[Custom Components]]: what you're typing.
- [[Styling]]: `ComponentProps<'span'>` in practice.

## Sources

- react.dev: [Using TypeScript](https://react.dev/learn/typescript)
- TypeScript handbook: [Literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), [`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html), [`typeof`](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html), [`satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
