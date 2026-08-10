# AUDITORÍA — apftech.es

> **Fase 0 del plan de optimización integral.** Documento de solo lectura: describe el
> estado del sitio **antes** de cualquier cambio. Las correcciones ya aplicadas en la
> Fase 1 se marcan con ✅ en las tablas.

- **Sitio:** https://apftech.es — repositorio local `APFCLAUDE`, rama `optimizacion/fase-1`
- **Stack:** HTML + CSS + JavaScript vanilla, sin build ni dependencias de runtime
- **Hosting:** Netlify (`publish = "."`, sin comando de build)
- **Superficie pública:** 17 páginas (home, 13 soluciones, términos, privacidad, 404)
- **Idioma:** HTML servido en español (`lang="es"`); JavaScript conmuta a inglés por defecto
- **Fecha de la auditoría:** 9 de agosto de 2026

---

## 1. Metodología y sus límites

Todo se ha medido en local contra un servidor que **replica las cabeceras de
`netlify.toml` y comprime con Brotli de nivel 11**, para que los tamaños de
transferencia se aproximen a producción. Herramientas: Lighthouse 13.4.0 y un arnés
propio con Playwright sobre Chromium 151 (`PerformanceObserver` para LCP/CLS/tareas
largas, `page.coverage` para CSS/JS sin usar, CDP para limitar red y CPU).

**Perfiles.** Móvil: 412×823, DPR 2,625, CPU ×4, 4G (1,6 Mbps / 150 ms RTT).
Escritorio: 1350×940, DPR 1, sin límite de CPU, 10 Mbps / 40 ms RTT.

### Cuatro límites que condicionan la lectura de las cifras

1. **Producción no es alcanzable desde este entorno.** El proxy permite el registro de
   npm pero no `apftech.es`. No hay, por tanto, TTFB real de Netlify ni
   verificación de sus cabeceras en vivo: se han inferido de `netlify.toml`.
2. **`fonts.googleapis.com` tampoco es alcanzable.** La línea base nunca llegó a
   descargar las fuentes de Google. Cualquier comparación de FCP/LCP entre el antes y
   el después está sesgada a favor del antes, porque el antes no pagaba los bytes ni el
   reflow de aplicar una tipografía web. Esto se detalla en `HALLAZGOS.md`.
3. **La varianza es alta con CPU ×4.** Las primeras mediciones se tomaron mientras 14
   subagentes ocupaban la máquina y daban cifras hasta un 40 % peores. Todas las cifras
   de este documento son **medianas de 5 a 9 ejecuciones con la máquina en reposo**.
4. **`route.fulfill()` de Playwright no respeta el limitador de red.** Una primera
   comparativa quedó invalidada por esto; se rehízo bloqueando a nivel de CDP, sin
   interceptación, que sí respeta el throttling.

---

## 2. Métricas base (antes de cualquier cambio)

### Lighthouse 13.4.0

| Página | Perfil | Perf. | A11y | BP | SEO | LCP | FCP | CLS | TBT | Peso |
|---|---|---|---|---|---|---|---|---|---|---|
| Home | Móvil | **99** | 94 | 100 | 100 | 1926 ms | 1443 ms | 0 | 0 ms | 118 KB |
| Home | Escritorio | **100** | 94 | 100 | 100 | 549 ms | 444 ms | 0,0205 | 0 ms | 118 KB |
| Solución | Móvil | **100** | 93 | 100 | 100 | 1506 ms | 1432 ms | 0 | 0 ms | 38 KB |
| Solución | Escritorio | **100** | 93 | 100 | 100 | 490 ms | 447 ms | 0,0009 | 0 ms | 38 KB |

El rendimiento de partida ya era **excelente**: el sitio es estático, ligero y sin
terceros más allá de las fuentes. El margen de mejora real no estaba en la puntuación
de Lighthouse sino en accesibilidad, arquitectura de CSS/JS, SEO del bilingüe y
robustez de los componentes.

### Peso y peticiones (home, medición propia)

| Concepto | Valor |
|---|---|
| Peticiones | 7 subrecursos + documento |
| Transferencia total | ~118 KB |
| HTML (brotli) | 7,9 KB (48,4 KB sin comprimir) |
| CSS (brotli) | 9,8 KB (51,5 KB sin comprimir) |
| JS (brotli) | 9,4 KB (30,4 KB sin comprimir) |
| Imagen del héroe | 77,1 KB WebP |
| Logo | 11,0 KB PNG |
| Fuentes | Google Fonts, origen externo, hoja **render-blocking** |

Las 17 páginas suman 418 KB sin comprimir / 87 KB con Brotli.

### Cobertura de código

| Recurso | Total | Usado en la home | Sin usar |
|---|---|---|---|
| `css/styles.css` | 51,5 KB | 26,8 KB (52 %) | **24,8 KB** |
| `css/styles.css` (subpágina) | 51,5 KB | 18,0 KB (35 %) | **33,5 KB** |
| `css/styles.css` (legales) | 51,5 KB | 9,6 KB (19 %) | **42,0 KB** |

### Hallazgos de medición que no salen en Lighthouse

- **Los dos scripts diferidos añaden ~300 ms al FCP en móvil.** Aislado por bloqueo
  selectivo: sin ellos FCP 652 ms y cero tareas largas; con ambos, FCP 952 ms y una
  única tarea larga de 301 ms (TBT 251 ms). Cada script aporta ~100 ms por separado.
- **`i18n.js` reescribe 239 nodos de texto (6.868 caracteres) de la home** después del
  primer pintado, porque el HTML se sirve en español y el idioma por defecto es inglés.
  En una subpágina son 124 nodos y 4.858 caracteres.
- **El generador del mapa de refracción no era el culpable.** Se sospechó del bucle de
  102.400 iteraciones de `js/main.js:275-329`; medido en aislamiento cuesta 25 ms con
  CPU ×4 (16 ms de bucle + 10 ms de `toDataURL`). Hipótesis descartada.
- **La descodificación de imágenes no es un cuello de botella:** de 12 a 31 ms por
  variante con CPU ×4, tanto en AVIF como en WebP.
- **Coste del origen externo de fuentes:** la hoja de Google Fonts es render-blocking y
  añade 330–350 ms en móvil 4G. Con ese origen inalcanzable, el FCP del código original
  se dispara a 2612 ms: un fallo del tercero degradaba gravemente el sitio.

---

## 3. Resumen de hallazgos

**140 hallazgos** verificados con una segunda pasada adversarial sobre el código,
repartidos en 7 dimensiones.

| Severidad | Nº |
|---|---|
| 🔴 Crítica | 11 |
| 🟠 Alta | 45 |
| 🟡 Media | 59 |
| ⚪ Baja | 25 |
| **Total** | **140** |

De ellos, **18 ya están corregidos** en la Fase 1 (commit `9e003dd`).

### Los cinco problemas más graves

1. **16 de las 17 páginas se quedan sin navegación por debajo de 1024 px.**
   `css/styles.css:862-867` oculta `.nav__links`, pero solo `index.html` incorpora el
   botón hamburguesa y el drawer. En el resto, el usuario móvil no tiene ningún enlace
   de navegación. Verificado página a página.
2. **El sitio se sirve en español y JavaScript lo reescribe entero a inglés.** El
   rastreador indexa español, el visitante lee inglés, y el `<title>` y la
   `meta description` nunca se traducen. Sin URLs por idioma ni `hreflang`.
3. **Código fuente del portal de cliente publicado en producción.** `publish = "."` y 50
   ficheros de `portal-cliente/` versionados: se sirven `src/lib/api.ts`,
   `.env.example`, `vite.config.ts` y el modelo de roles completo. Sin credenciales,
   pero expone la arquitectura interna de una empresa que vende ciberseguridad.
4. **Dirección de Gmail personal en el mensaje de error del formulario**
   (`js/main.js:176`), en el punto exacto de conversión del sitio.
5. **El token `--ink-3` incumple WCAG AA en los dos temas** (4,44:1 en oscuro, 3,94:1 en
   claro), afectando al pie de página de las 17 páginas.

---

## 4. Hallazgos por dimensión

### Componentes de UI (cajas/tarjetas, carruseles, drawer, acordeones, estados, formularios, CLS)

