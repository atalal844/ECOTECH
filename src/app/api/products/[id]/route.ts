import { NextRequest } from "next/server";
import {
  db,
  products,
  productCategories,
  productImages,
  productDocuments,
  productSpecifications,
} from "@/db";
import { asc, eq, ne, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, getCurrentUser, hasPermission } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { productPayloadSchema } from "../route";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    const isNumeric = !Number.isNaN(numericId) && String(numericId) === id;

    const rows = await db
      .select()
      .from(products)
      .where(isNumeric ? eq(products.id, numericId) : eq(products.slug, id))
      .limit(1);

    const product = rows[0];
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.status !== "published") {
      const user = await getCurrentUser();
      if (!user || !hasPermission(user, "products.read")) {
        return Response.json({ error: "Product not found" }, { status: 404 });
      }
    } else if (request.nextUrl.searchParams.get("trackView") === "1") {
      await db
        .update(products)
        .set({ viewCount: sql`${products.viewCount} + 1` })
        .where(eq(products.id, product.id));
    }

    const [cat] = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, product.categoryId))
      .limit(1);

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.displayOrder));

    const documents = await db
      .select()
      .from(productDocuments)
      .where(eq(productDocuments.productId, product.id))
      .orderBy(asc(productDocuments.displayOrder));

    const specifications = await db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, product.id))
      .orderBy(asc(productSpecifications.displayOrder));

    const relatedRows = await db
      .select()
      .from(products)
      .where(ne(products.id, product.id))
      .limit(4);

    return Response.json({
      product: {
        ...product,
        category: cat || null,
        images,
        documents,
        specifications,
      },
      relatedProducts: relatedRows.filter((r) => r.status === "published"),
    });
  } catch (err) {
    console.error("GET /api/products/[id] error:", err);
    return Response.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth("products.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const prodId = Number(id);
    if (!prodId || Number.isNaN(prodId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);

    // Quick status / featured toggle support
    if (body && typeof body === "object" && Object.keys(body).length <= 2 && ("status" in body || "isFeatured" in body)) {
      const quickUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof body.status === "string" && ["draft", "published", "archived"].includes(body.status)) {
        quickUpdates.status = body.status;
      }
      if (typeof body.isFeatured === "boolean") {
        quickUpdates.isFeatured = body.isFeatured;
      }
      const [updatedQuick] = await db
        .update(products)
        .set(quickUpdates)
        .where(eq(products.id, prodId))
        .returning();
      if (!updatedQuick) {
        return Response.json({ error: "Product not found" }, { status: 404 });
      }
      await logActivity({
        userId: user!.id,
        userEmail: user!.email,
        userRole: user!.roleSlug,
        action: "product_updated_status",
        entityType: "product",
        entityId: prodId,
        details: quickUpdates,
        ipAddress: getClientIp(request),
      });
      return Response.json({ product: updatedQuick });
    }

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

    const [updated] = await db
      .update(products)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(products.id, prodId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Replace gallery, docs, specs atomically
    await db.delete(productImages).where(eq(productImages.productId, prodId));
    if (data.images.length > 0) {
      const hasPrimary = data.images.some((i) => i.isPrimary);
      await db.insert(productImages).values(
        data.images.map((img, idx) => ({
          productId: prodId,
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

    await db.delete(productDocuments).where(eq(productDocuments.productId, prodId));
    if (data.documents.length > 0) {
      await db.insert(productDocuments).values(
        data.documents.map((doc, idx) => ({
          productId: prodId,
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

    await db
      .delete(productSpecifications)
      .where(eq(productSpecifications.productId, prodId));
    if (data.specifications.length > 0) {
      await db.insert(productSpecifications).values(
        data.specifications.map((spec, idx) => ({
          productId: prodId,
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
      action: "product_updated",
      entityType: "product",
      entityId: prodId,
      details: { sku: updated.sku, nameEn: updated.nameEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ product: updated });
  } catch (err) {
    console.error("PATCH /api/products/[id] error:", err);
    return Response.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Duplicate product endpoint
  try {
    const { user, errorResponse } = await requireAuth("products.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const prodId = Number(id);
    const [source] = await db
      .select()
      .from(products)
      .where(eq(products.id, prodId))
      .limit(1);

    if (!source) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const suffix = Date.now().toString().slice(-4);
    const [cloned] = await db
      .insert(products)
      .values({
        categoryId: source.categoryId,
        slug: `${source.slug}-copy-${suffix}`,
        sku: `${source.sku}-COPY-${suffix}`,
        model: `${source.model}-COPY`,
        productType: source.productType,
        nameEn: `${source.nameEn} (Copy)`,
        nameAr: `${source.nameAr} (نسخة)`,
        shortOverviewEn: source.shortOverviewEn,
        shortOverviewAr: source.shortOverviewAr,
        descriptionEn: source.descriptionEn,
        descriptionAr: source.descriptionAr,
        featuresEn: source.featuresEn,
        featuresAr: source.featuresAr,
        applicationsEn: source.applicationsEn,
        applicationsAr: source.applicationsAr,
        configurationsEn: source.configurationsEn,
        configurationsAr: source.configurationsAr,
        dimensions: source.dimensions,
        materialsEn: source.materialsEn,
        materialsAr: source.materialsAr,
        availabilityStatus: source.availabilityStatus,
        status: "draft",
        isFeatured: false,
        isBestSeller: false,
        has360View: source.has360View,
        displayOrder: source.displayOrder + 1,
        seoTitleEn: source.seoTitleEn,
        seoTitleAr: source.seoTitleAr,
        seoDescriptionEn: source.seoDescriptionEn,
        seoDescriptionAr: source.seoDescriptionAr,
        ogImageUrl: source.ogImageUrl,
      })
      .returning();

    const imgs = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, prodId));
    if (imgs.length > 0) {
      await db.insert(productImages).values(
        imgs.map((i) => ({
          productId: cloned.id,
          mediaId: i.mediaId,
          url: i.url,
          mediaType: i.mediaType,
          altEn: i.altEn,
          altAr: i.altAr,
          captionEn: i.captionEn,
          captionAr: i.captionAr,
          isPrimary: i.isPrimary,
          is360Frame: i.is360Frame,
          displayOrder: i.displayOrder,
        }))
      );
    }

    const specs = await db
      .select()
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, prodId));
    if (specs.length > 0) {
      await db.insert(productSpecifications).values(
        specs.map((s) => ({
          productId: cloned.id,
          groupNameEn: s.groupNameEn,
          groupNameAr: s.groupNameAr,
          specKeyEn: s.specKeyEn,
          specKeyAr: s.specKeyAr,
          specValueEn: s.specValueEn,
          specValueAr: s.specValueAr,
          displayOrder: s.displayOrder,
        }))
      );
    }

    const docs = await db
      .select()
      .from(productDocuments)
      .where(eq(productDocuments.productId, prodId));
    if (docs.length > 0) {
      await db.insert(productDocuments).values(
        docs.map((d) => ({
          productId: cloned.id,
          mediaId: d.mediaId,
          docType: d.docType,
          titleEn: d.titleEn,
          titleAr: d.titleAr,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          fileSize: d.fileSize,
          mimeType: d.mimeType,
          isLegacyArchive: d.isLegacyArchive,
          displayOrder: d.displayOrder,
        }))
      );
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "product_duplicated",
      entityType: "product",
      entityId: cloned.id,
      details: { sourceId: prodId, newSku: cloned.sku },
      ipAddress: getClientIp(request),
    });

    return Response.json({ product: cloned }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products/[id] duplicate error:", err);
    return Response.json({ error: "Failed to duplicate product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAdmin("products.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const prodId = Number(id);
    if (!prodId || Number.isNaN(prodId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, prodId))
      .returning();

    if (!deleted) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "product_deleted",
      entityType: "product",
      entityId: prodId,
      details: { sku: deleted.sku, nameEn: deleted.nameEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return Response.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
