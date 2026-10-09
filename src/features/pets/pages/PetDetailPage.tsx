import {
  ArrowLeft,
  ClipboardList,
  PawPrint,
  Pencil,
  Plus,
  Scale,
  Syringe,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useNotification } from "../../../core/hooks/useNotification";
import { useDb } from "../../../core/mocks/mockDb";
import type { MedicalEvent } from "../../../core/types/models";
import { formatAge, formatDate } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { PetAvatar } from "../../../shared/components/Avatar";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import Panel from "../../../shared/components/Panel";
import HistoryFilters from "../../medical-events/components/HistoryFilters";
import MedicalEventDetailModal from "../../medical-events/components/MedicalEventDetailModal";
import MedicalEventFormModal from "../../medical-events/components/MedicalEventFormModal";
import MedicalTimeline from "../../medical-events/components/MedicalTimeline";
import { applyHistoryFilters, EMPTY_FILTERS } from "../../medical-events/historyFilters";
import { usePetMedicalEvents } from "../../medical-events/medicalEventService";
import VaccineFormModal from "../../vaccines/components/VaccineFormModal";
import VaccineStatusSummary from "../../vaccines/components/VaccineStatusSummary";
import VaccineTable from "../../vaccines/components/VaccineTable";
import { countByStatus, usePetVaccines } from "../../vaccines/vaccineService";
import { PetAlertsBar } from "../components/PetAlerts";
import PetFormModal from "../components/PetFormModal";
import WeightPanel from "../components/WeightPanel";
import { petService, usePet } from "../petService";

type Tab = "historial" | "vacunas" | "peso";

const TABS: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
  { id: "historial", label: "Historial clínico", icon: ClipboardList },
  { id: "vacunas", label: "Vacunas", icon: Syringe },
  { id: "peso", label: "Evolución del peso", icon: Scale },
];

