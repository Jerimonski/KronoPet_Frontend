import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useNotification } from "../../../core/hooks/useNotification";
import type { Pet, Vaccine } from "../../../core/types/models";
import { daysBetween, formatDate, todayISO } from "../../../core/utils/dates";
import { PetAvatar } from "../../../shared/components/Avatar";
import { VaccineStatusBadge } from "../../../shared/components/Badges";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { getVaccineStatus, vaccineService } from "../vaccineService";
import VaccineFormModal from "./VaccineFormModal";

interface VaccineTableProps {
  vaccines: Vaccine[];
  /** Si se entrega, agrega la columna de mascota (vista global). */
  pets?: Pet[];
}

export default function VaccineTable({ vaccines, pets }: VaccineTableProps) {
  const notify = useNotification();
  const [editing, setEditing] = useState<Vaccine | null>(null);
  const [deleting, setDeleting] = useState<Vaccine | null>(null);
  const today = todayISO();

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await vaccineService.remove(deleting.id);
      notify.success(`Vacuna ${deleting.name} eliminada.`);
      setDeleting(null);
    } catch (err) {
      notify.error(err, "No se pudo eliminar la vacuna.");
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="app-table min-w-[720px]">
          <thead>
            <tr>
              {pets && <th>Mascota</th>}
              <th>Vacuna</th>
              <th>Aplicación</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th className="w-24 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vaccines.map((vaccine) => {
              const status = getVaccineStatus(vaccine, today);
              const days = daysBetween(today, vaccine.expiresAt);
              const pet = pets?.find((p) => p.id === vaccine.petId);
              return (
                <tr key={vaccine.id} className="transition hover:bg-neutral-50">
                  {pets && (
                    <td>
                      {pet && (
                        <Link
                          to={`/dashboard/mascotas/${pet.id}?tab=vacunas`}
                          className="flex items-center gap-2.5 font-medium text-neutral-900 hover:text-primary-700"
                        >
                          <PetAvatar species={pet.species} className="h-8 w-8 rounded-lg text-sm" />
                          {pet.name}
                        </Link>
                      )}
                    </td>
                  )}
                  <td>
                    <p className="font-medium text-neutral-900">{vaccine.name}</p>
                    {vaccine.description && (
                      <p className="line-clamp-1 max-w-xs text-xs text-neutral-500">{vaccine.description}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-neutral-600">
                    {vaccine.appliedAt ? formatDate(vaccine.appliedAt) : "—"}
                  </td>
                  <td className="whitespace-nowrap">
                    <p className="text-neutral-700">{formatDate(vaccine.expiresAt)}</p>
                    <p className={days < 0 ? "text-xs text-danger" : "text-xs text-neutral-400"}>
                      {days < 0 ? `Hace ${-days} días` : days === 0 ? "Hoy" : `En ${days} días`}
                    </p>
                  </td>
                  <td>
                    <VaccineStatusBadge status={status} />
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button type="button" className="btn-icon" onClick={() => setEditing(vaccine)} aria-label="Editar vacuna">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="btn-icon hover:bg-danger-bg hover:text-danger"
                        onClick={() => setDeleting(vaccine)}
                        aria-label="Eliminar vacuna"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <VaccineFormModal open={!!editing} vaccine={editing ?? undefined} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar vacuna"
        message={`¿Eliminar el registro de la vacuna "${deleting?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
