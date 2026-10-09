// Datos simulados mientras no existe backend. Se generan de forma
// determinista (PRNG con semilla) y relativos a la fecha actual, para que
// el dashboard siempre muestre actividad reciente.

import { MEDICAL_REASONS, type MedicalReason } from "../constants/medicalReasons";
import type {
  Attachment,
  AuditEntry,
  MedicalEvent,
  Pet,
  PetAlert,
  ReminderLog,
  ReminderSettings,
  Species,
  StaffUser,
  Tutor,
  Vaccine,
} from "../types/models";
import { addDays, addMonths, daysBetween, todayISO } from "../utils/dates";
import { computeDv, formatRut } from "../utils/rut";

export interface DbState {
  staff: StaffUser[];
  tutors: Tutor[];
  pets: Pet[];
  events: MedicalEvent[];
  vaccines: Vaccine[];
  attachments: Attachment[];
  audit: AuditEntry[];
  reminders: ReminderLog[];
  reminderSettings: ReminderSettings;
}

/** Contraseña de todas las cuentas del personal en modo simulado. */
export const MOCK_STAFF_PASSWORD = "vety1234";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const staffRut = (body: string) => formatRut(body + computeDv(body.replace(/\./g, "")));

const STAFF: StaffUser[] = [
  {
    id: "vet-1",
    name: "Dra. Camila Rojas",
    rut: staffRut("12.887.402"),
    email: "camila.rojas@vety.cl",
    phone: "+56 9 6123 4401",
    role: "administrador",
    specialty: "Medicina interna",
    active: true,
    createdAt: addDays(todayISO(), -1400),
    deactivatedAt: null,
  },
  {
    id: "vet-2",
    name: "Dr. Matías Fuentes",
    rut: staffRut("15.204.881"),
    email: "matias.fuentes@vety.cl",
    phone: "+56 9 7342 1180",
    role: "veterinario",
    specialty: "Cirugía general",
    active: true,
    createdAt: addDays(todayISO(), -1100),
    deactivatedAt: null,
  },
  {
    id: "vet-3",
    name: "Dra. Valentina Soto",
    rut: staffRut("17.553.920"),
    email: "valentina.soto@vety.cl",
    phone: "+56 9 8456 2093",
    role: "veterinario",
    specialty: "Medicina felina",
    active: true,
    createdAt: addDays(todayISO(), -700),
    deactivatedAt: null,
  },
  {
    id: "vet-4",
    name: "Dr. Benjamín Araya",
    rut: staffRut("18.902.117"),
    email: "benjamin.araya@vety.cl",
    phone: "+56 9 5521 7740",
    role: "veterinario",
    specialty: "Animales exóticos",
    active: true,
    createdAt: addDays(todayISO(), -420),
    deactivatedAt: null,
  },
];

const TUTOR_NAMES = [
  "María José González",
  "Felipe Muñoz",
  "Catalina Pérez",
  "Sebastián Díaz",
  "Javiera Morales",
  "Diego Contreras",
  "Antonia Silva",
  "Nicolás Martínez",
  "Fernanda Sepúlveda",
  "Tomás Castillo",
  "Isidora Torres",
  "Cristóbal Herrera",
  "Constanza Vargas",
  "Joaquín Espinoza",
  "Daniela Reyes",
  "Ignacio Campos",
];

const STREETS = [
  "Av. Providencia",
  "Los Leones",
  "Irarrázaval",
  "Av. Grecia",
  "Pedro de Valdivia",
  "Av. Matta",
  "Manuel Montt",
  "Av. Vicuña Mackenna",
];

const COMMUNES = ["Providencia", "Ñuñoa", "Santiago", "La Florida", "Macul", "Las Condes"];

interface PetTemplate {
  name: string;
  species: Species;
  breed: string;
  baseWeight: number;
}

