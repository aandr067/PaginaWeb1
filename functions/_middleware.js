/**
 * Middleware global de Cloudflare Pages — se ejecuta para TODA petición,
 * incluidos los assets estáticos, y antes de servirlos.
 *
 * Existe porque `_redirects` en Cloudflare Pages solo admite códigos de
 * redirección reales (301/302/303/307/308): los códigos 200 (reescritura) y 404
 * (bloqueo) que usa Netlify no existen aquí y Cloudflare los ignora en
 * silencio. Se comprobó en producción tras el primer despliegue: tanto el
 * bloqueo de /portal-cliente/* y de los .md internos como la reescritura SPA de
 * /portal/* no hacían nada — los ficheros seguían sirviéndose tal cual y las
 * rutas profundas del portal devolvían 404 real en vez de la aplicación.
 */

// /landing/ es el código fuente del proyecto Next.js de la landing de gimnasios.
// Se versiona en el repositorio, pero el despliegue publica la raíz ("publish =
// ."), así que sin este bloqueo Cloudflare serviría los .tsx y el contenido de
// content/site.ts tal cual a cualquiera que pidiese la ruta. La landing se
// despliega por su cuenta (ver landing/README.md), no desde aquí.
const BLOQUEADOS_PREFIJO = ['/portal-cliente/', '/landing/'];
const BLOQUEADOS_EXACTOS = new Set([
  '/AUDITORIA.md',
  '/HALLAZGOS.md',
  '/INFORME-FINAL.md',
  '/MOTION.md',
  '/DESPLIEGUE.md',
]);

async function paginaNoEncontrada(env, url) {
  try {
    const r = await env.ASSETS.fetch(new URL('/404.html', url));
    if (r.ok) return new Response(r.body, { status: 404, headers: r.headers });
  } catch {
    /* sigue al respaldo de abajo */
  }
  // Respaldo si ASSETS.fetch fallara por cualquier motivo: nunca servir el
  // fichero real, aunque sea con una página de error minima.
  return new Response('404 — página no encontrada', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (
    BLOQUEADOS_EXACTOS.has(path) ||
    BLOQUEADOS_PREFIJO.some((p) => path.startsWith(p))
  ) {
    return paginaNoEncontrada(env, url);
  }

  // SPA del portal de cliente: los assets reales (JS/CSS con hash) se sirven
  // tal cual; cualquier otra ruta bajo /portal/ cae al index.html de la SPA
  // para que los enlaces profundos y las recargas funcionen con React Router.
  if (path.startsWith('/portal/') && path !== '/portal/' && path !== '/portal/index.html') {
    if (!path.startsWith('/portal/assets/')) {
      try {
        const r = await env.ASSETS.fetch(new URL('/portal/index.html', url));
        if (r.ok) return new Response(r.body, { status: 200, headers: r.headers });
      } catch {
        /* si falla, deja que next() lo intente por la vía normal */
      }
    }
  }

  return next();
}
