import { AuthShell } from "@/components/auth/auth-shell";
import { ActivateForm } from "@/components/auth/activate-form";

interface ActivatePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ActivatePage({
  searchParams,
}: ActivatePageProps) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Activation de votre compte"
      subtitle="Définissez votre mot de passe personnel"
    >
      <ActivateForm token={token ?? ""} />
    </AuthShell>
  );
}