# INFORME FINAL — optimización integral de apftechnologys.com

Cierre del plan de siete fases. Rama `optimizacion/fase-7`, lista para merge.

- **Sitio:** 17 páginas públicas, HTML + CSS + JS vanilla, desplegado en Netlify
- **Periodo:** 9 de agosto de 2026
- **Punto de partida:** `e644d7e` · **Estado final:** rama `optimizacion/fase-7`
- **Documentos:** [AUDITORIA.md](AUDITORIA.md) · [HALLAZGOS.md](HALLAZGOS.md) · [MOTION.md](MOTION.md) · [DESPLIEGUE.md](DESPLIEGUE.md)

> ### ⚠️ Corrección posterior al cierre: el despliegue es Cloudflare
>
> Las fases 0 a 7 se hicieron asumiendo Netlify, porque `netlify.toml` era el
> único fichero de configuración del repositorio. **Cloudflare no lo lee**, así
> que ninguna de sus reglas ha estado activa en producción: ni las cabeceras de
> seguridad, ni la política de caché, ni el *rewrite* del portal de cliente.
>
> Y, sobre todo: el formulario usaba **Netlify Forms**, que en Cloudflare no
> existe. El `POST` a `/` devolvía 200 con el HTML de la portada, el front-end lo
> leía como éxito y **el visitante veía «hemos recibido tu solicitud» mientras el
> lead se perdía**. Reproducido en local.
>
> Todo ello está corregido en la Fase 8 (`_headers`, `_redirects` y una Pages
> Function para el formulario), pero **queda una acción tuya**: configurar
> `RESEND_API_KEY` en Cloudflare. Detalle en [DESPLIEGUE.md](DESPLIEGUE.md).

---

## 1. Resultado frente a los objetivos

Objetivos fijados en el plan: Performance ≥ 90 móvil y ≥ 95 escritorio, CLS < 0,1,
LCP < 2,5 s, INP < 200 ms.

| Página / perfil | Perf. | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Portada / móvil | **98** | **100** | 100 | 100 | 2170 ms | 0,0000 | 0 ms |
| Solución / móvil | **99** | **100** | 100 | 100 | 1805 ms | 0,0225 | 0 ms |
| Términos / móvil | **99** | **100** | 100 | 100 | 1799 ms | 0,0474 | 0 ms |
| 404 / móvil | **99** | **100** | 100 | 63¹ | 1861 ms | 0,0003 | 0 ms |
| Portada / escritorio | **100** | **100** | 100 | 100 | 575 ms | 0,0013 | 0 ms |
| Solución / escritorio | **100** | **100** | 100 | 100 | 456 ms | 0,0010 | 0 ms |
| Términos / escritorio | **100** | **100** | 100 | 100 | 456 ms | 0,0002 | 0 ms |
| 404 / escritorio | **100** | **100** | 100 | 63¹ | 442 ms | 0,0264 | 0 ms |

**Los cuatro objetivos se cumplen en las ocho combinaciones.**

¹ El 63 de SEO en el 404 es el comportamiento correcto: la página lleva
`noindex` a propósito y Lighthouse penaliza `is-crawlable` por ello. No es un
defecto.

**INP:** el TBT es 0 ms en las ocho medidas y no queda ninguna tarea larga
atribuible a un manejador de eventos. El INP real solo se puede medir con
usuarios; queda para la monitorización de campo (§5).

---

## 2. Evolución fase a fase

Medición propia con Playwright sobre Chromium 151 y servidor local que replica
cabeceras y Brotli de Netlify. Medianas de 5 a 7 ejecuciones con la máquina en
reposo. Móvil: 412×823, DPR 2,625, CPU ×4, 4G (1,6 Mbps / 150 ms RTT).

