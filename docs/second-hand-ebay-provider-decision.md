# Decisión de proveedor: eBay para Segunda Mano en España

Consulta del 2026-10-09. Este documento no activa el adapter, no llama a la API, no guarda anuncios y no introduce precios ni identificadores reales. `EBAY_BROWSE_SOURCE_ENABLED` sigue en `false`.

La pregunta que cierra esta revisión es si podemos activar eBay en producción ahora mismo. La respuesta es no.

Hay tres capas, y no se mezclan:

1. Hechos de la especificación Browse API y de la guía Browse, leídas ese día.
2. Lo que escribe el PDF «eBay Developers Program Terms of Use and API License Agreement» del 13 de junio de 2018. Es una lectura de ese PDF. El PDF de 2018 no está confirmado como el acuerdo que se firma hoy.
3. Condiciones que dependen de una cuenta, una aprobación, un contrato o una lectura que esta consulta no obtuvo. Siguen marcadas `UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`. Ninguna de esas condiciones queda resuelta aquí.

## Decision

- `candidate-provider`: eBay
- `marketplace`: `EBAY_ES`
- `status`: `blocked-pending-authorization`

La especificación Browse nombra el sitio de España. Eso no es acceso de producción, ni alta en eBay Partner Network, ni un identificador de producto validado. El catálogo sigue con un solo mapping verificado (`nintendo-switch`, identidad de fabricante) y con `externalProductId` y `marketplaceIdentifier` en `null` en los 18 slugs. El adapter no se enciende con este documento.

## Hechos de la especificación Browse

Leídos en `browse_api.json`, baseline v1.20.4, el 2026-10-09. No se llamó a `api.ebay.com` ni a `api.sandbox.ebay.com`.

- `MarketplaceIdEnum` describe `EBAY_ES` como el sitio de España (`ebay.es`).
- El header `X-EBAY-C-MARKETPLACE-ID` es obligatorio fuera de EE. UU. Si falta o es inválido, el valor usado es `EBAY_US`.
- La especificación publica el servidor de producción `https://api.ebay.com/buy/browse/v1` y el de sandbox `https://api.sandbox.ebay.com/buy/browse/v1`. Publicar la URL no es tener acceso.
- Todos los métodos de Browse exigen un token de aplicación por client credentials. `item_summary/search` y `getItem` declaran el ámbito `https://api.ebay.com/oauth/api_scope` («View public data from eBay»). El `tokenUrl` publicado es `https://api.ebay.com/identity/v1/oauth2/token`. Ese flujo está en `lib/ebay-application-auth.ts` y la búsqueda en `lib/ebay-browse-client.ts`. Ninguno enciende el adapter.
- `itemId` es el identificador REST del artículo. `legacyItemId` es el identificador del anuncio, el que suele verse en la URL de la ficha. Los dos nombran un anuncio.
- `epid` es el identificador de producto del catálogo de eBay e indica el producto al que pertenece el artículo. El parámetro de búsqueda `epid` limita los resultados a ese ePID y remite a `product_summary/search` de Catalog API para localizarlo. El número que aparece en el ejemplo de esa descripción no se copia a este repositorio. En el OpenAPI 3.1 baseline v1.20.4, `GET /buy/browse/v1/item/{item_id}` exige en `Item` `itemId`, `legacyItemId`, `itemWebUrl`, `categoryId` y `listingMarketplaceId`, entre otros. No exige `epid`, `price` ni `conditionId`. `ItemSummary` no marca esos campos como obligatorios. `itemWebUrl` es la ficha del anuncio. `lib/ebay-browse-offer.ts` no la acepta como `sourceUrl` y no asocia el anuncio por `itemId`.
- `gtin` es un GTIN (UPC, EAN o ISBN) definido fuera de eBay. No es un identificador asignado por el marketplace.
- `itemWebUrl` es la ficha del anuncio. `itemAffiliateWebUrl` es esa ficha con seguimiento de afiliado. La especificación dice que, para cobrar comisión, el afiliado tiene que reenviar con esa URL. También dice que el campo solo vuelve si el marketplace forma parte del Partner Network, que Singapur (`EBAY_SG`) no está soportado, y que la segunda condición escrita en el campo es que «el vendedor habilita el seguimiento de afiliado incluyendo el header `X-EBAY-C-ENDUSERCTX`». El JSON OpenAPI no contiene `affiliateCampaignId`.
- El header `X-EBAY-C-ENDUSERCTX` se describe como necesario para el reparto de ingresos de EPN y para estimaciones de envío.

