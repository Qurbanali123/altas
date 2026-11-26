import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { uploadPageImage } from "@/utils/ctaApi";
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
} from "@/utils/socialLinks";

/** Magical href: resolved at runtime to the first published specialty page. */
export const FOOTER_SPECIALITIES_HREF = "__specialities__";

export interface HomeFooterNavItem {
  label: string;
  href: string;
}

export interface HomeFooterContent {
  logoUrl: string;
  logoAlt: string;
  backgroundImageUrl: string;
  newsletterLabel: string;
  newsletterPlaceholder: string;
  navigationTitle: string;
  hoursTitle: string;
  contactsTitle: string;
  navItems: HomeFooterNavItem[];
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  privacyLabel: string;
  privacyHref: string;
  termsLabel: string;
  termsHref: string;
  creditText: string;
}

export const DEFAULT_HOME_FOOTER: HomeFooterContent = {
  logoUrl: "/images/logo.png",
  logoAlt: "Atlas Dental Center",
  backgroundImageUrl: "/images/footerbg.png",
  newsletterLabel: "SUBSCRIBE TO OUR NEWSLETTER",
  newsletterPlaceholder: "Votre email",
  navigationTitle: "Navigation",
  hoursTitle: "Horaire",
  contactsTitle: "Contacts",
  navItems: [
    { label: "Accueil", href: "/" },
    { label: "Notre centre", href: "/pages/notre-centre" },
    { label: "Nos spécialités", href: FOOTER_SPECIALITIES_HREF },
    { label: "Notre équipe", href: "/pages/notre-equipe" },
    { label: "Blogs", href: "/pages/Blogs" },
  ],
  instagramUrl: INSTAGRAM_URL,
  facebookUrl: FACEBOOK_URL,
  linkedinUrl: LINKEDIN_URL,
  privacyLabel: "Privacy Policy",
  privacyHref: "/pages/Privacy_Policy",
  termsLabel: "Terms & Conditions",
  termsHref: "/pages/Terms_condition",
  creditText: "Designed & Developed by SMB DigitalZone",
};

export function mergeHomeFooter(
  data?: Partial<HomeFooterContent> | null
): HomeFooterContent {
  const src = (data ?? {}) as Partial<HomeFooterContent>;
  const navItems =
    Array.isArray(src.navItems) && src.navItems.length > 0
      ? src.navItems.map((item, i) => {
          const fallback =
            DEFAULT_HOME_FOOTER.navItems[i] || DEFAULT_HOME_FOOTER.navItems[0];
          return {
            label: String(item?.label || fallback.label).trim(),
            href: String(item?.href || fallback.href).trim(),
          };
        })
      : DEFAULT_HOME_FOOTER.navItems;

  return {
    logoUrl: src.logoUrl || DEFAULT_HOME_FOOTER.logoUrl,
    logoAlt: src.logoAlt || DEFAULT_HOME_FOOTER.logoAlt,
    backgroundImageUrl:
      src.backgroundImageUrl || DEFAULT_HOME_FOOTER.backgroundImageUrl,
    newsletterLabel: src.newsletterLabel || DEFAULT_HOME_FOOTER.newsletterLabel,
    newsletterPlaceholder:
      src.newsletterPlaceholder || DEFAULT_HOME_FOOTER.newsletterPlaceholder,
    navigationTitle: src.navigationTitle || DEFAULT_HOME_FOOTER.navigationTitle,
    hoursTitle: src.hoursTitle || DEFAULT_HOME_FOOTER.hoursTitle,
    contactsTitle: src.contactsTitle || DEFAULT_HOME_FOOTER.contactsTitle,
    navItems,
    instagramUrl: src.instagramUrl || DEFAULT_HOME_FOOTER.instagramUrl,
    facebookUrl: src.facebookUrl || DEFAULT_HOME_FOOTER.facebookUrl,
    linkedinUrl: src.linkedinUrl || DEFAULT_HOME_FOOTER.linkedinUrl,
    privacyLabel: src.privacyLabel || DEFAULT_HOME_FOOTER.privacyLabel,
    privacyHref: src.privacyHref || DEFAULT_HOME_FOOTER.privacyHref,
    termsLabel: src.termsLabel || DEFAULT_HOME_FOOTER.termsLabel,
    termsHref: src.termsHref || DEFAULT_HOME_FOOTER.termsHref,
    creditText: src.creditText || DEFAULT_HOME_FOOTER.creditText,
  };
}

export async function fetchPublicHomeFooter(): Promise<HomeFooterContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-footer/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Footer");
  }
  return mergeHomeFooter(data.data);
}

export async function fetchHomeFooter(): Promise<HomeFooterContent> {
  const response = await fetch(apiUrl("/api/pages/home-footer"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Footer");
  }
  return mergeHomeFooter(data.data);
}

export async function updateHomeFooter(
  payload: HomeFooterContent
): Promise<HomeFooterContent> {
  const response = await fetch(apiUrl("/api/pages/home-footer"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home Footer");
  }
  notifyCmsUpdated("home-footer");
  return mergeHomeFooter(data.data);
}

export { uploadPageImage };
