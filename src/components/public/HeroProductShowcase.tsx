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

/** Original vector artwork. No third-party video or animation package. */
export function CinematicIntro(props: CinematicIntroProps) {
  const ar = props.lang === "ar";
  const [paused, setPaused] = useState(false);
  return (
    <section className="eco-intro" data-paused={paused} aria-label={ar ? "مقدمة إيكوتك" : "ECOTECH introduction"}>
      <div className="eco-intro-grain" aria-hidden="true" />
      <div className="eco-intro-art" aria-hidden="true">
        <svg viewBox="0 0 1000 720" fill="none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="eco-rack" x1="300" y1="100" x2="650" y2="600" gradientUnits="userSpaceOnUse"><stop stopColor="#4f2a77"/><stop offset="1" stopColor="#100c20"/></linearGradient>
            <linearGradient id="eco-line"><stop stopColor="#6332a0" stopOpacity="0"/><stop offset=".55" stopColor="#b58bdc"/><stop offset="1" stopColor="#F08B22"/></linearGradient>
            <radialGradient id="eco-halo"><stop stopColor="#7A1D4B" stopOpacity=".55"/><stop offset="1" stopColor="#250C52" stopOpacity="0"/></radialGradient>
          </defs>
          <circle cx="580" cy="350" r="360" fill="url(#eco-halo)"/>
          <g stroke="#8760b4" strokeOpacity=".17">
            {Array.from({length: 13}, (_, i) => <path key={`h${i}`} d={`M0 ${420+i*27} L1000 ${420+i*27}`} />)}
            {Array.from({length: 15}, (_, i) => <path key={`v${i}`} d={`M500 345 L${-500+i*145} 850`} />)}
          </g>
          <g className="eco-intro-orbit" stroke="#bc8be6" strokeOpacity=".2"><ellipse cx="570" cy="355" rx="330" ry="235" transform="rotate(-24 570 355)"/><ellipse cx="570" cy="355" rx="370" ry="260" transform="rotate(-24 570 355)" strokeDasharray="2 15"/></g>
          <g className="eco-intro-racks">
            {[{x:330,y:174,h:340},{x:486,y:120,h:394},{x:642,y:203,h:311}].map(({x,y,h},i) => <g key={x}>
              <path d={`M${x} ${y} l100 -37 56 33 -100 39Z`} fill="#503365" stroke="#ab7fc9" strokeOpacity=".55"/>
              <path d={`M${x+100} ${y-37} l56 33 v${h} l-56 37Z`} fill="#160f27" stroke="#805297" strokeOpacity=".65"/>
              <path d={`M${x} ${y} l100 35 v${h} l-100 -35Z`} fill="url(#eco-rack)" stroke="#cba5e4" strokeOpacity=".6"/>
              {Array.from({length:9},(_,j)=><g key={j}><path d={`M${x+12} ${y+28+j*(h-44)/9} l76 26 v16 l-76 -26Z`} fill="#0c0b17" stroke="#74518b" strokeOpacity=".55"/>
                <circle cx={x+23} cy={y+39+j*(h-44)/9} r="2.4" fill={j%3===0?'#F08B22':'#bd94ec'}/><path d={`M${x+37} ${y+44+j*(h-44)/9} l38 13`} stroke="#6d5382"/>
              </g>)}
              <path d={`M${x+100} ${y+35+h} l56 -37`} stroke="#F08B22" strokeWidth="2"/>
              <path className="eco-intro-scan" style={{animationDelay:`${i*1.1}s`}} d={`M${x+3} ${y+3} l94 33`} stroke="#e5c4ff" strokeWidth="3"/>
            </g>)}
          </g>
          <g stroke="url(#eco-line)" strokeWidth="1.8" strokeLinecap="round">
            {[0,1,2,3,4,5].map(i=><g key={i}>
              <path opacity=".24" d={`M${-70+i*22} ${640+i*10} Q${270+i*8} ${350+i*12} 570 ${560+i*5} T1100 ${370+i*16}`}/>
              <path className="eco-intro-packet" style={{animationDelay:`${i*-.85}s`}} d={`M${-70+i*22} ${640+i*10} Q${270+i*8} ${350+i*12} 570 ${560+i*5} T1100 ${370+i*16}`}/>
            </g>)}
          </g>
          <circle cx="590" cy="555" r="6" fill="#F08B22"/>
          <circle cx="590" cy="555" r="17" stroke="#F08B22" strokeOpacity=".3"/>
        </svg>
        <span className="eco-intro-art-caption">ECOTECH / INFRASTRUCTURE SYSTEMS</span>
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
