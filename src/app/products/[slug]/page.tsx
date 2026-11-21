import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  Ruler,
  Package,
} from "lucide-react";
import {
  getServerLang,
  getPublicSiteChrome,
  getPublishedProductBySlug,
} from "@/lib/public-data";
import { UI_LABELS, pickText } from "@/lib/i18n";

function pickDual(lang: string, value?: string | null): string {
  if (!value) return "";
  const parts = value.split(" / ");
  if (parts.length < 2) return value;
  return lang === "ar" ? parts.slice(1).join(" / ") : parts[0];
}
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ProductCard } from "@/components/public/ProductCard";
import {
  ProductGalleryViewer,
  ProductActionButtons,
  ProductDocumentsList,
} from "@/components/public/ProductDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedProductBySlug(slug);
  if (!data) return { title: "Product Not Found" };

  return {
    title: data.product.seoTitleEn || data.product.nameEn,
    description:
      data.product.seoDescriptionEn || data.product.shortOverviewEn || "",
    openGraph: {
      title: data.product.seoTitleEn || data.product.nameEn,
      description: data.product.shortOverviewEn || "",
      images: data.product.ogImageUrl ? [data.product.ogImageUrl] : [],
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [lang, chrome, data] = await Promise.all([
    getServerLang(),
    getPublicSiteChrome(),
    getPublishedProductBySlug(slug),
  ]);

  if (!data) notFound();

  const t = UI_LABELS[lang];
  const isRtl = lang === "ar";
  const CrumbArrow = isRtl ? ChevronLeft : ChevronRight;
  const { product, category, parentCategory, images, documents, specifications, relatedProducts } =
    data;

  const productName = pickText(lang, product.nameEn, product.nameAr);
  const features = lang === "ar" ? product.featuresAr : product.featuresEn;
  const applications =
    lang === "ar" ? product.applicationsAr : product.applicationsEn;
  const configurations =
    lang === "ar" ? product.configurationsAr : product.configurationsEn;

  // Group technical specifications strictly from DB
  const specGroups = new Map<string, typeof specifications>();
  for (const spec of specifications) {
    const groupLabel = pickText(lang, spec.groupNameEn, spec.groupNameAr);
    const list = specGroups.get(groupLabel) || [];
    list.push(spec);
    specGroups.set(groupLabel, list);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    sku: product.sku,
    model: product.model,
    brand: { "@type": "Brand", name: "ECOTECH" },
    description: product.shortOverviewEn || product.descriptionEn,
    image: images.map((i) => i.url),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-3 text-xs text-slate-500 sm:px-6">
          <Link href="/" className="hover:text-[#250C52]">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <CrumbArrow className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-[#250C52]">
            {t.exploreProducts}
          </Link>
          {parentCategory && (
            <>
              <CrumbArrow className="h-3.5 w-3.5" />
              <Link
                href={`/categories/${parentCategory.slug}`}
                className="hover:text-[#250C52]"
              >
                {pickText(lang, parentCategory.nameEn, parentCategory.nameAr)}
              </Link>
            </>
          )}
          {category && (
            <>
              <CrumbArrow className="h-3.5 w-3.5" />
              <Link
                href={`/categories/${category.slug}`}
                className="hover:text-[#250C52]"
              >
                {pickText(lang, category.nameEn, category.nameAr)}
              </Link>
            </>
          )}
          <CrumbArrow className="h-3.5 w-3.5" />
          <span className="font-semibold text-[#7A1D4B]">{product.sku}</span>
        </div>
      </div>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-10 sm:px-6">
        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <ProductGalleryViewer
              lang={lang}
              productName={productName}
              images={images}
              has360View={product.has360View}
            />
          </div>

          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg bg-[#250C52] px-2.5 py-1 font-mono font-bold text-white">
                  {t.sku}: {product.sku}
                </span>
                <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700">
                  {t.model}: {pickDual(lang, product.model)}
                </span>
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                  {product.availabilityStatus === "in_stock"
                    ? t.inStock
                    : product.availabilityStatus === "made_to_order"
                    ? t.madeToOrder
                    : t.preOrder}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold leading-snug text-slate-950 sm:text-3xl">
                {productName}
              </h1>

              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                {pickText(
                  lang,
                  product.shortOverviewEn,
                  product.shortOverviewAr
                )}
              </p>
            </div>

            {/* Key Mechanical Summary Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.dimensions && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#250C52]">
                    <Ruler className="h-4 w-4 text-[#F08B22]" />
                    <span>{t.dimensions}</span>
                  </div>
                  <div
                    className="mt-1 text-xs text-slate-600"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    {pickDual(lang, product.dimensions)}
                  </div>
                </div>
              )}
              {(product.materialsEn || product.materialsAr) && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#250C52]">
                    <Layers className="h-4 w-4 text-[#F08B22]" />
                    <span>{t.materials}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {pickText(lang, product.materialsEn, product.materialsAr)}
                  </div>
                </div>
              )}
            </div>

            {/* Available Configurations */}
            {configurations && configurations.length > 0 && (
              <div>
                <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Package className="h-3.5 w-3.5 text-[#7A1D4B]" />
                  <span>{t.configurations}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {configurations.map((cfg, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      {cfg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ProductActionButtons
              lang={lang}
              productId={product.id}
              productName={productName}
            />
          </div>
        </div>

        {/* Detailed Engineering Description + Features & Applications */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7">
            <h2 className="text-xl font-extrabold text-slate-950">
              {t.description}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {pickText(lang, product.descriptionEn, product.descriptionAr)}
            </p>

            {applications && applications.length > 0 && (
              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#250C52]">
                  {t.applications}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {applications.map((app, i) => (
                    <span
                      key={i}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-5">
            <h2 className="mb-4 text-xl font-extrabold text-slate-950">
              {t.featuresBenefits}
            </h2>
            {features && features.length > 0 ? (
              <ul className="space-y-3">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F08B22]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                {lang === "ar"
                  ? "يرجى مراجعة النشرة الفنية المرفقة."
                  : "Refer to the attached engineering datasheet."}
              </p>
            )}
          </div>
        </div>

        {/* Technical Specifications Table (Strictly Admin-Approved DB Entries) */}
        {specifications.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="mb-6 text-xl font-extrabold text-slate-950">
              {t.technicalSpecs}
            </h2>
            <div className="space-y-6">
              {Array.from(specGroups.entries()).map(([groupName, rows]) => (
                <div key={groupName} className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#250C52]">
                    {groupName}
                  </div>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="w-2/5 px-4 py-3 font-semibold text-slate-700">
                            {pickText(lang, s.specKeyEn, s.specKeyAr)}
                          </td>
                          <td className="px-4 py-3 text-slate-900">
                            {pickText(lang, s.specValueEn, s.specValueAr)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Datasheets, Manuals, Technical Diagrams & Legacy Archives */}
        {documents.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-950">
              {t.downloadsDocs}
            </h2>
            <ProductDocumentsList lang={lang} documents={documents} />
          </section>
        )}

        {/* Related Products */}
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
