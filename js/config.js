/* =========================================================================
   CONFIG CENTRAL DE MONETIZACIÓN
   Todo el dinero del sitio se controla desde este archivo.
   Cambia solo lo que hay aquí: no hace falta tocar el HTML.
   ========================================================================= */

window.SITE = {
  nombre: 'Autónomo Simple',
  claim: 'Calculadoras y facturas para autónomos. Gratis y sin registro.',
  // Cambia esto por tu dominio real cuando lo tengas (mejora SEO y compartir).
  dominio: 'https://xzykzii.github.io/autonomo-simple',
  // Correo público de contacto. Ponlo cuando tengas uno del dominio
  // (contacto@tudominio.es); no uses aquí tu correo personal: este archivo
  // es público y los rastreadores de spam barren los repositorios.
  email: '',
  anio: new Date().getFullYear()
};

/* -------------------------------------------------------------------------
   1) PUBLICIDAD (Google AdSense)
   - Pon tu ID de editor (ca-pub-XXXXXXXXXXXXXXXX) en `cliente`.
   - Mientras esté vacío NO se carga ningún script ni se pintan huecos vacíos.
   - Los anuncios solo se cargan si el visitante acepta cookies (RGPD).
   ------------------------------------------------------------------------- */
window.ADS = {
  activo: true,
  cliente: '',                 // <-- ca-pub-0000000000000000
  slots: {
    cabecera: '',              // <-- ID de bloque display horizontal
    lateral: '',               // <-- ID de bloque display vertical
    inarticle: ''              // <-- ID de bloque in-article
  }
};

/* -------------------------------------------------------------------------
   2) ANALÍTICA (opcional, para saber qué página gana dinero)
   Pon tu ID de Google Analytics 4 (G-XXXXXXX) o déjalo vacío.
   ------------------------------------------------------------------------- */
window.ANALYTICS = { ga4: '' };

/* -------------------------------------------------------------------------
   3) AFILIACIÓN  ← la fuente de ingresos más rentable de este sitio
   Estos programas pagan por cada alta (30-100 € o % recurrente).
   Sustituye cada `url` por TU enlace de afiliado cuando te aprueben.
   Regístrate en: Tradedoubler, Awin o directamente en la web de cada uno.
   ------------------------------------------------------------------------- */
window.AFILIADOS = [
  {
    id: 'holded',
    nombre: 'Holded',
    titular: 'Facturación y contabilidad en la nube',
    texto: 'Factura, gastos, bancos y modelos trimestrales en un solo sitio. Prueba gratis 14 días.',
    cta: 'Probar gratis',
    url: 'https://www.holded.com/es',
    etiqueta: 'Más completo'
  },
  {
    id: 'quipu',
    nombre: 'Quipu',
    titular: 'Software de facturas para autónomos',
    texto: 'Sube una foto del ticket y se contabiliza solo. Presenta el 303 y el 130 desde la app.',
    cta: 'Ver planes',
    url: 'https://getquipu.com',
    etiqueta: 'Más fácil'
  },
  {
    id: 'declarando',
    nombre: 'Declarando',
    titular: 'Asesoría fiscal para autónomos',
    texto: 'Un asesor real revisa tus impuestos y busca gastos deducibles que te estás dejando.',
    cta: 'Calcular ahorro',
    url: 'https://declarando.es',
    etiqueta: 'Con asesor'
  }
];

/* -------------------------------------------------------------------------
   4) PRODUCTO PROPIO (margen 100 %, sin intermediarios)
   Crea el producto en Gumroad / Lemon Squeezy / Stripe Payment Link
   y pega aquí la URL de compra. Es la palanca que más escala.
   ------------------------------------------------------------------------- */
