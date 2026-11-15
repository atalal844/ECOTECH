"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUp,
  ArrowDown,
  Star,
  UploadCloud,
  FolderOpen,
  Eye,
  Search,
} from "lucide-react";
import { MediaManager, type MediaItem } from "./MediaManager";

interface CategoryOption {
  id: number;
  parentId: number | null;
  nameEn: string;
}

interface ProductImageDraft {
  mediaId?: number | null;
  url: string;
  mediaType: "image" | "gif" | "video";
  altEn: string;
  altAr: string;
  isPrimary: boolean;
  is360Frame: boolean;
  displayOrder: number;
}

interface ProductDocDraft {
  mediaId?: number | null;
  docType:
    | "datasheet"
    | "manual"
    | "diagram"
    | "certificate"
    | "installation_guide"
    | "catalog"
    | "legacy_archive"
    | "other";
  titleEn: string;
  titleAr: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isLegacyArchive: boolean;
  displayOrder: number;
}

interface ProductSpecDraft {
  groupNameEn: string;
  groupNameAr: string;
  specKeyEn: string;
  specKeyAr: string;
  specValueEn: string;
  specValueAr: string;
  displayOrder: number;
}

interface ProductRow {
  id: number;
  categoryId: number;
  slug: string;
  sku: string;
  model: string;
  productType: string;
  nameEn: string;
  nameAr: string;
  shortOverviewEn: string | null;
  shortOverviewAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  featuresEn: string[];
  featuresAr: string[];
  applicationsEn: string[];
  applicationsAr: string[];
  configurationsEn: string[];
  configurationsAr: string[];
  dimensions: string | null;
  materialsEn: string | null;
  materialsAr: string | null;
  availabilityStatus: string;
  status: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  has360View: boolean;
  displayOrder: number;
  viewCount: number;
  seoTitleEn: string | null;
  seoTitleAr: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionAr: string | null;
  ogImageUrl: string | null;
  category?: CategoryOption | null;
  primaryImage?: { url: string } | null;
  images: ProductImageDraft[];
  documents: ProductDocDraft[];
  specifications: ProductSpecDraft[];
}

