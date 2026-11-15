"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ZoomIn,
  X,
  RotateCw,
  Share2,
  Check,
  FileDown,
  FileText,
  Archive,
  Play,
  PhoneCall,
  Send,
} from "lucide-react";
import { UI_LABELS, pickText, type Lang } from "@/lib/i18n";

export interface GalleryMediaItem {
  id: number;
  url: string;
  mediaType: string;
  altEn: string | null;
  altAr: string | null;
  captionEn: string | null;
  captionAr: string | null;
  isPrimary: boolean;
  is360Frame: boolean;
}

export interface ProductDocItem {
  id: number;
  docType: string;
  titleEn: string;
  titleAr: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  isLegacyArchive: boolean;
}

export function ProductGalleryViewer({
  lang,
  productName,
  images,
  has360View,
}: {
  lang: Lang;
  productName: string;
  images: GalleryMediaItem[];
  has360View: boolean;
}) {
  const t = UI_LABELS[lang];
  const fallbackList: GalleryMediaItem[] =
    images.length > 0
      ? images
      : [
          {
            id: 0,
            url: "/images/cat-racks.jpg",
            mediaType: "image",
            altEn: productName,
            altAr: productName,
            captionEn: null,
            captionAr: null,
            isPrimary: true,
            is360Frame: false,
          },
        ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [view360Open, setView360Open] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const active = fallbackList[activeIdx] || fallbackList[0];
  const isVideo =
    active.mediaType === "video" || active.url.toLowerCase().endsWith(".mp4");

  const frames360 = fallbackList.filter((i) => i.is360Frame && i.mediaType !== "video");
  const active360List = frames360.length > 0 ? frames360 : fallbackList;
  const frame360Idx =
    Math.floor(((rotationAngle % 360) / 360) * active360List.length) %
    active360List.length;

  return (
    <div className="space-y-3">
      {/* Main Display Container */}
      <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        {view360Open ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={active360List[frame360Idx]?.url || active.url}
              alt={productName}
              style={{
                transform: `perspective(1200px) rotateY(${((rotationAngle % 360) - 180) * 0.08}deg)`,
              }}
              className="h-full w-full object-cover transition-transform duration-150"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
              <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[#250C52]">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 text-[#F08B22]" />
                  {t.degree360}
                </span>
                <span>{rotationAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-full accent-[#7A1D4B]"
              />
            </div>
          </div>
        ) : isVideo ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950">
            <video
              src={active.url}
              controls
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100"
          >
            <img
              src={active.url}
              alt={pickText(lang, active.altEn, active.altAr) || productName}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <ZoomIn className="h-3.5 w-3.5 text-[#F28E20]" />
              <span>{t.zoomHint}</span>
            </span>
          </button>
        )}

        {(has360View || frames360.length > 0) && (
          <button
            type="button"
            onClick={() => setView360Open((v) => !v)}
            className={`absolute top-5 start-5 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow transition ${
              view360Open
                ? "bg-[#250C52] text-white"
                : "border border-slate-200 bg-white/95 text-[#250C52] hover:bg-white"
            }`}
          >
            <RotateCw className="h-3.5 w-3.5 text-[#F08B22]" />
            <span>{t.degree360}</span>
          </button>
        )}
      </div>

      {/* Thumbnails Row */}
      {fallbackList.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {fallbackList.map((img, idx) => {
            const vid =
              img.mediaType === "video" ||
              img.url.toLowerCase().endsWith(".mp4");
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => {
                  setView360Open(false);
                  setActiveIdx(idx);
                }}
                className={`relative h-16 w-20 overflow-hidden rounded-xl border-2 bg-white transition ${
                  idx === activeIdx && !view360Open
                    ? "border-[#7A1D4B] ring-2 ring-[#7A1D4B]/20"
                    : "border-slate-200 opacity-80 hover:opacity-100"
                }`}
              >
                {vid ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
                    <Play className="h-5 w-5 text-[#F08B22]" />
                  </div>
                ) : (
                  <img
                    src={img.url}
                    alt={pickText(lang, img.altEn, img.altAr) || productName}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {zoomOpen && !isVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setZoomOpen(false)}
            className="absolute top-5 end-5 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={active.url}
            alt={productName}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export function ProductActionButtons({
  lang,
  productId,
  productName,
}: {
  lang: Lang;
  productId: number;
  productName: string;
}) {
  const t = UI_LABELS[lang];
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/contact?type=quote&productId=${productId}&productName=${encodeURIComponent(
          productName
        )}`}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-95"
      >
        <Send className="h-4 w-4" />
        <span>{t.requestQuote}</span>
      </Link>

      <Link
        href={`/contact?type=sales&productId=${productId}&productName=${encodeURIComponent(
          productName
        )}`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:border-[#250C52] hover:text-[#250C52]"
      >
        <PhoneCall className="h-4 w-4 text-[#7A1D4B]" />
        <span>{t.contactSales}</span>
      </Link>

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700">{t.copiedLink}</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 text-slate-500" />
            <span>{t.shareProduct}</span>
          </>
        )}
      </button>
    </div>
  );
}

export function ProductDocumentsList({
  lang,
  documents,
}: {
  lang: Lang;
  documents: ProductDocItem[];
}) {
  const t = UI_LABELS[lang];
  if (documents.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {documents.map((doc) => {
        const isLegacy =
          doc.isLegacyArchive ||
          doc.fileName.toLowerCase().endsWith(".swf");
        const downloadHref = doc.fileUrl.includes("/api/files/")
          ? `${doc.fileUrl}?download=1`
          : doc.fileUrl;

        return (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isLegacy
                    ? "bg-amber-50 text-amber-700"
                    : "bg-[#250C52]/10 text-[#250C52]"
                }`}
              >
                {isLegacy ? (
                  <Archive className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {pickText(lang, doc.titleEn, doc.titleAr)}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="uppercase font-semibold text-[#7A1D4B]">
                    {doc.docType.replace("_", " ")}
                  </span>
                  {doc.fileSize ? (
                    <span>• {Math.max(1, Math.round(doc.fileSize / 1024))} KB</span>
                  ) : null}
                  {isLegacy && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">
                      {t.legacyArchiveNote}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <a
              href={downloadHref}
              download={doc.fileName}
              target={isLegacy ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#7A1D4B]"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>{t.downloadFile}</span>
            </a>
          </div>
        );
      })}
    </div>
  );
}
