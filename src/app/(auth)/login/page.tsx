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

      {/* ================= PANNEAU GAUCHE ================= */}
      <div className="relative hidden w-[60%] flex-col justify-between p-12 lg:flex bg-primary overflow-hidden rounded-r-4xl" >

        <Image
            src="/auth/auth4.jpg" // À remplacer par le chemin de votre image dans /public
            alt="Fond de connexion"
            fill
            priority
            className="object-cover object-center"
        />

        {/* Overlay sombre pour garantir la lisibilité du texte par-dessus l'image */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        {/* Contenu textuel et boutons superposés */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
          
          {/* Titre Principal */}
          <h1 className="text-xl lg:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Arrêtez de perdre des heures
            <span className="block text-primary mt-1">à couper les silences.</span>
          </h1>

          {/* Paragraphe explicatif */}
          <p className="mt-6 text-base lg:text-lg text-slate-200 leading-relaxed font-normal max-w-xl">
            AutoTrim supprime les silences, les mots de remplissage et les répétitions de tous vos clips en une fois — en les traitant en parallèle et en exportant une timeline propre et unique, prête à monter dans Final Cut Pro, Premiere ou Resolve.
          </p>

          {/* Groupe de boutons CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            {/* Bouton Principal */}
            <button className="flex items-center gap-2 bg-primary hover:bg-sky-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]">
              Essayer AutoTrim gratuitement →
            </button>

            {/* Bouton Secondaire */}
            <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200">
              <span>▷</span> Voir la démo de 90s
            </button>
          </div>
        </div>
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: "linear-gradient(var(--primary-light) 4px, transparent 1px), linear-gradient(90deg, var(--primary-light) 4px, transparent 1px)",
              backgroundSize: "90px 90px",
            }}
          />
        </div>

        {/* Mosaïque d'Hexagones Emboîtés */}
        {/*<div className="relative z-10 my-auto flex justify-center">*/}
        {/*  <div className="w-full max-w-xl">*/}
        {/*    <div className="grid grid-cols-3 gap-x-2">*/}
        {/*      {hexagonItems.map((item: HexagonItem, index: number) => {*/}
        {/*        const isSecondRow = index >= 3 && index < 6;*/}
        {/*        const isThirdRow = index >= 6;*/}
        {/*        const translateX = isSecondRow ? "translate-x-[50%]" : "";*/}
        {/*        const translateY = isSecondRow || isThirdRow ? "-mt-[25%]" : "";*/}

        {/*        return (*/}
        {/*          <div key={index} className={`${translateX} ${translateY} z-10`}>*/}
        {/*            <Hexagon item={item} />*/}
        {/*          </div>*/}
        {/*        );*/}
        {/*      })}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}

      </div>

      {/* ================= PANNEAU DROIT ================= */}
      <div
        className="relative flex w-full flex-col justify-between px-8 py-10 lg:w-[40%] lg:px-14"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="absolute right-6 top-6 z-30">
          <ThemeToggle />
        </div>

        <div className="my-auto mx-auto w-full max-w-sm">

          {sessionExpired ? (
            <Alert variant="warning" className="mb-6">
              Session expirée suite à une longue période d&apos;inactivité. Veuillez vous reconnecter.
            </Alert>
          ) : null}

          <LoginForm />
        </div>

        {/* Footer droit */}
        <div
          className="flex items-center justify-between pt-6 text-xs font-medium border-t border-border text-text-subtle"
        >
          <span>© 2026 ÉpiSuivi</span>
          <div >
            <span className="text-text-subtle">Mentions légales</span>
          </div>
        </div>

      </div>
    </div>
  );
}