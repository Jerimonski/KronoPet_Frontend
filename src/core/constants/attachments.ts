import type { AttachmentCategory } from "../types/models";

export const ATTACHMENT_CATEGORIES: AttachmentCategory[] = ["laboratorio", "imagen", "documento"];

export const ATTACHMENT_CATEGORY_LABELS: Record<AttachmentCategory, string> = {
  laboratorio: "Resultado de laboratorio",
  imagen: "Imagen / radiografía",
  documento: "Documento",
};

/** Tipos aceptados: PDF e imágenes comunes. */
export const ATTACHMENT_ACCEPT: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
};

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
