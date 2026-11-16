"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

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

  useEffect(() => {
    if (!products || products.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src="/images/hero-datacenter.jpg"
          alt="ECOTECH Infrastructure"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const current = products[index];
  const title = isRtl ? current.nameAr || current.nameEn : current.nameEn;
  const summary = isRtl
    ? current.shortDescriptionAr || current.descriptionAr || current.shortDescriptionEn || ""
    : current.shortDescriptionEn || current.descriptionEn || "";

  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + products.length) % products.length);
  const nextSlide = () =>
    setIndex((prev) => (prev + 1) % products.length);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
      {/* صورة المنتج */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={current.imageUrl || "/images/hero-datacenter.jpg"}
          alt={title}
          className="h-full w-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

        {/* أزرار التنقل */}
        {products.length > 1 && (
          <div className="absolute top-3 end-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={isRtl ? nextSlide : prevSlide}
              aria-label="Previous product"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-[#F08B22]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={isRtl ? prevSlide : nextSlide}
              aria-label="Next product"
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
                  aria-label={`Slide ${idx + 1}`}
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