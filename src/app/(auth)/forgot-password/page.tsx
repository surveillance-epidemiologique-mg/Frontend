import { AuthShell } from "@/components/auth-shell/component";
import { ForgotPasswordForm } from "@/components/forgot-password-form/component";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Recevez un lien pour réinitialiser votre mot de passe"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}