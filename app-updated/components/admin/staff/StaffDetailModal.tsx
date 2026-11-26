"use client";

import type { AdminStaff } from "@/utils/staffsApi";
import { staffPhotoUrl } from "@/utils/staffsApi";
import type { StaffMember } from "@/utils/dashboardData";

type StaffDetailModalProps = {
  isDark: boolean;
  card: string;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  pageBg: string;
  staff: AdminStaff | StaffMember | null;
  loading?: boolean;
  onClose: () => void;
};

function displayName(staff: AdminStaff | StaffMember): string {
  return "fullName" in staff ? staff.fullName : staff.name;
}

function displayRole(staff: AdminStaff | StaffMember): string {
  return "roleTitle" in staff ? staff.roleTitle : staff.role;
}

function displayPhoto(staff: AdminStaff | StaffMember): string {
  if ("profilePhotoUrl" in staff && staff.profilePhotoUrl) {
    return staffPhotoUrl(staff.profilePhotoUrl);
  }
  return "";
}

function displayInitials(staff: AdminStaff | StaffMember): string {
  if ("avatar" in staff && staff.avatar) return staff.avatar;
  const name = displayName(staff);
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function StaffDetailModal({
  isDark,
  card,
  cardBorder,
  cardInner,
  text1,
  text2,
  pageBg,
  staff,
  loading = false,
  onClose,
}: StaffDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 ${cardBorder}`}
        style={{ backgroundColor: pageBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: text1 }}>
              Doctor Profile
            </h2>
            <p className="text-sm mt-0.5" style={{ color: text2 }}>
              Complete staff information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border shrink-0"
            style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: text1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 italic text-sm" style={{ color: text2 }}>
            Loading profile...
          </p>
        ) : !staff ? (
          <p className="text-center py-10 italic text-sm" style={{ color: text2 }}>
            Staff member not found.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {displayPhoto(staff) ? (
                <img
                  src={displayPhoto(staff)}
                  alt={displayName(staff)}
                  className="w-16 h-16 rounded-full object-cover border"
                  style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color: "#F5ECD7" }}
                >
                  {displayInitials(staff)}
                </div>
              )}
              <div>
                <div className="text-lg font-semibold" style={{ color: text1 }}>
                  {displayName(staff)}
                </div>
                <div className="text-sm" style={{ color: text2 }}>
                  {displayRole(staff)}
                </div>
                {"status" in staff && staff.status && (
                  <span
                    className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide capitalize"
                    style={{
                      color: staff.status === "active" ? "#3DAA7A" : "#753141",
                      border: `1px solid ${staff.status === "active" ? "#3DAA7A" : "#D3D3D3"}`,
                      backgroundColor: cardInner,
                    }}
                  >
                    {staff.status}
                  </span>
                )}
              </div>
            </div>

            {"seen" in staff && (
              <div
                className={`rounded-xl border p-3 ${cardBorder}`}
                style={{ backgroundColor: card }}
              >
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: text2 }}>
                  Patients Seen (30d)
                </p>
                <p className="text-lg font-bold numeric-font" style={{ color: text1 }}>
                  {staff.seen}
                </p>
              </div>
            )}

            <DetailRow
              label="Specialties"
              value={
                ("specialties" in staff && staff.specialties?.length
                  ? staff.specialties.join(", ")
                  : "") || "—"
              }
              text1={text1}
              text2={text2}
              card={card}
              cardBorder={cardBorder}
            />
            {"bio" in staff && staff.bio && (
              <DetailRow label="Bio" value={staff.bio} multiline text1={text1} text2={text2} card={card} cardBorder={cardBorder} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  text1,
  text2,
  card,
  cardBorder,
  multiline = false,
}: {
  label: string;
  value: string;
  text1: string;
  text2: string;
  card: string;
  cardBorder: string;
  multiline?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${cardBorder}`} style={{ backgroundColor: card }}>
      <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: text2 }}>
        {label}
      </p>
      <p className={`text-sm ${multiline ? "whitespace-pre-wrap" : ""}`} style={{ color: text1 }}>
        {value || "—"}
      </p>
    </div>
  );
}
