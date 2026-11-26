import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";
import { FACEBOOK_URL, INSTAGRAM_URL, LINKEDIN_URL } from "@/utils/socialLinks";
import { uploadPageImage } from "@/utils/ctaApi";

export interface AppointmentPageContent {
  pageTitle: string;
  formTitle: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  contactTitle: string;
  contactImageUrl: string;
  phones: string[];
  email: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
}

export const DEFAULT_APPOINTMENT_CONTENT: AppointmentPageContent = {
  pageTitle: "Prendre rendez-vous",
  formTitle: "Réservez votre rendez-vous",
  namePlaceholder: "Votre nom",
  emailPlaceholder: "Votre email",
  phonePlaceholder: "Votre téléphone",
  messagePlaceholder: "Votre message",
  submitLabel: "Envoyez",
  contactTitle: "Prenez contact",
  contactImageUrl: "/images/puzzle.png",
  phones: ["05 37 77 77 79", "06 68 20 10 10"],
  email: "contact@atlasdentalcenter.com",
  address: "Ang Av Atlas, 61 rue Oued Oum Errabi\nn. 5, 2ème étage, Agdal - RABAT",
  instagramUrl: INSTAGRAM_URL,
  facebookUrl: FACEBOOK_URL,
  linkedinUrl: LINKEDIN_URL,
};

function mergeAppointmentContent(
  data?: Partial<AppointmentPageContent> | null
): AppointmentPageContent {
  const src = data ?? {};
  const phones =
    Array.isArray(src.phones) && src.phones.length > 0
      ? src.phones.map((p) => String(p || "").trim()).filter(Boolean)
      : DEFAULT_APPOINTMENT_CONTENT.phones;

  return {
    pageTitle: src.pageTitle || DEFAULT_APPOINTMENT_CONTENT.pageTitle,
    formTitle: src.formTitle || DEFAULT_APPOINTMENT_CONTENT.formTitle,
    namePlaceholder:
      src.namePlaceholder || DEFAULT_APPOINTMENT_CONTENT.namePlaceholder,
    emailPlaceholder:
      src.emailPlaceholder || DEFAULT_APPOINTMENT_CONTENT.emailPlaceholder,
    phonePlaceholder:
      src.phonePlaceholder || DEFAULT_APPOINTMENT_CONTENT.phonePlaceholder,
    messagePlaceholder:
      src.messagePlaceholder || DEFAULT_APPOINTMENT_CONTENT.messagePlaceholder,
    submitLabel: src.submitLabel || DEFAULT_APPOINTMENT_CONTENT.submitLabel,
    contactTitle: src.contactTitle || DEFAULT_APPOINTMENT_CONTENT.contactTitle,
    contactImageUrl:
      src.contactImageUrl || DEFAULT_APPOINTMENT_CONTENT.contactImageUrl,
    phones,
    email: src.email || DEFAULT_APPOINTMENT_CONTENT.email,
    address: src.address || DEFAULT_APPOINTMENT_CONTENT.address,
    instagramUrl: src.instagramUrl || DEFAULT_APPOINTMENT_CONTENT.instagramUrl,
    facebookUrl: src.facebookUrl || DEFAULT_APPOINTMENT_CONTENT.facebookUrl,
    linkedinUrl: src.linkedinUrl || DEFAULT_APPOINTMENT_CONTENT.linkedinUrl,
  };
}

export async function fetchPublicAppointmentContent(): Promise<AppointmentPageContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/pages/appointment/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load Appointment content");
    }
    return mergeAppointmentContent(data.data);
  } catch {
    return DEFAULT_APPOINTMENT_CONTENT;
  }
}

export async function fetchAppointmentContent(): Promise<AppointmentPageContent> {
  const response = await fetch(apiUrl("/api/pages/appointment"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Appointment content");
  }
  return mergeAppointmentContent(data.data);
}

export async function updateAppointmentContent(
  payload: AppointmentPageContent
): Promise<AppointmentPageContent> {
  const response = await fetch(apiUrl("/api/pages/appointment"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Appointment content");
  }
  notifyCmsUpdated("appointment");
  return mergeAppointmentContent(data.data);
}

export { uploadPageImage };
