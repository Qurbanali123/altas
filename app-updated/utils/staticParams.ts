import { API_BASE_URL } from "@/utils/api";

/** Shell page used by .htaccess when a slug was not pre-rendered at build time. */
export const FALLBACK_SLUG = "_fallback";

function withFallback(slugs: string[]): { slug: string }[] {
  const unique = new Set(slugs.filter(Boolean));
  unique.add(FALLBACK_SLUG);
  return Array.from(unique).map((slug) => ({ slug }));
}

export async function fetchBlogSlugsForExport(): Promise<{ slug: string }[]> {
  try {
    const base = API_BASE_URL.replace(/\/$/, "");
    const response = await fetch(`${base}/api/blogs/public?limit=1000`);
    const json = await response.json();
    if (response.ok && json.success && Array.isArray(json.data?.blogs)) {
      return withFallback(json.data.blogs.map((blog: { slug: string }) => blog.slug));
    }
  } catch {
    // Build offline or API unavailable — still emit the fallback shell page.
  }
  return [{ slug: FALLBACK_SLUG }];
}

export async function fetchSpecialitySlugsForExport(): Promise<{ slug: string }[]> {
  try {
    const base = API_BASE_URL.replace(/\/$/, "");
    const response = await fetch(`${base}/api/specialities/public`);
    const json = await response.json();
    if (response.ok && Array.isArray(json.specialities)) {
      return withFallback(json.specialities.map((item: { slug: string }) => item.slug));
    }
  } catch {
    // Build offline or API unavailable — still emit the fallback shell page.
  }
  return [{ slug: FALLBACK_SLUG }];
}