const PET_TEMPLATES: PetTemplate[] = [
  { name: "Luna", species: "Perro", breed: "Labrador Retriever", baseWeight: 28 },
  { name: "Simón", species: "Gato", breed: "Europeo de pelo corto", baseWeight: 4.6 },
  { name: "Rocky", species: "Perro", breed: "Bulldog Francés", baseWeight: 12 },
  { name: "Mía", species: "Gato", breed: "Siamés", baseWeight: 3.8 },
  { name: "Toby", species: "Perro", breed: "Quiltro", baseWeight: 18 },
  { name: "Kiwi", species: "Ave", breed: "Cotorra argentina", baseWeight: 0.12 },
  { name: "Max", species: "Perro", breed: "Golden Retriever", baseWeight: 31 },
  { name: "Nala", species: "Gato", breed: "Persa", baseWeight: 4.1 },
  { name: "Bruno", species: "Perro", breed: "Pastor Alemán", baseWeight: 34 },
  { name: "Copito", species: "Conejo", breed: "Belier", baseWeight: 1.9 },
  { name: "Olivia", species: "Perro", breed: "Beagle", baseWeight: 11 },
  { name: "Garfield", species: "Gato", breed: "Maine Coon", baseWeight: 7.2 },
  { name: "Chispa", species: "Perro", breed: "Poodle Toy", baseWeight: 3.5 },
  { name: "Lola", species: "Perro", breed: "Schnauzer", baseWeight: 8.4 },
  { name: "Michi", species: "Gato", breed: "Bengalí", baseWeight: 5 },
  { name: "Pipo", species: "Ave", breed: "Canario", baseWeight: 0.03 },
  { name: "Thor", species: "Perro", breed: "Husky Siberiano", baseWeight: 24 },
  { name: "Canela", species: "Perro", breed: "Cocker Spaniel", baseWeight: 13 },
  { name: "Salem", species: "Gato", breed: "Bombay", baseWeight: 4.4 },
  { name: "Spike", species: "Otro", breed: "Erizo de tierra africano", baseWeight: 0.4 },
  { name: "Frida", species: "Perro", breed: "Dachshund", baseWeight: 7.5 },
  { name: "Milo", species: "Gato", breed: "Ragdoll", baseWeight: 6.1 },
  { name: "Coco", species: "Perro", breed: "Shih Tzu", baseWeight: 6.3 },
  { name: "Tambor", species: "Conejo", breed: "Holandés enano", baseWeight: 1.2 },
  { name: "Maya", species: "Perro", breed: "Border Collie", baseWeight: 17 },
  { name: "Oreo", species: "Gato", breed: "Europeo bicolor", baseWeight: 4.9 },
];

/** Alertas clínicas de ejemplo, por nombre de mascota. */
const PET_ALERTS: Record<string, Omit<PetAlert, "id" | "createdAt" | "createdBy">[]> = {
  Luna: [{ type: "alergia", description: "Alergia a la penicilina" }],
  Garfield: [{ type: "condicion", description: "Enfermedad renal crónica (IRIS 2)" }],
  Thor: [{ type: "comportamiento", description: "Agresivo al manejo: usar bozal" }],
  Michi: [
    { type: "alergia", description: "Hipersensibilidad alimentaria al pollo" },
    { type: "comportamiento", description: "Se estresa con perros en sala de espera" },
  ],
  Rocky: [{ type: "condicion", description: "Síndrome braquicefálico: riesgo anestésico" }],
};

interface EventTemplate {
  title: string;
  observations: string;
  diagnosis: string;
  recommendations: string;
}

