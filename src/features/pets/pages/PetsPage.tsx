import { PawPrint, Pencil, Plus, Syringe, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SPECIES } from "../../../core/constants/pets";
import { useNotification } from "../../../core/hooks/useNotification";
import { useDb } from "../../../core/mocks/mockDb";
import type { Pet, Species } from "../../../core/types/models";
import { formatAge, formatDate } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { PetAvatar } from "../../../shared/components/Avatar";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import { SearchInput } from "../../../shared/components/form";
import PageHeader from "../../../shared/components/PageHeader";
import { countByStatus } from "../../vaccines/vaccineService";
import PetFormModal from "../components/PetFormModal";
import { matchesPet, petService } from "../petService";

export default function PetsPage() {
  const { pets, tutors, events, vaccines } = useDb();
  const notify = useNotification();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState<Species | null>(null);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState<Pet | null>(null);
  const creating = params.get("nueva") === "1";

  const tutorName = (id: string) => tutors.find((t) => t.id === id)?.name ?? "";
  const rows = pets
    .filter((p) => (species ? p.species === species : true))
    .filter((p) => matchesPet(p, query, tutorName(p.tutorId)))
    .sort((a, b) => a.name.localeCompare(b.name));

  const closeCreate = () => {
    params.delete("nueva");
    setParams(params, { replace: true });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await petService.remove(deleting.id);
      notify.success(`${deleting.name} fue eliminada junto con su historial y vacunas.`);
      setDeleting(null);
    } catch (err) {
      notify.error(err, "No se pudo eliminar la mascota.");
    }
  };

  return (
    <>
      <PageHeader
        title="Mascotas"
        description={`${pets.length} pacientes registrados.`}
        actions={
          <button
            type="button"
            className="btn-app"
            onClick={() => setParams({ nueva: "1" }, { replace: true })}
          >
            <Plus className="h-4 w-4" /> Registrar mascota
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre, raza o tutor..."
          className="lg:w-96"
        />
        <div className="flex flex-wrap gap-1.5">
          {[null, ...SPECIES].map((s) => {
            const count = s ? pets.filter((p) => p.species === s).length : pets.length;
            if (s && count === 0) return null;
            return (
              <button
                key={s ?? "all"}
                type="button"
                onClick={() => setSpecies(s)}
                aria-pressed={species === s}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ring-inset",
                  species === s
                    ? "bg-primary-700 text-white ring-primary-700"
                    : "bg-white text-neutral-600 ring-neutral-200 hover:ring-neutral-300",
                )}
              >
                {s ?? "Todas"} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-neutral-200">
          <EmptyState
            icon={PawPrint}
            title="No se encontraron mascotas"
            description="Ajusta la búsqueda o registra una nueva mascota."
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((pet) => {
            const lastVisit = events
              .filter((e) => e.petId === pet.id)
              .map((e) => e.date)
              .sort()
              .at(-1);
            const counts = countByStatus(vaccines.filter((v) => v.petId === pet.id));
            const alerts = counts.vencida + counts.proxima + counts.pendiente;
            return (
              <li
                key={pet.id}
                className="group relative flex flex-col rounded-2xl bg-white p-4 shadow-(--shadow-card) ring-1 ring-neutral-200/70 transition hover:ring-primary-300"
              >
                <div className="flex items-start gap-3">
                  <PetAvatar species={pet.species} className="h-12 w-12 text-2xl" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/dashboard/mascotas/${pet.id}`}
                      className="font-semibold text-neutral-900 after:absolute after:inset-0 hover:text-primary-700"
                    >
                      {pet.name}
                    </Link>
                    <p className="truncate text-sm text-neutral-500">{pet.breed}</p>
                  </div>
                  <div className="relative z-10 flex opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                    <button type="button" className="btn-icon" onClick={() => setEditing(pet)} aria-label={`Editar ${pet.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="btn-icon hover:bg-danger-bg hover:text-danger"
                      onClick={() => setDeleting(pet)}
                      aria-label={`Eliminar ${pet.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
                  <dt className="text-neutral-400">Especie / sexo</dt>
                  <dd className="text-right text-neutral-700">
                    {pet.species} · {pet.sex}
                  </dd>
                  <dt className="text-neutral-400">Edad</dt>
                  <dd className="text-right text-neutral-700">{formatAge(pet.birthDate)}</dd>
                  <dt className="text-neutral-400">Tutor</dt>
                  <dd className="truncate text-right text-neutral-700">{tutorName(pet.tutorId)}</dd>
                  <dt className="text-neutral-400">Última atención</dt>
                  <dd className="text-right text-neutral-700">{lastVisit ? formatDate(lastVisit) : "—"}</dd>
                </dl>
                <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs">
                  <Syringe className="h-3.5 w-3.5 text-neutral-400" />
                  {alerts > 0 ? (
                    <span className="font-medium text-amber-700">
                      {[
                        counts.vencida > 0 && `${counts.vencida} vencida${counts.vencida > 1 ? "s" : ""}`,
                        counts.proxima > 0 && `${counts.proxima} por vencer`,
                        counts.pendiente > 0 && `${counts.pendiente} pendiente${counts.pendiente > 1 ? "s" : ""}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  ) : (
                    <span className="text-success">Vacunas al día</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <PetFormModal open={creating} onClose={closeCreate} />
      <PetFormModal open={!!editing} pet={editing ?? undefined} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        title={`Eliminar a ${deleting?.name}`}
        message="Se eliminará la mascota junto con su historial clínico y sus vacunas. Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
