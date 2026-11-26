"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import {
  clearDayRules,
  clearDaySlotBlocks,
  fetchBookingSlotsOverview,
  fetchDayAvailability,
  formatDisplayDate,
  saveDayAvailability,
  toDateKey,
  type BookingAvailabilityRecord,
} from "@/utils/bookingSlotsApi";
import TablePagination from "@/components/admin/TablePagination";
import { paginateItems, TABLE_PAGE_SIZE } from "@/utils/tablePagination";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatSlotPreview(slots: string[]) {
  if (slots.length === 0) return "—";
  const preview = slots.slice(0, 3).join(", ");
  if (slots.length <= 3) return preview;
  return `${preview}… +${slots.length - 3} more`;
}

function CalendarPanel({
  selectedDate,
  onSelectDate,
  isDark,
  cardBorder,
  cardInner,
  text1,
  text2,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  isDark: boolean;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
}) {
  const [open, setOpen] = useState(true);
  const [view, setView] = useState(selectedDate);
  const year = view.getFullYear();
  const month = view.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const viewMonthStart = new Date(year, month, 1);
  const canGoPrev = viewMonthStart > currentMonthStart;

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isSelected = (day: number) =>
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === day;

  const handleSelect = (cellDate: Date) => {
    onSelectDate(cellDate);
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-sm font-semibold block" style={{ color: text1 }}>
            Select Date
          </label>
          <p className="text-xs mt-0.5" style={{ color: text2 }}>
            {formatDisplayDate(toDateKey(selectedDate))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${cardBorder}`}
          style={{ backgroundColor: cardInner, color: text1 }}
          aria-label={open ? "Close calendar" : "Open calendar"}
          aria-expanded={open}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className={`rounded-2xl border p-4 ${cardBorder}`}
          style={{ backgroundColor: cardInner }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: text1 }}>
              {MONTHS[month]} {year}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => canGoPrev && setView(new Date(year, month - 1, 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold disabled:opacity-35 disabled:cursor-not-allowed"
                style={{ color: text1, backgroundColor: isDark ? "#c9a898" : "#f0f0f0" }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ color: text1, backgroundColor: isDark ? "#c9a898" : "#f0f0f0" }}
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: text2 }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const cellDate = new Date(year, month, day);
              cellDate.setHours(0, 0, 0, 0);
              const past = cellDate < today;
              const selected = isSelected(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => !past && handleSelect(cellDate)}
                  className="w-8 h-8 mx-auto rounded-full text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: selected ? "#591727" : "transparent",
                    color: past ? (isDark ? "#a08088" : "#c4a0a8") : selected ? "#F5ECD7" : text1,
                    opacity: past ? 0.45 : 1,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function BookingSlotsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("booking_slots");

  const card = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder = isDark ? "border-[#753141]" : "border-[#753141]";
  const cardInner = isDark ? "#d0baa3" : "#FFFFFF";
  const text1 = isDark ? "#591727" : "#591727";
  const text2 = isDark ? "#591727" : "#7A6040";
  const inputBg = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#753141" : "#753141";
  const tableBg = isDark ? "#c1a694" : "#FDFAF4";

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [records, setRecords] = useState<BookingAvailabilityRecord[]>([]);
  const [recordsPage, setRecordsPage] = useState(1);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [fullDayBlocked, setFullDayBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const selectedDateKey = toDateKey(selectedDate);

  const recordsPagination = useMemo(
    () => paginateItems(records, recordsPage, TABLE_PAGE_SIZE),
    [records, recordsPage]
  );
  const pagedRecords = recordsPagination.items;

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookingSlotsOverview();
      setRecords(data.records);
      setAllSlots(data.allSlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking slots.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDay = useCallback(async (dateKey: string) => {
    setDayLoading(true);
    try {
      const data = await fetchDayAvailability(dateKey);
      setBlockedSlots(data.blockedSlots);
      setFullDayBlocked(data.fullDayBlocked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load day availability.");
    } finally {
      setDayLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void loadDay(selectedDateKey);
  }, [selectedDateKey, loadDay]);

  const blockedSet = useMemo(() => new Set(blockedSlots), [blockedSlots]);

  const toggleSlot = (slot: string) => {
    if (!canEdit || fullDayBlocked) return;
    setBlockedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const toggleSelectAll = () => {
    if (!canEdit || fullDayBlocked) return;
    if (blockedSlots.length === allSlots.length) {
      setBlockedSlots([]);
    } else {
      setBlockedSlots([...allSlots]);
    }
  };

  const persistDay = async (payload: {
    fullDayBlocked: boolean;
    blockedSlots: string[];
  }) => {
    setSaving(true);
    setActionMessage(null);
    setError(null);
    try {
      await saveDayAvailability({
        date: selectedDateKey,
        fullDayBlocked: payload.fullDayBlocked,
        blockedSlots: payload.blockedSlots,
      });
      await Promise.all([loadOverview(), loadDay(selectedDateKey)]);
      setActionMessage("Availability saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  const handleBlockFullDay = async () => {
    if (!canEdit) return;
    setFullDayBlocked(true);
    setBlockedSlots([]);
    await persistDay({ fullDayBlocked: true, blockedSlots: [] });
  };

  const handleClearDayRules = async () => {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    try {
      await clearDayRules(selectedDateKey);
      setFullDayBlocked(false);
      setBlockedSlots([]);
      await loadOverview();
      setActionMessage("Day rules cleared.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear day rules.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlots = async () => {
    if (!canEdit) return;
    await persistDay({ fullDayBlocked: false, blockedSlots });
  };

  const handleRemoveRecord = async (record: BookingAvailabilityRecord) => {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    try {
      await clearDayRules(record.date);
      if (record.date === selectedDateKey) {
        setFullDayBlocked(false);
        setBlockedSlots([]);
      }
      await loadOverview();
      setActionMessage(`Removed rules for ${formatDisplayDate(record.date)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove record.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearRecordSlots = async (record: BookingAvailabilityRecord) => {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    try {
      await clearDaySlotBlocks(record.date);
      if (record.date === selectedDateKey) {
        setFullDayBlocked(false);
        setBlockedSlots([]);
      }
      await Promise.all([loadOverview(), loadDay(selectedDateKey)]);
      setActionMessage(`Cleared slot blocks for ${formatDisplayDate(record.date)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear slots.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .bs-page { margin-left: 40px; margin-top: 40px; }
        .bs-top-grid { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
        @media (max-width: 1024px) {
          .bs-page { margin-left: 0; margin-top: 46px; padding: 0 12px; }
          .bs-top-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="bs-page min-h-full transition-colors duration-300 max-w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide mb-2" style={{ color: isDark ? "#ffffff" : "#591727" }}>
          Availability Settings
        </h1>
        <p className="text-sm mb-6" style={{ color: text2 }}>
          Control which dates and times visitors can book on the public appointment page.
        </p>

        {error ? (
          <p className="text-sm mb-4" style={{ color: isDark ? "#8B1A2E" : "#C94A3A" }} role="alert">
            {error}{" "}
            <button type="button" className="underline font-semibold" onClick={() => void loadOverview()}>
              Retry
            </button>
          </p>
        ) : null}

        {actionMessage ? (
          <p className="text-sm mb-4" style={{ color: text1 }}>
            {actionMessage}
          </p>
        ) : null}

        <div className={`rounded-2xl border ${cardBorder} p-4 sm:p-6 mb-6`} style={{ backgroundColor: card }}>
          <div className="bs-top-grid">
            <div>
              <CalendarPanel
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                isDark={isDark}
                cardBorder={cardBorder}
                cardInner={cardInner}
                text1={text1}
                text2={text2}
              />

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  type="button"
                  disabled={!canEdit || saving}
                  onClick={() => void handleBlockFullDay()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "#591727" }}
                >
                  Block Full Day
                </button>
                <button
                  type="button"
                  disabled={!canEdit || saving}
                  onClick={() => void handleClearDayRules()}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-60 ${cardBorder}`}
                  style={{ color: text1, backgroundColor: cardInner }}
                >
                  Clear Day Rules
                </button>
              </div>
            </div>

            <div className={`rounded-2xl border ${cardBorder} p-4 sm:p-5`} style={{ backgroundColor: cardInner }}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <p className="text-sm font-semibold" style={{ color: text1 }}>
                  Blocked slots for{" "}
                  <span style={{ color: "#591727" }}>{formatDisplayDate(selectedDateKey)}</span>
                </p>
                <button
                  type="button"
                  disabled={!canEdit || fullDayBlocked || dayLoading}
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: "#591727", color: "#591727" }}
                >
                  Select All
                </button>
              </div>

              {fullDayBlocked ? (
                <p className="text-sm italic py-8 text-center" style={{ color: text2 }}>
                  Entire day is blocked. No time slots are available for booking.
                </p>
              ) : dayLoading ? (
                <p className="text-sm italic py-8 text-center animate-pulse" style={{ color: text2 }}>
                  Loading time slots…
                </p>
              ) : (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[360px] overflow-y-auto pr-1"
                  style={{ scrollbarColor: "#591727 transparent" }}
                >
                  {allSlots.map((slot) => {
                    const blocked = blockedSet.has(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => toggleSlot(slot)}
                        className="px-2 py-2 rounded-lg text-[11px] sm:text-xs font-semibold border transition-colors disabled:opacity-60"
                        style={{
                          borderColor: blocked ? "#591727" : inputBorder,
                          backgroundColor: blocked ? "#591727" : inputBg,
                          color: blocked ? "#F5ECD7" : text1,
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}>
                <span className="text-xs" style={{ color: text2 }}>
                  Blocked: {fullDayBlocked ? "full day" : `${blockedSlots.length} slot(s)`}
                </span>
                {canEdit ? (
                  <button
                    type="button"
                    disabled={saving || fullDayBlocked}
                    onClick={() => void handleSaveSlots()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "#591727" }}
                  >
                    {saving ? "Saving…" : "Save Slot Blocks"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border ${cardBorder} overflow-hidden`} style={{ backgroundColor: tableBg }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}>
            <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: text1 }}>
              Blocked Dates &amp; Time Slots
            </h2>
            <span className="text-xs" style={{ color: text2 }}>
              {records.length} record(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? "#5C2A3A" : "#591727"}` }}>
                  {["Date", "Full Day", "Blocked Time Slots", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: text2 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm animate-pulse" style={{ color: text2 }}>
                      Loading blocked records…
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm italic" style={{ color: text2 }}>
                      No blocked dates configured yet.
                    </td>
                  </tr>
                ) : (
                  pagedRecords.map((record) => (
                    <tr
                      key={record.id}
                      style={{ borderBottom: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: text1 }}>
                        {record.date}
                      </td>
                      <td className="px-4 py-3">
                        {record.fullDayBlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#C94A3A] text-[#C94A3A]">
                            Yes
                          </span>
                        ) : (
                          <span style={{ color: text2 }}>No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: text2 }}>
                        {record.fullDayBlocked
                          ? "—"
                          : formatSlotPreview(
                              Array.isArray(record.blockedSlots)
                                ? record.blockedSlots
                                : []
                            )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {!record.fullDayBlocked &&
                          Array.isArray(record.blockedSlots) &&
                          record.blockedSlots.length > 0 ? (
                            <button
                              type="button"
                              disabled={!canEdit || saving}
                              onClick={() => void handleClearRecordSlots(record)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                              style={{ borderColor: "#591727", color: "#591727" }}
                            >
                              Clear
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={!canEdit || saving}
                            onClick={() => void handleRemoveRecord(record)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#C94A3A] text-[#C94A3A]"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={recordsPagination.meta.page}
            total={recordsPagination.meta.total}
            limit={recordsPagination.meta.limit}
            totalPages={recordsPagination.meta.totalPages}
            onPageChange={setRecordsPage}
            disabled={loading}
            isDark={isDark}
            text2={text2}
          />
        </div>
      </div>
    </>
  );
}
