# Investigación: fuente real de precios de segunda mano

Fecha de la revisión: 9 de octubre de 2026.

Este documento no conecta ninguna API. No hay claves, llamadas a eBay ni precios de catálogo. La PR #92 (abierta) hace que `/segunda-mano/` lea `getSecondHandProducts()`; mientras el default siga siendo `emptySecondHandDataSource`, las métricas permanecen en `null`.

La pregunta de esta revisión es si Trendiverse puede conectar la Browse API. Que un campo venga en la respuesta no autoriza a mostrarlo, guardarlo, transformarlo ni agregarlo.

## Cómo leer el estado de cada dato

| Marca | Significado |
| --- | --- |
| Confirmado | Aparece en documentación oficial consultada en esta revisión. |
| Requiere contacto/autorización | La vía existe, pero el alta, el mercado o el permiso escrito no están concedidos. |
| No confirmado | No hay documentación oficial que lo acredite. No se usa como argumento. |

No se propone scraping como vía de integración.

## Contrato que ya existe

`SecondHandDataSource.getProductData(productId)` devuelve una observación o `null`. `validateObservation` exige precio positivo, moneda ISO 4217, URL http(s), fecha parseable, fuente y `productId`. `observationToMetrics` rellena `usedPrice`, `newPrice` (precio de referencia), `savings` (solo si la referencia es mayor), `currency`, `source` y `updatedAt`. `score` y `trend` se quedan en `null`.

Los 18 slugs editoriales no cambian: `iphone`, `macbook`, `ipad`, `apple-watch`, `samsung-galaxy`, `playstation-5`, `nintendo-switch`, `xbox`, `steam-deck`, `zapatillas`, `bolsos`, `ropa-vintage`, `aspiradores`, `cafeteras`, `muebles`, `bicicletas`, `material-fitness`, `material-outdoor`.

## Criterios de selección

Una fuente entra en la lista corta solo si cumple las cinco columnas. Un fallo en legal o en España/EUR la saca de la primera integración aunque el dato técnico sea bueno.

| Criterio | Qué tiene que poder demostrar |
| --- | --- |
| Calidad | Precio de una oferta real, fecha de la observación, condición, y más de una oferta si más adelante se autoriza un mínimo y un máximo. |
| Cobertura | Mercado España o europeo usable desde España, EUR, y hueco para el catálogo actual. Tecnología sola no cubre moda, hogar ni deporte. |
| Técnica | API o feed oficial, documentación, límites conocidos o consultables, errores explícitos y caché compatible con la licencia. |
| Legal | Derecho a mostrar el precio, a guardarlo el tiempo que la licencia permita, atribución y uso comercial de un medio. |
| Producto | URL pública, nombre de la fuente visible, y campos que más adelante permitan ahorro y score sin inventarlos y solo si la licencia lo permite. |

## Matriz

Sin puntuación. El estado de integración de todas es «no conectada».

| Fuente | Tipo confirmado | España / EUR | Usado o reacondicionado | Mostrar el precio en Trendiverse | Encaje con el catálogo | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| eBay Browse API + Partner Network | API oficial de búsqueda para compradores. Confirmado | `EBAY_ES` en el enum oficial. Confirmado. Que cada precio venga en EUR: No confirmado; hay que leer `currency` | IDs documentados. Qué ID admite cada categoría de `EBAY_ES`: No confirmado | Solo un anuncio público, aislado de contenido que no sea de eBay, con menos de 6 horas de antigüedad respecto al sitio. Ahorro, mínimo, máximo y score: Requiere contacto/autorización | Mercado general. Que una búsqueda concreta sea útil: No confirmado; no se ha llamado a la API | Primera a investigar, detrás del gate |
| Refurbed Affiliate Partner API | API oficial de afiliados. Confirmado | Mercado `ES` no enumerado. Requiere contacto/autorización | Grading A/B/C y garantía en el buy box. Confirmado | Requiere contacto/autorización | Electrónica reacondicionada. Moda, hogar y deporte no están en el contrato | Segunda alternativa |
| Amazon Creators API | API oficial de afiliados; PA-API 5 deprecada. Confirmado | `www.amazon.es`, idioma `es_ES`, moneda `EUR`. Confirmado | `Used` y `Refurbished` documentados. Confirmado | Solo si el programa de Associates lo permite y la aplicación dirige la venta a Amazon. Requiere contacto/autorización | Catálogo amplio, con más oferta nueva que de particulares | Alternativa en paralelo. No sustituye a eBay |
| Awin, anunciante rebuy | Feed oficial de afiliado. Confirmado | Documentado DE/AT, no España. Confirmado como DE/AT | Tienda de reacondicionados | Sí, dentro del programa y con el enlace de afiliado. Requiere contacto/autorización para el alta | Electrónica y medios. No es el mercado español | Reserva, no primera |
| Back Market API | API oficial de vendedores. Confirmado | Mercados por `Accept-Language`. España como contrato de publisher: No confirmado | Listados del propio vendedor | No hay API de publisher confirmada | Electrónica | Descartada para esta fase |
| Wallapop Connect | API oficial de vendedores. Confirmado | España, Italia y Portugal. Confirmado | Anuncios propios | No expone el catálogo ajeno. Confirmado | Todas, pero solo el inventario del token | Descartada para leer precios de mercado |
| Vinted Pro Integrations | API oficial con allowlist. Confirmado | EEE, incluida España como producto | Inventario Pro | Allowlist y cuenta Pro. No es un índice público | Sobre todo moda | Descartada como primera fuente |
| Keepa API | API de pago documentada. Confirmado | Dominio `9` = `es`. Confirmado | Historial `USED` y `REFURBISHED`. Confirmado | El contrato prohíbe publicarlo sin consentimiento escrito. Confirmado | Solo Amazon | Descartada salvo consentimiento |
| CeX / WeBuy | No hay API oficial de desarrolladores localizada. No confirmado | España existe como tienda | Precios de tienda | No confirmado | Electrónica y gaming | Descartada |
| Swappie | No hay API oficial localizada. No confirmado | Tienda europea | Reacondicionados propios | No confirmado | Móviles | Descartada |

