---
source: https://react.dev/reference/react/Suspense
---

# Suspending on Images

## In one minute

Suspense can wait for anything that's a promise, not just data. Images are a good example: when a product page switches products, the new name and price can arrive long before the new picture, and the browser keeps showing the **old** picture until the new one has loaded. Turning "image loaded" into a cached promise (`preloadImage(src)`) and calling `use` on it makes the image wait like data. Two refinements: give the image its **own** error boundary, so a broken picture doesn't take down the card, and its own `Suspense` with a **`key={src}`**, so the details don't wait for the picture: a new boundary shows a placeholder even during a transition.

**You'll be able to:** suspend on an image, contain a broken one, and use `key` to reset a boundary during a transition.

<!-- figure name="imagesAnim" -->

## The example: product pictures

Switching from the Ceramic Mug to the Desk Lamp, inside a transition. The product data takes 200 ms; the picture 600 ms. Then switching to the Wireless Headphones, whose picture is missing (404).

### 1. A plain `<img>`

<!-- source file="src/lessons/suspense/04-images.tsx" region="plainImg" -->

<!-- output from="suspense" path="images.plain.lamp" as="log" -->

The lamp's details were committed about 600 ms before its picture finished loading. Changing an `<img>`'s `src` doesn't clear it: the browser keeps displaying the current picture until the new one is ready, so for that time the page showed the lamp's name next to the mug's picture.

### 2. Suspend until the picture has loaded

<!-- source file="src/lessons/suspense/images.ts" region="preload" -->

<!-- source file="src/lessons/suspense/04-images.tsx" region="suspenseImg" -->

<!-- output from="suspense" path="images.suspend.lamp" as="log" -->

Name and picture switched together. Two costs, though: the details waited for the picture, and the broken picture now took down the whole card:

<!-- output from="suspense" path="images.suspend.brokenImage" as="log" -->

### 3. A keyed image boundary

<!-- source file="src/lessons/suspense/04-images.tsx" region="keyedImg" -->

<!-- output from="suspense" path="images.keyed.lamp" as="log" -->

<!-- output from="suspense" path="images.keyed.brokenImage" as="log" -->

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

**Q: Can Suspense wait for things other than data?**
A: Yes, any promise read with `use`: code (`lazy`), images, fonts, anything with a "done" event. Recorded: the page waited for a picture's `load` event.

**Q: Why suspend on an image at all?**
A: Because the browser keeps the old picture on screen until a new `src` has loaded, so new data can appear next to an old picture. Recorded: the lamp's details showed about 600 ms before its picture finished loading.

**Q: Why must the image promise be cached?**
A: Each render must see the same promise, or `use` suspends forever, and each new `Image()` would start another download.

**Q: What happens when a suspended image fails to load?**
A: The promise rejects and `use` throws, so the nearest error boundary takes over. Without a narrow boundary, that was the whole card (recorded); with one, just the picture.

**Q: How does `key` change what a transition shows?**
A: A changed key makes React mount a new boundary. Transitions only avoid hiding content that's already revealed, so a new boundary may show its fallback while the rest of the update commits. Recorded: details at 200 ms with a placeholder, the picture at 600 ms.

## Related

- [[Promise Caching and Transitions]]: transitions keep revealed content.
- [[Rendering Arrays]]: `key` and component identity.
- [[Error Boundaries]]: where to put them.

## Sources

- react.dev: [`Suspense`](https://react.dev/reference/react/Suspense) (resetting boundaries on navigation), [`use`](https://react.dev/reference/react/use)
- HTML spec: [Updating the image data](https://html.spec.whatwg.org/multipage/images.html#updating-the-image-data) (the current picture stays until the new one is available)
- Topic order inspired by Kent C. Dodds' EpicReact *React Suspense* workshop; the example app and code here are this handbook's own.
