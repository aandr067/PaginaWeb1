# HALLAZGOS — cuestiones abiertas y deuda pendiente

Registro vivo de lo que aparece fuera del alcance de la fase en curso, de lo que no se
ha podido verificar en este entorno y de las decisiones que quedan pendientes del
cliente. Cada entrada indica quién debe resolverla.

---

## A. Cosas que este entorno NO puede verificar

### A1. Producción es inalcanzable · requiere validación tras el despliegue

El entorno de ejecución no tiene salida hacia `apftech.es` (ni hacia
`fonts.googleapis.com`), aunque sí alcanza el registro de npm. Consecuencias:

- No hay TTFB real de Netlify. Las cabeceras se han inferido de `netlify.toml` y se han
  replicado en un servidor local para que las mediciones sean representativas.
- No se ha podido comprobar en vivo que Netlify aplique Brotli, ni que el `404.html`
  devuelva realmente un código 404.

**Qué hacer:** tras desplegar, ejecutar Lighthouse contra la URL pública y comprobar con
`curl -I` que las cabeceras de caché y compresión coinciden con lo esperado.

### A2. El efecto neto de autoalojar las fuentes en móvil no está demostrado

Es la salvedad más importante de la Fase 1. La línea base **nunca llegó a descargar las
fuentes de Google**, porque ese origen no es alcanzable desde aquí. Por tanto el "antes"
no pagaba ni los bytes ni el reflow de aplicar una tipografía web, y cualquier
comparación directa de FCP/LCP en móvil le favorece artificialmente.

Lo que sí está medido y es sólido:

| Configuración | FCP móvil | TBT móvil |
|---|---|---|
| Sin ninguna tipografía web | 1004 ms | 121 ms |
| Autoalojada, `swap`, sin preload | 1332 ms | 228 ms |
| Autoalojada, `swap`, con preload de fuente | 1468 ms | 795 ms |
| Autoalojada, `optional` | 1384 ms | 641 ms |
| Original, con Google Fonts inalcanzable | 2612 ms | 102 ms |

Conclusiones defendibles: el preload de la fuente es contraproducente (ya eliminado);
`swap` es mejor que `optional` aquí; y el autoalojamiento elimina el modo de fallo en el
que un tercero lento o caído dispara el FCP a 2,6 s.

**Qué hacer:** validar con datos de campo (CrUX o RUM) 28 días después del despliegue.
Si el LCP móvil real empeorase, la palanca más directa es reducir a una sola familia
tipográfica — cambio visual que requiere aprobación.

### A3. El elemento LCP en móvil no es concluyente

Bajo emulación móvil, Chrome informa como elemento LCP del texto de marca del header
(`span.brand__name`, 726 px²) y **nunca** registra la imagen del héroe como candidata,
pese a estar completamente dentro del viewport, con opacidad 1 y cargada. En escritorio
sí registra la imagen. Se descartaron por medición: DPR, la animación `robotFloat`, el
ancho del viewport y el límite de CPU. El único factor que cambia el resultado es el
propio modo de emulación móvil, lo que apunta a un artefacto de medición.

Lighthouse, por su parte, da LCP móvil de 1926 ms (muy por encima del FCP de 1443 ms) y
su diagnóstico de entrega de imágenes señala precisamente el héroe.

**Qué hacer:** resolver con datos de campo. La recomendación aplicada (servir variantes
responsive y mantener el preload alineado con el `srcset`) es correcta en ambos casos.

---

## A4. El despliegue es Cloudflare, no Netlify · corregido en la Fase 8

Toda la auditoría y las fases 1 a 7 se hicieron asumiendo Netlify, porque
`netlify.toml` era el único fichero de configuración del repositorio y
`origin/main` no contiene ninguno de Cloudflare. Existe una rama abandonada,
`cloudflare/workers-autoconfig` (junio, basada en `8342525`), con un
`wrangler.jsonc` que nunca se fusionó.

**Cloudflare no lee `netlify.toml`.** Consecuencia: nada de lo que había allí ha
estado activo en producción desde la migración, ni antes de esta intervención:

- Las cabeceras de seguridad completas (`X-Frame-Options`, HSTS,
  `Referrer-Policy`, `Permissions-Policy`, CSP `frame-ancestors`).
- Toda la política de caché.
- El *rewrite* `/portal/* → /portal/index.html`, del que dependen los enlaces
  profundos y las recargas del portal de cliente.

Resuelto portando todo a `_headers` y `_redirects`, que Cloudflare sí lee (tanto
en Pages como en Workers Assets), verificado con 15/15 comprobaciones contra un
servidor local que parsea ambos ficheros igual que Cloudflare. Detalle operativo
en [DESPLIEGUE.md](DESPLIEGUE.md).

### A5. El formulario de contacto perdía todos los leads en silencio

