"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  type AdminSpeciality,
  type SpecialityAccordionCard,
  type SpecialityBullet,
  createSpeciality,
  deleteSpeciality,
  fetchSpecialitiesOverview,
  slugifyTitle,
  specialityImageUrl,
  specialityPagePath,
  updateSpeciality,
  uploadSpecialityImage,
} from "@/utils/specialitiesApi";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import MediaImage from "@/components/MediaImage";
import TablePagination from "@/components/admin/TablePagination";
import { paginateItems, TABLE_PAGE_SIZE } from "@/utils/tablePagination";

type PageView = "form" | "list";

const ACCENT_CYCLE = ["#7B2D3E", "#8B3A4E", "#9B4A5E"];

function emptyBullet(): SpecialityBullet {
  return { title: "", text: "" };
}

function emptyAccordionCard(index: number): SpecialityAccordionCard {
  return {
    label: "",
    description: "",
    imageUrl: "",
    accent: ACCENT_CYCLE[index % ACCENT_CYCLE.length],
  };
}

function isBulletFilled(b: SpecialityBullet) {
  return Boolean(b.title.trim() || b.text.trim());
}

function isAccordionFilled(c: SpecialityAccordionCard) {
  return Boolean(c.label.trim() || c.description.trim() || c.imageUrl.trim());
}

function sanitizeForSave(form: Omit<AdminSpeciality, "id">) {
  return {
    ...form,
    bullets: form.bullets.filter(isBulletFilled),
    accordionCards: form.accordionCards.filter(isAccordionFilled),
  };
}

function specialityStatusClass(status: AdminSpeciality["status"]) {
  if (status === "published") {
    return "text-[#711c31] border border-[#C94A3A] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide capitalize";
  }
  return "text-[#753141] border border-[#D3D3D3] bg-[#d3d3d3] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide capitalize";
}

function emptySpeciality(): Omit<AdminSpeciality, "id"> {
  return {
    title: "",
    slug: "",
    heroSubtitle: "",
    heroImageUrl: "",
    description: "",
    heading1: "",
    image1Url: "",
    description1: "",
    bullets: [emptyBullet()],
    heading2: "",
    accordionCards: [emptyAccordionCard(0)],
    seoTitle: "",
    canonicalUrl: "",
    seoDescription: "",
    focusKeyword: "",
    seoSlug: "",
    seoSchema: "",
    status: "draft",
    order: 0,
  };
}

const actionBtn =
  "w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0";

