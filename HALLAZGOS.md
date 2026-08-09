# HALLAZGOS — cuestiones abiertas y deuda pendiente

Registro vivo de lo que aparece fuera del alcance de la fase en curso, de lo que no se
ha podido verificar en este entorno y de las decisiones que quedan pendientes del
cliente. Cada entrada indica quién debe resolverla.

---

## A. Cosas que este entorno NO puede verificar

### A1. Producción es inalcanzable · requiere validación tras el despliegue

El entorno de ejecución no tiene salida hacia `apftechnologys.com` (ni hacia
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
