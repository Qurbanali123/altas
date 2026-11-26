"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken } from "@/utils/auth";
import type { StaffMember } from "@/utils/dashboardData";
import { fetchStaffById } from "@/utils/staffsApi";
import MediaImage from "@/components/MediaImage";
import { fetchCachedDashboardGet } from "@/utils/dashboardFetchCache";
import { AllStaffModal } from "@/components/admin/dashboard/AllStaffModal";
import { StaffDetailModal } from "@/components/admin/staff/StaffDetailModal";
import {
  chunkIntoGroups,
  getCarouselSlideStyle,
  getCarouselTrackStyle,
  useAutoCarousel,
} from "@/utils/carousel";
import { setupVisiblePolling } from "@/utils/visiblePolling";

type DoctorProductivitySectionProps = {
  isDark: boolean;
  card: string;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  pageBg: string;
  initialStaff?: StaffMember[];
};

function ViewIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ProductivityViewButton({
  title,
  onClick,
  disabled,
  accent,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  accent: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-7 h-7 flex items-center justify-center rounded-lg border shrink-0 transition-all hover:opacity-80 disabled:opacity-35 disabled:cursor-not-allowed"
      style={{
        color: accent,
        borderColor: `${accent}55`,
        backgroundColor: "transparent",
      }}
    >
      <ViewIcon />
    </button>
  );
}

