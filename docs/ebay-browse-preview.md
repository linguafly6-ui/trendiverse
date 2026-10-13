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

`conditionId` 1000 es el id de un artículo nuevo en la guía https://developer.ebay.com/api-docs/sell/static/metadata/condition-id-values.html. Esa guía describe el mercado de EE. UU. y dice que el subconjunto depende de la categoría. La ayuda de España, http://pages.ebay.es/help/sell/item-condition.html, es una página de venta y no está leída. El lector de Metadata no se ha ejecutado. 1000 no entra en `EBAY_ES_ADMITTED_CONDITION_IDS`.

La allowlist sigue vacía. Copiar 139971 a la variante o rellenar la allowlist no cumple el contrato: falta el aspecto HEG-001, el significado de la categoría y la política de condiciones de EBAY_ES.

## Taxonomy y Metadata

En este entorno no se ha llamado a Taxonomy ni a Metadata: `EBAY_CLIENT_ID` y `EBAY_CERT_ID` no estaban presentes.

Una lectura local aparte, no hecha aquí, devolvió HTTP 200 para el árbol por defecto de `EBAY_ES`: `categoryTreeId` `186`, `categoryTreeVersion` `96`. El subárbol de `139971` se llamó «Consolas» y `leafCategoryTreeNode` vino `true`. Ese nombre no identifica Nintendo Switch ni Nintendo Switch OLED. La variante no guarda ese `categoryId`. El OpenAPI de compatibilidad de vehículos también escribe «eBay Spain: 186»; esa lista no es `getDefaultCategoryTreeId`. El `186` que se usa abajo es el de la lectura local del árbol por defecto.

La especificación leída es Taxonomy API v1.1.1 (`commerce_taxonomy_v1_oas3.json`) y Metadata API v1.12.1 (`sell_metadata_v1_oas3.json`).

| Operación | Método y ruta | Autenticación |
| --- | --- | --- |
| `getDefaultCategoryTreeId` | `GET /commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_ES` | Client credentials, ámbito `https://api.ebay.com/oauth/api_scope`. El mismo token de aplicación que Browse. |
| `getCategorySubtree` | `GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_subtree?category_id=139971` | El mismo ámbito. El `category_tree_id` sale de la operación anterior. No se envía `X-EBAY-C-MARKETPLACE-ID`. |
| `getCategorySuggestions` | `GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_suggestions?q=` | El mismo ámbito. Es la búsqueda por texto. El método dice que devuelve hojas y la lista de antecesores, del padre inmediato a la raíz. El esquema `CategorySuggestion` no trae `leafCategoryTreeNode`, así que la ausencia de ese campo no se lee como hoja ni como no-hoja. No es el árbol completo: `getCategoryTree` no se llama. |
| `getItemAspectsForCategory` | `GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_item_aspects_for_category?category_id=` | El requisito lista a la vez `api_scope` y `https://api.ebay.com/oauth/api_scope/metadata.insights`. `category_id` tiene que ser una hoja. Si no lo es, el error es 62009. El cuerpo es `AspectMetadata.aspects`: nombre localizado, `aspectRequired` y `aspectUsage`. No trae el `categoryId`. Los valores permitidos no se guardan. |
| `getItemConditionPolicies` | `GET /sell/metadata/v1/marketplace/EBAY_ES/get_item_condition_policies?filter=categoryIds:{139971}` | El OpenAPI lista `api_scope` y `sell.inventory` en el mismo requisito. El texto del método dice que el token de client credentials no devuelve las condiciones restringidas 2000, 2010, 2020 y 2030. Esas piden authorization code y `https://api.ebay.com/oauth/api_scope/sell.inventory`. España no está en la lista de mercados refurbished de ese texto. La guía HTML del authorization code respondió 403, así que no se implementa el intercambio. |

`leafCategoryTreeNode` solo viene cuando es `true`. Si falta, no se convierte en `false`. El padre no trae nombre: solo un href de `getCategorySubtree`. `get_item_condition_policies` puede devolver otras categorías hoja; solo cuenta el `categoryId` pedido. `1000` sigue fuera de la lista de segunda mano. `EBAY_ES_ADMITTED_CONDITION_IDS` no cambia.

Con las dos variables de Browse ya definidas, y sin imprimirlas:

