# Decisión de proveedor: eBay para Segunda Mano en España

Consulta del 2026-10-09. Este documento no activa el adapter, no llama a la API, no guarda anuncios y no introduce precios ni identificadores reales. `EBAY_BROWSE_SOURCE_ENABLED` sigue en `false`.

La pregunta que cierra esta revisión es si podemos activar eBay en producción ahora mismo. La respuesta es no.

## Decision

- `candidate-provider`: eBay
- `marketplace`: `EBAY_ES`
- `status`: `blocked-pending-authorization`

eBay Browse API puede nombrar el sitio de España y la licencia pública de desarrolladores describe un uso muy estrecho de contenido público. Eso no es acceso de producción, ni alta en eBay Partner Network, ni un identificador de producto validado. El catálogo sigue con un solo mapping verificado (`nintendo-switch`, identidad de fabricante) y con `externalProductId` y `marketplaceIdentifier` en `null` en los 18 slugs. El adapter no se enciende con este documento.

## Access prerequisites

Hace falta, y no está en el repositorio:

- Una cuenta del eBay Developers Program y unas Application Keys. El acuerdo las define como claves confidenciales, propiedad de eBay, que no se comparten con terceros. No hay claves en este cambio.
- Distinguir el servidor de producción (`https://api.ebay.com/buy/browse/v1`) del sandbox (`https://api.sandbox.ebay.com/buy/browse/v1`). La especificación los publica. Tener la URL no es tener acceso.
- Un token de aplicación por client credentials, con el ámbito `https://api.ebay.com/oauth/api_scope`, que la operación `item_summary/search` y `getItem` declaran. El token se pide a `https://api.ebay.com/identity/v1/oauth2/token`. Implementar ese flujo queda fuera de este cambio.
- La certificación adicional que el acuerdo reserva para ciertas APIs, cierto contenido y límites de llamadas más altos. El texto no enumera el trámite concreto de Browse en producción.

`UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: la lista exacta de pasos de alta de producción (Application Growth Check, revisión de la aplicación y cupo diario). La página de límites de llamadas no se pudo leer en esta consulta. El acuerdo solo dice que eBay puede limitar el volumen y que un volumen no razonable, o contrario a la documentación, está prohibido.

- Un alta distinta en eBay Partner Network, con su propio registro. La portada del programa en España ofrece darse de alta y describe un modelo de afiliación: el partner integra su plataforma y cobra por una venta cualificada. No dice que una clave de Browse conceda ese alta.
- Un `affiliateCampaignId` entregado por el programa, enviado en `X-EBAY-C-ENDUSERCTX`, si más adelante se quiere la URL de afiliado. El formato de ese identificador no está en la especificación OpenAPI leída.

`UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: que `EBAY_ES` esté admitido hoy como programa de EPN. La especificación dice que `itemAffiliateWebUrl` solo vuelve si el marketplace forma parte del Partner Network y que Singapur (`EBAY_SG`) no está soportado. No afirma que España sí lo esté. El artículo de ayuda «countries available as a program in EPN» cargó una carcasa vacía y no se pudo leer. El acuerdo de red de EPN tampoco se pudo leer: la página pidió una comprobación de navegador.

Comprobación manual pendiente, sin llamar a la API desde este repositorio: repetir el alta en las páginas de desarrolladores y de EPN, guardar el texto que se firma y anotar si España está en el programa y si Browse exige una certificación aparte.

## Legal / license constraints

