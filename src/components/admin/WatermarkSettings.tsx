"use client";

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";

export function WatermarkSettings() {
  const [enabled, setEnabled] = useState(true);
  const [opacity, setOpacity] = useState(25);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/watermark", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setEnabled(!!d.enabled);
        setOpacity(Number(d.opacity) || 25);
      })
      .catch(() => {});
  }, []);

  async function save() {
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/watermark", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, opacity }),
    });
    setBusy(false);
    setMsg(r.ok ? "Saved. The public site shows it on the next page load." : "Could not save.");
  }

  return (
    <div className="max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Image watermark</h3>
        <p className="mt-1 text-xs text-slate-500">
          Shows the ECOTECH logo, centered and across the full width, on product, category,
          service and hero photos. The original image files are not changed.
        </p>
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
        Show watermark on images
      </label>
      <div>
        <label className="text-sm font-semibold text-slate-800">Opacity: {opacity}%</label>
        <input type="range" min={5} max={80} step={1} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-2 w-full" />
        <div
          className="relative mt-3 h-32 overflow-hidden rounded-xl bg-slate-700"
          style={{ backgroundImage: "linear-gradient(135deg,#334155,#94a3b8)" }}
        >
          {enabled && (
            <div
              className="absolute inset-0"
              style={{
                background: "#fff",
                WebkitMask: "url(/ecotech-logo.svg) center/92% auto no-repeat",
                mask: "url(/ecotech-logo.svg) center/92% auto no-repeat",
                opacity: opacity / 100,
                filter: "drop-shadow(0 0 1.5px rgba(0,0,0,.95)) drop-shadow(0 0 5px rgba(0,0,0,.55))",
              }}
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#250C52] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          <Save className="h-4 w-4" /> Save
        </button>
        {msg && <span className="text-xs text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}
