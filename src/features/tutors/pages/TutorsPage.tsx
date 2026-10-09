import { ChevronRight, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { SPECIES_EMOJI } from "../../../core/constants/pets";
import { formatDate } from "../../../core/utils/dates";
import { Avatar } from "../../../shared/components/Avatar";
import EmptyState from "../../../shared/components/EmptyState";
import { SearchInput, SelectInput } from "../../../shared/components/form";
import PageHeader from "../../../shared/components/PageHeader";
import Panel from "../../../shared/components/Panel";
import { usePets } from "../../pets/petService";
import TutorFormModal from "../components/TutorFormModal";
import { matchesTutor, useTutors } from "../tutorService";

type SortKey = "name" | "recent";

export default function TutorsPage() {
  const tutors = useTutors();
  const pets = usePets();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [creating, setCreating] = useState(false);

  const petsOf = (tutorId: string) => pets.filter((p) => p.tutorId === tutorId);
  const rows = tutors
    .filter((t) => matchesTutor(t, query))
    .sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt),
    );

  return (
    <>
      <PageHeader
        title="Tutores"
        description={`${tutors.length} tutores registrados en la clínica.`}
        actions={
          <button type="button" className="btn-app" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Registrar tutor
          </button>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-col gap-2 border-b border-neutral-100 p-4 sm:flex-row">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, RUT, correo o teléfono..."
            className="flex-1"
          />
          <SelectInput
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="sm:w-48"
            aria-label="Ordenar"
          >
            <option value="name">Orden alfabético</option>
            <option value="recent">Más recientes</option>
          </SelectInput>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No se encontraron tutores"
            description="Prueba con otro término de búsqueda o registra un nuevo tutor."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="app-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Tutor</th>
                  <th>RUT</th>
                  <th>Contacto</th>
                  <th>Mascotas</th>
                  <th>Registrado</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((tutor) => {
                  const tutorPets = petsOf(tutor.id);
                  return (
                    <tr
                      key={tutor.id}
                      className="cursor-pointer transition hover:bg-neutral-50"
                      onClick={() => navigate(`/dashboard/tutores/${tutor.id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={tutor.name} />
                          <Link
                            to={`/dashboard/tutores/${tutor.id}`}
                            className="font-medium text-neutral-900 hover:text-primary-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tutor.name}
                          </Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-neutral-600 tabular-nums">{tutor.rut}</td>
                      <td>
                        <p className="text-neutral-700">{tutor.email}</p>
                        <p className="text-xs text-neutral-500">{tutor.phone}</p>
                      </td>
                      <td>
                        {tutorPets.length === 0 ? (
                          <span className="text-xs text-neutral-400">Sin mascotas</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {tutorPets.map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
                              >
                                {SPECIES_EMOJI[p.species]} {p.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-neutral-500">{formatDate(tutor.createdAt)}</td>
                      <td>
                        <ChevronRight className="h-4 w-4 text-neutral-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <TutorFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(t) => navigate(`/dashboard/tutores/${t.id}`)}
      />
    </>
  );
}
