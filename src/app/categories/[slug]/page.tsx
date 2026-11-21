import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileDown, ChevronRight, ChevronLeft } from "lucide-react";
import { db, productCategories, products, productImages } from "@/db";
import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { getServerLang, getPublicSiteChrome } from "@/lib/public-data";
import { UI_LABELS, pickText } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ProductCatalogClient } from "@/components/public/ProductCatalogClient";
import { ProductCard } from "@/components/public/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [lang, chrome] = await Promise.all([
    getServerLang(),
    getPublicSiteChrome(),
  ]);
  const t = UI_LABELS[lang];
  const isRtl = lang === "ar";
  const CrumbArrow = isRtl ? ChevronLeft : ChevronRight;

  const category = chrome.categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const parentCat = category.parentId
    ? chrome.categories.find((c) => c.id === category.parentId) || null
    : null;

  const subcategories = chrome.categories.filter(
    (c) => c.parentId === category.id
  );
  const matchingCatIds = [category.id, ...subcategories.map((s) => s.id)];

  const prodRows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "published"),
        inArray(products.categoryId, matchingCatIds)
      )
    )
    .orderBy(asc(products.displayOrder));

  const relatedRaw = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "published"),
        ne(products.categoryId, category.id)
      )
    )
    .limit(4);

  const allIds = [...prodRows.map((p) => p.id), ...relatedRaw.map((p) => p.id)];
  const imgs =
    allIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, allIds))
          .orderBy(asc(productImages.displayOrder))
      : [];

  const catMap = new Map(chrome.categories.map((c) => [c.id, c]));
  const hydrate = (p: typeof products.$inferSelect) => {
    const pImgs = imgs.filter((i) => i.productId === p.id);
    return {
      ...p,
      category: catMap.get(p.categoryId) || null,
      primaryImage: pImgs.find((i) => i.isPrimary) || pImgs[0] || null,
    };
  };

  const categoryProducts = prodRows.map(hydrate);
  const relatedProducts = relatedRaw.map(hydrate);
  const catalogDownload =
    category.catalogUrl || parentCat?.catalogUrl || chrome.settings.master_catalog_url?.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      {/* Category Banner */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#1B093D] text-white">
        <img
          src={category.bannerUrl || category.imageUrl || "/images/cat-racks.jpg"}
          alt={pickText(lang, category.nameEn, category.nameAr)}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B093D]/95 via-[#250C52]/85 to-[#7A1D4B]/70" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          {/* Breadcrumbs */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
            <Link href="/" className="hover:text-white">
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <CrumbArrow className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-white">
              {t.exploreProducts}
            </Link>
            {parentCat && (
              <>
                <CrumbArrow className="h-3.5 w-3.5" />
                <Link
                  href={`/categories/${parentCat.slug}`}
                  className="hover:text-white"
                >
                  {pickText(lang, parentCat.nameEn, parentCat.nameAr)}
                </Link>
              </>
            )}
            <CrumbArrow className="h-3.5 w-3.5" />
            <span className="font-semibold text-[#F28E20]">
              {pickText(lang, category.nameEn, category.nameAr)}
            </span>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold sm:text-4xl">
                {pickText(lang, category.nameEn, category.nameAr)}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                {pickText(lang, category.descriptionEn, category.descriptionAr)}
              </p>
            </div>

            {catalogDownload && (
              <a
                href={catalogDownload}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#F08B22] px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#d97714]"
              >
                <FileDown className="h-4 w-4" />
                <span>{t.downloadCategoryCatalog}</span>
              </a>
            )}
          </div>

          {/* Subcategories Pills */}
          {subcategories.length > 0 && (
            <div className="mt-8 border-t border-white/15 pt-5">
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                {t.subcategories}
              </div>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/categories/${sub.slug}`}
                    className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white hover:text-[#250C52]"
                  >
                    {pickText(lang, sub.nameEn, sub.nameAr)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 space-y-14 px-4 py-10 sm:px-6">
        <ProductCatalogClient
          lang={lang}
          initialProducts={categoryProducts}
          categories={chrome.categories}
          fixedCategorySlug={category.slug}
        />

        {relatedProducts.length > 0 && (
          <section className="border-t border-slate-200 pt-10">
            <h2 className="mb-6 text-2xl font-extrabold text-slate-950">
              {t.relatedProducts}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter
        lang={lang}
        categories={chrome.categories}
        settings={chrome.settings}
      />
    </div>
  );
}
