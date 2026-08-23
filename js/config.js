/* =========================================================================
   CONFIG GLOBAL — lo que comparten Chile (raíz) y España (/es/)
   Los datos tributarios de cada país están en config-cl.js y config-es.js.
   ========================================================================= */

window.SITE = {
  nombre: 'Honorarios Simple',
  claim: 'Las cuentas del que trabaja a honorarios. Gratis y sin registro.',
  // Cambia esto por tu dominio real cuando lo tengas (mejora SEO y compartir).
  dominio: 'https://xzykzii.github.io/autonomo-simple',
  // Correo público de contacto. Ponlo cuando tengas uno del dominio
  // (contacto@tudominio.cl); no uses aquí tu correo personal: este archivo
  // es público y los rastreadores de spam barren los repositorios.
  email: '',
  anio: new Date().getFullYear()
};

/* -------------------------------------------------------------------------
   1) PUBLICIDAD (Google AdSense)
   - Pon tu ID de editor (ca-pub-XXXXXXXXXXXXXXXX) en `cliente`.
   - Mientras esté vacío NO se carga ningún script ni se pintan huecos vacíos.
   - Los anuncios solo se cargan si el visitante acepta cookies.
   - NO lo actives todavía: AdSense no aprueba subdominios github.io y con el
     tráfico actual no pagaría nada. Primero dominio propio y tráfico real.
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
   2) ANALÍTICA
   GA4 se carga siempre (sin cookies de publicidad y con la IP anonimizada):
   es medición propia y agregada, no perfilado. Si algún día llega tráfico
   europeo de verdad, hay que volver a meterlo detrás del consentimiento.
   ------------------------------------------------------------------------- */
window.ANALYTICS = { ga4: 'G-8P00CHX189' };
