import { db, activityLogs } from "@/db";

export async function logActivity(params: {
  userId?: number | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    await db.insert(activityLogs).values({
      userId: params.userId ?? null,
      userEmail: params.userEmail ?? null,
      userRole: params.userRole ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId != null ? String(params.entityId) : null,
      details: params.details ?? {},
      ipAddress: params.ipAddress ?? null,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}
