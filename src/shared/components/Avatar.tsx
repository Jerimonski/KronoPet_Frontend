import { SPECIES_EMOJI } from "../../core/constants/pets";
import type { Species } from "../../core/types/models";
import { cn } from "../../lib/utils";

const TONES = [
  "bg-primary-100 text-primary-800",
  "bg-accent-100 text-accent-800",
  "bg-cat-inmunizacion-50 text-cat-inmunizacion-700",
  "bg-cat-desparasitacion-50 text-cat-desparasitacion-700",
];

function initials(name: string) {
  return name
    .replace(/^(Dra?\.)\s+/, "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const tone = TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold",
        tone,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function PetAvatar({ species, className }: { species: Species; className?: string }) {
  return (
    <span
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-lg ring-1 ring-primary-100",
        className,
      )}
      aria-hidden
    >
      {SPECIES_EMOJI[species]}
    </span>
  );
}
