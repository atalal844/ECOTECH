import { PasswordResetClient } from "@/components/admin/PasswordResetClient";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const sp = await searchParams;
  return (
    <PasswordResetClient mode="reset" email={sp.email || ""} token={sp.token || ""} />
  );
}
