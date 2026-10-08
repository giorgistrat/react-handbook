// #region worker
import { rankProducts } from './search'

self.onmessage = (e: MessageEvent<{ id: number; query: string }>) => {
	self.postMessage({ id: e.data.id, results: rankProducts(e.data.query) })
}
// #endregion
