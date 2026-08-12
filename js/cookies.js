/* APF Tech — consentimiento de cookies (RGPD art. 6/7, LSSI-CE art. 22.2)
   Sin dependencias, igual que el resto del sitio.

   Criterios que impone la guia de cookies de la AEPD y que aqui se cumplen:
     - Nada que no sea estrictamente necesario se activa antes de una accion
       afirmativa del visitante. Seguir navegando o hacer scroll NO es consentir.
     - "Aceptar todas" y "Rechazar todas" estan al mismo nivel: mismo tamano,
       misma jerarquia visual y ambas visibles sin abrir ningun submenu.
     - Retirar el consentimiento es tan facil como darlo (enlace permanente en
       el pie y en la pagina de politica de cookies).
     - Se guarda la fecha para poder acreditar el consentimiento y se vuelve a
       preguntar pasados 12 meses.

   Como cargar un script sujeto a consentimiento (analitica, pixel, etc.):

     <script type="text/plain" data-cookie="analytics" src="..."></script>

   Se queda inerte (el navegador no ejecuta type="text/plain") hasta que el
   visitante acepta esa categoria; entonces se sustituye por un <script> real.
   Tambien se emite el evento document "apf:consent" con el detalle. */
(function () {
  "use strict";

  var VERSION = 1;                       /* subir si cambian las categorias */
  var STORE = "apf-consent";
  var COOKIE = "apf_consent";
  var MAX_AGE = 60 * 60 * 24 * 365;      /* 12 meses */
  var CATS = ["analytics", "marketing"];

  /* ---- Textos ----------------------------------------------------------
     i18n.js fotografia los nodos de texto al arrancar y este banner se
     inyecta despues, asi que nunca lo alcanza: el idioma se resuelve aqui
     contra <html lang>, igual que hace core.js con el boton del menu. */
  var T = {
    es: {
      title: "Usamos cookies",
      text: "Utilizamos cookies propias necesarias para que la web funcione y, con tu permiso, cookies analíticas y de marketing para entender cómo se usa el sitio y mejorarlo. Puedes aceptarlas, rechazarlas o elegir cuáles.",
      more: "Política de cookies",
      accept: "Aceptar todas",
      reject: "Rechazar todas",
      prefs: "Configurar",
      panel: "Preferencias de cookies",
      panelLead: "Activa o desactiva cada categoría. Las cookies necesarias no pueden desactivarse porque sin ellas la web no funciona.",
      save: "Guardar preferencias",
      close: "Cerrar",
      always: "Siempre activas",
      dialogLabel: "Aviso de cookies",
      groups: [
        {
          id: "necessary",
          name: "Necesarias",
          desc: "Imprescindibles para que el sitio funcione y para recordar tus ajustes básicos: el tema claro u oscuro, el idioma y tu propia decisión sobre cookies. No recogen datos con fines publicitarios y no requieren consentimiento."
        },
        {
          id: "analytics",
          name: "Analíticas",
          desc: "Nos permiten medir de forma agregada qué páginas se visitan y cómo se navega, para mejorar el contenido y la velocidad del sitio. Nunca se usan para identificarte personalmente."
        },
        {
          id: "marketing",
          name: "Marketing",
          desc: "Permiten medir la eficacia de nuestras campañas y mostrarte contenido relevante fuera de este sitio. Hoy no las utilizamos; si algún día se activan, será solo con tu permiso."
        }
      ]
    },
    en: {
      title: "We use cookies",
      text: "We use our own cookies that are necessary for the site to work and, with your permission, analytics and marketing cookies to understand how the site is used and improve it. You can accept them, reject them or choose which ones.",
      more: "Cookie policy",
      accept: "Accept all",
      reject: "Reject all",
      prefs: "Customise",
      panel: "Cookie preferences",
      panelLead: "Turn each category on or off. Necessary cookies cannot be turned off because the site does not work without them.",
      save: "Save preferences",
      close: "Close",
      always: "Always active",
      dialogLabel: "Cookie notice",
      groups: [
        {
          id: "necessary",
          name: "Necessary",
          desc: "Essential for the site to work and to remember your basic settings: light or dark theme, language and your own cookie choice. They collect no data for advertising purposes and require no consent."
        },
        {
          id: "analytics",
          name: "Analytics",
          desc: "They let us measure in aggregate which pages are visited and how the site is browsed, so we can improve its content and speed. They are never used to identify you personally."
        },
        {
          id: "marketing",
          name: "Marketing",
          desc: "They measure how well our campaigns perform and show you relevant content outside this site. We do not use any today; if they are ever switched on, it will only be with your permission."
        }
      ]
    }
  };

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "es";
  }
  function t() {
    return T[lang()];
  }

  /* ---- Estado guardado -------------------------------------------------
     Se escribe en localStorage y ademas en una cookie propia, porque la
     cookie es la unica de las dos que un dia podria leer el servidor. */
  function fromCookie() {
    var hit = document.cookie.split("; ").filter(function (c) {
      return c.indexOf(COOKIE + "=") === 0;
    })[0];
    if (!hit) return null;
    try { return decodeURIComponent(hit.slice(COOKIE.length + 1)); } catch (e) { return null; }
  }

  function read() {
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) { /* modo privado */ }
    if (!raw) raw = fromCookie();
    if (!raw) return null;

    var data;
    try { data = JSON.parse(raw); } catch (e) { return null; }
    if (!data || data.v !== VERSION) return null;
    /* Consentimiento caducado: se vuelve a preguntar. */
    if (!data.ts || (Date.now() - data.ts) > MAX_AGE * 1000) return null;
    return data;
  }

  function write(prefs) {
    var data = { v: VERSION, ts: Date.now() };
    CATS.forEach(function (c) { data[c] = !!prefs[c]; });

    var raw = JSON.stringify(data);
    try { localStorage.setItem(STORE, raw); } catch (e) { /* modo privado */ }
    try {
      document.cookie = COOKIE + "=" + encodeURIComponent(raw) +
        "; path=/; max-age=" + MAX_AGE + "; SameSite=Lax" +
        (location.protocol === "https:" ? "; Secure" : "");
    } catch (e) { /* cookies bloqueadas */ }
    return data;
  }

  var state = read();
  var draft = {};
  CATS.forEach(function (c) { draft[c] = state ? !!state[c] : false; });

  /* ---- Activacion de scripts sujetos a consentimiento ---- */
  function unlock(data) {
    var pending = document.querySelectorAll('script[type="text/plain"][data-cookie]');
    Array.prototype.forEach.call(pending, function (node) {
      if (!data[node.getAttribute("data-cookie")]) return;
      var live = document.createElement("script");
      Array.prototype.forEach.call(node.attributes, function (attr) {
        if (attr.name !== "type" && attr.name !== "data-cookie") live.setAttribute(attr.name, attr.value);
      });
      live.text = node.textContent;
      node.parentNode.replaceChild(live, node);
    });
  }

  function commit(prefs) {
    /* Retirar un permiso ya concedido no basta con dejar de cargar el script:
       el que ya se ejecuto sigue vivo en la pagina. Se recarga para que se
       vaya de verdad. */
    var revoked = CATS.some(function (c) { return state && state[c] && !prefs[c]; });

    state = write(prefs);
    CATS.forEach(function (c) { draft[c] = !!state[c]; });
    unlock(state);
    document.dispatchEvent(new CustomEvent("apf:consent", { detail: state }));

    hideBanner();
    closePanel();
    if (revoked) location.reload();
  }

  /* ---- Markup ---- */
  var banner = document.createElement("div");
  banner.className = "cc";
  banner.id = "cc-banner";
  banner.hidden = true;
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-modal", "false");
  banner.setAttribute("aria-labelledby", "cc-title");
  banner.setAttribute("aria-describedby", "cc-text");

  var modal = document.createElement("div");
  modal.className = "cc-modal";
  modal.id = "cc-modal";
  modal.hidden = true;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderBanner() {
    var d = t();
    banner.setAttribute("aria-label", d.dialogLabel);
    banner.innerHTML =
      '<div class="cc__box">' +
        '<div class="cc__body">' +
          '<h2 class="cc__title" id="cc-title">' + esc(d.title) + '</h2>' +
          '<p class="cc__text" id="cc-text">' + esc(d.text) +
            ' <a href="/politica-cookies.html">' + esc(d.more) + '</a>.</p>' +
        '</div>' +
        '<div class="cc__actions">' +
          '<button type="button" class="cc__link" data-cc="prefs">' + esc(d.prefs) + '</button>' +
          '<button type="button" class="btn btn--sm cc__deny" data-cc="reject">' + esc(d.reject) + '</button>' +
          '<button type="button" class="btn btn--sm btn--primary" data-cc="accept">' + esc(d.accept) + '</button>' +
        '</div>' +
      '</div>';
  }

  function renderModal() {
    var d = t();
    var groups = d.groups.map(function (g) {
      var control;
      if (g.id === "necessary") {
        control = '<span class="cc-always">' + esc(d.always) + '</span>';
      } else {
        control =
          '<label class="cc-switch">' +
            '<input type="checkbox" data-cc-cat="' + g.id + '" aria-labelledby="cc-h-' + g.id + '"' +
              (draft[g.id] ? " checked" : "") + ' />' +
            '<span class="cc-switch__track" aria-hidden="true"><span class="cc-switch__dot"></span></span>' +
          '</label>';
      }
      return '<div class="cc-group">' +
          '<div class="cc-group__head">' +
            '<h3 id="cc-h-' + g.id + '">' + esc(g.name) + '</h3>' + control +
          '</div>' +
          '<p>' + esc(g.desc) + '</p>' +
        '</div>';
    }).join("");

    modal.innerHTML =
      '<div class="cc-modal__scrim" data-cc="close"></div>' +
      '<div class="cc-modal__box" role="dialog" aria-modal="true" aria-labelledby="cc-modal-title">' +
        '<div class="cc-modal__head">' +
          '<h2 id="cc-modal-title">' + esc(d.panel) + '</h2>' +
          '<button type="button" class="cc-modal__x" data-cc="close" aria-label="' + esc(d.close) + '">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">' +
              '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<div class="cc-modal__scroll">' +
          '<p class="cc-modal__lead">' + esc(d.panelLead) +
            ' <a href="/politica-cookies.html">' + esc(d.more) + '</a>.</p>' +
          groups +
        '</div>' +
        '<div class="cc-modal__foot">' +
          '<button type="button" class="btn btn--sm cc__deny" data-cc="reject">' + esc(d.reject) + '</button>' +
          '<button type="button" class="btn btn--sm cc__save" data-cc="save">' + esc(d.save) + '</button>' +
          '<button type="button" class="btn btn--sm btn--primary" data-cc="accept">' + esc(d.accept) + '</button>' +
        '</div>' +
      '</div>';
  }

  /* ---- Banner ---- */
  var shown = false;
  function showBanner() {
    if (shown) return;
    shown = true;
    banner.hidden = false;
    requestAnimationFrame(function () { banner.classList.add("is-in"); });
  }
  function hideBanner() {
    if (!shown) return;
    shown = false;
    banner.classList.remove("is-in");
    window.setTimeout(function () { if (!shown) banner.hidden = true; }, 320);
  }

  /* ---- Panel de preferencias ---- */
  var panelOpen = false;
  var lastFocused = null;
  var outside = [];

  function focusables() {
    return Array.prototype.filter.call(
      modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; }
    );
  }

  function onKeydown(e) {
    if (!panelOpen) return;
    if (e.key === "Escape") { closePanel(); return; }
    if (e.key !== "Tab") return;

    var list = focusables();
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openPanel() {
    if (panelOpen) return;
    panelOpen = true;
    lastFocused = document.activeElement;

    /* Igual que el drawer de core.js: inert saca el resto de la pagina del
       orden de tabulacion, que es lo que convierte esto en un dialogo modal
       de verdad y no en una caja que flota encima. */
    outside = [
      document.querySelector("header.nav"),
      document.querySelector("main"),
      document.querySelector("footer"),
      banner
    ];
    outside.forEach(function (el) { if (el) el.setAttribute("inert", ""); });

    renderModal();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      modal.classList.add("is-open");
      var box = modal.querySelector(".cc-modal__box");
      if (box) {
        box.setAttribute("tabindex", "-1");
        box.focus();
      }
    });
  }

  function closePanel() {
    if (!panelOpen) return;
    panelOpen = false;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    outside.forEach(function (el) { if (el) el.removeAttribute("inert"); });
    outside = [];
    window.setTimeout(function () { if (!panelOpen) modal.hidden = true; }, 320);
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  /* ---- Eventos ---- */
  function all(value) {
    var prefs = {};
    CATS.forEach(function (c) { prefs[c] = value; });
    return prefs;
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-cc-open]");
    if (trigger) {
      e.preventDefault();
      openPanel();
      return;
    }

    var btn = e.target.closest("[data-cc]");
    if (!btn || (!banner.contains(btn) && !modal.contains(btn))) return;

    switch (btn.getAttribute("data-cc")) {
      case "accept": commit(all(true)); break;
      case "reject": commit(all(false)); break;
      case "save":   commit(draft); break;
      case "prefs":  openPanel(); break;
      case "close":  closePanel(); break;
    }
  });

  modal.addEventListener("change", function (e) {
    var input = e.target.closest("[data-cc-cat]");
    if (input) draft[input.getAttribute("data-cc-cat")] = input.checked;
  });

  document.addEventListener("keydown", onKeydown);

  /* El cambio de idioma lo hace i18n.js escribiendo en <html lang>. Observarlo
     evita depender del orden en que se registren los dos listeners de click. */
  new MutationObserver(function () {
    renderBanner();
    if (panelOpen) {
      var active = document.activeElement;
      var mark = active && active.getAttribute ? active.getAttribute("data-cc") : null;
      renderModal();
      var back = mark ? modal.querySelector('[data-cc="' + mark + '"]') : modal.querySelector(".cc-modal__box");
      if (back) back.focus();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  /* ---- Arranque ---- */
  renderBanner();
  renderModal();
  document.body.appendChild(banner);
  document.body.appendChild(modal);

  if (state) unlock(state);
  else showBanner();

  /* API publica: permite abrir el panel desde cualquier enlace con
     data-cc-open y consultar el consentimiento desde otro script. */
  window.apfCookies = {
    open: openPanel,
    get: function () { return state ? JSON.parse(JSON.stringify(state)) : null; },
    allows: function (cat) { return !!(state && state[cat]); },
    reset: function () {
      try { localStorage.removeItem(STORE); } catch (e) {}
      document.cookie = COOKIE + "=; path=/; max-age=0; SameSite=Lax";
      state = null;
      CATS.forEach(function (c) { draft[c] = false; });
      renderBanner();
      showBanner();
    }
  };
})();
