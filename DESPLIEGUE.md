# DESPLIEGUE — Cloudflare

Documento operativo. Recoge lo que hay que tener configurado para que el sitio
funcione como está diseñado, y qué se rompió al migrar desde Netlify.

---

## 1. Qué manda y qué no

| Fichero | Netlify | Cloudflare | Estado |
|---|---|---|---|
| `_headers` | sí | **sí** | **Es el que manda.** Cabeceras de caché, seguridad y `X-Robots-Tag` |
| `_redirects` | sí | parcial | Solo redirecciones HTTP reales (301/302/303/307/308). Vacío a propósito — ver §1.1 |
| `functions/_middleware.js` | no | **sí** (Pages Functions) | Bloqueo de rutas y reescritura SPA del portal |
| `functions/api/contacto.js` | no | **sí** (Pages Functions) | Recepción del formulario |
| `netlify.toml` | sí | **no** | Inerte. Se conserva solo como referencia y por si se vuelve a Netlify |

> **Lo importante:** todo lo que estaba únicamente en `netlify.toml` no ha estado
> activo en producción desde la migración: cabeceras de seguridad, política de
> caché y el *rewrite* del portal. Corregido portando las cabeceras a `_headers`
> (eso sí funciona igual que en Netlify) y el resto a `functions/_middleware.js`
> (ver §1.1 — `_redirects` no sirve para esto en Cloudflare).

### 1.1 `_redirects` no admite bloqueos (404) ni reescrituras (200)

El primer despliegue a Cloudflare llevaba en `_redirects` las mismas reglas que
usaba `netlify.toml`: bloquear `/portal-cliente/*` y los `.md` internos con
código 404, y reescribir `/portal/*` a `/portal/index.html` con código 200.
**Ninguna de las dos funcionó**, y no dio ningún error: Cloudflare Pages solo
admite 301/302/303/307/308 en `_redirects` (redirecciones HTTP reales), así que
ignoró esas líneas en silencio. Verificado en producción tras el despliegue:
`/portal-cliente/src/lib/api.ts` seguía sirviendo el código fuente real con 200,
y `/portal/dashboard/algo` (una ruta profunda del portal) devolvía 404 en vez de
la aplicación.

Corregido con `functions/_middleware.js`, que se ejecuta para **todas** las
peticiones (incluidos los assets estáticos) antes de servir nada, y puede hacer
lo que `_redirects` no puede porque ejecuta código en vez de depender de un
código de estado concreto. Verificado con `wrangler pages dev` —el emulador
oficial de Cloudflare, no un servidor de pruebas propio— con 8/8 casos
correctos: bloqueo de `/portal-cliente/*` y de los `.md`, reescritura de rutas
profundas del portal preservando el JS/CSS reales bajo `/portal/assets/*`, la
función `/api/contacto` sin verse afectada, y las cabeceras de `_headers`
conviviendo sin conflicto.

**Lección para el futuro:** cualquier regla de `_redirects` que no sea una
redirección HTTP real hay que verificarla contra `wrangler pages dev` o en
producción, nunca dar por bueno que "si no da error, funciona" — Cloudflare no
avisa cuando ignora una línea.

---

## 2. El formulario de contacto — acción requerida

**Netlify Forms no existe en Cloudflare.** El formulario hacía `POST` a `/`; un
host estático responde a eso con 200 y el HTML de la portada, el front-end
interpretaba ese 200 como envío correcto y el visitante leía *«hemos recibido tu
solicitud»*. **Ningún lead enviado desde la migración ha llegado a ninguna parte.**
Reproducido en local antes de tocar nada.

Lo ya corregido:

- El formulario envía a `/api/contacto`, implementado como Pages Function.
- La función responde **siempre JSON** `{ ok: boolean }`, y el front-end solo canta
  éxito si `ok === true`. Cualquier fallo —función no desplegada, secreto sin
  configurar, proveedor caído— acaba en el mensaje de error con el correo real.
  Es imposible que vuelva a dar un éxito falso.
- Validación en servidor de campos, consentimiento, formato de email y honeypot.

**Lo que falta y solo puedes hacer tú:** dar de alta un proveedor de correo y
configurar el secreto. En el panel de Cloudflare › tu proyecto › *Settings* ›
*Variables and Secrets*:

| Variable | Tipo | Valor |
|---|---|---|
| `RESEND_API_KEY` | Secreto | La clave de [resend.com](https://resend.com) |
| `CONTACTO_TO` | Texto | `apf@apftech.es` (por defecto si se omite) |
| `CONTACTO_FROM` | Texto | Un remitente verificado en el dominio, p. ej. `web@apftech.es` |

Mientras `RESEND_API_KEY` no exista, la función devuelve 501 y el usuario ve el
aviso de que escriba por correo. Es deliberado: preferible decir la verdad a
tragarse el lead.

Si prefieres otro proveedor (Formspree, Web3Forms, Brevo…), solo hay que cambiar
el bloque `fetch` de [functions/api/contacto.js](functions/api/contacto.js); el
contrato con el front-end no cambia.

---

## 3. Pages o Workers

`functions/api/contacto.js` es la convención de **Cloudflare Pages**. Existe en el
repositorio una rama abandonada, `cloudflare/workers-autoconfig`, con un
`wrangler.jsonc` de Workers que nunca se fusionó a `main`.

- **Si el proyecto es Pages** (lo habitual al conectar un repositorio de GitHub):
  no hay que hacer nada más, la función se despliega sola.
- **Si el proyecto es Workers con assets estáticos:** `functions/` no se ejecuta.
  Habría que mover la lógica a un `_worker.js` en la raíz que sirva los assets y
  atienda `/api/contacto`. Dímelo y lo adapto.

**Conviene confirmar cuál de los dos es** antes de dar el formulario por
arreglado.

---

## 4. Comando de build

El presupuesto de rendimiento aborta el despliegue si el sitio engorda por encima
de lo acordado. En el panel de Cloudflare › *Settings* › *Build*:

```
Build command:        node scripts/perf-budget.mjs
Build output directory: /
```

Si se deja el comando vacío, el sitio se publica igual pero **sin la red de
seguridad**: un cambio que dispare el peso pasaría sin avisar.

---

## 5. Lo que sigue publicándose y no debería

`/portal-cliente/*` está bloqueado por `_redirects`, pero los 50 ficheros de
código fuente **siguen subiéndose** en cada despliegue: el bloqueo es una regla de
enrutado, no una exclusión. El arreglo de verdad es sacar ese proyecto del
repositorio de la web:

```bash
git rm -r --cached portal-cliente
echo "portal-cliente/" >> .gitignore
```

No lo he ejecutado porque borra el directorio del repositorio y esa decisión es
tuya. Lo mismo aplica a los `.md` internos de la auditoría.

---

## 6. Recordatorio de siempre

Cualquier cambio en `css/styles.css` o en `js/*` obliga a subir el `?v=` en las 17
páginas. Mientras no se pase a nombres con hash, es el fallo más fácil de cometer.
