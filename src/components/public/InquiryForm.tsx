"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { UI_LABELS, type Lang } from "@/lib/i18n";

interface InquiryFormProps {
  lang: Lang;
  defaultType?: "quote" | "contact" | "sales";
  defaultProductId?: number | null;
  defaultProductName?: string;
}

export function InquiryForm({
  lang,
  defaultType = "quote",
  defaultProductId = null,
  defaultProductName = "",
}: InquiryFormProps) {
  const t = UI_LABELS[lang];
  const [inquiryType, setInquiryType] = useState<"quote" | "contact" | "sales">(
    defaultType
  );
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [productNameSnapshot, setProductNameSnapshot] =
    useState(defaultProductName);
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessRef(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType,
          customerName,
          companyName: companyName || null,
          email,
          phone,
          country,
          productId: defaultProductId,
          productNameSnapshot: productNameSnapshot || null,
          quantity: quantity || null,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to submit inquiry.");
      } else {
        setSuccessRef(data.inquiry?.referenceCode || "RECEIVED");
        setCustomerName("");
        setCompanyName("");
        setEmail("");
        setPhone("");
        setCountry("");
        setQuantity("");
        setMessage("");
      }
    } catch {
      setErrorMsg("Network error while sending inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["quote", "sales", "contact"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setInquiryType(type)}
            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
              inquiryType === type
                ? "bg-gradient-to-r from-[#250C52] to-[#7A1D4B] text-white shadow"
                : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {type === "quote"
              ? lang === "ar"
                ? "طلب عرض سعر"
                : "Request a Quote"
              : type === "sales"
              ? lang === "ar"
                ? "استفسار مبيعات"
                : "Sales Inquiry"
              : lang === "ar"
              ? "تواصل عام"
              : "General Contact"}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successRef && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            {t.inquirySuccess} <strong dir="ltr">{successRef}</strong>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t.customerName} *
          </label>
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t.companyName}
          </label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t.email} *
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t.phone} *
          </label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t.country} *
          </label>
          <input
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t.quantity}
          </label>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={lang === "ar" ? "مثال: 20 وحدة" : "e.g., 20 Units"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
          {t.productOfInterest}
        </label>
        <input
          value={productNameSnapshot}
          onChange={(e) => setProductNameSnapshot(e.target.value)}
          placeholder={
            lang === "ar"
              ? "اسم المنتج أو الفئة أو رمز SKU"
              : "Product name, category, or SKU"
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
          {t.message} *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-60 sm:w-auto"
      >
        <Send className="h-4 w-4" />
        <span>{submitting ? t.submitting : t.sendInquiry}</span>
      </button>
    </form>
  );
}
