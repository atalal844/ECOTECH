import { NextRequest } from "next/server";
import { z } from "zod";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { getCurrentUser, verifyPassword } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import {
  getSecurity,
  saveSecurity,
  newTotpSecret,
  checkTotp,
  otpauthUri,
} from "@/lib/security";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }),
  z.object({ action: z.literal("confirm"), code: z.string().max(12) }),
  z.object({
    action: z.literal("disable"),
    password: z.string().max(200),
    code: z.string().max(12),
  }),
]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const sec = await getSecurity(user.id);
  return Response.json({ enabled: sec.totpEnabled });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const body = parsed.data;
  let sec = await getSecurity(user.id);
  const ip = getClientIp(request);

  if (body.action === "start") {
    if (sec.totpEnabled) {
      return Response.json(
        { error: "Two-factor sign-in is already on." },
        { status: 400 }
      );
    }
    const secret = newTotpSecret();
    await saveSecurity(user.id, { ...sec, pendingSecret: secret });
    return Response.json({
      secret,
      otpauth: otpauthUri(user.email, secret),
    });
  }

  if (body.action === "confirm") {
    if (!sec.pendingSecret) {
      return Response.json({ error: "Start the setup first." }, { status: 400 });
    }
    const step = checkTotp(sec.pendingSecret, body.code);
    if (step === null) {
      return Response.json({ error: "That code is not correct." }, { status: 400 });
    }
    sec = {
      ...sec,
      totpSecret: sec.pendingSecret,
      totpEnabled: true,
      pendingSecret: null,
      lastTotpStep: step,
    };
    await saveSecurity(user.id, sec);
    await logActivity({
      userId: user.id,
      userEmail: user.email,
      userRole: user.roleSlug,
      action: "2fa_enabled",
      entityType: "auth",
      entityId: user.id,
      ipAddress: ip,
    });
    return Response.json({ enabled: true });
  }

  // disable: needs password and a current code
  const rows = await db
    .select({ hash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const okPw = rows[0] && (await verifyPassword(body.password, rows[0].hash));
  const okCode = sec.totpSecret && checkTotp(sec.totpSecret, body.code) !== null;
  if (!okPw || !okCode) {
    return Response.json(
      { error: "Password or code is not correct." },
      { status: 400 }
    );
  }
  await saveSecurity(user.id, {
    ...sec,
    totpEnabled: false,
    totpSecret: null,
    pendingSecret: null,
  });
  await logActivity({
    userId: user.id,
    userEmail: user.email,
    userRole: user.roleSlug,
    action: "2fa_disabled",
    entityType: "auth",
    entityId: user.id,
    ipAddress: ip,
  });
  return Response.json({ enabled: false });
}
