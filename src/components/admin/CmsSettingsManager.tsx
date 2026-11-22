"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle2, AlertCircle, X } from "lucide-react";
import { ServicesEditor } from "./ServicesEditor";
import { WatermarkSettings } from "./WatermarkSettings";
import { SeoPagesEditor } from "./SeoPagesEditor";

interface HomepageSectionRow {
  id: number;
  sectionKey: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string | null;
  subtitleAr: string | null;
  ctaPrimaryLabelEn: string | null;
  ctaPrimaryLabelAr: string | null;
  ctaPrimaryHref: string | null;
  ctaSecondaryLabelEn: string | null;
  ctaSecondaryLabelAr: string | null;
  ctaSecondaryHref: string | null;
  heroMediaUrl: string | null;
  payload: Record<string, unknown>;
  isVisible: boolean;
}

interface SettingRow {
  key: string;
  valueEn: string | null;
  valueAr: string | null;
  valueJson: Record<string, unknown> | null;
}

interface WebsitePageRow {
  slug: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string | null;
  subtitleAr: string | null;
  contentEn: string | null;
  contentAr: string | null;
  structuredData: Record<string, unknown>;
}

export function CmsSettingsManager() {
  const [subTab, setSubTab] = useState<"homepage" | "about" | "services" | "seo" | "watermark" | "settings">(
    "homepage"
  );
  const [sections, setSections] = useState<HomepageSectionRow[]>([]);
  const [selectedKey, setSelectedKey] = useState("hero");
  const [aboutPage, setAboutPage] = useState<WebsitePageRow | null>(null);
  const [settings, setSettings] = useState<SettingRow[]>([]);

  const [payloadText, setPayloadText] = useState("{}");
  const [aboutJsonText, setAboutJsonText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    const [hRes, pRes, sRes] = await Promise.all([
      fetch("/api/homepage"),
      fetch("/api/pages?slug=about-us"),
      fetch("/api/settings"),
    ]);
    if (hRes.ok) {
      const hData = await hRes.json();
      const list: HomepageSectionRow[] = hData.sections || [];
      setSections(list);
      const current = list.find((x) => x.sectionKey === selectedKey) || list[0];
      if (current) {
        setSelectedKey(current.sectionKey);
        setPayloadText(JSON.stringify(current.payload || {}, null, 2));
      }
    }
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData.page) {
        setAboutPage(pData.page);
        setAboutJsonText(JSON.stringify(pData.page.structuredData || {}, null, 2));
      }
    }
    if (sRes.ok) {
      const sData = await sRes.json();
      setSettings((sData.settings || []).filter((r: { key: string }) => r.key !== "services_content"));
    }
  }, [selectedKey]);

  useEffect(() => {
    load();
  }, []);

  const currentSection =
    sections.find((s) => s.sectionKey === selectedKey) || null;

  function updateSectionField(field: keyof HomepageSectionRow, value: unknown) {
    setSections((prev) =>
      prev.map((s) =>
        s.sectionKey === selectedKey ? { ...s, [field]: value } : s
      )
    );
  }

  async function saveHomepageSection(e: React.FormEvent) {
    e.preventDefault();
    if (!currentSection) return;
    setSaving(true);
    setFeedback(null);
    try {
      let parsedPayload = currentSection.payload;
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch {
        setFeedback({ type: "error", text: "Invalid JSON in section payload." });
        setSaving(false);
        return;
      }

      const res = await fetch("/api/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentSection,
          payload: parsedPayload,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setFeedback({ type: "error", text: d.error || "Save failed." });
      } else {
        setFeedback({
          type: "success",
          text: `Homepage section "${currentSection.sectionKey}" saved to database.`,
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveAboutPage(e: React.FormEvent) {
    e.preventDefault();
    if (!aboutPage) return;
    setSaving(true);
    setFeedback(null);
    try {
      let parsedSd = aboutPage.structuredData;
      try {
        parsedSd = JSON.parse(aboutJsonText);
      } catch {
        setFeedback({ type: "error", text: "Invalid JSON in structured data." });
        setSaving(false);
        return;
      }
      const res = await fetch("/api/pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...aboutPage, structuredData: parsedSd }),
      });
      if (!res.ok) {
        setFeedback({ type: "error", text: "Failed to save About Us page." });
      } else {
        setFeedback({ type: "success", text: "About Us page updated." });
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: settings }),
      });
      if (!res.ok) {
        setFeedback({ type: "error", text: "Failed to save settings." });
      } else {
        setFeedback({
          type: "success",
          text: "Corporate contact & footer settings saved.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">
            Website Content & Settings CMS
          </h2>
          <p className="text-xs text-slate-500">
            Modify homepage hero, headlines, stats, About Us profile, contact info, map embed, and footer without touching code.
          </p>
        </div>
        <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              ["homepage", "Homepage Sections"],
              ["about", "About Us Page"],
              ["services", "Services"],
              ["seo", "Page SEO"],
              ["watermark", "Watermark"],
              ["settings", "Contact & Footer Settings"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSubTab(k)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                subTab === k
                  ? "bg-[#250C52] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {feedback.text}
          </span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {subTab === "services" && <ServicesEditor />}
      {subTab === "seo" && <SeoPagesEditor />}
      {subTab === "watermark" && <WatermarkSettings />}

      {/* 1. HOMEPAGE SECTIONS */}
      {subTab === "homepage" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-3 lg:col-span-3">
            {sections.map((s) => (
              <button
                key={s.sectionKey}
                type="button"
                onClick={() => {
                  setSelectedKey(s.sectionKey);
                  setPayloadText(JSON.stringify(s.payload || {}, null, 2));
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                  selectedKey === s.sectionKey
                    ? "bg-[#250C52] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="uppercase">{s.sectionKey.replace("_", " ")}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.isVisible ? "bg-emerald-400" : "bg-slate-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {currentSection && (
            <form
              onSubmit={saveHomepageSection}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-9"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold uppercase text-[#250C52]">
                  Section: {currentSection.sectionKey}
                </h3>
                <label className="inline-flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={currentSection.isVisible}
                    onChange={(e) =>
                      updateSectionField("isVisible", e.target.checked)
                    }
                  />
                  <span>Visible on Homepage</span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Headline / Title (English)
                  </label>
                  <input
                    value={currentSection.titleEn}
                    onChange={(e) => updateSectionField("titleEn", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Headline / Title (Arabic)
                  </label>
                  <input
                    dir="rtl"
                    value={currentSection.titleAr}
                    onChange={(e) => updateSectionField("titleAr", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Subtitle (English)
                  </label>
                  <textarea
                    rows={2}
                    value={currentSection.subtitleEn || ""}
                    onChange={(e) =>
                      updateSectionField("subtitleEn", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Subtitle (Arabic)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={currentSection.subtitleAr || ""}
                    onChange={(e) =>
                      updateSectionField("subtitleAr", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {currentSection.sectionKey === "hero" && (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Hero Image URL
                    </label>
                    <input
                      value={currentSection.heroMediaUrl || ""}
                      onChange={(e) =>
                        updateSectionField("heroMediaUrl", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Primary CTA Label (EN)
                    </label>
                    <input
                      value={currentSection.ctaPrimaryLabelEn || ""}
                      onChange={(e) =>
                        updateSectionField("ctaPrimaryLabelEn", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Primary CTA Label (AR)
                    </label>
                    <input
                      dir="rtl"
                      value={currentSection.ctaPrimaryLabelAr || ""}
                      onChange={(e) =>
                        updateSectionField("ctaPrimaryLabelAr", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Primary CTA Link
                    </label>
                    <input
                      value={currentSection.ctaPrimaryHref || ""}
                      onChange={(e) =>
                        updateSectionField("ctaPrimaryHref", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Secondary CTA Label (EN)
                    </label>
                    <input
                      value={currentSection.ctaSecondaryLabelEn || ""}
                      onChange={(e) =>
                        updateSectionField("ctaSecondaryLabelEn", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Secondary CTA Label (AR)
                    </label>
                    <input
                      dir="rtl"
                      value={currentSection.ctaSecondaryLabelAr || ""}
                      onChange={(e) =>
                        updateSectionField("ctaSecondaryLabelAr", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Section Items / Structured Payload (JSON)
                </label>
                <textarea
                  rows={8}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-5 py-2.5 text-xs font-bold text-white shadow"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Save Section"}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. ABOUT US PAGE */}
      {subTab === "about" && aboutPage && (
        <form
          onSubmit={saveAboutPage}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Page Title (English)
              </label>
              <input
                value={aboutPage.titleEn}
                onChange={(e) =>
                  setAboutPage({ ...aboutPage, titleEn: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Page Title (Arabic)
              </label>
              <input
                dir="rtl"
                value={aboutPage.titleAr}
                onChange={(e) =>
                  setAboutPage({ ...aboutPage, titleAr: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Overview (English)
              </label>
              <textarea
                rows={4}
                value={aboutPage.contentEn || ""}
                onChange={(e) =>
                  setAboutPage({ ...aboutPage, contentEn: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Overview (Arabic)
              </label>
              <textarea
                rows={4}
                dir="rtl"
                value={aboutPage.contentAr || ""}
                onChange={(e) =>
                  setAboutPage({ ...aboutPage, contentAr: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Vision, Mission, Core Values, Capabilities & Industries (JSON)
            </label>
            <textarea
              rows={10}
              value={aboutJsonText}
              onChange={(e) => setAboutJsonText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-5 py-2.5 text-xs font-bold text-white shadow"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save About Us Page"}</span>
          </button>
        </form>
      )}

      {/* 3. COMPANY SETTINGS */}
      {subTab === "settings" && (
        <form
          onSubmit={saveSettings}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="space-y-3">
            {settings.map((s, idx) => (
              <div
                key={s.key}
                className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3"
              >
                <div className="flex items-center font-mono text-xs font-bold text-[#250C52]">
                  {s.key}
                </div>
                {s.key === "social_links" ? (
                  <input
                    className="sm:col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs"
                    value={JSON.stringify(s.valueJson || {})}
                    onChange={(e) => {
                      const next = [...settings];
                      try {
                        next[idx].valueJson = JSON.parse(e.target.value);
                      } catch {
                        // ignore until valid
                      }
                      setSettings(next);
                    }}
                  />
                ) : (
                  <>
                    <input
                      placeholder="English Value"
                      value={s.valueEn || ""}
                      onChange={(e) => {
                        const next = [...settings];
                        next[idx].valueEn = e.target.value;
                        setSettings(next);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
                    />
                    <input
                      dir="rtl"
                      placeholder="Arabic Value"
                      value={s.valueAr || ""}
                      onChange={(e) => {
                        const next = [...settings];
                        next[idx].valueAr = e.target.value;
                        setSettings(next);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-5 py-2.5 text-xs font-bold text-white shadow"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Corporate Settings"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
