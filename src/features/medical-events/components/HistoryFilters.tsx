import { X } from "lucide-react";
import { MEDICAL_REASONS, REASON_STYLES, type MedicalReason } from "../../../core/constants/medicalReasons";
import type { StaffUser } from "../../../core/types/models";
import { cn } from "../../../lib/utils";
import { SearchInput, SelectInput, TextInput } from "../../../shared/components/form";
import { EMPTY_FILTERS, type HistoryFilterState } from "../historyFilters";

interface HistoryFiltersProps {
  value: HistoryFilterState;
  onChange: (value: HistoryFilterState) => void;
  staff: StaffUser[];
  searchPlaceholder?: string;
}

export default function HistoryFilters({ value, onChange, staff, searchPlaceholder }: HistoryFiltersProps) {
  const toggleReason = (reason: MedicalReason) =>
    onChange({
      ...value,
      reasons: value.reasons.includes(reason)
        ? value.reasons.filter((r) => r !== reason)
        : [...value.reasons, reason],
    });

  const active =
    value.query || value.reasons.length || value.vetId || value.from || value.to;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
        <SearchInput
          value={value.query}
          onChange={(query) => onChange({ ...value, query })}
          placeholder={searchPlaceholder ?? "Buscar por título, diagnóstico u observación..."}
        />
        <SelectInput
          value={value.vetId}
          onChange={(e) => onChange({ ...value, vetId: e.target.value })}
          className="md:w-52"
          aria-label="Veterinario"
        >
          <option value="">Todos los veterinarios</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {!s.active && " (deshabilitado)"}
            </option>
          ))}
        </SelectInput>
        <TextInput
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          aria-label="Desde"
          className="md:w-40"
        />
        <TextInput
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          aria-label="Hasta"
          className="md:w-40"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {MEDICAL_REASONS.map((reason) => {
          const selected = value.reasons.includes(reason);
          return (
            <button
              key={reason}
              type="button"
              onClick={() => toggleReason(reason)}
              aria-pressed={selected}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 transition ring-inset",
                selected
                  ? REASON_STYLES[reason].badge
                  : "bg-white text-neutral-600 ring-neutral-200 hover:ring-neutral-300",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", REASON_STYLES[reason].dot)} />
              {reason}
            </button>
          );
        })}
        {active ? (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900"
          >
            <X className="h-3.5 w-3.5" /> Limpiar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}
