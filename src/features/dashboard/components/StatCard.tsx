import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "../../../lib/utils";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: number;
  unit: string;
  /** Variación porcentual vs el periodo anterior (null = sin base de comparación). */
  trend?: number | null;
  /** Si subir es malo (ej. vacunas vencidas), el color de la tendencia se invierte. */
  invertTrend?: boolean;
  footnote: ReactNode;
  to: string;
}

export default function StatCard({
  title,
  icon: Icon,
  value,
  unit,
  trend,
  invertTrend = false,
  footnote,
  to,
}: StatCardProps) {
  const up = (trend ?? 0) >= 0;
  const good = invertTrend ? !up : up;

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-(--shadow-card) ring-1 ring-neutral-200/70">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-sm font-medium text-neutral-600">{title}</h3>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-700">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {value.toLocaleString("es-CL")}
            </span>
            <span className="text-xs text-neutral-500">{unit}</span>
            {trend != null && (
              <span
                className={cn(
                  "ml-1 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                  good ? "bg-success-bg text-success" : "bg-danger-bg text-danger",
                )}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500">{footnote}</p>
        </div>
        <Link
          to={to}
          className="shrink-0 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-primary-50 hover:text-primary-800"
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
