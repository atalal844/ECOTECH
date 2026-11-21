"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

export function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error while authenticating.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F5F9] px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22]" />
        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src="/ecotech-logo.svg"
              alt="ECOTECH"
              className="mb-4 h-11 w-auto"
            />
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#250C52]/5 px-3 py-1 text-xs font-bold text-[#250C52]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#F08B22]" />
              <span>ECOTECH Enterprise Admin Control Panel</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Sign in with your authorized administrator, editor, or sales account.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-4 ps-10 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute start-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-4 ps-10 text-sm outline-none focus:border-[#7A1D4B] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#250C52] via-[#7A1D4B] to-[#F08B22] py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#250C52]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
