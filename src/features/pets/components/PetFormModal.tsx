import { ArrowLeft, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PET_SEXES, REPRODUCTIVE_STATUSES, SPECIES } from "../../../core/constants/pets";
import { useNotification } from "../../../core/hooks/useNotification";
import { petSchema, validate, type FieldErrors } from "../../../core/schemas";
import type { Pet } from "../../../core/types/models";
import { todayISO } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { Field, SelectInput, TextInput } from "../../../shared/components/form";
import Modal from "../../../shared/components/Modal";
import { TutorForm } from "../../tutors/components/TutorFormModal";
import TutorPicker from "../../tutors/components/TutorPicker";
import { petService } from "../petService";

interface PetFormModalProps {
  open: boolean;
  pet?: Pet;
  /** Tutor preseleccionado (ej. al asociar una mascota desde la ficha del tutor). */
  defaultTutorId?: string;
  onClose: () => void;
  onSaved?: (pet: Pet) => void;
}

export default function PetFormModal(props: PetFormModalProps) {
  if (!props.open) return null;
  return <PetForm key={props.pet?.id ?? "new"} {...props} />;
}

function PetForm({ pet, defaultTutorId, onClose, onSaved }: PetFormModalProps) {
  const notify = useNotification();
  const isEdit = !!pet;
  const [step, setStep] = useState<1 | 2>(1);
  /** Fase 2 en modo "registrar tutor nuevo"; guarda lo que se buscó para precargarlo. */
  const [newTutor, setNewTutor] = useState<{ name?: string; rut?: string } | null>(null);
  const [savingTutor, setSavingTutor] = useState(false);
  const [values, setValues] = useState({
    name: pet?.name ?? "",
    species: pet?.species ?? "",
    breed: pet?.breed ?? "",
    sex: pet?.sex ?? "",
    birthDate: pet?.birthDate ?? "",
    reproductiveStatus: pet?.reproductiveStatus ?? "",
    tutorId: pet?.tutorId ?? defaultTutorId ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Fase 1: datos de la mascota. El tutor se elige en la fase 2.
    if (step === 1) {
      const result = validate(petDataSchema, values);
      setErrors(result.errors ?? {});
      if (!result.errors) setStep(2);
      return;
    }
    const result = validate(petSchema, values);
    if (result.errors) {
      setErrors(result.errors);
      if (Object.keys(result.errors).some((key) => key !== "tutorId")) setStep(1);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const saved = isEdit
        ? await petService.update(pet.id, result.data)
        : await petService.create(result.data);
      notify.success(isEdit ? `Datos de ${saved.name} actualizados.` : `${saved.name} fue registrada correctamente.`);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo guardar la mascota.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? `Editar a ${pet.name}` : "Registrar mascota"}
      description="Toda mascota debe estar asociada a un único tutor."
      onClose={onClose}
      footer={
        newTutor ? (
          <>
            <button type="button" className="btn-app-outline mr-auto" onClick={() => setNewTutor(null)}>
              <ArrowLeft className="h-4 w-4" /> Volver al buscador
            </button>
            <button type="submit" form="pet-new-tutor-form" className="btn-app" disabled={savingTutor}>
              {savingTutor ? "Guardando..." : "Registrar tutor y continuar"}
            </button>
          </>
        ) : step === 1 ? (
          <>
            <button type="button" className="btn-app-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" form="pet-form" className="btn-app">
              Siguiente: tutor
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn-app-outline mr-auto" onClick={() => setStep(1)}>
              Atrás
            </button>
            <button type="submit" form="pet-form" className="btn-app" disabled={saving}>
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar mascota"}
            </button>
          </>
        )
      }
    >
      <Steps current={step} />
      {newTutor ? (
        <div>
          <p className="mb-4 text-sm text-neutral-600">
            Registra al tutor de <span className="font-semibold text-neutral-900">{values.name}</span>. Quedará
            asignado a la mascota al guardarlo.
          </p>
          <TutorForm
            id="pet-new-tutor-form"
            initial={newTutor}
            onSavingChange={setSavingTutor}
            onSaved={(tutor) => {
              setValues((v) => ({ ...v, tutorId: tutor.id }));
              setErrors({});
              setNewTutor(null);
            }}
          />
        </div>
      ) : (
        <form id="pet-form" onSubmit={handleSubmit} noValidate>
          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" required error={errors.name}>
                <TextInput value={values.name} onChange={set("name")} placeholder="Ej. Luna" />
              </Field>
              <Field label="Especie" required error={errors.species}>
                <SelectInput value={values.species} onChange={set("species")}>
                  <option value="">Seleccionar...</option>
                  {SPECIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Raza" required error={errors.breed}>
                <TextInput value={values.breed} onChange={set("breed")} placeholder="Ej. Quiltro" />
              </Field>
              <Field label="Sexo" required error={errors.sex}>
                <SelectInput value={values.sex} onChange={set("sex")}>
                  <option value="">Seleccionar...</option>
                  {PET_SEXES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Fecha de nacimiento" required error={errors.birthDate}>
                <TextInput type="date" max={todayISO()} value={values.birthDate} onChange={set("birthDate")} />
              </Field>
              <Field label="Estado reproductivo" required error={errors.reproductiveStatus}>
                <SelectInput value={values.reproductiveStatus} onChange={set("reproductiveStatus")}>
                  <option value="">Seleccionar...</option>
                  {REPRODUCTIVE_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm text-neutral-600">
                Busca al tutor de <span className="font-semibold text-neutral-900">{values.name}</span> por su RUT,
                nombre o correo.
              </p>
              <TutorPicker
                value={values.tutorId}
                onChange={(tutorId) => setValues((v) => ({ ...v, tutorId }))}
                error={errors.tutorId}
                onCreate={(query) =>
                  // Lo buscado se precarga como RUT si tiene forma de RUT; si no, como nombre.
                  setNewTutor(/^[\d.\s-]+k?$/i.test(query) ? { rut: query } : { name: query })
                }
              />
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}

const petDataSchema = petSchema.omit({ tutorId: true });

const STEPS = ["Datos de la mascota", "Tutor asociado"];

function Steps({ current }: { current: 1 | 2 }) {
  return (
    <ol className="mb-5 flex items-center gap-2 text-xs font-medium">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                n === current && "bg-primary-700 text-white",
                done && "bg-primary-100 text-primary-800",
                n > current && "bg-neutral-100 text-neutral-500",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </span>
            <span className={n === current ? "text-neutral-900" : "text-neutral-500"}>{label}</span>
            {n < STEPS.length && <span className="h-px flex-1 bg-neutral-200" />}
          </li>
        );
      })}
    </ol>
  );
}