```
npx tsx scripts/read-ebay-es-category.ts
```

Ese script llama a Taxonomy y deja Metadata en `not-run`. No valida la variante.

Para buscar por nombre, sin descargar el árbol, cada consulta va aparte y lleva la frase `confirmo-una-sugerencia`. Sin esa frase no hay petición. Estas tres no se han ejecutado aquí:

```
npx tsx scripts/read-ebay-es-category-suggestions.ts confirmo-una-sugerencia "Nintendo Switch"
npx tsx scripts/read-ebay-es-category-suggestions.ts confirmo-una-sugerencia "Nintendo Switch OLED"
npx tsx scripts/read-ebay-es-category-suggestions.ts confirmo-una-sugerencia "consolas portátiles"
```

Una sugerencia, aunque el nombre diga Nintendo Switch, no se guarda en la variante. Metadata sigue sin llamarse.

Esas tres consultas sí se ejecutaron en una lectura local, con HTTP 200, árbol `186` y versión `96`. No se ejecutaron en este entorno. El orden es el de la respuesta:

| Consulta | categoryId | Nombre | Padre en esa respuesta | Hoja |
| --- | --- | --- | --- | --- |
| Nintendo Switch | 139971 | Consolas | 1249 Consolas y videojuegos | ausente en la sugerencia |
| Nintendo Switch | 139973 | Videojuegos | 1249 Consolas y videojuegos | ausente en la sugerencia |
| Nintendo Switch | 117042 | Mandos | 54968 Accesorios | ausente en la sugerencia |
| Nintendo Switch OLED | 139971 | Consolas | 1249 Consolas y videojuegos | ausente en la sugerencia |
| Nintendo Switch OLED | 171833 | Recambios y herramientas | no vino en esa respuesta | ausente en la sugerencia |
| Nintendo Switch OLED | 69528 | Dibujos animados | no vino en esa respuesta | ausente en la sugerencia |
| Nintendo Switch OLED | 117042 | Mandos | no vino en esa respuesta | ausente en la sugerencia |
| Nintendo Switch OLED | 182179 | Estantes y soportes | no vino en esa respuesta | ausente en la sugerencia |
| consolas portátiles | 139971 | Consolas | 1249 Consolas y videojuegos | ausente en la sugerencia |
| consolas portátiles | 139973 | Videojuegos | 1249 Consolas y videojuegos | ausente en la sugerencia |

La consulta «consolas portátiles» trajo más categorías. Sus ids no se anotaron. El subárbol de `139971` sigue siendo la lectura aparte: nombre Consolas, `leafCategoryTreeNode` true, árbol 186, versión 96. Esa hoja no está validada para Nintendo Switch OLED. `139973` no tiene lectura de subárbol, así que no se sabe si es hoja y no se le piden aspectos.

Para leer aspectos hace falta la frase de una sola categoría. `139971` puede pedirse porque el subárbol ya dijo que es hoja. `139973` no: primero hay que leer su subárbol. Ninguna de las dos llamadas se ha hecho aquí. Sin la frase no hay petición. El ámbito de aspectos no cambia el ámbito de Browse.

```
npx tsx scripts/read-ebay-es-category-aspects.ts confirmo-subarbol-de-una-categoria 139973
npx tsx scripts/read-ebay-es-category-aspects.ts confirmo-aspectos-de-una-hoja 139971
```

Los aspectos, si llegan, describen lo que un vendedor rellena en esa hoja. No convierten `139971` en la categoría de la variante.

La siguiente lectura que podría desbloquear la consulta, sin desplegar y sin escribir en eBay, es esta:

1. Un getItem de EBAY_ES cuyo aspecto Modelo sea exactamente `HEG-001` y que, en ese mismo cuerpo, repita el ePID, el GTIN, el MPN, 64 GB y el color blanco.
2. Los aspectos de la hoja `139971` y, antes, el subárbol de `139973` para saber si es hoja. El árbol por defecto y el subárbol de `139971` ya se leyeron en local. Esos aspectos no validan la categoría por sí solos.
3. `get_item_condition_policies` de Metadata para la categoría que quede en EBAY_ES. Solo entonces se puede escribir un subconjunto de condiciones de segunda mano. 1000 no forma parte de ese subconjunto. Metadata no se consulta en este paso.