Se leyó el PDF «eBay Developers Program Terms of Use and API License Agreement», fechado el 13 de junio de 2018. La especificación OpenAPI señala como licencia `https://developer.ebay.com/join/api-license-agreement`. Esa página HTML respondió 403. `UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: que el clickwrap vigente sea idéntico al PDF de 2018. El acuerdo de 4 de febrero de 2009 repite la regla de antigüedad; no se usa como texto vigente.

Lo que el PDF de 2018 sí escribe:

- **Mostrar.** El apartado 8.1.b permite un Public Display del contenido que ya es público, para promover eBay y dejar buscar y navegar anuncios. Hay que borrarlo cuando deja de ser público. No puede mezclarse con contenido que no sea de eBay: el contenido de eBay tiene que quedar aislado.
- **Antigüedad.** El apartado 8.1.c: la información de un anuncio mostrada no puede ser más de seis horas más antigua que la del sitio de eBay. El resto de eBay Content, no más de veinticuatro horas. Si el anuncio mostrado no está tan al día como el del sitio, la aplicación tiene que decir cuánto más antiguo es, aunque siga dentro de las seis horas.
- **Copia intermedia.** El apartado 3.1.b solo permite copias intermedias limitadas, necesarias para un uso permitido, y hay que borrarlas cuando ya no hagan falta. El apartado 9.8 prohíbe vender, alquilar, distribuir, copiar, almacenar o modificar eBay Content salvo para los fines que los términos permiten. No hay una cláusula que autorice un almacén indefinido ni una serie histórica.
- **Agregados y métricas.** El apartado 8.1.d exige permiso escrito previo para derivar estadísticas de sitio, precio medio de venta, mercancía bruta de una categoría, datos agregados de vendedores o compradores, rendimiento de vendedores y tasas de conversión. El apartado 9.6 prohíbe usar eBay Content, solo o con información de terceros, para sugerir o modelar precios de artículos anunciados en eBay. Ahorro, mínimo, máximo, score y trend caen en ese grupo: no están autorizados por el texto leído.
- **Afiliación.** Esas prohibiciones están en la licencia de la API. La especificación añade que, para cobrar comisión, el afiliado tiene que reenviar con `itemAffiliateWebUrl`. El enlace no aparece en el PDF como una dispensa de la antigüedad, del almacenamiento o de la prohibición de modelar precios.

`UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: si el acuerdo de EPN, no leído aquí, añade otras restricciones o cambia las de la licencia de API según el uso sea afiliado o no. Con lo leído, el uso afiliado no levanta las restricciones de la licencia de API.

## Marketplace ID strategy

El identificador candidato, si más adelante se demuestra, es el ePID: el identificador de producto del catálogo de eBay. En Browse, `epid` «indica el producto al que pertenece el artículo». La búsqueda puede limitarse a un ePID. En Catalog API, `epid` es «el eBay product ID de este producto».

No es un identificador que este PR pueda rellenar:

- No se ha consultado el catálogo. No hay ningún ePID en los mappings.
- Catalog API está marcada `v1_beta.5.3`. Su búsqueda se describe como una herramienta para que un vendedor localice el producto del catálogo contra el que quiere anunciar, y su seguridad publicada es authorization code de usuario, no el client credentials de Browse. `UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION`: que una aplicación de compra pueda resolver un ePID sin token de vendedor, y que un ePID aísle una sola configuración (capacidad, edición, revisión) y no una familia.
- `itemId` es el identificador REST del artículo. `legacyItemId` es el identificador del anuncio, el que suele verse en la URL de la ficha. Los dos nombran un anuncio, no el producto. Una URL no es el identificador.
- `gtin` es UPC, EAN o ISBN, definido fuera de eBay. No es el identificador de marketplace. `HEG-001` es el número de modelo del fabricante de la Switch OLED ya verificada. Tampoco es un identificador de marketplace. Ninguno de los dos entra en `marketplaceIdentifier`.
- `externalProductId` no sustituye a ese identificador. El contrato de `lib/second-hand-marketplace-id.ts` sigue siendo el que decide si un valor está validado, y las listas de proveedores y ámbitos siguen vacías.

Evidencia que habría que conservar antes de validar un ePID, y que este cambio no crea:

- el valor canónico del ePID, el `productId` del mapping y la misma `verificationRef` del producto verificado;
- procedencia: la ficha del catálogo de eBay que muestre ese ePID unido al nombre y a la configuración, no la ficha del fabricante y no una URL de anuncio;
- método de validación y una referencia de auditoría;
- proveedor `ebay` y ámbito `EBAY_ES`, solo cuando esas dos cadenas estén en la lista autorizada. Hoy no lo están.

