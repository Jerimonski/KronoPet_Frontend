import type { PetSex, ReproductiveStatus, Species } from "../types/models";

export const SPECIES: Species[] = ["Perro", "Gato", "Ave", "Conejo", "Otro"];
export const PET_SEXES: PetSex[] = ["Macho", "Hembra"];
export const REPRODUCTIVE_STATUSES: ReproductiveStatus[] = [
  "Entero",
  "Esterilizado",
];

/**
 * Colores por especie para gráficos. Son pasos más saturados de la paleta
 * de marca (validados para daltonismo); "Otro" es el gris de agrupación.
 */
export const SPECIES_COLORS: Record<Species, string> = {
  Perro: "#0b9393",
  Gato: "#f26b3b",
  Ave: "#4a5bc4",
  Conejo: "#7cad2c",
  Otro: "#94a3b8",
};

export const SPECIES_EMOJI: Record<Species, string> = {
  Perro: "🐶",
  Gato: "🐱",
  Ave: "🐦",
  Conejo: "🐰",
  Otro: "🐾",
};
