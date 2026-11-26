import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import { notifyCmsUpdated } from "@/utils/cmsLiveSync";
import { authHeaders } from "@/utils/staffsApi";

export interface HomeFaqItem {
  id: string;
  q: string;
  a: string;
}

export interface HomeFaqCategory {
  id: string;
  name: string;
  items: HomeFaqItem[];
}

export interface HomeFaqContent {
  title: string;
  body: string;
  categories: HomeFaqCategory[];
}

export const DEFAULT_HOME_FAQ: HomeFaqContent = {
  title: "Frequently Asked Questions (FAQ)",
  body: "Explorez les questions les plus fréquentes sur nos traitements, notre approche clinique et les technologies modernes utilisées au sein du centre.",
  categories: [
    {
      id: "soins-generaux",
      name: "Soins Généraux",
      items: [
        {
          id: "sg-1",
          q: "Les soins dentaires sont-ils douloureux ?",
          a: "Les techniques modernes et les anesthésies utilisées permettent de réaliser les soins dans des conditions optimales de confort.",
        },
        {
          id: "sg-2",
          q: "À quelle fréquence faut-il consulter ?",
          a: "Un contrôle tous les 6 à 12 mois est recommandé afin de prévenir les problèmes bucco-dentaires et maintenir une bonne santé orale.",
        },
        {
          id: "sg-3",
          q: "Combien de détartrages faut-il faire par an ?",
          a: "Un à deux détartrages par an sont généralement recommandés selon l'hygiène bucco-dentaire et les besoins de chaque patient.",
        },
        {
          id: "sg-4",
          q: "Prenez-vous en charge les urgences dentaires ?",
          a: "Oui, les urgences dentaires sont prises en charge rapidement afin de soulager douleur et inconfort.",
        },
      ],
    },
    {
      id: "esthetique",
      name: "Esthétique du Sourire",
      items: [
        {
          id: "es-1",
          q: "Qu'est-ce que le Smile Design ?",
          a: "Le SmileDesign permet d'analyser et planifier l'esthétique du sourire afin d'obtenir un résultat harmonieux et personnalisé.",
        },
        {
          id: "es-2",
          q: "Proposez-vous le blanchiment au fauteuil ou par gouttières ?",
          a: "Le centre propose le blanchiment au fauteuil, le blanchiment ambulatoire par gouttières, ou une combinaison des deux selon les besoins et objectifs du patient.",
        },
        {
          id: "es-3",
          q: "Quelle est la durée d'un blanchiment dentaire ?",
          a: "Une séance dure généralement entre 45 minutes et 1h30 selon le protocole et les besoins du patient.",
        },
        {
          id: "es-4",
          q: "Le blanchiment dentaire abîme-t-il les dents ?",
          a: "Réalisé sous contrôle professionnel, le blanchiment respecte les structures dentaires et suit des protocoles sécurisés.",
        },
        {
          id: "es-5",
          q: "Les facettes dentaires donnent-elles un résultat naturel ?",
          a: "Les facettes sont conçues pour s'intégrer harmonieusement au sourire tout en respectant l'esthétique naturelle du visage.",
        },
      ],
    },
    {
      id: "orthodontie",
      name: "Orthodontie & Aligneurs",
      items: [
        {
          id: "or-1",
          q: "Proposez-vous des aligneurs invisibles ?",
          a: "Oui, des traitements par aligneurs transparents sont proposés pour corriger l'alignement dentaire discrètement.",
        },
        {
          id: "or-2",
          q: "L'orthodontie est-elle réservée aux adolescents ?",
          a: "Non, les traitements orthodontiques peuvent être réalisés à tout âge selon les besoins du patient.",
        },
        {
          id: "or-3",
          q: "Combien de temps dure un traitement orthodontique ?",
          a: "La durée varie selon la complexité du cas et les objectifs du traitement.",
        },
      ],
    },
    {
      id: "implants",
      name: "Implants & Réhabilitation",
      items: [
        {
          id: "im-1",
          q: "Est-il important de remplacer rapidement une dent absente ?",
          a: "Oui, remplacer une dent manquante permet de préserver l'équilibre de l'occlusion, la fonction masticatoire et l'alignement des dents voisines.",
        },
        {
          id: "im-2",
          q: "Les implants dentaires sont-ils durables ?",
          a: "Les implants constituent une solution fiable et durable lorsqu'ils sont correctement entretenus.",
        },
        {
          id: "im-3",
          q: "Peut-on remplacer plusieurs dents manquantes ?",
          a: "Oui, différentes solutions de réhabilitation permettent de restaurer fonction et esthétique du sourire.",
        },
        {
          id: "im-4",
          q: "Quelle est la différence entre une couronne et un bridge ?",
          a: "Une couronne restaure une dent tandis qu'un bridge permet de remplacer une ou plusieurs dents absentes.",
        },
      ],
    },
    {
      id: "endodontie",
      name: "Endodontie & Soins Conservateurs",
      items: [
        {
          id: "en-1",
          q: "Pourquoi utiliser un microscope en endodontie ?",
          a: "Le microscope opératoire améliore la visualisation du système canalaire et la précision des traitements.",
        },
        {
          id: "en-2",
          q: "Peut-on sauver une dent infectée ?",
          a: "Dans de nombreux cas, un traitement endodontique permet de conserver la dent naturelle.",
        },
      ],
    },
    {
      id: "numerique",
      name: "Dentisterie Numérique",
      items: [
        {
          id: "dn-1",
          q: "Utilisez-vous des technologies numériques ?",
          a: "Le cabinet est équipé de technologies modernes telles que le scanner intra-oral, l'imagerie 3D (CBCT) et le laser.",
        },
        {
          id: "dn-2",
          q: "Le scanner intra-oral remplace-t-il les empreintes classiques ?",
          a: "Oui, il permet de réaliser des empreintes numériques plus confortables et précises.",
        },
        {
          id: "dn-3",
          q: "Qu'est-ce que l'imagerie 3D CBCT ?",
          a: "Le CBCT permet une analyse tridimensionnelle précise pour améliorer le diagnostic et la planification des traitements.",
        },
        {
          id: "dn-4",
          q: "Quels sont les avantages de la dentisterie numérique ?",
          a: "Elle permet des traitements plus précis, plus confortables et une meilleure prévisibilité des résultats.",
        },
      ],
    },
    {
      id: "confort",
      name: "Confort & Expérience Patient",
      items: [
        {
          id: "co-1",
          q: "Les soins sont-ils adaptés aux patients anxieux ?",
          a: "Une approche douce et personnalisée est privilégiée afin d'assurer une expérience rassurante et confortable.",
        },
        {
          id: "co-2",
          q: "Qu'est-ce que la sédation consciente ?",
          a: "La sédation consciente au protoxyde d'azote aide à réduire le stress et améliorer le confort pendant les soins.",
        },
        {
          id: "co-3",
          q: "Les enfants peuvent-ils être pris en charge au centre ?",
          a: "Oui, des soins adaptés aux enfants sont proposés dans une approche rassurante et bienveillante.",
        },
      ],
    },
  ],
};

