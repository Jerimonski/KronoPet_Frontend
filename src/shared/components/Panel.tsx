import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface PanelProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Tarjeta base del panel interno: título, acción opcional y contenido. */
export default function Panel({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl bg-white shadow-(--shadow-card) ring-1 ring-neutral-200/70",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4">
          <div className="min-w-0">
            {title && (
              <h3 className="font-sans text-[15px] font-semibold text-neutral-900">{title}</h3>
            )}
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("flex-1 p-5", title && "pt-3", bodyClassName)}>{children}</div>
    </section>
  );
}
