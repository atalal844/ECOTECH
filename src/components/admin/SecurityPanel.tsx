"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export function SecurityPanel() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauth: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/2fa")
      .then((r) => r.json())
      .then((d) => setEnabled(!!d.enabled))
      .catch(() => setEnabled(false));
  }, []);

  async function call(body: Record<string, unknown>) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: data.error || "Something went wrong." });
      return null;
    }
    return data;
  }

  const input =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white";

  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-1 flex items-center gap-2 text-sm font-extrabold text-[#250C52]">
          <ShieldCheck className="h-4 w-4 text-[#F08B22]" />
          Two-factor sign-in (optional)
        </div>
        <p className="mb-4 text-xs text-slate-500">
          When on, signing in needs your password and a 6-digit code from an
          authenticator app on your phone. It applies to your account only.
        </p>

        {msg && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
              msg.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        {enabled === null && <p className="text-xs text-slate-400">Loading...</p>}

        {enabled === false && !setup && (
          <button
            disabled={busy}
            onClick={async () => {
              const d = await call({ action: "start" });
              if (d) setSetup(d);
            }}
            className="rounded-xl bg-[#250C52] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            Set up two-factor sign-in
          </button>
        )}

        {enabled === false && setup && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              1. In your authenticator app choose "Enter a setup key" and add
              this key (account: ECOTECH).
            </p>
            <div className="break-all rounded-xl bg-slate-100 px-4 py-3 font-mono text-sm tracking-wider">
              {setup.secret}
            </div>
            <p className="text-xs text-slate-600">
              On a phone with an authenticator app you can also{" "}
              <a href={setup.otpauth} className="font-semibold text-[#7A1D4B] underline">
                open the setup link
              </a>
              .
            </p>
            <p className="text-xs text-slate-600">2. Enter the 6-digit code it shows.</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={8}
              placeholder="123456"
              className={input}
            />
            <button
              disabled={busy}
              onClick={async () => {
                const d = await call({ action: "confirm", code });
                if (d) {
                  setEnabled(true);
                  setSetup(null);
                  setCode("");
                  setMsg({ ok: true, text: "Two-factor sign-in is on." });
                }
              }}
              className="rounded-xl bg-[#250C52] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              Turn on
            </button>
          </div>
        )}

        {enabled === true && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-emerald-700">Two-factor sign-in is on.</p>
            <p className="text-xs text-slate-500">To turn it off, enter your password and a current code.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={input}
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={8}
              placeholder="123456"
              className={input}
            />
            <button
              disabled={busy}
              onClick={async () => {
                const d = await call({ action: "disable", password, code });
                if (d) {
                  setEnabled(false);
                  setPassword("");
                  setCode("");
                  setMsg({ ok: true, text: "Two-factor sign-in is off." });
                }
              }}
              className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-60"
            >
              Turn off
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-600">
        <div className="mb-1 text-sm font-extrabold text-[#250C52]">Sign-in protection</div>
        After 5 wrong passwords or codes an account is locked for 15 minutes.
        Passwords can be reset by email from the sign-in page.
      </div>
    </div>
  );
}
