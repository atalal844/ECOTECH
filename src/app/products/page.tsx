import React from "react";
import { pageMetadata } from "@/lib/seo";
import { db, products, productCategories, productImages, productSpecifications } from "@/db";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { getServerLang, getPublicSiteChrome } from "@/lib/public-data";
import { UI_LABELS } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ProductCatalogClient } from "@/components/public/ProductCatalogClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata("products");
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";

  const [lang, chrome] = await Promise.all([
    getServerLang(),
    getPublicSiteChrome(),
  ]);
  const t = UI_LABELS[lang];

  const conditions = [eq(products.status, "published")];
  if (q) {
    const pattern = `%${q}%`;
    const specMatches = await db
      .selectDistinct({ productId: productSpecifications.productId })
      .from(productSpecifications)
      .where(
        or(
          ilike(productSpecifications.specKeyEn, pattern),
          ilike(productSpecifications.specValueEn, pattern),
          ilike(productSpecifications.specKeyAr, pattern),
          ilike(productSpecifications.specValueAr, pattern)
        )
      );
    const specIds = specMatches.map((m) => m.productId);
    const searchCond = or(
      ilike(products.nameEn, pattern),
      ilike(products.nameAr, pattern),
      ilike(products.sku, pattern),
      ilike(products.model, pattern),
      ilike(products.shortOverviewEn, pattern),
      ilike(products.descriptionEn, pattern),
      specIds.length > 0 ? inArray(products.id, specIds) : sql`false`
    );
    if (searchCond) conditions.push(searchCond);
  }

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(asc(products.displayOrder), desc(products.createdAt));

  const prodIds = rows.map((r) => r.id);
  const imgs =
    prodIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, prodIds))
          .orderBy(asc(productImages.displayOrder))
      : [];

  const catMap = new Map(chrome.categories.map((c) => [c.id, c]));
  const initialProducts = rows.map((p) => {
    const pImgs = imgs.filter((i) => i.productId === p.id);
    return {
      ...p,
      category: catMap.get(p.categoryId) || null,
      primaryImage: pImgs.find((i) => i.isPrimary) || pImgs[0] || null,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
            ECOTECH HARDWARE PORTFOLIO
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950">
            {t.exploreProducts}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {lang === "ar"
              ? "استعرض مجموعة منتجات إيكوتك المعتمدة في كبائن الشبكات، الألياف الضوئية، وحدات توزيع الطاقة الذكية، والتمديدات الهيكلية."
              : "Browse ECOTECH industrial network racks, fiber optic systems, intelligent Smart PDUs, and structured cabling solutions."}
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <ProductCatalogClient
          lang={lang}
          initialProducts={initialProducts}
          categories={chrome.categories}
          initialQuery={q}
        />
      </main>

      <SiteFooter
        lang={lang}
        categories={chrome.categories}
        settings={chrome.settings}
      />
    </div>
  );
}
