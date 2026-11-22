import { PasswordResetClient } from "@/components/admin/PasswordResetClient";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <PasswordResetClient mode="request" />;
}