export default function PetDetailPage() {
  const { petId } = useParams();
  const pet = usePet(petId);
  const { tutors, staff } = useDb();
  const events = usePetMedicalEvents(petId);
  const vaccines = usePetVaccines(petId);
  const notify = useNotification();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "historial") as Tab;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState<MedicalEvent | null>(null);
  const [modal, setModal] = useState<"evento" | "vacuna" | "editar" | "eliminar" | null>(null);

  if (!pet) {
    return (
      <Panel>
        <EmptyState
          icon={PawPrint}
          title="Mascota no encontrada"
          description="Es posible que el registro haya sido eliminado."
          action={
            <Link to="/dashboard/mascotas" className="btn-app-outline">
              Volver a mascotas
            </Link>
          }
        />
      </Panel>
    );
  }

  const tutor = tutors.find((t) => t.id === pet.tutorId);
  const filtered = applyHistoryFilters(events, filters);
  const lastEvent = events[0];
  const vacCounts = countByStatus(vaccines);

  const handleDelete = async () => {
    try {
      await petService.remove(pet.id);
      notify.success(`${pet.name} fue eliminada.`);
      navigate("/dashboard/mascotas", { replace: true });
    } catch (err) {
      notify.error(err, "No se pudo eliminar la mascota.");
    }
  };

  return (
    <>
      <Link to="/dashboard/mascotas" className="btn-ghost mb-4 inline-flex items-center gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Mascotas
      </Link>

      {/* Encabezado de la mascota */}
      <section className="rounded-2xl bg-white p-5 shadow-(--shadow-card) ring-1 ring-neutral-200/70 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex flex-1 items-start gap-4">
            <PetAvatar species={pet.species} className="h-16 w-16 rounded-2xl text-3xl" />
            <div className="min-w-0">
              <h1 className="font-sans text-2xl font-bold text-neutral-900">{pet.name}</h1>
              <p className="text-sm text-neutral-500">
                {pet.species} · {pet.breed}
              </p>
              {tutor && (
                <p className="mt-1 text-sm">
                  <span className="text-neutral-500">Tutor: </span>
                  <Link to={`/dashboard/tutores/${tutor.id}`} className="font-medium text-primary-700 hover:text-primary-900">
                    {tutor.name}
                  </Link>
                  <span className="text-neutral-400"> · {tutor.phone}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-app" onClick={() => setModal("evento")}>
              <Plus className="h-4 w-4" /> Nueva ficha
            </button>
            <button type="button" className="btn-app-accent" onClick={() => setModal("vacuna")}>
              <Syringe className="h-4 w-4" /> Nueva vacuna
            </button>
            <button type="button" className="btn-app-outline px-3" onClick={() => setModal("editar")} aria-label="Editar mascota">
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn-app-outline px-3 hover:border-danger/30 hover:bg-danger-bg hover:text-danger"
              onClick={() => setModal("eliminar")}
              aria-label="Eliminar mascota"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <PetAlertsBar pet={pet} />

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-3 xl:grid-cols-6">
          <Info label="Sexo" value={pet.sex} />
          <Info label="Nacimiento" value={formatDate(pet.birthDate)} sub={formatAge(pet.birthDate)} />
          <Info label="Estado reproductivo" value={pet.reproductiveStatus} />
          <Info
            label="Último peso"
            value={lastEvent ? `${lastEvent.weightKg.toLocaleString("es-CL")} kg` : "—"}
            sub={lastEvent ? formatDate(lastEvent.date) : undefined}
          />
          <Info label="Atenciones" value={String(events.length)} sub={lastEvent ? `Última: ${formatDate(lastEvent.date)}` : undefined} />
          <Info label="Registrada" value={formatDate(pet.createdAt)} />
        </dl>
      </section>

      {/* Pestañas */}
      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-neutral-200 sm:inline-flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setParams({ tab: id }, { replace: true })}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium whitespace-nowrap transition",
              tab === id ? "bg-primary-700 text-white" : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === "vacunas" && vacCounts.vencida + vacCounts.proxima > 0 && (
              <span className="rounded-full bg-accent-500 px-1.5 text-[10px] text-white">
                {vacCounts.vencida + vacCounts.proxima}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "historial" && (
          <Panel>
            <HistoryFilters value={filters} onChange={setFilters} staff={staff} />
            <div className="mt-5">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title={events.length === 0 ? "Sin atenciones registradas" : "Ninguna atención coincide con los filtros"}
                  action={
                    events.length === 0 && (
                      <button type="button" className="btn-app" onClick={() => setModal("evento")}>
                        <Plus className="h-4 w-4" /> Crear primera ficha
                      </button>
                    )
                  }
                />
              ) : (
                <MedicalTimeline events={filtered} staff={staff} onSelect={setSelected} />
              )}
            </div>
          </Panel>
        )}

        {tab === "vacunas" && (
          <div className="space-y-4">
            <VaccineStatusSummary counts={vacCounts} />
            <Panel bodyClassName="p-0">
              {vaccines.length === 0 ? (
                <EmptyState
                  icon={Syringe}
                  title="Sin vacunas registradas"
                  action={
                    <button type="button" className="btn-app-accent" onClick={() => setModal("vacuna")}>
                      <Plus className="h-4 w-4" /> Registrar vacuna
                    </button>
                  }
                />
              ) : (
                <VaccineTable vaccines={vaccines} />
              )}
            </Panel>
          </div>
        )}

        {tab === "peso" && <WeightPanel petName={pet.name} events={events} />}
      </div>

      <MedicalEventDetailModal event={selected} onClose={() => setSelected(null)} />
      <MedicalEventFormModal open={modal === "evento"} defaultPetId={pet.id} onClose={() => setModal(null)} />
      <VaccineFormModal open={modal === "vacuna"} defaultPetId={pet.id} onClose={() => setModal(null)} />
      <PetFormModal open={modal === "editar"} pet={pet} onClose={() => setModal(null)} />
      <ConfirmDialog
        open={modal === "eliminar"}
        title={`Eliminar a ${pet.name}`}
        message="Se eliminará la mascota junto con su historial clínico y sus vacunas. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onClose={() => setModal(null)}
      />
    </>
  );
}

function Info({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-neutral-900">{value}</dd>
      {sub && <dd className="text-xs text-neutral-400">{sub}</dd>}
    </div>
  );
}
