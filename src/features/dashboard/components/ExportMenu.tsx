import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExportMenuProps {
  onExcel: () => void;
  onPdf: () => void;
}

/** Botón "Exportar" con las dos salidas del reporte del periodo. */
export default function ExportMenu({ onExcel, onPdf }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const choose = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="btn-app-outline"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Download className="h-4 w-4" /> Exportar <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-64 animate-in rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-neutral-200 fade-in zoom-in-95"
        >
          <MenuItem icon={FileSpreadsheet} title="Excel (.xlsx)" hint="Una hoja por sección + detalle" onClick={() => choose(onExcel)} />
          <MenuItem icon={FileText} title="PDF" hint="Informe imprimible · «Guardar como PDF»" onClick={() => choose(onPdf)} />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  title,
  hint,
  onClick,
}: {
  icon: typeof FileText;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-primary-50"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
      <span>
        <span className="block text-sm font-medium text-neutral-900">{title}</span>
        <span className="block text-xs text-neutral-500">{hint}</span>
      </span>
    </button>
  );
}
