import { AuthShell } from "@/components/auth/auth-shell";
import { ActivateForm } from "@/components/auth/activate-form";
import { activateInfo } from "@/services/auth";

interface ActivatePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ActivatePage({
  searchParams,
}: ActivatePageProps) {
  const { token } = await searchParams;
  const tokenValue = token ?? "";

  let email: string | null = null;
  let invalid = false;
  let expired = false;

  if (tokenValue) {
    try {
      const info = await activateInfo(tokenValue);
      email = info.email;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "";
      expired = message.includes("expiré");
      invalid = !expired;
    }
  } else {
    invalid = true;
  }

  return (
    <AuthShell
      title="Activation de votre compte"
      subtitle="Définissez votre mot de passe personnel"
    >
      <ActivateForm
        token={tokenValue}
        email={email}
        invalid={invalid}
        expired={expired}
      />
    </AuthShell>
  );
}