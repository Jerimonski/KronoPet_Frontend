import { CalendarClock, ChevronRight, Paperclip, Scale, Stethoscope } from "lucide-react";
import { REASON_STYLES } from "../../../core/constants/medicalReasons";
import { useDb } from "../../../core/mocks/mockDb";
import type { MedicalEvent, Pet, StaffUser } from "../../../core/types/models";
import { formatDate } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { ReasonBadge } from "../../../shared/components/Badges";

interface MedicalTimelineProps {
  events: MedicalEvent[];
  staff: StaffUser[];
  /** Si se entrega, muestra el nombre de la mascota en cada evento (vista global). */
  pets?: Pet[];
  onSelect: (event: MedicalEvent) => void;
}

/** Historial cronológico: agrupado por año, más reciente primero. */
export default function MedicalTimeline({ events, staff, pets, onSelect }: MedicalTimelineProps) {
  const { attachments } = useDb();
  const groups = new Map<string, MedicalEvent[]>();
  for (const event of events) {
    const year = event.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), event]);
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([year, items]) => (
        <section key={year}>
          <h4 className="mb-3 font-sans text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            {year} · {items.length} {items.length === 1 ? "atención" : "atenciones"}
          </h4>
          <ol className="relative space-y-3 border-l-2 border-neutral-200 pl-6">
            {items.map((event) => {
              const pet = pets?.find((p) => p.id === event.petId);
              return (
                <li key={event.id} className="relative">
                  <span
                    className={cn(
                      "absolute top-4 -left-[31px] h-3 w-3 rounded-full ring-4 ring-white",
                      REASON_STYLES[event.reason].dot,
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => onSelect(event)}
                    className="group w-full rounded-xl bg-white p-4 text-left ring-1 ring-neutral-200 transition hover:shadow-(--shadow-card) hover:ring-primary-300"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs font-medium text-neutral-500 tabular-nums">
                        {formatDate(event.date)}
                      </span>
                      <ReasonBadge reason={event.reason} />
                      <ChevronRight className="ml-auto h-4 w-4 text-neutral-300 transition group-hover:text-primary-600" />
                    </div>
                    <p className="mt-2 font-semibold text-neutral-900">
                      {pet && <span className="text-primary-700">{pet.name} · </span>}
                      {event.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-neutral-600">
                      <span className="text-neutral-400">Diagnóstico:</span> {event.diagnosis}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {staff.find((s) => s.id === event.vetId)?.name ?? "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Scale className="h-3.5 w-3.5" />
                        {event.weightKg.toLocaleString("es-CL")} kg
                      </span>
                      {event.followUpDate && (
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Control: {formatDate(event.followUpDate)}
                        </span>
                      )}
                      {attachments.some((a) => a.eventId === event.id) && (
                        <span className="flex items-center gap-1 font-medium text-primary-700">
                          <Paperclip className="h-3.5 w-3.5" />
                          {attachments.filter((a) => a.eventId === event.id).length} adjuntos
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
