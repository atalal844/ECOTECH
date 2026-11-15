import { NextRequest } from "next/server";
import { z } from "zod";
import { db, productCategories, products } from "@/db";
import { asc, eq, sql } from "drizzle-orm";
import { requireAuth, getCurrentUser, hasPermission } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { ensureDatabaseSeeded } from "@/db/seed";

const createCategorySchema = z.object({
  parentId: z.number().int().positive().nullable().optional(),
  slug: z.string().min(2).max(120),
  nameEn: z.string().min(2).max(160),
  nameAr: z.string().min(2).max(160),
  descriptionEn: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  catalogUrl: z.string().nullable().optional(),
  imageMediaId: z.number().int().positive().nullable().optional(),
  bannerMediaId: z.number().int().positive().nullable().optional(),
  catalogMediaId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitleEn: z.string().nullable().optional(),
  seoTitleAr: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  seoDescriptionAr: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const includeInactive =
      request.nextUrl.searchParams.get("includeInactive") === "1";

    if (includeInactive) {
      const user = await getCurrentUser();
      if (!user || !hasPermission(user, "categories.read")) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const cats = await db
      .select()
      .from(productCategories)
      .where(includeInactive ? undefined : eq(productCategories.isActive, true))
      .orderBy(asc(productCategories.displayOrder), asc(productCategories.id));

    const prodCounts = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.status, "published"))
      .groupBy(products.categoryId);

    const countMap = new Map(prodCounts.map((r) => [r.categoryId, r.count]));

    const enriched = cats.map((c) => ({
      ...c,
      productCount: countMap.get(c.id) ?? 0,
    }));

    return Response.json({ categories: enriched });
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return Response.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("categories.write");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const slug = parsed.data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");

    const [created] = await db
      .insert(productCategories)
      .values({
        ...parsed.data,
        slug,
      })
      .returning();

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "category_created",
      entityType: "category",
      entityId: created.id,
      details: { slug: created.slug, nameEn: created.nameEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ category: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error:", err);
    return Response.json(
      { error: "Failed to create category (check if slug already exists)" },
      { status: 400 }
    );
  }
}
