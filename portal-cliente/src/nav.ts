import {
  Activity,
  FileText,
  Globe,
  Instagram,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Receipt,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Telescope,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  /** Sección agregada cross-sede (no se re-escopa por sede). */
  global?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Navegación ÚNICA del portal (un solo producto). Agrupa las 7 secciones del
 * portal (5.1–5.7) y la sección de Marketing (5.8) que reutiliza el dashboard
 * existente — mismas rutas/datos, sin duplicar.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Resumen",
    items: [
      { id: "resultados", label: "Resultados", to: "/", icon: LayoutDashboard },
      { id: "sedes", label: "Multi-sede", to: "/sedes", icon: Store },
    ],
  },
  {
    title: "Servicios",
    items: [{ id: "voz", label: "Agente de voz (Sara)", to: "/voz", icon: Phone }],
  },
  {
    title: "Marketing",
    items: [
      { id: "mkt-overview", label: "Resumen marketing", to: "/marketing", icon: LayoutDashboard },
      { id: "capture", label: "Captura / Leads", to: "/marketing/captura", icon: UserPlus },
      { id: "profiling", label: "Perfilado", to: "/marketing/perfilado", icon: Users },
      { id: "scoring", label: "Scoring / IA", to: "/marketing/scoring", icon: Sparkles },
      { id: "email", label: "Email", to: "/marketing/email", icon: Mail },
      { id: "whatsapp", label: "WhatsApp", to: "/marketing/whatsapp", icon: MessageCircle },
      { id: "instagram", label: "Instagram", to: "/marketing/instagram", icon: Instagram },
      { id: "competitive", label: "Competencia", to: "/marketing/competencia", icon: Telescope },
      { id: "campaigns", label: "Campañas", to: "/marketing/campanas", icon: Megaphone },
      {
        id: "deliverability",
        label: "Entregabilidad",
        to: "/marketing/entregabilidad",
        icon: ShieldCheck,
      },
      { id: "operations", label: "Operación", to: "/marketing/operacion", icon: Activity },
      { id: "global", label: "Vista global", to: "/marketing/global", icon: Globe, global: true },
    ],
  },
  {
    title: "Cuenta",
    items: [
      { id: "documentos", label: "Documentación", to: "/documentos", icon: FileText },
      { id: "onboarding", label: "Onboarding", to: "/onboarding", icon: Rocket },
      { id: "soporte", label: "Soporte", to: "/soporte", icon: LifeBuoy },
      { id: "facturacion", label: "Facturación", to: "/facturacion", icon: Receipt },
    ],
  },
];

/** Rutas donde tiene sentido el filtro de sede + rango de fechas (datos analíticos). */
export const FILTERABLE_PREFIXES = ["/", "/sedes", "/voz", "/marketing"];
