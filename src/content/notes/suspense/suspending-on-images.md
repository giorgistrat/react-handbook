---
title: "Suspending on Images"
slug: "suspending-on-images"
module: "suspense"
order: 3
level: "good"
illus: "eye"
summary: "Keep new details from appearing next to an old picture, and keep a broken picture from breaking the card."
source: "https://react.dev/reference/react/Suspense"
---


## In one minute

Suspense can wait for anything that's a promise, not just data. Images are a good example: when a product page switches products, the new name and price can arrive long before the new picture, and the browser keeps showing the **old** picture until the new one has loaded. Turning "image loaded" into a cached promise (`preloadImage(src)`) and calling `use` on it makes the image wait like data. Two refinements: give the image its **own** error boundary, so a broken picture doesn't take down the card, and its own `Suspense` with a **`key={src}`**, so the details don't wait for the picture: a new boundary shows a placeholder even during a transition.

**You'll be able to:** suspend on an image, contain a broken one, and use `key` to reset a boundary during a transition.

<figure class="fig anim fig-suspense-images-anim" data-anim data-pagefind-ignore><div class="btn-row anim-tabs" role="tablist"><button type="button" role="tab" class="btn " data-anim-tab="0" aria-selected="true">Plain <img></button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="1" aria-selected="false">Suspend on the image</button><button type="button" role="tab" class="btn btn-ghost" data-anim-tab="2" aria-selected="false">Keyed boundary</button></div><div class="anim-scn" data-anim-scn="0"  data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;→ GET /products/p4&quot;,&quot;say&quot;:&quot;The transition waits for the product data only.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;+200 ms  details: Desk Lamp&quot;,&quot;say&quot;:&quot;The new name and price commit, with &lt;code&gt;src&lt;/code&gt; pointing at the new picture…&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;bad&quot;,&quot;scr&quot;:&quot;bad&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Desk Lamp text · Mug picture&quot;}},{&quot;phase&quot;:&quot;paint&quot;,&quot;fn&quot;:&quot;≈ +800 ms  &lt;img&gt; finished loading p4&quot;,&quot;say&quot;:&quot;…but the browser keeps showing the &lt;b&gt;old&lt;/b&gt; picture until the new one has loaded: about 600 ms of the lamp’s details next to the mug.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;upd&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Desk Lamp · lamp picture&quot;}}]" data-intro="The new &lt;code&gt;src&lt;/code&gt; is just rendered."><div class="anim-scn-title">Plain <img></div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">→ GET /products/p4</div><div class="an" data-k="l1" data-s="ghost">+200 ms  details: Desk Lamp</div><div class="an" data-k="l2" data-s="ghost">≈ +800 ms  &lt;img&gt; finished loading p4</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">Ceramic Mug</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>→ GET /products/p4</code><span>The transition waits for the product data only.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>+200 ms  details: Desk Lamp</code><span>The new name and price commit, with <code>src</code> pointing at the new picture…</span></li><li><span class="anim-phase ph-paint">browser</span><code>≈ +800 ms  &lt;img&gt; finished loading p4</code><span>…but the browser keeps showing the <b>old</b> picture until the new one has loaded: about 600 ms of the lamp’s details next to the mug.</span></li></ol></div><div class="anim-scn" data-anim-scn="1" hidden data-steps="[{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;→ GET /products/p4&quot;,&quot;say&quot;:&quot;Same start.&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;+200 ms  → GET /img/p4.svg&quot;,&quot;say&quot;:&quot;The image component now suspends on a promise that resolves when the picture has loaded.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;trigger&quot;,&quot;fn&quot;:&quot;+800 ms  ← GET /img/p4.svg&quot;,&quot;say&quot;:&quot;The transition waits for both.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;+800 ms  image: p4 · details: Desk Lamp&quot;,&quot;say&quot;:&quot;Data and picture switch together. But the details waited 600 ms for the picture, and a broken picture now breaks the whole card.&quot;,&quot;set&quot;:{&quot;l3&quot;:&quot;upd&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Desk Lamp · lamp picture&quot;}}]" data-intro="&lt;code&gt;use(preloadImage(src))&lt;/code&gt; in the image component."><div class="anim-scn-title">Suspend on the image</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">→ GET /products/p4</div><div class="an" data-k="l1" data-s="ghost">+200 ms  → GET /img/p4.svg</div><div class="an" data-k="l2" data-s="ghost">+800 ms  ← GET /img/p4.svg</div><div class="an" data-k="l3" data-s="ghost">+800 ms  image: p4 · details: Desk Lamp</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">Ceramic Mug</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-trigger">trigger</span><code>→ GET /products/p4</code><span>Same start.</span></li><li><span class="anim-phase ph-render">render phase</span><code>+200 ms  → GET /img/p4.svg</code><span>The image component now suspends on a promise that resolves when the picture has loaded.</span></li><li><span class="anim-phase ph-trigger">trigger</span><code>+800 ms  ← GET /img/p4.svg</code><span>The transition waits for both.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>+800 ms  image: p4 · details: Desk Lamp</code><span>Data and picture switch together. But the details waited 600 ms for the picture, and a broken picture now breaks the whole card.</span></li></ol></div><div class="anim-scn" data-anim-scn="2" hidden data-steps="[{&quot;phase&quot;:&quot;render&quot;,&quot;fn&quot;:&quot;+200 ms  → GET /img/p4.svg&quot;,&quot;say&quot;:&quot;With &lt;code&gt;key={src}&lt;/code&gt; the image boundary is &lt;b&gt;new&lt;/b&gt; in this render, so the transition may show its fallback (it only protects content that’s already revealed).&quot;,&quot;set&quot;:{&quot;l0&quot;:&quot;new&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;+200 ms  placeholder · details: Desk Lamp&quot;,&quot;say&quot;:&quot;The details commit right away, with a placeholder where the picture goes.&quot;,&quot;set&quot;:{&quot;l1&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;upd&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Desk Lamp · 🖼️ placeholder&quot;}},{&quot;phase&quot;:&quot;commit&quot;,&quot;fn&quot;:&quot;+800 ms  image: p4&quot;,&quot;say&quot;:&quot;The picture replaces the placeholder. For a broken picture, the narrow error boundary shows “Image unavailable” and the details stay.&quot;,&quot;set&quot;:{&quot;l2&quot;:&quot;ok&quot;,&quot;scr&quot;:&quot;ok&quot;},&quot;txt&quot;:{&quot;scr&quot;:&quot;Desk Lamp · lamp picture&quot;}}]" data-intro="The image gets its own &lt;code&gt;ErrorBoundary&lt;/code&gt; + &lt;code&gt;Suspense&lt;/code&gt;, keyed by &lt;code&gt;src&lt;/code&gt;."><div class="anim-scn-title">Keyed boundary</div><div class="anim-stage"><div class="a-cols"><div class="a-panel wide"><div class="a-panel-title">recorded order</div><div class="a-log"><div class="an" data-k="l0" data-s="ghost">+200 ms  → GET /img/p4.svg</div><div class="an" data-k="l1" data-s="ghost">+200 ms  placeholder · details: Desk Lamp</div><div class="an" data-k="l2" data-s="ghost">+800 ms  image: p4</div></div></div><div class="a-panel "><div class="a-panel-title">the shopper sees</div><div class="a-col"><span class="an chip-a" data-k="scr" data-s="faint">Ceramic Mug</span></div></div></div></div><ol class="anim-print"><li><span class="anim-phase ph-render">render phase</span><code>+200 ms  → GET /img/p4.svg</code><span>With <code>key={src}</code> the image boundary is <b>new</b> in this render, so the transition may show its fallback (it only protects content that’s already revealed).</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>+200 ms  placeholder · details: Desk Lamp</code><span>The details commit right away, with a placeholder where the picture goes.</span></li><li><span class="anim-phase ph-commit">commit phase</span><code>+800 ms  image: p4</code><span>The picture replaces the placeholder. For a broken picture, the narrow error boundary shows “Image unavailable” and the details stay.</span></li></ol></div><div class="anim-legend" aria-label="Colour legend"><span><i class="an lg-sw" data-s="new"></i>created</span><span><i class="an lg-sw" data-s="upd"></i>updated / moved</span><span><i class="an lg-sw" data-s="ok"></i>ok</span><span><i class="an lg-sw" data-s="bad"></i>wrong</span></div><div class="anim-hud" aria-live="polite"><div class="anim-call"><span class="anim-phase" hidden></span><code class="anim-fn" hidden></code></div><p class="anim-say"></p><div class="anim-stack" hidden><span class="as-title">Call stack <small>(outermost first; the last line is running now)</small></span><ol class="as-frames"></ol></div></div><div class="anim-controls"><button type="button" class="btn btn-ghost anim-btn" data-act="restart" aria-label="Restart">↺</button><button type="button" class="btn btn-ghost anim-btn" data-act="prev" aria-label="Previous step">←</button><button type="button" class="btn anim-play" data-act="play">▶ Play</button><button type="button" class="btn btn-ghost anim-btn" data-act="next" aria-label="Next step">→</button><input type="range" class="anim-range" min="0" max="0" value="0" step="1" aria-label="Step" /><span class="anim-count">0 / 0</span><button type="button" class="btn btn-ghost anim-btn anim-speed" data-act="speed" aria-label="Playback speed">1×</button></div><figcaption>Switching to the Desk Lamp in a transition: data 200 ms, picture 600 ms (all three recorded).</figcaption></figure>