window.PRO = {
  activo: true,
  nombre: 'Pack Autónomo Pro',
  precio: '19 €',
  precioTachado: '39 €',
  incluye: [
    'Plantilla Excel: libro de ingresos, gastos y bienes de inversión',
    'Cuadro de mando trimestral (IVA e IRPF calculados solos)',
    '12 plantillas de factura, presupuesto, recibo y nota de entrega',
    'Checklist de gastos deducibles del autónomo (con el artículo que lo respalda)',
    'Actualizaciones de por vida'
  ],
  // <-- PEGA AQUÍ TU ENLACE DE PAGO (ej: https://tuusuario.gumroad.com/l/pack-autonomo)
  checkout: ''
};

/* -------------------------------------------------------------------------
   5) LISTA DE CORREO (el activo que te llevas contigo)
   Crea un formulario gratis en Formspree, Buttondown o MailerLite
   y pega la URL de "action" del formulario.
   ------------------------------------------------------------------------- */
window.NEWSLETTER = {
  activo: true,
  action: '',                  // <-- https://formspree.io/f/xxxxxxx
  gancho: 'Recibe la guía "17 gastos deducibles que casi nadie se aplica" (PDF gratis)'
};

/* -------------------------------------------------------------------------
   6) DATOS FISCALES DE LAS CALCULADORAS
   Revisa estas cifras cada año en la web de la Seguridad Social y la AEAT.
   ------------------------------------------------------------------------- */
window.FISCAL = {
  // Revisar cada enero: bases en la tabla del RD-ley 13/2022 y tipo en los PGE.
  actualizado: 'RETA 2026 — bases congeladas de 2025, tipo 31,5 % (MEI 0,9 %)',
  anioFiscal: 2026,
  tipoCotizacion: 31.5,        // 28,30 CC + 1,30 AT/EP + 0,90 cese + 0,10 FP + 0,90 MEI
  iva: [
    { valor: 21, etiqueta: 'General (21 %)' },
    { valor: 10, etiqueta: 'Reducido (10 %)' },
    { valor: 4,  etiqueta: 'Superreducido (4 %)' },
    { valor: 0,  etiqueta: 'Exento (0 %)' }
  ],
  irpf: [
    { valor: 15, etiqueta: 'General (15 %)' },
    { valor: 7,  etiqueta: 'Nuevo autónomo (7 %)' },
    { valor: 2,  etiqueta: 'Actividades agrícolas (2 %)' },
    { valor: 1,  etiqueta: 'Módulos (1 %)' },
    { valor: 0,  etiqueta: 'Sin retención (0 %)' }
  ],
  tarifaPlana: 80,             // €/mes durante los 12 primeros meses
  // Rendimiento neto MENSUAL -> base mínima de cotización del tramo.
  // La cuota se calcula sola: base × tipoCotizacion. Así en enero solo tocas
  // las bases (si cambian) y el tipo, y todas las cifras cuadran.
  tramosReta: [
    { hasta: 670,      base: 653.59,  tabla: 'reducida' },
    { hasta: 900,      base: 718.95,  tabla: 'reducida' },
    { hasta: 1166.7,   base: 849.67,  tabla: 'reducida' },
    { hasta: 1300,     base: 950.98,  tabla: 'general'  },
    { hasta: 1500,     base: 960.78,  tabla: 'general'  },
    { hasta: 1700,     base: 960.78,  tabla: 'general'  },
    { hasta: 1850,     base: 1143.79, tabla: 'general'  },
    { hasta: 2030,     base: 1209.15, tabla: 'general'  },
    { hasta: 2330,     base: 1274.51, tabla: 'general'  },
    { hasta: 2760,     base: 1356.21, tabla: 'general'  },
    { hasta: 3190,     base: 1437.91, tabla: 'general'  },
    { hasta: 3620,     base: 1519.61, tabla: 'general'  },
    { hasta: 4050,     base: 1601.31, tabla: 'general'  },
    { hasta: 6000,     base: 1732.03, tabla: 'general'  },
    { hasta: Infinity, base: 1928.10, tabla: 'general'  }
  ]
};
