$code = @'
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import {
  db,
  mediaLibrary,
  productImages,
  productDocuments,
  productCategories,
  homepageSections,
} from "@/db";
import { eq, or } from "drizzle-orm";

export const UPLOAD_ROOT = path.resolve(process.cwd(), "storage", "uploads");

export const ALLOWED_EXTENSIONS: Record<
  string,
  { mimes: string[]; maxBytes: number; legacyArchive?: boolean }
> = {
  jpg: { mimes: ["image/jpeg"], maxBytes: 15 * 1024 * 1024 },
  jpeg: { mimes: ["image/jpeg"], maxBytes: 15 * 1024 * 1024 },
  png: { mimes: ["image/png"], maxBytes: 15 * 1024 * 1024 },
  webp: { mimes: ["image/webp"], maxBytes: 15 * 1024 * 1024 },
  svg: { mimes: ["image/svg+xml", "text/xml", "application/xml"], maxBytes: 5 * 1024 * 1024 },
  gif: { mimes: ["image/gif"], maxBytes: 25 * 1024 * 1024 },
  mp4: { mimes: ["video/mp4"], maxBytes: 100 * 1024 * 1024 },
  pdf: { mimes: ["application/pdf"], maxBytes: 50 * 1024 * 1024 },
  dwg: {
    mimes: ["application/acad", "application/x-acad", "application/octet-stream", "image/vnd.dwg"],
    maxBytes: 50 * 1024 * 1024,
  },
  dxf: {
    mimes: ["application/dxf", "image/vnd.dxf", "application/octet-stream", "text/plain"],
    maxBytes: 50 * 1024 * 1024,
  },
  xlsx: {
    mimes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
    ],
    maxBytes: 30 * 1024 * 1024,
  },
  xls: {
    mimes: ["application/vnd.ms-excel", "application/octet-stream"],
    maxBytes: 30 * 1024 * 1024,
  },
  docx: {
    mimes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ],
    maxBytes: 30 * 1024 * 1024,
  },
  doc: {
    mimes: ["application/msword", "application/octet-stream"],
    maxBytes: 30 * 1024 * 1024,
  },
  zip: {
    mimes: ["application/zip", "application/x-zip-compressed", "application/octet-stream"],
    maxBytes: 100 * 1024 * 1024,
  },
  swf: {
    mimes: ["application/x-shockwave-flash", "application/octet-stream"],
    maxBytes: 50 * 1024 * 1024,
    legacyArchive: true,
  },
};

export function sanitizeFolder(folder?: string | null): string {
  const clean = (folder || "general")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return clean || "general";
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateUpload(fileName: string, mimeType: string, size: number) {
  const ext = path.extname(fileName).replace(".", "").toLowerCase();
  const rule = ALLOWED_EXTENSIONS[ext];
  if (!rule) {
    return {
      valid: false as const,
      error: `Unsupported file extension ".${ext}". Allowed: ${Object.keys(ALLOWED_EXTENSIONS).join(", ")}`,
    };
  }
  if (size <= 0) {
    return { valid: false as const, error: "File is empty." };
  }
  if (size > rule.maxBytes) {
    return {
      valid: false as const,
      error: `File exceeds maximum size of ${Math.round(rule.maxBytes / (1024 * 1024))} MB for .${ext} files.`,
    };
  }
  const cleanMime = (mimeType || "application/octet-stream").toLowerCase().split(";")[0].trim();
  if (
    cleanMime !== "application/octet-stream" &&
    !rule.mimes.includes(cleanMime)
  ) {
    return {
      valid: false as const,
      error: `Invalid MIME type "${cleanMime}" for .${ext} file.`,
    };
  }
  return {
    valid: true as const,
    extension: ext,
    mimeType: cleanMime || rule.mimes[0],
    isLegacyArchive: Boolean(rule.legacyArchive),
  };
}

export async function saveBufferToStorage(params: {
  buffer: Buffer;
  originalName: string;
  folder: string;
  contentType?: string;
}) {
  const folder = sanitizeFolder(params.folder);
  const ext = path.extname(params.originalName).toLowerCase();
  const base = sanitizeFileName(path.basename(params.originalName, ext)).slice(0, 60);
  const uniqueSuffix = crypto.randomBytes(6).toString("hex");
  const fileName = `${base}-${uniqueSuffix}${ext}`;
  const blobPath = `${folder}/${fileName}`;

  const blob = await put(blobPath, params.buffer, {
    access: "public",
    contentType: params.contentType,
  });

  return {
    fileName,
    storagePath: blob.pathname,
    fullPath: blob.url,
    publicUrl: blob.url,
  };
}

export async function getMediaUsage(mediaId: number) {
  const mediaRows = await db
    .select()
    .from(mediaLibrary)
    .where(eq(mediaLibrary.id, mediaId))
    .limit(1);
  const media = mediaRows[0];
  if (!media) return { exists: false as const, usedBy: [] as string[] };

  const usedBy: string[] = [];

  const imgRefs = await db
    .select({ productId: productImages.productId })
    .from(productImages)
    .where(or(eq(productImages.mediaId, mediaId), eq(productImages.url, media.publicUrl)));
  if (imgRefs.length > 0) {
    usedBy.push(`${imgRefs.length} product image(s)`);
  }

  const docRefs = await db
    .select({ productId: productDocuments.productId })
    .from(productDocuments)
    .where(
      or(
        eq(productDocuments.mediaId, mediaId),
        eq(productDocuments.fileUrl, media.publicUrl)
      )
    );
  if (docRefs.length > 0) {
    usedBy.push(`${docRefs.length} product document(s)`);
  }

  const catRefs = await db
    .select({ id: productCategories.id, nameEn: productCategories.nameEn })
    .from(productCategories)
    .where(
      or(
        eq(productCategories.imageMediaId, mediaId),
        eq(productCategories.bannerMediaId, mediaId),
        eq(productCategories.catalogMediaId, mediaId),
        eq(productCategories.imageUrl, media.publicUrl),
        eq(productCategories.bannerUrl, media.publicUrl),
        eq(productCategories.catalogUrl, media.publicUrl)
      )
    );
  if (catRefs.length > 0) {
    usedBy.push(`Categories: ${catRefs.map((c) => c.nameEn).join(", ")}`);
  }

  const heroRefs = await db
    .select({ sectionKey: homepageSections.sectionKey })
    .from(homepageSections)
    .where(eq(homepageSections.heroMediaUrl, media.publicUrl));
  if (heroRefs.length > 0) {
    usedBy.push(`Homepage sections: ${heroRefs.map((h) => h.sectionKey).join(", ")}`);
  }

  return { exists: true as const, media, usedBy };
}
'@
[System.IO.File]::WriteAllText("$PWD\src\lib\storage.ts", $code, (New-Object System.Text.UTF8Encoding $false))