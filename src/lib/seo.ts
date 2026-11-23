import type { Metadata } from "next";
import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";
import { getServerLang } from "@/lib/public-data";

export const SEO_PAGES_KEY = "seo_pages";
export type PageSeoKey = "home" | "products" | "about" | "services" | "contact";
export type PageSeo = {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  imageUrl: string;
};
export type PagesSeo = Record<PageSeoKey, PageSeo>;

export const PAGE_LABELS: Record<PageSeoKey, string> = {
  home: "Homepage",
  products: "Products page",
  about: "About Us page",
  services: "Services page",
  contact: "Contact page",
};

export const PAGES_SEO_DEFAULT: PagesSeo = {
  home: {
    titleEn: "ECOTECH | Networking Infrastructure & Smart Power Solutions",
    titleAr: "إيكوتك | البنية التحتية للشبكات وحلول الطاقة الذكية",
    descEn:
      "ECOTECH engineers and manufactures enterprise Network Racks, Fiber Optic Solutions, Intelligent Smart PDUs, and Data Center Infrastructure.",
    descAr:
      "تقدّم إيكوتك كابينات الشبكات وحلول الألياف الضوئية ووحدات توزيع الطاقة الذكية ومعدات البنية التحتية لمراكز البيانات.",
    imageUrl: "",
  },
  products: {
    titleEn: "Products",
    titleAr: "المنتجات",
    descEn: "Browse ECOTECH network racks, fiber optic systems and Smart PDUs.",
    descAr: "تصفّح كابينات الشبكات وأنظمة الألياف الضوئية ووحدات توزيع الطاقة الذكية من إيكوتك.",
    imageUrl: "",
  },
  about: {
    titleEn: "About Us",
    titleAr: "من نحن",
    descEn: "Learn about ECOTECH and the infrastructure solutions we provide.",
    descAr: "تعرّف على إيكوتك وحلول البنية التحتية التي تقدّمها.",
    imageUrl: "",
  },
  services: {
    titleEn: "Services",
    titleAr: "الخدمات",
    descEn:
      "Warehousing and inventory management, and a fiber-optic cable maintenance and testing lab.",
    descAr: "التخزين وإدارة المخزون، ومختبر لصيانة واختبار كابلات الألياف الضوئية للغير.",
    imageUrl: "",
  },
  contact: {
    titleEn: "Contact",
    titleAr: "اتصل بنا",
    descEn: "Contact the ECOTECH team for quotation requests and technical questions.",
    descAr: "تواصل مع فريق إيكوتك لطلبات عروض الأسعار والاستفسارات الفنية.",
    imageUrl: "",
  },
};

export function cleanPagesSeo(stored: unknown): PagesSeo {
  const out = {} as PagesSeo;
  const s = (stored && typeof stored === "object" ? stored : {}) as Record<string, unknown>;
  for (const k of Object.keys(PAGES_SEO_DEFAULT) as PageSeoKey[]) {
    const d = PAGES_SEO_DEFAULT[k];
    const v = (s[k] && typeof s[k] === "object" ? s[k] : {}) as Record<string, unknown>;
    const str = (key: keyof PageSeo) =>
      typeof v[key] === "string" ? (v[key] as string).trim().slice(0, 400) : d[key];
    out[k] = {
      titleEn: str("titleEn") || d.titleEn,
      titleAr: str("titleAr") || d.titleAr,
      descEn: str("descEn") || d.descEn,
      descAr: str("descAr") || d.descAr,
      imageUrl: typeof v.imageUrl === "string" ? v.imageUrl.trim() : d.imageUrl,
    };
  }
  return out;
}

export async function getPagesSeo(): Promise<{ seo: PagesSeo; customized: boolean }> {
  try {
    const rows = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.key, SEO_PAGES_KEY))
      .limit(1);
    if (rows[0]?.valueJson) return { seo: cleanPagesSeo(rows[0].valueJson), customized: true };
  } catch (err) {
    console.error("getPagesSeo error:", err);
  }
  return { seo: PAGES_SEO_DEFAULT, customized: false };
}

/** Metadata for a fixed page, in the visitor's language. */
export async function pageMetadata(key: PageSeoKey): Promise<Metadata> {
  const [lang, { seo }] = await Promise.all([getServerLang(), getPagesSeo()]);
  const p = seo[key];
  const title = lang === "ar" ? p.titleAr : p.titleEn;
  const description = lang === "ar" ? p.descAr : p.descEn;
  return {
    title: key === "home" ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      images: p.imageUrl ? [p.imageUrl] : ["/ecotech-social.png"],
    },
  };
}
