/**
 * Fuente única de todo el texto de la página.
 *
 * Regla de este fichero: aquí no hay ninguna cifra de resultado ni ningún dato
 * legal que no se pueda sostener. Lo que no estaba verificado se ha eliminado,
 * no rellenado. Si más adelante hay datos reales (CIF, teléfono, métricas de
 * clientes con autorización), este es el único sitio donde hay que tocarlos:
 * la maqueta los lee, no los contiene.
 */

export const site = {
  brand: 'APF Tech',
  legalName: 'FUTURO PASTOR, S.L.',
  locality: 'Madrid, España',
  email: 'apf@apftech.es',
  officeHours: 'Lun–Vie, 9:00–18:00 CET',
  url: 'https://apftech.es',
  meta: {
    title: 'APF Tech — Agentes de voz con IA para cadenas de gimnasios',
    description:
      'Atendemos las llamadas que tu cadena de clubes pierde fuera del horario de recepción: reservas, altas, bajas e incidencias resueltas y registradas en tu sistema de gestión.',
    ogAlt: 'APF Tech — tecnología para cadenas de gimnasios y clubes deportivos',
  },
} as const;

export const nav = {
  links: [
    { label: 'Servicios', href: '#servicios' },
    { label: 'Cómo trabajamos', href: '#proceso' },
    { label: 'Medición', href: '#medicion' },
    { label: 'Contacto', href: '#contacto' },
  ],
  cta: { label: 'Solicitar reunión', href: '#contacto' },
} as const;

export const hero = {
  eyebrow: 'Madrid · Cadenas de gimnasios y clubes deportivos',
  // Dos líneas. El sujeto es el club, no la tecnología.
  headline: ['Tu club pierde altas cada noche', 'por llamadas que nadie coge.'],
  subhead:
    'Ponemos un agente de voz que atiende esas llamadas, resuelve la gestión y la deja registrada en tu software de socios antes de colgar.',
  primaryCta: { label: 'Solicitar reunión de 30 minutos', href: '#contacto' },
  secondaryCta: { label: 'Ver cómo funciona', href: '#proceso' },
  // Índice de alcance bajo el hero. Enumera, no afirma.
  scope: [
    { label: 'Atención telefónica', href: '#servicios' },
    { label: 'Captación y retención', href: '#servicios' },
    { label: 'Operación', href: '#servicios' },
    { label: 'Infraestructura', href: '#servicios' },
  ],
} as const;

/**
 * Registro de llamadas — el módulo firma.
 *
 * Es un EJEMPLO, y la interfaz lo dice de forma visible. Reproduce el formato
 * de log que un director de operaciones ya sabe leer, con las horas en las que
 * el mostrador está vacío. No es una métrica: es una muestra del formato.
 */
export type CallRow = {
  time: string;
  club: string;
  reason: string;
  outcome: string;
  /** 'agent' = cerrada por el agente · 'human' = derivada a una persona */
  handled: 'agent' | 'human';
};

export const callRegister = {
  label: 'Registro de llamadas',
  caption: 'Ejemplo · datos ilustrativos',
  columns: ['Hora', 'Club', 'Motivo', 'Desenlace'],
  rows: [
    { time: '21:14', club: 'Club Norte', reason: 'Alta de socio', outcome: 'Resuelta · 47 s', handled: 'agent' },
    { time: '21:16', club: 'Club Sur', reason: 'Reserva de pista', outcome: 'Resuelta · 1 m 12 s', handled: 'agent' },
    { time: '21:19', club: 'Club Este', reason: 'Solicitud de baja', outcome: 'Derivada a persona', handled: 'human' },
    { time: '21:23', club: 'Club Norte', reason: 'Consulta de tarifas', outcome: 'Resuelta · 39 s', handled: 'agent' },
    { time: '21:31', club: 'Club Oeste', reason: 'Cambio de clase', outcome: 'Resuelta · 1 m 04 s', handled: 'agent' },
    { time: '21:47', club: 'Club Sur', reason: 'Incidencia en vestuario', outcome: 'Registrada · aviso a turno', handled: 'agent' },
    { time: '22:02', club: 'Club Este', reason: 'Alta de socio', outcome: 'Resuelta · 52 s', handled: 'agent' },
    { time: '22:18', club: 'Club Norte', reason: 'Reclamación de cobro', outcome: 'Derivada a persona', handled: 'human' },
  ] satisfies CallRow[],
} as const;

/**
 * Servicios.
 *
 * La tercera viñeta de cada tarjeta no es una capacidad: es un LÍMITE. Decir
 * qué no hace el sistema es la señal de credibilidad más rápida ante alguien
 * a quien ya le han vendido humo, y es lo que separa esta página de la de
 * cualquier otra consultora.
 */
