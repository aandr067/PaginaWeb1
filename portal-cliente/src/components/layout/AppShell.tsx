import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LogOut, Menu, Moon, Sun, X, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { FILTERABLE_PREFIXES, NAV_GROUPS } from "@/nav";
import { useAuth } from "@/state/auth";
import { GymSelector } from "./GymSelector";
import { DateRange } from "./DateRange";

const ROLE_LABEL: Record<string, string> = {
  owner_cliente: "Propietario",
  gestor_sede: "Gestor de sede",
  admin_apf: "Admin APF",
};

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(() => localStorage.getItem("gymmkt_theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("gymmkt_theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, () => setDark((v) => !v)];
}

/** ¿La ruta actual usa filtros de sede/fecha? (no en documentación, soporte, etc.) */
function isFilterable(path: string): boolean {
  if (path === "/") return true;
  return FILTERABLE_PREFIXES.some((p) => p !== "/" && path.startsWith(p));
}

export function AppShell() {
  const [dark, toggleDark] = useDarkMode();
  const [openNav, setOpenNav] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const showFilters = isFilterable(pathname);

  return (
    <div className="min-h-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 transform overflow-y-auto border-r border-border bg-surface transition-transform lg:translate-x-0",
          openNav ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Zap className="h-5 w-5 text-brand" />
            <span>APF · Portal</span>
          </div>
          <button
            type="button"
            className="text-muted lg:hidden"
            onClick={() => setOpenNav(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-3 p-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted/70">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    end={item.to === "/" || item.to === "/marketing"}
                    onClick={() => setOpenNav(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-brand/10 text-brand"
                          : "text-muted hover:bg-muted/10 hover:text-fg",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {openNav && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpenNav(false)} />
      )}

      {/* Contenido */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur">
          <button
            type="button"
            className="text-muted lg:hidden"
            onClick={() => setOpenNav(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          {showFilters && (
            <>
              <GymSelector />
              <div className="hidden md:block">
                <DateRange />
              </div>
            </>
          )}
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="hidden flex-col items-end leading-tight sm:flex">
                <span className="text-sm font-medium text-fg">{user.email}</span>
                <span className="text-xs text-muted">{ROLE_LABEL[user.role] ?? user.role}</span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleDark}
              title="Tema"
              className="rounded-lg p-2 text-muted hover:bg-muted/10 hover:text-fg"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Filtro de fechas en móvil */}
        {showFilters && (
          <div className="border-b border-border px-4 py-2 md:hidden">
            <DateRange />
          </div>
        )}

        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
