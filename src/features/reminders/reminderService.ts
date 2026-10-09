// Recordatorios por correo a los tutores: qué avisar (reglas) y envío.
// En producción el backend calcula y envía los avisos con un cron diario;
// en modo simulado lo hace el panel (ver useAutoReminders).

import { useEffect } from "react";
import { api, type ReminderRequest } from "../../core/api/endpoints";
import { REMINDER_OVERDUE_LIMIT_DAYS } from "../../core/constants/reminders";
import { useNotification } from "../../core/hooks/useNotification";
import { getDb, useDb } from "../../core/mocks/mockDb";
import type { DbState } from "../../core/mocks/seed";
import type { Pet, ReminderKind, ReminderLog, Tutor } from "../../core/types/models";
import { addDays, todayISO } from "../../core/utils/dates";
import { useAuth } from "../auth/context/AuthContext";

export const reminderService = {
  send: api.reminders.send,
  updateSettings: api.reminders.updateSettings,
};

export interface DueReminder extends ReminderRequest {
  key: string;
  pet: Pet;
  tutor: Tutor;
  /** Vacuna o atención que origina el aviso. */
  itemName: string;
  /** Último intento de envío de este mismo aviso. */
  lastLog?: ReminderLog;
}

const reminderKey = (kind: ReminderKind, refId: string, dueDate: string) => `${kind}:${refId}:${dueDate}`;

/**
 * Avisos vigentes hoy:
 * - Vacuna aplicada que vence dentro de `daysBefore` días, o que venció hace poco.
 * - Vacuna pendiente cuya fecha límite está dentro de `daysBefore` días (o ya pasó hace poco).
 * - Control indicado en una ficha (followUpDate) dentro de `daysBefore` días,
 *   salvo que la mascota ya haya vuelto a atenderse después de esa ficha.
 */
export function computeDueReminders(db: DbState, today = todayISO()): DueReminder[] {
  const { daysBefore } = db.reminderSettings;
  const horizon = addDays(today, daysBefore);
  const overdueLimit = addDays(today, -REMINDER_OVERDUE_LIMIT_DAYS);
  const lastLogByKey = new Map<string, ReminderLog>();
  for (const log of [...db.reminders].sort((a, b) => a.sentAt.localeCompare(b.sentAt))) {
    lastLogByKey.set(log.key, log);
  }

  const result: DueReminder[] = [];
  const push = (kind: ReminderKind, petId: string, refId: string, dueDate: string, itemName: string) => {
    const pet = db.pets.find((p) => p.id === petId);
    const tutor = db.tutors.find((t) => t.id === pet?.tutorId);
    if (!pet || !tutor) return;
    const key = reminderKey(kind, refId, dueDate);
    result.push({ key, kind, petId, refId, dueDate, pet, tutor, itemName, lastLog: lastLogByKey.get(key) });
  };

  for (const v of db.vaccines) {
    if (v.expiresAt < overdueLimit || v.expiresAt > horizon) continue;
    if (v.status === "pendiente") push("vacuna_pendiente", v.petId, v.id, v.expiresAt, v.name);
    else push(v.expiresAt < today ? "vacuna_vencida" : "vacuna_por_vencer", v.petId, v.id, v.expiresAt, v.name);
  }

  for (const e of db.events) {
    if (!e.followUpDate || e.followUpDate < today || e.followUpDate > horizon) continue;
    const cameBack = db.events.some((other) => other.petId === e.petId && other.date > e.date);
    if (!cameBack) push("control", e.petId, e.id, e.followUpDate, e.title);
  }

  return result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export const wasSent = (r: DueReminder) => r.lastLog?.status === "enviado";

export function useDueReminders(): DueReminder[] {
  return computeDueReminders(useDb());
}

export function useReminderLog(): ReminderLog[] {
  return [...useDb().reminders].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export function useReminderSettings() {
  return useDb().reminderSettings;
}

let autoRunStarted = false;

/**
 * Envío automático: una vez al día, al abrir el panel, se envían los avisos
 * que nunca se intentaron. Emula el cron del backend mientras no exista.
 */
export function useAutoReminders() {
  const { user } = useAuth();
  const notify = useNotification();

  useEffect(() => {
    const { reminderSettings } = getDb();
    const today = todayISO();
    if (!user || autoRunStarted || !reminderSettings.autoSend || reminderSettings.lastAutoRun === today) return;
    autoRunStarted = true;

    const pending = computeDueReminders(getDb(), today).filter((r) => !r.lastLog);
    (async () => {
      // Se marca antes de enviar para no duplicar si se abre otra pestaña.
      await reminderService.updateSettings({ lastAutoRun: today });
      if (pending.length === 0) return;
      const logs = await reminderService.send(pending);
      const sent = logs.filter((l) => l.status === "enviado").length;
      if (sent) notify.success(`Envío automático: ${sent} recordatorio(s) enviados a tutores.`);
      if (sent < logs.length) notify.error(null, `Envío automático: ${logs.length - sent} recordatorio(s) fallaron. Revisa Recordatorios.`);
    })()
      .catch((err) => notify.error(err, "El envío automático de recordatorios falló."))
      .finally(() => {
        autoRunStarted = false;
      });
  }, [user, notify]);
}
