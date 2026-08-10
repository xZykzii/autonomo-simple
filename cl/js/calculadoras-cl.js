/* calculadoras-cl.js — calculadoras de la sección chilena */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* El peso chileno no usa decimales */
  var clp = new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  });
  var dec = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  /* Los campos son <input type="number">, así que el valor siempre llega con
     punto decimal y sin separador de miles. No hay que tocar los puntos:
     hacerlo convertía "1.2" (comisión AFP) en 12. */
  function n(v) { var x = parseFloat(String(v).trim().replace(',', '.')); return isFinite(x) ? x : 0; }
  function pesos(v) { return clp.format(Math.round(v)); }

  function pastillas(cont, alCambiar) {
    cont.addEventListener('click', function (ev) {
      var b = ev.target.closest('.pastilla'); if (!b) return;
      $$('.pastilla', cont).forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      alCambiar(n(b.dataset.valor), b);
    });
  }
  function valorPastilla(cont) {
    var a = $('.pastilla.on', cont);
    return a ? n(a.dataset.valor) : 0;
  }
  function linea(etq, val, clase) {
    return '<div class="linea ' + (clase || '') + '"><span>' + etq + '</span><strong>' + val + '</strong></div>';
  }

  /* ============ 1. BOLETA DE HONORARIOS ============ */
  function calcBoleta() {
    var raiz = $('#calc-boleta'); if (!raiz) return;
    var monto = $('#b-monto', raiz);
    var modo = $('#b-modo', raiz);
    var salida = $('#b-salida', raiz);
    var tasa = window.CL.retencionBoleta;

    pastillas(modo, calcular);
    monto.addEventListener('input', calcular);

    function calcular() {
      var v = n(monto.value);
      var desdeBruto = valorPastilla(modo) === 1;
      var bruto, retencion, liquido;

      if (desdeBruto) { bruto = v; retencion = bruto * tasa / 100; liquido = bruto - retencion; }
      else { liquido = v; bruto = liquido / (1 - tasa / 100); retencion = bruto - liquido; }

      salida.innerHTML =
        '<div class="etiqueta">' + (desdeBruto ? 'Recibes en tu cuenta' : 'Debes emitir por') + '</div>' +
        '<div class="grande">' + pesos(desdeBruto ? liquido : bruto) + '</div>' +
        '<div class="desglose">' +
        linea('Monto bruto de la boleta', pesos(bruto)) +
        linea('Retención (' + dec.format(tasa) + ' %)', '−' + pesos(retencion)) +
        linea('Líquido que recibes', pesos(liquido), 'total') +
        '</div>' +
        '<p style="font-size:13.5px;color:var(--suave);margin:14px 0 0">Esa retención no se pierde: el SII la guarda a tu nombre. En la Operación Renta se usa primero para pagar tus cotizaciones previsionales y, si sobra, te la devuelven.</p>';
    }
    calcular();
  }

  /* ============ 2. COTIZACIONES Y OPERACIÓN RENTA ============ */
  function calcCotizaciones() {
    var raiz = $('#calc-cotiza'); if (!raiz) return;
    var brutos = $('#c-brutos', raiz);
    var cobertura = $('#c-cobertura', raiz);
    var comision = $('#c-comision', raiz);
    var salida = $('#c-salida', raiz);
    var detalle = $('#c-detalle');

    pastillas(cobertura, calcular);
    brutos.addEventListener('input', calcular);
    comision.addEventListener('input', calcular);

    function calcular() {
      var cfg = window.CL;
      var bruto = n(brutos.value);
      var pctCobertura = valorPastilla(cobertura);
      var comAfp = n(comision.value);

      var imponible = Math.min(bruto * pctCobertura / 100, cfg.topeImponibleAnual);
      var topeAplicado = (bruto * pctCobertura / 100) > cfg.topeImponibleAnual;

      var partes = [
        { etq: 'Salud (Fonasa o Isapre)', pct: cfg.cotizaciones.salud },
        { etq: 'AFP — fondo de pensiones', pct: cfg.cotizaciones.afp },
        { etq: 'AFP — comisión', pct: comAfp },
        { etq: 'Seguro de invalidez y sobrevivencia', pct: cfg.cotizaciones.sis },
        { etq: 'Accidentes del trabajo (ley 16.744)', pct: cfg.cotizaciones.accidentes }
      ];
      var totalCot = partes.reduce(function (a, p) { return a + imponible * p.pct / 100; }, 0);
      var retenido = bruto * cfg.retencionBoleta / 100;
      var saldo = retenido - totalCot;

      salida.innerHTML =
        '<div class="etiqueta">' + (saldo >= 0 ? 'Te devuelven aproximadamente' : 'Tendrías que pagar') + '</div>' +
        '<div class="grande">' + pesos(Math.abs(saldo)) + '</div>' +
        '<div class="desglose">' +
        linea('Honorarios brutos del año', pesos(bruto)) +
        linea('Renta imponible (' + pctCobertura + ' %)', pesos(imponible)) +
        linea('Total cotizaciones', pesos(totalCot)) +
        linea('Retenido en tus boletas (' + dec.format(cfg.retencionBoleta) + ' %)', pesos(retenido)) +
        linea(saldo >= 0 ? 'Saldo a favor' : 'Saldo en contra', pesos(Math.abs(saldo)), 'total') +
        '</div>' +
        (topeAplicado ? '<p style="font-size:13.5px;color:var(--suave);margin:14px 0 0">Se aplicó el tope imponible anual de ' + pesos(cfg.topeImponibleAnual) + '. Por encima de esa cifra no se cotiza más.</p>' : '') +
        '<p style="font-size:13.5px;color:var(--suave);margin:14px 0 0">Cálculo orientativo: no incluye el impuesto global complementario, que depende del resto de tus rentas y puede cambiar el resultado final.</p>';

      if (detalle) {
        detalle.innerHTML = '<thead><tr><th>Cotización</th><th class="num">Tasa</th><th class="num">Monto anual</th></tr></thead><tbody>' +
          partes.map(function (p) {
            return '<tr><td>' + p.etq + '</td><td class="num">' + dec.format(p.pct) + ' %</td>' +
              '<td class="num">' + pesos(imponible * p.pct / 100) + '</td></tr>';
          }).join('') +
          '<tr style="font-weight:700"><td>Total</td><td class="num">' +
          dec.format(partes.reduce(function (a, p) { return a + p.pct; }, 0)) + ' %</td>' +
          '<td class="num">' + pesos(totalCot) + '</td></tr></tbody>';
      }
    }
    calcular();
  }

  /* ============ 3. IVA 19 % ============ */
  function calcIvaCl() {
    var raiz = $('#calc-iva-cl'); if (!raiz) return;
    var monto = $('#i-monto', raiz);
    var modo = $('#i-modo', raiz);
    var salida = $('#i-salida', raiz);
    var tasa = window.CL.iva;

    pastillas(modo, calcular);
    monto.addEventListener('input', calcular);

    function calcular() {
      var v = n(monto.value);
      var sumar = valorPastilla(modo) === 1;
      var neto, iva, total;
      if (sumar) { neto = v; iva = neto * tasa / 100; total = neto + iva; }
      else { total = v; neto = total / (1 + tasa / 100); iva = total - neto; }

      salida.innerHTML =
        '<div class="etiqueta">' + (sumar ? 'Total con IVA' : 'Monto neto') + '</div>' +
        '<div class="grande">' + pesos(sumar ? total : neto) + '</div>' +
        '<div class="desglose">' +
        linea('Neto', pesos(neto)) +
        linea('IVA (' + tasa + ' %)', pesos(iva)) +
        linea('Total', pesos(total), 'total') +
        '</div>';
    }
    calcular();
  }

  /* ============ 4. PRECIO POR HORA ============ */
  function calcHoraCl() {
    var raiz = $('#calc-hora-cl'); if (!raiz) return;
    var c = {
      objetivo: $('#h-objetivo', raiz), gastos: $('#h-gastos', raiz),
      horas: $('#h-horas', raiz), dias: $('#h-dias', raiz),
      vacaciones: $('#h-vacaciones', raiz), facturable: $('#h-facturable', raiz)
    };
    var salida = $('#h-salida-cl', raiz);
    Object.keys(c).forEach(function (k) { if (c[k]) c[k].addEventListener('input', calcular); });

    function calcular() {
      var cfg = window.CL;
      var objetivoAnual = n(c.objetivo.value) * 12;
      var gastosAnual = n(c.gastos.value) * 12;
      var semanas = Math.max(0, 52 - n(c.vacaciones.value));
      var horasFacturables = semanas * n(c.dias.value) * n(c.horas.value) * (n(c.facturable.value) / 100);

      /* Hay que facturar por encima del objetivo para cubrir la retención y
         las cotizaciones, que salen de la misma retención. */
      var cargaTotal = cfg.cotizaciones.salud + cfg.cotizaciones.afp + cfg.cotizaciones.comisionAfp +
                       cfg.cotizaciones.sis + cfg.cotizaciones.accidentes;
      var cargaEfectiva = cargaTotal * (cfg.coberturaPorDefecto / 100) / 100;
      var brutoNecesario = cargaEfectiva < 1 ? (objetivoAnual / (1 - cargaEfectiva)) + gastosAnual : 0;
      var precioHora = horasFacturables > 0 ? brutoNecesario / horasFacturables : 0;

      salida.innerHTML =
        '<div class="etiqueta">Tu precio por hora mínimo</div>' +
        '<div class="grande">' + pesos(precioHora) + ' <span style="font-size:18px;color:var(--suave)">/ hora</span></div>' +
        '<div class="desglose">' +
        linea('Horas facturables al año', dec.format(horasFacturables) + ' h') +
        linea('Debes facturar al año', pesos(brutoNecesario)) +
        linea('— cubrir gastos fijos', pesos(gastosAnual)) +
        linea('— cubrir cotizaciones (' + dec.format(cargaTotal) + ' % sobre el ' + cfg.coberturaPorDefecto + ' %)', pesos(brutoNecesario - gastosAnual - objetivoAnual)) +
        linea('Te queda limpio al mes', pesos(objetivoAnual / 12), 'total') +
        '</div>' +
        '<p style="font-size:13.5px;color:var(--suave);margin:14px 0 0">Este es tu suelo, no tu tarifa. Por debajo de ' + pesos(precioHora) + ' la hora estás perdiendo plata. Súbelo un 20-30 % para imprevistos y para crecer.</p>';
    }
    calcular();
  }

  function iniciar() { calcBoleta(); calcCotizaciones(); calcIvaCl(); calcHoraCl(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
