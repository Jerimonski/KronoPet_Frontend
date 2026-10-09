import { CircleAlert, CircleCheck, Clock, Hourglass, type LucideIcon } from "lucide-react";
import { VACCINE_STATUS_LABELS, VACCINE_STATUSES } from "../../../core/constants/vaccines";
import type { VaccineStatus } from "../../../core/types/models";
import { cn } from "../../../lib/utils";

const ICONS: Record<VaccineStatus, LucideIcon> = {
  aplicada: CircleCheck,
  pendiente: Clock,
  proxima: Hourglass,
  vencida: CircleAlert,
};

const TONES: Record<VaccineStatus, string> = {
  aplicada: "text-success bg-success-bg",
  pendiente: "text-sky-700 bg-info-bg",
  proxima: "text-amber-700 bg-warning-bg",
  vencida: "text-danger bg-danger-bg",
};

interface Props {
  counts: Record<VaccineStatus, number>;
  selected?: VaccineStatus | null;
  onSelect?: (status: VaccineStatus | null) => void;
}

/** Cuatro tarjetas de estado; si hay onSelect, funcionan como filtro. */
export default function VaccineStatusSummary({ counts, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {VACCINE_STATUSES.map((status) => {
        const Icon = ICONS[status];
        const isSelected = selected === status;
        const content = (
          <>
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", TONES[status])}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-xl font-bold text-neutral-900 tabular-nums">{counts[status]}</span>
              <span className="block truncate text-xs text-neutral-500">{VACCINE_STATUS_LABELS[status]}</span>
            </span>
          </>
        );
        const className = cn(
          "flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200 transition",
          onSelect && "hover:ring-primary-300",
          isSelected && "ring-2 ring-primary-500",
        );
        return onSelect ? (
          <button
            key={status}
            type="button"
            aria-pressed={isSelected}
            className={className}
            onClick={() => onSelect(isSelected ? null : status)}
          >
            {content}
          </button>
        ) : (
          <div key={status} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
