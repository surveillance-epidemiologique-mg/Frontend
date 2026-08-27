"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Upload,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import {
  fetchReport,
  fetchReportOptions,
  importCsvFile,
  importJsonRows,
  reportExportUrl,
  type ReportDataset,
  type ReportQuery,
  type ReportType,
} from "@/features/reports/services/reports";
import type { SignalementOptions } from "@/features/cases/types";
import { formatDate } from "@/lib/utils";

const TYPES: { value: ReportType; label: string }[] = [
  { value: "daily", label: "Journalier" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
  { value: "disease", label: "Par maladie" },
  { value: "region", label: "Par région" },
  { value: "custom", label: "Personnalisé" },
];

export function ReportsPage() {
  const { toast } = useToast();
  const [options, setOptions] = useState<SignalementOptions | null>(null);
  const [type, setType] = useState<ReportType>("weekly");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [maladieId, setMaladieId] = useState("");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [report, setReport] = useState<ReportDataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // import
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: { row: number; reason: string }[];
  } | null>(null);
  const [jsonImport, setJsonImport] = useState("");

  const region = options?.regions.find((r) => String(r.id) === regionId);

  useEffect(() => {
    let active = true;
    fetchReportOptions()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function currentQuery(): ReportQuery {
    const query: ReportQuery = {
      type,
      maladieId: maladieId ? Number(maladieId) : undefined,
      regionId: regionId ? Number(regionId) : undefined,
      districtId: districtId ? Number(districtId) : undefined,
    };
    if (type === "custom" || type === "disease" || type === "region") {
      if (from) query.from = from;
      if (to) query.to = to;
    }
    return query;
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReport(currentQuery());
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Génération impossible.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCsvImport(file: File) {
    try {
      const result = await importCsvFile(file);
      setImportResult(result);
      toast({
        title: "Import CSV terminé",
        description: `${result.imported} insérés, ${result.skipped} doublons.`,
        variant: result.errors.length ? "warning" : "success",
      });
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Import impossible.",
        variant: "error",
      });
    }
  }

  async function handleJsonImport() {
    try {
      const parsed = JSON.parse(jsonImport);
      if (!Array.isArray(parsed)) {
        throw new Error("Le JSON doit être un tableau de lignes.");
      }
      const result = await importJsonRows(parsed);
      setImportResult(result);
      toast({ title: "Import JSON terminé", variant: "success" });
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "JSON invalide.",
        variant: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports"
        description="Génération, export et import de données épidémiologiques."
      />

      <Card>
        <CardHeader>
          <CardTitle>Générer un rapport</CardTitle>
          <CardDescription>
            Choisissez un type, des filtres et une période, puis exportez en CSV
            ou PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Select
              label="Type de rapport"
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
              options={TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <Select
              label="Maladie"
              value={maladieId}
              onChange={(e) => setMaladieId(e.target.value)}
              placeholder="Toutes"
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
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Du"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <Input
                label="Au"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleGenerate} loading={loading}>
              <FileText className="size-4" />
              Générer l&apos;aperçu
            </Button>
            <Button
              variant="outline"
              asChild
              disabled={!report}
            >
              <a href={report ? reportExportUrl(currentQuery(), "csv") : "#"}>
                <FileSpreadsheet className="size-4" />
                Exporter CSV
              </a>
            </Button>
            <Button variant="outline" asChild disabled={!report}>
              <a href={report ? reportExportUrl(currentQuery(), "pdf") : "#"}>
                <FileDown className="size-4" />
                Exporter PDF
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {report ? (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Total de cas" value={String(report.totals.total)} icon={FileText} tone="primary" />
            <StatCard title="Confirmés" value={String(report.totals.confirmed)} icon={FileText} tone="danger" />
            <StatCard title="Suspects" value={String(report.totals.suspect)} icon={FileText} tone="warning" />
            <StatCard title="Guéris" value={String(report.totals.recovered)} icon={FileText} tone="success" />
            <StatCard title="Décès" value={String(report.totals.deceased)} icon={FileText} tone="danger" />
            <StatCard title="Létalité" value={`${report.totals.lethalityRate}%`} icon={FileText} tone="warning" />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Par maladie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {report.byDisease.map((d) => (
                    <div key={d.maladie} className="flex items-center justify-between py-2">
                      <span className="text-sm text-text-main">{d.maladie}</span>
                      <span className="text-sm text-text-muted">
                        {d.total} cas · {d.deceased} décès
                      </span>
                    </div>
                  ))}
                  {report.byDisease.length === 0 ? (
                    <p className="py-4 text-center text-sm text-text-muted">Aucune donnée.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Par région</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {report.byRegion.map((r) => (
                    <div key={r.region} className="flex items-center justify-between py-2">
                      <span className="text-sm text-text-main">{r.region}</span>
                      <span className="text-sm text-text-muted">
                        {r.total} cas · {r.deceased} décès
                      </span>
                    </div>
                  ))}
                  {report.byRegion.length === 0 ? (
                    <p className="py-4 text-center text-sm text-text-muted">Aucune donnée.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Signalements</CardTitle>
              <CardDescription>
                {report.signalements.total} signalements · {report.signalements.enAttente} en
                attente · {report.signalements.valides} validés · {report.signalements.rejetes}{" "}
                rejetés · {report.signalements.brouillons} brouillons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-text-muted">
                Période : {report.meta.from ? formatDate(report.meta.from) : "début"} →{" "}
                {report.meta.to ? formatDate(report.meta.to) : "aujourd'hui"} · généré le{" "}
                {formatDate(report.meta.generatedAt, {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Import de données</CardTitle>
          <CardDescription>
            Import de signalements (admin) : fichiers CSV validés ligne par ligne
            (doublons et données incohérentes rejetés).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvImport(file);
              }}
              className="block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            />
            <Button variant="outline" asChild disabled>
              <span>
                <Upload className="size-4" />
                Importer CSV
              </span>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="JSON à importer (tableau de lignes)"
              value={jsonImport}
              onChange={(e) => setJsonImport(e.target.value)}
              placeholder='[{"maladie":"Choléra","region":"Analamanga","district":"Antananarivo Renivohitra","centre":"CSB2 Ambohidratrimo","date":"2026-08-27","suspects":2,"confirmes":1}]'
              className="font-mono text-xs"
            />
            <div className="flex items-end">
              <Button variant="outline" onClick={handleJsonImport} className="w-full">
                <Download className="size-4" />
                Importer JSON
              </Button>
            </div>
          </div>

          {importResult ? (
            <Alert variant={importResult.errors.length ? "warning" : "success"}>
              <div className="space-y-1">
                <p>
                  Import terminé : <strong>{importResult.imported}</strong> inséré
                  (s), <strong>{importResult.skipped}</strong> doublon(s),{" "}
                  <strong>{importResult.errors.length}</strong> erreur(s).
                </p>
                {importResult.errors.map((err) => (
                  <p key={err.row} className="text-xs">
                    Ligne {err.row} : {err.reason}
                  </p>
                ))}
              </div>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}