| Sev. | Esf. | Fase | Hallazgo | Ubicación |
|---|---|---|---|---|
| 🔴 Crítica | medio | F1 | **Las 16 páginas que no son la home se quedan sin navegación ni CTA por debajo de 1024px**<br><sub>Extraer el bloque `nav__toggle` + `.drawer` + `.drawer__scrim` de index.html:303-323 y replicarlo en las 16 páginas restantes con rutas relativas (`..</sub> | `css/styles.css:862-867; soluciones/asistente-llamadas-ia.html:92-106` |
| 🟠 Alta | alto | F5 | **El idioma por defecto es inglés pero el HTML se sirve en español: cada carga repinta todo el texto**<br><sub>Decidir el idioma antes del pintado: mover la lectura de `localStorage` al script inline del <head> (junto al de tema) y aplicar `hidden`/`visibility`</sub> | `js/i18n.js:274-278,300-317; index.html:2,339-344` |
| 🟠 Alta | bajo | F1 | **Reabrir el drawer antes de 320 ms lo deja oculto con aria-expanded="true"**<br><sub>Guardar el id del temporizador en una variable del closure y hacer `clearTimeout(hideTimer)` al principio de `setMenu`, o sustituir el `setTimeout` po</sub> | `js/main.js:51` |
| 🟠 Alta | bajo | F2 | **Las tarjetas no centradas del carrusel se renderizan al 55 % de opacidad y pierden contraste legible**<br><sub>Subir el suelo de opacidad a 0.8 tanto en CSS (líneas 908 y 915) como en el cálculo de main.js:222 (`1 - min(mag,1) * 0.2`), y forzar `opacity: 1` en </sub> | `css/styles.css:908,915; js/main.js:222` |
| 🟠 Alta | bajo | F2 | **El marquee de integraciones se mueve indefinidamente y sólo se puede pausar con el ratón**<br><sub>Añadir `.marquee:focus-within .marquee__track { animation-play-state: paused; }` y un botón de pausa/reanudar con `aria-pressed` junto a `.logos__labe</sub> | `css/styles.css:595-599` |
| 🟠 Alta | bajo | F1 | **534 elementos .reveal quedan en opacity:0 si el JS falla o tarda**<br><sub>Añadir en el <head> de cada página `<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>`, o mejor: marcar `<html class="js">` desde </sub> | `css/styles.css:848-849; js/main.js:70-83` |
| 🟠 Alta | bajo | F3 | **La regla que pinta de azul el borde de todas las cajas deja fuera .risk, .quote y .chip y rompe hover y estado abierto**<br><sub>Sustituir la lista de selectores por un token: definir `--box-border: var(--accent)` y usarlo en cada familia; corregir css/styles.css:1033 a `border-</sub> | `css/styles.css:1119-1123, 1033, 1282` |
| 🟠 Alta | medio | F2 | **El drawer móvil no atrapa el foco, no lo devuelve al botón y no declara aria-controls**<br><sub>En `setMenu(open)`: guardar `document.activeElement` al abrir, mover el foco al primer enlace del drawer, capturar Tab/Shift+Tab dentro de `drawer.que</sub> | `js/main.js:41-67; index.html:303,311` |
| 🟠 Alta | medio | F2 | **El único control del carrusel es un div clicable marcado aria-hidden y no alcanzable por teclado**<br><sub>O bien retirarle el listener de clic y dejarla como indicador puramente decorativo, o bien convertirla en control real: `<button>` anterior/siguiente </sub> | `index.html:431,507,583,654,718; js/main.js:242-250` |
| 🟠 Alta | medio | F4 | **27 elementos de index.html aplican un backdrop-filter con filtro SVG de desplazamiento simultáneamente**<br><sub>Limitar `url(#lg-frost)` a los 2-3 elementos donde el efecto se aprecia (hero__lead y formulario) y usar `--lg-blur-soft` (blur puro) en el resto; y d</sub> | `css/styles.css:30,520-521,648-649,718-719,776-777,1091-1092; index.html:407-82` |
| 🟡 Media | bajo | F4 | **El mapa de refracción se calcula píxel a píxel en JS en cada carga de cada página**<br><sub>Precalcular el mapa una sola vez y guardarlo como fichero .png en el repositorio, referenciándolo directamente desde el `<feImage href>` de index.html</sub> | `js/main.js:275-329` |
| 🟡 Media | bajo | F4 | **will-change: transform, opacity se declara permanentemente en todas las tarjetas de carrusel**<br><sub>Aplicar `will-change` sólo mientras el track se está desplazando: añadir/quitar una clase `.is-scrolling` desde el listener de scroll de js/main.js:23</sub> | `css/styles.css:896-906` |
| 🟡 Media | bajo | F2 | **Las tarjetas de Beneficios no son focusables, así que en móvil sólo se llega a ellas arrastrando**<br><sub>Añadir `tabindex="0"` y `role="group"` al `.carousel__track` cuando el track sea desplazable, o —más simple y probablemente mejor producto— dejar los </sub> | `index.html:407,415,423; css/styles.css:877-899` |
| 🟡 Media | bajo | F3 | **.feature y .step son opacas mientras .outcome y .risk son de cristal, en la misma página**<br><sub>Unificar: o todas las cajas de subpágina en glass (`--lg-fill` + `--lg-blur-soft`) o todas en `--surface` opaco, y dar a `.step` el mismo hover de ele</sub> | `css/styles.css:1027-1032 y 1044-1047 frente a 1244-1248 y 1215-1221` |
| 🟡 Media | bajo | F3 | **El enlace 'Volver a soluciones' anima la propiedad gap en hover y dispara reflow**<br><sub>Dejar `gap` fijo en 8px y mover la flecha con `transform: translateX(4px)` sobre `.sub-back:hover svg`, exactamente el mismo patrón ya usado en css/st</sub> | `css/styles.css:996-1002` |
| 🟡 Media | bajo | F5 | **Todos los mensajes del formulario se inyectan en español y nunca se traducen al inglés**<br><sub>Exponer un helper `window.APF_T(texto)` desde i18n.js y usarlo en las 4 cadenas de main.js, añadiendo sus traducciones al diccionario; o guardar las v</sub> | `js/main.js:152,158,171,176; js/i18n.js:226-245` |
| 🟡 Media | bajo | F1 | **El fallback de error del formulario expone un Gmail personal en lugar del correo corporativo**<br><sub>Sustituir por `apf@apftech.es` en js/main.js:176.</sub> | `js/main.js:176` |
| 🟡 Media | bajo | F1 | **El contador anima hasta +300% sobre un texto que dice +200%, y al volver a español revierte**<br><sub>Decidir la cifra correcta y alinear `data-count` con el texto inicial (o poner el texto inicial en '+0%' si se quiere la animación completa), y exclui</sub> | `index.html:386; js/main.js:87-99` |
| 🟡 Media | bajo | F2 | **El botón del menú sigue anunciándose como 'Abrir menú' cuando está abierto**<br><sub>En `setMenu(open)` (js/main.js:48) añadir `toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú")` y, dado que i18n cachea etiquetas a</sub> | `index.html:303; js/main.js:48; js/i18n.js:26` |
| 🟡 Media | medio | F3 | **Los carruseles de 6 tarjetas ocultan el 83 % del contenido tras un gesto horizontal**<br><sub>Mantener el coverflow sólo en `#beneficios` y `#planes` (3 elementos, comparación lado a lado) y pasar `#servicios` y `#ciberseguridad` a rejilla vert</sub> | `index.html:445-508, 521-584; css/styles.css:896-899` |
| 🟡 Media | medio | F3 | **Cinco radios y ocho paddings distintos para el mismo rol de caja**<br><sub>Definir dos radios de caja (`--r-lg` para tarjeta de contenido, `--r` para ítem de lista) y dos escalas de padding (`--pad-card: 32px 30px`, `--pad-it</sub> | `css/styles.css:646,720,1030,1046,1093,1217,1245,1277,773` |
| 🟡 Media | medio | F5 | **El formulario sólo tiene un mensaje global de error; ningún campo marca su propio estado inválido**<br><sub>Añadir `.field input:user-invalid, .field select:user-invalid { border-color: #DC2626; box-shadow: 0 0 0 4px rgba(220,38,38,.14); }`, poner `aria-inva</sub> | `index.html:785-826; js/main.js:148-157; css/styles.css:809-820` |
| 🟡 Media | medio | F4 | **Siete secciones bajo el fold sin content-visibility, con una precaución concreta por el carrusel**<br><sub>Aplicar `content-visibility: auto; contain-intrinsic-size: auto 900px;` a `#ciberseguridad`, `#planes`, `#nosotros`, `#prueba` y `.footer` (dejar `#be</sub> | `index.html:397,437,513,589,727,765,832; soluciones/asistente-llamadas-ia.html:` |
| ⚪ Baja | bajo | F3 | **El bucle del marquee no es continuo: da un salto de 9 px cada 38 segundos**<br><sub>Envolver cada mitad en su propio contenedor flex y desplazar `calc(-50% - 9px)`, o eliminar el `gap` del track y pasar el espaciado a `margin-right` d</sub> | `css/styles.css:595-600; index.html:354-372` |
| ⚪ Baja | bajo | F2 | **El track del carrusel mantiene scroll-behavior: smooth incluso con prefers-reduced-motion**<br><sub>Añadir `.carousel__track { scroll-behavior: auto; }` dentro del bloque `@media (prefers-reduced-motion: reduce)` de css/styles.css:969.</sub> | `css/styles.css:885; css/styles.css:138,969-978` |
| ⚪ Baja | bajo | F3 | **El plan destacado vive con transform: scale(1.045), lo que desenfoca su texto**<br><sub>Sustituir el escalado por diferenciación no geométrica ya disponible: borde de acento (ya existe), gradiente de fondo (línea 1112) y un `.plan__badge`</sub> | `css/styles.css:1110-1117` |
| ⚪ Baja | bajo | F3 | **Las subpáginas nacen con la clase is-scrolled que el JS retira de inmediato**<br><sub>Quitar `is-scrolled` del markup de las 16 páginas, o hacer que `onScroll()` no retire la clase en páginas marcadas con un `data-nav="solid"` si el fon</sub> | `soluciones/asistente-llamadas-ia.html:80; js/main.js:29-34` |
| ⚪ Baja | bajo | F6 | **Unas 150 líneas de CSS de componentes inexistentes se descargan en las 17 páginas**<br><sub>Eliminar los bloques citados (o moverlos a un fichero `_parked.css` fuera del build si se piensan recuperar) y aprovechar para verificar `.quote` y `.</sub> | `css/styles.css:526-579, 837-845, 1125-1137, 1146-1158, 1261-1272` |

### Entrega e infraestructura (netlify.toml, robots.txt, .gitignore, carga de recursos en index.html)

| Sev. | Esf. | Fase | Hallazgo | Ubicación |
|---|---|---|---|---|
| 🔴 Crítica | bajo | F1 | **El codigo fuente completo del portal B2B autenticado se publica en produccion**<br><sub>Sacar portal-cliente/ del arbol publicado. Opcion mas limpia: `git rm -r --cached portal-cliente/` y anadir `portal-cliente/` al .gitignore raiz, movi</sub> | `netlify.toml:3 + portal-cliente/ (50 ficheros versionados)` |
| 🟠 Alta | bajo | F1 | **panel-apf/ no esta versionado pero tampoco ignorado: a un `git add -A` de publicarse**<br><sub>Anadir `panel-apf/` al bloque de .gitignore que ya existe para los toolkits (junto a claude-seo/ y geo-seo-claude/, cuyo comentario en .gitignore:24-2</sub> | `.gitignore:1-31 (ausencia) + git status` |
| 🟠 Alta | bajo | F1 | **Cinco de las siete reglas de caché usan patrones sin barra inicial, incoherentes con la sexta del mismo fichero**<br><sub>Verificar primero con `curl -sSI https://apftech.es/css/styles.css?v=20260809a \| grep -i cache-control` y comparar con `curl -sSI https://apft</sub> | `netlify.toml:37,42,47,53,59 frente a netlify.toml:26,31` |
| 🟠 Alta | medio | F2 | **max-age=604800 + must-revalidate: durante 7 dias el navegador no pregunta nada, y un despliegue sin subir el ?v= es invisible**<br><sub>Migrar a nombres con hash de contenido: css/styles.<hash>.css y js/main.<hash>.js, servidos con `public, max-age=31536000, immutable`, y HTML con `pub</sub> | `netlify.toml:52-61` |
| 🟠 Alta | medio | F2 | **El ?v= hay que subirlo a mano en 51 sitios repartidos por 17 paginas, y un olvido parcial deja el sitio en estado mixto**<br><sub>Resuelto de raiz por la migracion a nombres con hash del hallazgo anterior. Mientras tanto, y como red de seguridad barata que conviene mantener despu</sub> | `index.html:53,881,882 y las otras 16 paginas publicas` |
| 🟠 Alta | medio | F2 | **La CSP se limita a frame-ancestors y no aporta ninguna contencion frente a XSS**<br><sub>Sustituir netlify.toml:22 por una CSP completa ajustada a lo que el sitio usa de verdad: `default-src 'self'; script-src 'self' 'sha256-<hash del scri</sub> | `netlify.toml:22` |
| 🟡 Media | alto | F3 | **El HTML se sirve en espanol pero el idioma por defecto es ingles, y el cambio ocurre despues de pintar**<br><sub>Si el idioma por defecto es ingles, servir el HTML en ingles con `<html lang="en">` y dejar que el diccionario haga la traduccion inversa al espanol s</sub> | `index.html:2 y :881 frente a js/i18n.js:277 y :320` |
| 🟡 Media | bajo | F2 | **Un ano de immutable sobre robotPerfecto.png/.webp, que no llevan hash: cambiar el hero seria irreversible**<br><sub>Incluir el hero en el mismo esquema de hash de contenido que CSS y JS (robotPerfecto.<hash>.webp) y conservar entonces el immutable, que ahi si es cor</sub> | `netlify.toml:25-33` |
| 🟡 Media | bajo | F2 | **Los unicos ficheros del repo con nombre hasheado reciben caché de 7 dias en vez de immutable**<br><sub>Anadir una regla especifica antes de las genericas: `[[headers]]` con `for = "/portal/assets/*"` y `Cache-Control = "public, max-age=31536000, immutab</sub> | `netlify.toml:58-61 aplicandose a portal/assets/index-DHBGr6co.js` |
| 🟡 Media | medio | F3 | **Los dos preconnect son correctos y necesarios, pero la hoja de Google Fonts sigue bloqueando el render desde un tercer origen** ✅<br><sub>Autoalojar las fuentes: descargar los subconjuntos latin de Inter e Inter Tight en woff2, servirlos desde /fonts/ con `max-age=31536000, immutable`, d</sub> | `index.html:46-48` |
| 🟡 Media | medio | F5 | **No existe presupuesto de rendimiento ni verificacion automatica de la entrega**<br><sub>Fijar un presupuesto con margen realista sobre las cifras de hoy y verificarlo en CI. Tamanos de transferencia en la home: documento <= 12 KB (hoy 8,6</sub> | `netlify.toml:2-3 (no hay [build] command ni [[plugins]])` |
| ⚪ Baja | bajo | F1 | **El .gitignore se publica y enumera los artefactos internos del proyecto**<br><sub>Anadir una regla `[[redirects]]` con `from = "/.gitignore"`, `status = 404` y `force = true`, o mejor aun resolverlo de raiz con el cambio a un direct</sub> | `.gitignore:1-31 (versionado) + netlify.toml:3` |

### SEO técnico (metadatos, datos estructurados, encabezados, sitemap, enlazado interno, i18n, robots/llms, 404, imágenes sociales)

| Sev. | Esf. | Fase | Hallazgo | Ubicación |
|---|---|---|---|---|
| 🔴 Crítica | alto | F2 | **Bilingüe sobre una única URL: no existe versión inglesa indexable ni hreflang en ninguna página**<br><sub>Generar un árbol /en/ con las 16 páginas en inglés (HTML servido, no traducción JS) y enlazarlas con hreflang es-ES / en-US / x-default recíprocos, ca</sub> | `js/i18n.js:306-314 y verificación global (0 coincidencias de hreflang en las 1` |
| 🔴 Crítica | medio | F1 | **El sitio se sirve en español pero el JS lo convierte a inglés por defecto, también para Googlebot**<br><sub>Cambiar el fallback de initial() a "es" para que coincida con el HTML servido y con el canonical, y detectar el idioma real del navegador (navigator.l</sub> | `js/i18n.js:274-278 y js/i18n.js:262` |
| 🔴 Crítica | medio | F1 | **11 de 13 páginas de soluciones renderizan h1 en inglés con title y description en español**<br><sub>Mientras no haya URLs por idioma, excluir del diccionario las claves que coinciden con h1 de subpáginas, o traducir la página entera (title, descripti</sub> | `js/i18n.js:209 (única clave de title) y js/i18n.js:302-304` |
| 🔴 Crítica | medio | F1 | **El motor i18n no puede tocar meta description ni Open Graph: solo recorre document.body**<br><sub>Si se mantiene la traducción por JS a corto plazo, añadir un bloque que actualice document.querySelector('meta[name=description]').content y las og:*/</sub> | `js/i18n.js:227 y js/i18n.js:219` |
| 🟠 Alta | bajo | F1 | **Las 16 fechas lastmod del sitemap llevan 7 semanas de retraso sobre los cambios reales**<br><sub>Actualizar los 16 lastmod a 2026-08-09 y añadir un paso al flujo de despliegue que los regenere desde la fecha del último commit de cada fichero. Apro</sub> | `sitemap.xml:5, :11, :89` |
| 🟠 Alta | bajo | F5 | **El og:image de las 17 páginas es un PNG vertical de 736×1261 y 677 KB, inservible como tarjeta social** ✅<br><sub>Crear un og-card.jpg de 1200×630 con logo, claim y el robot recortado, por debajo de 200 KB, y declarar og:image, og:image:width=1200, og:image:height</sub> | `index.html:20 y soluciones/*.html:20` |
| 🟠 Alta | bajo | F4 | **soluciones/aplicaciones-medida.html no recibe ni un solo enlace interno del sitio**<br><sub>Añadir la tarjeta de "Aplicaciones a medida" a la rejilla de servicios de index.html (junto a las de las líneas 447-505) y a la columna Soluciones del</sub> | `soluciones/aplicaciones-medida.html:9 (única referencia, su propio canonical)` |
| 🟠 Alta | bajo | F1 | **/portal/ y /portal-cliente/ son indexables, comparten título y arrastran la marca antigua**<br><sub>Añadir Disallow: /portal/ y Disallow: /portal-cliente/ en robots.txt, insertar <meta name="robots" content="noindex, nofollow"> en portal/index.html, </sub> | `netlify.toml:8-11, index.html:301, portal/index.html:6` |
| 🟠 Alta | bajo | F4 | **205 enlaces internos apuntan a /index.html mientras el canonical de la home declara "/"**<br><sub>Sustituir en las 16 páginas ../index.html# e index.html# por /# (por ejemplo href="/#servicios"), de modo que enlaces y canonical coincidan. Es un bus</sub> | `index.html:11 frente a soluciones/asistente-llamadas-ia.html:82 (y 204 más)` |
| 🟠 Alta | medio | F2 | **BreadcrumbList y FAQPage quedan en español mientras el h1 visible se muestra en inglés**<br><sub>Servir el JSON-LD del idioma que se está renderizando (bloques separados por versión de URL), o congelar el idioma de la página al del HTML servido.</sub> | `soluciones/asistente-llamadas-ia.html:56 y :67 frente a :123` |
| 🟠 Alta | medio | F4 | **No existe /soluciones/ como página real: el nivel intermedio del breadcrumb es ficticio**<br><sub>Crear soluciones/index.html como hub con las 13 tarjetas, meta propios y schema CollectionPage/ItemList, apuntar el position 2 de los 13 breadcrumbs a</sub> | `soluciones/asistente-llamadas-ia.html:55 y ausencia de soluciones/index.html` |
| 🟠 Alta | medio | F3 | **Las 13 páginas de soluciones no declaran ningún nodo Service ni se vinculan a la Organization**<br><sub>Añadir en cada subpágina un nodo Service con @id propio (…/soluciones/x.html#service), name, description, serviceType, areaServed, provider: { "@id": </sub> | `soluciones/asistente-llamadas-ia.html:49-73 (los 2 únicos bloques JSON-LD)` |
| 🟡 Media | bajo | F5 | **terminos.html, politica-privacidad.html y 404.html no tienen ninguna etiqueta Open Graph ni Twitter**<br><sub>Copiar el bloque OG/Twitter de soluciones/*.html:14-24 a terminos.html y politica-privacidad.html ajustando title, description y og:url. En 404.html b</sub> | `terminos.html:6-10, politica-privacidad.html:6-10, 404.html:6-9` |
| 🟡 Media | bajo | F3 | **El logo de la Organization en el JSON-LD apunta al render del robot, no al logo de la marca** ✅<br><sub>Apuntar "logo" a un ImageObject con logo-apf.png (o una versión de al menos 112 px de lado), y dejar robotPerfecto.png solo en "image".</sub> | `index.html:71` |
| 🟡 Media | bajo | F3 | **Cuatro nodos describen la misma empresa y uno de ellos no tiene @id para poder unificarse**<br><sub>Dar @id al ProfessionalService y enlazarlo con parentOrganization/sameAs al #organization, o eliminarlo y trasladar su hasOfferCatalog al nodo Organiz</sub> | `index.html:106, index.html:220, index.html:239` |
| 🟡 Media | bajo | F3 | **El OfferCatalog de la home omite GPTs personalizados y ningún Service tiene url**<br><sub>Añadir la Offer de GPTs personalizados y dar a los 13 Service un campo "url" con el canonical de su página y un "@id" coherente.</sub> | `index.html:128-217` |
| 🟡 Media | bajo | F3 | **El mismo servicio aparece con hasta cinco nombres distintos entre h1, title, schema y llms.txt**<br><sub>Fijar un nombre canónico por servicio y usarlo idéntico en h1, title, breadcrumb, tarjeta de la home, texto ancla, OfferCatalog y llms.txt. Las varian</sub> | `soluciones/backup-ransomware.html:123 frente a :6, :56, index.html:206 y llms.` |
| 🟡 Media | bajo | F3 | **llms.txt afirma que la empresa está solo en Madrid y que todo el contenido está en español**<br><sub>Reescribir el blockquote para reflejar la doble sede Miami + Madrid y el servicio bilingüe, y añadir el correo y las dos localidades en la sección de </sub> | `llms.txt:3 y llms.txt:5` |
| 🟡 Media | bajo | F3 | **El pie de las 17 páginas salta de h2/h3 a h4 sin h3 intermedio, y en 404.html salta de h1 a h4**<br><sub>Cambiar los tres <h4> del pie a <h2> en las 17 páginas (el pie es hermano del contenido, no hijo de la última sección), o convertirlos en <p class="fo</sub> | `index.html:848 (tras el último h2 en :769), 404.html:118 (tras el único h1 en ` |
| ⚪ Baja | bajo | F3 | **La meta description de politica-privacidad.html tiene 194 caracteres y se cortará en el SERP**<br><sub>Recortar a unos 155 caracteres colocando RGPD y LOPDGDD en la primera mitad, por ejemplo: "Política de privacidad de APF Tech conforme al RGPD y la LO</sub> | `politica-privacidad.html:7` |
| ⚪ Baja | bajo | F3 | **Los titles de las páginas de soluciones usan la mitad del ancho disponible y no llevan cualificador**<br><sub>Ampliar los titles cortos con un cualificador real, por ejemplo "Seguridad con IA para empresas — APF Tech \| Miami y Madrid", manteniéndose por debajo</sub> | `soluciones/seguridad-ia.html:6, soluciones/marketing-ia.html:6, soluciones/gpt` |
| ⚪ Baja | bajo | F6 | **El 404 funciona por convención de Netlify pero no está declarado, y /portal/* lo anula**<br><sub>Documentar el comportamiento con un comentario en netlify.toml y añadir una regla explícita [[redirects]] from = "/portal/*" to = "/portal/index.html"</sub> | `netlify.toml:1-11` |
| ⚪ Baja | bajo | F6 | **panel-apf/ no está en .gitignore y publish="." lo publicaría en cuanto se haga commit**<br><sub>Añadir panel-apf/ y portal-cliente/ a .gitignore antes de tocar nada más en ese directorio, y añadir un Disallow preventivo en robots.txt para ambas r</sub> | `.gitignore:1-31 y netlify.toml:2-3` |

### Imágenes y fuentes

| Sev. | Esf. | Fase | Hallazgo | Ubicación |
|---|---|---|---|---|
| 🟠 Alta | bajo | F2 | **El fallback robotPerfecto.png pesa 692.664 bytes y nunca se ha comprimido**<br><sub>Pasar el PNG por pngquant (paleta de 256 con dithering) seguido de oxipng -o4 --strip safe. En renders 3D con alfa la reducción típica es del 65-70%, </sub> | `index.html:332` |
| 🟠 Alta | bajo | F1 | **backdrop-filter apunta a un filtro SVG que solo existe en index.html**<br><sub>Replicar el bloque <svg class="lg-defs"> de index.html:266-271 en las 16 páginas restantes (el JS de js/main.js:276-277 ya hace early-return si no enc</sub> | `css/styles.css:30 y 521` |
| 🟠 Alta | medio | F2 | **El <picture> del héroe sirve un único candidato de 736x1261 a todos los viewports** ✅<br><sub>Generar variantes en 460w, 660w y 736w y publicar <source type="image/webp" srcset="robot-460.webp 460w, robot-660.webp 660w, robot-736.webp 736w" siz</sub> | `index.html:330-333` |
| 🟠 Alta | medio | F2 | **No hay ningún <source type="image/avif"> pese a que la imagen es un recorte con canal alfa** ✅<br><sub>Añadir un <source type="image/avif"> como PRIMER hijo del <picture> (el orden manda: el navegador toma el primer type soportado), con el mismo juego d</sub> | `index.html:330-333` |
| 🟠 Alta | medio | F4 | **La og:image es una imagen vertical de 0,58:1 y 677 KB declarada como summary_large_image** ✅<br><sub>Crear una og-apf.jpg dedicada de 1200x630 (con logo, nombre y el claim) por debajo de 150 KB y apuntar ahí og:image y twitter:image en las 14 páginas.</sub> | `index.html:20-25` |
| 🟠 Alta | medio | F3 | **Hoja de Google Fonts render-blocking en un tercer origen, con cadena crítica de 3 saltos** ✅<br><sub>Autoalojar. Descargar las variables Inter e Inter Tight subseteadas a latin+latin-ext (2 ficheros woff2 de ~45 KB cada uno cubren TODOS los pesos, fre</sub> | `index.html:48` |
| 🟡 Media | alto | F2 | **El máster original mide 736 px de ancho, insuficiente para escritorio 2x**<br><sub>Recuperar o regenerar el render del robot a 1472x2522 (2x del tope de 457 px) antes de construir el srcset, y añadir entonces un candidato 1472w. Si n</sub> | `index.html:332` |
| 🟡 Media | bajo | F2 | **El preload del héroe no lleva imagesrcset y provocará descarga duplicada en cuanto se añada srcset** ✅<br><sub>Migrar el preload a imagesrcset/imagesizes con EXACTAMENTE los mismos candidatos y el mismo sizes que el <source> AVIF, y actualizar el type a image/a</sub> | `index.html:51` |
| 🟡 Media | bajo | F3 | **Todos los <strong> del texto corrido piden Inter 700, que no se descarga, y degradan a 600** ✅<br><sub>Cambiar la petición de Inter a wght@400;500;600;700 en las 17 páginas (o, mejor, resolverlo de una vez con la fuente variable autoalojada del hallazgo</sub> | `index.html:48` |
| 🟡 Media | bajo | F2 | **El logo del nav es un PNG de 301x284 y 11,3 KB para una caja de 38x38, y se descubre solo tras parsear el CSS** ✅<br><sub>Reexportar a 114x114 en WebP (~2 KB) y, dado ese tamaño, incrustarlo como data URI directamente en css/styles.css:329: elimina una petición de red en </sub> | `css/styles.css:329` |
| 🟡 Media | bajo | F4 | **El campo "logo" del Organization apunta al render vertical del robot, no a la marca** ✅<br><sub>Apuntar "logo" a una versión cuadrada del logo real de al menos 600x600 (partiendo de logo-apf.png o de su fuente vectorial) y dejar robotPerfecto par</sub> | `index.html:71` |
| 🟡 Media | bajo | F4 | **Falta og:image:width, og:image:height y og:image:type en las 14 páginas con tarjeta social** ✅<br><sub>Añadir og:image:width, og:image:height y og:image:type junto a og:image en las 14 páginas, con los valores de la nueva imagen 1200x630 del hallazgo de</sub> | `index.html:20-21` |
| 🟡 Media | bajo | F5 | **netlify.toml no tiene reglas de caché para *.avif ni *.woff2, los dos formatos que van a introducirse** ✅<br><sub>Añadir bloques [[headers]] para *.avif y *.woff2 con Cache-Control = "public, max-age=31536000, immutable" ANTES de desplegar esos activos, y una regl</sub> | `netlify.toml:36-58` |
| 🟡 Media | bajo | F1 | **Se precarga con fetchpriority=high una imagen marcada como decorativa** ✅<br><sub>Verificar en el trace de Lighthouse cuál es realmente el elemento LCP en móvil y en escritorio. Si es el h1, quitar el fetchpriority="high" del preloa</sub> | `index.html:51` |
| 🟡 Media | medio | F3 | **display=swap sin fuente de respaldo ajustada métricamente reflow el titular del héroe** ✅<br><sub>Declarar dos @font-face de respaldo con src: local("Segoe UI"), local("Helvetica Neue") y size-adjust/ascent-override/descent-override calculados para</sub> | `css/styles.css:57` |
| 🟡 Media | medio | F5 | **El mapa de refracción se construye píxel a píxel en el hilo principal y se inyecta duplicado como data URI**<br><sub>Como el mapa es totalmente determinista (SIZE, RADIUS y EDGE son constantes en js/main.js:279-281), generarlo una sola vez en tiempo de construcción y</sub> | `js/main.js:294-328` |
| ⚪ Baja | bajo | F3 | **Se solicita Inter 300 y no hay ni una sola regla que lo use** ✅<br><sub>Sustituir el 300 por el 700 en la misma edición del hallazgo anterior: family=Inter:wght@400;500;600;700. Mismo número de cortes, coste cero, y se arr</sub> | `index.html:48` |
| ⚪ Baja | bajo | F6 | **Cada página envía un SVG de marca que el CSS oculta y nunca se ve**<br><sub>Decidir una de las dos: o se elimina el <svg> del marcado y la regla display:none, o se elimina el background PNG de css/styles.css:329 y se usa el SV</sub> | `css/styles.css:334` |
| ⚪ Baja | bajo | F4 | **Único favicon SVG con una letra, sin apple-touch-icon ni manifest, y con una fuente que nunca carga**<br><sub>Generar apple-touch-icon.png de 180x180 y un icon-512.png a partir del logo real, declararlos junto al SVG y añadir un site.webmanifest. Y sustituir e</sub> | `index.html:28` |
| ⚪ Baja | bajo | F6 | **Tres artefactos pesados sin referencia en el árbol de trabajo, contenidos por .gitignore**<br><sub>Borrar apf-web.zip y el directorio _deploy/ (regenerables), y mover download (1).jpeg a una carpeta assets-src/ fuera del árbol publicado con un nombr</sub> | `download (1).jpeg` |

### JavaScript (js/main.js, js/i18n.js e inline de index.html)

| Sev. | Esf. | Fase | Hallazgo | Ubicación |
|---|---|---|---|---|
| 🔴 Crítica | bajo | F1 | **Todo el contenido por encima del pliegue esta a opacity 0 hasta que termina la tarea larga de main.js**<br><sub>Excluir del patron reveal todo lo que esta en el primer viewport: quitar la clase .reveal al eyebrow, al h1, al hero__lead y al hero__cta (index.html:</sub> | `js/main.js:70-83 · css/styles.css:848 · index.html:336-345` |
| 🔴 Crítica | medio | F2 | **El generador del mapa de refraccion es el causante de la tarea larga de ~268 ms, y corre en las 17 paginas**<br><sub>Sacarlo del arranque por completo. El mapa es una constante: no depende del DOM, del tema ni del viewport. Generarlo una sola vez en build y servirlo </sub> | `js/main.js:275-329` |
| 🟠 Alta | alto | F4 | **El idioma por defecto es ingles pero el diccionario cubre menos del 18% de las subpaginas, y aun asi se declara lang="en"**<br><sub>Decidir el alcance antes que la tactica. Opcion minima y coherente: aplicar el ingles solo donde la cobertura es real, es decir condicionar apply('en'</sub> | `js/i18n.js:262 · js/i18n.js:274-278` |
| 🟠 Alta | bajo | F2 | **Cinco listeners de resize sin debounce, cada uno disparando el bucle de thrashing completo**<br><sub>Registrar un unico listener de resize fuera del forEach que recorra una lista de instancias, y envolverlo en la misma guarda rAF que ya usa el scroll </sub> | `js/main.js:264` |
| 🟠 Alta | bajo | F3 | **21 handlers de pointermove que llaman a getBoundingClientRect en cada movimiento del raton**<br><sub>Delegar un unico listener de pointermove en el contenedor y resolver la tarjeta con e.target.closest('[data-spotlight]'). Dentro, sustituir getBoundin</sub> | `js/main.js:116-122` |
| 🟠 Alta | medio | F2 | **El carrusel alterna lecturas de layout y escrituras de estilo dentro del bucle, y solo en la rama que se activa en movil**<br><sub>Separar en dos fases dentro de update(): primer bucle que solo lea y guarde offsetLeft/offsetWidth en un array de objetos, segundo bucle que solo escr</sub> | `js/main.js:208-229` |
| 🟠 Alta | medio | F3 | **El conmutador de idioma reescribe el documento entero dentro del handler de click**<br><sub>Dar feedback inmediato y diferir el trabajo: en el handler, cambiar solo el texto del boton y persistir en localStorage, y mover apply() a un requestA</sub> | `js/i18n.js:306-314 · js/i18n.js:254-270` |
| 🟠 Alta | medio | F1 | **Google Fonts es el unico tercero y entra como hoja de estilos bloqueante en un origen ajeno** ✅<br><sub>Autoalojar las dos familias en el propio dominio: descargar los woff2 subseteados a latin + latin-ext, servirlos desde /fonts/, declarar @font-face co</sub> | `index.html:46-48` |
| 🟡 Media | bajo | F2 | **El handler de scroll del nav no tiene guarda de rAF, a diferencia del resto de handlers del fichero**<br><sub>Aplicar el mismo patron 'ticking' + requestAnimationFrame que ya usan los otros dos handlers de scroll, o mejor sustituir el bloque entero por un Inte</sub> | `js/main.js:30-34` |
| 🟡 Media | bajo | F5 | **El parallax apunta a .hero__panel, que no existe en ningun HTML del sitio, y anima un elemento desenfocado sin promocionar**<br><sub>Borrar la linea 127 y la referencia a panel de la 137, y la regla huerfana de css/styles.css:527. Para el aura: anadir will-change: transform (o trans</sub> | `js/main.js:126-142` |
| 🟡 Media | bajo | F3 | **El temporizador de cierre del drawer nunca se cancela: abrir, cerrar y volver a abrir en menos de 320 ms oculta el menu abierto**<br><sub>Guardar el id en una variable del closure y hacer clearTimeout(t) al principio de setMenu, tanto en la rama de apertura como en la de cierre. Alternat</sub> | `js/main.js:41-53` |
| 🟡 Media | bajo | F4 | **Los mensajes de estado del formulario estan escritos a fuego en espanol y el sistema bilingue no puede alcanzarlos**<br><sub>Exponer desde i18n.js una funcion publica de traduccion, por ejemplo window.APF_T = translate junto con el idioma actual, y envolver los cuatro litera</sub> | `js/main.js:152,158,171,176` |
| 🟡 Media | bajo | F3 | **El conmutador de tema fuerza un recalculo de estilo global mas una escritura sincrona en disco dentro del handler**<br><sub>Mover el localStorage.setItem fuera del camino critico con un requestIdleCallback o un setTimeout 0. Envolver el cambio de atributo en document.startV</sub> | `js/main.js:20-25` |
| 🟡 Media | bajo | F4 | **La animacion de contadores destruye los nodos de texto que i18n habia capturado**<br><sub>En runCount, escribir sobre el nodo existente en lugar de reemplazarlo: si el elemento tiene un unico hijo de texto, hacer el.firstChild.nodeValue = .</sub> | `js/main.js:96 · js/i18n.js:237` |
| 🟡 Media | bajo | F3 | **Cada pulsacion de Escape ejecuta el cierre del drawer aunque este cerrado**<br><sub>Guardar el estado en una variable del closure y salir pronto: if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') set</sub> | `js/main.js:65-67` |
| ⚪ Baja | bajo | F5 | **Dos claves del diccionario no corresponden a ninguna cadena del sitio**<br><sub>Aprovechar la clave existente en vez de borrarla: en setMenu (main.js:48) anadir toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'</sub> | `js/i18n.js:26,29` |
| ⚪ Baja | bajo | F5 | **El contador anima hasta +300% sobre un texto que el HTML declara como +200%**<br><sub>Elegir la cifra correcta y sincronizar los dos sitios: si es 300, poner +300% como texto de respaldo en el HTML; si es 200, cambiar data-count a 200. </sub> | `index.html:386 · js/main.js:88` |
| ⚪ Baja | bajo | F6 | **Las preferencias del sistema se leen una sola vez al arrancar y no reaccionan a cambios**<br><sub>Guardar el MediaQueryList en una variable y suscribirse a su evento change para reevaluar: como minimo, al pasar a reduce anadir is-in a los .reveal p</sub> | `js/main.js:5,115 · js/i18n.js:284` |
| ⚪ Baja | bajo | F5 | **El atributo data-marquee no lo lee ningun JS ni ningun CSS**<br><sub>Eliminar el atributo data-marquee de index.html:353, o bien documentar en un comentario que el bucle es puramente CSS para que nadie vuelva a buscar e</sub> | `index.html:353` |

### Accesibilidad (WCAG 2.2 AA)

| Sev. | Esf. | Fase | Hallazgo | Ubicación |
|---|---|---|---|---|
| 🔴 Crítica | alto | F118 | **Las subpáginas se anuncian como lang="en" con el cuerpo íntegro en castellano**<br><sub>Dos opciones reales. (a) Completar el diccionario con el cuerpo de las 13 subpáginas, o (b) mientras no exista traducción, no aplicar "en" en las pági</sub> | `js/i18n.js:262 y 274-278; soluciones/pentesting.html:2, 124, 154-156, 258-261` |
| 🟠 Alta | bajo | F1 | **El token --ink-3 falla el 4.5:1 en los DOS temas, y en claro es peor que en oscuro**<br><sub>Oscurecer/aclarar el token, no parchear selectores uno a uno: --ink-3: #626C7C en claro (4.94:1 sobre --bg-1) y #7B8595 en oscuro (5.18:1 sobre --bg-1</sub> | `css/styles.css:18 (#717C8C) y css/styles.css:93 (#6F7A8A); consumidores en css` |
| 🟠 Alta | bajo | F3 | **El carrusel móvil atenúa al 55% el texto de las tarjetas no activas (2.59:1)**<br><sub>No atenuar el contenido: mover el efecto al contenedor visual. Sustituir la opacidad por un cambio de borde/sombra (por ejemplo border-color: var(--bo</sub> | `css/styles.css:908 y 915; js/main.js:222` |
| 🟠 Alta | bajo | F1 | **Enlaces en prosa sin subrayado ni color propio: indistinguibles del texto que los rodea**<br><sub>Añadir una regla explícita para enlaces en prosa: `.consent a, .footer__legal a, .plans__note a, .prose a { color: var(--accent); text-decoration: und</sub> | `css/styles.css:157; index.html:822, 876, 722` |
| 🟠 Alta | medio | F3 | **El drawer móvil no gestiona el foco: se pierde al cerrar y el fondo sigue tabulable**<br><sub>En setMenu(true): guardar document.activeElement, mover el foco al primer enlace del drawer y aplicar inert (o aria-hidden) al header y al main. En se</sub> | `js/main.js:41-67; index.html:311-323` |
| 🟠 Alta | medio | F3 | **El único control visible del carrusel es una barra de 5 px clicable, con la barra de scroll nativa oculta**<br><sub>Sustituir la barra por botones anterior/siguiente reales (<button> con aria-label, 44x44) o, como mínimo, engordar el área activa de .carousel__bar a </sub> | `css/styles.css:919-926, 890, 895; js/main.js:243-249; index.html:405-431` |
| 🟡 Media | bajo | F5 | **La marquesina de integraciones se mueve indefinidamente sin mecanismo de pausa accesible**<br><sub>Añadir un <button> de pausa/reanudación visible junto a la marquesina (con aria-pressed y aria-label traducidos) que alterne una clase .is-paused con </sub> | `css/styles.css:595-600; index.html:353-373` |
| 🟡 Media | bajo | F5 | **El bloque prefers-reduced-motion ignora casi todos los componentes de las subpáginas**<br><sub>Sustituir la lista de selectores de css/styles.css:972 por una regla de barrido dentro del mismo bloque: `*, *::before, *::after { animation-duration:</sub> | `css/styles.css:969-978, frente a 1031, 1094, 1222, 1249, 1280, 1292, 364, 999,` |
| 🟡 Media | bajo | F2 | **El pie salta de h2 a h4 en las dos páginas auditadas**<br><sub>Cambiar los tres <h4> del pie a <h2> en las 15 páginas (son títulos de secciones hermanas del contenido principal, no subsecciones) y trasladar el asp</sub> | `index.html:848, 857, 866 (tras el h2 de index.html:769); soluciones/pentesting` |
| 🟡 Media | bajo | F2 | **Las preguntas del FAQ no son encabezados pese a estar declaradas como Question en el JSON-LD**<br><sub>Envolver el texto del summary en un encabezado del nivel correcto: `<summary class="faq__q"><h3>¿El test puede dañar…</h3></summary>`, con `.faq__q h3</sub> | `soluciones/pentesting.html:258-261; JSON-LD en 62-73` |
| 🟡 Media | bajo | F3 | **El conmutador de tema no expone su estado a las tecnologías de asistencia**<br><sub>Aplicar el mismo patrón del conmutador de idioma: en el manejador de js/main.js:20, añadir `themeBtn.setAttribute("aria-pressed", String(next === "dar</sub> | `index.html:297-300 y soluciones/pentesting.html:101-104; js/main.js:19-26; css` |
| 🟡 Media | bajo | F1 | **El formulario elimina el outline de foco y lo sustituye por un halo de 1.25:1**<br><sub>No eliminar el outline: cambiar el selector a `.field input:focus-visible, .field select:focus-visible` conservando el fondo y el borde azules pero si</sub> | `css/styles.css:809-814` |
| 🟡 Media | bajo | F4 | **El texto que inyecta el JS queda fuera del sistema bilingüe y revierte el año al cambiar de idioma**<br><sub>Excluir del recorrido de collect() los nodos generados o gestionados por JS (rechazar en el acceptNode de js/i18n.js:228 los que estén dentro de [data</sub> | `js/main.js:10, 152, 171, 176; js/i18n.js:237 y 257` |
| 🟡 Media | medio | F4 | **Los errores del formulario no identifican el campo concreto ni se asocian a él**<br><sub>Añadir a cada .field un <p id="error-nombre" class="field__error"> vacío, referenciado con aria-describedby desde el input. En el submit, recorrer for</sub> | `index.html:825 y 785-823; js/main.js:151-156` |
| ⚪ Baja | bajo | F2 | **Iconos SVG decorativos sin aria-hidden, de forma inconsistente dentro del mismo fichero**<br><sub>Añadir aria-hidden="true" focusable="false" a todos los <svg> que no aportan información propia. Nota importante: no ponerlo en los chips ya marcados </sub> | `index.html:355-362 y 409, 417, 425, 449, 459, 469, 479, 489, 499, 454, 464; so` |
| ⚪ Baja | bajo | F3 | **Enlaces legales del pie y enlace de vuelta por debajo de los 24 px de objetivo**<br><sub>Dar altura mínima explícita a los objetivos pequeños: `.footer__legal a, .sub-back { display: inline-flex; align-items: center; min-height: 24px; }` y</sub> | `css/styles.css:834 con index.html:876; css/styles.css:996-1000 con soluciones/` |
| ⚪ Baja | bajo | F2 | **El destino del skip link no es enfocable, el salto no siempre mueve el foco**<br><sub>Añadir tabindex="-1" al <main> de las 15 páginas. Como css/styles.css:162-166 aplica el outline solo con :focus-visible, no aparecerá ningún recuadro </sub> | `index.html:262 y 325; soluciones/pentesting.html:76 y 110` |

### CSS: arquitectura, sistema de diseño, rendimiento de hoja y animaciones

| Sev. | Esf. | Fase | Hallazgo | Ubicación |
|---|---|---|---|---|
| 🔴 Crítica | bajo | F2 | **El H1 del hero (candidato a LCP) nace con opacity:0 y depende de un script defer para aparecer**<br><sub>Quitar la clase `reveal` de index.html:339 y :342 (H1 y lead ya están en el viewport inicial, no necesitan reveal por scroll), o bien añadir en el cri</sub> | `css/styles.css:848 + index.html:339 + js/main.js:70-82` |
| 🔴 Crítica | medio | F2 | **La hoja completa (51,5 KB) bloquea el render y sólo el 30% hace falta above-the-fold**<br><sub>Extraer esos ~15,9 KB (tokens + reset + tipografía + botones + nav + hero + reveal) a un <style> inline en el <head> de index.html y cargar el resto c</sub> | `index.html:53 + css/styles.css:1-1321` |
| 🟠 Alta | bajo | F1 | **~5,2 KB / ~100 líneas de CSS cuyos selectores no existen en ningún HTML del sitio**<br><sub>Borrar los rangos 526-579 (conservando `@keyframes pulse` de la línea 552, que sí usa `.eyebrow--pill .dot` en 224), 837-845, 870-871, 1125-1137, 1146</sub> | `css/styles.css:526-579, 837-845, 870-871, 1125-1137, 1146-1158, 1260-1272` |
| 🟠 Alta | bajo | F4 | **El token --ink-3 (gris apagado del footer) incumple WCAG 2.1 AA en el tema oscuro Y en el claro**<br><sub>Subir --ink-3 a #7E8998 o más claro en oscuro (≈5,3:1 sobre #0A0E16) y bajarlo a #5C6675 o más oscuro en claro (≈5,6:1 sobre #F4F7FB). Verificar los 1</sub> | `css/styles.css:93 (oscuro #6F7A8A) y css/styles.css:18 (claro #717C8C)` |
| 🟠 Alta | bajo | F1 | **La regla «borde azul en todas las cajas» no llega a .trust-chip, .outcome ni .faq__item por orden de cascada**<br><sub>Mover el bloque 1119-1123 al final del fichero (después de la línea 1321), o cambiar `border: 1px solid var(--lg-edge)` por `border-width:1px; border-</sub> | `css/styles.css:1120-1123 vs 1200, 1246, 1277` |
| 🟠 Alta | bajo | F3 | **will-change permanente sobre todos los hijos del carrusel en móvil (~29 capas de compositor)**<br><sub>Quitar `will-change` de 901 y añadirlo/quitarlo desde js/main.js sólo mientras el carrusel está en `scroll`/`touchmove` (`el.style.willChange = 'trans</sub> | `css/styles.css:896-902` |
| 🟠 Alta | medio | F2 | **Una sola hoja sirve dos vocabularios disjuntos: 11,4 KB inútiles en la home y ~20 KB inútiles en cada subpágina**<br><sub>Partir en tres ficheros: `base.css` (tokens 1-128, reset 130-191, tipografía 193-234, botones 236-291, nav 293-446, footer 822-845, reveal 847-853, re</sub> | `css/styles.css:728-750, 980-1061, 1191-1321 (sólo subpáginas) vs css/styles.cs` |
| 🟠 Alta | medio | F3 | **27 elementos de la home aplican simultáneamente un backdrop-filter con filtro SVG de desplazamiento**<br><sub>Limitar `--lg-blur` (con url()) a los 1-2 elementos hero donde el efecto se aprecia (`.hero__lead`) y degradar `.card`, `.svc`, `.plan`, `.values li` </sub> | `css/styles.css:30 y 103 (--lg-blur), aplicado en 521, 649, 719, 777, 1092` |
| 🟡 Media | alto | F5 | **No existe escala de espaciado ni tipográfica: 27 valores de gap, 44 de padding y 46 de font-size**<br><sub>Definir en :root una escala de 8 pasos (--s-1:4px … --s-8:64px) y una tipográfica de 8 pasos, y reescribir gaps/paddings/font-sizes al valor más próxi</sub> | `css/styles.css:65-71 (tokens de forma) frente a todo el fichero` |
| 🟡 Media | bajo | F3 | **Cero uso de contain y content-visibility en 1.321 líneas y 9 secciones por página**<br><sub>Añadir `content-visibility: auto; contain-intrinsic-size: auto 900px;` a las secciones que nunca están en el primer viewport (`.section:not(:first-of-</sub> | `css/styles.css:626, 1020 (definiciones de sección sin contención)` |
| 🟡 Media | bajo | F4 | **El bloque prefers-reduced-motion cubre 4 componentes pero deja 8 con transform y transiciones activas**<br><sub>Ampliar css/styles.css:972 a `.btn, .card, .svc, .values li, .plan, .feature, .step, .risk, .outcome, .faq__item, .sub-back, .field input, .field sele</sub> | `css/styles.css:969-978 vs 1031, 1094, 1110-1117, 1222, 1249, 1280, 999, 792` |
| 🟡 Media | bajo | F4 | **El tema oscuro sólo existe vía atributo [data-theme]; el CSS no tiene ningún prefers-color-scheme**<br><sub>Añadir tras css/styles.css:128 un bloque `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { /* mismas 33 variables de 87-127 */ </sub> | `css/styles.css:84 + index.html:31-44` |
| 🟡 Media | bajo | F5 | **12 de los 18 radios del sitio están hardcodeados e ignoran los tokens --r-*, y --r-xs no se usa nunca**<br><sub>Unificar los iconos de componente a un solo radio (p. ej. `--r-icon: 14px`) y sustituir 665, 1005, 1036, 1050 y 1227 por ese token. Reemplazar el 10px</sub> | `css/styles.css:66-71 vs 165, 170, 330, 408, 563, 565, 568, 665, 733, 1005, 103` |
| 🟡 Media | bajo | F6 | **Seis breakpoints sin sistema, @media 980px declarada dos veces, y .steps sin regla intermedia**<br><sub>Fusionar 1316-1320 dentro del bloque de 856-860 y reordenar todos los @media de mayor a menor (1024, 980, 860, 720, 680, 600). Reducir a cuatro breakp</sub> | `css/styles.css:856, 862, 869, 951, 1058, 1312, 1316 + 1043` |
| 🟡 Media | bajo | F3 | **Capa de grano fija a pantalla completa con mix-blend-mode sobre todo el documento**<br><sub>Sustituir el blend por opacidad plana (quitar `mix-blend-mode` de 186 y 188 y ajustar `opacity`), o desactivar `.grain` por debajo de 680px con `@medi</sub> | `css/styles.css:182-188 + index.html:263` |
| 🟡 Media | medio | F3 | **Seis animaciones/transiciones mueven propiedades de layout o paint en lugar de transform/opacity**<br><sub>Sustituir `@keyframes pulse` por un pseudo-elemento con `transform: scale()` + `opacity` (mismo aspecto, cero paint). Cambiar 999/1002 por `transition</sub> | `css/styles.css:299+315, 313, 552+224, 374-389, 999+1002, 932` |
| 🟡 Media | medio | F1 | **Cuatro bloques de reglas están duplicados literalmente y el patrón «liquid glass» se repite 10 veces sin abstracción**<br><sub>Crear una clase utilitaria `.glass` con el grupo de 5 declaraciones y añadirla al HTML de los 10 componentes, o al menos fusionar los selectores: `.ca</sub> | `css/styles.css:630-635 vs 1066-1071; 654-658 vs 1097-1101; 764-768 vs 1173-117` |
| ⚪ Baja | bajo | F5 | **5 de las 48 custom properties están declaradas y nunca se consumen; --on-accent se ignora en favor de #fff literal**<br><sub>Sustituir los cuatro `#fff` (263, 563, 1037, 1131) por `var(--on-accent)`; sustituir las duraciones repetidas por `--dur-fast/.2s`, `--dur/.4s`, `--du</sub> | `css/styles.css:39, 44, 62, 63, 66` |
| ⚪ Baja | bajo | F1 | **66 líneas de CSS idénticas duplicadas entre terminos.html y politica-privacidad.html, fuera de la hoja versionada**<br><sub>Mover el bloque común (34-99) a css/styles.css como sección «documentos legales», dejando en politica-privacidad.html sólo las 18 líneas de `.legal-ta</sub> | `terminos.html:34-99 y politica-privacidad.html:34-99` |
| ⚪ Baja | bajo | F6 | **El drawer móvil no se alinea con el pill del nav por debajo de 600px**<br><sub>Cambiar css/styles.css:418 a `inset: calc(var(--nav-h) + 22px) var(--nav-pad, var(--pad)) auto;` y definir `--nav-pad: 12px` dentro del bloque de 951-</sub> | `css/styles.css:418 vs css/styles.css:958` |
| ⚪ Baja | bajo | F2 | **Se pide a Google Fonts el peso Inter 300 que el CSS no usa en ninguna regla** ✅<br><sub>Quitar `300;` del parámetro de Inter en index.html:48 y en las 16 páginas restantes. Aprovechar para autohospedar los woff2 en /fonts y eliminar el te</sub> | `index.html:48 + css/styles.css (0 apariciones de font-weight: 300)` |


---

## 5. Priorización (impacto × esfuerzo)

Orden de ataque recomendado, de mayor a menor relación impacto/esfuerzo.

| # | Bloque | Impacto | Esfuerzo | Fase |
|---|---|---|---|---|
| 1 | Excluir `portal-cliente/` del despliegue y `panel-apf/` del repositorio | Alto (exposición) | Bajo | 1 |
| 2 | Sustituir el Gmail personal por el correo corporativo | Alto (reputación) | Bajo | 1 |
| 3 | Corregir `--ink-3` y el resto de contrastes AA | Alto (a11y legal) | Bajo | 6 |
| 4 | Replicar la navegación móvil en las 16 páginas restantes | Alto (UX móvil) | Medio | 2 |
| 5 | Imágenes responsive AVIF/WebP y fuentes autoalojadas ✅ | Alto | Medio | 1 |
| 6 | Teclado y ARIA en carrusel, marquesina y drawer | Alto (a11y) | Medio | 3 |
| 7 | Decidir la arquitectura del bilingüe (URLs por idioma + hreflang) | Alto (SEO) | Alto | 6 |
| 8 | Restaurar los estados hover/focus anulados por la regla de borde azul | Medio (UX) | Bajo | 3 |
| 9 | Eliminar ~5 KB de CSS muerto y unificar escalas de espaciado y radios | Medio (mantenimiento) | Medio | 2 |
| 10 | `content-visibility` en secciones bajo el fold | Medio (render) | Bajo | 4 |
| 11 | Cobertura completa de `prefers-reduced-motion` | Medio (a11y) | Bajo | 4 |
| 12 | Nombres con hash para CSS/JS en vez de `?v=` manual en 17 ficheros | Medio (operación) | Medio | 5 |
| 13 | Presupuesto de rendimiento verificado en el despliegue | Medio (regresión) | Medio | 5 |
| 14 | Datos estructurados: `Service`, `BreadcrumbList`, hub de soluciones | Medio (SEO) | Medio | 6 |
| 15 | CSP completa más allá de `frame-ancestors` | Medio (seguridad) | Medio | 2 |

---

## 6. Capturas base

Las capturas de referencia (home y subpágina, móvil y escritorio, tema claro y oscuro)
y los informes HTML completos de Lighthouse están en el directorio de trabajo de la
sesión:

```
scratchpad/baseline/*.png          capturas antes de los cambios
scratchpad/lh-*.html               Lighthouse de la línea base
scratchpad/lh2-*.html              Lighthouse tras la Fase 1
scratchpad/metrics-*.json          mediciones propias en crudo
```

No se han copiado al repositorio a propósito: con `publish = "."` cualquier fichero en
la raíz acaba siendo accesible públicamente.