function UploadBlock({
  value,
  onUpload,
  height = 200,
  width = "100%",
  isDark,
  uploading,
}: {
  value: string;
  onUpload: (file: File) => void;
  height?: number;
  width?: number | string;
  isDark: boolean;
  uploading?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = specialityImageUrl(value);

  return (
    <>
      <div
        className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-opacity hover:opacity-80 relative"
        style={{
          width,
          height,
          borderColor: "#753141",
          backgroundColor: isDark ? "#d0baa3" : "#f7f4ef",
        }}
        onClick={() => !uploading && ref.current?.click()}
      >
        {uploading && <UploadingOverlay />}
        {preview ? (
          <MediaImage path={value} alt="" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <div className="flex flex-col items-center gap-2 select-none">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDark ? "#c9a898" : "#e8e0d5" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-xs" style={{ color: "#591727", opacity: 0.6 }}>
              Upload Image
            </span>
          </div>
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
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  multiline?: boolean;
  rows?: number;
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
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-2xl text-sm outline-none border"
      style={st}
    />
  );
}

export default function SpecialitiesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const brand = "#591727";
  const borderCol = "#753141";
  const text1 = "#591727";
  const text2 = "#591727";
  const tableBg = isDark ? "#c1a694" : "#FDFAF4";
  const rowHover = isDark ? "#d0baa3" : "#F5ECD7";
  const cardInner = isDark ? "#d0baa3" : "#FFFFFF";

  const [view, setView] = useState<PageView>("list");
  const [specialities, setSpecialities] = useState<AdminSpeciality[]>([]);
  const [listPage, setListPage] = useState(1);
  const [form, setForm] = useState<Omit<AdminSpeciality, "id">>(emptySpeciality());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImageField, setUploadingImageField] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [currentAccordionPage, setCurrentAccordionPage] = useState(0);

  const loadSpecialities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSpecialitiesOverview();
      setSpecialities(data.specialities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load specialities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecialities();
  }, [loadSpecialities]);

  const specialityPagination = useMemo(
    () => paginateItems(specialities, listPage, TABLE_PAGE_SIZE),
    [specialities, listPage]
  );
  const pagedSpecialities = specialityPagination.items;

  function setF<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const handleImageUpload = useCallback(
    async (file: File, setter: (url: string) => void, fieldKey: string) => {
      setUploadingImageField(fieldKey);
      setError(null);
      await runOptimisticImageUpload({
        file,
        upload: uploadSpecialityImage,
        onPreview: setter,
        onSuccess: setter,
        onError: (err) => setError(err.message),
      });
      setUploadingImageField(null);
    },
    [],
  );

  function updateBullet(index: number, key: keyof SpecialityBullet, val: string) {
    setForm((prev) => ({
      ...prev,
      bullets: prev.bullets.map((b, i) => (i === index ? { ...b, [key]: val } : b)),
    }));
  }

  function addBullet() {
    setForm((prev) => ({
      ...prev,
      bullets: [...prev.bullets, emptyBullet()],
    }));
  }

  function removeBullet(index: number) {
    setForm((prev) => {
      const next = prev.bullets.filter((_, i) => i !== index);
      return { ...prev, bullets: next.length ? next : [emptyBullet()] };
    });
  }

  function updateAccordion(index: number, key: keyof SpecialityAccordionCard, val: string) {
    setForm((prev) => ({
      ...prev,
      accordionCards: prev.accordionCards.map((c, i) =>
        i === index ? { ...c, [key]: val } : c
      ),
    }));
  }

  function addAccordionCard() {
    setForm((prev) => ({
      ...prev,
      accordionCards: [
        ...prev.accordionCards,
        emptyAccordionCard(prev.accordionCards.length),
      ],
    }));
    setCurrentAccordionPage(form.accordionCards.length);
  }

  function removeAccordionCard(index: number) {
    setForm((prev) => {
      const next = prev.accordionCards.filter((_, i) => i !== index);
      return {
        ...prev,
        accordionCards: next.length ? next : [emptyAccordionCard(0)],
      };
    });
    setCurrentAccordionPage((p) => Math.max(0, p - 1));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = sanitizeForSave({
      ...form,
      slug: form.seoSlug.trim() || form.slug.trim() || slugifyTitle(form.title),
      seoSlug: form.seoSlug.trim() || form.slug.trim() || slugifyTitle(form.title),
    });
    try {
      if (editingId) {
        await updateSpeciality(editingId, payload);
      } else {
        await createSpeciality(payload);
      }
      await loadSpecialities();
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
    setForm(emptySpeciality());
    setEditingId(null);
    setCurrentAccordionPage(0);
  }

  function openEdit(sp: AdminSpeciality) {
    const { id, createdAt, updatedAt, ...rest } = sp;
    setForm({
      ...emptySpeciality(),
      ...rest,
      seoTitle: rest.seoTitle || "",
      canonicalUrl: rest.canonicalUrl || "",
      seoDescription: rest.seoDescription || "",
      focusKeyword: rest.focusKeyword || "",
      seoSlug: rest.seoSlug || rest.slug || "",
      seoSchema: rest.seoSchema || "",
      bullets: rest.bullets?.length ? rest.bullets : [emptyBullet()],
      accordionCards: rest.accordionCards?.length
        ? rest.accordionCards
        : [emptyAccordionCard(0)],
    });
    setEditingId(id);
    setView("form");
    setCurrentAccordionPage(0);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this speciality?")) return;
    try {
      await deleteSpeciality(id);
      await loadSpecialities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function openAddNew() {
    resetForm();
    setView("form");
  }

  const currentAccordion = form.accordionCards[currentAccordionPage] ?? form.accordionCards[0];
  const sectionStyle: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#f0f0f0",
    borderColor: borderCol,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 16,
  };

  if (view === "list") {
    return (
      <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 min-w-0 mt-10 md:mt-14 lg:mt-10">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
            Specialities
          </h1>
          <button
            onClick={openAddNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
          >
            + Add New Speciality
          </button>
        </div>

        {error && (
          <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#fde8e8", color: "#b00020" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm" style={{ color: text2 }}>Loading…</p>
        ) : specialities.length === 0 ? (
          <div
            className="rounded-2xl border p-16 flex flex-col items-center gap-4"
            style={{ borderColor: borderCol, backgroundColor: isDark ? "#c9a898" : "#f0f0f0" }}
          >
            <p className="text-sm font-semibold" style={{ color: text2 }}>No specialities yet</p>
            <button onClick={openAddNew} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: brand }}>
              + Add New Speciality
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: tableBg, borderColor: borderCol }}>
            <div className="w-full max-[1439px]:overflow-x-auto min-[1440px]:overflow-x-hidden">
              <table className="w-full text-xs sm:text-sm hidden sm:table max-[1439px]:min-w-[640px] min-[1440px]:table-fixed">
                <colgroup className="max-[1439px]:hidden">
                  <col className="w-[18%]" />
                  <col className="w-[42%]" />
                  <col className="w-[18%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                    {["Image", "Title", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-3 min-[1440px]:px-6 py-3 text-[11px] sm:text-[13px] font-medium ${h === "Actions" ? "text-center" : "text-left"}`}
                        style={{ color: text2 }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedSpecialities.map((sp) => (
                    <tr key={sp.id} style={{ borderBottom: `1px solid ${borderCol}` }}>
                      <td className="px-3 min-[1440px]:px-6 py-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
                          {sp.heroImageUrl && (
                            <MediaImage path={sp.heroImageUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 min-[1440px]:px-6 py-3 font-semibold max-w-0" style={{ color: text1 }}>
                        <span className="block truncate" title={sp.title}>{sp.title}</span>
                      </td>
                      <td className="px-3 min-[1440px]:px-6 py-3">
                        <span className={specialityStatusClass(sp.status)}>
                          {sp.status}
                        </span>
                      </td>
                      <td className="px-3 min-[1440px]:px-6 py-3">
                        <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="View"
                          disabled={sp.status !== "published"}
                          onClick={() => {
                            if (sp.status === "published") {
                              window.open(specialityPagePath(sp.slug), "_blank");
                            }
                          }}
                          className={`${actionBtn} hover:bg-blue-100 disabled:opacity-35 disabled:pointer-events-none`}
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(sp)}
                          className={`${actionBtn} hover:bg-amber-100`}
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(sp.id)}
                          className={`${actionBtn} hover:bg-red-100`}
                          style={{ color: text2 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="sm:hidden flex flex-col gap-3 p-4">
              {pagedSpecialities.map((sp) => (
                <div
                  key={sp.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: borderCol, backgroundColor: cardInner }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: isDark ? "#d0baa3" : "#EDE0C4" }}>
                      {sp.heroImageUrl && (
                        <MediaImage path={sp.heroImageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold" style={{ color: text1 }}>{sp.title}</div>
                      <div className="mt-2">
                        <span className={specialityStatusClass(sp.status)}>{sp.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t" style={{ borderColor: borderCol }}>
                    <button
                      type="button"
                      title="View"
                      disabled={sp.status !== "published"}
                      onClick={() => {
                        if (sp.status === "published") {
                          window.open(specialityPagePath(sp.slug), "_blank");
                        }
                      }}
                      className={`${actionBtn} hover:bg-blue-100 disabled:opacity-35 disabled:pointer-events-none`}
                      style={{ color: text2 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => openEdit(sp)}
                      className={`${actionBtn} hover:bg-amber-100`}
                      style={{ color: text2 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDelete(sp.id)}
                      className={`${actionBtn} hover:bg-red-100`}
                      style={{ color: text2 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <TablePagination
              page={specialityPagination.meta.page}
              total={specialityPagination.meta.total}
              limit={specialityPagination.meta.limit}
              totalPages={specialityPagination.meta.totalPages}
              onPageChange={setListPage}
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

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 min-w-0 mt-10 md:mt-14 lg:mt-10">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
          {editingId ? "Edit Speciality" : "New Speciality"}
        </h1>
        <button
          onClick={() => { resetForm(); setView("list"); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold border"
          style={{ borderColor: borderCol, color: brand }}
        >
          ← Back to list
        </button>
      </div>

      {error && (
        <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#fde8e8", color: "#b00020" }}>
          {error}
        </p>
      )}

      <div style={sectionStyle}>
        <FieldLabel text="UPLOAD HERO IMAGE" required />
        <UploadBlock
          value={form.heroImageUrl}
          onUpload={(f) =>
            handleImageUpload(f, (url) => setF("heroImageUrl", url), "hero")
          }
          isDark={isDark}
          uploading={uploadingImageField === "hero"}
        />
      </div>

      <div style={sectionStyle}>
        <FieldLabel text="TITLE" required />
        <Field
          value={form.title}
          onChange={(v) => {
            setF("title", v);
            if (!editingId) {
              const s = slugifyTitle(v);
              if (!form.slug || form.slug === slugifyTitle(form.title)) setF("slug", s);
              if (!form.seoSlug || form.seoSlug === slugifyTitle(form.title)) setF("seoSlug", s);
            }
          }}
          placeholder="e.g. Orthodontie"
          isDark={isDark}
        />
      </div>

      <div style={sectionStyle}>
        <FieldLabel text="HERO SUBTITLE" />
        <Field
          value={form.heroSubtitle}
          onChange={(v) => setF("heroSubtitle", v)}
          placeholder="e.g. (facettes, blanchiment) sous microscope"
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-4">
        <div style={sectionStyle}>
          <FieldLabel text="URL SLUG" />
          <Field
            value={form.slug}
            onChange={(v) => {
              const s = slugifyTitle(v);
              setF("slug", s);
              setF("seoSlug", s);
            }}
            placeholder="orthodontie"
            isDark={isDark}
          />
        </div>
        <div style={sectionStyle}>
          <FieldLabel text="STATUS" />
          <select
            value={form.status}
            onChange={(e) => setF("status", e.target.value as "draft" | "published")}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none border"
            style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", borderColor: "#7a7072", color: brand }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div style={sectionStyle}>
        <FieldLabel text="INTRO DESCRIPTION (burgundy section)" required />
        <Field value={form.description} onChange={(v) => setF("description", v)} placeholder="Enter intro paragraph" isDark={isDark} multiline rows={6} />
      </div>

      <div style={sectionStyle}>
        <FieldLabel text="HEADING 1 (Why Atlas section)" />
        <Field value={form.heading1} onChange={(v) => setF("heading1", v)} placeholder="Choisissez Atlas Dental Center pour…" isDark={isDark} />
      </div>

      <div style={sectionStyle}>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5">
          <div>
            <FieldLabel text="WHY SECTION IMAGE" />
            <UploadBlock
              value={form.image1Url}
              onUpload={(f) =>
                handleImageUpload(f, (url) => setF("image1Url", url), "image1")
              }
              height={230}
              isDark={isDark}
              uploading={uploadingImageField === "image1"}
            />
          </div>
          <div>
            <FieldLabel text="DESCRIPTION 1" />
            <Field value={form.description1} onChange={(v) => setF("description1", v)} placeholder="Paragraph under heading 1" isDark={isDark} multiline rows={10} />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="flex items-center justify-between mb-3">
          <FieldLabel text="BULLET POINTS (Why Atlas)" />
          <button
            type="button"
            onClick={addBullet}
            className="text-xs font-semibold hover:opacity-80"
            style={{ color: brand }}
          >
            + Add Bullet
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {form.bullets.map((bullet, i) => (
            <div key={i} className="relative">
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
                <Field value={bullet.title} onChange={(v) => updateBullet(i, "title", v)} placeholder={`Bullet ${i + 1} title`} isDark={isDark} />
                <Field value={bullet.text} onChange={(v) => updateBullet(i, "text", v)} placeholder={`Bullet ${i + 1} text`} isDark={isDark} multiline rows={2} />
              </div>
              {form.bullets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBullet(i)}
                  className="mt-2 text-xs font-semibold hover:opacity-80"
                  style={{ color: "#C94A3A" }}
                >
                  Remove bullet
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <FieldLabel text="HEADING 2 (Accordion section title)" />
        <Field value={form.heading2} onChange={(v) => setF("heading2", v)} placeholder="Accordion section heading" isDark={isDark} />
      </div>

      <div style={sectionStyle}>
        <FieldLabel text="ACCORDION CARDS" />
        {currentAccordion && (
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5">
            <div>
              <FieldLabel text="CARD IMAGE" />
              <UploadBlock
                value={currentAccordion.imageUrl}
                onUpload={(f) =>
                  handleImageUpload(
                    f,
                    (url) => updateAccordion(currentAccordionPage, "imageUrl", url),
                    `accordion-${currentAccordionPage}`,
                  )
                }
                height={220}
                isDark={isDark}
                uploading={uploadingImageField === `accordion-${currentAccordionPage}`}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel text="CARD LABEL" />
                <Field
                  value={currentAccordion.label}
                  onChange={(v) => updateAccordion(currentAccordionPage, "label", v)}
                  placeholder="e.g. Facettes"
                  isDark={isDark}
                />
              </div>
              <div>
                <FieldLabel text="CARD DESCRIPTION" />
                <Field
                  value={currentAccordion.description}
                  onChange={(v) => updateAccordion(currentAccordionPage, "description", v)}
                  placeholder="Card description"
                  isDark={isDark}
                  multiline
                  rows={5}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 flex-wrap gap-3" style={{ borderTop: `1px solid ${borderCol}` }}>
          <div className="flex items-center gap-4">
            <button type="button" onClick={addAccordionCard} className="text-xs font-semibold" style={{ color: brand }}>
              + Add Card
            </button>
            {form.accordionCards.length > 1 && (
              <button
                type="button"
                onClick={() => removeAccordionCard(currentAccordionPage)}
                className="text-xs font-semibold"
                style={{ color: "#C94A3A" }}
              >
                Remove current card
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentAccordionPage((p) => Math.max(0, p - 1))}
              disabled={currentAccordionPage === 0}
              className="w-7 h-7 rounded-lg border disabled:opacity-30"
              style={{ borderColor: borderCol, color: brand }}
            >
              ‹
            </button>
            <span className="text-xs" style={{ color: text2 }}>
              {currentAccordionPage + 1} / {form.accordionCards.length}
            </span>
            <button
              onClick={() =>
                setCurrentAccordionPage((p) =>
                  Math.min(form.accordionCards.length - 1, p + 1)
                )
              }
              disabled={currentAccordionPage >= form.accordionCards.length - 1}
              className="w-7 h-7 rounded-lg border disabled:opacity-30"
              style={{ borderColor: borderCol, color: brand }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── SEO SECTION (same pattern as Blogs) ── */}
      <div style={sectionStyle}>
        <div className="flex items-center gap-2 mb-4" style={{ borderBottom: `1px solid ${borderCol}`, paddingBottom: 12 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[15px] font-bold" style={{ color: brand }}>SEO Settings</span>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <FieldLabel text="SEO TITLE" />
            <Field
              value={form.seoTitle}
              onChange={(v) => setF("seoTitle", v)}
              placeholder="Enter SEO title…"
              isDark={isDark}
            />
            <div className="flex justify-end mt-1">
              <span style={{ fontSize: 10, color: form.seoTitle.length > 60 ? "#C94A3A" : brand, opacity: 0.6 }}>
                {form.seoTitle.length}/60
              </span>
            </div>
          </div>
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <FieldLabel text="CANONICAL URL" />
            <Field
              value={form.canonicalUrl}
              onChange={(v) => setF("canonicalUrl", v)}
              placeholder="https://example.com/pages/specialites/…"
              isDark={isDark}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <FieldLabel text="FOCUS KEYWORD" />
            <Field
              value={form.focusKeyword}
              onChange={(v) => setF("focusKeyword", v)}
              placeholder="e.g. orthodontie casablanca…"
              isDark={isDark}
            />
          </div>
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <FieldLabel text="SEO SLUG / URL" />
            <div
              className="flex items-center border rounded-2xl overflow-hidden"
              style={{
                borderColor: isDark ? "#5C2A3A" : "#7a7072",
                backgroundColor: isDark ? "#c9a898" : "#ffffff",
              }}
            >
              <span
                className="px-3 text-xs select-none whitespace-nowrap"
                style={{
                  color: brand,
                  opacity: 0.45,
                  borderRight: "1px solid #D9C9A8",
                  paddingTop: 12,
                  paddingBottom: 12,
                }}
              >
                /pages/specialites/
              </span>
              <input
                type="text"
                value={form.seoSlug}
                onChange={(e) => {
                  const s = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  setF("seoSlug", s);
                  setF("slug", s);
                }}
                placeholder="orthodontie"
                className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
                style={{ color: brand }}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <FieldLabel text="SEO DESCRIPTION" />
          <Field
            value={form.seoDescription}
            onChange={(v) => setF("seoDescription", v)}
            placeholder="Enter a concise meta description (recommended 150–160 characters)…"
            isDark={isDark}
            multiline
            rows={3}
          />
          <div className="flex justify-end mt-1">
            <span style={{ fontSize: 10, color: form.seoDescription.length > 160 ? "#C94A3A" : brand, opacity: 0.6 }}>
              {form.seoDescription.length}/160
            </span>
          </div>
        </div>

        <div>
          <FieldLabel text="SCHEMA" />
          <textarea
            value={form.seoSchema}
            onChange={(e) => setF("seoSchema", e.target.value)}
            placeholder='{"@context":"https://schema.org","@type":"MedicalProcedure",...}'
            rows={6}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none border resize-y font-mono"
            style={{
              backgroundColor: isDark ? "#c9a898" : "#ffffff",
              borderColor: isDark ? "#5C2A3A" : "#7a7072",
              color: brand,
              lineHeight: 1.65,
              fontSize: 13,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-2 mb-10">
        <button
          onClick={() => { resetForm(); setView("list"); }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
          style={{ borderColor: borderCol, color: brand }}
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={saving || Boolean(uploadingImageField)}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: saved ? "#3DAA7A" : isDark ? "#8B1A2E" : brand }}
        >
          {saving ? "Saving…" : saved ? "✓ Saved!" : editingId ? "Update" : "Publish / Save"}
        </button>
      </div>
    </div>
  );
}
