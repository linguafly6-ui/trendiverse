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

## `sourceUrl`

`normalizeEbaySourceUrl` sigue aceptando solo `http` o `https`, rechazando cualquier host que contenga `ebay` y rechazando `campid`, `customid`, `mkcid`, `mkevt`, `mkrid` y `toolid`. `assessListingSourceUrl` usa esa misma regla. Una ficha `/p/` y una ficha de anuncio de `www.ebay.es` quedan rechazadas.

Propuesta, sin aplicarla:

- La procedencia de un precio es el `itemWebUrl` devuelto por Browse para ese mismo anuncio.
- Solo podría aceptarse si es `https`, el host es `www.ebay.es`, `listingMarketplaceId` es `EBAY_ES` y la query no trae ningún parámetro de afiliado. Si aparece uno, se rechaza la URL entera.
- `itemAffiliateWebUrl` queda fuera hasta que el alta de EPN esté confirmada.
- Una URL `/p/` demuestra la identidad del producto. No es el `sourceUrl` de un precio.
- Quitar el rechazo del host de eBay ahora no crearía una observación válida: faltan el ePID canónico, la categoría y la condición. Por eso la política no se relaja en este cambio.

## Instrucciones para cerrar el expediente

1. Decidir el alcance. Si `nintendo-switch` sigue cubriendo todos los colores de HEG-001 con 64 GB, hace falta una ficha de `www.ebay.es` cuyo bloque de identificadores etiquete un solo ePID para ese conjunto, sin color ni edición especial. Si eBay no publica esa ficha, hay que partir el producto de Trendiverse por color o edición y darle a cada parte su propia `verificationRef` antes de copiar el ePID etiquetado. No usar `21048307585` ni `23048312547` como canónico del slug actual. No copiar el número de un path `/p/` si la página no muestra la etiqueta «eBay Product ID (ePID)». No usar `itemId`, `legacyItemId`, `HEG-001`, el MPN ni el EAN como identificador de marketplace.
2. Anotar el `categoryId` numérico que muestre esa ficha. Si no lo muestra, resolver la hoja «Consolas de videojuegos» con la Taxonomy API de `EBAY_ES` y guardar el `categoryId` de la respuesta. Fuera de CI, pedir `GET https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_ES/get_item_condition_policies` con el filtro de esa categoría y un token de aplicación que no se escriba en el repositorio. Guardar solo los pares `conditionId` y descripción de esa categoría. Admitir un ID solo si viene en esa respuesta y el normalizador lo traduce a un usado. No copiar los ID de ejemplo del cliente generado.
3. Cuando el ePID canónico exista, leer un anuncio que ya traiga ese `epid` con `getItem`, fuera de CI. Conservar `listingMarketplaceId` y `categoryId` si el primero es `EBAY_ES` y el segundo coincide con el del paso anterior. No copiar el precio de esa respuesta al expediente.
4. Solo después, en otro cambio, valorar la propuesta de `sourceUrl`. Hasta entonces el host de eBay sigue rechazado.
5. La allowlist de proveedores y ámbitos sigue vacía. Añadir `ebay` y `EBAY_ES` va junto con un `marketplaceIdentifier` validado cuya `verifiedProductRef` sea la `verificationRef` ya existente. No forma parte de este expediente.
