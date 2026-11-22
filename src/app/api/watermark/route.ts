import { NextRequest } from "next/server";
import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { WATERMARK_SETTING_KEY, cleanWatermark, getWatermark } from "@/lib/watermark-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getWatermark());
}

export async function PUT(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAdmin("homepage.write");
    if (errorResponse) return errorResponse;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }
    const clean = cleanWatermark(body);
    const existing = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.key, WATERMARK_SETTING_KEY))
      .limit(1);
    if (existing[0]) {
      await db
        .update(companySettings)
        .set({ valueJson: clean, updatedAt: new Date() })
        .where(eq(companySettings.key, WATERMARK_SETTING_KEY));
    } else {
      await db.insert(companySettings).values({ key: WATERMARK_SETTING_KEY, valueJson: clean });
    }
    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "watermark_updated",
      entityType: "settings",
      entityId: WATERMARK_SETTING_KEY,
      details: clean,
      ipAddress: getClientIp(request),
    });
    return Response.json({ ok: true, ...clean });
  } catch (err) {
    console.error("PUT /api/watermark error:", err);
    return Response.json({ error: "Failed to save watermark settings" }, { status: 500 });
  }
}
