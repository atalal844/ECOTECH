"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2, CheckCircle2, AlertCircle, X } from "lucide-react";

interface CategoryRow {
  id: number;
  parentId: number | null;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  seoTitleEn?: string | null;
  seoTitleAr?: string | null;
  seoDescriptionEn?: string | null;
  seoDescriptionAr?: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  catalogUrl: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  productCount?: number;
}

export function CategoriesManager({ canDelete = false }: { canDelete?: boolean }) {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    parentId: "" as string,
    slug: "",
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    seoTitleEn: "",
    seoTitleAr: "",
    seoDescriptionEn: "",
    seoDescriptionAr: "",
    imageUrl: "/images/cat-racks.jpg",
    bannerUrl: "/images/cat-racks.jpg",
    catalogUrl: "",
    displayOrder: 0,
    isFeatured: false,
    isActive: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories?includeInactive=1");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm({
      parentId: "",
      slug: "",
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      seoTitleEn: "",
      seoTitleAr: "",
      seoDescriptionEn: "",
      seoDescriptionAr: "",
      imageUrl: "/images/cat-racks.jpg",
      bannerUrl: "/images/cat-racks.jpg",
      catalogUrl: "",
      displayOrder: categories.length + 1,
      isFeatured: false,
      isActive: true,
    });
    setModalOpen(true);
  }

  function openEdit(c: CategoryRow) {
    setEditingId(c.id);
    setForm({
      parentId: c.parentId ? String(c.parentId) : "",
      slug: c.slug,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      descriptionEn: c.descriptionEn || "",
      descriptionAr: c.descriptionAr || "",
      seoTitleEn: c.seoTitleEn || "",
      seoTitleAr: c.seoTitleAr || "",
      seoDescriptionEn: c.seoDescriptionEn || "",
      seoDescriptionAr: c.seoDescriptionAr || "",
      imageUrl: c.imageUrl || "",
      bannerUrl: c.bannerUrl || "",
      catalogUrl: c.catalogUrl || "",
      displayOrder: c.displayOrder,
      isFeatured: c.isFeatured,
      isActive: c.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      ...form,
      parentId: form.parentId ? Number(form.parentId) : null,
      displayOrder: Number(form.displayOrder) || 0,
      catalogUrl: form.catalogUrl || null,
      seoTitleEn: form.seoTitleEn || null,
      seoTitleAr: form.seoTitleAr || null,
      seoDescriptionEn: form.seoDescriptionEn || null,
      seoDescriptionAr: form.seoDescriptionAr || null,
    };

    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Save failed." });
    } else {
      setFeedback({
        type: "success",
        text: editingId ? "Category updated." : "Category created.",
      });
      setModalOpen(false);
      await load();
    }
  }

  async function handleDelete(c: CategoryRow) {
    setFeedback(null);
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Cannot delete category." });
    } else {
      setFeedback({ type: "success", text: `Deleted "${c.nameEn}".` });
      await load();
    }
  }

  const parents = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">
            Categories & Subcategories
          </h2>
          <p className="text-xs text-slate-500">
            Organize product hierarchies, banners, descriptions, and downloadable catalogs.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-4 py-2.5 text-xs font-bold text-white shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Category (EN / AR)</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading categories...
                  </td>
                </tr>
              ) : (
                categories.map((c) => {
                  const parent = c.parentId
                    ? categories.find((p) => p.id === c.parentId)
                    : null;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">
                          {c.parentId ? "↳ " : ""}
                          {c.nameEn}
                        </div>
                        <div className="text-slate-500">{c.nameAr}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{c.slug}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {parent ? parent.nameEn : "— Top Level —"}
                      </td>
                      <td className="px-4 py-3">{c.displayOrder}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            c.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {c.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {canDelete && <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950">
                {editingId ? "Edit Category" : "Create New Category"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  Parent Category
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  <option value="">None (Main Category)</option>
                  {parents
                    .filter((p) => p.id !== editingId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameEn}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Image URL
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Banner URL
                </label>
                <input
                  value={form.bannerUrl}
                  onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Catalog PDF URL
                </label>
                <input
                  value={form.catalogUrl}
                  onChange={(e) => setForm({ ...form, catalogUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Description (English)
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
                  Description (Arabic)
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
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-bold text-[#250C52]">SEO (search results and sharing, optional)</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">SEO title (English)</label>
                  <input value={form.seoTitleEn} onChange={(e) => setForm({ ...form, seoTitleEn: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">SEO title (Arabic)</label>
                  <input dir="rtl" value={form.seoTitleAr} onChange={(e) => setForm({ ...form, seoTitleAr: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">SEO description (English)</label>
                  <textarea rows={2} value={form.seoDescriptionEn} onChange={(e) => setForm({ ...form, seoDescriptionEn: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">SEO description (Arabic)</label>
                  <textarea rows={2} dir="rtl" value={form.seoDescriptionAr} onChange={(e) => setForm({ ...form, seoDescriptionAr: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Active / Visible</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                <span>Featured on Homepage</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#250C52] px-5 py-2 text-xs font-bold text-white"
              >
                {editingId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
