// Modelos de dominio compartidos. Reflejan las entidades del backend
// (User/Tutor, Pet, MedicalEvent, Vaccine) para que el reemplazo de los
// datos simulados por la API real no requiera cambiar los componentes.

import type { MedicalReason } from "../constants/medicalReasons";

export type StaffRole = "veterinario" | "administrador";

export interface StaffUser {
  id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  role: StaffRole;
  specialty: string;
  /** Un usuario deshabilitado no puede iniciar sesión ni registrar atenciones; su historial se conserva. */
  active: boolean;
  createdAt: string;
  deactivatedAt: string | null;
}

export interface Tutor {
  id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export type Species = "Perro" | "Gato" | "Ave" | "Conejo" | "Otro";
export type PetSex = "Macho" | "Hembra";
export type ReproductiveStatus = "Entero" | "Esterilizado";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  sex: PetSex;
  birthDate: string;
  reproductiveStatus: ReproductiveStatus;
  tutorId: string;
  createdAt: string;
  /** Alertas clínicas visibles en la cabecera de la ficha (alergias, condiciones, conducta). */
  alerts: PetAlert[];
}

export type PetAlertType = "alergia" | "condicion" | "comportamiento" | "otra";

export interface PetAlert {
  id: string;
  type: PetAlertType;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface MedicalEvent {
  id: string;
  petId: string;
  date: string;
  title: string;
  reason: MedicalReason;
  observations: string;
  diagnosis: string;
  recommendations: string;
  weightKg: number;
  vetId: string;
  createdAt: string;
  /** Fecha sugerida de próximo control; genera un recordatorio al tutor. */
  followUpDate: string | null;
}

export type AttachmentCategory = "laboratorio" | "imagen" | "documento";

/** Archivo adjunto a una ficha clínica. Solo se agregan; nunca se editan ni borran. */
export interface Attachment {
  id: string;
  eventId: string;
  petId: string;
  name: string;
  mimeType: string;
  size: number;
  category: AttachmentCategory;
  uploadedAt: string;
  uploadedBy: string;
}

export type AuditAction =
  | "crear"
  | "editar"
  | "eliminar"
  | "deshabilitar"
  | "habilitar"
  | "adjuntar"
  | "enviar";

export type AuditEntity =
  | "tutor"
  | "mascota"
  | "ficha"
  | "vacuna"
  | "equipo"
  | "alerta"
  | "adjunto"
  | "recordatorio";

export interface AuditChange {
  field: string;
  from: string;
  to: string;
}

/** Registro de auditoría: quién hizo qué y cuándo. Lo escribe el backend, nunca el cliente. */
export interface AuditEntry {
  id: string;
  /** Fecha y hora ISO completa. */
  at: string;
  actorId: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  /** Texto legible del registro afectado (ej. "Luna (Perro)"). */
  entityLabel: string;
  changes?: AuditChange[];
}

export type ReminderKind = "vacuna_vencida" | "vacuna_por_vencer" | "vacuna_pendiente" | "control";

export interface ReminderLog {
  id: string;
  /** kind:refId:dueDate — evita enviar dos veces el mismo aviso. */
  key: string;
  kind: ReminderKind;
  tutorId: string;
  petId: string;
  /** Id de la vacuna o de la ficha que originó el aviso. */
  refId: string;
  dueDate: string;
  to: string;
  sentAt: string;
  sentBy: string | null;
  status: "enviado" | "error";
  error?: string;
}

export interface ReminderSettings {
  /** Días de anticipación para avisar vacunas por vencer y controles. */
  daysBefore: number;
  /** Envío automático diario de los avisos pendientes. */
  autoSend: boolean;
  /** Último día (YYYY-MM-DD) en que corrió el envío automático. */
  lastAutoRun: string | null;
}

/** Estado persistido de la vacuna. */
export type VaccineRecordStatus = "aplicada" | "pendiente";

/** Estado calculado que se muestra en la interfaz. */
export type VaccineStatus = "aplicada" | "pendiente" | "proxima" | "vencida";

export interface Vaccine {
  id: string;
  petId: string;
  name: string;
  status: VaccineRecordStatus;
  appliedAt: string | null;
  expiresAt: string;
  description: string;
}
