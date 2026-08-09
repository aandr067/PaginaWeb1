/* APF Tech — interactions (no dependencies) */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---- Year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Theme toggle ---- */
  var themeBtn = document.querySelector("[data-theme-toggle]");
  var metaTheme = document.querySelector("[data-theme-color]");
  function applyMeta(theme) {
    if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#07090E" : "#FFFFFF");
  }
  applyMeta(root.getAttribute("data-theme"));
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      applyMeta(next);
      try { localStorage.setItem("apf-theme", next); } catch (e) {}
    });
  }

  /* ---- Sticky nav state ---- */
  var nav = document.querySelector("[data-nav]");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile drawer ---- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var drawer = document.querySelector("[data-drawer]");
  var scrim = document.querySelector("[data-drawer-scrim]");

  // Elementos que quedan fuera del drawer mientras esta abierto. Marcarlos como
  // inert los saca del orden de tabulacion y del arbol de accesibilidad, que es
  // lo que convierte el drawer en un dialogo modal de verdad.
  var outside = [document.querySelector("header.nav"), document.querySelector("main"), document.querySelector("footer")];
  var closeTimer = null;
  var lastFocused = null;
  var menuOpen = false;

  function setMenu(open) {
    if (!drawer || !scrim || !toggle) return;
    if (open === menuOpen) return;
    menuOpen = open;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

    if (open) {
      lastFocused = document.activeElement;
      drawer.hidden = false;
      scrim.hidden = false;
    }
    requestAnimationFrame(function () {
      drawer.classList.toggle("is-open", open);
      scrim.classList.toggle("is-open", open);
    });
    toggle.setAttribute("aria-expanded", String(open));
    // El texto lo pone el JS, asi que i18n.js no puede alcanzarlo: se resuelve
    // contra el idioma que i18n haya fijado en <html lang>.
    var en = document.documentElement.lang === "en";
    toggle.setAttribute("aria-label", open ? (en ? "Close menu" : "Cerrar menú") : (en ? "Open menu" : "Abrir menú"));
    document.body.style.overflow = open ? "hidden" : "";

    outside.forEach(function (el) {
      if (!el) return;
      if (open) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });

    if (open) {
      var first = drawer.querySelector("a, button");
      if (first) first.focus();
    } else {
      closeTimer = setTimeout(function () {
        drawer.hidden = true;
        scrim.hidden = true;
        closeTimer = null;
      }, 320);
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    }
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (scrim) scrim.addEventListener("click", function () { setMenu(false); });
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) setMenu(false);
  });
  // Girar a horizontal oculta el boton hamburguesa por CSS: sin esto la pagina se
  // quedaba con el scroll bloqueado y sin forma de cerrar el menu.
  var mqDesktop = window.matchMedia("(min-width: 1025px)");
  var onDesktop = function (e) { if (e.matches) setMenu(false); };
  if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", onDesktop);
  else if (mqDesktop.addListener) mqDesktop.addListener(onDesktop);

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Stat count-up ---- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = prefix + target + suffix; return; }
    var start = performance.now(), dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---- Card cursor spotlight ---- */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-spotlight]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---- Light hero parallax ---- */
  var aura = document.querySelector(".hero__aura");
  var panel = document.querySelector(".hero__panel");
  if (!reduce && (aura || panel)) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var s = window.scrollY;
        if (s < 1100) {
          if (aura) aura.style.transform = "translateY(" + s * 0.12 + "px)";
          if (panel) panel.style.transform = "translateY(" + s * -0.04 + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Form (front-end validation + friendly note) ---- */
  var form = document.querySelector(".form");
  if (form) {
    var note = form.querySelector("[data-form-note]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!note) return;
      if (!form.checkValidity()) {
        note.textContent = "Revisa los campos: necesitamos tu nombre, teléfono, email, el servicio de interés y tu consentimiento.";
        note.classList.add("is-error");
        form.reportValidity();
        return;
      }
      note.classList.remove("is-error");
      note.textContent = "Enviando…";

      var btn = form.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error("bad status");
          note.classList.remove("is-error");
          note.textContent = "¡Gracias! Hemos recibido tu solicitud de información. Te contactaremos muy pronto.";
          form.reset();
        })
        .catch(function () {
          note.classList.add("is-error");
          note.textContent = "No hemos podido enviar el formulario. Inténtalo de nuevo o escríbenos a apf@apftechnologys.com.";
        })
        .then(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  /* ---- Mobile peek-carousels (benefits + services) ---- */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var track = car.querySelector(".carousel__track");
    if (!track) return;
    var bar = car.querySelector(".carousel__bar");
    var thumb = bar ? bar.querySelector("span") : null;
    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;
    var mqMobile = window.matchMedia("(max-width: 680px)");

    // Geometria de las tarjetas. Se cachea porque solo cambia al redimensionar o
    // al cambiar el layout: leerla dentro del bucle de scroll obligaba al
    // navegador a recalcular el layout entre cada escritura de transform.
    var geom = [];
    function measure() {
      geom = cards.map(function (card) {
        return { left: card.offsetLeft, width: card.offsetWidth };
      });
    }

    function update() {
      // --- fase de LECTURA: todo junto, antes de escribir nada ---
      var max = track.scrollWidth - track.clientWidth;
      var scrollLeft = track.scrollLeft;
      var clientWidth = track.clientWidth;
      var rail = bar ? bar.clientWidth : 0;
      if (!geom.length || geom.length !== cards.length) measure();

      var p = max > 0 ? scrollLeft / max : 0;
      var center = scrollLeft + clientWidth / 2;
      var coverflow = !reduce && mqMobile.matches && max > 4;

      // --- fase de CALCULO: sin tocar el DOM ---
      var best = 0, bestD = Infinity;
      var writes = [];
      for (var i = 0; i < cards.length; i++) {
        var g = geom[i];
        var d = (g.left + g.width / 2) - center;
        var ad = Math.abs(d);
        if (ad < bestD) { bestD = ad; best = i; }
        if (coverflow) {
          var off = g.width ? d / g.width : 0;   // -1 izquierda · 0 centro · +1 derecha
          var mag = Math.min(Math.abs(off), 2);
          var rot = Math.max(-2, Math.min(2, off)) * -28;
          writes.push({
            i: i,
            transform: "rotateY(" + rot.toFixed(2) + "deg) translateZ(" + (-mag * 70).toFixed(1) + "px) scale(" + (1 - mag * 0.10).toFixed(3) + ")",
            // El atenuado baja del 45% al 8%: al 55% de opacidad el texto quedaba
            // en 2,59:1 de contraste. La profundidad ya la dan scale y translateZ.
            opacity: (1 - Math.min(mag, 1) * 0.08).toFixed(3),
            zIndex: String(100 - Math.round(mag * 10))
          });
        } else {
          writes.push({ i: i, transform: "", opacity: "", zIndex: "" });
        }
      }

      // --- fase de ESCRITURA ---
      if (thumb && bar) {
        var tw = rail / cards.length;
        thumb.style.width = tw + "px";
        thumb.style.transform = "translateX(" + (p * (rail - tw)) + "px)";
      }
      for (var w = 0; w < writes.length; w++) {
        var card = cards[writes[w].i];
        if (!coverflow && !card.style.transform && !card.style.opacity) continue;
        card.style.transform = writes[w].transform;
        card.style.opacity = writes[w].opacity;
        card.style.zIndex = writes[w].zIndex;
      }
      for (var j = 0; j < cards.length; j++) {
        cards[j].classList.toggle("is-active", j === best);
      }
    }

    // will-change se activa solo mientras el usuario arrastra. Dejarlo puesto de
    // forma permanente en 5 carruseles mantenia otras tantas capas de compositor
    // reservadas durante toda la vida de la pagina.
    var ticking = false;
    var idleTimer = null;
    track.addEventListener("scroll", function () {
      if (!track.classList.contains("is-scrolling")) track.classList.add("is-scrolling");
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { track.classList.remove("is-scrolling"); }, 180);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });

    if (bar) {
      bar.addEventListener("click", function (e) {
        var max = track.scrollWidth - track.clientWidth;
        if (max <= 0) return;
        var r = bar.getBoundingClientRect();
        var ratio = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
        track.scrollTo({ left: ratio * max, behavior: reduce ? "auto" : "smooth" });
      });
    }

    // Optional: open the carousel centred on a given card (e.g. the
    // featured/middle plan). Only acts while the track is actually
    // scrollable (mobile), so desktop layouts are untouched.
    function center() {
      var si = parseInt(track.getAttribute("data-start"), 10);
      if (isNaN(si) || !cards[si]) return;
      if (track.scrollWidth - track.clientWidth <= 4) return;
      var sc = cards[si];
      var tgt = sc.offsetLeft - (track.clientWidth - sc.offsetWidth) / 2;
      track.scrollLeft = tgt > 0 ? tgt : 0;
    }

    // resize sin throttle disparaba update() decenas de veces por gesto, y cada
    // una recorre las tarjetas de los cinco carruseles.
    var resizeTick = false;
    window.addEventListener("resize", function () {
      if (resizeTick) return;
      resizeTick = true;
      requestAnimationFrame(function () { measure(); update(); resizeTick = false; });
    }, { passive: true });
    measure();
    center();
    update();
    // re-centre once everything (fonts/images) has settled
    window.addEventListener("load", function () { measure(); center(); update(); });
  });

  /* ---- Marquee: pausa real (WCAG 2.2.2) ----
     El movimiento dura mas de 5 s y es automatico, asi que necesita un mecanismo
     de parada que no dependa del raton. */
  var mqPause = document.querySelector("[data-marquee-pause]");
  if (mqPause) {
    var logos = mqPause.closest(".logos");
    var label = mqPause.querySelector("span");
    var setPaused = function (paused) {
      if (logos) logos.classList.toggle("is-paused", paused);
      mqPause.setAttribute("aria-pressed", String(paused));
      if (label) {
        var en = document.documentElement.lang === "en";
        label.textContent = paused
          ? (en ? "Resume animation" : "Reanudar animación")
          : (en ? "Pause animation" : "Pausar animación");
      }
    };
    mqPause.addEventListener("click", function () {
      setPaused(mqPause.getAttribute("aria-pressed") !== "true");
    });
    // Con prefers-reduced-motion el CSS ya detiene la animacion y oculta el boton.
    if (reduce) setPaused(true);
  }

  /* ---- Liquid-glass: build the refraction displacement map ----
     A normalized (objectBoundingBox) rounded-rect normal map. R encodes
     horizontal shift, G vertical; neutral grey (128) in the centre and
     ramping toward the rim so the backdrop bends like real glass.        */
  (function buildLiquidGlass() {
    var img = document.getElementById("lg-frost-map");
    if (!img || typeof document.createElement("canvas").getContext !== "function") return;

    var SIZE = 320;        // map resolution
    var RADIUS = 0.14;     // corner radius (fraction of size)
    var EDGE = 0.22;       // how deep the refraction reaches from the rim

    var c = document.createElement("canvas");
    c.width = c.height = SIZE;
    var ctx = c.getContext("2d");
    var data = ctx.createImageData(SIZE, SIZE);
    var px = data.data;

    var r = RADIUS * SIZE;
    var edge = EDGE * SIZE;
    var half = SIZE / 2;
    var inner = half - r;

    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        // signed distance to a rounded rectangle centred in the canvas
        var qx = Math.abs(x + 0.5 - half) - inner;
        var qy = Math.abs(y + 0.5 - half) - inner;
        var ox = Math.max(qx, 0);
        var oy = Math.max(qy, 0);
        var outside = Math.sqrt(ox * ox + oy * oy);
        var dist = outside + Math.min(Math.max(qx, qy), 0) - r; // <0 inside

        // outward normal of the SDF
        var nx = 0, ny = 0;
        var len = Math.sqrt(ox * ox + oy * oy);
        if (len > 0.0001) {
          nx = (ox / len) * Math.sign(x + 0.5 - half);
          ny = (oy / len) * Math.sign(y + 0.5 - half);
        }

        // refraction only near the rim: 0 deep inside, 1 at the border
        var t = (dist + edge) / edge;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        var amount = t * t;

        var i = (y * SIZE + x) * 4;
        px[i]     = 128 + nx * amount * 127;
        px[i + 1] = 128 + ny * amount * 127;
        px[i + 2] = 128;
        px[i + 3] = 255;
      }
    }

    ctx.putImageData(data, 0, 0);
    var url = c.toDataURL();
    img.setAttribute("href", url);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
  })();
})();
