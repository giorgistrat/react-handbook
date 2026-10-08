---
title: "TypeScript with React"
slug: "typescript-with-react"
module: "fundamentals"
order: 4
level: "good"
illus: "map"
summary: "Typing props like any function: literal unions, deriving types with typeof/keyof, satisfies, and the errors tsc reports."
source: "https://react.dev/learn/typescript"
---


## In one minute

A component is a function, so typing it is typing a function's parameter: describe the props object. React adds only a few types of its own (`ReactNode`, `ComponentProps<'span'>`, event types). The rest is everyday TypeScript, and a few techniques make it much stronger: literal unions instead of `string`, deriving types from values with `typeof`/`keyof`, and `satisfies` to check an object without losing its exact keys.

**You'll be able to:** type a component's props, keep one source of truth for allowed values, and read the errors `tsc` gives you.

<figure class="fig anim fig-fund-types-anim" data-anim data-pagefind-ignore><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;satisfies Record&lt;string, Formatter&gt;&quot;,&quot;say&quot;:&quot;&lt;code&gt;satisfies&lt;/code&gt; checks every value is a &lt;code&gt;(cents: number) =&gt; string&lt;/code&gt; but does &lt;b&gt;not&lt;/b&gt; widen the object: its keys stay exactly &lt;code&gt;USD&lt;/code&gt;, &lt;code&gt;EUR&lt;/code&gt;, &lt;code&gt;GBP&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;obj&quot;:&quot;hl&quot;,&quot;sat&quot;:&quot;cmp&quot;}},{&quot;fn&quot;:&quot;typeof formatters&quot;,&quot;say&quot;:&quot;&lt;code&gt;typeof&lt;/code&gt; (in a type position) turns the &lt;b&gt;value&lt;/b&gt; into its type.&quot;,&quot;set&quot;:{&quot;sat&quot;:&quot;&quot;,&quot;t1&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;keyof typeof formatters&quot;,&quot;say&quot;:&quot;&lt;code&gt;keyof&lt;/code&gt; takes that type’s keys as a union. Add a currency to the object and the type follows.&quot;,&quot;set&quot;:{&quot;t2&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;type PriceProps = { cents: number; currency?: Currency }&quot;,&quot;say&quot;:&quot;The props use the derived union.&quot;,&quot;set&quot;:{&quot;obj&quot;:&quot;&quot;,&quot;t3&quot;:&quot;new&quot;}},{&quot;fn&quot;:&quot;tsc --noEmit&quot;,&quot;say&quot;:&quot;Three mistakes, three compile errors, before any code runs (recorded output below).&quot;,&quot;set&quot;:{&quot;e1&quot;:&quot;bad&quot;,&quot;e2&quot;:&quot;bad&quot;,&quot;e3&quot;:&quot;bad&quot;}}]" data-intro="From the &lt;code&gt;formatters&lt;/code&gt; object to a checked &lt;code&gt;Price&lt;/code&gt; component."><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">value (runs in the browser)</div><div class="a-col"><div class="an call" data-k="obj"><code>const formatters = { USD: …, EUR: …, GBP: … }</code></div><div class="an call" data-k="sat" data-s="faint"><code>satisfies Record&lt;string, Formatter&gt;</code></div></div></div><div class="a-panel "><div class="a-panel-title">types (erased before running)</div><div class="a-col"><span class="an chip-a" data-k="t1" data-s="ghost">typeof formatters → { USD: (c) => string; EUR: …; GBP: … }</span><span class="an chip-a" data-k="t2" data-s="ghost">keyof … → "USD" | "EUR" | "GBP"</span><span class="an chip-a" data-k="t3" data-s="ghost">PriceProps.currency?: Currency</span></div></div><div class="a-panel "><div class="a-panel-title">tsc on the mistakes file</div><div class="a-col"><span class="an chip-a" data-k="e1" data-s="ghost">&lt;Price cents="89.00" /&gt; → TS2322</span><span class="an chip-a" data-k="e2" data-s="ghost">&lt;Price currency="JPY" /&gt; → TS2322</span><span class="an chip-a" data-k="e3" data-s="ghost">&lt;Price currency="EUR" /&gt; → TS2741</span></div></div></div></div><ol class="anim-print"><li><code>satisfies Record&lt;string, Formatter&gt;</code><span><code>satisfies</code> checks every value is a <code>(cents: number) => string</code> but does <b>not</b> widen the object: its keys stay exactly <code>USD</code>, <code>EUR</code>, <code>GBP</code>.</span></li><li><code>typeof formatters</code><span><code>typeof</code> (in a type position) turns the <b>value</b> into its type.</span></li><li><code>keyof typeof formatters</code><span><code>keyof</code> takes that type’s keys as a union. Add a currency to the object and the type follows.</span></li><li><code>type PriceProps = { cents: number; currency?: Currency }</code><span>The props use the derived union.</span></li><li><code>tsc --noEmit</code><span>Three mistakes, three compile errors, before any code runs (recorded output below).</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="cmp"></i>being compared</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>One source of truth: the object defines the allowed currencies, the types follow.</figcaption></figure>

## The example: a `Price` that knows its currencies

```tsx
type Formatter = (cents: number) => string

const formatters = {
	USD: (cents: number) => `$${(cents / 100).toFixed(2)}`,
	EUR: (cents: number) => `€${(cents / 100).toFixed(2)}`,
	GBP: (cents: number) => `£${(cents / 100).toFixed(2)}`,
} satisfies Record<string, Formatter>

export type Currency = keyof typeof formatters // 'USD' | 'EUR' | 'GBP'
```

```tsx
type PriceProps = {
	cents: number
	currency?: Currency
}

export function Price({ cents, currency = 'USD' }: PriceProps) {
	return <p className="price">{formatters[currency](cents)}</p>
}
```

Three mistakes the compiler catches (the lesson's `05-typescript.bad.tsx`):

```tsx
// Mistakes TypeScript catches before the code runs (not part of the app build).
import { Price } from './05-typescript'

export const examples = (
	<>
		<Price cents="89.00" />
		<Price cents={8900} currency="JPY" />
		<Price currency="EUR" />
	</>
)
```

What `tsc --noEmit` reported:

```text
05-typescript.bad.tsx(6,10): error TS2322: Type 'string' is not assignable to type 'number'.
05-typescript.bad.tsx(7,23): error TS2322: Type '"JPY"' is not assignable to type '"USD" | "EUR" | "GBP" | undefined'.
05-typescript.bad.tsx(8,4): error TS2741: Property 'cents' is missing in type '{ currency: "EUR"; }' but required in type 'PriceProps'.
```

None of these would have failed loudly at runtime: `"89.00" / 100` quietly becomes `0.89`, and `formatters["JPY"]` is `undefined`, which crashes only when that price is shown.

## How it works

- **Type the parameter, not the function.** `function Price({ cents, currency = 'USD' }: PriceProps)`. Prefer this to `React.FC<PriceProps>`, which historically added a `children` prop you didn't ask for and makes generic components awkward.
- **Literal unions beat `string`.** `'USD' | 'EUR' | 'GBP'` rejects typos and gives autocomplete.
- **Derive instead of repeating.** `typeof formatters` reads the object's type; `keyof` takes its keys. Add a currency to the object, and `Currency` updates itself.
- **`satisfies` checks without widening.** `const formatters: Record<string, Formatter> = …` would widen the keys to `string` (so `keyof` gives `string`). `satisfies Record<string, Formatter>` checks every value but keeps the exact keys.
- **Optional + default.** `currency?: Currency` lets callers omit it; the destructuring default `= 'USD'` means the function body sees a `Currency`, never `undefined`.
- **Wrapping a native element:** `ComponentProps<'span'>` gives every prop a `<span>` accepts. [Styling](../../fundamentals/styling/) uses it for a `Tag` component. In React 19, `ref` is a regular prop for function components, so it's included and simply forwarded when you spread `...rest`.

## Common mistakes

- `operator: string` / `currency: string` when only a few values are valid.
- Writing the allowed values twice (a union **and** an object) and letting them drift apart.
- Annotating with `: Record<…>` when you need the exact keys later; use `satisfies`.
- Marking a prop optional but forgetting the default, then handling `undefined` everywhere.

## Interview Q&A

<details class="qa"><summary>Should you type components with <code>React.FC</code>?</summary>

Usually not. Type the props parameter directly: it covers everything `React.FC` does, works naturally for generic components (`function List<T>(props: ListProps<T>)`), and doesn't imply props you didn't declare.

</details>

<details class="qa"><summary>Why a union of string literals instead of <code>string</code>?</summary>

`string` accepts any value, including ones nothing handles. A union like `'USD' | 'EUR' | 'GBP'` turns a runtime bug into a compile error: the recorded `tsc` output rejects `currency="JPY"` with TS2322.

</details>

<details class="qa"><summary>What do <code>typeof</code> and <code>keyof</code> do when combined?</summary>

In a type position, `typeof formatters` gives the type of the runtime value; `keyof` then gives the union of its keys. `keyof typeof formatters` is `'USD' | 'EUR' | 'GBP'`, derived from the object so there's one source of truth.

</details>

<details class="qa"><summary>What does <code>satisfies</code> give you that an annotation doesn't?</summary>

An annotation (`const x: T = …`) makes the variable's type exactly `T`, losing detail such as the exact keys. `satisfies T` checks the value against `T` but keeps the value's own inferred type, so `keyof typeof formatters` still lists the three currencies.

</details>

<details class="qa"><summary>How do you type a component that wraps a native element?</summary>

Intersect the element's props with your own: `ComponentProps<'span'> & { tone?: Tone }`, destructure what you use, and spread the rest onto the element.

</details>

## Related

- [Custom Components](../../fundamentals/custom-components/): what you're typing.
- [Styling](../../fundamentals/styling/): `ComponentProps<'span'>` in practice.

## Sources

- react.dev: [Using TypeScript](https://react.dev/learn/typescript)
- TypeScript handbook: [Literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types), [`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html), [`typeof`](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html), [`satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
