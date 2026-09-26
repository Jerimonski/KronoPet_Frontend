import { PawIcon } from "./icons";
import catImage from "../../../assets/Cat.png";

const HERO_STATS = [
  { label: "Fichas clínicas inmutables", value: "100%" },
  { label: "Historial y vacunas al día", value: "Trazable" },
  { label: "Informes y resúmenes", value: "Instantáneo" },
];

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-primary-50/40 to-neutral-50"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          {/* Badge de Marca */}
          <span className="badge font-sans">
            <PawIcon className="h-4 w-4 text-primary-600" />
            La plataforma veterinaria más simple
          </span>

          {/* Título Principal usando font-display (Fraunces) */}
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl">
            Dedica tu esfuerzo a lo que te apasiona: el cuidado de cada mascota
          </h1>

          {/* Descripción de Propósito */}
          <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-neutral-600">
            KronoPet se encarga del resto. Centraliza las fichas clínicas,
            consultas médicas e historial de vacunación de cada mascota en un
            solo lugar. Menos tiempo en papeleo, más tiempo en la consulta.
          </p>

          {/* Botones de Acción - Botón Principal con Turquesa Marca (.btn-secondary) */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#funcionalidades"
              className="btn-secondary font-sans cursor-pointer"
            >
              Explorar Sistema
            </a>
            <a
              href="#proyecto"
              className="btn-outline font-sans cursor-pointer"
            >
              Sobre el Proyecto
            </a>
          </div>

          {/* Estadísticas de Valor */}
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-primary-100 pt-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-sans text-2xl font-bold text-neutral-900">
                  {stat.value}
                </dd>
                <p className="mt-1 font-sans text-xs leading-snug text-neutral-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </div>

        {/* Ilustración / Imagen de apoyo en Turquesa */}
        <div className="relative mx-auto aspect-square w-full max-w-md">
          {/* Fondo Turquesa Primario (#75CFCF) */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-primary-500/90 shadow-(--shadow-soft)" />

          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
            <img
              src={catImage}
              alt="Atención médica de mascota"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="pointer-events-none absolute inset-6 rounded-[2rem] border-2 border-dashed border-white/50" />

          {/* Floating Card destacando la gestión de pacientes */}
          <div className="absolute -bottom-5 left-1/2 w-64 -translate-x-1/2 rounded-2xl bg-white px-5 py-3.5 text-center shadow-(--shadow-card) ring-1 ring-neutral-100">
            <p className="font-sans text-lg font-bold text-neutral-900">
              Gestión Inmutable
            </p>
            <p className="font-sans text-xs text-neutral-500">
              Historial clínico centralizado
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
