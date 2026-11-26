import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { uploadPageImage } from "@/utils/ctaApi";

export interface HomeStatItem {
  value: string;
  label: string;
  iconUrl: string;
}

export interface HomeStatsContent {
  title: string;
  body: string;
  stats: HomeStatItem[];
}

export const DEFAULT_HOME_STATS: HomeStatsContent = {
  title: "Pourquoi choisir notre centre dentaire ?",
  body: "Choisissez notre centre dentaire pour une combinaison parfaite de technologie avancée et de soins personnalisés. Notre équipe d'experts est dédiée à fournir des traitements précis et sans stress dans un environnement moderne conçu pour votre confort.",
  stats: [
    { value: "3000", label: "Patients", iconUrl: "/images/icon1.png" },
    { value: "3", label: "Years of Experience", iconUrl: "/images/icon2.png" },
    { value: "300", label: "Surgeries Performed", iconUrl: "/images/icon3.png" },
    { value: "10", label: "Advanced Certifications", iconUrl: "/images/icon4.png" },
    { value: "300", label: "Modern Technologies", iconUrl: "/images/icon6.png" },
  ],
};

export function mergeHomeStats(
  data?: Partial<HomeStatsContent> | null
): HomeStatsContent {
  const src = (data ?? {}) as Partial<HomeStatsContent>;
  const stats =
    Array.isArray(src.stats) && src.stats.length > 0
      ? src.stats.map((s, i) => {
          const fallback = DEFAULT_HOME_STATS.stats[i] || DEFAULT_HOME_STATS.stats[0];
          return {
            value: String(s?.value ?? fallback.value).replace(/\+$/, "").trim() || fallback.value,
            label: String(s?.label || fallback.label).trim(),
            iconUrl: String(s?.iconUrl || fallback.iconUrl).trim(),
          };
        })
      : DEFAULT_HOME_STATS.stats;

  return {
    title: src.title || DEFAULT_HOME_STATS.title,
    body: src.body || DEFAULT_HOME_STATS.body,
    stats,
  };
}

export async function fetchPublicHomeStats(): Promise<HomeStatsContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-stats/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Stats");
  }
  return mergeHomeStats(data.data);
}

export async function fetchHomeStats(): Promise<HomeStatsContent> {
  const response = await fetch(apiUrl("/api/pages/home-stats"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Stats");
  }
  return mergeHomeStats(data.data);
}

export async function updateHomeStats(
  payload: HomeStatsContent
): Promise<HomeStatsContent> {
  const response = await fetch(apiUrl("/api/pages/home-stats"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home Stats");
  }
  notifyCmsUpdated("home-stats");
  return mergeHomeStats(data.data);
}

export { uploadPageImage };
