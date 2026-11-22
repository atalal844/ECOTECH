import { NextRequest } from "next/server";
import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { SERVICES_DEFAULT } from "@/lib/services-content";
import {
  SERVICES_SETTING_KEY,
  fillFromDefault,
  getServicesContent,
} from "@/lib/services-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { content, customized } = await getServicesContent();
  return Response.json({ content, customized, defaults: SERVICES_DEFAULT });
}

export async function PUT(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAdmin("homepage.write");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body.content !== "object" || body.content === null) {
      return Response.json({ error: "content is required" }, { status: 400 });
    }
    const clean = fillFromDefault(body.content, SERVICES_DEFAULT) as Record<string, unknown>;
    // Slugs, icons and the inquiry service id are structural: never editable.
    const pages = clean.pages as Record<string, Record<string, unknown>>;
    for (const slug of Object.keys(SERVICES_DEFAULT.pages) as Array<
      keyof typeof SERVICES_DEFAULT.pages
    >) {
      pages[slug].slug = SERVICES_DEFAULT.pages[slug].slug;
      pages[slug].icon = SERVICES_DEFAULT.pages[slug].icon;
      pages[slug].inquiryService = SERVICES_DEFAULT.pages[slug].inquiryService;
    }

    const existing = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.key, SERVICES_SETTING_KEY))
      .limit(1);
    if (existing[0]) {
      await db
        .update(companySettings)
        .set({ valueJson: clean, updatedAt: new Date() })
        .where(eq(companySettings.key, SERVICES_SETTING_KEY));
    } else {
      await db
        .insert(companySettings)
        .values({ key: SERVICES_SETTING_KEY, valueJson: clean });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "services_content_updated",
      entityType: "settings",
      entityId: SERVICES_SETTING_KEY,
      details: {},
      ipAddress: getClientIp(request),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/services-content error:", err);
    return Response.json({ error: "Failed to save services content" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAdmin("homepage.write");
    if (errorResponse) return errorResponse;
    await db.delete(companySettings).where(eq(companySettings.key, SERVICES_SETTING_KEY));
    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "services_content_reset",
      entityType: "settings",
      entityId: SERVICES_SETTING_KEY,
      details: {},
      ipAddress: getClientIp(request),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/services-content error:", err);
    return Response.json({ error: "Failed to reset services content" }, { status: 500 });
  }
}
