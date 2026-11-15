import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { UPLOAD_ROOT } from "@/lib/storage";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
  mp4: "video/mp4",
  pdf: "application/pdf",
  dwg: "application/acad",
  dxf: "application/dxf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  zip: "application/zip",
  swf: "application/octet-stream",
};

const FORCE_DOWNLOAD_EXTS = new Set([
  "swf",
  "zip",
  "dwg",
  "dxf",
  "xlsx",
  "xls",
  "docx",
  "doc",
]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ segments: string[] }> }
) {
  try {
    const { segments } = await context.params;
    if (!segments || segments.length === 0) {
      return new Response("Not found", { status: 404 });
    }

    const joined = segments.join("/");
    const resolved = path.resolve(UPLOAD_ROOT, joined);
    if (!resolved.startsWith(UPLOAD_ROOT + path.sep)) {
      return new Response("Forbidden", { status: 403 });
    }

    const stat = await fs.stat(resolved).catch(() => null);
    if (!stat || !stat.isFile()) {
      return new Response("File not found", { status: 404 });
    }

    const data = await fs.readFile(resolved);
    const ext = path.extname(resolved).replace(".", "").toLowerCase();
    const fileName = path.basename(resolved);
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    const forceDownload =
      request.nextUrl.searchParams.get("download") === "1" ||
      FORCE_DOWNLOAD_EXTS.has(ext);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", String(data.length));
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "public, max-age=86400");
    headers.set(
      "Content-Disposition",
      `${forceDownload ? "attachment" : "inline"}; filename="${fileName.replace(/"/g, "")}"`
    );

    return new Response(data, { status: 200, headers });
  } catch (err) {
    console.error("File delivery error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
