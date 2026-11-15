"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Search,
  Trash2,
  Edit3,
  RefreshCw,
  FileText,
  Film,
  Archive,
  CheckCircle2,
  AlertCircle,
  Download,
  FolderOpen,
  X,
} from "lucide-react";

export interface MediaItem {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  extension: string;
  fileSize: number;
  folder: string;
  publicUrl: string;
  altEn: string | null;
  altAr: string | null;
  captionEn: string | null;
  captionAr: string | null;
  isLegacyArchive: boolean;
  usedBy?: string[];
  createdAt: string;
}

export function MediaManager({
  onSelectMedia,
  pickerMode = false,
}: {
  onSelectMedia?: (media: MediaItem) => void;
  pickerMode?: boolean;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [uploadFolder, setUploadFolder] = useState("products");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [editForm, setEditForm] = useState({
    originalName: "",
    folder: "",
    altEn: "",
    altAr: "",
    captionEn: "",
    captionAr: "",
  });

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (folderFilter !== "all") params.set("folder", folderFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/media?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.media || []);
        setFolders(data.folders || []);
      }
    } finally {
      setLoading(false);
    }
  }, [q, folderFilter, typeFilter]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  async function handleFilesUpload(files: FileList | File[]) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("folder", uploadFolder || "general");
      Array.from(files).forEach((f) => formData.append("files", f));

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Upload failed." });
      } else {
        const errMsg =
          data.errors?.length > 0
            ? ` (${data.errors.length} failed: ${data.errors[0].error})`
            : "";
        setFeedback({
          type: "success",
          text: `Uploaded ${data.uploaded?.length || 0} file(s) successfully.${errMsg}`,
        });
        await loadMedia();
      }
    } catch {
      setFeedback({ type: "error", text: "Network error during upload." });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(item: MediaItem) {
    setFeedback(null);
    const res = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Delete blocked." });
    } else {
      setFeedback({ type: "success", text: `Deleted "${item.originalName}".` });
      await loadMedia();
    }
  }

  async function handleReplaceFile(item: MediaItem, file: File) {
    setFeedback(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "File replacement failed." });
    } else {
      setFeedback({ type: "success", text: `Replaced "${item.originalName}".` });
      await loadMedia();
    }
  }

  async function handleSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/media/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Failed to save changes." });
    } else {
      setFeedback({ type: "success", text: "Media metadata updated." });
      setEditing(null);
      await loadMedia();
    }
  }

  const isImage = (ext: string) =>
    ["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext.toLowerCase());

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {feedback.text}
          </span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Multi-File Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.length) {
            handleFilesUpload(e.dataTransfer.files);
          }
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
          dragActive
            ? "border-[#7A1D4B] bg-[#7A1D4B]/5"
            : "border-slate-300 bg-white"
        }`}
      >
        <UploadCloud className="mx-auto mb-2 h-9 w-9 text-[#7A1D4B]" />
        <p className="text-sm font-bold text-slate-900">
          Drag & drop multiple files here, or browse to upload
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Supported: JPG, PNG, WEBP, SVG, GIF, MP4, PDF, DWG, DXF, XLSX, DOCX, ZIP, and legacy SWF (archived download-only)
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
            <FolderOpen className="h-3.5 w-3.5 text-[#F08B22]" />
            <span className="font-semibold text-slate-600">Target Folder:</span>
            <input
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="w-28 bg-transparent font-bold text-slate-900 outline-none"
            />
          </div>

          <label className="cursor-pointer rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-5 py-2 text-xs font-bold text-white shadow hover:opacity-95">
            <span>{uploading ? "Uploading..." : "Select Files"}</span>
            <input
              type="file"
              multiple
              disabled={uploading}
              accept=".jpg,.jpeg,.png,.webp,.svg,.gif,.mp4,.pdf,.dwg,.dxf,.xlsx,.xls,.docx,.doc,.zip,.swf"
              onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search filename, alt text..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-xs outline-none focus:border-[#7A1D4B]"
          />
        </div>
        <select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="all">All Folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              /{f}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="all">All Formats</option>
          <option value="images">Images & GIF / SVG</option>
          <option value="videos">MP4 Videos</option>
          <option value="documents">PDF, CAD, Office, ZIP</option>
          <option value="legacy">Legacy SWF Archives</option>
        </select>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No media files match your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const inUse = (item.usedBy?.length || 0) > 0;
            return (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/10] bg-slate-100 flex items-center justify-center overflow-hidden">
                  {isImage(item.extension) ? (
                    <img
                      src={item.publicUrl}
                      alt={item.altEn || item.originalName}
                      className="h-full w-full object-cover"
                    />
                  ) : item.extension === "mp4" ? (
                    <div className="flex flex-col items-center text-slate-600">
                      <Film className="h-8 w-8 text-[#7A1D4B]" />
                      <span className="mt-1 text-[11px] font-bold">MP4 VIDEO</span>
                    </div>
                  ) : item.isLegacyArchive || item.extension === "swf" ? (
                    <div className="flex flex-col items-center text-amber-700">
                      <Archive className="h-8 w-8" />
                      <span className="mt-1 text-[11px] font-bold">LEGACY SWF ARCHIVE</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#250C52]">
                      <FileText className="h-8 w-8" />
                      <span className="mt-1 text-[11px] font-bold uppercase">
                        {item.extension}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-2 start-2 rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    /{item.folder}
                  </span>
                  {inUse && (
                    <span className="absolute top-2 end-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      IN USE
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3.5 text-xs">
                  <div className="truncate font-bold text-slate-900" title={item.originalName}>
                    {item.originalName}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    .{item.extension} • {Math.max(1, Math.round(item.fileSize / 1024))} KB
                  </div>
                  {inUse && (
                    <div className="mt-1.5 truncate text-[10px] font-medium text-emerald-700" title={item.usedBy?.join(", ")}>
                      Used by: {item.usedBy?.join(", ")}
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                    {pickerMode && onSelectMedia ? (
                      <button
                        type="button"
                        onClick={() => onSelectMedia(item)}
                        className="w-full rounded-lg bg-[#250C52] py-1.5 text-xs font-bold text-white hover:bg-[#7A1D4B]"
                      >
                        Select File
                      </button>
                    ) : (
                      <>
                        <a
                          href={`${item.publicUrl}?download=1`}
                          download={item.originalName}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setEditForm({
                              originalName: item.originalName,
                              folder: item.folder,
                              altEn: item.altEn || "",
                              altAr: item.altAr || "",
                              captionEn: item.captionEn || "",
                              captionAr: item.captionAr || "",
                            });
                          }}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                          title="Edit metadata / rename"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <label
                          className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                          title="Replace file"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleReplaceFile(item, f);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="ms-auto rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={handleSaveMeta}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950">
                Edit Media File Metadata
              </h3>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Display / File Name
                </label>
                <input
                  value={editForm.originalName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, originalName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Folder
                </label>
                <input
                  value={editForm.folder}
                  onChange={(e) =>
                    setEditForm({ ...editForm, folder: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ALT Text (English)
                </label>
                <input
                  value={editForm.altEn}
                  onChange={(e) =>
                    setEditForm({ ...editForm, altEn: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  ALT Text (Arabic)
                </label>
                <input
                  dir="rtl"
                  value={editForm.altAr}
                  onChange={(e) =>
                    setEditForm({ ...editForm, altAr: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Caption (English)
                </label>
                <input
                  value={editForm.captionEn}
                  onChange={(e) =>
                    setEditForm({ ...editForm, captionEn: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Caption (Arabic)
                </label>
                <input
                  dir="rtl"
                  value={editForm.captionAr}
                  onChange={(e) =>
                    setEditForm({ ...editForm, captionAr: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#250C52] px-5 py-2 text-xs font-bold text-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
