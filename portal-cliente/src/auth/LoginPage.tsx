import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn, Zap } from "lucide-react";
import { useAuth } from "@/state/auth";

export function LoginPage() {
  const { user, login, status, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await login(email.trim(), password);
    if (ok) navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold">
          <Zap className="h-6 w-6 text-brand" />
          <span>APF · Portal de cliente</span>
        </div>
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="tucorreo@cadena.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {status === "loading" ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted">
          Acceso exclusivo para clientes de APF Technologys.
        </p>
      </div>
    </div>
  );
}
