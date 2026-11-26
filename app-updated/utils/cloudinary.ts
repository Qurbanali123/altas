export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  crop?: "limit" | "fill" | "scale";
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://atlasdentalcenter.com"
).replace(/\/$/, "");

export function isCloudinaryEnabled(): boolean {
  return Boolean(CLOUD_NAME);
}

function toAbsoluteUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  if (src.startsWith("/")) {
    return `${SITE_URL}${src}`;
  }
  return src;
}

/** No-op kept for call sites that previously forced .webp. */
export function preferStaticWebp(src: string): string {
  return src;
}

/**
 * Resolve display URL for images.
 * Cloudinary "image/fetch" is NOT enabled on this cloud (returns 401),
 * so we always return direct site / API URLs for reliability.
 */
export function optimizedImageUrl(
  src: string | undefined | null,
  _options?: OptimizeImageOptions
): string {
  if (!src) return "";
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;
  if (src.includes("res.cloudinary.com")) return src;

  // Keep static assets as relative paths (served from public_html).
  if (src.startsWith("/images/")) return src;

  if (src.includes("atlasdentalcenter.com/images/")) {
    try {
      const u = new URL(src);
      if (u.pathname.startsWith("/images/")) return u.pathname + u.search;
    } catch {
      /* keep */
    }
  }

  // Relative upload paths → absolute backend URL via caller resolveMediaSource.
  if (src.startsWith("/")) return src;

  return toAbsoluteUrl(src);
}
