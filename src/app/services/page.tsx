import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Warehouse, Cable, ArrowRight, ArrowLeft, Phone } from "lucide-react";
import { getServerLang, getPublicSiteChrome } from "@/lib/public-data";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import {
  ServicesInquiry,
  type ServiceKey,
} from "@/components/public/ServicesInquiry";
import { WAREHOUSING, FIBER_LAB, CREDITS } from "@/lib/services-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services | الخدمات",
  description:
    "Warehousing and inventory management, and a fiber-optic cable maintenance and testing lab.",
};

const T = {
  en: {
    eyebrow: "Services",
    h1: "Services that support your business.",
    sub: "Warehousing & inventory management | Fiber-optic cable maintenance & testing lab",
    lead: "Storage space in Cairo, plus a lab for third-party fiber-optic cable maintenance and testing. Choose the service you need and contact us for details.",
    primary: "Contact us",
    secondary: "Explore services",
    learn: "Learn more",
    twoTitle: "Two services, one point of contact",
    twoBody:
      "Each service has its own page with general information, how it works and what to share with us. Tell us which one you need, or both, and we discuss the details in one conversation.",
    bullets: {
      warehousing: [
        "Third-party storage for every requirement",
        "Stock counts and item movement records",
        "Receiving, follow-up and release agreed per inquiry",
      ],
      fiber: [
        "Maintenance and testing for third-party fiber-optic cables",
        "General information on fiber testing methods and standards",
        "Scope and reporting agreed per inquiry",
      ],
    },
  },
  ar: {
    eyebrow: "الخدمات",
    h1: "خدمات تدعم أعمالك.",
    sub: "التخزين وإدارة المخزون | معمل صيانة واختبار كابلات الألياف الضوئية",
    lead: "مساحات لتخزين بضائعكم في القاهرة، ومعمل لصيانة واختبار كابلات الألياف الضوئية للغير. اختاروا الخدمة التي تحتاجونها وتواصلوا معنا لمعرفة التفاصيل.",
    primary: "تواصل معنا",
    secondary: "استعرض الخدمات",
    learn: "اعرف المزيد",
    twoTitle: "خدمتان، وجهة تواصل واحدة",
    twoBody:
      "لكل خدمة صفحتها الخاصة التي تتضمن معلومات عامة وآلية العمل وما ينبغي إرساله إلينا. أخبرونا بالخدمة التي تحتاجونها، أو بكلتيهما، ونناقش التفاصيل في محادثة واحدة.",
    bullets: {
      warehousing: [
        "تخزين للغير لمختلف المساحات المطلوبة",
        "جرد وسجل حركة الأصناف",
        "الاستلام والمتابعة والصرف بحسب كل استفسار",
      ],
      fiber: [
        "صيانة واختبار كابلات الألياف الضوئية للغير",
        "معلومات عامة عن طرق ومعايير اختبار الألياف الضوئية",
        "نطاق العمل وطريقة التقرير بحسب كل استفسار",
      ],
    },
  },
} as const;

export default async function ServicesPage() {
  const [lang, chrome] = await Promise.all([getServerLang(), getPublicSiteChrome()]);
  const t = T[lang];
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;
  const defaultService: ServiceKey = "undecided";

  const cards = [
    { page: WAREHOUSING, Icon: Warehouse, bullets: t.bullets.warehousing, accent: "bg-[#250C52]" },
    { page: FIBER_LAB, Icon: Cable, bullets: t.bullets.fiber, accent: "bg-[#7A1D4B]" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden bg-[#1B093D] text-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-1 sm:grid-cols-2">
            <img src="/services/warehouse.jpg" alt="" className="h-full w-full object-cover" />
            <img src="/services/fiber.jpg" alt="" className="hidden h-full w-full object-cover sm:block" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1B093D]/95 via-[#250C52]/85 to-[#4a1550]/80" />
          <div className="pointer-events-none absolute -top-24 end-[-6rem] h-80 w-80 rounded-full bg-[#F08B22]/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-14 sm:px-6 lg:py-20">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300">
              {t.eyebrow}
            </span>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">{t.h1}</h1>
            <p className="max-w-3xl text-base font-semibold text-amber-200 sm:text-lg">{t.sub}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">{t.lead}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F08B22] to-[#e0701a] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
              >
                <Phone className="h-4 w-4" />
                {t.primary}
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                {t.secondary}
                <ArrowIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {cards.map(({ page, Icon, bullets, accent }) => (
              <article
                key={page.slug}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <figure>
                  <img
                    src={page.hero.src}
                    alt={page.hero.alt[lang]}
                    className="h-64 w-full object-cover"
                  />
                  <figcaption className="border-b border-slate-100 px-5 py-2.5 text-xs leading-relaxed text-slate-500">
                    {page.hero.cap[lang]}
                  </figcaption>
                </figure>
                <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent} text-[#F08B22]`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-950">{page.title[lang]}</h2>
                  <p className="text-sm leading-relaxed text-slate-600">{page.lead[lang]}</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F08B22]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services/${page.slug}`}
                    className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-[#250C52] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#33106e]"
                  >
                    {t.learn}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto max-w-4xl space-y-3 px-4 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">{t.twoTitle}</h2>
            <p className="text-base leading-relaxed text-slate-600">{t.twoBody}</p>
          </div>
        </section>

        <section id="inquiry" className="scroll-mt-28 border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ServicesInquiry lang={lang} defaultService={defaultService} />
            <p className="mt-10 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
              {CREDITS[lang]}
            </p>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} categories={chrome.categories} settings={chrome.settings} />
    </div>
  );
}