La guía Browse, `https://developer.ebay.com/api-docs/buy/static/api-browse.html`, consultada el mismo día, añade un dato que el JSON no trae: si se forma parte de eBay Partner Network, hay que enviar `affiliateCampaignId` (obligatorio) y, en su caso, `affiliateReferenceId` (opcional, máximo 256 caracteres) en `X-EBAY-C-ENDUSERCTX` para que las peticiones Browse devuelvan `itemAffiliateWebUrl`. La guía dice que `affiliateCampaignId` es un número único de 10 dígitos que da EPN y que va en el `campid` del enlace. El ejemplo de URL de esa página no se copia aquí. La guía atribuye el header a quien llama a la API; el campo de la OpenAPI lo atribuye al vendedor. Las dos frases están en las fuentes. Esta revisión no elige una como procedimiento cerrado.

## Access prerequisites

Hace falta, y no está en el repositorio:

- Una cuenta del eBay Developers Program y unas Application Keys. El PDF de 2018, apartado 3.2, las define como claves confidenciales, propiedad de eBay, que no se comparten ni se transfieren sin consentimiento escrito, y revocables. No hay claves en este cambio. Que el texto que se firme hoy repita ese apartado sigue sin confirmar.
- Distinguir el servidor de producción del sandbox. Tener la URL no es tener acceso.
- El token de aplicación descrito arriba. `lib/ebay-application-auth.ts` lo pide y lo conserva solo en memoria; no está conectado al adapter y las claves siguen fuera del repositorio.
- Un alta distinta en eBay Partner Network. La portada `https://partnernetwork.ebay.es/` (copyright 1995-2026) ofrece registro y describe un modelo de afiliación: el partner integra su plataforma y cobra por una venta cualificada. También habla de acceso a feeds y APIs para partners técnicos. No dice que una clave de Browse conceda el alta de EPN.
- El `affiliateCampaignId` de la guía Browse, si más adelante se quiere la URL de afiliado. Conocer el formato de 10 dígitos no es tener una campaña.

`UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: la lista exacta de pasos de alta de producción (revisión de la aplicación, certificación y cupo diario). El apartado 2.3 del PDF de 2018 dice que ciertas APIs, cierto contenido y límites de llamadas más altos pueden exigir certificaciones especiales. No nombra Browse. Los apartados 3.3 y 9.13 dicen que eBay puede limitar el volumen y que un volumen no razonable, o contrario a la documentación del desarrollador, está prohibido. La página de límites de llamadas no se pudo leer en esta consulta. Que Browse en producción exija una certificación concreta, y cuál sea el trámite, queda sin confirmar.

`UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: que `EBAY_ES` esté admitido hoy como programa de EPN. La especificación nombra la exclusión de Singapur y no afirma que España esté incluido. El artículo «countries available as a program in EPN» cargó una carcasa vacía. El acuerdo de red de EPN pidió una comprobación de navegador y no se pudo leer. Que el acuerdo de EPN cambie las restricciones del PDF de 2018 para un afiliado también queda sin confirmar.

Comprobación manual pendiente, sin llamar a la API desde este repositorio: completar el alta en las páginas de desarrolladores y de EPN, guardar el texto que se firma y anotar si España está en el programa y si Browse exige una certificación aparte.

## Lectura del PDF de 2018

