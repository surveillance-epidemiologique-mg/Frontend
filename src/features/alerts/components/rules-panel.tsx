"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import {
  createRule,
  deleteRule,
  fetchRules,
  updateRule,
} from "@/features/alerts/services/alerts";
import type {
  AlertNiveauRisque,
  AlerteOptions,
  RegleAlerte,
} from "@/features/alerts/types";

const NIVEAUX: AlertNiveauRisque[] = [
  "Normal",
  "Surveillance",
  "Alerte",
  "Critique",
];

interface RulesPanelProps {
  options: AlerteOptions | null;
  onRulesChanged: () => void;
}

export function RulesPanel({ options, onRulesChanged }: RulesPanelProps) {
  const { toast } = useToast();
  const [rules, setRules] = useState<RegleAlerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [maladieId, setMaladieId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [periodDays, setPeriodDays] = useState(7);
  const [threshold, setThreshold] = useState(1);
  const [niveau, setNiveau] = useState<AlertNiveauRisque>("Alerte");
  const [busy, setBusy] = useState(false);

  const region = options?.regions.find((r) => String(r.id) === regionId);

  async function load() {
    try {
      const data = await fetchRules();
      setRules(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les règles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchRules();
        if (active) {
          setRules(data);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error ? e.message : "Impossible de charger les règles.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await createRule({
        name: name.trim(),
        maladieId: maladieId ? Number(maladieId) : undefined,
        zoneId: districtId ? Number(districtId) : Number(regionId),
        periodDays,
        threshold,
        niveau,
      });
      toast({ title: "Règle créée", variant: "success" });
      setName("");
      setMaladieId("");
      setRegionId("");
      setDistrictId("");
      setShowForm(false);
      await load();
      onRulesChanged();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Impossible de créer la règle.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(rule: RegleAlerte) {
    try {
      const updated = await updateRule(rule.id, { active: !rule.active });
      setRules((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      onRulesChanged();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Action impossible.",
        variant: "error",
      });
    }
  }

  async function handleDelete(rule: RegleAlerte) {
    try {
      await deleteRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      toast({ title: "Règle supprimée", variant: "success" });
      onRulesChanged();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Suppression impossible.",
        variant: "error",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Règles de détection</CardTitle>
          <CardDescription>
            Configurations des seuils déclenchant une alerte automatique.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Ajouter une règle
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}

        {showForm ? (
          <form
            onSubmit={handleCreate}
            className="grid gap-4 rounded-xl border border-border bg-bg-app p-4 sm:grid-cols-3"
          >
            <Input
              label="Nom de la règle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Choléra - 2 cas / 7 j"
              required
            />
            <Select
              label="Maladie (optionnel)"
              value={maladieId}
              onChange={(e) => setMaladieId(e.target.value)}
              placeholder="Toutes les maladies"
              options={(options?.maladies ?? []).map((m) => ({
                value: String(m.id),
                label: m.name,
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Région"
                value={regionId}
                onChange={(e) => {
                  setRegionId(e.target.value);
                  setDistrictId("");
                }}
                placeholder="Région"
                options={(options?.regions ?? []).map((r) => ({
                  value: String(r.id),
                  label: r.name,
                }))}
                required
              />
              <Select
                label="District"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                placeholder="Tout"
                disabled={!regionId}
                options={(region?.districts ?? []).map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))}
              />
            </div>
            <Input
              label="Fenêtre (jours)"
              type="number"
              min={1}
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value) || 1)}
            />
            <Input
              label="Seuil (cas)"
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value) || 1)}
            />
            <Select
              label="Niveau déclenché"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value as AlertNiveauRisque)}
              options={NIVEAUX.map((n) => ({ value: n, label: n }))}
            />
            <div className="flex items-end justify-end gap-2 sm:col-span-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit" loading={busy}>
                Créer la règle
              </Button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <p className="py-4 text-center text-sm text-text-muted">Chargement...</p>
        ) : (
          <div className="divide-y divide-border">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-text-main">
                      {rule.name}
                    </p>
                    <Badge variant={rule.active ? "success" : "default"}>
                      {rule.active ? "Active" : "Désactivée"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {rule.maladie?.name ?? "Toutes maladies"} · {rule.zone.name} ·{" "}
                    {rule.threshold} cas / {rule.periodDays} j · Niveau{" "}
                    {rule.niveau}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(rule)}
                >
                  <RefreshCw className="size-3.5" />
                  {rule.active ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(rule)}
                  aria-label={`Supprimer ${rule.name}`}
                >
                  <Trash2 className="size-3.5 text-error" />
                </Button>
              </div>
            ))}
            {rules.length === 0 ? (
              <p className="py-4 text-center text-sm text-text-muted">
                Aucune règle configurée.
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}