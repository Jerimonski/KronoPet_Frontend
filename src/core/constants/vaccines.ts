import type { VaccineStatus } from "../types/models";

/** Días antes del vencimiento en que una vacuna pasa a "Próxima a vencer". */
export const VACCINE_WARNING_DAYS = 30;

export const VACCINE_STATUSES: VaccineStatus[] = [
  "aplicada",
  "pendiente",
  "proxima",
  "vencida",
];

export const VACCINE_STATUS_LABELS: Record<VaccineStatus, string> = {
  aplicada: "Aplicada",
  pendiente: "Pendiente",
  proxima: "Próxima a vencer",
  vencida: "Vencida",
};

export const VACCINE_STATUS_STYLES: Record<VaccineStatus, string> = {
  aplicada: "bg-success-bg text-success ring-success/20",
  pendiente: "bg-info-bg text-sky-700 ring-info/20",
  proxima: "bg-warning-bg text-amber-700 ring-warning/30",
  vencida: "bg-danger-bg text-danger ring-danger/20",
};

export const COMMON_VACCINES = [
  "Antirrábica",
  "Óctuple (DHPPi+L)",
  "Séxtuple",
  "KC (Tos de las perreras)",
  "Triple Felina",
  "Leucemia Felina (FeLV)",
  "Mixomatosis",
];
