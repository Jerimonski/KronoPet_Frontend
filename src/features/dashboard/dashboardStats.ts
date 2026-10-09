// Métricas del dashboard derivadas de los registros existentes, filtradas
// por un periodo (semana, mes o año).

import { MEDICAL_REASONS, type MedicalReason } from "../../core/constants/medicalReasons";
import type { DbState } from "../../core/mocks/seed";
import { addDays, daysBetween, MONTH_SHORT, parseDate, toISODate, todayISO } from "../../core/utils/dates";
import type { LinePoint } from "../../shared/components/LineChart";
import { getVaccineStatus } from "../vaccines/vaccineService";

const MONTH_LONG = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export type PeriodType = "semana" | "mes" | "anio";

export const PERIOD_TYPES: { value: PeriodType; label: string }[] = [
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "anio", label: "Año" },
];

export interface Period {
  type: PeriodType;
  /** Primer día del periodo (YYYY-MM-DD). */
  start: string;
  /** Último día del periodo, inclusive. */
  end: string;
  /** Contiene el día de hoy. */
  isCurrent: boolean;
  label: string;
  /** Texto para frases como "+3 nuevas este mes". */
  phrase: string;
}

/** Normaliza cualquier fecha al inicio del periodo que la contiene (semanas de lunes a domingo). */
export function periodStart(type: PeriodType, value: string): string {
  const date = parseDate(value);
  if (type === "anio") return `${date.getFullYear()}-01-01`;
  if (type === "mes") return toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
  return addDays(value, -((date.getDay() + 6) % 7));
}

/** Inicio del periodo desplazado `delta` periodos. */
export function shiftPeriod(type: PeriodType, start: string, delta: number): string {
  const date = parseDate(start);
  if (type === "anio") return `${date.getFullYear() + delta}-01-01`;
  if (type === "mes") return toISODate(new Date(date.getFullYear(), date.getMonth() + delta, 1));
  return addDays(start, delta * 7);
}

export function getPeriod(type: PeriodType, value: string): Period {
  const start = periodStart(type, value);
  const end = addDays(shiftPeriod(type, start, 1), -1);
  const today = todayISO();
  const isCurrent = start <= today && today <= end;
  const date = parseDate(start);

  let label: string;
  if (type === "anio") label = String(date.getFullYear());
  else if (type === "mes") label = `${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
  else {
    const last = parseDate(end);
    const from = `${date.getDate()}${date.getMonth() !== last.getMonth() ? ` ${MONTH_SHORT[date.getMonth()].toLowerCase()}` : ""}`;
    label = `${from} – ${last.getDate()} ${MONTH_SHORT[last.getMonth()].toLowerCase()} ${last.getFullYear()}`;
  }

  const phrase = isCurrent
    ? { semana: "esta semana", mes: "este mes", anio: "este año" }[type]
    : "en el periodo";

  return { type, start, end, isCurrent, label, phrase };
}

export function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

const inRange = (date: string, from: string, to: string) => {
  const day = date.slice(0, 10);
  return day >= from && day <= to;
};

function buildSeries(db: DbState, period: Period, until: string): LinePoint[] {
  const count = (prefix: string) => db.events.filter((e) => e.date.startsWith(prefix)).length;

  if (period.type === "anio") {
    const year = parseDate(period.start).getFullYear();
    const inProgress = todayISO().slice(0, 7);
    return MONTH_LONG.flatMap((name, m) => {
      const key = `${year}-${String(m + 1).padStart(2, "0")}`;
      if (key > until.slice(0, 7)) return [];
      return [{
        label: MONTH_SHORT[m],
        tooltipLabel: `${name} ${year}${key === inProgress ? " (en curso)" : ""}`,
        value: count(key),
      }];
    });
  }

  const days = daysBetween(period.start, until) + 1;
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(period.start, i);
    const date = parseDate(day);
    const weekday = WEEKDAY_SHORT[(date.getDay() + 6) % 7];
    return {
      label: period.type === "semana" ? weekday : String(date.getDate()),
      tooltipLabel: `${weekday} ${date.getDate()} ${MONTH_SHORT[date.getMonth()].toLowerCase()}`,
      value: count(day),
    };
  });
}

export function computeDashboard(db: DbState, period: Period) {
  const today = todayISO();
  // Un periodo en curso se compara contra el mismo tramo del periodo anterior.
  const until = period.isCurrent ? today : period.end;
  const elapsed = daysBetween(period.start, until);
  const prevStart = shiftPeriod(period.type, period.start, -1);
  const prevFullEnd = addDays(period.start, -1);
  const prevEndCandidate = addDays(prevStart, elapsed);
  const prevEnd = prevEndCandidate < prevFullEnd ? prevEndCandidate : prevFullEnd;

  const events = db.events.filter((e) => inRange(e.date, period.start, until));
  const eventsPrev = db.events.filter((e) => inRange(e.date, prevStart, prevEnd));
  const newPets = db.pets.filter((p) => inRange(p.createdAt, period.start, until)).length;
  const newTutors = db.tutors.filter((t) => inRange(t.createdAt, period.start, until)).length;

  // Las vacunas reflejan el estado actual, no dependen del periodo.
  const vaccineRows = db.vaccines.map((v) => ({ vaccine: v, status: getVaccineStatus(v, today) }));
  const expired = vaccineRows.filter((r) => r.status === "vencida").length;
  const upcoming = vaccineRows.filter((r) => r.status === "proxima").length;
  const pending = vaccineRows.filter((r) => r.status === "pendiente").length;

  const reasons = MEDICAL_REASONS.map((reason: MedicalReason) => {
    const current = events.filter((e) => e.reason === reason).length;
    const previous = eventsPrev.filter((e) => e.reason === reason).length;
    return { reason, current, trend: trendPct(current, previous) };
  }).sort((a, b) => b.current - a.current);

  const vetActivity = db.staff
    .map((vet) => ({
      vet,
      count: events.filter((e) => e.vetId === vet.id).length,
    }))
    // Personal deshabilitado solo aparece si atendió en el periodo.
    .filter(({ vet, count }) => vet.active || count > 0)
    .sort((a, b) => b.count - a.count);

  const vaccineAlerts = vaccineRows
    .filter((r) => r.status !== "aplicada")
    .sort((a, b) => a.vaccine.expiresAt.localeCompare(b.vaccine.expiresAt));

  return {
    events,
    attentions: {
      current: events.length,
      previous: eventsPrev.length,
      trend: trendPct(events.length, eventsPrev.length),
    },
    pets: { total: db.pets.length, new: newPets },
    tutors: { total: db.tutors.length, new: newTutors },
    vaccines: { expired, upcoming, pending, attention: expired + upcoming + pending },
    series: buildSeries(db, period, until),
    reasons,
    vetActivity,
    vaccineAlerts,
  };
}
