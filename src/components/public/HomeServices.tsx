import React from "react";
import Link from "next/link";
import { Warehouse, Cable, ArrowRight, ArrowLeft } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { IMAGES } from "@/lib/services-content";

const T = {
  en: {
    eyebrow: "Services",
    title: "Services that support your business",
    blurb:
      "Beyond products, ECOTECH offers storage space in Cairo with inventory management, and a lab for third-party fiber-optic cable maintenance and testing. Each service has its own page. Contact us for details.",
    cards: [
      {
        href: "/services/warehousing",
        title: "Warehousing & Inventory Management",
        text: "Third-party storage for every requirement, with stock counts and item movement records agreed around your needs.",
        img: IMAGES.warehouse,
      },
      {
        href: "/services/fiber-lab",
        title: "Fiber-Optic Cable Maintenance & Testing Lab",
        text: "Maintenance and testing of fiber-optic cables for third parties. Share the cable type, quantity and fault to agree the work scope.",
        img: IMAGES.fiber,
      },
    ],
    more: "Learn more",
    all: "All services",
  },
  ar: {
    eyebrow: "الخدمات",
    title: "خدمات تدعم أعمالك",
    blurb:
      "إلى جانب المنتجات، تقدّم ECOTECH مساحات تخزين في القاهرة مع إدارة المخزون، ومعملًا لصيانة واختبار كابلات الألياف الضوئية للغير. ولكل خدمة صفحتها الخاصة. تواصلوا معنا لمعرفة التفاصيل.",
    cards: [
      {
        href: "/services/warehousing",
        title: "التخزين وإدارة المخزون",
        text: "تخزين للغير لمختلف المساحات المطلوبة، مع جرد وسجل لحركة الأصناف يُتفق عليهما وفق احتياجكم.",
        img: IMAGES.warehouse,
      },
      {
        href: "/services/fiber-lab",
        title: "معمل صيانة واختبار كابلات الألياف الضوئية",
        text: "صيانة واختبار كابلات الألياف الضوئية للغير. أرسلوا نوع الكابل وعددها ووصف العطل لنحدد نطاق العمل.",
        img: IMAGES.fiber,
      },
    ],
    more: "اعرف المزيد",
    all: "كل الخدمات",
  },
} as const;

export function HomeServices({ lang }: { lang: Lang }) {
  const t = T[lang];
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const icons = [Warehouse, Cable];
  return (
    <section
      id="services-home"
      className="border-t border-slate-200 bg-gradient-to-br from-[#1B093D] via-[#250C52] to-[#4a1550] py-16 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              {t.eyebrow}
            </span>
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t.title}</h2>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{t.blurb}</p>
          </div>
          <Link
            href="/services"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-5 py-3 text-sm font-bold transition hover:bg-white/15"
          >
            {t.all}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {t.cards.map((c, i) => {
            const Icon = icons[i];
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <img
                  src={c.img.src}
                  alt={c.img.alt[lang]}
                  className="h-48 w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#250C52] text-[#F08B22]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-950">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{c.text}</p>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[#7A1D4B]">
                    {t.more}
                    <Arrow className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] text-slate-400">{c.img.cap[lang]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
