import QRCode from "qrcode";

/**
 * Valeur encodée dans le QR Code : uniquement le code anonyme + l'identifiant
 * du cas (aucune donnée nominative).
 */
export function buildQrValue(codeAnonyme: string, casId: number): string {
  return `${codeAnonyme}#${casId}`;
}

export async function qrDataUrl(
  codeAnonyme: string,
  casId: number,
): Promise<string> {
  return QRCode.toDataURL(buildQrValue(codeAnonyme, casId), {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

export interface LabelContent {
  code: string;
  maladie: string;
  centre: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Ouvre une fenêtre d'impression avec une étiquette compacte :
 * QR Code + code anonyme + maladie + centre (aucune donnée nominative inutile).
 */
export function printFicheLabel(content: LabelContent, qr: string) {
  const win = window.open("", "_blank", "width=420,height=320");
  if (!win) {
    return;
  }
  const code = escapeHtml(content.code);
  const maladie = escapeHtml(content.maladie);
  const centre = escapeHtml(content.centre);

  win.document.open();
  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Étiquette du cas</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 24px;
    background: #fff;
    color: #0f172a;
  }
  img { width: 130px; height: 130px; image-rendering: pixelated; }
  .infos h1 { font-size: 20px; font-weight: 700; letter-spacing: 0.02em; }
  .infos p { margin-top: 6px; font-size: 13px; color: #475569; }
  .infos strong { color: #0f172a; }
  @media print {
    body { padding: 16px; }
  }
</style>
</head>
<body>
  <img src="${qr}" alt="QR code" />
  <div class="infos">
    <h1>${code}</h1>
    <p><strong>Maladie :</strong> ${maladie}</p>
    <p><strong>Centre :</strong> ${centre}</p>
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`);
  win.document.close();
  win.focus();
}