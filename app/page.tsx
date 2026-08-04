export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <span className="inline-block rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Madagascar
        </span>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Surveillance épidémiologique
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Plateforme de suivi et d&apos;analyse des données de santé publique.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Accéder au tableau de bord
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            En savoir plus
          </button>
        </div>
      </div>
    </main>
  );
}
