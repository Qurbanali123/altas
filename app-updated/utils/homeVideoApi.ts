import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { uploadPageImage } from "@/utils/ctaApi";

export interface HomeVideoContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  videoUrl: string;
  sideImageUrl: string;
  sideImageAlt: string;
  caption: string;
}

export const DEFAULT_HOME_VIDEO: HomeVideoContent = {
  eyebrow: "Nous accueillons une patientèle locale et internationale.",
  title: "Pourquoi nous choisir ?",
  subtitle: "Atlas Dental Center : Le choix d'une patientèle en quête d'excellence.",
  buttonLabel: "Prendre rendez-vous",
  buttonHref: "/pages/Appointment",
  videoUrl: "/videos/teethvideo.mp4",
  sideImageUrl: "/images/drfooter.jpeg",
  sideImageAlt: "Clinic treatment",
  caption:
    "L'équilibre entre santé, esthétique et précision au service de votre sourire.",
};

export type ResolvedVideo =
  | { kind: "file"; src: string; posterUrl?: string }
  | {
      kind: "embed";
      src: string;
      provider: "youtube" | "vimeo" | "iframe";
      posterUrl?: string;
    };

function youtubeIdFromUrl(url: string): string | null {
  const embed = url.match(
    /(?:youtube\.com|youtube-nocookie\.com)\/embed\/([A-Za-z0-9_-]{6,})/i
  );
  if (embed?.[1]) return embed[1];
  const watch = url.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
  );
  if (watch?.[1]) return watch[1];
  const query = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
  return query?.[1] || null;
}

function vimeoIdFromUrl(url: string): string | null {
  const m = url.match(
    /(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i
  );
  return m?.[1] || null;
}

function youtubePoster(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function vimeoPoster(id: string): string {
  return `https://vumbnail.com/${id}.jpg`;
}

/** Parse YouTube / Vimeo / direct file / generic embed URLs for on-site playback. */
export function resolveVideoPlayback(rawUrl: string): ResolvedVideo {
  const url = String(rawUrl || "").trim();
  if (!url) {
    return { kind: "file", src: DEFAULT_HOME_VIDEO.videoUrl };
  }

  // Direct media files (local or remote)
  if (
    /\.(mp4|webm|ogg)(\?|#|$)/i.test(url) ||
    url.startsWith("/videos/") ||
    url.startsWith("/uploads/")
  ) {
    return { kind: "file", src: url };
  }

  const ytId = youtubeIdFromUrl(url);
  if (ytId) {
    const embedSrc = /\/embed\//i.test(url)
      ? url
      : `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`;
    return {
      kind: "embed",
      src: embedSrc,
      provider: "youtube",
      posterUrl: youtubePoster(ytId),
    };
  }

  const vimeoId = vimeoIdFromUrl(url);
  if (vimeoId) {
    const embedSrc = /player\.vimeo\.com\/video\//i.test(url)
      ? url
      : `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`;
    return {
      kind: "embed",
      src: embedSrc,
      provider: "vimeo",
      posterUrl: vimeoPoster(vimeoId),
    };
  }

  // Generic iframe-friendly URL fallback (still on-site, no navigation)
  if (/^https?:\/\//i.test(url)) {
    return { kind: "embed", src: url, provider: "iframe" };
  }

  return { kind: "file", src: url };
}

export function mergeHomeVideo(
  data?: Partial<HomeVideoContent> | null
): HomeVideoContent {
  const src = (data ?? {}) as Partial<HomeVideoContent>;
  return {
    eyebrow: src.eyebrow || DEFAULT_HOME_VIDEO.eyebrow,
    title: src.title || DEFAULT_HOME_VIDEO.title,
    subtitle: src.subtitle || DEFAULT_HOME_VIDEO.subtitle,
    buttonLabel: src.buttonLabel || DEFAULT_HOME_VIDEO.buttonLabel,
    buttonHref: src.buttonHref || DEFAULT_HOME_VIDEO.buttonHref,
    videoUrl: src.videoUrl || DEFAULT_HOME_VIDEO.videoUrl,
    sideImageUrl: src.sideImageUrl || DEFAULT_HOME_VIDEO.sideImageUrl,
    sideImageAlt: src.sideImageAlt || DEFAULT_HOME_VIDEO.sideImageAlt,
    caption: src.caption || DEFAULT_HOME_VIDEO.caption,
  };
}

export async function fetchPublicHomeVideo(): Promise<HomeVideoContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-video/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Video section");
  }
  return mergeHomeVideo(data.data);
}

export async function fetchHomeVideo(): Promise<HomeVideoContent> {
  const response = await fetch(apiUrl("/api/pages/home-video"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Video section");
  }
  return mergeHomeVideo(data.data);
}

export async function updateHomeVideo(
  payload: HomeVideoContent
): Promise<HomeVideoContent> {
  const response = await fetch(apiUrl("/api/pages/home-video"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home Video section");
  }
  notifyCmsUpdated("home-video");
  return mergeHomeVideo(data.data);
}

export { uploadPageImage };
