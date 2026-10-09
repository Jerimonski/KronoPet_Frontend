// Exportación de las métricas del dashboard para el periodo seleccionado:
// Excel (.xlsx con una hoja por sección) e informe imprimible para PDF.

import { CLINIC_NAME } from "../../core/mail/reminderEmail";
import type { DbState } from "../../core/mocks/seed";
import { formatDate, formatDateTime, nowStamp } from "../../core/utils/dates";
import { buildXlsx, downloadBlob, type Cell, type Sheet } from "../../core/utils/xlsx";
import { sortByDateDesc } from "../medical-events/medicalEventService";
import type { computeDashboard, Period } from "./dashboardStats";

type Stats = ReturnType<typeof computeDashboard>;

interface ReportInput {
  db: DbState;
  stats: Stats;
  period: Period;
  generatedBy: string;
}

const pct = (value: number | null) => (value == null ? "—" : `${value > 0 ? "+" : ""}${value}%`);

/** Secciones comunes a ambos formatos: [título, encabezados, filas]. */
function sections({ db, stats, period }: ReportInput) {
  const petById = (id: string) => db.pets.find((p) => p.id === id);
  const range = `${formatDate(period.start)} – ${formatDate(period.end)}${period.isCurrent ? " (en curso)" : ""}`;

  const summary: Cell[][] = [
    ["Atenciones en el periodo", stats.attentions.current],
    ["Atenciones periodo anterior", stats.attentions.previous],
    ["Variación de atenciones", pct(stats.attentions.trend)],
    ["Mascotas nuevas", stats.pets.new],
    ["Tutores nuevos", stats.tutors.new],
    ["Total de mascotas", stats.pets.total],
    ["Total de tutores", stats.tutors.total],
    ["Vacunas vencidas (hoy)", stats.vaccines.expired],
    ["Vacunas por vencer (hoy)", stats.vaccines.upcoming],
    ["Vacunas pendientes (hoy)", stats.vaccines.pending],
  ];

  const series: Cell[][] = stats.series.map((p) => [p.tooltipLabel ?? p.label, p.value]);
  const reasons: Cell[][] = stats.reasons.map((r) => [r.reason, r.current, pct(r.trend)]);
  const team: Cell[][] = stats.vetActivity.map(({ vet, count }) => [
    vet.name,
    vet.specialty,
    vet.active ? "Activo" : "Deshabilitado",
    count,
  ]);
  const detail: Cell[][] = sortByDateDesc(stats.events).map((e) => {
    const pet = petById(e.petId);
    return [
      formatDate(e.date),
      pet?.name ?? "—",
      pet?.species ?? "—",
      db.tutors.find((t) => t.id === pet?.tutorId)?.name ?? "—",
      e.reason,
      e.title,
      e.diagnosis,
      e.weightKg,
      db.staff.find((s) => s.id === e.vetId)?.name ?? "—",
    ];
  });

  return { range, summary, series, reasons, team, detail };
}

function fileBase(period: Period) {
  return `kronopet-metricas-${period.type}-${period.start}`;
}

export function exportExcel(input: ReportInput) {
  const { period } = input;
  const s = sections(input);
  const header = (title: string): Cell[][] => [
    [`${CLINIC_NAME} · ${title}`],
    [`Periodo: ${period.label} (${s.range})`],
    [`Generado el ${formatDateTime(nowStamp())} por ${input.generatedBy}`],
    [],
  ];
  const table = (title: string, headers: string[], rows: Cell[][], widths: number[]): Sheet => ({
    name: title,
    rows: [...header(title), headers, ...rows],
    boldRows: [0, 4],
    widths,
  });

  const sheets: Sheet[] = [
    table("Resumen", ["Indicador", "Valor"], s.summary, [34, 14]),
    table(
      period.type === "anio" ? "Atenciones por mes" : "Atenciones por día",
      [period.type === "anio" ? "Mes" : "Día", "Atenciones"],
      s.series,
      [28, 14],
    ),
    table("Motivos", ["Motivo", "Fichas", "Vs. periodo anterior"], s.reasons, [30, 10, 20]),
    table("Equipo", ["Veterinario", "Especialidad", "Estado", "Atenciones"], s.team, [26, 24, 14, 12]),
    table(
      "Detalle de atenciones",
      ["Fecha", "Mascota", "Especie", "Tutor", "Motivo", "Atención", "Diagnóstico", "Peso (kg)", "Veterinario"],
      s.detail,
      [13, 14, 10, 24, 26, 32, 36, 10, 24],
    ),
  ];
  downloadBlob(buildXlsx(sheets), `${fileBase(period)}.xlsx`);
}

