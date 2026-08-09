/* APF Tech — nucleo compartido por las 17 paginas (sin dependencias) */
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

})();
