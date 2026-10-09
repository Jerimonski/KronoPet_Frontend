import type { ReminderKind } from "../types/models";

export const REMINDER_KIND_LABELS: Record<ReminderKind, string> = {
  vacuna_vencida: "Vacuna vencida",
  vacuna_por_vencer: "Vacuna por vencer",
  vacuna_pendiente: "Vacuna pendiente",
  control: "Próximo control",
};

export const REMINDER_KIND_STYLES: Record<ReminderKind, string> = {
  vacuna_vencida: "bg-danger-bg text-danger ring-danger/20",
  vacuna_por_vencer: "bg-warning-bg text-amber-700 ring-warning/30",
  vacuna_pendiente: "bg-info-bg text-sky-700 ring-info/20",
  control: "bg-primary-50 text-primary-800 ring-primary-200",
};

/** Opciones de anticipación del aviso, en días. */
export const REMINDER_DAYS_OPTIONS = [3, 7, 14, 30];

/** Las vacunas vencidas hace más de esto ya no se recuerdan (evita insistir indefinidamente). */
export const REMINDER_OVERDUE_LIMIT_DAYS = 60;
