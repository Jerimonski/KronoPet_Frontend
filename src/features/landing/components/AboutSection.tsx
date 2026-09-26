import { ShieldCheckIcon, PawIcon, LockIcon } from "./icons";

export default function AboutSection() {
  return (
    <section
      id="proyecto"
      className="border-t border-neutral-200/60 bg-white py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Encabezado de la Sección */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge font-sans">
            <PawIcon className="h-4 w-4 text-primary-600" />
            Sobre el Proyecto
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Infraestructura digital para la gestión clínica veterinaria
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-neutral-600">
            KronoPet nace para reemplazar las fichas médicas de papel y
            planillas desordenadas por una plataforma centralizada. Permite a
            los profesionales médicos gestionar atenciones clínicas de forma
            ágil y trazable, llevar control estricto de esquemas de vacunación y
            mantener un historial transparente y accesible.
          </p>
        </div>

        {/* Pilares del Proyecto */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* Pilar 1: Historial Centralizado */}
          <div className="card p-6 transition hover:border-primary-300 hover:shadow-md">
            <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
              <LockIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">
              Historial Centralizado
            </h3>
            <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-600">
              Garantiza que cada registro médico, diagnóstico y procedimiento
              quede ordenado por paciente, con opción de actualización y
              trazabilidad permanente.
            </p>
          </div>

          {/* Pilar 2: Prevención Automática */}
          <div className="card p-6 transition hover:border-primary-300 hover:shadow-md">
            <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">
              Prevención Automática
            </h3>
            <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-600">
              Cálculo automatizado de días para próximos refuerzos de
              inmunización y desparasitación según las especificaciones del
              catálogo.
            </p>
          </div>

          {/* Pilar 3: Especie Libre */}
          <div className="card p-6 transition hover:border-primary-300 hover:shadow-md">
            <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
              <PawIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">
              Especie Libre
            </h3>
            <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-600">
              Diseñado sin restricciones de especie: ideal tanto para caninos y
              felinos como para animales exóticos o de producción.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
