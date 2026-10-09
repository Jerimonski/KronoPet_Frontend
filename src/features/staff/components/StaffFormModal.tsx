import { RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { STAFF_ROLE_LABELS, STAFF_ROLES } from "../../../core/constants/staff";
import { useNotification } from "../../../core/hooks/useNotification";
import { staffSchema, validate, type FieldErrors } from "../../../core/schemas";
import type { StaffUser } from "../../../core/types/models";
import { generatePassword } from "../../../core/utils/password";
import { formatRut } from "../../../core/utils/rut";
import { Field, SelectInput, TextInput } from "../../../shared/components/form";
import Modal from "../../../shared/components/Modal";
import { staffService } from "../staffService";

interface StaffFormModalProps {
  open: boolean;
  member?: StaffUser;
  /** El usuario no puede quitarse a sí mismo el rol de administrador. */
  isSelf?: boolean;
  onClose: () => void;
}

export default function StaffFormModal(props: StaffFormModalProps) {
  if (!props.open) return null;
  return <StaffForm key={props.member?.id ?? "new"} {...props} />;
}

function StaffForm({ member, isSelf, onClose }: StaffFormModalProps) {
  const notify = useNotification();
  const isEdit = !!member;
  const [values, setValues] = useState({
    name: member?.name ?? "",
    rut: member?.rut ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    role: member?.role ?? "veterinario",
    specialty: member?.specialty ?? "",
    password: isEdit ? "" : generatePassword(),
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validate(staffSchema, {
      ...values,
      password: isEdit ? undefined : values.password,
    });
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const saved = isEdit
        ? await staffService.update(member.id, result.data)
        : await staffService.create(result.data);
      notify.success(isEdit ? `Datos de ${saved.name} actualizados.` : `${saved.name} se agregó al equipo.`);
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo guardar al integrante del equipo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? `Editar a ${member.name}` : "Agregar al equipo"}
      description={
        isEdit
          ? "Actualiza los datos y el rol del profesional."
          : "Crea la cuenta con la que el profesional ingresará al panel clínico."
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-app-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="staff-form" className="btn-app" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cuenta"}
          </button>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" required error={errors.name} className="sm:col-span-2">
          <TextInput value={values.name} onChange={set("name")} placeholder="Ej. Dra. Fernanda Lagos" />
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
        <Field
          label="Correo electrónico"
          required
          error={errors.email}
          hint="Lo usará para iniciar sesión."
          className="sm:col-span-2"
        >
          <TextInput type="email" value={values.email} onChange={set("email")} placeholder="nombre@vety.cl" />
        </Field>
        <Field
          label="Rol"
          required
          error={errors.role}
          hint={isSelf ? "No puedes cambiar tu propio rol." : "Los administradores gestionan al equipo."}
        >
          <SelectInput value={values.role} onChange={set("role")} disabled={isSelf}>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {STAFF_ROLE_LABELS[r]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Especialidad" required error={errors.specialty}>
          <TextInput value={values.specialty} onChange={set("specialty")} placeholder="Ej. Dermatología" />
        </Field>
        {!isEdit && (
          <Field
            label="Contraseña inicial"
            required
            error={errors.password}
            hint="Entrégala al profesional; se almacena con hash en el servidor."
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
    </Modal>
  );
}
