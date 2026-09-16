import { Alert } from "@/components/ui/alert";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";

interface LoginPageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reason } = await searchParams;
  const sessionExpired = reason === "session-expired";

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-bg-app">

      {/* ================= PANNEAU GAUCHE (VISUEL & VALEUR) ================= */}
      <div className="relative hidden w-[60%] flex-col justify-between p-12 lg:flex bg-bg-app overflow-hidden rounded-r-[2.5rem]">

        {/* Image de fond (imagerie médicale/scientifique) */}
        <Image
          src="/auth/tumisu.jpg"
          alt="Plateforme de suivi épidémiologique"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Overlay sombre sophistiqué avec un léger dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10" />

        {/* Contenu textuel central */}
        <div className="relative z-20 max-w-2xl my-20">

          {/* Titre Principal adapté à l'épidémiologie */}
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.1]">
            Anticiper les risques,{" "}
            <span className="block text-primary mt-1">protéger les populations.</span>
          </h1>

          {/* Paragraphe explicatif */}
          <p className="text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
            Plateforme centralisée de suivi épidémiologique. Analysez en temps réel l&apos;évolution des foyers infectieux, croisez les indicateurs sanitaires et coordonnez les interventions d&apos;urgence avec précision.
          </p>

          {/* Groupe de boutons CTA informatifs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-xl text-white text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Surveillance active 24/7 de la zone</span>
            </div>
          </div>
        </div>

        {/* Footer du panneau gauche */}
        <div className="relative z-25 text-xs text-slate-400">
          Réservé aux autorités sanitaires, chercheurs et professionnels accrédités.
        </div>
      </div>

      {/* ================= PANNEAU DROIT (FORMULAIRE DE CONNEXION) ================= */}
      <div
        className="relative flex w-full flex-col justify-between px-6 sm:px-12 py-10 lg:w-[40%] lg:px-14 shadow-2xl z-30"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        {/* Sélecteur de thème en haut à droite */}
        <div className="absolute right-6 top-6 z-30">
          <ThemeToggle />
        </div>

        {/* Conteneur centré du formulaire */}
        <div className="my-auto mx-auto w-full max-w-sm pt-8 lg:pt-0">
          
          <div className="mb-8">
            {/* <h2 className="text-2xl font-bold tracking-tight text-foreground">Connexion sécurisée</h2>
            <p className="text-sm text-muted-foreground mt-1">Veuillez vous identifier pour accéder au portail.</p> */}
          </div>

          {sessionExpired ? (
            <Alert variant="warning" className="mb-6">
              Votre session a expiré suite à une longue période d&apos;inactivité. Veuillez vous reconnecter pour continuer.
            </Alert>
          ) : null}

          <LoginForm />
        </div>

        {/* Footer droit */}
        <div className="flex items-center justify-between pt-6 text-xs font-medium border-t border-border text-text-subtle">
          <span>© 2026 ÉpiSuivi</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Mentions légales & Confidentialité
          </span>
        </div>

      </div>
    </div>
  );
}