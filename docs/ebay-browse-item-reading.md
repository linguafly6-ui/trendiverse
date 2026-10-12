# Lectura manual de un anuncio de Browse

Esta lectura no entra en el catálogo y no enciende el proveedor. `EBAY_BROWSE_SOURCE_ENABLED` sigue en false. `EBAY_ES_ADMITTED_CONDITION_IDS` sigue vacía. `normalizeEbaySourceUrl` sigue rechazando un host de eBay. Los ePID `21048307585` y `23048312547` no se asignan a `nintendo-switch`.

## Qué puede hacer el cliente

`lib/ebay-browse-client.ts` tiene tres operaciones, las tres en `EBAY_ES`:

- `search` envía `q` y `limit` a `item_summary/search`. No busca por identificador.
- `getItem` pide `GET /buy/browse/v1/item/{item_id}`. El `item_id` tiene que coincidir con el `itemId` del cuerpo. Si no coincide, el resultado es `invalid-response` y el cuerpo se descarta.
- `getItemByLegacyId` pide `GET /buy/browse/v1/item/get_item_by_legacy_id`. El contrato verificado está en el apartado siguiente.

Un id solo de dígitos pasado como `itemId` sigue sin enviarse: ese argumento es el id REST (`v1|…|…`). El id numérico entra solo por `legacyItemId`.

## Cómo ejecutarla fuera de CI

La función no lee credenciales del entorno. Sin `confirm: 'run-outside-ci'` y sin un `fetchImpl` explícito devuelve `not-run`.

En un archivo local que no se suba al repositorio:

```ts
import { collectBrowseItemReading } from './lib/ebay-browse-item-reading'

const byRestId = await collectBrowseItemReading({
  confirm: 'run-outside-ci',
  itemId: 'v1|…|…',
  clientId: '…',
  clientSecret: '…',
  fetchImpl: globalThis.fetch,
})

const byLegacyId = await collectBrowseItemReading({
  confirm: 'run-outside-ci',
  legacyItemId: '123456789012',
  clientId: '…',
  clientSecret: '…',
  fetchImpl: globalThis.fetch,
})
```

El identificador lo escribe la persona. No se imprime el token ni el secreto. No se guarda el cuerpo completo. El JSON de `reading` es lo único que hace falta revisar. Pasar `itemId` y `legacyItemId` a la vez no hace petición.

## Contrato verificado de `get_item_by_legacy_id`

Fuente: `https://developer.ebay.com/develop/api/spec/browse_api.json`, OpenAPI 3.1, Browse API OAS Baseline v1.20.4, `operationId` `getItemByLegacyId`. No se ha llamado a la API de anuncios para comprobarlo.

- Ruta de producción: `GET https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id`.
- Query obligatorio: `legacy_item_id` (string). El esquema no publica un patrón. Esta lectura solo acepta un decimal de 1 a 20 dígitos, sin ceros a la izquierda y sin recortar espacios. Otra entrada devuelve `invalid-legacy-item-id` y no sale de la máquina.
- No se envían `fieldgroups`, `legacy_variation_id`, `legacy_variation_sku` ni `quantity_for_shipping_estimate`. `fieldgroups` puede pedir datos del vendedor; no hace falta.
- Cabecera `X-EBAY-C-MARKETPLACE-ID: EBAY_ES`. En el esquema es opcional, pero fuera de Estados Unidos es necesaria: si falta o no vale, el valor por defecto es `EBAY_US`. `EBAY_ES` es el sitio de España (`ebay.es`) en `MarketplaceIdEnum`.
- No se envía `X-EBAY-C-ENDUSERCTX`. Esa cabecera sirve para la URL de afiliado o para estimar el envío.
- El token es el mismo de Browse: client credentials, ámbito `https://api.ebay.com/oauth/api_scope`, `tokenUrl` `https://api.ebay.com/identity/v1/oauth2/token`.
- Una respuesta 200 es un objeto `Item`. `legacyItemId` e `itemId` están en `required`. La lectura es `ok` solo cuando `legacyItemId` es exactamente el id pedido y `itemId` es un id usable. Si `legacyItemId` falta o es distinto, el estado es `identifier-mismatch`. Si el cuerpo no es un objeto o falta `itemId`, el estado es `invalid-response`. Ninguno de esos dos estados es una lectura válida.
- El texto del método dice que un anuncio con variaciones también necesita `legacy_variation_id`. No se inventa ese parámetro. Si el `legacyItemId` devuelto no coincide, no se da por bueno.
- 400, 404, 409 y 500 son `Error`. 409 significa «Conflict» en el esquema; no se interpreta como otra cosa. Esos estados, y una redirección, quedan en `unavailable`. 403 no se reintenta.

