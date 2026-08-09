/* APF Tech — bilingual ES/EN (no dependencies)

   Translations are keyed by the Spanish source text rather than by data-i18n
   attributes: the site has no templating, so nav/footer markup is duplicated
   across 17 hand-maintained HTML files. Keying by text means one dictionary
   covers every page and any string left untranslated simply stays in Spanish. */
(function () {
  "use strict";

  var EN = {
    /* Nav + chrome */
    "Saltar al contenido": "Skip to content",
    "Beneficios": "Benefits",
    "Servicios": "Services",
    "Ciberseguridad": "Cybersecurity",
    "Grupo APF": "APF Group",
    "Planes": "Plans",
    "Contacto": "Contact",
    "Recomendado": "Recommended",
    "Menú de navegación": "Navigation menu",
    "Menú móvil": "Mobile menu",
    "Portal clientes": "Client portal",
    "Portal de cliente": "Client portal",
    "Solicita información": "Request information",
    "APF Tech — inicio": "APF Tech — home",
    "Principal": "Main",
    "Cambiar tema claro u oscuro": "Switch light or dark theme",
    "Abrir menú": "Open menu",
    "Cerrar menú": "Close menu",
    "Móvil": "Mobile",
    "Resultados": "Results",
    "Cambiar idioma": "Change language",

    /* Hero */
    "Inteligencia artificial aplicada · Miami · Madrid": "Applied artificial intelligence · Miami · Madrid",
    "Lleva tu Negocio al siguiente nivel con": "Take your business to the next level with",
    "Inteligencia Artificial": "Artificial Intelligence",
    "Software, IA y ciberseguridad a medida que automatizan tu negocio, multiplican tus ventas y protegen tus datos. Sin complejidad.":
      "Custom software, AI and cybersecurity that automate your business, multiply your sales and protect your data. Without the complexity.",
    "Ver soluciones": "See solutions",
    "Se integra con las herramientas que ya usas": "Works with the tools you already use",
    "Pagos · Stripe": "Payments · Stripe",
    "Hojas de cálculo": "Spreadsheets",
    "Voz · Llamadas": "Voice · Calls",

    /* Stats */
    "ahorradas por semana en tareas repetitivas": "saved every week on repetitive tasks",
    "de impulso potencial en ingresos": "potential boost in revenue",
    "operación y atención sin interrupciones": "operation and support without interruptions",

    /* Benefits */
    "Tecnología que trabaja por ti": "Technology that works for you",
    "Tres pilares que transforman cómo opera tu empresa, desde el primer día.":
      "Three pillars that transform how your company operates, from day one.",
    "Software a medida y ciberseguridad": "Custom software and cybersecurity",
    "Construimos el software que impulsa tu empresa y la blindamos con ciberseguridad de primer nivel, para que crezcas sobre una base sólida y protegida.":
      "We build the software that drives your company and shield it with first-rate cybersecurity, so you grow on a solid, protected foundation.",
    "Impulso explosivo en ventas": "Explosive sales growth",
    "Personalización, recomendación y conversión guiadas por IA. Negocios que escalan hasta un 300% sus ingresos sin ampliar el equipo.":
      "AI-driven personalisation, recommendation and conversion. Businesses that scale revenue by up to 300% without growing the team.",
    "Operación continua 24/7": "Continuous 24/7 operation",
    "Tu negocio nunca duerme. Atención, gestión y respuesta inmediata a cualquier hora, en cualquier idioma, sin esperas.":
      "Your business never sleeps. Support, management and instant responses at any hour, in any language, with no waiting.",

    /* Services */
    "Nuestros servicios de software": "Our software services",
    "Soluciones de IA a medida": "Custom AI solutions",
    "Cada solución se diseña en torno a tu negocio. Estas son las que más impacto generan.":
      "Every solution is designed around your business. These are the ones that make the biggest impact.",
    "Asistente de llamadas IA": "AI call assistant",
    "Un agente virtual que gestiona tus llamadas 24/7, agenda citas automáticamente y se integra con tu CRM.":
      "A virtual agent that handles your calls 24/7, books appointments automatically and integrates with your CRM.",
    "−60% de tiempo en gestión": "−60% time spent on admin",
    "Ver detalle": "See details",
    "Sistemas e-commerce": "E-commerce systems",
    "Gestión de stock, procesamiento de pedidos y precios dinámicos automatizados de extremo a extremo.":
      "Stock management, order processing and dynamic pricing, automated end to end.",
    "Hasta +250% en ventas": "Up to +250% in sales",
    "Fidelización de clientes": "Customer loyalty",
    "Campañas personalizadas que multiplican el valor de cada cliente y elevan la retención de forma sostenida.":
      "Personalised campaigns that multiply each customer's value and lift retention for the long run.",
    "80% de retención": "80% retention",
    "Marketing con IA": "AI marketing",
    "Optimización de redes y generación de contenido de alto rendimiento que dispara tu alcance.":
      "Social media optimisation and high-performance content generation that sends your reach soaring.",
    "×10 en engagement": "×10 engagement",
    "GPTs personalizados": "Custom GPTs",
    "Asistentes de IA entrenados con el conocimiento de tu empresa: atención, ventas y procesos internos a tu medida.":
      "AI assistants trained on your company's knowledge: support, sales and internal processes, tailored to you.",
    "IA entrenada con tus datos": "AI trained on your data",
    "Sistemas de IA predictiva": "Predictive AI systems",
    "Soluciones avanzadas que anticipan tendencias y comportamientos para optimizar decisiones estratégicas.":
      "Advanced solutions that anticipate trends and behaviour to sharpen strategic decisions.",
    "Predicciones inteligentes": "Intelligent forecasting",

    /* Cybersecurity */
    "Protege tu negocio, tus datos y tus clientes": "Protect your business, your data and your customers",
    "Blindamos tu empresa frente a los ciberataques con un enfoque que combina prevención, vigilancia e inteligencia artificial.":
      "We shield your company against cyberattacks with an approach that combines prevention, monitoring and artificial intelligence.",
    "Auditoría y análisis de vulnerabilidades": "Vulnerability audit and analysis",
    "Escaneamos tu web, sistemas e infraestructura para detectar los puntos débiles antes de que lo haga un atacante.":
      "We scan your website, systems and infrastructure to find the weak points before an attacker does.",
    "Detecta el 95% de fallos críticos": "Detects 95% of critical flaws",
    "Pentesting (test de intrusión)": "Pentesting (intrusion testing)",
    "Simulamos ataques reales contra tus sistemas para descubrir hasta dónde llegaría un ciberdelincuente y cómo blindarte.":
      "We simulate real attacks against your systems to find out how far an attacker could get, and how to shut them out.",
    "Ataque simulado, riesgo real": "Simulated attack, real risk",
    "Protección y monitorización 24/7": "24/7 protection and monitoring",
    "Vigilancia continua de tus sistemas con detección de amenazas en tiempo real y respuesta inmediata ante incidentes.":
      "Continuous monitoring of your systems with real-time threat detection and immediate incident response.",
    "Vigilancia 24/7/365": "24/7/365 monitoring",
    "Seguridad con IA": "AI-powered security",
    "Modelos de inteligencia artificial que detectan comportamientos anómalos y ataques de día cero antes de que causen daño.":
      "Artificial intelligence models that spot anomalous behaviour and zero-day attacks before they do damage.",
    "Amenazas detectadas en segundos": "Threats detected in seconds",
    "Copias de seguridad y anti-ransomware": "Backups and anti-ransomware",
    "Copias cifradas y un plan de continuidad para que un ataque de ransomware nunca llegue a detener tu negocio.":
      "Encrypted backups and a continuity plan so a ransomware attack never brings your business to a halt.",
    "Recuperación en minutos": "Recovery in minutes",
    "Seguridad de email y endpoints": "Email and endpoint security",
    "Protegemos el correo, los equipos y los dispositivos de tu empresa frente a malware, phishing y accesos no autorizados.":
      "We protect your company's email, computers and devices against malware, phishing and unauthorised access.",
    "Email y equipos blindados": "Email and devices locked down",

    /* Plans */
    "Planes y suscripciones": "Plans and subscriptions",
    "Elige el plan que impulsa tu negocio": "Choose the plan that drives your business",
    "Soluciones que escalan contigo: automatiza con IA y blinda tu empresa con ciberseguridad. Pide presupuesto sin compromiso y lo adaptamos a tu negocio.":
      "Solutions that scale with you: automate with AI and shield your company with cybersecurity. Ask for a no-obligation quote and we'll tailor it to your business.",
    "IA y automatización": "AI and automation",
    "Impulsa y automatiza tu negocio": "Drive and automate your business",
    "Esencial": "Essential",
    "Automatiza atención y captación.": "Automate support and lead generation.",
    "Agente de voz 24/7": "24/7 voice agent",
    "Sistemas de marketing": "Marketing systems",
    "Solicita presupuesto": "Request a quote",
    "Profesional": "Professional",
    "El equilibrio perfecto, potenciado con IA.": "The perfect balance, powered by AI.",
    "Todo lo del plan": "Everything in the",
    "Sistemas de marketing con IA": "AI marketing systems",
    "Premium": "Premium",
    "La solución completa para escalar.": "The complete solution for scaling.",
    "GPT personalizado para tu empresa": "Custom GPT for your company",
    "Software extra a medida": "Extra bespoke software",
    "Protege tu empresa con planes a tu medida": "Protect your company with plans built around you",
    "Protección Esencial": "Essential Protection",
    "Lo imprescindible para estar protegido.": "The essentials to stay protected.",
    "Informe de seguridad mensual": "Monthly security report",
    "Vigilancia 24/7": "24/7 monitoring",
    "Protección continua y proactiva con IA.": "Continuous, proactive protection with AI.",
    "Seguridad con IA (anomalías y día cero)": "AI security (anomalies and zero-day)",
    "1 pentesting al mes (test de intrusión)": "1 pentest per month (intrusion test)",
    "Blindaje Total": "Total Shield",
    "Máxima seguridad y soporte dedicado.": "Maximum security and dedicated support.",
    "Copias de seguridad cifradas y anti-ransomware": "Encrypted backups and anti-ransomware",
    "Pentesting periódico y plan de continuidad": "Regular pentesting and continuity plan",
    "Soporte prioritario y consultoría dedicada": "Priority support and dedicated consulting",
    "¿No estás seguro de qué plan encaja con tu negocio?": "Not sure which plan fits your business?",
    "Cuéntanos tu caso": "Tell us about your case",
    "y te asesoramos sin compromiso.": "and we'll advise you with no obligation.",

    /* About */
    "Sobre nosotros": "About us",
    "Hacemos la IA y la ciberseguridad accesibles, útiles y rentables":
      "We make AI and cybersecurity accessible, useful and profitable",
    "Existimos para democratizar la inteligencia artificial y la ciberseguridad: ponerlas al alcance de cualquier empresa, con soluciones a medida que impulsan tu negocio y lo protegen, y un acompañamiento real de principio a fin.":
      "We exist to democratise artificial intelligence and cybersecurity: to put them within reach of any company, with tailored solutions that drive and protect your business, and genuine support from start to finish.",
    "No vendemos tecnología por moda. Construimos sistemas que generan resultados medibles, blindamos lo que importa con ciberseguridad y crecemos contigo de forma sostenible.":
      "We don't sell technology because it's fashionable. We build systems that deliver measurable results, we shield what matters with cybersecurity, and we grow with you sustainably.",
    "Soluciones a medida": "Tailored solutions",
    "Diseñadas en torno a tus procesos reales, no plantillas genéricas.":
      "Designed around your real processes, not generic templates.",
    "Innovación continua": "Continuous innovation",
    "Iteramos con la última tecnología para mantenerte siempre por delante.":
      "We iterate with the latest technology to keep you always ahead.",
    "Crecimiento sostenible": "Sustainable growth",
    "Resultados que escalan con tu negocio, sin deuda técnica.":
      "Results that scale with your business, with no technical debt.",
    "Compromiso total": "Total commitment",
    "Un equipo cercano que responde y acompaña en cada fase.":
      "A close-knit team that responds and supports you at every stage.",

    /* Contact form */
    "Información": "Information",
    "Solicita información sobre nuestros servicios": "Request information about our services",
    "Cuéntanos sobre tu negocio y te explicamos, sin compromiso, qué soluciones de IA encajan mejor contigo.":
      "Tell us about your business and we'll explain, with no obligation, which AI solutions fit you best.",
    "Respuesta en menos de 24 h": "Reply in under 24 hours",
    "Asesoramiento sin compromiso": "No-obligation advice",
    "Propuesta adaptada a tu negocio": "A proposal tailored to your business",
    "No rellenar este campo:": "Do not fill in this field:",
    "Nombre completo": "Full name",
    "Tu nombre": "Your name",
    "Teléfono": "Phone",
    "Servicio de interés": "Service of interest",
    "Selecciona un servicio": "Select a service",
    "Otro / no estoy seguro": "Other / not sure",
    "Acepto recibir información de APF Tech y la": "I agree to receive information from APF Tech and the",
    "política de privacidad": "privacy policy",
    "Solicitar información": "Request information",

    /* Footer */
    "Automatiza tu negocio con inteligencia artificial.": "Automate your business with artificial intelligence.",
    "Soluciones": "Solutions",
    "Empresa": "Company",
    "Miami, EE. UU. · Madrid, España": "Miami, USA · Madrid, Spain",
    "APF Tech. Todos los derechos reservados.": "APF Tech. All rights reserved.",
    "Privacidad": "Privacy",
    "Términos": "Terms",

    /* Page titles */
    "APF Tech — Inteligencia artificial para tu negocio": "APF Tech — Artificial intelligence for your business"
  };

  // Keys are normalised the same way lookups are, so a stray &nbsp; or a line
  // break copied out of the HTML still matches.
  var DICT = {};
  Object.keys(EN).forEach(function (key) {
    DICT[key.replace(/\s+/g, " ").trim()] = EN[key];
  });

  var ATTRS = ["aria-label", "placeholder", "title", "alt"];
  var STORE = "apf-lang";
  var SEEN = "apf-lang-hint";
  var texts = [];
  var attrs = [];
  var current = "es";

  function collect() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) texts.push({ node: node, es: node.nodeValue });

    ATTRS.forEach(function (name) {
      Array.prototype.forEach.call(document.querySelectorAll("[" + name + "]"), function (el) {
        var value = el.getAttribute(name);
        if (value && value.trim()) attrs.push({ el: el, name: name, es: value });
      });
    });
  }

  // Keeps the original leading/trailing whitespace so inline text keeps its spacing.
  function translate(source) {
    var parts = /^(\s*)([\s\S]*?)(\s*)$/.exec(source);
    var hit = DICT[parts[2].replace(/\s+/g, " ")];
    return hit ? parts[1] + hit + parts[3] : source;
  }

  function apply(lang) {
    var toEnglish = lang === "en";
    texts.forEach(function (item) {
      item.node.nodeValue = toEnglish ? translate(item.es) : item.es;
    });
    attrs.forEach(function (item) {
      item.el.setAttribute(item.name, toEnglish ? translate(item.es) : item.es);
    });
    document.documentElement.lang = lang;
    current = lang;

    Array.prototype.forEach.call(document.querySelectorAll("[data-lang-toggle]"), function (btn) {
      btn.textContent = toEnglish ? "ES" : "EN";
      btn.setAttribute("aria-label", toEnglish ? "Cambiar a español" : "Switch to English");
      btn.setAttribute("lang", toEnglish ? "es" : "en");
    });
  }

  // English is the default for everyone; the browser language is deliberately
  // ignored. Only an explicit choice the visitor made before overrides it.
  function initial() {
    var saved;
    try { saved = localStorage.getItem(STORE); } catch (e) { /* private mode */ }
    return saved === "es" || saved === "en" ? saved : "en";
  }

  // First visit only: pulse the toggle once so a Spanish speaker notices the
  // page can be switched. Skipped for anyone who has been here before.
  function beacon() {
    if (!/^\/(index\.html)?$/.test(location.pathname)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var seen;
    try { seen = localStorage.getItem(SEEN); } catch (e) { return; }
    if (seen) return;
    try { localStorage.setItem(SEEN, "1"); } catch (e) { /* private mode */ }

    window.setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-lang-toggle]"), function (btn) {
        btn.classList.add("is-beacon");
        btn.addEventListener("animationend", function () {
          btn.classList.remove("is-beacon");
        }, { once: true });
      });
    }, 700);
  }

  function start() {
    collect();
    var title = document.title;
    apply(initial());
    document.title = current === "en" ? translate(title) : title;

    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-lang-toggle]");
      if (!btn) return;
      btn.classList.remove("is-beacon");
      var next = current === "en" ? "es" : "en";
      apply(next);
      document.title = next === "en" ? translate(title) : title;
      try { localStorage.setItem(STORE, next); } catch (e) { /* private mode */ }
    });

    beacon();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
