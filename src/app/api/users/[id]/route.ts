import { NextRequest } from "next/server";
import { z } from "zod";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth, hashPassword } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";

const updateUserSchema = z.object({
  fullName: z.string().min(2).max(140).optional(),
  fullNameAr: z.string().max(140).nullable().optional(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth("*");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const targetId = Number(id);
    if (!targetId || Number.isNaN(targetId)) {
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Validation failed" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
    if (parsed.data.fullNameAr !== undefined) updates.fullNameAr = parsed.data.fullNameAr;
    if (parsed.data.roleId !== undefined) updates.roleId = parsed.data.roleId;
    if (parsed.data.isActive !== undefined) {
      if (targetId === user!.id && !parsed.data.isActive) {
        return Response.json(
          { error: "You cannot deactivate your own active session account." },
          { status: 400 }
        );
      }
      updates.isActive = parsed.data.isActive;
    }
    if (parsed.data.password) {
      updates.passwordHash = await hashPassword(parsed.data.password);
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, targetId))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        roleId: users.roleId,
        isActive: users.isActive,
      });

    if (!updated) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "user_updated",
      entityType: "user",
      entityId: targetId,
      details: { roleId: updated.roleId, isActive: updated.isActive },
      ipAddress: getClientIp(request),
    });

    return Response.json({ user: updated });
  } catch (err) {
    console.error("PATCH /api/users/[id] error:", err);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth("*");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const targetId = Number(id);
    if (targetId === user!.id) {
      return Response.json(
        { error: "Cannot delete your own logged-in account." },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, targetId))
      .returning({ id: users.id, email: users.email });

    if (!deleted) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "user_deleted",
      entityType: "user",
      entityId: targetId,
      details: { email: deleted.email },
      ipAddress: getClientIp(request),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
