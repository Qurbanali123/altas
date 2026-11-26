import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import {
  fetchWithClientCache,
  PUBLIC_API_CACHE_MS,
} from "@/utils/clientFetchCache";
import {
  DASHBOARD_IMAGE_COMPRESS_OPTIONS,
  compressImageForUpload,
} from "@/utils/compressImage";
import { getToken } from "@/utils/auth";

export interface SpecialityBullet {
  title: string;
  text: string;
}

export interface SpecialityAccordionCard {
  label: string;
  description: string;
  imageUrl: string;
  accent?: string;
}

export interface AdminSpeciality {
  id: string;
  title: string;
  slug: string;
  heroSubtitle: string;
  heroImageUrl: string;
  description: string;
  heading1: string;
  image1Url: string;
  description1: string;
  bullets: SpecialityBullet[];
  heading2: string;
  accordionCards: SpecialityAccordionCard[];
  seoTitle: string;
  canonicalUrl: string;
  seoDescription: string;
  focusKeyword: string;
  seoSlug: string;
  seoSchema: string;
  status: "draft" | "published";
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicSpecialityListItem {
  id: string;
  title: string;
  slug: string;
  heroImageUrl: string;
  description: string;
  order: number;
}

export interface PublicSpecialityAccordionCard {
  id: number;
  label: string;
  desc: string;
  imgSrc: string;
  imgAlt: string;
  accent: string;
}

export interface PublicSpecialityDetail extends PublicSpecialityListItem {
  heroSubtitle: string;
  heading1: string;
  image1Url: string;
  description1: string;
  bullets: SpecialityBullet[];
  heading2: string;
  accordionCards: PublicSpecialityAccordionCard[];
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    focusKeyword: string;
    schema: string;
  };
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

import { mediaImageUrl, type OptimizeImageOptions } from "@/utils/mediaUrl";

export function specialityImageUrl(
  path: string | undefined | null,
  options?: OptimizeImageOptions
): string {
  return mediaImageUrl(path, options);
}

export function specialityPagePath(slug: string): string {
  return `/pages/specialites/${slug}`;
}

export function slugifyTitle(title: string): string {
  return String(title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function fetchSpecialitiesOverview(): Promise<{
  specialities: AdminSpeciality[];
  total: number;
}> {
  const response = await fetch(apiUrl("/api/specialities/overview"), {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load specialities");
  }
  return { specialities: data.specialities, total: data.total };
}

export async function fetchSpecialityById(id: string): Promise<AdminSpeciality> {
  const response = await fetch(apiUrl(`/api/specialities/${id}`), {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load speciality");
  }
  return data.speciality;
}

export async function createSpeciality(
  payload: Omit<AdminSpeciality, "id" | "createdAt" | "updatedAt">
): Promise<AdminSpeciality> {
  const response = await fetch(apiUrl("/api/specialities"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create speciality");
  }
  return data.speciality;
}

export async function updateSpeciality(
  id: string,
  payload: Partial<AdminSpeciality>
): Promise<AdminSpeciality> {
  const response = await fetch(apiUrl(`/api/specialities/${id}`), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update speciality");
  }
  return data.speciality;
}

export async function deleteSpeciality(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/specialities/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete speciality");
  }
}

export async function uploadSpecialityImage(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append(
    "image",
    await compressImageForUpload(file, DASHBOARD_IMAGE_COMPRESS_OPTIONS),
  );

  const response = await fetch(apiUrl("/api/specialities/upload-image"), {
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

export async function fetchPublicSpecialities(
  options?: { bypassCache?: boolean }
): Promise<PublicSpecialityListItem[]> {
  const load = async () => {
    const response = await publicCmsFetch(
      apiUrl(
        options?.bypassCache
          ? `/api/specialities/public?t=${Date.now()}`
          : "/api/specialities/public"
      )
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load specialities");
    }
    return data.specialities as PublicSpecialityListItem[];
  };

  if (options?.bypassCache) {
    return load();
  }

  return fetchWithClientCache(
    "public:specialities",
    load,
    PUBLIC_API_CACHE_MS
  );
}

export async function fetchPublicSpecialityBySlug(
  slug: string
): Promise<PublicSpecialityDetail> {
  return fetchWithClientCache(`public:speciality:${slug}`, async () => {
    const response = await publicCmsFetch(
      apiUrl(`/api/specialities/public/${slug}`)
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Speciality not found");
    }
    return data.speciality;
  }, PUBLIC_API_CACHE_MS);
}
