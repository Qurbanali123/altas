import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { uploadPageImage } from "@/utils/ctaApi";

export interface HomeAboutContent {
  eyebrow: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imageAlt: string;
}

export const DEFAULT_HOME_ABOUT: HomeAboutContent = {
  eyebrow: "À propos",
  title: "Dr. Ghita Ouazzani Tnacheri",
  paragraph1:
    "Dr Ghita Ouazzani Tnacheri, diplômée de la Faculté de Médecine Dentaire de Rabat – Université Mohammed V, adopte une approche moderne de la dentisterie alliant expertise clinique, innovation et esthétique. Elle accorde une grande importance aux détails, au confort du patient et aux techniques les plus récentes, garantissant une prise en charge rigoureuse conforme aux standards internationaux les plus élevés.",
  paragraph2:
    "Animée par une recherche constante d'excellence, elle enrichit sa pratique grâce à des formations avancées en dentisterie esthétique et numérique, orthodontie, endodontie, pédodontie, urgences, prothèse et réhabilitation orale. Titulaire d'un Diplôme Universitaire d'Orthodontie de l'Université de Murcie en Espagne et formée à Barcelone en dentisterie esthétique et réhabilitation du sourire, elle adopte une approche multidisciplinaire alliant précision et esthétique.",
  buttonLabel: "Prendre rendez-vous",
  buttonHref: "/pages/Appointment",
  imageUrl: "/images/aboutDoc.png",
  imageAlt: "Dr. Ghita Ouazzani Tnacheri",
};

export function mergeHomeAbout(
  data?: Partial<HomeAboutContent> | null
): HomeAboutContent {
  const src = (data ?? {}) as Partial<HomeAboutContent>;
  return {
    eyebrow: src.eyebrow || DEFAULT_HOME_ABOUT.eyebrow,
    title: src.title || DEFAULT_HOME_ABOUT.title,
    paragraph1: src.paragraph1 || DEFAULT_HOME_ABOUT.paragraph1,
    paragraph2: src.paragraph2 || DEFAULT_HOME_ABOUT.paragraph2,
    buttonLabel: src.buttonLabel || DEFAULT_HOME_ABOUT.buttonLabel,
    buttonHref: src.buttonHref || DEFAULT_HOME_ABOUT.buttonHref,
    imageUrl: src.imageUrl || DEFAULT_HOME_ABOUT.imageUrl,
    imageAlt: src.imageAlt || DEFAULT_HOME_ABOUT.imageAlt,
  };
}

export async function fetchPublicHomeAbout(): Promise<HomeAboutContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-about/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home About");
  }
  return mergeHomeAbout(data.data);
}

export async function fetchHomeAbout(): Promise<HomeAboutContent> {
  const response = await fetch(apiUrl("/api/pages/home-about"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home About");
  }
  return mergeHomeAbout(data.data);
}

export async function updateHomeAbout(
  payload: HomeAboutContent
): Promise<HomeAboutContent> {
  const response = await fetch(apiUrl("/api/pages/home-about"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home About");
  }
  notifyCmsUpdated("home-about");
  return mergeHomeAbout(data.data);
}

export { uploadPageImage };
