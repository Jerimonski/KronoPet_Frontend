// Endpoints del backend implementados sobre la base simulada.
// Al conectar la API real, solo este archivo y client.ts deben cambiar.
// Toda escritura queda en la auditoría, igual que lo hará el backend.

import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES } from "../constants/attachments";
import { PET_ALERT_LABELS } from "../constants/alerts";
import { STAFF_ROLE_LABELS } from "../constants/staff";
import { buildReminderEmail } from "../mail/reminderEmail";
import { putFile } from "../mocks/fileStore";
import { getDb, updateDb } from "../mocks/mockDb";
import { MOCK_STAFF_PASSWORD } from "../mocks/seed";
import type {
  Attachment,
  AttachmentCategory,
  AuditAction,
  AuditChange,
  AuditEntity,
  MedicalEvent,
  Pet,
  PetAlert,
  ReminderKind,
  ReminderLog,
  ReminderSettings,
  StaffUser,
  Tutor,
  Vaccine,
} from "../types/models";
import { formatDate, nowStamp, todayISO } from "../utils/dates";
import { cleanRut, formatRut } from "../utils/rut";
import { ApiError, currentUserId, mockRequest } from "./client";

export type TutorInput = Omit<Tutor, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};
export type StaffInput = Pick<StaffUser, "name" | "rut" | "email" | "phone" | "role" | "specialty"> & {
  password?: string;
};
export type PetInput = Omit<Pet, "id" | "createdAt" | "alerts">;
export type PetAlertInput = Pick<PetAlert, "type" | "description">;
export type MedicalEventInput = Omit<MedicalEvent, "id" | "createdAt">;
export type VaccineInput = Omit<Vaccine, "id">;

/** Aviso a enviar; el backend arma el correo con los datos del registro. */
export interface ReminderRequest {
  kind: ReminderKind;
  petId: string;
  refId: string;
  dueDate: string;
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function base64Url(value: object) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))))
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// ---------------------------------------------------------------------------
// Auditoría

function audit(
  action: AuditAction,
  entity: AuditEntity,
  entityId: string,
  entityLabel: string,
  changes?: AuditChange[],
) {
  if (action === "editar" && changes?.length === 0) return;
  const entry = { id: newId("audit"), at: nowStamp(), actorId: currentUserId(), action, entity, entityId, entityLabel, changes };
  updateDb((db) => ({ ...db, audit: [entry, ...db.audit] }));
}

type Formatters<T> = { [K in keyof T]?: (value: T[K]) => string };

/** Cambios campo a campo entre dos versiones de un registro, con etiquetas legibles. */
function diff<T extends object>(
  before: T,
  after: T,
  labels: Partial<Record<keyof T, string>>,
  formatters: Formatters<T> = {},
): AuditChange[] {
  const show = <K extends keyof T>(key: K, value: T[K]) =>
    value == null || value === "" ? "—" : (formatters[key]?.(value) ?? String(value));
  return (Object.keys(labels) as (keyof T)[])
    .filter((key) => String(before[key] ?? "") !== String(after[key] ?? ""))
    .map((key) => ({ field: labels[key]!, from: show(key, before[key]), to: show(key, after[key]) }));
}

const TUTOR_FIELDS: Partial<Record<keyof Tutor, string>> = {
  name: "Nombre",
  rut: "RUT",
  email: "Correo",
  phone: "Teléfono",
  address: "Dirección",
};
const PET_FIELDS: Partial<Record<keyof Pet, string>> = {
  name: "Nombre",
  species: "Especie",
  breed: "Raza",
  sex: "Sexo",
  birthDate: "Fecha de nacimiento",
  reproductiveStatus: "Estado reproductivo",
  tutorId: "Tutor",
};
const VACCINE_FIELDS: Partial<Record<keyof Vaccine, string>> = {
  name: "Vacuna",
  status: "Estado",
  appliedAt: "Fecha de aplicación",
  expiresAt: "Vencimiento",
  description: "Descripción",
};
const STAFF_FIELDS: Partial<Record<keyof StaffUser, string>> = {
  name: "Nombre",
  rut: "RUT",
  email: "Correo",
  phone: "Teléfono",
  role: "Rol",
  specialty: "Especialidad",
};

