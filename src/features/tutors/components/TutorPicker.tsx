import { Check, Mail, Phone, SearchX, UserPlus } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { cleanRut, formatRut } from "../../../core/utils/rut";
import { cn } from "../../../lib/utils";
import { Avatar } from "../../../shared/components/Avatar";
import { SearchInput } from "../../../shared/components/form";
import { usePets } from "../../pets/petService";
import { matchesTutor, useTutors } from "../tutorService";

const MAX_RESULTS = 50;

interface TutorPickerProps {
  value: string;
  onChange: (tutorId: string) => void;
  error?: string;
  /** Bloquea el cambio de tutor (ej. ficha creada desde una mascota). */
  disabled?: boolean;
  /** Alto máximo de la lista de resultados. */
  listClassName?: string;
  /** Si se indica, ofrece registrar un tutor nuevo; recibe lo que se estaba buscando. */
  onCreate?: (query: string) => void;
}

/** Buscador de tutores por RUT, nombre, correo o teléfono. */
export default function TutorPicker({ value, onChange, error, disabled, listClassName, onCreate }: TutorPickerProps) {
  const tutors = useTutors();
  const pets = usePets();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [searching, setSearching] = useState(!value);

  const selected = tutors.find((t) => t.id === value);
  const petCount = (tutorId: string) => pets.filter((p) => p.tutorId === tutorId).length;

  // Coincidencias por inicio de RUT primero; luego orden alfabético.
  const q = cleanRut(query);
  const rutFirst = (rut: string) => (q && cleanRut(rut).startsWith(q) ? 0 : 1);
  const matches = tutors
    .filter((t) => matchesTutor(t, query))
    .sort((a, b) => rutFirst(a.rut) - rutFirst(b.rut) || a.name.localeCompare(b.name));
  const results = matches.slice(0, MAX_RESULTS);

  const select = (tutorId: string) => {
    onChange(tutorId);
    setSearching(false);
    setQuery("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => Math.min(Math.max(i + delta, 0), results.length - 1));
    } else if (e.key === "Enter") {
      // Evita enviar el formulario: Enter elige el resultado resaltado.
      e.preventDefault();
      if (results[active]) select(results[active].id);
    }
  };

  if (selected && !searching) {
    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-primary-50/50 px-4 py-3",
            error ? "border-danger" : "border-primary-200",
          )}
        >
          <Avatar name={selected.name} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">{selected.name}</p>
            <p className="text-xs text-neutral-600 tabular-nums">RUT {formatRut(selected.rut)}</p>
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {selected.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {selected.phone}
              </span>
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-primary-700 hover:text-primary-900"
              onClick={() => setSearching(true)}
            >
              Cambiar
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setActive(0);
        }}
        placeholder="Buscar por RUT, nombre o correo..."
        autoFocus
      />
      <p className="mt-1.5 text-xs text-neutral-500">
        {query.trim()
          ? `${matches.length} ${matches.length === 1 ? "resultado" : "resultados"}`
          : `${tutors.length} tutores registrados`}
        {matches.length > MAX_RESULTS && ` · mostrando ${MAX_RESULTS}, refina la búsqueda`}
        {selected && (
          <>
            {" · "}
            <button
              type="button"
              className="font-medium text-primary-700 hover:text-primary-900"
              onClick={() => setSearching(false)}
            >
              Mantener a {selected.name}
            </button>
          </>
        )}
      </p>

      <ul
        role="listbox"
        aria-label="Tutores"
        className={cn(
          "mt-2 max-h-64 overflow-y-auto rounded-xl border divide-y divide-neutral-100",
          error ? "border-danger" : "border-neutral-200",
          listClassName,
        )}
      >
        {results.map((t, i) => (
          <li key={t.id} role="option" aria-selected={t.id === value}>
            <button
              type="button"
              onClick={() => select(t.id)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                i === active ? "bg-primary-50" : "hover:bg-neutral-50",
              )}
            >
              <Avatar name={t.name} className="h-8 w-8 text-[11px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-neutral-900">{t.name}</span>
                <span className="block truncate text-xs text-neutral-500">
                  <span className="tabular-nums">{formatRut(t.rut)}</span> · {t.email}
                </span>
              </span>
              <span className="shrink-0 text-xs text-neutral-400">
                {petCount(t.id)} {petCount(t.id) === 1 ? "mascota" : "mascotas"}
              </span>
              {t.id === value && <Check className="h-4 w-4 shrink-0 text-primary-600" />}
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="flex flex-col items-center gap-1 px-4 py-8 text-center text-sm text-neutral-500">
            <SearchX className="h-5 w-5 text-neutral-400" />
            No hay tutores que coincidan con «{query.trim()}».
            {onCreate && (
              <button type="button" className="btn-app mt-3 h-9" onClick={() => onCreate(query.trim())}>
                <UserPlus className="h-4 w-4" /> Registrar nuevo tutor
              </button>
            )}
          </li>
        )}
      </ul>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {onCreate && results.length > 0 && (
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-900"
          onClick={() => onCreate(query.trim())}
        >
          <UserPlus className="h-4 w-4" /> ¿No está en la lista? Registrar nuevo tutor
        </button>
      )}
    </div>
  );
}
