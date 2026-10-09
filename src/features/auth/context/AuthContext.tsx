import { createContext, useContext, useState, type ReactNode } from "react";
import { getStoredToken, TOKEN_STORAGE_KEY } from "../../../core/api/client";
import type { StaffUser } from "../../../core/types/models";
import { authService, decodeToken } from "../authService";

interface AuthContextValue {
  user: StaffUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): StaffUser | null {
  const token = getStoredToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
  return payload.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(readSession);

  const login = async (email: string, password: string) => {
    const { accessToken, user: loggedUser } = await authService.login(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setUser(loggedUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
