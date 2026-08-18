/* APF Tech — analitica. Sin dependencias, igual que el resto del sitio.

   Dos herramientas con reglas legales distintas, y por eso se cargan distinto:

   - Cloudflare Web Analytics: no instala cookies ni identifica al visitante,
     asi que no necesita consentimiento (art. 22.2 LSSI-CE). Se carga siempre y
     mide al 100 % del trafico.

   - Google Analytics 4: instala cookies (_ga, _ga_*) y envia datos a Google,
     asi que NO se carga hasta que el visitante acepta la categoria analitica.
     Ni el script ni una sola peticion a Google salen antes de ese momento.

   Se apoya en la API que expone js/cookies.js (window.apfCookies y el evento
   "apf:consent"), asi que este fichero tiene que ir DESPUES de cookies.js. Los
   dos van con defer, de modo que el orden del documento ya lo garantiza.

   Los dos valores de abajo son publicos —van en el HTML de cualquier sitio que
   use estas herramientas— y no son secretos. Si estan vacios, la herramienta
   correspondiente sencillamente no se carga. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Configuracion
   * ------------------------------------------------------------------ */

  /* Cloudflare › Analytics & Logs › Web Analytics › el sitio › Manage site.
     Si en su lugar activas Web Analytics desde el proyecto de Pages,
     Cloudflare inyecta el beacon por su cuenta: deja esto vacio o tendras la
     medicion duplicada. */
  var CF_TOKEN = "";

  /* Google Analytics › Administrar › Flujos de datos › el flujo web.
     Formato G-XXXXXXXXXX. */
  var GA_ID = "";

  /* ------------------------------------------------------------------ */

  function inject(attrs) {
    var s = document.createElement("script");
    Object.keys(attrs).forEach(function (k) {
      if (k === "async" || k === "defer") s[k] = attrs[k];
      else s.setAttribute(k, attrs[k]);
    });
    document.head.appendChild(s);
    return s;
  }

  /* ---- Cloudflare Web Analytics: sin cookies, sin consentimiento ---- */
  if (CF_TOKEN) {
    inject({
      defer: true,
      src: "https://static.cloudflareinsights.com/beacon.min.js",
      "data-cf-beacon": JSON.stringify({ token: CF_TOKEN })
    });
  }

  /* ---- Google Analytics 4: solo con consentimiento ---- */
  var gaLoaded = false;

  function loadGA() {
    if (gaLoaded || !/^G-[A-Z0-9]{4,}$/.test(GA_ID)) return;
    gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    /* Consent Mode v2: aqui ya hay permiso para la categoria analitica, pero
       la publicitaria sigue denegada mientras no se use ninguna herramienta de
       marketing. Declararlo evita que Google asuma nada por su cuenta. */
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted"
    });

    gtag("js", new Date());
    /* anonymize_ip es el comportamiento por defecto de GA4, pero se declara
       para dejar constancia de la configuracion. */
    gtag("config", GA_ID, { anonymize_ip: true });

    inject({ async: true, src: "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID) });
  }

  /* Al cargar la pagina: si ya habia consentimiento guardado de una visita
     anterior, cookies.js no emite ningun evento, hay que preguntarle. */
  if (window.apfCookies && window.apfCookies.allows("analytics")) loadGA();

  /* Y si lo acepta ahora mismo, sin recargar. */
  document.addEventListener("apf:consent", function (e) {
    if (e.detail && e.detail.analytics) loadGA();
  });
})();
