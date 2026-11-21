import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";
import { SERVICES_DEFAULT, type ServicesContent } from "@/lib/services-content";

export const SERVICES_SETTING_KEY = "services_content";

/**
 * Fill a stored value against the built-in default so a partial or malformed
 * record can never break rendering. Wrong types fall back to the default.
 */
export function fillFromDefault(stored: unknown, def: unknown): unknown {
  if (Array.isArray(def)) {
    if (!Array.isArray(stored)) return def;
    return stored.map((s, i) => fillFromDefault(s, def[i] ?? def[0]));
  }
  if (def && typeof def === "object") {
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return def;
    const out: Record<string, unknown> = { ...(stored as Record<string, unknown>) };
    for (const k of Object.keys(def as Record<string, unknown>)) {
      out[k] =
        k in out
          ? fillFromDefault(out[k], (def as Record<string, unknown>)[k])
          : (def as Record<string, unknown>)[k];
    }
    return out;
  }
  if (typeof def === "string") return typeof stored === "string" ? stored : def;
  return stored ?? def;
}

export async function getServicesContent(): Promise<{
  content: ServicesContent;
  customized: boolean;
}> {
  try {
    const rows = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.key, SERVICES_SETTING_KEY))
      .limit(1);
    const stored = rows[0]?.valueJson;
    if (stored && typeof stored === "object") {
      return {
        content: fillFromDefault(stored, SERVICES_DEFAULT) as ServicesContent,
        customized: true,
      };
    }
  } catch (err) {
    console.error("getServicesContent error:", err);
  }
  return { content: SERVICES_DEFAULT, customized: false };
}