eBay sigue primero. Amazon España ya está confirmado en Creators API, y eso no cambia el orden: Browse es una API de búsqueda de anuncios de un marketplace general, con condiciones de usado y reacondicionado documentadas. Creators API es una API de afiliados cuyo fin declarado es dirigir la venta a Amazon. Las dos tienen restricciones de licencia. Las de eBay, leídas abajo, son un gate, no un motivo para cambiar de fuente.

## eBay Browse API

Primera fuente a investigar. Nada de esta sección está implementado.

| Campo | Estado | Marca |
| --- | --- | --- |
| Nombre | eBay Browse API, especificación OpenAPI 3.1, baseline v1.20.4, con eBay Partner Network para la comisión | Confirmado |
| URL | [Browse API](https://developer.ebay.com/develop/api/buy/browse_api.md), [OpenAPI](https://developer.ebay.com/develop/api/spec/browse_api.json), [guía Browse](https://developer.ebay.com/api-docs/buy/static/api-browse.html), [filtros](https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html), [IDs de condición](https://developer.ebay.com/api-docs/sell/static/metadata/condition-id-values.html) | Confirmado |
| Integración | REST. `GET /buy/browse/v1/item_summary/search`. Application access token por client credentials | Confirmado |
| Mercado | `MarketplaceIdEnum` incluye `EBAY_ES` y lo describe como el sitio de España (`ebay.es`). Fuera de EE. UU. el header `X-EBAY-C-MARKETPLACE-ID` es obligatorio. Si falta o es inválido, el default es `EBAY_US` | Confirmado |
| Moneda | `Amount.currency` es un código ISO 4217 y `value` es el importe en esa moneda. El adapter tiene que leer el código. Que todo precio de `EBAY_ES` sea EUR no está escrito en el enum | No confirmado |
| Precio de búsqueda | En `ItemSummary`, `price` es el precio del artículo después de convertirse a otra moneda, e incluye IVA en jurisdicciones aplicables si se pide el marketplace soportado. En `Item`, `price` es el coste del artículo, sin descuentos ni envío | Confirmado |
| Precio original | `marketingPrice` aparece si el artículo tiene un descuento del vendedor e incluye el precio original y el descuento. No es un precio nuevo de otra tienda | Confirmado |
| Límite de página | `limit` mínimo 1, máximo 200, default 50. El conjunto de resultados de una búsqueda llega a 10.000 ítems. `q` se trunca a 100 caracteres y no admite comodín | Confirmado |
| Cupo de llamadas | El markdown de Browse remite a la página API Call Limits. Esa página devolvió error en esta revisión. El acuerdo de 2018, apartado 9.13, prohíbe un volumen de peticiones que exceda lo razonable o contradiga la documentación. La cifra diaria de Browse no se copia aquí | No confirmado |
| Condición | `condition` y `conditionId` vienen en cada `ItemSummary`. El ejemplo oficial de `1000` es `NEW`. La lista puede cambiar y la aplicación tiene que tolerarlo | Confirmado |
| URL pública | `itemWebUrl` es la ficha. Para cobrar comisión hay que reenviar al comprador con `itemAffiliateWebUrl` | Confirmado |
| Cuándo vuelve la URL de afiliado | Solo si el marketplace forma parte del Partner Network y la petición incluye `X-EBAY-C-ENDUSERCTX`. La especificación dice que Singapur (`EBAY_SG`) no está soportado. No dice que `EBAY_ES` esté excluido. La lista viva de países del programa está en el artículo de ayuda del Partner Network, que en esta revisión no devolvió el cuerpo del artículo | `EBAY_SG` excluido: Confirmado. `EBAY_ES` dentro del programa: No confirmado |
| Header de afiliado | La guía Browse documenta `X-EBAY-C-ENDUSERCTX` con `affiliateCampaignId` obligatorio (número de 10 dígitos que da el Partner Network, el `campid` del enlace) y `affiliateReferenceId` opcional (máximo 256 caracteres, el `customid`). Sirve para que la búsqueda devuelva `itemAffiliateWebUrl`. `contextualLocation` es otro uso del mismo header, para estimación de envío, y hay que codificarlo | Confirmado |
| Alta de producción y de EPN | Tener documentación no es tener claves de producción ni una campaña de afiliado | Requiere contacto/autorización |

El texto de la especificación dice que `itemAffiliateWebUrl` se devuelve si «el vendedor habilita el seguimiento de afiliado incluyendo el header». El header lo envía la aplicación, no el vendedor: así lo describe la guía Browse. Se implementa la guía. No se interpreta la frase de la especificación como un permiso del vendedor que Trendiverse no controla.

## Licencia, frescura y qué se puede hacer con el dato

Se han leído dos PDF oficiales:

- [API License Agreement de junio de 2018](https://developer.ebay.com/cms/files/api_license_2018-10-26.pdf), fechado el 13 de junio de 2018. Es el texto más reciente que esta revisión pudo leer.
- [API License Agreement de 2009](https://developer.ebay.com/devzone/license-agreement/api_license_agreement.pdf), fechado el 4 de febrero de 2009. Coincide en la regla de antigüedad.

La página HTML `https://developer.ebay.com/join/api-license-agreement` devolvió error. No se confirma que el clickwrap vigente sea idéntico al PDF de 2018. Al darse de alta hay que contrastar el texto que se firma. Esa comprobación es Requiere contacto/autorización. Mientras tanto, el máximo que sí está escrito en los dos PDF es el que sigue.

### Frecuencia técnica y máximo de licencia

Son dos cosas distintas. La licencia no fija cada cuánto hay que llamar a la API. Fija cuánto puede envejecer lo que se muestra.

| Qué | Regla | Marca |
| --- | --- | --- |
| Máximo para información de un anuncio mostrada | No puede ser más de seis horas más antigua que la información mostrada en el sitio de eBay. Apartado 8.1.c del acuerdo de 2018 y apartado 3.1.3 del acuerdo de 2009 | Confirmado |
| Máximo para el resto de eBay Content mostrado | No más de veinticuatro horas más antiguo que el contenido del sitio | Confirmado |
| Si el anuncio mostrado no está tan al día como el del sitio | Hay que indicar en la aplicación cuánto más antiguo es, aunque siga dentro de las seis horas | Confirmado |
| Intervalo de sondeo | La licencia no impone un intervalo. Cualquier job es una propuesta técnica y tiene que dejar el anuncio mostrado dentro del máximo de seis horas | Confirmado que no hay un intervalo obligatorio. La cifra del job no es una autorización |
| Propuesta técnica, si el gate se cumple | Refrescar con margen dentro de esas seis horas y dejar de mostrar el precio en cuanto la observación las supere. No hay ventana extra si el refresco falla | Propuesta técnica. No es una cláusula de la licencia |
| Propuesta anterior de 12 horas de refresco y 48 horas de dato caducado | Queda retirada. Supera el máximo de un anuncio mostrado | No autorizada |

Un precio de anuncio es información de anuncio, no «otro eBay Content». El máximo aplicable al precio que Trendiverse enseñaría es de seis horas, no de veinticuatro.

### Guardar, mostrar, transformar y agregar

| Uso que Trendiverse se plantea | Qué dice el texto leído | Marca |
| --- | --- | --- |
| Mostrar el precio de una oferta de eBay | El apartado 8.1.b permite un Public Display del contenido que ya es público, para promover eBay y permitir buscar y navegar anuncios. Hay que borrarlo cuando deje de ser público, no mezclarlo con contenido que no sea de eBay y cumplir la antigüedad del 8.1.c. Mostrar el precio dentro de una ficha editorial, al lado de un precio de otra tienda o de un score de Trendiverse, no es ese Public Display | El derecho acotado está Confirmado. El uso mezclado no está concedido |
| Guardar temporalmente ese precio | El apartado 9.8 prohíbe copiar, almacenar o modificar eBay Content salvo para los fines que los términos permiten. El único encaje leído es el almacenamiento necesario para el Public Display permitido, dentro de la antigüedad del 8.1.c, y el borrado cuando el anuncio deje de ser público (8.1.b.1). No hay una cláusula que autorice un almacén de 12 horas, de 48 horas ni una serie histórica | Confirmado como límite. Un almacén más amplio es Requiere contacto/autorización |
| Calcular el ahorro frente a un precio de referencia | El apartado 8.1.b.2 prohíbe combinar eBay Content con contenido que no sea de eBay. El apartado 9.6 prohíbe usar eBay Content, solo o junto con información de terceros, para sugerir o modelar precios de artículos listados en eBay. Un ahorro es una cifra derivada. Si la referencia no es de eBay, además mezcla fuentes. `marketingPrice` es un descuento del propio vendedor, no un precio nuevo de referencia de Trendiverse | Requiere contacto/autorización |
| Calcular agregados como mínimo y máximo | El apartado 8.1.e prohíbe mostrar una página servida por eBay dentro de un agregado de páginas (framing o mirroring). Eso no es lo mismo que calcular un mínimo. El apartado 8.1.d exige permiso escrito previo para derivar estadísticas de sitio, precio medio de venta o mercancía bruta de cualquier categoría, y otros agregados de vendedores, compradores y transacciones. Un mínimo o un máximo publicado no está permitido de forma expresa | Requiere contacto/autorización |
| Construir después un Second-Hand Score | Usaría el precio para modelar otro número (9.6), podría derivar una estadística de rendimiento (8.1.d y 9.5) y exigiría guardar una serie más antigua que el máximo de exhibición. `score` y `trend` siguen en `null` por el contrato de datos, con independencia de esta licencia | Requiere contacto/autorización |
| Mostrar esos datos junto a un enlace de afiliado | Para cobrar comisión hay que usar `itemAffiliateWebUrl`, y para obtenerla hay que enviar el header de EPN. El enlace no levanta las prohibiciones de mezcla, de modelado de precios ni de derivación. Mostrar el precio del propio anuncio, aislado, con su URL de afiliado y dentro de las seis horas, cabe en promover eBay. Mostrar ahorro, mínimo, máximo o score al lado del enlace no queda autorizado porque el enlace exista | El requisito de la URL está Confirmado. El resto de cifras al lado del enlace es Requiere contacto/autorización |

Hasta que el punto «permiso para el uso» del gate esté resuelto, el adapter no debe rellenar `usedPrice`, `newPrice`, `savings`, `minPrice` ni `maxPrice`.

## Condiciones de eBay

La página oficial de IDs dice tres cosas que no se pueden fundir en una sola:

- Los identificadores numéricos se usan de forma consistente para condiciones parecidas en todos los mercados y categorías. Por ejemplo, `1000` es siempre el identificador de un artículo nuevo en su embalaje de venta. Confirmado.
- Los nombres visibles y el subconjunto de condiciones admitidas cambian según la categoría. Confirmado.
- Las definiciones de esa página están basadas en el mercado de EE. UU. Las de España están en `http://pages.ebay.es/help/sell/item-condition.html`. Esta revisión no ha leído esa página de ayuda. Qué ID admite hoy una categoría de `EBAY_ES` es No confirmado.

`2000`, `2010`, `2020` y `2030` (reacondicionado certificado, excelente, muy bueno y bueno) están limitados a un conjunto de mercados y categorías, y el vendedor tiene que superar una cualificación. No están disponibles de forma universal. Confirmado como limitación. `2500` (reacondicionado por el vendedor) ha sido sustituido por `2010`, `2020` y `2030` en un conjunto de mercados y categorías. `2990` y `3010` solo existen en categorías de ropa. `7000` solo está soportado en categorías donde las piezas o los artículos que no funcionan interesan a quien repara o colecciona. Confirmado.

La sintaxis del filtro sí está documentada: `filter=conditionIds:{1000|1500}`, con varios IDs separados por `|`. El filtro `conditions` solo distingue `NEW`, `USED` y `UNSPECIFIED` y no devuelve una condición fina. Confirmado. Qué IDs acepta `EBAY_ES` en cada categoría no se deduce de esa sintaxis.

`filter=buyingOptions:{FIXED_PRICE}` está definido a nivel de categoría hoja y, si se usa con una categoría de nivel superior, no filtra. Confirmado. Una búsqueda solo por texto, sin categoría hoja, no puede apoyarse en ese filtro.

Normalización propuesta, solo si el `conditionId` viene en la oferta y la categoría y el mercado lo admiten. No es una lista de IDs disponibles.

| conditionId documentado | Normalización propuesta | Publicar como precio usado |
| --- | --- | --- |
| 1000, 1500, 1750 | `new` | No |
| 2750, y 2000, 2010 o 2500 solo donde esa categoría y ese mercado los admitan | `like-new` | Solo tras verificar la categoría |
| 2020, 3000, 4000, y 2990 solo en ropa donde exista | `good` | Solo tras verificar la categoría |
| 2030, 5000, y 3010 solo en ropa donde exista | `fair` | Solo tras verificar la categoría |
| 6000, 7000 | `poor` | Solo si la categoría admite ese ID. `7000` no debe tratarse como un usado funcional |
| Cualquier otro, ausente o no admitido por la categoría | `unknown` | No |

Si la condición no se puede normalizar a un valor compatible con usado o reacondicionado para esa categoría y ese mercado, no se publica el precio. Un ID documentado en la tabla de EE. UU. no basta.

## Refurbed Affiliate Partner API

Segunda alternativa, para electrónica reacondicionada.

| Campo | Estado | Marca |
| --- | --- | --- |
| Nombre | Refurbed Affiliate Partner API | Confirmado |
| URL | [Repositorio público](https://gitlab.com/refurbed-community/public-apis) y el README de `refurbed_partner_affiliate_api` | Confirmado |
| Integración | gRPC o HTTP generado desde el OpenAPI oficial. Host de producción `api.refurbed.com:443` | Confirmado |
| Autenticación | `Authorization: Plain <token>`. El token lo da el account manager. Contacto publicado: integrations@refurbed.com | Confirmado el mecanismo. El alta es Requiere contacto/autorización |
| Límites | El swagger oficial fija la paginación entre 1 y 100. Superar 100 es `INVALID_ARGUMENT`. No publica un cupo de llamadas por minuto | Confirmado el tope de página. El cupo es No confirmado |
| Mercados | Hay que pasar `site_market_code`. La lista sale de `MarketService`. El README y el swagger oficial consultados no contienen el literal `ES` | Requiere contacto/autorización |
| Moneda | `currency_code` ISO 4217 en el buy box. El precio viaja como string decimal de hasta 2 decimales | Confirmado |
| Condición | `OfferGrading` oficial: `A`, `B`, `C`, más `grading_name` y garantía | Confirmado |
| URL | Enlace de marketplace en el buy box. `back_link` añade un parámetro hacia el sitio del partner | Confirmado |
| Caché y uso comercial | No hay TTL publicado en el README. El permiso de mostrar el precio sale del acuerdo de partner, que no es público | Requiere contacto/autorización |

No cubre moda, hogar ni deporte. El grading A/B/C habría que mapearlo a `like-new`, `good` o `fair` con una tabla explícita, no por intuición.

## Amazon Creators API

Alternativa, no primera fuente. España ya no es una incógnita.

| Campo | Estado | Marca |
| --- | --- | --- |
| Nombre | Amazon Creators API. Sustituye a Product Advertising API 5.0 | Confirmado |
| España | La página oficial de locale ES fija el marketplace `www.amazon.es`, el idioma por defecto `es_ES` y la moneda por defecto `EUR`. Los índices de búsqueda incluyen Electronics, Computers, VideoGames, Fashion, Shoes, HomeAndKitchen y SportsAndOutdoors | Confirmado |
| URL | [Locale ES](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/locale-reference/spain), [GetItems](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/get-items), [OffersV2](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/offersV2), [buenas prácticas](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/best-programming-practices) | Confirmado |
| Condición | `OffersV2` documenta `New`, `Used`, `Refurbished` y subcondiciones `LikeNew`, `VeryGood`, `Good`, `Acceptable`, `Refurbished`, `OpenBox` | Confirmado |
| Autenticación | Cuenta de Associates, partner tag y token. El token de acceso dura 1 hora (`expires_in` 3600) y las buenas prácticas mandan reutilizarlo hasta que caduque | Confirmado |
| Uso comercial | La aplicación tiene que dirigir las ventas a Amazon. Un uso que no cumpla las condiciones puede bloquearse. No se altera el enlace devuelto | Confirmado |
| Caché de precios | Esta revisión no ha extraído un TTL de precios del acuerdo de Creators API. La página de buenas prácticas solo fija la caché del token | No confirmado |
| Límites | Las buenas prácticas hablan de un cupo en transacciones por segundo, sin publicar la cifra asignada a una cuenta nueva | No confirmado |
| Alta | Hace falta cuenta de Associates en el marketplace que se use | Requiere contacto/autorización |

PA-API 5 está deprecada. No se usa como diseño. El scratchpad histórico de España no sustituye a la página de locale de Creators API, que ya confirma `www.amazon.es`.

## Fuentes descartadas

**Keepa.** API oficial, dominio `9` para `es`, historial `USED` (índice 2 del csv) y `REFURBISHED` (índice 6), precios en la unidad menor de la moneda. El apartado 18.7 de las condiciones del 27 de agosto de 2026 permite guardar el dato solo para uso interno y, sin consentimiento escrito, prohíbe publicarlo o usarlo como parte de un producto ofrecido a terceros. Mostrar el precio en Trendiverse choca con esa cláusula. Queda fuera salvo un permiso escrito. Confirmado.

**Back Market.** [api.backmarket.dev](https://api.backmarket.dev/) documenta una API de vendedores: token del back office, `Accept-Language` para el mercado y listados propios. No es una API de publisher. No se usa para leer el catálogo y republicarlo. Confirmado.

**Wallapop Connect.** [developers.wallapop.com](https://developers.wallapop.com/) documenta OAuth para que un vendedor publique y gestione sus anuncios en España, Italia y Portugal. `GET /items` devuelve el inventario de ese token, no el mercado. Confirmado.

**Vinted Pro.** [pro-docs.svc.vinted.com](https://pro-docs.svc.vinted.com/) limita la API a negocios Pro en allowlist. No es un índice público de precios. Las APIs de terceros que extraen el catálogo web no son una integración autorizada. Confirmado.

**rebuy vía Awin.** [rebuy.de/s/partner-programm](https://www.rebuy.de/s/partner-programm) confirma feeds de producto para publishers aceptados. El perfil de Awin consultado es DE/AT. Sirve como reserva europea de electrónica, no como fuente de España. Confirmado.

**CeX.** No aparece una documentación oficial de desarrolladores. Los envoltorios públicos describen endpoints no oficiales. Fuera. No confirmado como API oficial.

**Swappie.** No se localizó API ni feed en un sitio oficial de Swappie. Los listados de redes de afiliados de terceros no cuentan como confirmación. No confirmado.

## Arquitectura prevista

Sigue el contrato actual. La página no conoce al proveedor. El dibujo es un diseño, no una autorización para agregar precios.

```text
eBay Browse API
       ↓
cliente HTTP (solo servidor)
       ↓
EbaySecondHandSource implements SecondHandDataSource
       ↓
una observación, solo si el gate lo permite
       ↓
validateObservation / observationToMetrics
       ↓
getSecondHandProducts()
       ↓
ProductCard
```

Piezas, todas en el servidor y sin librerías nuevas, y solo después del gate:

| Pieza | Responsabilidad |
| --- | --- |
| Cliente HTTP | Token, timeout, reintentos. `fetch` nativo |
| Adapter | Traduce una respuesta de eBay a `RawSecondHandObservation` o devuelve `null` |
| Mapeo | Slug de Trendiverse → identificador verificado por una persona |
| Normalizador | El que ya existe: `validateObservation`, `normalizeCondition`, `observationToMetrics` |
| Caché | Solo el anuncio que se va a mostrar, dentro del máximo de seis horas, y borrado cuando deje de ser público |
| Límite | Cola del job. La página nunca llama a eBay |
| Configuración | Variables de entorno. Ningún secreto en el cliente |

`getSecondHandProducts()` mantiene el default vacío hasta que el adapter esté probado y el gate cumplido. Las páginas de la PR #92 no se tocan.

No se implementa la agregación de la primera página de resultados. Elegir el menor precio, calcular `minPrice` y `maxPrice`, o usar un precio de otra fuente como referencia son usos del apartado anterior que requieren permiso escrito. Si ese permiso no llega, la única observación candidata sería el precio de un anuncio concreto ya identificado, aislado visualmente del resto de la ficha, con `itemAffiliateWebUrl`, condición compatible y menos de seis horas de antigüedad. `sourceUrl` no puede caer en `itemWebUrl` si lo que se quiere es la comisión: sin URL de afiliado no hay comisión. `observedAt` sería el instante de la respuesta, no la fecha de creación del anuncio. Si la oferta no cumple, `null`.

## Mapeo de productos

No hay ePID, GTIN ni ASIN en este repositorio. Inventarlos publicaría un precio del modelo equivocado. La estructura prevista:

```ts
interface SecondHandSourceProductMapping {
  productId: string
  sourceId: 'ebay' | 'refurbed'
  externalProductId: string | null
  searchQuery: string | null
}
```

`productId` es el slug editorial. `externalProductId` queda `null` hasta que una persona compruebe un ePID o un GTIN en el catálogo de la fuente. `searchQuery` es solo la consulta inicial, tomada del nombre que ya publicamos, no un identificador externo.

| productId | Consulta inicial | externalProductId | Nota |
| --- | --- | --- | --- |
| iphone | iPhone | null | Hay que fijar generación antes de mostrar un precio |
| macbook | MacBook | null | Igual |
| ipad | iPad | null | Igual |
| apple-watch | Apple Watch | null | Igual |
| samsung-galaxy | Samsung Galaxy | null | Gama demasiado amplia para un solo precio |
| playstation-5 | PlayStation 5 | null | Separar modelo con lector y Digital cuando exista ID |
| nintendo-switch | Nintendo Switch | null | Separar OLED y Lite cuando exista ID |
| xbox | Xbox | null | Separar Series X y Series S cuando exista ID |
| steam-deck | Steam Deck | null | Separar capacidad cuando exista ID |
| zapatillas | zapatillas | null | eBay sí, si el gate se cumple. Refurbed no aplica |
| bolsos | bolsos | null | eBay sí, si el gate se cumple. Refurbed no aplica |
| ropa-vintage | ropa vintage | null | eBay sí, si el gate se cumple. Refurbed no aplica |
| aspiradores | aspiradora | null | eBay sí, si el gate se cumple |
| cafeteras | cafetera | null | eBay sí, si el gate se cumple |
| muebles | muebles | null | El precio de ítem no incluye el envío |
| bicicletas | bicicleta | null | eBay sí, si el gate se cumple |
| material-fitness | material fitness | null | eBay sí, si el gate se cumple |
| material-outdoor | material outdoor | null | eBay sí, si el gate se cumple |

Mientras `externalProductId` sea `null`, el adapter devuelve `null` aunque una búsqueda tuviera resultados. Así no se publica un precio de un modelo no revisado.

## Caché y fallos

No se implementa. Cuando el gate se cumpla, el diseño tiene que separar el máximo de la licencia de la frecuencia del job.

| Decisión | Qué queda fijado | Marca |
| --- | --- | --- |
| Máximo de un precio de anuncio mostrado | Seis horas respecto al sitio de eBay, y aviso si no está tan al día como la ficha | Confirmado en la licencia |
| Máximo de otro eBay Content mostrado | Veinticuatro horas | Confirmado en la licencia |
| Frecuencia técnica propuesta | Un job, no la petición de la página, con margen dentro de las seis horas. La cifra exacta del cron no la da la licencia | Propuesta técnica |
| Si el refresco falla | Se deja de mostrar el precio al llegar al máximo de seis horas. No se conserva 48 horas | Exigido por el máximo de licencia |
| Dato que ya no es público | Se borra | Confirmado, apartado 8.1.b.1 |
| Error de API | El adapter devuelve `null`. `getSecondHandMetrics` ya trata el error como ausencia de dato | El contrato actual está Confirmado. El adapter no existe |
| Dónde guardar, si se autoriza el uso | KV `CACHE` que el proyecto ya contempla, clave `second-hand:ebay:<productId>`, sin serie histórica | Propuesta técnica, condicionada al 9.8 |
| Quién llama | La página nunca llama a eBay | Propuesta técnica |

`observedAt` de la observación guardada sería la del refresco, para que la tarjeta pueda enseñar la antigüedad real. Timeout, reintentos ante un 429 y la cifra del cron se eligen en la implementación, siempre por debajo del máximo de seis horas. No se fijan aquí como si la licencia los hubiera dado.

## Credenciales

Solo en el entorno del servidor de Cloudflare. Nunca en git, en `NEXT_PUBLIC_*` ni en una URL pública. Ninguna de estas variables existe todavía en el deploy.

| Variable | Uso | Marca |
| --- | --- | --- |
| `EBAY_CLIENT_ID` | Client credentials | Propuesta. El alta es Requiere contacto/autorización |
| `EBAY_CLIENT_SECRET` | Client credentials | Igual |
| `EBAY_ENV` | `sandbox` o `production` | Propuesta |
| `EBAY_MARKETPLACE_ID` | `EBAY_ES` | El valor del enum está Confirmado. Configurarlo es parte del gate |
| `EBAY_PARTNER_CAMPAIGN_ID` | `affiliateCampaignId` del header `X-EBAY-C-ENDUSERCTX`. Diez dígitos que entrega EPN | El nombre del campo está Confirmado. El valor es Requiere contacto/autorización |

El token OAuth vive en memoria del job el tiempo que indique la respuesta. No se escribe en el HTML. Refurbed, si se abre después, usaría `REFURBED_AFFILIATE_TOKEN` con la misma regla.

## Second-Hand Score

No se calcula. `observationToMetrics` lo deja en `null` y así debe seguir.

La licencia, además, no autoriza derivar ese número del contenido de eBay. Aunque más adelante hubiera una serie propia, publicarla como score a partir de precios de eBay sigue en Requiere contacto/autorización.

Para un score defendible haría falta, por producto y durante varias semanas, y solo con datos cuyo uso esté permitido:

| Dato | Para qué | ¿Lo da la primera fuente? |
| --- | --- | --- |
| Precio usado | Base | El campo existe. Mostrarlo y guardarlo para una serie: Requiere contacto/autorización, salvo el Public Display acotado |
| Precio nuevo de referencia | Ahorro | `marketingPrice` es un descuento del vendedor, no un precio de otra tienda. Combinarlo con un precio ajeno: Requiere contacto/autorización |
| Descuento | Derivado, no un input distinto | Requiere contacto/autorización |
| Condición | No mezclar «para piezas» con «como nuevo» | El campo existe. La disponibilidad por categoría es No confirmado |
| Liquidez | Número de ofertas y de vendedores | Un total de búsqueda puede servir para derivar una estadística. Requiere contacto/autorización |
| Antigüedad del aparato | Edad del producto | No confirmado. `itemCreationDate` es la alta del anuncio |
| Tendencia | Variación del precio en el tiempo | No. Exige una serie. Keepa la tiene y no podemos publicarla |
| Número de observaciones | Robustez | La nuestra, si el almacenamiento de una serie estuviera autorizado |
| Fecha de actualización | Caducidad | Sí, el instante de la respuesta, dentro del máximo de seis horas |

Hasta tener permiso, serie y fórmula escrita, el score publicado es `null`.

## Qué queda fuera de esta PR

- Cualquier cliente HTTP real, secreto o variable de entorno en el deploy.
- Precios, ePID, GTIN o ASIN.
- Cambios de UI.
- Merge de la PR #92.
- Dependencias nuevas.

## Gate antes de implementar eBay

No se escribe el adapter hasta que se cumplan estas condiciones.

1. Acceso de producción. Hay claves de producción de la Browse API, no solo documentación ni sandbox. Requiere contacto/autorización.
2. Autorización de EPN. Hay un `affiliateCampaignId` de diez dígitos y el marketplace que se vaya a usar está dentro del Partner Network. El header y el campo están Confirmados. La campaña y la inclusión de `EBAY_ES` en el programa son Requiere contacto/autorización.
3. `EBAY_ES`. Toda llamada lleva `X-EBAY-C-MARKETPLACE-ID: EBAY_ES`. Sin ese header el default es `EBAY_US`. El enum está Confirmado. Usarlo en producción es parte de este gate.
4. Política de frescura y caché. Lo que se muestre de un anuncio no supera las seis horas respecto al sitio de eBay, se indica si no está tan al día como la ficha, el resto de eBay Content no supera las veinticuatro horas, y el dato se borra cuando deja de ser público. Un refresco de doce horas o una retención de cuarenta y ocho no cumplen esta condición.
5. Permiso para el uso que hace Trendiverse de los datos. Antes del adapter queda escrito qué uso está cubierto. El Public Display de un anuncio público, aislado de contenido que no sea de eBay, es el uso que el acuerdo de 2018 ya describe. Mostrar un precio de eBay junto a un precio de referencia ajeno, calcular un ahorro, publicar un mínimo o un máximo, o construir un Second-Hand Score exige permiso escrito previo de eBay. Sin ese permiso, el adapter no rellena esas cifras.
6. Mapping verificado de producto. Una persona ha comprobado el identificador externo del slug. Mientras `externalProductId` sea `null`, el adapter devuelve `null`.
7. Credenciales configuradas exclusivamente en servidor. Client id, client secret y campaign id viven en el entorno del servidor. No entran en el repositorio, en `NEXT_PUBLIC_*` ni en el HTML.
