import React from "react";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  Newspaper,
  Building2,
  CheckCircle2,
} from "lucide-react";
import {
  getServerLang,
  getPublicSiteChrome,
  getHomepageData,
} from "@/lib/public-data";
import { UI_LABELS, pickText } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/SiteHeader";
import { HomeServices } from "@/components/public/HomeServices";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ProductCard } from "@/components/public/ProductCard";
import { CinematicIntro } from "@/components/public/HeroProductShowcase";
import { InquiryForm } from "@/components/public/InquiryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata("home");
}

export default async function HomePage() {
  const [lang, chrome, home] = await Promise.all([
    getServerLang(),
    getPublicSiteChrome(),
    getHomepageData(),
  ]);

  const t = UI_LABELS[lang];
  const isRtl = lang === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const hero = home.sectionsMap.get("hero");
  const stats = home.sectionsMap.get("stats");
  const why = home.sectionsMap.get("why_ecotech");
  const capabilities = home.sectionsMap.get("capabilities");
  const projects = home.sectionsMap.get("projects");
  const certifications = home.sectionsMap.get("certifications");
  const news = home.sectionsMap.get("news");

  const heroPayload = (hero?.payload || {}) as Record<string, string>;
  const statsItems = ((stats?.payload as { items?: Array<{ value: string; labelEn: string; labelAr: string }> })?.items || []);
  const whyCards = ((why?.payload as { cards?: Array<{ titleEn: string; titleAr: string; descEn: string; descAr: string }> })?.cards || []);
  const capItems = ((capabilities?.payload as { items?: Array<{ titleEn: string; titleAr: string; descEn: string; descAr: string }> })?.items || []);
  const projectItems = ((projects?.payload as { projects?: Array<{ titleEn: string; titleAr: string; scopeEn: string; scopeAr: string; sectorEn: string; sectorAr: string }> })?.projects || []);
  const certBadges = ((certifications?.payload as { badges?: Array<{ code: string; descEn: string; descAr: string }> })?.badges || []);
  const newsPosts = ((news?.payload as { posts?: Array<{ date: string; tagEn: string; tagAr: string; titleEn: string; titleAr: string; summaryEn: string; summaryAr: string }> })?.posts || []);

  const catalogHref =
    chrome.settings.master_catalog_url?.en ||
    heroPayload.catalogHref ||
    "";
  const hasCatalog = Boolean(catalogHref && catalogHref !== "/products");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      <main id="main-content" className="flex-1">
        {/* 1. HERO SECTION */}
        <CinematicIntro
          lang={lang}
          title={pickText(lang, hero?.titleEn, hero?.titleAr) || "Powering the Future of Network Infrastructure"}
          subtitle={pickText(lang, hero?.subtitleEn, hero?.subtitleAr) || "Advanced Networking, Fiber Optic and Smart Power Distribution Solutions."}
          primaryLabel={pickText(lang, hero?.ctaPrimaryLabelEn, hero?.ctaPrimaryLabelAr) || t.exploreProducts}
          primaryHref={hero?.ctaPrimaryHref || "/products"}
          secondaryLabel={pickText(lang, hero?.ctaSecondaryLabelEn, hero?.ctaSecondaryLabelAr) || t.contactSales}
          secondaryHref={hero?.ctaSecondaryHref || "/contact"}
          catalogHref={hasCatalog ? catalogHref : undefined}
        />
        <section aria-label={lang === "ar" ? "لمحة عن إيكوتك" : "ECOTECH at a glance"}>
          {/* Engineering Metrics Strip */}
          {statsItems.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/90">
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-4">
                {statsItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col border-s-2 border-[#F08B22] ps-4">
                    <span className="text-2xl font-extrabold text-[#250C52] sm:text-3xl">
                      {item.value}
                    </span>
                    <span className="text-xs font-medium text-slate-600 sm:text-sm">
                      {pickText(lang, item.labelEn, item.labelAr)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 2. FEATURED PRODUCT CATEGORIES */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
                {lang === "ar" ? "خطوط الإنتاج الهندسية" : "CORE INFRASTRUCTURE LINES"}
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {t.featuredCategories}
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#250C52] hover:text-[#F08B22]"
            >
              <span>{t.exploreProducts}</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className={home.topCategories.length === 1 ? "mx-auto grid max-w-3xl grid-cols-1" : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"}>
            {home.topCategories.map((cat) => {
              const subs = home.allCategories.filter((c) => c.parentId === cat.id);
              return (
                <div
                  key={cat.id}
                  className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#7A1D4B]/40 hover:shadow-xl ${home.topCategories.length === 1 ? "md:flex-row" : ""}`}
                >
                  <Link
                    href={`/categories/${cat.slug}`}
                    className={`relative aspect-[16/10] overflow-hidden bg-slate-100 ${home.topCategories.length === 1 ? "md:w-1/2 md:shrink-0" : ""}`}
                  >
                    <img
                      src={cat.imageUrl || "/product-placeholder.svg"}
                      alt={pickText(lang, cat.nameEn, cat.nameAr)}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent p-4">
                      <h3 className="text-lg font-bold text-white">
                        {pickText(lang, cat.nameEn, cat.nameAr)}
                      </h3>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {pickText(lang, cat.descriptionEn, cat.descriptionAr)}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {subs.slice(0, 4).map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${sub.slug}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-[#7A1D4B] hover:text-[#250C52]"
                        >
                          {pickText(lang, sub.nameEn, sub.nameAr)}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-auto border-t border-slate-100 pt-3">
                      <Link
                        href={`/categories/${cat.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1D4B] hover:text-[#250C52]"
                      >
                        <span>
                          {lang === "ar"
                            ? (subs.length ? `تصفح ${subs.length} أقسام فرعية` : "تصفح المنتجات")
                            : (subs.length ? `Explore ${subs.length} Subcategories` : "View Products")}
                        </span>
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <HomeServices lang={lang} />

        {/* 3. BEST-SELLING & FEATURED PRODUCTS */}
        <section className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#F08B22]">
                  {lang === "ar" ? "الأجهزة المعتمدة" : "ENGINEERED HARDWARE"}
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                  {t.featuredProducts}
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:border-[#250C52]"
              >
                <span>{t.exploreProducts}</span>
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className={home.featuredProducts.length === 1 ? "mx-auto grid max-w-3xl grid-cols-1" : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"}>
              {home.featuredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} lang={lang} horizontal={home.featuredProducts.length === 1} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. WHY CHOOSE ECOTECH */}
        {why && whyCards.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
                {lang === "ar" ? "الميزة الصناعية" : "INDUSTRIAL ADVANTAGE"}
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {pickText(lang, why.titleEn, why.titleAr)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {pickText(lang, why.subtitleEn, why.subtitleAr)}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {whyCards.map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#7A1D4B]/40 hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#250C52] to-[#7A1D4B] text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900">
                    {pickText(lang, card.titleEn, card.titleAr)}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {pickText(lang, card.descEn, card.descAr)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. COMPANY CAPABILITIES & TECHNOLOGY HIGHLIGHTS */}
        {capabilities && capItems.length > 0 && (
          <section className="border-y border-slate-200 bg-slate-900 py-16 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-10 grid grid-cols-1 items-end gap-6 lg:grid-cols-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#F28E20]">
                    {lang === "ar" ? "التقنية والهندسة" : "TECHNOLOGY HIGHLIGHTS"}
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                    {pickText(lang, capabilities.titleEn, capabilities.titleAr)}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {pickText(
                    lang,
                    capabilities.subtitleEn,
                    capabilities.subtitleAr
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {capItems.map((cap, i) => {
                  const Icon = i === 0 ? Layers : i === 1 ? Cpu : CheckCircle2;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                    >
                      <Icon className="mb-4 h-7 w-7 text-[#F28E20]" />
                      <h3 className="mb-2 text-lg font-bold">
                        {pickText(lang, cap.titleEn, cap.titleAr)}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {pickText(lang, cap.descEn, cap.descAr)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 6. FEATURED PROJECTS & APPLICATIONS */}
        {projects && projectItems.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
                {lang === "ar" ? "تطبيقات ميدانية" : "REAL-WORLD DEPLOYMENTS"}
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {pickText(lang, projects.titleEn, projects.titleAr)}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {pickText(lang, projects.subtitleEn, projects.subtitleAr)}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {projectItems.map((proj, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div>
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-[#250C52]">
                      <Building2 className="h-3.5 w-3.5 text-[#F08B22]" />
                      <span>{pickText(lang, proj.sectorEn, proj.sectorAr)}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-950">
                      {pickText(lang, proj.titleEn, proj.titleAr)}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {pickText(lang, proj.scopeEn, proj.scopeAr)}
                    </p>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-3">
                    <Link
                      href="/contact?type=sales"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#7A1D4B] hover:underline"
                    >
                      <span>
                        {lang === "ar"
                          ? "اطلب استشارة لمشروع مماثل"
                          : "Consult on Similar Project"}
                      </span>
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. CERTIFICATIONS & QUALITY STANDARDS */}
        {certifications && certBadges.length > 0 && (
          <section className="border-y border-slate-200 bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  {pickText(lang, certifications.titleEn, certifications.titleAr)}
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
                  {pickText(
                    lang,
                    certifications.subtitleEn,
                    certifications.subtitleAr
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {certBadges.map((b, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center"
                  >
                    <Award className="mb-2 h-6 w-6 text-[#F08B22]" />
                    <div className="text-sm font-extrabold text-[#250C52]">
                      {b.code}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      {pickText(lang, b.descEn, b.descAr)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. LATEST NEWS & UPDATES */}
        {news && newsPosts.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">
                  {pickText(lang, news.titleEn, news.titleAr)}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {pickText(lang, news.subtitleEn, news.subtitleAr)}
                </p>
              </div>
              <Newspaper className="hidden h-7 w-7 text-[#7A1D4B] sm:block" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {newsPosts.map((post, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-[#B65412]">
                      {pickText(lang, post.tagEn, post.tagAr)}
                    </span>
                    <span className="text-slate-400" dir="ltr">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900">
                    {pickText(lang, post.titleEn, post.titleAr)}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {pickText(lang, post.summaryEn, post.summaryAr)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 9. CONTACT & QUOTE REQUEST SECTION */}
        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
                {lang === "ar" ? "تواصل هندسي مباشر" : "DIRECT SALES ENGINEERING"}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-950">
                {t.contactUs}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {lang === "ar"
                  ? "هل تحتاج إلى عرض سعر لمشروع، أو رسومات CAD، أو تكوين مخصص لكبائن الشبكات ووحدات توزيع الطاقة؟ فريقنا الهندسي جاهز لدعمك."
                  : "Need a project quotation, CAD mechanical drawings, or custom rack & Smart PDU specifications? Submit your requirements directly to our engineering sales desk."}
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 space-y-2">
                <div>
                  <strong>{lang === "ar" ? "البريد الإلكتروني:" : "Sales Email:"}</strong>{" "}
                  <span>{chrome.settings.contact_email?.en}</span>
                </div>
                <div>
                  <strong>{lang === "ar" ? "الهاتف:" : "Phone:"}</strong>{" "}
                  <span dir="ltr">{chrome.settings.phone_primary?.en}</span>
                </div>
                <div>
                  <strong>{lang === "ar" ? "العنوان:" : "Facility:"}</strong>{" "}
                  <span dir="ltr">
                    {pickText(
                      lang,
                      chrome.settings.address?.en,
                      chrome.settings.address?.ar
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
              <InquiryForm lang={lang} defaultType="quote" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        lang={lang}
        categories={chrome.categories}
        settings={chrome.settings}
      />
    </div>
  );
    }
