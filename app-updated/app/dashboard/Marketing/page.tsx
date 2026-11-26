"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { getToken, getAdmin } from "@/utils/auth";
import { useMarketingOverview } from "@/utils/useMarketingOverview";
import { channelIcon } from "@/components/admin/marketing/MarketingChannelIcons";

export default function MarketingPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  const card = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder = isDark ? "border-[#753141]" : "border-[#753141]";
  const cardInner = isDark ? "#d0baa3" : "#FFFFFF";
  const text1 = isDark ? "#591727" : "#591727";
  const text2 = isDark ? "#591727" : "#7A6040";

  const { data, loading, error, refresh } = useMarketingOverview();
  const [activeChannel, setActiveChannel] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    const admin = getAdmin();
    if (!token || !admin) {
      router.push("/login");
    }
  }, [router]);

  const { statCards, socialChannels, patientFlow, featuredEmailCampaign, emailAnalytics, insight } = data;
  const growthBadge = statCards.newPatients.growthPercent;
  const growthSign = growthBadge >= 0 ? "+" : "";
  const subscriberGrowth = statCards.newsletterSubscribers.growthPercent;
  const subscriberGrowthSign = subscriberGrowth >= 0 ? "+" : "";

  return (
    <>
      <style>{`
        .mk-page { margin-left: 40px; margin-top: 40px; }
        .mk-stat-row { display: flex; gap: 16px; margin-bottom: 20px; }
        .mk-stat-card { min-width: 300px; }
        .mk-mid-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; margin-bottom: 16px; }
        .mk-bot-grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
        @media (max-width: 768px) {
          .mk-page { margin-left: 0px !important; margin-top: 46px !important; padding: 0 4px !important; }
          .mk-stat-row { flex-direction: column; }
          .mk-stat-card { min-width: unset !important; width: 100% !important; }
          .mk-mid-grid { grid-template-columns: 1fr !important; }
          .mk-bot-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="mk-page min-h-full transition-colors duration-300">
        <h1 className="text-3xl font-bold tracking-wide mb-6" style={{ color: isDark ? "#ffffff" : "#591727" }}>
          Marketing
        </h1>

        {error ? (
          <p className="text-sm mb-4" style={{ color: isDark ? "#8B1A2E" : "#C94A3A" }}>
            {error}{" "}
            <button type="button" className="underline font-semibold" onClick={() => void refresh()}>
              Retry
            </button>
          </p>
        ) : null}

        {/* Stat Cards */}
        <div className="mk-stat-row">
          <div className={`mk-stat-card relative rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-md" style={{ color: "#591727" }}>New Patients</p>
              <span className="text-[10px] font-semibold px-4 py-1 rounded-full bg-[#84535f] text-white">
                {loading ? "…" : `${growthSign}${growthBadge}%`}
              </span>
            </div>
            <span className="text-4xl font-bold numeric-font" style={{ color: text1 }}>
              {loading ? "—" : statCards.newPatients.count}
            </span>
            <p className="text-md mt-1" style={{ color: "#591727" }}>This month from website bookings</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
              <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }} />
            </div>
          </div>

          <div className={`mk-stat-card relative rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-md" style={{ color: "#591727" }}>Newsletter Subscribers</p>
              <span className="text-[10px] font-semibold px-4 py-1 rounded-full bg-[#84535f] text-white">
                {loading ? "…" : `${subscriberGrowthSign}${subscriberGrowth}%`}
              </span>
            </div>
            <span className="text-4xl font-bold numeric-font" style={{ color: text1 }}>
              {loading ? "—" : statCards.newsletterSubscribers.count}
            </span>
            <p className="text-md mt-1" style={{ color: "#591727" }}>
              {loading ? "—" : statCards.newsletterSubscribers.subtitle}
            </p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
              <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }} />
            </div>
          </div>
        </div>

        {/* Middle Row: Socials + Patient Flow */}
        <div className="mk-mid-grid">
          <div className={`rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className="text-[14px] numeric-font font-bold tracking-widest uppercase mb-5" style={{ color: "#591727" }}>
              WEBSITE PERFORMANCE
            </p>
            <div className="flex flex-col gap-7">
              {socialChannels.map((ch, i) => (
                <div key={ch.id}>
                  <div
                    className="flex items-center justify-between mb-2 cursor-pointer"
                    onClick={() => setActiveChannel(activeChannel === i ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cardInner }}>
                        {channelIcon(ch.id, text1)}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: text1 }}>{ch.label}</span>
                    </div>
                    <span className="text-sm font-bold shrink-0 ml-2 numeric-font" style={{ color: text2 }}>{ch.valueLabel}</span>
                  </div>
                  <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: isDark ? "#5C2A3A" : "#84535f" }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${ch.pct}%`, backgroundColor: ch.barColor }}
                    />
                  </div>
                  <p className="text-[11px]" style={{ color: text2 }}>
                    {ch.comparisonLabel}
                  </p>
                  {activeChannel === i && (
                    <div
                      className={`mt-2 px-4 py-3 rounded-xl border ${cardBorder} text-xs`}
                      style={{ backgroundColor: cardInner, color: text2 }}
                    >
                      {ch.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className="text-[14px] font-bold numeric-font tracking-widest uppercase mb-5" style={{ color: "#591727" }}>
              PATIENT FLOW
            </p>
            <div className="flex flex-col gap-3">
              {patientFlow.map((pf, i) => (
                <div
                  key={`${pf.label}-${i}`}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${cardBorder} cursor-pointer transition-opacity hover:opacity-90`}
                  style={{ backgroundColor: cardInner }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: pf.dot }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: text1 }}>{pf.label}</p>
                      <p className="text-[11px]" style={{ color: text2 }}>{pf.sub}</p>
                    </div>
                  </div>
                  <span className="text-base font-bold numeric-font" style={{ color: text1 }}>{pf.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Email Analytics */}
        <div className="mk-bot-grid">
          <div className={`rounded-2xl p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[14px] font-bold numeric-font tracking-widest uppercase" style={{ color: "#591727" }}>
                EMAIL CAMPAIGNS
              </p>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            {!loading && emailAnalytics.sentThisMonth > 0 ? (
              <p className="text-xs mb-4" style={{ color: text2 }}>
                {emailAnalytics.sentThisMonth} subscriber email{emailAnalytics.sentThisMonth === 1 ? "" : "s"} sent this month
                {emailAnalytics.templatesUsedThisMonth > 0
                  ? ` · ${emailAnalytics.templatesUsedThisMonth} template${emailAnalytics.templatesUsedThisMonth === 1 ? "" : "s"} used this month`
                  : ""}
                .
              </p>
            ) : null}

            {featuredEmailCampaign ? (
              <div className={`rounded-2xl p-5 border ${cardBorder} mb-4`} style={{ backgroundColor: cardInner }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] numeric-font font-bold mb-1" style={{ color: "#591727" }}>
                      {featuredEmailCampaign.category === "MONTHLY NEWSLETTER"
                        ? "Monthly Newsletter"
                        : featuredEmailCampaign.category}
                    </p>
                    <p className="text-base font-bold" style={{ color: text1 }}>
                      {featuredEmailCampaign.title}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: featuredEmailCampaign.tag === "SENT" ? "#84535f" : featuredEmailCampaign.tagColor }}
                  >
                    {featuredEmailCampaign.tag}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold numeric-font" style={{ color: "#7D1E35" }}>
                    {featuredEmailCampaign.lastUsed}
                  </p>
                  <p className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: text2 }}>Last Used</p>
                </div>
              </div>
            ) : !loading ? (
              <p className="text-sm mb-4" style={{ color: text2 }}>
                Send campaigns from the Subscribers page — activity will show here after emails go out.
              </p>
            ) : null}

            {insight ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#F2DADA" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7D1E35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <p className="text-md italic" style={{ color: "#591727" }}>
                  &ldquo;{insight}&rdquo;
                </p>
              </div>
            ) : null}
          </div>

          <div />
        </div>
      </div>
    </>
  );
}