Se leyó el PDF de 18 páginas fechado el 13 de junio de 2018: `https://developer.ebay.com/cms/files/api_license_2018-10-26.pdf`. La especificación OpenAPI señala como licencia `https://developer.ebay.com/join/api-license-agreement`. Esa página HTML respondió 403. `UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: que el clickwrap vigente sea idéntico a ese PDF. El acuerdo de 4 de febrero de 2009 repite la regla de antigüedad de seis y veinticuatro horas. No se usa como texto vigente.

Lo que ese PDF escribe, como lectura del documento y no como dictamen sobre el contrato actual:

- **Mostrar.** El apartado 8.1.b permite un Public Display del contenido que ya es público, para promover eBay y dejar buscar y navegar anuncios. Hay que borrarlo cuando deja de ser público. El contenido de eBay no puede mezclarse con contenido que no sea de eBay: tiene que quedar visualmente aislado. Que la ficha editorial de Trendiverse cumpla ese aislamiento no se afirma aquí.
- **Antigüedad.** El apartado 8.1.c: la información de un anuncio mostrada no puede ser más de seis horas más antigua que la del sitio de eBay. El resto de eBay Content, no más de veinticuatro horas. Si el anuncio mostrado no está tan al día como el del sitio, la aplicación tiene que decir cuánto más antiguo es, aunque siga dentro de las seis horas.
- **Copia intermedia.** El apartado 3.1.b solo permite copias intermedias limitadas, necesarias para un uso permitido, y hay que borrarlas cuando ya no hagan falta. El apartado 9.8 prohíbe vender, alquilar, distribuir, copiar, almacenar o modificar eBay Content salvo para los fines que los términos permiten. En ese PDF no hay una cláusula que autorice un almacén indefinido ni una serie histórica.
- **Agregados y métricas.** El apartado 8.1.d exige permiso escrito previo y expreso para derivar estadísticas de sitio, precio medio de venta, mercancía bruta de una categoría, datos agregados de vendedores o compradores, rendimiento de vendedores y tasas de conversión. El apartado 9.6 prohíbe usar eBay Content, solo o con información de terceros, para sugerir o modelar precios de artículos anunciados en sitios de eBay. Una lectura prudente es que ahorro, mínimo, máximo, score y trend no están expresamente permitidos por esos apartados y que haría falta permiso escrito antes de calcularlos. El PDF no nombra esos campos de Trendiverse. Esto no es una conclusión jurídica sobre el acuerdo vigente.
- **Afiliación.** Esas cláusulas están en el PDF de la API. La especificación Browse añade el requisito de `itemAffiliateWebUrl` para la comisión. El PDF de 2018 no describe esa URL como una dispensa de la antigüedad, del almacenamiento o de la cláusula de modelar precios. Si el acuerdo de EPN, no leído, introduce otra regla para afiliados, queda en la marca de confirmación manual de arriba.

## Marketplace ID strategy

El identificador candidato, si más adelante se demuestra, es el ePID. En Browse, `epid` indica el producto al que pertenece el artículo. En Catalog API `v1_beta.5.3`, `epid` es «el eBay product ID de este producto». `product_summary/search` se describe como búsqueda para que un vendedor localice el producto del catálogo contra el que quiere anunciar. La seguridad publicada de esa operación es authorization code de usuario (`commerce.catalog.readonly` para un usuario con sesión iniciada, y `sell.inventory`), no el client credentials de Browse.

No es un identificador que este PR pueda rellenar:

- No se ha consultado el catálogo. No hay ningún ePID en los mappings.
- `UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: que una aplicación de compra pueda resolver un ePID sin token de usuario vendedor, y que un ePID aísle una sola configuración (capacidad, edición, revisión) y no una familia.
- `itemId` y `legacyItemId` nombran un anuncio. Una URL no es el identificador.
- `gtin` no es el identificador de marketplace. `HEG-001` es el número de modelo del fabricante de la Switch OLED ya verificada. Tampoco es un identificador de marketplace. Ninguno de los dos entra en `marketplaceIdentifier`.
- `externalProductId` no sustituye a ese identificador. El contrato de `lib/second-hand-marketplace-id.ts` decide si un valor está validado. `canComparePrices()` exige un `marketplaceIdentifier` que cumpla ese contrato. `asExternalMapping()` solo publica el valor canónico en ese caso y no copia `externalProductId`. Las listas de proveedores y ámbitos siguen vacías, así que la lista por defecto no valida ningún valor.
- `ebayOfferToObservation` es un normalizador puro del esqueleto. Sigue mirando un `externalProductId` de texto en su propio tipo de mapping de fixture. `getProductData` no lo llama y devuelve `null`. Ese normalizador no es una vía de publicación del catálogo ni enciende el adapter. No se cambia `canComparePrices()`: con el contrato actual ya devuelve false si no hay identificador validado.

Evidencia que habría que conservar antes de validar un ePID, y que este cambio no crea:

- el valor canónico del ePID, el `productId` del mapping y la misma `verificationRef` del producto verificado;
- procedencia: la ficha del catálogo de eBay que muestre ese ePID unido al nombre y a la configuración, no la ficha del fabricante y no una URL de anuncio;
- método de validación y una referencia de auditoría;
- proveedor `ebay` y ámbito `EBAY_ES`, solo cuando esas dos cadenas estén en la lista autorizada. Hoy no lo están.

Hasta esa evidencia, el estado correcto es ausencia: `marketplaceIdentifier: null`.

## Viabilidad para el modelo actual

