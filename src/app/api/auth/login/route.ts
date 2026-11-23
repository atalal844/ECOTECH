import { NextRequest } from "next/server";
import { z } from "zod";
import { db, users, userRoles } from "@/db";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { ensureDatabaseSeeded } from "@/db/seed";
import {
  getSecurity,
  saveSecurity,
  isLocked,
  withFailure,
  clearFailures,
  checkTotp,
} from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  code: z.string().max(12).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseSeeded();
    const ip = getClientIp(request);
    const rl = checkRateLimit(`login:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return Response.json(
        { error: "Too many login attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Please provide a valid email and password." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        fullName: users.fullName,
        fullNameAr: users.fullNameAr,
        roleId: users.roleId,
        isActive: users.isActive,
        roleSlug: userRoles.slug,
        roleName: userRoles.name,
        permissions: userRoles.permissions,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.roleId, userRoles.id))
      .where(eq(users.email, email))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    if (!user.isActive) {
      return Response.json(
        { error: "This administrator account has been deactivated." },
        { status: 403 }
      );
    }

    let sec = await getSecurity(user.id);
    const lockedMinutes = isLocked(sec);
    if (lockedMinutes) {
      return Response.json(
        {
          error: `Too many failed attempts. This account is locked for about ${lockedMinutes} more minute(s). You can also reset the password by email.`,
        },
        { status: 423 }
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      sec = withFailure(sec);
      await saveSecurity(user.id, sec);
      if (sec.lockedUntil) {
        await logActivity({
          userId: user.id,
          userEmail: email,
          action: "account_locked",
          entityType: "auth",
          entityId: user.id,
          ipAddress: ip,
        });
      }
      await logActivity({
        userEmail: email,
        action: "login_failed",
        entityType: "auth",
        ipAddress: ip,
      });
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (sec.totpEnabled && sec.totpSecret) {
      if (!parsed.data.code) {
        return Response.json({ requires2fa: true });
      }
      const step = checkTotp(sec.totpSecret, parsed.data.code);
      if (step === null || step === sec.lastTotpStep) {
        sec = withFailure(sec);
        await saveSecurity(user.id, sec);
        return Response.json(
          { error: "Invalid verification code.", requires2fa: true },
          { status: 401 }
        );
      }
      sec = { ...sec, lastTotpStep: step };
    }
    await saveSecurity(user.id, clearFailures(sec));

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      roleSlug: user.roleSlug,
    });
    await setSessionCookie(token);

    await logActivity({
      userId: user.id,
      userEmail: user.email,
      userRole: user.roleSlug,
      action: "login_success",
      entityType: "auth",
      entityId: user.id,
      ipAddress: ip,
    });

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        fullNameAr: user.fullNameAr,
        roleSlug: user.roleSlug,
        roleName: user.roleName,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json(
      { error: "Authentication service error." },
      { status: 500 }
    );
  }
}
