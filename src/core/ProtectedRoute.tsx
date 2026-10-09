import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../features/auth/context/AuthContext";

/** Protege el dashboard y sus subrutas: sin sesión, redirige al login. */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
