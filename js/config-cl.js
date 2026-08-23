/* =========================================================================
   CHILE — sección principal del sitio (raíz)
   Se carga DESPUÉS de config.js. Revisar cada enero: cada cifra lleva
   anotado de dónde sale.
   ========================================================================= */

window.CL = {
  anio: 2026,
  actualizado: 'Operación Renta 2026',

  /* Retención de segunda categoría sobre boletas de honorarios.
     Ley 21.133: sube por tramos hasta el 17 % en 2028.
     2025: 14,5 % · 2026: 15,25 % · 2027: 16 % · 2028: 17 % */
  retencionBoleta: 15.25,
  calendarioRetencion: [
    { anio: 2020, tasa: 10.75 },
    { anio: 2021, tasa: 11.5 },
    { anio: 2022, tasa: 12.25 },
    { anio: 2023, tasa: 13 },
    { anio: 2024, tasa: 13.75 },
    { anio: 2025, tasa: 14.5 },
    { anio: 2026, tasa: 15.25 },
    { anio: 2027, tasa: 16 },
    { anio: 2028, tasa: 17 }
  ],
  /* Años que se ofrecen en el selector de las calculadoras. */
  aniosSelector: [2024, 2025, 2026, 2027, 2028],

  /* IVA. Solo aplica a quien emite factura (primera categoría);
     las boletas de honorarios NO llevan IVA. */
  iva: 19,

  /* Cotizaciones obligatorias del trabajador independiente.
     Base imponible = porcentaje de cobertura × honorarios brutos anuales. */
  cobertura: [
    { anio: 2026, pct: 80,  etiqueta: 'Parcial (80 %) — por defecto en 2026' },
    { anio: 2026, pct: 100, etiqueta: 'Total (100 %) — cobertura completa' }
  ],
  coberturaPorDefecto: 80,

  cotizaciones: {
    afp: 10,          // fondo de pensiones
    comisionAfp: 1.2, // aproximada: cada AFP tiene la suya, es editable
    sis: 1.15,        // seguro de invalidez y sobrevivencia
    accidentes: 0.95, // ley 16.744, más recargo según riesgo de la actividad
    salud: 7          // Fonasa o Isapre
  },

  /* Gastos de la renta de segunda categoría (art. 50 LIR).
     O rebajas el 30 % de tus ingresos brutos SIN acreditar nada, con tope de
     15 UTA, o acreditas tus gastos efectivos con documentos. No las dos.
     La UTA la publica el SII cada año: por eso aquí solo va el tope en UTA. */
  gastosPresuntos: { pct: 30, topeUTA: 15 },

  /* Tope imponible anual de la Operación Renta 2026:
     87,8 UF mensuales × 12 = 1.053,6 UF ≈ $41.857.379 */
  topeImponibleAnual: 41857379,

  /* Enlaces oficiales que conviene tener a mano en las páginas */
  fuentes: {
    sii: 'https://www.sii.cl/destacados/boletas_honorarios/',
    prevision: 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9913.html'
  }
};

/* -------------------------------------------------------------------------
   Bloques de monetización de la sección chilena. Se cargan después de
   config.js y antes de app.js.
   ------------------------------------------------------------------------- */

/* Programas de contabilidad y facturación usados en Chile.
   OJO: estos enlaces todavía NO son de afiliado. Escribe a cada empresa para
   preguntar si tienen programa; cuando te den tu enlace, pégalo en `url`. */
window.AFILIADOS = [
  {
    id: 'nubox',
    nombre: 'Nubox',
    titular: 'Contabilidad y facturación en línea',
    texto: 'Boletas, facturas y remuneraciones conectadas con el SII. Muy usado por pymes y contadores en Chile.',
    cta: 'Ver planes',
    url: 'https://www.nubox.com',
    etiqueta: 'Más usado'
  },
  {
    id: 'chipax',
    nombre: 'Chipax',
    titular: 'Control de flujo de caja',
    texto: 'Concilia tus cuentas bancarias con el SII y te muestra cuánta plata tienes de verdad disponible.',
    cta: 'Probar',
    url: 'https://chipax.com',
    etiqueta: 'Para la caja'
  },
  {
    id: 'bsale',
    nombre: 'Bsale',
    titular: 'Boletas y facturas electrónicas',
    texto: 'Emisión electrónica, punto de venta e inventario. Útil si además vendes productos.',
    cta: 'Ver más',
    url: 'https://www.bsale.cl',
    etiqueta: 'Con punto de venta'
  }
];

/* Producto propio adaptado a Chile */
window.PRO = {
  /* En false hasta que el producto exista de verdad y `checkout` tenga URL:
     mientras tanto la sección entera no se pinta. */
  activo: false,
  nombre: 'Pack Independiente Pro',
  precio: '$14.900',
  precioTachado: '$29.900',
  incluye: [
    'Planilla Excel: registro de boletas, gastos y retenciones mes a mes',
    'Simulador de Operación Renta: cuánto te devuelven o cuánto pagas',
    'Plantillas de cotización, presupuesto y contrato de servicios',
    'Checklist de gastos que sí puedes rebajar como independiente',
    'Actualizaciones de por vida'
  ],
  checkout: ''   // <-- pega aquí tu enlace de pago (Gumroad, Lemon Squeezy, Flow, Webpay)
};

/* Mismo formulario de Google que la sección española: una sola lista. */
window.NEWSLETTER = {
  activo: true,
  tipo: 'google-forms',
  action: 'https://docs.google.com/forms/d/e/1FAIpQLScvuLREgUstRatZ5xuSwNH_-RSLSj-5pXypRtdX2oHOCcW4jw/formResponse',
  campoEmail: 'entry.1076558109',
  gancho: 'Te aviso antes de la Operación Renta y cuando cambie la retención'
};
