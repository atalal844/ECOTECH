import { NextRequest } from "next/server";
import { z } from "zod";
import {
  db,
  products,
  productCategories,
  productImages,
  productDocuments,
  productSpecifications,
} from "@/db";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { requireAuth, getCurrentUser, hasPermission } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { ensureDatabaseSeeded } from "@/db/seed";

const imageItemSchema = z.object({
  mediaId: z.number().int().positive().nullable().optional(),
  url: z.string().min(1),
  mediaType: z.enum(["image", "gif", "video"]).default("image"),
  altEn: z.string().nullable().optional(),
  altAr: z.string().nullable().optional(),
  captionEn: z.string().nullable().optional(),
  captionAr: z.string().nullable().optional(),
  isPrimary: z.boolean().default(false),
  is360Frame: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

const docItemSchema = z.object({
  mediaId: z.number().int().positive().nullable().optional(),
  docType: z
    .enum([
      "datasheet",
      "manual",
      "diagram",
      "certificate",
      "installation_guide",
      "catalog",
      "legacy_archive",
      "other",
    ])
    .default("datasheet"),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  fileUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative().default(0),
  mimeType: z.string().default("application/pdf"),
  isLegacyArchive: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

const specItemSchema = z.object({
  groupNameEn: z.string().min(1).default("Technical Specifications"),
  groupNameAr: z.string().min(1).default("المواصفات الفنية"),
  specKeyEn: z.string().min(1),
  specKeyAr: z.string().min(1),
  specValueEn: z.string().min(1),
  specValueAr: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

export const productPayloadSchema = z.object({
  categoryId: z.number().int().positive(),
  slug: z.string().min(2).max(180),
  sku: z.string().min(2).max(100),
  model: z.string().min(1).max(120),
  productType: z.string().min(1).max(120).default("standard"),
  nameEn: z.string().min(2).max(240),
  nameAr: z.string().min(2).max(240),
  shortOverviewEn: z.string().nullable().optional(),
  shortOverviewAr: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  featuresEn: z.array(z.string()).default([]),
  featuresAr: z.array(z.string()).default([]),
  applicationsEn: z.array(z.string()).default([]),
  applicationsAr: z.array(z.string()).default([]),
  configurationsEn: z.array(z.string()).default([]),
  configurationsAr: z.array(z.string()).default([]),
  dimensions: z.string().nullable().optional(),
  materialsEn: z.string().nullable().optional(),
  materialsAr: z.string().nullable().optional(),
  availabilityStatus: z
    .enum(["in_stock", "made_to_order", "pre_order", "discontinued"])
    .default("in_stock"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  has360View: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  seoTitleEn: z.string().nullable().optional(),
  seoTitleAr: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  seoDescriptionAr: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
  images: z.array(imageItemSchema).default([]),
  documents: z.array(docItemSchema).default([]),
  specifications: z.array(specItemSchema).default([]),
});

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const sp = request.nextUrl.searchParams;
    const q = sp.get("q")?.trim() || "";
    const categorySlug = sp.get("categorySlug")?.trim() || "";
    const categoryIdParam = sp.get("categoryId");
    const productType = sp.get("productType")?.trim() || "";
    const model = sp.get("model")?.trim() || "";
    const availability = sp.get("availability")?.trim() || "";
    const featured = sp.get("featured");
    const bestSeller = sp.get("bestSeller");
    const statusFilter = sp.get("status")?.trim() || "";
    const includeAll = sp.get("includeAll") === "1";
    const autocomplete = sp.get("autocomplete") === "1";
    const limit = Math.min(Number(sp.get("limit") || 50), 100);

    if (includeAll || (statusFilter && statusFilter !== "published")) {
      const user = await getCurrentUser();
      if (!user || !hasPermission(user, "products.read")) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const conditions = [];

    if (!includeAll) {
      conditions.push(eq(products.status, statusFilter || "published"));
    } else if (statusFilter) {
      conditions.push(eq(products.status, statusFilter));
    }

    // Category filter (supports parent category matching all subcategories)
    if (categorySlug || categoryIdParam) {
      const allCats = await db.select().from(productCategories);
      let targetCatId: number | null = categoryIdParam
        ? Number(categoryIdParam)
        : null;
      if (categorySlug) {
        const match = allCats.find((c) => c.slug === categorySlug);
        targetCatId = match ? match.id : -1;
      }
      if (targetCatId !== null) {
        const childIds = allCats
          .filter((c) => c.parentId === targetCatId)
          .map((c) => c.id);
        conditions.push(inArray(products.categoryId, [targetCatId, ...childIds]));
      }
    }

    if (productType) {
      conditions.push(eq(products.productType, productType));
    }
    if (model) {
      conditions.push(ilike(products.model, `%${model}%`));
    }
    if (availability) {
      conditions.push(eq(products.availabilityStatus, availability));
    }
    if (featured === "1" || featured === "true") {
      conditions.push(eq(products.isFeatured, true));
    }
    if (bestSeller === "1" || bestSeller === "true") {
      conditions.push(eq(products.isBestSeller, true));
    }

    if (q) {
      const pattern = `%${q}%`;
      // Also match products whose technical specifications contain query
      const specMatches = await db
        .selectDistinct({ productId: productSpecifications.productId })
        .from(productSpecifications)
        .where(
          or(
            ilike(productSpecifications.specKeyEn, pattern),
            ilike(productSpecifications.specKeyAr, pattern),
            ilike(productSpecifications.specValueEn, pattern),
            ilike(productSpecifications.specValueAr, pattern)
          )
        );
      const specProdIds = specMatches.map((m) => m.productId);

      const textCond = or(
        ilike(products.nameEn, pattern),
        ilike(products.nameAr, pattern),
        ilike(products.sku, pattern),
        ilike(products.model, pattern),
        ilike(products.productType, pattern),
        ilike(products.shortOverviewEn, pattern),
        ilike(products.shortOverviewAr, pattern),
        ilike(products.descriptionEn, pattern),
        ilike(products.descriptionAr, pattern),
        specProdIds.length > 0 ? inArray(products.id, specProdIds) : sql`false`
      );
      if (textCond) conditions.push(textCond);
    }

    const rows = await db
      .select()
      .from(products)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(products.displayOrder), desc(products.createdAt))
      .limit(autocomplete ? 8 : limit);

    if (autocomplete) {
      return Response.json({
        suggestions: rows.map((p) => ({
          id: p.id,
          slug: p.slug,
          sku: p.sku,
          model: p.model,
          nameEn: p.nameEn,
          nameAr: p.nameAr,
          productType: p.productType,
        })),
      });
    }

    const productIds = rows.map((r) => r.id);
    const categories = await db.select().from(productCategories);
    const catMap = new Map(categories.map((c) => [c.id, c]));

    let imagesList: (typeof productImages.$inferSelect)[] = [];
    let docsList: (typeof productDocuments.$inferSelect)[] = [];
    let specsList: (typeof productSpecifications.$inferSelect)[] = [];

    if (productIds.length > 0) {
      imagesList = await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(asc(productImages.displayOrder));

      docsList = await db
        .select()
        .from(productDocuments)
        .where(inArray(productDocuments.productId, productIds))
        .orderBy(asc(productDocuments.displayOrder));

      specsList = await db
        .select()
        .from(productSpecifications)
        .where(inArray(productSpecifications.productId, productIds))
        .orderBy(asc(productSpecifications.displayOrder));
    }

    const enriched = rows.map((p) => {
      const imgs = imagesList.filter((i) => i.productId === p.id);
      const primaryImg = imgs.find((i) => i.isPrimary) || imgs[0] || null;
      return {
        ...p,
        category: catMap.get(p.categoryId) || null,
        primaryImage: primaryImg,
        images: imgs,
        documents: docsList.filter((d) => d.productId === p.id),
        specifications: specsList.filter((s) => s.productId === p.id),
      };
    });

    return Response.json({ products: enriched });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return Response.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("products.write");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    const parsed = productPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cleanSlug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");

    const [created] = await db
      .insert(products)
      .values({
        categoryId: data.categoryId,
        slug: cleanSlug,
        sku: data.sku.trim(),
        model: data.model.trim(),
        productType: data.productType,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        shortOverviewEn: data.shortOverviewEn,
        shortOverviewAr: data.shortOverviewAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        featuresEn: data.featuresEn,
        featuresAr: data.featuresAr,
        applicationsEn: data.applicationsEn,
        applicationsAr: data.applicationsAr,
        configurationsEn: data.configurationsEn,
        configurationsAr: data.configurationsAr,
        dimensions: data.dimensions,
        materialsEn: data.materialsEn,
        materialsAr: data.materialsAr,
        availabilityStatus: data.availabilityStatus,
        status: data.status,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        has360View: data.has360View,
        displayOrder: data.displayOrder,
        seoTitleEn: data.seoTitleEn || `${data.nameEn} | ECOTECH`,
        seoTitleAr: data.seoTitleAr || `${data.nameAr} | إيكوتك`,
        seoDescriptionEn: data.seoDescriptionEn || data.shortOverviewEn,
        seoDescriptionAr: data.seoDescriptionAr || data.shortOverviewAr,
        ogImageUrl: data.ogImageUrl || data.images[0]?.url || null,
      })
      .returning();

    if (data.images.length > 0) {
      const hasPrimary = data.images.some((i) => i.isPrimary);
      await db.insert(productImages).values(
        data.images.map((img, idx) => ({
          productId: created.id,
          mediaId: img.mediaId ?? null,
          url: img.url,
          mediaType: img.mediaType,
          altEn: img.altEn ?? data.nameEn,
          altAr: img.altAr ?? data.nameAr,
          captionEn: img.captionEn ?? null,
          captionAr: img.captionAr ?? null,
          isPrimary: hasPrimary ? img.isPrimary : idx === 0,
          is360Frame: img.is360Frame,
          displayOrder: img.displayOrder ?? idx,
        }))
      );
    }

    if (data.documents.length > 0) {
      await db.insert(productDocuments).values(
        data.documents.map((doc, idx) => ({
          productId: created.id,
          mediaId: doc.mediaId ?? null,
          docType: doc.docType,
          titleEn: doc.titleEn,
          titleAr: doc.titleAr,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          isLegacyArchive: doc.isLegacyArchive,
          displayOrder: doc.displayOrder ?? idx,
        }))
      );
    }

    if (data.specifications.length > 0) {
      await db.insert(productSpecifications).values(
        data.specifications.map((spec, idx) => ({
          productId: created.id,
          groupNameEn: spec.groupNameEn,
          groupNameAr: spec.groupNameAr,
          specKeyEn: spec.specKeyEn,
          specKeyAr: spec.specKeyAr,
          specValueEn: spec.specValueEn,
          specValueAr: spec.specValueAr,
          displayOrder: spec.displayOrder ?? idx,
        }))
      );
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "product_created",
      entityType: "product",
      entityId: created.id,
      details: { sku: created.sku, nameEn: created.nameEn, status: created.status },
      ipAddress: getClientIp(request),
    });

    return Response.json({ product: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return Response.json(
      { error: "Failed to create product (SKU or slug may already exist)" },
      { status: 400 }
    );
  }
}
