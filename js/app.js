/* app.js — monetización, consentimiento y piezas comunes de todas las páginas */
(function () {
  'use strict';

  var CLAVE_CONSENT = 'as_consent_v1';

  /* ---------------- utilidades ---------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function el(tag, props, hijos) {
    var n = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === 'class') n.className = props[k];
      else if (k === 'html') n.innerHTML = props[k];
      else n.setAttribute(k, props[k]);
    });
    (hijos || []).forEach(function (h) { n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h); });
    return n;
  }
  window.$as = { $: $, $$: $$, el: el };

  /* ---------------- consentimiento (RGPD) ---------------- */
  function consentimiento() { try { return localStorage.getItem(CLAVE_CONSENT); } catch (e) { return null; } }
  function guardarConsentimiento(v) { try { localStorage.setItem(CLAVE_CONSENT, v); } catch (e) {} }

  function bannerCookies() {
    if (consentimiento()) return;
    var banner = el('div', { class: 'cookies', role: 'dialog', 'aria-label': 'Cookies' }, []);
    banner.innerHTML =
      '<strong>Cookies</strong><p style="margin:6px 0 0">Usamos cookies propias y de terceros para medir el tráfico y mostrar publicidad. ' +
      'Las calculadoras funcionan igual si las rechazas.</p>' +
      '<div class="acciones"><button class="boton" data-c="si">Aceptar</button>' +
      '<button class="boton fantasma" data-c="no">Rechazar</button></div>';
    banner.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-c]'); if (!b) return;
      guardarConsentimiento(b.dataset.c === 'si' ? 'aceptado' : 'rechazado');
      banner.remove();
      if (b.dataset.c === 'si') { cargarAnuncios(); cargarAnalitica(); }
    });
    document.body.appendChild(banner);
  }

  /* ---------------- publicidad ---------------- */
  function cargarAnuncios() {
    var cfg = window.ADS || {};
    if (!cfg.activo || !cfg.cliente) return;          // sin ID no se carga nada ni se ven huecos
    if (document.getElementById('adsbygoogle-js')) return;
    var s = el('script', {
      id: 'adsbygoogle-js', async: 'async', crossorigin: 'anonymous',
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + cfg.cliente
    });
    document.head.appendChild(s);

    $$('.anuncio[data-slot]').forEach(function (hueco) {
      var slot = cfg.slots[hueco.dataset.slot];
      if (!slot) return;
      hueco.innerHTML = '<div class="anuncio-etiqueta">Publicidad</div>';
      var ins = el('ins', {
        class: 'adsbygoogle', style: 'display:block',
        'data-ad-client': cfg.cliente, 'data-ad-slot': slot,
        'data-ad-format': hueco.dataset.formato || 'auto', 'data-full-width-responsive': 'true'
      });
      hueco.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  function cargarAnalitica() {
    var id = (window.ANALYTICS || {}).ga4;
    if (!id || document.getElementById('ga4-js')) return;
    document.head.appendChild(el('script', { id: 'ga4-js', async: 'async', src: 'https://www.googletagmanager.com/gtag/js?id=' + id }));
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
  }

  /** Evento de conversión: clic en afiliado, compra o descarga. */
  function evento(nombre, datos) {
    if (typeof window.gtag === 'function') window.gtag('event', nombre, datos || {});
  }
  window.$as.evento = evento;

  /* ---------------- bloque de afiliados ---------------- */
  function pintarAfiliados() {
    $$('[data-afiliados]').forEach(function (cont) {
      var lista = window.AFILIADOS || [];
      var limite = parseInt(cont.dataset.afiliados, 10) || lista.length;
      var rejilla = el('div', { class: 'rejilla r3' });
      lista.slice(0, limite).forEach(function (a) {
        var card = el('div', { class: 'tarjeta afiliado' });
        card.innerHTML =
          (a.etiqueta ? '<span class="etiqueta-cinta">' + a.etiqueta + '</span>' : '') +
          '<h3>' + a.nombre + '</h3>' +
          '<p class="titular">' + a.titular + '</p>' +
          '<p>' + a.texto + '</p>' +
          '<a class="boton" rel="sponsored nofollow noopener" target="_blank" href="' + a.url + '" data-af="' + a.id + '">' + a.cta + '</a>';
        rejilla.appendChild(card);
      });
      cont.appendChild(rejilla);
      cont.appendChild(el('p', { class: 'nota-afiliado' }, [
        'Enlaces de afiliado: si contratas alguno de estos servicios podemos llevarnos una comisión. A ti no te cuesta más y es lo que mantiene estas calculadoras gratis.'
      ]));
    });
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest('[data-af]');
      if (a) evento('clic_afiliado', { proveedor: a.dataset.af, pagina: location.pathname });
    });
  }

  /* ---------------- producto propio ---------------- */
  function pintarPro() {
    var cont = $('[data-pro]');
    if (!cont || !(window.PRO || {}).activo) return;
    var p = window.PRO;
    var caja = el('div', { class: 'pro' });
    caja.innerHTML =
      '<h3 style="margin:0;font-size:23px;letter-spacing:-.02em">' + p.nombre + '</h3>' +
      '<div class="precio"><b>' + p.precio + '</b>' + (p.precioTachado ? '<s>' + p.precioTachado + '</s>' : '') +
      '<span style="color:var(--suave);font-size:14px">pago único</span></div>' +
      '<ul>' + p.incluye.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' +
      '<a class="boton grande bloque" href="' + (p.checkout || '#') + '" data-comprar="1"' +
      (p.checkout ? ' target="_blank" rel="noopener"' : '') + '>Comprar ahora — ' + p.precio + '</a>' +
      '<p style="text-align:center;font-size:13px;color:var(--suave);margin:12px 0 0">Descarga inmediata · Actualizaciones incluidas</p>';
    cont.appendChild(caja);

    caja.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-comprar]');
      if (!b) return;
      evento('clic_comprar', { producto: p.nombre });
      if (!p.checkout) {
        ev.preventDefault();
        alert('Falta configurar el enlace de pago.\n\nCrea el producto en Gumroad, Lemon Squeezy o Stripe y pega la URL en js/config.js → window.PRO.checkout');
      }
    });
  }

  /* ---------------- boletín ---------------- */
  function pintarBoletin() {
    var cont = $('[data-boletin]');
    if (!cont || !(window.NEWSLETTER || {}).activo) return;
    var n = window.NEWSLETTER;
    var caja = el('div', { class: 'boletin' });
    caja.innerHTML =
      '<h3 style="margin:0 0 4px;font-size:21px;letter-spacing:-.02em">' + n.gancho + '</h3>' +
      '<p style="color:var(--suave);margin:0;font-size:15px">Un correo al mes con plazos, cambios fiscales y trucos. Sin spam.</p>' +
      '<form' + (n.action ? ' action="' + n.action + '" method="POST"' : '') + '>' +
      '<input type="email" name="email" required placeholder="tu@correo.com" aria-label="Tu correo">' +
      '<button class="boton" type="submit">Quiero la guía</button></form>' +
      '<p style="font-size:12.5px;color:var(--suave);margin:0">Puedes darte de baja cuando quieras.</p>';
    cont.appendChild(caja);

    caja.querySelector('form').addEventListener('submit', function (ev) {
      evento('alta_boletin', {});
      if (!n.action) {
        ev.preventDefault();
        alert('Falta configurar el formulario.\n\nCrea uno gratis en Formspree o Buttondown y pega la URL en js/config.js → window.NEWSLETTER.action');
      }
    });
  }

  /* ---------------- navegación y pie ---------------- */
  function marcarNav() {
    var actual = location.pathname.split('/').pop() || 'index.html';
    $$('.nav a').forEach(function (a) {
      if (a.getAttribute('href') === actual) a.classList.add('activo');
    });
    $$('[data-anio]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }

  /* ---------------- arranque ---------------- */
  function iniciar() {
    marcarNav();
    pintarAfiliados();
    pintarPro();
    pintarBoletin();
    bannerCookies();
    if (consentimiento() === 'aceptado') { cargarAnuncios(); cargarAnalitica(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
