import { BellRing, Eye, Info, MailCheck, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import {
  REMINDER_DAYS_OPTIONS,
  REMINDER_KIND_LABELS,
  REMINDER_KIND_STYLES,
} from "../../../core/constants/reminders";
import { useNotification } from "../../../core/hooks/useNotification";
import { buildReminderEmail } from "../../../core/mail/reminderEmail";
import { useDb } from "../../../core/mocks/mockDb";
import { daysBetween, formatDate, formatDateTime, todayISO } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { Badge } from "../../../shared/components/Badges";
import EmptyState from "../../../shared/components/EmptyState";
import { SelectInput } from "../../../shared/components/form";
import Modal from "../../../shared/components/Modal";
import PageHeader from "../../../shared/components/PageHeader";
import Panel from "../../../shared/components/Panel";
import { useAuth } from "../../auth/context/AuthContext";
import {
  reminderService,
  useDueReminders,
  useReminderLog,
  useReminderSettings,
  wasSent,
  type DueReminder,
} from "../reminderService";

type Tab = "pendientes" | "historial";

export default function RemindersPage() {
  const { user } = useAuth();
  const { staff, pets } = useDb();
  const notify = useNotification();
  const due = useDueReminders();
  const log = useReminderLog();
  const settings = useReminderSettings();
  const isAdmin = user?.role === "administrador";

  const [tab, setTab] = useState<Tab>("pendientes");
  // Por defecto se seleccionan los avisos que aún no se han enviado.
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const [preview, setPreview] = useState<DueReminder | null>(null);
  const [sending, setSending] = useState(false);

  const selection = selected ?? new Set(due.filter((r) => !wasSent(r)).map((r) => r.key));
  const toggle = (key: string) => {
    const next = new Set(selection);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };
  const allSelected = due.length > 0 && due.every((r) => selection.has(r.key));

  const send = async () => {
    const items = due.filter((r) => selection.has(r.key));
    setSending(true);
    try {
      const logs = await reminderService.send(items);
      const ok = logs.filter((l) => l.status === "enviado").length;
      if (ok) notify.success(`${ok} recordatorio(s) enviados.`);
      const failed = logs.find((l) => l.status === "error");
      if (failed) notify.error(null, `${logs.length - ok} no se enviaron: ${failed.error}`);
      setSelected(null);
    } catch (err) {
      notify.error(err, "No se pudieron enviar los recordatorios.");
    } finally {
      setSending(false);
    }
  };

  const updateSettings = async (patch: Parameters<typeof reminderService.updateSettings>[0]) => {
    try {
      await reminderService.updateSettings(patch);
      setSelected(null);
    } catch (err) {
      notify.error(err, "No se pudo guardar la configuración.");
    }
  };

  return (
    <>
      <PageHeader
        title="Recordatorios"
        description="Avisos por correo a los tutores: vacunas vencidas, por vencer o pendientes, y controles indicados en las fichas."
      />

      <Panel title="Configuración" className="mb-5">
        <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            Avisar con
            <SelectInput
              value={settings.daysBefore}
              onChange={(e) => updateSettings({ daysBefore: Number(e.target.value) })}
              disabled={!isAdmin}
              className="h-9 w-auto"
            >
              {REMINDER_DAYS_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} días
                </option>
              ))}
            </SelectInput>
            de anticipación
          </label>
          <label className="flex items-center gap-3 text-sm md:justify-end">
            <span className="text-right">
              <span className="block font-medium text-neutral-800">Envío automático diario</span>
              <span className="block text-xs text-neutral-500">
                {settings.lastAutoRun ? `Última ejecución: ${formatDate(settings.lastAutoRun)}` : "Aún no se ha ejecutado"}
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoSend}
              disabled={!isAdmin}
              onClick={() => updateSettings({ autoSend: !settings.autoSend })}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50",
                settings.autoSend ? "bg-primary-600" : "bg-neutral-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                  settings.autoSend && "translate-x-5",
                )}
              />
            </button>
          </label>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-info-bg px-3 py-2.5 text-xs text-sky-800">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Los correos se envían con Resend desde el servidor. Con el envío automático activo, los avisos nuevos salen una
            vez al día (en esta etapa, al abrir el panel; con el backend, mediante una tarea programada). Cada aviso se envía
            una sola vez; puedes reenviarlo manualmente.
            {!isAdmin && " Solo un administrador puede cambiar la configuración."}
          </span>
        </p>
      </Panel>

      <div className="mb-4 inline-flex rounded-xl bg-white p-1 ring-1 ring-neutral-200">
        {(
          [
            ["pendientes", `Avisos vigentes (${due.length})`],
            ["historial", `Historial de envíos (${log.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-9 rounded-lg px-4 text-sm font-medium transition",
              tab === id ? "bg-primary-700 text-white" : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pendientes" ? (
        <Panel bodyClassName="p-0">
          {due.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title="No hay avisos para estos días"
              description={`No hay vacunas ni controles en los próximos ${settings.daysBefore} días.`}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="app-table min-w-[880px]">
                  <thead>
                    <tr>
                      <th className="w-10">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => setSelected(allSelected ? new Set() : new Set(due.map((r) => r.key)))}
                          aria-label="Seleccionar todos"
                          className="h-4 w-4 accent-primary-600"
                        />
                      </th>
                      <th>Aviso</th>
                      <th>Mascota</th>
                      <th>Tutor</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {due.map((r) => {
                      const days = daysBetween(todayISO(), r.dueDate);
                      return (
                        <tr key={r.key} className={cn(selection.has(r.key) && "bg-primary-50/40")}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selection.has(r.key)}
                              onChange={() => toggle(r.key)}
                              aria-label={`Seleccionar aviso de ${r.pet.name}`}
                              className="h-4 w-4 accent-primary-600"
                            />
                          </td>
                          <td>
                            <Badge className={REMINDER_KIND_STYLES[r.kind]}>{REMINDER_KIND_LABELS[r.kind]}</Badge>
                            <p className="mt-1 text-xs text-neutral-600">{r.itemName}</p>
                          </td>
                          <td>
                            <Link to={`/dashboard/mascotas/${r.pet.id}`} className="font-medium text-neutral-900 hover:text-primary-700">
                              {r.pet.name}
                            </Link>
                          </td>
                          <td>
                            <p className="text-neutral-800">{r.tutor.name}</p>
                            <p className="text-xs text-neutral-500">{r.tutor.email}</p>
                          </td>
                          <td className="whitespace-nowrap">
                            <p className="text-neutral-800">{formatDate(r.dueDate)}</p>
                            <p className={cn("text-xs", days < 0 ? "text-danger" : "text-neutral-500")}>
                              {days < 0 ? `hace ${-days} días` : days === 0 ? "hoy" : `en ${days} días`}
                            </p>
                          </td>
                          <td className="max-w-56">
                            {!r.lastLog ? (
                              <span className="text-xs text-neutral-500">Sin enviar</span>
                            ) : r.lastLog.status === "enviado" ? (
                              <span className="inline-flex items-center gap-1 text-xs text-success">
                                <MailCheck className="h-3.5 w-3.5" /> Enviado {formatDateTime(r.lastLog.sentAt)}
                              </span>
                            ) : (
                              <span className="text-xs text-danger" title={r.lastLog.error}>
                                Falló: {r.lastLog.error}
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => setPreview(r)}
                              aria-label={`Vista previa del correo para ${r.tutor.name}`}
                              title="Vista previa"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2 border-t border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500">
                  {selection.size} de {due.length} seleccionados
                </p>
                <button type="button" className="btn-app" onClick={send} disabled={sending || selection.size === 0}>
                  <Send className="h-4 w-4" /> {sending ? "Enviando..." : `Enviar ${selection.size} recordatorio(s)`}
                </button>
              </div>
            </>
          )}
        </Panel>
      ) : (
        <Panel bodyClassName="p-0">
          {log.length === 0 ? (
            <EmptyState icon={MailCheck} title="Aún no se han enviado recordatorios" />
          ) : (
            <div className="overflow-x-auto">
              <table className="app-table min-w-[820px]">
                <thead>
                  <tr>
                    <th>Enviado</th>
                    <th>Aviso</th>
                    <th>Mascota</th>
                    <th>Destinatario</th>
                    <th>Por</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((l) => (
                    <tr key={l.id}>
                      <td className="whitespace-nowrap text-neutral-500 tabular-nums">{formatDateTime(l.sentAt)}</td>
                      <td>
                        <Badge className={REMINDER_KIND_STYLES[l.kind]}>{REMINDER_KIND_LABELS[l.kind]}</Badge>
                      </td>
                      <td className="text-neutral-800">{pets.find((p) => p.id === l.petId)?.name ?? "—"}</td>
                      <td className="text-neutral-700">{l.to}</td>
                      <td className="text-neutral-600">
                        {l.sentBy ? (staff.find((s) => s.id === l.sentBy)?.name ?? "—") : "Automático"}
                      </td>
                      <td className="max-w-64">
                        {l.status === "enviado" ? (
                          <Badge className="bg-success-bg text-success ring-success/20">Enviado</Badge>
                        ) : (
                          <span className="text-xs text-danger">{l.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      <EmailPreview reminder={preview} onClose={() => setPreview(null)} />
    </>
  );
}

function EmailPreview({ reminder, onClose }: { reminder: DueReminder | null; onClose: () => void }) {
  if (!reminder) return null;
  const email = buildReminderEmail({
    kind: reminder.kind,
    dueDate: reminder.dueDate,
    tutorName: reminder.tutor.name,
    petName: reminder.pet.name,
    itemName: reminder.itemName,
  });
  return (
    <Modal open size="lg" title={email.subject} description={`Para: ${reminder.tutor.name} <${reminder.tutor.email}>`} onClose={onClose}>
      <iframe
        title="Vista previa del correo"
        srcDoc={email.html}
        sandbox=""
        className="h-[420px] w-full rounded-xl ring-1 ring-neutral-200"
      />
    </Modal>
  );
}
