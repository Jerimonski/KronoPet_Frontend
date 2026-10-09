// Plantilla del correo de recordatorio. En producción la usa el backend;
// mientras tanto la usan el envío simulado y la vista previa del panel.

import { formatDate } from "../utils/dates";
import type { ReminderKind } from "../types/models";

export const CLINIC_NAME = "Clínica Veterinaria Vety";

export interface ReminderEmailData {
  kind: ReminderKind;
  tutorName: string;
  petName: string;
  /** Nombre de la vacuna o título de la atención que originó el control. */
  itemName: string;
  dueDate: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function copy({ kind, petName, itemName, dueDate }: ReminderEmailData) {
  const date = formatDate(dueDate);
  switch (kind) {
    case "vacuna_vencida":
      return {
        subject: `La vacuna ${itemName} de ${petName} está vencida`,
        lead: `La vacuna <strong>${escapeHtml(itemName)}</strong> de <strong>${escapeHtml(petName)}</strong> venció el <strong>${date}</strong>.`,
        action: "Te recomendamos agendar su refuerzo lo antes posible para mantenerlo protegido.",
      };
    case "vacuna_por_vencer":
      return {
        subject: `La vacuna ${itemName} de ${petName} vence pronto`,
        lead: `La vacuna <strong>${escapeHtml(itemName)}</strong> de <strong>${escapeHtml(petName)}</strong> vence el <strong>${date}</strong>.`,
        action: "Agenda el refuerzo antes de esa fecha para que no quede sin protección.",
      };
    case "vacuna_pendiente":
      return {
        subject: `${petName} tiene una vacuna pendiente`,
        lead: `<strong>${escapeHtml(petName)}</strong> tiene pendiente la vacuna <strong>${escapeHtml(itemName)}</strong>, que debe aplicarse antes del <strong>${date}</strong>.`,
        action: "Agenda una hora para su aplicación.",
      };
    case "control":
      return {
        subject: `Recordatorio: control de ${petName} el ${date}`,
        lead: `En su última atención (<em>${escapeHtml(itemName)}</em>) indicamos un control para <strong>${escapeHtml(petName)}</strong> alrededor del <strong>${date}</strong>.`,
        action: "Agenda tu hora para hacer seguimiento a su tratamiento.",
      };
  }
}

export function buildReminderEmail(data: ReminderEmailData) {
  const { subject, lead, action } = copy(data);
  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#1f2a30">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
          <tr><td style="background:#063f3f;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold">${CLINIC_NAME}</td></tr>
          <tr><td style="padding:28px">
            <p style="margin:0 0 16px;font-size:16px">Hola ${escapeHtml(data.tutorName)},</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6">${lead}</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6">${action}</p>
            <p style="margin:0;font-size:13px;color:#5b6b73">Si ya lo hiciste, puedes ignorar este mensaje.</p>
          </td></tr>
          <tr><td style="background:#f4f7f8;padding:16px 28px;font-size:12px;color:#7a8a92">
            Recibes este correo porque eres tutor/a de ${escapeHtml(data.petName)} en ${CLINIC_NAME}.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `Hola ${data.tutorName},\n\n${lead.replace(/<[^>]+>/g, "")}\n${action}\n\n${CLINIC_NAME}`;
  return { subject, html, text };
}
