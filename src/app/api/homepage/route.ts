import { NextRequest } from "next/server";
import { db, homepageSections } from "@/db";
import { asc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { ensureDatabaseSeeded } from "@/db/seed";

export async function GET() {
  try {
    await ensureDatabaseSeeded();
    const sections = await db
      .select()
      .from(homepageSections)
      .orderBy(asc(homepageSections.displayOrder));
    return Response.json({ sections });
  } catch (err) {
    console.error("GET /api/homepage error:", err);
    return Response.json({ error: "Failed to load homepage sections" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("homepage.write");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    if (!body || typeof body.sectionKey !== "string") {
      return Response.json({ error: "sectionKey is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const allowedFields = [
      "titleEn",
      "titleAr",
      "subtitleEn",
      "subtitleAr",
      "ctaPrimaryLabelEn",
      "ctaPrimaryLabelAr",
      "ctaPrimaryHref",
      "ctaSecondaryLabelEn",
      "ctaSecondaryLabelAr",
      "ctaSecondaryHref",
      "heroMediaUrl",
      "payload",
      "displayOrder",
      "isVisible",
    ];
    for (const f of allowedFields) {
      if (f in body) updates[f] = body[f];
    }

    const [updated] = await db
      .update(homepageSections)
      .set(updates)
      .where(eq(homepageSections.sectionKey, body.sectionKey))
      .returning();

    if (!updated) {
      return Response.json({ error: "Section not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "homepage_section_updated",
      entityType: "homepage_section",
      entityId: updated.sectionKey,
      details: { titleEn: updated.titleEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ section: updated });
  } catch (err) {
    console.error("PATCH /api/homepage error:", err);
    return Response.json({ error: "Failed to update homepage section" }, { status: 500 });
  }
}
