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

export interface PrintCaseAnalyse {
  id: number;
  label: string;
  statut: string;
  resultat: string | null;
  dateDemande: string | null;
  dateAnalyse: string | null;
}

export interface FichePatientContent {
  codeAnonyme: string;
  centre: string;
  dateDeclaration: string;
  nomPatient: string | null;
  age: number | null;
  sexe: string | null;
  analyses: PrintCaseAnalyse[];
}

function escapeHtml(value: string | number | null | undefined): string {
  if (value == null) return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatFicheDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  try {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    const formatted = new Intl.DateTimeFormat('fr-FR', options).format(date);
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return escapeHtml(isoDate);
  }
}

function sexeLabel(sexe: string | null): string {
  if (sexe === "M") return "Homme";
  if (sexe === "F") return "Femme";
  return "—";
}

/**
 * Injecte un iframe invisible dans le DOM, y écrit la fiche patient (A4),
 * puis déclenche l'impression via contentWindow.print().
 * Ne déclenche AUCUN popup blocker (pas de window.open).
 */
export function printFichePatient(content: FichePatientContent, qr: string) {
  const code = escapeHtml(content.codeAnonyme);
  const centre = escapeHtml(content.centre);
  const dateDecl = formatFicheDate(content.dateDeclaration);
  const nom = escapeHtml(content.nomPatient);
  const age = content.age != null ? escapeHtml(content.age) + " ans" : "—";
  const sexe = escapeHtml(sexeLabel(content.sexe));

  const analysesHtml = content.analyses.length > 0 ? content.analyses.map(a => {
    const codeAnalyse = escapeHtml(a.label.substring(0, 3).toUpperCase() + "-" + String(a.id).padStart(3, '0'));
    const statut = a.statut === 'Realisee' ? escapeHtml(a.resultat || 'Réalisée') : '[ ] À Réaliser';
    const datePrelevement = a.dateAnalyse ? formatFicheDate(a.dateAnalyse) : (a.statut === 'Realisee' ? '—' : '[Date : .........................]');
    
    return `
      <tr>
        <td>${escapeHtml(a.label)}</td>
        <td><strong>${codeAnalyse}</strong></td>
        <td>${statut}</td>
        <td>${datePrelevement}</td>
      </tr>
    `;
  }).join('') : `<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">Aucune analyse liée</td></tr>`;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Fiche Patient - ${code}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 0; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #0f172a;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm;
    background: white;
    position: relative;
  }
  
  /* Header */
  header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .logo-container {
    display: flex;
    justify-content: flex-start;
  }
  .logo-container img {
    height: 90px;
    width: auto;
  }
  .title-container {
    text-align: center;
  }
  .title-container h1 {
    font-size: 28px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1e293b;
    margin: 0;
  }
  .qr-wrapper {
    display: flex;
    justify-content: flex-end;
  }
  .qr-container {
    text-align: center;
    border: 1px solid #cbd5e1;
    padding: 5px;
    border-radius: 8px;
    background: #f8fafc;
    display: inline-block;
  }
  .qr-container img {
    width: 90px;
    height: 90px;
    image-rendering: pixelated;
    display: block;
  }

  /* Section Title */
  h2 {
    font-size: 16px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 5px;
  }

  /* Patient Info */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px 30px;
    margin-bottom: 40px;
    font-size: 14px;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .info-label {
    font-weight: 700;
    color: #475569;
    font-size: 11px;
    text-transform: uppercase;
  }
  .info-value {
    color: #0f172a;
    font-weight: 500;
    padding-bottom: 4px;
    border-bottom: 1px dashed #cbd5e1;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 40px;
    font-size: 13px;
  }
  th {
    text-align: left;
    background-color: #f1f5f9;
    padding: 10px 12px;
    font-weight: 700;
    color: #334155;
    border: 1px solid #cbd5e1;
  }
  td {
    padding: 12px;
    border: 1px solid #cbd5e1;
    color: #1e293b;
  }
  tbody tr:nth-child(even) {
    background-color: #f8fafc;
  }
  
  /* Prevent page break inside table rows */
  tr { page-break-inside: avoid; }
  
  /* Footer */
  footer {
    position: absolute;
    bottom: 20mm;
    left: 20mm;
    right: 20mm;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #64748b;
    border-top: 1px solid #e2e8f0;
    padding-top: 10px;
  }

  @media print {
    body { background: transparent; }
    .page { 
      margin: 0; 
      padding: 20mm; 
      width: 100%; 
      height: 100%; 
      box-shadow: none; 
      border: none;
    }
    footer {
      position: fixed;
      bottom: 20mm;
    }
  }
</style>
</head>
<body>
  <div class="page">
    <header>
      <div class="logo-container">
        <img src="${window.location.origin}/images/logo-app.svg" alt="Logo EpiSuivi" onerror="this.style.display='none'" />
      </div>
      <div class="title-container">
        <h1>Fiche Patient</h1>
      </div>
      <div class="qr-wrapper">
        <div class="qr-container">
          <img src="${qr}" alt="QR code" />
        </div>
      </div>
    </header>

    <main>
      <h2>Identification du Patient</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Patient ID</span>
          <span class="info-value">${code}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Centre</span>
          <span class="info-value">${centre}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date de déclaration</span>
          <span class="info-value">${dateDecl}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nom et prénom</span>
          <span class="info-value">${nom}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Âge</span>
          <span class="info-value">${age}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Sexe</span>
          <span class="info-value">${sexe}</span>
        </div>
      </div>

      <h2>Détails de la Demande d'Analyse</h2>
      <table>
        <thead>
          <tr>
            <th>Type d'Analyse</th>
            <th>Code</th>
            <th>Statut</th>
            <th>Date Prélèvement</th>
          </tr>
        </thead>
        <tbody>
          ${analysesHtml}
        </tbody>
      </table>
    </main>

    <footer>
      <span>Assistance EpiSuivi : 034 00 000 00</span>
      <span>Version 1.0</span>
    </footer>
  </div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:0;left:-9999px;width:1px;height:1px;border:none;opacity:0;";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // Fallback : certains navigateurs restreignent contentWindow.print()
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 1500);
    }
  };

  if (iframe.contentWindow) {
    iframe.contentWindow.onload = () => setTimeout(triggerPrint, 400);
  } else {
    setTimeout(triggerPrint, 600);
  }
}