import {
  ArrowRight,
  ClipboardList,
  PawPrint,
  Plus,
  Syringe,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import catImage from "../../../assets/Cat.png";
import { REASON_STYLES } from "../../../core/constants/medicalReasons";
import { useDb } from "../../../core/mocks/mockDb";
import { daysBetween, formatDate, formatLongDate, greeting, todayISO } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { Avatar, PetAvatar } from "../../../shared/components/Avatar";
import { ReasonBadge, VaccineStatusBadge } from "../../../shared/components/Badges";
import LineChart from "../../../shared/components/LineChart";
import Panel from "../../../shared/components/Panel";
import { useAuth } from "../../auth/context/AuthContext";
import { sortByDateDesc } from "../../medical-events/medicalEventService";
import ExportMenu from "../components/ExportMenu";
import PeriodFilter from "../components/PeriodFilter";
import SpeciesBreakdown from "../components/SpeciesBreakdown";
import StatCard from "../components/StatCard";
import { exportExcel, exportPdf } from "../exportReport";
import { computeDashboard, getPeriod, PERIOD_TYPES, shiftPeriod, type PeriodType } from "../dashboardStats";

export default function DashboardPage() {
  const db = useDb();
  const { user } = useAuth();
  const today = todayISO();
  const [params, setParams] = useSearchParams();
  const periodType = PERIOD_TYPES.find((p) => p.value === params.get("periodo"))?.value ?? "mes";
  const from = params.get("desde");
  const period = getPeriod(periodType, from && /^\d{4}-\d{2}-\d{2}$/.test(from) && from <= today ? from : today);
  const stats = computeDashboard(db, period);

  const setPeriod = (type: PeriodType, start?: string) => {
    const next = new URLSearchParams(params);
    next.set("periodo", type);
    if (start && getPeriod(type, start).start !== getPeriod(type, today).start) next.set("desde", start);
    else next.delete("desde");
    setParams(next, { replace: true });
  };
  const petById = (id: string) => db.pets.find((p) => p.id === id);
  const vetById = (id: string) => db.staff.find((s) => s.id === id);
  const recentEvents = sortByDateDesc(stats.events).slice(0, 5);
  const firstName = user?.name.split(" ").slice(0, 2).join(" ") ?? "";
  const maxReason = Math.max(...stats.reasons.map((r) => r.current), 1);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">{formatLongDate()}</p>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-neutral-900">
            {greeting()}, {firstName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/mascotas?nueva=1" className="btn-app-outline">
            <PawPrint className="h-4 w-4" /> Nueva mascota
          </Link>
          <Link to="/dashboard/historial?nueva=1" className="btn-app">
            <Plus className="h-4 w-4" /> Nueva ficha clínica
          </Link>
        </div>
      </div>

      {/* Filtro de periodo */}
      <div className="flex flex-col gap-2 rounded-2xl bg-white px-4 py-3 shadow-(--shadow-card) ring-1 ring-neutral-200/70 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">
          Métricas de <span className="font-semibold text-neutral-900">{period.label}</span>
          {period.isCurrent && <span className="text-neutral-400"> (en curso)</span>}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter
            period={period}
            onTypeChange={(type) => setPeriod(type, period.isCurrent ? undefined : period.start)}
            onShift={(delta) => setPeriod(period.type, shiftPeriod(period.type, period.start, delta))}
            onReset={() => setPeriod(period.type)}
          />
          <ExportMenu
            onExcel={() => exportExcel({ db, stats, period, generatedBy: user?.name ?? "—" })}
            onPdf={() => exportPdf({ db, stats, period, generatedBy: user?.name ?? "—" })}
          />
        </div>
      </div>

      {/* KPIs + especies */}
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="grid gap-5 sm:grid-cols-2 xl:col-span-2">
          <StatCard
            title="Mascotas registradas"
            icon={PawPrint}
            value={stats.pets.total}
            unit="mascotas"
            footnote={`+${stats.pets.new} nuevas ${period.phrase}`}
            to="/dashboard/mascotas"
          />
          <StatCard
            title="Atenciones"
            icon={ClipboardList}
            value={stats.attentions.current}
            unit="fichas"
            trend={stats.attentions.trend}
            footnote={`${stats.attentions.previous} en el periodo anterior${period.isCurrent ? " (mismo tramo)" : ""}`}
            to="/dashboard/historial"
          />
          <StatCard
            title="Tutores"
            icon={Users}
            value={stats.tutors.total}
            unit="tutores"
            footnote={`+${stats.tutors.new} nuevos ${period.phrase}`}
            to="/dashboard/tutores"
          />
          <StatCard
            title="Vacunas por atender"
            icon={Syringe}
            value={stats.vaccines.attention}
            unit="vacunas"
            footnote={
              <>
                <span className="font-medium text-danger">{stats.vaccines.expired} vencidas</span>
                {" · "}
                <span className="font-medium text-amber-700">{stats.vaccines.upcoming} por vencer</span>
                {" · "}
                {stats.vaccines.pending} pendientes
              </>
            }
            to="/dashboard/vacunas"
          />
        </div>
        <SpeciesBreakdown pets={db.pets} newInPeriod={stats.pets.new} periodPhrase={period.phrase} />
      </div>

      {/* Gráfico + motivos */}
      <div className="grid gap-5 xl:grid-cols-5">
        <Panel
          title={period.type === "anio" ? "Atenciones por mes" : "Atenciones por día"}
          subtitle={`Fichas clínicas registradas · ${period.label}`}
          className="xl:col-span-3"
        >
          <LineChart
            data={stats.series}
            unit="atenciones"
            height={300}
            ariaLabel={`Atenciones clínicas ${period.type === "anio" ? "por mes" : "por día"} en ${period.label}`}
          />
        </Panel>

        <Panel
          title="Motivos de atención"
          subtitle={`${period.label} vs. periodo anterior`}
          className="xl:col-span-2"
        >
          <ul className="space-y-1.5">
            {stats.reasons.map(({ reason, current, trend }) => (
              <li key={reason} className="rounded-xl bg-neutral-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", REASON_STYLES[reason].dot)} />
                    <span className="truncate font-medium text-neutral-800">{reason}</span>
                    {trend != null && trend !== 0 && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[11px] font-semibold",
                          trend > 0 ? "text-success" : "text-danger",
                        )}
                      >
                        {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(trend)}%
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-neutral-600 tabular-nums">
                    <span className="font-semibold text-neutral-900">{current}</span> fichas
                  </span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-neutral-200/70">
                  <div
                    className={cn("h-1 rounded-full", REASON_STYLES[reason].dot)}
                    style={{ width: `${(current / maxReason) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Vacunas, actividad y CTA */}
      <div className="grid gap-5 xl:grid-cols-5">
        <Panel
          title="Vacunas que requieren atención"
          subtitle="Vencidas, próximas a vencer y pendientes"
          className="xl:col-span-3"
          bodyClassName="px-0 pb-2"
          action={
            <Link to="/dashboard/vacunas" className="text-xs font-medium text-primary-700 hover:text-primary-900">
              Ver todas
            </Link>
          }
        >
          <ul className="divide-y divide-neutral-100">
            {stats.vaccineAlerts.slice(0, 5).map(({ vaccine, status }) => {
              const pet = petById(vaccine.petId);
              const days = daysBetween(today, vaccine.expiresAt);
              return (
                <li key={vaccine.id}>
                  <Link
                    to={`/dashboard/mascotas/${vaccine.petId}?tab=vacunas`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-neutral-50"
                  >
                    {pet && <PetAvatar species={pet.species} className="h-9 w-9 text-base" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {pet?.name} · <span className="font-normal text-neutral-600">{vaccine.name}</span>
                      </p>
                      <p className="text-xs text-neutral-500">
                        {status === "pendiente" ? "Aplicar antes del" : "Vence el"} {formatDate(vaccine.expiresAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "hidden text-xs tabular-nums sm:block",
                        days < 0 ? "text-danger" : "text-neutral-500",
                      )}
                    >
                      {days < 0 ? `hace ${-days} días` : days === 0 ? "hoy" : `en ${days} días`}
                    </span>
                    <VaccineStatusBadge status={status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="grid gap-5 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Panel title="Equipo veterinario" subtitle={`Atenciones · ${period.label}`}>
            <ul className="space-y-3">
              {stats.vetActivity.map(({ vet, count }) => (
                <li key={vet.id} className="flex items-center gap-3">
                  <Avatar name={vet.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{vet.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {vet.active ? vet.specialty : "Cuenta deshabilitada"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="relative flex min-h-64 flex-col overflow-hidden rounded-2xl bg-primary-950 p-6 text-white">
            <img
              src={catImage}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 grayscale"
            />
            <div className="absolute inset-0 bg-linear-to-br from-primary-950 via-primary-950/85 to-primary-900/40" />
            <h3 className="relative font-display text-2xl leading-tight">
              Cuidado experto.
              <br />
              Registros ordenados.
            </h3>
            <p className="relative mt-3 max-w-[16rem] text-sm text-primary-200">
              Registra cada atención en la ficha de la mascota y mantén su historial al día.
            </p>
            <Link
              to="/dashboard/historial?nueva=1"
              className="relative mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-primary-950 transition hover:bg-primary-50"
            >
              Registrar atención <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Últimas atenciones */}
      <Panel
        title="Últimas atenciones"
        subtitle={period.label}
        bodyClassName="px-0 pb-0"
        action={
          <Link to="/dashboard/historial" className="text-xs font-medium text-primary-700 hover:text-primary-900">
            Ver historial
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="app-table min-w-[640px]">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Mascota</th>
                <th>Atención</th>
                <th>Motivo</th>
                <th>Veterinario</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => {
                const pet = petById(event.petId);
                return (
                  <tr key={event.id} className="transition hover:bg-neutral-50">
                    <td className="whitespace-nowrap text-neutral-500">{formatDate(event.date)}</td>
                    <td>
                      <Link to={`/dashboard/mascotas/${event.petId}`} className="font-medium text-neutral-900 hover:text-primary-700">
                        {pet?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="text-neutral-700">{event.title}</td>
                    <td>
                      <ReasonBadge reason={event.reason} />
                    </td>
                    <td className="whitespace-nowrap text-neutral-600">{vetById(event.vetId)?.name}</td>
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
