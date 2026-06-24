import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useFilters } from "@/state/store";

export type Row = Record<string, unknown>;
export interface Envelope<T = unknown> {
  available: boolean;
  data: T | null;
}

const TOKEN_KEY = "gymmkt_token";
const USER_KEY = "gymmkt_user";
// Base configurable para prod (mismo origen por defecto; dev usa el proxy de Vite).
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

/** Identidad del usuario autenticado (devuelta por /auth/login y /auth/me). */
export interface PortalUser {
  user_id: string;
  email: string;
  role: "owner_cliente" | "gestor_sede" | "admin_apf";
  tenant_id: string | null;
  site_ids: string[] | null;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export function storeUser(user: PortalUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getStoredUser(): PortalUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalUser;
  } catch {
    return null;
  }
}

/** Login del portal: email+contraseña → token JWT + identidad. */
export async function apiLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: PortalUser }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 401) throw new Error("Credenciales inválidas");
  if (res.status === 503) throw new Error("Autenticación no disponible (sin JWT_SECRET)");
  if (!res.ok) throw new Error("No se pudo iniciar sesión");
  return (await res.json()) as { token: string; user: PortalUser };
}

/** Fetch con envelope sobre una ruta absoluta de la API (incluye su prefijo). */
async function getEnvelope<T>(
  fullPath: string,
  params: Record<string, string | undefined>,
): Promise<Envelope<T>> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") qs.set(k, v);
  }
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${fullPath}?${qs.toString()}`, { headers });
  if (res.status === 401) throw new Error("unauthorized");
  // Cualquier otro fallo HTTP ⇒ "no disponible" (regla §6), no se rompe la UI.
  if (!res.ok) return { available: false, data: null };
  return (await res.json()) as Envelope<T>;
}

function getJson<T>(
  path: string,
  params: Record<string, string | undefined>,
): Promise<Envelope<T>> {
  return getEnvelope<T>(`/analytics${path}`, params);
}

/** Extrae un array de un payload por clave (vacío si no existe). */
export function rows(data: unknown, key: string): Row[] {
  if (!data || typeof data !== "object") return [];
  const v = (data as Record<string, unknown>)[key];
  return Array.isArray(v) ? (v as Row[]) : [];
}

/** Extrae un objeto anidado por clave. */
export function obj(data: unknown, key: string): Row {
  if (!data || typeof data !== "object") return {};
  const v = (data as Record<string, unknown>)[key];
  return v && typeof v === "object" ? (v as Row) : {};
}

export function useLocations(): UseQueryResult<Envelope<Row[]>> {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => getJson<Row[]>("/locations", {}),
    staleTime: 60_000,
  });
}

/** Hook genérico por sección: re-escopa por gimnasio + rango de fechas (estado global). */
export function useSection<T = Row>(path: string): UseQueryResult<Envelope<T>> {
  const { location, from, to } = useFilters();
  return useQuery({
    queryKey: [path, location, from, to],
    queryFn: () =>
      getJson<T>(path, {
        location: location ?? undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });
}

// --- Portada del portal (5.1 Resultados, 5.2 Multi-sede) ---
export interface PendingMetric {
  key: string;
  label: string;
  phase: string;
}
export interface ResultsData {
  scope: string;
  kpis: Record<string, number>;
  leads_timeseries: Row[];
  messages_timeseries: Row[];
  pending: PendingMetric[];
}
export interface SitesData {
  totals: Record<string, number>;
  comparison: Row[];
  rankings: Record<string, Row[]>;
}

/** 5.1 Resultados: KPIs de caja, escopados por sede + rango (estado global). */
export function useResults(): UseQueryResult<Envelope<ResultsData>> {
  const { location, from, to } = useFilters();
  return useQuery({
    queryKey: ["portal/results", location, from, to],
    queryFn: () =>
      getEnvelope<ResultsData>("/portal/results", {
        location: location ?? undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });
}

/** 5.2 Multi-sede: comparativa por sede + rankings (toda la cadena, por rango). */
export function useSites(): UseQueryResult<Envelope<SitesData>> {
  const { from, to } = useFilters();
  return useQuery({
    queryKey: ["portal/sites", from, to],
    queryFn: () =>
      getEnvelope<SitesData>("/portal/sites", {
        from: from || undefined,
        to: to || undefined,
      }),
  });
}

export interface VoiceData {
  kpis: Record<string, number>;
  by_motivo: Row[];
  recent: Row[];
}
/** 5.3 Agente de voz (Sara): KPIs, motivos y últimas llamadas, escopado por sede+rango. */
export function useVoice(): UseQueryResult<Envelope<VoiceData>> {
  const { location, from, to } = useFilters();
  return useQuery({
    queryKey: ["portal/voice", location, from, to],
    queryFn: () =>
      getEnvelope<VoiceData>("/portal/voice", {
        location: location ?? undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });
}

export interface DocumentItem {
  id: string;
  kind: string;
  title: string;
  uploaded_at: string | null;
  download_available: boolean;
}
/** 5.4 Documentación: metadatos de los documentos del tenant (descarga por permisos). */
export function useDocuments(): UseQueryResult<Envelope<{ documents: DocumentItem[] }>> {
  return useQuery({
    queryKey: ["portal/documents"],
    queryFn: () => getEnvelope<{ documents: DocumentItem[] }>("/portal/documents", {}),
    staleTime: 60_000,
  });
}

// --- Cuenta (5.5 Onboarding, 5.6 Soporte, 5.7 Facturación) ---
export interface OnboardingPhase {
  phase_key: string;
  title: string;
  status: "pendiente" | "activo" | "hecho" | "requiere_vbo";
  sort_order: number;
}
export function useOnboarding(): UseQueryResult<Envelope<{ phases: OnboardingPhase[] }>> {
  return useQuery({
    queryKey: ["portal/onboarding"],
    queryFn: () => getEnvelope<{ phases: OnboardingPhase[] }>("/portal/onboarding", {}),
    staleTime: 60_000,
  });
}

export interface InvoiceItem {
  id: string;
  period: string;
  amount: number;
  currency: string;
  plan: string | null;
  status: "pendiente" | "pagada" | "vencida";
  download_available: boolean;
}
export function useInvoices(): UseQueryResult<Envelope<{ invoices: InvoiceItem[] }>> {
  return useQuery({
    queryKey: ["portal/invoices"],
    queryFn: () => getEnvelope<{ invoices: InvoiceItem[] }>("/portal/invoices", {}),
    staleTime: 60_000,
  });
}

export interface TicketItem {
  id: string;
  subject: string;
  status: "abierto" | "en_curso" | "resuelto";
  created_at: string | null;
}
export function useTickets(): UseQueryResult<Envelope<{ tickets: TicketItem[] }>> {
  return useQuery({
    queryKey: ["portal/tickets"],
    queryFn: () => getEnvelope<{ tickets: TicketItem[] }>("/portal/support/tickets", {}),
  });
}

/** Crea un ticket de soporte (POST). Lanza si la API no responde 2xx. */
export async function apiCreateTicket(subject: string, body: string): Promise<void> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/portal/support/tickets`, {
    method: "POST",
    headers,
    body: JSON.stringify({ subject, body: body || null }),
  });
  if (!res.ok) throw new Error("No se pudo crear el ticket");
}
