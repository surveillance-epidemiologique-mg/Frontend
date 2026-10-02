import { AuthShell } from "@/components/auth-shell/component";
import { ChangePasswordForm } from "@/components/change-password-form/component";

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