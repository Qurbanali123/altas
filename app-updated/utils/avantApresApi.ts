import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface AvantApresCaseItem {
  label: string;
  imgSrc: string;
}

export interface AvantApresCategoryCases {
  category: string;
  items: AvantApresCaseItem[];
}

export interface AvantApresPageContent {
  hero: {
    title: string;
    body: string;
    imageUrl: string;
  };
  defaultCategory: string;
  categories: string[];
  cases: AvantApresCategoryCases[];
  cta: {
    title: string;
    body: string;
    buttonLabel: string;
    buttonHref: string;
    backgroundImageUrl: string;
    handImageUrl: string;
  };
}

export const DEFAULT_AVANT_APRES_CONTENT: AvantApresPageContent = {
  hero: {
    title: "Avant/Après",
    body: "Notre section Avant / Après présente de véritables transformations de sourire réalisées grâce à des soins dentaires personnalisés. Chaque cas montre le sourire du patient avant le traitement et le résultat après des procédures telles que les aligneurs transparents, le blanchiment des dents, les facettes ou le collage esthétique. Ces comparaisons démontrent comment des problèmes comme le mauvais alignement, la décoloration, les espaces entre les dents ou les dents ébréchées peuvent être améliorés grâce aux techniques dentaires modernes. En présentant des résultats visuels clairs accompagnés d'un bref aperçu du traitement effectué, nous aidons les patients à comprendre les améliorations possibles pour la santé bucco-dentaire et l'esthétique du sourire.",
    imageUrl: "/images/heartpic.png",
  },
  defaultCategory: "Dentisterie Esthétique",
  categories: [
    "Pédodontie",
    "Dentisterie Esthétique",
    "Chirurgie orale",
    "Aligneurs",
    "Endodontie",
    "Parodontologie",
    "Réhabilitation totale du sourire",
    "Implantologie",
    "Orthodontie",
    "Prothèse dentaire",
  ],
  cases: [
    {
      category: "Pédodontie",
      items: [
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
        { label: "Avant", imgSrc: "/images/teeth1.jpg" },
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
      ],
    },
    {
      category: "Dentisterie Esthétique",
      items: [
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
        { label: "Avant", imgSrc: "/images/teeth2.png" },
        { label: "Après", imgSrc: "/images/teeth3.jpg" },
        { label: "Avant", imgSrc: "/images/teeth1.jpg" },
        { label: "Après", imgSrc: "/images/teeth2.png" },
        { label: "Avant", imgSrc: "/images/teeth3.jpg" },
      ],
    },
    {
      category: "Chirurgie orale",
      items: [
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
        { label: "Avant", imgSrc: "/images/teeth1.jpg" },
      ],
    },
    {
      category: "Aligneurs",
      items: [
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
        { label: "Avant", imgSrc: "/images/teeth1.jpg" },
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
      ],
    },
    {
      category: "Endodontie",
      items: [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
    },
    {
      category: "Parodontologie",
      items: [
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
        { label: "Avant", imgSrc: "/images/teeth1.jpg" },
      ],
    },
    {
      category: "Réhabilitation totale du sourire",
      items: [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
    },
    {
      category: "Implantologie",
      items: [
        { label: "Après", imgSrc: "/images/teeth1.jpg" },
        { label: "Avant", imgSrc: "/images/teeth1.jpg" },
      ],
    },
    {
      category: "Orthodontie",
      items: [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
    },
    {
      category: "Prothèse dentaire",
      items: [{ label: "Après", imgSrc: "/images/teeth1.jpg" }],
    },
  ],
  cta: {
    title: "Planifiez votre visite",
    body: "Choisissez le créneau qui vous convient et notre équipe vous accueillera dans les meilleures conditions pour votre consultation.",
    buttonLabel: "Prendre rendez-vous",
    buttonHref: "/pages/Appointment",
    backgroundImageUrl: "/images/bgsub.png",
    handImageUrl: "/images/shand.png",
  },
};

export function casesToRecord(
  cases: AvantApresCategoryCases[]
): Record<string, AvantApresCaseItem[]> {
  const record: Record<string, AvantApresCaseItem[]> = {};
  for (const entry of cases) {
    if (!entry?.category) continue;
    record[entry.category] = Array.isArray(entry.items) ? entry.items : [];
  }
  return record;
}

function mergeAvantApresContent(
  data?: Partial<AvantApresPageContent> | null
): AvantApresPageContent {
  const hero = (data?.hero ?? {}) as Partial<AvantApresPageContent["hero"]>;
  const cta = (data?.cta ?? {}) as Partial<AvantApresPageContent["cta"]>;
  const categories =
    Array.isArray(data?.categories) && data.categories.length > 0
      ? data.categories
      : DEFAULT_AVANT_APRES_CONTENT.categories;
  const cases =
    Array.isArray(data?.cases) && data.cases.length > 0
      ? data.cases
      : DEFAULT_AVANT_APRES_CONTENT.cases;

  return {
    hero: {
      title: hero.title || DEFAULT_AVANT_APRES_CONTENT.hero.title,
      body: hero.body || DEFAULT_AVANT_APRES_CONTENT.hero.body,
      imageUrl: hero.imageUrl || DEFAULT_AVANT_APRES_CONTENT.hero.imageUrl,
    },
    defaultCategory:
      data?.defaultCategory || DEFAULT_AVANT_APRES_CONTENT.defaultCategory,
    categories,
    cases: cases.map((entry) => ({
      category: entry?.category || "",
      items: (entry?.items || []).map((item) => ({
        label: item?.label || "Après",
        imgSrc: item?.imgSrc || "",
      })),
    })),
    cta: {
      title: cta.title || DEFAULT_AVANT_APRES_CONTENT.cta.title,
      body: cta.body || DEFAULT_AVANT_APRES_CONTENT.cta.body,
      buttonLabel: cta.buttonLabel || DEFAULT_AVANT_APRES_CONTENT.cta.buttonLabel,
      buttonHref: cta.buttonHref || DEFAULT_AVANT_APRES_CONTENT.cta.buttonHref,
      backgroundImageUrl:
        cta.backgroundImageUrl ||
        DEFAULT_AVANT_APRES_CONTENT.cta.backgroundImageUrl,
      handImageUrl:
        cta.handImageUrl || DEFAULT_AVANT_APRES_CONTENT.cta.handImageUrl,
    },
  };
}

export async function fetchPublicAvantApresContent(): Promise<AvantApresPageContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/pages/avant-apres/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load Avant/Après content");
    }
    return mergeAvantApresContent(data.data);
  } catch {
    return DEFAULT_AVANT_APRES_CONTENT;
  }
}

export async function fetchAvantApresContent(): Promise<AvantApresPageContent> {
  const response = await fetch(apiUrl("/api/pages/avant-apres"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Avant/Après content");
  }
  return mergeAvantApresContent(data.data);
}

export async function updateAvantApresContent(
  payload: AvantApresPageContent
): Promise<AvantApresPageContent> {
  const response = await fetch(apiUrl("/api/pages/avant-apres"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Avant/Après content");
  }
  notifyCmsUpdated("avant-apres");
  return mergeAvantApresContent(data.data);
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
