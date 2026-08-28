"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle,
  MapPin,
  Skull,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardLayout from "./components/DashboardLayout";
import { fetchMapOptions } from "@/features/map/services/map";
import { fetchMapStats } from "@/features/map/services/map";
import type { EstablishmentMapData, RegionMapData } from "@/features/map/services/map";
import {
  fetchSurveillance,
  type SurveillanceData,
} from "@/features/dashboard/services/surveillance";

// Carte satellite (Leaflet + Esri) : chargée uniquement côté client
const DashboardMap = dynamic(
  () =>
    import("@/features/map/components/map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full rounded-lg bg-[#081a29]" />,
  },
);

const pieColors = [
  "#2563eb",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#f97316",
  "#94a3b8",
];

const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function monthLabel(date: string): string {
  const parts = date.split("-");
  if (parts.length >= 2) {
    const m = Number(parts[1]);
    return MONTHS[m - 1] ?? date;
  }
  return date;
}

export default function DashboardPage() {
  const [year, setYear] = useState("2026");
  const [regionId, setRegionId] = useState("");
  const [diseaseId, setDiseaseId] = useState("");
  const [maladies, setMaladies] = useState<{ id: number; name: string }[]>([]);
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [data, setData] = useState<SurveillanceData | null>(null);
  const [districts, setDistricts] = useState<
    { district: string; region: string; cases: number }[]
  >([]);
  const [establishments, setEstablishments] = useState<
    { id: number; name: string; type: string; region: string; district: string; address: string | null; latitude: number | null; longitude: number | null; isActive: boolean; cases: number; niveau: string }[]
  >([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Options réelles (maladies + régions)
  useEffect(() => {
    let active = true;
    fetchMapOptions()
      .then((options) => {
        if (!active) return;
        setMaladies(options.maladies);
        setRegions(options.regions.map((r) => ({ id: r.id, name: r.name })));
        if (options.maladies.length > 0) {
          setDiseaseId(String(options.maladies[0].id));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Données réelles selon année + région + maladie
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const from = `${year}-01-01`;
        const to = `${year}-12-31`;
        const maladieId = diseaseId ? Number(diseaseId) : undefined;
        const region = regionId ? Number(regionId) : undefined;

        const [surv, map] = await Promise.all([
          fetchSurveillance({ from, to, maladieId, regionId: region }),
          fetchMapStats({ from, to, maladieId, regionId: region }),
        ]);
        if (!active) return;

        setData(surv);
        setEstablishments(
          map.establishments.map((e) => ({
            id: e.id,
            name: e.name,
            type: e.type,
            region: e.region,
            district: e.district,
            address: e.address,
            latitude: e.latitude,
            longitude: e.longitude,
            isActive: e.isActive,
            cases: e.cases,
            niveau: e.niveau,
          })),
        );

        // Agrégation des cas par district (données réelles des établissements)
        const districtMap = new Map<string, { region: string; cases: number }>();
        for (const est of map.establishments) {
          const current = districtMap.get(est.district) ?? {
            region: est.region,
            cases: 0,
          };
          current.cases += est.cases;
          districtMap.set(est.district, current);
        }
        setDistricts(
          [...districtMap.entries()]
            .map(([district, info]) => ({
              district,
              region: info.region,
              cases: info.cases,
            }))
            .sort((a, b) => b.cases - a.cases)
            .slice(0, 5),
        );
      } catch {
        // L'API peut être indisponible
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [year, regionId, diseaseId]);

  const kpis = data?.kpis;

  const total = kpis?.total ?? 0;
  const confirmed = kpis?.confirmed ?? 0;
  const suspected = kpis?.suspected ?? 0;
  const deceased = kpis?.deceased ?? 0;

  const confirmationRate =
    total > 0 ? ((confirmed / total) * 100).toFixed(1) : "0.0";
  const fatalityRate = kpis?.cfr ?? 0;
  const recoveryRate =
    total > 0 ? (((kpis?.recovered ?? 0) / total) * 100).toFixed(1) : "0.0";

  const alertes = data?.activeAlerts ?? [];
  const epidemiesDistricts = new Set(alertes.map((a) => a.zone)).size;
  const foyers =
    data?.regions.filter(
      (r) => r.total > 0 && (r.niveau === "Eleve" || r.niveau === "Critique"),
    ).length ?? 0;

  // Courbe d'évolution (3 séries)
  const evolutionData = (data?.evolution ?? []).slice(-12).map((point) => ({
    mois: monthLabel(point.date),
    suspects: point.suspected,
    confirmes: point.confirmed,
    deces: point.deceased,
  }));

  // Répartition par région (pie + barres)
  const regionData = useMemo(
    () =>
      (data?.regions ?? [])
        .filter((r) => r.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
        .map((r) => ({ name: r.region, value: r.total })),
    [data],
  );
  const maxRegion = Math.max(1, ...regionData.map((r) => r.value));

  const selectedDisease =
    maladies.find((m) => String(m.id) === diseaseId)?.name ??
    "Toutes les maladies";

  // Données pour la carte satellite (22 régions colorées)
  const regionMapData = (data?.regions ?? []).map((r) => ({
    regionId: r.regionId,
    region: r.region,
    total: r.total,
    newCases: r.newCases,
    active: r.active,
    confirmed: r.confirmed,
    recovered: r.recovered,
    deceased: r.deceased,
    establishmentsCount: r.establishmentsCount,
    niveau: r.niveau,
    alerteLevel: null,
  }));

  const selectedRegionInfo =
    selectedRegionId != null
      ? (data?.regions ?? []).find((r) => r.regionId === selectedRegionId) ??
        null
      : null;

  const lastUpdate = data?.meta.generatedAt
    ? new Date(data.meta.generatedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#020b16] p-4 text-white">
        {/* HEADER */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              TABLEAU DE BORD ÉPIDÉMIOLOGIQUE
            </h1>
            <p className="text-sm text-slate-400">
              Surveillance des maladies prioritaires — Madagascar
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="dashboard-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Année"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            <select
              className="dashboard-select"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              aria-label="Région"
            >
              <option value="">Toutes les régions</option>
              {regions.map((region) => (
                <option key={region.id} value={String(region.id)}>
                  {region.name}
                </option>
              ))}
            </select>

            <select
              className="dashboard-select"
              value={diseaseId}
              onChange={(e) => setDiseaseId(e.target.value)}
              aria-label="Maladie"
            >
              <option value="">Toutes les maladies</option>
              {maladies.map((maladie) => (
                <option key={maladie.id} value={String(maladie.id)}>
                  {maladie.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#071523] px-4 py-2 text-xs">
              <CalendarDays size={16} />
              Dernière mise à jour
              <strong>{lastUpdate}</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Chargement…</p>
        ) : null}

        {/* LIGNE 1 */}
        <div className="grid grid-cols-12 gap-3">
          {/* KPI */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-7">
            <h2 className="mb-3 text-sm font-semibold uppercase text-emerald-400">
              Indicateurs principaux
            </h2>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                title="Cas suspects"
                value={formatNumber(suspected)}
                icon={<Users size={20} />}
                className="text-orange-400"
              />
              <StatCard
                title="Cas confirmés"
                value={formatNumber(confirmed)}
                icon={<CheckCircle size={20} />}
                className="text-green-400"
              />
              <StatCard
                title="Décès"
                value={formatNumber(deceased)}
                icon={<Skull size={20} />}
                className="text-red-400"
              />
              <StatCard
                title="Total des cas"
                value={formatNumber(total)}
                icon={<Activity size={20} />}
                className="text-blue-400"
              />
            </div>
          </section>

          {/* TAUX */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-3">
            <h2 className="text-sm font-semibold uppercase text-emerald-400">
              Taux de confirmation
            </h2>
            <div className="mt-3 text-3xl font-bold">{confirmationRate}%</div>
            <p className="text-sm text-slate-400">
              {formatNumber(confirmed)} / {formatNumber(total)} cas
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded bg-slate-800">
              <div
                className="h-full rounded bg-green-500"
                style={{ width: `${Math.min(100, Number(confirmationRate))}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </section>

          {/* ALERTES */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-red-400">
              <Bell size={17} />
              Alertes
            </h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <strong className="text-red-400">{epidemiesDistricts}</strong>
                <span>Districts en épidémie</span>
              </div>
              <div className="flex justify-between">
                <strong className="text-orange-400">{alertes.length}</strong>
                <span>Alertes actives</span>
              </div>
              <div className="flex justify-between">
                <strong className="text-yellow-400">{foyers}</strong>
                <span>Foyers prioritaires</span>
              </div>
            </div>
          </section>
        </div>

        {/* LIGNE 2 */}
        <div className="mt-3 grid grid-cols-12 gap-3">
          {/* GRAPHIQUE */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-5">
            <h2 className="text-sm font-semibold uppercase">
              Évolution des cas dans le temps
            </h2>
            <p className="text-xs text-slate-500">
              {selectedDisease} — {year}
            </p>
            <div className="mt-3 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="mois" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="suspects"
                    stroke="#f97316"
                    strokeWidth={2}
                    name="Suspects"
                  />
                  <Line
                    type="monotone"
                    dataKey="confirmes"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Confirmés"
                  />
                  <Line
                    type="monotone"
                    dataKey="deces"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Décès"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* PIE */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-4">
            <h2 className="text-sm font-semibold uppercase">
              Répartition des cas par région
            </h2>
            <div className="flex h-[280px] items-center">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={90}
                  >
                    {regionData.map((_, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 text-xs">
                {regionData.map((region, index) => (
                  <div key={region.name} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    />
                    <span>{region.name}</span>
                    <span className="text-slate-400">{formatNumber(region.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* REGION */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-3">
            <h2 className="text-sm font-semibold uppercase">Cas par région</h2>
            <div className="mt-4 space-y-4">
              {regionData.map((region, index) => (
                <div key={region.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{region.name}</span>
                    <span>{formatNumber(region.value)}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-800">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(region.value / maxRegion) * 100}%`,
                        backgroundColor: pieColors[index % pieColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* LIGNE 3 */}
        <div className="mt-3 grid grid-cols-12 gap-3">
          {/* CARTE */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-6">
            <h2 className="text-sm font-semibold uppercase">
              Répartition géographique des cas à Madagascar
            </h2>
            <div className="relative mt-3 h-[360px] w-full overflow-hidden rounded-lg">
              <DashboardMap
                regionsData={regionMapData}
                establishments={establishments}
                selectedRegionId={selectedRegionId}
                onSelectRegion={(id) => setSelectedRegionId(id)}
                onSelectEstablishment={() => {}}
                theme="dark"
              />

              {/* INFORMATIONS RÉGION */}
              {selectedRegionInfo ? (
                <div className="absolute left-3 top-3 z-[1000] w-[210px] rounded-lg border border-slate-700 bg-[#061321]/95 p-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {selectedRegionInfo.region}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedRegionId(null)}
                      className="text-slate-400 hover:text-white"
                      aria-label="Fermer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cas suspects</span>
                      <strong className="text-orange-400">
                        {formatNumber(selectedRegionInfo.suspected)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cas confirmés</span>
                      <strong className="text-green-400">
                        {formatNumber(selectedRegionInfo.confirmed)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Décès</span>
                      <strong className="text-red-400">
                        {formatNumber(selectedRegionInfo.deceased)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* INDICATEURS */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-3">
            <h2 className="text-sm font-semibold uppercase">
              Indicateurs complémentaires
            </h2>
            <div className="mt-4 divide-y divide-slate-800">
              <InfoRow label="Incidence / 100 000 hab." value="—" />
              <InfoRow label="Prévalence / 100 000 hab." value="—" />
              <InfoRow label="Taux de létalité" value={`${fatalityRate}%`} />
              <InfoRow label="Taux de guérison" value={`${recoveryRate}%`} />
              <InfoRow label="Cas en cours" value={formatNumber(kpis?.active ?? 0)} />
              <InfoRow
                label="Nouveaux cas (7 j)"
                value={formatNumber(kpis?.newCases ?? 0)}
                danger
              />
            </div>
          </section>

          {/* TOP DISTRICTS */}
          <section className="col-span-12 rounded-xl border border-slate-800 bg-[#061321] p-4 xl:col-span-3">
            <h2 className="text-sm font-semibold uppercase">
              Top 5 districts touchés
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
              {districts.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-500">
                  Aucune donnée sur la période
                </div>
              ) : (
                districts.map((d) => (
                  <div
                    key={d.district}
                    className="grid grid-cols-3 border-b border-slate-800 px-3 py-3 text-xs last:border-0"
                  >
                    <span>{d.district}</span>
                    <span className="text-slate-400">{d.region}</span>
                    <span className="text-right font-semibold">
                      {formatNumber(d.cases)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#081a29] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${className}`}>{value}</p>
          <p className="mt-2 text-[11px] text-emerald-400">
            ↗ données réelles
          </p>
        </div>
        <div className={className}>{icon}</div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between py-3 text-sm">
      <span className={danger ? "text-red-400" : "text-slate-300"}>{label}</span>
      <strong className={danger ? "text-red-400" : "text-slate-100"}>
        {value}
      </strong>
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}