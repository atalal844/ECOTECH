"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Save, Plus, Trash2, RotateCcw, ImageIcon, Upload } from "lucide-react";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

// Structural fields are never shown or edited.
const HIDDEN = new Set(["slug", "icon", "inquiryService", "id", "tone"]);

const LABELS: Record<string, string> = {
  eyebrow: "Small label above the title",
  title: "Title",
  sub: "Subtitle",
  lead: "Intro paragraph",
  hero: "Main photo",
  blocks: "Content sections",
  body: "Paragraphs",
  cards: "Cards",
  list: "Bullet points",
  image: "Photo",
  stepsTitle: "Steps: heading",
  steps: "Steps",
  prepareTitle: "What to send: heading",
  prepareIntro: "What to send: intro",
  prepare: "What to send: items",
  faqTitle: "FAQ: heading",
  faq: "Questions and answers",
  note: "Note at the bottom",
  sources: "Reference links",
  blurb: "Description",
  more: "Button: learn more",
  all: "Button: all services",
  text: "Text",
  t: "Card title",
  d: "Card text",
  q: "Question",
  a: "Answer",
  src: "Photo address (URL)",
  alt: "Photo description (for accessibility)",
  cap: "Photo caption",
  label: "Link text",
  url: "Link address",
  credits: "Photo credits line",
};

function label(k: string) {
  return LABELS[k] || k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function isL(v: Json): v is { en: string; ar: string } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    typeof (v as Obj).en === "string" &&
    typeof (v as Obj).ar === "string" &&
    Object.keys(v as Obj).length === 2
  );
}

function isImage(v: Json): boolean {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    typeof (v as Obj).src === "string" &&
    isL((v as Obj).alt) &&
    isL((v as Obj).cap)
  );
}

function blank(v: Json): Json {
  if (typeof v === "string") return "";
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") {
    const o: Obj = {};
    for (const k of Object.keys(v)) o[k] = HIDDEN.has(k) ? v[k] : blank(v[k]);
    if ("id" in v) o.id = `block-${Date.now().toString(36)}`;
    return o;
  }
  return v;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#250C52] focus:outline-none";

function TextPair({
  v,
  onChange,
  long,
}: {
  v: { en: string; ar: string };
  onChange: (n: { en: string; ar: string }) => void;
  long: boolean;
}) {
  const Tag = long ? "textarea" : "input";
  const extra = long ? { rows: Math.min(8, Math.max(2, Math.ceil(Math.max(v.en.length, v.ar.length) / 70))) } : {};
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div>
        <span className="mb-0.5 block text-[10px] font-bold uppercase text-slate-400">English</span>
        <Tag
          {...extra}
          value={v.en}
          onChange={(e) => onChange({ ...v, en: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <span className="mb-0.5 block text-[10px] font-bold uppercase text-slate-400">
          العربية (فصحى)
        </span>
        <Tag
          {...extra}
          dir="rtl"
          value={v.ar}
          onChange={(e) => onChange({ ...v, ar: e.target.value })}
          className={inputCls}
        />
      </div>
    </div>
  );
}

function ImageField({
  v,
  onChange,
  media,
  reloadMedia,
}: {
  v: Obj;
  onChange: (n: Obj) => void;
  media: { id: number; publicUrl: string; originalName: string }[];
  reloadMedia: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "services");
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const d = await res.json();
      const url = d?.uploaded?.[0]?.publicUrl;
      if (!res.ok || !url) throw new Error(d?.error || d?.errors?.[0] || "Upload failed");
      onChange({ ...v, src: url });
      reloadMedia();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  const src = v.src as string;
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={src}
            onChange={(e) => onChange({ ...v, src: e.target.value })}
            placeholder="/services/warehouse.jpg or https://..."
            className={inputCls}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value=""
              onChange={(e) => e.target.value && onChange({ ...v, src: e.target.value })}
              className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs"
            >
              <option value="">Choose from Media Library...</option>
              {media.map((m) => (
                <option key={m.id} value={m.publicUrl}>
                  {m.originalName}
                </option>
              ))}
            </select>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100">
              <Upload className="h-3.5 w-3.5" />
              {busy ? "Uploading..." : "Upload new photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </label>
            {err && <span className="text-xs text-red-600">{err}</span>}
          </div>
        </div>
      </div>
      <div>
        <span className="mb-0.5 block text-[11px] font-bold text-slate-600">{label("alt")}</span>
        <TextPair v={v.alt as { en: string; ar: string }} long={false} onChange={(n) => onChange({ ...v, alt: n })} />
      </div>
      <div>
        <span className="mb-0.5 block text-[11px] font-bold text-slate-600">{label("cap")}</span>
        <TextPair v={v.cap as { en: string; ar: string }} long={false} onChange={(n) => onChange({ ...v, cap: n })} />
      </div>
    </div>
  );
}

type Ctx = {
  media: { id: number; publicUrl: string; originalName: string }[];
  reloadMedia: () => void;
};

function Node({
  k,
  v,
  onChange,
  ctx,
  depth,
}: {
  k: string;
  v: Json;
  onChange: (n: Json) => void;
  ctx: Ctx;
  depth: number;
}) {
  if (isImage(v)) {
    return (
      <Field name={k}>
        <ImageField v={v as Obj} onChange={onChange} {...ctx} />
      </Field>
    );
  }
  if (isL(v)) {
    const long = ["lead", "body", "d", "a", "text", "blurb", "prepareIntro", "note"].includes(k) || v.en.length > 90 || v.ar.length > 90;
    return (
      <Field name={k}>
        <TextPair v={v} long={long} onChange={onChange} />
      </Field>
    );
  }
  if (typeof v === "string") {
    return (
      <Field name={k}>
        <input value={v} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      </Field>
    );
  }
  if (Array.isArray(v)) {
    const template = v.length ? blank(v[0]) : ({ en: "", ar: "" } as Json);
    return (
      <Field name={k}>
        <div className="space-y-3">
          {v.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {label(k)} #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(v.filter((_, j) => j !== i))}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
              <Node
                k={`${k}-item`}
                v={item}
                ctx={ctx}
                depth={depth + 1}
                onChange={(n) => onChange(v.map((x, j) => (j === i ? n : x)))}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...v, template])}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </Field>
    );
  }
  if (v && typeof v === "object") {
    const o = v as Obj;
    const keys = Object.keys(o).filter((x) => !HIDDEN.has(x));
    const body = (
      <div className="space-y-4">
        {keys.map((x) => (
          <Node key={x} k={x} v={o[x]} ctx={ctx} depth={depth + 1} onChange={(n) => onChange({ ...o, [x]: n })} />
        ))}
      </div>
    );
    return depth === 0 || k.endsWith("-item") ? body : <Field name={k}>{body}</Field>;
  }
  return null;
}

