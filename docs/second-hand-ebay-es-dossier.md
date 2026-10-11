# Expediente de eBay España para `nintendo-switch`

Estado: **pendiente**. No hay una oferta publicable. `EBAY_BROWSE_SOURCE_ENABLED` sigue en false. El proveedor por defecto sigue vacío. Este documento no llama a la Browse API y no se ejecuta en CI.

El candidato es `nintendo-switch` porque es el único mapping con `reviewStatus: verified` y una `verificationRef` estable. Los otros diecisiete siguen en `pending` y no cierran un modelo.

## Expediente

| Campo | Valor |
| --- | --- |
| `productId` | `nintendo-switch` |
| ePID canónico | vacío. Hay más de una ficha para el mismo número de modelo y la misma capacidad. |
| `verificationRef` | La del mapping: «Declaración UE de conformidad de Nintendo Co., Ltd., número de modelo HEG-001, y ficha de hardware de Nintendo ES. Revisión del 2026-10-09.» |
| Ficha única de catálogo | No hay una. Las fichas leídas están abajo. |
| Fuente y fecha | Fichas públicas de `www.ebay.es`, leídas el 2026-10-11. |
| Marketplace | `EBAY_ES` es el sitio de España (`ebay.es`) en el OpenAPI de Browse. Las fichas están en `www.ebay.es`. |
| Categoría | El texto «Consolas de videojuegos» aparece en la ficha blanca. No hay `categoryId`. `listingMarketplaceId` no se ha leído: haría falta `getItem`. |
| Estado | `pending` |

### Fichas que sí etiquetan un ePID

Leídas el 2026-10-11. El bloque «Identificadores del producto» muestra la etiqueta «eBay Product ID (ePID)», el número de modelo HEG-001 y 64 GB. El color y el MPN cambian.

| ePID etiquetado | URL | Color publicado | MPN | EAN |
| --- | --- | --- | --- | --- |
| `21048307585` | https://www.ebay.es/p/21048307585 | Blanco | `10007454` | `0045496453435` |
| `23048312547` | https://www.ebay.es/p/23048312547 | Negro/Neon Rojo/Neon Azul | `10007455` | `0045496453442` |

La ficha blanca también muestra el texto «Consolas de videojuegos». No muestra un `categoryId`.

Esos ePID no entran en `marketplaceIdentifier` ni en `externalProductId`. El producto verificado no se parte por el color de los Joy-Con. Elegir el blanco o el neón asociaría un anuncio de un color con toda la consola.

### Ficha sin ePID etiquetado

https://www.ebay.es/p/5056057863 se leyó el mismo día. El título publica HEG-001, 64 GB y «Edición Splatoon 3». El bloque de identificadores muestra MPN `10009642` y EAN `0045496453534`, y no muestra la etiqueta «eBay Product ID (ePID)». El número del path no se guarda como ePID.

Los precios y el nombre del vendedor que aparecen en esas páginas no forman parte del expediente.

## Condiciones

Tres capas, sin mezclarlas.

### Documentadas

- La guía de IDs de desarrollador, citada en la decisión de proveedor, parte del mercado de EE. UU. Esos números viven en el normalizador como IDs documentados. No dicen qué admite una categoría de `EBAY_ES`.
- La ayuda de España, leída el 2026-10-11 en https://www.ebay.es/help/selling/listings/creating-managing-listings/item-conditions-category?id=4765, publica nombres y dice que algunas subcategorías difieren de la categoría principal. No publica `conditionId`. Las secciones que podrían cubrir una consola, sin que la página nombre «consolas», son «DVD y películas, música y videojuegos», «Electrónica, Instrumentos musicales y accesorios» y «Juguetes y aficiones».
- El PDF de Intercambio de archivos de España dice que el mismo `ConditionID` puede significar cosas distintas según la categoría. El ejemplo de ese PDF es que `1000` significa Nuevo en Ordenadores y Nuevo con caja en Zapatos. Fuente: https://ir.ebaystatic.com/pictures/aw/pics/es/pdf/file_exchange/File_Exchange_Advanced_Instructions.pdf. Ese ejemplo no se admite.
- El cliente generado de Sell Metadata describe `GET /sell/metadata/v1/marketplace/{marketplace_id}/get_item_condition_policies`. Devuelve los `conditionId` de una categoría. Los `categoryId` de su ejemplo no son la categoría de esta consola. `developer.ebay.com` respondió 403 al intentar leer la guía HTML en esta revisión. Fuente del método: https://github.com/zVPS/ebay-sell-metadata-php-client/blob/HEAD/docs/Api/MarketplaceApi.md.

