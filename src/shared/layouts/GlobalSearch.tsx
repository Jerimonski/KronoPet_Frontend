import { PawPrint, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useDb } from "../../core/mocks/mockDb";
import { matchesPet } from "../../features/pets/petService";
import { matchesTutor } from "../../features/tutors/tutorService";
import { SearchInput } from "../components/form";

/** Búsqueda rápida de mascotas y tutores desde cualquier vista. */
export default function GlobalSearch() {
  const { pets, tutors } = useDb();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const tutorName = (id: string) => tutors.find((t) => t.id === id)?.name ?? "";
  const hasQuery = query.trim().length > 1;
  const petResults = hasQuery
    ? pets.filter((p) => matchesPet(p, query, tutorName(p.tutorId))).slice(0, 5)
    : [];
  const tutorResults = hasQuery ? tutors.filter((t) => matchesTutor(t, query)).slice(0, 4) : [];

  const go = (path: string) => {
    setQuery("");
    setOpen(false);
    navigate(path);
  };

  return (
    <div
      className="relative w-full max-w-md"
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Buscar mascota, tutor, RUT o teléfono..."
      />
      {open && hasQuery && (
        <div className="absolute top-12 right-0 left-0 z-30 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-neutral-200">
          {petResults.length === 0 && tutorResults.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">Sin resultados</p>
          )}
          {petResults.length > 0 && (
            <ResultGroup label="Mascotas">
              {petResults.map((pet) => (
                <ResultItem
                  key={pet.id}
                  icon={<PawPrint className="h-4 w-4" />}
                  title={pet.name}
                  subtitle={`${pet.species} · ${pet.breed} · ${tutorName(pet.tutorId)}`}
                  onSelect={() => go(`/dashboard/mascotas/${pet.id}`)}
                />
              ))}
            </ResultGroup>
          )}
          {tutorResults.length > 0 && (
            <ResultGroup label="Tutores">
              {tutorResults.map((tutor) => (
                <ResultItem
                  key={tutor.id}
                  icon={<User className="h-4 w-4" />}
                  title={tutor.name}
                  subtitle={`${tutor.rut} · ${tutor.phone}`}
                  onSelect={() => go(`/dashboard/tutores/${tutor.id}`)}
                />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1.5">
      <p className="px-4 py-1 text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

interface ResultItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onSelect: () => void;
}

function ResultItem({ icon, title, subtitle, onSelect }: ResultItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-primary-50"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-neutral-800">{title}</span>
        <span className="block truncate text-xs text-neutral-500">{subtitle}</span>
      </span>
    </button>
  );
}
