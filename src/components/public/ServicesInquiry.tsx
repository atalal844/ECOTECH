"use client";

import React, { useState } from "react";
import { Phone, Copy, Check, FileText } from "lucide-react";
import type { Lang } from "@/lib/i18n";

const WHATSAPP = "201155404444";

export type ServiceKey = "storage" | "storage-inventory" | "fiber" | "undecided";

const COPY = {
  en: {
    title: "Prepare your inquiry",
    intro: [
      "Your name or company",
      "Goods or fiber cable details and quantity",
      "Storage period or preferred timing",
      "Service needed",
    ],
    name: "Your name or company",
    details: "Goods or fiber cable details and quantity",
    timing: "Storage period or preferred timing",
    service: "Service needed",
    options: {
      storage: "Storage",
      "storage-inventory": "Storage & inventory management",
      fiber: "Fiber maintenance & testing",
      undecided: "Still deciding",
    },
    review: "Review inquiry summary",
    copy: "Copy inquiry",
    copied: "Copied",
    whatsapp: "Open WhatsApp",
    disclosure:
      "This form only prepares text. It does not send or save your details. Copy the summary and send it yourself on WhatsApp.",
    required:
      "Please enter a name, requirements and timing to prepare a useful summary.",
    summaryTitle: "Inquiry summary",
    labels: {
      name: "Name / company",
      details: "Details and quantity",
      timing: "Period / timing",
      service: "Service",
    },
    header: "Hello ECOTECH, I would like to ask about your services:",
    contactNumber: "Contact number",
    number: "+20 115 540 4444",
    tel: "+201155404444",
  },
  ar: {
    title: "جهّز استفسارك",
    intro: [
      "الاسم أو اسم الشركة",
      "نوع البضاعة أو تفاصيل الكابل والكمية",
      "المدة أو الموعد المطلوب",
      "الخدمة المطلوبة",
    ],
    name: "الاسم أو اسم الشركة",
    details: "نوع البضاعة أو تفاصيل الكابل والكمية",
    timing: "المدة أو الموعد المطلوب",
    service: "الخدمة المطلوبة",
    options: {
      storage: "تخزين",
      "storage-inventory": "تخزين وإدارة مخزون",
      fiber: "صيانة واختبار ألياف ضوئية",
      undecided: "لم أحدد بعد",
    },
    review: "عرض ملخص الاستفسار",
    copy: "نسخ الاستفسار",
    copied: "تم النسخ",
    whatsapp: "فتح واتساب",
    disclosure:
      "يقتصر هذا النموذج على إعداد نص الرسالة، ولا يرسل بياناتكم ولا يحفظها. انسخوا الملخص وأرسلوه بأنفسكم عبر واتساب.",
    required: "يرجى ملء الاسم والتفاصيل والمدة أولًا لنُعدّ ملخصًا مفيدًا.",
    summaryTitle: "ملخص الاستفسار",
    labels: {
      name: "الاسم / الشركة",
      details: "التفاصيل والكمية",
      timing: "المدة / الموعد",
      service: "الخدمة",
    },
    header: "مرحبًا ECOTECH، أودّ الاستفسار عن خدماتكم:",
    contactNumber: "رقم التواصل",
    number: "01155404444",
    tel: "+201155404444",
  },
} as const;

export function ServicesInquiry({
  lang,
  defaultService,
}: {
  lang: Lang;
  defaultService: ServiceKey;
}) {
  const c = COPY[lang];
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [timing, setTiming] = useState("");
  const [service, setService] = useState<ServiceKey>(defaultService);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  function build(): string | null {
    if (!name.trim() || !details.trim() || !timing.trim()) {
      setError(true);
      setSummary("");
      return null;
    }
    setError(false);
    const text = [
      c.header,
      `${c.labels.name}: ${name.trim()}`,
      `${c.labels.details}: ${details.trim()}`,
      `${c.labels.timing}: ${timing.trim()}`,
      `${c.labels.service}: ${c.options[service]}`,
    ].join("\n");
    setSummary(text);
    return text;
  }

  async function copyText() {
    const text = build();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the summary stays visible for manual copy
    }
  }

  function openWhatsApp() {
    const text = build();
    if (!text) return;
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7A1D4B] focus:ring-2 focus:ring-[#7A1D4B]/15";
  const label = "mb-1.5 block text-xs font-bold text-slate-700";

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-5">
        <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
          {c.title}
        </h2>
        <ul className="space-y-3 text-sm text-slate-700">
          {c.intro.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#F08B22]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a
          href={`tel:${c.tel}`}
          className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#250C52] shadow-sm transition hover:border-[#7A1D4B]"
        >
          <Phone className="h-4 w-4 text-[#F08B22]" />
          <span>
            {c.contactNumber}:{" "}
            <span dir="ltr" className="inline-block">
              {c.number}
            </span>
          </span>
        </a>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="svc-name">
              {c.name}
            </label>
            <input
              id="svc-name"
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={label} htmlFor="svc-service">
              {c.service}
            </label>
            <select
              id="svc-service"
              className={field}
              value={service}
              onChange={(e) => setService(e.target.value as ServiceKey)}
            >
              {(Object.keys(c.options) as ServiceKey[]).map((k) => (
                <option key={k} value={k}>
                  {c.options[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="svc-details">
              {c.details}
            </label>
            <textarea
              id="svc-details"
              rows={3}
              className={field}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="svc-timing">
              {c.timing}
            </label>
            <input
              id="svc-timing"
              className={field}
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
            />
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
          {c.disclosure}
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
            {c.required}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={build}
            className="inline-flex items-center gap-2 rounded-xl bg-[#250C52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#33106e]"
          >
            <FileText className="h-4 w-4 text-[#F08B22]" />
            {c.review}
          </button>
          <button
            type="button"
            onClick={copyText}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-[#7A1D4B]"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? c.copied : c.copy}
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
          >
            {c.whatsapp}
          </button>
        </div>

        {summary && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7A1D4B]">
              {c.summaryTitle}
            </div>
            <pre className="whitespace-pre-wrap break-words font-[inherit] text-sm leading-relaxed text-slate-800">
              {summary}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
