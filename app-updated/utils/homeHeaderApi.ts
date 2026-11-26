import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { uploadPageImage } from "@/utils/ctaApi";

export const HEADER_NAV_SPECIALITIES = "specialities";

export interface HomeHeaderNavItem {
  /** "link" = normal route; "specialities" = dropdown from Specialities CMS */
  type: "link" | "specialities";
  label: string;
  href: string;
}

export interface HomeHeaderContent {
  logoUrl: string;
  logoAlt: string;
  logoHref: string;
  navItems: HomeHeaderNavItem[];
  contactLabel: string;
  contactHref: string;
}

export const DEFAULT_HOME_HEADER: HomeHeaderContent = {
  logoUrl: "/images/altaslogo.png",
  logoAlt: "Atlas Dental Center",
  logoHref: "/",
  navItems: [
    { type: "link", label: "Accueil", href: "/" },
    { type: "link", label: "Notre centre", href: "/pages/notre-centre" },
    { type: "specialities", label: "Nos spécialités", href: "" },
    { type: "link", label: "Notre équipe", href: "/pages/a-propos" },
    { type: "link", label: "Avant/Après", href: "/pages/avant-apres" },
  ],
  contactLabel: "Contact",
  contactHref: "/pages/contact",
};

function normalizeNavType(raw: unknown): "link" | "specialities" {
  return String(raw || "").toLowerCase() === HEADER_NAV_SPECIALITIES
    ? "specialities"
    : "link";
}

export function mergeHomeHeader(
  data?: Partial<HomeHeaderContent> | null
): HomeHeaderContent {
  const src = (data ?? {}) as Partial<HomeHeaderContent>;
  const navItems =
    Array.isArray(src.navItems) && src.navItems.length > 0
      ? src.navItems.map((item, i) => {
          const fallback =
            DEFAULT_HOME_HEADER.navItems[i] || DEFAULT_HOME_HEADER.navItems[0];
          const type = normalizeNavType(item?.type ?? fallback.type);
          return {
            type,
            label: String(item?.label || fallback.label).trim(),
            href:
              type === "specialities"
                ? ""
                : String(item?.href || fallback.href || "/").trim(),
          };
        })
      : DEFAULT_HOME_HEADER.navItems;

  return {
    logoUrl: src.logoUrl || DEFAULT_HOME_HEADER.logoUrl,
    logoAlt: src.logoAlt || DEFAULT_HOME_HEADER.logoAlt,
    logoHref: src.logoHref || DEFAULT_HOME_HEADER.logoHref,
    navItems,
    contactLabel: src.contactLabel || DEFAULT_HOME_HEADER.contactLabel,
    contactHref: src.contactHref || DEFAULT_HOME_HEADER.contactHref,
  };
}

export async function fetchPublicHomeHeader(): Promise<HomeHeaderContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-header/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Header");
  }
  return mergeHomeHeader(data.data);
}

export async function fetchHomeHeader(): Promise<HomeHeaderContent> {
  const response = await fetch(apiUrl("/api/pages/home-header"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Header");
  }
  return mergeHomeHeader(data.data);
}

export async function updateHomeHeader(
  payload: HomeHeaderContent
): Promise<HomeHeaderContent> {
  const response = await fetch(apiUrl("/api/pages/home-header"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home Header");
  }
  notifyCmsUpdated("home-header");
  return mergeHomeHeader(data.data);
}

export { uploadPageImage };