const tutorName = (id: string) => getDb().tutors.find((t) => t.id === id)?.name ?? id;
const petLabel = (pet: Pet) => `${pet.name} (${pet.species})`;
const vaccineLabel = (v: Vaccine) => `${v.name} · ${getDb().pets.find((p) => p.id === v.petId)?.name ?? "—"}`;
const eventLabel = (e: MedicalEvent) => `${e.title} · ${getDb().pets.find((p) => p.id === e.petId)?.name ?? "—"}`;

// ---------------------------------------------------------------------------
// Reglas de negocio

function assertTutorExists(tutorId: string) {
  if (!getDb().tutors.some((t) => t.id === tutorId)) {
    throw new ApiError(400, "La mascota debe estar asociada a un tutor válido.");
  }
}

function findPet(petId: string): Pet {
  const pet = getDb().pets.find((p) => p.id === petId);
  if (!pet) throw new ApiError(404, "La mascota no existe.");
  return pet;
}

function assertUniqueTutor(input: TutorInput, ignoreId?: string) {
  const others = getDb().tutors.filter((t) => t.id !== ignoreId);
  if (others.some((t) => t.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ApiError(409, "Ya existe un tutor con ese correo electrónico.");
  }
  if (others.some((t) => cleanRut(t.rut) === cleanRut(input.rut))) {
    throw new ApiError(409, "Ya existe un tutor con ese RUT.");
  }
}

function assertUniqueStaff(input: StaffInput, ignoreId?: string) {
  const others = getDb().staff.filter((s) => s.id !== ignoreId);
  if (others.some((s) => s.email.toLowerCase() === input.email.toLowerCase())) {
    throw new ApiError(409, "Ya existe un usuario del equipo con ese correo electrónico.");
  }
  if (others.some((s) => cleanRut(s.rut) === cleanRut(input.rut))) {
    throw new ApiError(409, "Ya existe un usuario del equipo con ese RUT.");
  }
}

/** Siempre debe quedar al menos un administrador activo que pueda gestionar al equipo. */
function assertKeepsAnAdmin(next: StaffUser[]) {
  if (!next.some((s) => s.active && s.role === "administrador")) {
    throw new ApiError(409, "Debe quedar al menos un administrador activo.");
  }
}

function replaceStaff(id: string, change: (current: StaffUser) => StaffUser): { before: StaffUser; after: StaffUser } {
  const before = getDb().staff.find((s) => s.id === id);
  if (!before) throw new ApiError(404, "El usuario no existe.");
  const after = change(before);
  const next = getDb().staff.map((s) => (s.id === id ? after : s));
  assertKeepsAnAdmin(next);
  updateDb((db) => ({ ...db, staff: next }));
  return { before, after };
}

// ---------------------------------------------------------------------------
// Envío de correo. En desarrollo lo atiende el plugin de Vite (dev/mailDevServer.ts)
// con Resend; en producción será un endpoint del backend.

async function sendMail(to: string, subject: string, html: string, text: string) {
  let response: Response;
  try {
    response = await fetch("/api/mail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html, text }),
    });
  } catch {
    throw new Error("No se pudo contactar al servicio de correo.");
  }
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? `El servicio de correo respondió ${response.status}.`);
}

