import { Pencil, Plus, ShieldCheck, Stethoscope, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { STAFF_ROLE_LABELS } from "../../../core/constants/staff";
import { useNotification } from "../../../core/hooks/useNotification";
import { useDb } from "../../../core/mocks/mockDb";
import type { StaffUser } from "../../../core/types/models";
import { formatDate } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { Avatar } from "../../../shared/components/Avatar";
import { Badge } from "../../../shared/components/Badges";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import { SearchInput } from "../../../shared/components/form";
import PageHeader from "../../../shared/components/PageHeader";
import Panel from "../../../shared/components/Panel";
import { useAuth } from "../../auth/context/AuthContext";
import StaffFormModal from "../components/StaffFormModal";
import { matchesStaff, staffService } from "../staffService";

type StatusFilter = "activos" | "deshabilitados" | "todos";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "activos", label: "Activos" },
  { value: "deshabilitados", label: "Deshabilitados" },
  { value: "todos", label: "Todos" },
];

export default function StaffPage() {
  const { staff, events } = useDb();
  const { user } = useAuth();
  const notify = useNotification();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("activos");
  const [editing, setEditing] = useState<StaffUser | "new" | null>(null);
  const [deactivating, setDeactivating] = useState<StaffUser | null>(null);

  if (user?.role !== "administrador") {
    return (
      <Panel>
        <EmptyState
          icon={ShieldCheck}
          title="Acceso restringido"
          description="Solo los administradores de la clínica pueden gestionar al equipo veterinario."
        />
      </Panel>
    );
  }

  const activeCount = staff.filter((s) => s.active).length;
  const rows = staff
    .filter((s) => (status === "todos" ? true : status === "activos" ? s.active : !s.active))
    .filter((s) => matchesStaff(s, query))
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));

  const statsOf = (id: string) => {
    const own = events.filter((e) => e.vetId === id);
    const last = own.reduce<string | null>((max, e) => (!max || e.date > max ? e.date : max), null);
    return { count: own.length, last };
  };

  const reactivate = async (member: StaffUser) => {
    try {
      await staffService.setActive(member.id, true);
      notify.success(`${member.name} fue habilitado nuevamente.`);
    } catch (err) {
      notify.error(err, "No se pudo habilitar la cuenta.");
    }
  };

  const deactivate = async () => {
    if (!deactivating) return;
    try {
      await staffService.setActive(deactivating.id, false);
      notify.success(`${deactivating.name} fue deshabilitado. Sus fichas clínicas se conservan.`);
      setDeactivating(null);
    } catch (err) {
      notify.error(err, "No se pudo deshabilitar la cuenta.");
    }
  };

  return (
    <>
      <PageHeader
        title="Equipo veterinario"
        description={`${activeCount} activos · ${staff.length - activeCount} deshabilitados`}
        actions={
          <button type="button" className="btn-app" onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Agregar al equipo
          </button>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-col gap-2 border-b border-neutral-100 p-4 sm:flex-row">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, RUT, correo o especialidad..."
            className="flex-1"
          />
          <div role="radiogroup" aria-label="Estado" className="inline-flex h-10 items-center rounded-xl bg-neutral-100 p-1">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={status === value}
                onClick={() => setStatus(value)}
                className={cn(
                  "h-8 flex-1 rounded-lg px-3 text-sm font-medium transition",
                  status === value ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="Sin resultados"
            description={
              status === "deshabilitados" && !query
                ? "No hay cuentas deshabilitadas."
                : "Prueba con otro término de búsqueda o cambia el filtro."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="app-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Profesional</th>
                  <th>RUT</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Atenciones</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((member) => {
                  const isSelf = member.id === user.id;
                  const { count, last } = statsOf(member.id);
                  return (
                    <tr key={member.id} className={cn(!member.active && "bg-neutral-50/60")}>
                      <td>
                        <div className={cn("flex items-center gap-3", !member.active && "opacity-60")}>
                          <Avatar name={member.name} />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900">
                              {member.name}
                              {isSelf && <span className="ml-1.5 text-xs font-normal text-neutral-400">(tú)</span>}
                            </p>
                            <p className="text-xs text-neutral-500">{member.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-neutral-600 tabular-nums">{member.rut}</td>
                      <td>
                        <p className="text-neutral-700">{member.email}</p>
                        <p className="text-xs text-neutral-500">{member.phone}</p>
                      </td>
                      <td>
                        <Badge
                          className={
                            member.role === "administrador"
                              ? "bg-primary-50 text-primary-800 ring-primary-200"
                              : "bg-neutral-50 text-neutral-700 ring-neutral-200"
                          }
                        >
                          {STAFF_ROLE_LABELS[member.role]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap">
                        <p className="font-medium text-neutral-900 tabular-nums">{count}</p>
                        <p className="text-xs text-neutral-500">{last ? `Última: ${formatDate(last)}` : "Sin atenciones"}</p>
                      </td>
                      <td className="whitespace-nowrap">
                        {member.active ? (
                          <Badge className="bg-success-bg text-success ring-success/20">Activo</Badge>
                        ) : (
                          <>
                            <Badge className="bg-neutral-100 text-neutral-600 ring-neutral-200">Deshabilitado</Badge>
                            {member.deactivatedAt && (
                              <p className="mt-0.5 text-xs text-neutral-400">desde {formatDate(member.deactivatedAt)}</p>
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => setEditing(member)}
                            title="Editar"
                            aria-label={`Editar a ${member.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {member.active ? (
                            <button
                              type="button"
                              className="btn-app-outline h-9 px-3 text-xs hover:border-danger/40 hover:bg-danger-bg hover:text-danger disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-700"
                              onClick={() => setDeactivating(member)}
                              disabled={isSelf}
                              title={isSelf ? "No puedes deshabilitar tu propia cuenta" : undefined}
                            >
                              <UserX className="h-4 w-4" /> Deshabilitar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-app-outline h-9 px-3 text-xs"
                              onClick={() => reactivate(member)}
                            >
                              <UserCheck className="h-4 w-4" /> Habilitar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <StaffFormModal
        open={editing !== null}
        member={editing === "new" || editing === null ? undefined : editing}
        isSelf={editing !== "new" && editing?.id === user.id}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={!!deactivating}
        title={`Deshabilitar a ${deactivating?.name ?? ""}`}
        message="No podrá iniciar sesión ni registrar nuevas atenciones. Las fichas clínicas que firmó se conservan en el historial y puedes volver a habilitar la cuenta cuando quieras."
        confirmLabel="Deshabilitar"
        busyLabel="Deshabilitando..."
        onConfirm={deactivate}
        onClose={() => setDeactivating(null)}
      />
    </>
  );
}
