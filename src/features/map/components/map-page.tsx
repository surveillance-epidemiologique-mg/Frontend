"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { useTheme } from "@/features/theme/theme-provider";
import { MapView } from "@/features/map/components/map-view";
import { NIVEAU_COLORS, NIVEAUX } from "@/features/map/constants";
import {
  fetchMapOptions,
  fetchMapStats,
  TYPES_ETABLISSEMENT,
  type EstablishmentMapData,
  type NiveauEpidemiologique,
  type RegionMapData,
} from "@/features/map/services/map";
import type { SignalementOptions } from "@/features/cases/types";

type PeriodKey = "7d" | "30d" | "90d" | "all";

function periodRange(period: PeriodKey): { from?: string; to?: string } {
  const to = new Date();
  if (period === "all") return {};
  const from = new Date();
  if (period === "7d") from.setDate(to.getDate() - 7);
  else if (period === "30d") from.setDate(to.getDate() - 30);
  else if (period === "90d") from.setDate(to.getDate() - 90);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function MapPage() {
  const { theme } = useTheme();
  const [options, setOptions] = useState<SignalementOptions | null>(null);
  const [regionsData, setRegionsData] = useState<RegionMapData[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // filtres
  const [maladieId, setMaladieId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [typeEtablissement, setTypeEtablissement] = useState("");
  const [niveauFilter, setNiveauFilter] = useState<NiveauEpidemiologique | "">("");

  // sélection
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState<EstablishmentMapData | null>(null);
  const [regionQuery, setRegionQuery] = useState("");

  const region = options?.regions.find((r) => String(r.id) === regionId);

  useEffect(() => {
    let active = true;
    fetchMapOptions()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const raf = requestAnimationFrame(() => {
      const { from, to } = periodRange(period);

      setLoading(true);
      fetchMapStats({
        maladieId: maladieId ? Number(maladieId) : undefined,
        regionId: regionId ? Number(regionId) : undefined,
        districtId: districtId ? Number(districtId) : undefined,
        from,
        to,
        typeEtablissement: typeEtablissement || undefined,
      })
        .then((data) => {
          if (!active) return;
          setRegionsData(data.regions);
          setEstablishments(data.establishments);
          setError(null);
        })
        .catch((e) => {
          if (active) {
            setError(e instanceof Error ? e.message : "Impossible de charger la carte.");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [maladieId, regionId, districtId, period, typeEtablissement, reloadKey]);

  const filteredRegions = useMemo(
    () =>
      niveauFilter
        ? regionsData.filter((r) => r.niveau === niveauFilter)
        : regionsData,
    [regionsData, niveauFilter],
  );

  const regionSearchResults = useMemo(() => {
    const q = regionQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return regionsData
      .filter((r) => r.region.toLowerCase().includes(q))
      .slice(0, 5);
  }, [regionQuery, regionsData]);

  const selectedRegion =
    regionsData.find((r) => r.regionId === selectedRegionId) ?? null;

  function handleSelectRegion(id: number) {
    setSelectedRegionId(id);
    setSelectedEstablishment(null);
  }

  function handleSelectEstablishment(establishment: EstablishmentMapData) {
    setSelectedEstablishment(establishment);
    setSelectedRegionId(null);
  }

  const niveauLabel: Record<NiveauEpidemiologique, string> = {
    Aucun: "Aucun cas",
    Faible: "Faible",
    Modere: "Modéré",
    Eleve: "Élevé",
    Critique: "Critique",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carte épidémiologique"
        description="Carte interactive des régions de Madagascar et des établissements de santé."
      />

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Select
              label="Maladie"
              value={maladieId}
              onChange={(e) => setMaladieId(e.target.value)}
              placeholder="Toutes les maladies"
              options={(options?.maladies ?? []).map((m) => ({
                value: String(m.id),
                label: m.name,
              }))}
            />
            <Select
              label="Région"
              value={regionId}
              onChange={(e) => {
                setRegionId(e.target.value);
                setDistrictId("");
              }}
              placeholder="Toutes"
              options={(options?.regions ?? []).map((r) => ({
                value: String(r.id),
                label: r.name,
              }))}
            />
            <Select
              label="District"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              placeholder="Tous"
              disabled={!regionId}
              options={(region?.districts ?? []).map((d) => ({
                value: String(d.id),
                label: d.name,
              }))}
            />
            <Select
              label="Période"
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
              options={[
                { value: "7d", label: "7 derniers jours" },
                { value: "30d", label: "30 derniers jours" },
                { value: "90d", label: "90 derniers jours" },
                { value: "all", label: "Toutes les périodes" },
              ]}
            />
            <Select
              label="Type d'établissement"
              value={typeEtablissement}
              onChange={(e) => setTypeEtablissement(e.target.value)}
              placeholder="Tous les types"
              options={TYPES_ETABLISSEMENT.map((t) => ({ value: t, label: t }))}
            />
            <Select
              label="Niveau d'alerte"
              value={niveauFilter}
              onChange={(e) => setNiveauFilter(e.target.value as NiveauEpidemiologique | "")}
              placeholder="Tous les niveaux"
              options={NIVEAUX.map((n) => ({ value: n, label: niveauLabel[n] }))}
            />
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-3">
            {error}
            <Button variant="ghost" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </span>
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Carte interactive</CardTitle>
                <CardDescription>
                  Cliquez sur une région ou un établissement pour plus de détails.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={regionQuery}
                  onChange={(e) => setRegionQuery(e.target.value)}
                  placeholder="Rechercher une région…"
                  className="pl-9"
                />
                {regionSearchResults.length > 0 ? (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-bg-surface shadow-lg">
                    {regionSearchResults.map((r) => (
                      <button
                        key={r.regionId}
                        type="button"
                        onClick={() => {
                          handleSelectRegion(r.regionId);
                          setRegionQuery("");
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg-app"
                      >
                        <MapPin className="size-3.5 text-text-muted" />
                        {r.region} · {r.total} cas
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[520px] w-full">
              {loading ? (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-bg-app/60 backdrop-blur-sm">
                  <p className="text-sm text-text-muted">Chargement des données…</p>
                </div>
              ) : null}
              <MapView
                regionsData={filteredRegions}
                establishments={establishments}
                selectedRegionId={selectedRegionId}
                onSelectRegion={handleSelectRegion}
                onSelectEstablishment={handleSelectEstablishment}
                theme={theme}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Légende</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {NIVEAUX.map((niveau) => (
                <div key={niveau} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="size-4 rounded-full border border-black/10"
                    style={{ backgroundColor: NIVEAU_COLORS[niveau] }}
                  />
                  <span className="text-text-main">{niveauLabel[niveau]}</span>
                </div>
              ))}
              <div className="pt-2 text-xs text-text-muted">
                Les niveaux sont calculés côté serveur à partir des cas réels
                enregistrés.
              </div>
            </CardContent>
          </Card>

          {selectedRegion ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedRegion.region}</CardTitle>
                <CardDescription>
                  Maladie sélectionnée :{" "}
                  {options?.maladies.find((m) => String(m.id) === maladieId)?.name ??
                    "Toutes"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow label="Niveau" value={niveauLabel[selectedRegion.niveau]} color={NIVEAU_COLORS[selectedRegion.niveau]} />
                <InfoRow label="Total de cas" value={String(selectedRegion.total)} />
                <InfoRow label="Nouveaux cas (7 j)" value={String(selectedRegion.newCases)} />
                <InfoRow label="Cas actifs" value={String(selectedRegion.active)} />
                <InfoRow label="Cas confirmés" value={String(selectedRegion.confirmed)} />
                <InfoRow label="Décès" value={String(selectedRegion.deceased)} />
                <InfoRow label="Guéris" value={String(selectedRegion.recovered)} />
                <InfoRow label="Établissements" value={String(selectedRegion.establishmentsCount)} />
                {selectedRegion.alerteLevel ? (
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <AlertTriangle className="size-4 text-warning" />
                    Alerte : {selectedRegion.alerteLevel}
                  </div>
                ) : null}
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setRegionId(String(selectedRegion.regionId))}>
                  Filtrer sur cette région
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {selectedEstablishment ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  {selectedEstablishment.name}
                </CardTitle>
                <CardDescription>
                  {selectedEstablishment.type} · {selectedEstablishment.region}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow label="District" value={selectedEstablishment.district} />
                <InfoRow label="Adresse" value={selectedEstablishment.address ?? "—"} />
                <InfoRow
                  label="Coordonnées"
                  value={
                    selectedEstablishment.latitude != null
                      ? `${selectedEstablishment.latitude.toFixed(4)}, ${selectedEstablishment.longitude?.toFixed(4)}`
                      : "Non renseignées"
                  }
                />
                <InfoRow label="Cas (maladie)" value={String(selectedEstablishment.cases)} />
                <InfoRow label="Niveau" value={niveauLabel[selectedEstablishment.niveau]} color={NIVEAU_COLORS[selectedEstablishment.niveau]} />
                <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                  <Link href="/etablissements">Voir les détails de l&apos;établissement</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-main" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}