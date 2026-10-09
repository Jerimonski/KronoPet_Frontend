import {
  ArrowLeft,
  CalendarPlus,
  CalendarSync,
  Fingerprint,
  Mail,
  MapPin,
  PawPrint,
  Pencil,
  Phone,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useDb } from "../../../core/mocks/mockDb";
import { formatAge, formatDate } from "../../../core/utils/dates";
import { Avatar, PetAvatar } from "../../../shared/components/Avatar";
import EmptyState from "../../../shared/components/EmptyState";
import Panel from "../../../shared/components/Panel";
import PetFormModal from "../../pets/components/PetFormModal";
import { countByStatus } from "../../vaccines/vaccineService";
import TutorFormModal from "../components/TutorFormModal";
import { useTutor } from "../tutorService";

export default function TutorDetailPage() {
  const { tutorId } = useParams();
  const tutor = useTutor(tutorId);
  const { pets, events, vaccines } = useDb();
  const [editing, setEditing] = useState(false);
  const [addingPet, setAddingPet] = useState(false);

  if (!tutor) {
    return (
      <Panel>
        <EmptyState
          icon={PawPrint}
          title="Tutor no encontrado"
          description="Es posible que el registro no exista."
          action={
            <Link to="/dashboard/tutores" className="btn-app-outline">
              Volver a tutores
            </Link>
          }
        />
      </Panel>
    );
  }

  const tutorPets = pets.filter((p) => p.tutorId === tutor.id);

  return (
    <>
      <Link to="/dashboard/tutores" className="btn-ghost mb-4 inline-flex items-center gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Tutores
      </Link>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={tutor.name} className="h-16 w-16 text-lg" />
            <h1 className="mt-3 font-sans text-xl font-bold text-neutral-900">{tutor.name}</h1>
            <p className="text-sm text-neutral-500">
              Tutor de {tutorPets.length} {tutorPets.length === 1 ? "mascota" : "mascotas"}
            </p>
            <button type="button" className="btn-app-outline mt-4" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Editar datos
            </button>
          </div>
          <dl className="mt-6 space-y-3 border-t border-neutral-100 pt-5 text-sm">
            <InfoRow icon={Fingerprint} label="RUT" value={tutor.rut} />
            <InfoRow icon={Mail} label="Correo" value={<a href={`mailto:${tutor.email}`} className="hover:text-primary-700">{tutor.email}</a>} />
            <InfoRow icon={Phone} label="Teléfono" value={<a href={`tel:${tutor.phone.replace(/\s/g, "")}`} className="hover:text-primary-700">{tutor.phone}</a>} />
            <InfoRow icon={MapPin} label="Dirección" value={tutor.address} />
            <InfoRow icon={CalendarPlus} label="Creado" value={formatDate(tutor.createdAt)} />
            <InfoRow icon={CalendarSync} label="Actualizado" value={formatDate(tutor.updatedAt)} />
          </dl>
        </Panel>

        <Panel
          title="Mascotas asociadas"
          className="lg:col-span-2"
          action={
            <button type="button" className="btn-app h-9" onClick={() => setAddingPet(true)}>
              <Plus className="h-4 w-4" /> Asociar mascota
            </button>
          }
        >
          {tutorPets.length === 0 ? (
            <EmptyState
              icon={PawPrint}
              title="Este tutor aún no tiene mascotas"
              description="Registra una mascota y quedará asociada a este tutor."
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {tutorPets.map((pet) => {
                const petEvents = events.filter((e) => e.petId === pet.id);
                const lastVisit = petEvents.map((e) => e.date).sort().at(-1);
                const vacCounts = countByStatus(vaccines.filter((v) => v.petId === pet.id));
                const alerts = vacCounts.vencida + vacCounts.proxima + vacCounts.pendiente;
                return (
                  <li key={pet.id}>
                    <Link
                      to={`/dashboard/mascotas/${pet.id}`}
                      className="flex h-full gap-3 rounded-xl p-4 ring-1 ring-neutral-200 transition hover:shadow-(--shadow-card) hover:ring-primary-300"
                    >
                      <PetAvatar species={pet.species} className="h-12 w-12 text-2xl" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900">{pet.name}</p>
                        <p className="truncate text-sm text-neutral-500">
                          {pet.breed} · {pet.sex} · {formatAge(pet.birthDate)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                          <span>{petEvents.length} atenciones</span>
                          {lastVisit && <span>Última: {formatDate(lastVisit)}</span>}
                          {alerts > 0 && (
                            <span className="font-medium text-amber-700">
                              {alerts} {alerts === 1 ? "vacuna" : "vacunas"} por atender
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <TutorFormModal open={editing} tutor={tutor} onClose={() => setEditing(false)} />
      <PetFormModal open={addingPet} defaultTutorId={tutor.id} onClose={() => setAddingPet(false)} />
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
      <dt className="w-24 shrink-0 text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-neutral-800">{value}</dd>
    </div>
  );
}
