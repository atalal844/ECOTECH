"use client";

import React, { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";

type PageSeo = { titleEn: string; titleAr: string; descEn: string; descAr: string; imageUrl: string };
type Pages = Record<string, PageSeo>;

const LABELS: Record<string, string> = {
  home: "Homepage",
  products: "Products page",
  about: "About Us page",
  services: "Services page",
  contact: "Contact page",
};

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`text-[10px] font-semibold ${over ? "text-red-600" : "text-slate-400"}`}>
      {value.length}/{max}
    </span>
  );
}

export function SeoPagesEditor() {
  const [pages, setPages] = useState<Pages>({});
  const [customized, setCustomized] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/seo-pages", { cache: "no-store" });
    const d = await r.json();
    setPages(d.seo);
    setCustomized(!!d.customized);
  }
  useEffect(() => {
    load();
  }, []);

  function set(page: string, key: keyof PageSeo, v: string) {
    setPages((p) => ({ ...p, [page]: { ...p[page], [key]: v } }));
  }

  async function save() {
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/seo-pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seo: pages }),
    });
    setBusy(false);
    if (r.ok) {
      setMsg("SEO settings saved. The website shows them now.");
      load();
    } else setMsg("Could not save.");
  }

  async function reset() {
    if (!window.confirm("Reset all page SEO text to the original?")) return;
    setBusy(true);
    const r = await fetch("/api/seo-pages", { method: "DELETE" });
    setBusy(false);
    setMsg(r.ok ? "Reset to the original SEO text." : "Could not reset.");
    load();
  }

  const input = "w-full rounded-xl border border-slate-200 px-3 py-2 text-xs";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Page SEO (search results and sharing)</h3>
          <p className="mt-1 max-w-xl text-xs text-slate-500">
            The title and description shown on Google and when a page link is shared, in English and Arabic.
            Product and category SEO is edited inside each product and category. Titles: about 60
            characters. Descriptions: about 160.{" "}
            {customized ? "Showing your saved version." : "Showing the original text (nothing saved yet)."}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reset} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
            <RotateCcw className="h-4 w-4" /> Reset to original
          </button>
          <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#250C52] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
            <Save className="h-4 w-4" /> Save all
          </button>
        </div>
      </div>
      {msg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">{msg}</div>}
      {Object.keys(LABELS).map((k) => {
        const p = pages[k];
        if (!p) return null;
        return (
          <div key={k} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            <h4 className="text-sm font-bold text-[#250C52]">{LABELS[k]}</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 flex justify-between text-xs font-bold text-slate-700">Title (English) <Counter value={p.titleEn} max={60} /></label>
                <input className={input} value={p.titleEn} onChange={(e) => set(k, "titleEn", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-xs font-bold text-slate-700">Title (Arabic) <Counter value={p.titleAr} max={60} /></label>
                <input className={input} dir="rtl" value={p.titleAr} onChange={(e) => set(k, "titleAr", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-xs font-bold text-slate-700">Description (English) <Counter value={p.descEn} max={160} /></label>
                <textarea rows={3} className={input} value={p.descEn} onChange={(e) => set(k, "descEn", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-xs font-bold text-slate-700">Description (Arabic) <Counter value={p.descAr} max={160} /></label>
                <textarea rows={3} dir="rtl" className={input} value={p.descAr} onChange={(e) => set(k, "descAr", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Sharing image address (optional, default is the ECOTECH social image)</label>
              <input className={input} value={p.imageUrl} placeholder="https://..." onChange={(e) => set(k, "imageUrl", e.target.value)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
