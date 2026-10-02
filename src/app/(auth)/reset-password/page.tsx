import { AuthShell } from "@/components/auth-shell/component";
import { ResetPasswordForm } from "@/components/reset-password-form/component";

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