## The example: product pictures

Switching from the Ceramic Mug to the Desk Lamp, inside a transition. The product data takes 200 ms; the picture 600 ms. Then switching to the Wireless Headphones, whose picture is missing (404).

### 1. A plain `<img>`

```tsx
function PlainImg({ src }: { src: string }) {
	return <img src={src} alt="" data-img={id(src)} onLoad={onLoad(src)} onError={onError(src)} />
}
```

```text
screen: pending ⏳ · image: p1 · details: Ceramic Mug
1200 ms  → GET /products/p4
1400 ms  ← GET /products/p4
screen: image: p4 · details: Desk Lamp
2050 ms  <img> finished loading p4
```

The lamp's details were committed about 600 ms before its picture finished loading. Changing an `<img>`'s `src` doesn't clear it: the browser keeps displaying the current picture until the new one is ready, so for that time the page showed the lamp's name next to the mug's picture.

### 2. Suspend until the picture has loaded

```ts
const imageCache = new Map<string, Promise<string>>()

export function preloadImage(src: string) {
	let promise = imageCache.get(src)
	if (!promise) {
		promise = new Promise((resolve, reject) => {
			const img = new Image()
			img.onload = () => resolve(src)
			img.onerror = () => reject(new Error(`Couldn’t load ${src}`))
			img.src = src
		})
		promise = track(`GET ${src}`, promise) // (logs the download for the recordings)
		imageCache.set(src, promise)
	}
	return promise
}
```