| Fase | FCP móvil | TBT móvil | FCP escritorio | LCP escritorio | CLS escritorio |
|---|---|---|---|---|---|
| Base | 1412 ms | 218 ms | 336 ms | 372 ms | 0,0203 |
| 1 — Quick wins | 1332 ms | 228 ms | 360 ms | 372 ms | 0,0012 |
| 2 — Cajas y cards | 1040 ms | 426 ms | 276 ms | 348 ms | 0,0012 |
| 3 — Carruseles | 1064 ms | 375 ms | 280 ms | 352 ms | 0,0012 |
| 4 — Movimiento | 1076 ms | 376 ms | 332 ms | 332 ms | 0,0014 |
| 5 — JavaScript | 1076 ms | 327 ms | 276 ms | 348 ms | 0,0012 |
| **7 — Final** | **1072 ms** | **316 ms** | **280 ms** | **284 ms** | **0,0012** |

**Lectura honesta de la tabla.** El FCP móvil baja un 24 % y el LCP de escritorio
un 24 %, pero la comparación con la línea base **no es del todo equiparable**: el
entorno de trabajo no alcanza `fonts.googleapis.com`, así que la medición inicial
nunca descargó las tipografías y no pagaba ni sus bytes ni el reflow de aplicarlas.
El estado final sí los paga, y aun así mejora. El detalle está en
[HALLAZGOS.md](HALLAZGOS.md) §A2.

El TBT móvil sube respecto a la base por la misma razón (aplicar una tipografía
web cuesta trabajo de hilo principal que antes no se contabilizaba); dentro de la
serie, baja de 426 ms en la Fase 2 a 316 ms al final.

---

## 3. Peso y arquitectura

| Concepto | Antes | Después |
|---|---|---|
| Imagen del héroe | 77,1 KB WebP única | 46,2 KB AVIF móvil · 32,8 KB escritorio |
| Logo del header | 11,0 KB PNG | 2,2 KB AVIF |
| og:image | 676 KB PNG vertical | 27 KB JPEG 1200×630 |
| JS de una subpágina | 10,0 KB | **7,3 KB** |
| JS de la portada | 10,0 KB | 11,2 KB (incluye lo de la Fase 2-4) |
| CSS | 51,5 KB sin comprimir | 47 KB (−4,5 KB de código muerto) |
| Orígenes de terceros | 2 (Google Fonts) | **0** |
| Peticiones bloqueantes de terceros | 1 hoja de estilos | **0** |

Peso total de la portada para un visitante nuevo: **172 KB**, con un presupuesto
fijado en 210 KB.

---

## 4. Qué se hizo en cada fase

**Fase 0 — Auditoría.** 140 hallazgos verificados con una segunda pasada
adversarial sobre el código, repartidos en 7 dimensiones, con métricas base y
tabla de priorización.

**Fase 1 — Quick wins.** Tipografías autoalojadas con caras de respaldo ajustadas
a las métricas reales de Arial; imágenes responsive AVIF/WebP en cuatro anchuras;
caché inmutable. Además se cerró la exposición pública del código fuente de
`portal-cliente/` (50 ficheros servidos por `publish = "."`), se sustituyó un
Gmail personal por el correo corporativo y se alineó una cifra comercial que el
HTML y el JavaScript contaban distinto.

**Fase 2 — Cajas y cards.** El hallazgo crítico: 16 de las 17 páginas se quedaban
sin ningún enlace de navegación por debajo de 1024 px. Se replicó el menú móvil
y se convirtió el drawer en un diálogo modal de verdad (foco, `inert`, Escape,
cierre al rotar). Escala de espaciado, estados de interacción recuperados,
`content-visibility` bajo el fold y rejillas sin huérfanos.

**Fase 3 — Carruseles.** Semántica y teclado en los cinco carruseles; el texto de
las tarjetas no activas pasó de 2,59:1 de contraste a legible; se eliminó el
*layout thrashing* del bucle de scroll; botón de pausa real en la marquesina
(WCAG 2.2.2) y corrección del salto de 9 px en cada vuelta.

**Fase 4 — Movimiento.** Cuatro duraciones y tres curvas sustituyen a ocho
duraciones sin criterio. Ninguna animación toca ya propiedades de layout o paint.
Red de seguridad global para `prefers-reduced-motion` y transiciones de página con
la View Transitions API.