function slugify(value: string, fallback: string): string {
  const s = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

export function newFaqCategoryId(name: string): string {
  return slugify(name, `category-${Date.now()}`);
}

export function newFaqItemId(prefix = "q"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function mergeHomeFaq(data?: Partial<HomeFaqContent> | null): HomeFaqContent {
  const src = (data ?? {}) as Partial<HomeFaqContent>;
  const categories =
    Array.isArray(src.categories) && src.categories.length > 0
      ? src.categories.map((cat, ci) => {
          const fallback =
            DEFAULT_HOME_FAQ.categories[ci] || DEFAULT_HOME_FAQ.categories[0];
          const items =
            Array.isArray(cat?.items) && cat.items.length > 0
              ? cat.items.map((item, ii) => {
                  const itemFallback = fallback.items[ii] || fallback.items[0];
                  return {
                    id: String(item?.id || itemFallback.id || newFaqItemId()).trim(),
                    q: String(item?.q || itemFallback.q || "").trim(),
                    a: String(item?.a || itemFallback.a || "").trim(),
                  };
                })
              : fallback.items;
          return {
            id: String(cat?.id || fallback.id || newFaqCategoryId(cat?.name || "")).trim(),
            name: String(cat?.name || fallback.name || "").trim(),
            items,
          };
        })
      : DEFAULT_HOME_FAQ.categories;

  return {
    title: src.title || DEFAULT_HOME_FAQ.title,
    body: src.body || DEFAULT_HOME_FAQ.body,
    categories,
  };
}

export async function fetchPublicHomeFaq(): Promise<HomeFaqContent> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-faq/public?t=${Date.now()}`),
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home FAQ");
  }
  return mergeHomeFaq(data.data);
}

export async function fetchHomeFaq(): Promise<HomeFaqContent> {
  const response = await fetch(apiUrl("/api/pages/home-faq"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load Home FAQ");
  }
  return mergeHomeFaq(data.data);
}

export async function updateHomeFaq(
  payload: HomeFaqContent
): Promise<HomeFaqContent> {
  const response = await fetch(apiUrl("/api/pages/home-faq"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update Home FAQ");
  }
  notifyCmsUpdated("home-faq");
  return mergeHomeFaq(data.data);
}
