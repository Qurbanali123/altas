import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { uploadPageImage } from "@/utils/ctaApi";

export interface HomeReviewItem {
  name: string;
  text: string;
}

export interface HomeReviewsContent {
  title: string;
  titleImageUrl: string;
  titleImageAlt: string;
  reviews: HomeReviewItem[];
}

export const DEFAULT_HOME_REVIEWS: HomeReviewsContent = {
  title: "Sourires Faits\nIci",
  titleImageUrl: "/images/review.png",
  titleImageAlt: "Sourires faits ici",
  reviews: [
    {
      name: "Nihad Cherkaoui Sellami.",
      text: "J'ai eu une urgence dentaire le jour de l'aid et Dr Ghita a gentiment accepté de me recevoir rapidement. Elle a pris le temps de m'expliquer l'origine du problème et de me soulager rapidement. Un grand merci pour ta bienveillance, je recommande vivement!.",
    },
    {
      name: "driss baddouri.",
      text: "Première visite à l'Atlas Dental Center et je suis pleinement satisfait. Une prise en charge sérieuse, des soins de qualité et une équipe professionnelle. Je recommande.",
    },
    {
      name: "youssef sehbani.",
      text: "Très beau cabinet accueillant. Médecin a l'écoute , travail minutieux et résultat satisfaisant . Très bonne expérience sachant que j'ai la phobie.",
    },
    {
      name: "REDA EL.",
      text: "I was very satisfied with my experience at this dental practice in Rabat. The dentist was very professional, attentive, and reassuring. The practice is modern, clean, and well-organized. I highly recommend it.",
    },
    {
      name: "Oumaima Ainouz.",
      text: "Docteur Ghita est très compétente et douce. Elle explique chaque étape avant d'agir, ce qui rend l'expérience rassurante. Le cabinet est moderne, équipé d'un matériel de pointe. Une excellente expérience, je recommande!",
    },
  ],
};

export function mergeHomeReviews(
  data?: Partial<HomeReviewsContent> | null
): HomeReviewsContent {
  const src = (data ?? {}) as Partial<HomeReviewsContent>;
  const reviews =
    Array.isArray(src.reviews) && src.reviews.length > 0
      ? src.reviews.map((r, i) => {
          const fallback =
            DEFAULT_HOME_REVIEWS.reviews[i] || DEFAULT_HOME_REVIEWS.reviews[0];
          return {
            name: String(r?.name || fallback.name).trim(),
            text: String(r?.text || fallback.text).trim(),
          };
        })
      : DEFAULT_HOME_REVIEWS.reviews;

  return {
    title: src.title || DEFAULT_HOME_REVIEWS.title,
    titleImageUrl: src.titleImageUrl || DEFAULT_HOME_REVIEWS.titleImageUrl,
    titleImageAlt: src.titleImageAlt || DEFAULT_HOME_REVIEWS.titleImageAlt,
    reviews,
  };
}

export async function fetchPublicHomeReviews(): Promise<HomeReviewsContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-reviews/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Reviews");
  }
  return mergeHomeReviews(data.data);
}

export async function fetchHomeReviews(): Promise<HomeReviewsContent> {
  const response = await fetch(apiUrl("/api/pages/home-reviews"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home Reviews");
  }
  return mergeHomeReviews(data.data);
}

export async function updateHomeReviews(
  payload: HomeReviewsContent
): Promise<HomeReviewsContent> {
  const response = await fetch(apiUrl("/api/pages/home-reviews"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home Reviews");
  }
  notifyCmsUpdated("home-reviews");
  return mergeHomeReviews(data.data);
}

export { uploadPageImage };