function SeenPatientsModal({
  member,
  isDark,
  card,
  cardBorder,
  cardInner,
  text1,
  text2,
  pageBg,
  onClose,
}: {
  member: StaffMember;
  isDark: boolean;
  card: string;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  pageBg: string;
  onClose: () => void;
}) {
  const patients = member.seenPatients ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 ${cardBorder}`}
        style={{ backgroundColor: pageBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: text1 }}>
              Patients Seen
            </h2>
            <p className="text-sm mt-0.5" style={{ color: text2 }}>
              {member.name} · Last 30 days · {patients.length} patient
              {patients.length !== 1 ? "s" : ""}
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

        {patients.length === 0 ? (
          <p className="text-center py-8 italic text-sm" style={{ color: text2 }}>
            No patients seen in the last 30 days.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`rounded-xl border px-3 py-3 ${cardBorder}`}
                style={{ backgroundColor: card }}
              >
                <div className="text-sm font-semibold" style={{ color: text1 }}>
                  {patient.name}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: text2 }}>
                  {patient.date}
                  {patient.time ? ` · ${patient.time}` : ""}
                </div>
                {patient.specialty && (
                  <div
                    className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: cardInner, color: text2 }}
                  >
                    {patient.specialty}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StaffProductivityRow({
  member,
  cardBorder,
  cardInner,
  text1,
  text2,
  isDark,
  accent,
  onViewProfile,
  onViewPatients,
}: {
  member: StaffMember;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  isDark: boolean;
  accent: string;
  onViewProfile: (member: StaffMember) => void;
  onViewPatients: (member: StaffMember) => void;
}) {
  return (
    <div
      className={`flex flex-col sm:grid sm:grid-cols-[1fr_140px] items-start sm:items-center px-3 py-3 rounded-xl border gap-2 sm:gap-0 w-full ${cardBorder}`}
      style={{ backgroundColor: cardInner }}
    >
      <button
        type="button"
        onClick={() => onViewProfile(member)}
        className="flex items-center gap-3 min-w-0 text-left transition-opacity hover:opacity-85"
        title="View doctor profile"
        aria-label={`View profile for ${member.name}`}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden"
          style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color: "#F5ECD7" }}
        >
          {member.profilePhotoUrl ? (
            <MediaImage
              path={member.profilePhotoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            member.avatar
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate" style={{ color: text1 }}>
            {member.name}
          </div>
          <div className="text-[11px] truncate" style={{ color: text2 }}>
            {member.role}
          </div>
        </div>
      </button>
      <div className="flex items-center justify-start sm:justify-center gap-2 pl-11 sm:pl-0 text-sm">
        <span className="sm:hidden text-[10px] font-semibold uppercase" style={{ color: text2 }}>
          Seen:
        </span>
        <span
          className="font-semibold numeric-font transition-all duration-500"
          style={{ color: "var(--font-cinzel)" }}
        >
          {member.seen}
        </span>
        <ProductivityViewButton
          title="View patients seen"
          accent={accent}
          disabled={member.seen === 0}
          onClick={() => onViewPatients(member)}
        />
      </div>
    </div>
  );
}

export function DoctorProductivitySection({
  isDark,
  card,
  cardBorder,
  cardInner,
  text1,
  text2,
  pageBg,
  initialStaff,
}: DoctorProductivitySectionProps) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff ?? []);
  const [loading, setLoading] = useState(!(initialStaff && initialStaff.length > 0));
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [detailMember, setDetailMember] = useState<StaffMember | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [seenPatientsMember, setSeenPatientsMember] = useState<StaffMember | null>(null);

  const accent = isDark ? "#591727" : "#7A3048";

  const fetchStaffProductivity = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const result = await fetchCachedDashboardGet<{ staff?: StaffMember[] }>(
        "/api/statistics/overview",
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      );

      if (result.ok && result.data) {
        setStaff(Array.isArray(result.data.staff) ? result.data.staff : []);
      }
    } catch (error) {
      console.error("Failed to fetch doctor productivity:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialStaff?.length) {
      setStaff(initialStaff);
      setLoading(false);
    }
  }, [initialStaff]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) await fetchStaffProductivity();
    };

    const stopPolling = setupVisiblePolling(load);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [fetchStaffProductivity]);

  const handleViewProfile = useCallback(async (member: StaffMember) => {
    if (!member.id) {
      setDetailMember(member);
      return;
    }
    setDetailLoading(true);
    setDetailMember(member);
    try {
      const full = await fetchStaffById(member.id);
      setDetailMember({
        ...member,
        name: full.fullName,
        role: full.roleTitle,
        bio: full.bio,
        specialties: full.specialties,
        profilePhotoUrl: full.profilePhotoUrl,
        status: full.status,
      });
    } catch {
      setDetailMember(member);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const staffGroups = chunkIntoGroups(staff, 3);
  const staffUsesCarousel = staffGroups.length > 1;
  const staffCarousel = useAutoCarousel(
    staffUsesCarousel ? staffGroups.length : 3,
    4000,
    staff.length > 0
  );

  return (
    <>
      {showAllStaff && (
        <AllStaffModal
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          cardInner={cardInner}
          text1={text1}
          text2={text2}
          pageBg={pageBg}
          staff={staff}
          onClose={() => setShowAllStaff(false)}
          onSelectMember={(member) => {
            setShowAllStaff(false);
            void handleViewProfile(member);
          }}
        />
      )}

      {detailMember && (
        <StaffDetailModal
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          cardInner={cardInner}
          text1={text1}
          text2={text2}
          pageBg={pageBg}
          staff={detailMember}
          loading={detailLoading}
          onClose={() => setDetailMember(null)}
        />
      )}

      {seenPatientsMember && (
        <SeenPatientsModal
          member={seenPatientsMember}
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          cardInner={cardInner}
          text1={text1}
          text2={text2}
          pageBg={pageBg}
          onClose={() => setSeenPatientsMember(null)}
        />
      )}

      <div
        className={`rounded-2xl p-4 sm:p-5 border ${cardBorder} transition-colors duration-300`}
        style={{ backgroundColor: card }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold" style={{ color: text1 }}>
            Doctor Productivity
          </h2>
          <button
            type="button"
            onClick={() => setShowAllStaff(true)}
            className="font-semibold hover:opacity-80 transition-opacity"
            style={{ color: accent }}
          >
            View All Staff
          </button>
        </div>

        <div
          className="hidden sm:grid grid-cols-[1fr_140px] px-3 py-2 rounded-lg mb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ backgroundColor: cardInner, color: text2 }}
        >
          <span>Staff</span>
          <span className="text-center">Patients Seen</span>
        </div>

        <div
          className="flex flex-col gap-1"
          onMouseEnter={staffCarousel.onMouseEnter}
          onMouseLeave={staffCarousel.onMouseLeave}
        >
          {loading ? (
            <p className="text-center py-8 italic text-sm" style={{ color: text2 }}>
              Loading productivity data...
            </p>
          ) : staff.length === 0 ? (
            <p className="text-center py-8 italic text-sm" style={{ color: text2 }}>
              No doctors added yet. Add staff from the Staff page to track productivity.
            </p>
          ) : staffUsesCarousel ? (
            <div className="overflow-hidden w-full">
              <div style={getCarouselTrackStyle(staffCarousel.slide, staffGroups.length)}>
                {staffGroups.map((group, gi) => (
                  <div
                    key={gi}
                    className="flex flex-col gap-1"
                    style={getCarouselSlideStyle(staffGroups.length)}
                  >
                    {group.map((member) => (
                      <StaffProductivityRow
                        key={member.id || member.name}
                        member={member}
                        cardBorder={cardBorder}
                        cardInner={cardInner}
                        text1={text1}
                        text2={text2}
                        isDark={isDark}
                        accent={accent}
                        onViewProfile={handleViewProfile}
                        onViewPatients={setSeenPatientsMember}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            staff.map((member) => (
              <StaffProductivityRow
                key={member.id || member.name}
                member={member}
                cardBorder={cardBorder}
                cardInner={cardInner}
                text1={text1}
                text2={text2}
                isDark={isDark}
                accent={accent}
                onViewProfile={handleViewProfile}
                onViewPatients={setSeenPatientsMember}
              />
            ))
          )}
        </div>

        <div className="flex justify-center gap-1.5 mt-4">
          {staffGroups.length <= 1 ? (
            staff.length > 0 ? (
              <div
                className="w-5 h-1.5 rounded-full"
                style={{ backgroundColor: isDark ? "#D4A574" : "#3D0A1F" }}
              />
            ) : null
          ) : (
            staffGroups.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => staffCarousel.setSlide(idx)}
                className={`${staffCarousel.slide === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"} rounded-full transition-all duration-300`}
                style={{
                  backgroundColor:
                    staffCarousel.slide === idx
                      ? isDark
                        ? "#D4A574"
                        : "#3D0A1F"
                      : isDark
                        ? "#5C2A3A"
                        : "#D4B896",
                }}
                aria-label={`Show staff group ${idx + 1}`}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
