import { NextRequest } from "next/server";
import { z } from "zod";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, logActivity } from "@/lib/audit";
import { getSecurity, saveSecurity, hashToken } from "@/lib/security";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(20).max(200),
  password: z.string().min(10).max(200),
});

const BAD = "This reset link is invalid or has expired. Request a new one.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`reset:${ip}`, 10, 15 * 60_000);
    if (!rl.allowed) {
      return Response.json({ error: "Too many attempts." }, { status: 429 });
    }
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return Response.json(
        { error: "Use a password of at least 10 characters." },
        { status: 400 }
      );
    }
    const email = parsed.data.email.trim().toLowerCase();
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = rows[0];
    if (!user) return Response.json({ error: BAD }, { status: 400 });

    const sec = await getSecurity(user.id);
    const given = Buffer.from(hashToken(parsed.data.token));
    const stored = Buffer.from(sec.resetHash || "");
    const match =
      stored.length === given.length &&
      crypto.timingSafeEqual(stored, given) &&
      !!sec.resetExpires &&
      sec.resetExpires > Date.now();
    if (!match) return Response.json({ error: BAD }, { status: 400 });

    await db
      .update(users)
      .set({
        passwordHash: await hashPassword(parsed.data.password),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    await saveSecurity(user.id, {
      ...sec,
      resetHash: null,
      resetExpires: null,
      failedAttempts: 0,
      lockedUntil: null,
    });
    await logActivity({
      userId: user.id,
      userEmail: email,
      action: "password_reset_completed",
      entityType: "auth",
      entityId: user.id,
      ipAddress: ip,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return Response.json({ error: "Could not reset the password." }, { status: 500 });
  }
}
