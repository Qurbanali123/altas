"use client";

type MarketingLoadingStateProps = {
  isDark: boolean;
};

export function MarketingLoadingState({ isDark }: MarketingLoadingStateProps) {
  const shimmer = isDark ? "#5C2A3A" : "#E8D8C0";

  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading marketing data">
      <div className="mk-stat-row">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="mk-stat-card rounded-2xl p-6 border border-[#753141]"
            style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", minHeight: 140 }}
          >
            <div className="h-4 w-32 rounded mb-4" style={{ backgroundColor: shimmer }} />
            <div className="h-10 w-20 rounded mb-2" style={{ backgroundColor: shimmer }} />
            <div className="h-3 w-40 rounded" style={{ backgroundColor: shimmer }} />
          </div>
        ))}
      </div>
      <div className="mk-mid-grid">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="rounded-2xl p-6 border border-[#753141]"
            style={{ backgroundColor: isDark ? "#c9a898" : "#f0f0f0", minHeight: 280 }}
          >
            <div className="h-5 w-48 rounded mb-6" style={{ backgroundColor: shimmer }} />
            <div className="space-y-6">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-10 rounded" style={{ backgroundColor: shimmer }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mk-bot-grid">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="rounded-2xl p-6 border border-[#753141]"
            style={{ backgroundColor: isDark ? "#c9a898" : "#f0f0f0", minHeight: 240 }}
          >
            <div className="h-5 w-40 rounded mb-6" style={{ backgroundColor: shimmer }} />
            <div className="h-32 rounded" style={{ backgroundColor: shimmer }} />
          </div>
        ))}
      </div>
    </div>
  );
}
