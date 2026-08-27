"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  createZone,
  fetchZonesAdmin,
} from "@/features/settings/services/admin";
import type { Zone } from "@/types/auth";

const ZONE_TYPES = ["Region", "District", "Commune", "Fokontany"];

export function ZonesTab() {
  const { toast } = useToast();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Region");
  const [pcode, setPcode] = useState("");
  const [parentId, setParentId] = useState("");
  const [busy, setBusy] = useState(false);

  const regions = zones.filter((z) => z.type === "Region");
  const districts = zones.filter((z) => z.type === "District");

  async function load() {
    try {
      const data = await fetchZonesAdmin();
      setZones(data);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchZonesAdmin();
        if (active) {
          setZones(data);
        }
      } catch {
        // silence
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
      await createZone({
        name: name.trim(),
        type,
        pcode: pcode.trim() || undefined,
        parentId: parentId ? Number(parentId) : undefined,
      });
      toast({ title: "Zone créée", variant: "success" });
      setName("");
      setPcode("");
      setShowForm(false);
      await load();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Création impossible.",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">
            Zones administratives
          </h2>
          <p className="text-sm text-text-muted">
            Régions, districts, communes et fokontany.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Ajouter une zone
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-border bg-bg-app p-4 sm:grid-cols-5">
          <Input
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vakinankaratra"
            required
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={ZONE_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Input
            label="Code PCODE"
            value={pcode}
            onChange={(e) => setPcode(e.target.value)}
            placeholder="MG-V"
          />
          <Select
            label="Zone parente"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="Aucune"
            options={
              type === "District"
                ? regions.map((r) => ({ value: String(r.id), label: r.name }))
                : type === "Commune"
                  ? districts.map((d) => ({ value: String(d.id), label: d.name }))
                  : []
            }
          />
          <div className="flex items-end">
            <Button type="submit" loading={busy} className="w-full">
              Créer
            </Button>
          </div>
        </form>
      ) : null}

      <Card className="p-4">
        {loading ? (
          <p className="py-6 text-center text-sm text-text-muted">Chargement...</p>
        ) : zones.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">Aucune zone.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {zones.map((zone) => (
              <div key={zone.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-text-main">
                    {zone.name}
                  </p>
                  <Badge variant="info">{zone.type}</Badge>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {zone.codePcode ?? "—"}
                  {zone.parentId ? " · zone parente" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}