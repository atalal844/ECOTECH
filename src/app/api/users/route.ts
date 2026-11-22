import { NextRequest } from "next/server";
import { z } from "zod";
import { db, users, userRoles } from "@/db";
import { asc, eq } from "drizzle-orm";
import { requireAuth, hashPassword } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(200),
  fullName: z.string().min(2).max(140),
  fullNameAr: z.string().max(140).nullable().optional(),
  roleId: z.number().int().positive(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const { errorResponse } = await requireAuth("*");
    if (errorResponse) return errorResponse;

    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        fullNameAr: users.fullNameAr,
        roleId: users.roleId,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        roleName: userRoles.name,
        roleSlug: userRoles.slug,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.roleId, userRoles.id))
      .orderBy(asc(users.id));

    const roles = await db.select().from(userRoles).orderBy(asc(userRoles.id));

    return Response.json({ users: userList, roles });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return Response.json({ error: "Failed to load users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("*");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = await hashPassword(parsed.data.password);

    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        fullName: parsed.data.fullName.trim(),
        fullNameAr: parsed.data.fullNameAr?.trim() || null,
        roleId: parsed.data.roleId,
        isActive: parsed.data.isActive,
      })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        fullNameAr: users.fullNameAr,
        roleId: users.roleId,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "user_created",
      entityType: "user",
      entityId: created.id,
      details: { email: created.email, roleId: created.roleId },
      ipAddress: getClientIp(request),
    });

    return Response.json({ user: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return Response.json(
      { error: "Failed to create user (email may already exist)" },
      { status: 400 }
    );
  }
}
