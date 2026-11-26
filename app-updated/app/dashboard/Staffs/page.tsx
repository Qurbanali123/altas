"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import MediaImage from "@/components/MediaImage";
import { usePermissions } from "@/context/PermissionsContext";
import {
  type AdminStaff,
  createStaff,
  deleteStaff,
  fetchStaffOverview,
  staffPhotoUrl,
  updateStaff,
  uploadStaffPhoto,
} from "@/utils/staffsApi";
import {
  DEFAULT_TEAM_PAGE_CONTENT,
  type TeamPageContent,
  fetchTeamPageContent,
  updateTeamPageContent,
} from "@/utils/teamPageApi";
import { fetchSpecialitiesOverview } from "@/utils/specialitiesApi";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import TablePagination from "@/components/admin/TablePagination";
import { paginateItems, TABLE_PAGE_SIZE } from "@/utils/tablePagination";

type PageView = "form" | "list" | "pageCards";

function emptyStaff(): Omit<AdminStaff, "id"> {
  return {
    fullName: "",
    roleTitle: "",
    bio: "",
    specialties: [],
    profilePhotoUrl: "",
    status: "active",
    order: 0,
  };
}

function staffStatusClass(status: AdminStaff["status"]) {
  if (status === "active") {
    return "text-[#711c31] border border-[#C94A3A] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide capitalize";
  }
  return "text-[#753141] border border-[#D3D3D3] bg-[#d3d3d3] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide capitalize";
}

const actionBtn =
  "w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0";

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#591727" }}>
      {text}
      {required && <span> *</span>}
    </p>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  isDark,
  multiline = false,
  rows = 4,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  multiline?: boolean;
  rows?: number;
  type?: string;
}) {
  const st: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#ffffff",
    borderColor: isDark ? "#5C2A3A" : "#7a7072",
    color: "#591727",
  };
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-2xl text-sm outline-none border resize-none"
        style={st}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-2xl text-sm outline-none border"
      style={st}
    />
  );
}

