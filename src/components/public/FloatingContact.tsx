"use client";

import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";

const WHATSAPP = "201155404444";
const PHONE = "+201155404444";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.84 9.84 0 0 0 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.41 8.2 8.2 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.27 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29z" />
    </svg>
  );
}

export function FloatingContact({ lang }: { lang: "en" | "ar" }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const ar = lang === "ar";
  const text = encodeURIComponent(
    ar ? "مرحبا ECOTECH، أريد الاستفسار عن منتجاتكم" : "Hello ECOTECH, I would like to ask about your products"
  );
  return (
    <div className="fixed bottom-4 end-4 z-40 flex flex-col gap-3">
      <a
        href={`tel:${PHONE}`}
        aria-label={ar ? "اتصل بنا" : "Call us"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#250C52] text-white shadow-lg ring-2 ring-white/70 transition hover:scale-105"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={`https://wa.me/${WHATSAPP}?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ar ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white/70 transition hover:scale-105"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}