### Observadas en anuncios

En las tres fichas, el anuncio embebido muestra la palabra «Nuevo». No muestra un `conditionId`. Esa palabra no se traduce a `1000` ni a ningún otro número.

### Admitidas por Trendiverse

`EBAY_ES_ADMITTED_CONDITION_IDS` sigue vacía. Un ID documentado en EE. UU. no se admite por estar en la tabla. Aunque más adelante se admitiera, el normalizador sigue dejando fuera los que traduce a `new` y el `7000`.

## Variantes del catálogo

`SECOND_HAND_MAPPING_SCOPES` solo tiene `family` y `category`. Un producto es un slug editorial. No hay un registro de variante por color, edición comercial o MPN. En `nintendo-switch` el atributo `edition` vale «Modelo OLED»: separa OLED, original y Lite, no el color. La verificación guardada dice que la ficha no parte el modelo por el color de los Joy-Con.

Por eso el slug `nintendo-switch` se queda. Crear un slug por color cambiaría las URLs editoriales y el catálogo de 18 productos. No hay compatibilidad que lo justifique. Un ePID de un solo color no puede colgarse de este slug. Para asociarlo haría falta un producto nuevo, con su propio slug, su propia `verificationRef` y un solo ePID etiquetado que coincida con ese color y ese MPN. Este cambio no lo crea.

## Evidencia de cada ePID

| ePID | Presente | Ausente para asociarlo |
| --- | --- | --- |
| `21048307585` | Etiqueta «eBay Product ID (ePID)», HEG-001, 64 GB, color Blanco, MPN `10007454`, EAN `0045496453435`, ficha https://www.ebay.es/p/21048307585 | Un producto cuyo alcance sea solo ese color. `categoryId` y `listingMarketplaceId` leídos del cuerpo de `getItem`. La política de condiciones de esa categoría. |
| `23048312547` | La misma etiqueta, HEG-001, 64 GB, color Negro/Neon Rojo/Neon Azul, MPN `10007455`, EAN `0045496453442`, ficha https://www.ebay.es/p/23048312547 | Lo mismo, para ese color y ese MPN. |
| Path `5056057863` | La ficha https://www.ebay.es/p/5056057863 publica HEG-001, 64 GB y Edición Splatoon 3. No muestra la etiqueta de ePID. | El número del path no es un ePID. No se asocia. |

Ninguno entra en el mapping. `canAssociate` queda en false.

## Cómo leer `categoryId` y `listingMarketplaceId`

No hay un cuerpo real de `getItem` en el repositorio. El procedimiento, sobre un JSON que ya se tenga, es:

1. El objeto tiene que ser la respuesta de `GET /buy/browse/v1/item/{item_id}`, un `Item`. Un `ItemSummary` de la búsqueda no obliga esos campos. La decisión de proveedor ya cita que el OpenAPI exige `categoryId` y `listingMarketplaceId` en `Item`, y no en `ItemSummary`.
2. Pasar el objeto a `readGetItemCategoryEvidence`. `categoryId` sale solo de la propiedad `categoryId` si es un texto no vacío y sin espacios alrededor. Un número JSON no vale. `categoryPath`, `categoryIdPath`, la miga «Consolas de videojuegos» y el path de `itemWebUrl` no se leen.
3. `listingMarketplaceId` sale solo de esa propiedad, con la misma regla. El header `X-EBAY-C-MARKETPLACE-ID: EBAY_ES` de la petición no sustituye al campo del anuncio.
4. `getItem` del cliente ya copia esos dos campos al resultado estrecho cuando vienen en el cuerpo, y responde `invalid-response` si `itemId` no coincide con el id pedido. Sin un cuerpo guardado, el expediente sigue con los dos en null.
5. El `categoryId` de las pruebas del puente es un fixture. No es la categoría de esta consola y no se copia aquí.

