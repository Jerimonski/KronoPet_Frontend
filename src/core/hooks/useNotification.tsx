import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { ApiError } from "../api/client";

type NotificationType = "success" | "error";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

interface NotificationContextValue {
  success: (message: string) => void;
  error: (error: unknown, fallback?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

let nextId = 1;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);

  const dismiss = (id: number) => setItems((list) => list.filter((n) => n.id !== id));

  const push = (type: NotificationType, message: string) => {
    const id = nextId++;
    setItems((list) => [...list, { id, type, message }]);
    setTimeout(() => dismiss(id), 4500);
  };

  const value: NotificationContextValue = {
    success: (message) => push("success", message),
    error: (err, fallback = "Ocurrió un error inesperado.") =>
      push("error", err instanceof ApiError ? err.message : fallback),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {items.map((n) => (
          <div
            key={n.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-in items-start gap-3 rounded-xl bg-white p-4 text-sm shadow-(--shadow-card) ring-1 ring-neutral-200 fade-in slide-in-from-bottom-2"
          >
            {n.type === "success" ? (
              <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            ) : (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            )}
            <p className="flex-1 text-neutral-700">{n.message}</p>
            <button
              type="button"
              onClick={() => dismiss(n.id)}
              className="text-neutral-400 transition hover:text-neutral-700"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification debe usarse dentro de <NotificationProvider>");
  return context;
}