El cuerpo pasa por el mismo límite de tiempo, el mismo tope de bytes, el mismo tratamiento HTTP y `redirect: 'manual'` que el resto del cliente. `seller`, `description`, `title` y `itemAffiliateWebUrl` no se copian. `itemWebUrlIsSourceUrl` sigue en false. Un valor que el lector estrecho descarta (por ejemplo un `conditionId` que no es texto de tres a cinco dígitos) se informa como ausente en esta ruta.

## Qué sale en la lectura

Cada campo dice `fromBody: 'absent'`, `'present'` o `'unusable'`. `missing` lista los ausentes. No se copian `seller`, `description`, `title` ni `itemAffiliateWebUrl`. `itemWebUrlIsSourceUrl` queda en false. En la ruta REST, `itemIdRequested` es el id que se escribió y `legacyItemIdRequested` queda en null. En la ruta numérica, `legacyItemIdRequested` es el id pedido y `itemIdRequested` es el `itemId` REST del cuerpo.

| Campo | De dónde sale |
| --- | --- |
| `itemId`, `legacyItemId` | Propiedades de texto del cuerpo, si cumplen el patrón del id. |
| `epid` | Propiedad `epid`, si viene y no es igual al id del anuncio. |
| `categoryId`, `listingMarketplaceId` | Esas propiedades, solo como texto no vacío. Un número no se convierte. |
| `condition` | El nombre que venga en el cuerpo. No se traduce a una condición interna. |
| `conditionId` | La propiedad, si es un texto de tres a cinco dígitos. No se añade a la lista admitida. |
| `itemWebUrl` | El texto del cuerpo, para revisarlo. Sigue sin ser `sourceUrl`. |
| `priceValue`, `currency` | `price.value` y `price.currency`. Si falta el objeto, los dos están ausentes. |

## Qué sigue fuera de esta lectura

- Un ePID canónico para `nintendo-switch`, o un producto nuevo por color con su propia `verificationRef`. Esta lectura no elige.
- `listingMarketplaceId` y `categoryId` solo cuentan si vienen en un cuerpo real. Un fixture no los valida.
- La política de condiciones de esa categoría. Sigue el apartado de abajo. Esta lectura no la pide.
- La propuesta de URL de `www.ebay.es`, que sigue sin aplicarse.

## `get_item_condition_policies`

Método citado, no llamado: `GET /sell/metadata/v1/marketplace/{marketplace_id}/get_item_condition_policies`.

La página oficial de desarrollador respondió 403 en esta revisión, así que el OpenAPI no se volvió a leer. El cliente generado ya citado en el expediente de la Switch, `docs/Api/MarketplaceApi.md` de `zVPS/ebay-sell-metadata-php-client`, dice para este método:

- La autorización listada es Authorization Code y Client Credentials, las dos.
- El token de client credentials con el ámbito `https://api.ebay.com/oauth/api_scope` no devuelve la condición `2000`. Esa condición pide authorization code y el ámbito `https://api.ebay.com/oauth/api_scope/sell.inventory`.
- Ese ámbito de inventario no es el de Browse. El token de aplicación de `lib/ebay-application-auth.ts` no se trata como suficiente para la lista completa.
- El filtro `categoryIds` es opcional en ese cliente. Sin un `categoryId` salido de un `getItem` real no hay categoría que consultar. Los números de ejemplo de ese cliente no son la categoría de la Switch.

No se implementa el cliente de Metadata y no se piden credenciales para ese flujo.
