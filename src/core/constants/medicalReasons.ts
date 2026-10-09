// Los seis motivos de atención permitidos. Única fuente de verdad: la
// reutilizan los selects, los filtros y las validaciones.

export const MEDICAL_REASONS = [
  "Consulta General",
  "Control Sano y Rutina",
  "Urgencia / Emergencia",
  "Procedimiento Quirúrgico",
  "Examen de Laboratorio",
  "Desparasitación",
] as const;

export type MedicalReason = (typeof MEDICAL_REASONS)[number];

interface ReasonStyle {
  /** Clases para badges (fondo + texto + anillo). */
  badge: string;
  /** Color sólido para puntos y marcadores. */
  dot: string;
}

export const REASON_STYLES: Record<MedicalReason, ReasonStyle> = {
  "Consulta General": {
    badge: "bg-primary-50 text-primary-800 ring-primary-200",
    dot: "bg-primary-600",
  },
  "Control Sano y Rutina": {
    badge:
      "bg-cat-inmunizacion-50 text-cat-inmunizacion-700 ring-cat-inmunizacion-500/30",
    dot: "bg-cat-inmunizacion-500",
  },
  "Urgencia / Emergencia": {
    badge: "bg-danger-bg text-danger ring-danger/20",
    dot: "bg-danger",
  },
  "Procedimiento Quirúrgico": {
    badge: "bg-accent-50 text-accent-800 ring-accent-200",
    dot: "bg-accent-600",
  },
  "Examen de Laboratorio": {
    badge: "bg-info-bg text-sky-700 ring-info/20",
    dot: "bg-info",
  },
  Desparasitación: {
    badge:
      "bg-cat-desparasitacion-50 text-cat-desparasitacion-700 ring-cat-desparasitacion-500/30",
    dot: "bg-cat-desparasitacion-500",
  },
};
