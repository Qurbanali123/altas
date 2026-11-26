import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface SharedCtaContent {
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  backgroundImageUrl: string;
  handImageUrl: string;
}

export const DEFAULT_SHARED_CTA: SharedCtaContent = {
  title: "Planifiez votre visite",
  body: "Choisissez le créneau qui vous convient et notre équipe vous accueillera dans les meilleures conditions pour votre consultation.",
  buttonLabel: "Prendre rendez-vous",
  buttonHref: "/pages/Appointment",
  backgroundImageUrl: "/images/bgsub.png",
  handImageUrl: "/images/shand.png",
};

function mergeSharedCta(
  data?: Partial<SharedCtaContent> | null
): SharedCtaContent {
  const src = (data ?? {}) as Partial<SharedCtaContent>;
  return {
    title: src.title || DEFAULT_SHARED_CTA.title,
    body: src.body || DEFAULT_SHARED_CTA.body,
    buttonLabel: src.buttonLabel || DEFAULT_SHARED_CTA.buttonLabel,
    buttonHref: src.buttonHref || DEFAULT_SHARED_CTA.buttonHref,
    backgroundImageUrl:
      src.backgroundImageUrl || DEFAULT_SHARED_CTA.backgroundImageUrl,
    handImageUrl: src.handImageUrl || DEFAULT_SHARED_CTA.handImageUrl,
  };
}

export async function fetchPublicSharedCta(): Promise<SharedCtaContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/pages/cta/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load CTA");
    }
    return mergeSharedCta(data.data);
  } catch {
    return DEFAULT_SHARED_CTA;
  }
}

export async function fetchSharedCta(): Promise<SharedCtaContent> {
  const response = await fetch(apiUrl("/api/pages/cta"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load CTA");
  }
  return mergeSharedCta(data.data);
}

export async function updateSharedCta(
  payload: SharedCtaContent
): Promise<SharedCtaContent> {
  const response = await fetch(apiUrl("/api/pages/cta"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update CTA");
  }
  notifyCmsUpdated("cta");
  return mergeSharedCta(data.data);
}

export async function uploadPageImage(file: File): Promise<string> {
  const { getToken } = await import("@/utils/auth");
  const {
    compressImageForUpload,
    DASHBOARD_IMAGE_COMPRESS_OPTIONS,
  } = await import("@/utils/compressImage");
  const token = getToken();
  const formData = new FormData();
  formData.append(
    "image",
    await compressImageForUpload(file, DASHBOARD_IMAGE_COMPRESS_OPTIONS)
  );
  const response = await fetch(apiUrl("/api/pages/upload-image"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Image upload failed");
  }
  return data.url as string;
}

/** Upload doctor/cutout PNG exactly — never convert to JPEG (keeps quality + alpha). */
export async function uploadPageImageExact(file: File): Promise<string> {
  const { getToken } = await import("@/utils/auth");
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(apiUrl("/api/pages/upload-image"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Image upload failed");
  }
  return data.url as string;
}

/** Upload cutout doctor photos with black→transparent PNG (no black flash on site). */
export async function uploadPageCutoutImage(file: File): Promise<string> {
  const { getToken } = await import("@/utils/auth");
  const { stripBlackBackgroundToPng } = await import("@/utils/compressImage");
  const token = getToken();
  const formData = new FormData();
  formData.append("image", await stripBlackBackgroundToPng(file));
  const response = await fetch(apiUrl("/api/pages/upload-image"), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Image upload failed");
  }
  return data.url as string;
}
