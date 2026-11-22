import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, users, userRoles } from "@/db";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "ecotech_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
  const envSecret =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    crypto
      .createHash("sha256")
      .update(`ecotech-secure-session-${process.env.DATABASE_URL || "local"}`)
      .digest("hex");
  return new TextEncoder().encode(envSecret);
}

export type RoleSlug = "super_admin" | "admin" | "editor" | "sales_manager";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  fullNameAr: string | null;
  roleId: number;
  roleSlug: RoleSlug;
  roleName: string;
  permissions: string[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: {
  id: number;
  email: string;
  roleSlug: string;
}): Promise<string> {
  return new SignJWT({
    sub: String(user.id),
    email: user.email,
    role: user.roleSlug,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = Number(payload.sub);
    if (!userId || Number.isNaN(userId)) return null;

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
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
      .where(eq(users.id, userId))
      .limit(1);

    const row = rows[0];
    if (!row || !row.isActive) return null;

    return {
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      fullNameAr: row.fullNameAr,
      roleId: row.roleId,
      roleSlug: row.roleSlug as RoleSlug,
      roleName: row.roleName,
      permissions: Array.isArray(row.permissions) ? row.permissions : [],
    };
  } catch {
    return null;
  }
}

export function hasPermission(user: AuthUser | null, required: string): boolean {
  if (!user) return false;
  if (user.roleSlug === "super_admin" || user.permissions.includes("*")) {
    return true;
  }
  if (user.permissions.includes(required)) return true;

  const [domain] = required.split(".");
  if (domain && user.permissions.includes(`${domain}.*`)) {
    return true;
  }
  return false;
}

export async function requireAuth(requiredPermission?: string): Promise<{
  user: AuthUser | null;
  errorResponse: Response | null;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      errorResponse: Response.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return {
      user: null,
      errorResponse: Response.json(
        { error: "Insufficient permissions for this action" },
        { status: 403 }
      ),
    };
  }
  return { user, errorResponse: null };
}

export function isAdminRole(user: AuthUser | null): boolean {
  return !!user && (user.roleSlug === "super_admin" || user.roleSlug === "admin");
}

/**
 * Like requireAuth, but only Admin and Super Admin pass. Used for deleting
 * content, site-wide settings and the audit log. Editors and Sales Managers
 * are refused on the server, whatever the screen shows.
 */
export async function requireAdmin(requiredPermission?: string): Promise<{
  user: AuthUser | null;
  errorResponse: Response | null;
}> {
  const res = await requireAuth(requiredPermission);
  if (res.errorResponse) return res;
  if (!isAdminRole(res.user)) {
    return {
      user: null,
      errorResponse: Response.json(
        { error: "Only an Admin or Super Admin can do this." },
        { status: 403 }
      ),
    };
  }
  return res;
}
