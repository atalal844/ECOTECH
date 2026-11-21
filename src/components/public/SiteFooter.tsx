import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, FileDown } from "lucide-react";
import { UI_LABELS, pickText, type Lang } from "@/lib/i18n";
import type { NavCategory } from "./SiteHeader";

interface SiteFooterProps {
  lang: Lang;
  categories: NavCategory[];
  settings: Record<string, { en: string; ar: string; json: Record<string, unknown> | null }>;
}

export function SiteFooter({ lang, categories, settings }: SiteFooterProps) {
  const t = UI_LABELS[lang];
  const topCategories = categories.filter((c) => !c.parentId);
  const social = (settings.social_links?.json || {}) as Record<string, string>;

  const footerAbout = pickText(
    lang,
    settings.footer_about?.en,
    settings.footer_about?.ar
  );
  const address = pickText(lang, settings.address?.en, settings.address?.ar);
  const hours = pickText(
    lang,
    settings.working_hours?.en,
    settings.working_hours?.ar
  );
  const phone = settings.phone_primary?.en || "";
  const email = settings.contact_email?.en || "";
  const catalogUrl = settings.master_catalog_url?.en || "";

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22]" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Summary */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/ecotech-logo.svg"
                alt="ECOTECH"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              {footerAbout}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(social).map(([network, url]) =>
                url ? (
                  <a
                    key={network}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700 transition hover:border-[#7A1D4B] hover:text-[#250C52]"
                  >
                    {network}
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#250C52]">
              {t.solutions}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {topCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-slate-600 transition hover:text-[#D96B27]"
                  >
                    {pickText(lang, cat.nameEn, cat.nameAr)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#250C52]">
              {t.quickLinks}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-slate-600 hover:text-[#D96B27]">
                  {t.exploreProducts}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 hover:text-[#D96B27]">
                  {t.aboutCompany}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-[#D96B27]">
                  {t.contactUs}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?type=quote"
                  className="text-slate-600 hover:text-[#D96B27]"
                >
                  {t.requestQuote}
                </Link>
              </li>
              {catalogUrl && (
                <li>
                  <a
                    href={catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#7A1D4B] hover:underline"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>{t.downloadCatalog}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Corporate Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#250C52]">
              {t.contactInfo}
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F08B22]" />
                  <span dir="ltr">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-[#F08B22]" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} dir="ltr" className="hover:text-[#250C52]">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-[#F08B22]" />
                  <a href={`mailto:${email}`} className="hover:text-[#250C52]">
                    {email}
                  </a>
                </li>
              )}
              {hours && (
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-[#F08B22]" />
                  <span>{hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {t.rightsReserved}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-slate-800">
              XML Sitemap
            </Link>
            <Link href="/admin" className="hover:text-slate-800">
              {t.adminPortal}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
