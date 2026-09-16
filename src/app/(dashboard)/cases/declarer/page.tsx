"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FlaskConical, Plus, Stethoscope, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ROLES } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface Option {
  id: number;
  name: string;
}

interface AnalyseRow {
  label: string;
  resultType: string;
}

const STEPS = [
  {
    icon: User,
    title: "Informations du patient",
    description:
      "Renseignez le nom, l'âge et le sexe du patient. Le centre de santé est automatiquement associé selon votre profil.",
  },
  {
    icon: Stethoscope,
    title: "Détails cliniques",
    description:
      "Sélectionnez la maladie suspectée et décrivez les symptômes observés. Le cas sera enregistré avec le statut Suspect.",
  },
  {
    icon: FlaskConical,
    title: "Analyses à réaliser",
    description:
      "Indiquez les analyses à demander au laboratoire pour confirmer ou infirmer le diagnostic.",
  },
];

const RESULT_TYPE_OPTIONS = [
  { value: "Numerique", label: "Numérique" },
  { value: "ChoixPositifNegatif", label: "Positif / Négatif" },
  { value: "TexteLibre", label: "Texte libre" },
];

export default function DeclarerCasPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [me, setMe] = useState<{ role: string; centreId: number | null } | null>(
    null,
  );
  const [maladies, setMaladies] = useState<Option[]>([]);
  const [centres, setCentres] = useState<Option[]>([]);

  const [current, setCurrent] = useState(0);
  const [patient, setPatient] = useState({
    namePatient: "",
    age: "",
    gender: "",
  });
  const [clinical, setClinical] = useState({ maladieId: "", symptoms: "" });
  const [analyses, setAnalyses] = useState<AnalyseRow[]>([
    { label: "", resultType: "" },
  ]);
  const [centreId, setCentreId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [meData, m, c] = await Promise.all([
          fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/maladies").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/centres").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (!active) return;
        setMe(
          meData
            ? {
                role: meData.role?.name ?? "",
                centreId: meData.centreId ?? null,
              }
            : null,
        );
        setMaladies(m);
        setCentres(c);
      } catch {
        // API indisponible
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isMedecin = me?.role === ROLES.MEDECIN;
  const isLabo = me?.role === ROLES.LABORATOIRE;
  const medecinCentre = isMedecin
    ? centres.find((c) => c.id === me?.centreId)
    : undefined;
  const effectiveCentreId = isMedecin
    ? me?.centreId
      ? String(me.centreId)
      : ""
    : centreId;

  // Un agent de laboratoire ne peut pas déclarer de cas.
  useEffect(() => {
    if (isLabo) {
      router.replace("/cases");
    }
  }, [isLabo, router]);

  function canNext(step: number): boolean {
    if (step === 0) {
      return (
        patient.namePatient.trim().length >= 2 &&
        (isMedecin ? Boolean(me?.centreId) : Boolean(centreId))
      );
    }
    if (step === 1) {
      return Boolean(clinical.maladieId);
    }
    return (
      analyses.length >= 1 &&
      analyses.every((a) => a.label.trim().length >= 2 && Boolean(a.resultType))
    );
  }

  function goNext() {
    if (!canNext(current)) return;
    if (current < STEPS.length - 1) {
      setCurrent(current + 1);
    } else {
      void submit();
    }
  }

  function updateAnalyse(index: number, field: keyof AnalyseRow, value: string) {
    setAnalyses((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  }

  function addAnalyse() {
    setAnalyses((prev) => [...prev, { label: "", resultType: "" }]);
  }

  function removeAnalyse(index: number) {
    setAnalyses((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ label: "", resultType: "" }],
    );
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload = {
        newPatient: {
          namePatient: patient.namePatient.trim(),
          age: patient.age ? Number(patient.age) : undefined,
          gender: patient.gender || undefined,
        },
        maladieId: Number(clinical.maladieId),
        symptoms: clinical.symptoms || undefined,
        ...(isMedecin ? {} : { centreId: Number(centreId) }),
        analyses: analyses
          .filter((a) => a.label.trim() && a.resultType)
          .map((a) => ({
            label: a.label.trim(),
            typeResultatAttendu: a.resultType,
          })),
      };

      const res = await fetch("/api/cas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "Impossible de déclarer le cas.",
        );
      }

      toast({
        title: "Cas déclaré",
        description: `Cas #${body.id} enregistré (${body.patient.anonymousCode}) avec ${body.analyses?.length ?? 0} analyse(s).`,
        variant: "success",
      });
      router.push("/cases");
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Déclarer un cas"
        description="Assistant de déclaration en 3 étapes : patient, détails cliniques et analyses."
      />

      <div className="flex flex-col p-0 sm:p-6 lg:flex-row">
        {/* Stepper vertical — desktop */}
        <aside className="hidden lg:block flex-1/2">
          <ol className="relative flex flex-col">
            {STEPS.map((step, index) => {
              const state =
                current > index ? "done" : current === index ? "active" : "todo";
              const Icon = step.icon;
              const reachable = index <= current;
              return (
                <li
                  key={step.title}
                  className="relative flex items-start gap-4 pb-18 last:pb-0"
                >
                  {index < STEPS.length - 1 ? (
                    <span
                      className={cn(
                        "absolute left-[25px] top-[63px] h-[calc(100%-52px)] w-1",
                        current > index ? "bg-primary" : "bg-bg-muted",
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                  <button
                    type="button"
                    disabled={!reachable}
                    onClick={() => setCurrent(index)}
                    className="flex items-center gap-4 text-left disabled:cursor-not-allowed max-w-md"
                  >
                    <span
                      className={cn(
                        "grid size-14 shrink-0 place-items-center rounded-2xl transition-colors",
                        state === "todo"
                          ? "bg-bg-muted text-text-muted ring-1 ring-inset ring-border"
                          : "bg-primary text-primary-foreground shadow-sm shadow-primary/25",
                      )}
                    >
                      {state === "done" ? (
                        <Check className="size-6" />
                      ) : (
                        <Icon className="size-6" />
                      )}
                    </span>
                    <span className="pt-0.5">
                      <span
                        className={cn(
                          "block text-xl font-semibold",
                          state === "todo" ? "text-text-muted" : "text-primary",
                        )}
                      >
                        {step.title}
                      </span>
                      <span className="block text-sm text-text-muted">
                        {step.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Stepper compact — mobile */}
        <div className="mb-6 lg:hidden">
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const state =
                current > index ? "done" : current === index ? "active" : "todo";
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    disabled={index > current}
                    onClick={() => setCurrent(index)}
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl transition-colors disabled:cursor-not-allowed",
                      state === "todo"
                        ? "bg-bg-app text-text-muted ring-1 ring-inset ring-border"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {state === "done" ? (
                      <Check className="size-4" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </button>
                  {index < STEPS.length - 1 ? (
                    <span
                      className={cn(
                        "mx-2 h-0.5 flex-1 rounded-full",
                        current > index ? "bg-primary" : "bg-border",
                      )}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3">
            <p className="text-lg font-semibold text-text-main">
              {STEPS[current].title}
            </p>
            <p className="text-sm text-text-muted">
              Étape {current + 1} sur {STEPS.length} · {STEPS[current].description}
            </p>
          </div>
        </div>

        {/* Zone de formulaire */}
        <div className="w-full lg:flex-1/2">
          {current === 0 ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-text-main">
                  Informations du patient
                </h2>
                <p className="text-sm text-text-muted">
                  Créez un nouveau patient anonyme. Le code anonyme est généré
                  automatiquement à la déclaration.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nom du patient"
                  value={patient.namePatient}
                  onChange={(e) =>
                    setPatient((p) => ({ ...p, namePatient: e.target.value }))
                  }
                  placeholder="Patient 01"
                />
                <Input
                  label="Âge (années)"
                  type="number"
                  min={0}
                  value={patient.age}
                  onChange={(e) =>
                    setPatient((p) => ({ ...p, age: e.target.value }))
                  }
                  placeholder="34"
                />
                <Select
                  label="Sexe"
                  value={patient.gender}
                  onChange={(e) =>
                    setPatient((p) => ({ ...p, gender: e.target.value }))
                  }
                  placeholder="—"
                  options={[
                    { value: "M", label: "Masculin" },
                    { value: "F", label: "Féminin" },
                  ]}
                />
                {isMedecin ? (
                  <div className="space-y-1.5">
                    <Select
                      label="Centre de santé"
                      value={effectiveCentreId}
                      onChange={() => {}}
                      options={
                        medecinCentre
                          ? [
                              {
                                value: String(medecinCentre.id),
                                label: medecinCentre.name,
                              },
                            ]
                          : []
                      }
                      disabled
                    />
                    <p className="text-sm text-text-muted">
                      Centre rattaché à votre compte.
                    </p>
                  </div>
                ) : (
                  <Select
                    label="Centre de santé"
                    value={centreId}
                    onChange={(e) => setCentreId(e.target.value)}
                    placeholder="Sélectionner un centre"
                    options={centres.map((c) => ({
                      value: String(c.id),
                      label: c.name,
                    }))}
                  />
                )}
              </div>

              <p className="text-sm text-text-muted">
                Aucune donnée nominative n&apos;est stockée hors du nom saisi
                ci-dessus ; le code anonyme sera généré automatiquement.
              </p>
            </section>
          ) : null}

          {current === 1 ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-main">
                  Détails cliniques
                </h2>
                <p className="text-sm text-text-muted">
                  Renseignez la maladie suspectée et les symptômes observés. Le
                  statut initial est fixé à « Suspect » et la date de diagnostic
                  est enregistrée automatiquement.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Maladie"
                  value={clinical.maladieId}
                  onChange={(e) =>
                    setClinical((c) => ({ ...c, maladieId: e.target.value }))
                  }
                  placeholder="Sélectionner une maladie"
                  options={maladies.map((m) => ({
                    value: String(m.id),
                    label: m.name,
                  }))}
                />
                <Textarea
                  label="Symptômes"
                  value={clinical.symptoms}
                  onChange={(e) =>
                    setClinical((c) => ({ ...c, symptoms: e.target.value }))
                  }
                  placeholder="Fièvre, céphalées…"
                />
              </div>

              <div className="rounded-xl border border-dashed border-border p-3 text-sm text-text-muted">
                Statut initial : <strong>Suspect</strong> (non modifiable).
                Date du diagnostic : renseignée automatiquement au moment de la
                déclaration.
              </div>
            </section>
          ) : null}

          {current === 2 ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-text-main">
                  Analyses à réaliser
                </h2>
                <p className="text-sm text-text-muted">
                  Indiquez les analyses à effectuer pour confirmer le cas. Au
                  moins une analyse est requise.
                </p>
              </div>

              <div className="space-y-3">
                {analyses.map((a, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-end"
                  >
                    <Input
                      label="Libellé de l'analyse"
                      value={a.label}
                      onChange={(e) =>
                        updateAnalyse(index, "label", e.target.value)
                      }
                      placeholder="Ex : Test rapide paludisme, PCR…"
                      className="sm:flex-1"
                    />
                    <Select
                      label="Type de résultat"
                      value={a.resultType}
                      onChange={(e) =>
                        updateAnalyse(index, "resultType", e.target.value)
                      }
                      placeholder="—"
                      options={RESULT_TYPE_OPTIONS}
                      className="sm:w-52"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnalyse(index)}
                      aria-label="Supprimer cette analyse"
                    >
                      <Trash2 className="size-4 text-error" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" onClick={addAnalyse}>
                <Plus className="size-4" />
                Ajouter une analyse
              </Button>
            </section>
          ) : null}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={current === 0 || submitting}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              Précédent
            </Button>
            <Button
              type="button"
              disabled={!canNext(current)}
              loading={submitting}
              onClick={goNext}
            >
              {current === STEPS.length - 1
                ? submitting
                  ? "Déclaration…"
                  : "Déclarer le cas"
                : "Suivant"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}