| Garantía actual | Qué queda demostrado | ¿Se cumple hoy? |
| --- | --- | --- |
| Producto exacto y configuración exacta | El ePID apunta a un producto del catálogo. La especificación no dice que un ePID fije capacidad, edición y revisión. Solo `nintendo-switch` tiene la identidad cerrada; los otros 17 siguen en `pending`. | No |
| Marketplace ID validado, aparte del fabricante | El candidato es el ePID. No hay ninguno en el catálogo. El código de fabricante y el GTIN no sirven. | No |
| Trazabilidad de la evidencia | El contrato ya exige procedencia, método y referencia de auditoría. No hay expediente de un ePID. | No |
| Datos suficientemente actuales | El PDF de 2018 fija seis horas para el anuncio mostrado y obliga a declarar el retraso. El clickwrap vigente no está confirmado. Ese mecanismo no está implementado y este cambio no lo implementa. | No |
| Sin agregados en el código | Ahorro, mínimo, máximo, score y trend no se calculan desde eBay. La autorización para calcularlos sigue sin confirmar: es una lectura prudente del PDF de 2018, no una cláusula que nombre esos campos ni un permiso ya obtenido. | El código no los calcula. La autorización sigue pendiente |
| Adapter apagado | `getProductData` sigue devolviendo `null`. El cliente de búsqueda no está conectado: no publica observaciones ni guarda credenciales. | Sí |

El diseño puede alojar eBay más adelante solo si el ePID se valida por el contrato existente y si el uso que se muestre queda cubierto por el acuerdo que se firme. Hoy no se dan el acceso, el alta ni el identificador.

## Integration gate

Ninguna condición está cumplida. El adapter no se activa hasta que todas lo estén. Las que dependen de una cuenta, una aprobación, un contrato o una confirmación manual siguen abiertas.

```text
provider authorization confirmed
production API access confirmed
EPN requirements confirmed
marketplace identifier strategy confirmed
display freshness requirements implemented
storage/aggregation restrictions understood
evidence/audit procedure defined
```

- `provider authorization confirmed`: falta el alta de desarrollador y el texto firmado. Contrastarlo con el PDF de 2018 es parte de esa confirmación, no un hecho ya cerrado.
- `production API access confirmed`: faltan las claves de producción y la confirmación de si Browse exige una certificación adicional.
- `EPN requirements confirmed`: falta el alta, la campaña y la confirmación de que `EBAY_ES` está en el programa.
- `marketplace identifier strategy confirmed`: el candidato es el ePID. Falta confirmar que resuelve una sola configuración y no hay ningún valor validado.
- `display freshness requirements implemented`: la regla de seis horas del PDF de 2018 y el aviso de antigüedad no están implementados, y el acuerdo vigente no está confirmado. No se añade cron ni polling en este cambio.
- `storage/aggregation restrictions understood`: la lectura del PDF de 2018 queda escrita arriba. Entenderla no autoriza a almacenar anuncios ni a calcular ahorro, mínimo, máximo, score o trend, y no sustituye al clickwrap vigente.
- `evidence/audit procedure defined`: el contrato del identificador ya define los campos. Falta el expediente real de un ePID y la lectura del clickwrap vigente.

## Rejected assumptions

- Una URL de eBay no es un marketplace ID validado. `itemWebUrl` y `itemAffiliateWebUrl` son fichas de anuncio.
- El SKU o el número de modelo del fabricante no es un marketplace ID. `HEG-001` no lo es. Un GTIN tampoco.
- El acceso a Browse API no es la autorización de EPN. Son altas distintas. Que Browse conceda EPN no lo dice la portada del programa.
- Consultar un anuncio, en la lectura del PDF de 2018, no es almacenarlo indefinidamente: la copia permitida en ese PDF es intermedia y hay que borrarla, y el anuncio mostrado tiene un máximo de seis horas. El acuerdo vigente sigue sin confirmar.
- Mostrar anuncios, en esa misma lectura, no es calcular agregados. Ahorro, mínimo, máximo, score y trend necesitarían un permiso que el PDF de 2018 no concede por su nombre. Obtener ese permiso, o comprobar que el acuerdo vigente dice otra cosa, sigue pendiente.
- Una URL de afiliado, en la especificación Browse, es el vehículo de la comisión si el marketplace está en el programa y se cumplen las condiciones del campo. No es, en el PDF de 2018, una autorización para cualquier uso de los datos. El acuerdo de EPN no se pudo leer.

## Sources

