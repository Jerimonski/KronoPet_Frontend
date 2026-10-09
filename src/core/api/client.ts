// Cliente HTTP. Mientras no exista backend, las peticiones se resuelven
// contra la base simulada (core/mocks) con una latencia artificial, pero
// conservan la forma de una llamada real: token JWT y errores con status.

import { getDb } from "../mocks/mockDb";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
export const API_PREFIX = "/api/v1";
export const TOKEN_STORAGE_KEY = "kronopet:token";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** `sub` del JWT (sin verificar firma; en el backend real lo valida el guard). */
export function tokenSubject(token: string): string | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part)).sub ?? null;
  } catch {
    return null;
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ejecuta un handler simulado como si fuera una petición HTTP.
 * Las rutas privadas exigen un token, igual que el interceptor JWT real.
 */
export async function mockRequest<T>(
  handler: () => T | Promise<T>,
  { auth = true, delay = 400 }: { auth?: boolean; delay?: number } = {},
): Promise<T> {
  await wait(delay);
  if (auth) {
    const token = getStoredToken();
    if (!token) throw new ApiError(401, "Tu sesión expiró. Vuelve a iniciar sesión.");
    const member = getDb().staff.find((s) => s.id === tokenSubject(token));
    if (member && !member.active) {
      throw new ApiError(403, "Tu cuenta fue deshabilitada. Contacta al administrador de la clínica.");
    }
  }
  return await handler();
}

/** Id del usuario autenticado (el backend lo obtiene del JWT para auditar). */
export function currentUserId(): string | null {
  const token = getStoredToken();
  return token ? tokenSubject(token) : null;
}
