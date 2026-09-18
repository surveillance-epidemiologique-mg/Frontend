import { ActivateForm } from "@/components/auth/activate-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";

interface ActivatePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ActivatePage({
  searchParams,
}: ActivatePageProps) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-bg-app">

      {/* ================= PANNEAU GAUCHE (VISUEL & VALEUR) ================= */}
      <div className="relative hidden w-[60%] flex-col justify-between p-12 lg:flex bg-bg-app overflow-hidden rounded-r-[2.5rem]">

        <Image
          src="/auth/tumisu.jpg"
          alt="Plateforme de suivi épidémiologique"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10" />

        <div className="relative z-20 max-w-2xl my-20">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.1]">
            Anticiper les risques,{" "}
            <span className="block text-primary mt-1">protéger les populations.</span>
          </h1>

          <p className="text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
            Plateforme centralisée de suivi épidémiologique. Analysez en temps réel l&apos;évolution des foyers infectieux, croisez les indicateurs sanitaires et coordonnez les interventions d&apos;urgence avec précision.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-xl text-white text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Surveillance active 24/7 de la zone</span>
            </div>
          </div>
        </div>

        <div className="relative z-25 text-xs text-slate-400">
          Réservé aux autorités sanitaires, chercheurs et professionnels accrédités.
        </div>
      </div>

      {/* ================= PANNEAU DROIT (FORMULAIRE D'ACTIVATION) ================= */}
      <div
        className="relative flex w-full flex-col justify-between px-6 sm:px-12 py-10 lg:w-[40%] lg:px-14 shadow-2xl z-30"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="absolute right-6 top-6 z-30">
          <ThemeToggle />
        </div>

        <div className="my-auto mx-auto w-full max-w-sm pt-8 lg:pt-0">

          <div className="mb-10 flex items-center justify-center lg:justify-start">
            <Image
              src="/images/logo-app.svg"
              alt="Logo ÉpiSuivi"
              width={250}
              height={250}
              priority
              className=" object-contain drop-shadow-sm transition-transform duration-500 hover:scale-[1.03]"
            />
          </div>

          <ActivateForm token={token ?? ""} />
        </div>

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
