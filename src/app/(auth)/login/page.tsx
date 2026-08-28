import { Lock } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { LoginForm } from "@/components/auth/login-form";
import Hexagon from "@/components/auth/Hexagon";
import { hexagonItems, type HexagonItem } from "@/data/hexagons";

interface LoginPageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reason } = await searchParams;
  const sessionExpired = reason === "session-expired";

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-bg-app">

      {/* ================= PANNEAU GAUCHE ================= */}
      <div className="relative hidden w-[62%] flex-col justify-between p-10 lg:flex bg-bg-muted" style={{ background: "linear-gradient(145deg, var(--bg-muted) 0%, var(--bg-surface) 50%, var(--bg-muted) 100%)" }}>

        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-32 size-[500px] rounded-full opacity-20 animate-drift"
            style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)", filter: "blur(60px)" }}
          />
          <div
            className="absolute -bottom-20 right-0 size-[400px] rounded-full opacity-15 animate-drift"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)", filter: "blur(80px)", animationDelay: "8s" }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: "linear-gradient(var(--primary) 2px, transparent 1px), linear-gradient(90deg, var(--primary) 2px, transparent 1px)",
              backgroundSize: "70px 70px",
            }}
          />
        </div>

        {/* En-tête gauche */}
        {/* <div className="relative z-10 flex items-center">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl shadow-lg shadow-primary/30 animate-float"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
            >
              <Activity className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-text-main">ÉpiSuivi</h1>
              <p className="text-[10px] font-medium tracking-widest uppercase text-text-subtle">
                Direction Générale de la Santé
              </p>
            </div>
          </div>
        </div> */}

        {/* Mosaïque d'Hexagones Emboîtés */}
        <div className="relative z-10 my-auto flex items-center justify-center py-4">
          <div className="w-full max-w-xl">
            <div className="grid grid-cols-3 gap-x-2">
              {hexagonItems.map((item: HexagonItem, index: number) => {
                const isSecondRow = index >= 3 && index < 6;
                const isThirdRow = index >= 6;
                const translateX = isSecondRow ? "translate-x-[50%]" : "";
                const translateY = isSecondRow || isThirdRow ? "-mt-[25%]" : "";

                return (
                  <div key={index} className={`${translateX} ${translateY} z-10`}>
                    <Hexagon item={item} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pied de page statistiques gauche */}
        {/* <div
          className="relative z-10 rounded-2xl p-5 backdrop-blur-md border border-border bg-bg-surface"
        >
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { value: "2 847", label: "Établissements Connectés" },
              { value: "99,9%", label: "Taux de Disponibilité" },
              { value: "1,2 M", label: "Analyses Quotidiennes" },
            ].map((stat, i) => (
              <div key={i} className={i === 0 ? "pr-6" : i === 1 ? "px-6" : "pl-6"}>
                <p className="text-2xl font-bold tracking-tight text-text-main">{stat.value}</p>
                <p className="mt-0.5 text-xs text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* ================= PANNEAU DROIT ================= */}
      <div
        className="relative flex w-full flex-col justify-between px-8 py-10 lg:w-[38%] lg:px-14"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >

        <div className="my-auto mx-auto w-full max-w-sm">

          {/* Titre */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-main">
              Bon retour.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Connectez-vous pour accéder au tableau de bord épidémiologique national.
            </p>
          </div>

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
          <div className="flex gap-4">
            <a
              href="/forgot-password"
              className="text-text-subtle transition-colors hover:text-text-muted"
            >
              Aide à la connexion
            </a>
            <span className="text-text-subtle">Mentions légales</span>
          </div>
        </div>

        {/* Bouton aide flottant */}
        <a
          href="/forgot-password"
          className="fixed bottom-5 right-5 flex size-10 items-center justify-center rounded-full text-primary-foreground shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl bg-primary"
          style={{ boxShadow: "0 8px 24px var(--focus-ring)" }}
          aria-label="Aide à la connexion"
        >
          <Lock className="size-4" />
        </a>
      </div>
    </div>
  );
}