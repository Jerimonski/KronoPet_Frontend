import { ClipboardList, List, Plus, Rows3 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useDb } from "../../../core/mocks/mockDb";
import type { MedicalEvent } from "../../../core/types/models";
import { formatDate } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { ReasonBadge } from "../../../shared/components/Badges";
import EmptyState from "../../../shared/components/EmptyState";
import PageHeader from "../../../shared/components/PageHeader";
import Panel from "../../../shared/components/Panel";
import HistoryFilters from "../../medical-events/components/HistoryFilters";
import MedicalEventDetailModal from "../../medical-events/components/MedicalEventDetailModal";
import MedicalEventFormModal from "../../medical-events/components/MedicalEventFormModal";
import MedicalTimeline from "../../medical-events/components/MedicalTimeline";
import { applyHistoryFilters, EMPTY_FILTERS } from "../../medical-events/historyFilters";
import { sortByDateDesc } from "../../medical-events/medicalEventService";

const PAGE_SIZE = 25;

export default function MedicalHistoryPage() {
  const { events, pets, tutors, staff } = useDb();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [view, setView] = useState<"tabla" | "linea">("tabla");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<MedicalEvent | null>(null);
  const creating = params.get("nueva") === "1";

  const petOf = (id: string) => pets.find((p) => p.id === id);
  const tutorOf = (petId: string) => tutors.find((t) => t.id === petOf(petId)?.tutorId);
  const filtered = applyHistoryFilters(
    sortByDateDesc(events),
    filters,
    (e) => `${petOf(e.petId)?.name ?? ""} ${tutorOf(e.petId)?.name ?? ""}`,
  );
  const visible = filtered.slice(0, limit);

  const closeCreate = () => {
    params.delete("nueva");
    setParams(params, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Historial clínico"
        description="Todas las fichas clínicas registradas. Las fichas son registros inmutables."
        actions={
          <button type="button" className="btn-app" onClick={() => setParams({ nueva: "1" }, { replace: true })}>
            <Plus className="h-4 w-4" /> Nueva ficha clínica
          </button>
        }
      />

      <Panel>
        <HistoryFilters
          value={filters}
          onChange={(value) => {
            setFilters(value);
            setLimit(PAGE_SIZE);
          }}
          staff={staff}
          searchPlaceholder="Buscar por mascota, tutor, título o diagnóstico..."
        />

        <div className="mt-5 mb-3 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            <span className="font-semibold text-neutral-900">{filtered.length}</span> fichas encontradas
          </p>
          <div className="flex rounded-lg bg-neutral-100 p-0.5">
            {(
              [
                { id: "tabla", label: "Tabla", icon: Rows3 },
                { id: "linea", label: "Línea de tiempo", icon: List },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition",
                  view === id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Ninguna ficha coincide con los filtros" />
        ) : view === "linea" ? (
          <MedicalTimeline events={visible} staff={staff} pets={pets} onSelect={setSelected} />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="app-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Mascota</th>
                  <th>Atención</th>
                  <th>Motivo</th>
                  <th>Diagnóstico</th>
                  <th>Peso</th>
                  <th>Veterinario</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((event) => {
                  const pet = petOf(event.petId);
                  return (
                    <tr
                      key={event.id}
                      onClick={() => setSelected(event)}
                      className="cursor-pointer transition hover:bg-neutral-50"
                    >
                      <td className="whitespace-nowrap text-neutral-500 tabular-nums">{formatDate(event.date)}</td>
                      <td>
                        <p className="font-medium text-neutral-900">{pet?.name ?? "—"}</p>
                        <p className="text-xs text-neutral-500">{tutorOf(event.petId)?.name}</p>
                      </td>
                      <td className="text-neutral-800">{event.title}</td>
                      <td>
                        <ReasonBadge reason={event.reason} />
                      </td>
                      <td className="max-w-56 truncate text-neutral-600">{event.diagnosis}</td>
                      <td className="whitespace-nowrap text-neutral-600 tabular-nums">
                        {event.weightKg.toLocaleString("es-CL")} kg
                      </td>
                      <td className="whitespace-nowrap text-neutral-600">
                        {staff.find((s) => s.id === event.vetId)?.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > limit && (
          <div className="mt-4 flex justify-center">
            <button type="button" className="btn-app-outline" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
              Mostrar más ({filtered.length - limit} restantes)
            </button>
          </div>
        )}
      </Panel>

      <MedicalEventDetailModal event={selected} onClose={() => setSelected(null)} />
      <MedicalEventFormModal open={creating} onClose={closeCreate} />
    </>
  );
}
