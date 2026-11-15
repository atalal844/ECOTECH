import { NextRequest } from "next/server";
import { z } from "zod";
import { db, inquiries, inquiryNotes } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";

const updateSchema = z.object({
  status: z
    .enum(["new", "in_progress", "quoted", "completed", "cancelled"])
    .optional(),
  assignedToId: z.number().int().positive().nullable().optional(),
});

const noteSchema = z.object({
  note: z.string().min(2).max(2000),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth("inquiries.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const inqId = Number(id);
    if (!inqId || Number.isNaN(inqId)) {
      return Response.json({ error: "Invalid inquiry ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid update payload" }, { status: 400 });
    }

    const [updated] = await db
      .update(inquiries)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(inquiries.id, inqId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "inquiry_status_updated",
      entityType: "inquiry",
      entityId: inqId,
      details: parsed.data,
      ipAddress: getClientIp(request),
    });

    return Response.json({ inquiry: updated });
  } catch (err) {
    console.error("PATCH /api/inquiries/[id] error:", err);
    return Response.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth("inquiries.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const inqId = Number(id);
    const body = await request.json().catch(() => null);
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Note text is required" }, { status: 400 });
    }

    const [note] = await db
      .insert(inquiryNotes)
      .values({
        inquiryId: inqId,
        authorId: user!.id,
        authorName: user!.fullName,
        note: parsed.data.note.trim(),
      })
      .returning();

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "inquiry_note_added",
      entityType: "inquiry",
      entityId: inqId,
      details: { noteId: note.id },
      ipAddress: getClientIp(request),
    });

    return Response.json({ note }, { status: 201 });
  } catch (err) {
    console.error("POST /api/inquiries/[id] note error:", err);
    return Response.json({ error: "Failed to save note" }, { status: 500 });
  }
}
