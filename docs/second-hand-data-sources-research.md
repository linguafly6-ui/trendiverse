# Investigación: fuente real de precios de segunda mano

Fecha de la revisión: 9 de octubre de 2026.

Este documento no conecta ninguna API. No hay claves, llamadas de red ni precios de catálogo. La PR #92 (abierta) hace que `/segunda-mano/` lea `getSecondHandProducts()`; mientras el default siga siendo `emptySecondHandDataSource`, las métricas permanecen en `null`.

## Cómo leer el estado de cada dato

| Marca | Significado |
| --- | --- |
| Confirmado | Aparece en documentación oficial consultada en esta revisión. |
| Requiere contacto | La vía existe, pero el alta, el mercado o el permiso no están publicados como autoservicio. |
| No confirmado | No hay documentación oficial que lo acredite. No se usa como argumento. |

No se propone scraping como vía de integración.

## Contrato que ya existe

`SecondHandDataSource.getProductData(productId)` devuelve una observación o `null`. `validateObservation` exige precio positivo, moneda ISO 4217, URL http(s), fecha parseable, fuente y `productId`. `observationToMetrics` rellena `usedPrice`, `newPrice` (precio de referencia), `savings` (solo si la referencia es mayor), `currency`, `source` y `updatedAt`. `score` y `trend` se quedan en `null`.

Los 18 slugs editoriales no cambian: `iphone`, `macbook`, `ipad`, `apple-watch`, `samsung-galaxy`, `playstation-5`, `nintendo-switch`, `xbox`, `steam-deck`, `zapatillas`, `bolsos`, `ropa-vintage`, `aspiradores`, `cafeteras`, `muebles`, `bicicletas`, `material-fitness`, `material-outdoor`.

## Criterios de selección

Una fuente entra en la lista corta solo si cumple las cinco columnas. Un fallo en legal o en España/EUR la saca de la primera integración aunque el dato técnico sea bueno.

| Criterio | Qué tiene que poder demostrar |
| --- | --- |
| Calidad | Precio de una oferta real, fecha de la observación, condición, y más de una oferta para calcular mínimo y máximo. |
| Cobertura | Mercado España o europeo usable desde España, EUR, y hueco para el catálogo actual. Tecnología sola no cubre moda, hogar ni deporte. |
| Técnica | API o feed oficial, documentación, límites conocidos o consultables, errores explícitos y caché compatible con la licencia. |
| Legal | Derecho a mostrar el precio, a guardarlo un tiempo limitado, atribución y uso comercial de un medio. |
| Producto | URL pública, nombre de la fuente visible, y campos que más adelante permitan ahorro y score sin inventarlos. |

## Matriz

Sin puntuación. El estado de integración de todas es «no conectada».

| Fuente | Tipo confirmado | España / EUR | Usado o reacondicionado | Mostrar el precio en Trendiverse | Encaje con el catálogo | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| eBay Browse API + Partner Network | API oficial de búsqueda para compradores | `EBAY_ES` en el enum oficial. Moneda ISO en el precio | IDs de condición usado y reacondicionado | Sí, como afiliado, con la URL de afiliado | Mercado general: las cinco categorías pueden buscarse | Primera a investigar |
| Refurbed Affiliate Partner API | API oficial de afiliados | Mercado `ES` no enumerado. Hay que preguntar | Grading A/B/C y garantía en el buy box | Requiere alta de partner | Electrónica reacondicionada. Moda, hogar y deporte no están en el contrato | Segunda alternativa |
| Amazon Creators API | API oficial de afiliados; PA-API 5 deprecada | `www.amazon.es` en Creators API: no confirmado aquí | `Used` y `Refurbished` documentados | Solo si el programa de Associates lo permite y el fin es llevar la venta a Amazon | Catálogo amplio, con más oferta nueva que de particulares | Investigar en paralelo, no sustituye a eBay |
| Awin, anunciante rebuy | Feed oficial de afiliado | Documentado DE/AT, no España | Tienda de reacondicionados | Sí, dentro del programa y con el enlace de afiliado | Electrónica y medios. No es el mercado español | Reserva, no primera |
| Back Market API | API oficial de vendedores | Mercados por `Accept-Language`. España no contrastada en un contrato de publisher | Listados del propio vendedor | No hay API de publisher confirmada | Electrónica | Descartada para esta fase |
| Wallapop Connect | API oficial de vendedores | España, Italia y Portugal | Anuncios propios | No expone el catálogo ajeno | Todas, pero solo el inventario del token | Descartada para leer precios de mercado |
| Vinted Pro Integrations | API oficial con allowlist | EEE, incluida España como producto | Inventario Pro | Allowlist y cuenta Pro. No es un índice público | Sobre todo moda | Descartada como primera fuente |
| Keepa API | API de pago documentada | Dominio `9` = `es` | Historial `USED` y `REFURBISHED` | El contrato prohíbe publicarlo sin consentimiento escrito | Solo Amazon | Descartada salvo consentimiento |
| CeX / WeBuy | No hay API oficial de desarrolladores | España existe como tienda | Precios de tienda | No confirmado | Electrónica y gaming | Descartada |
| Swappie | No hay API oficial localizada | Tienda europea | Reacondicionados propios | No confirmado | Móviles | Descartada |

