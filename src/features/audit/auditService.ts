// GET /audit — solo administradores. Más reciente primero.

import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from "../../core/constants/audit";
import { useDb } from "../../core/mocks/mockDb";
import type { AuditAction, AuditEntity, AuditEntry, StaffUser } from "../../core/types/models";
import { formatDateTime } from "../../core/utils/dates";
import { buildXlsx, downloadBlob } from "../../core/utils/xlsx";

export interface AuditFilters {
  query: string;
  actorId: string;
  entity: AuditEntity | "";
  action: AuditAction | "";
  from: string;
  to: string;
}

export const EMPTY_AUDIT_FILTERS: AuditFilters = { query: "", actorId: "", entity: "", action: "", from: "", to: "" };

export function useAudit(): AuditEntry[] {
  return [...useDb().audit].sort((a, b) => b.at.localeCompare(a.at));
}

export function applyAuditFilters(entries: AuditEntry[], f: AuditFilters): AuditEntry[] {
  const q = f.query.trim().toLowerCase();
  return entries.filter(
    (e) =>
      (!f.actorId || e.actorId === f.actorId) &&
      (!f.entity || e.entity === f.entity) &&
      (!f.action || e.action === f.action) &&
      (!f.from || e.at.slice(0, 10) >= f.from) &&
      (!f.to || e.at.slice(0, 10) <= f.to) &&
      (!q ||
        e.entityLabel.toLowerCase().includes(q) ||
        e.changes?.some((c) => `${c.field} ${c.from} ${c.to}`.toLowerCase().includes(q))),
  );
}

export function exportAudit(entries: AuditEntry[], staff: StaffUser[]) {
  const name = (id: string | null) => staff.find((s) => s.id === id)?.name ?? "Sistema";
  const rows = entries.map((e) => [
    formatDateTime(e.at),
    name(e.actorId),
    AUDIT_ACTION_LABELS[e.action],
    AUDIT_ENTITY_LABELS[e.entity],
    e.entityLabel,
    e.changes?.map((c) => `${c.field}: ${c.from} → ${c.to}`).join(" | ") ?? "",
  ]);
  downloadBlob(
    buildXlsx([
      {
        name: "Auditoría",
        rows: [["Fecha y hora", "Usuario", "Acción", "Tipo", "Registro", "Cambios"], ...rows],
        boldRows: [0],
        widths: [20, 24, 12, 16, 48, 70],
      },
    ]),
    `kronopet-auditoria-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}
