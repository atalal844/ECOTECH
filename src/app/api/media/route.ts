import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { db, mediaLibrary } from "@/db";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";
import {
  validateUpload,
  sanitizeFolder,
  getMediaUsage,
} from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAuth("media.read");
    if (errorResponse) return errorResponse;

    const sp = request.nextUrl.searchParams;
    const q = sp.get("q")?.trim() || "";
    const folder = sp.get("folder")?.trim() || "";
    const typeFilter = sp.get("type")?.trim() || ""; // images | videos | documents | legacy

    const conditions = [];
    if (folder && folder !== "all") {
      conditions.push(eq(mediaLibrary.folder, folder));
    }
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        or(
          ilike(mediaLibrary.originalName, pattern),
          ilike(mediaLibrary.fileName, pattern),
          ilike(mediaLibrary.altEn, pattern),
          ilike(mediaLibrary.altAr, pattern)
        )
      );
    }

    let items = await db
      .select()
      .from(mediaLibrary)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(mediaLibrary.createdAt));

    if (typeFilter === "images") {
      items = items.filter((m) =>
        ["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(m.extension)
      );
    } else if (typeFilter === "videos") {
      items = items.filter((m) => m.extension === "mp4");
    } else if (typeFilter === "documents") {
      items = items.filter((m) =>
        ["pdf", "dwg", "dxf", "xlsx", "xls", "docx", "doc", "zip"].includes(
          m.extension
        )
      );
    } else if (typeFilter === "legacy") {
      items = items.filter((m) => m.isLegacyArchive || m.extension === "swf");
    }

    const withUsage = await Promise.all(
      items.map(async (item) => {
        const usage = await getMediaUsage(item.id);
        return {
          ...item,
          usedBy: usage.exists ? usage.usedBy : [],
        };
      })
    );

    const foldersRows = await db
      .selectDistinct({ folder: mediaLibrary.folder })
      .from(mediaLibrary);

    return Response.json({
      media: withUsage,
      folders: foldersRows.map((f) => f.folder),
    });
  } catch (err) {
    console.error("GET /api/media error:", err);
    return Response.json({ error: "Failed to load media library" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("media.write");
    if (errorResponse) return errorResponse;

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const uploadFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (uploadFiles.length === 0) {
      return Response.json(
        { error: "No files were provided for upload." },
        { status: 400 }
      );
    }

    const folder = sanitizeFolder(formData.get("folder")?.toString() || "general");
    const altEn = formData.get("altEn")?.toString() || null;
    const altAr = formData.get("altAr")?.toString() || null;
    const captionEn = formData.get("captionEn")?.toString() || null;
    const captionAr = formData.get("captionAr")?.toString() || null;

    const uploaded = [];
    const errors = [];

    for (const file of uploadFiles) {
      if (!(file instanceof File)) continue;
      const check = validateUpload(file.name, file.type, file.size);
      if (!check.valid) {
        errors.push({ fileName: file.name, error: check.error });
        continue;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await put(`${folder}/${safeName}`, file, {
        access: "public",
        addRandomSuffix: true,
      });

      const storedFileName = blob.pathname.split("/").pop() || safeName;

      const [record] = await db
        .insert(mediaLibrary)
        .values({
          fileName: storedFileName,
          originalName: file.name,
          mimeType: check.mimeType,
          extension: check.extension,
          fileSize: file.size,
          folder,
          storagePath: blob.pathname,
          publicUrl: blob.url,
          altEn: altEn || file.name,
          altAr: altAr || file.name,
          captionEn,
          captionAr,
          isLegacyArchive: check.isLegacyArchive,
          uploadedById: user!.id,
        })
        .returning();

      uploaded.push(record);
    }

    if (uploaded.length === 0 && errors.length > 0) {
      return Response.json(
        { error: errors[0].error, errors },
        { status: 400 }
      );
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "media_uploaded",
      entityType: "media",
      entityId: uploaded.map((u) => u.id).join(","),
      details: { count: uploaded.length, folder, files: uploaded.map((u) => u.originalName) },
      ipAddress: getClientIp(request),
    });

    return Response.json({ uploaded, errors }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/media error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: `Upload error: ${message}` }, { status: 500 });
  }
}