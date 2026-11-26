"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import {
  DEFAULT_HOME_FAQ,
  type HomeFaqContent,
  type HomeFaqCategory,
  fetchHomeFaq,
  updateHomeFaq,
  newFaqCategoryId,
  newFaqItemId,
} from "@/utils/homeFaqApi";

function FieldLabel({ text }: { text: string }) {
  return (
    <p
      className="text-[10px] font-bold tracking-widest uppercase mb-1.5"
      style={{ color: "#591727" }}
    >
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
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const st: React.CSSProperties = {
    borderRadius: 12,
    border: `1px solid ${isDark ? "#3a3a3a" : "#e5d5c8"}`,
    background: isDark ? "#1a1a1a" : "#fff",
    color: isDark ? "#fff" : "#2c1a1a",
    padding: "10px 12px",
    fontSize: 13,
  };
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full"
        style={st}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
      style={st}
    />
  );
}

export default function AccueilFaqEditorPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("pages");
  const brand = "#711C31";
  const text2 = isDark ? "#aaa" : "#6b5a5e";
  const borderCol = isDark ? "#3a3a3a" : "#e5d5c8";
  const sectionStyle: React.CSSProperties = {
    background: isDark ? "#141414" : "#fff",
    border: `1px solid ${borderCol}`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  };

  const [content, setContent] = useState<HomeFaqContent>(DEFAULT_HOME_FAQ);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCat, setOpenCat] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeFaq());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQ");
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
      setContent(await updateHomeFaq(content));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateCategory(index: number, patch: Partial<HomeFaqCategory>) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) =>
        i === index ? { ...c, ...patch } : c
      ),
    }));
  }

  function updateItem(
    catIndex: number,
    itemIndex: number,
    patch: Partial<HomeFaqCategory["items"][number]>
  ) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => {
        if (i !== catIndex) return c;
        return {
          ...c,
          items: c.items.map((item, j) =>
            j === itemIndex ? { ...item, ...patch } : item
          ),
        };
      }),
    }));
  }

  function addCategory() {
    const name = "New category";
    const id = newFaqCategoryId(name);
    setContent((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id,
          name,
          items: [
            {
              id: newFaqItemId("q"),
              q: "New question?",
              a: "Answer…",
            },
          ],
        },
      ],
    }));
    setOpenCat(id);
  }

  function removeCategory(index: number) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  }

  function addItem(catIndex: number) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => {
        if (i !== catIndex) return c;
        return {
          ...c,
          items: [
            ...c.items,
            { id: newFaqItemId("q"), q: "New question?", a: "Answer…" },
          ],
        };
      }),
    }));
  }

  function removeItem(catIndex: number, itemIndex: number) {
    setContent((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => {
        if (i !== catIndex) return c;
        if (c.items.length <= 1) return c;
        return { ...c, items: c.items.filter((_, j) => j !== itemIndex) };
      }),
    }));
  }

  if (loading) {
    return (
      <div className="min-h-full ml-0 lg:ml-10 px-3 sm:px-4 mt-10">
        <p className="text-sm" style={{ color: text2 }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 mt-10 md:mt-14 lg:mt-10 pb-10">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1
            className="text-3xl max-sm:text-xl font-bold"
            style={{ color: isDark ? "#ffffff" : brand }}
          >
            Accueil — FAQ section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit the FAQ title, intro, categories, and questions. The first
            question in each category is the main accordion row.
          </p>
        </div>
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

      {error && (
        <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div style={sectionStyle}>
        <div className="mb-4">
          <FieldLabel text="Title" />
          <Field
            value={content.title}
            onChange={(v) => setContent((p) => ({ ...p, title: v }))}
            placeholder="Frequently Asked Questions (FAQ)"
            isDark={isDark}
          />
        </div>
        <div>
          <FieldLabel text="Intro text" />
          <Field
            value={content.body}
            onChange={(v) => setContent((p) => ({ ...p, body: v }))}
            placeholder="Section description…"
            isDark={isDark}
            multiline
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <FieldLabel text="Categories" />
        {canEdit && (
          <button
            type="button"
            onClick={addCategory}
            className="text-xs font-semibold underline"
            style={{ color: brand }}
          >
            + Add category
          </button>
        )}
      </div>

      {content.categories.map((cat, catIndex) => {
        const expanded = openCat === cat.id;
        return (
          <div key={cat.id} style={sectionStyle}>
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <button
                type="button"
                onClick={() => setOpenCat(expanded ? null : cat.id)}
                className="text-sm font-semibold text-left"
                style={{ color: isDark ? "#fff" : brand }}
              >
                {expanded ? "▼" : "▶"} {cat.name || `Category ${catIndex + 1}`}
              </button>
              {canEdit && content.categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(catIndex)}
                  className="text-xs underline"
                  style={{ color: "#b91c1c" }}
                >
                  Remove category
                </button>
              )}
            </div>

            {expanded && (
              <>
                <div className="mb-4">
                  <FieldLabel text="Category name" />
                  <Field
                    value={cat.name}
                    onChange={(v) => updateCategory(catIndex, { name: v })}
                    placeholder="Category name"
                    isDark={isDark}
                  />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <FieldLabel text="Questions" />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => addItem(catIndex)}
                      className="text-xs font-semibold underline"
                      style={{ color: brand }}
                    >
                      + Add question
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {cat.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="rounded-xl p-4"
                      style={{
                        border: `1px solid ${borderCol}`,
                        background: isDark ? "#1a1a1a" : "#faf7f4",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <p className="text-xs font-semibold" style={{ color: text2 }}>
                          {itemIndex === 0
                            ? "Main row (featured)"
                            : `Nested Q${itemIndex}`}
                        </p>
                        {canEdit && cat.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(catIndex, itemIndex)}
                            className="text-xs underline"
                            style={{ color: "#b91c1c" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="mb-3">
                        <FieldLabel text="Question" />
                        <Field
                          value={item.q}
                          onChange={(v) =>
                            updateItem(catIndex, itemIndex, { q: v })
                          }
                          placeholder="Question?"
                          isDark={isDark}
                        />
                      </div>
                      <div>
                        <FieldLabel text="Answer" />
                        <Field
                          value={item.a}
                          onChange={(v) =>
                            updateItem(catIndex, itemIndex, { a: v })
                          }
                          placeholder="Answer…"
                          isDark={isDark}
                          multiline
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