El más grave de toda la intervención. El formulario usaba **Netlify Forms**
(`data-netlify="true"` y `POST` a `/`), que en Cloudflare no existe. Reproducido
en local: el host estático responde al `POST` con **200 y el HTML de la portada**,
`res.ok` es `true`, el front-end ejecutaba la rama de éxito y el visitante leía
*«¡Gracias! Hemos recibido tu solicitud»*. El lead no llegaba a ninguna parte.

Corregido: el envío va a `/api/contacto`, una Pages Function que responde siempre
JSON `{ ok: boolean }`, y el front-end solo canta éxito con `ok === true`.
Verificados los tres escenarios: función ausente → error honesto; función sin
secreto → error honesto; función respondiendo `ok:true` → éxito y reseteo.

**Requiere acción tuya:** configurar `RESEND_API_KEY` en el panel de Cloudflare
(§2 de DESPLIEGUE.md). Hasta entonces el formulario avisa de que escriban por
correo, en vez de tragarse la solicitud.

**Conviene confirmar** si el proyecto es Cloudflare *Pages* o *Workers*: la
carpeta `functions/` solo se ejecuta en Pages.

---

## A6. El dominio real es apftech.es, no apftechnologys.com · corregido

Todo el trabajo de las fases 0 a 8 asumió `apftechnologys.com` como dominio, porque
era el único que aparecía en el código (canonical, JSON-LD, sitemap, robots.txt,
llms.txt, Open Graph, el correo de contacto). El usuario corrigió esto tras el
despliegue: **el dominio real y en producción es `apftech.es`**.

Verificado con DNS directo desde este entorno: `apftech.es` resuelve a una IP de
Cloudflare y sirve el sitio (confirmado con el HTML en vivo, que ya reflejaba el
despliegue de la Fase 8). `apftechnologys.com` **no resuelve en absoluto** — ni el
dominio raíz ni el subdominio `api.`. No es una restricción de este entorno de
ejecución: el mismo método alcanzó `apftech.es` sin problema.

Corregidas 159 URLs (canonical, og:url, og:image, twitter:image, JSON-LD @id/
url/image/logo, sitemap.xml, robots.txt, llms.txt) y 49 direcciones de correo
(`apf@`/`web@apftechnologys.com` → `@apftech.es`) en 17 páginas, `sitemap.xml`,
`robots.txt`, `llms.txt`, `functions/api/contacto.js` y `js/home.js`, tras
confirmar con el usuario que el correo también debía migrar. Verificado: 0
referencias al dominio viejo en todo el árbol versionado fuera de
`portal-cliente/` y `portal/` (ver A7), JSON-LD sigue válido (31 nodos, 0
inválidos), sitemap con 16 URLs todas en `apftech.es`.

### A7. El backend del portal de cliente apunta al mismo dominio muerto · sin tocar

`portal/assets/index-DHBGr6co.js` (el bundle ya compilado del portal de cliente)
tiene grabada `const API_BASE = "https://api.apftechnologys.com"`. Ese subdominio
tampoco resuelve por DNS — el mismo problema que el dominio principal, pero en un
sistema aparte.

**No se ha tocado.** El bundle es un artefacto de compilación de
`portal-cliente/src/lib/api.ts` (que en realidad usa
`import.meta.env.VITE_API_BASE`, fijado en tiempo de build); cambiar la cadena a
mano en el bundle minificado sin saber cuál es el dominio real del backend
arriesgaba a "arreglarlo" hacia otro sitio igualmente inexistente. Esto es
además un sistema distinto —la API de autenticación y analítica del portal— y
queda fuera del alcance de la optimización del sitio de marketing.

**Qué hacer:** confirmar cuál es el dominio real del backend (¿`api.apftech.es`?
¿otro proveedor?), fijar `VITE_API_BASE` en el entorno de build de
`portal-cliente/` y recompilar (`portal-build-deploy`, según memoria del
proyecto). Mientras tanto, el login y la carga de datos del portal de cliente
probablemente fallan en producción, igual que fallaba el sitio principal antes
de esta corrección.

---

## B. Decisiones pendientes del cliente

### B1. Arquitectura del bilingüe · bloquea buena parte del SEO

Hoy el HTML se sirve en español con `lang="es"` y `js/i18n.js:277` conmuta a inglés por
defecto en cuanto se ejecuta. El rastreador indexa español, el visitante lee inglés, y
`<title>` y `meta description` no se traducen nunca. No hay URLs por idioma ni
`hreflang`. Además obliga a reescribir 239 nodos de texto tras el primer pintado.

Opciones, de menor a mayor coste:

1. **Volver al español por defecto.** Coste nulo, recupera la coherencia y elimina el
   reescribido para la mayoría. Contradice la decisión tomada en el commit `e644d7e`.
2. **URLs por idioma** (`/` inglés y `/es/` español) con `hreflang` recíproco y
   `<title>`/`description` propios. Es la solución correcta para SEO; duplica las 17
   páginas y exige un generador o plantillas.
