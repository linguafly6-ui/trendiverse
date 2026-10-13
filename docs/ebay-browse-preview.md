# Preview de eBay Browse

La publicación sigue cerrada. Faltan condiciones admitidas, categorías y ePID validados. Estas variables viven en el entorno de Cloudflare, no en el repositorio ni en `[vars]` de `wrangler.toml`. Producción y Preview son dos juegos distintos: hay que rellenar cada uno por separado.

## Consulta

| Variable | Efecto |
| --- | --- |
| `EBAY_BROWSE_SOURCE_ENABLED` | Solo el texto `true` permite leer. Cualquier otro valor, o su ausencia, deja la fuente apagada. |
| `EBAY_CLIENT_ID` | Client ID de la aplicación. Sin un par válido no hay token y no hay llamada a Browse. |
| `EBAY_CERT_ID` | Cert ID, el secreto de client credentials. Se lee con ese nombre. No se lee `EBAY_CLIENT_SECRET`. |

Aunque las tres estén presentes, no hay llamada a Browse mientras ocurra cualquiera de estas cosas:

- `EBAY_ES_ADMITTED_CONDITION_IDS` sigue vacío. Una lista vacía no significa «cualquier condición». No hay una política de `EBAY_ES` aprobada para la categoría del anuncio.
- Ninguna variante tiene `marketplaceIdentifier` en `validated` dentro de la allowlist.
- El `categoryId` de cada variante sigue en `null`. Tiene que salir del cuerpo de un `getItem` con `listingMarketplaceId` `EBAY_ES`, no de una búsqueda ni de la ficha de catálogo.
- La Nintendo Switch OLED blanca tiene un getItem de EBAY_ES, pero el aspecto Modelo no es HEG-001. La neón y Splatoon 3 siguen sin esa lectura. El `categoryId` observado no está guardado en la variante.

El flag de código `EBAY_BROWSE_SOURCE_ENABLED` del adapter de métricas permanece `false`. La página usa el flag de entorno, la misma lista de condiciones y la misma compuerta. No vuelve a filtrar con otra política.

## Monetización

La campaña no es un requisito para consultar ni para mostrar una ficha ordinaria. La documentación de Browse exige `itemAffiliateWebUrl` para cobrar comisión, no para abrir el anuncio.

| Variable | Efecto |
| --- | --- |
| `EBAY_EPN_CAMPAIGN_ID` | Diez dígitos, el `affiliateCampaignId` que entrega eBay Partner Network. No tiene valor por defecto. |

Si falta o no son diez dígitos, no se envía `X-EBAY-C-ENDUSERCTX` y el enlace sigue siendo `itemWebUrl`. No se añade `campid` a mano. Si el valor es válido, las llamadas Browse llevan `affiliateCampaignId=<esos diez dígitos>`. El enlace de afiliado solo se usa cuando la respuesta trae `itemAffiliateWebUrl` y su `campid` coincide con esa campaña.

`EBAY_EPN_CONFIGURED` es una constante `false` del repositorio. No se lee del entorno. Guardar el número de campaña en una variable con ese nombre no monetiza.

## Cómo añadir una variante real

1. Un `getItem` de un anuncio de `EBAY_ES` tiene que traer, en ese mismo cuerpo, el ePID, el GTIN, el MPN, el modelo, la capacidad, el color y el `categoryId` de esa variante.
2. El `categoryId` se anota en esa variante, no en otra y no en el slug editorial `nintendo-switch`.
3. El ePID entra en el contrato de marketplace id como `validated`, con procedencia, método y referencia de auditoría, y el proveedor y el ámbito entran en la allowlist.
4. Los `conditionId` admitidos para esa categoría se escriben en `EBAY_ES_ADMITTED_CONDITION_IDS`. Mientras la lista esté vacía, la consulta no se hace.

No se copia el ePID de una variante a otra. No se marca ninguna variante como validada desde este documento.

## Diagnóstico

La lectura interna distingue fuente apagada, credenciales ausentes, condiciones sin configurar, variante o categoría sin validar, error de autenticación, error de Browse, respuesta vacía y error de proceso. Esos códigos no se escriben en el HTML. La respuesta no incluye credenciales, tokens ni el identificador de campaña.

## Lectura local de la OLED blanca

`scripts/read-ebay-white-oled-detail.ts` hace dos lecturas y ninguna escritura.

