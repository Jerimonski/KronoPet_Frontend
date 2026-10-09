import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { MEDICAL_REASONS } from "../../../core/constants/medicalReasons";
import { useNotification } from "../../../core/hooks/useNotification";
import { useDb } from "../../../core/mocks/mockDb";
import { medicalEventSchema, validate, type FieldErrors } from "../../../core/schemas";
import { addDays, todayISO } from "../../../core/utils/dates";
import { Field, SelectInput, TextArea, TextInput } from "../../../shared/components/form";
import Modal from "../../../shared/components/Modal";
import { useAuth } from "../../auth/context/AuthContext";
import { useActiveStaff } from "../../staff/staffService";
import { PetAlertBadges } from "../../pets/components/PetAlerts";
import TutorPicker from "../../tutors/components/TutorPicker";
import { AttachmentPicker, type PendingFile } from "./Attachments";
import { medicalEventService, sortByDateDesc } from "../medicalEventService";

interface MedicalEventFormModalProps {
  open: boolean;
  defaultPetId?: string;
  onClose: () => void;
}

export default function MedicalEventFormModal(props: MedicalEventFormModalProps) {
  if (!props.open) return null;
  return <MedicalEventForm {...props} />;
}

function MedicalEventForm({ defaultPetId, onClose }: MedicalEventFormModalProps) {
  const notify = useNotification();
  const { user } = useAuth();
  const { pets, events } = useDb();
  // Solo el personal habilitado puede firmar nuevas fichas.
  const activeStaff = useActiveStaff();

  const lastWeight = (petId: string) =>
    sortByDateDesc(events.filter((e) => e.petId === petId))[0]?.weightKg;

  const [values, setValues] = useState({
    petId: defaultPetId ?? "",
    date: todayISO(),
    title: "",
    reason: "",
    observations: "",
    diagnosis: "",
    recommendations: "",
    weightKg: defaultPetId ? String(lastWeight(defaultPetId) ?? "") : "",
    vetId: user && activeStaff.some((s) => s.id === user.id) ? user.id : "",
    followUpDate: "",
  });
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [tutorId, setTutorId] = useState(pets.find((p) => p.id === defaultPetId)?.tutorId ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const selectedPet = pets.find((p) => p.id === values.petId);
  const tutorPets = pets
    .filter((p) => p.tutorId === tutorId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectPet = (petId: string) =>
    setValues((v) => ({
      ...v,
      petId,
      weightKg: v.weightKg || String(lastWeight(petId) ?? ""),
    }));

  // Al cambiar de tutor se descarta la mascota anterior; si tiene una sola, se elige sola.
  const selectTutor = (id: string) => {
    setTutorId(id);
    const own = pets.filter((p) => p.tutorId === id);
    if (own.length === 1) selectPet(own[0].id);
    else if (!own.some((p) => p.id === values.petId)) setValues((v) => ({ ...v, petId: "" }));
  };
  const previousWeight = values.petId ? lastWeight(values.petId) : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validate(medicalEventSchema, {
      ...values,
      weightKg: values.weightKg === "" ? undefined : Number(values.weightKg.replace(",", ".")),
      followUpDate: values.followUpDate || null,
    });
    if (result.errors || !tutorId) {
      setErrors({ ...result.errors, ...(!tutorId && { tutorId: "Selecciona el tutor." }) });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const event = await medicalEventService.create(result.data);
      // La ficha ya quedó guardada: un adjunto que falle se puede reintentar desde su detalle.
      const failed: string[] = [];
      for (const { file, category } of files) {
        try {
          await medicalEventService.uploadAttachment(event.id, file, category);
        } catch {
          failed.push(file.name);
        }
      }
      if (failed.length) {
        notify.error(null, `La ficha se guardó, pero no se adjuntó: ${failed.join(", ")}. Reinténtalo desde el detalle de la ficha.`);
      } else {
        notify.success(`Ficha clínica registrada para ${selectedPet?.name}.`);
      }
      onClose();
    } catch (err) {
      notify.error(err, "No se pudo guardar la ficha clínica.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title="Nueva ficha clínica"
      description="Registra la atención realizada a la mascota."
      onClose={onClose}
      footer={
        <>
          <p className="mr-auto hidden items-center gap-1.5 text-xs text-neutral-500 sm:flex">
            <Lock className="h-3.5 w-3.5" /> Las fichas no se pueden editar una vez guardadas.
          </p>
          <button type="button" className="btn-app-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="event-form" className="btn-app" disabled={saving}>
            {saving ? "Guardando..." : "Guardar ficha"}
          </button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Tutor<span className="text-accent-600"> *</span>
          </span>
          <TutorPicker
            value={tutorId}
            onChange={selectTutor}
            error={errors.tutorId}
            disabled={!!defaultPetId}
            listClassName="max-h-56"
          />
        </div>
        <Field
          label="Mascota"
          required
          error={errors.petId}
          hint={tutorId && tutorPets.length === 0 ? "Este tutor no tiene mascotas registradas." : undefined}
          className="sm:col-span-4"
        >
          <SelectInput
            value={values.petId}
            disabled={!!defaultPetId || !tutorId || tutorPets.length === 0}
            onChange={(e) => selectPet(e.target.value)}
          >
            <option value="">{tutorId ? "Seleccionar mascota..." : "Primero busca al tutor"}</option>
            {tutorPets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species} · {p.breed})
              </option>
            ))}
          </SelectInput>
        </Field>
        {selectedPet && selectedPet.alerts.length > 0 && (
          <div className="rounded-xl bg-danger-bg/60 p-3 ring-1 ring-danger/15 sm:col-span-6">
            <p className="mb-1.5 text-xs font-semibold text-danger">Alertas clínicas de {selectedPet.name}</p>
            <PetAlertBadges alerts={selectedPet.alerts} />
          </div>
        )}
        <Field label="Fecha" required error={errors.date} className="sm:col-span-2">
          <TextInput type="date" max={todayISO()} value={values.date} onChange={set("date")} />
        </Field>
        <Field label="Título de la atención" required error={errors.title} className="sm:col-span-4">
          <TextInput value={values.title} onChange={set("title")} placeholder="Ej. Control anual" />
        </Field>
        <Field
          label="Peso (kg)"
          required
          error={errors.weightKg}
          hint={previousWeight ? `Último registro: ${previousWeight} kg` : undefined}
          className="sm:col-span-2"
        >
          <TextInput
            inputMode="decimal"
            value={values.weightKg}
            onChange={set("weightKg")}
            placeholder="0,0"
          />
        </Field>
        <Field label="Motivo de consulta" required error={errors.reason} className="sm:col-span-3">
          <SelectInput value={values.reason} onChange={set("reason")}>
            <option value="">Seleccionar motivo...</option>
            {MEDICAL_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Veterinario responsable" required error={errors.vetId} className="sm:col-span-3">
          <SelectInput value={values.vetId} onChange={set("vetId")}>
            <option value="">Seleccionar...</option>
            {activeStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Observaciones" required error={errors.observations} className="sm:col-span-6">
          <TextArea
            value={values.observations}
            onChange={set("observations")}
            placeholder="Anamnesis, examen físico, hallazgos..."
          />
        </Field>
        <Field label="Diagnóstico" required error={errors.diagnosis} className="sm:col-span-6">
          <TextInput value={values.diagnosis} onChange={set("diagnosis")} />
        </Field>
        <Field label="Recomendaciones" error={errors.recommendations} className="sm:col-span-6">
          <TextArea
            value={values.recommendations}
            onChange={set("recommendations")}
            placeholder="Tratamiento, indicaciones y próximos controles..."
          />
        </Field>
        <Field
          label="Próximo control"
          error={errors.followUpDate}
          hint="Opcional. Se enviará un recordatorio al tutor antes de la fecha."
          className="sm:col-span-3"
        >
          <TextInput
            type="date"
            min={addDays(values.date || todayISO(), 1)}
            value={values.followUpDate}
            onChange={set("followUpDate")}
          />
        </Field>
        <div className="flex flex-wrap items-end gap-1.5 pb-6 sm:col-span-3">
          {[7, 15, 30].map((days) => (
            <button
              key={days}
              type="button"
              className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-800"
              onClick={() => setValues((v) => ({ ...v, followUpDate: addDays(v.date || todayISO(), days) }))}
            >
              +{days} días
            </button>
          ))}
        </div>
        <div className="sm:col-span-6">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Adjuntos</span>
          <AttachmentPicker
            files={files}
            onChange={setFiles}
            isLabExam={values.reason === "Examen de Laboratorio"}
          />
        </div>
      </form>
    </Modal>
  );
}
