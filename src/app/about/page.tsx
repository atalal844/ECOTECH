import React from "react";
import { pageMetadata } from "@/lib/seo";
import {
  FileDown,
  Target,
  Compass,
  ShieldCheck,
  Factory,
  Award,
  Building2,
} from "lucide-react";
import {
  getServerLang,
  getPublicSiteChrome,
  getAboutPageData,
} from "@/lib/public-data";
import { UI_LABELS, pickText } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata("about");
}

export default async function AboutPage() {
  const [lang, chrome, page] = await Promise.all([
    getServerLang(),
    getPublicSiteChrome(),
    getAboutPageData(),
  ]);

  const t = UI_LABELS[lang];
  const sd = (page?.structuredData || {}) as {
    companyProfilePdfUrl?: string;
    visionEn?: string;
    visionAr?: string;
    missionEn?: string;
    missionAr?: string;
    values?: Array<{
      titleEn: string;
      titleAr: string;
      descEn: string;
      descAr: string;
    }>;
    manufacturingCapabilities?: string[];
    manufacturingCapabilitiesAr?: string[];
    industries?: Array<{ en: string; ar: string }>;
  };

  const profilePdf =
    sd.companyProfilePdfUrl || chrome.settings.company_profile_url?.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
              {t.aboutCompany}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
              {pickText(lang, page?.titleEn, page?.titleAr)}
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              {pickText(lang, page?.subtitleEn, page?.subtitleAr)}
            </p>
          </div>
          {profilePdf && (
            <a
              href={profilePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:opacity-95"
            >
              <FileDown className="h-4 w-4 text-[#F28E20]" />
              <span>{t.downloadProfilePdf}</span>
            </a>
          )}
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-12 sm:px-6">
        {/* Company Overview */}
        <section className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <h2 className="text-2xl font-extrabold text-slate-950">
              {lang === "ar" ? "نظرة عامة على الشركة" : "Corporate Overview"}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">
              {pickText(lang, page?.contentEn, page?.contentAr)}
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 lg:col-span-5">
            <img
              src="/images/cat-custom.jpg"
              alt="ECOTECH Engineering & Manufacturing"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#250C52] text-white">
              <Compass className="h-5 w-5 text-[#F28E20]" />
            </div>
            <h2 className="mb-2 text-xl font-extrabold text-slate-950">
              {t.vision}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {pickText(lang, sd.visionEn, sd.visionAr)}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#7A1D4B] text-white">
              <Target className="h-5 w-5 text-[#F28E20]" />
            </div>
            <h2 className="mb-2 text-xl font-extrabold text-slate-950">
              {t.mission}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {pickText(lang, sd.missionEn, sd.missionAr)}
            </p>
          </div>
        </section>

        {/* Core Values */}
        {sd.values && sd.values.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-extrabold text-slate-950">
              {t.coreValues}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {sd.values.map((v, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <ShieldCheck className="mb-3 h-6 w-6 text-[#F08B22]" />
                  <h3 className="mb-1.5 text-base font-bold text-slate-950">
                    {pickText(lang, v.titleEn, v.titleAr)}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {pickText(lang, v.descEn, v.descAr)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Manufacturing Capabilities & Industries Served */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-7">
            <div className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[#250C52]">
              <Factory className="h-5 w-5 text-[#F08B22]" />
              <span>{t.manufacturingCaps}</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              {(lang === "ar"
                ? sd.manufacturingCapabilitiesAr || sd.manufacturingCapabilities
                : sd.manufacturingCapabilities || []
              )?.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#7A1D4B]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7">
            <div className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[#250C52]">
              <Building2 className="h-5 w-5 text-[#F08B22]" />
              <span>{t.industriesServed}</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(sd.industries || []).map((ind, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800"
                >
                  {pickText(lang, ind.en, ind.ar)}
                </div>
              ))}
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