1. `GET https://api.ebay.com/buy/browse/v1/item_summary/search` con `epid=21048307585` y `limit=10`.
2. Para cada `itemId` devuelto, `GET https://api.ebay.com/buy/browse/v1/item/{itemId}`.

Las dos llevan `X-EBAY-C-MARKETPLACE-ID: EBAY_ES`. El `itemId` sale de la búsqueda; el ePID no sirve como argumento de `getItem`. Si faltan `EBAY_CLIENT_ID` o `EBAY_CERT_ID`, el script termina sin llamar a eBay.

La salida añade `conditionId` como valor observado. Ese número no entra en `EBAY_ES_ADMITTED_CONDITION_IDS`. `identidadDeVariante: si` solo significa que ese cuerpo trae el ePID, el GTIN, el MPN, HEG-001, 64 GB, el color y `EBAY_ES`. `veredicto` permanece `unconfirmed` mientras falten la allowlist, el identificador validado o la política de condiciones. `varianteValidada` permanece en `false`. Un cuerpo con otro `listingMarketplaceId` no valida la variante.

`categoryId` se copia solo si viene en ese mismo `getItem`. No es la categoría editorial `gaming`. La lista de condiciones admitidas es global y está vacía: un `conditionId` visto en un anuncio no la rellena. La guía de IDs de eBay describe definiciones de EE. UU.; el subconjunto de cada categoría de `EBAY_ES` no está leído en este repositorio. No hay cliente de Metadata API.

Con `EBAY_CLIENT_ID` y `EBAY_CERT_ID` ya definidas en el entorno:

```
npx tsx scripts/read-ebay-white-oled-detail.ts
```

La salida marca cada campo como valor, `ausente` o `no comprobado`. No imprime las credenciales. `varianteValidada` permanece en `false`.

## Lectura real del anuncio 206264425581

Una ejecución local de ese script leyó el getItem `v1|206264425581|0` en EBAY_ES. La ficha es https://www.ebay.es/itm/206264425581. `camposCompletos` salió en sí y `varianteValidada` en false. La variante `nintendo-switch-oled-blanca` sigue en `unvalidated`.

| Dato | Origen | Valor |
| --- | --- | --- |
| Marketplace, ePID 21048307585, GTIN 0045496453435, MPN 10007454, capacidad 64 GB, color Blanco, categoryId 139971, conditionId 1000 | Ese getItem | Presentes en el mismo cuerpo |
| Aspecto Modelo | Ese getItem | `Nintendo Switch (modelo OLED)`. No es `HEG-001` |
| HEG-001 | Catálogo local | Número de fabricante. No venía en el aspecto Modelo |
| Precio visto en el anuncio | Ese getItem | No se archiva |
| Anuncio 158070574781 | Informe de la misma ejecución | Sin ePID. No se fusiona con el anterior |
| Nombre de la categoría 139971 y si es hoja en EBAY_ES | Pendiente | No está en el repositorio |
| Condiciones admitidas de esa categoría en EBAY_ES | Pendiente | No está en el repositorio |

`conditionId` 1000 es el id de un artículo nuevo en la guía https://developer.ebay.com/api-docs/sell/static/metadata/condition-id-values.html. Esa guía describe el mercado de EE. UU. y dice que el subconjunto depende de la categoría. La ayuda de España, http://pages.ebay.es/help/sell/item-condition.html, es una página de venta y no está leída. No hay cliente de Metadata API en esta rama. 1000 no entra en `EBAY_ES_ADMITTED_CONDITION_IDS`.

La allowlist sigue vacía. Copiar 139971 a la variante o rellenar la allowlist no cumple el contrato: falta el aspecto HEG-001, el significado de la categoría y la política de condiciones de EBAY_ES.

La siguiente lectura que podría desbloquear la consulta, sin desplegar y sin escribir en eBay, es esta:

1. Un getItem de EBAY_ES cuyo aspecto Modelo sea exactamente `HEG-001` y que, en ese mismo cuerpo, repita el ePID, el GTIN, el MPN, 64 GB y el color blanco.
2. `get_default_category_tree_id` y `get_category_subtree` de Taxonomy para el `categoryId` de ese cuerpo, con marketplace EBAY_ES, hasta tener el nombre y si el nodo es hoja.
3. `get_item_condition_policies` de Metadata para esa categoría en EBAY_ES. Solo entonces se puede escribir un subconjunto de condiciones de segunda mano. 1000 no forma parte de ese subconjunto.
