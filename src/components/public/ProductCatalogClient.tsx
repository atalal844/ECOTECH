"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { ProductCard, type ProductCardItem } from "./ProductCard";
import { UI_LABELS, pickText, type Lang } from "@/lib/i18n";
import type { NavCategory } from "./SiteHeader";

interface ProductCatalogClientProps {
  lang: Lang;
  initialProducts: ProductCardItem[];
  categories: NavCategory[];
  initialQuery?: string;
  fixedCategorySlug?: string;
}

export function ProductCatalogClient({
  lang,
  initialProducts,
  categories,
  initialQuery = "",
  fixedCategorySlug = "",
}: ProductCatalogClientProps) {
  const t = UI_LABELS[lang];
  const [items, setItems] = useState<ProductCardItem[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState(initialQuery);
  const [categorySlug, setCategorySlug] = useState(fixedCategorySlug);
  const [productType, setProductType] = useState("");
  const [availability, setAvailability] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const productTypes = Array.from(
    new Set(initialProducts.map((p) => p.productType).filter(Boolean))
  );

  async function fetchFiltered(overrides?: {
    q?: string;
    categorySlug?: string;
    productType?: string;
    availability?: string;
    featuredOnly?: boolean;
  }) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const nextQ = overrides?.q !== undefined ? overrides.q : q;
      const nextCat =
        overrides?.categorySlug !== undefined
          ? overrides.categorySlug
          : categorySlug;
      const nextType =
        overrides?.productType !== undefined
          ? overrides.productType
          : productType;
      const nextAvail =
        overrides?.availability !== undefined
          ? overrides.availability
          : availability;
      const nextFeat =
        overrides?.featuredOnly !== undefined
          ? overrides.featuredOnly
          : featuredOnly;

      if (nextQ.trim()) params.set("q", nextQ.trim());
      if (nextCat) params.set("categorySlug", nextCat);
      if (nextType) params.set("productType", nextType);
      if (nextAvail) params.set("availability", nextAvail);
      if (nextFeat) params.set("featured", "1");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.products || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setItems(initialProducts);
    setCategorySlug(fixedCategorySlug);
  }, [initialProducts, fixedCategorySlug]);

  function handleReset() {
    setQ("");
    setCategorySlug(fixedCategorySlug);
    setProductType("");
    setAvailability("");
    setFeaturedOnly(false);
    fetchFiltered({
      q: "",
      categorySlug: fixedCategorySlug,
      productType: "",
      availability: "",
      featuredOnly: false,
    });
  }

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#250C52]">
            <SlidersHorizontal className="h-4 w-4 text-[#F08B22]" />
            <span>{t.filterBy}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#7A1D4B]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.clearFilters}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Keyword / SKU / Spec search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchFiltered();
            }}
            className="relative lg:col-span-2"
          >
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-10 ps-3.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
            />
            <button
              type="submit"
              className="absolute inset-y-0 end-0 px-3 text-slate-500 hover:text-[#250C52]"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {!fixedCategorySlug && (
            <select
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                fetchFiltered({ categorySlug: e.target.value });
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#7A1D4B]"
            >
              <option value="">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.parentId ? "— " : ""}
                  {pickText(lang, c.nameEn, c.nameAr)}
                </option>
              ))}
            </select>
          )}

          <select
            value={productType}
            onChange={(e) => {
              setProductType(e.target.value);
              fetchFiltered({ productType: e.target.value });
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#7A1D4B]"
          >
            <option value="">{t.allTypes}</option>
            {productTypes.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              fetchFiltered({ availability: e.target.value });
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#7A1D4B]"
          >
            <option value="">{t.allAvailability}</option>
            <option value="in_stock">{t.inStock}</option>
            <option value="made_to_order">{t.madeToOrder}</option>
            <option value="pre_order">{t.preOrder}</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => {
                setFeaturedOnly(e.target.checked);
                fetchFiltered({ featuredOnly: e.target.checked });
              }}
              className="h-4 w-4 rounded border-slate-300 accent-[#7A1D4B]"
            />
            <span>{t.featuredProducts}</span>
          </label>
          <span className="font-medium text-slate-500">
            {t.showingResults} <strong>{items.length}</strong> {t.productsLabel}
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-700">
            {t.searchNoResults}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 rounded-xl bg-[#250C52] px-5 py-2.5 text-xs font-bold text-white"
          >
            {t.clearFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