function PhotoUpload({
  value,
  onUpload,
  onRemove,
  isDark,
  uploading,
}: {
  value: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isDark: boolean;
  uploading?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = staffPhotoUrl(value);

  return (
    <>
      <div
        className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-opacity hover:opacity-80 relative w-32 h-32"
        style={{
          borderColor: "#753141",
          backgroundColor: isDark ? "#d0baa3" : "#f7f4ef",
        }}
        onClick={() => !uploading && ref.current?.click()}
      >
        {uploading && <UploadingOverlay />}
        {preview ? (
          <MediaImage path={value} alt="" className="w-full h-full object-contain rounded-2xl p-1" />
        ) : (
          <span className="text-xs" style={{ color: "#591727", opacity: 0.6 }}>
            Upload Photo
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded-lg text-xs font-semibold border"
          style={{ borderColor: "#753141", color: "#591727" }}
          onClick={() => ref.current?.click()}
          disabled={uploading}
        >
          {preview ? "Change Image" : "Upload Image"}
        </button>
        {preview && (
          <button
            type="button"
            className="px-3 py-1 rounded-lg text-xs font-semibold border"
            style={{ borderColor: "#b00020", color: "#b00020" }}
            onClick={onRemove}
            disabled={uploading}
          >
            Remove Image
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

export default function StaffsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("staffs");

  const brand = "#591727";
  const borderCol = "#753141";
  const text1 = "#591727";
  const text2 = "#591727";
  const tableBg = isDark ? "#c1a694" : "#FDFAF4";
  const rowHover = isDark ? "#d0baa3" : "#F5ECD7";
  const card = isDark ? "#c9a898" : "#f0f0f0";
  const cardInner = isDark ? "#d0baa3" : "#FFFFFF";

  const [view, setView] = useState<PageView>("list");
  const [staffList, setStaffList] = useState<AdminStaff[]>([]);
  const [staffPage, setStaffPage] = useState(1);
  const [specialityOptions, setSpecialityOptions] = useState<string[]>([]);
  const [form, setForm] = useState<Omit<AdminStaff, "id">>(emptyStaff());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [teamPage, setTeamPage] = useState<TeamPageContent>(DEFAULT_TEAM_PAGE_CONTENT);
  const [savingCards, setSavingCards] = useState(false);
  const [cardsSaved, setCardsSaved] = useState(false);
  const [uploadingCardImage, setUploadingCardImage] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStaffOverview();
      setStaffList(data.staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeamPage = useCallback(async () => {
    try {
      const data = await fetchTeamPageContent();
      setTeamPage(data);
    } catch {
      setTeamPage(DEFAULT_TEAM_PAGE_CONTENT);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
    void loadTeamPage();
    fetchSpecialitiesOverview()
      .then((data) => setSpecialityOptions(data.specialities.map((s) => s.title)))
      .catch(() => setSpecialityOptions([]));
  }, [loadStaff, loadTeamPage]);

  const staffPagination = useMemo(
    () => paginateItems(staffList, staffPage, TABLE_PAGE_SIZE),
    [staffList, staffPage]
  );
  const pagedStaff = staffPagination.items;

  function setF<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleSpecialty(title: string) {
    setForm((prev) => {
      const has = prev.specialties.includes(title);
      return {
        ...prev,
        specialties: has
          ? prev.specialties.filter((s) => s !== title)
          : [...prev.specialties, title],
      };
    });
  }

  const handlePhotoUpload = useCallback(async (file: File) => {
    setUploadingPhoto(true);
    setError(null);
    await runOptimisticImageUpload({
      file,
      upload: uploadStaffPhoto,
      onPreview: (url) => setF("profilePhotoUrl", url),
      onSuccess: (url) => setF("profilePhotoUrl", url),
      onError: (err) => setError(err.message),
    });
    setUploadingPhoto(false);
  }, []);

  const removePhoto = useCallback(() => {
    setF("profilePhotoUrl", "");
  }, []);

  async function handleSave() {
    if (!form.fullName.trim()) {
      setError("Doctor name is required");
      return;
    }
    if (!form.roleTitle.trim()) {
      setError("Role title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateStaff(editingId, form);
      } else {
        await createStaff(form);
      }
      await loadStaff();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      resetForm();
      setView("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(emptyStaff());
    setEditingId(null);
  }

  function openEdit(member: AdminStaff) {
    const { id, createdAt, updatedAt, ...rest } = member;
    setForm(rest);
    setEditingId(id);
    setView("form");
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await deleteStaff(id);
      await loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function openClientPreview(id: string) {
    window.open(`/pages/a-propos#doctor-${id}`, "_blank", "noopener,noreferrer");
  }

  function openAddNew() {
    resetForm();
    setView("form");
  }

  function openPageCards() {
    void loadTeamPage();
    setView("pageCards");
  }

  async function handleCardImageUpload(
    file: File,
    apply: (url: string) => void
  ) {
    setUploadingCardImage(true);
    setError(null);
    await runOptimisticImageUpload({
      file,
      upload: uploadStaffPhoto,
      onPreview: apply,
      onSuccess: apply,
      onError: (err) => setError(err.message),
    });
    setUploadingCardImage(false);
  }

  async function handleSavePageCards() {
    setSavingCards(true);
    setError(null);
    try {
      const savedData = await updateTeamPageContent(teamPage);
      setTeamPage(savedData);
      setCardsSaved(true);
      setTimeout(() => setCardsSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page cards");
    } finally {
      setSavingCards(false);
    }
  }

  const sectionStyle: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#f0f0f0",
    borderColor: borderCol,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 16,
  };

  if (view === "pageCards") {
    const philosophy = teamPage.philosophy;
    const clinical = teamPage.clinicalSpecialities;
    const journey = teamPage.journey;

    return (
      <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 min-w-0 max-w-full min-[1440px]:overflow-x-hidden mt-10 md:mt-14 lg:mt-10">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
            Notre équipe — Page Cards
          </h1>
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: borderCol, color: text1 }}
          >
            Back to List
          </button>
        </div>

        {error && (
          <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#fde8e8", color: "#b00020" }}>
            {error}
          </p>
        )}
        {cardsSaved && (
          <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
            Page cards saved. Open Notre équipe to verify design.
          </p>
        )}

        <div style={sectionStyle}>
          <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Card 1 — Notre philosophie</h2>
          <div className="mb-4">
            <FieldLabel text="Title" />
            <Field
              value={philosophy.title}
              onChange={(v) => setTeamPage((prev) => ({ ...prev, philosophy: { ...prev.philosophy, title: v } }))}
              placeholder="Notre philosophie"
              isDark={isDark}
            />
          </div>
          <div className="mb-4">
            <FieldLabel text="Body text" />
            <Field
              value={philosophy.body}
              onChange={(v) => setTeamPage((prev) => ({ ...prev, philosophy: { ...prev.philosophy, body: v } }))}
              placeholder="Philosophy paragraph..."
              isDark={isDark}
              multiline
              rows={6}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <FieldLabel text="Badge 1 text" />
              <Field
                value={philosophy.badge1Text}
                onChange={(v) => setTeamPage((prev) => ({ ...prev, philosophy: { ...prev.philosophy, badge1Text: v } }))}
                placeholder="BOARD CERTIFIED"
                isDark={isDark}
              />
              <div className="mt-2 flex items-center gap-3">
                <MediaImage path={philosophy.badge1Icon} alt="" className="w-8 h-8 object-contain" />
                <label className="text-xs font-semibold cursor-pointer underline" style={{ color: brand }}>
                  Upload badge 1 icon
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!canEdit || uploadingCardImage}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      void handleCardImageUpload(f, (url) =>
                        setTeamPage((prev) => ({ ...prev, philosophy: { ...prev.philosophy, badge1Icon: url } }))
                      );
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <FieldLabel text="Badge 2 text" />
              <Field
                value={philosophy.badge2Text}
                onChange={(v) => setTeamPage((prev) => ({ ...prev, philosophy: { ...prev.philosophy, badge2Text: v } }))}
                placeholder="5+ YEARS OF EXCELLENCE"
                isDark={isDark}
              />
              <div className="mt-2 flex items-center gap-3">
                <MediaImage path={philosophy.badge2Icon} alt="" className="w-8 h-8 object-contain" />
                <label className="text-xs font-semibold cursor-pointer underline" style={{ color: brand }}>
                  Upload badge 2 icon
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!canEdit || uploadingCardImage}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      void handleCardImageUpload(f, (url) =>
                        setTeamPage((prev) => ({ ...prev, philosophy: { ...prev.philosophy, badge2Icon: url } }))
                      );
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Start Your Journey (small card)</h2>
          <div className="mb-4">
            <FieldLabel text="Title" />
            <Field
              value={journey.title}
              onChange={(v) => setTeamPage((prev) => ({ ...prev, journey: { ...prev.journey, title: v } }))}
              placeholder="Start Your Journey"
              isDark={isDark}
            />
          </div>
          <div className="mb-4">
            <FieldLabel text="Subtitle" />
            <Field
              value={journey.subtitle}
              onChange={(v) => setTeamPage((prev) => ({ ...prev, journey: { ...prev.journey, subtitle: v } }))}
              placeholder="Consultations available..."
              isDark={isDark}
              multiline
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <FieldLabel text="Button text" />
              <Field
                value={journey.buttonText}
                onChange={(v) => setTeamPage((prev) => ({ ...prev, journey: { ...prev.journey, buttonText: v } }))}
                placeholder="Book Appointment"
                isDark={isDark}
              />
            </div>
            <div>
              <FieldLabel text="Button link" />
              <Field
                value={journey.buttonLink}
                onChange={(v) => setTeamPage((prev) => ({ ...prev, journey: { ...prev.journey, buttonLink: v } }))}
                placeholder="/pages/Appointment"
                isDark={isDark}
              />
            </div>
          </div>
          <div>
            <FieldLabel text="Icon image (optional — leave empty to keep calendar icon)" />
            <div className="flex items-center gap-4 mt-2">
              {journey.icon ? (
                <MediaImage path={journey.icon} alt="" className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-xs italic" style={{ color: text2 }}>Using default calendar icon</span>
              )}
              <label className="text-xs font-semibold cursor-pointer underline" style={{ color: brand }}>
                Upload icon
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!canEdit || uploadingCardImage}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void handleCardImageUpload(f, (url) =>
                      setTeamPage((prev) => ({ ...prev, journey: { ...prev.journey, icon: url } }))
                    );
                    e.target.value = "";
                  }}
                />
              </label>
              {journey.icon && canEdit && (
                <button
                  type="button"
                  className="text-xs font-semibold underline"
                  style={{ color: brand }}
                  onClick={() =>
                    setTeamPage((prev) => ({ ...prev, journey: { ...prev.journey, icon: "" } }))
                  }
                >
                  Reset to calendar
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Card 2 — Clinical Specialities</h2>
          <div className="mb-4">
            <FieldLabel text="Title" />
            <Field
              value={clinical.title}
              onChange={(v) =>
                setTeamPage((prev) => ({
                  ...prev,
                  clinicalSpecialities: { ...prev.clinicalSpecialities, title: v },
                }))
              }
              placeholder="Clinical Specialities"
              isDark={isDark}
            />
          </div>
          <div className="mb-6">
            <FieldLabel text="Right side image" />
            <div className="flex items-center gap-4 mt-2">
              <div className="w-28 h-28 rounded-xl overflow-hidden border" style={{ borderColor: borderCol }}>
                <MediaImage path={clinical.image} alt="" className="w-full h-full object-cover" />
              </div>
              <label className="text-xs font-semibold cursor-pointer underline" style={{ color: brand }}>
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!canEdit || uploadingCardImage}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void handleCardImageUpload(f, (url) =>
                      setTeamPage((prev) => ({
                        ...prev,
                        clinicalSpecialities: { ...prev.clinicalSpecialities, image: url },
                      }))
                    );
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {clinical.items.map((item, index) => (
              <div key={index} className="rounded-2xl border p-4" style={{ borderColor: borderCol, backgroundColor: cardInner }}>
                <p className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: brand }}>
                  Item {index + 1}
                </p>
                <div className="mb-3">
                  <FieldLabel text="Title" />
                  <Field
                    value={item.title}
                    onChange={(v) =>
                      setTeamPage((prev) => {
                        const items = [...prev.clinicalSpecialities.items];
                        items[index] = { ...items[index], title: v };
                        return {
                          ...prev,
                          clinicalSpecialities: { ...prev.clinicalSpecialities, items },
                        };
                      })
                    }
                    placeholder="Specialty title"
                    isDark={isDark}
                  />
                </div>
                <div className="mb-3">
                  <FieldLabel text="Description" />
                  <Field
                    value={item.desc}
                    onChange={(v) =>
                      setTeamPage((prev) => {
                        const items = [...prev.clinicalSpecialities.items];
                        items[index] = { ...items[index], desc: v };
                        return {
                          ...prev,
                          clinicalSpecialities: { ...prev.clinicalSpecialities, items },
                        };
                      })
                    }
                    placeholder="Specialty description"
                    isDark={isDark}
                    multiline
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <MediaImage path={item.icon} alt="" className="w-8 h-8 object-contain" />
                  <label className="text-xs font-semibold cursor-pointer underline" style={{ color: brand }}>
                    Upload icon
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!canEdit || uploadingCardImage}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        void handleCardImageUpload(f, (url) =>
                          setTeamPage((prev) => {
                            const items = [...prev.clinicalSpecialities.items];
                            items[index] = { ...items[index], icon: url };
                            return {
                              ...prev,
                              clinicalSpecialities: { ...prev.clinicalSpecialities, items },
                            };
                          })
                        );
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => void handleSavePageCards()}
            disabled={savingCards || uploadingCardImage}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
          >
            {savingCards ? "Saving…" : "Save Page Cards"}
          </button>
        )}
        {(uploadingPhoto || uploadingCardImage) && <UploadingOverlay />}
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 min-w-0 max-w-full min-[1440px]:overflow-x-hidden mt-10 md:mt-14 lg:mt-10">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
            {editingId ? "Edit Doctor" : "Add New Doctor"}
          </h1>
          <button
            onClick={() => { resetForm(); setView("list"); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: borderCol, color: text1 }}
          >
            Back to List
          </button>
        </div>

        {error && (
          <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#fde8e8", color: "#b00020" }}>
            {error}
          </p>
        )}
        {saved && (
          <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
            Doctor saved successfully.
          </p>
        )}

        <div style={sectionStyle}>
          <div className="flex flex-col sm:flex-row gap-6 mb-4">
            <PhotoUpload
              value={form.profilePhotoUrl}
              onUpload={handlePhotoUpload}
              onRemove={removePhoto}
              isDark={isDark}
              uploading={uploadingPhoto}
            />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel text="Full Name" required />
                <Field value={form.fullName} onChange={(v) => setF("fullName", v)} placeholder="Dr. Jane Smith" isDark={isDark} />
              </div>
              <div>
                <FieldLabel text="Role / Title" required />
                <Field value={form.roleTitle} onChange={(v) => setF("roleTitle", v)} placeholder="Principal Dentist" isDark={isDark} />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <FieldLabel text="Bio" />
            <Field value={form.bio} onChange={(v) => setF("bio", v)} placeholder="Professional background and expertise..." isDark={isDark} multiline rows={4} />
          </div>

          <div className="mb-4">
            <FieldLabel text="Specialties" />
            <div className="flex flex-wrap gap-2 mt-2">
              {specialityOptions.length === 0 ? (
                <p className="text-xs italic" style={{ color: text2 }}>Add specialities first to assign them to doctors.</p>
              ) : (
                specialityOptions.map((title) => {
                  const selected = form.specialties.includes(title);
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => toggleSpecialty(title)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                      style={{
                        borderColor: borderCol,
                        backgroundColor: selected ? brand : isDark ? "#d0baa3" : "#fff",
                        color: selected ? "#fff" : text1,
                      }}
                    >
                      {title}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <FieldLabel text="Status" />
              <select
                value={form.status}
                onChange={(e) => setF("status", e.target.value as AdminStaff["status"])}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none border"
                style={{
                  backgroundColor: isDark ? "#c9a898" : "#ffffff",
                  borderColor: isDark ? "#5C2A3A" : "#7a7072",
                  color: text1,
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <FieldLabel text="Display Order" />
              <Field value={String(form.order)} onChange={(v) => setF("order", Number(v) || 0)} placeholder="0" isDark={isDark} type="number" />
            </div>
          </div>

          {canEdit && (
            <button
              onClick={() => void handleSave()}
              disabled={saving || uploadingPhoto}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
            >
              {saving ? "Saving…" : editingId ? "Update Doctor" : "Save Doctor"}
            </button>
          )}
        </div>
        {uploadingPhoto && <UploadingOverlay />}
      </div>
    );
  }

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 min-w-0 max-w-full min-[1440px]:overflow-x-hidden mt-10 md:mt-14 lg:mt-10">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
          Staff
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <button
              onClick={openPageCards}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ borderColor: borderCol, color: brand, backgroundColor: isDark ? "#d0baa3" : "#fff" }}
            >
              Edit Page Cards
            </button>
          )}
          {canEdit && (
            <button
              onClick={openAddNew}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
            >
              + Add New Doctor
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#fde8e8", color: "#b00020" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: text2 }}>Loading…</p>
      ) : staffList.length === 0 ? (
        <div
          className="rounded-2xl border p-16 flex flex-col items-center gap-4"
          style={{ borderColor: borderCol, backgroundColor: isDark ? "#c9a898" : "#f0f0f0" }}
        >
          <p className="text-sm font-semibold" style={{ color: text2 }}>No doctors yet</p>
          {canEdit && (
            <button onClick={openAddNew} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: brand }}>
              + Add New Doctor
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: tableBg, borderColor: borderCol }}>
          <div className="w-full max-[1439px]:overflow-x-auto min-[1440px]:overflow-x-hidden">
            <table className="w-full max-w-full text-xs sm:text-sm hidden sm:table max-[1439px]:min-w-[920px] min-[1440px]:table-fixed min-[1440px]:min-w-0">
              <colgroup className="max-[1439px]:hidden">
                <col className="w-[8%]" />
                <col className="w-[17%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[18%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                  {["Photo", "Name", "Role", "Specialties", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-3 min-[1440px]:px-6 py-3 text-[11px] sm:text-[13px] font-medium ${
                        h === "Status"
                          ? "text-center max-[1439px]:pl-5"
                          : h === "Actions"
                            ? "text-center"
                            : "text-left"
                      }`}
                      style={{ color: text2 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: `1px solid ${borderCol}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = rowHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    onClick={() => canEdit && openEdit(member)}
                  >
                    <td className="px-3 min-[1440px]:px-6 py-3">
                      {member.profilePhotoUrl ? (
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden border shrink-0"
                          style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", backgroundColor: isDark ? "#d0baa3" : "#fff" }}
                        >
                          <MediaImage
                            path={member.profilePhotoUrl}
                            alt=""
                            className="w-full h-full object-cover object-[center_20%] scale-125"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: "#8B5060" }}>
                          {member.fullName.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-3 min-[1440px]:px-6 py-3 font-semibold max-w-0" style={{ color: text1 }}>
                      <span className="block truncate" title={member.fullName}>{member.fullName}</span>
                    </td>
                    <td className="px-3 min-[1440px]:px-6 py-3 max-w-0" style={{ color: text2 }}>
                      <span className="block truncate" title={member.roleTitle}>{member.roleTitle}</span>
                    </td>
                    <td className="px-3 min-[1440px]:px-6 py-3 max-w-0" style={{ color: text2 }}>
                      <span className="block truncate" title={member.specialties.join(", ")}>
                        {member.specialties.length ? member.specialties.join(", ") : "—"}
                      </span>
                    </td>
                    <td className="px-3 max-[1439px]:pl-5 min-[1440px]:px-6 py-3 text-center">
                      <span className={`inline-block ${staffStatusClass(member.status)}`}>{member.status}</span>
                    </td>
                    <td className="px-3 min-[1440px]:px-6 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="View"
                        className={`${actionBtn} hover:bg-blue-100`}
                        style={{ color: text2 }}
                        onClick={() => openClientPreview(member.id)}
                        aria-label="View public profile"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            title="Edit"
                            className={`${actionBtn} hover:bg-amber-100`}
                            style={{ color: text2 }}
                            onClick={() => openEdit(member)}
                            aria-label="Edit"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            className={`${actionBtn} hover:bg-red-100`}
                            style={{ color: text2 }}
                            onClick={() => void handleDelete(member.id)}
                            aria-label="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="sm:hidden flex flex-col gap-3 p-4">
            {pagedStaff.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border p-4"
                style={{ borderColor: borderCol, backgroundColor: cardInner }}
                onClick={() => openClientPreview(member.id)}
              >
                <div className="font-semibold" style={{ color: text1 }}>{member.fullName}</div>
                <div className="text-xs mt-1" style={{ color: text2 }}>{member.roleTitle}</div>
                <div className="mt-2">
                  <span className={staffStatusClass(member.status)}>{member.status}</span>
                </div>
              </div>
            ))}
          </div>

          <TablePagination
            page={staffPagination.meta.page}
            total={staffPagination.meta.total}
            limit={staffPagination.meta.limit}
            totalPages={staffPagination.meta.totalPages}
            onPageChange={setStaffPage}
            disabled={loading}
            isDark={isDark}
            text2={text2}
            borderColor={borderCol}
          />
        </div>
      )}
    </div>
  );
}
