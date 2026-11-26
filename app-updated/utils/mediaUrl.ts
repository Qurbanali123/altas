import { API_BASE_URL, apiUrl } from "@/utils/api";
import {
  optimizedImageUrl,
  type OptimizeImageOptions,
} from "@/utils/cloudinary";

const DEFAULT_UPLOAD_WIDTH = 1200;

/** Prefer MEDIA_URL for uploads (useful when API is local but files are on live). */
function uploadsBaseUrl(): string {
  const media = (process.env.NEXT_PUBLIC_MEDIA_URL || "").replace(/\/$/, "");
  if (media) return media;
  return API_BASE_URL.replace(/\/$/, "");
}

function isApiUploadUrl(src: string): boolean {
  if (src.startsWith("blob:") || src.startsWith("data:")) return false;
  return src.includes("/uploads/");
}

export function resolveMediaSource(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("blob:") || path.startsWith("data:")) return path;

  const uploadsMatch = path.match(/\/uploads\/[^\s?#]+/);
  if (uploadsMatch) {
    return `${uploadsBaseUrl()}${uploadsMatch[0]}`;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/images/") || path.startsWith("/")) {
    return path;
  }

  return apiUrl(path.startsWith("/") ? path : `/${path}`);
}

/** Direct URL on your server/API (no Cloudinary). Used as img onError fallback. */
export function directMediaImageUrl(path: string | undefined | null): string {
  return resolveMediaSource(path);
}

export function mediaImageUrl(
  path: string | undefined | null,
  options?: OptimizeImageOptions
): string {
  const resolved = resolveMediaSource(path);
  if (!resolved) return "";
  if (resolved.startsWith("blob:") || resolved.startsWith("data:")) {
    return resolved;
  }

  const optimize: OptimizeImageOptions = { ...options };
  if (isApiUploadUrl(resolved) && !optimize.width) {
    optimize.width = DEFAULT_UPLOAD_WIDTH;
  }

  return optimizedImageUrl(resolved, optimize);
}

export type { OptimizeImageOptions } from "@/utils/cloudinary";
