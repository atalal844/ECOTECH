import { NextRequest } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (user) {
    await logActivity({
      userId: user.id,
      userEmail: user.email,
      userRole: user.roleSlug,
      action: "logout",
      entityType: "auth",
      entityId: user.id,
      ipAddress: getClientIp(request),
    });
  }
  await clearSessionCookie();
  return Response.json({ ok: true });
}
