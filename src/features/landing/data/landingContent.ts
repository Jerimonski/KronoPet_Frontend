// Contenido de la landing pública de KronoPet.
// Centralizado acá para que Hero, ServicesOffered, etc. no hardcodeen texto,
// y para que sea fácil de editar sin tocar componentes.

export interface HeroStat {
  value: string;
  label: string;
}

export type HighlightTone = "orange" | "teal" | "plum";

export interface ServiceHighlight {
  title: string;
  description: string;
  tone: HighlightTone;
}

export interface SpeciesItem {
  label: string;
  count: string;
}

export interface OfferedService {
  title: string;
  description: string;
}

export interface SuccessStory {
  name: string;
  detail: string;
  case: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface BlogPost {
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
}

export const heroStats: HeroStat[] = [
  { value: "3.200+", label: "Pacientes atendidos" },
  { value: "12+", label: "Años de trayectoria" },
  { value: "24/7", label: "Urgencias disponibles" },
];

export const serviceHighlights: ServiceHighlight[] = [
  {
    title: "Consulta General",
    description: "Diagnóstico y control con nuestros médicos veterinarios.",
    tone: "orange",
  },
  {
    title: "Vacunación y Desparasitación",
    description: "Planes preventivos según especie, edad y peso.",
    tone: "teal",
  },
  {
    title: "Cirugía y Especialidades",
    description: "Procedimientos quirúrgicos con seguimiento post-operatorio.",
    tone: "plum",
  },
];

export const speciesAttended: SpeciesItem[] = [
  { label: "Perros", count: "Consulta y cirugía" },
  { label: "Gatos", count: "Consulta y cirugía" },
  { label: "Aves", count: "Medicina exótica" },
  { label: "Conejos", count: "Medicina exótica" },
  { label: "Reptiles", count: "Medicina exótica" },
  { label: "Roedores", count: "Medicina exótica" },
  { label: "Urgencias", count: "Todas las especies" },
  { label: "Laboratorio", count: "Exámenes clínicos" },
];

export const servicesOffered: OfferedService[] = [
  {
    title: "Consulta General",
    description:
      "Evaluación clínica completa para detectar y tratar a tiempo cualquier condición de salud.",
  },
  {
    title: "Vacunación",
    description:
      "Calendario de vacunas al día, adaptado a la especie y etapa de vida de tu mascota.",
  },
  {
    title: "Cirugía",
    description:
      "Procedimientos quirúrgicos con protocolos de anestesia y monitoreo seguros.",
  },
  {
    title: "Laboratorio Clínico",
    description:
      "Exámenes de sangre, orina y otros estudios con resultados oportunos.",
  },
  {
    title: "Odontología",
    description:
      "Limpieza dental y tratamiento de enfermedades bucales frecuentes en mascotas.",
  },
  {
    title: "Urgencias 24/7",
    description:
      "Atención de emergencias médicas fuera de horario, todos los días del año.",
  },
];

export const aboutBullets: string[] = [
  "Médicos veterinarios certificados en cada especialidad",
  "Equipamiento de diagnóstico de última generación",
  "Ficha clínica digital con historial completo del paciente",
  "Atención de urgencias disponible todos los días",
  "Planes de control accesibles para el cuidado preventivo",
];

export const successStories: SuccessStory[] = [
  {
    name: "Max",
    detail: "Golden Retriever · 3 años",
    case: "Recuperación post-quirúrgica",
  },
  {
    name: "Luna",
    detail: "Gato Persa · 1 año",
    case: "Control de peso y nutrición",
  },
  {
    name: "Charlie",
    detail: "Labrador · 5 años",
    case: "Tratamiento de displasia",
  },
  {
    name: "Bella",
    detail: "Beagle · 2 años",
    case: "Plan de vacunación completo",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "El equipo de KronoPet fue muy claro en cada etapa del tratamiento de mi perro y siempre me mantuvieron informada.",
    name: "Sofía Ramírez",
    role: "Tutora de Max",
  },
  {
    quote:
      "La atención de urgencia fue rápida y profesional. Se nota la experiencia del equipo médico.",
    name: "Diego Torres",
    role: "Tutor de Luna",
  },
  {
    quote:
      "Me gusta poder revisar el historial clínico de mi mascota y entender cada control que le hicieron.",
    name: "Camila Soto",
    role: "Tutora de Bella",
  },
];

export const blogPosts: BlogPost[] = [
  {
    tag: "Prevención",
    title: "Calendario de vacunas: qué necesita tu mascota y cuándo",
    excerpt:
      "Una guía simple para no perder el ritmo de las vacunas según la edad y especie.",
    readTime: "5 min",
  },
  {
    tag: "Nutrición",
    title: "Cómo elegir el alimento correcto según etapa de vida",
    excerpt:
      "Diferencias clave entre alimento para cachorros, adultos y mascotas senior.",
    readTime: "7 min",
  },
  {
    tag: "Urgencias",
    title: "Señales de alerta que requieren atención veterinaria inmediata",
    excerpt:
      "Reconoce los síntomas que no deben esperar hasta el próximo control.",
    readTime: "6 min",
  },
];
