"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  FileText,
  Globe,
  MessageSquare,
  Users,
  LogOut,
  ExternalLink,
  TrendingUp,
  Activity,
  Menu,
  X,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import { ProductsManager } from "./ProductsManager";
import { CategoriesManager } from "./CategoriesManager";
import { MediaManager } from "./MediaManager";
import { DocumentsManager } from "./DocumentsManager";
import { InquiriesManager } from "./InquiriesManager";
import { CmsSettingsManager } from "./CmsSettingsManager";
import { UsersManager } from "./UsersManager";

type TabId =
  | "overview"
  | "products"
  | "categories"
  | "media"
  | "documents"
  | "cms"
  | "inquiries"
  | "users";

interface OverviewData {
  stats: {
    totalProducts: number;
    activeProducts: number;
    draftProducts: number;
    totalCategories: number;
    totalMedia: number;
    totalInquiries: number;
    newInquiries: number;
  };
  recentActivities: Array<{
    id: number;
    userEmail: string | null;
    action: string;
    entityType: string;
    createdAt: string;
  }>;
  mostViewedProducts: Array<{
    id: number;
    nameEn: string;
    sku: string;
    slug: string;
    viewCount: number;
    status: string;
  }>;
  latestDocuments: Array<{
    id: number;
    titleEn: string;
    docType: string;
    fileName: string;
    fileUrl: string;
    createdAt: string;
  }>;
}

function clientHasPerm(user: AuthUser, perm: string): boolean {
  if (user.roleSlug === "super_admin" || user.permissions.includes("*")) {
    return true;
  }
  if (user.permissions.includes(perm)) return true;
  const [domain] = perm.split(".");
  return Boolean(domain && user.permissions.includes(`${domain}.*`));
}

export function AdminShell({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  const loadOverview = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.ok) {
      const data = await res.json();
      setOverview(data);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "overview") {
      loadOverview();
    }
  }, [activeTab, loadOverview]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const navItems: Array<{
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    visible: boolean;
  }> = [
    {
      id: "overview",
      label: "Dashboard Overview",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      visible: clientHasPerm(user, "products.write"),
    },
    {
      id: "categories",
      label: "Categories",
      icon: FolderTree,
      visible: clientHasPerm(user, "categories.write"),
    },
    {
      id: "media",
      label: "Media Library",
      icon: ImageIcon,
      visible: clientHasPerm(user, "media.read"),
    },
    {
      id: "documents",
      label: "Datasheets & Docs",
      icon: FileText,
      visible: clientHasPerm(user, "documents.read"),
    },
    {
      id: "cms",
      label: "Homepage & CMS",
      icon: Globe,
      visible: clientHasPerm(user, "homepage.write"),
    },
    {
      id: "inquiries",
      label: "Inquiries & Quotes",
      icon: MessageSquare,
      visible: clientHasPerm(user, "inquiries.read"),
    },
    {
      id: "users",
      label:
        user.roleSlug === "super_admin"
          ? "Users & Audit Logs"
          : "Security Audit Logs",
      icon: Users,
      visible:
        user.roleSlug === "super_admin" || user.roleSlug === "admin",
    },
  ];

  const visibleNav = navItems.filter((n) => n.visible);

  return (
    <div dir="ltr" className="flex min-h-screen bg-[#F1F5F9] text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/ecotech-logo.svg" alt="ECOTECH" className="h-8 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenu(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* User Badge */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <div className="truncate text-xs font-extrabold text-slate-900">
            {user.fullName}
          </div>
          <div className="truncate text-[11px] text-slate-500">{user.email}</div>
          <span className="mt-1.5 inline-block rounded-md bg-gradient-to-r from-[#250C52] to-[#7A1D4B] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {user.roleName}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenu(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#250C52] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active ? "text-[#F28E20]" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-200 p-3 space-y-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#7A1D4B]" />
            <span>View Public Website</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="rounded-lg border border-slate-200 p-1.5 lg:hidden"
            >
              <Menu className="h-5 w-5 text-slate-700" />
            </button>
            <h1 className="text-sm font-extrabold uppercase tracking-wide text-[#250C52]">
              {visibleNav.find((n) => n.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            PostgreSQL + Drizzle ORM Connected
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                {[
                  { label: "Total Products", val: overview?.stats.totalProducts ?? "—" },
                  { label: "Published", val: overview?.stats.activeProducts ?? "—" },
                  { label: "Drafts", val: overview?.stats.draftProducts ?? "—" },
                  { label: "Categories", val: overview?.stats.totalCategories ?? "—" },
                  { label: "Media Files", val: overview?.stats.totalMedia ?? "—" },
                  { label: "Total Quotes", val: overview?.stats.totalInquiries ?? "—" },
                  {
                    label: "New Inquiries",
                    val: overview?.stats.newInquiries ?? "—",
                    highlight: true,
                  },
                ].map((kpi, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 shadow-sm ${
                      kpi.highlight
                        ? "border-[#F08B22]/40 bg-amber-50/70"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-slate-500">
                      {kpi.label}
                    </div>
                    <div className="mt-1 text-2xl font-extrabold text-[#250C52]">
                      {kpi.val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Most Viewed Products */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#250C52]">
                    <TrendingUp className="h-4 w-4 text-[#F08B22]" />
                    <span>Most Viewed Products</span>
                  </div>
                  <ul className="divide-y divide-slate-100 text-xs">
                    {(overview?.mostViewedProducts || []).map((p) => (
                      <li key={p.id} className="flex items-center justify-between py-2.5">
                        <div className="min-w-0 pr-2">
                          <div className="truncate font-bold text-slate-900">
                            {p.nameEn}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400">
                            {p.sku}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-bold text-[#250C52]">
                          {p.viewCount} views
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Latest Uploaded Documents */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#250C52]">
                    <FileText className="h-4 w-4 text-[#F08B22]" />
                    <span>Latest Technical Documents</span>
                  </div>
                  <ul className="divide-y divide-slate-100 text-xs">
                    {(overview?.latestDocuments || []).map((d) => (
                      <li key={d.id} className="flex items-center justify-between py-2.5">
                        <div className="min-w-0 pr-2">
                          <div className="truncate font-bold text-slate-900">
                            {d.titleEn}
                          </div>
                          <div className="text-[11px] uppercase text-[#7A1D4B]">
                            {d.docType}
                          </div>
                        </div>
                        <a
                          href={`${d.fileUrl}?download=1`}
                          download={d.fileName}
                          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          PDF
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recent Activities */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#250C52]">
                    <Activity className="h-4 w-4 text-[#F08B22]" />
                    <span>Recent System Activity</span>
                  </div>
                  <ul className="divide-y divide-slate-100 text-xs">
                    {(overview?.recentActivities || []).map((a) => (
                      <li key={a.id} className="py-2.5">
                        <div className="flex justify-between">
                          <span className="font-mono font-bold text-[#7A1D4B]">
                            {a.action}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(a.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {a.userEmail || "Public"} • {a.entityType}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && <ProductsManager />}
          {activeTab === "categories" && <CategoriesManager />}
          {activeTab === "media" && <MediaManager />}
          {activeTab === "documents" && <DocumentsManager />}
          {activeTab === "cms" && <CmsSettingsManager />}
          {activeTab === "inquiries" && <InquiriesManager />}
          {activeTab === "users" && (
            <UsersManager isSuperAdmin={user.roleSlug === "super_admin"} />
          )}
        </main>
      </div>
    </div>
  );
}
