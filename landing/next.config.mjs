import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

/**
 * `turbopack.root` fija la raíz del proyecto a esta carpeta. Sin esto, Turbopack
 * sube por el árbol buscando un lockfile y encuentra el de C:\Users\Asus, fuera
 * del repositorio: el build seguía funcionando, pero resolvía módulos desde un
 * sitio que no controlamos.
 */
const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
