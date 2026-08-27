"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { SignalementForm } from "@/features/cases/components/signalement-form";
import { SignalementsList } from "@/features/cases/components/signalements-list";
import {
  createSignalement,
  fetchSignalementOptions,
  fetchSignalements,
  updateSignalement,
} from "@/features/cases/services/signalements";
import type {
  Signalement,
  SignalementOptions,
  SignalementPayload,
} from "@/features/cases/types";

interface SignalementsPageProps {
  isAdmin: boolean;
  currentUserId: number;
  lockedCentre?: {
    regionId: number;
    districtId: number;
    centreId: number;
  } | null;
}

export function SignalementsPage({
  isAdmin,
  currentUserId,
  lockedCentre,
}: SignalementsPageProps) {
  const [options, setOptions] = useState<SignalementOptions | null>(null);
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<Signalement | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [optionsData, signalementsData] = await Promise.all([
          fetchSignalementOptions(),
          fetchSignalements(),
        ]);
        if (!active) {
          return;
        }
        setOptions(optionsData);
        setSignalements(signalementsData);
        setError(null);
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error ? e.message : "Impossible de charger les signalements.",
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
  }, [reloadKey]);

  function reload() {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  async function handleCreate(payload: SignalementPayload) {
    await createSignalement(payload);
    reload();
  }

  async function handleEdit(payload: SignalementPayload) {
    if (!editing) {
      return;
    }
    await updateSignalement(editing.id, payload);
    setEditOpen(false);
    setEditing(null);
    reload();
  }

  function openEdit(signalement: Signalement) {
    setEditing(signalement);
    setEditOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signalements"
        description="Déclarez et suivez les signalements épidémiologiques de votre périmètre."
      />

      {error ? (
        <Alert variant="error">
          <span className="flex items-center justify-between gap-3">
            {error}
            <Button variant="ghost" size="sm" onClick={reload}>
              <RefreshCw className="size-4" />
              Réessayer
            </Button>
          </span>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle>Nouveau signalement</CardTitle>
            <CardDescription>
              {lockedCentre
                ? "Votre établissement est fixé selon votre périmètre."
                : "Sélectionnez la maladie, la zone et l'établissement."}
            </CardDescription>
          </div>
          <Plus className="size-5 text-text-muted" />
        </CardHeader>
        <CardContent>
          {options ? (
            <SignalementForm
              options={options}
              lockedCentre={lockedCentre}
              onSubmit={handleCreate}
            />
          ) : (
            <p className="py-6 text-center text-sm text-text-muted">
              {loading ? "Chargement des référentiels..." : "Référentiels indisponibles."}
            </p>
          )}
        </CardContent>
      </Card>

      <SignalementsList
        signalements={signalements}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onEdit={openEdit}
        onReload={reload}
      />

      {editing && options ? (
        <Modal
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditing(null);
          }}
          title="Modifier le signalement"
          description="Mettez à jour les informations du signalement."
          size="lg"
        >
          <SignalementForm
            options={options}
            initial={editing}
            lockedCentre={lockedCentre}
            submitLabel="Enregistrer les modifications"
            onSubmit={handleEdit}
            onCancel={() => {
              setEditOpen(false);
              setEditing(null);
            }}
          />
        </Modal>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-muted">
          <AlertTriangle className="size-4" />
          Rechargement des données...
        </div>
      ) : null}
    </div>
  );
}