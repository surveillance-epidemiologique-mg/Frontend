"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CaseFilters,
  EMPTY_FILTERS,
  type CaseFiltersValues,
  type FilterOption,
} from "@/components/cases/case-filters";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { ValidateCaseModal } from "@/features/lab/components/validate-case-modal";
import {
  fetchPendingCases,
  notifyPrescriber,
  validateCase,
} from "@/features/lab/services/lab";
import type { LabResultPayload, PendingCase } from "@/features/lab/types";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  Suspect: "Suspect",
  Confirme: "Confirmé",
  Invalide: "Invalidé",
};

export default function LaboratoirePage() {
  const { toast } = useToast();
  const [cases, setCases] = useState<PendingCase[]>([]);
  const [maladies, setMaladies] = useState<FilterOption[]>([]);
  const [centres, setCentres] = useState<FilterOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [filters, setFilters] = useState<CaseFiltersValues>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<PendingCase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [m, c, y] = await Promise.all([
          fetch("/api/maladies").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/centres").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/cas/years").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (!active) return;
        setMaladies(m);
        setCentres(c);
        setYears(y);
      } catch {
        // API indisponible : listes vides
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const loadCases = useCallback(async () => {
    const data = await fetchPendingCases(filters);
    setCases(data);
  }, [filters]);

  useEffect(() => {
    const id = setTimeout(() => {
      void (async () => {
        try {
          await loadCases();
        } catch {
          toast({
            title: "Erreur",
            description: "Erreur de chargement des cas.",
            variant: "error",
          });
          setCases([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 300);
    return () => clearTimeout(id);
  }, [loadCases, toast]);

  function openValidation(cas: PendingCase) {
    setSelected(cas);
    setModalOpen(true);
  }

  async function handleValidate(id: number, payload: LabResultPayload) {
    await validateCase(id, payload);

    toast({
      title: "Cas validé",
      description: `Cas #${id} → ${
        payload.diagnosticStatus === "Confirme" ? "Confirmé" : "Invalidé"
      }.`,
      variant: "success",
    });

    setModalOpen(false);
    setSelected(null);

    // NOTIF-01 : notification au médecin prescripteur (best-effort)
    notifyPrescriber(id, payload.diagnosticStatus);

    // Rafraîchit la liste « en attente » (le cas quitte la liste si statut ≠ Suspect)
    try {
      const fresh = await fetchPendingCases(filters);
      setCases(fresh);
    } catch {
      setCases((prev) => prev.filter((cas) => cas.id !== id));
    }
  }

  const columns: Column<PendingCase>[] = [
    {
      key: "patient",
      header: "Nom du patient",
      cell: (c) => (
        <span className="font-medium text-text-main">
          {c.patient.namePatient ?? "—"}
        </span>
      ),
    },
    {
      key: "code",
      header: "Code anonyme",
      cell: (c) => (
        <span className="font-mono text-xs font-medium text-text-muted">
          {c.patient.anonymousCode}
        </span>
      ),
    },
    {
      key: "maladie",
      header: "Maladie",
      cell: (c) => <span>{c.maladie.name}</span>,
    },
    {
      key: "centre",
      header: "Centre de santé",
      cell: (c) => (
        <span className="text-text-main">
          {c.centre.name}
          {c.centre.zone?.name ? (
            <span className="block text-xs text-text-muted">
              {c.centre.zone.name}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "agent",
      header: "Médecin déclarant",
      cell: (c) => <span className="text-text-muted">{c.agent.name}</span>,
    },
    {
      key: "date",
      header: "Date de déclaration",
      cell: (c) => (
        <span className="whitespace-nowrap text-text-muted">
          {formatDate(c.diagnosisDate)}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut actuel",
      cell: (c) => (
        <Badge variant={c.diagnosticStatus === "Suspect" ? "warning" : "secondary"} dot>
          {STATUS_LABEL[c.diagnosticStatus] ?? c.diagnosticStatus}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (c) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openValidation(c)}
          aria-label={`Valider le cas ${c.patient.anonymousCode}`}
        >
          <ClipboardCheck className="size-4" />
          Valider le cas
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratoire"
        description="Cas suspects en attente d'analyse et de validation."
      />

      <Card>
        <CaseFilters
          values={filters}
          onChange={setFilters}
          years={years}
          centres={centres}
          maladies={maladies}
          showStatut={false}
        />

        <DataTable
          columns={columns}
          data={cases}
          getRowId={(c) => String(c.id)}
          loading={loading}
          pageSize={10}
          ariaLabel="Cas en attente d'analyse"
          emptyState={
            <EmptyState
              icon={FlaskConical}
              title={loading ? "Chargement…" : "Aucun cas en attente"}
              description={
                loading
                  ? "Récupération des cas…"
                  : "Tous les cas suspects ont été analysés."
              }
            />
          }
        />
      </Card>

      <ValidateCaseModal
        key={selected ? `validation-${selected.id}-${modalOpen}` : "none"}
        cas={selected}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSubmit={handleValidate}
      />
    </div>
  );
}