3. **Dejarlo como está** y asumir que el sitio solo posiciona en español mientras la
   mayoría de visitantes lo lee en inglés.

**No se ha tocado**: cambia el contenido y la estrategia de posicionamiento.

### B2. `robotPerfecto.png` (676 KB) sigue en el repositorio

Tras la Fase 1 ya no lo usa ninguna página salvo como `src` de respaldo del `<picture>`,
que solo alcanzan navegadores sin `<picture>` ni AVIF/WebP (esencialmente IE11).
`robotPerfecto.webp` (77 KB) ha quedado **sin ninguna referencia**.

**Qué hacer:** si se descarta el soporte de navegadores legados, borrar ambos y apuntar
el `src` a `img/robot-736.webp`. Ahorra 753 KB de repositorio y de despliegue.

### B3. El borde azul en todas las cajas fue una decisión de diseño

`css/styles.css:1119-1123` pinta el borde de acento en todas las cajas. Fue deliberado
(commit `b99c8b0`, "cajas con borde azul"), pero tiene tres efectos colaterales
verificados: anula casi todos los `:hover { border-color }`, deja el plan destacado sin
diferenciador, y hace que abrir un ítem del FAQ **baje** el contraste de su borde.

**Propuesta para la Fase 3:** conservar el borde azul en reposo e introducir un segundo
token para el estado de interacción, de modo que hover y foco vuelvan a notarse sin
perder la identidad actual.

---

## C. Deuda técnica anotada, fuera del alcance de la fase actual

| Id | Asunto | Dónde | Estado |
|---|---|---|---|
| C1 | `portal-cliente/`: 50 ficheros de código fuente publicados en producción | `netlify.toml` | ✅ Fase 1 — devuelve 404 |
| C2 | `panel-apf/` sin ignorar; entraría al despliegue en el próximo `git add` | `.gitignore` | ✅ Fase 1 |
| C3 | Gmail personal en el mensaje de error del formulario | `js/home.js` | ✅ Fase 1 |
| C4 | El contador anuncia +300 % mientras el HTML servido dice +200 % | `index.html` | ✅ Fase 1 |
| C5 | 16 páginas sin navegación móvil | 17 páginas | ✅ Fase 2 |
| C6 | Sin CSP más allá de `frame-ancestors` | `netlify.toml` | ⬜ Pendiente |
| C7 | Cache-busting manual `?v=` en 51 puntos de 17 ficheros | todas las páginas | ⬜ Pendiente |
| C8 | Sin presupuesto de rendimiento verificado en el despliegue | `scripts/perf-budget.mjs` | ✅ Fase 5 — falla el deploy |
| C9 | `.gitignore` se sirve públicamente | raíz | ⬜ Pendiente (menor) |
| C10 | El portal es indexable por el catch-all 200 de `/portal/*` | `netlify.toml` | ✅ Fase 6 — `X-Robots-Tag` |
| C11 | `sitemap.xml` con `lastmod` de junio pese a cambios de agosto | `sitemap.xml` | ✅ Fase 6 |
| C12 | Página huérfana: `aplicaciones-medida.html` sin enlaces entrantes | `soluciones/` | ✅ Fase 6 — la enlazan 16 páginas |
| C13 | No existe un hub `/soluciones/` que agrupe las 13 subpáginas | — | ⬜ Pendiente |
| C14 | Estilos legales duplicados en dos `<style>` inline idénticos (66 líneas) | `terminos.html`, `politica-privacidad.html` | ⬜ Pendiente (menor) |

### Falsos positivos de la auditoría, descartados por medición

- **`lg-frost` inexistente en 16 páginas.** Medido en el navegador: los 27
  elementos que usan el filtro SVG están todos en la portada y ninguna subpágina
  llega a resolver `var(--lg-blur)`. No había ningún fallo que corregir.
- **Higiene del repositorio.** El `.gitignore` ya excluía correctamente
  `lighthouse/`, `three.js-dev/`, `tailwindcss/`, `_deploy/`, `apf-web.zip` y los
  toolkits de SEO. Lo único que sí se publicaba era `portal-cliente/` (C1).

---

## D. Notas de operación

- **Finales de línea.** Un ciclo `git stash`/`pop` durante las mediciones convirtió el
  árbol de trabajo a CRLF. El índice sigue en LF (`git ls-files --eol` lo confirma), así
  que los commits no se ven afectados y el sitio tampoco.
- **Artefactos de auditoría fuera del repositorio.** Capturas, informes de Lighthouse y
  mediciones en crudo se han dejado en el directorio de trabajo de la sesión y no se han
  copiado a la raíz, precisamente porque `publish = "."` los haría públicos.
- **Verificación de los hallazgos.** Los 140 hallazgos pasaron una segunda revisión
  adversarial contra el código. Los cinco más graves los he comprobado además a mano.
  Ninguno fue refutado en esa segunda pasada, lo cual es un resultado inusualmente
  limpio: conviene tratar los de severidad baja con algo más de escepticismo.
