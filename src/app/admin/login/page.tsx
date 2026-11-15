import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabaseSeeded } from "@/db/seed";
import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();
  if (user) {
    redirect("/admin");
  }
  return <AdminLoginClient />;
}
