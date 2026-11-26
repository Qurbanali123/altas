import { apiUrl } from "@/utils/api";
import {
  DASHBOARD_API_CACHE_MS,
  fetchWithClientCache,
} from "@/utils/clientFetchCache";

export async function fetchCachedDashboardGet<T>(
  pathWithQuery: string,
  headers: HeadersInit
): Promise<{ ok: boolean; data: T | null; status: number }> {
  const url = apiUrl(pathWithQuery);
  const cacheKey = `dash:${pathWithQuery}`;

  return fetchWithClientCache(cacheKey, async () => {
    const response = await fetch(url, { headers });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, data: null, status: response.status };
    }
    return { ok: true, data: (json.data ?? null) as T | null, status: response.status };
  }, DASHBOARD_API_CACHE_MS);
}
