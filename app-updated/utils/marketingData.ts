export type DataSource = "database" | "estimated" | "placeholder";

export type MarketingStatCards = {
  newPatients: {
    count: number;
    growthPercent: number;
    growthLabel: string;
    subtitle: string;
    source: DataSource;
  };
  newsletterSubscribers: {
    count: number;
    growthPercent: number;
    growthLabel: string;
    subtitle: string;
    source: DataSource;
  };
};

export type SocialChannel = {
  id: string;
  label: string;
  count: number;
  valueLabel: string;
  comparisonLabel: string;
  pct: number;
  barColor: string;
  detail: string;
  source: DataSource;
};

export type PatientFlowItem = {
  label: string;
  sub: string;
  count: number;
  dot: string;
  source: DataSource;
};

export type EmailCampaign = {
  id: string;
  tag: string;
  tagColor: string;
  category: string;
  title: string;
  lastUsed: string;
  source: DataSource;
};

export type EmailAnalyticsSummary = {
  sentThisMonth: number;
  templatesUsedThisMonth: number;
  source: DataSource;
};

export type WeeklyPerformancePoint = {
  label: string;
  value: number;
};

export type MarketingOverview = {
  statCards: MarketingStatCards;
  socialChannels: SocialChannel[];
  patientFlow: PatientFlowItem[];
  emailCampaigns: EmailCampaign[];
  featuredEmailCampaign: EmailCampaign | null;
  emailAnalytics: EmailAnalyticsSummary;
  insight: string;
  weeklyPerformance: WeeklyPerformancePoint[];
  conversions: {
    newPatients: number;
    subscribers: number;
    convertedLeads: number;
    blogViews: number;
  };
  metadata: {
    lastUpdated: string;
    dataSources: Record<string, string>;
  };
};

export const DEFAULT_MARKETING_OVERVIEW: MarketingOverview = {
  statCards: {
    newPatients: {
      count: 0,
      growthPercent: 0,
      growthLabel: "0% Growth",
      subtitle: "This month from website bookings",
      source: "database",
    },
    newsletterSubscribers: {
      count: 0,
      growthPercent: 0,
      growthLabel: "0% Growth",
      subtitle: "0 new this month",
      source: "database",
    },
  },
  socialChannels: [],
  patientFlow: [],
  emailCampaigns: [],
  featuredEmailCampaign: null,
  emailAnalytics: {
    sentThisMonth: 0,
    templatesUsedThisMonth: 0,
    source: "database",
  },
  insight: "",
  weeklyPerformance: [],
  conversions: {
    newPatients: 0,
    subscribers: 0,
    convertedLeads: 0,
    blogViews: 0,
  },
  metadata: {
    lastUpdated: new Date(0).toISOString(),
    dataSources: {},
  },
};

function mergeArray<T>(value: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}

export function mergeMarketingOverview(
  partial: Partial<MarketingOverview> | undefined
): MarketingOverview {
  if (!partial) return DEFAULT_MARKETING_OVERVIEW;

  return {
    statCards: {
      newPatients: {
        ...DEFAULT_MARKETING_OVERVIEW.statCards.newPatients,
        ...partial.statCards?.newPatients,
      },
      newsletterSubscribers: {
        ...DEFAULT_MARKETING_OVERVIEW.statCards.newsletterSubscribers,
        ...partial.statCards?.newsletterSubscribers,
      },
    },
    socialChannels: mergeArray(partial.socialChannels, []),
    patientFlow: mergeArray(partial.patientFlow, []),
    emailCampaigns: mergeArray(partial.emailCampaigns, []),
    featuredEmailCampaign:
      partial.featuredEmailCampaign ?? DEFAULT_MARKETING_OVERVIEW.featuredEmailCampaign,
    emailAnalytics: {
      ...DEFAULT_MARKETING_OVERVIEW.emailAnalytics,
      ...partial.emailAnalytics,
    },
    insight: partial.insight ?? DEFAULT_MARKETING_OVERVIEW.insight,
    weeklyPerformance: mergeArray(partial.weeklyPerformance, []),
    conversions: {
      ...DEFAULT_MARKETING_OVERVIEW.conversions,
      ...partial.conversions,
    },
    metadata: {
      ...DEFAULT_MARKETING_OVERVIEW.metadata,
      ...partial.metadata,
      dataSources: {
        ...DEFAULT_MARKETING_OVERVIEW.metadata.dataSources,
        ...partial.metadata?.dataSources,
      },
    },
  };
}

export function validateMarketingOverview(data: unknown): data is MarketingOverview {
  if (!data || typeof data !== "object") return false;
  const d = data as MarketingOverview;
  return (
    Boolean(d.statCards?.newPatients) &&
    Boolean(d.statCards?.newsletterSubscribers) &&
    Array.isArray(d.socialChannels) &&
    Array.isArray(d.patientFlow)
  );
}
