import { useState, type FormEvent } from "react";
import { COMMON_VACCINES } from "../../../core/constants/vaccines";
import { useNotification } from "../../../core/hooks/useNotification";
import { validate, vaccineSchema, type FieldErrors } from "../../../core/schemas";
import type { Vaccine, VaccineRecordStatus } from "../../../core/types/models";
import { addMonths, todayISO } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { Field, SelectInput, TextArea, TextInput } from "../../../shared/components/form";
import Modal from "../../../shared/components/Modal";
import { usePets } from "../../pets/petService";
import { vaccineService } from "../vaccineService";

interface VaccineFormModalProps {
  open: boolean;
  vaccine?: Vaccine;
  defaultPetId?: string;
  onClose: () => void;
}

export default function VaccineFormModal(props: VaccineFormModalProps) {
  if (!props.open) return null;
  return <VaccineForm key={props.vaccine?.id ?? "new"} {...props} />;
}

function VaccineForm({ vaccine, defaultPetId, onClose }: VaccineFormModalProps) {
  const notify = useNotification();
  const pets = [...usePets()].sort((a, b) => a.name.localeCompare(b.name));
  const isEdit = !!vaccine;
  const today = todayISO();
  const [values, setValues] = useState({
    petId: vaccine?.petId ?? defaultPetId ?? "",
    name: vaccine?.name ?? "",
    status: (vaccine?.status ?? "aplicada") as VaccineRecordStatus,
    appliedAt: vaccine?.appliedAt ?? today,
    expiresAt: vaccine?.expiresAt ?? addMonths(today, 12),
    description: vaccine?.description ?? "",
  });
  // Mientras el usuario no toque el vencimiento, se calcula a 12 meses.
  const [expiresTouched, setExpiresTouched] = useState(isEdit);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (key: "petId" | "name" | "description") => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const setStatus = (status: VaccineRecordStatus) =>
    setValues((v) => ({
      ...v,
      status,
      expiresAt: expiresTouched ? v.expiresAt : status === "aplicada" ? addMonths(v.appliedAt || today, 12) : "",
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...values,
      appliedAt: values.status === "aplicada" ? values.appliedAt || null : null,
    };
    const result = validate(vaccineSchema, payload);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) await vaccineService.update(vaccine.id, result.data);
      else await vaccineService.create(result.data);
      notify.success(isEdit ? "Vacuna actualizada." : "Vacuna registrada.");
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo guardar la vacuna.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? "Editar vacuna" : "Registrar vacuna"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-app-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="vaccine-form" className="btn-app" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar vacuna"}
          </button>
        </>
      }
    >
      <form id="vaccine-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Mascota" required error={errors.petId} className="sm:col-span-2">
          <SelectInput value={values.petId} onChange={set("petId")} disabled={!!defaultPetId || isEdit}>
            <option value="">Seleccionar mascota...</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Vacuna" required error={errors.name} className="sm:col-span-2">
          <TextInput
            list="common-vaccines"
            value={values.name}
            onChange={set("name")}
            placeholder="Ej. Antirrábica"
          />
          <datalist id="common-vaccines">
            {COMMON_VACCINES.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </Field>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Estado</span>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1">
            {(["aplicada", "pendiente"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatus(status)}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium transition",
                  values.status === status
                    ? "bg-white text-primary-800 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                {status === "aplicada" ? "Aplicada" : "Pendiente de aplicar"}
              </button>
            ))}
          </div>
        </div>

        {values.status === "aplicada" && (
          <Field label="Fecha de aplicación" required error={errors.appliedAt}>
            <TextInput
              type="date"
              max={today}
              value={values.appliedAt}
              onChange={(e) => {
                const appliedAt = e.target.value;
                setValues((v) => ({
                  ...v,
                  appliedAt,
                  expiresAt: !expiresTouched && appliedAt ? addMonths(appliedAt, 12) : v.expiresAt,
                }));
              }}
            />
          </Field>
        )}
        <Field
          label={values.status === "aplicada" ? "Fecha de vencimiento" : "Aplicar antes del"}
          required
          error={errors.expiresAt}
          hint={values.status === "aplicada" && !expiresTouched ? "Calculada a 12 meses." : undefined}
          className={values.status === "pendiente" ? "sm:col-span-2" : undefined}
        >
          <TextInput
            type="date"
            value={values.expiresAt}
            onChange={(e) => {
              setExpiresTouched(true);
              setValues((v) => ({ ...v, expiresAt: e.target.value }));
            }}
          />
        </Field>
        <Field label="Descripción" className="sm:col-span-2">
          <TextArea
            value={values.description}
            onChange={set("description")}
            placeholder="Laboratorio, lote, enfermedades que cubre..."
          />
        </Field>
      </form>
    </Modal>
  );
}
