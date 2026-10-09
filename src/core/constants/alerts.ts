import type { PetAlertType } from "../types/models";

export const PET_ALERT_TYPES: PetAlertType[] = ["alergia", "condicion", "comportamiento", "otra"];

export const PET_ALERT_LABELS: Record<PetAlertType, string> = {
  alergia: "Alergia",
  condicion: "Condición crónica",
  comportamiento: "Comportamiento",
  otra: "Otra",
};

export const PET_ALERT_STYLES: Record<PetAlertType, string> = {
  alergia: "bg-danger-bg text-danger ring-danger/25",
  condicion: "bg-warning-bg text-amber-800 ring-warning/40",
  comportamiento: "bg-accent-50 text-accent-800 ring-accent-200",
  otra: "bg-neutral-100 text-neutral-700 ring-neutral-200",
};
