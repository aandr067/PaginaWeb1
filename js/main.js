/* APF Technologys — interactions (no dependencies) */
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

  function setMenu(open) {
    if (!drawer || !scrim || !toggle) return;
    if (open) { drawer.hidden = false; scrim.hidden = false; }
    requestAnimationFrame(function () {
      drawer.classList.toggle("is-open", open);
      scrim.classList.toggle("is-open", open);
    });
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      setTimeout(function () { drawer.hidden = true; scrim.hidden = true; }, 320);
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
    if (e.key === "Escape") setMenu(false);
  });

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
      note.textContent = "¡Gracias! Hemos recibido tu solicitud de información. Te contactaremos muy pronto.";
      form.reset();
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

    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 0;
      if (thumb && bar) {
        var rail = bar.clientWidth;
        var tw = rail / cards.length;
        thumb.style.width = tw + "px";
        thumb.style.transform = "translateX(" + (p * (rail - tw)) + "px)";
      }
      // active card = the one whose centre is nearest the viewport centre
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestD = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var cc = cards[i].offsetLeft + cards[i].offsetWidth / 2;
        var d = Math.abs(cc - center);
        if (d < bestD) { bestD = d; best = i; }
      }
      for (var j = 0; j < cards.length; j++) {
        cards[j].classList.toggle("is-active", j === best);
      }
    }

    var ticking = false;
    track.addEventListener("scroll", function () {
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

    window.addEventListener("resize", update, { passive: true });
    update();
  });

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