const EVENT_TEMPLATES: Record<MedicalReason, EventTemplate[]> = {
  "Consulta General": [
    {
      title: "Consulta por vómitos",
      observations: "Tutor refiere 3 episodios de vómito en 24 h. Mucosas rosadas, hidratación normal.",
      diagnosis: "Gastritis aguda leve",
      recommendations: "Dieta blanda por 3 días, omeprazol 1 mg/kg c/24 h. Control si persiste.",
    },
    {
      title: "Consulta dermatológica",
      observations: "Prurito intenso en zona lumbar, eritema y alopecia focal.",
      diagnosis: "Dermatitis alérgica por pulgas",
      recommendations: "Antiparasitario externo mensual, shampoo medicado 2 veces por semana.",
    },
    {
      title: "Consulta por cojera",
      observations: "Claudicación de miembro posterior derecho grado II/IV.",
      diagnosis: "Esguince leve de tarso",
      recommendations: "Reposo relativo 10 días, meloxicam 0,1 mg/kg c/24 h por 5 días.",
    },
  ],
  "Control Sano y Rutina": [
    {
      title: "Control anual",
      observations: "Paciente activo, condición corporal 5/9. Auscultación sin hallazgos.",
      diagnosis: "Paciente sano",
      recommendations: "Mantener alimentación actual y plan de vacunación al día.",
    },
    {
      title: "Control de peso",
      observations: "Aumento de peso respecto al control anterior. Condición corporal 6/9.",
      diagnosis: "Sobrepeso leve",
      recommendations: "Reducir ración diaria un 10% y aumentar actividad física.",
    },
  ],
  "Urgencia / Emergencia": [
    {
      title: "Urgencia por ingesta de cuerpo extraño",
      observations: "Ingesta de juguete hace 2 h. Paciente estable, dolor abdominal leve.",
      diagnosis: "Cuerpo extraño gástrico",
      recommendations: "Se induce emesis con éxito. Observación 24 h en casa, dieta blanda.",
    },
    {
      title: "Urgencia por traumatismo",
      observations: "Caída desde altura. Laceración superficial en extremidad anterior.",
      diagnosis: "Herida cortante superficial",
      recommendations: "Curación diaria, collar isabelino y antibiótico por 7 días.",
    },
  ],
  "Procedimiento Quirúrgico": [
    {
      title: "Esterilización",
      observations: "Procedimiento sin complicaciones bajo anestesia inhalatoria.",
      diagnosis: "Ovariohisterectomía electiva",
      recommendations: "Collar isabelino 10 días, analgesia por 3 días, retiro de puntos en 10 días.",
    },
    {
      title: "Profilaxis dental",
      observations: "Sarro grado III, gingivitis moderada. Se extrae una pieza dental.",
      diagnosis: "Enfermedad periodontal grado II",
      recommendations: "Alimento blando por 5 días, cepillado dental 3 veces por semana.",
    },
  ],
  "Examen de Laboratorio": [
    {
      title: "Perfil bioquímico",
      observations: "Toma de muestra en ayuno de 12 h para chequeo preventivo.",
      diagnosis: "Valores dentro de rango de referencia",
      recommendations: "Repetir perfil en 12 meses.",
    },
    {
      title: "Hemograma y urianálisis",
      observations: "Poliuria y polidipsia referidas por el tutor.",
      diagnosis: "Infección urinaria baja",
      recommendations: "Antibiótico por 14 días y urocultivo de control.",
    },
  ],
  Desparasitación: [
    {
      title: "Desparasitación interna",
      observations: "Desparasitación de rutina. Paciente sin signos digestivos.",
      diagnosis: "Desparasitación preventiva",
      recommendations: "Repetir en 3 meses.",
    },
    {
      title: "Desparasitación interna y externa",
      observations: "Se observan pulgas en la revisión.",
      diagnosis: "Pulicosis",
      recommendations: "Antiparasitario externo mensual y limpieza del entorno.",
    },
  ],
};

const REASON_WEIGHTS: Record<MedicalReason, number> = {
  "Consulta General": 30,
  "Control Sano y Rutina": 24,
  "Urgencia / Emergencia": 8,
  "Procedimiento Quirúrgico": 9,
  "Examen de Laboratorio": 12,
  Desparasitación: 17,
};

const VACCINES_BY_SPECIES: Partial<Record<Species, string[]>> = {
  Perro: ["Antirrábica", "Óctuple (DHPPi+L)", "KC (Tos de las perreras)"],
  Gato: ["Antirrábica", "Triple Felina", "Leucemia Felina (FeLV)"],
  Conejo: ["Mixomatosis"],
};

const VACCINE_DESCRIPTIONS: Record<string, string> = {
  Antirrábica: "Protección contra el virus de la rabia. Refuerzo anual obligatorio.",
  "Óctuple (DHPPi+L)": "Distemper, hepatitis, parvovirus, parainfluenza y leptospirosis.",
  "KC (Tos de las perreras)": "Bordetella bronchiseptica y parainfluenza canina.",
  "Triple Felina": "Panleucopenia, rinotraqueítis y calicivirus felino.",
  "Leucemia Felina (FeLV)": "Protección contra el virus de la leucemia felina.",
  Mixomatosis: "Protección contra el virus de la mixomatosis en conejos.",
};

