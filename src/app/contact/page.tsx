import React from "react";
import { Mail, Phone, MapPin, Clock, Globe } from "lucide-react";
import { getServerLang, getPublicSiteChrome, VERIFIED_CONTACT_OFFICES } from "@/lib/public-data";
import { UI_LABELS, pickText } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { InquiryForm } from "@/components/public/InquiryForm";

export const dynamic = "force-dynamic";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    productId?: string;
    productName?: string;
  }>;
}) {
  const sp = await searchParams;
  const [lang, chrome] = await Promise.all([
    getServerLang(),
    getPublicSiteChrome(),
  ]);

  const t = UI_LABELS[lang];
  const defaultType =
    sp.type === "sales" ? "sales" : sp.type === "contact" ? "contact" : "quote";
  const defaultProductId = sp.productId ? Number(sp.productId) : null;
  const defaultProductName = sp.productName || "";

  const contactEmail = chrome.settings.contact_email?.en || "";
  const supportEmail = chrome.settings.support_email?.en || "";
  const phonePrimary = chrome.settings.phone_primary?.en || "";
  const phoneSales = chrome.settings.phone_sales?.en || "";
  const address = pickText(
    lang,
    chrome.settings.address?.en,
    chrome.settings.address?.ar
  );
  const workingHours = pickText(
    lang,
    chrome.settings.working_hours?.en,
    chrome.settings.working_hours?.ar
  );
  const mapEmbedUrl = chrome.settings.google_maps_embed_url?.en || "";
  const social = (chrome.settings.social_links?.json || {}) as Record<
    string,
    string
  >;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <SiteHeader
        lang={lang}
        categories={chrome.categories}
        menus={chrome.menus}
        settings={chrome.settings}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7A1D4B]">
            ECOTECH GLOBAL SALES & ENGINEERING
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950 sm:text-4xl">
            {t.contactUs}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {lang === "ar"
              ? "تواصل مع فريق المبيعات والمهندسين لطلب عروض الأسعار، المواصفات المخصصة، أو الدعم الفني لمشاريع البنية التحتية."
              : "Connect with our sales and engineering desks for formal quotations, custom rack/PDU configurations, and project BOM support."}
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Contact Information Cards */}
          <div className="space-y-5 lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-slate-950">
                {t.contactInfo}
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                {address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#F08B22]" />
                    <div>
                      <div className="text-xs font-bold uppercase text-slate-400">
                        {lang === "ar" ? "العنوان" : "Business Address"}
                      </div>
                      <div className="mt-0.5 font-medium">{address}</div>
                    </div>
                  </div>
                )}

                {(phonePrimary || phoneSales) && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#F08B22]" />
                    <div>
                      <div className="text-xs font-bold uppercase text-slate-400">
                        {lang === "ar" ? "أرقام الهاتف" : "Phone Numbers"}
                      </div>
                      {phonePrimary && (
                        <div className="mt-0.5 font-medium" dir="ltr">
                          {phonePrimary}
                        </div>
                      )}
                      {phoneSales && (
                        <div className="text-xs text-slate-500" dir="ltr">
                          {phoneSales}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(contactEmail || supportEmail) && (
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#F08B22]" />
                    <div>
                      <div className="text-xs font-bold uppercase text-slate-400">
                        {lang === "ar" ? "البريد الإلكتروني" : "Email Addresses"}
                      </div>
                      {contactEmail && (
                        <a
                          href={`mailto:${contactEmail}`}
                          className="mt-0.5 block font-medium text-[#250C52] hover:underline"
                        >
                          {contactEmail}
                        </a>
                      )}
                      {supportEmail && (
                        <a
                          href={`mailto:${supportEmail}`}
                          className="block text-xs text-slate-500 hover:underline"
                        >
                          {supportEmail}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {workingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#F08B22]" />
                    <div>
                      <div className="text-xs font-bold uppercase text-slate-400">
                        {lang === "ar" ? "ساعات العمل" : "Operating Hours"}
                      </div>
                      <div className="mt-0.5 font-medium">{workingHours}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {Object.values(social).some(Boolean) && <div className="border-t border-slate-100 pt-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{lang === "ar" ? "قنوات التواصل" : "Social Channels"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(social).map(([name, href]) =>
                    href ? (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold capitalize text-slate-700 hover:border-[#7A1D4B]"
                      >
                        {name}
                      </a>
                    ) : null
                  )}
                </div>
              </div>}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-slate-950">
                {lang === "ar" ? "مكاتبنا الإقليمية" : "Regional Offices"}
              </h2>
              {VERIFIED_CONTACT_OFFICES.slice(1).map((office) => (
                <section key={office.country} className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <h3 className="font-bold text-[#250C52]">
                    {lang === "ar" ? (office.country === "JORDAN" ? "الأردن" : "المملكة العربية السعودية") : office.country}
                  </h3>
                  <p>{office.address}</p>
                  {office.phones.map((phone) => <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, "")}`} dir="ltr" className="block font-medium hover:underline">{phone}</a>)}
                </section>
              ))}
            </div>

            {/* Google Maps Integration */}
            {mapEmbedUrl && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <iframe
                  title="ECOTECH Facility Location"
                  src={mapEmbedUrl}
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          {/* Quote / Contact Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
            <h2 className="mb-5 text-xl font-extrabold text-slate-950">
              {t.sendInquiry}
            </h2>
            <InquiryForm
              lang={lang}
              defaultType={defaultType}
              defaultProductId={defaultProductId}
              defaultProductName={defaultProductName}
            />
          </div>
        </div>
      </main>

      <SiteFooter
        lang={lang}
        categories={chrome.categories}
        settings={chrome.settings}
      />
    </div>
  );
            }
