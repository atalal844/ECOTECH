import { cookies } from "next/headers";
import {
  db,
  productCategories,
  products,
  productImages,
  productDocuments,
  productSpecifications,
  homepageSections,
  websitePages,
  companySettings,
  navigationMenus,
} from "@/db";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { ensureDatabaseSeeded } from "@/db/seed";
import type { Lang } from "./i18n";

// Contact data approved by the owner from https://ecotel.holdings/contact-us/.
// Keep this review branch independent of shared production database settings.
export const VERIFIED_CONTACT_OFFICES = [
  {
    "country": "EGYPT",
    "address": "20 Sayed Zakaria Khaleel St.,Masaken Sheraton,",
    "phones": [
      "+2 (02) 2269 5345",
      "+2 (02) 2269 5340"
    ]
  },
  {
    "country": "JORDAN",
    "address": "190 Zahran st,Amman",
    "phones": [
      "+962 77 900 7000"
    ]
  },
  {
    "country": "Saudi Arabia",
    "address": "7069 Hital Tower King Fahd Road , Al Sahafa Dist. Riyadh 13315 - 2416 Kingdom of Saudi Arabia",
    "phones": [
      "+966 56 985 5716"
    ]
  }
];

const verifiedContactSettings = {
  "contact_email": {
    "en": "info@ecotelholding.com",
    "ar": "info@ecotelholding.com",
    "json": null
  },
  "support_email": {
    "en": "",
    "ar": "",
    "json": null
  },
  "phone_primary": {
    "en": "+2 (02) 2269 5345",
    "ar": "+2 (02) 2269 5345",
    "json": null
  },
  "phone_sales": {
    "en": "+2 (02) 2269 5340",
    "ar": "+2 (02) 2269 5340",
    "json": null
  },
  "address": {
    "en": "20 Sayed Zakaria Khaleel St.,Masaken Sheraton,",
    "ar": "20 Sayed Zakaria Khaleel St.,Masaken Sheraton,",
    "json": null
  },
  "working_hours": {
    "en": "",
    "ar": "",
    "json": null
  },
  "google_maps_embed_url": {
    "en": "https://maps.google.com/maps?q=30.103497898646612%2C%2031.372872427990778&t=m&z=18&output=embed&iwloc=near",
    "ar": "https://maps.google.com/maps?q=30.103497898646612%2C%2031.372872427990778&t=m&z=18&output=embed&iwloc=near",
    "json": null
  },
  "social_links": {
    "en": "",
    "ar": "",
    "json": {
      "facebook": "https://www.facebook.com/Ecotelholding",
      "linkedin": "https://www.linkedin.com/company/ecotel-holding?trk=top_nav_home"
    }
  }
};

export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  return cookieStore.get("ecotech_lang")?.value === "ar" ? "ar" : "en";
}

export async function getPublicSiteChrome() {
  await ensureDatabaseSeeded();

  const [cats, menus, settingsRows] = await Promise.all([
    db
      .select()
      .from(productCategories)
      .where(eq(productCategories.isActive, true))
      .orderBy(asc(productCategories.displayOrder), asc(productCategories.id)),
    db
      .select()
      .from(navigationMenus)
      .where(eq(navigationMenus.isVisible, true))
      .orderBy(asc(navigationMenus.displayOrder)),
    db.select().from(companySettings),
  ]);

  const settings: Record<string, { en: string; ar: string; json: Record<string, unknown> | null }> = {};
  for (const s of settingsRows) {
    settings[s.key] = {
      en: s.valueEn || "",
      ar: s.valueAr || s.valueEn || "",
      json: s.valueJson || null,
    };
  }

  // Override the seeded contact placeholders without mutating the database.
  Object.assign(settings, verifiedContactSettings);

  return {
    categories: cats,
    menus,
    settings,
  };
}

export async function getHomepageData() {
  await ensureDatabaseSeeded();

  const [sectionsRows, featuredProductsRows, cats] = await Promise.all([
    db
      .select()
      .from(homepageSections)
      .where(eq(homepageSections.isVisible, true))
      .orderBy(asc(homepageSections.displayOrder)),
    db
      .select()
      .from(products)
      .where(eq(products.status, "published"))
      .orderBy(desc(products.isFeatured), desc(products.isBestSeller), asc(products.displayOrder))
      .limit(8),
    db
      .select()
      .from(productCategories)
      .where(eq(productCategories.isActive, true))
      .orderBy(asc(productCategories.displayOrder)),
  ]);

  const prodIds = featuredProductsRows.map((p) => p.id);
  const imgs =
    prodIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, prodIds))
          .orderBy(asc(productImages.displayOrder))
      : [];

  const catMap = new Map(cats.map((c) => [c.id, c]));

  const productsWithMedia = featuredProductsRows.map((p) => {
    const pImgs = imgs.filter((i) => i.productId === p.id);
    return {
      ...p,
      category: catMap.get(p.categoryId) || null,
      primaryImage: pImgs.find((i) => i.isPrimary) || pImgs[0] || null,
    };
  });

  const sectionsMap = new Map(sectionsRows.map((s) => [s.sectionKey, s]));

  return {
    sectionsMap,
    sections: sectionsRows,
    featuredProducts: productsWithMedia,
    topCategories: cats.filter((c) => !c.parentId),
    allCategories: cats,
  };
}

export async function getPublishedProductBySlug(slug: string) {
  await ensureDatabaseSeeded();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product || product.status !== "published") return null;

  // Increment view count
  await db
    .update(products)
    .set({ viewCount: product.viewCount + 1 })
    .where(eq(products.id, product.id));

  const [category] = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, product.categoryId))
    .limit(1);

  let parentCategory = null;
  if (category?.parentId) {
    const [pCat] = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, category.parentId))
      .limit(1);
    parentCategory = pCat || null;
  }

  const [images, documents, specifications, allPublished] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.displayOrder)),
    db
      .select()
      .from(productDocuments)
      .where(eq(productDocuments.productId, product.id))
      .orderBy(asc(productDocuments.displayOrder)),
    db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, product.id))
      .orderBy(asc(productSpecifications.displayOrder)),
    db
      .select()
      .from(products)
      .where(eq(products.status, "published"))
      .orderBy(asc(products.displayOrder))
      .limit(10),
  ]);

  const relatedRaw = allPublished.filter((p) => p.id !== product.id).slice(0, 4);
  const relIds = relatedRaw.map((r) => r.id);
  const relImgs =
    relIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, relIds))
          .orderBy(asc(productImages.displayOrder))
      : [];

  const relatedProducts = relatedRaw.map((r) => {
    const rImgs = relImgs.filter((i) => i.productId === r.id);
    return {
      ...r,
      primaryImage: rImgs.find((i) => i.isPrimary) || rImgs[0] || null,
    };
  });

  return {
    product,
    category: category || null,
    parentCategory,
    images,
    documents,
    specifications,
    relatedProducts,
  };
}

export async function getAboutPageData() {
  await ensureDatabaseSeeded();
  const [page] = await db
    .select()
    .from(websitePages)
    .where(eq(websitePages.slug, "about-us"))
    .limit(1);
  return page || null;
                               }
