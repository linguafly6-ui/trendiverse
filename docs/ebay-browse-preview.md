# Preview de eBay Browse

La publicación sigue cerrada. Estas variables viven en el entorno de Cloudflare de Preview, no en el repositorio ni en `[vars]` de `wrangler.toml`.

| Variable | Efecto si falta |
| --- | --- |
| `EBAY_BROWSE_SOURCE_ENABLED` | Distinto de `true`: no hay lectura. |
| `EBAY_CLIENT_ID` | Sin Client ID no hay token. |
| `EBAY_CERT_ID` | Sin Cert ID no hay token. |

Aunque las tres estén presentes, `/segunda-mano` y `/segunda-mano/gaming` no muestran anuncios mientras ocurra cualquiera de estas cosas:

- `EBAY_ES_ADMITTED_CONDITION_IDS` sigue vacío. No hay una política de condiciones de `EBAY_ES` aprobada para la categoría del anuncio.
- `EBAY_EPN_CONFIGURED` sigue en `false`. No hay `campid` ni enlace de afiliado.
- Ninguna variante tiene `marketplaceIdentifier` en `validated`.
- El `categoryId` de cada variante sigue en `null`. Tiene que salir del cuerpo de un `getItem` con `listingMarketplaceId` `EBAY_ES`, no de una búsqueda ni de la ficha de catálogo.
- La Nintendo Switch OLED blanca, la neón y Splatoon 3 siguen sin una lectura que confirme a la vez ePID, GTIN, MPN, HEG-001, 64 GB y color.

`EBAY_BROWSE_SOURCE_ENABLED` en código permanece `false` para el adapter de métricas. Un fallo de eBay devuelve una lista vacía y la página sigue renderizando el catálogo editorial.
