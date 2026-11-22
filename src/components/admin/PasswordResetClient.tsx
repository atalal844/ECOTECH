"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function PasswordResetClient({
  mode,
  email: initialEmail,
  token,
}: {
  mode: "request" | "reset";
  email?: string;
  token?: string;
}) {
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "reset" && password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        mode === "request" ? "/api/auth/forgot-password" : "/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "request" ? { email } : { email, token, password }
          ),
        }
      );
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else
        setDone(
          mode === "request"
            ? data.message
            : "Your password has been changed. You can sign in now."
        );
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  const input =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F5F9] px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22]" />
        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <img src="/ecotech-logo.svg" alt="ECOTECH" className="mb-4 h-11 w-auto" />
            <h1 className="text-base font-extrabold text-[#250C52]">
              {mode === "request" ? "Reset your password" : "Choose a new password"}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {mode === "request"
                ? "Enter your administrator email. We will send you a reset link."
                : "Use at least 10 characters."}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {done ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{done}</span>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {mode === "request" ? (
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={input}
                />
              ) : (
                <>
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className={input}
                  />
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat new password"
                    className={input}
                  />
                </>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22] py-3 text-sm font-bold text-white shadow-md disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "request"
                    ? "Send reset link"
                    : "Save new password"}
              </button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-slate-500 hover:text-[#250C52]"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
