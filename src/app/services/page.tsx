import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Warehouse,
  ScanLine,
  Cable,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { getServerLang, getPublicSiteChrome } from "@/lib/public-data";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import {
  ServicesInquiry,
  type ServiceKey,
} from "@/components/public/ServicesInquiry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services | الخدمات",
  description:
    "Third-party storage, inventory management and a fiber-optic cable maintenance and testing lab.",
};

const T = {
  en: {
    eyebrow: "Services",
    h1: "Services that support your business.",
    sub: "Storage & inventory management | Fiber-optic cable maintenance & testing lab",
    lead: "Storage space in Cairo, plus a lab for third-party fiber-optic cable maintenance and testing. Choose the service you need and contact us for details.",
    primary: "Contact us",
    secondary: "Explore services",
    storageEyebrow: "Storage & inventory management",
    storageTitle: "Third-party storage",
    storageBody:
      "Storage space for every requirement. Share your business needs so we can discuss a suitable arrangement for your goods.",
    invTitle: "Inventory management",
    invBody:
      "Stock counts and item movement records alongside storage, with the operating scope and details agreed around your business needs.",
    handlingTitle: "Goods handling",
    stockTitle: "Stock tracking",
    flowTitle: "From inquiry to an agreed scope",
    steps: [
      "Tell us the goods, quantity and storage period.",
      "Agree the space, services and operating details before starting.",
      "Define receiving, counting, follow-up and release procedures within the agreed scope.",
    ],
    contactTitle: "Contact us for details",
    contactBody:
      "Share the goods, quantity, storage period and services you need so we can discuss a suitable arrangement.",
    fiberEyebrow: "Fiber-optic lab",
    fiberTitle: "Third-party fiber-optic cable maintenance & testing lab",
    fiberBody:
      "Need maintenance or testing for fiber-optic cables? The lab offers fiber cable maintenance and testing for third parties. Share the cable type, quantity and fault or testing requirement to agree the work scope.",
    fiberBtn: "Ask about fiber services",
    cap: {
      warehouse: "Illustrative storage photo, not a photo of ECOTECH's warehouses.",
      forklift: "Illustrative handling photo. It does not confirm the equipment available.",
      inventory: "Illustrative inventory photo. It does not confirm the use of a specific device.",
      fiber: "Illustrative fiber connections, not a photo of the lab or its equipment.",
    },
    alt: {
      warehouse: "Storage racks holding containers and goods inside a warehouse.",
      forklift: "A forklift beside stacks of timber boards.",
      inventory: "A person using a barcode scanner and tablet at warehouse racks.",
      fiber: "Fiber-optic cables connected to a blue patch panel.",
    },
    credits:
      "Photos: Tiger Lily, Mandiri Abadi and Brett Sayles via Pexels. Illustrative use under the Pexels license. No endorsement implied.",
    overviewStorage: "Storage & inventory management",
    overviewFiber: "Fiber maintenance & testing lab",
  },
  ar: {
    eyebrow: "الخدمات",
    h1: "خدمات تدعم شغلك.",
    sub: "تخزين وإدارة مخزون | معمل صيانة واختبار كابلات الفايبر",
    lead: "مساحة لبضاعتك في القاهرة، ومعمل لصيانة واختبار كابلات الفايبر للغير. اختار الخدمة اللي محتاجها وتواصل معانا للتفاصيل.",
    primary: "تواصل معانا",
    secondary: "استعرض الخدمات",
    storageEyebrow: "التخزين وإدارة المخزون",
    storageTitle: "تخزين للغير",
    storageBody:
      "كل المساحات المطلوبة متوفرة. ابعت احتياج نشاطك ونحدد ترتيب التخزين المناسب لبضاعتك.",
    invTitle: "إدارة مخزون",
    invBody:
      "متابعة الكميات وحركة الأصناف بجانب مساحة التخزين، بنطاق عمل وتفاصيل تنفيذ نتفق عليها حسب احتياج نشاطك.",
    handlingTitle: "مناولة البضائع",
    stockTitle: "متابعة الأصناف",
    flowTitle: "من استفسارك لاتفاق واضح",
    steps: [
      "ابعت نوع البضاعة والكمية ومدة التخزين.",
      "نتفق على المساحة والخدمات وتفاصيل التنفيذ قبل البدء.",
      "نحدد طريقة الاستلام والجرد والمتابعة والصرف حسب النطاق المتفق عليه.",
    ],
    contactTitle: "تواصل معانا للتفاصيل",
    contactBody:
      "ابعت نوع البضاعة والكمية ومدة التخزين والخدمة المطلوبة عشان نناقش أنسب ترتيب.",
    fiberEyebrow: "معمل الفايبر",
    fiberTitle: "معمل صيانة واختبار كابلات الفايبر للغير",
    fiberBody:
      "عندك كابلات فايبر محتاجة صيانة أو اختبار؟ المعمل بيقدم صيانة واختبار كابلات الفايبر للغير. ابعت نوع الكابل والعدد ووصف العطل أو الاختبار المطلوب عشان نحدد نطاق الشغل.",
    fiberBtn: "استفسر عن خدمة الفايبر",
    cap: {
      warehouse: "صورة توضيحية للتخزين، وليست صورة مخازن ECOTECH.",
      forklift: "صورة توضيحية للمناولة، ولا تؤكد نوع المعدات المتاحة.",
      inventory: "صورة توضيحية لمتابعة المخزون، ولا تؤكد استخدام جهاز بعينه.",
      fiber: "صورة توضيحية لوصلات فايبر، وليست صورة المعمل أو أجهزته.",
    },
    alt: {
      warehouse: "أرفف تخزين عليها عبوات وبضائع داخل مخزن.",
      forklift: "رافعة شوكية بجانب رصات من الألواح الخشبية.",
      inventory: "شخص يستخدم قارئ باركود وجهازًا لوحيًا عند أرفف مخزن.",
      fiber: "كابلات ألياف ضوئية متصلة بلوحة توزيع زرقاء.",
    },
    credits:
      "الصور: Tiger Lily وMandiri Abadi وBrett Sayles عبر Pexels. استخدام توضيحي بترخيص Pexels، بدون أي ادعاء تأييد.",
    overviewStorage: "التخزين وإدارة المخزون",
    overviewFiber: "معمل صيانة واختبار كابلات الفايبر",
  },
} as const;

