const REINFORCE_EXAMPLES = [
  {
    vaccine: "Séxtuple Canina",
    patient: "Max (Canino)",
    status: "Pendiente",
    detail: "Refuerzo en 5 días",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    vaccine: "Triple Felina",
    patient: "Luna (Felino)",
    status: "Al día",
    detail: "Refuerzo en 8 meses",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    vaccine: "Antirrábica",
    patient: "Thor (Canino)",
    status: "Vencido",
    detail: "Venció hace 10 días",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
  },
];

export default function VaccineTracking() {
  return (
    <section className="bg-neutral-50/80 border-y border-neutral-200/60 py-20">
      <div className="mx-auto max-w-6xl px-6 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="badge font-sans">Seguimiento Preventivo</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
            Control automático de refuerzos y vencimientos
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-neutral-600">
            KronoPet calcula automáticamente la fecha del próximo refuerzo
            médico segun lo configurado en el catálogo clínico.
          </p>

          <ul className="mt-6 space-y-3 font-sans text-sm text-neutral-700">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
              <span>
                <strong>Catálogo flexible:</strong> Incluye una base por defecto
                más la opción de agregar productos propios de la clínica.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
              <span>
                <strong>Estados semánticos:</strong> "Al día", "Pendiente" y
                "Vencido" identificables visualmente al instante.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
              <span>
                <strong>Ajuste manual y trazabilidad:</strong> Permite modificar
                el cálculo automático cuando el criterio médico lo requiera,
                asociando lote y fabricante.
              </span>
            </li>
          </ul>
        </div>

        {/* Tarjeta de Simulación del Panel */}
        <div className="card p-6 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Simulación de Panel de Refuerzos
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-sans">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              En vivo
            </span>
          </div>

          {REINFORCE_EXAMPLES.map((item) => (
            <div
              key={item.vaccine}
              className="flex items-center justify-between rounded-xl border border-neutral-100 p-3.5 bg-neutral-50/50 transition hover:bg-neutral-50"
            >
              <div>
                <p className="font-sans text-sm font-bold text-neutral-900">
                  {item.vaccine}
                </p>
                <p className="font-sans text-xs text-neutral-500">
                  {item.patient} · {item.detail}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 font-sans text-xs font-semibold ${item.badgeClass}`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
