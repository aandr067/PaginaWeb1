# Portal de cliente — APF Technologys

Copia **autocontenida** del portal de cliente B2B (React + Vite + TypeScript +
Tailwind + TanStack Query + Zustand), preparada para **integrarse en tu web
principal bajo la ruta `/portal`** (`tudominio.com/portal`).

Es un SPA independiente: tiene su propio `package.json` y solo **lee** la API del
backend (`/auth`, `/portal`, `/analytics`). No incluye el backend; apunta a la API
ya desplegada de `gym-marketing-platform`.

> Esta carpeta es un export del front original (`dashboard-web`). Lo único que
> cambia respecto al original es la configuración de **base path `/portal`**.

---

## Qué contiene

```
portal-cliente/
  index.html            entrada del SPA
  package.json          dependencias y scripts (dev / build / typecheck)
  vite.config.ts        base /portal en build + proxy de dev (/auth /portal /analytics)
  tailwind.config.js    tema (design tokens)
  tsconfig.json
  .env.example          variables (copia a .env)
  src/
    App.tsx             router (basename = /portal) + rutas
    main.tsx
    auth/               login + guard de sesión (JWT)
    components/         layout (AppShell, selector de sede, rango fechas), UI, charts
    sections/portal/    secciones del cliente: Resultados, Multi-sede, Voz,
                        Documentos, Onboarding, Soporte, Facturación (5.1–5.7)
    sections/           marketing reutilizado (5.8): Overview, Captura, ... Global
    lib/                api.ts (fetch + hooks), formato, helpers
    state/              auth + filtros (Zustand)
    nav.ts              navegación
```

---

## Desarrollo local

```bash
# 1) Levanta el backend (desde la raíz de gym-marketing-platform):
uv run python -m uvicorn gymmkt.interfaces.api.main:app --port 8000

# 2) Este portal (en esta carpeta):
cp .env.example .env        # ajusta VITE_API_TARGET si el backend no está en :8000
npm install
npm run dev                 # http://localhost:5173  (proxy /auth /portal /analytics -> :8000)
```

En **dev** el portal vive en la raíz (`localhost:5173/`), no en `/portal`. El
prefijo `/portal` solo se aplica al **build de producción** (si no, el proxy de la
API `/portal/*` colisionaría con la propia raíz del SPA).

Login: usa un usuario creado con el seed del backend
(`python -m gymmkt.interfaces.portal_seed --email ... --password ...`).

---

## Build para producción (integrar en la web principal)

```bash
npm run build               # typecheck + genera dist/ con base /portal/
```

Esto produce `dist/` con todos los assets referenciados bajo `/portal/`. Para
integrarlo en tu web principal:

1. **Copia el contenido de `dist/` a la carpeta `/portal` de tu web** (donde tu
   servidor sirva los estáticos). Resultado: `tudominio.com/portal` carga el SPA.

2. **SPA fallback**: como es una app de una sola página con rutas de cliente
   (`/portal/sedes`, `/portal/facturacion`, ...), tu servidor debe servir
   `index.html` para cualquier ruta `/portal/*` que no sea un fichero. Ejemplos:

   - **Nginx**:
     ```nginx
     location /portal/ {
       try_files $uri $uri/ /portal/index.html;
     }
     ```
   - **Caddy**:
     ```
     handle_path /portal/* {
       root * /srv/portal
       try_files {path} /index.html
       file_server
     }
     ```

3. **Apunta la API con `VITE_API_BASE`** (en `.env`, antes del build). El backend
   expone sus endpoints bajo `/portal/*`, que **colisiona** con la ruta estática
   `/portal/` si comparten origen. Por eso la API debe vivir en otro origen
   (subdominio del backend o una ruta `/api` detrás del reverse proxy). Ej.:
   ```bash
   VITE_API_BASE=https://api.tudominio.com
   ```
   Recuerda añadir el origen de tu web a `DASHBOARD_CORS_ORIGINS` en el backend.

> Si más adelante prefieres servir el portal en un **subdominio**
> (`portal.tudominio.com`) en vez de subcarpeta, pon `VITE_BASE=/` antes del build
> y deja `VITE_API_BASE` vacío si la API comparte ese origen.

---

## Variables de entorno

| Variable | Cuándo | Para qué |
|----------|--------|----------|
| `VITE_API_TARGET` | dev | Destino del proxy de Vite (backend FastAPI). |
| `VITE_API_BASE` | prod (build) | Origen de la API. **Obligatorio en modo subcarpeta** (ver arriba). |
| `VITE_BASE` | prod (build) | Ruta base del SPA. Por defecto `/portal/`. |

---

## Scripts

- `npm run dev` — servidor de desarrollo (HMR).
- `npm run build` — typecheck (`tsc`) + build de producción en `dist/`.
- `npm run typecheck` — solo comprobación de tipos.
- `npm run preview` — sirve el `dist/` localmente para validar el build.
