// A promise per image URL that resolves once the browser has the picture.
import { track } from '../../data/api'

// #region preload
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
// #endregion
