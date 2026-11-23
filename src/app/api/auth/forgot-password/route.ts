import { NextRequest } from "next/server";
import { z } from "zod";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, logActivity } from "@/lib/audit";
import {
  getSecurity,
  saveSecurity,
  newResetToken,
  sendResetEmail,
  RESET_MINUTES,
} from "@/lib/security";

const schema = z.object({ email: z.string().email() });

// Same answer whether or not the account exists, so emails cannot be probed.
const OK = {
  ok: true,
  message:
    "If this email belongs to an administrator account, a reset link has been sent. It is valid for 60 minutes.",
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`forgot:${ip}`, 5, 15 * 60_000);
    if (!rl.allowed) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return Response.json({ error: "Enter a valid email." }, { status: 400 });
    }
    const email = parsed.data.email.trim().toLowerCase();
    const rows = await db
      .select({ id: users.id, isActive: users.isActive })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = rows[0];
    if (user && user.isActive) {
      const { token, hash } = newResetToken();
      const sec = await getSecurity(user.id);
      await saveSecurity(user.id, {
        ...sec,
        resetHash: hash,
        resetExpires: Date.now() + RESET_MINUTES * 60_000,
      });
      const origin = request.nextUrl.origin;
      const link = `${origin}/admin/reset-password?email=${encodeURIComponent(
        email
      )}&token=${token}`;
      await sendResetEmail(email, link);
      await logActivity({
        userId: user.id,
        userEmail: email,
        action: "password_reset_requested",
        entityType: "auth",
        entityId: user.id,
        ipAddress: ip,
      });
    }
    return Response.json(OK);
  } catch (err) {
    console.error("forgot-password error:", err);
    return Response.json(OK);
  }
}
