import { api, type PetAlertInput, type PetInput } from "../../core/api/endpoints";
import { useDb } from "../../core/mocks/mockDb";
import type { Pet } from "../../core/types/models";

export type { PetAlertInput, PetInput };

export const petService = {
  create: api.pets.create,
  update: api.pets.update,
  remove: api.pets.remove,
  addAlert: api.pets.addAlert,
  removeAlert: api.pets.removeAlert,
};

export function usePets(): Pet[] {
  return useDb().pets;
}

export function usePet(id: string | undefined): Pet | undefined {
  return useDb().pets.find((p) => p.id === id);
}

export function matchesPet(pet: Pet, query: string, tutorName = ""): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    pet.name.toLowerCase().includes(q) ||
    pet.breed.toLowerCase().includes(q) ||
    pet.species.toLowerCase().includes(q) ||
    tutorName.toLowerCase().includes(q)
  );
}
