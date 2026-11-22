"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Archive,
} from "lucide-react";

interface DocRow {
  id: number;
  productId: number;
  docType: string;
  titleEn: string;
  titleAr: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  isLegacyArchive: boolean;
  createdAt: string;
  productNameEn: string;
  productSku: string;
}

interface ProductOption {
  id: number;
  nameEn: string;
  sku: string;
}

export function DocumentsManager({ canDelete = false }: { canDelete?: boolean }) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  const [productId, setProductId] = useState<number>(0);
  const [docType, setDocType] = useState<
    | "datasheet"
    | "manual"
    | "diagram"
    | "certificate"
    | "installation_guide"
    | "catalog"
    | "legacy_archive"
    | "other"
  >("datasheet");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [uploading, setUploading] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/products?includeAll=1&limit=100"),
      ]);
      if (dRes.ok) {
        const dData = await dRes.json();
        setDocs(dData.documents || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        const prods = pData.products || [];
        setProducts(prods);
        if (prods.length > 0 && !productId) {
          setProductId(prods[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUploadAndAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    setUploading(true);
    setFeedback(null);

    try {
      const fd = new FormData();
      fd.append("folder", "datasheets");
      fd.append("files", file);

      const upRes = await fetch("/api/media", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.uploaded?.[0]) {
        setFeedback({ type: "error", text: upData.error || "Upload failed." });
        return;
      }

      const m = upData.uploaded[0];
      const attRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          mediaId: m.id,
          docType: m.isLegacyArchive ? "legacy_archive" : docType,
          titleEn: titleEn.trim() || m.originalName,
          titleAr: titleAr.trim() || titleEn.trim() || m.originalName,
          fileUrl: m.publicUrl,
          fileName: m.originalName,
          fileSize: m.fileSize,
          mimeType: m.mimeType,
          isLegacyArchive: m.isLegacyArchive,
        }),
      });
      const attData = await attRes.json();
      if (!attRes.ok) {
        setFeedback({ type: "error", text: attData.error || "Failed to attach document." });
      } else {
        setFeedback({
          type: "success",
          text: `Attached "${m.originalName}" successfully.`,
        });
        setTitleEn("");
        setTitleAr("");
        await load();
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setFeedback({ type: "success", text: "Document unlinked from product." });
      load();
    } else {
      const data = await res.json();
      setFeedback({ type: "error", text: data.error || "Delete failed." });
    }
  }

  const filtered =
    typeFilter === "all" ? docs : docs.filter((d) => d.docType === typeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-slate-950">
          Datasheets, Manuals & Technical Documents
        </h2>
        <p className="text-xs text-slate-500">
          Upload and associate PDF datasheets, catalogs, installation manuals, CAD diagrams, certificates, and archived SWF attachments with products.
        </p>
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

      {/* Quick Attach Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#250C52]">
          Upload & Associate Document to Product
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.sku}] {p.nameEn}
              </option>
            ))}
          </select>

          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as typeof docType)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
          >
            <option value="datasheet">Product Datasheet (PDF)</option>
            <option value="catalog">Product Catalog</option>
            <option value="installation_guide">Installation Guide</option>
            <option value="manual">User Manual</option>
            <option value="diagram">Technical Drawing (PDF/DWG/DXF)</option>
            <option value="certificate">Compliance Certificate</option>
            <option value="legacy_archive">Legacy Archive (SWF/ZIP)</option>
          </select>

          <input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Document Title (EN)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
          />

          <input
            dir="rtl"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            placeholder="عنوان المستند (AR)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
          />
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-5 py-2.5 text-xs font-bold text-white shadow">
          <UploadCloud className="h-4 w-4" />
          <span>{uploading ? "Uploading & Attaching..." : "Choose Document File & Attach"}</span>
          <input
            type="file"
            disabled={uploading || !productId}
            accept=".pdf,.dwg,.dxf,.xlsx,.xls,.docx,.doc,.zip,.swf"
            onChange={handleUploadAndAttach}
            className="hidden"
          />
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          "all",
          "datasheet",
          "catalog",
          "manual",
          "installation_guide",
          "diagram",
          "certificate",
          "legacy_archive",
        ].map((dt) => (
          <button
            key={dt}
            type="button"
            onClick={() => setTypeFilter(dt)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
              typeFilter === dt
                ? "bg-[#250C52] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {dt.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Associated Product</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Loading documents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {d.isLegacyArchive ? (
                          <Archive className="h-4 w-4 text-amber-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-[#250C52]" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{d.titleEn}</div>
                          <div className="text-[11px] text-slate-500">{d.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        {d.docType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{d.productNameEn}</div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {d.productSku}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {d.fileSize ? `${Math.max(1, Math.round(d.fileSize / 1024))} KB` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`${d.fileUrl}?download=1`}
                          download={d.fileName}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        {canDelete && <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
