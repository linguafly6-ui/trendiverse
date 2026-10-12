# Diagnóstico de la categoría 139971 en EBAY_ES

Este procedimiento es local, voluntario y de solo lectura. No enciende el proveedor. `EBAY_BROWSE_SOURCE_ENABLED` sigue en false. El proveedor por defecto sigue vacío. `EBAY_ES_ADMITTED_CONDITION_IDS` sigue vacía. `SELL_METADATA_CONDITION_CONTRACT_IN_REPO` sigue en false: el archivo OpenAPI no está en el repositorio. No se asocia ningún ePID a `nintendo-switch`. Una URL de eBay sigue sin ser `sourceUrl`.

El id `139971` es el que hay que comprobar. Apareció como `categoryId` en una lectura manual del anuncio `900001069917`, cuyo `listingMarketplaceId` era `EBAY_IT`. Esa aparición no demuestra que sea la categoría de `nintendo-switch`, ni que el anuncio pertenezca al árbol de `EBAY_ES`. El precio de aquella lectura no se archiva aquí.

## Qué está verificado en la documentación

Se leyeron estos OpenAPI, sin llamar a `api.ebay.com`:

- Taxonomy API v1.1.1, OpenAPI 3.0.0: `https://developer.ebay.com/api-docs/commerce/taxonomy/openapi/3/commerce_taxonomy_v1_oas3.json`.
- Metadata API v1.12.1, OpenAPI 3.0.0: `https://developer.ebay.com/api-docs/sell/metadata/openapi/3/sell_metadata_v1_oas3.json`.

Las guías HTML de OAuth (`oauth-authorization-code-grant.html` y la de client credentials) respondieron 403. Por eso el cuerpo del intercambio de authorization code no se implementa.

### Taxonomy API

Servidor de producción: `https://api.ebay.com`, base `/commerce/taxonomy/v1`. El esquema de seguridad de las dos operaciones usadas es client credentials con un solo ámbito: `https://api.ebay.com/oauth/api_scope`. El `tokenUrl` es `https://api.ebay.com/identity/v1/oauth2/token`. Es el mismo ámbito que el token de aplicación de Browse. El esquema también publica `metadata.insights`, y estas dos operaciones no lo piden.

`EBAY_ES` no aparece como enum en ese OpenAPI. `marketplace_id` es un query obligatorio, descrito como el id del marketplace cuyo árbol por defecto se quiere.

1. `GET /get_default_category_tree_id`, `operationId` `getDefaultCategoryTreeId`. Query obligatorio: `marketplace_id`. La respuesta 200 es `BaseCategoryTree`: `categoryTreeId` y `categoryTreeVersion`, ninguno de los dos en `required`. 204 es «No content». 400 puede traer `62002` (falta marketplace) o `62003` (marketplace no encontrado). 500 puede traer `62000`.
2. `GET /category_tree/{category_tree_id}/get_category_subtree`, `operationId` `getCategorySubtree`. Path obligatorio `category_tree_id`. Query obligatorio `category_id`. 200 es `CategorySubtree`. 404 es «Not Found». 400 puede traer `62004` (árbol no encontrado), `62005` (el category id no pertenece a ese árbol), `62006` (falta category id) o `62008` (el id es la raíz y el método que devolvería el árbol entero es otro). 500 puede traer `62000`.

`CategoryTreeNode` tiene `category.categoryId`, `category.categoryName`, `categoryTreeNodeLevel` (la raíz es el nivel 0), `childCategoryTreeNodes` solo si no es hoja, `leafCategoryTreeNode` y `parentCategoryTreeNodeHref`. El OpenAPI dice que `leafCategoryTreeNode` se devuelve solo cuando el valor es `true`. Si falta, esta lectura informa `absent` y no lo convierte en `false`.

El esquema no tiene un campo `categoryPath`. `categoryTreeNodeAncestors` existe en `CategorySuggestion`, y `getCategorySuggestions` exige el query `q` de palabras libres. No es una consulta por id y no se usa para demostrar la ruta de `139971`.

`getCategoryTree` devuelve el árbol entero. `getExpiredCategories` solo mapea hojas caducadas que tienen categoría activa de destino. Ninguno de los dos se llama. Seguir `parentCategoryTreeNodeHref` volvería a pedir subárboles de los padres, con todos sus descendientes. Esta lectura no lo hace.

El id de árbol no tiene patrón oficial. En local se acepta un segmento `[A-Za-z0-9_-]{1,32}`. Si un id real no cabe en ese segmento, el estado es `invalid-response` y no se construye la URL. No se envía `Accept-Encoding: gzip`: el método avisa de que el cuerpo puede ser grande y aquí el tope sigue siendo 128 KiB. Un cuerpo mayor, o uno que no sea JSON, es `invalid-response` y no se presenta un nombre a medias. No se envía `X-EBAY-C-MARKETPLACE-ID` ni `X-EBAY-C-ENDUSERCTX`. El marketplace va en el query.

### Metadata API

`GET /marketplace/{marketplace_id}/get_item_condition_policies`, `operationId` `getItemConditionPolicies`. La ruta de esta lectura es `EBAY_ES`.

El query `filter` es opcional. Admite hasta 50 category id separados por `|`, con la forma `filter=categoryIds:{100|101|102}`, y hay que codificarlo. Para un solo id queda `filter=categoryIds%3A%7B139971%7D`. El texto del parámetro dice que, al indicar un `categoryId`, la respuesta incluye la política de ese nodo y las políticas de las hojas que cuelgan de él. Una respuesta puede traer otros category id. Solo las condiciones cuyo `categoryId` es exactamente el pedido se presentan como política de esa categoría. Si el id pedido no está, el estado es `category-not-in-response`.