function Field({ name, children }: { name: string; children: React.ReactNode }) {
  if (name.endsWith("-item")) return <>{children}</>;
  return (
    <div>
      <span className="mb-1 block text-xs font-bold text-slate-700">{label(name)}</span>
      {children}
    </div>
  );
}

type Tab = "home" | "warehousing" | "fiber-lab" | "credits";

export function ServicesEditor() {
  const [content, setContent] = useState<Obj | null>(null);
  const [customized, setCustomized] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [media, setMedia] = useState<{ id: number; publicUrl: string; originalName: string }[]>([]);

  const reloadMedia = useCallback(async () => {
    try {
      const r = await fetch("/api/media?type=images");
      if (r.ok) setMedia(((await r.json()).media || []).slice(0, 200));
    } catch {}
  }, []);

  const load = useCallback(async () => {
    const r = await fetch("/api/services-content", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setContent(d.content);
      setCustomized(!!d.customized);
    }
  }, []);

  useEffect(() => {
    load();
    reloadMedia();
  }, [load, reloadMedia]);

  async function save() {
    if (!content) return;
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/services-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setMsg({ ok: false, text: d.error || "Save failed." });
      else {
        setMsg({ ok: true, text: "Services content saved. The website shows it now." });
        setCustomized(true);
      }
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!confirm("Reset all Services content to the original text and photos?")) return;
    const r = await fetch("/api/services-content", { method: "DELETE" });
    if (r.ok) {
      await load();
      setMsg({ ok: true, text: "Reset to the original Services content." });
    } else setMsg({ ok: false, text: "Reset failed." });
  }

  if (!content) return <div className="p-6 text-xs text-slate-500">Loading services content...</div>;

  const pages = content.pages as Obj;
  const tabs: [Tab, string][] = [
    ["home", "Homepage block"],
    ["warehousing", "Warehousing page"],
    ["fiber-lab", "Fiber lab page"],
    ["credits", "Photo credits"],
  ];

  function setPart(t: Tab, n: Json) {
    if (t === "home") setContent({ ...content!, home: n });
    else if (t === "credits") setContent({ ...content!, credits: n });
    else setContent({ ...content!, pages: { ...pages, [t]: n } });
  }
  const current: Json = tab === "home" ? content.home : tab === "credits" ? content.credits : pages[tab];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#250C52]">Services content</h3>
          <p className="text-xs text-slate-500">
            Edit the text, photos and Arabic of the Services pages and the homepage Services block.{" "}
            {customized ? "Showing your saved version." : "Showing the original content (nothing saved yet)."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to original
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#250C52] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save all"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${
            msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              tab === k ? "bg-[#F08B22] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <Node k={tab} v={current} onChange={(n) => setPart(tab, n)} ctx={{ media, reloadMedia }} depth={0} />
      </div>
    </div>
  );
}