```tsx
function Img({ src }: { src: string }) {
	use(preloadImage(src)) // wait until the browser has the picture
	return <img src={src} alt="" data-img={id(src)} />
}
```

```text
screen: pending ⏳ · image: p1 · details: Ceramic Mug
1200 ms  → GET /products/p4
1400 ms  ← GET /products/p4
1400 ms  → GET /img/p4.svg
2000 ms  ← GET /img/p4.svg
screen: image: p4 · details: Desk Lamp
```

Name and picture switched together. Two costs, though: the details waited for the picture, and the broken picture now took down the whole card:

```text
screen: pending ⏳ · image: p4 · details: Desk Lamp
2300 ms  → GET /products/p2
2550 ms  ← GET /products/p2
2550 ms  → GET /img/p2.svg
3150 ms  ✗ GET /img/p2.svg
screen: error “Couldn’t load this product.”
```

### 3. A keyed image boundary

```tsx
function ProductImage({ src }: { src: string }) {
	return (
		<ErrorBoundary key={src} fallback={<span data-img="unavailable">Image unavailable</span>}>
			<Suspense fallback={<span data-img="placeholder">🖼️</span>}>
				<Img src={src} />
			</Suspense>
		</ErrorBoundary>
	)
}
```

```text
screen: pending ⏳ · image: p1 · details: Ceramic Mug
1200 ms  → GET /products/p4
1400 ms  ← GET /products/p4
1400 ms  → GET /img/p4.svg
screen: image: placeholder · details: Desk Lamp
2000 ms  ← GET /img/p4.svg
screen: image: p4 · details: Desk Lamp
```

