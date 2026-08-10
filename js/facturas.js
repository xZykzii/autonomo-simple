/* facturas.js — generador de facturas: vista previa en vivo, guardado local y PDF por impresión */
(function () {
  'use strict';
  if (!document.getElementById('generador')) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = window.$fmt ? window.$fmt.money : function (v) { return v.toFixed(2) + ' €'; };
  var n = window.$fmt ? window.$fmt.n : function (v) { var x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : 0; };

  var CLAVE_EMISOR = 'as_emisor_v1';
  var CLAVE_FACTURAS = 'as_facturas_v1';

  var cuerpoLineas = $('#lineas');
  var previa = $('#previa');

  /* ---------- almacenamiento ---------- */
  function leer(clave, pordefecto) {
    try { return JSON.parse(localStorage.getItem(clave)) || pordefecto; } catch (e) { return pordefecto; }
  }
  function escribir(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {}
  }

  /* ---------- líneas de factura ---------- */
  function nuevaLinea(datos) {
    datos = datos || {};
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><input class="l-concepto" placeholder="Diseño de la web corporativa" value="' + (datos.concepto || '') + '"></td>' +
      '<td style="width:80px"><input class="l-cant" type="number" step="0.01" min="0" value="' + (datos.cantidad != null ? datos.cantidad : 1) + '"></td>' +
      '<td style="width:110px"><input class="l-precio" type="number" step="0.01" min="0" placeholder="0,00" value="' + (datos.precio != null ? datos.precio : '') + '"></td>' +
      '<td style="width:82px"><input class="l-iva" type="number" step="1" min="0" max="100" value="' + (datos.iva != null ? datos.iva : 21) + '"></td>' +
      '<td style="width:42px"><button type="button" class="borrar-linea" title="Eliminar línea">×</button></td>';
    cuerpoLineas.appendChild(tr);
    return tr;
  }

  cuerpoLineas.addEventListener('click', function (ev) {
    if (ev.target.closest('.borrar-linea')) {
      if (cuerpoLineas.children.length > 1) ev.target.closest('tr').remove();
      else $$('input', cuerpoLineas).forEach(function (i) { if (!i.classList.contains('l-iva') && !i.classList.contains('l-cant')) i.value = ''; });
      pintar();
    }
  });
  $('#anadir-linea').addEventListener('click', function () { nuevaLinea(); pintar(); });

  /* ---------- recogida de datos ---------- */
  function datos() {
    var lineas = $$('tr', cuerpoLineas).map(function (tr) {
      return {
        concepto: $('.l-concepto', tr).value.trim(),
        cantidad: n($('.l-cant', tr).value),
        precio: n($('.l-precio', tr).value),
        iva: n($('.l-iva', tr).value)
      };
    }).filter(function (l) { return l.concepto || l.precio; });

    return {
      emisor: {
        nombre: $('#e-nombre').value.trim(),
        nif: $('#e-nif').value.trim(),
        direccion: $('#e-direccion').value.trim(),
        contacto: $('#e-contacto').value.trim(),
        iban: $('#e-iban').value.trim()
      },
      cliente: {
        nombre: $('#c-nombre').value.trim(),
        nif: $('#c-nif').value.trim(),
        direccion: $('#c-direccion').value.trim()
      },
      numero: $('#f-numero').value.trim(),
      fecha: $('#f-fecha').value,
      vencimiento: $('#f-vencimiento').value,
      irpf: n($('#f-irpf').value),
      notas: $('#f-notas').value.trim(),
      lineas: lineas
    };
  }

  function totales(d) {
    var base = 0, ivas = {};
    d.lineas.forEach(function (l) {
      var imp = l.cantidad * l.precio;
      base += imp;
      ivas[l.iva] = (ivas[l.iva] || 0) + imp * l.iva / 100;
    });
    var totalIva = Object.keys(ivas).reduce(function (a, k) { return a + ivas[k]; }, 0);
    var retencion = base * d.irpf / 100;
    return { base: base, ivas: ivas, totalIva: totalIva, retencion: retencion, total: base + totalIva - retencion };
  }

  function fechaES(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  /* ---------- vista previa ---------- */
  function pintar() {
    var d = datos();
    var t = totales(d);

    var filas = d.lineas.map(function (l) {
      return '<tr><td>' + escapar(l.concepto || '—') + '</td>' +
        '<td class="num">' + l.cantidad + '</td>' +
        '<td class="num">' + money(l.precio) + '</td>' +
        '<td class="num">' + l.iva + ' %</td>' +
        '<td class="num">' + money(l.cantidad * l.precio) + '</td></tr>';
    }).join('') || '<tr><td colspan="5" style="color:#5b6875">Añade conceptos a la izquierda y aparecerán aquí.</td></tr>';

    var lineasIva = Object.keys(t.ivas).sort(function (a, b) { return a - b; }).map(function (k) {
      return '<div class="linea"><span>IVA ' + k + ' %</span><span>' + money(t.ivas[k]) + '</span></div>';
    }).join('');

    previa.innerHTML =
      '<div class="cab">' +
        '<div><h2>FACTURA</h2>' +
          '<div style="font-size:14px;color:#5b6875;margin-top:4px">Nº ' + escapar(d.numero || '—') + '</div></div>' +
        '<div style="text-align:right;font-size:14px">' +
          '<div><strong>Fecha:</strong> ' + (fechaES(d.fecha) || '—') + '</div>' +
          (d.vencimiento ? '<div><strong>Vencimiento:</strong> ' + fechaES(d.vencimiento) + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="partes">' +
        '<div class="parte"><h4>Emisor</h4><div>' + bloque(d.emisor.nombre, d.emisor.nif, d.emisor.direccion, d.emisor.contacto) + '</div></div>' +
        '<div class="parte"><h4>Cliente</h4><div>' + bloque(d.cliente.nombre, d.cliente.nif, d.cliente.direccion) + '</div></div>' +
      '</div>' +
      '<div class="tabla-scroll"><table><thead><tr><th>Concepto</th><th class="num">Cant.</th>' +
      '<th class="num">Precio</th><th class="num">IVA</th><th class="num">Importe</th></tr></thead>' +
      '<tbody>' + filas + '</tbody></table></div>' +
      '<div class="totales">' +
        '<div class="linea"><span>Base imponible</span><span>' + money(t.base) + '</span></div>' +
        lineasIva +
        (d.irpf ? '<div class="linea"><span>Retención IRPF ' + d.irpf + ' %</span><span>−' + money(t.retencion) + '</span></div>' : '') +
        '<div class="linea total"><span>TOTAL</span><span>' + money(t.total) + '</span></div>' +
      '</div>' +
      '<div class="pie-factura">' +
        (d.emisor.iban ? 'Pago por transferencia a: ' + escapar(d.emisor.iban) + '\n' : '') +
        (d.notas ? escapar(d.notas) : '') +
      '</div>';

    escribir(CLAVE_EMISOR, d.emisor);
  }

  function bloque() {
    return Array.prototype.slice.call(arguments)
      .filter(Boolean).map(escapar).join('\n') || '—';
  }
  function escapar(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- historial ---------- */
  function pintarHistorial() {
    var cont = $('#historial');
    var lista = leer(CLAVE_FACTURAS, []);
    if (!lista.length) {
      cont.innerHTML = '<p style="color:var(--suave);font-size:14px;margin:0">Todavía no has guardado ninguna factura. Se guardan solo en este navegador.</p>';
      return;
    }
    cont.innerHTML = '<div class="tabla-scroll"><table><thead><tr><th>Nº</th><th>Cliente</th><th>Fecha</th>' +
      '<th class="num">Total</th><th></th></tr></thead><tbody>' +
      lista.map(function (f, i) {
        return '<tr><td>' + escapar(f.numero || '—') + '</td><td>' + escapar(f.cliente.nombre || '—') + '</td>' +
          '<td>' + (fechaES(f.fecha) || '—') + '</td><td class="num">' + money(totales(f).total) + '</td>' +
          '<td class="num"><button class="boton fantasma" style="padding:5px 10px;font-size:13px" data-cargar="' + i + '">Abrir</button> ' +
          '<button class="boton fantasma" style="padding:5px 10px;font-size:13px" data-borrar="' + i + '">Borrar</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  $('#historial').addEventListener('click', function (ev) {
    var lista = leer(CLAVE_FACTURAS, []);
    var cargar = ev.target.closest('[data-cargar]');
    var borrar = ev.target.closest('[data-borrar]');
    if (cargar) { rellenar(lista[+cargar.dataset.cargar]); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (borrar) {
      lista.splice(+borrar.dataset.borrar, 1);
      escribir(CLAVE_FACTURAS, lista);
      pintarHistorial();
    }
  });

  function rellenar(d) {
    if (!d) return;
    $('#e-nombre').value = d.emisor.nombre || '';
    $('#e-nif').value = d.emisor.nif || '';
    $('#e-direccion').value = d.emisor.direccion || '';
    $('#e-contacto').value = d.emisor.contacto || '';
    $('#e-iban').value = d.emisor.iban || '';
    $('#c-nombre').value = d.cliente.nombre || '';
    $('#c-nif').value = d.cliente.nif || '';
    $('#c-direccion').value = d.cliente.direccion || '';
    $('#f-numero').value = d.numero || '';
    $('#f-fecha').value = d.fecha || '';
    $('#f-vencimiento').value = d.vencimiento || '';
    $('#f-irpf').value = d.irpf || 0;
    $('#f-notas').value = d.notas || '';
    cuerpoLineas.innerHTML = '';
    (d.lineas && d.lineas.length ? d.lineas : [{}]).forEach(nuevaLinea);
    pintar();
  }

  $('#guardar').addEventListener('click', function () {
    var d = datos();
    if (!d.lineas.length) { alert('Añade al menos un concepto antes de guardar.'); return; }
    var lista = leer(CLAVE_FACTURAS, []);
    var i = lista.findIndex(function (f) { return f.numero && f.numero === d.numero; });
    if (i >= 0) lista[i] = d; else lista.unshift(d);
    escribir(CLAVE_FACTURAS, lista);
    pintarHistorial();
    if (window.$as) window.$as.evento('factura_guardada', {});
    var b = this; var txt = b.textContent;
    b.textContent = '✓ Guardada'; setTimeout(function () { b.textContent = txt; }, 1600);
  });

  $('#imprimir').addEventListener('click', function () {
    if (window.$as) window.$as.evento('factura_pdf', {});
    window.print();
  });

  $('#nueva').addEventListener('click', function () {
    var lista = leer(CLAVE_FACTURAS, []);
    var emisor = leer(CLAVE_EMISOR, {});
    rellenar({
      emisor: emisor, cliente: {}, lineas: [{}],
      numero: siguienteNumero(lista), fecha: hoy(), vencimiento: '', irpf: 0, notas: ''
    });
  });

  $('#exportar').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(leer(CLAVE_FACTURAS, []), null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'facturas-' + hoy() + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  $('#importar').addEventListener('change', function (ev) {
    var f = ev.target.files[0]; if (!f) return;
    var lector = new FileReader();
    lector.onload = function () {
      try {
        var lista = JSON.parse(lector.result);
        if (!Array.isArray(lista)) throw new Error('formato');
        escribir(CLAVE_FACTURAS, lista);
        pintarHistorial();
        alert('Importadas ' + lista.length + ' facturas.');
      } catch (e) { alert('El archivo no tiene el formato esperado.'); }
    };
    lector.readAsText(f);
    ev.target.value = '';
  });

  function hoy() { return new Date().toISOString().slice(0, 10); }
  function siguienteNumero(lista) {
    var anio = new Date().getFullYear();
    var max = 0;
    lista.forEach(function (f) {
      var m = /^(\d{4})-(\d+)$/.exec(f.numero || '');
      if (m && +m[1] === anio) max = Math.max(max, +m[2]);
    });
    return anio + '-' + String(max + 1).padStart(3, '0');
  }

  /* ---------- arranque ---------- */
  document.addEventListener('input', function (ev) {
    if (ev.target.closest('#generador')) pintar();
  });

  var lista0 = leer(CLAVE_FACTURAS, []);
  rellenar({
    emisor: leer(CLAVE_EMISOR, {}), cliente: {}, lineas: [{}],
    numero: siguienteNumero(lista0), fecha: hoy(), vencimiento: '', irpf: 0,
    notas: 'Forma de pago: transferencia bancaria a 30 días.'
  });
  pintarHistorial();
})();
