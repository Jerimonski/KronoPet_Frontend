import { Download, History, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_STYLES, AUDIT_ENTITY_LABELS } from "../../../core/constants/audit";
import { useDb } from "../../../core/mocks/mockDb";
import type { AuditAction, AuditEntity } from "../../../core/types/models";
import { formatDateTime } from "../../../core/utils/dates";
import { Avatar } from "../../../shared/components/Avatar";
import { Badge } from "../../../shared/components/Badges";
import EmptyState from "../../../shared/components/EmptyState";
import { SearchInput, SelectInput, TextInput } from "../../../shared/components/form";
import PageHeader from "../../../shared/components/PageHeader";
import Panel from "../../../shared/components/Panel";
import { useAuth } from "../../auth/context/AuthContext";
import { applyAuditFilters, EMPTY_AUDIT_FILTERS, exportAudit, useAudit } from "../auditService";

const PAGE_SIZE = 50;

export default function AuditPage() {
  const { user } = useAuth();
  const { staff } = useDb();
  const entries = useAudit();
  const [filters, setFilters] = useState(EMPTY_AUDIT_FILTERS);
  const [limit, setLimit] = useState(PAGE_SIZE);

  if (user?.role !== "administrador") {
    return (
      <Panel>
        <EmptyState
          icon={ShieldCheck}
          title="Acceso restringido"
          description="Solo los administradores pueden revisar el registro de auditoría."
        />
      </Panel>
    );
  }

  const filtered = applyAuditFilters(entries, filters);
  const visible = filtered.slice(0, limit);
  const actor = (id: string | null) => staff.find((s) => s.id === id);
  const update = (patch: Partial<typeof filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setLimit(PAGE_SIZE);
  };
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_AUDIT_FILTERS);

  return (
    <>
      <PageHeader
        title="Auditoría"
        description="Quién creó, editó o eliminó cada registro, y cuándo. El registro no se puede modificar."
        actions={
          <button
            type="button"
            className="btn-app-outline"
            onClick={() => exportAudit(filtered, staff)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" /> Exportar a Excel
          </button>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="grid gap-2 border-b border-neutral-100 p-4 md:grid-cols-2 xl:grid-cols-7">
          <SearchInput
            value={filters.query}
            onChange={(query) => update({ query })}
            placeholder="Buscar registro o cambio..."
            className="md:col-span-2"
          />
          <SelectInput value={filters.actorId} onChange={(e) => update({ actorId: e.target.value })} aria-label="Usuario">
            <option value="">Todos los usuarios</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {!s.active && " (deshabilitado)"}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            value={filters.entity}
            onChange={(e) => update({ entity: e.target.value as AuditEntity | "" })}
            aria-label="Tipo de registro"
          >
            <option value="">Todos los registros</option>
            {Object.entries(AUDIT_ENTITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            value={filters.action}
            onChange={(e) => update({ action: e.target.value as AuditAction | "" })}
            aria-label="Acción"
          >
            <option value="">Todas las acciones</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <div className="flex gap-2 md:col-span-2">
            <TextInput type="date" value={filters.from} onChange={(e) => update({ from: e.target.value })} aria-label="Desde" />
            <TextInput type="date" value={filters.to} onChange={(e) => update({ to: e.target.value })} aria-label="Hasta" />
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 text-xs text-neutral-500">
          <span>
            {filtered.length.toLocaleString("es-CL")} {filtered.length === 1 ? "movimiento" : "movimientos"}
          </span>
          {hasFilters && (
            <button type="button" className="font-medium text-primary-700 hover:text-primary-900" onClick={() => update(EMPTY_AUDIT_FILTERS)}>
              Limpiar filtros
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={History} title="Sin movimientos" description="Ningún registro coincide con los filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="app-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Registro</th>
                  <th>Cambios</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => {
                  const member = actor(entry.actorId);
                  return (
                    <tr key={entry.id} className="align-top">
                      <td className="whitespace-nowrap text-neutral-500 tabular-nums">{formatDateTime(entry.at)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={member?.name ?? "Sistema"} className="h-7 w-7 text-[10px]" />
                          <span className="whitespace-nowrap text-neutral-800">{member?.name ?? "Sistema"}</span>
                        </div>
                      </td>
                      <td>
                        <Badge className={AUDIT_ACTION_STYLES[entry.action]}>{AUDIT_ACTION_LABELS[entry.action]}</Badge>
                      </td>
                      <td>
                        <p className="text-xs text-neutral-400">{AUDIT_ENTITY_LABELS[entry.entity]}</p>
                        <p className="text-neutral-800">{entry.entityLabel}</p>
                      </td>
                      <td>
                        {entry.changes?.length ? (
                          <ul className="space-y-0.5 text-xs">
                            {entry.changes.map((c) => (
                              <li key={c.field}>
                                <span className="font-medium text-neutral-700">{c.field}:</span>{" "}
                                <span className="text-neutral-400 line-through">{c.from}</span>{" "}
                                <span className="text-neutral-800">→ {c.to}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-neutral-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > limit && (
          <div className="border-t border-neutral-100 p-3 text-center">
            <button type="button" className="btn-app-outline" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
              Ver {Math.min(PAGE_SIZE, filtered.length - limit)} más
            </button>
          </div>
        )}
      </Panel>
    </>
  );
}
