import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { FACEBOOK_URL, INSTAGRAM_URL, LINKEDIN_URL } from "@/utils/socialLinks";

export interface ContactPageContent {
  pageTitle: string;
  formTitle: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  infoIntro: string;
  mapEmbedUrl: string;
  phones: string[];
  email: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
}

export const DEFAULT_CONTACT_CONTENT: ContactPageContent = {
  pageTitle: "Connectez-vous avec nous",
  formTitle: "Prenez contact",
  namePlaceholder: "Votre nom",
  emailPlaceholder: "Votre email",
  messagePlaceholder: "Votre message",
  submitLabel: "Envoyez",
  infoIntro:
    "Borem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3307.8412092259664!2d-6.846475!3d33.9966122!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76dab52891b6f%3A0x3e544619ba730692!2sAtlas%20Dental%20Center%20-%20Dr%20Ghita%20Ouazzani%20T.!5e0!3m2!1sen!2s!4v1778524410125!5m2!1sen!2s",
  phones: ["05 37 77 77 79", "06 68 20 10 10"],
  email: "contact@atlasdentalcenter.com",
  address: "Ang Av Atlas, 61 rue Oued Oum Errabi\nn. 5, 2ème étage, Agdal - RABAT",
  instagramUrl: INSTAGRAM_URL,
  facebookUrl: FACEBOOK_URL,
  linkedinUrl: LINKEDIN_URL,
};

function mergeContactContent(
  data?: Partial<ContactPageContent> | null
): ContactPageContent {
  const src = data ?? {};
  const phones =
    Array.isArray(src.phones) && src.phones.length > 0
      ? src.phones.map((p) => String(p || "").trim()).filter(Boolean)
      : DEFAULT_CONTACT_CONTENT.phones;

  return {
    pageTitle: src.pageTitle || DEFAULT_CONTACT_CONTENT.pageTitle,
    formTitle: src.formTitle || DEFAULT_CONTACT_CONTENT.formTitle,
    namePlaceholder: src.namePlaceholder || DEFAULT_CONTACT_CONTENT.namePlaceholder,
    emailPlaceholder: src.emailPlaceholder || DEFAULT_CONTACT_CONTENT.emailPlaceholder,
    messagePlaceholder:
      src.messagePlaceholder || DEFAULT_CONTACT_CONTENT.messagePlaceholder,
    submitLabel: src.submitLabel || DEFAULT_CONTACT_CONTENT.submitLabel,
    infoIntro: src.infoIntro || DEFAULT_CONTACT_CONTENT.infoIntro,
    mapEmbedUrl: src.mapEmbedUrl || DEFAULT_CONTACT_CONTENT.mapEmbedUrl,
    phones,
    email: src.email || DEFAULT_CONTACT_CONTENT.email,
    address: src.address || DEFAULT_CONTACT_CONTENT.address,
    instagramUrl: src.instagramUrl || DEFAULT_CONTACT_CONTENT.instagramUrl,
    facebookUrl: src.facebookUrl || DEFAULT_CONTACT_CONTENT.facebookUrl,
    linkedinUrl: src.linkedinUrl || DEFAULT_CONTACT_CONTENT.linkedinUrl,
  };
}

export async function fetchPublicContactContent(): Promise<ContactPageContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/pages/contact/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load Contact content");
    }
    return mergeContactContent(data.data);
  } catch {
    return DEFAULT_CONTACT_CONTENT;
  }
}

export async function fetchContactContent(): Promise<ContactPageContent> {
  const response = await fetch(apiUrl("/api/pages/contact"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Contact content");
  }
  return mergeContactContent(data.data);
}

export async function updateContactContent(
  payload: ContactPageContent
): Promise<ContactPageContent> {
  const response = await fetch(apiUrl("/api/pages/contact"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Contact content");
  }
  notifyCmsUpdated("contact");
  return mergeContactContent(data.data);
}
