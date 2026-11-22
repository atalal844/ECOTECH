"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  MessageSquarePlus,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

interface InquiryNote {
  id: number;
  authorName: string;
  note: string;
  createdAt: string;
}

interface InquiryRow {
  id: number;
  referenceCode: string;
  inquiryType: string;
  customerName: string;
  companyName: string | null;
  email: string;
  phone: string;
  country: string;
  productNameSnapshot: string | null;
  quantity: string | null;
  message: string;
  status: string;
  assignedToId: number | null;
  createdAt: string;
  notes: InquiryNote[];
}

const STATUS_OPTIONS = [
  "new",
  "in_progress",
  "quoted",
  "completed",
  "cancelled",
  "archived",
] as const;

interface Assignee {
  id: number;
  fullName: string;
}

export function InquiriesManager({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selected, setSelected] = useState<InquiryRow | null>(null);
  const [noteText, setNoteText] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (q.trim()) params.set("q", q.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (assignedFilter !== "all") params.set("assigned", assignedFilter);

      const res = await fetch(`/api/inquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list: InquiryRow[] = data.inquiries || [];
        setInquiries(list);
        setAssignees(data.assignees || []);
        if (selected) {
          const updatedSel = list.find((i) => i.id === selected.id) || null;
          setSelected(updatedSel);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q, from, to, assignedFilter, selected?.id]);

  useEffect(() => {
    load();
  }, [statusFilter, q, from, to, assignedFilter]);

  async function handleStatusChange(inqId: number, status: string) {
    const res = await fetch(`/api/inquiries/${inqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setFeedback({ type: "success", text: `Updated status to "${status}".` });
      load();
    } else {
      setFeedback({ type: "error", text: "Failed to update status." });
    }
  }

  async function handleAssign(inqId: number, value: string) {
    const res = await fetch(`/api/inquiries/${inqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: value ? Number(value) : null }),
    });
    setFeedback(
      res.ok
        ? { type: "success", text: "Assignment updated." }
        : { type: "error", text: "Failed to update assignment." }
    );
    if (res.ok) load();
  }

  async function handleDelete(inq: InquiryRow) {
    if (
      !window.confirm(
        `Delete ${inq.referenceCode} permanently? Its notes are deleted too. This cannot be undone. Archive it instead if you may need it later.`
      )
    )
      return;
    const res = await fetch(`/api/inquiries/${inq.id}`, { method: "DELETE" });
    if (res.ok) {
      setSelected(null);
      setFeedback({ type: "success", text: `Deleted ${inq.referenceCode}.` });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      setFeedback({ type: "error", text: d.error || "Failed to delete." });
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !noteText.trim()) return;
    const res = await fetch(`/api/inquiries/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteText }),
    });
    if (res.ok) {
      setNoteText("");
      setFeedback({ type: "success", text: "Internal note added." });
      load();
    }
  }

  const badgeCls = (s: string) => {
    switch (s) {
      case "new":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "in_progress":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "quoted":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">
            Customer Inquiries & Quote Requests
          </h2>
          <p className="text-xs text-slate-500">
            Track quotation requests, update pipeline status, record internal sales notes, and export to CSV/Excel.
          </p>
        </div>
        <a
          href="/api/inquiries/export"
          download="ecotech-inquiries.csv"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#250C52]"
        >
          <Download className="h-4 w-4 text-[#F28E20]" />
          <span>Export CSV / Excel</span>
        </a>
      </div>

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

      {/* Search & Status Filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search RFQ code, customer, company, country, product..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pe-3 ps-9 text-xs outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="all">Anyone</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map((a) => (
            <option key={a.id} value={String(a.id)}>
              {a.fullName}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none"
          />
        </label>
        {(from || to || q || assignedFilter !== "all" || statusFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setFrom("");
              setTo("");
              setAssignedFilter("all");
              setStatusFilter("all");
            }}
            className="text-[11px] font-bold text-[#7A1D4B] underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-7">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ref / Date</th>
                  <th className="px-4 py-3">Customer / Company</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      Loading inquiries...
                    </td>
                  </tr>
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      No inquiries found.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => setSelected(inq)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        selected?.id === inq.id ? "bg-[#250C52]/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#250C52]">
                          {inq.referenceCode}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">
                          {inq.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {inq.companyName || inq.country}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="line-clamp-1 max-w-[180px]">
                          {inq.productNameSnapshot || "General Inquiry"}
                        </div>
                        {inq.quantity && (
                          <div className="text-[11px] text-slate-400">
                            Qty: {inq.quantity}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${badgeCls(
                            inq.status
                          )}`}
                        >
                          {inq.status.replace("_", " ")}
                        </span>
                        <div className="mt-1 text-[10px] text-slate-400">
                          {assignees.find((a) => a.id === inq.assignedToId)
                            ?.fullName || "Unassigned"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Drawer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-5">
          {!selected ? (
            <div className="flex h-full min-h-[260px] items-center justify-center text-center text-xs text-slate-400">
              Select an inquiry row to view full contact details, update status, and add internal notes.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono font-bold text-[#7A1D4B]">
                    {selected.referenceCode}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-950">
                    {selected.customerName}
                  </h3>
                  <p className="text-slate-500">
                    {selected.companyName} • {selected.country}
                  </p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-bold uppercase text-slate-800"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 font-semibold text-slate-600">
                  Assigned to
                  <select
                    value={selected.assignedToId ?? ""}
                    onChange={(e) => handleAssign(selected.id, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-800"
                  >
                    <option value="">Unassigned</option>
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      selected.id,
                      selected.status === "archived" ? "new" : "archived"
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
                >
                  {selected.status === "archived" ? "Restore" : "Archive"}
                </button>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    className="rounded-xl border border-red-200 px-3 py-1.5 font-bold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <span className="text-slate-400">Email:</span>{" "}
                  <a href={`mailto:${selected.email}`} className="font-semibold text-[#250C52]">
                    {selected.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>{" "}
                  <span className="font-semibold">{selected.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Product:</span>{" "}
                  <span className="font-semibold">
                    {selected.productNameSnapshot || "General"}
                  </span>
                  {selected.quantity ? ` (Qty: ${selected.quantity})` : ""}
                </div>
              </div>

              <div>
                <div className="mb-1 font-bold text-slate-700">Customer Message</div>
                <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 leading-relaxed text-slate-700">
                  {selected.message}
                </p>
              </div>

              {/* Internal Notes */}
              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <div className="font-bold text-slate-700">
                  Internal Sales & Engineering Notes
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {selected.notes.length === 0 ? (
                    <p className="text-slate-400">No internal notes yet.</p>
                  ) : (
                    selected.notes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                      >
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-slate-800">
                            {n.authorName}
                          </span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-slate-700">{n.note}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add internal quotation or follow-up note..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#7A1D4B]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-xl bg-[#250C52] px-3 py-2 font-bold text-white"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