export const services = {
  eyebrow: 'Servicios',
  title: 'Cuatro sistemas, una sola operación.',
  intro:
    'Se implantan por separado y se integran entre sí. Ninguno sustituye al software de gestión que ya tienes.',
  items: [
    {
      id: 'S/01',
      kicker: 'Atención telefónica',
      title: 'Agentes de voz',
      body: [
        'Contestan al primer tono, a cualquier hora y en todas las sedes a la vez.',
        'Cierran la gestión completa y dejan el registro en tu sistema antes de colgar.',
      ],
      capabilities: ['Reservas, altas, bajas e incidencias', 'Traspaso a persona con el contexto ya recogido'],
      limit: 'No ejecuta cobros ni modifica las condiciones de un contrato.',
    },
    {
      id: 'S/02',
      kicker: 'Captación y retención',
      title: 'Automatización de marketing',
      body: [
        'Un solo perfil de socio alimentado por WhatsApp, email e Instagram.',
        'Las campañas salen del uso real de la instalación, no de una lista estática.',
      ],
      capabilities: ['CDP unificado y segmentación por frecuencia de acceso', 'Scoring de riesgo de baja con revisión humana'],
      limit: 'No envía ninguna comunicación sin consentimiento registrado y trazable.',
    },
    {
      id: 'S/03',
      kicker: 'Operación',
      title: 'Software a medida',
      body: [
        'Cuadros de mando de ocupación, altas y llamadas, sede a sede.',
        'Integraciones con las herramientas que ya usa tu equipo de gestión.',
      ],
      capabilities: ['Paneles por club y consolidado por región', 'API e integración con tu sistema de socios'],
      limit: 'No reemplazamos tu ERP de socios ni te pedimos migrar de proveedor.',
    },
    {
      id: 'S/04',
      kicker: 'Infraestructura',
      title: 'Ciberseguridad',
      body: [
        'Revisión y endurecimiento de la infraestructura que sostiene la operación.',
        'Control de accesos, copias verificadas y respuesta ante incidentes.',
      ],
      capabilities: ['Auditoría de vulnerabilidades y hardening de servidores', 'Copias con restauración probada y plan de recuperación'],
      limit: 'No realizamos pruebas destructivas sobre sistemas en producción.',
    },
  ],
} as const;

/**
 * Proceso.
 *
 * Cada fase declara además lo que le va a costar al cliente en horas de su
 * propio equipo. Es el dato que un director necesita para decidir y que
 * prácticamente nadie publica.
 */
export const process = {
  eyebrow: 'Cómo trabajamos',
  title: 'Cuatro fases. Una sede antes que la cadena.',
  intro:
    'No desplegamos en toda la red hasta que un club ha funcionado cuatro semanas con datos delante.',
  phases: [
    {
      number: '01',
      title: 'Auditoría',
      duration: '2 semanas',
      body: 'Medimos tu tráfico telefónico real por sede y por franja horaria, con tu propia centralita.',
      deliverable: 'Mapa de llamadas perdidas por sede y franja',
      cost: '1 persona de operaciones · 3 h en total',
    },
    {
      number: '02',
      title: 'Diseño e integración',
      duration: '3–4 semanas',
      body: 'Definimos qué gestiones cierra el agente, cuáles deriva y cómo escribe en tu sistema de socios.',
      deliverable: 'Agente configurado y conectado a tu software de gestión',
      cost: '1 persona de sistemas · 6 h en total',
    },
    {
      number: '03',
      title: 'Piloto en un club',
      duration: '4 semanas',
      body: 'Un solo club en producción, con revisión semanal de las llamadas y ajuste del guion.',
      deliverable: 'Informe semanal de llamadas atendidas y resueltas',
      cost: '1 responsable de club · 1 h por semana',
    },
    {
      number: '04',
      title: 'Despliegue en la cadena',
      duration: '2 semanas por bloque de sedes',
      body: 'Alta progresiva del resto de clubes y formación del personal de recepción.',
      deliverable: 'Sedes activas y equipo de recepción formado',
      cost: 'Coordinación por región · sin carga por club',
    },
  ],
} as const;

/**
 * Medición — sustituye al bloque de caso anonimizado.
 *
 * Decisión deliberada: no publicamos resultados de clientes sin autorización
 * escrita, así que publicamos el método. Son definiciones, no resultados: cada
 * línea es comprobable contra el propio piloto del cliente.
 */
export const measurement = {
  eyebrow: 'Medición',
  title: 'Qué se mide en el piloto.',
  intro:
    'No publicamos resultados de clientes sin su autorización. Publicamos el método: estas son las cuatro cifras que instrumentamos desde el primer día, con su definición exacta, para que la decisión se tome sobre datos tuyos y no sobre los nuestros.',
  // `unit` es la unidad en la que se expresa cada cifra. Ocupa el lugar donde
  // otra página pondría el resultado: se dice en qué se mide, no cuánto sale.
  metrics: [
    {
      unit: '%',
      unitName: 'porcentaje',
      label: 'Cobertura fuera de horario',
      definition: 'Llamadas atendidas dividido entre llamadas entrantes, contando solo las franjas sin personal en recepción.',
    },
    {
      unit: '%',
      unitName: 'porcentaje',
      label: 'Resolución sin persona',
      definition: 'Gestiones cerradas por el agente sin traspaso, sobre el total de llamadas atendidas.',
    },
    {
      unit: 's',
      unitName: 'segundos',
      label: 'Tiempo hasta resolución',
      definition: 'Mediana desde el primer tono hasta el cierre de la gestión en tu sistema de socios.',
    },
    {
      unit: '€',
      unitName: 'euros',
      label: 'Coste por gestión resuelta',
      definition: 'Coste total del servicio en el periodo dividido entre las gestiones cerradas en ese mismo periodo.',
    },
  ],
  baseline: {
    label: 'Línea base',
    body: 'Las cuatro semanas previas al piloto, medidas con tu propia centralita y no con la nuestra.',
  },
  ownership: {
    label: 'Propiedad del dato',
    body: 'El registro de llamadas es tuyo. Se exporta completo en cualquier momento y se elimina a la baja del servicio.',
  },
} as const;

