import { allTorifudaAssetUrls } from "./torifudaAssetUrls";

/** vite.config.ts の runtimeCaching と同じ名前 */
export const TORIFUDA_CACHE_NAME = "torifuda-images";

/**
 * 取り札画像を Cache Storage に保存する（オンライン時）。
 * Service Worker のプリキャッシュと併用し、未キャッシュ分を補完する。
 */
export async function warmTorifudaCache(): Promise<void> {
  if (!("caches" in window)) return;

  const cache = await caches.open(TORIFUDA_CACHE_NAME);
  const urls = allTorifudaAssetUrls();

  await Promise.all(
    urls.map(async (url) => {
      if (await cache.match(url)) return;
      try {
        const res = await fetch(url);
        if (res.ok) {
          await cache.put(url, res.clone());
        }
      } catch {
        // オフライン等 — SW プリキャッシュがあれば表示は可能
      }
    }),
  );
}
