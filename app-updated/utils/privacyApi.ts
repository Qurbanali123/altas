import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface PrivacySection {
  title: string;
  content: string;
}

export interface PrivacyPageContent {
  title: string;
  updatedAt: string;
  sections: PrivacySection[];
}

export const DEFAULT_PRIVACY_CONTENT: PrivacyPageContent = {
  title: "Politique de\nConfidentialité",
  updatedAt: "Dernière mise à jour : 24 Mai 2024",
  sections: [
    {
      title: "Introduction",
      content:
        "Au Centre dentaire Atlas, nous accordons une grande importance à la protection de votre vie privée et nous nous engageons à protéger vos renseignements personnels. La présente politique de confidentialité décrit nos pratiques en matière de collecte, utilisation et divulgation de vos données lorsque vous utilisez nos services cliniques et notre site Web. Nous nous efforçons de maintenir les normes les plus élevées en matière d'intégrité des données et de confidentialité des patients.",
    },
    {
      title: "Collecte de données",
      content:
        "Nous collectons uniquement les données nécessaires à la fourniture de nos services dentaires. Cela inclut vos informations personnelles (nom, prénom, date de naissance), vos coordonnées (adresse, téléphone, email), ainsi que vos antécédents médicaux et dentaires indispensables à votre prise en charge.",
    },
    {
      title: "Comment nous utilisons vos informations",
      content:
        "Vos informations sont utilisées exclusivement pour vous fournir des soins dentaires de qualité, gérer vos rendez-vous, vous envoyer des rappels et communications liés à votre traitement, et respecter nos obligations légales et réglementaires en matière de santé.",
    },
    {
      title: "Coordonnées",
      content:
        "Pour toute question relative à cette politique de confidentialité ou à l'utilisation de vos données personnelles, veuillez nous contacter à : contact@atlasdentalcenter.com ou par téléphone au 05 37 77 77 79.",
    },
  ],
};

function mergePrivacyContent(
  data?: Partial<PrivacyPageContent> | null
): PrivacyPageContent {
  const src = data ?? {};
  const sections =
    Array.isArray(src.sections) && src.sections.length > 0
      ? src.sections.map((s) => ({
          title: String(s?.title || "").trim(),
          content: String(s?.content || "").trim(),
        }))
      : DEFAULT_PRIVACY_CONTENT.sections;

  return {
    title: src.title || DEFAULT_PRIVACY_CONTENT.title,
    updatedAt: src.updatedAt || DEFAULT_PRIVACY_CONTENT.updatedAt,
    sections,
  };
}

export async function fetchPublicPrivacyContent(): Promise<PrivacyPageContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/pages/privacy/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load Privacy content");
    }
    return mergePrivacyContent(data.data);
  } catch {
    return DEFAULT_PRIVACY_CONTENT;
  }
}

export async function fetchPrivacyContent(): Promise<PrivacyPageContent> {
  const response = await fetch(apiUrl("/api/pages/privacy"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Privacy content");
  }
  return mergePrivacyContent(data.data);
}

export async function updatePrivacyContent(
  payload: PrivacyPageContent
): Promise<PrivacyPageContent> {
  const response = await fetch(apiUrl("/api/pages/privacy"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Privacy content");
  }
  notifyCmsUpdated("privacy");
  return mergePrivacyContent(data.data);
}
