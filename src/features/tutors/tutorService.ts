import { api, type TutorInput } from "../../core/api/endpoints";
import { useDb } from "../../core/mocks/mockDb";
import { cleanRut } from "../../core/utils/rut";
import type { Tutor } from "../../core/types/models";

export type { TutorInput };

export const tutorService = {
  create: api.users.create,
  update: api.users.update,
};

export function useTutors(): Tutor[] {
  return useDb().tutors;
}

export function useTutor(id: string | undefined): Tutor | undefined {
  return useDb().tutors.find((t) => t.id === id);
}

/** Busca por nombre, correo, teléfono o RUT. */
export function matchesTutor(tutor: Tutor, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  // Solo se compara contra el RUT si la consulta tiene forma de RUT (ej. "12.3", "12345678-k").
  const looksLikeRut = /^[\d.\s-]+k?$/.test(q);
  return (
    tutor.name.toLowerCase().includes(q) ||
    tutor.email.toLowerCase().includes(q) ||
    tutor.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
    (looksLikeRut && cleanRut(tutor.rut).includes(cleanRut(q)))
  );
}
