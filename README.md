# Autónomo Simple

Calculadoras fiscales y generador de facturas para autónomos en España. Gratis, sin
registro y sin servidor: todo se calcula en el navegador y nada sale de tu equipo.

**Web:** https://xzykzii.github.io/autonomo-simple/

## Herramientas

- **Calculadora de IVA** — añade o quita el 21 %, 10 % o 4 % con el desglose de factura.
- **Retención de IRPF** — cuánto te ingresan tras el IVA y el 15 % (o el 7 %).
- **Cuota de autónomos 2026** — tramos del RETA, base mínima, tipo del 31,5 % y tarifa plana.
- **Precio por hora** — tarifa mínima real contando gastos, cuota, IRPF y horas no facturables.
- **Generador de facturas** — varios conceptos, IVA por línea, retención, PDF e historial local.

## Cómo funciona

HTML, CSS y JavaScript sin dependencias ni compilación. Se abre haciendo doble clic en
`index.html` y se despliega copiando la carpeta a cualquier alojamiento estático.

```
├── index.html                 portada y hub
├── calculadora-iva.html · retencion-irpf.html · cuota-autonomos.html · precio-hora.html
├── generador-facturas.html
├── legal.html · 404.html · robots.txt · sitemap.xml · ads.txt
├── css/style.css              tema claro y oscuro, estilos de impresión
└── js/
    ├── config.js              datos fiscales y configuración del sitio
    ├── app.js                 consentimiento de cookies y bloques comunes
    ├── calculadoras.js        las cuatro calculadoras
    └── facturas.js            generador de facturas
```

## Actualización anual

Las cifras fiscales viven en `js/config.js` → `window.FISCAL`. Cada enero hay que revisar
`tipoCotizacion` (31,5 % en 2026, con el MEI al 0,9 %) y las bases mínimas de `tramosReta`.
Las cuotas no están escritas en ningún sitio: se calculan `base × tipo`.

## Aviso

Herramienta informativa y orientativa; no es asesoramiento fiscal. El generador de facturas
**no es un software certificado de Veri\*factu**: si tu actividad está obligada a emitir con
un sistema homologado, usa un programa certificado para las facturas definitivas.
