import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { UI_LABELS, pickText, type Lang } from "@/lib/i18n";

export interface ProductCardItem {
  id: number;
  slug: string;
  sku: string;
  model: string;
  productType: string;
  nameEn: string;
  nameAr: string;
  shortOverviewEn: string | null;
  shortOverviewAr: string | null;
  availabilityStatus: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  category?: {
    slug: string;
    nameEn: string;
    nameAr: string;
  } | null;
  primaryImage?: {
    url: string;
    altEn: string | null;
    altAr: string | null;
  } | null;
}

export function ProductCard({
  product,
  lang,
  horizontal = false,
}: {
  product: ProductCardItem;
  lang: Lang;
  horizontal?: boolean;
}) {
  const t = UI_LABELS[lang];
  const isRtl = lang === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const availabilityMap: Record<string, { label: string; cls: string }> = {
    in_stock: {
      label: t.inStock,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    made_to_order: {
      label: t.madeToOrder,
      cls: "bg-amber-50 text-amber-800 border-amber-200",
    },
    pre_order: {
      label: t.preOrder,
      cls: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    discontinued: {
      label: t.discontinued,
      cls: "bg-slate-100 text-slate-600 border-slate-200",
    },
  };

  const avail =
    availabilityMap[product.availabilityStatus] || { label: lang === "ar" ? "تحقق من التوفر" : "Check availability", cls: "bg-slate-100 text-slate-600 border-slate-200" };

  return (
    <article className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#7A1D4B]/40 hover:shadow-xl ${horizontal ? "md:grid md:grid-cols-2" : ""}`}>
      <Link
        href={`/products/${product.slug}`}
        className={`relative block aspect-[4/3] overflow-hidden bg-slate-100 ${horizontal ? "md:aspect-auto md:min-h-72" : ""}`}
      >
        <img
          src={product.primaryImage?.url || "/product-placeholder.svg"}
          alt={pickText(
            lang,
            product.primaryImage?.altEn || product.nameEn,
            product.primaryImage?.altAr || product.nameAr
          )}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
          {product.isBestSeller && (
            <span className="rounded-full bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-2.5 py-1 text-[11px] font-bold text-white shadow">
              {t.bestSeller}
            </span>
          )}
          {product.isFeatured && !product.isBestSeller && (
            <span className="rounded-full bg-[#F08B22] px-2.5 py-1 text-[11px] font-bold text-white shadow">
              {t.featured}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="font-mono font-semibold text-slate-500">
            {product.sku}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${avail.cls}`}
          >
            {product.availabilityStatus === "in_stock" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {avail.label}
          </span>
        </div>

        {product.category && (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#7A1D4B]">
            {pickText(lang, product.category.nameEn, product.category.nameAr)}
          </div>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="mb-2 line-clamp-2 text-base font-bold text-slate-900 transition group-hover:text-[#250C52]"
        >
          {pickText(lang, product.nameEn, product.nameAr)}
        </Link>

        <p className="mb-5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-600">
          {pickText(lang, product.shortOverviewEn, product.shortOverviewAr)}
        </p>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/products/${product.slug}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-[#250C52]"
          >
            <span>{t.viewDetails}</span>
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/contact?type=quote&productId=${product.id}&productName=${encodeURIComponent(
              pickText(lang, product.nameEn, product.nameAr)
            )}`}
            className="rounded-xl border border-[#7A1D4B]/30 px-3 py-2 text-xs font-bold text-[#7A1D4B] transition hover:bg-[#7A1D4B]/5"
          >
            {t.requestQuote}
          </Link>
        </div>
      </div>
    </article>
  );
}
