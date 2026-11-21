import type { Metadata } from "next";
import { FloatingContact } from "@/components/public/FloatingContact";
import type { ReactNode } from "react";
import type React from "react";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { getWatermark } from "@/lib/watermark-store";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://ecotech-ecotech6.vercel.app")
  ),
  title: {
    default: "ECOTECH | Networking Infrastructure & Smart Power Solutions",
    template: "%s | ECOTECH",
  },
  description:
    "ECOTECH engineers and manufactures enterprise Network Racks, Fiber Optic Solutions, Intelligent Smart PDUs, and Data Center Infrastructure.",
  icons: {
    icon: "/ecotech-icon.svg",
    shortcut: "/ecotech-icon.svg",
    apple: "/ecotech-icon.svg",
  },
  openGraph: {
    title: "ECOTECH | Powering the Future of Network Infrastructure",
    description:
      "Advanced Networking, Fiber Optic and Smart Power Distribution Solutions.",
    images: ["/ecotech-social.png"],
    type: "website",
  },
};

const WM_IMG = ':is(a,div,figure,picture,button[class*="aspect-"]):has(> img:is(.object-cover,.object-contain):not(.opacity-25):not([src*="logo"]):not([src*="placeholder"]))';
const WM_CSS = `@layer base{html[data-wm="on"] ${WM_IMG}{position:relative}}
html[data-wm="on"] ${WM_IMG}::after,html[data-wm="on"] .eco-intro-photos::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:url(/ecotech-logo.svg) center/92% auto no-repeat;opacity:var(--wm-opacity,.25);filter:drop-shadow(0 0 3px rgba(255,255,255,.55))}
html[data-wm="on"] figure:has(> img)::after{bottom:3rem}`;

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("ecotech_lang")?.value === "ar" ? "ar" : "en";
  const wm = await getWatermark();

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      data-wm={wm.enabled ? "on" : "off"}
      style={{ "--wm-opacity": String(wm.opacity / 100) } as React.CSSProperties}
      className={`${jakarta.variable} ${plexArabic.variable}`}
    >
      <body
        className={`min-h-screen bg-[#F8FAFC] text-slate-900 antialiased ${
          lang === "ar"
            ? "font-[family-name:var(--font-arabic)]"
            : "font-[family-name:var(--font-jakarta)]"
        }`}
      >
        <a href="#main-content" className="skip-link">{lang === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
        <style dangerouslySetInnerHTML={{ __html: WM_CSS }} />
        {children}
        <FloatingContact lang={lang} />
      </body>
    </html>
  );
}
