import { Bell, MapPin, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import Hexagon from "@/components/auth/Hexagon";
import { hexagonItems, type HexagonItem } from "@/data/hexagons";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh w-full bg-bg-app">
      {/* ===== Panneau gauche : vitrine (large écran) ===== */}
      <div className="relative hidden w-3/5 overflow-hidden border-r border-border bg-gradient-to-br from-bg-surface via-bg-app to-primary-light/70 lg:flex lg:flex-col">
        {/* Halos lumineux décoratifs */}
        <div className="pointer-events-none absolute -left-32 -top-40 size-[38rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-44 left-1/4 size-[34rem] rounded-full bg-chart-7/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 size-80 rounded-full bg-info/15 blur-[100px]" />

        {/* Matrice de points décorative */}
        <div className="pointer-events-none absolute right-10 top-16 grid grid-cols-3 gap-3 opacity-30">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="size-2.5 rounded-full bg-text-subtle" />
          ))}
        </div>

        {/* Marque */}
        <div className="relative z-10 flex items-center gap-3 px-10 pt-10 xl:px-16">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-active text-primary-foreground shadow-card">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-text-main">
              ÉpiSuivi
            </p>
            <p className="text-xs text-text-muted">
              Surveillance épidémiologique · Madagascar
            </p>
          </div>
        </div>

        {/* Mosaïque hexagonale */}
        <div className="relative z-10 ">
          <div className="grid w-full max-w-4xl grid-cols-3 gap-x-z md:gap-x-4">
            {hexagonItems.map((item: HexagonItem, index: number) => {
              const isSecondRow = index >= 3 && index < 6;
              const isThirdRow = index >= 6;

              const translateX = isSecondRow
                ? "translate-x-[calc(50%+0.25rem)] md:translate-x-[calc(50%+0.5rem)]"
                : "";
              const translateY =
                isSecondRow || isThirdRow
                  ? "-mt-[16%] md:-mt-[20%]"
                  : "";

              return (
                <div
                  key={index}
                  className={`${translateX} ${translateY} z-10 animate-fade-in`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <Hexagon item={item} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== Panneau droit : formulaire ===== */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-2/5 lg:px-8">
        <div className="w-full max-w-md animate-slide-up">

          <div className="rounded-2xl border border-border bg-bg-surface p-8 shadow-card">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-xl font-semibold tracking-tight text-text-main">
                Connexion
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Accédez à votre espace de travail
              </p>
            </div>

            <LoginForm />

            <div className="mt-6 space-y-2.5 border-t border-border pt-5">
              {[
                { icon: ShieldCheck, text: "Accès sécurisé par rôle" },
                { icon: Bell, text: "Alertes sanitaires en temps réel" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-xs text-text-muted"
                >
                  <item.icon className="size-3.5 shrink-0 text-primary" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-text-muted">
            © {new Date().getFullYear()} ÉpiSuivi — Plateforme nationale de
            surveillance
          </p>
        </div>
      </div>
    </div>
  );
}