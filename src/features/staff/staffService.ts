import { api, type StaffInput } from "../../core/api/endpoints";
import { useDb } from "../../core/mocks/mockDb";
import type { StaffUser } from "../../core/types/models";
import { cleanRut } from "../../core/utils/rut";

export type { StaffInput };

export const staffService = {
  create: api.staff.create,
  update: api.staff.update,
  setActive: api.staff.setActive,
};

/** Personal habilitado para registrar atenciones. */
export function useActiveStaff(): StaffUser[] {
  return useDb().staff.filter((s) => s.active);
}

/** Busca por nombre, correo, especialidad o RUT. */
export function matchesStaff(member: StaffUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const looksLikeRut = /^[\d.\s-]+k?$/.test(q);
  return (
    member.name.toLowerCase().includes(q) ||
    member.email.toLowerCase().includes(q) ||
    member.specialty.toLowerCase().includes(q) ||
    (looksLikeRut && cleanRut(member.rut).includes(cleanRut(q)))
  );
}