export function createSeed(): DbState {
  const rand = mulberry32(20251124);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
  const between = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const today = todayISO();

  const pickReason = (): MedicalReason => {
    const total = Object.values(REASON_WEIGHTS).reduce((a, b) => a + b, 0);
    let roll = rand() * total;
    for (const reason of MEDICAL_REASONS) {
      roll -= REASON_WEIGHTS[reason];
      if (roll <= 0) return reason;
    }
    return "Consulta General";
  };

  const tutors: Tutor[] = TUTOR_NAMES.map((name, i) => {
    const body = String(between(9_000_000, 21_000_000));
    const createdAt = addDays(today, i >= TUTOR_NAMES.length - 3 ? -between(2, 25) : -between(240, 900));
    const [first, last] = name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(" ");
    return {
      id: `tutor-${i + 1}`,
      name,
      rut: formatRut(body + computeDv(body)),
      email: `${first}.${last}@correo.cl`,
      phone: `+56 9 ${between(1000, 9999)} ${between(1000, 9999)}`,
      address: `${pick(STREETS)} ${between(100, 4500)}, ${pick(COMMUNES)}`,
      createdAt,
      updatedAt: addDays(createdAt, between(0, 15)),
    };
  });

  const pets: Pet[] = PET_TEMPLATES.map((tpl, i) => {
    const tutor = tutors[i < tutors.length ? i : between(0, tutors.length - 1)];
    return {
      id: `pet-${i + 1}`,
      name: tpl.name,
      species: tpl.species,
      breed: tpl.breed,
      sex: rand() > 0.5 ? "Macho" : "Hembra",
      birthDate: addDays(today, -between(150, 4200)),
      reproductiveStatus: rand() > 0.4 ? "Esterilizado" : "Entero",
      tutorId: tutor.id,
      createdAt: tutor.createdAt,
      alerts: (PET_ALERTS[tpl.name] ?? []).map((alert, n) => ({
        ...alert,
        id: `alert-${i + 1}-${n + 1}`,
        createdAt: tutor.createdAt,
        createdBy: "vet-1",
      })),
    };
  });

  const events: MedicalEvent[] = [];
  pets.forEach((pet, i) => {
    const tpl = PET_TEMPLATES[i];
    // Las mascotas recién registradas tienen menos historial.
    const historyDays = Math.min(360, daysBetween(pet.createdAt, today));
    const count = Math.min(between(3, 9), 1 + Math.floor(historyDays / 20));
    for (let n = 0; n < count; n++) {
      const reason = pickReason();
      const content = pick(EVENT_TEMPLATES[reason]);
      const date = addDays(today, -between(0, historyDays));
      const drift = 1 + (rand() - 0.5) * 0.12;
      events.push({
        id: `evt-${i + 1}-${n + 1}`,
        petId: pet.id,
        date,
        reason,
        ...content,
        weightKg: Math.round(tpl.baseWeight * drift * 100) / 100,
        vetId: reason === "Procedimiento Quirúrgico" ? "vet-2" : pick(STAFF).id,
        createdAt: date,
        // Algunas atenciones recientes dejan agendado un control (genera recordatorios).
        followUpDate: daysBetween(date, today) <= 30 && rand() < 0.45 ? addDays(date, between(10, 40)) : null,
      });
    }
  });

  const vaccines: Vaccine[] = [];
  pets.forEach((pet, i) => {
    const names = VACCINES_BY_SPECIES[pet.species] ?? [];
    names.forEach((name, n) => {
      const roll = rand();
      const id = `vac-${i + 1}-${n + 1}`;
      const description = VACCINE_DESCRIPTIONS[name] ?? "";
      if (roll < 0.15) {
        // Pendiente de aplicación, con fecha límite próxima.
        vaccines.push({
          id,
          petId: pet.id,
          name,
          status: "pendiente",
          appliedAt: null,
          expiresAt: addDays(today, between(3, 45)),
          description,
        });
        return;
      }
      // Aplicada: según la fecha de aplicación queda vigente,
      // próxima a vencer o vencida (refuerzo de 12 meses).
      let appliedAt: string;
      if (roll < 0.3) appliedAt = addDays(today, -between(370, 460));
      else if (roll < 0.5) appliedAt = addDays(today, -between(336, 360));
      else appliedAt = addDays(today, -between(10, 320));
      vaccines.push({
        id,
        petId: pet.id,
        name,
        status: "aplicada",
        appliedAt,
        expiresAt: addMonths(appliedAt, 12),
        description,
      });
    });
  });

  // Auditoría inicial: el alta de cada registro existente.
  const at = (date: string) => `${date}T${String(between(9, 19)).padStart(2, "0")}:${String(between(0, 59)).padStart(2, "0")}:00`;
  const audit: AuditEntry[] = [
    ...tutors.map((t) => ({ entity: "tutor" as const, entityId: t.id, entityLabel: t.name, date: t.createdAt, actorId: "vet-1" })),
    ...pets.map((p) => ({
      entity: "mascota" as const,
      entityId: p.id,
      entityLabel: `${p.name} (${p.species})`,
      date: p.createdAt,
      actorId: "vet-1",
    })),
    ...events.map((e) => ({
      entity: "ficha" as const,
      entityId: e.id,
      entityLabel: `${e.title} · ${pets.find((p) => p.id === e.petId)?.name}`,
      date: e.date,
      actorId: e.vetId,
    })),
  ]
    .map(({ date, ...entry }, n) => ({ ...entry, id: `audit-seed-${n + 1}`, at: at(date), action: "crear" as const }))
    .sort((a, b) => b.at.localeCompare(a.at));

  return {
    staff: STAFF,
    tutors,
    pets,
    events,
    vaccines,
    attachments: [],
    audit,
    reminders: [],
    reminderSettings: { daysBefore: 7, autoSend: false, lastAutoRun: null },
  };
}