/**
 * Cumplimiento.
 *
 * ⚠️ Antes de publicar: confirma que la afirmación sobre alojamiento en la UE
 * y la disponibilidad del DPA son exactas para tu infraestructura actual.
 */
export const compliance = {
  eyebrow: 'Confianza y cumplimiento',
  items: [
    { label: 'Entidad', value: `${site.legalName} · ${site.locality}` },
    { label: 'Protección de datos', value: 'RGPD (UE) 2016/679 y LSSI-CE' },
    { label: 'EU AI Act', value: 'Aviso al interlocutor de que habla con un sistema automatizado' },
    { label: 'Encargado del tratamiento', value: 'Contrato de encargo (DPA) disponible a petición' },
    { label: 'Infraestructura', value: 'Alojada en la Unión Europea' },
  ],
} as const;

export const contact = {
  eyebrow: 'Contacto',
  title: 'Cuéntanos qué pasa cuando suena el teléfono.',
  form: {
    groups: {
      about: 'Sobre ti',
      company: 'Tu empresa',
      project: 'Detalles del proyecto',
    },
    labels: {
      name: 'Nombre y apellidos',
      email: 'Email corporativo',
      company: 'Empresa',
      clubs: 'Número de clubes',
      interest: 'Servicio de interés',
      message: 'Tu situación',
    },
    clubOptions: ['1–9 clubes', '10–24 clubes', '25–49 clubes', '50–100 clubes', 'Más de 100 clubes'],
    interestOptions: [
      'Agentes de voz',
      'Automatización de marketing',
      'Software a medida',
      'Ciberseguridad',
    ],
    messagePlaceholder: 'Cuéntanos tu situación actual, plazos y presupuesto…',
    submit: 'Enviar mensaje',
    states: {
      sending: 'Enviando…',
      success: 'Mensaje recibido. Te respondemos en un día laborable.',
      error: 'No hemos podido enviar el mensaje. Vuelve a intentarlo o escríbenos a apf@apftech.es.',
    },
    errors: {
      name: 'Escribe tu nombre y tu apellido, tal como quieres que te llamemos.',
      emailEmpty: 'Necesitamos un email para responderte.',
      emailFormat: 'Ese email no tiene un formato válido. Revisa que lleve una @ y un dominio, como nombre@tucadena.es.',
      emailPersonal: 'Usa el email de tu empresa. Los buzones personales no nos dejan verificar con quién hablamos.',
      company: 'Indica el nombre de la cadena o del club.',
      clubs: 'Elige un tramo. Nos dice si el piloto tiene sentido en tu caso.',
      interest: 'Marca al menos un servicio para saber quién de nuestro equipo te responde.',
      message: 'Describe tu situación en una o dos frases. Con menos de 20 caracteres no podemos prepararnos la llamada.',
      summary: 'Revisa los campos marcados antes de enviar.',
    },
  },
  meeting: {
    eyebrow: '¿Prefieres hablarlo?',
    title: 'Reunión de 30 minutos',
    body: 'Sin compromiso. Si no encajamos, te lo decimos en la primera llamada.',
    cta: { label: 'Reservar hueco', href: `mailto:${site.email}?subject=Reuni%C3%B3n%20de%2030%20minutos` },
  },
  // Sin teléfono: no hay un número publicado que podamos dar por bueno.
  details: [
    { label: 'Email', value: site.email, href: `mailto:${site.email}` },
    { label: 'Oficina', value: site.locality, note: site.officeHours },
    { label: 'Entidad', value: site.legalName, note: 'Marca comercial: APF Tech' },
  ],
} as const;

export const footer = {
  legal: {
    label: 'Identidad',
    lines: [site.legalName, site.locality, `Marca comercial: ${site.brand}`],
  },
  nav: {
    label: 'Navegación',
    links: nav.links,
  },
  policies: {
    label: 'Legal',
    // Enlazan a las páginas que ya existen y están publicadas en apftech.es.
    links: [
      { label: 'Aviso legal', href: `${site.url}/terminos` },
      { label: 'Privacidad', href: `${site.url}/politica-privacidad` },
      { label: 'Cookies', href: `${site.url}/politica-cookies` },
    ],
  },
  copyright: `© ${'2026'} ${site.legalName}. Todos los derechos reservados.`,
} as const;
