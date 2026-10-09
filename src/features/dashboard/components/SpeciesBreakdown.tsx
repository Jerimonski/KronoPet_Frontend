import { useState } from "react";
import { SPECIES, SPECIES_COLORS } from "../../../core/constants/pets";
import type { Pet } from "../../../core/types/models";
import Panel from "../../../shared/components/Panel";

/** Barra apilada por especie + leyenda con conteos (la leyenda es la vista tabular). */
interface SpeciesBreakdownProps {
  pets: Pet[];
  newInPeriod: number;
  /** Ej. "este mes" o "en el periodo". */
  periodPhrase: string;
}

export default function SpeciesBreakdown({ pets, newInPeriod, periodPhrase }: SpeciesBreakdownProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const rows = SPECIES.map((species) => ({
    species,
    count: pets.filter((p) => p.species === species).length,
  })).filter((r) => r.count > 0);
  const total = pets.length;

  return (
    <Panel title="Mascotas por especie" className="h-full">
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
          {total}
        </span>
        <span className="text-xs text-neutral-500">mascotas</span>
        {newInPeriod > 0 && (
          <span className="ml-1 rounded-md bg-success-bg px-1.5 py-0.5 text-[11px] font-semibold text-success">
            +{newInPeriod} {periodPhrase}
          </span>
        )}
      </div>

      <div className="mt-4 flex h-6 gap-[2px]" role="img" aria-label="Distribución de mascotas por especie">
        {rows.map((r, i) => (
          <div
            key={r.species}
            className="bar-stripes relative transition-opacity"
            style={{
              width: `${(r.count / total) * 100}%`,
              backgroundColor: SPECIES_COLORS[r.species],
              borderRadius:
                i === 0 ? "4px 0 0 4px" : i === rows.length - 1 ? "0 4px 4px 0" : undefined,
              opacity: hovered && hovered !== r.species ? 0.35 : 1,
            }}
            onMouseEnter={() => setHovered(r.species)}
            onMouseLeave={() => setHovered(null)}
            title={`${r.species}: ${r.count} (${Math.round((r.count / total) * 100)}%)`}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={r.species}
            className="flex items-center justify-between rounded-md text-sm"
            onMouseEnter={() => setHovered(r.species)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="flex items-center gap-2 text-neutral-700">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: SPECIES_COLORS[r.species] }}
              />
              {r.species}
            </span>
            <span className="text-neutral-900 tabular-nums">
              <span className="font-medium">{r.count}</span>
              <span className="ml-1.5 text-xs text-neutral-400">
                {Math.round((r.count / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