export const api = {
  auth: {
    // POST /auth/login
    login: (email: string, password: string) =>
      mockRequest(
        () => {
          const user = getDb().staff.find(
            (s) => s.email.toLowerCase() === email.trim().toLowerCase(),
          );
          if (!user || password !== MOCK_STAFF_PASSWORD) {
            throw new ApiError(401, "Correo o contraseña incorrectos.");
          }
          if (!user.active) {
            throw new ApiError(403, "Tu cuenta está deshabilitada. Contacta al administrador de la clínica.");
          }
          const now = Math.floor(Date.now() / 1000);
          const payload = { sub: user.id, user, iat: now, exp: now + 8 * 3600 };
          const token = `${base64Url({ alg: "HS256", typ: "JWT" })}.${base64Url(payload)}.mock-signature`;
          return { accessToken: token, user: user satisfies StaffUser };
        },
        { auth: false, delay: 700 },
      ),
  },

  users: {
    // POST /users — la contraseña la hashea el backend; aquí no se guarda.
    create: (input: TutorInput) =>
      mockRequest(() => {
        assertUniqueTutor(input);
        const now = todayISO();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...data } = input;
        const tutor: Tutor = {
          ...data,
          rut: formatRut(data.rut),
          id: newId("tutor"),
          createdAt: now,
          updatedAt: now,
        };
        updateDb((db) => ({ ...db, tutors: [tutor, ...db.tutors] }));
        audit("crear", "tutor", tutor.id, tutor.name);
        return tutor;
      }),
    // PATCH /users/:id
    update: (id: string, input: TutorInput) =>
      mockRequest(() => {
        assertUniqueTutor(input, id);
        const before = getDb().tutors.find((t) => t.id === id);
        if (!before) throw new ApiError(404, "El tutor no existe.");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...data } = input;
        const updated: Tutor = { ...before, ...data, rut: formatRut(data.rut), updatedAt: todayISO() };
        updateDb((db) => ({ ...db, tutors: db.tutors.map((t) => (t.id === id ? updated : t)) }));
        audit("editar", "tutor", id, updated.name, diff(before, updated, TUTOR_FIELDS));
        return updated;
      }),
  },

  staff: {
    // POST /staff — solo administradores. La contraseña la hashea el backend.
    create: (input: StaffInput) =>
      mockRequest(() => {
        assertUniqueStaff(input);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...data } = input;
        const member: StaffUser = {
          ...data,
          rut: formatRut(data.rut),
          id: newId("vet"),
          active: true,
          createdAt: todayISO(),
          deactivatedAt: null,
        };
        updateDb((db) => ({ ...db, staff: [...db.staff, member] }));
        audit("crear", "equipo", member.id, member.name);
        return member;
      }),
    // PATCH /staff/:id
    update: (id: string, input: StaffInput) =>
      mockRequest(() => {
        assertUniqueStaff(input, id);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...data } = input;
        const { before, after } = replaceStaff(id, (s) => ({ ...s, ...data, rut: formatRut(data.rut) }));
        audit("editar", "equipo", id, after.name, diff(before, after, STAFF_FIELDS, { role: (r) => STAFF_ROLE_LABELS[r] }));
        return after;
      }),
    // PATCH /staff/:id/status — deshabilitar no borra: sus fichas siguen firmadas por él.
    setActive: (id: string, active: boolean) =>
      mockRequest(() => {
        const { after } = replaceStaff(id, (s) => ({ ...s, active, deactivatedAt: active ? null : todayISO() }));
        audit(active ? "habilitar" : "deshabilitar", "equipo", id, after.name);
        return after;
      }),
  },

  pets: {
    // POST /pets
    create: (input: PetInput) =>
      mockRequest(() => {
        assertTutorExists(input.tutorId);
        const pet: Pet = { ...input, id: newId("pet"), createdAt: todayISO(), alerts: [] };
        updateDb((db) => ({ ...db, pets: [pet, ...db.pets] }));
        audit("crear", "mascota", pet.id, petLabel(pet));
        return pet;
      }),
    // PATCH /pets/:id
    update: (id: string, input: PetInput) =>
      mockRequest(() => {
        assertTutorExists(input.tutorId);
        const before = findPet(id);
        const updated: Pet = { ...before, ...input };
        updateDb((db) => ({ ...db, pets: db.pets.map((p) => (p.id === id ? updated : p)) }));
        audit("editar", "mascota", id, petLabel(updated), diff(before, updated, PET_FIELDS, { tutorId: tutorName }));
        return updated;
      }),
    // DELETE /pets/:id — elimina en cascada su historial, vacunas y adjuntos.
    remove: (id: string) =>
      mockRequest(() => {
        const pet = findPet(id);
        updateDb((db) => ({
          ...db,
          pets: db.pets.filter((p) => p.id !== id),
          events: db.events.filter((e) => e.petId !== id),
          vaccines: db.vaccines.filter((v) => v.petId !== id),
          attachments: db.attachments.filter((a) => a.petId !== id),
        }));
        audit("eliminar", "mascota", id, petLabel(pet));
      }),
    // POST /pets/:id/alerts
    addAlert: (petId: string, input: PetAlertInput) =>
      mockRequest(() => {
        const pet = findPet(petId);
        const alert: PetAlert = {
          ...input,
          description: input.description.trim(),
          id: newId("alert"),
          createdAt: todayISO(),
          createdBy: currentUserId() ?? "",
        };
        updateDb((db) => ({
          ...db,
          pets: db.pets.map((p) => (p.id === petId ? { ...p, alerts: [...p.alerts, alert] } : p)),
        }));
        audit("crear", "alerta", alert.id, `${PET_ALERT_LABELS[alert.type]}: ${alert.description} · ${pet.name}`);
        return alert;
      }),
    // DELETE /pets/:id/alerts/:alertId
    removeAlert: (petId: string, alertId: string) =>
      mockRequest(() => {
        const pet = findPet(petId);
        const alert = pet.alerts.find((a) => a.id === alertId);
        if (!alert) throw new ApiError(404, "La alerta no existe.");
        updateDb((db) => ({
          ...db,
          pets: db.pets.map((p) => (p.id === petId ? { ...p, alerts: p.alerts.filter((a) => a.id !== alertId) } : p)),
        }));
        audit("eliminar", "alerta", alertId, `${PET_ALERT_LABELS[alert.type]}: ${alert.description} · ${pet.name}`);
      }),
  },

  medicalEvents: {
    // POST /medical-events — las fichas son inmutables: no hay update/delete.
    create: (input: MedicalEventInput) =>
      mockRequest(() => {
        findPet(input.petId);
        const event: MedicalEvent = {
          ...input,
          id: newId("evt"),
          createdAt: new Date().toISOString(),
        };
        updateDb((db) => ({ ...db, events: [event, ...db.events] }));
        audit("crear", "ficha", event.id, eventLabel(event));
        return event;
      }),
  },

  attachments: {
    // POST /medical-events/:id/attachments (multipart). Solo se agregan: la ficha sigue siendo inmutable.
    upload: (eventId: string, file: File, category: AttachmentCategory) =>
      mockRequest(
        async () => {
          const event = getDb().events.find((e) => e.id === eventId);
          if (!event) throw new ApiError(404, "La ficha clínica no existe.");
          if (!ATTACHMENT_ACCEPT[file.type]) {
            throw new ApiError(415, `«${file.name}» no es un PDF ni una imagen JPG, PNG o WEBP.`);
          }
          if (file.size > ATTACHMENT_MAX_BYTES) {
            throw new ApiError(413, `«${file.name}» supera el máximo de 10 MB.`);
          }
          const attachment: Attachment = {
            id: newId("file"),
            eventId,
            petId: event.petId,
            name: file.name,
            mimeType: file.type,
            size: file.size,
            category,
            uploadedAt: nowStamp(),
            uploadedBy: currentUserId() ?? "",
          };
          try {
            await putFile(attachment.id, file);
          } catch {
            throw new ApiError(507, "No hay espacio para guardar el archivo en este navegador.");
          }
          updateDb((db) => ({ ...db, attachments: [...db.attachments, attachment] }));
          audit("adjuntar", "adjunto", attachment.id, `${file.name} → ${eventLabel(event)}`);
          return attachment;
        },
        { delay: 600 },
      ),
  },

  vaccines: {
    // POST /vaccines
    create: (input: VaccineInput) =>
      mockRequest(() => {
        findPet(input.petId);
        const vaccine: Vaccine = { ...input, id: newId("vac") };
        updateDb((db) => ({ ...db, vaccines: [vaccine, ...db.vaccines] }));
        audit("crear", "vacuna", vaccine.id, vaccineLabel(vaccine));
        return vaccine;
      }),
    // PATCH /vaccines/:id
    update: (id: string, input: VaccineInput) =>
      mockRequest(() => {
        findPet(input.petId);
        const before = getDb().vaccines.find((v) => v.id === id);
        if (!before) throw new ApiError(404, "La vacuna no existe.");
        const updated: Vaccine = { ...before, ...input };
        updateDb((db) => ({ ...db, vaccines: db.vaccines.map((v) => (v.id === id ? updated : v)) }));
        audit(
          "editar",
          "vacuna",
          id,
          vaccineLabel(updated),
          diff(before, updated, VACCINE_FIELDS, {
            appliedAt: (v) => (v ? formatDate(v) : "—"),
            expiresAt: formatDate,
          }),
        );
        return updated;
      }),
    // DELETE /vaccines/:id
    remove: (id: string) =>
      mockRequest(() => {
        const vaccine = getDb().vaccines.find((v) => v.id === id);
        if (!vaccine) throw new ApiError(404, "La vacuna no existe.");
        const label = vaccineLabel(vaccine);
        updateDb((db) => ({ ...db, vaccines: db.vaccines.filter((v) => v.id !== id) }));
        audit("eliminar", "vacuna", id, label);
      }),
  },

  reminders: {
    // POST /reminders/send — arma y envía un correo por aviso y registra el resultado.
    send: (requests: ReminderRequest[]) =>
      mockRequest(async () => {
        const logs: ReminderLog[] = [];
        for (const { kind, petId, refId, dueDate } of requests) {
          const db = getDb();
          const pet = findPet(petId);
          const tutor = db.tutors.find((t) => t.id === pet.tutorId);
          if (!tutor) throw new ApiError(400, `${pet.name} no tiene tutor asociado.`);
          const itemName =
            kind === "control"
              ? (db.events.find((e) => e.id === refId)?.title ?? "atención")
              : (db.vaccines.find((v) => v.id === refId)?.name ?? "vacuna");
          const email = buildReminderEmail({ kind, dueDate, tutorName: tutor.name, petName: pet.name, itemName });

          const log: ReminderLog = {
            id: newId("rem"),
            key: `${kind}:${refId}:${dueDate}`,
            kind,
            petId,
            refId,
            dueDate,
            tutorId: tutor.id,
            to: tutor.email,
            sentAt: nowStamp(),
            sentBy: currentUserId(),
            status: "enviado",
          };
          try {
            await sendMail(tutor.email, email.subject, email.html, email.text);
            audit("enviar", "recordatorio", log.id, `${email.subject} → ${tutor.email}`);
          } catch (err) {
            log.status = "error";
            log.error = err instanceof Error ? err.message : "Error desconocido.";
          }
          logs.push(log);
          updateDb((current) => ({ ...current, reminders: [log, ...current.reminders] }));
        }
        return logs;
      }),
    // PATCH /reminders/settings
    updateSettings: (settings: Partial<ReminderSettings>) =>
      mockRequest(
        () => {
          updateDb((db) => ({ ...db, reminderSettings: { ...db.reminderSettings, ...settings } }));
          return getDb().reminderSettings;
        },
        { delay: 150 },
      ),
  },
};
