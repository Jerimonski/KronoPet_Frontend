import { CalendarClock, CalendarDays, Lock, Scale, Stethoscope } from "lucide-react";
import { Link } from "react-router";
import { useDb } from "../../../core/mocks/mockDb";
import type { MedicalEvent } from "../../../core/types/models";
import { formatDate } from "../../../core/utils/dates";
import { ReasonBadge } from "../../../shared/components/Badges";
import Modal from "../../../shared/components/Modal";
import { AttachmentList } from "./Attachments";

interface Props {
  event: MedicalEvent | null;
  onClose: () => void;
}

export default function MedicalEventDetailModal({ event, onClose }: Props) {
  const { pets, staff, tutors } = useDb();
  if (!event) return null;
  const pet = pets.find((p) => p.id === event.petId);
  const tutor = tutors.find((t) => t.id === pet?.tutorId);
  const vet = staff.find((s) => s.id === event.vetId);

  return (
    <Modal
      open
      size="lg"
      title={event.title}
      description={pet ? `${pet.name} · ${pet.species} · Tutor: ${tutor?.name ?? "—"}` : undefined}
      onClose={onClose}
      footer={
        <>
          <p className="mr-auto flex items-center gap-1.5 text-xs text-neutral-500">
            <Lock className="h-3.5 w-3.5" /> Registro inmutable · los adjuntos solo se agregan
          </p>
          {pet && (
            <Link to={`/dashboard/mascotas/${pet.id}`} className="btn-app-outline" onClick={onClose}>
              Ver mascota
            </Link>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600">
        <ReasonBadge reason={event.reason} />
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-neutral-400" /> {formatDate(event.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Scale className="h-4 w-4 text-neutral-400" /> {event.weightKg.toLocaleString("es-CL")} kg
        </span>
        <span className="flex items-center gap-1.5">
          <Stethoscope className="h-4 w-4 text-neutral-400" /> {vet?.name ?? "—"}
        </span>
        {event.followUpDate && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-neutral-400" /> Control: {formatDate(event.followUpDate)}
          </span>
        )}
      </div>
      <dl className="mt-5 space-y-4">
        <DetailBlock label="Observaciones" value={event.observations} />
        <DetailBlock label="Diagnóstico" value={event.diagnosis} highlight />
        <DetailBlock label="Recomendaciones" value={event.recommendations || "Sin recomendaciones."} />
      </dl>
      <div className="mt-5 border-t border-neutral-100 pt-4">
        <AttachmentList eventId={event.id} isLabExam={event.reason === "Examen de Laboratorio"} />
      </div>
    </Modal>
  );
}

function DetailBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-xl bg-primary-50 p-4 ring-1 ring-primary-100" : ""}>
      <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-line text-neutral-800">{value}</dd>
    </div>
  );
}
