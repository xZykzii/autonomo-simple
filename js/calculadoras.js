/* calculadoras.js — lógica de las 4 calculadoras. Cada página usa la que necesita. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  var num = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function n(v) { var x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : 0; }
  function money(v) { return eur.format(Math.round(v * 100) / 100); }
  window.$fmt = { money: money, num: num, n: n };

  /* Grupos de pastillas: <div class="pastillas" data-pastillas="iva"> con botones data-valor */
  function pastillas(contenedor, alCambiar) {
    contenedor.addEventListener('click', function (ev) {
      var b = ev.target.closest('.pastilla'); if (!b) return;
      $$('.pastilla', contenedor).forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      alCambiar(n(b.dataset.valor), b);
    });
  }
  function valorPastilla(contenedor) {
    var a = $('.pastilla.on', contenedor);
    return a ? n(a.dataset.valor) : 0;
  }
  function pintarPastillas(contenedor, opciones, porDefecto) {
    contenedor.innerHTML = opciones.map(function (o) {
      return '<button type="button" class="pastilla' + (o.valor === porDefecto ? ' on' : '') +
        '" data-valor="' + o.valor + '">' + o.etiqueta + '</button>';
    }).join('');
  }

  function linea(etiqueta, valor, clase) {
    return '<div class="linea ' + (clase || '') + '"><span>' + etiqueta + '</span><strong>' + valor + '</strong></div>';
  }

  /* ===================== 1. CALCULADORA DE IVA ===================== */
  function calcIVA() {
    var raiz = $('#calc-iva'); if (!raiz) return;
    var importe = $('#iva-importe', raiz);
    var tipos = $('#iva-tipos', raiz);
    var modo = $('#iva-modo', raiz);
    var salida = $('#iva-salida', raiz);

    pintarPastillas(tipos, window.FISCAL.iva, 21);
    pastillas(tipos, calcular);
    pastillas(modo, calcular);
    importe.addEventListener('input', calcular);

    function calcular() {
      var imp = n(importe.value);
      var tipo = valorPastilla(tipos);
      var sumar = valorPastilla(modo) === 1;   // 1 = añadir IVA, 0 = quitar IVA
      var base, cuota, total;
      if (sumar) { base = imp; cuota = base * tipo / 100; total = base + cuota; }
      else { total = imp; base = total / (1 + tipo / 100); cuota = total - base; }

      salida.innerHTML =
        '<div class="etiqueta">' + (sumar ? 'Total con IVA' : 'Base sin IVA') + '</div>' +
        '<div class="grande">' + money(sumar ? total : base) + '</div>' +
        '<div class="desglose">' +
        linea('Base imponible', money(base)) +
        linea('IVA (' + tipo + ' %)', money(cuota)) +
        linea('Total factura', money(total), 'total') +
        '</div>';
    }
    calcular();
  }

  /* ============ 2. FACTURA CON IVA E IRPF (lo que cobras de verdad) ============ */
  function calcIRPF() {
    var raiz = $('#calc-irpf'); if (!raiz) return;
    var base = $('#irpf-base', raiz);
    var tIva = $('#irpf-iva', raiz);
    var tIrpf = $('#irpf-tipo', raiz);
    var salida = $('#irpf-salida', raiz);

    pintarPastillas(tIva, window.FISCAL.iva, 21);
    pintarPastillas(tIrpf, window.FISCAL.irpf, 15);
    pastillas(tIva, calcular);
    pastillas(tIrpf, calcular);
    base.addEventListener('input', calcular);

    function calcular() {
      var b = n(base.value);
      var pi = valorPastilla(tIva), pr = valorPastilla(tIrpf);
      var iva = b * pi / 100, ret = b * pr / 100, total = b + iva - ret;

      salida.innerHTML =
        '<div class="etiqueta">Te ingresan en la cuenta</div>' +
        '<div class="grande">' + money(total) + '</div>' +
        '<div class="desglose">' +
        linea('Base imponible', money(b)) +
        linea('+ IVA (' + pi + ' %)', money(iva)) +
        linea('− Retención IRPF (' + pr + ' %)', '−' + money(ret)) +
        linea('Total de la factura', money(total), 'total') +
        '</div>' +
        '<p style="font-size:13.5px;color:var(--suave);margin:14px 0 0">' +
        'Ojo: de ese importe, <strong>' + money(iva) + '</strong> es IVA que no es tuyo — lo liquidarás en el modelo 303. ' +
        'La retención de <strong>' + money(ret) + '</strong> ya la ingresa tu cliente a Hacienda a tu nombre y te la descuentan en la declaración de la renta.</p>';
    }
    calcular();
  }

  /* ===================== 3. CUOTA DE AUTÓNOMOS ===================== */
  function calcCuota() {
    var raiz = $('#calc-cuota'); if (!raiz) return;
    var rend = $('#cuota-rendimiento', raiz);
    var periodo = $('#cuota-periodo', raiz);
    var plana = $('#cuota-plana', raiz);
    var salida = $('#cuota-salida', raiz);
    var tabla = $('#cuota-tabla');   // vive fuera del bloque de la calculadora

    pastillas(periodo, calcular);
    rend.addEventListener('input', calcular);
    plana.addEventListener('change', calcular);

    function tramoDe(mensual) {
      var tramos = window.FISCAL.tramosReta, anterior = 0;
      for (var i = 0; i < tramos.length; i++) {
        if (mensual <= tramos[i].hasta) return { t: tramos[i], desde: anterior, i: i };
        anterior = tramos[i].hasta;
      }
      return { t: tramos[tramos.length - 1], desde: anterior, i: tramos.length - 1 };
    }

    /** Cuota mensual mínima de un tramo = base mínima × tipo de cotización. */
    function cuotaDe(tramo) {
      return tramo.base * window.FISCAL.tipoCotizacion / 100;
    }

    function calcular() {
      var v = n(rend.value);
      var mensual = valorPastilla(periodo) === 12 ? v / 12 : v;
      var info = tramoDe(mensual);
      var cuotaTramo = cuotaDe(info.t);
      var cuota = plana.checked ? window.FISCAL.tarifaPlana : cuotaTramo;
      var anual = cuota * 12;
      var netoDespues = mensual - cuota;

      salida.innerHTML =
        '<div class="etiqueta">Cuota mensual estimada</div>' +
        '<div class="grande">' + money(cuota) + '</div>' +
        '<div class="desglose">' +
        linea('Rendimiento neto mensual', money(mensual)) +
        linea('Tramo aplicable', (info.desde ? '> ' + num.format(info.desde) : 'hasta') + ' – ' +
          (info.t.hasta === Infinity ? 'sin límite' : num.format(info.t.hasta)) + ' € (tabla ' + info.t.tabla + ')') +
        linea('Base mínima de cotización', money(info.t.base)) +
        linea('Tipo aplicado', num.format(window.FISCAL.tipoCotizacion) + ' %') +
        (plana.checked ? linea('Tarifa plana aplicada', money(window.FISCAL.tarifaPlana) + '/mes') : '') +
        linea('Coste anual de cotización', money(anual)) +
        linea('Te queda al mes', money(netoDespues), 'total') +
        '</div>' +
        (plana.checked ? '<p style="font-size:13.5px;color:var(--suave);margin:14px 0 0">La tarifa plana dura 12 meses. A partir del mes 13 pagarías ' +
          money(cuotaTramo) + ' al mes con estos rendimientos.</p>' : '');

      if (tabla) {
        var filas = window.FISCAL.tramosReta.map(function (t, i) {
          var desde = i === 0 ? 0 : window.FISCAL.tramosReta[i - 1].hasta;
          var activo = t === info.t;
          var c = cuotaDe(t);
          return '<tr' + (activo ? ' style="background:var(--acento-suave);font-weight:700"' : '') + '>' +
            '<td>' + num.format(desde) + ' – ' + (t.hasta === Infinity ? '∞' : num.format(t.hasta)) + ' €</td>' +
            '<td>' + t.tabla + '</td>' +
            '<td class="num">' + money(t.base) + '</td>' +
            '<td class="num">' + money(c) + '</td>' +
            '<td class="num">' + money(c * 12) + '</td></tr>';
        }).join('');
        tabla.innerHTML = '<thead><tr><th>Rendimiento neto mensual</th><th>Tabla</th>' +
          '<th class="num">Base mínima</th><th class="num">Cuota/mes</th><th class="num">Cuota/año</th></tr></thead><tbody>' +
          filas + '</tbody>';
      }
    }
    calcular();
  }

  /* ===================== 4. PRECIO POR HORA ===================== */
  function calcHora() {
    var raiz = $('#calc-hora'); if (!raiz) return;
    var campos = {
      objetivo: $('#h-objetivo', raiz),
      gastos: $('#h-gastos', raiz),
      cuota: $('#h-cuota', raiz),
      horas: $('#h-horas', raiz),
      dias: $('#h-dias', raiz),
      vacaciones: $('#h-vacaciones', raiz),
      facturable: $('#h-facturable', raiz),
      irpf: $('#h-irpf', raiz)
    };
    var salida = $('#hora-salida', raiz);
    Object.keys(campos).forEach(function (k) { if (campos[k]) campos[k].addEventListener('input', calcular); });

    function calcular() {
      var objetivoAnual = n(campos.objetivo.value);
      var gastosAnual = n(campos.gastos.value) * 12;
      var cuotaAnual = n(campos.cuota.value) * 12;
      var horasDia = n(campos.horas.value);
      var diasSemana = n(campos.dias.value);
      var semanasVac = n(campos.vacaciones.value);
      var pctFacturable = n(campos.facturable.value) / 100;
      var pctIrpf = n(campos.irpf.value) / 100;

      var semanas = Math.max(0, 52 - semanasVac);
      var horasTrabajadas = semanas * diasSemana * horasDia;
      var horasFacturables = horasTrabajadas * pctFacturable;

      // El objetivo es NETO en el bolsillo: hay que facturar por encima para cubrir el IRPF.
      var brutoNecesario = pctIrpf < 1 ? (objetivoAnual / (1 - pctIrpf)) + gastosAnual + cuotaAnual : 0;
      var precioHora = horasFacturables > 0 ? brutoNecesario / horasFacturables : 0;

      salida.innerHTML =
        '<div class="etiqueta">Tu precio por hora mínimo</div>' +
        '<div class="grande">' + money(precioHora) + ' <span style="font-size:18px;color:var(--suave)">/ hora</span></div>' +
        '<div class="desglose">' +
        linea('Horas facturables al año', num.format(horasFacturables) + ' h') +
        linea('Facturación anual necesaria', money(brutoNecesario)) +
        linea('— cubrir gastos fijos', money(gastosAnual)) +
        linea('— cubrir cuota de autónomos', money(cuotaAnual)) +
        linea('— cubrir IRPF estimado', money(brutoNecesario - gastosAnual - cuotaAnual - objetivoAnual)) +
        linea('Te quedan limpios', money(objetivoAnual), 'total') +
        '</div>' +
        '<div class="rejilla r3 mt">' +
        ['<div class="tarjeta"><div class="etiqueta">Media jornada (4 h)</div><strong style="font-size:22px">' + money(precioHora * 4) + '</strong></div>',
         '<div class="tarjeta"><div class="etiqueta">Jornada (' + num.format(horasDia) + ' h)</div><strong style="font-size:22px">' + money(precioHora * horasDia) + '</strong></div>',
         '<div class="tarjeta"><div class="etiqueta">Iguala mensual</div><strong style="font-size:22px">' + money(brutoNecesario / 12) + '</strong></div>'].join('') +
        '</div>' +
        '<p style="font-size:13.5px;color:var(--suave);margin:14px 0 0">Esto es tu <strong>suelo</strong>, no tu tarifa. Por debajo de ' +
        money(precioHora) + '/h estás perdiendo dinero. Sube un 20-30 % para imprevistos, impagos y crecer.</p>';
    }
    calcular();
  }

  function iniciar() { calcIVA(); calcIRPF(); calcCuota(); calcHora(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
