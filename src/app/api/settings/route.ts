import { NextRequest } from "next/server";
import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { ensureCmsSeeded } from "@/db/seed-cms";

export async function GET() {
  try {
    await ensureCmsSeeded();
    const rows = await db.select().from(companySettings);
    return Response.json({ settings: rows });
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return Response.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("homepage.write");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.items)) {
      return Response.json({ error: "items array is required" }, { status: 400 });
    }

    for (const item of body.items) {
      if (!item.key) continue;
      const existing = await db
        .select()
        .from(companySettings)
        .where(eq(companySettings.key, item.key))
        .limit(1);

      if (existing[0]) {
        await db
          .update(companySettings)
          .set({
            valueEn: item.valueEn ?? existing[0].valueEn,
            valueAr: item.valueAr ?? existing[0].valueAr,
            valueJson: item.valueJson ?? existing[0].valueJson,
            updatedAt: new Date(),
          })
          .where(eq(companySettings.key, item.key));
      } else {
        await db.insert(companySettings).values({
          key: item.key,
          valueEn: item.valueEn ?? null,
          valueAr: item.valueAr ?? null,
          valueJson: item.valueJson ?? null,
        });
      }
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "company_settings_updated",
      entityType: "settings",
      details: { count: body.items.length },
      ipAddress: getClientIp(request),
    });

    const rows = await db.select().from(companySettings);
    return Response.json({ settings: rows });
  } catch (err) {
    console.error("PATCH /api/settings error:", err);
    return Response.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
