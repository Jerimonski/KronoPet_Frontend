import type { StaffRole } from "../types/models";

export const STAFF_ROLES: StaffRole[] = ["veterinario", "administrador"];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  veterinario: "Veterinario/a",
  administrador: "Administrador/a",
};
