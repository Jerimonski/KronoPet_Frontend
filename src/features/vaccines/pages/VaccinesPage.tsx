import { Plus, Syringe } from "lucide-react";
import { useState } from "react";
import { useDb } from "../../../core/mocks/mockDb";
import { COMMON_VACCINES } from "../../../core/constants/vaccines";
import type { VaccineStatus } from "../../../core/types/models";
import EmptyState from "../../../shared/components/EmptyState";
import { SearchInput, SelectInput } from "../../../shared/components/form";
import PageHeader from "../../../shared/components/PageHeader";
import Panel from "../../../shared/components/Panel";
import VaccineFormModal from "../components/VaccineFormModal";
import VaccineStatusSummary from "../components/VaccineStatusSummary";
import VaccineTable from "../components/VaccineTable";
import { countByStatus, getVaccineStatus } from "../vaccineService";

export default function VaccinesPage() {
  const { vaccines, pets, tutors } = useDb();
  const [status, setStatus] = useState<VaccineStatus | null>(null);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const names = [...new Set([...COMMON_VACCINES, ...vaccines.map((v) => v.name)])].sort();
  const q = query.trim().toLowerCase();
  const rows = vaccines
    .filter((v) => (status ? getVaccineStatus(v) === status : true))
    .filter((v) => (name ? v.name === name : true))
    .filter((v) => {
      if (!q) return true;
      const pet = pets.find((p) => p.id === v.petId);
      const tutor = tutors.find((t) => t.id === pet?.tutorId);
      return `${pet?.name} ${tutor?.name} ${v.name}`.toLowerCase().includes(q);
    })
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));

  return (
    <>
      <PageHeader
        title="Vacunas"
        description="Estado de vacunación de todos los pacientes. Haz clic en un estado para filtrar."
        actions={
          <button type="button" className="btn-app-accent" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Registrar vacuna
          </button>
        }
      />

      <VaccineStatusSummary counts={countByStatus(vaccines)} selected={status} onSelect={setStatus} />

      <Panel className="mt-5" bodyClassName="p-0">
        <div className="flex flex-col gap-2 border-b border-neutral-100 p-4 sm:flex-row">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por mascota, tutor o vacuna..."
            className="flex-1"
          />
          <SelectInput value={name} onChange={(e) => setName(e.target.value)} className="sm:w-60" aria-label="Vacuna">
            <option value="">Todas las vacunas</option>
            {names.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </SelectInput>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={Syringe} title="No hay vacunas que coincidan" />
        ) : (
          <VaccineTable vaccines={rows} pets={pets} />
        )}
      </Panel>

      <VaccineFormModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
