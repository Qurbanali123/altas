type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const dataCache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export const PUBLIC_API_CACHE_MS = 10 * 60 * 1000;
export const DASHBOARD_API_CACHE_MS = 45 * 1000;

export function fetchWithClientCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const now = Date.now();
  const hit = dataCache.get(key);
  if (hit && hit.expiresAt > now) {
    return Promise.resolve(hit.data as T);
  }

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const promise = fetcher()
    .then((data) => {
      dataCache.set(key, { data, expiresAt: Date.now() + ttlMs });
      inflight.delete(key);
      return data;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, promise);
  return promise;
}

export function invalidateClientCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    dataCache.clear();
    return;
  }
  for (const key of dataCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      dataCache.delete(key);
    }
  }
}
