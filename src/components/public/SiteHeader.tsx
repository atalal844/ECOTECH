"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Globe,
  ChevronDown,
  Menu,
  X,
  Phone,
  Mail,
  FileDown,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { UI_LABELS, pickText, type Lang } from "@/lib/i18n";

export interface NavCategory {
  id: number;
  parentId: number | null;
  slug: string;
  nameEn: string;
  nameAr: string;
  imageUrl: string | null;
}

export interface NavMenuItem {
  id: number;
  labelEn: string;
  labelAr: string;
  href: string;
}

interface SiteHeaderProps {
  lang: Lang;
  categories: NavCategory[];
  menus: NavMenuItem[];
  settings: Record<string, { en: string; ar: string; json: Record<string, unknown> | null }>;
}

interface SearchSuggestion {
  id: number;
  slug: string;
  sku: string;
  model: string;
  nameEn: string;
  nameAr: string;
  productType: string;
}

export function SiteHeader({ lang, categories, menus, settings }: SiteHeaderProps) {
  const router = useRouter();
  const t = UI_LABELS[lang];
  const isRtl = lang === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const topCategories = categories.filter((c) => !c.parentId);
  const contactEmail = settings.contact_email?.en || "";
  const phonePrimary = settings.phone_primary?.en || "";
  const catalogUrl = settings.master_catalog_url?.en || "/products";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?autocomplete=1&q=${encodeURIComponent(q)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowDropdown(true);
        }
      } catch {
        // ignore transient errors
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function toggleLanguage(nextLang: Lang) {
    if (nextLang === lang) return;
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: nextLang }),
    });
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
    router.refresh();
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowDropdown(false);
    const q = searchQuery.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top Corporate Info Bar */}
      <div className="bg-[#1B093D] text-xs text-slate-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
            {phonePrimary && (
              <a
                href={`tel:${phonePrimary.replace(/\s+/g, "")}`}
                className="flex items-center gap-1.5 transition hover:text-amber-400"
              >
                <Phone className="h-3.5 w-3.5 text-[#F28E20]" />
                <span dir="ltr">{phonePrimary}</span>
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="hidden items-center gap-1.5 transition hover:text-amber-400 sm:flex"
              >
                <Mail className="h-3.5 w-3.5 text-[#F28E20]" />
                <span>{contactEmail}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 font-medium text-amber-300 transition hover:text-amber-200 md:flex"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>{t.downloadCatalog}</span>
            </a>
            <Link
              href="/admin"
              className="flex items-center gap-1 text-slate-300 transition hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#F28E20]" />
              <span>{t.adminPortal}</span>
            </Link>
            <div className="flex items-center gap-1 rounded-md border border-white/15 bg-white/10 p-0.5">
              <Globe className="mx-1 h-3.5 w-3.5 text-amber-300" />
              <button
                type="button"
                onClick={() => toggleLanguage("en")}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
                  lang === "en"
                    ? "bg-[#F08B22] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage("ar")}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
                  lang === "ar"
                    ? "bg-[#F08B22] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation & Search Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="/ecotech-logo.svg"
            alt="ECOTECH Logo"
            className="h-9 w-auto sm:h-11"
          />
        </Link>

        {/* Desktop Nav Links + Mega Menu Trigger */}
        <nav className="hidden items-center gap-1 lg:flex">
          {menus.map((item) => {
            const isProducts = item.href === "/products";
            if (isProducts) {
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#250C52]"
                  >
                    <span>{pickText(lang, item.labelEn, item.labelAr)}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Link>

                  {megaOpen && (
                    <div
                      className={`absolute top-full z-50 w-[760px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ${
                        isRtl ? "right-0" : "left-0"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#250C52]">
                          {t.featuredCategories}
                        </span>
                        <Link
                          href="/products"
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#D96B27] hover:underline"
                        >
                          <span>{t.exploreProducts}</span>
                          <ArrowIcon className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-5">
                        {topCategories.map((cat) => {
                          const subs = categories.filter((c) => c.parentId === cat.id);
                          return (
                            <div key={cat.id} className="space-y-2">
                              <Link
                                href={`/categories/${cat.slug}`}
                                onClick={() => setMegaOpen(false)}
                                className="block font-bold text-slate-900 transition hover:text-[#7A1D4B]"
                              >
                                {pickText(lang, cat.nameEn, cat.nameAr)}
                              </Link>
                              <ul className="space-y-1">
                                {subs.slice(0, 5).map((sub) => (
                                  <li key={sub.id}>
                                    <Link
                                      href={`/categories/${sub.slug}`}
                                      onClick={() => setMegaOpen(false)}
                                      className="block text-xs text-slate-600 transition hover:text-[#250C52] hover:underline"
                                    >
                                      {pickText(lang, sub.nameEn, sub.nameAr)}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#250C52]"
              >
                {pickText(lang, item.labelEn, item.labelAr)}
              </Link>
            );
          })}
        </nav>

        {/* Live Search with Autocomplete */}
        <div ref={searchBoxRef} className="relative hidden flex-1 max-w-sm md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pe-10 ps-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#7A1D4B] focus:bg-white focus:ring-2 focus:ring-[#7A1D4B]/15"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-500 hover:text-[#250C52]"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {showDropdown && (
            <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {suggestions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-500">
                  {t.searchNoResults}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {suggestions.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/products/${s.slug}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">
                            {pickText(lang, s.nameEn, s.nameAr)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {s.sku} • {s.model}
                          </div>
                        </div>
                        <ArrowIcon className="h-4 w-4 shrink-0 text-[#F08B22]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Request Quote CTA + Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href="/contact?type=quote"
            className="hidden rounded-xl bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95 sm:inline-flex"
          >
            {t.requestQuote}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Menu"
            className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-10 ps-4 text-sm outline-none"
            />
            <button
              type="submit"
              className="absolute inset-y-0 end-0 px-3 text-slate-500"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="space-y-1">
            {menus.map((m) => (
              <Link
                key={m.id}
                href={m.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                {pickText(lang, m.labelEn, m.labelAr)}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="mb-2 text-xs font-bold uppercase text-slate-400">
              {t.featuredCategories}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {topCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  {pickText(lang, c.nameEn, c.nameAr)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
