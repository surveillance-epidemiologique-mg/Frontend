import { LoginForm } from "@/features/auth/components/LoginForm/LoginForm";
import { ThemeToggle } from "@/components/theme-toggle/component";
import Image from "next/image";

interface LoginPageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reason } = await searchParams;
  const sessionExpired = reason === "session-expired";

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-bg-app">

      {/* Panneau éditorial — visible sur les écrans larges */}
      <aside className="relative hidden min-h-dvh w-[56%] flex-col overflow-hidden rounded-r-[2.5rem] bg-[#061d31] px-10 py-10 text-white lg:flex xl:w-[58%] xl:px-16 xl:py-14">
        <Image
          src="/auth/tumisu.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 58vw, 56vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061d31]/80 via-[#082b45]/50 to-[#082b45]/35" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061d31]/90 via-transparent to-[#061d31]/25" aria-hidden="true" />

        <div className="relative z-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/90">
          <span className="h-px w-7 bg-sky-300" aria-hidden="true" />
          Surveillance sanitaire · Madagascar
        </div>

        <div className="relative z-10 my-auto max-w-[38rem] py-12">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Une information claire pour chaque décision
          </p>
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.035em] text-white xl:text-5xl 2xl:text-6xl">
            Voir plus tôt.
            <span className="mt-2 block text-sky-200">Agir ensemble.</span>
          </h1>
          <p className="mt-6 max-w-[32rem] text-sm leading-7 text-white/85 xl:text-base">
            Suivez les cas, repérez les signaux d&apos;alerte et coordonnez les réponses sanitaires sur un même espace de travail.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/25 pt-6 text-xs font-medium text-white/90 xl:gap-6 xl:text-sm">
          <span className="flex items-center gap-2.5"><span className="size-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden="true" />Cas cliniques</span>
          <span className="flex items-center gap-2.5"><span className="size-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden="true" />Analyses labo</span>
          <span className="flex items-center gap-2.5"><span className="size-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden="true" />Alertes locales</span>
        </div>
      </aside>

      {/* ================= PANNEAU DROIT (FORMULAIRE DE CONNEXION) ================= */}
      <div
        className="relative flex w-full flex-col justify-between px-6 sm:px-12 py-10 lg:w-[44%] xl:w-[42%] lg:px-14 shadow-2xl z-30"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        {/* Sélecteur de thème en haut à droite */}
        <div className="absolute right-6 top-6 z-30">
          <ThemeToggle />
        </div>

        {/* Conteneur centré du formulaire */}
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

          <LoginForm sessionExpired={sessionExpired} />
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
