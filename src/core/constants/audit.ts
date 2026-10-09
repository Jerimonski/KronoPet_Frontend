import type { AuditAction, AuditEntity } from "../types/models";

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  crear: "Creó",
  editar: "Editó",
  eliminar: "Eliminó",
  deshabilitar: "Deshabilitó",
  habilitar: "Habilitó",
  adjuntar: "Adjuntó",
  enviar: "Envió",
};

export const AUDIT_ACTION_STYLES: Record<AuditAction, string> = {
  crear: "bg-success-bg text-success ring-success/20",
  editar: "bg-info-bg text-sky-700 ring-info/20",
  eliminar: "bg-danger-bg text-danger ring-danger/20",
  deshabilitar: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  habilitar: "bg-primary-50 text-primary-800 ring-primary-200",
  adjuntar: "bg-cat-inmunizacion-50 text-cat-inmunizacion-700 ring-cat-inmunizacion-500/30",
  enviar: "bg-accent-50 text-accent-800 ring-accent-200",
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  tutor: "Tutor",
  mascota: "Mascota",
  ficha: "Ficha clínica",
  vacuna: "Vacuna",
  equipo: "Equipo",
  alerta: "Alerta clínica",
  adjunto: "Adjunto",
  recordatorio: "Recordatorio",
};
