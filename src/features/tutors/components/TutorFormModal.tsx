import { RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNotification } from "../../../core/hooks/useNotification";
import { tutorSchema, validate, type FieldErrors } from "../../../core/schemas";
import type { Tutor } from "../../../core/types/models";
import { generatePassword } from "../../../core/utils/password";
import { formatRut } from "../../../core/utils/rut";
import { Field, TextInput } from "../../../shared/components/form";
import Modal from "../../../shared/components/Modal";
import { tutorService } from "../tutorService";

interface TutorFormModalProps {
  open: boolean;
  tutor?: Tutor;
  onClose: () => void;
  onSaved?: (tutor: Tutor) => void;
}

export default function TutorFormModal(props: TutorFormModalProps) {
  // El key reinicia el formulario cada vez que se abre o cambia el tutor.
  if (!props.open) return null;
  return <TutorFormDialog key={props.tutor?.id ?? "new"} {...props} />;
}

function TutorFormDialog({ tutor, onClose, onSaved }: TutorFormModalProps) {
  const isEdit = !!tutor;
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open
      title={isEdit ? "Editar tutor" : "Registrar tutor"}
      description={
        isEdit
          ? "Actualiza los datos de contacto del tutor."
          : "La cuenta la crea la clínica; el tutor podrá consultar la información de sus mascotas."
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-app-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="tutor-form" className="btn-app" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar tutor"}
          </button>
        </>
      }
    >
      <TutorForm
        id="tutor-form"
        tutor={tutor}
        onSavingChange={setSaving}
        onSaved={(saved) => {
          onSaved?.(saved);
          onClose();
        }}
      />
    </Modal>
  );
}

interface TutorFormProps {
  /** id del <form>, para enlazar botones de envío externos (ej. el footer de un modal). */
  id: string;
  tutor?: Tutor;
  /** Valores iniciales al crear (ej. el RUT que se buscó sin resultados). */
  initial?: Partial<Pick<Tutor, "name" | "rut">>;
  onSaved: (tutor: Tutor) => void;
  onSavingChange?: (saving: boolean) => void;
}

/** Formulario de tutor sin contenedor; lo usan el modal y el registro de mascota. */
export function TutorForm({ id, tutor, initial, onSaved, onSavingChange }: TutorFormProps) {
  const notify = useNotification();
  const isEdit = !!tutor;
  const [values, setValues] = useState({
    name: tutor?.name ?? initial?.name ?? "",
    rut: tutor?.rut ?? initial?.rut ?? "",
    email: tutor?.email ?? "",
    phone: tutor?.phone ?? "",
    address: tutor?.address ?? "",
    password: isEdit ? "" : generatePassword(),
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validate(tutorSchema, {
      ...values,
      password: isEdit ? undefined : values.password,
    });
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSavingChange?.(true);
    try {
      const saved = isEdit
        ? await tutorService.update(tutor.id, result.data)
        : await tutorService.create(result.data);
      notify.success(isEdit ? "Datos del tutor actualizados." : `Tutor ${saved.name} registrado.`);
      onSaved(saved);
    } catch (err) {
      notify.error(err, "No se pudo guardar el tutor.");
    } finally {
      onSavingChange?.(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre completo" required error={errors.name} className="sm:col-span-2">
        <TextInput value={values.name} onChange={set("name")} placeholder="Ej. María José González" />
      </Field>
      <Field label="RUT" required error={errors.rut}>
        <TextInput
          value={values.rut}
          onChange={set("rut")}
          onBlur={() => setValues((v) => ({ ...v, rut: formatRut(v.rut) }))}
          placeholder="12.345.678-9"
        />
      </Field>
      <Field label="Teléfono" required error={errors.phone}>
        <TextInput value={values.phone} onChange={set("phone")} placeholder="+56 9 1234 5678" />
      </Field>
      <Field label="Correo electrónico" required error={errors.email} className="sm:col-span-2">
        <TextInput type="email" value={values.email} onChange={set("email")} placeholder="tutor@correo.cl" />
      </Field>
      <Field label="Dirección" required error={errors.address} className="sm:col-span-2">
        <TextInput value={values.address} onChange={set("address")} placeholder="Calle, número, comuna" />
      </Field>
      {!isEdit && (
        <Field
          label="Contraseña inicial"
          required
          error={errors.password}
          hint="Entrégala al tutor; se almacena con hash en el servidor."
          className="sm:col-span-2"
        >
          <div className="flex gap-2">
            <TextInput value={values.password} onChange={set("password")} className="font-mono" />
            <button
              type="button"
              className="btn-app-outline shrink-0 px-3"
              onClick={() => setValues((v) => ({ ...v, password: generatePassword() }))}
              title="Generar otra contraseña"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </Field>
      )}
    </form>
  );
}