`ItemConditionPolicy` tiene `categoryId`, `categoryTreeId`, `itemConditionRequired` y `itemConditions`. De cada `ItemCondition` el informe copia solo `conditionId` y `conditionDescription`. No copia `conditionHelpText`, `conditionDescriptors` ni `usage`.

En un 200, los códigos documentados son `46002` (filtro no válido), `46003` (el category id no existe en ese marketplace) y `46004` (solo se consideran 50 id del filtro). 400 documenta `46001` (marketplace no encontrado). 500 documenta `46000`. 204 es «No content» y no es una lista de condiciones. 404 es «Not found». El informe enseña el `categoryId` consultado, los `conditionId` y las descripciones de esa categoría, el estado HTTP y esos `errorId`. El texto `message` y `longMessage` de la API no se guarda: puede repetir datos de la petición. Un `errorId` desconocido se muestra solo como número, con la frase fija de los códigos de arriba cuando el número es uno de esos.

### OAuth de Metadata

El esquema de Metadata tiene dos flujos:

- client credentials, ámbito `https://api.ebay.com/oauth/api_scope`, `tokenUrl` `https://api.ebay.com/identity/v1/oauth2/token`;
- authorization code, `authorizationUrl` `https://auth.ebay.com/oauth2/authorize`, el mismo `tokenUrl`, ámbito `https://api.ebay.com/oauth/api_scope/sell.inventory`.

La operación lista los dos ámbitos en un mismo requisito. El texto del método es más concreto: un token de client credentials con `https://api.ebay.com/oauth/api_scope` no devuelve las condiciones restringidas o refurbished. Esas piden authorization code y `sell.inventory`. El programa refurbished que cita el método cubre Australia, Canadá, Canadá francófona, Alemania, Francia, Italia, Reino Unido y Estados Unidos. España no está en esa lista. Eso no convierte el token de aplicación de Browse en un token suficiente para la lista restringida. `completePolicy` queda en false porque este código no demuestra de qué flujo salió el token.

El ámbito mínimo para la lista restringida, según ese texto, es authorization code con `https://api.ebay.com/oauth/api_scope/sell.inventory`. No se añade ningún otro ámbito.

La guía HTML que describiría el consentimiento y el `POST` del `authorization_code` respondió 403. El OpenAPI publica la URL de autorización, la URL del token y el ámbito, y no publica el cuerpo de ese `POST` (`code`, `redirect_uri` / RuName, `response_type`). No se inventan esos parámetros y no hay cliente de intercambio. Quien quiera la lista restringida obtiene el token fuera de este repositorio, con ese único ámbito, y lo pega en el aviso oculto. Un token vacío no dispara la llamada. El token no se imprime, no se escribe en disco y no se lee de `process.env`.

## Qué todavía necesita una llamada real autorizada

Estas tres cosas no están verificadas. Hace falta que una persona ejecute el script fuera de CI:

- Si `139971` existe en el árbol por defecto de `EBAY_ES`, y cuál es su `categoryName`, su nivel y si el nodo declara `leafCategoryTreeNode: true`.
- La ruta de ancestros. `getCategorySubtree` no la trae. Aunque la llamada real devuelva el nombre, la ruta sigue en `not-in-getCategorySubtree-contract`. Un 404 tampoco demuestra que el id no haya existido nunca.
- Los `conditionId` y las descripciones que Metadata devuelva para ese `categoryId` en `EBAY_ES`, con el estado HTTP y los `errorId`. Esa respuesta sigue sin admitir condiciones. La lista `EBAY_ES_ADMITTED_CONDITION_IDS` no cambia.

## Cómo ejecutarlo

El script no está en `package.json` ni en el workflow. Desde una copia local de esta rama:

```bash
npx tsx scripts/read-ebay-es-category-diagnostics.ts
```

El orden es este:

1. Escribir exactamente `run-outside-ci`. Otra respuesta termina en `not-run` y no pide credenciales.
2. Client ID y Cert ID de producción, sin eco. Sirven para el token de aplicación de Taxonomy, ámbito `https://api.ebay.com/oauth/api_scope`. Una línea vacía termina en `not-run`.
3. Revisar el informe de taxonomía. Después, el script pide otra confirmación.
4. Escribir exactamente `run-metadata-outside-ci` solo si se quiere la segunda llamada. Otra respuesta deja Metadata en `not-run`.
5. Pegar un access token ya emitido, sin eco. Vacío: no hay llamada. Este programa no lo genera. Para la lista restringida el token tiene que salir del authorization code con el ámbito `sell.inventory`, obtenido fuera de aquí por el bloqueo del paso anterior.

El informe de taxonomía muestra `categoryId`, `categoryName` si la respuesta lo trae usable, el id y la versión del árbol, el nivel, la hoja solo cuando es `true`, si hay descendientes como booleano, el estado HTTP y los `errorId`. No muestra nombres de categorías hijas.

El informe de condiciones muestra el `categoryId` consultado, cada `conditionId` con su `conditionDescription`, el estado HTTP y los `errorId`. Los otros `categoryId` del cuerpo se listan aparte y sus condiciones no se copian. No se guarda el cuerpo completo.

Las dos llamadas usan `redirect: 'manual'`, un tiempo límite de 10 segundos y el tope de 128 KiB. No forman parte de `npm test`, del build ni de CI.
