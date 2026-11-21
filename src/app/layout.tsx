import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ecotech-ecotech6.vercel.app"),
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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("ecotech_lang")?.value === "ar" ? "ar" : "en";

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
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
        {children}
      </body>
    </html>
  );
}
