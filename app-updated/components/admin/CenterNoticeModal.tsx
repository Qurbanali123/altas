"use client";

type CenterNoticeModalProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  isDark?: boolean;
};

/** Theme-matching centered notice (replaces browser alert). */
export default function CenterNoticeModal({
  open,
  message,
  onClose,
  isDark = false,
}: CenterNoticeModalProps) {
  if (!open) return null;

  const brand = isDark ? "#8B1A2E" : "#591727";
  const cream = isDark ? "#3A1A22" : "#F4EEE1";
  const text = isDark ? "#F4EEE1" : "#591727";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(45, 10, 18, 0.45)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl text-center"
        style={{
          backgroundColor: cream,
          border: `1px solid ${isDark ? "#5A2A35" : "#D9C9A8"}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: brand }}
        >
          ✓
        </div>
        <p className="text-base font-semibold leading-snug mb-5" style={{ color: text }}>
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: brand }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
