# Honorarios Simple

Calculadoras para trabajadores independientes en Chile: boleta de honorarios,
retención, cotizaciones y Operación Renta. Gratis, sin registro y sin servidor:
todo se calcula en el navegador y nada sale del equipo del visitante.

**Web:** https://xzykzii.github.io/autonomo-simple/

## Por qué el sitio es chileno

Nació apuntando a autónomos de España el 10 de agosto de 2026. A los trece días,
Search Console decía esto: 14 impresiones, 0 clics, posición media 77. Y las
nueve consultas que generaron esas impresiones eran **todas chilenas**
(«calculadora boleta de honorarios», «retención honorarios 2026»), ninguna
española.

El nicho español está copado por Declarando, TaxScouts, Billin e Infoautónomos,
que llevan años de autoridad. Lo único que Google enganchaba era la guía chilena.
Así que el sitio se giró a Chile: Chile pasó a la raíz y España quedó en `/es/`
en modo mantenimiento.

## Herramientas

- **Boleta de honorarios** — del bruto al líquido y al revés, con selector de año
  (2024–2028) porque la retención cambia todos los años.
- **Retención de honorarios** — la tasa vigente, la tabla completa desde 2020 y
  quién la entera al SII.
- **Operación Renta y cotizaciones** — AFP, salud, SIS y accidentes cruzados con
  lo retenido: si en abril te devuelven o pagas.
- **Gastos** — el 30 % presunto contra los gastos efectivos, y qué cosas *no*
  bajan con gastos.
- **Precio por hora** — la tarifa mínima real contando cotizaciones, gastos y
  horas no facturables.
- **Calculadora de IVA 19 %** — para quien factura, no para quien bolatea.
- **Guía de la boleta de honorarios** — cómo funciona todo junto.

## Estructura

```
/                          Chile (sección principal)
├── index.html             portada
├── boleta-honorarios.html · retencion-honorarios.html · operacion-renta.html
├── gastos-honorarios.html · precio-hora.html · calculadora-iva.html
├── guia-boleta-honorarios.html
├── legal.html · 404.html · robots.txt · sitemap.xml · ads.txt
│
├── es/                    España (mantenimiento, sin trabajo nuevo)
│   └── index.html · generador-facturas.html · cuota-autonomos.html
│       calculadora-iva.html · retencion-irpf.html · precio-hora.html
│
├── cl/                    puentes de las URLs viejas (noindex + canonical)
│
├── css/style.css          tema claro y oscuro, estilos de impresión
└── js/
    ├── config.js          marca, AdSense y analítica (común)
    ├── config-cl.js       cifras tributarias de Chile + monetización
    ├── config-es.js       cifras del RETA + monetización de España
    ├── app.js             analítica, anuncios, afiliados, boletín
    ├── calculadoras-cl.js las cuatro calculadoras chilenas
    ├── calculadoras.js    las cuatro españolas
    └── facturas.js        generador de facturas de España
```

HTML, CSS y JavaScript sin dependencias ni compilación. Se abre haciendo doble
clic en `index.html` y se despliega copiando la carpeta a cualquier alojamiento
estático.

Las páginas de `cl/` y las tres españolas que quedaron en la raíz
(`cuota-autonomos.html`, `retencion-irpf.html`, `generador-facturas.html`) son
puentes: `noindex`, `canonical` al destino y `meta refresh`. GitHub Pages no
permite un 301 de verdad, y esto es lo más parecido que entiende Google. **No
las borres** hasta que Search Console deje de reportar las URLs viejas.

## Medición

- **GA4** `G-8P00CHX189` — se carga siempre, con la IP anonimizada y las señales
  de publicidad desactivadas. Antes estaba detrás del banner de cookies, que es
  como no medir nada.
- **Search Console** sobre `https://xzykzii.github.io/autonomo-simple/` — la
  fuente que importa: impresiones y posición media dicen si esto avanza mucho
  antes que las visitas.

## Monetización

Hoy el sitio **no gana nada, a propósito**:

- `js/config.js` → `window.ADS.cliente` está vacío. Sin ID no se carga AdSense ni
  se pintan huecos. AdSense no aprueba subdominios `github.io` y con este tráfico
  no pagaría; activarlo ahora solo empeora la página.
- Los enlaces «de afiliado» de `config-cl.js` (Nubox, Chipax, Bsale) todavía
  apuntan a la web normal de cada empresa. Hay que escribirles y pedir programa
  de afiliados antes de que esos enlaces valgan algo.
- `window.PRO.checkout` está vacío: el Pack Independiente Pro no existe todavía.

Cuando el banner de cookies no tiene anuncios que consentir, no se muestra.

## Actualización anual

Todas las cifras chilenas viven en `js/config-cl.js` → `window.CL`. Cada enero:

- `retencionBoleta` y `calendarioRetencion` — la ley 21.133 ya deja fijadas las
  tasas hasta 2028, así que hasta entonces basta con mover `retencionBoleta`.
- `aniosSelector` — qué años ofrece el selector de la calculadora.
- `cobertura` y `coberturaPorDefecto` — suben hasta el 100 % obligatorio en 2028.
- `topeImponibleAnual` — cambia con la UF.
- La tabla de `retencion-honorarios.html` está escrita en HTML a propósito, para
  que Google la lea sin ejecutar JavaScript. Si cambia el calendario, hay que
  tocarla a mano además del config.

Las cifras españolas están en `js/config-es.js` → `window.FISCAL`.

## Lo siguiente, por orden

1. **Dominio propio** (~10 USD/año). Es requisito práctico para AdSense y quita
   el `/autonomo-simple/` de la URL. Al migrar: cambiar `SITE.dominio`, todos los
   `canonical`, el `sitemap.xml` y verificar el dominio nuevo en Search Console.
2. **Escribir**. Lo que ranquea son guías, no calculadoras sueltas. Los temas con
   demanda visible: cómo emitir la boleta paso a paso, qué pasa si no cotizo,
   boleta de honorarios electrónica, primer trabajo a honorarios.
3. **Generador de cotizaciones (presupuestos)**. Los independientes chilenos
   mandan cotizaciones todo el tiempo y no hay restricción legal como con las
   boletas. Se puede reutilizar buena parte de `facturas.js`.
4. **Reevaluar a los 90 días** con Search Console. Umbral: si no se pasa de ~100
   impresiones al día y posición media por debajo de 30, esto no despega y toca
   decidir si sigue.

## Aviso

Herramientas informativas y orientativas; no son asesoría tributaria. Las cifras
oficiales están en el SII y la Superintendencia de Pensiones, y cambian.
