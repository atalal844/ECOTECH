import { NextRequest } from "next/server";
import { z } from "zod";
import { db, productDocuments, products } from "@/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/audit";

const attachDocSchema = z.object({
  productId: z.number().int().positive(),
  mediaId: z.number().int().positive().nullable().optional(),
  docType: z.enum([
    "datasheet",
    "manual",
    "diagram",
    "certificate",
    "installation_guide",
    "catalog",
    "legacy_archive",
    "other",
  ]),
  titleEn: z.string().min(2).max(200),
  titleAr: z.string().min(2).max(200),
  fileUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative().default(0),
  mimeType: z.string().default("application/pdf"),
  isLegacyArchive: z.boolean().default(false),
});

export async function GET() {
  try {
    const { errorResponse } = await requireAuth("documents.read");
    if (errorResponse) return errorResponse;

    const rows = await db
      .select({
        id: productDocuments.id,
        productId: productDocuments.productId,
        mediaId: productDocuments.mediaId,
        docType: productDocuments.docType,
        titleEn: productDocuments.titleEn,
        titleAr: productDocuments.titleAr,
        fileUrl: productDocuments.fileUrl,
        fileName: productDocuments.fileName,
        fileSize: productDocuments.fileSize,
        mimeType: productDocuments.mimeType,
        isLegacyArchive: productDocuments.isLegacyArchive,
        createdAt: productDocuments.createdAt,
        productNameEn: products.nameEn,
        productSku: products.sku,
      })
      .from(productDocuments)
      .innerJoin(products, eq(productDocuments.productId, products.id))
      .orderBy(desc(productDocuments.createdAt));

    return Response.json({ documents: rows });
  } catch (err) {
    console.error("GET /api/documents error:", err);
    return Response.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("documents.write");
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => null);
    const parsed = attachDocSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(productDocuments)
      .values(parsed.data)
      .returning();

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "document_attached",
      entityType: "document",
      entityId: created.id,
      details: { productId: created.productId, docType: created.docType, titleEn: created.titleEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ document: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/documents error:", err);
    return Response.json({ error: "Failed to attach document" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth("documents.write");
    if (errorResponse) return errorResponse;

    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!id || Number.isNaN(id)) {
      return Response.json({ error: "Document ID is required" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(productDocuments)
      .where(eq(productDocuments.id, id))
      .returning();

    if (!deleted) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    await logActivity({
      userId: user!.id,
      userEmail: user!.email,
      userRole: user!.roleSlug,
      action: "document_deleted",
      entityType: "document",
      entityId: id,
      details: { titleEn: deleted.titleEn },
      ipAddress: getClientIp(request),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/documents error:", err);
    return Response.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