Cada fila es una fuente oficial de eBay leída el 2026-10-09. No se llamó a `api.ebay.com` ni a `api.sandbox.ebay.com`.

| Hecho | URL | Título | Qué demuestra |
| --- | --- | --- | --- |
| `EBAY_ES` es el sitio de España (`ebay.es`). Fuera de EE. UU. el header `X-EBAY-C-MARKETPLACE-ID` es obligatorio; si falta o es inválido, el valor es `EBAY_US`. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | El enum y el header de `item_summary/search`. |
| Browse exige un token de aplicación. `search` y `getItem` usan el ámbito `https://api.ebay.com/oauth/api_scope`. Hay servidor de producción y de sandbox. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | `info.description`, `servers` y `security` de esas operaciones. |
| `itemId` identifica el artículo. `legacyItemId` identifica el anuncio. `epid` es el identificador de catálogo. `gtin` es UPC, EAN o ISBN. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | Descripciones de `Item` e `ItemSummary`. |
| `itemAffiliateWebUrl` solo vuelve si el marketplace está en el Partner Network. Singapur no está soportado. La comisión exige usar esa URL. La segunda condición del campo menciona el header `X-EBAY-C-ENDUSERCTX` como algo que incluye el vendedor. El JSON no define `affiliateCampaignId`. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | Descripción de `itemAffiliateWebUrl` y del header. No confirma España. |
| Quien forme parte de EPN envía `affiliateCampaignId`, obligatorio y de 10 dígitos, en `X-EBAY-C-ENDUSERCTX`, para obtener `itemAffiliateWebUrl`. | https://developer.ebay.com/api-docs/buy/static/api-browse.html | Browse API \| eBay Developers Program | Sección de headers de la guía. No entrega una campaña ni confirma `EBAY_ES`. |
| Public Display, borrado al dejar de ser público, aislamiento visual, seis horas para el anuncio, veinticuatro para el resto, aviso de antigüedad, permiso escrito para derivados, prohibición de modelar precios y límite de almacenamiento. | https://developer.ebay.com/cms/files/api_license_2018-10-26.pdf | eBay Developers Program Terms of Use and API License Agreement, 13 de junio de 2018 | Apartados 3.1.b, 2.3, 3.2, 3.3, 8.1.b, 8.1.c, 8.1.d, 9.6, 9.8 y 9.13 de ese PDF. No demuestra que sea el clickwrap vigente. |
| La misma regla de seis y veinticuatro horas ya estaba en el acuerdo anterior. | https://developer.ebay.com/devzone/license-agreement/api_license_agreement.pdf | eBay Developers Program & API License Agreement, 4 de febrero de 2009 | Apartado 3.1.3. No es el clickwrap vigente. |
| La especificación declara la licencia en la página de alta, que esta consulta no pudo leer. | https://developer.ebay.com/join/api-license-agreement | API License Agreement (campo `license` de la OpenAPI) | Respuesta HTTP 403. El texto firmado queda sin confirmar. |
| El ePID es el id de producto del catálogo. La búsqueda se describe para un vendedor y usa autorización de usuario. La API está en beta. | https://developer.ebay.com/develop/api/spec/catalog_api.json | Catalog API v1_beta.5.3 | `epid`, `product_summary/search` y `securitySchemes`. |
| Las definiciones de condición de esa guía parten del mercado de EE. UU. España tiene otra página. Los ids numéricos se usan de forma consistente; el subconjunto depende de la categoría. | https://developer.ebay.com/api-docs/sell/static/metadata/condition-id-values.html | Item condition ID and name values | Nota de la guía y enlace a eBay España. No lista las categorías de `EBAY_ES`. |
| España publica una ayuda de estado del artículo por categoría. Es una página de venta. | http://pages.ebay.es/help/sell/item-condition.html | Estado del artículo por categoría | Existencia de la página. No se copia la tabla de categorías. Qué ids admite cada categoría de `EBAY_ES` queda sin confirmar. |
| EPN es un alta propia, con registro, y el modelo descrito es de afiliación. La portada está fechada 1995-2026. | https://partnernetwork.ebay.es/ | Homepage \| eBay Partner Network | Texto visible de la portada. No concede Browse ni lista países. |
| La lista de países del programa no se pudo leer. | https://partnerhelp.ebay.com/helpcenter/s/article/countries-available-as-a-program-in-EPN?language=en_US | Countries available as a program in EPN | La respuesta fue una carcasa sin el artículo. España queda sin confirmar. |
