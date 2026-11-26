import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface HomeBlogsContent {
  eyebrow: string;
  title: string;
  body: string;
}

export const DEFAULT_HOME_BLOGS: HomeBlogsContent = {
  eyebrow: "Perspicacité et Inspiration",
  title: "Nos blogs",
  body: "Explorez l'intersection du confort et de la technologie alors que nous partageons des mises à jour sur les outils innovants et les méthodes douces que nous utilisons pour transformer votre expérience dentaire.",
};

export function mergeHomeBlogs(
  data?: Partial<HomeBlogsContent> | null
): HomeBlogsContent {
  const src = (data ?? {}) as Partial<HomeBlogsContent>;
  return {
    eyebrow: src.eyebrow || DEFAULT_HOME_BLOGS.eyebrow,
    title: src.title || DEFAULT_HOME_BLOGS.title,
    body: src.body || DEFAULT_HOME_BLOGS.body,
  };
}

export async function fetchPublicHomeBlogs(): Promise<HomeBlogsContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-blogs/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Blogs section");
  }
  return mergeHomeBlogs(data.data);
}

export async function fetchHomeBlogs(): Promise<HomeBlogsContent> {
  const response = await fetch(apiUrl("/api/pages/home-blogs"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Blogs section");
  }
  return mergeHomeBlogs(data.data);
}

export async function updateHomeBlogs(
  payload: HomeBlogsContent
): Promise<HomeBlogsContent> {
  const response = await fetch(apiUrl("/api/pages/home-blogs"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home Blogs section");
  }
  notifyCmsUpdated("home-blogs");
  return mergeHomeBlogs(data.data);
}