## eBay Browse API

Primera fuente a investigar.

| Campo | Estado |
| --- | --- |
| Nombre | eBay Browse API, con eBay Partner Network para la atribución comercial |
| URL | [Browse API](https://developer.ebay.com/develop/api/buy/browse_api.md), [especificación OpenAPI](https://developer.ebay.com/develop/api/spec/browse_api.json), [IDs de condición](https://developer.ebay.com/api-docs/sell/static/metadata/condition-id-values.html) |
| Integración | REST. `GET /buy/browse/v1/item_summary/search` |
| API | Confirmada |
| Feed | No es el mecanismo. El Partner Network es un programa de afiliación aparte, citado por la propia Browse API |
| Autenticación | Application access token por client credentials. Confirmado |
| Coste | El acceso de desarrollador no publica una tarifa en la página de la Browse API. Las comisiones salen del programa de partners, no de un precio por llamada publicado aquí |
| Límites | La documentación del programa dice que el cupo depende de la API y que el valor por defecto cubre a particulares y negocios pequeños. Subirlo pide un Application Growth Check. El cupo del recurso se mira en la cuenta y con la Developer Analytics API. No se copia aquí una cifra de la Browse API porque la tabla de límites no se pudo leer en esta revisión |
| Mercados | `EBAY_ES` está en `MarketplaceIdEnum`. Fuera de EE. UU. el header `X-EBAY-C-MARKETPLACE-ID` es obligatorio; si falta, el default es `EBAY_US` |
| Moneda | `Amount.currency` es un código ISO 4217. En `EBAY_ES` cabe esperar EUR, pero el adapter debe leer el código, no asumirlo |
| Categorías | Mercado general. Caben tecnología, móviles, ordenadores, gaming, moda, hogar y deporte. Que una búsqueda concreta devuelva ofertas útiles no está probado: no se ha llamado a la API |
| Precio usado / reacondicionado | Confirmado por IDs. `3000` usado, `2000` certified refurbished, `2010` excellent refurbished, `2020` very good refurbished, `2030` good refurbished, `4000` very good, `5000` good, `6000` acceptable, `7000` for parts. La página avisa de que los nombres visibles cambian por categoría y de que el reacondicionado certificado no está en todos los mercados |
| Condición | `condition` y `conditionId` en cada `ItemSummary` |
| URL pública | `itemWebUrl`. Para comisión, `itemAffiliateWebUrl` |
| Atribución | El header `X-EBAY-C-ENDUSERCTX` existe para el reparto de ingresos del Partner Network. Las claves exactas de ese header están en la Buying Integration Guide y hay que copiarlas antes de implementar |
| Caché | No se ha extraído un TTL permitido del API License Agreement. No se fija uno hasta leer ese contrato |
| Mostrar precios | La Browse API devuelve el precio para construir una experiencia de compra. El uso comercial previsto enlaza con el Partner Network |
| Uso comercial | Compatible en principio con un medio que enlace a la ficha. Queda sujeto al API License Agreement y a las normas del Partner Network |
| Afiliación | Necesaria si queremos la URL de afiliado y comisión. Confirmado en la nota de `itemAffiliateWebUrl` |
| Riesgos | Sin `EBAY_ES`, los precios serían de ebay.com. El reacondicionado certificado puede no existir en una categoría. Una búsqueda por texto mezcla modelos. El acuerdo puede restringir el tiempo de caché. Hay que leerlo antes de guardar precios |

Ventaja: es la única fuente con API de búsqueda confirmada, mercado español en el enum y condiciones de usado y reacondicionado para las cinco categorías del catálogo.

Limitación: el identificador estable (ePID o GTIN) no viene dado para nuestros slugs. Hay que resolverlo con una búsqueda y una revisión humana.

## Refurbed Affiliate Partner API

Segunda alternativa, para electrónica reacondicionada.

| Campo | Estado |
| --- | --- |
| Nombre | Refurbed Affiliate Partner API |
| URL | [Repositorio público](https://gitlab.com/refurbed-community/public-apis) y el README de `refurbed_partner_affiliate_api` |
| Integración | gRPC o HTTP generado desde el OpenAPI oficial. Host de producción `api.refurbed.com:443` |
| API | Confirmada |
| Feed | No. Es una API de partner |
| Autenticación | `Authorization: Plain <token>`. El token lo da el account manager. Contacto publicado: integrations@refurbed.com |
| Coste | No publicado en el README. Requiere contacto |
| Límites | El swagger oficial fija la paginación entre 1 y 100. Superar 100 es `INVALID_ARGUMENT`. No publica un cupo de llamadas por minuto |
| Mercados | Hay que pasar `site_market_code`. La lista sale de `MarketService`. El README y el swagger oficial consultados no contienen el literal `ES`. Cobertura de España: requiere contacto |
| Moneda | `currency_code` ISO 4217 en el buy box. El precio viaja como string decimal de hasta 2 decimales |
| Categorías | Productos e instancias del marketplace de reacondicionados. La documentación no lista moda, hogar ni deporte |
| Precio | Buy box: precio actual de la mejor instancia |
| Condición | `OfferGrading` oficial: `A`, `B`, `C`, más `grading_name` y garantía |
| URL | Enlace de marketplace en el buy box. `back_link` añade un parámetro hacia el sitio del partner |
| Atribución | El enlace de partner es el mecanismo documentado |
| Caché | No hay TTL publicado en el README. Hay que preguntarlo en el alta |
| Mostrar precios y uso comercial | Es una API de afiliados, así que el uso previsto es mostrar oferta y enlazar. El permiso concreto sale del acuerdo de partner, que no es público |
| Afiliación | Obligatoria. Requiere contacto |
| Riesgos | Sin mercado ES, los precios no sirven para España. No cubre la mitad del catálogo editorial. El grading A/B/C hay que mapearlo a `like-new | good | fair` con una tabla explícita, no por intuición |

## Amazon Creators API

No es la primera porque el mercado español de la API nueva no quedó confirmado en esta revisión y el programa obliga a que la aplicación dirija la venta a Amazon.

| Campo | Estado |
| --- | --- |
| Nombre | Amazon Creators API. Sustituye a Product Advertising API 5.0 |
| URL | [GetItems](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/get-items), [OffersV2](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/offersV2), [buenas prácticas](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/best-programming-practices). PA-API 5, deprecada: [SearchItems en amazon.eu](https://webservices.amazon.eu/paapi5/documentation/search-items.html). El scratchpad histórico de España está en `webservices.amazon.es` |
| API | Confirmada para Creators API |
| Feed | Existe históricamente en el programa de Associates. No se usa como diseño |
| Autenticación | Credenciales de asociado. Partner tag y firma |
| Coste | El acceso va con la cuenta de Associates. No hay tarifa por llamada publicada en las páginas citadas |
| Límites | Las buenas prácticas mandan cachear para no exceder el uso. La cifra concreta está en el acuerdo de licencia, no en el extracto leído |
| España | No confirmado en Creators API: la página de locales consultada devolvió acceso denegado. PA-API 5 sí tenía marketplace y un scratchpad de amazon.es, y esa API está deprecada |
| Moneda | La de la oferta del marketplace. Hay que leerla, no asumirla |
| Categorías | Catálogo general de Amazon |
| Precio y condición | `OffersV2` documenta `New`, `Used`, `Refurbished` y subcondiciones `LikeNew`, `VeryGood`, `Good`, `Acceptable`, `Refurbished`, `OpenBox` |
| URL | Enlace de asociado al detalle del producto |
| Caché | Permitida para campos de producto según el acuerdo. Prohibido cachear información de cliente. El TTL por campo no se copia aquí porque no estaba en el extracto |
| Uso comercial | La aplicación tiene que dirigir ventas a Amazon. Un uso que no cumpla las condiciones puede bloquearse |
| Riesgos | Migración desde PA-API 5. Precio que caduca antes que el HTML cacheado de la página. Oferta «usado» desigual según el ASIN |

## Fuentes descartadas

**Keepa.** API oficial, dominio `9` para `es`, historial `USED` (índice 2 del csv) y `REFURBISHED` (índice 6), precios en la unidad menor de la moneda. El apartado 18.7 de las condiciones del 27 de agosto de 2026 permite guardar el dato solo para uso interno y, sin consentimiento escrito, prohíbe publicarlo o usarlo como parte de un producto ofrecido a terceros. Mostrar el precio en Trendiverse choca con esa cláusula. Queda fuera salvo un permiso escrito.

**Back Market.** [api.backmarket.dev](https://api.backmarket.dev/) documenta una API de vendedores: token del back office, `Accept-Language` para el mercado y listados propios. No es una API de publisher. No se usa para leer el catálogo y republicarlo.

**Wallapop Connect.** [developers.wallapop.com](https://developers.wallapop.com/) documenta OAuth para que un vendedor publique y gestione sus anuncios en España, Italia y Portugal. `GET /items` devuelve el inventario de ese token, no el mercado.

**Vinted Pro.** [pro-docs.svc.vinted.com](https://pro-docs.svc.vinted.com/) limita la API a negocios Pro en allowlist. No es un índice público de precios. Las APIs de terceros que extraen el catálogo web no son una integración autorizada.

**rebuy vía Awin.** [rebuy.de/s/partner-programm](https://www.rebuy.de/s/partner-programm) confirma feeds de producto para publishers aceptados. El perfil de Awin consultado es DE/AT. Sirve como reserva europea de electrónica, no como fuente de España.

**CeX.** No aparece una documentación oficial de desarrolladores. Los envoltorios públicos describen endpoints no oficiales de `webuy.io` o scrapers. Fuera.

**Swappie.** No se localizó API ni feed en un sitio oficial de Swappie. Los listados de redes de afiliados de terceros no cuentan como confirmación.

## Arquitectura prevista

Sigue el contrato actual. La página no conoce al proveedor.

```text
eBay Browse API
       ↓
cliente HTTP (solo servidor)
       ↓
EbaySecondHandSource implements SecondHandDataSource
       ↓
agregación a una observación
       ↓
validateObservation / observationToMetrics
       ↓
getSecondHandProducts()
       ↓
ProductCard
```

Piezas, todas en el servidor y sin librerías nuevas:

| Pieza | Responsabilidad |
| --- | --- |
| Cliente HTTP | Token, timeout, reintentos. `fetch` nativo |
| Adapter | Traduce una respuesta de eBay a `RawSecondHandObservation` |
| Mapeo | Slug de Trendiverse → consulta o identificador verificado |
| Normalizador | El que ya existe: `validateObservation`, `normalizeCondition`, `observationToMetrics` |
| Caché | Lectura en la petición de página. Escritura en un job, no en el render |
| Límite | Cola del job. La página nunca llama a eBay |
| Configuración | Variables de entorno. Ningún secreto en el cliente |

`getSecondHandProducts()` mantiene el default vacío hasta que el adapter esté probado. Entonces el default pasa a ser el adapter de eBay. Las páginas de la PR #92 no se tocan.

Agregación propuesta, todavía sin implementar: de la primera página de resultados `FIXED_PRICE` en `EBAY_ES`, quedarse con el menor precio positivo cuya condición sea usado o reacondicionado. `minPrice` y `maxPrice` salen de esa página. `referencePrice` solo si la propia respuesta trae un precio original. `observedAt` es el instante de la respuesta, no la fecha de creación del anuncio. `sourceUrl` es `itemAffiliateWebUrl` si existe y, si no, `itemWebUrl`. Si no queda ninguna oferta válida, `null`.

Mapeo de condición, explícito y reversible:

| conditionId | SecondHandCondition |
| --- | --- |
| 1000, 1500 | `new` |
| 2000, 2010 | `like-new` |
| 2020, 3000, 4000 | `good` |
| 2030, 5000 | `fair` |
| 6000, 7000 | `poor` |
| otro | `unknown` |

`NEW` no debe colarse como precio usado. El filtro de la búsqueda tiene que excluirlo. Los valores exactos del parámetro `filter` se copian de Buy API Field Filters en la implementación; aquí no se inventa la sintaxis.

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
| zapatillas | zapatillas | null | eBay sí. Refurbed no aplica |
| bolsos | bolsos | null | eBay sí. Refurbed no aplica |
| ropa-vintage | ropa vintage | null | eBay sí. Refurbed no aplica |
| aspiradores | aspiradora | null | eBay sí |
| cafeteras | cafetera | null | eBay sí |
| muebles | muebles | null | eBay sí. Ojo al coste de envío, que el precio de ítem no incluye |
| bicicletas | bicicleta | null | eBay sí |
| material-fitness | material fitness | null | eBay sí |
| material-outdoor | material outdoor | null | eBay sí |

Mientras `externalProductId` sea `null`, el adapter puede devolver `null` aunque la búsqueda tenga resultados. Así no se publica un precio de un modelo no revisado. La primera implementación útil es resolver a mano los productos de la lista de vigilancia (`watch: true`) y dejar el resto en `null`.

## Caché y fallos

No se implementa todavía. Cuando se conecte eBay:

| Decisión | Propuesta | Por qué |
| --- | --- | --- |
| Quién llama | Un job programado, no la petición de la página | 18 búsquedas caben en cualquier cupo razonable y la página no depende de la latencia de eBay |
| Frecuencia | Cada 12 horas por producto con ID verificado | Hipótesis técnica. Se acorta si el acuerdo exige precios más frescos |
| TTL de lectura | 12 horas | Igual que la frecuencia, pendiente del API License Agreement |
| Dato caducado | Si el refresco falla, se sigue mostrando la última observación válida como máximo 48 horas y luego `null` | Mejor el estado editorial que un precio viejo sin fecha |
| Error de API | El adapter lanza o devuelve `null`. `getSecondHandMetrics` ya trata el error como ausencia de dato | La UI no cambia |
| 429 | Un reintento a los 2 segundos y otro a los 8. Si persiste, se aborta el ciclo | No se insiste |
| Timeout | 8 segundos por búsqueda | El job puede esperar. La página no |
| Dónde guardar | KV `CACHE` que el proyecto ya contempla, clave `second-hand:ebay:<productId>` | Sin base nueva |

`observedAt` de la observación guardada es la del refresco, para que la tarjeta enseñe la fecha real.

## Credenciales

Solo en el entorno del servidor de Cloudflare. Nunca en git, en `NEXT_PUBLIC_*` ni en una URL pública.

| Variable | Uso |
| --- | --- |
| `EBAY_CLIENT_ID` | Client credentials |
| `EBAY_CLIENT_SECRET` | Client credentials |
| `EBAY_ENV` | `sandbox` o `production` |
| `EBAY_MARKETPLACE_ID` | `EBAY_ES` |
| `EBAY_PARTNER_CAMPAIGN_ID` | Solo si la Buying Integration Guide lo exige dentro de `X-EBAY-C-ENDUSERCTX` |

El token OAuth vive en memoria del job el tiempo que indique la respuesta. No se escribe en el HTML. Refurbed, si se abre después, usaría `REFURBED_AFFILIATE_TOKEN` con la misma regla.

## Second-Hand Score

No se calcula. `observationToMetrics` lo deja en `null` y así debe seguir.

Para un score defendible haría falta, por producto y durante varias semanas:

| Dato | Para qué | ¿Lo da la primera fuente? |
| --- | --- | --- |
| Precio usado | Base | Sí, una vez mapeado |
| Precio nuevo de referencia | Ahorro | Solo si eBay devuelve precio original o si otra fuente lo aporta. Si no hay, el ahorro sigue en `null` |
| Descuento | Derivado, no un input distinto | Solo con las dos cifras anteriores |
| Condición | No mezclar «para piezas» con «como nuevo» | Sí, `conditionId` |
| Liquidez | Número de ofertas y de vendedores en la búsqueda | Parcial: el total de resultados de una búsqueda, no ventas cerradas |
| Antigüedad | Edad mediana de los anuncios | Parcial: `itemCreationDate` es alta del anuncio, no edad del aparato |
| Tendencia | Variación del precio en el tiempo | No. Exige guardar nuestra propia serie. Keepa la tiene, pero no podemos publicarla |
| Número de observaciones | Robustez | La nuestra, si guardamos cada refresco |
| Fecha de actualización | Caducidad del score | Sí, `observedAt` |

Hasta tener esa serie y una fórmula escrita, el score publicado es `null`. No se rellena con un promedio de una sola búsqueda.

## Qué queda fuera de esta PR

- Cualquier cliente HTTP real, secreto o variable de entorno en el deploy.
- Precios, ePID, GTIN o ASIN.
- Cambios de UI.
- Merge de la PR #92.
