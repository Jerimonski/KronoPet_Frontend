import { api, type VaccineInput } from "../../core/api/endpoints";
import { VACCINE_WARNING_DAYS } from "../../core/constants/vaccines";
import { useDb } from "../../core/mocks/mockDb";
import type { Vaccine, VaccineStatus } from "../../core/types/models";
import { daysBetween, todayISO } from "../../core/utils/dates";

export type { VaccineInput };

export const vaccineService = {
  create: api.vaccines.create,
  update: api.vaccines.update,
  remove: api.vaccines.remove,
};

/**
 * Estado visible de una vacuna: las pendientes siguen pendientes; las
 * aplicadas pasan a "próxima a vencer" o "vencida" según su vencimiento.
 */
export function getVaccineStatus(vaccine: Vaccine, today = todayISO()): VaccineStatus {
  if (vaccine.status === "pendiente") return "pendiente";
  const daysLeft = daysBetween(today, vaccine.expiresAt);
  if (daysLeft < 0) return "vencida";
  if (daysLeft <= VACCINE_WARNING_DAYS) return "proxima";
  return "aplicada";
}

export function countByStatus(vaccines: Vaccine[]): Record<VaccineStatus, number> {
  const counts: Record<VaccineStatus, number> = {
    aplicada: 0,
    pendiente: 0,
    proxima: 0,
    vencida: 0,
  };
  for (const vaccine of vaccines) counts[getVaccineStatus(vaccine)]++;
  return counts;
}

export function useVaccines(): Vaccine[] {
  return useDb().vaccines;
}

export function usePetVaccines(petId: string | undefined): Vaccine[] {
  return useDb()
    .vaccines.filter((v) => v.petId === petId)
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
}