const html = (value: Cell) =>
  String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function htmlTable(headers: string[], rows: Cell[][], numeric: number[] = []) {
  return `<table><thead><tr>${headers.map((h, i) => `<th${numeric.includes(i) ? ' class="n"' : ""}>${html(h)}</th>`).join("")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${numeric.includes(i) ? ' class="n"' : ""}>${html(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

/** Barras simples en SVG (el informe se imprime: sin interacción). */
function barChart(points: { label: string; value: number }[]) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const w = 680;
  const h = 150;
  const bw = w / points.length;
  const every = Math.ceil(points.length / 16);
  return `<svg viewBox="0 0 ${w} ${h + 18}" width="100%" role="img" aria-label="Atenciones">
${points
  .map((p, i) => {
    const bh = (p.value / max) * h;
    const label = i % every === 0 ? `<text x="${i * bw + bw / 2}" y="${h + 13}" text-anchor="middle">${html(p.label)}</text>` : "";
    const value = p.value > 0 && points.length <= 16 ? `<text x="${i * bw + bw / 2}" y="${h - bh - 3}" text-anchor="middle">${p.value}</text>` : "";
    return `<rect x="${i * bw + bw * 0.18}" y="${h - bh}" width="${bw * 0.64}" height="${bh}" rx="2" fill="#0b9393"/>${label}${value}`;
  })
  .join("")}
<line x1="0" x2="${w}" y1="${h}" y2="${h}" stroke="#cbd5e1"/></svg>`;
}

export function exportPdf(input: ReportInput) {
  const { period, stats } = input;
  const s = sections(input);
  const doc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${fileBase(period)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2a30; font-size: 11px; margin: 0; }
  header { border-bottom: 3px solid #0b9393; padding-bottom: 10px; margin-bottom: 14px; }
  h1 { font-size: 20px; margin: 0; color: #063f3f; }
  h2 { font-size: 13px; margin: 18px 0 6px; color: #063f3f; break-after: avoid; }
  .meta { color: #5b6b73; margin-top: 4px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .kpi { border: 1px solid #dbe4e8; border-radius: 8px; padding: 8px 10px; }
  .kpi b { display: block; font-size: 18px; margin-top: 2px; }
  .kpi span { color: #5b6b73; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #e5ecef; vertical-align: top; }
  th { background: #f1f6f7; font-weight: bold; }
  .n { text-align: right; font-variant-numeric: tabular-nums; }
  tr { break-inside: avoid; }
  svg text { font-size: 9px; fill: #5b6b73; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
</style></head><body>
<header>
  <h1>${html(CLINIC_NAME)} · Reporte de métricas</h1>
  <div class="meta">Periodo: <b>${html(period.label)}</b> (${html(s.range)}) · Generado el ${html(formatDateTime(nowStamp()))} por ${html(input.generatedBy)}</div>
</header>
<div class="kpis">
  <div class="kpi"><span>Atenciones</span><b>${stats.attentions.current}</b><span>${pct(stats.attentions.trend)} vs. periodo anterior (${stats.attentions.previous})</span></div>
  <div class="kpi"><span>Mascotas nuevas</span><b>${stats.pets.new}</b><span>${stats.pets.total} en total</span></div>
  <div class="kpi"><span>Tutores nuevos</span><b>${stats.tutors.new}</b><span>${stats.tutors.total} en total</span></div>
  <div class="kpi"><span>Vacunas por atender (hoy)</span><b>${stats.vaccines.attention}</b><span>${stats.vaccines.expired} vencidas · ${stats.vaccines.upcoming} por vencer</span></div>
</div>
<h2>${period.type === "anio" ? "Atenciones por mes" : "Atenciones por día"}</h2>
${barChart(stats.series)}
<div class="cols">
  <section><h2>Motivos de atención</h2>${htmlTable(["Motivo", "Fichas", "Vs. anterior"], s.reasons, [1, 2])}</section>
  <section><h2>Equipo veterinario</h2>${htmlTable(["Veterinario", "Especialidad", "Estado", "Atenciones"], s.team, [3])}</section>
</div>
<h2>Detalle de atenciones (${s.detail.length})</h2>
${s.detail.length ? htmlTable(["Fecha", "Mascota", "Especie", "Tutor", "Motivo", "Atención", "Diagnóstico", "Peso (kg)", "Veterinario"], s.detail, [7]) : "<p>Sin atenciones en el periodo.</p>"}
</body></html>`;

  // Se imprime desde un iframe oculto: el usuario elige "Guardar como PDF".
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  frame.srcdoc = doc;
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return;
    win.addEventListener("afterprint", () => frame.remove());
    win.focus();
    win.print();
  };
  document.body.appendChild(frame);
}
