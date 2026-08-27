import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Réinitialisation du mot de passe"
      subtitle="Définissez un nouveau mot de passe pour votre compte"
    >
      <ResetPasswordForm token={token ?? ""} />
    </AuthShell>
  );
}