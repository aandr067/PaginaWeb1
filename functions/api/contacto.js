/**
 * Cloudflare Pages Function — recepción del formulario de contacto.
 *
 * Sustituye a Netlify Forms, que no existe en Cloudflare. Antes el formulario
 * hacía POST a "/", el host estático devolvía 200 con el HTML de la portada, y
 * el front-end interpretaba ese 200 como envío correcto: el visitante leía
 * "hemos recibido tu solicitud" y el lead se perdía sin dejar rastro.
 *
 * Contrato: responde SIEMPRE JSON con { ok: boolean, error?: string }. El
 * front-end solo canta éxito si ok === true, así que cualquier fallo —función no
 * desplegada, secreto sin configurar, proveedor caído— acaba en el mensaje de
 * error con el correo real. Nunca en un éxito falso.
 *
 * Configuración (panel de Cloudflare › Settings › Variables and Secrets):
 *   RESEND_API_KEY   secreto de Resend (https://resend.com), imprescindible
 *   CONTACTO_TO      destino, por defecto apf@apftech.es
 *   CONTACTO_FROM    remitente verificado en el dominio, p. ej. web@apftech.es
 *
 * Mientras no exista RESEND_API_KEY la función responde 501 y el usuario ve el
 * aviso de que escriba por correo. Es deliberado: preferible decir la verdad.
 */

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const CAMPOS = ['nombre', 'telefono', 'email', 'servicio'];

export async function onRequestPost({ request, env }) {
  let datos;
  try {
    const tipo = request.headers.get('content-type') || '';
    if (tipo.includes('application/json')) {
      datos = await request.json();
    } else {
      datos = Object.fromEntries(await request.formData());
    }
  } catch {
    return json({ ok: false, error: 'cuerpo_ilegible' }, 400);
  }

  // Honeypot: si viene relleno es un bot. Se responde ok para no darle pistas,
  // pero no se envía nada.
  if (datos['bot-field']) return json({ ok: true });

  const faltan = CAMPOS.filter((c) => !String(datos[c] || '').trim());
  if (faltan.length) return json({ ok: false, error: 'campos_incompletos', faltan }, 422);
  if (!datos.consent) return json({ ok: false, error: 'sin_consentimiento' }, 422);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(datos.email))) {
    return json({ ok: false, error: 'email_invalido' }, 422);
  }

  if (!env.RESEND_API_KEY) {
    // Sin proveedor configurado no hay forma de entregar el mensaje. Se dice.
    return json({ ok: false, error: 'sin_configurar' }, 501);
  }

  const to = env.CONTACTO_TO || 'apf@apftech.es';
  const from = env.CONTACTO_FROM || 'web@apftech.es';
  const esc = (v) =>
    String(v).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  const cuerpo = [
    `Nombre:   ${esc(datos.nombre)}`,
    `Teléfono: ${esc(datos.telefono)}`,
    `Email:    ${esc(datos.email)}`,
    `Servicio: ${esc(datos.servicio)}`,
    '',
    `Origen:   ${esc(request.headers.get('referer') || 'desconocido')}`,
    `País:     ${esc(request.headers.get('cf-ipcountry') || 'desconocido')}`,
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: `Web APF Tech <${from}>`,
        to: [to],
        reply_to: String(datos.email),
        subject: `Nueva solicitud de información — ${esc(datos.servicio)}`,
        text: cuerpo,
      }),
    });
    if (!r.ok) {
      return json({ ok: false, error: 'proveedor', status: r.status }, 502);
    }
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'red' }, 502);
  }
}

// Un GET a este endpoint no debe devolver la portada ni un 405 mudo.
export function onRequestGet() {
  return json({ ok: false, error: 'usa_post' }, 405);
}