Hasta esa evidencia, el estado correcto es ausencia: `marketplaceIdentifier: null`.

## Viabilidad para el modelo actual

| Garantía actual | Qué dice la documentación leída | ¿Se cumple hoy? |
| --- | --- | --- |
| Producto exacto y configuración exacta | El ePID apunta a un producto del catálogo. La especificación no dice que un ePID fije capacidad, edición y revisión. Solo `nintendo-switch` tiene la identidad cerrada; los otros 17 siguen en `pending`. | No |
| Marketplace ID validado, aparte del fabricante | El candidato es el ePID. No hay ninguno en el catálogo. El código de fabricante y el GTIN no sirven. | No |
| Trazabilidad de la evidencia | El contrato ya exige procedencia, método y referencia de auditoría. No hay expediente de un ePID. | No |
| Datos suficientemente actuales | Si algún día se mostrara un anuncio, la licencia fija seis horas y obliga a declarar el retraso. Ese mecanismo no está implementado y este cambio no lo implementa. | No |
| Sin agregados prohibidos | Ahorro, mínimo, máximo, score y trend siguen fuera. La licencia no los autoriza. | Sí, porque no se calculan |
| Adapter apagado hasta autorización y acceso de producción | `getProductData` sigue devolviendo `null`. No hay cliente HTTP ni credenciales. | Sí |

El diseño puede alojar eBay más adelante solo si el ePID se valida por el contrato existente y el anuncio, si se muestra, cabe en el Public Display. Hoy no se dan esas condiciones. No hace falta cambiar `canComparePrices()`: sin identificador validado ya devuelve false.

## Integration gate

Ninguna condición está cumplida. El adapter no se activa hasta que todas lo estén.

```text
provider authorization confirmed
production API access confirmed
EPN requirements confirmed
marketplace identifier strategy confirmed
display freshness requirements implemented
storage/aggregation restrictions understood
evidence/audit procedure defined
```

- `provider authorization confirmed`: falta el alta de desarrollador y el texto firmado, contrastado con el PDF de 2018.
- `production API access confirmed`: faltan las claves de producción y la confirmación de si Browse exige certificación adicional.
- `EPN requirements confirmed`: falta el alta, la campaña y la confirmación de que `EBAY_ES` está en el programa.
- `marketplace identifier strategy confirmed`: el candidato es el ePID, pero no está confirmado que resuelva una sola configuración ni hay ningún valor validado.
- `display freshness requirements implemented`: la regla de seis horas y el aviso de antigüedad no están implementados. No se añade cron ni polling en este cambio.
- `storage/aggregation restrictions understood`: quedan escritas arriba. Entenderlas no autoriza a almacenar anuncios ni a calcular ahorro, mínimo, máximo, score o trend.
- `evidence/audit procedure defined`: el contrato del identificador ya define los campos. Falta el expediente real de un ePID y la lectura del clickwrap vigente.

## Rejected assumptions

- Tener una URL de eBay no es tener un marketplace ID validado. `itemWebUrl` y `itemAffiliateWebUrl` son fichas de anuncio.
- Tener el SKU o el número de modelo del fabricante no es tener un marketplace ID. `HEG-001` no lo es. Un GTIN tampoco.
- Tener acceso a Browse API no es tener autorización de EPN. Son altas distintas.
- Poder consultar un anuncio no es poder almacenarlo indefinidamente. La copia permitida es intermedia y hay que borrarla; el anuncio mostrado caduca a las seis horas y se elimina cuando deja de ser público.
- Poder mostrar anuncios no es poder calcular agregados. Ahorro, mínimo, máximo, score y trend necesitan un permiso que el texto leído no concede.
- Una URL de afiliado no es autorización para cualquier uso de los datos. Como mucho es el vehículo de la comisión, si el programa y el header se confirman.

## Sources

Cada fila es una fuente oficial de eBay leída el 2026-10-09. No se llamó a `api.ebay.com` ni a `api.sandbox.ebay.com`.

