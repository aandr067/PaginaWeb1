import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// El front consume la API read-only /analytics. En dev, proxyamos al backend
// FastAPI (puerto 8000) para evitar CORS y poder usar rutas relativas.
const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:8000";

// El portal se sirve como SUBCARPETA de la web principal: tudominio.com/portal.
// `base` hace que los assets del build de PRODUCCIÓN se referencien con ese
// prefijo. Configurable por si la ruta cambia (VITE_BASE).
const BASE = process.env.VITE_BASE ?? "/portal/";

// IMPORTANTE: solo aplicamos `base` en el build. En dev lo dejamos en "/" porque
// la API del backend usa el prefijo /portal/* y colisionaría con el base /portal
// del front (el proxy interceptaría la propia raíz de la SPA). En dev la app
// vive en localhost:5173/ y las llamadas a /portal/* se proxyan al backend.
export default defineConfig(({ command }) => ({
  base: command === "build" ? BASE : "/",
  // El build de producción se escribe directamente en ../portal (raíz de la web
  // principal) para que Netlify lo publique en /portal sin pasos manuales de copia.
  build: { outDir: path.resolve(__dirname, "..", "portal"), emptyOutDir: true },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    proxy: {
      // En dev, el front llama a /auth, /portal y /analytics; los proxyamos al
      // backend FastAPI para evitar CORS y usar rutas relativas.
      "/analytics": { target: API_TARGET, changeOrigin: true },
      "/portal": { target: API_TARGET, changeOrigin: true },
      "/auth": { target: API_TARGET, changeOrigin: true },
    },
  },
}));
