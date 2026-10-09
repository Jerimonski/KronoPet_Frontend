import { api, type MedicalEventInput } from "../../core/api/endpoints";
import { getFile } from "../../core/mocks/fileStore";
import { useDb } from "../../core/mocks/mockDb";
import type { Attachment, MedicalEvent } from "../../core/types/models";

export type { MedicalEventInput };

export const medicalEventService = {
  create: api.medicalEvents.create,
  uploadAttachment: api.attachments.upload,
};

export function useEventAttachments(eventId: string | undefined): Attachment[] {
  return useDb().attachments.filter((a) => a.eventId === eventId);
}

// GET /attachments/:id — en modo simulado el binario está en IndexedDB.
export async function getAttachmentUrl(attachment: Attachment): Promise<string> {
  const blob = await getFile(attachment.id);
  if (!blob) throw new Error("El archivo no está disponible en este navegador.");
  return URL.createObjectURL(blob);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString("es-CL", { maximumFractionDigits: 1 })} MB`;
}

/** Más reciente primero. */
export function sortByDateDesc(events: MedicalEvent[]): MedicalEvent[] {
  return [...events].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export function useMedicalEvents(): MedicalEvent[] {
  return useDb().events;
}

// GET /medical-events/pet/:petId
export function usePetMedicalEvents(petId: string | undefined): MedicalEvent[] {
  return sortByDateDesc(useDb().events.filter((e) => e.petId === petId));
}
