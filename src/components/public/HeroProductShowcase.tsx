"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight, Pause, Play } from "lucide-react";

interface ShowcaseProduct {
  id: string | number;
  slug: string;
  nameEn: string;
  nameAr: string;
  shortDescriptionEn?: string | null;
  shortDescriptionAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  imageUrl?: string | null;
  primaryImage?: { url: string } | null;
  shortOverviewEn?: string | null;
  shortOverviewAr?: string | null;
  sku?: string | null;
}

export function HeroProductShowcase({
  products,
  lang,
}: {
  products: ShowcaseProduct[];
  lang: "en" | "ar";
}) {
  const [index, setIndex] = useState(0);
  const isRtl = lang === "ar";
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!products || products.length <= 1 || paused || interacting || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [products.length, paused, interacting]);

  if (!products || products.length === 0) {
    return (
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src="/product-placeholder.svg"
          alt="ECOTECH Infrastructure"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const current = products[index % products.length];
  const imageSrc = current.primaryImage?.url || current.imageUrl || "/product-placeholder.svg";
  const title = isRtl ? current.nameAr || current.nameEn : current.nameEn;
  const summary = isRtl
    ? current.shortOverviewAr || current.shortDescriptionAr || current.descriptionAr || current.shortOverviewEn || current.shortDescriptionEn || ""
    : current.shortOverviewEn || current.shortDescriptionEn || current.descriptionEn || "";

  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + products.length) % products.length);
  const nextSlide = () =>
    setIndex((prev) => (prev + 1) % products.length);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950" role="region" aria-label={isRtl ? "منتجات مميزة" : "Featured products"} onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setInteracting(false); }}>
      {/* صورة المنتج */}
      <div className="relative aspect-[4/3] min-h-[300px] w-full overflow-hidden bg-slate-900 sm:aspect-[16/10]">
        <img
          src={failedSrc === imageSrc ? "/product-placeholder.svg" : imageSrc}
          onError={() => setFailedSrc(imageSrc)}
          alt={title}
          className="h-full w-full object-contain p-6 pb-28 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

        {/* أزرار التنقل */}
        {products.length > 1 && (
          <div className="absolute top-3 end-3 flex items-center gap-1.5">
            <button type="button" onClick={() => setPaused(v => !v)} aria-label={paused ? (isRtl ? "تشغيل العرض" : "Play slideshow") : (isRtl ? "إيقاف العرض" : "Pause slideshow")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
            <button
              type="button"
              onClick={isRtl ? nextSlide : prevSlide}
              aria-label={isRtl ? "المنتج السابق" : "Previous product"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-[#F08B22]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={isRtl ? prevSlide : nextSlide}
              aria-label={isRtl ? "المنتج التالي" : "Next product"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-[#F08B22]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* شارة الموديل */}
        {current.sku && (
          <span className="absolute top-3 start-3 rounded-full bg-[#250C52]/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur border border-white/15">
            {current.sku}
          </span>
        )}

        {/* اسم المنتج ونبذة عنه */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-lg font-extrabold leading-snug sm:text-xl">
                {title}
              </h2>
              {summary && (
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-200 sm:text-sm">
                  {summary}
                </p>
              )}
            </div>
            <Link
              href={`/products/${current.slug}`}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-[#F08B22] px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-[#d97714]"
            >
              <span>{isRtl ? "التفاصيل" : "Details"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* مؤشرات الشرائح */}
          {products.length > 1 && (
            <div className="mt-3 flex items-center gap-1.5">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setIndex(idx)}
                  aria-label={isRtl ? `المنتج ${idx + 1}` : `Product ${idx + 1}`}
                  aria-pressed={idx === index}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === index ? "w-6 bg-[#F08B22]" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CinematicIntroProps {
  lang: "en" | "ar";
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  catalogHref?: string;
}

/** Real stock photography, Brett Sayles / Pexels, Pexels License.
 * License checked: https://www.pexels.com/license/ (free website use and modification).
 * Photos are illustrative, not ECOTECH-owned facilities. Source list below.
 */
const introPhotographs = [
  {
    "name": "Data-center interior",
    "author": "Brett Sayles",
    "source": "https://www.pexels.com/photo/black-server-racks-4508751/",
    "src": "/hero-photo/0"
  },
  {
    "name": "Server racks",
    "author": "Brett Sayles",
    "source": "https://www.pexels.com/photo/server-racks-on-data-center-5480781/",
    "src": "/hero-photo/1"
  },
  {
    "name": "Network connections",
    "author": "Brett Sayles",
    "source": "https://www.pexels.com/photo/cables-connected-to-ethernet-ports-2881232/",
    "src": "/hero-photo/2"
  }
];

export function CinematicIntro(props: CinematicIntroProps) {
  const ar = props.lang === "ar";
  const [paused, setPaused] = useState(false);
  return (
    <section className="eco-intro" data-paused={paused} aria-label={ar ? "مقدمة إيكوتك" : "ECOTECH introduction"}>
      <div className="eco-intro-grain" aria-hidden="true" />
      <div className="eco-intro-photos" aria-hidden="true">
        {introPhotographs.map((photo, i) => <img
          key={photo.source}
          className={`eco-intro-photo eco-intro-photo-${i}`}
          src={photo.src}
          alt=""
          width="1260"
          height="840"
          loading="eager"
          fetchPriority={i === 0 ? "high" : "auto"}
          decoding="async"
        />)}
        <div className="eco-intro-photo-shade" />
        <div className="eco-intro-light-trail" />
      </div>
      <div className="eco-intro-inner">
        <div className="eco-intro-copy">
          <p className="eco-intro-eyebrow"><span />{ar ? "شبكات. ألياف ضوئية. طاقة ذكية." : "NETWORKS. FIBER. SMART POWER."}</p>
          <h1>{props.title}</h1>
          <p className="eco-intro-description">{props.subtitle}</p>
          <div className="eco-intro-actions">
            <Link className="eco-intro-primary" href={props.primaryHref}>{props.primaryLabel}<span aria-hidden="true">{ar ? "←" : "→"}</span></Link>
            <Link className="eco-intro-secondary" href={props.secondaryHref}>{props.secondaryLabel}</Link>
            {props.catalogHref && <a className="eco-intro-secondary" href={props.catalogHref} target="_blank" rel="noopener noreferrer">{ar ? "تحميل الكتالوج" : "Download catalog"}</a>}
          </div>
        </div>
        <p className="eco-intro-credit">{ar ? "صور توضيحية من" : "Illustrative photography:"} <a href="https://www.pexels.com/photo/black-server-racks-4508751/" target="_blank" rel="noopener noreferrer">Brett Sayles / Pexels</a></p>
        <div className="eco-intro-bottom">
          <div className="eco-intro-topics"><span><i>01</i>{ar ? "البنية التحتية" : "Infrastructure"}</span><span><i>02</i>{ar ? "الاتصال" : "Connectivity"}</span><span><i>03</i>{ar ? "الطاقة الذكية" : "Intelligent power"}</span></div>
          <button className="eco-intro-motion" type="button" onClick={() => setPaused(v => !v)} aria-pressed={paused}>
            {paused ? <Play size={14}/> : <Pause size={14}/>}<span>{paused ? (ar ? "تشغيل الحركة" : "Play motion") : (ar ? "إيقاف الحركة" : "Pause motion")}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
