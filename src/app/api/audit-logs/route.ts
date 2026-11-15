import { db, activityLogs } from "@/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { errorResponse } = await requireAuth("dashboard.view");
    if (errorResponse) return errorResponse;

    const logs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);

    return Response.json({ logs });
  } catch (err) {
    console.error("GET /api/audit-logs error:", err);
    return Response.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
