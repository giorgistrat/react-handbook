---
title: "Styling"
slug: "styling"
module: "fundamentals"
order: 5
level: "good"
illus: "eye"
summary: "className vs style objects, a Tag component that wraps a span, and why the order of a spread decides who wins."
source: "https://react.dev/reference/react-dom/components/common#applying-css-styles"
---


## In one minute

React has two built-in ways to style: `className` (CSS classes, the usual choice) and `style` (inline styles as a **JavaScript object**, camelCased: `backgroundColor`, `marginLeft`). Numbers get `px` for you. The pattern worth knowing is a small component that wraps a native element, offers a typed prop like `tone="sale"` instead of raw class names, and still lets callers add their own `className` and `style`.

**You'll be able to:** write such a wrapper, and decide who wins when defaults and caller styles collide.

## The example: a `Tag` for product labels

```tsx
type Tone = 'sale' | 'new' | 'soldout'

function Tag({ tone, className, style, ...rest }: ComponentProps<'span'> & { tone?: Tone }) {
	return (
		<span
			className={['tag', tone && `tag--${tone}`, className].filter(Boolean).join(' ')}
			style={{ fontWeight: 600, ...style }}
			{...rest}
		/>
	)
}
```

Used like this:

```tsx
<Tag tone="sale">-20%</Tag>
<Tag tone="soldout" className="muted" style={{ fontWeight: 400, marginLeft: 8 }} title="Back soon">
	Sold out
</Tag>
```

The HTML React produced (recorded):

```text
<span class="tag tag--sale" style="font-weight: 600;">-20%</span>
<span class="tag tag--soldout muted" title="Back soon" style="font-weight: 400; margin-left: 8px;">Sold out</span>
```

## How it works

- **`style` is an object.** `style={{ fontWeight: 600 }}` isn't special syntax: the outer braces start a JSX expression, the inner ones are an object literal. `marginLeft: 8` became `margin-left: 8px`.
- **A typed `tone` hides class names.** Callers write `tone="sale"`; only `Tag` knows the class is `tag--sale`. You can rename classes without touching callers, and they get autocomplete.
- **`className` is merged, not replaced.** The array/`filter(Boolean)`/`join(' ')` line combines the base class, the tone class and the caller's class. The tiny [`clsx`](https://github.com/lukeed/clsx) library does the same: ``clsx('tag', tone && `tag--${tone}`, className)``.
- **`...rest` passes everything else through:** `title`, `children`, event handlers, `aria-*`. That's why `title="Back soon"` reached the `<span>`.

## Who wins: order of the spread

