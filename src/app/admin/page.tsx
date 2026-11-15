import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabaseSeeded } from "@/db/seed";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return <AdminShell user={user} />;
}
