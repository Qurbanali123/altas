"use client";

import { getPaginationButtons } from "@/utils/tablePagination";

type TablePaginationProps = {
  page: number;
  total: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  isDark?: boolean;
  text2?: string;
  borderColor?: string;
  className?: string;
};

export default function TablePagination({
  page,
  total,
  limit,
  totalPages,
  onPageChange,
  disabled = false,
  isDark = false,
  text2 = "#591727",
  borderColor,
  className = "",
}: TablePaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const paginationButtons = getPaginationButtons(page, totalPages);
  const borderTop = borderColor ?? (isDark ? "#5C2A3A" : "#D9C9A8");
  const activeBg = isDark ? "#8B1A2E" : "#591727";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 ${className}`}
      style={{ borderTop: `1px solid ${borderTop}` }}
    >
      <span className="text-xs" style={{ color: text2 }}>
        Showing {from} to {to} of {total} results
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1 || disabled}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40"
          style={{ color: text2 }}
          aria-label="Previous page"
        >
          {"\u2039"}
        </button>
        {paginationButtons.map((n, idx) => {
          const prev = paginationButtons[idx - 1];
          const showEllipsis = prev !== undefined && n - prev > 1;
          return (
            <span key={n} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="text-xs px-1" style={{ color: text2 }}>
                  ...
                </span>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(n)}
                className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                style={{
                  backgroundColor: n === page ? activeBg : "transparent",
                  color: n === page ? "#F5ECD7" : text2,
                }}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
              >
                {n}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          disabled={page >= totalPages || disabled}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40"
          style={{ color: text2 }}
          aria-label="Next page"
        >
          {"\u203A"}
        </button>
      </div>
    </div>
  );
}
