import { NextRequest } from "next/server";
import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { PAGES_SEO_DEFAULT, SEO_PAGES_KEY, cleanPagesSeo, getPagesSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const { seo, customized } = await getPagesSeo();
  return Response.json({ seo, customized, defaults: PAGES_SEO_DEFAULT });
}

export async function PUT(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("homepage.write");
    if (errorResponse) return errorResponse;
    const body = await request.json().catch(() => null);
    if (!body || typeof body.seo !== "object" || body.seo === null) {
      return Response.json({ error: "seo is required" }, { status: 400 });
    }
    const clean = cleanPagesSeo(body.seo);
    const existing = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.key, SEO_PAGES_KEY))
      .limit(1);
    if (existing[0]) {
      await db
        .update(companySettings)
        .set({ valueJson: clean, updatedAt: new Date() })
        .where(eq(companySettings.key, SEO_PAGES_KEY));
    } else {
      await db.insert(companySettings).values({ key: SEO_PAGES_KEY, valueJson: clean });
    }
    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "seo_pages_updated",
      entityType: "settings",
      entityId: SEO_PAGES_KEY,
      details: {},
      ipAddress: getClientIp(request),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/seo-pages error:", err);
    return Response.json({ error: "Failed to save SEO settings" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("homepage.write");
    if (errorResponse) return errorResponse;
    await db.delete(companySettings).where(eq(companySettings.key, SEO_PAGES_KEY));
    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "seo_pages_reset",
      entityType: "settings",
      entityId: SEO_PAGES_KEY,
      details: {},
      ipAddress: getClientIp(request),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/seo-pages error:", err);
    return Response.json({ error: "Failed to reset SEO settings" }, { status: 500 });
  }
}