## Contrato de condiciones

En este repositorio no está el OpenAPI de Sell Metadata ni un cliente generado. La única mención es la cita externa de `get_item_condition_policies` que ya está arriba. Esa cita no es una respuesta de `EBAY_ES` y sus `categoryId` de ejemplo no son los de esta consola. `SELL_METADATA_CONDITION_CONTRACT_IN_REPO` es false. `EBAY_ES_ADMITTED_CONDITION_IDS` sigue vacía.

## `sourceUrl`

`normalizeEbaySourceUrl` sigue aceptando solo `http` o `https`, rechazando cualquier host que contenga `ebay` y rechazando `campid`, `customid`, `mkcid`, `mkevt`, `mkrid` y `toolid`. `assessListingSourceUrl` usa esa misma regla. Una ficha `/p/` y una ficha de anuncio de `www.ebay.es` quedan rechazadas.

`validateObservation` acepta cualquier URL `http` o `https`. No mira el host ni la afiliación. El rechazo de eBay tiene que seguir en el adapter. `evaluateProposedEbayEsItemUrl` describe una regla más estrecha y devuelve `applied: false`. `appliedListingSourceUrl` sigue siendo `normalizeEbaySourceUrl`, así que `www.ebay.es` no se convierte en `sourceUrl`. El puente no importa esa propuesta.

La propuesta admitiría un `itemWebUrl` solo si, a la vez:

- es `https` y el host es exactamente `www.ebay.es`;
- el path es `/itm/` más el `legacyItemId` del mismo cuerpo;
- no hay query ni fragmento. Un parámetro de afiliado (`campid`, `customid`, `mkcid`, `mkevt`, `mkrid`, `toolid`) o cualquier otro parámetro rechaza la URL entera. No se recorta;
- `listingMarketplaceId` del mismo cuerpo es `EBAY_ES`;
- no se usa `itemAffiliateWebUrl`. Una ficha `/p/` tampoco sirve como `sourceUrl` de un precio.

Esa regla no se aplica. Faltan el ePID canónico, la categoría y la condición, y aplicarla no produciría una observación válida.

## Instrucciones para cerrar el expediente

Una persona tiene que traer, fuera de este repositorio y sin pegar el resultado en CI:

1. La decisión de alcance. O una ficha de `www.ebay.es` cuyo bloque de identificadores etiquete un solo ePID para todo HEG-001 de 64 GB, sin color ni edición, o un producto nuevo por color con su slug y su `verificationRef`. No usar `21048307585` ni `23048312547` como canónico de `nintendo-switch`. No copiar el número de un path `/p/` si la página no muestra la etiqueta «eBay Product ID (ePID)». No usar `itemId`, `legacyItemId`, `HEG-001`, el MPN ni el EAN como identificador de marketplace.
2. Un JSON de `getItem` de un anuncio que ya traiga ese ePID. De ese JSON se leen `categoryId` y `listingMarketplaceId` con `readGetItemCategoryEvidence`. No hace falta otra llamada para interpretar un cuerpo que ya se tenga. El precio de ese JSON no se copia al expediente.
3. El JSON de `GET https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_ES/get_item_condition_policies` filtrado por ese `categoryId`, pedido con un token que no se escriba en el repositorio. Admitir un `conditionId` solo si está en esa respuesta y el normalizador lo traduce a un usado. Hoy el repositorio no contiene ese contrato.
4. Después de esos tres documentos, otro cambio puede conectar `evaluateProposedEbayEsItemUrl`. Hasta entonces el host de eBay sigue rechazado.
5. La allowlist de proveedores y ámbitos sigue vacía. Añadir `ebay` y `EBAY_ES` va junto con un `marketplaceIdentifier` validado cuya `verifiedProductRef` sea la `verificationRef` del producto que corresponda. No forma parte de este expediente.