<figure class="fig anim fig-fund-merge-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">{ fontWeight: 600, ...style }</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">{ ...style, fontWeight: 600 }</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;fn&quot;:&quot;fontWeight: 600&quot;,&quot;say&quot;:&quot;The component’s default is written first.&quot;,&quot;set&quot;:{&quot;lit&quot;:&quot;hl&quot;,&quot;fw&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;fw&quot;:&quot;fontWeight: 600 (default)&quot;}},{&quot;fn&quot;:&quot;...style  // { fontWeight: 400, marginLeft: 8 }&quot;,&quot;say&quot;:&quot;The caller’s keys are copied after it. Same key → the &lt;b&gt;later&lt;/b&gt; one replaces it.&quot;,&quot;set&quot;:{&quot;fw&quot;:&quot;upd&quot;,&quot;ml&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;fw&quot;:&quot;fontWeight: 400 (caller)&quot;,&quot;ml&quot;:&quot;marginLeft: 8 (caller)&quot;}},{&quot;fn&quot;:&quot;result&quot;,&quot;say&quot;:&quot;The caller can override the default. Recorded HTML: &lt;code&gt;style=\&quot;font-weight: 400; margin-left: 8px;\&quot;&lt;/code&gt;.&quot;,&quot;set&quot;:{&quot;lit&quot;:&quot;&quot;,&quot;fw&quot;:&quot;ok&quot;,&quot;ml&quot;:&quot;ok&quot;}}]" data-intro="Default first, caller second."><div class="anim-scn-title">{ fontWeight: 600, ...style }</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">object literal, written left to right</div><div class="a-col"><div class="an call" data-k="lit"><code>{ fontWeight: 600, ...style }</code></div></div></div><div class="a-panel "><div class="a-panel-title">resulting style</div><div class="a-col"><span class="an chip-a" data-k="fw" data-s="faint">fontWeight: —</span><span class="an chip-a" data-k="ml" data-s="faint">marginLeft: —</span></div></div></div></div><ol class="anim-print"><li><code>fontWeight: 600</code><span>The component’s default is written first.</span></li><li><code>...style  // { fontWeight: 400, marginLeft: 8 }</code><span>The caller’s keys are copied after it. Same key → the <b>later</b> one replaces it.</span></li><li><code>result</code><span>The caller can override the default. Recorded HTML: <code>style="font-weight: 400; margin-left: 8px;"</code>.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;fn&quot;:&quot;...style  // { fontWeight: 400, marginLeft: 8 }&quot;,&quot;say&quot;:&quot;The caller’s keys are copied first.&quot;,&quot;set&quot;:{&quot;lit&quot;:&quot;hl&quot;,&quot;fw&quot;:&quot;new&quot;,&quot;ml&quot;:&quot;new&quot;},&quot;txt&quot;:{&quot;fw&quot;:&quot;fontWeight: 400 (caller)&quot;,&quot;ml&quot;:&quot;marginLeft: 8 (caller)&quot;}},{&quot;fn&quot;:&quot;fontWeight: 600&quot;,&quot;say&quot;:&quot;The default comes later, so it replaces the caller’s value.&quot;,&quot;set&quot;:{&quot;fw&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;fw&quot;:&quot;fontWeight: 600 (default)&quot;}},{&quot;fn&quot;:&quot;result&quot;,&quot;say&quot;:&quot;The default can’t be overridden; the caller can only add other keys.&quot;,&quot;set&quot;:{&quot;lit&quot;:&quot;&quot;,&quot;fw&quot;:&quot;ok&quot;,&quot;ml&quot;:&quot;ok&quot;}}]" data-intro="Caller first, default second."><div class="anim-scn-title">{ ...style, fontWeight: 600 }</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">object literal, written left to right</div><div class="a-col"><div class="an call" data-k="lit"><code>{ ...style, fontWeight: 600 }</code></div></div></div><div class="a-panel "><div class="a-panel-title">resulting style</div><div class="a-col"><span class="an chip-a" data-k="fw" data-s="faint">fontWeight: —</span><span class="an chip-a" data-k="ml" data-s="faint">marginLeft: —</span></div></div></div></div><ol class="anim-print"><li><code>...style  // { fontWeight: 400, marginLeft: 8 }</code><span>The caller’s keys are copied first.</span></li><li><code>fontWeight: 600</code><span>The default comes later, so it replaces the caller’s value.</span></li><li><code>result</code><span>The default can’t be overridden; the caller can only add other keys.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="hl"></i>current step</span><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Object spread follows one rule: for the same key, whatever is written later wins. Props spread in JSX work the same way.</figcaption></figure>

`{ fontWeight: 600, ...style }` lets the caller override the default (recorded: `font-weight: 400`). `{ ...style, fontWeight: 600 }` would lock the default. Choose on purpose.

## Common mistakes

- `style="font-weight: 600"` (a string). React expects an object.
- `className={tone}` with raw class names leaking into every caller.
- Overwriting the caller's `className` or `style` instead of merging.
- Forgetting `...rest`, so `aria-label`, `title` or `onClick` silently disappear.

## Interview Q&A

<details class="qa"><summary>How does <code>style</code> differ between HTML and JSX?</summary>

In HTML it's a CSS string; in JSX it's an object with camelCased property names, and numbers get `px` added for most properties: `style={{ marginLeft: 8 }}` → `margin-left: 8px`.

</details>

<details class="qa"><summary>How do you let callers override a component's default styles?</summary>

Accept `className` and `style`, merge them with your defaults, and put the caller's values last: `className={['tag', className].filter(Boolean).join(' ')}` and `style={{ fontWeight: 600, ...style }}`. Later keys win.

</details>

<details class="qa"><summary>Why expose a typed prop like <code>tone</code> instead of class names?</summary>

It's a small, checked API: callers can't depend on internal class names, typos are compile errors, and you can change the CSS without breaking them.

</details>

<details class="qa"><summary>What problem does <code>clsx</code> solve?</summary>

Building a `className` from conditions without empty strings and double spaces: `clsx('tag', { 'tag--sale': onSale }, className)` instead of hand-written joins.

</details>

## Related

- [TypeScript with React](../../fundamentals/typescript-with-react/): `ComponentProps<'span'> & { tone?: Tone }`.
- [Using JSX](../../fundamentals/using-jsx/): spread order in JSX props.

## Sources

- react.dev: [Applying CSS styles](https://react.dev/reference/react-dom/components/common#applying-css-styles)
- Topic order inspired by Kent C. Dodds' EpicReact *React Fundamentals* workshop; the example app and code here are this handbook's own.
