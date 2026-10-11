# Lectura manual de un anuncio de Browse

Esta lectura no entra en el catálogo y no enciende el proveedor. `EBAY_BROWSE_SOURCE_ENABLED` sigue en false. `EBAY_ES_ADMITTED_CONDITION_IDS` sigue vacía. `normalizeEbaySourceUrl` sigue rechazando un host de eBay. Los ePID `21048307585` y `23048312547` no se asignan a `nintendo-switch`.

## Qué puede hacer el cliente que ya existe

`lib/ebay-browse-client.ts` tiene dos operaciones, las dos en `EBAY_ES`:

- `search` envía `q` y `limit` a `item_summary/search`. No busca por identificador.
- `getItem` pide `GET /buy/browse/v1/item/{item_id}`. El `item_id` tiene que coincidir con el `itemId` del cuerpo. Si no coincide, el resultado es `invalid-response` y el cuerpo se descarta.

Un `legacyItemId` numérico cabe en el patrón del path, pero no es el `itemId` REST (`v1|…|…`). El cliente no tiene `get_item_by_legacy_id`. `collectBrowseItemReading` reconoce un id solo de dígitos y no hace la petición.

## Cómo ejecutarla fuera de CI

La función no lee credenciales del entorno. Sin `confirm: 'run-outside-ci'` y sin un `fetchImpl` explícito devuelve `not-run`.

En un archivo local que no se suba al repositorio:

```ts
import { collectBrowseItemReading } from './lib/ebay-browse-item-reading'

const result = await collectBrowseItemReading({
  confirm: 'run-outside-ci',
  itemId: 'v1|…|…',
  clientId: '…',
  clientSecret: '…',
  fetchImpl: globalThis.fetch,
})
```

El `itemId` lo escribe la persona. No se imprime el token ni el secreto. No se guarda el cuerpo completo. El JSON de `reading` es lo único que hace falta revisar.

## Qué sale en la lectura

Cada campo dice `fromBody: 'absent'`, `'present'` o `'unusable'`. `missing` lista los ausentes. No se copian `seller`, `description`, `title` ni `itemAffiliateWebUrl`. `itemWebUrlIsSourceUrl` queda en false.

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
