import { api } from "../../core/api/endpoints";
import { useDb } from "../../core/mocks/mockDb";
import type { StaffUser } from "../../core/types/models";

export const authService = {
  login: api.auth.login,
};

export function useStaff(): StaffUser[] {
  return useDb().staff;
}

interface TokenPayload {
  sub: string;
  user: StaffUser;
  exp: number;
}

/** Decodifica el payload de un JWT sin verificar la firma (eso es del backend). */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(decodeURIComponent(escape(atob(part))));
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
