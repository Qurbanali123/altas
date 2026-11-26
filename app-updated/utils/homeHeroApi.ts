import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { uploadPageImage } from "@/utils/ctaApi";

export interface HomeHeroContent {
  backgroundImageUrl: string;
  titleDesktop: string;
  titleDesktopAccent: string;
  titleMobileMain: string;
  titleMobileAccent: string;
  subtitleDesktop: string;
  subtitleMobileLine1: string;
  subtitleMobileLine2: string;
  subscribeCardText: string;
  subscribeCardBgUrl: string;
  subscribeButtonLabel: string;
  bookingCardText: string;
  bookingCardIconUrl: string;
  bookingCardHref: string;
  doctorImageUrl: string;
  doctorImageAlt: string;
}

export const DEFAULT_HOME_HERO: HomeHeroContent = {
  backgroundImageUrl: "/images/bg.png",
  titleDesktop: "L' art du sourire",
  titleDesktopAccent: "naturel.",
  titleMobileMain: "L' art du sourire ",
  titleMobileAccent: "naturel.",
  subtitleDesktop:
    "Des soins dentaires précis et personnalisés réalisés avec expertise et attention.",
  subtitleMobileLine1:
    "Des soins dentaires précis et personnalisés réalisés avec",
  subtitleMobileLine2: "expertise et attention.",
  subscribeCardText: "Abonnez-vous à\nnos actualités et\nmises à jour",
  subscribeCardBgUrl: "/images/cardhero.jpg",
  subscribeButtonLabel: "S'abonner",
  bookingCardText: "Réservation en ligne instantanée",
  bookingCardIconUrl: "/images/teeth.png",
  bookingCardHref: "/pages/Appointment",
  doctorImageUrl: "/images/udrimage.png",
  doctorImageAlt: "Dental doctor",
};

export function mergeHomeHero(
  data?: Partial<HomeHeroContent> | null
): HomeHeroContent {
  const src = (data ?? {}) as Partial<HomeHeroContent>;
  return {
    backgroundImageUrl:
      src.backgroundImageUrl || DEFAULT_HOME_HERO.backgroundImageUrl,
    titleDesktop: src.titleDesktop || DEFAULT_HOME_HERO.titleDesktop,
    titleDesktopAccent:
      src.titleDesktopAccent || DEFAULT_HOME_HERO.titleDesktopAccent,
    titleMobileMain: src.titleMobileMain || DEFAULT_HOME_HERO.titleMobileMain,
    titleMobileAccent:
      src.titleMobileAccent || DEFAULT_HOME_HERO.titleMobileAccent,
    subtitleDesktop: src.subtitleDesktop || DEFAULT_HOME_HERO.subtitleDesktop,
    subtitleMobileLine1:
      src.subtitleMobileLine1 || DEFAULT_HOME_HERO.subtitleMobileLine1,
    subtitleMobileLine2:
      src.subtitleMobileLine2 || DEFAULT_HOME_HERO.subtitleMobileLine2,
    subscribeCardText:
      src.subscribeCardText || DEFAULT_HOME_HERO.subscribeCardText,
    subscribeCardBgUrl:
      src.subscribeCardBgUrl || DEFAULT_HOME_HERO.subscribeCardBgUrl,
    subscribeButtonLabel:
      src.subscribeButtonLabel || DEFAULT_HOME_HERO.subscribeButtonLabel,
    bookingCardText: src.bookingCardText || DEFAULT_HOME_HERO.bookingCardText,
    bookingCardIconUrl:
      src.bookingCardIconUrl || DEFAULT_HOME_HERO.bookingCardIconUrl,
    bookingCardHref: src.bookingCardHref || DEFAULT_HOME_HERO.bookingCardHref,
    doctorImageUrl: src.doctorImageUrl || DEFAULT_HOME_HERO.doctorImageUrl,
    doctorImageAlt: src.doctorImageAlt || DEFAULT_HOME_HERO.doctorImageAlt,
  };
}

export async function fetchPublicHomeHero(): Promise<HomeHeroContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-hero/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Hero");
  }
  return mergeHomeHero(data.data);
}

export async function fetchHomeHero(): Promise<HomeHeroContent> {
  const response = await fetch(apiUrl("/api/pages/home-hero"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Hero");
  }
  return mergeHomeHero(data.data);
}

export async function updateHomeHero(
  payload: HomeHeroContent
): Promise<HomeHeroContent> {
  const response = await fetch(apiUrl("/api/pages/home-hero"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home Hero");
  }
  notifyCmsUpdated("home-hero");
  return mergeHomeHero(data.data);
}

export { uploadPageImage };
