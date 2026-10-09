// Esquemas Zod de los formularios. Reutilizan las mismas constantes que
// los selects para que UI y validación no puedan divergir.

import { z } from "zod";
import { PET_ALERT_TYPES } from "../constants/alerts";
import { MEDICAL_REASONS } from "../constants/medicalReasons";
import { PET_SEXES, REPRODUCTIVE_STATUSES, SPECIES } from "../constants/pets";
import { STAFF_ROLES } from "../constants/staff";
import { todayISO } from "../utils/dates";
import { isValidRut } from "../utils/rut";

const required = (label: string) => z.string().trim().min(1, `${label} es obligatorio.`);
const isoDate = (label: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} es obligatoria.`);
const notFuture = (value: string) => value <= todayISO();

export const tutorSchema = z.object({
  name: required("El nombre").min(3, "Ingresa nombre y apellido."),
  rut: z.string().refine(isValidRut, "RUT inválido."),
  email: z.email("Correo electrónico inválido."),
  phone: z
    .string()
    .regex(/^\+?[\d\s]{8,15}$/, "Teléfono inválido (ej. +56 9 1234 5678)."),
  address: required("La dirección"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").optional(),
});

export const staffSchema = z.object({
  name: required("El nombre").min(3, "Ingresa nombre y apellido."),
  rut: z.string().refine(isValidRut, "RUT inválido."),
  email: z.email("Correo electrónico inválido."),
  phone: z
    .string()
    .regex(/^\+?[\d\s]{8,15}$/, "Teléfono inválido (ej. +56 9 1234 5678)."),
  role: z.enum(STAFF_ROLES, "Selecciona un rol."),
  specialty: required("La especialidad"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").optional(),
});

export const petSchema = z.object({
  name: required("El nombre"),
  species: z.enum(SPECIES, "Selecciona una especie."),
  breed: required("La raza"),
  sex: z.enum(PET_SEXES, "Selecciona el sexo."),
  birthDate: isoDate("La fecha de nacimiento").refine(notFuture, "La fecha no puede ser futura."),
  reproductiveStatus: z.enum(REPRODUCTIVE_STATUSES, "Selecciona el estado reproductivo."),
  tutorId: required("El tutor"),
});

export const medicalEventSchema = z.object({
  petId: required("La mascota"),
  date: isoDate("La fecha").refine(notFuture, "La fecha no puede ser futura."),
  title: required("El título"),
  reason: z.enum(MEDICAL_REASONS, "Selecciona un motivo."),
  observations: required("Las observaciones"),
  diagnosis: required("El diagnóstico"),
  recommendations: z.string().trim(),
  weightKg: z.number("Ingresa el peso.").positive("El peso debe ser mayor a 0.").max(200, "Peso fuera de rango."),
  vetId: required("El veterinario responsable"),
  followUpDate: isoDate("La fecha de control").nullable(),
}).refine((e) => !e.followUpDate || e.followUpDate > e.date, {
  path: ["followUpDate"],
  message: "El control debe ser posterior a la fecha de atención.",
});

export const petAlertSchema = z.object({
  type: z.enum(PET_ALERT_TYPES, "Selecciona el tipo de alerta."),
  description: required("La descripción").max(120, "Máximo 120 caracteres."),
});

export const vaccineSchema = z
  .object({
    petId: required("La mascota"),
    name: required("El nombre de la vacuna"),
    status: z.enum(["aplicada", "pendiente"]),
    appliedAt: z.string().nullable(),
    expiresAt: isoDate("La fecha de vencimiento"),
    description: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "aplicada") {
      if (!value.appliedAt) {
        ctx.addIssue({ code: "custom", path: ["appliedAt"], message: "Indica la fecha de aplicación." });
      } else if (!notFuture(value.appliedAt)) {
        ctx.addIssue({ code: "custom", path: ["appliedAt"], message: "La fecha no puede ser futura." });
      } else if (value.expiresAt <= value.appliedAt) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message: "Debe ser posterior a la fecha de aplicación.",
        });
      }
    }
  });

export type FieldErrors = Record<string, string>;

/** Valida y devuelve los datos o un mapa campo → primer mensaje de error. */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { data: T; errors: null } | { data: null; errors: FieldErrors } {
  const result = schema.safeParse(data);
  if (result.success) return { data: result.data, errors: null };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return { data: null, errors };
}
