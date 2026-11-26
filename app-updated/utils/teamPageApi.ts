import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface TeamPhilosophyCard {
  title: string;
  body: string;
  badge1Icon: string;
  badge1Text: string;
  badge2Icon: string;
  badge2Text: string;
}

export interface TeamJourneyCard {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  icon: string;
}

export interface TeamClinicalItem {
  icon: string;
  title: string;
  desc: string;
}

export interface TeamClinicalSpecialitiesCard {
  title: string;
  image: string;
  items: TeamClinicalItem[];
}

export interface TeamPageContent {
  philosophy: TeamPhilosophyCard;
  journey: TeamJourneyCard;
  clinicalSpecialities: TeamClinicalSpecialitiesCard;
}

export const DEFAULT_TEAM_PAGE_CONTENT: TeamPageContent = {
  philosophy: {
    title: "Notre philosophie",
    body: `"Notre approche repose sur une dentisterie fondée sur les preuves scientifiques (evidence-based dentistry), associée aux technologies les plus avancées et à une planification rigoureuse des traitements. Chaque décision clinique est guidée par les données scientifiques actuelles, avec pour objectif d'assurer des résultats prévisibles, durables et conformes aux standards internationaux les plus exigeants."`,
    badge1Icon: "/images/icon4.png",
    badge1Text: "BOARD CERTIFIED",
    badge2Icon: "/images/icon2.png",
    badge2Text: "5+ YEARS OF EXCELLENCE",
  },
  journey: {
    title: "Start Your Journey",
    subtitle: "Consultations available for cosmetic and restorative procedures.",
    buttonText: "Book Appointment",
    buttonLink: "/pages/Appointment",
    icon: "",
  },
  clinicalSpecialities: {
    title: "Clinical Specialities",
    image: "/images/chiar.png",
    items: [
      {
        icon: "/images/iconb1.png",
        title: "Cosmetic Sculpting",
        desc: "Minimal-prep veneers and digital smile design for natural aesthetics.",
      },
      {
        icon: "/images/Iconb2.png",
        title: "Biological Restorations",
        desc: "Biocompatible materials focused on long term systemic health.",
      },
      {
        icon: "/images/iconb3.png",
        title: "Precision Orthodontics",
        desc: "Advanced aligner therapy integrated with structural facial analysis.",
      },
      {
        icon: "/images/Iconb4.png",
        title: "Implant Microsurgery",
        desc: "High-resolution guided surgery for seamless tooth replacement.",
      },
    ],
  },
};

function mergeTeamPageContent(data?: Partial<TeamPageContent> | null): TeamPageContent {
  const philosophy: Partial<TeamPhilosophyCard> = data?.philosophy ?? {};
  const journey: Partial<TeamJourneyCard> = data?.journey ?? {};
  const clinical: Partial<TeamClinicalSpecialitiesCard> = data?.clinicalSpecialities ?? {};
  const items =
    Array.isArray(clinical.items) && clinical.items.length > 0
      ? clinical.items
      : DEFAULT_TEAM_PAGE_CONTENT.clinicalSpecialities.items;

  return {
    philosophy: {
      title: philosophy.title || DEFAULT_TEAM_PAGE_CONTENT.philosophy.title,
      body: philosophy.body || DEFAULT_TEAM_PAGE_CONTENT.philosophy.body,
      badge1Icon: philosophy.badge1Icon || DEFAULT_TEAM_PAGE_CONTENT.philosophy.badge1Icon,
      badge1Text: philosophy.badge1Text || DEFAULT_TEAM_PAGE_CONTENT.philosophy.badge1Text,
      badge2Icon: philosophy.badge2Icon || DEFAULT_TEAM_PAGE_CONTENT.philosophy.badge2Icon,
      badge2Text: philosophy.badge2Text || DEFAULT_TEAM_PAGE_CONTENT.philosophy.badge2Text,
    },
    journey: {
      title: journey.title || DEFAULT_TEAM_PAGE_CONTENT.journey.title,
      subtitle: journey.subtitle || DEFAULT_TEAM_PAGE_CONTENT.journey.subtitle,
      buttonText: journey.buttonText || DEFAULT_TEAM_PAGE_CONTENT.journey.buttonText,
      buttonLink: journey.buttonLink || DEFAULT_TEAM_PAGE_CONTENT.journey.buttonLink,
      icon: journey.icon || "",
    },
    clinicalSpecialities: {
      title: clinical.title || DEFAULT_TEAM_PAGE_CONTENT.clinicalSpecialities.title,
      image: clinical.image || DEFAULT_TEAM_PAGE_CONTENT.clinicalSpecialities.image,
      items: items.map((item) => ({
        icon: item?.icon || "",
        title: item?.title || "",
        desc: item?.desc || "",
      })),
    },
  };
}

export async function fetchPublicTeamPageContent(): Promise<TeamPageContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/staffs/team-page/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load team page content");
    }
    return mergeTeamPageContent(data.data);
  } catch {
    return DEFAULT_TEAM_PAGE_CONTENT;
  }
}

export async function fetchTeamPageContent(): Promise<TeamPageContent> {
  const response = await fetch(apiUrl("/api/staffs/team-page"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load team page content");
  }
  return mergeTeamPageContent(data.data);
}

export async function updateTeamPageContent(
  payload: TeamPageContent
): Promise<TeamPageContent> {
  const response = await fetch(apiUrl("/api/staffs/team-page"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update team page content");
  }
  notifyCmsUpdated("team-page");
  return mergeTeamPageContent(data.data);
}
