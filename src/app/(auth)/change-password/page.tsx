import { AuthShell } from "@/components/auth/auth-shell";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default function ChangePasswordPage() {
  return (
    <AuthShell
      title="Changement de mot de passe"
      subtitle="Votre mot de passe temporaire doit être remplacé avant de continuer"
    >
      <ChangePasswordForm />
    </AuthShell>
  );
}