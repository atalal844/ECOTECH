import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Warehouse,
  Cable,
  ArrowRight,
  ArrowLeft,
  Phone,
  Check,
  ClipboardList,
  HelpCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { getServerLang, getPublicSiteChrome } from "@/lib/public-data";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ServicesInquiry } from "@/components/public/ServicesInquiry";
import {
  PAGES,
  CREDITS,
  type ServiceImage,
  type ServiceBlock,
} from "@/lib/services-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = PAGES[slug];
  if (!p) return {};
  return { title: `${p.title.en} | ${p.title.ar}`, description: p.lead.en };
}

function Figure({ img, lang, tall }: { img: ServiceImage; lang: "en" | "ar"; tall?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <img
        src={img.src}
        alt={img.alt[lang]}
        className={`w-full object-cover ${tall ? "h-80 sm:h-[26rem]" : "aspect-[3/2]"}`}
      />
      <figcaption className="border-t border-slate-100 px-4 py-2.5 text-xs leading-relaxed text-slate-500">
        {img.cap[lang]}
      </figcaption>
    </figure>
  );
}

function Block({ b, lang }: { b: ServiceBlock; lang: "en" | "ar" }) {
  const bg = b.tone === "slate" ? "bg-slate-50" : "bg-white";
  return (
    <section id={b.id} className={`scroll-mt-28 ${bg} py-12 sm:py-14`}>
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
        <div className={b.image && !b.cards ? "grid items-center gap-10 lg:grid-cols-2" : ""}>
          <div className="max-w-3xl space-y-4">
            {b.eyebrow && (
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
                {b.eyebrow[lang]}
              </span>
            )}
            <h2 className="text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
              {b.title[lang]}
            </h2>
            {b.body?.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-slate-600">
                {p[lang]}
              </p>
            ))}
            {b.list && (
              <ul className="grid gap-3 pt-2 sm:grid-cols-2">
                {b.list.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F08B22]" />
                    <span>{it[lang]}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {b.image && !b.cards && <Figure img={b.image} lang={lang} />}
        </div>

        {b.cards && (
          <div
            className={`grid gap-5 sm:grid-cols-2 ${b.cards.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
          >
            {b.cards.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#250C52] to-[#7A1D4B] text-xs font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="mb-1.5 text-base font-bold text-slate-950">{c.t[lang]}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{c.d[lang]}</p>
              </div>
            ))}
          </div>
        )}

        {b.image && b.cards && (
          <div className="mx-auto max-w-3xl">
            <Figure img={b.image} lang={lang} />
          </div>
        )}
      </div>
    </section>
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = PAGES[slug];
  if (!p) notFound();
  const [lang, chrome] = await Promise.all([getServerLang(), getPublicSiteChrome()]);
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;
  const Icon = p.icon === "cable" ? Cable : Warehouse;
  const other = p.slug === "warehousing" ? PAGES["fiber-lab"] : PAGES["warehousing"];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1B093D] via-[#250C52] to-[#4a1550] text-white">
          <div className="pointer-events-none absolute -top-24 end-[-6rem] h-80 w-80 rounded-full bg-[#F08B22]/20 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16">
            <div className="space-y-6 lg:col-span-7">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-300">
                <Link href="/services" className="hover:text-white">
                  {lang === "ar" ? "الخدمات" : "Services"}
                </Link>
                <span>/</span>
                <span className="text-amber-300">{p.title[lang]}</span>
              </nav>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300">
                <Icon className="h-4 w-4" />
                {p.eyebrow[lang]}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
                {p.title[lang]}
              </h1>
              <p className="text-base font-semibold text-amber-200 sm:text-lg">{p.sub[lang]}</p>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
                {p.lead[lang]}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#inquiry"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F08B22] to-[#e0701a] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
                >
                  <Phone className="h-4 w-4" />
                  {lang === "ar" ? "تواصل معانا" : "Contact us"}
                </a>
                <a
                  href={`#${p.blocks[0].id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  {lang === "ar" ? "اعرف أكتر" : "Learn more"}
                  <ArrowIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <figure className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white/10 p-2 ring-1 ring-white/20 lg:max-w-none">
                <img
                  src={p.hero.src}
                  alt={p.hero.alt[lang]}
                  className="h-72 w-full rounded-2xl object-cover sm:h-96"
                />
                <figcaption className="px-3 pb-2 pt-3 text-xs leading-relaxed text-slate-200">
                  {p.hero.cap[lang]}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {p.blocks.map((b) => (
          <Block key={b.id} b={b} lang={lang} />
        ))}

        <section className="bg-white py-12 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
                <ClipboardList className="h-6 w-6 text-[#F08B22]" />
                {p.stepsTitle[lang]}
              </h2>
              <ol className="space-y-3">
                {p.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#250C52] to-[#7A1D4B] text-sm font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700">{s[lang]}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-slate-950">{p.prepareTitle[lang]}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{p.prepareIntro[lang]}</p>
              <ul className="space-y-2.5">
                {p.prepare.map((it, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F08B22]" />
                    <span>{it[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12 sm:py-14">
          <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
              <HelpCircle className="h-6 w-6 text-[#F08B22]" />
              {p.faqTitle[lang]}
            </h2>
            <div className="space-y-3">
              {p.faq.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-[#7A1D4B]"
                >
                  <summary className="cursor-pointer list-none text-base font-bold text-slate-900">
                    {f.q[lang]}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a[lang]}</p>
                </details>
              ))}
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{p.note[lang]}</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Link
              href={`/services/${other.slug}`}
              className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] p-6 text-white sm:flex-row sm:items-center sm:p-8"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  {lang === "ar" ? "خدمة أخرى" : "Our other service"}
                </div>
                <div className="text-xl font-extrabold">{other.title[lang]}</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#F08B22] px-5 py-3 text-sm font-bold">
                {lang === "ar" ? "استعرض" : "View service"}
                <ArrowIcon className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </section>

        <section id="inquiry" className="scroll-mt-28 border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ServicesInquiry lang={lang} defaultService={p.inquiryService} />
            <div className="mt-10 space-y-3 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
              <div>
                <span className="font-bold text-slate-600">
                  {lang === "ar" ? "مصادر المعلومات العامة: " : "Sources for the general information: "}
                </span>
                {p.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && " | "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline hover:text-[#7A1D4B]"
                    >
                      {s.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                ))}
              </div>
              <p>{CREDITS[lang]}</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} categories={chrome.categories} settings={chrome.settings} />
    </div>
  );
}
