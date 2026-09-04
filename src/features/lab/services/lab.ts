import {
  buildCasQueryString,
  type CaseFiltersValues,
} from "@/components/cases/case-filters";
import type { LabResultPayload, PendingCase } from "@/features/lab/types";

export function fetchPendingCases(
  filters: CaseFiltersValues,
): Promise<PendingCase[]> {
  return fetch(`/api/cas/laboratoire${buildCasQueryString(filters)}`)
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => (Array.isArray(data) ? data : []));
}

export async function validateCase(
  id: number,
  payload: LabResultPayload,
): Promise<unknown> {
  const res = await fetch(`/api/cas/${id}/result`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      body?.message ?? "Impossible d'enregistrer le résultat.",
    );
  }

  return body;
}

/**
 * NOTIF-01 · Notification au médecin prescripteur.
 * Appel « best-effort » : une erreur d'envoi ne doit jamais bloquer la
 * validation du résultat.
 */
export function notifyPrescriber(casId: number, status: string): void {
  void fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "RESULTAT_LABO",
      casId,
      title: "Résultat d'analyse disponible",
      message: `Le résultat du laboratoire pour le cas #${casId} est disponible (${status}).`,
    }),
  }).catch(() => {
    // Notification non bloquante : on ignore les erreurs
  });
}