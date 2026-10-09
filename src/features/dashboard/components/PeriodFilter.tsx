import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { PERIOD_TYPES, type Period, type PeriodType } from "../dashboardStats";

interface PeriodFilterProps {
  period: Period;
  onTypeChange: (type: PeriodType) => void;
  onShift: (delta: number) => void;
  onReset: () => void;
}

/** Selector de periodo del dashboard: tipo (semana/mes/año) + navegación entre periodos. */
export default function PeriodFilter({ period, onTypeChange, onShift, onReset }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Agrupar métricas por"
        className="inline-flex h-10 items-center rounded-xl bg-neutral-100 p-1"
      >
        {PERIOD_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={period.type === value}
            onClick={() => onTypeChange(value)}
            className={cn(
              "h-8 rounded-lg px-3 text-sm font-medium transition",
              period.type === value
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-white">
        <button
          type="button"
          onClick={() => onShift(-1)}
          className="grid h-full w-9 place-items-center rounded-l-xl text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800"
          aria-label="Periodo anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex min-w-36 items-center justify-center gap-1.5 px-2 text-sm font-medium text-neutral-800 tabular-nums">
          <CalendarDays className="h-4 w-4 text-primary-600" />
          {period.label}
        </span>
        <button
          type="button"
          onClick={() => onShift(1)}
          disabled={period.isCurrent}
          className="grid h-full w-9 place-items-center rounded-r-xl text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Periodo siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!period.isCurrent && (
        <button type="button" onClick={onReset} className="text-sm font-medium text-primary-700 hover:text-primary-900">
          Volver a hoy
        </button>
      )}
    </div>
  );
}
