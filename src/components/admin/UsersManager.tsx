"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Trash2,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Activity,
} from "lucide-react";

interface UserRow {
  id: number;
  email: string;
  fullName: string;
  fullNameAr: string | null;
  roleId: number;
  isActive: boolean;
  lastLoginAt: string | null;
  roleName: string;
  roleSlug: string;
}

interface RoleRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
}

interface AuditRow {
  id: number;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export function UsersManager({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    fullNameAr: "",
    roleId: 0,
  });

  const load = useCallback(async () => {
    if (isSuperAdmin) {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setRoles(data.roles || []);
        if (data.roles?.[0] && !newUser.roleId) {
          setNewUser((p) => ({ ...p, roleId: data.roles[1]?.id || data.roles[0].id }));
        }
      }
    }
    const logRes = await fetch("/api/audit-logs");
    if (logRes.ok) {
      const lData = await logRes.json();
      setLogs(lData.logs || []);
    }
  }, [isSuperAdmin, newUser.roleId]);

  useEffect(() => {
    load();
  }, [isSuperAdmin]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Failed to create user." });
    } else {
      setFeedback({ type: "success", text: `Created user ${data.user.email}.` });
      setNewUser({ ...newUser, email: "", password: "", fullName: "", fullNameAr: "" });
      load();
    }
  }

  async function handleUpdateUser(id: number, patch: Record<string, unknown>) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Update failed." });
    } else {
      setFeedback({ type: "success", text: "User updated." });
      load();
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: "error", text: data.error || "Delete failed." });
    } else {
      setFeedback({ type: "success", text: "User removed." });
      load();
    }
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold ${
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

      {isSuperAdmin && (
        <>
          {/* Create Staff Account */}
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#250C52]">
              <UserPlus className="h-4 w-4 text-[#F08B22]" />
              <span>Add Administrator / Staff Account</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                required
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
                placeholder="Full Name (EN)"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              />
              <input
                required
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="Email Address"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              />
              <input
                required
                minLength={10}
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Password (min 10 chars)"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              />
              <select
                value={newUser.roleId}
                onChange={(e) =>
                  setNewUser({ ...newUser, roleId: Number(e.target.value) })
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-4 py-2 text-xs font-bold text-white"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Users Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name & Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.roleId}
                          onChange={(e) =>
                            handleUpdateUser(u.id, { roleId: Number(e.target.value) })
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateUser(u.id, { isActive: !u.isActive })
                          }
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {u.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RBAC Role Matrix */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-[#250C52]">
                  <Shield className="h-4 w-4 text-[#F08B22]" />
                  <span>{r.name}</span>
                </div>
                <p className="mb-2 text-[11px] text-slate-500">{r.description}</p>
                <div className="flex flex-wrap gap-1">
                  {r.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Security Audit Logs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#250C52]">
          <Activity className="h-4 w-4 text-[#F08B22]" />
          <span>System Audit Trail (Latest 100 Events)</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2 text-[11px] text-slate-500">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {l.userEmail || "Public"} ({l.userRole || "visitor"})
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] font-bold text-[#7A1D4B]">
                    {l.action}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {l.entityType} {l.entityId ? `#${l.entityId}` : ""}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-400">
                    {l.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