export function ProductsManager() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "specs" | "gallery" | "docs" | "seo"
  >("general");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Media Picker Modal
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    null | "gallery" | "doc"
  >(null);

  // Drag reorder index
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const [form, setForm] = useState({
    categoryId: 0,
    slug: "",
    sku: "",
    model: "",
    productType: "Server Rack",
    nameEn: "",
    nameAr: "",
    shortOverviewEn: "",
    shortOverviewAr: "",
    descriptionEn: "",
    descriptionAr: "",
    featuresEnText: "",
    featuresArText: "",
    applicationsEnText: "",
    applicationsArText: "",
    configurationsEnText: "",
    configurationsArText: "",
    dimensions: "",
    materialsEn: "",
    materialsAr: "",
    availabilityStatus: "in_stock" as
      | "in_stock"
      | "made_to_order"
      | "pre_order"
      | "discontinued",
    status: "draft" as "draft" | "published" | "archived",
    isFeatured: false,
    isBestSeller: false,
    has360View: false,
    displayOrder: 0,
    seoTitleEn: "",
    seoTitleAr: "",
    seoDescriptionEn: "",
    seoDescriptionAr: "",
    ogImageUrl: "",
  });

  const [images, setImages] = useState<ProductImageDraft[]>([]);
  const [documents, setDocuments] = useState<ProductDocDraft[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecDraft[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ includeAll: "1", limit: "100" });
      if (q.trim()) params.set("q", q.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const [pRes, cRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch("/api/categories?includeInactive=1"),
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCategories(cData.categories || []);
      }
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setEditingId(null);
    setActiveTab("general");
    setForm({
      categoryId: categories[0]?.id || 1,
      slug: "",
      sku: "",
      model: "",
      productType: "Network Infrastructure",
      nameEn: "",
      nameAr: "",
      shortOverviewEn: "",
      shortOverviewAr: "",
      descriptionEn: "",
      descriptionAr: "",
      featuresEnText: "",
      featuresArText: "",
      applicationsEnText: "",
      applicationsArText: "",
      configurationsEnText: "",
      configurationsArText: "",
      dimensions: "",
      materialsEn: "",
      materialsAr: "",
      availabilityStatus: "in_stock",
      status: "draft",
      isFeatured: false,
      isBestSeller: false,
      has360View: false,
      displayOrder: products.length + 1,
      seoTitleEn: "",
      seoTitleAr: "",
      seoDescriptionEn: "",
      seoDescriptionAr: "",
      ogImageUrl: "",
    });
    setImages([]);
    setDocuments([]);
    setSpecifications([]);
    setModalOpen(true);
  }

  function openEdit(p: ProductRow) {
    setEditingId(p.id);
    setActiveTab("general");
    setForm({
      categoryId: p.categoryId,
      slug: p.slug,
      sku: p.sku,
      model: p.model,
      productType: p.productType,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      shortOverviewEn: p.shortOverviewEn || "",
      shortOverviewAr: p.shortOverviewAr || "",
      descriptionEn: p.descriptionEn || "",
      descriptionAr: p.descriptionAr || "",
      featuresEnText: (p.featuresEn || []).join("\n"),
      featuresArText: (p.featuresAr || []).join("\n"),
      applicationsEnText: (p.applicationsEn || []).join("\n"),
      applicationsArText: (p.applicationsAr || []).join("\n"),
      configurationsEnText: (p.configurationsEn || []).join("\n"),
      configurationsArText: (p.configurationsAr || []).join("\n"),
      dimensions: p.dimensions || "",
      materialsEn: p.materialsEn || "",
      materialsAr: p.materialsAr || "",
      availabilityStatus: p.availabilityStatus as typeof form.availabilityStatus,
      status: p.status as typeof form.status,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      has360View: p.has360View,
      displayOrder: p.displayOrder,
      seoTitleEn: p.seoTitleEn || "",
      seoTitleAr: p.seoTitleAr || "",
      seoDescriptionEn: p.seoDescriptionEn || "",
      seoDescriptionAr: p.seoDescriptionAr || "",
      ogImageUrl: p.ogImageUrl || "",
    });
    setImages(
      (p.images || []).map((i, idx) => ({
        mediaId: i.mediaId ?? null,
        url: i.url,
        mediaType: (i.mediaType as "image" | "gif" | "video") || "image",
        altEn: i.altEn || "",
        altAr: i.altAr || "",
        isPrimary: i.isPrimary,
        is360Frame: i.is360Frame,
        displayOrder: i.displayOrder ?? idx,
      }))
    );
    setDocuments(
      (p.documents || []).map((d, idx) => ({
        mediaId: d.mediaId ?? null,
        docType: d.docType || "datasheet",
        titleEn: d.titleEn,
        titleAr: d.titleAr,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        fileSize: d.fileSize || 0,
        mimeType: d.mimeType || "application/pdf",
        isLegacyArchive: d.isLegacyArchive || false,
        displayOrder: d.displayOrder ?? idx,
      }))
    );
    setSpecifications(
      (p.specifications || []).map((s, idx) => ({
        groupNameEn: s.groupNameEn || "Technical Specifications",
        groupNameAr: s.groupNameAr || "المواصفات الفنية",
        specKeyEn: s.specKeyEn,
        specKeyAr: s.specKeyAr,
        specValueEn: s.specValueEn,
        specValueAr: s.specValueAr,
        displayOrder: s.displayOrder ?? idx,
      }))
    );
    setModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const lines = (text: string) =>
      text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

    const payload = {
      categoryId: Number(form.categoryId),
      slug: form.slug,
      sku: form.sku,
      model: form.model,
      productType: form.productType,
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      shortOverviewEn: form.shortOverviewEn || null,
      shortOverviewAr: form.shortOverviewAr || null,
      descriptionEn: form.descriptionEn || null,
      descriptionAr: form.descriptionAr || null,
      featuresEn: lines(form.featuresEnText),
      featuresAr: lines(form.featuresArText),
      applicationsEn: lines(form.applicationsEnText),
      applicationsAr: lines(form.applicationsArText),
      configurationsEn: lines(form.configurationsEnText),
      configurationsAr: lines(form.configurationsArText),
      dimensions: form.dimensions || null,
      materialsEn: form.materialsEn || null,
      materialsAr: form.materialsAr || null,
      availabilityStatus: form.availabilityStatus,
      status: form.status,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      has360View: form.has360View,
      displayOrder: Number(form.displayOrder) || 0,
      seoTitleEn: form.seoTitleEn || null,
      seoTitleAr: form.seoTitleAr || null,
      seoDescriptionEn: form.seoDescriptionEn || null,
      seoDescriptionAr: form.seoDescriptionAr || null,
      ogImageUrl: form.ogImageUrl || null,
      images: images.map((img, i) => ({ ...img, displayOrder: i })),
      documents: documents.map((doc, i) => ({ ...doc, displayOrder: i })),
      specifications: specifications
        .filter((s) => s.specKeyEn.trim() && s.specValueEn.trim())
        .map((s, i) => ({ ...s, displayOrder: i })),
    };

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Failed to save product." });
      } else {
        setFeedback({
          type: "success",
          text: editingId
            ? `Updated product "${form.nameEn}".`
            : `Created product "${form.nameEn}".`,
        });
        setModalOpen(false);
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickStatus(p: ProductRow, nextStatus: string) {
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setFeedback({
        type: "success",
        text: `Product "${p.sku}" marked as ${nextStatus}.`,
      });
      loadData();
    }
  }

  async function handleDuplicate(p: ProductRow) {
    const res = await fetch(`/api/products/${p.id}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setFeedback({
        type: "success",
        text: `Duplicated as "${data.product.sku}" (Draft).`,
      });
      loadData();
    } else {
      setFeedback({ type: "error", text: data.error || "Duplicate failed." });
    }
  }

  async function handleDelete(p: ProductRow) {
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      setFeedback({ type: "success", text: `Deleted product "${p.sku}".` });
      loadData();
    } else {
      const data = await res.json();
      setFeedback({ type: "error", text: data.error || "Delete failed." });
    }
  }

  async function uploadDirectToProduct(files: FileList, target: "gallery" | "doc") {
    const fd = new FormData();
    fd.append("folder", target === "gallery" ? "products" : "datasheets");
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/media", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Upload failed." });
      return;
    }
    const uploaded: MediaItem[] = data.uploaded || [];
    if (target === "gallery") {
      setImages((prev) => [
        ...prev,
        ...uploaded.map((m, idx) => ({
          mediaId: m.id,
          url: m.publicUrl,
          mediaType:
            m.extension === "mp4"
              ? ("video" as const)
              : m.extension === "gif"
              ? ("gif" as const)
              : ("image" as const),
          altEn: m.altEn || form.nameEn || m.originalName,
          altAr: m.altAr || form.nameAr || m.originalName,
          isPrimary: prev.length === 0 && idx === 0,
          is360Frame: false,
          displayOrder: prev.length + idx,
        })),
      ]);
    } else {
      setDocuments((prev) => [
        ...prev,
        ...uploaded.map((m, idx) => ({
          mediaId: m.id,
          docType: (m.isLegacyArchive ? "legacy_archive" : "datasheet") as ProductDocDraft["docType"],
          titleEn: m.originalName,
          titleAr: m.originalName,
          fileUrl: m.publicUrl,
          fileName: m.originalName,
          fileSize: m.fileSize,
          mimeType: m.mimeType,
          isLegacyArchive: m.isLegacyArchive,
          displayOrder: prev.length + idx,
        })),
      ]);
    }
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setImages(copy);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">
            Product Catalog Management
          </h2>
          <p className="text-xs text-slate-500">
            Create, edit, duplicate, publish, and attach images, specifications & PDFs.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-4 py-2.5 text-xs font-bold text-white shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
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

      {/* Search & Status Filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name, SKU, or model..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-xs outline-none focus:border-[#7A1D4B]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU / Model</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primaryImage?.url || "/images/cat-racks.jpg"}
                          alt={p.nameEn}
                          className="h-10 w-12 rounded-lg border border-slate-200 object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.nameEn}</div>
                          <div className="text-[11px] text-slate-500">{p.nameAr}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="font-semibold text-slate-800">{p.sku}</div>
                      <div className="text-[11px] text-slate-500">{p.model}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.category?.nameEn || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickStatus(
                            p,
                            p.status === "published" ? "draft" : "published"
                          )
                        }
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          p.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "draft"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        title="Click to toggle Published / Draft"
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.viewCount}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {p.status === "published" && (
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                            title="View Live Page"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(p)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                          title="Duplicate Product"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={handleSaveProduct}
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-950">
                  {editingId ? `Edit Product: ${form.sku}` : "Create New Product"}
                </h3>
                <p className="text-xs text-slate-500">
                  All technical specifications are strictly saved as entered by admin.
                </p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-6 py-2">
              {(
                [
                  ["general", "1. General & Bilingual"],
                  ["specs", `2. Specifications (${specifications.length})`],
                  ["gallery", `3. Gallery & Video (${images.length})`],
                  ["docs", `4. Datasheets & Docs (${documents.length})`],
                  ["seo", "5. SEO & Meta"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeTab === key
                      ? "bg-[#250C52] text-white"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        SKU *
                      </label>
                      <input
                        required
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Model *
                      </label>
                      <input
                        required
                        value={form.model}
                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Category *
                      </label>
                      <select
                        value={form.categoryId}
                        onChange={(e) =>
                          setForm({ ...form, categoryId: Number(e.target.value) })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.parentId ? "— " : ""}
                            {c.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Name (English) *
                      </label>
                      <input
                        required
                        value={form.nameEn}
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm({
                            ...form,
                            nameEn: v,
                            slug:
                              editingId || form.slug
                                ? form.slug
                                : v
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-|-$/g, ""),
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Name (Arabic) *
                      </label>
                      <input
                        required
                        dir="rtl"
                        value={form.nameAr}
                        onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        URL Slug *
                      </label>
                      <input
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Product Type
                      </label>
                      <input
                        value={form.productType}
                        onChange={(e) =>
                          setForm({ ...form, productType: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Availability
                      </label>
                      <select
                        value={form.availabilityStatus}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            availabilityStatus: e.target.value as typeof form.availabilityStatus,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="made_to_order">Made to Order</option>
                        <option value="pre_order">Pre-Order</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Publication Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            status: e.target.value as typeof form.status,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Short Overview (English)
                      </label>
                      <textarea
                        rows={2}
                        value={form.shortOverviewEn}
                        onChange={(e) =>
                          setForm({ ...form, shortOverviewEn: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Short Overview (Arabic)
                      </label>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={form.shortOverviewAr}
                        onChange={(e) =>
                          setForm({ ...form, shortOverviewAr: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Detailed Description (English)
                      </label>
                      <textarea
                        rows={3}
                        value={form.descriptionEn}
                        onChange={(e) =>
                          setForm({ ...form, descriptionEn: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Detailed Description (Arabic)
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={form.descriptionAr}
                        onChange={(e) =>
                          setForm({ ...form, descriptionAr: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Features & Benefits (EN — one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={form.featuresEnText}
                        onChange={(e) =>
                          setForm({ ...form, featuresEnText: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Features & Benefits (AR — one per line)
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={form.featuresArText}
                        onChange={(e) =>
                          setForm({ ...form, featuresArText: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Applications (EN — one per line)
                      </label>
                      <textarea
                        rows={2}
                        value={form.applicationsEnText}
                        onChange={(e) =>
                          setForm({ ...form, applicationsEnText: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Applications (AR — one per line)
                      </label>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={form.applicationsArText}
                        onChange={(e) =>
                          setForm({ ...form, applicationsArText: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Available Configurations (EN — one per line)
                      </label>
                      <textarea
                        rows={2}
                        value={form.configurationsEnText}
                        onChange={(e) =>
                          setForm({ ...form, configurationsEnText: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Available Configurations (AR — one per line)
                      </label>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={form.configurationsArText}
                        onChange={(e) =>
                          setForm({ ...form, configurationsArText: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Dimensions
                      </label>
                      <input
                        value={form.dimensions}
                        onChange={(e) =>
                          setForm({ ...form, dimensions: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Materials (English)
                      </label>
                      <input
                        value={form.materialsEn}
                        onChange={(e) =>
                          setForm({ ...form, materialsEn: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700">
                        Materials (Arabic)
                      </label>
                      <input
                        dir="rtl"
                        value={form.materialsAr}
                        onChange={(e) =>
                          setForm({ ...form, materialsAr: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) =>
                          setForm({ ...form, isFeatured: e.target.checked })
                        }
                      />
                      <span>Featured Product</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isBestSeller}
                        onChange={(e) =>
                          setForm({ ...form, isBestSeller: e.target.checked })
                        }
                      />
                      <span>Best Seller</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.has360View}
                        onChange={(e) =>
                          setForm({ ...form, has360View: e.target.checked })
                        }
                      />
                      <span>Enable 360° Interactive View</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span>Display Order:</span>
                      <input
                        type="number"
                        value={form.displayOrder}
                        onChange={(e) =>
                          setForm({ ...form, displayOrder: Number(e.target.value) })
                        }
                        className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600">
                      Add administrator-approved technical specifications in English and Arabic.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setSpecifications((prev) => [
                          ...prev,
                          {
                            groupNameEn: "Technical Specifications",
                            groupNameAr: "المواصفات الفنية",
                            specKeyEn: "",
                            specKeyAr: "",
                            specValueEn: "",
                            specValueAr: "",
                            displayOrder: prev.length,
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-[#250C52] px-3 py-2 text-xs font-bold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Spec Row</span>
                    </button>
                  </div>

                  {specifications.map((s, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-7"
                    >
                      <input
                        placeholder="Group (EN)"
                        value={s.groupNameEn}
                        onChange={(e) => {
                          const next = [...specifications];
                          next[idx].groupNameEn = e.target.value;
                          setSpecifications(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        dir="rtl"
                        placeholder="المجموعة (AR)"
                        value={s.groupNameAr}
                        onChange={(e) => {
                          const next = [...specifications];
                          next[idx].groupNameAr = e.target.value;
                          setSpecifications(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        placeholder="Spec Name (EN)"
                        value={s.specKeyEn}
                        onChange={(e) => {
                          const next = [...specifications];
                          next[idx].specKeyEn = e.target.value;
                          setSpecifications(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        dir="rtl"
                        placeholder="اسم المواصفة (AR)"
                        value={s.specKeyAr}
                        onChange={(e) => {
                          const next = [...specifications];
                          next[idx].specKeyAr = e.target.value;
                          setSpecifications(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        placeholder="Value (EN)"
                        value={s.specValueEn}
                        onChange={(e) => {
                          const next = [...specifications];
                          next[idx].specValueEn = e.target.value;
                          setSpecifications(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        dir="rtl"
                        placeholder="القيمة (AR)"
                        value={s.specValueAr}
                        onChange={(e) => {
                          const next = [...specifications];
                          next[idx].specValueAr = e.target.value;
                          setSpecifications(next);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSpecifications(specifications.filter((_, i) => i !== idx))
                        }
                        className="flex items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#250C52] px-4 py-2 text-xs font-bold text-white">
                      <UploadCloud className="h-4 w-4" />
                      <span>Upload Images / GIF / MP4</span>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.svg,.gif,.mp4"
                        onChange={(e) =>
                          e.target.files && uploadDirectToProduct(e.target.files, "gallery")
                        }
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget("gallery")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <FolderOpen className="h-4 w-4 text-[#F08B22]" />
                      <span>Pick from Media Library</span>
                    </button>
                    <span className="text-xs text-slate-500">
                      Drag cards to reorder gallery sequence.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => setDragIdx(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragIdx !== null && dragIdx !== idx) {
                            moveImage(dragIdx, idx);
                          }
                          setDragIdx(null);
                        }}
                        className="cursor-move rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-white">
                          {img.mediaType === "video" ? (
                            <video src={img.url} className="h-full w-full object-cover" />
                          ) : (
                            <img
                              src={img.url}
                              alt={img.altEn}
                              className="h-full w-full object-cover"
                            />
                          )}
                          {img.isPrimary && (
                            <span className="absolute top-2 start-2 rounded-md bg-[#F08B22] px-2 py-0.5 text-[10px] font-bold text-white">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              setImages(
                                images.map((item, i) => ({
                                  ...item,
                                  isPrimary: i === idx,
                                }))
                              )
                            }
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-bold ${
                              img.isPrimary
                                ? "bg-amber-100 text-amber-800"
                                : "border border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            <Star className="h-3 w-3" />
                            Primary
                          </button>
                          <label className="inline-flex items-center gap-1 text-slate-600">
                            <input
                              type="checkbox"
                              checked={img.is360Frame}
                              onChange={(e) => {
                                const next = [...images];
                                next[idx].is360Frame = e.target.checked;
                                setImages(next);
                              }}
                            />
                            360°
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx - 1)}
                              className="rounded border border-slate-200 bg-white p-1"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx + 1)}
                              className="rounded border border-slate-200 bg-white p-1"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setImages(images.filter((_, i) => i !== idx))
                              }
                              className="rounded border border-red-200 bg-white p-1 text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#250C52] px-4 py-2 text-xs font-bold text-white">
                      <UploadCloud className="h-4 w-4" />
                      <span>Upload PDF / Manual / Diagram / ZIP / SWF</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.dwg,.dxf,.xlsx,.xls,.docx,.doc,.zip,.swf"
                        onChange={(e) =>
                          e.target.files && uploadDirectToProduct(e.target.files, "doc")
                        }
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget("doc")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <FolderOpen className="h-4 w-4 text-[#F08B22]" />
                      <span>Pick from Media Library</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-5"
                      >
                        <select
                          value={doc.docType}
                          onChange={(e) => {
                            const next = [...documents];
                            next[idx].docType = e.target.value as ProductDocDraft["docType"];
                            setDocuments(next);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value="datasheet">Datasheet (PDF)</option>
                          <option value="manual">User Manual</option>
                          <option value="installation_guide">Installation Guide</option>
                          <option value="diagram">Technical Diagram</option>
                          <option value="certificate">Certificate</option>
                          <option value="catalog">Catalog</option>
                          <option value="legacy_archive">Legacy Archive (SWF)</option>
                        </select>
                        <input
                          value={doc.titleEn}
                          onChange={(e) => {
                            const next = [...documents];
                            next[idx].titleEn = e.target.value;
                            setDocuments(next);
                          }}
                          placeholder="Title (EN)"
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <input
                          dir="rtl"
                          value={doc.titleAr}
                          onChange={(e) => {
                            const next = [...documents];
                            next[idx].titleAr = e.target.value;
                            setDocuments(next);
                          }}
                          placeholder="العنوان (AR)"
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <div className="flex items-center truncate px-2 text-xs text-slate-500">
                          {doc.fileName}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDocuments(documents.filter((_, i) => i !== idx))
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      SEO Meta Title (English)
                    </label>
                    <input
                      value={form.seoTitleEn}
                      onChange={(e) =>
                        setForm({ ...form, seoTitleEn: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      SEO Meta Title (Arabic)
                    </label>
                    <input
                      dir="rtl"
                      value={form.seoTitleAr}
                      onChange={(e) =>
                        setForm({ ...form, seoTitleAr: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      SEO Meta Description (English)
                    </label>
                    <textarea
                      rows={3}
                      value={form.seoDescriptionEn}
                      onChange={(e) =>
                        setForm({ ...form, seoDescriptionEn: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      SEO Meta Description (Arabic)
                    </label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={form.seoDescriptionAr}
                      onChange={(e) =>
                        setForm({ ...form, seoDescriptionAr: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Open Graph Image URL
                    </label>
                    <input
                      value={form.ogImageUrl}
                      onChange={(e) =>
                        setForm({ ...form, ogImageUrl: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-6 py-2 text-xs font-bold text-white shadow disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Product Changes"
                  : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Picker Sub-Modal */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-slate-50 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">
                Select Asset from ECOTECH Media Library
              </h3>
              <button type="button" onClick={() => setMediaPickerTarget(null)}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <MediaManager
              pickerMode
              onSelectMedia={(m) => {
                if (mediaPickerTarget === "gallery") {
                  setImages((prev) => [
                    ...prev,
                    {
                      mediaId: m.id,
                      url: m.publicUrl,
                      mediaType:
                        m.extension === "mp4"
                          ? "video"
                          : m.extension === "gif"
                          ? "gif"
                          : "image",
                      altEn: m.altEn || form.nameEn,
                      altAr: m.altAr || form.nameAr,
                      isPrimary: prev.length === 0,
                      is360Frame: false,
                      displayOrder: prev.length,
                    },
                  ]);
                } else {
                  setDocuments((prev) => [
                    ...prev,
                    {
                      mediaId: m.id,
                      docType: m.isLegacyArchive ? "legacy_archive" : "datasheet",
                      titleEn: m.originalName,
                      titleAr: m.originalName,
                      fileUrl: m.publicUrl,
                      fileName: m.originalName,
                      fileSize: m.fileSize,
                      mimeType: m.mimeType,
                      isLegacyArchive: m.isLegacyArchive,
                      displayOrder: prev.length,
                    },
                  ]);
                }
                setMediaPickerTarget(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
