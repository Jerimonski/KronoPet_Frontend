import { EditIcon, PawIcon } from "./icons";

export default function CoreFeatures() {
  return (
    <section id="beneficios" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Card 1: Fichas Clínicas Flexibles y Editables */}
        <div className="card flex flex-col justify-between p-8 transition hover:border-primary-300 hover:shadow-md">
          <div>
            <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-700">
              <EditIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-neutral-900">
              Historial clínico editable y trazable
            </h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-600">
              Actualiza diagnósticos, tratamientos u observaciones a medida que
              evolucione el estado de la mascota. Mantenemos el historial
              siempre al día para que el equipo veterinario y el tutor consulten
              información precisa y clara.
            </p>
          </div>
          <p className="mt-6 font-sans text-xs font-semibold text-primary-700 border-t border-neutral-100 pt-4">
            ✓ Edición ágil y centralizada por mascota
          </p>
        </div>

        {/* Card 2: Registro Multiespecie Flexible */}
        <div className="card flex flex-col justify-between p-8 transition hover:border-primary-300 hover:shadow-md">
          <div>
            <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-700">
              <PawIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-neutral-900">
              Registro multiespecie flexible
            </h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-600">
              El sistema no restringe la atención únicamente a felinos y
              caninos. Al ser un campo de especie abierto, puedes registrar y
              dar seguimiento a animales exóticos, aves, reptiles o especies de
              producción sin inconvenientes.
            </p>
          </div>
          <p className="mt-6 font-sans text-xs font-semibold text-primary-700 border-t border-neutral-100 pt-4">
            ✓ Adaptable a clínicas tradicionales y especializadas en exóticos
          </p>
        </div>
      </div>
    </section>
  );
}
