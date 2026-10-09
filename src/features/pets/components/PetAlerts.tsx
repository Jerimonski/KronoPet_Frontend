import { Plus, TriangleAlert, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PET_ALERT_LABELS, PET_ALERT_STYLES, PET_ALERT_TYPES } from "../../../core/constants/alerts";
import { useNotification } from "../../../core/hooks/useNotification";
import { petAlertSchema, validate, type FieldErrors } from "../../../core/schemas";
import type { Pet, PetAlert } from "../../../core/types/models";
import { cn } from "../../../lib/utils";
import { Badge } from "../../../shared/components/Badges";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { Field, SelectInput, TextInput } from "../../../shared/components/form";
import Modal from "../../../shared/components/Modal";
import { petService } from "../petService";

/** Chips de alertas clínicas; `onRemove` agrega el botón para quitarlas. */
export function PetAlertBadges({ alerts, onRemove }: { alerts: PetAlert[]; onRemove?: (alert: PetAlert) => void }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {alerts.map((alert) => (
        <li key={alert.id}>
          <Badge className={cn(PET_ALERT_STYLES[alert.type], "py-1")}>
            <span className="font-semibold">{PET_ALERT_LABELS[alert.type]}:</span> {alert.description}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(alert)}
                className="-mr-1 rounded-full p-0.5 opacity-60 transition hover:bg-black/5 hover:opacity-100"
                aria-label={`Quitar alerta ${alert.description}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/** Bloque de alertas de la cabecera de la mascota, con alta y baja. */
export function PetAlertsBar({ pet }: { pet: Pet }) {
  const notify = useNotification();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PetAlert | null>(null);

  const handleRemove = async () => {
    if (!removing) return;
    try {
      await petService.removeAlert(pet.id, removing.id);
      notify.success("Alerta clínica quitada.");
      setRemoving(null);
    } catch (err) {
      notify.error(err, "No se pudo quitar la alerta.");
    }
  };

  return (
    <>
      {pet.alerts.length > 0 ? (
        <div className="mt-5 flex flex-col gap-2 rounded-xl bg-danger-bg/60 p-3 ring-1 ring-danger/15 sm:flex-row sm:items-start">
          <p className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-danger sm:pt-1">
            <TriangleAlert className="h-4 w-4" /> Alertas clínicas
          </p>
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            <PetAlertBadges alerts={pet.alerts} onRemove={setRemoving} />
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-danger"
        >
          <TriangleAlert className="h-4 w-4" /> Agregar alerta clínica (alergia, condición, comportamiento)
        </button>
      )}

      <PetAlertFormModal open={adding} pet={pet} onClose={() => setAdding(false)} />
      <ConfirmDialog
        open={!!removing}
        title="Quitar alerta clínica"
        message={`Se quitará «${removing?.description ?? ""}» de la ficha de ${pet.name}. Quedará registrado en la auditoría.`}
        confirmLabel="Quitar alerta"
        busyLabel="Quitando..."
        onConfirm={handleRemove}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}

function PetAlertFormModal({ open, pet, onClose }: { open: boolean; pet: Pet; onClose: () => void }) {
  if (!open) return null;
  return <PetAlertForm pet={pet} onClose={onClose} />;
}

function PetAlertForm({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  const notify = useNotification();
  const [values, setValues] = useState({ type: "alergia", description: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validate(petAlertSchema, values);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setSaving(true);
    try {
      await petService.addAlert(pet.id, result.data);
      notify.success(`Alerta agregada a la ficha de ${pet.name}.`);
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo agregar la alerta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Nueva alerta clínica"
      description={`Se mostrará en la cabecera de la ficha de ${pet.name} y al registrar atenciones.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-app-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="alert-form" className="btn-app" disabled={saving}>
            {saving ? "Guardando..." : "Agregar alerta"}
          </button>
        </>
      }
    >
      <form id="alert-form" onSubmit={handleSubmit} noValidate className="grid gap-4">
        <Field label="Tipo" required error={errors.type}>
          <SelectInput value={values.type} onChange={(e) => setValues((v) => ({ ...v, type: e.target.value }))}>
            {PET_ALERT_TYPES.map((t) => (
              <option key={t} value={t}>
                {PET_ALERT_LABELS[t]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Descripción" required error={errors.description} hint="Breve y accionable. Ej. «Alergia a la penicilina»">
          <TextInput
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            maxLength={120}
            autoFocus
          />
        </Field>
      </form>
    </Modal>
  );
}
