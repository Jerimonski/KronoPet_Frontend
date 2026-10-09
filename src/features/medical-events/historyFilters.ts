import type { MedicalReason } from "../../core/constants/medicalReasons";
import type { MedicalEvent } from "../../core/types/models";

export interface HistoryFilterState {
  query: string;
  reasons: MedicalReason[];
  vetId: string;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: HistoryFilterState = {
  query: "",
  reasons: [],
  vetId: "",
  from: "",
  to: "",
};

export function applyHistoryFilters(
  events: MedicalEvent[],
  filters: HistoryFilterState,
  extraText: (event: MedicalEvent) => string = () => "",
): MedicalEvent[] {
  const q = filters.query.trim().toLowerCase();
  return events.filter((e) => {
    if (filters.reasons.length && !filters.reasons.includes(e.reason)) return false;
    if (filters.vetId && e.vetId !== filters.vetId) return false;
    if (filters.from && e.date < filters.from) return false;
    if (filters.to && e.date > filters.to) return false;
    if (q) {
      const text = `${e.title} ${e.diagnosis} ${e.observations} ${extraText(e)}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
}
