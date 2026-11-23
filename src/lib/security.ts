import crypto from "crypto";
import { db, companySettings } from "@/db";
import { eq } from "drizzle-orm";

/**
 * Per-user security state (lockout, 2FA, reset token). Stored as one JSON row
 * per user in company_settings, so no database migration is needed.
 */
export interface UserSecurity {
  failedAttempts: number;
  lockedUntil: number | null; // epoch ms
  totpSecret: string | null; // base32, active
  totpEnabled: boolean;
  pendingSecret: string | null; // base32, during setup
  resetHash: string | null;
  resetExpires: number | null;
  lastTotpStep: number | null;
}

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
export const RESET_MINUTES = 60;

const EMPTY: UserSecurity = {
  failedAttempts: 0,
  lockedUntil: null,
  totpSecret: null,
  totpEnabled: false,
  pendingSecret: null,
  resetHash: null,
  resetExpires: null,
  lastTotpStep: null,
};

const keyFor = (userId: number) => `user_security:${userId}`;

export async function getSecurity(userId: number): Promise<UserSecurity> {
  const rows = await db
    .select()
    .from(companySettings)
    .where(eq(companySettings.key, keyFor(userId)))
    .limit(1);
  const v = rows[0]?.valueJson as Partial<UserSecurity> | undefined;
  return { ...EMPTY, ...(v || {}) };
}

export async function saveSecurity(userId: number, s: UserSecurity) {
  const key = keyFor(userId);
  const exists = await db
    .select({ id: companySettings.id })
    .from(companySettings)
    .where(eq(companySettings.key, key))
    .limit(1);
  const valueJson = s as unknown as Record<string, unknown>;
  if (exists[0]) {
    await db
      .update(companySettings)
      .set({ valueJson, updatedAt: new Date() })
      .where(eq(companySettings.key, key));
  } else {
    await db.insert(companySettings).values({ key, valueJson });
  }
}

export function isLocked(s: UserSecurity): number | null {
  if (s.lockedUntil && s.lockedUntil > Date.now()) {
    return Math.ceil((s.lockedUntil - Date.now()) / 60000);
  }
  return null;
}

/** Register a failed attempt; returns the updated state. */
export function withFailure(s: UserSecurity): UserSecurity {
  const expired = s.lockedUntil && s.lockedUntil <= Date.now();
  const failed = (expired ? 0 : s.failedAttempts) + 1;
  if (failed >= MAX_FAILED_ATTEMPTS) {
    return {
      ...s,
      failedAttempts: 0,
      lockedUntil: Date.now() + LOCK_MINUTES * 60_000,
    };
  }
  return { ...s, failedAttempts: failed, lockedUntil: null };
}

export function clearFailures(s: UserSecurity): UserSecurity {
  return { ...s, failedAttempts: 0, lockedUntil: null };
}

/* ---------- TOTP (RFC 6238, SHA-1, 6 digits, 30 s) ---------- */

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newTotpSecret(): string {
  const bytes = crypto.randomBytes(20);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += B32[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function b32decode(s: string): Buffer {
  let bits = "";
  for (const c of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(c);
    if (i < 0) continue;
    bits += i.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac("sha1", b32decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const code =
    ((h[o] & 0x7f) << 24) |
    (h[o + 1] << 16) |
    (h[o + 2] << 8) |
    h[o + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

/** Returns the matched time step, or null. Allows one step of clock drift. */
export function checkTotp(secret: string, code: string): number | null {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return null;
  const step = Math.floor(Date.now() / 30000);
  for (const d of [0, -1, 1]) {
    if (hotp(secret, step + d) === clean) return step + d;
  }
  return null;
}

export function otpauthUri(email: string, secret: string): string {
  const label = encodeURIComponent(`ECOTECH:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=ECOTECH&algorithm=SHA1&digits=6&period=30`;
}

/* ---------- Password reset tokens ---------- */

export function newResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function sendResetEmail(to: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from =
    process.env.INQUIRY_FROM_EMAIL || "ECOTECH <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "ECOTECH admin password reset",
      text: `A password reset was requested for your ECOTECH admin account.\n\nSet a new password (valid for ${RESET_MINUTES} minutes):\n${link}\n\nIf you did not ask for this, ignore this email. Your password stays the same.`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6"><p>A password reset was requested for your ECOTECH admin account.</p><p><a href="${link}">Set a new password</a> (valid for ${RESET_MINUTES} minutes).</p><p>If you did not ask for this, ignore this email. Your password stays the same.</p></div>`,
    }),
  });
  if (!res.ok) console.error("Reset email failed:", res.status);
  return res.ok;
}
