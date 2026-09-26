import {
  StethoscopeIcon,
  VaccineIcon,
  ScalpelIcon,
  ShieldCheckIcon,
} from "./icons";

const CATEGORIES = [
  {
    key: "Consulta",
    title: "Consulta Médica",
    description:
      "Evaluaciones generales, diagnósticos, anamnesis y registros sintomáticos específicos para cada paciente.",
    icon: StethoscopeIcon,
    bgBadge: "bg-primary-50",
    textBadge: "text-primary-800",
    borderBadge: "border-primary-200",
    iconColor: "text-primary-600",
  },
  {
    key: "Inmunización",
    title: "Inmunización",
    description:
      "Control de vacunas aplicadas con seguimiento automatizado de dosis y días para el siguiente refuerzo.",
    icon: VaccineIcon,
    bgBadge: "bg-[var(--color-cat-inmunizacion-50)]",
    textBadge: "text-[var(--color-cat-inmunizacion-700)]",
    borderBadge: "border-indigo-200",
    iconColor: "text-[var(--color-cat-inmunizacion-500)]",
  },
  {
    key: "Cirugía",
    title: "Cirugía e Intervenciones",
    description:
      "Fichas de intervenciones quirúrgicas, procedimientos anestésicos y controles pre/post operatorios trazables.",
    icon: ScalpelIcon,
    bgBadge: "bg-accent-50",
    textBadge: "text-accent-800",
    borderBadge: "border-accent-200",
    iconColor: "text-accent-600", // Coral / Naranjo específico para la categoría médica de Cirugía
  },
  {
    key: "Desparasitación",
    title: "Desparasitación",
    description:
      "Registro de tratamientos antiparasitarios internos y externos con fechas programadas de repetición.",
    icon: ShieldCheckIcon,
    bgBadge: "bg-[var(--color-cat-desparasitacion-50)]",
    textBadge: "text-[var(--color-cat-desparasitacion-700)]",
    borderBadge: "border-lime-200",
    iconColor: "text-[var(--color-cat-desparasitacion-500)]",
  },
];

export default function MedicalCategories() {
  return (
    <section id="funcionalidades" className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <span className="badge font-sans">Estructura Clínica</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
          Atención estructurada por categoría médica
        </h2>
        <p className="mt-2 max-w-2xl mx-auto font-sans text-sm text-neutral-600 leading-relaxed">
          KronoPet sustituye el formulario genérico único por fichas adaptadas a
          cuatro tipos de eventos médicos validados, garantizando precisión e
          historial legible al instante.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.key}
              className="card flex flex-col justify-between p-6 transition hover:border-primary-300 hover:shadow-md"
            >
              <div>
                <div
                  className={`inline-grid h-10 w-10 place-items-center rounded-xl ${cat.bgBadge}`}
                >
                  <Icon className={`h-5 w-5 ${cat.iconColor}`} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">
                  {cat.title}
                </h3>
                <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-600">
                  {cat.description}
                </p>
              </div>
              <div className="mt-6 border-t border-neutral-100 pt-4">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium ${cat.bgBadge} ${cat.textBadge} ${cat.borderBadge}`}
                >
                  {cat.key}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