| Hecho | URL | Título | Qué demuestra |
| --- | --- | --- | --- |
| `EBAY_ES` es el sitio de España (`ebay.es`). Fuera de EE. UU. el header `X-EBAY-C-MARKETPLACE-ID` es obligatorio; si falta o es inválido, el valor es `EBAY_US`. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | El enum y el header de `item_summary/search`. |
| Browse exige un token de aplicación. `search` y `getItem` usan el ámbito `https://api.ebay.com/oauth/api_scope`. Hay servidor de producción y de sandbox. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | `info.description`, `servers` y `security` de esas operaciones. |
| `itemId` identifica el artículo. `legacyItemId` identifica el anuncio y es el id habitual de la URL. `epid` es el identificador de catálogo. `gtin` es UPC, EAN o ISBN. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | Descripciones de `Item` e `ItemSummary`. |
| `itemAffiliateWebUrl` solo vuelve si el marketplace está en el Partner Network. Singapur no está soportado. La especificación remite a EPN y condiciona el campo al header `X-EBAY-C-ENDUSERCTX`. La comisión exige usar esa URL. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | Descripción de `itemAffiliateWebUrl` y del header. No confirma España. |
| El header `X-EBAY-C-ENDUSERCTX` es necesario para el reparto de ingresos de EPN. | https://developer.ebay.com/develop/api/spec/browse_api.json | Browse API OAS Baseline v1.20.4 | Descripción del header en `item_summary/search`. |
| Public Display, borrado al dejar de ser público, prohibición de mezclar, seis horas para el anuncio, veinticuatro para el resto, aviso de antigüedad, permiso escrito para derivados, prohibición de modelar precios y de almacenar fuera de los fines permitidos. | https://developer.ebay.com/cms/files/api_license_2018-10-26.pdf | eBay Developers Program Terms of Use and API License Agreement, 13 de junio de 2018 | Apartados 3.1.b, 2.3, 3.2, 3.3, 8.1.b, 8.1.c, 8.1.d, 9.6, 9.8 y 9.13. |
| La misma regla de seis y veinticuatro horas ya estaba en el acuerdo anterior. | https://developer.ebay.com/devzone/license-agreement/api_license_agreement.pdf | eBay Developers Program & API License Agreement, 4 de febrero de 2009 | Apartado 3.1.3. No es el clickwrap vigente. |
| La especificación declara la licencia en la página de alta, que esta consulta no pudo leer. | https://developer.ebay.com/join/api-license-agreement | API License Agreement (campo `license` de la OpenAPI) | Respuesta HTTP 403. El texto firmado queda sin confirmar. |
| El ePID es el id de producto del catálogo. La búsqueda se describe para un vendedor y usa autorización de usuario. La API está en beta. | https://developer.ebay.com/develop/api/spec/catalog_api.json | Catalog API v1_beta.5.3 | `epid`, `product_summary/search` y `securitySchemes`. |
| Las definiciones de condición de esa guía son del mercado de EE. UU. España tiene otra página. Los ids numéricos se usan de forma consistente; el subconjunto depende de la categoría. | https://developer.ebay.com/api-docs/sell/static/metadata/condition-id-values.html | Item condition ID and name values | Nota de la guía y enlace a eBay España. No lista las categorías de `EBAY_ES`. |
| España publica una ayuda de estado del artículo por categoría. Es una página de venta, no una prohibición de Browse. | http://pages.ebay.es/help/sell/item-condition.html | Estado del artículo por categoría | Existencia de la página. No se copia la tabla de categorías. |
| EPN es un alta propia, con registro, y el modelo descrito es de afiliación. La portada está fechada 1995-2026. | https://partnernetwork.ebay.es/ | Homepage \| eBay Partner Network | Texto visible de la portada. No concede Browse ni lista países. |
| La lista de países del programa no se pudo leer. | https://partnerhelp.ebay.com/helpcenter/s/article/countries-available-as-a-program-in-EPN?language=en_US | Countries available as a program in EPN | La respuesta fue una carcasa sin el artículo. España queda sin confirmar. |
