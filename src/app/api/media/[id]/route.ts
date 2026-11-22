import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { db, mediaLibrary } from "@/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import {
  UPLOAD_ROOT,
  getMediaUsage,
  sanitizeFolder,
  validateUpload,
  saveBufferToStorage,
} from "@/lib/storage";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth("media.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const mediaId = Number(id);
    if (!mediaId || Number.isNaN(mediaId)) {
      return Response.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.id, mediaId))
      .limit(1);

    if (!existing) {
      return Response.json({ error: "Media file not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Replace file content while preserving URL or updating safely
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return Response.json({ error: "Replacement file is required" }, { status: 400 });
      }
      const check = validateUpload(file.name, file.type, file.size);
      if (!check.valid) {
        return Response.json({ error: check.error }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const saved = await saveBufferToStorage({
        buffer,
        originalName: file.name,
        folder: existing.folder,
      });
      const oldFullPath = path.resolve(UPLOAD_ROOT, existing.storagePath);
      if (oldFullPath.startsWith(UPLOAD_ROOT + path.sep)) {
        await fs.unlink(oldFullPath).catch(() => {});
      }

      const [updated] = await db
        .update(mediaLibrary)
        .set({
          fileName: saved.fileName,
          originalName: file.name,
          mimeType: check.mimeType,
          extension: check.extension,
          fileSize: file.size,
          storagePath: saved.storagePath,
          publicUrl: `/api/files/${existing.folder}/${saved.fileName}`,
          isLegacyArchive: check.isLegacyArchive,
          updatedAt: new Date(),
        })
        .where(eq(mediaLibrary.id, mediaId))
        .returning();

      await logActivity({
        userId: user!.id,
        userEmail: user!.email,
        userRole: user!.roleSlug,
        action: "media_replaced",
        entityType: "media",
        entityId: mediaId,
        details: { originalName: file.name },
        ipAddress: getClientIp(request),
      });

      return Response.json({ media: updated });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.originalName === "string" && body.originalName.trim()) {
      updates.originalName = body.originalName.trim();
    }
    if (typeof body.folder === "string" && body.folder.trim()) {
      updates.folder = sanitizeFolder(body.folder);
    }
    if (body.altEn !== undefined) updates.altEn = body.altEn;
    if (body.altAr !== undefined) updates.altAr = body.altAr;
    if (body.captionEn !== undefined) updates.captionEn = body.captionEn;
    if (body.captionAr !== undefined) updates.captionAr = body.captionAr;

    const [updated] = await db
      .update(mediaLibrary)
      .set(updates)
      .where(eq(mediaLibrary.id, mediaId))
      .returning();

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "media_updated",
      entityType: "media",
      entityId: mediaId,
      details: updates,
      ipAddress: getClientIp(request),
    });

    return Response.json({ media: updated });
  } catch (err) {
    console.error("PATCH /api/media/[id] error:", err);
    return Response.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAdmin("media.write");
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const mediaId = Number(id);
    if (!mediaId || Number.isNaN(mediaId)) {
      return Response.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const usage = await getMediaUsage(mediaId);
    if (!usage.exists) {
      return Response.json({ error: "Media file not found" }, { status: 404 });
    }

    if (usage.usedBy.length > 0) {
      return Response.json(
        {
          error: `Cannot delete file because it is currently used by: ${usage.usedBy.join("; ")}. Unlink it first.`,
          usedBy: usage.usedBy,
        },
        { status: 409 }
      );
    }

    const fullPath = path.resolve(UPLOAD_ROOT, usage.media.storagePath);
    if (fullPath.startsWith(UPLOAD_ROOT + path.sep)) {
      await fs.unlink(fullPath).catch(() => {});
    }

    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, mediaId));

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "media_deleted",
      entityType: "media",
      entityId: mediaId,
      details: { originalName: usage.media.originalName },
      ipAddress: getClientIp(request),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/media/[id] error:", err);
    return Response.json({ error: "Failed to delete media file" }, { status: 500 });
  }
}
