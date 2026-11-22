import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";

export const WATERMARK_SETTING_KEY = "watermark";
export type WatermarkSettings = { enabled: boolean; opacity: number };
export const WATERMARK_DEFAULT: WatermarkSettings = { enabled: true, opacity: 45 };

export function cleanWatermark(v: unknown): WatermarkSettings {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const enabled = typeof o.enabled === "boolean" ? o.enabled : WATERMARK_DEFAULT.enabled;
  let opacity = Number(o.opacity);
  if (!Number.isFinite(opacity)) opacity = WATERMARK_DEFAULT.opacity;
  opacity = Math.min(80, Math.max(5, Math.round(opacity)));
  return { enabled, opacity };
}

export async function getWatermark(): Promise<WatermarkSettings> {
  try {
    const rows = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.key, WATERMARK_SETTING_KEY))
      .limit(1);
    if (rows[0]?.valueJson) return cleanWatermark(rows[0].valueJson);
  } catch (err) {
    console.error("getWatermark error:", err);
  }
  return WATERMARK_DEFAULT;
}