**Fase 5 — JavaScript.** `main.js` dividido en `core.js` y `home.js`: las 16
páginas que no son la portada dejan de descargar el código de carruseles y
formulario. 4,5 KB de CSS muerto eliminados tras comprobarlo clase por clase.
Mensajes del formulario bilingües. Presupuesto de rendimiento que **falla el
despliegue** si el sitio engorda.

**Fase 6 — Accesibilidad y SEO.** De 93/94 a **100** en accesibilidad y **0
violaciones de axe-core** en 4 páginas × 2 temas. Contrastes corregidos en ambos
temas, encabezados coherentes, objetivos táctiles, enlaces distinguibles sin
depender del color. Sitemap regenerado, página huérfana enlazada, Open Graph
completo en las páginas legales y portal excluido de indexación.

**Fase 7 — QA.** Cross-browser real, 604 enlaces verificados, suite completa.

---

## 5. Verificación final

| Comprobación | Resultado |
|---|---|
| Lighthouse, 4 páginas × 2 perfiles | Objetivos cumplidos en las 8 |
| axe-core, 4 páginas × 2 temas | **0 violaciones** |
| Regresión funcional, 17 páginas a 390 px | **17/17** sin errores de consola, peticiones fallidas, imágenes rotas ni desbordamiento |
| Cross-browser Chromium / Firefox / WebKit | **9/9** combinaciones |
| Enlaces internos y anclas | 604 analizados, **0 rotos** |
| Suites por fase (2, 3, 4, 5) | 16/16 · 17/17 · 7/7 · 11/11 |
| JSON-LD | 31 nodos en 17 páginas, 0 bloques inválidos |
| Presupuesto de rendimiento | Respetado, y verificado que falla ante una regresión |

---

## 6. Monitorización continua recomendada

1. **Datos de campo (lo más importante).** Nada de lo medido aquí sustituye a
   usuarios reales. Activar CrUX vía Search Console y, si se quiere granularidad,
   un RUM ligero que envíe LCP, INP y CLS con `web-vitals`. Es además la única
   forma de cerrar las dos incógnitas abiertas: el efecto real de autoalojar las
   tipografías y cuál es el elemento LCP en móvil (HALLAZGOS §A2 y §A3).
2. **El presupuesto ya está automatizado.** `node scripts/perf-budget.mjs` corre
   en cada despliegue de Netlify y lo aborta si el sitio engorda. Revisar los
   límites cada trimestre.
3. **Lighthouse CI** contra la URL de previsualización de cada pull request, para
   detectar regresiones antes de producción.
4. **axe en el flujo de trabajo.** El sitio está hoy en 0 violaciones; mantenerlo
   exige comprobarlo, no confiar en que siga así.
5. **Recordatorio operativo:** cualquier cambio en `css/styles.css` o en `js/*`
   necesita subir el `?v=` de las 17 páginas. Mientras no se pase a nombres con
   hash, es el punto más fácil de olvidar (HALLAZGOS §C7).

---

## 7. Deuda pendiente

Detallada en [HALLAZGOS.md](HALLAZGOS.md). Lo que queda por decidir, por orden de
impacto:

1. **Arquitectura del bilingüe (§B1).** Hoy el HTML se sirve en español y
   JavaScript lo reescribe a inglés: Google indexa una cosa y el visitante lee
   otra, y ni el `<title>` ni la `meta description` se traducen. Es la mayor
   palanca de SEO que queda y requiere una decisión de negocio.
2. **`robotPerfecto.png`, 676 KB (§B2).** Ya solo sirve de respaldo para
   navegadores sin `<picture>`. Descartarlos libera 753 KB.
3. **Nombres con hash para CSS y JS (§C7).** Sustituirían el `?v=` manual en 51
   puntos de 17 ficheros.
4. **Hub `/soluciones/` (§C13).** Las 13 subpáginas no tienen página madre.
5. **CSP completa (§C6).** Hoy solo hay `frame-ancestors`.
