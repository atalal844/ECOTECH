import { NextRequest } from "next/server";
import { z } from "zod";
import { db, productCategories, products } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";

const updateCategorySchema = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  slug: z.string().min(2).max(120).optional(),
  nameEn: z.string().min(2).max(160).optional(),
  nameAr: z.string().min(2).max(160).optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  catalogUrl: z.string().nullable().optional(),
  imageMediaId: z.number().int().positive().nullable().optional(),
  bannerMediaId: z.number().int().positive().nullable().optional(),
  catalogMediaId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  seoTitleEn: z.string().nullable().optional(),
  seoTitleAr: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  seoDescriptionAr: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth("categories.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const catId = Number(id);
    if (!catId || Number.isNaN(catId)) {
      return Response.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      ...parsed.data,
      updatedAt: new Date(),
    };
    if (parsed.data.slug) {
      updates.slug = parsed.data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const [updated] = await db
      .update(productCategories)
      .set(updates)
      .where(eq(productCategories.id, catId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "category_updated",
      entityType: "category",
      entityId: updated.id,
      details: { nameEn: updated.nameEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ category: updated });
  } catch (err) {
    console.error("PATCH /api/categories/[id] error:", err);
    return Response.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAdmin("categories.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const catId = Number(id);
    if (!catId || Number.isNaN(catId)) {
      return Response.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const attachedProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, catId))
      .limit(1);
    if (attachedProducts.length > 0) {
      return Response.json(
        {
          error:
            "Cannot delete category with assigned products. Reassign products first.",
        },
        { status: 409 }
      );
    }

    const attachedSubs = await db
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(eq(productCategories.parentId, catId))
      .limit(1);
    if (attachedSubs.length > 0) {
      return Response.json(
        {
          error:
            "Cannot delete category with subcategories. Delete or reassign subcategories first.",
        },
        { status: 409 }
      );
    }

    const [deleted] = await db
      .delete(productCategories)
      .where(eq(productCategories.id, catId))
      .returning();

    if (!deleted) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "category_deleted",
      entityType: "category",
      entityId: catId,
      details: { nameEn: deleted.nameEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id] error:", err);
    return Response.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
