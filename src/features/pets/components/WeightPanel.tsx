import { Minus, Scale, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import type { MedicalEvent } from "../../../core/types/models";
import { addDays, formatDate, MONTH_SHORT, parseDate, todayISO } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import EmptyState from "../../../shared/components/EmptyState";
import LineChart from "../../../shared/components/LineChart";
import Panel from "../../../shared/components/Panel";

/** Variación relativa que se considera clínicamente relevante en 6 meses. */
const RELEVANT_CHANGE = 0.1;

const kg = (value: number) => `${value.toLocaleString("es-CL", { maximumFractionDigits: 2 })} kg`;
const signedKg = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : "±"}${kg(Math.abs(value))}`;
const pct = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : "±"}${Math.abs(Math.round(value * 1000) / 10).toLocaleString("es-CL")}%`;

interface WeightPanelProps {
  petName: string;
  /** Atenciones de la mascota, más reciente primero. */
  events: MedicalEvent[];
}

export default function WeightPanel({ petName, events }: WeightPanelProps) {
  if (events.length === 0) {
    return (
      <Panel>
        <EmptyState icon={Scale} title="Sin registros de peso" description="El peso se registra en cada ficha clínica." />
      </Panel>
    );
  }

  const chronological = [...events].reverse();
  const [last, previous] = events;
  const sixMonthsAgo = addDays(todayISO(), -182);
  const baseline = chronological.find((e) => e.date >= sixMonthsAgo);
  const change6m = baseline && baseline.id !== last.id ? (last.weightKg - baseline.weightKg) / baseline.weightKg : null;
  const weights = events.map((e) => e.weightKg);

  const series = chronological.map((e) => {
    const d = parseDate(e.date);
    return {
      label: `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`,
      tooltipLabel: `${formatDate(e.date)} · ${e.title}`,
      value: e.weightKg,
    };
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Peso actual" value={kg(last.weightKg)} sub={formatDate(last.date)} />
        <Stat
          label="Vs. registro anterior"
          value={previous ? signedKg(last.weightKg - previous.weightKg) : "—"}
          sub={previous ? `${pct((last.weightKg - previous.weightKg) / previous.weightKg)} desde ${formatDate(previous.date)}` : "Primer registro"}
          trend={previous ? last.weightKg - previous.weightKg : undefined}
        />
        <Stat
          label="Últimos 6 meses"
          value={change6m != null ? pct(change6m) : "—"}
          sub={change6m != null && baseline ? `desde ${kg(baseline.weightKg)} (${formatDate(baseline.date)})` : "Sin registros suficientes"}
          trend={change6m ?? undefined}
          warn={change6m != null && Math.abs(change6m) >= RELEVANT_CHANGE}
        />
        <Stat label="Rango histórico" value={`${kg(Math.min(...weights))} – ${kg(Math.max(...weights))}`} sub={`${events.length} registros`} />
      </div>

      {change6m != null && Math.abs(change6m) >= RELEVANT_CHANGE && (
        <p className="flex items-start gap-2 rounded-xl bg-warning-bg px-4 py-3 text-sm text-amber-800 ring-1 ring-warning/30">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {petName} {change6m < 0 ? "bajó" : "subió"} {pct(Math.abs(change6m)).slice(1)} de peso en los últimos 6 meses.
          Una variación sobre el {RELEVANT_CHANGE * 100}% merece evaluarse.
        </p>
      )}

      <Panel title="Evolución del peso" subtitle="Peso registrado en cada atención (kg)">
        {series.length < 2 ? (
          <EmptyState icon={Scale} title="Se necesitan al menos dos registros para el gráfico" />
        ) : (
          <LineChart
            data={series}
            unit="kg"
            height={280}
            domain="auto"
            format={(v) => v.toLocaleString("es-CL", { maximumFractionDigits: 2 })}
            ariaLabel={`Evolución del peso de ${petName}`}
          />
        )}
      </Panel>

      <Panel title="Registros" bodyClassName="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="app-table min-w-[560px]">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Peso</th>
                <th>Variación</th>
                <th>Atención</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const prev = events[i + 1];
                const delta = prev ? e.weightKg - prev.weightKg : null;
                return (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap text-neutral-500">{formatDate(e.date)}</td>
                    <td className="font-medium text-neutral-900 tabular-nums">{kg(e.weightKg)}</td>
                    <td className="whitespace-nowrap tabular-nums">
                      {delta == null ? (
                        <span className="text-neutral-400">—</span>
                      ) : (
                        <span className={cn(delta > 0 ? "text-sky-700" : delta < 0 ? "text-amber-700" : "text-neutral-500")}>
                          {signedKg(delta)} <span className="text-xs">({pct(delta / prev.weightKg)})</span>
                        </span>
                      )}
                    </td>
                    <td className="text-neutral-700">{e.title}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  trend,
  warn,
}: {
  label: string;
  value: string;
  sub: string;
  trend?: number;
  warn?: boolean;
}) {
  // Subir o bajar de peso no es bueno ni malo per se: solo se marca en color si es relevante.
  const Icon = trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-4 shadow-(--shadow-card) ring-1 ring-neutral-200/70",
        warn && "ring-warning/50",
      )}
    >
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={cn("mt-1 flex items-center gap-1.5 text-xl font-bold text-neutral-900 tabular-nums", warn && "text-amber-700")}>
        {Icon && <Icon className="h-4 w-4" />}
        {value}
      </p>
      <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>
    </div>
  );
}
