import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/state/auth";

/** Guard de rutas: sin sesión → redirige al login. El aislamiento real lo aplica el backend. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
