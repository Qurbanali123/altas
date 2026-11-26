"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import {
  DEFAULT_TERMS_CONTENT,
  type TermsPageContent,
  fetchTermsContent,
  updateTermsContent,
} from "@/utils/termsApi";

function FieldLabel({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#591727" }}>
      {text}
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
  half = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  multiline?: boolean;
  rows?: number;
  half?: boolean;
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
      className={`${half ? "w-full sm:w-1/2" : "w-full"} px-4 py-3 rounded-2xl text-sm outline-none border`}
      style={st}
    />
  );
}

export default function TermsEditorPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("pages");
  const brand = "#591727";
  const borderCol = "#753141";
  const text2 = "#591727";

  const [content, setContent] = useState<TermsPageContent>(DEFAULT_TERMS_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const sectionStyle: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#f0f0f0",
    borderColor: borderCol,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 16,
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchTermsContent());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      setContent(await updateTermsContent(content));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateSection(
    index: number,
    patch: Partial<{ title: string; paragraphsText: string }>
  ) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => {
        if (i !== index) return s;
        if (patch.paragraphsText !== undefined) {
          return {
            ...s,
            title: patch.title ?? s.title,
            paragraphs: patch.paragraphsText
              .split(/\n\n+/)
              .map((p) => p.trim())
              .filter(Boolean),
          };
        }
        return { ...s, ...patch };
      }),
    }));
  }

  function addSection() {
    setContent((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { title: `${prev.sections.length + 1}. New section`, paragraphs: [""] },
      ],
    }));
  }

  function removeSection(index: number) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return (
      <div className="min-h-full ml-0 lg:ml-10 px-3 sm:px-4 mt-10">
        <p className="text-sm" style={{ color: text2 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 mt-10 md:mt-14 lg:mt-10 pb-10">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
            Pages — Terms
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit the client Terms page. Separate paragraphs with a blank line.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/pages/Terms_condition"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: borderCol, color: brand }}
          >
            View page
          </a>
          {canEdit && (
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
            >
              {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Header</h2>
        <div className="mb-4">
          <FieldLabel text="Eyebrow" />
          <Field
            value={content.eyebrow}
            onChange={(v) => setContent((p) => ({ ...p, eyebrow: v }))}
            placeholder="Informations Légales"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Title (use Enter for line break)" />
          <Field
            value={content.title}
            onChange={(v) => setContent((p) => ({ ...p, title: v }))}
            placeholder={"Conditions Générales\nd'Utilisation"}
            isDark={isDark}
            multiline
            rows={2}
          />
        </div>
        <div className="mb-0">
          <FieldLabel text="Updated date line" />
          <Field
            value={content.updatedAt}
            onChange={(v) => setContent((p) => ({ ...p, updatedAt: v }))}
            placeholder="Dernière mise à jour : 24 Mai 2024"
            isDark={isDark}
            half={false}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="text-lg font-bold" style={{ color: brand }}>
            Content sections
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={addSection}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ borderColor: borderCol, color: brand }}
            >
              + Add section
            </button>
          )}
        </div>

        {content.sections.map((section, index) => (
          <div
            key={index}
            className="mb-4 pb-4"
            style={{ borderBottom: index < content.sections.length - 1 ? `1px solid ${borderCol}33` : undefined }}
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-sm font-semibold" style={{ color: brand }}>
                Section {index + 1}
              </p>
              {canEdit && content.sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="text-xs font-semibold"
                  style={{ color: "#b91c1c" }}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="mb-3">
              <FieldLabel text="Section title" />
              <Field
                value={section.title}
                onChange={(v) => updateSection(index, { title: v })}
                placeholder="1. Introduction"
                isDark={isDark}
                half={false}
              />
            </div>
            <div>
              <FieldLabel text="Paragraphs (blank line between paragraphs)" />
              <Field
                value={section.paragraphs.join("\n\n")}
                onChange={(v) => updateSection(index, { paragraphsText: v })}
                placeholder="First paragraph…\n\nSecond paragraph…"
                isDark={isDark}
                multiline
                rows={6}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Contact block</h2>
        <div className="mb-4">
          <FieldLabel text="Contact text" />
          <Field
            value={content.contactText}
            onChange={(v) => setContent((p) => ({ ...p, contactText: v }))}
            placeholder="Pour toute question…"
            isDark={isDark}
            multiline
            rows={2}
          />
        </div>
        <div className="mb-0">
          <FieldLabel text="Contact email" />
          <Field
            value={content.contactEmail}
            onChange={(v) => setContent((p) => ({ ...p, contactEmail: v }))}
            placeholder="contact@atlasdentalcenter.com"
            isDark={isDark}
            half={false}
          />
        </div>
      </div>
    </div>
  );
}
