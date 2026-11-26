import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface NotreCentreStep {
  num: number;
  title: string;
  body: string;
  imgSrc: string;
}

export interface NotreCentreSlide {
  src: string;
  alt: string;
}

export interface NotreCentrePageContent {
  hero: {
    title: string;
    imageUrl: string;
  };
  introBoldLead: string;
  introParagraphs: string[];
  expectTitle: string;
  steps: NotreCentreStep[];
  exploreTitle: string;
  slides: NotreCentreSlide[];
}

export const DEFAULT_NOTRE_CENTRE_CONTENT: NotreCentrePageContent = {
  hero: {
    title: "Notre centre",
    imageUrl: "/images/notrecenter.jpeg",
  },
  introBoldLead: "Atlas Dental Center a été ",
  introParagraphs: [
    "conçu selon les standards les plus exigeants de la dentisterie moderne. Pensé pour offrir une expérience de soins optimale, notre centre intègre les dernières avancées technologiques en matière de diagnostic, d’imagerie et de dentisterie numérique. Équipé d’un scanner intra-oral, d’une radiologie numérique de haute précision, d’un laser et de technologies 3D, il permet une prise en charge plus précise, plus confortable et plus efficace.",
    "L’architecture du centre a été imaginée pour allier innovation, fonctionnalité et sérénité. Chaque espace a été conçu avec soin afin d’offrir un environnement élégant, apaisant et parfaitement adapté aux exigences de la pratique moderne.",
    "À travers ses équipements de dernière génération et son engagement constant envers l’innovation, Atlas Dental Center incarne une vision moderne de la dentisterie, où technologie, précision et excellence se rencontrent au service de chaque patient.",
  ],
  expectTitle: "À quoi s'attendre...",
  steps: [
    {
      num: 1,
      title: "Avant votre visite",
      imgSrc: "/images/step1.jpeg",
      body: "La prise de rendez-vous est simple et rapide. Vous pouvez réserver directement en ligne via notre site internet, nous contacter sur WhatsApp ou joindre notre équipe par téléphone grâce à nos deux numéros dédiés. Nous restons à votre disposition pour vous accompagner et répondre à toutes vos questions avant votre visite.",
    },
    {
      num: 2,
      title: "Dans le studio",
      imgSrc: "/images/slide1.jpeg",
      body: "Vous serez accueilli dans un environnement calme et moderne, conçu pour votre confort. Chaque consultation débute par une écoute attentive de vos besoins, suivie d’un examen clinique approfondi et, si nécessaire, d’examens complémentaires réalisés à l’aide de nos technologies de pointe. Nous prenons le temps de vous expliquer clairement les différentes options de traitement afin que vous puissiez prendre vos décisions en toute confiance.",
    },
    {
      num: 3,
      title: "Après ton départ",
      imgSrc: "/images/visite1.png",
      body: "À l’issue de votre rendez-vous, vous recevrez toutes les recommandations nécessaires au bon suivi de votre traitement. Notre équipe reste disponible pour répondre à vos interrogations et assurer un accompagnement personnaliséet rigoureux.",
    },
  ],
  exploreTitle: "Explore our space",
  slides: [
    { src: "/images/slide1.jpeg", alt: "Salle de traitement 1" },
    { src: "/images/slide2.jpeg", alt: "Salle de traitement 2" },
    { src: "/images/slide3.jpeg", alt: "Salle d'attente" },
    { src: "/images/slide4.jpeg", alt: "Salle d'attente" },
    { src: "/images/slide5.jpeg", alt: "Salle d'attente" },
  ],
};

function mergeNotreCentreContent(
  data?: Partial<NotreCentrePageContent> | null
): NotreCentrePageContent {
  const hero = (data?.hero ?? {}) as Partial<NotreCentrePageContent["hero"]>;
  const paragraphs =
    Array.isArray(data?.introParagraphs) && data.introParagraphs.length > 0
      ? data.introParagraphs
      : DEFAULT_NOTRE_CENTRE_CONTENT.introParagraphs;
  const steps =
    Array.isArray(data?.steps) && data.steps.length > 0
      ? data.steps
      : DEFAULT_NOTRE_CENTRE_CONTENT.steps;
  const slides =
    Array.isArray(data?.slides) && data.slides.length > 0
      ? data.slides
      : DEFAULT_NOTRE_CENTRE_CONTENT.slides;

  return {
    hero: {
      title: hero.title || DEFAULT_NOTRE_CENTRE_CONTENT.hero.title,
      imageUrl: hero.imageUrl || DEFAULT_NOTRE_CENTRE_CONTENT.hero.imageUrl,
    },
    introBoldLead:
      data?.introBoldLead != null && String(data.introBoldLead).length > 0
        ? String(data.introBoldLead)
        : DEFAULT_NOTRE_CENTRE_CONTENT.introBoldLead,
    introParagraphs: paragraphs.map((p) => String(p || "").trim()).filter(Boolean),
    expectTitle: data?.expectTitle || DEFAULT_NOTRE_CENTRE_CONTENT.expectTitle,
    steps: steps.map((step, i) => ({
      num: Number(step?.num) || i + 1,
      title: String(step?.title || "").trim(),
      body: String(step?.body || "").trim(),
      imgSrc: String(step?.imgSrc || "").trim(),
    })),
    exploreTitle: data?.exploreTitle || DEFAULT_NOTRE_CENTRE_CONTENT.exploreTitle,
    slides: slides.map((slide) => ({
      src: String(slide?.src || "").trim(),
      alt: String(slide?.alt || "").trim(),
    })),
  };
}

export async function fetchPublicNotreCentreContent(): Promise<NotreCentrePageContent> {
  try {
    const response = await publicCmsFetch(
      apiUrl(`/api/pages/notre-centre/public?t=${Date.now()}`),
      { cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load Notre centre content");
    }
    return mergeNotreCentreContent(data.data);
  } catch {
    return DEFAULT_NOTRE_CENTRE_CONTENT;
  }
}

export async function fetchNotreCentreContent(): Promise<NotreCentrePageContent> {
  const response = await fetch(apiUrl("/api/pages/notre-centre"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Notre centre content");
  }
  return mergeNotreCentreContent(data.data);
}

export async function updateNotreCentreContent(
  payload: NotreCentrePageContent
): Promise<NotreCentrePageContent> {
  const response = await fetch(apiUrl("/api/pages/notre-centre"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Notre centre content");
  }
  notifyCmsUpdated("notre-centre");
  return mergeNotreCentreContent(data.data);
}

export { uploadPageImage } from "@/utils/ctaApi";
