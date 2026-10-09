import { ExternalLink, FileImage, FileText, Paperclip, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_CATEGORIES,
  ATTACHMENT_CATEGORY_LABELS,
  ATTACHMENT_MAX_BYTES,
} from "../../../core/constants/attachments";
import { useNotification } from "../../../core/hooks/useNotification";
import { useDb } from "../../../core/mocks/mockDb";
import type { Attachment, AttachmentCategory } from "../../../core/types/models";
import { formatDateTime } from "../../../core/utils/dates";
import { cn } from "../../../lib/utils";
import { formatFileSize, getAttachmentUrl, medicalEventService, useEventAttachments } from "../medicalEventService";

export interface PendingFile {
  id: string;
  file: File;
  category: AttachmentCategory;
}

const ACCEPT = Object.keys(ATTACHMENT_ACCEPT).join(",");

/** Categoría sugerida: imágenes como imagen; PDF como laboratorio si la atención es un examen. */
function guessCategory(file: File, isLabExam: boolean): AttachmentCategory {
  if (file.type.startsWith("image/")) return "imagen";
  return isLabExam ? "laboratorio" : "documento";
}

/** Separa archivos válidos de los rechazados por tipo o tamaño (el backend vuelve a validar). */
function checkFiles(files: File[]) {
  const valid: File[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    if (!ATTACHMENT_ACCEPT[file.type]) rejected.push(`«${file.name}» no es PDF, JPG, PNG ni WEBP`);
    else if (file.size > ATTACHMENT_MAX_BYTES) rejected.push(`«${file.name}» supera 10 MB`);
    else valid.push(file);
  }
  return { valid, rejected };
}

function DropZone({ onFiles, compact }: { onFiles: (files: File[]) => void; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    onFiles([...e.dataTransfer.files]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-sm transition",
        compact ? "py-3" : "py-5",
        over ? "border-primary-400 bg-primary-50" : "border-neutral-200 bg-neutral-50/60",
      )}
    >
      <Upload className="h-5 w-5 shrink-0 text-neutral-400" />
      <p className="text-neutral-600">
        Arrastra archivos o{" "}
        <button
          type="button"
          className="font-semibold text-primary-700 hover:text-primary-900"
          onClick={() => inputRef.current?.click()}
        >
          selecciónalos
        </button>
        <span className="block text-xs text-neutral-400">PDF, JPG, PNG o WEBP · máx. 10 MB c/u</span>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const Icon = mimeType.startsWith("image/") ? FileImage : FileText;
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700">
      <Icon className="h-4 w-4" />
    </span>
  );
}

/** Selección de adjuntos antes de guardar una ficha nueva. */
export function AttachmentPicker({
  files,
  onChange,
  isLabExam,
}: {
  files: PendingFile[];
  onChange: (files: PendingFile[]) => void;
  isLabExam: boolean;
}) {
  const notify = useNotification();

  const add = (incoming: File[]) => {
    const { valid, rejected } = checkFiles(incoming);
    if (rejected.length) notify.error(null, `No se agregaron: ${rejected.join("; ")}.`);
    onChange([
      ...files,
      ...valid.map((file) => ({ id: crypto.randomUUID(), file, category: guessCategory(file, isLabExam) })),
    ]);
  };

  return (
    <div className="space-y-2">
      {files.length > 0 && (
        <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {files.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-2">
              <FileIcon mimeType={item.file.type} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-800">{item.file.name}</p>
                <p className="text-xs text-neutral-400">{formatFileSize(item.file.size)}</p>
              </div>
              <select
                value={item.category}
                onChange={(e) =>
                  onChange(files.map((f) => (f.id === item.id ? { ...f, category: e.target.value as AttachmentCategory } : f)))
                }
                className="app-input h-8 w-auto pr-7 text-xs"
                aria-label={`Categoría de ${item.file.name}`}
              >
                {ATTACHMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {ATTACHMENT_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onChange(files.filter((f) => f.id !== item.id))}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label={`Quitar ${item.file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <DropZone onFiles={add} compact={files.length > 0} />
    </div>
  );
}

/** Adjuntos de una ficha guardada: ver y agregar (nunca borrar: el registro es inmutable). */
export function AttachmentList({ eventId, isLabExam }: { eventId: string; isLabExam: boolean }) {
  const attachments = useEventAttachments(eventId);
  const { staff } = useDb();
  const notify = useNotification();
  const [uploading, setUploading] = useState(0);

  const upload = async (incoming: File[]) => {
    const { valid, rejected } = checkFiles(incoming);
    if (rejected.length) notify.error(null, `No se adjuntaron: ${rejected.join("; ")}.`);
    setUploading((n) => n + valid.length);
    for (const file of valid) {
      try {
        await medicalEventService.uploadAttachment(eventId, file, guessCategory(file, isLabExam));
        notify.success(`«${file.name}» adjuntado.`);
      } catch (err) {
        notify.error(err, `No se pudo adjuntar «${file.name}».`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-neutral-500 uppercase">
        <Paperclip className="h-3.5 w-3.5" /> Adjuntos ({attachments.length})
      </h3>
      {attachments.length > 0 && (
        <ul className="mb-2 grid gap-2 sm:grid-cols-2">
          {attachments.map((a) => (
            <AttachmentItem key={a.id} attachment={a} uploader={staff.find((s) => s.id === a.uploadedBy)?.name} />
          ))}
        </ul>
      )}
      <DropZone onFiles={upload} compact />
      {uploading > 0 && <p className="mt-1.5 text-xs text-neutral-500">Subiendo {uploading} archivo(s)...</p>}
    </div>
  );
}

function AttachmentItem({ attachment, uploader }: { attachment: Attachment; uploader?: string }) {
  const notify = useNotification();
  const isImage = attachment.mimeType.startsWith("image/");
  const [preview, setPreview] = useState<string | null>(null);

  // Miniatura para imágenes; la URL temporal se libera al desmontar.
  useEffect(() => {
    if (!isImage) return;
    let url: string | null = null;
    getAttachmentUrl(attachment)
      .then((u) => {
        url = u;
        setPreview(u);
      })
      .catch(() => setPreview(null));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [attachment, isImage]);

  const open = async () => {
    try {
      const url = await getAttachmentUrl(attachment);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      notify.error(err, "No se pudo abrir el archivo.");
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={open}
        className="group flex w-full items-center gap-3 rounded-xl p-2 text-left ring-1 ring-neutral-200 transition hover:ring-primary-300"
      >
        {preview ? (
          <img src={preview} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        ) : (
          <FileIcon mimeType={attachment.mimeType} />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-neutral-800">{attachment.name}</span>
          <span className="block truncate text-xs text-neutral-400">
            {ATTACHMENT_CATEGORY_LABELS[attachment.category]} · {formatFileSize(attachment.size)}
          </span>
          <span className="block truncate text-xs text-neutral-400">
            {uploader ?? "—"} · {formatDateTime(attachment.uploadedAt)}
          </span>
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-primary-600" />
      </button>
    </li>
  );
}
