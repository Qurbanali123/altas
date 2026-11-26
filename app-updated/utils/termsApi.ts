import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface TermsSection {
  title: string;
  paragraphs: string[];
}

export interface TermsPageContent {
  eyebrow: string;
  title: string;
  updatedAt: string;
  sections: TermsSection[];
  contactText: string;
  contactEmail: string;
}

export const DEFAULT_TERMS_CONTENT: TermsPageContent = {
  eyebrow: "Informations Légales",
  title: "Conditions Générales\nd'Utilisation",
  updatedAt: "Dernière mise à jour : 24 Mai 2024",
  sections: [
    {
      title: "1. Introduction",
      paragraphs: [
        "Bienvenue sur le site web d'Atlas Dental Center. En accédant à ce site, vous acceptez de vous conformer aux présentes conditions générales d'utilisation. Ces conditions régissent votre utilisation de notre site web et des services fournis par Atlas Dental Center.",
        "Si vous n'acceptez pas ces conditions, nous vous prions de ne pas utiliser ce site. Nous nous réservons le droit de modifier ces termes à tout moment, et il vous appartient de les consulter régulièrement.",
      ],
    },
    {
      title: "2. Utilisation du Site",
      paragraphs: [
        "Le contenu de ce site est fourni à titre d'information générale uniquement. Bien que nous nous efforcions de maintenir les informations à jour et exactes, nous ne garantissons pas l'exhaustivité ou l'exactitude des informations médicales présentées.",
        "L'utilisation de ce site ne remplace en aucun cas une consultation médicale professionnelle, un diagnostic ou un traitement. Demandez toujours l'avis de votre dentiste ou d'un autre professionnel de santé qualifié pour toute question relative à une condition médicale.",
      ],
    },
    {
      title: "3. Propriété Intellectuelle",
      paragraphs: [
        "L'ensemble du contenu présent sur ce site, incluant les textes, graphismes, logos, images et codes sources, est la propriété exclusive d'Atlas Dental Center ou de ses concédants de licence et est protégé par les lois internationales sur le droit d'auteur.",
        "Toute reproduction, distribution ou modification de ce contenu sans l'autorisation écrite préalable d'Atlas Dental Center est strictement interdite.",
      ],
    },
    {
      title: "4. Confidentialité des Données",
      paragraphs: [
        "Votre vie privée est importante pour nous. Notre politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles. En utilisant notre site, vous consentez au traitement de vos données tel que décrit dans notre politique de confidentialité.",
      ],
    },
    {
      title: "5. Limitation de Responsabilité",
      paragraphs: [
        "Atlas Dental Center ne pourra être tenu responsable des dommages directs, indirects ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser ce site web ou les informations qu'il contient.",
      ],
    },
  ],
  contactText: "Pour toute question concernant ces conditions, veuillez nous contacter à :",
  contactEmail: "contact@atlasdentalcenter.com",
};

function mergeTermsContent(
  data?: Partial<TermsPageContent> | null
): TermsPageContent {
  const src = data ?? {};
  const sections =
    Array.isArray(src.sections) && src.sections.length > 0
      ? src.sections.map((s) => ({
          title: String(s?.title || "").trim(),
          paragraphs: Array.isArray(s?.paragraphs)
            ? s.paragraphs.map((p) => String(p || "").trim()).filter(Boolean)
            : [],
        }))
      : DEFAULT_TERMS_CONTENT.sections;

  return {
    eyebrow: src.eyebrow || DEFAULT_TERMS_CONTENT.eyebrow,
    title: src.title || DEFAULT_TERMS_CONTENT.title,
    updatedAt: src.updatedAt || DEFAULT_TERMS_CONTENT.updatedAt,
    sections,
    contactText: src.contactText || DEFAULT_TERMS_CONTENT.contactText,
    contactEmail: src.contactEmail || DEFAULT_TERMS_CONTENT.contactEmail,
  };
}

export async function fetchPublicTermsContent(): Promise<TermsPageContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/pages/terms/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load Terms content");
    }
    return mergeTermsContent(data.data);
  } catch {
    return DEFAULT_TERMS_CONTENT;
  }
}

export async function fetchTermsContent(): Promise<TermsPageContent> {
  const response = await fetch(apiUrl("/api/pages/terms"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Terms content");
  }
  return mergeTermsContent(data.data);
}

export async function updateTermsContent(
  payload: TermsPageContent
): Promise<TermsPageContent> {
  const response = await fetch(apiUrl("/api/pages/terms"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Terms content");
  }
  notifyCmsUpdated("terms");
  return mergeTermsContent(data.data);
}
