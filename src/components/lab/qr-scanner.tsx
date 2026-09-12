"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, X } from "lucide-react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export interface ScanResult {
  code: string;
  casId: number;
}

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScanned: (result: ScanResult) => void;
  onManual: (value: string) => void;
}

export function QrScanner({ open, onClose, onScanned, onManual }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRaw = useRef("");
  const onScannedRef = useRef(onScanned);

  useEffect(() => {
    onScannedRef.current = onScanned;
  }, [onScanned]);

  const [camError, setCamError] = useState(false);
  const [scanError, setScanError] = useState("");
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    lastRaw.current = "";

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });

    function tick() {
      if (cancelled) return;
      if (!video || !canvas || !ctx || video.readyState < 2 || video.videoWidth === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(image.data, image.width, image.height, {
        inversionAttempts: "dontInvert",
      });

      if (code?.data) {
        if (code.data !== lastRaw.current) {
          lastRaw.current = code.data;
          const m = code.data.match(/^(.+)#(\d+)$/);
          if (m) {
            setScanError("");
            onScannedRef.current({ code: m[1], casId: Number(m[2]) });
          } else {
            setScanError("QR Code invalide : format inattendu.");
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => setCamError(true));
        }
        raf = requestAnimationFrame(tick);
      } catch {
        setCamError(true);
      }
    }
    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (video) {
        video.srcObject = null;
      }
    };
  }, [open]);

  function submitManual() {
    const value = manual.trim();
    if (!value) {
      return;
    }
    onManual(value);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Scanner un QR Code"
      description="Placez l'étiquette imprimée du cas dans le cadre pour l'identifier automatiquement."
      size="lg"
    >
      <div className="space-y-4">
        {/* Caméra + cadre de visée */}
        {!camError ? (
          <div className="relative overflow-hidden rounded-xl border border-border bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-64 w-full object-cover sm:h-80"
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="relative h-40 w-40 rounded-lg border-2 border-white/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                <ScanLine className="absolute -left-4 -top-4 size-5 text-white/80" />
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-white/85">
                  Cadrez le QR code
                </span>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Camera className="mx-auto size-8 text-text-muted" />
            <p className="mt-2 text-sm text-text-muted">
              Caméra indisponible ou accès refusé. Utilisez la saisie manuelle
              ci-dessous.
            </p>
          </div>
        )}

        {scanError ? (
          <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {scanError}
          </p>
        ) : null}

        {/* Saisie manuelle (repli) */}
        <div className="rounded-xl border border-border p-4">
          <p className="mb-2 text-sm font-semibold text-text-main">
            Saisie manuelle
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitManual();
              }}
              placeholder="Code anonyme (PAT-…) ou n° de cas"
              className="flex-1"
            />
            <Button onClick={submitManual} disabled={!manual.trim()}>
              Rechercher
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Alternative si la caméra est indisponible : saisissez le code
            anonyme ou le numéro du cas.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            <X className="size-4" />
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}