# APF Tech — landing para cadenas de gimnasios

Página única, en castellano, cuyo único trabajo es que la dirección de una cadena
de clubes solicite una reunión de 30 minutos.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · sin dependencias de
terceros en tiempo de ejecución.

---

## Antes de publicar

La página se construyó con una regla: **no se afirma nada que no se pueda
sostener.** Por eso no encontrarás cifras de resultados, ni testimonios, ni CIF,
ni teléfono. No es un olvido. Esto es lo que hay que decidir antes de que la
página salga a producción:

| Qué falta | Dónde se añade | Consecuencia hoy |
|---|---|---|
| Teléfono de contacto | `content/site.ts` → `contact.details` | La tarjeta de datos muestra Email / Oficina / Entidad. Sin teléfono. |
| CIF y domicilio social | `content/site.ts` → `site`, `footer.legal` | El pie da razón social y localidad, sin identificador fiscal. |
| Métricas operativas reales | — | El hero **no** lleva banda de cifras y no existe bloque de caso de cliente. |
| Autorización de un cliente | — | La sección «Medición» publica el método, no resultados ajenos. |
| Confirmar «Infraestructura alojada en la UE» y disponibilidad del DPA | `content/site.ts` → `compliance` | Se publican como compromiso. Verifícalos contra tu infraestructura real. |
| Página de «Política de IA» | `content/site.ts` → `footer.policies` | No se enlaza: todavía no existe en apftech.es y un 404 en el pie es peor. |

El registro de llamadas del hero es **un ejemplo de formato**, y la interfaz lo
dice de forma visible («Ejemplo · datos ilustrativos»). Si algún día se sustituye
por datos reales, hay que quitar esa leyenda; mientras siga siendo una muestra,
tiene que quedarse.

---

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
```

Otros comandos:

```bash
npm run build      # build de producción
npm start          # sirve el build
npm run typecheck  # tsc --noEmit
```

Variables de entorno — copia `.env.example` a `.env.local`:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_FORM_ENDPOINT` | Destino del POST del formulario. Por defecto `/api/contacto`. |
| `NEXT_PUBLIC_SITE_URL` | URL canónica para metadatos y JSON-LD. Por defecto `https://apftech.es`. |

**El formulario solo da un envío por bueno si el endpoint responde
`{ "ok": true }`.** Comprobar `response.ok` no basta: un servidor de estáticos
devuelve 200 con HTML ante cualquier POST, y con esa comprobación los leads se
pierden en silencio. Ya pasó en este sitio. Está en
[`components/ui/ContactForm.tsx`](components/ui/ContactForm.tsx).

---

## Dónde se editan los textos

**Todo el copy vive en un único fichero: [`content/site.ts`](content/site.ts).**
No hay texto escrito dentro de la maqueta. Cada sección tiene su propio objeto
exportado:

| Objeto | Sección |
|---|---|
| `site` | Marca, entidad legal, email, metadatos y SEO |
| `nav` | Enlaces de la barra superior |
| `hero` | Antetítulo, titular a dos líneas, subtítulo, botones e índice de alcance |
| `callRegister` | Filas del registro de llamadas y su leyenda |
| `services` | Las cuatro tarjetas, con capacidades y **límite** |
| `process` | Las cuatro fases: duración, entregable y coste en horas del cliente |
| `measurement` | Definición de las métricas, línea base y propiedad del dato |
| `compliance` | Franja de cumplimiento |
| `contact` | Formulario, mensajes de error, tarjeta de reunión y datos |
| `footer` | Identidad, navegación y legal |

Los mensajes de validación están en `contact.form.errors`. Están escritos para
explicar **cómo corregir**, no para señalar que algo falla; si los cambias,
mantén ese criterio.

---

## Dónde se cambian los colores y la tipografía

**Todos los tokens están en [`app/globals.css`](app/globals.css)**, en el bloque
`@theme` del principio. Debajo hay un `:root` que los reexporta con los nombres
del encargo (`--brand-primary`, `--surface-base`, …); son alias, no copias, así
que solo hay que tocar `@theme`.

El sistema de color tiene una regla que conviene no romper:

- **`--color-brand-fill` (`#2563EB`) solo se usa como relleno.** Con texto blanco
  da 5,17:1. Es el único azul que puede ser fondo de la tarjeta de acento.
- **`--color-brand-ink` (`#3B82F6`) solo se usa como tinta.** Sobre el fondo
  oscuro da 5,42:1, pero con texto blanco encima se quedaría en 3,68:1 y no
  llegaría al mínimo de cuerpo.
- Los grises son transparencias de blanco, no hexadecimales sueltos.
- `--color-hairline` (.08) separa; `--color-hairline-strong` (.36) señaliza
  controles. Bajar el segundo deja los campos de formulario por debajo de 3:1.

`--color-ink-3` está en `.48` y no en el `.38` que pedía el encargo: medido en el
navegador, `.38` da 3,57:1 y no llega al 4,5:1 que ese mismo encargo exige
verificar. Entre las dos instrucciones, gana el contraste.

Tipografía: [`app/fonts.ts`](app/fonts.ts). Usa los mismos ficheros variables
Inter Tight e Inter que ya sirve apftech.es, cargados con `next/font/local`
(`display: swap`, sin peticiones a terceros). Los `.woff2` están en `app/fonts/`.

---

## Estructura

```
app/
  layout.tsx      metadatos, JSON-LD (Organization + Service), fuentes
  page.tsx        orden de las secciones
  globals.css     TOKENS + componentes + movimiento
  fonts.ts        Inter Tight (display) + Inter (cuerpo)
components/
  sections/       una por sección de la página
  ui/
    CallRegister  el registro de llamadas del hero
    ContactForm   formulario, validación y estados de envío
    Reveal        revelado al hacer scroll
content/
  site.ts         TODO el texto
```

---

## Despliegue

El sitio actual de apftech.es es estático y Cloudflare Pages publica la raíz del
repositorio. **Esta carpeta no se despliega desde ahí**: está bloqueada en
`functions/_middleware.js` para que Cloudflare no sirva el código fuente en
crudo. La landing necesita su propio destino (Cloudflare Pages con preajuste de
Next.js, Vercel, o `output: 'export'` si se prefiere estático).

Si acaba servida bajo el mismo dominio, `NEXT_PUBLIC_FORM_ENDPOINT` puede
quedarse en `/api/contacto`. Si no, apúntalo a la URL absoluta y añade el origen
a CORS en la función de Cloudflare.

---

## Accesibilidad y rendimiento

Verificado con Chromium sobre el build de producción:

- Sin scroll horizontal a 1440 px ni a 360 px.
- Cero fallos de contraste de texto (4,5:1 en cuerpo, 3:1 en texto grande),
  medidos sobre los colores computados del navegador, incluidos los que van
  sobre la tarjeta de acento.
- Formulario completo solo con teclado; foco visible de 2 px en cada parada.
  Las casillas de servicio se marcan con la barra espaciadora.
- El envío se confirma contra `{ ok: true }`; un 200 con HTML se rechaza.
- `prefers-reduced-motion` desactiva la entrada del hero, los revelados y el
  avance del registro de llamadas.
- El contenido es visible sin JavaScript: el estado oculto de los revelados solo
  se aplica si un script en línea marca el documento con `.js`.
- Página estática prerenderizada, sin librería de animación ni dependencias de
  runtime más allá de React.