function Figure({
  src,
  alt,
  caption,
  className = "",
  imgClass = "",
}: {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  imgClass?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <img src={src} alt={alt} className={`w-full object-cover ${imgClass}`} />
      <figcaption className="border-t border-slate-100 bg-white px-4 py-2.5 text-xs leading-relaxed text-slate-500">
        {caption}
      </figcaption>
    </figure>
  );
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const sp = await searchParams;
  const [lang, chrome] = await Promise.all([
    getServerLang(),
    getPublicSiteChrome(),
  ]);
  const t = T[lang];
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;
  const defaultService: ServiceKey =
    sp.service === "fiber"
      ? "fiber"
      : sp.service === "storage"
        ? "storage"
        : sp.service === "storage-inventory"
          ? "storage-inventory"
          : "undecided";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1B093D] via-[#250C52] to-[#4a1550] text-white">
          <div className="pointer-events-none absolute -top-24 end-[-6rem] h-80 w-80 rounded-full bg-[#F08B22]/20 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-20">
            <div className="space-y-6 lg:col-span-7">
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300">
                {t.eyebrow}
              </span>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                {t.h1}
              </h1>
              <p className="text-base font-semibold text-amber-200 sm:text-lg">
                {t.sub}
              </p>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
                {t.lead}
              </p>
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
            <div className="lg:col-span-5">
              <figure className="mx-auto max-w-sm overflow-hidden rounded-3xl bg-white/10 p-2 ring-1 ring-white/20 lg:max-w-none">
                <img
                  src="/services/warehouse.jpg"
                  alt={t.alt.warehouse}
                  className="h-72 w-full rounded-2xl object-cover sm:h-96"
                />
                <figcaption className="px-3 pb-2 pt-3 text-xs leading-relaxed text-slate-200">
                  {t.cap.warehouse}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Overview cards */}
        <section id="services" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <a
              href="#storage"
              className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#7A1D4B] hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#250C52] text-[#F08B22]">
                <Warehouse className="h-6 w-6" />
              </span>
              <span className="space-y-1">
                <span className="block text-lg font-extrabold text-slate-950">
                  {t.overviewStorage}
                </span>
                <span className="block text-sm leading-relaxed text-slate-600">
                  {t.storageBody}
                </span>
              </span>
            </a>
            <a
              href="#fiber"
              className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#7A1D4B] hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A1D4B] text-[#F08B22]">
                <Cable className="h-6 w-6" />
              </span>
              <span className="space-y-1">
                <span className="block text-lg font-extrabold text-slate-950">
                  {t.overviewFiber}
                </span>
                <span className="block text-sm leading-relaxed text-slate-600">
                  {t.fiberBody}
                </span>
              </span>
            </a>
          </div>
        </section>

        {/* Storage & inventory */}
        <section id="storage" className="scroll-mt-28 bg-white py-14">
          <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
                {t.storageEyebrow}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-950">
                {t.storageTitle}
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                {t.storageBody}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Figure
                  src="/services/forklift.jpg"
                  alt={t.alt.forklift}
                  caption={t.cap.forklift}
                  imgClass="aspect-[3/2]"
                />
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#250C52]">
                  <Warehouse className="h-5 w-5 text-[#F08B22]" />
                  {t.handlingTitle}
                </h3>
              </div>
              <div className="space-y-4">
                <Figure
                  src="/services/inventory.jpg"
                  alt={t.alt.inventory}
                  caption={t.cap.inventory}
                  imgClass="aspect-[3/2]"
                />
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#250C52]">
                  <ScanLine className="h-5 w-5 text-[#F08B22]" />
                  {t.stockTitle}
                </h3>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h3 className="mb-2 text-xl font-extrabold text-slate-950">
                {t.invTitle}
              </h3>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {t.invBody}
              </p>
            </div>

            <div className="space-y-5">
              <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-950">
                <ClipboardList className="h-5 w-5 text-[#F08B22]" />
                {t.flowTitle}
              </h3>
              <ol className="grid gap-4 md:grid-cols-3">
                {t.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#250C52] to-[#7A1D4B] text-sm font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] p-6 text-white sm:flex-row sm:items-center sm:p-8">
              <div className="max-w-2xl space-y-1.5">
                <h3 className="text-xl font-extrabold">{t.contactTitle}</h3>
                <p className="text-sm leading-relaxed text-slate-200">{t.contactBody}</p>
              </div>
              <Link
                href="/services?service=storage-inventory#inquiry"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#F08B22] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
              >
                {t.primary}
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Fiber lab */}
        <section id="fiber" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Figure
              src="/services/fiber.jpg"
              alt={t.alt.fiber}
              caption={t.cap.fiber}
              imgClass="aspect-[3/2]"
            />
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
                {t.fiberEyebrow}
              </span>
              <h2 className="text-3xl font-extrabold leading-tight text-slate-950">
                {t.fiberTitle}
              </h2>
              <p className="text-base leading-relaxed text-slate-600">{t.fiberBody}</p>
              <Link
                href="/services?service=fiber#inquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-[#250C52] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#33106e]"
              >
                <Cable className="h-4 w-4 text-[#F08B22]" />
                {t.fiberBtn}
              </Link>
            </div>
          </div>
        </section>

        {/* Inquiry */}
        <section id="inquiry" className="scroll-mt-28 border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ServicesInquiry key={defaultService} lang={lang} defaultService={defaultService} />
            <p className="mt-10 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
              {t.credits}
            </p>
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