```text
screen: pending ⏳ · image: p4 · details: Desk Lamp
2350 ms  → GET /products/p2
2550 ms  ← GET /products/p2
2550 ms  → GET /img/p2.svg
screen: image: placeholder · details: Wireless Headphones
3150 ms  ✗ GET /img/p2.svg
screen: image: unavailable · details: Wireless Headphones
```

The details committed as soon as the data was there, with a placeholder in the picture's place, and the broken picture became "Image unavailable" while the rest of the card stayed.

## How it works

- **Any cached promise can suspend.** `preloadImage` creates an `Image()`, resolves on `load`, rejects on `error`, and caches the promise by URL, so every render (and every component) gets the same one.
- **During a transition, React keeps revealed content and waits.** That's why version 2 waited for the picture: the image was inside the already-revealed details boundary.
- **A new boundary can show its fallback.** `key={src}` makes React treat the image's `ErrorBoundary` and `Suspense` as brand-new components for every picture. New boundaries have nothing revealed to protect, so the transition commits the rest and shows the placeholder there.
- **Error boundary outside, `Suspense` inside.** The error boundary catches the image's rejection; resetting it with the key gives each picture a fresh chance.
- The browser's own image cache makes a second `<img>` with the same URL instant, so the preload isn't downloaded twice.

## Common mistakes

- **A new `Image()` and promise on every render.** Cache by URL.
- **One error boundary for the whole card.** A failed image becomes a failed page.
- **Waiting for big hero images in the critical path.** Sometimes a placeholder now is better than a complete page later; decide per image.

## Interview Q&A

<details class="qa"><summary>Can Suspense wait for things other than data?</summary>

Yes, any promise read with `use`: code (`lazy`), images, fonts, anything with a "done" event. Recorded: the page waited for a picture's `load` event.

</details>

<details class="qa"><summary>Why suspend on an image at all?</summary>

Because the browser keeps the old picture on screen until a new `src` has loaded, so new data can appear next to an old picture. Recorded: the lamp's details showed about 600 ms before its picture finished loading.

</details>

<details class="qa"><summary>Why must the image promise be cached?</summary>

Each render must see the same promise, or `use` suspends forever, and each new `Image()` would start another download.

</details>

<details class="qa"><summary>What happens when a suspended image fails to load?</summary>

The promise rejects and `use` throws, so the nearest error boundary takes over. Without a narrow boundary, that was the whole card (recorded); with one, just the picture.

</details>

<details class="qa"><summary>How does <code>key</code> change what a transition shows?</summary>

A changed key makes React mount a new boundary. Transitions only avoid hiding content that's already revealed, so a new boundary may show its fallback while the rest of the update commits. Recorded: details at 200 ms with a placeholder, the picture at 600 ms.

</details>

## Related

- [Promise Caching and Transitions](../../suspense/promise-caching/): transitions keep revealed content.
- [Rendering Arrays](../../fundamentals/rendering-arrays/): `key` and component identity.
- [Error Boundaries](../../fundamentals/error-boundaries/): where to put them.

## Sources

- react.dev: [`Suspense`](https://react.dev/reference/react/Suspense) (resetting boundaries on navigation), [`use`](https://react.dev/reference/react/use)
- HTML spec: [Updating the image data](https://html.spec.whatwg.org/multipage/images.html#updating-the-image-data) (the current picture stays until the new one is available)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
