import { NextRequest } from "next/server";
import { db, websitePages } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { ensureCmsSeeded } from "@/db/seed-cms";

export async function GET(request: NextRequest) {
  try {
    await ensureCmsSeeded();
    const slug = request.nextUrl.searchParams.get("slug");
    if (slug) {
      const [page] = await db
        .select()
        .from(websitePages)
        .where(eq(websitePages.slug, slug))
        .limit(1);
      if (!page) {
        return Response.json({ error: "Page not found" }, { status: 404 });
      }
      return Response.json({ page });
    }
    const pages = await db.select().from(websitePages);
    return Response.json({ pages });
  } catch (err) {
    console.error("GET /api/pages error:", err);
    return Response.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("pages.write");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body.slug !== "string") {
      return Response.json({ error: "Page slug is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const fields = [
      "titleEn",
      "titleAr",
      "subtitleEn",
      "subtitleAr",
      "contentEn",
      "contentAr",
      "structuredData",
      "seoTitleEn",
      "seoTitleAr",
      "seoDescriptionEn",
      "seoDescriptionAr",
      "isPublished",
    ];
    for (const f of fields) {
      if (f in body) updates[f] = body[f];
    }

    const [updated] = await db
      .update(websitePages)
      .set(updates)
      .where(eq(websitePages.slug, body.slug))
      .returning();

    if (!updated) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "page_updated",
      entityType: "website_page",
      entityId: updated.slug,
      ipAddress: getClientIp(request),
    });

    return Response.json({ page: updated });
  } catch (err) {
    console.error("PATCH /api/pages error:", err);
    return Response.json({ error: "Failed to update page" }, { status: 500 });
  }
}
